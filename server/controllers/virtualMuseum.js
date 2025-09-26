const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Artifact = require('../models/Artifact');
const Museum = require('../models/Museum');
const { uploadArtifactImages, upload3DModels } = require('../config/fileUpload');

// Mock data for virtual museum artifacts
const mockArtifacts = [
  {
    id: 1,
    name: 'Ancient Ethiopian Cross',
    description: 'A beautifully crafted cross from the 12th century, representing the rich Christian heritage of Ethiopia.',
    image: '/api/placeholder/300/200',
    category: 'Religious Artifacts',
    period: '12th Century',
    origin: 'Lalibela',
    museum: 'National Museum of Ethiopia',
    has3DModel: true,
    views: 1250,
    likes: 89,
    rating: 4.8,
    isFavorited: false
  },
  {
    id: 2,
    name: 'Traditional Coffee Ceremony Set',
    description: 'Complete set used in traditional Ethiopian coffee ceremonies, showcasing the cultural significance of coffee.',
    image: '/api/placeholder/300/200',
    category: 'Cultural Artifacts',
    period: '19th Century',
    origin: 'Kaffa Region',
    museum: 'Ethnological Museum',
    has3DModel: true,
    views: 980,
    likes: 67,
    rating: 4.6,
    isFavorited: false
  },
  {
    id: 3,
    name: 'Ancient Manuscript',
    description: 'Rare illuminated manuscript written in Ge\'ez, containing religious texts and historical records.',
    image: '/api/placeholder/300/200',
    category: 'Manuscripts',
    period: '15th Century',
    origin: 'Gondar',
    museum: 'Institute of Ethiopian Studies',
    has3DModel: false,
    views: 756,
    likes: 45,
    rating: 4.9,
    isFavorited: false
  },
  {
    id: 4,
    name: 'Royal Crown of Menelik II',
    description: 'Ornate crown worn by Emperor Menelik II, symbolizing the imperial power of Ethiopia.',
    image: '/api/placeholder/300/200',
    category: 'Royal Artifacts',
    period: '19th Century',
    origin: 'Addis Ababa',
    museum: 'National Museum of Ethiopia',
    has3DModel: true,
    views: 2100,
    likes: 156,
    rating: 4.9,
    isFavorited: false
  },
  {
    id: 5,
    name: 'Ancient Stone Tablet',
    description: 'Stone tablet with inscriptions in ancient Ethiopian script, providing insights into early civilization.',
    image: '/api/placeholder/300/200',
    category: 'Archaeological',
    period: '8th Century',
    origin: 'Axum',
    museum: 'Axum Museum',
    has3DModel: true,
    views: 834,
    likes: 72,
    rating: 4.7,
    isFavorited: false
  },
  {
    id: 6,
    name: 'Traditional Weaving Tools',
    description: 'Set of traditional tools used for weaving Ethiopian textiles, showcasing ancient craftsmanship.',
    image: '/api/placeholder/300/200',
    category: 'Tools & Crafts',
    period: '18th Century',
    origin: 'Dorze',
    museum: 'Cultural Heritage Museum',
    has3DModel: false,
    views: 567,
    likes: 38,
    rating: 4.4,
    isFavorited: false
  }
];

// Mock virtual tours data
const mockVirtualTours = [
  {
    id: 1,
    title: "Ancient Ethiopia: Aksum to Lalibela",
    description: "Journey through 3000 years of Ethiopian civilization",
    duration: "45 minutes",
    price: 15,
    maxParticipants: 20,
    rating: 4.9,
    image: '/api/placeholder/300/200',
    features: ['3D Artifacts', 'Expert Guide', 'Interactive Q&A']
  },
  {
    id: 2,
    title: "Royal Treasures of Ethiopia",
    description: "Explore the imperial collections and royal regalia",
    duration: "30 minutes", 
    price: 20,
    maxParticipants: 15,
    rating: 4.8,
    image: '/api/placeholder/300/200',
    features: ['3D Crown Viewing', 'Historical Context', 'Royal Stories']
  }
];

