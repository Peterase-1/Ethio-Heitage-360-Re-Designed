const mongoose = require('mongoose');

const toolUsageSchema = new mongoose.Schema({
  toolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tool',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false, // Allow anonymous usage tracking
    index: true
  },
  sessionId: {
    type: String,
    required: false, // For anonymous session tracking
    index: true
  },
  userAgent: {
    type: String,
    maxlength: 500
  },
  ipAddress: {
    type: String,
    maxlength: 45 // IPv6 max length
  },
  usedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  duration: {
    type: Number, // Usage duration in seconds
    default: 0
  },
  actions: [{
    action: String, // e.g., 'opened', 'used_feature', 'completed'
    timestamp: { type: Date, default: Date.now },
    details: mongoose.Schema.Types.Mixed
  }],
  referrer: {
    type: String,
    maxlength: 500
  },
  device: {
    type: {
      type: String,
      enum: ['desktop', 'mobile', 'tablet'],
      default: 'desktop'
    },
    browser: String,
    os: String,
    screen: {
      width: Number,
      height: Number
    }
  },
  location: {
    country: String,
    region: String,
    city: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  successful: {
    type: Boolean,
    default: true
  },
  errorMessage: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true
});

// Indexes for analytics queries
toolUsageSchema.index({ toolId: 1, usedAt: -1 });
toolUsageSchema.index({ userId: 1, usedAt: -1 });
toolUsageSchema.index({ usedAt: -1 });

// TTL index to automatically delete old usage records (optional, keep for 2 years)
toolUsageSchema.index({ usedAt: 1 }, { expireAfterSeconds: 730 * 24 * 60 * 60 });

// Static method to get usage stats for a tool
toolUsageSchema.statics.getToolStats = function(toolId, startDate, endDate) {
  const matchQuery = { toolId: new mongoose.Types.ObjectId(toolId) };
  
  if (startDate && endDate) {
    matchQuery.usedAt = { $gte: startDate, $lte: endDate };
  } else if (startDate) {
    matchQuery.usedAt = { $gte: startDate };
  } else if (endDate) {
    matchQuery.usedAt = { $lte: endDate };
  }
  
  return this.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: null,
        totalUsage: { $sum: 1 },
        uniqueUsers: { $addToSet: '$userId' },
        uniqueSessions: { $addToSet: '$sessionId' },
        avgDuration: { $avg: '$duration' },
        totalDuration: { $sum: '$duration' },
        successfulUsage: { $sum: { $cond: ['$successful', 1, 0] } }
      }
    },
    {
      $project: {
        totalUsage: 1,
        uniqueUsers: { $size: '$uniqueUsers' },
        uniqueSessions: { $size: '$uniqueSessions' },
        avgDuration: { $round: ['$avgDuration', 2] },
        totalDuration: 1,
        successfulUsage: 1,
        successRate: { 
          $round: [
            { $multiply: [{ $divide: ['$successfulUsage', '$totalUsage'] }, 100] }, 
            2
          ] 
        }
      }
    }
  ]);
};

// Static method to get usage over time
toolUsageSchema.statics.getUsageOverTime = function(toolId, startDate, endDate, groupBy = 'day') {
  const matchQuery = { toolId: new mongoose.Types.ObjectId(toolId) };
  
  if (startDate && endDate) {
    matchQuery.usedAt = { $gte: startDate, $lte: endDate };
  }
  
  let groupId;
  switch (groupBy) {
    case 'hour':
      groupId = {
        year: { $year: '$usedAt' },
        month: { $month: '$usedAt' },
        day: { $dayOfMonth: '$usedAt' },
        hour: { $hour: '$usedAt' }
      };
      break;
    case 'day':
      groupId = {
        year: { $year: '$usedAt' },
        month: { $month: '$usedAt' },
        day: { $dayOfMonth: '$usedAt' }
      };
      break;
    case 'week':
      groupId = {
        year: { $year: '$usedAt' },
        week: { $week: '$usedAt' }
      };
      break;
    case 'month':
      groupId = {
        year: { $year: '$usedAt' },
        month: { $month: '$usedAt' }
      };
      break;
    default:
      groupId = {
        year: { $year: '$usedAt' },
        month: { $month: '$usedAt' },
        day: { $dayOfMonth: '$usedAt' }
      };
  }
  
  return this.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: groupId,
        usage: { $sum: 1 },
        uniqueUsers: { $addToSet: '$userId' }
      }
    },
    {
      $project: {
        _id: 1,
        usage: 1,
        uniqueUsers: { $size: '$uniqueUsers' }
      }
    },
    { $sort: { _id: 1 } }
  ]);
};

// Static method to get top users for a tool
toolUsageSchema.statics.getTopUsers = function(toolId, limit = 10) {
  return this.aggregate([
    { 
      $match: { 
        toolId: new mongoose.Types.ObjectId(toolId),
        userId: { $ne: null }
      } 
    },
    {
      $group: {
        _id: '$userId',
        usageCount: { $sum: 1 },
        totalDuration: { $sum: '$duration' },
        lastUsed: { $max: '$usedAt' }
      }
    },
    { $sort: { usageCount: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user'
      }
    },
    {
      $project: {
        usageCount: 1,
        totalDuration: 1,
        lastUsed: 1,
        userName: { 
          $concat: [
            { $arrayElemAt: ['$user.firstName', 0] },
            ' ',
            { $arrayElemAt: ['$user.lastName', 0] }
          ]
        },
        userEmail: { $arrayElemAt: ['$user.email', 0] }
      }
    }
  ]);
};

// Instance method to add action
toolUsageSchema.methods.addAction = function(action, details = {}) {
  this.actions.push({
    action: action,
    timestamp: new Date(),
    details: details
  });
  return this.save();
};

// Pre-save middleware to extract device info from user agent
toolUsageSchema.pre('save', function(next) {
  if (this.isNew && this.userAgent) {
    // Simple device detection (in production, use a proper library like 'ua-parser-js')
    const ua = this.userAgent.toLowerCase();
    
    if (ua.includes('mobile')) {
      this.device.type = 'mobile';
    } else if (ua.includes('tablet') || ua.includes('ipad')) {
      this.device.type = 'tablet';
    } else {
      this.device.type = 'desktop';
    }
    
    // Extract browser info
    if (ua.includes('chrome')) {
      this.device.browser = 'Chrome';
    } else if (ua.includes('firefox')) {
      this.device.browser = 'Firefox';
    } else if (ua.includes('safari')) {
      this.device.browser = 'Safari';
    } else if (ua.includes('edge')) {
      this.device.browser = 'Edge';
    } else {
      this.device.browser = 'Other';
    }
    
    // Extract OS info
    if (ua.includes('windows')) {
      this.device.os = 'Windows';
    } else if (ua.includes('mac')) {
      this.device.os = 'macOS';
    } else if (ua.includes('linux')) {
      this.device.os = 'Linux';
    } else if (ua.includes('android')) {
      this.device.os = 'Android';
    } else if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad')) {
      this.device.os = 'iOS';
    } else {
      this.device.os = 'Other';
    }
  }
  
  next();
});

module.exports = mongoose.model('ToolUsage', toolUsageSchema);
