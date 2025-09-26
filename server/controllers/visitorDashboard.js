const asyncHandler = require('express-async-handler');
const VisitorProfile = require('../models/VisitorProfile');
const VisitorActivity = require('../models/VisitorActivity');
const VisitorFavorites = require('../models/VisitorFavorites');
const User = require('../models/User');
const Museum = require('../models/Museum');
const Artifact = require('../models/Artifact');
const Course = require('../models/Course');
const TourPackage = require('../models/TourPackage');
const Event = require('../models/Event');
const Booking = require('../models/Booking');

// @desc    Get visitor dashboard data
// @route   GET /api/visitor/dashboard
// @access  Private (visitors only)
const getDashboardData = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  try {
    // Get or create visitor profile
    let profile = await VisitorProfile.findOne({ userId });
    if (!profile) {
      profile = await createVisitorProfile(userId, req.user);
    }

    // Get recent activity (last 30 days)
    const activitySummary = await VisitorActivity.getUserActivitySummary(userId, 30);
    
    // Get daily activity stats (last 7 days)
    const dailyActivity = await VisitorActivity.getDailyActivityStats(userId, 7);
    
    // Get favorite statistics
    const favoriteStats = await VisitorFavorites.getUserFavoriteStats(userId);
    
    // Get recent bookings
    const recentBookings = await Booking.find({ userId })
      .populate('tourPackage')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get recommended content based on user interests and activity
    const recommendations = await getPersonalizedRecommendations(userId, profile);

    // Get recent activities for activity feed
    const recentActivities = await VisitorActivity.find({ userId })
      .sort({ timestamp: -1 })
      .limit(10)
      .lean();

    const dashboardData = {
      profile: {
        id: profile._id,
        fullName: profile.fullName,
        level: profile.stats.level,
        totalPoints: profile.stats.totalPoints,
        levelProgress: profile.levelProgress,
        streakDays: profile.stats.streakDays,
        completionRate: profile.completionRate,
        joinedDate: profile.createdAt,
        preferences: profile.preferences,
        achievements: profile.achievements.slice(0, 5), // Latest 5 achievements
        stats: profile.stats
      },
      activity: {
        summary: activitySummary,
        daily: dailyActivity,
        recent: recentActivities.map(activity => ({
          type: activity.activityType,
          entityName: activity.activityData?.entityName,
          timestamp: activity.timestamp,
          pointsEarned: activity.pointsEarned
        }))
      },
      favorites: {
        total: favoriteStats.totalFavorites,
        byType: favoriteStats.byType,
        mostFavorited: favoriteStats.mostFavorited
      },
      bookings: {
        recent: recentBookings.map(booking => ({
          id: booking._id,
          tourTitle: booking.tourPackage?.title || 'Unknown Tour',
          date: booking.selectedDate,
          status: booking.status,
          totalAmount: booking.totalAmount,
          guests: booking.numberOfGuests
        })),
        stats: {
          total: recentBookings.length,
          confirmed: recentBookings.filter(b => b.status === 'confirmed').length,
          pending: recentBookings.filter(b => b.status === 'pending').length
        }
      },
      recommendations
    };

    // Log dashboard view activity
    await VisitorActivity.logActivity({
      userId,
      sessionId: req.sessionID || 'dashboard',
      activityType: 'page_view',
      activityData: {
        pageUrl: '/visitor-dashboard',
        entityType: 'dashboard'
      },
      pointsEarned: 1 // Small points for daily dashboard view
    });

    res.json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    console.error('Error loading dashboard data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load dashboard data',
      error: error.message
    });
  }
});

// @desc    Get visitor profile
// @route   GET /api/visitor/profile
// @access  Private (visitors only)
const getProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  let profile = await VisitorProfile.findOne({ userId });
  if (!profile) {
    profile = await createVisitorProfile(userId, req.user);
  }

  res.json({
    success: true,
    data: profile
  });
});