// Get all artifacts
const getArtifacts = async (req, res) => {
  try {
    const { 
      search, 
      category, 
      period, 
      origin, 
      museum, 
      has3D,
      featured,
      status = 'active',
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 12
    } = req.query;

    // Build query filters
    const filters = { status: status };
    
    if (search) {
      filters.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
        { 'physicalCharacteristics.material': { $regex: search, $options: 'i' } },
        { 'culturalSignificance.historicalContext': { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category) {
      filters.category = category;
    }
    
    if (period) {
      filters['historicalContext.period'] = period;
    }
    
    if (origin) {
      filters['historicalContext.origin'] = origin;
    }
    
    if (museum && mongoose.isValidObjectId(museum)) {
      filters.museum = museum;
    }
    
    if (has3D === 'true') {
      filters['media.threeDModels.0'] = { $exists: true };
    }
    
    if (featured === 'true') {
      filters.featured = true;
    }

    // Build sort object
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [artifacts, totalCount] = await Promise.all([
      Artifact.find(filters)
        .populate('museum', 'name location')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Artifact.countDocuments(filters)
    ]);

    // Transform artifacts to match frontend expectations
    const transformedArtifacts = artifacts.map(artifact => ({
      id: artifact._id,
      name: artifact.name,
      description: artifact.description,
      image: artifact.media?.images?.[0]?.url || '/api/placeholder/300/200',
      category: artifact.category,
      period: artifact.historicalContext?.period,
      origin: artifact.historicalContext?.origin,
      museum: artifact.museum?.name || 'Unknown Museum',
      has3DModel: artifact.media?.threeDModels?.length > 0,
      views: artifact.analytics?.views || 0,
      likes: artifact.analytics?.likes || 0,
      rating: artifact.analytics?.averageRating || 0,
      isFavorited: false, // Will be set based on user's favorites
      featured: artifact.featured
    }));

    const totalPages = Math.ceil(totalCount / limitNum);

    res.json({
      success: true,
      data: transformedArtifacts,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems: totalCount,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1
      },
      total: totalCount
    });
  } catch (error) {
    console.error('Error fetching artifacts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch artifacts'
    });
  }
};

// Get single artifact
const getArtifact = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid artifact ID'
      });
    }

    const artifact = await Artifact.findById(id)
      .populate('museum', 'name location contact')
      .lean();
    
    if (!artifact) {
      return res.status(404).json({
        success: false,
        message: 'Artifact not found'
      });
    }
    
    // Increment view count
    await Artifact.findByIdAndUpdate(
      id, 
      { $inc: { 'analytics.views': 1 } },
      { upsert: false }
    );
    
    // Transform artifact to match frontend expectations
    const transformedArtifact = {
      id: artifact._id,
      name: artifact.name,
      description: artifact.description,
      image: artifact.media?.images?.[0]?.url || '/api/placeholder/300/200',
      images: artifact.media?.images || [],
      category: artifact.category,
      period: artifact.historicalContext?.period,
      origin: artifact.historicalContext?.origin,
      museum: artifact.museum?.name || 'Unknown Museum',
      museumInfo: artifact.museum,
      has3DModel: artifact.media?.threeDModels?.length > 0,
      threeDModels: artifact.media?.threeDModels || [],
      views: (artifact.analytics?.views || 0) + 1,
      likes: artifact.analytics?.likes || 0,
      rating: artifact.analytics?.averageRating || 0,
      isFavorited: false, // Will be set based on user's favorites
      featured: artifact.featured,
      tags: artifact.tags || [],
      physicalCharacteristics: artifact.physicalCharacteristics,
      culturalSignificance: artifact.culturalSignificance,
      historicalContext: artifact.historicalContext,
      condition: artifact.condition,
      location: artifact.location,
      rentalInfo: artifact.rentalInfo,
      createdAt: artifact.createdAt,
      updatedAt: artifact.updatedAt
    };
    
    res.json({
      success: true,
      data: transformedArtifact
    });
  } catch (error) {
    console.error('Error fetching artifact:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch artifact'
    });
  }
};

// Get virtual tours
const getVirtualTours = async (req, res) => {
  try {
    res.json({
      success: true,
      data: mockVirtualTours
    });
  } catch (error) {
    console.error('Error fetching virtual tours:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch virtual tours'
    });
  }
};

// Book virtual tour
const bookVirtualTour = async (req, res) => {
  try {
    const { tourId, date, time, participants, phone, specialRequests } = req.body;
    const userId = req.user.id;
    
    // Find the tour
    const tour = mockVirtualTours.find(t => t.id === parseInt(tourId));
    if (!tour) {
      return res.status(404).json({
        success: false,
        message: 'Virtual tour not found'
      });
    }
    
    // Validate participants count
    if (participants > tour.maxParticipants) {
      return res.status(400).json({
        success: false,
        message: `Maximum ${tour.maxParticipants} participants allowed for this tour`
      });
    }
    
    // Calculate total price
    const totalPrice = tour.price * participants;
    
    // Create booking
    const bookingData = {
      user: userId,
      tourId: tourId,
      tourTitle: tour.title,
      date: new Date(date + 'T' + time),
      participants: participants,
      phone: phone,
      specialRequests: specialRequests,
      totalPrice: totalPrice,
      status: 'confirmed',
      bookingType: 'virtual_tour'
    };
    
    // In a real app, save to database
    // const booking = new Booking(bookingData);
    // await booking.save();
    
    // Mock booking response
    const booking = {
      id: Date.now(), // Mock ID
      ...bookingData,
      createdAt: new Date(),
      confirmationNumber: `VT${Date.now()}`
    };
    
    res.status(201).json({
      success: true,
      message: 'Virtual tour booked successfully',
      data: {
        booking,
        tour
      }
    });
  } catch (error) {
    console.error('Error booking virtual tour:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to book virtual tour'
    });
  }
};

