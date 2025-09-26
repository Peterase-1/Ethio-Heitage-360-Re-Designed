const Exhibition = require('../models/Exhibition');
const Museum = require('../models/Museum');
const User = require('../models/User');

/**
 * @desc    Get all public exhibitions for visitors
 * @route   GET /api/visitor/exhibitions
 * @access  Public
 */
const getPublicExhibitions = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      sortBy = 'schedule.startDate',
      sortOrder = 'desc',
      status = 'active',
      type,
      category,
      search,
      museumId,
      city,
      featured,
      active,
      permanent,
      dateRange
    } = req.query;

    // Build query for public exhibitions
    const query = {
      status: { $in: ['active', 'extended', 'closing_soon'] },
      visibility: { $in: ['public', 'preview'] }
    };

    // Filter by exhibition type
    if (type) {
      query.type = type;
    }

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by museum
    if (museumId) {
      query.museum = museumId;
    }

    // Filter by featured exhibitions
    if (featured === 'true') {
      query.featured = true;
    }

    // Filter active exhibitions (not ending soon)
    if (active === 'true') {
      query.status = { $in: ['active', 'extended'] };
    }

    // Filter permanent exhibitions
    if (permanent === 'true') {
      query.type = 'permanent';
    }

    // Date range filter
    if (dateRange) {
      const [startDate, endDate] = dateRange.split(',');
      if (startDate && endDate) {
        query.$or = [
          {
            'schedule.startDate': {
              $gte: new Date(startDate),
              $lte: new Date(endDate)
            }
          },
          {
            'schedule.endDate': {
              $gte: new Date(startDate),
              $lte: new Date(endDate)
            }
          },
          {
            'schedule.startDate': { $lte: new Date(startDate) },
            'schedule.endDate': { $gte: new Date(endDate) }
          },
          {
            type: 'permanent',
            'schedule.startDate': { $lte: new Date(endDate) }
          }
        ];
      }
    }

    // Search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { shortDescription: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
        { themes: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // City filter (search within museum locations)
    if (city) {
      const museumsInCity = await Museum.find({
        'location.city': { $regex: city, $options: 'i' }
      }).select('_id');
      
      if (museumsInCity.length > 0) {
        query.museum = { $in: museumsInCity.map(m => m._id) };
      }
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query
    const exhibitions = await Exhibition.find(query)
      .populate({
        path: 'museum',
        select: 'name location contact images website'
      })
      .populate('curator', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Exhibition.countDocuments(query);

    // Add computed fields for frontend
    const exhibitionsWithComputedFields = exhibitions.map(exhibition => ({
      ...exhibition,
      exhibitionStatus: getExhibitionStatus(exhibition),
      duration: getDuration(exhibition),
      daysRemaining: getDaysRemaining(exhibition),
      isClosingSoon: getIsClosingSoon(exhibition),
      primaryImage: exhibition.media?.images?.find(img => img.isPrimary) || exhibition.media?.images?.[0]
    }));

    res.json({
      success: true,
      data: exhibitionsWithComputedFields,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
        limit: parseInt(limit)
      },
      filters: {
        totalExhibitions: total,
        appliedFilters: { type, category, search, museumId, city, featured, active, permanent }
      }
    });
  } catch (error) {
    console.error('Get public exhibitions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch exhibitions',
      error: error.message
    });
  }
};

/**
 * @desc    Get exhibition by ID for visitors
 * @route   GET /api/visitor/exhibitions/:id
 * @access  Public
 */
