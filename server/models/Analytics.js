const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: [
      'daily_stats',
      'monthly_stats', 
      'user_activity',
      'artifact_views',
      'museum_visits',
      'rental_activity',
      'tour_bookings',
      'platform_usage'
    ],
    required: true,
    index: true
  },
  museum: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Museum',
    index: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  
  // General platform metrics
  platformStats: {
    totalUsers: { type: Number, default: 0 },
    activeUsers: { type: Number, default: 0 },
    newUsers: { type: Number, default: 0 },
    totalMuseums: { type: Number, default: 0 },
    activeMuseums: { type: Number, default: 0 },
    totalArtifacts: { type: Number, default: 0 },
    publishedArtifacts: { type: Number, default: 0 },
    totalRentals: { type: Number, default: 0 },
    activeRentals: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    currency: { type: String, default: 'ETB' }
  },

  // User activity metrics
  userActivity: {
    logins: { type: Number, default: 0 },
    registrations: { type: Number, default: 0 },
    profileUpdates: { type: Number, default: 0 },
    searches: { type: Number, default: 0 },
    bookmarks: { type: Number, default: 0 },
    reviews: { type: Number, default: 0 },
    shares: { type: Number, default: 0 }
  },

  // Artifact metrics
  artifactMetrics: {
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    downloads: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    rentalsRequested: { type: Number, default: 0 },
    averageViewDuration: { type: Number, default: 0 } // in seconds
  },

  // Museum metrics
  museumMetrics: {
    visits: { type: Number, default: 0 },
    uniqueVisitors: { type: Number, default: 0 },
    virtualTours: { type: Number, default: 0 },
    tourBookings: { type: Number, default: 0 },
    averageVisitDuration: { type: Number, default: 0 }, // in minutes
    artifactsAdded: { type: Number, default: 0 },
    artifactsPublished: { type: Number, default: 0 },
    rating: { type: Number, min: 0, max: 5 },
    reviews: { type: Number, default: 0 }
  },

  // Rental metrics
  rentalMetrics: {
    requests: { type: Number, default: 0 },
    approved: { type: Number, default: 0 },
    rejected: { type: Number, default: 0 },
    active: { type: Number, default: 0 },
    completed: { type: Number, default: 0 },
    overdue: { type: Number, default: 0 },
    cancelled: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
    averageDuration: { type: Number, default: 0 }, // in days
    averageValue: { type: Number, default: 0 }
  },

  // Geographic data
  geographic: {
    country: String,
    region: String,
    city: String,
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        index: '2dsphere'
      }
    }
  },

  // Device and browser info
  technical: {
    device: {
      type: String,
      enum: ['desktop', 'mobile', 'tablet'],
      default: 'desktop'
    },
    browser: String,
    operatingSystem: String,
    screenResolution: String,
    language: String
  },

  // Traffic sources
  traffic: {
    source: {
      type: String,
      enum: ['direct', 'search', 'social', 'referral', 'email', 'ads'],
      default: 'direct'
    },
    medium: String,
    campaign: String,
    keyword: String,
    referrer: String
  },

  // Custom events
  events: [{
    name: String,
    category: String,
    action: String,
    label: String,
    value: Number,
    timestamp: { type: Date, default: Date.now }
  }],

  // Additional metadata
  metadata: {
    sessionId: String,
    userAgent: String,
    ipAddress: String,
    duration: Number, // session duration in seconds
    pageViews: Number,
    bounceRate: Number
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
analyticsSchema.index({ date: 1, type: 1 });
analyticsSchema.index({ museum: 1, date: 1 });
analyticsSchema.index({ user: 1, date: 1 });
analyticsSchema.index({ type: 1, createdAt: -1 });
analyticsSchema.index({ 'geographic.coordinates': '2dsphere' });

// Static methods for analytics queries
analyticsSchema.statics.getDailyStats = function(date, museum = null) {
  const query = {
    date: {
      $gte: new Date(date.setHours(0, 0, 0, 0)),
      $lt: new Date(date.setHours(23, 59, 59, 999))
    },
    type: 'daily_stats'
  };
  
  if (museum) query.museum = museum;
  
  return this.find(query);
};

analyticsSchema.statics.getMonthlyStats = function(year, month, museum = null) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);
  
  const query = {
    date: { $gte: startDate, $lte: endDate },
    type: 'monthly_stats'
  };
  
  if (museum) query.museum = museum;
  
  return this.find(query);
};

analyticsSchema.statics.getTopArtifacts = function(limit = 10, museum = null, dateRange = null) {
  const matchStage = { type: 'artifact_views' };
  
  if (museum) matchStage.museum = mongoose.Types.ObjectId(museum);
  if (dateRange) {
    matchStage.date = {
      $gte: new Date(dateRange.start),
      $lte: new Date(dateRange.end)
    };
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$artifact',
        totalViews: { $sum: '$artifactMetrics.views' },
        totalLikes: { $sum: '$artifactMetrics.likes' },
        totalShares: { $sum: '$artifactMetrics.shares' }
      }
    },
    { $sort: { totalViews: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'artifacts',
        localField: '_id',
        foreignField: '_id',
        as: 'artifact'
      }
    }
  ]);
};

analyticsSchema.statics.getUserEngagement = function(dateRange, museum = null) {
  const matchStage = {
    type: 'user_activity',
    date: {
      $gte: new Date(dateRange.start),
      $lte: new Date(dateRange.end)
    }
  };
  
  if (museum) matchStage.museum = mongoose.Types.ObjectId(museum);
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalLogins: { $sum: '$userActivity.logins' },
        totalSearches: { $sum: '$userActivity.searches' },
        totalBookmarks: { $sum: '$userActivity.bookmarks' },
        totalReviews: { $sum: '$userActivity.reviews' },
        totalShares: { $sum: '$userActivity.shares' },
        uniqueUsers: { $addToSet: '$user' }
      }
    },
    {
      $project: {
        totalLogins: 1,
        totalSearches: 1,
        totalBookmarks: 1,
        totalReviews: 1,
        totalShares: 1,
        uniqueUsers: { $size: '$uniqueUsers' }
      }
    }
  ]);
};

analyticsSchema.statics.getRevenueStats = function(dateRange, museum = null) {
  const matchStage = {
    type: 'rental_activity',
    date: {
      $gte: new Date(dateRange.start),
      $lte: new Date(dateRange.end)
    }
  };
  
  if (museum) matchStage.museum = mongoose.Types.ObjectId(museum);
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
        dailyRevenue: { $sum: '$rentalMetrics.revenue' },
        totalRentals: { $sum: '$rentalMetrics.completed' }
      }
    },
    { $sort: { _id: 1 } }
  ]);
};

// Instance methods
analyticsSchema.methods.addEvent = function(eventData) {
  this.events.push(eventData);
  return this.save();
};

module.exports = mongoose.model('Analytics', analyticsSchema);
