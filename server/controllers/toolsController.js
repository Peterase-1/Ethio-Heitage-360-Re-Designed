const mongoose = require('mongoose');
const Tool = require('../models/Tool');
const ToolUsage = require('../models/ToolUsage');
const ToolReview = require('../models/ToolReview');

// ===== GET ALL TOOLS AND RESOURCES =====

// Get all tools and resources with categories
const getToolsAndResources = async (req, res) => {
  try {
    const { category, available, search, page = 1, limit = 50 } = req.query;
    
    // Build query filter
    const filter = { isActive: true };
    if (category) filter.category = category;
    if (available !== undefined) filter.available = available === 'true';
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' }},
        { description: { $regex: search, $options: 'i' }},
        { keywords: { $in: [new RegExp(search, 'i')] }}
      ];
    }
    
    const tools = await Tool.find(filter)
      .sort({ featured: -1, priority: -1, name: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('createdBy', 'firstName lastName')
      .lean();
    
    const total = await Tool.countDocuments(filter);
    
    // Get usage stats for each tool
    const toolsWithStats = await Promise.all(tools.map(async (tool) => {
      const totalUsage = await ToolUsage.countDocuments({ toolId: tool._id });
      const avgRating = await ToolReview.aggregate([
        { $match: { toolId: tool._id, isActive: true } },
        { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
      ]);
      
      return {
        id: tool._id.toString(),
        name: tool.name,
        description: tool.description,
        category: tool.category,
        icon: tool.icon,
        color: tool.color,
        path: tool.path,
        externalUrl: tool.externalUrl,
        available: tool.available,
        featured: tool.featured,
        difficulty: tool.difficulty,
        estimatedTime: tool.estimatedTime,
        keywords: tool.keywords || [],
        requirements: tool.requirements || [],
        features: tool.features || [],
        screenshots: tool.screenshots || [],
        totalUsage: totalUsage,
        averageRating: avgRating.length > 0 ? Math.round(avgRating[0].avgRating * 10) / 10 : 0,
        reviewCount: avgRating.length > 0 ? avgRating[0].count : 0,
        createdAt: tool.createdAt,
        updatedAt: tool.updatedAt
      };
    }));
    
    res.json({
      success: true,
      data: toolsWithStats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: toolsWithStats.length,
        totalCount: total
      }
    });
  } catch (error) {
    console.error('Get tools and resources error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===== GET TOOLS BY CATEGORY =====

// Get tools grouped by category for the main tools page
const getToolsByCategory = async (req, res) => {
  try {
    const categories = [
      'Educational Tools',
      'Navigation & Geography', 
      'Language & Culture',
      'Utilities & Converters',
      'Mobile & Apps',
      'Cultural Resources',
      'Learning Tools'
    ];
    
    const toolsByCategory = {};
    
    for (const category of categories) {
      const tools = await Tool.find({ 
        category: category, 
        isActive: true 
      })
      .sort({ featured: -1, priority: -1, name: 1 })
      .limit(10) // Limit per category
      .lean();
      
      // Get stats for each tool
      const toolsWithStats = await Promise.all(tools.map(async (tool) => {
        const totalUsage = await ToolUsage.countDocuments({ toolId: tool._id });
        const avgRating = await ToolReview.aggregate([
          { $match: { toolId: tool._id, isActive: true } },
          { $group: { _id: null, avgRating: { $avg: '$rating' } } }
        ]);
        
        return {
          id: tool._id.toString(),
          name: tool.name,
          description: tool.description,
          icon: tool.icon,
          color: tool.color,
          path: tool.path,
          available: tool.available,
          featured: tool.featured,
          totalUsage: totalUsage,
          averageRating: avgRating.length > 0 ? Math.round(avgRating[0].avgRating * 10) / 10 : 0
        };
      }));
      
      toolsByCategory[category] = toolsWithStats;
    }
    
    res.json({
      success: true,
      data: toolsByCategory
    });
  } catch (error) {
    console.error('Get tools by category error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===== GET SPECIFIC TOOL =====

// Get detailed information about a specific tool
const getTool = async (req, res) => {
  try {
    const { id } = req.params;
    
    const tool = await Tool.findById(id)
      .populate('createdBy', 'firstName lastName email')
      .lean();
    
    if (!tool) {
      return res.status(404).json({ success: false, message: 'Tool not found' });
    }
    
    // Get usage stats
    const totalUsage = await ToolUsage.countDocuments({ toolId: tool._id });
    
    // Get recent usage (last 30 days)
    const recentUsage = await ToolUsage.countDocuments({
      toolId: tool._id,
      usedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });
    
    // Get reviews with ratings
    const reviews = await ToolReview.find({ toolId: tool._id, isActive: true })
      .populate('userId', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();
    
    // Calculate rating distribution
    const ratingStats = await ToolReview.aggregate([
      { $match: { toolId: new mongoose.Types.ObjectId(id), isActive: true } },
      { $group: { 
        _id: '$rating', 
        count: { $sum: 1 } 
      }},
      { $sort: { _id: -1 } }
    ]);
    
    const avgRating = await ToolReview.aggregate([
      { $match: { toolId: new mongoose.Types.ObjectId(id), isActive: true } },
      { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);
    
    const transformedTool = {
      id: tool._id.toString(),
      name: tool.name,
      description: tool.description,
      longDescription: tool.longDescription,
      category: tool.category,
      icon: tool.icon,
      color: tool.color,
      path: tool.path,
      externalUrl: tool.externalUrl,
      available: tool.available,
      featured: tool.featured,
      difficulty: tool.difficulty,
      estimatedTime: tool.estimatedTime,
      keywords: tool.keywords || [],
      requirements: tool.requirements || [],
      features: tool.features || [],
      screenshots: tool.screenshots || [],
      instructions: tool.instructions || [],
      totalUsage: totalUsage,
      recentUsage: recentUsage,
      averageRating: avgRating.length > 0 ? Math.round(avgRating[0].avgRating * 10) / 10 : 0,
      reviewCount: avgRating.length > 0 ? avgRating[0].count : 0,
      ratingDistribution: ratingStats,
      reviews: reviews.map(review => ({
        id: review._id.toString(),
        rating: review.rating,
        comment: review.comment,
        userName: review.userId ? `${review.userId.firstName} ${review.userId.lastName}` : 'Anonymous',
        createdAt: review.createdAt
      })),
      createdBy: tool.createdBy ? `${tool.createdBy.firstName} ${tool.createdBy.lastName}` : 'System',
      createdAt: tool.createdAt,
      updatedAt: tool.updatedAt
    };
    
    res.json({ success: true, data: transformedTool });
  } catch (error) {
    console.error('Get tool error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===== TRACK TOOL USAGE =====

// Track when a user uses a tool
const trackToolUsage = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || req.body.userId;
    const { sessionId, userAgent, ipAddress } = req.body;
    
    // Verify tool exists
    const tool = await Tool.findById(id);
    if (!tool) {
      return res.status(404).json({ success: false, message: 'Tool not found' });
    }
    
    // Create usage record
    const usage = new ToolUsage({
      toolId: id,
      userId: userId || null,
      sessionId: sessionId || null,
      userAgent: userAgent || req.headers['user-agent'],
      ipAddress: ipAddress || req.ip,
      usedAt: new Date()
    });
    
    await usage.save();
    
    // Update tool usage count
    await Tool.findByIdAndUpdate(id, { $inc: { usageCount: 1 } });
    
    res.json({ 
      success: true, 
      message: 'Usage tracked successfully',
      usageId: usage._id
    });
  } catch (error) {
    console.error('Track tool usage error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===== TOOL REVIEWS =====

// Submit a review for a tool
const submitToolReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const { rating, comment, recommend } = req.body;
    
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }
    
    // Verify tool exists
    const tool = await Tool.findById(id);
    if (!tool) {
      return res.status(404).json({ success: false, message: 'Tool not found' });
    }
    
    // Check if user already reviewed this tool
    const existingReview = await ToolReview.findOne({ toolId: id, userId });
    if (existingReview) {
      return res.status(400).json({ 
        success: false, 
        message: 'You have already reviewed this tool' 
      });
    }
    
    // Create review
    const review = new ToolReview({
      toolId: id,
      userId: userId,
      rating: rating,
      comment: comment || '',
      recommend: recommend || true
    });
    
    await review.save();
    
    // Update tool's average rating
    const avgRating = await ToolReview.aggregate([
      { $match: { toolId: new mongoose.Types.ObjectId(id), isActive: true } },
      { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ]);
    
    if (avgRating.length > 0) {
      await Tool.findByIdAndUpdate(id, { 
        averageRating: Math.round(avgRating[0].avgRating * 10) / 10 
      });
    }
    
    res.status(201).json({ 
      success: true, 
      message: 'Review submitted successfully',
      reviewId: review._id
    });
  } catch (error) {
    console.error('Submit tool review error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get reviews for a tool
const getToolReviews = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10, rating } = req.query;
    
    const filter = { toolId: id, isActive: true };
    if (rating) filter.rating = parseInt(rating);
    
    const reviews = await ToolReview.find(filter)
      .populate('userId', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();
    
    const total = await ToolReview.countDocuments(filter);
    
    const transformedReviews = reviews.map(review => ({
      id: review._id.toString(),
      rating: review.rating,
      comment: review.comment,
      recommend: review.recommend,
      userName: review.userId ? `${review.userId.firstName} ${review.userId.lastName}` : 'Anonymous',
      createdAt: review.createdAt
    }));
    
    res.json({
      success: true,
      data: transformedReviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: transformedReviews.length,
        totalCount: total
      }
    });
  } catch (error) {
    console.error('Get tool reviews error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===== TOOL ANALYTICS =====

// Get usage analytics for a tool
const getToolAnalytics = async (req, res) => {
  try {
    const { id } = req.params;
    const { period = '30d' } = req.query;
    
    // Verify tool exists
    const tool = await Tool.findById(id);
    if (!tool) {
      return res.status(404).json({ success: false, message: 'Tool not found' });
    }
    
    // Calculate date range
    let dateRange = new Date();
    switch (period) {
      case '7d':
        dateRange.setDate(dateRange.getDate() - 7);
        break;
      case '30d':
        dateRange.setDate(dateRange.getDate() - 30);
        break;
      case '90d':
        dateRange.setDate(dateRange.getDate() - 90);
        break;
      case '1y':
        dateRange.setFullYear(dateRange.getFullYear() - 1);
        break;
      default:
        dateRange.setDate(dateRange.getDate() - 30);
    }
    
    // Get usage over time
    const usageOverTime = await ToolUsage.aggregate([
      { 
        $match: { 
          toolId: new mongoose.Types.ObjectId(id),
          usedAt: { $gte: dateRange }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$usedAt' },
            month: { $month: '$usedAt' },
            day: { $dayOfMonth: '$usedAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);
    
    // Get total stats
    const totalUsage = await ToolUsage.countDocuments({ toolId: id });
    const periodUsage = await ToolUsage.countDocuments({ 
      toolId: id, 
      usedAt: { $gte: dateRange } 
    });
    const uniqueUsers = await ToolUsage.distinct('userId', { 
      toolId: id, 
      usedAt: { $gte: dateRange },
      userId: { $ne: null }
    });
    
    // Get rating stats
    const ratingStats = await ToolReview.aggregate([
      { $match: { toolId: new mongoose.Types.ObjectId(id), isActive: true } },
      { 
        $group: { 
          _id: null, 
          avgRating: { $avg: '$rating' },
          count: { $sum: 1 },
          distribution: {
            $push: '$rating'
          }
        }
      }
    ]);
    
    // Calculate rating distribution
    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    if (ratingStats.length > 0 && ratingStats[0].distribution) {
      ratingStats[0].distribution.forEach(rating => {
        ratingDistribution[rating] = (ratingDistribution[rating] || 0) + 1;
      });
    }
    
    const analytics = {
      period: period,
      totalUsage: totalUsage,
      periodUsage: periodUsage,
      uniqueUsers: uniqueUsers.length,
      averageRating: ratingStats.length > 0 ? 
        Math.round(ratingStats[0].avgRating * 10) / 10 : 0,
      totalReviews: ratingStats.length > 0 ? ratingStats[0].count : 0,
      ratingDistribution: ratingDistribution,
      usageOverTime: usageOverTime.map(item => ({
        date: `${item._id.year}-${String(item._id.month).padStart(2, '0')}-${String(item._id.day).padStart(2, '0')}`,
        usage: item.count
      }))
    };
    
    res.json({ success: true, data: analytics });
  } catch (error) {
    console.error('Get tool analytics error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===== FEATURED TOOLS =====

// Get featured tools for homepage
const getFeaturedTools = async (req, res) => {
  try {
    const { limit = 6 } = req.query;
    
    const featuredTools = await Tool.find({ 
      featured: true, 
      available: true, 
      isActive: true 
    })
    .sort({ priority: -1, usageCount: -1, createdAt: -1 })
    .limit(parseInt(limit))
    .lean();
    
    const toolsWithStats = await Promise.all(featuredTools.map(async (tool) => {
      const totalUsage = await ToolUsage.countDocuments({ toolId: tool._id });
      const avgRating = await ToolReview.aggregate([
        { $match: { toolId: tool._id, isActive: true } },
        { $group: { _id: null, avgRating: { $avg: '$rating' } } }
      ]);
      
      return {
        id: tool._id.toString(),
        name: tool.name,
        description: tool.description,
        category: tool.category,
        icon: tool.icon,
        color: tool.color,
        path: tool.path,
        totalUsage: totalUsage,
        averageRating: avgRating.length > 0 ? Math.round(avgRating[0].avgRating * 10) / 10 : 0
      };
    }));
    
    res.json({ success: true, data: toolsWithStats });
  } catch (error) {
    console.error('Get featured tools error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===== SPECIFIC TOOL DATA ENDPOINTS =====

// Get Amharic language phrases data
const getLanguageGuideData = async (req, res) => {
  try {
    const { category } = req.query;
    
    const languageData = {
      categories: ['basics', 'numbers', 'family', 'food', 'directions', 'time'],
      phrases: {
        basics: [
          { amharic: 'ሰላም', pronunciation: 'selam', english: 'Hello/Peace' },
          { amharic: 'እንደምን አደርክ?', pronunciation: 'indemin aderk?', english: 'How are you? (to male)' },
          { amharic: 'እንደምን አደርሽ?', pronunciation: 'indemin adersh?', english: 'How are you? (to female)' },
          { amharic: 'ደህና ነኝ', pronunciation: 'dehna negn', english: 'I am fine' },
          { amharic: 'አመሰግናለሁ', pronunciation: 'amesegnalehu', english: 'Thank you' },
          { amharic: 'ይቅርታ', pronunciation: 'yikirta', english: 'Excuse me/Sorry' }
        ],
        numbers: [
          { amharic: 'አንድ', pronunciation: 'and', english: 'One' },
          { amharic: 'ሁለት', pronunciation: 'hulet', english: 'Two' },
          { amharic: 'ሶስት', pronunciation: 'sost', english: 'Three' },
          { amharic: 'አራት', pronunciation: 'arat', english: 'Four' },
          { amharic: 'አምስት', pronunciation: 'amist', english: 'Five' }
        ]
        // Additional categories would be expanded here
      }
    };
    
    if (category && languageData.phrases[category]) {
      res.json({ 
        success: true, 
        data: {
          category: category,
          phrases: languageData.phrases[category]
        }
      });
    } else {
      res.json({ success: true, data: languageData });
    }
  } catch (error) {
    console.error('Get language guide data error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Ethiopian cultural calendar data
const getCulturalCalendarData = async (req, res) => {
  try {
    const { year = new Date().getFullYear(), category } = req.query;
    
    const calendarData = {
      year: parseInt(year),
      events: {
        religious: [
          {
            id: 1,
            title: 'Genna (Ethiopian Christmas)',
            date: '2024-01-07',
            category: 'religious',
            description: 'Ethiopian Orthodox Christmas celebration',
            significance: 'Commemorates the birth of Jesus Christ',
            traditions: ['Special church services', 'Traditional foods', 'Gift giving']
          },
          {
            id: 2,
            title: 'Timkat (Ethiopian Epiphany)',
            date: '2024-01-19',
            category: 'religious',
            description: 'Ethiopian Orthodox celebration of baptism of Jesus',
            significance: 'Celebrates the baptism of Jesus Christ in the River Jordan',
            traditions: ['Colorful processions', 'Water blessing ceremonies', 'Traditional white clothing']
          }
        ],
        cultural: [
          {
            id: 5,
            title: 'Enkutatash (Ethiopian New Year)',
            date: '2024-09-11',
            category: 'cultural',
            description: 'Ethiopian New Year celebration',
            significance: 'Marks the beginning of the Ethiopian calendar year',
            traditions: ['Yellow daisy flowers', 'Traditional songs', 'Gift giving']
          }
        ]
      },
      ethiopianMonths: [
        { name: 'Meskerem', gregorianStart: 'Sept 11/12', days: 30 },
        { name: 'Tikimt', gregorianStart: 'Oct 11/12', days: 30 },
        { name: 'Hidar', gregorianStart: 'Nov 10/11', days: 30 }
        // Additional months would be included
      ]
    };
    
    if (category && calendarData.events[category]) {
      res.json({ 
        success: true, 
        data: {
          category: category,
          events: calendarData.events[category]
        }
      });
    } else {
      res.json({ success: true, data: calendarData });
    }
  } catch (error) {
    console.error('Get cultural calendar data error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get converter tools data (exchange rates, etc.)
const getConverterData = async (req, res) => {
  try {
    const { type } = req.query;
    
    const converterData = {
      exchangeRates: {
        ETB: { USD: 0.018, EUR: 0.017, GBP: 0.015 },
        USD: { ETB: 55.2, EUR: 0.92, GBP: 0.81 },
        lastUpdated: new Date().toISOString()
      },
      unitConversions: {
        km: { miles: 0.621371, meters: 1000, feet: 3280.84 },
        miles: { km: 1.60934, meters: 1609.34, feet: 5280 }
      }
    };
    
    if (type && converterData[type]) {
      res.json({ 
        success: true, 
        data: converterData[type]
      });
    } else {
      res.json({ success: true, data: converterData });
    }
  } catch (error) {
    console.error('Get converter data error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get mobile app information
const getMobileAppData = async (req, res) => {
  try {
    const appData = {
      android: {
        version: '2.1.3',
        size: '45 MB',
        rating: 4.8,
        reviews: 2156,
        downloadUrl: '#',
        features: ['Google Play Services', 'AR Core Support', 'Offline Mode']
      },
      ios: {
        version: '2.1.1',
        size: '52 MB',
        rating: 4.9,
        reviews: 1847,
        downloadUrl: '#',
        features: ['ARKit Support', 'Siri Shortcuts', 'Widget Support']
      },
      features: [
        { title: 'AR Artifact Viewer', description: 'View 3D models in augmented reality' },
        { title: 'Offline Learning', description: 'Download content for offline access' },
        { title: 'Smart Notifications', description: 'Get alerts for nearby heritage sites' }
      ],
      screenshots: [
        { title: 'Heritage Dashboard', url: '' },
        { title: 'AR View', url: '' },
        { title: 'Interactive Map', url: '' }
      ]
    };
    
    res.json({ success: true, data: appData });
  } catch (error) {
    console.error('Get mobile app data error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getToolsAndResources,
  getToolsByCategory,
  getTool,
  trackToolUsage,
  submitToolReview,
  getToolReviews,
  getToolAnalytics,
  getFeaturedTools,
  getLanguageGuideData,
  getCulturalCalendarData,
  getConverterData,
  getMobileAppData
};