// @desc    Update visitor profile
// @route   PUT /api/visitor/profile
// @access  Private (visitors only)
const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const updates = req.body;

  const profile = await VisitorProfile.findOneAndUpdate(
    { userId },
    { $set: updates },
    { new: true, runValidators: true }
  );

  if (!profile) {
    return res.status(404).json({
      success: false,
      message: 'Profile not found'
    });
  }

  // Log profile update activity
  await VisitorActivity.logActivity({
    userId,
    sessionId: req.sessionID || 'profile-update',
    activityType: 'profile_updated',
    activityData: {
      entityType: 'profile',
      metadata: { updatedFields: Object.keys(updates) }
    },
    pointsEarned: 10
  });

  res.json({
    success: true,
    data: profile,
    message: 'Profile updated successfully'
  });
});

// @desc    Get user favorites
// @route   GET /api/visitor/favorites
// @access  Private (visitors only)
const getFavorites = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { entityType, category, tags, page, limit, sortBy, sortOrder } = req.query;

  const options = {
    entityType,
    category,
    tags: tags ? tags.split(',') : undefined,
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 10,
    sortBy: sortBy || 'createdAt',
    sortOrder: parseInt(sortOrder) || -1
  };

  const result = await VisitorFavorites.getUserFavorites(userId, options);

  res.json({
    success: true,
    data: result.favorites,
    pagination: result.pagination
  });
});

// @desc    Add to favorites
// @route   POST /api/visitor/favorites
// @access  Private (visitors only)
const addFavorite = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { entityId, entityType, entityData, notes, tags, priority, isPublic } = req.body;

  if (!entityId || !entityType) {
    return res.status(400).json({
      success: false,
      message: 'EntityId and entityType are required'
    });
  }

  try {
    const favorite = await VisitorFavorites.addFavorite(
      userId,
      entityId,
      entityType,
      entityData,
      {
        notes,
        tags,
        priority,
        isPublic,
        sessionId: req.sessionID
      }
    );

    res.status(201).json({
      success: true,
      data: favorite,
      message: 'Added to favorites successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Remove from favorites
// @route   DELETE /api/visitor/favorites/:entityId/:entityType
// @access  Private (visitors only)
const removeFavorite = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { entityId, entityType } = req.params;

  const favorite = await VisitorFavorites.removeFavorite(
    userId,
    entityId,
    entityType,
    req.sessionID
  );

  if (!favorite) {
    return res.status(404).json({
      success: false,
      message: 'Favorite not found'
    });
  }

  res.json({
    success: true,
    message: 'Removed from favorites successfully'
  });
});

// @desc    Get user activity history
// @route   GET /api/visitor/activity
// @access  Private (visitors only)
const getActivity = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { type, days, page, limit } = req.query;

  const query = { userId };
  if (type) {
    query.activityType = type;
  }

  if (days) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    query.timestamp = { $gte: startDate };
  }

  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 20;
  const skip = (pageNum - 1) * limitNum;

  const [activities, total] = await Promise.all([
    VisitorActivity.find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    VisitorActivity.countDocuments(query)
  ]);

  res.json({
    success: true,
    data: activities,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum)
    }
  });
});

// @desc    Get user stats and analytics
// @route   GET /api/visitor/stats
// @access  Private (visitors only)
const getStats = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { period } = req.query; // 'week', 'month', 'year'

  const days = period === 'week' ? 7 : period === 'year' ? 365 : 30;

  const [profile, activitySummary, dailyActivity, favoriteStats] = await Promise.all([
    VisitorProfile.findOne({ userId }),
    VisitorActivity.getUserActivitySummary(userId, days),
    VisitorActivity.getDailyActivityStats(userId, days),
    VisitorFavorites.getUserFavoriteStats(userId)
  ]);

  const stats = {
    profile: {
      level: profile?.stats.level || 1,
      totalPoints: profile?.stats.totalPoints || 0,
      streakDays: profile?.stats.streakDays || 0,
      ...profile?.stats
    },
    activity: {
      summary: activitySummary,
      daily: dailyActivity,
      totalActivities: activitySummary.reduce((sum, activity) => sum + activity.count, 0),
      totalPoints: activitySummary.reduce((sum, activity) => sum + activity.totalPoints, 0)
    },
    favorites: favoriteStats,
    period: {
      type: period || 'month',
      days
    }
  };

  res.json({
    success: true,
    data: stats
  });
});