const getPublicExhibitionById = async (req, res) => {
  try {
    const exhibition = await Exhibition.findById(req.params.id)
      .populate({
        path: 'museum',
        select: 'name description location contact images website socialMedia openingHours'
      })
      .populate('curator', 'name email title')
      .populate('staff.assistantCurators', 'name email title')
      .populate({
        path: 'artifacts.artifact',
        select: 'name description images category period culture',
        populate: {
          path: 'images',
          select: 'url caption'
        }
      })
      .populate({
        path: 'reviews.user',
        select: 'name profileImage'
      })
      .populate('relatedExhibitions', 'title shortDescription media.images schedule museum')
      .populate('relatedEvents', 'title shortDescription schedule media.images museum')
      .lean();

    if (!exhibition) {
      return res.status(404).json({
        success: false,
        message: 'Exhibition not found'
      });
    }

    // Check if exhibition is publicly accessible
    if (!['active', 'extended', 'closing_soon'].includes(exhibition.status) || 
        !['public', 'preview'].includes(exhibition.visibility)) {
      return res.status(404).json({
        success: false,
        message: 'Exhibition not found'
      });
    }

    // Increment views
    await Exhibition.findByIdAndUpdate(req.params.id, {
      $inc: { 'statistics.totalViews': 1 }
    });

    // Add computed fields
    const exhibitionWithComputedFields = {
      ...exhibition,
      exhibitionStatus: getExhibitionStatus(exhibition),
      duration: getDuration(exhibition),
      daysRemaining: getDaysRemaining(exhibition),
      isClosingSoon: getIsClosingSoon(exhibition),
      primaryImage: exhibition.media?.images?.find(img => img.isPrimary) || exhibition.media?.images?.[0],
      // Group images for gallery
      galleryImages: exhibition.media?.images?.filter(img => img.isGallery).sort((a, b) => a.order - b.order),
      // Get highlights with populated artifacts
      processedHighlights: exhibition.highlights?.map(highlight => ({
        ...highlight,
        artifact: exhibition.artifacts?.find(a => a.artifact?._id?.toString() === highlight.artifact?.toString())?.artifact
      }))
    };

    res.json({
      success: true,
      data: exhibitionWithComputedFields
    });
  } catch (error) {
    console.error('Get public exhibition by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch exhibition',
      error: error.message
    });
  }
};

/**
 * @desc    Get featured exhibitions
 * @route   GET /api/visitor/exhibitions/featured
 * @access  Public
 */
const getFeaturedExhibitions = async (req, res) => {
  try {
    const { limit = 6 } = req.query;

    const exhibitions = await Exhibition.find({
      status: { $in: ['active', 'extended', 'closing_soon'] },
      visibility: 'public',
      featured: true
    })
      .populate({
        path: 'museum',
        select: 'name location images'
      })
      .sort({ 'schedule.startDate': -1 })
      .limit(parseInt(limit))
      .lean();

    const exhibitionsWithComputedFields = exhibitions.map(exhibition => ({
      ...exhibition,
      exhibitionStatus: getExhibitionStatus(exhibition),
      duration: getDuration(exhibition),
      daysRemaining: getDaysRemaining(exhibition),
      isClosingSoon: getIsClosingSoon(exhibition),
      primaryImage: exhibition.media?.images?.find(img => img.isPrimary) || exhibition.media?.images?.[0]
    }));

    res.json({
      success: true,
      data: exhibitionsWithComputedFields
    });
  } catch (error) {
    console.error('Get featured exhibitions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured exhibitions',
      error: error.message
    });
  }
};

/**
 * @desc    Get active exhibitions
 * @route   GET /api/visitor/exhibitions/active
 * @access  Public
 */
const getActiveExhibitions = async (req, res) => {
  try {
    const { limit = 12, museumId, type } = req.query;
    
    const query = {
      status: { $in: ['active', 'extended'] },
      visibility: 'public'
    };

    if (museumId) {
      query.museum = museumId;
    }

    if (type) {
      query.type = type;
    }

    const exhibitions = await Exhibition.find(query)
      .populate({
        path: 'museum',
        select: 'name location images'
      })
      .sort({ 'schedule.startDate': -1 })
      .limit(parseInt(limit))
      .lean();

    const exhibitionsWithComputedFields = exhibitions.map(exhibition => ({
      ...exhibition,
      exhibitionStatus: getExhibitionStatus(exhibition),
      duration: getDuration(exhibition),
      daysRemaining: getDaysRemaining(exhibition),
      isClosingSoon: getIsClosingSoon(exhibition),
      primaryImage: exhibition.media?.images?.find(img => img.isPrimary) || exhibition.media?.images?.[0]
    }));

    res.json({
      success: true,
      data: exhibitionsWithComputedFields
    });
  } catch (error) {
    console.error('Get active exhibitions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch active exhibitions',
      error: error.message
    });
  }
};

