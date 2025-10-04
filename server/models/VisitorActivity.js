const mongoose = require('mongoose');

const visitorActivitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionId: {
    type: String,
    required: true
  },
  activityType: {
    type: String,
    required: true,
    enum: [
      'login',
      'logout',
      'page_view',
      'artifact_view',
      'museum_visit',
      'course_enrollment',
      'course_completion',
      'lesson_view',
      'quiz_attempt',
      'tour_booking',
      'tour_completion',
      'review_posted',
      'comment_posted',
      'share_action',
      'search_performed',
      'favorite_added',
      'favorite_removed',
      'profile_updated',
      'achievement_earned',
      'badge_unlocked',
      'social_interaction',
      'file_download',
      'video_watched',
      '3d_tour_started',
      '3d_tour_completed',
      'virtual_museum_entered',
      'virtual_museum_exited'
    ]
  },
  activityData: {
    // Flexible object to store activity-specific data
    entityId: mongoose.Schema.Types.ObjectId, // ID of the related entity (course, artifact, etc.)
    entityType: String, // Type of the entity (course, artifact, museum, etc.)
    entityName: String, // Name/title of the entity
    duration: Number, // Duration in seconds (for activities with time tracking)
    score: Number, // Score achieved (for quizzes, etc.)
    rating: Number, // Rating given (for reviews)
    searchQuery: String, // Search term (for search activities)
    pageUrl: String, // URL of the page visited
    referrer: String, // Referrer URL
    metadata: mongoose.Schema.Types.Mixed // Additional metadata
  },
  location: {
    country: String,
    city: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  deviceInfo: {
    userAgent: String,
    browser: String,
    device: String,
    os: String,
    screenResolution: String,
    language: String
  },
  pointsEarned: {
    type: Number,
    default: 0
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  // Automatically delete old activities after 1 year
  expireAfterSeconds: 31536000 // 1 year in seconds
});

// Indexes for efficient queries
visitorActivitySchema.index({ userId: 1, timestamp: -1 });
visitorActivitySchema.index({ activityType: 1 });
visitorActivitySchema.index({ sessionId: 1 });
visitorActivitySchema.index({ timestamp: -1 });
visitorActivitySchema.index({ 'activityData.entityType': 1 });

// Static method to log activity
visitorActivitySchema.statics.logActivity = async function(data) {
  const activity = new this(data);
  await activity.save();
  
  // Update user profile stats if points were earned
  if (data.pointsEarned && data.pointsEarned > 0) {
    const VisitorProfile = require('./VisitorProfile');
    const profile = await VisitorProfile.findOne({ userId: data.userId });
    if (profile) {
      const levelUp = profile.addPoints(data.pointsEarned);
      await profile.updateStreak();
      await profile.save();
      
      if (levelUp) {
        // Log level up achievement
        await this.create({
          userId: data.userId,
          sessionId: data.sessionId,
          activityType: 'achievement_earned',
          activityData: {
            entityType: 'level',
            entityName: `Level ${profile.stats.level}`,
            metadata: { previousLevel: profile.stats.level - 1, newLevel: profile.stats.level }
          },
          pointsEarned: profile.stats.level * 100 // Bonus points for leveling up
        });
      }
    }
  }
  
  return activity;
};

// Static method to get user activity summary
visitorActivitySchema.statics.getUserActivitySummary = async function(userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const pipeline = [
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        timestamp: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$activityType',
        count: { $sum: 1 },
        totalPoints: { $sum: '$pointsEarned' },
        lastActivity: { $max: '$timestamp' }
      }
    },
    {
      $sort: { count: -1 }
    }
  ];
  
  return this.aggregate(pipeline);
};

// Static method to get daily activity stats
visitorActivitySchema.statics.getDailyActivityStats = async function(userId, days = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const pipeline = [
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        timestamp: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$timestamp' },
          month: { $month: '$timestamp' },
          day: { $dayOfMonth: '$timestamp' }
        },
        activities: { $sum: 1 },
        points: { $sum: '$pointsEarned' },
        uniqueTypes: { $addToSet: '$activityType' }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
    }
  ];
  
  return this.aggregate(pipeline);
};

module.exports = mongoose.model('VisitorActivity', visitorActivitySchema);