// @desc    Get personalized recommendations
// @route   GET /api/visitor/recommendations
// @access  Private (visitors only)
const getRecommendations = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { type, limit } = req.query;

  const profile = await VisitorProfile.findOne({ userId });
  if (!profile) {
    return res.status(404).json({
      success: false,
      message: 'Profile not found'
    });
  }

  const recommendations = await getPersonalizedRecommendations(userId, profile, type, parseInt(limit) || 10);

  res.json({
    success: true,
    data: recommendations
  });
});

// Helper function to create visitor profile
const createVisitorProfile = async (userId, user) => {
  const [firstName, ...lastNameParts] = (user.name || '').split(' ');
  const lastName = lastNameParts.join(' ') || '';

  const profileData = {
    userId,
    personalInfo: {
      firstName: firstName || 'Visitor',
      lastName: lastName || '',
    },
    preferences: {
      interests: [],
      language: 'en'
    }
  };

  const profile = new VisitorProfile(profileData);
  await profile.save();

  // Log profile creation activity
  await VisitorActivity.logActivity({
    userId,
    sessionId: 'profile-creation',
    activityType: 'profile_updated',
    activityData: {
      entityType: 'profile',
      entityName: 'Profile Created'
    },
    pointsEarned: 50 // Welcome bonus
  });

  return profile;
};

// Helper function to get personalized recommendations
const getPersonalizedRecommendations = async (userId, profile, type, limit = 10) => {
  const userInterests = profile.preferences.interests || [];
  const userActivities = await VisitorActivity.find({ userId })
    .sort({ timestamp: -1 })
    .limit(50)
    .lean();

  // Extract categories user has interacted with
  const interactedCategories = [...new Set(
    userActivities
      .filter(a => a.activityData?.entityType)
      .map(a => a.activityData.entityType)
  )];

  const recommendations = {};

  // Recommend museums based on interests
  if (!type || type === 'museums') {
    const museumQuery = userInterests.length > 0 ? 
      { category: { $in: userInterests } } : 
      { isActive: true };
    
    recommendations.museums = await Museum.find(museumQuery)
      .sort({ rating: -1 })
      .limit(limit)
      .lean();
  }

  // Recommend artifacts based on interests and viewed categories
  if (!type || type === 'artifacts') {
    const artifactQuery = {};
    if (userInterests.length > 0) {
      artifactQuery.$or = [
        { category: { $in: userInterests } },
        { tags: { $in: userInterests } }
      ];
    }
    
    recommendations.artifacts = await Artifact.find(artifactQuery)
      .sort({ viewCount: -1, rating: -1 })
      .limit(limit)
      .lean();
  }

  // Recommend courses based on interests
  if (!type || type === 'courses') {
    const courseQuery = userInterests.length > 0 ? 
      { category: { $in: userInterests } } : 
      { isPublished: true };
    
    recommendations.courses = await Course.find(courseQuery)
      .sort({ enrollmentCount: -1, rating: -1 })
      .limit(limit)
      .lean();
  }

  // Recommend tour packages
  if (!type || type === 'tours') {
    const tourQuery = { isActive: true };
    if (userInterests.length > 0) {
      tourQuery.category = { $in: userInterests };
    }
    
    recommendations.tours = await TourPackage.find(tourQuery)
      .sort({ rating: -1, bookingCount: -1 })
      .limit(limit)
      .lean();
  }

  // Recommend events
  if (!type || type === 'events') {
    const eventQuery = { 
      startDate: { $gte: new Date() },
      isActive: true 
    };
    if (userInterests.length > 0) {
      eventQuery.category = { $in: userInterests };
    }
    
    recommendations.events = await Event.find(eventQuery)
      .sort({ startDate: 1 })
      .limit(limit)
      .lean();
  }

  return recommendations;
};

module.exports = {
  getDashboardData,
  getProfile,
  updateProfile,
  getFavorites,
  addFavorite,
  removeFavorite,
  getActivity,
  getStats,
  getRecommendations
};
