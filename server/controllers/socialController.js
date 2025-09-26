const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const VisitorActivity = require('../models/VisitorActivity');
const VisitorProfile = require('../models/VisitorProfile');

// @desc    Follow a user
// @route   POST /api/social/follow/:userId
// @access  Private
const followUser = asyncHandler(async (req, res) => {
  const targetUserId = req.params.userId;
  const currentUserId = req.user.id;

  if (targetUserId === currentUserId) {
    return res.status(400).json({
      success: false,
      message: 'You cannot follow yourself'
    });
  }

  try {
    const [currentUser, targetUser] = await Promise.all([
      User.findById(currentUserId),
      User.findById(targetUserId)
    ]);

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if already following
    if (currentUser.social.following.includes(targetUserId)) {
      return res.status(400).json({
        success: false,
        message: 'Already following this user'
      });
    }

    // Add to following/followers
    currentUser.social.following.push(targetUserId);
    targetUser.social.followers.push(currentUserId);

    await Promise.all([
      currentUser.save(),
      targetUser.save()
    ]);

    // Log activity
    await VisitorActivity.logActivity({
      userId: currentUserId,
      sessionId: req.sessionID || 'social',
      activityType: 'social_interaction',
      activityData: {
        entityType: 'user',
        entityId: targetUserId,
        entityName: targetUser.fullName,
        metadata: { action: 'follow' }
      },
      pointsEarned: 10
    });

    res.json({
      success: true,
      message: `Now following ${targetUser.fullName}`,
      data: {
        followingCount: currentUser.social.following.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to follow user',
      error: error.message
    });
  }
});

// @desc    Unfollow a user
// @route   DELETE /api/social/follow/:userId
// @access  Private
const unfollowUser = asyncHandler(async (req, res) => {
  const targetUserId = req.params.userId;
  const currentUserId = req.user.id;

  try {
    const [currentUser, targetUser] = await Promise.all([
      User.findById(currentUserId),
      User.findById(targetUserId)
    ]);

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Remove from following/followers
    currentUser.social.following = currentUser.social.following.filter(
      id => id.toString() !== targetUserId
    );
    targetUser.social.followers = targetUser.social.followers.filter(
      id => id.toString() !== currentUserId
    );

    await Promise.all([
      currentUser.save(),
      targetUser.save()
    ]);

    res.json({
      success: true,
      message: `Unfollowed ${targetUser.fullName}`,
      data: {
        followingCount: currentUser.social.following.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to unfollow user',
      error: error.message
    });
  }
});

// @desc    Get user's followers
// @route   GET /api/social/followers
// @access  Private
const getFollowers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (page - 1) * limit;

  try {
    const user = await User.findById(req.user.id)
      .populate({
        path: 'social.followers',
        select: 'firstName lastName avatar stats.totalPoints stats.level',
        options: {
          skip: skip,
          limit: parseInt(limit)
        }
      });

    const total = user.social.followers.length;

    res.json({
      success: true,
      data: {
        followers: user.social.followers,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get followers',
      error: error.message
    });
  }
});

// @desc    Get user's following
// @route   GET /api/social/following
// @access  Private
const getFollowing = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (page - 1) * limit;

  try {
    const user = await User.findById(req.user.id)
      .populate({
        path: 'social.following',
        select: 'firstName lastName avatar stats.totalPoints stats.level',
        options: {
          skip: skip,
          limit: parseInt(limit)
        }
      });

    const total = user.social.following.length;

    res.json({
      success: true,
      data: {
        following: user.social.following,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get following',
      error: error.message
    });
  }
});