/**
 * @desc    Get exhibitions by category
 * @route   GET /api/visitor/exhibitions/by-category
 * @access  Public
 */
const getExhibitionsByCategory = async (req, res) => {
  try {
    const categories = [
      'art', 'history', 'culture', 'archaeology', 'science', 'technology', 
      'nature', 'photography', 'contemporary', 'traditional'
    ];
    
    const exhibitionsByCategory = await Promise.all(
      categories.map(async (category) => {
        const exhibitions = await Exhibition.find({
          status: { $in: ['active', 'extended', 'closing_soon'] },
          visibility: 'public',
          category
        })
          .populate('museum', 'name location')
          .sort({ 'schedule.startDate': -1 })
          .limit(4)
          .lean();

        return {
          category,
          exhibitions: exhibitions.map(exhibition => ({
            ...exhibition,
            exhibitionStatus: getExhibitionStatus(exhibition),
            duration: getDuration(exhibition),
            daysRemaining: getDaysRemaining(exhibition),
            isClosingSoon: getIsClosingSoon(exhibition),
            primaryImage: exhibition.media?.images?.find(img => img.isPrimary) || exhibition.media?.images?.[0]
          }))
        };
      })
    );

    res.json({
      success: true,
      data: exhibitionsByCategory.filter(cat => cat.exhibitions.length > 0)
    });
  } catch (error) {
    console.error('Get exhibitions by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch exhibitions by category',
      error: error.message
    });
  }
};

/**
 * @desc    Get exhibition types and categories for filters
 * @route   GET /api/visitor/exhibitions/filters
 * @access  Public
 */
const getExhibitionFilters = async (req, res) => {
  try {
    const exhibitionTypes = [
      { value: 'permanent', label: 'Permanent' },
      { value: 'temporary', label: 'Temporary' },
      { value: 'traveling', label: 'Traveling' },
      { value: 'special', label: 'Special' },
      { value: 'virtual', label: 'Virtual' },
      { value: 'interactive', label: 'Interactive' },
      { value: 'outdoor', label: 'Outdoor' },
      { value: 'educational', label: 'Educational' },
      { value: 'research', label: 'Research' },
      { value: 'community', label: 'Community' }
    ];

    const categories = [
      { value: 'art', label: 'Art' },
      { value: 'history', label: 'History' },
      { value: 'culture', label: 'Culture' },
      { value: 'archaeology', label: 'Archaeology' },
      { value: 'science', label: 'Science' },
      { value: 'technology', label: 'Technology' },
      { value: 'nature', label: 'Nature' },
      { value: 'photography', label: 'Photography' },
      { value: 'contemporary', label: 'Contemporary' },
      { value: 'traditional', label: 'Traditional' },
      { value: 'religious', label: 'Religious' },
      { value: 'ethnographic', label: 'Ethnographic' },
      { value: 'decorative_arts', label: 'Decorative Arts' },
      { value: 'textiles', label: 'Textiles' },
      { value: 'ceramics', label: 'Ceramics' },
      { value: 'jewelry', label: 'Jewelry' },
      { value: 'manuscripts', label: 'Manuscripts' },
      { value: 'coins', label: 'Coins' },
      { value: 'weapons', label: 'Weapons' },
      { value: 'tools', label: 'Tools' }
    ];

    // Get available museums with exhibitions
    const museumsWithExhibitions = await Exhibition.aggregate([
      {
        $match: {
          status: { $in: ['active', 'extended', 'closing_soon'] },
          visibility: 'public'
        }
      },
      {
        $group: {
          _id: '$museum'
        }
      },
      {
        $lookup: {
          from: 'museums',
          localField: '_id',
          foreignField: '_id',
          as: 'museum'
        }
      },
      {
        $unwind: '$museum'
      },
      {
        $project: {
          _id: '$museum._id',
          name: '$museum.name',
          city: '$museum.location.city'
        }
      },
      {
        $sort: { name: 1 }
      }
    ]);

    // Get unique cities
    const cities = [...new Set(museumsWithExhibitions.map(m => m.city).filter(Boolean))];

    res.json({
      success: true,
      data: {
        types: exhibitionTypes,
        categories: categories,
        museums: museumsWithExhibitions,
        cities: cities.sort()
      }
    });
  } catch (error) {
    console.error('Get exhibition filters error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch exhibition filters',
      error: error.message
    });
  }
};

