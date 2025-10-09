const mongoose = require('mongoose');

const userSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    required: false
  },
  location: {
    country: String,
    city: String,
    region: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  deviceInfo: {
    type: {
      type: String
    },
    browser: String,
    os: String,
    isMobile: Boolean
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true
  },
  loginMethod: {
    type: String,
    enum: ['password', 'oauth', 'sso', 'api_key'],
    default: 'password'
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Indexes for performance
userSessionSchema.index({ userId: 1, isActive: 1 });
userSessionSchema.index({ sessionId: 1 });
userSessionSchema.index({ ipAddress: 1 });
userSessionSchema.index({ lastActivity: -1 });
userSessionSchema.index({ expiresAt: 1 });
userSessionSchema.index({ createdAt: -1 });

// Static methods
userSessionSchema.statics.getActiveSessions = async function () {
  const now = new Date();
  return await this.find({
    isActive: true,
    expiresAt: { $gt: now }
  }).populate('userId', 'name email role');
};

userSessionSchema.statics.getSessionStats = async function () {
  const now = new Date();
  const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalActiveSessions,
    sessionsLast24Hours,
    sessionsLast7Days,
    uniqueUsers,
    sessionsByLocation
  ] = await Promise.all([
    this.countDocuments({
      isActive: true,
      expiresAt: { $gt: now }
    }),
    this.countDocuments({
      createdAt: { $gte: last24Hours }
    }),
    this.countDocuments({
      createdAt: { $gte: last7Days }
    }),
    this.distinct('userId', {
      isActive: true,
      expiresAt: { $gt: now }
    }),
    this.aggregate([
      { $match: { isActive: true, expiresAt: { $gt: now } } },
      {
        $group: {
          _id: '$location.country',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ])
  ]);

  return {
    totalActiveSessions,
    sessionsLast24Hours,
    sessionsLast7Days,
    uniqueUsers: uniqueUsers.length,
    sessionsByLocation
  };
};

userSessionSchema.statics.cleanupExpiredSessions = async function () {
  const now = new Date();
  return await this.updateMany(
    { expiresAt: { $lt: now } },
    { isActive: false }
  );
};

// Instance methods
userSessionSchema.methods.extendSession = function (additionalTime = 30 * 60 * 1000) { // 30 minutes default
  this.expiresAt = new Date(Date.now() + additionalTime);
  this.lastActivity = new Date();
  return this.save();
};

userSessionSchema.methods.terminate = function () {
  this.isActive = false;
  return this.save();
};

module.exports = mongoose.model('UserSession', userSessionSchema);