// @desc    Get user recommendations
// @route   GET /api/social/recommendations
// @access  Private
const getUserRecommendations = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;
  const userId = req.user.id;

  try {
    const currentUser = await User.findById(userId);
    const currentFollowing = currentUser.social.following.map(id => id.toString());

    // Find users with similar interests who are not already followed
    const recommendations = await User.find({
      _id: { 
        $ne: userId,
        $nin: currentFollowing
      },
      interests: { $in: currentUser.interests || [] },
      isActive: true,
      'preferences.privacy.profileVisibility': 'public'
    })
      .select('firstName lastName avatar interests stats.totalPoints stats.level')
      .sort({ 'stats.totalPoints': -1 })
      .limit(parseInt(limit))
      .lean();

    res.json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get user recommendations',
      error: error.message
    });
  }
});

// @desc    Get user profile for social view
// @route   GET /api/social/profile/:userId
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const targetUserId = req.params.userId;
  const currentUserId = req.user.id;

  try {
    const [user, visitorProfile, currentUser] = await Promise.all([
      User.findById(targetUserId)
        .select('-password -passwordResetToken -emailVerificationToken')
        .lean(),
      VisitorProfile.findOne({ userId: targetUserId }),
      User.findById(currentUserId)
    ]);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check privacy settings
    if (user.preferences?.privacy?.profileVisibility === 'private' && 
        targetUserId !== currentUserId) {
      return res.status(403).json({
        success: false,
        message: 'This profile is private'
      });
    }

    // Increment profile views (only for other users)
    if (targetUserId !== currentUserId) {
      await User.findByIdAndUpdate(targetUserId, {
        $inc: { 'social.profileViews': 1 }
      });
    }

    // Check if current user is following this user
    const isFollowing = currentUser.social.following.includes(targetUserId);

    const profileData = {
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        avatar: user.avatar,
        bio: user.bio,
        interests: user.interests,
        joinedDate: user.createdAt
      },
      stats: {
        totalPoints: user.stats?.totalPoints || 0,
        level: user.stats?.level || 1,
        artifactsViewed: user.stats?.artifactsViewed || 0,
        eventsAttended: user.stats?.eventsAttended || 0,
        reviewsWritten: user.stats?.reviewsWritten || 0
      },
      social: {
        followersCount: user.social?.followers?.length || 0,
        followingCount: user.social?.following?.length || 0,
        profileViews: user.social?.profileViews || 0,
        isFollowing
      }
    };

    // Add visitor profile data if exists
    if (visitorProfile) {
      profileData.achievements = visitorProfile.achievements?.slice(0, 6) || [];
      profileData.streakDays = visitorProfile.stats?.streakDays || 0;
      profileData.completionRate = visitorProfile.completionRate || 0;
    }

    res.json({
      success: true,
      data: profileData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get user profile',
      error: error.message
    });
  }
});