/**
 * @desc    Add review to exhibition
 * @route   POST /api/visitor/exhibitions/:id/review
 * @access  Authenticated
 */
const addExhibitionReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const exhibition = await Exhibition.findById(req.params.id);
    if (!exhibition) {
      return res.status(404).json({
        success: false,
        message: 'Exhibition not found'
      });
    }

    // Check if exhibition is publicly accessible
    if (!['active', 'extended', 'closing_soon', 'closed'].includes(exhibition.status) || 
        !['public', 'preview'].includes(exhibition.visibility)) {
      return res.status(404).json({
        success: false,
        message: 'Exhibition not found'
      });
    }

    // Check if user has already reviewed this exhibition
    const existingReview = exhibition.reviews.find(
      r => r.user.toString() === req.user._id.toString()
    );

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this exhibition'
      });
    }

    // Add review
    exhibition.reviews.push({
      user: req.user._id,
      rating,
      comment,
      isVerified: false // Could be set to true if user has visited
    });

    // Update statistics
    exhibition.statistics.totalReviews = exhibition.reviews.length;
    exhibition.statistics.averageRating = 
      exhibition.reviews.reduce((sum, r) => sum + r.rating, 0) / exhibition.reviews.length;

    await exhibition.save();

    res.json({
      success: true,
      message: 'Review added successfully',
      data: {
        averageRating: exhibition.statistics.averageRating,
        totalReviews: exhibition.statistics.totalReviews
      }
    });
  } catch (error) {
    console.error('Add exhibition review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add review',
      error: error.message
    });
  }
};

// Helper functions
function getExhibitionStatus(exhibition) {
  const now = new Date();
  
  if (exhibition.status === 'closed' || exhibition.status === 'archived') return exhibition.status;
  if (exhibition.status === 'planning' || exhibition.status === 'in_preparation') return exhibition.status;
  
  if (exhibition.type === 'permanent') {
    return exhibition.status === 'active' ? 'ongoing' : exhibition.status;
  }
  
  if (now < new Date(exhibition.schedule.startDate)) return 'upcoming';
  if (exhibition.schedule.endDate && now > new Date(exhibition.schedule.endDate)) return 'ended';
  if (exhibition.status === 'closing_soon') return 'closing_soon';
  
  return 'ongoing';
}

function getDuration(exhibition) {
  if (exhibition.type === 'permanent' || !exhibition.schedule.endDate) return null;
  
  const start = new Date(exhibition.schedule.startDate);
  const end = new Date(exhibition.schedule.endDate);
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24)); // in days
}

function getDaysRemaining(exhibition) {
  if (exhibition.type === 'permanent' || !exhibition.schedule.endDate) return null;
  
  const now = new Date();
  const end = new Date(exhibition.schedule.endDate);
  if (now > end) return 0;
  
  return Math.ceil((end - now) / (1000 * 60 * 60 * 24));
}

function getIsClosingSoon(exhibition) {
  if (exhibition.type === 'permanent') return false;
  
  const daysRemaining = getDaysRemaining(exhibition);
  return daysRemaining !== null && daysRemaining <= 30 && daysRemaining > 0;
}

module.exports = {
  getPublicExhibitions,
  getPublicExhibitionById,
  getFeaturedExhibitions,
  getActiveExhibitions,
  getExhibitionsByCategory,
  getExhibitionFilters,
  addExhibitionReview
};