// Get user bookings
const getUserBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Fetch actual user bookings from database
    const bookings = await Booking.find({ 
      $or: [
        { customerId: userId },
        { user: userId }
      ]
    })
    .populate('tourPackageId', 'title description price images')
    .populate('organizerId', 'firstName lastName email')
    .sort({ createdAt: -1 });
    
    // Calculate booking statistics
    const stats = {
      total: bookings.length,
      pending: bookings.filter(b => b.status === 'pending').length,
      confirmed: bookings.filter(b => b.status === 'confirmed').length,
      completed: bookings.filter(b => b.status === 'completed').length,
      cancelled: bookings.filter(b => b.status === 'cancelled').length
    };
    
    res.json({
      success: true,
      data: {
        bookings,
        stats
      }
    });
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings'
    });
  }
};

// Toggle favorite artifact
const toggleFavorite = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid artifact ID'
      });
    }

    const artifact = await Artifact.findById(id);
    if (!artifact) {
      return res.status(404).json({
        success: false,
        message: 'Artifact not found'
      });
    }
    
    // Get user to check current favorites
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Initialize favorites array if it doesn't exist
    if (!user.favorites) {
      user.favorites = [];
    }

    // Check if artifact is already favorited
    const favoriteIndex = user.favorites.findIndex(fav => fav.toString() === id);
    const isFavorited = favoriteIndex !== -1;

    if (isFavorited) {
      // Remove from favorites
      user.favorites.splice(favoriteIndex, 1);
      // Decrement likes count
      await Artifact.findByIdAndUpdate(
        id, 
        { $inc: { 'analytics.likes': -1 } },
        { upsert: false }
      );
    } else {
      // Add to favorites
      user.favorites.push(id);
      // Increment likes count
      await Artifact.findByIdAndUpdate(
        id, 
        { $inc: { 'analytics.likes': 1 } },
        { upsert: false }
      );
    }

    // Save user favorites
    await user.save();

    // Get updated artifact to return current like count
    const updatedArtifact = await Artifact.findById(id, 'analytics.likes');
    
    res.json({
      success: true,
      message: !isFavorited ? 'Added to favorites' : 'Removed from favorites',
      data: {
        artifactId: id,
        isFavorited: !isFavorited,
        totalLikes: updatedArtifact?.analytics?.likes || 0
      }
    });
  } catch (error) {
    console.error('Error toggling favorite:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update favorite status'
    });
  }
};

// Get artifact categories (for filters)
const getArtifactCategories = async (req, res) => {
  try {
    // Aggregate distinct values from the database
    const [categoriesData, periodsData, originsData, museumsData] = await Promise.all([
      Artifact.distinct('category', { status: 'active' }),
      Artifact.distinct('historicalContext.period', { status: 'active' }),
      Artifact.distinct('historicalContext.origin', { status: 'active' }),
      Artifact.find({ status: 'active' })
        .populate('museum', 'name')
        .distinct('museum')
        .then(museums => 
          Museum.find({ _id: { $in: museums } }, 'name')
            .then(museumDocs => museumDocs.map(m => m.name))
        )
    ]);
    
    // Filter out null/undefined values
    const categories = categoriesData.filter(cat => cat && cat.trim());
    const periods = periodsData.filter(period => period && period.trim());
    const origins = originsData.filter(origin => origin && origin.trim());
    const museums = museumsData.filter(museum => museum && museum.trim());
    
    res.json({
      success: true,
      data: {
        categories: categories.sort(),
        periods: periods.sort(),
        origins: origins.sort(),
        museums: museums.sort()
      }
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories'
    });
  }
};

module.exports = {
  getArtifacts,
  getArtifact,
  getVirtualTours,
  bookVirtualTour,
  getUserBookings,
  toggleFavorite,
  getArtifactCategories
};