// @desc    Search users
// @route   GET /api/social/search
// @access  Private
const searchUsers = asyncHandler(async (req, res) => {
  const { q, interests, page = 1, limit = 20 } = req.query;

  if (!q || q.length < 2) {
    return res.status(400).json({
      success: false,
      message: 'Search query must be at least 2 characters long'
    });
  }

  const skip = (page - 1) * limit;
  let query = {
    isActive: true,
    'preferences.privacy.profileVisibility': 'public',
    _id: { $ne: req.user.id }
  };

  // Text search
  if (q) {
    query.$or = [
      { firstName: new RegExp(q, 'i') },
      { lastName: new RegExp(q, 'i') },
      { bio: new RegExp(q, 'i') }
    ];
  }

  // Interest filter
  if (interests) {
    const interestArray = interests.split(',');
    query.interests = { $in: interestArray };
  }

  try {
    const [users, total] = await Promise.all([
      User.find(query)
        .select('firstName lastName avatar bio interests stats.totalPoints stats.level social.followers')
        .sort({ 'stats.totalPoints': -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      User.countDocuments(query)
    ]);

    // Check which users current user is following
    const currentUser = await User.findById(req.user.id);
    const followingIds = currentUser.social.following.map(id => id.toString());

    const usersWithFollowStatus = users.map(user => ({
      ...user,
      isFollowing: followingIds.includes(user._id.toString()),
      followersCount: user.social?.followers?.length || 0
    }));

    res.json({
      success: true,
      data: {
        users: usersWithFollowStatus,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to search users',
      error: error.message
    });
  }
});

// @desc    Get activity feed
// @route   GET /api/social/feed
// @access  Private
const getActivityFeed = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const userId = req.user.id;
  const skip = (page - 1) * limit;

  try {
    const user = await User.findById(userId);
    const followingIds = user.social.following;

    // Include user's own activities and those of users they follow
    const userIds = [userId, ...followingIds];

    const activities = await VisitorActivity.find({
      userId: { $in: userIds },
      activityType: { 
        $in: [
          'achievement_earned', 'badge_unlocked', 'course_completion',
          'tour_completion', 'review_posted', 'social_interaction'
        ]
      }
    })
      .populate('userId', 'firstName lastName avatar')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await VisitorActivity.countDocuments({
      userId: { $in: userIds },
      activityType: { 
        $in: [
          'achievement_earned', 'badge_unlocked', 'course_completion',
          'tour_completion', 'review_posted', 'social_interaction'
        ]
      }
    });

    const formattedActivities = activities.map(activity => ({
      _id: activity._id,
      user: activity.userId,
      type: activity.activityType,
      data: activity.activityData,
      pointsEarned: activity.pointsEarned,
      timestamp: activity.timestamp,
      description: generateActivityDescription(activity)
    }));

    res.json({
      success: true,
      data: {
        activities: formattedActivities,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get activity feed',
      error: error.message
    });
  }
});

// @desc    Get leaderboard
// @route   GET /api/social/leaderboard
// @access  Private
const getLeaderboard = asyncHandler(async (req, res) => {
  const { type = 'points', period = 'all', limit = 50 } = req.query;
  const userId = req.user.id;

  let sortField;
  switch (type) {
    case 'points':
      sortField = { 'stats.totalPoints': -1 };
      break;
    case 'level':
      sortField = { 'stats.level': -1, 'stats.totalPoints': -1 };
      break;
    case 'artifacts':
      sortField = { 'stats.artifactsViewed': -1 };
      break;
    case 'events':
      sortField = { 'stats.eventsAttended': -1 };
      break;
    default:
      sortField = { 'stats.totalPoints': -1 };
  }

  try {
    const users = await User.find({
      isActive: true,
      'preferences.privacy.profileVisibility': 'public'
    })
      .select('firstName lastName avatar stats.totalPoints stats.level stats.artifactsViewed stats.eventsAttended')
      .sort(sortField)
      .limit(parseInt(limit))
      .lean();

    // Find current user's rank
    const currentUserRank = users.findIndex(user => user._id.toString() === userId) + 1;

    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: `${user.firstName} ${user.lastName}`,
        avatar: user.avatar
      },
      stats: user.stats,
      isCurrentUser: user._id.toString() === userId
    }));

    res.json({
      success: true,
      data: {
        leaderboard,
        currentUserRank,
        type,
        period
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get leaderboard',
      error: error.message
    });
  }
});

// Helper function to generate activity descriptions
const generateActivityDescription = (activity) => {
  const user = activity.userId;
  const data = activity.activityData;

  switch (activity.activityType) {
    case 'achievement_earned':
      return `${user.firstName} earned the "${data.entityName}" achievement`;
    case 'badge_unlocked':
      return `${user.firstName} unlocked a new badge: ${data.entityName}`;
    case 'course_completion':
      return `${user.firstName} completed "${data.entityName}"`;
    case 'tour_completion':
      return `${user.firstName} completed a tour of ${data.entityName}`;
    case 'review_posted':
      return `${user.firstName} posted a review for ${data.entityName}`;
    case 'social_interaction':
      return `${user.firstName} ${data.metadata?.action || 'interacted with'} ${data.entityName}`;
    default:
      return `${user.firstName} performed an activity`;
  }
};

module.exports = {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  getUserRecommendations,
  getUserProfile,
  searchUsers,
  getActivityFeed,
  getLeaderboard
};
