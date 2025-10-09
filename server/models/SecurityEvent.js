const mongoose = require('mongoose');

const securityEventSchema = new mongoose.Schema({
  eventType: {
    type: String,
    required: true,
    enum: [
      'login_success',
      'login_failed',
      'logout',
      'password_change',
      'account_locked',
      'account_unlocked',
      'permission_denied',
      'suspicious_activity',
      'api_rate_limit_exceeded',
      'unauthorized_access',
      'data_export',
      'data_import',
      'system_backup',
      'system_restore',
      'configuration_change',
      'user_creation',
      'user_deletion',
      'role_change',
      'session_timeout',
      'ip_blocked',
      'ip_unblocked'
    ]
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Some events might not have a user (e.g., system events)
  },
  userEmail: {
    type: String,
    required: false
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
    region: String
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['success', 'failed', 'blocked', 'warning'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  resolved: {
    type: Boolean,
    default: false
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolvedAt: {
    type: Date
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes for performance
securityEventSchema.index({ eventType: 1, createdAt: -1 });
securityEventSchema.index({ userId: 1, createdAt: -1 });
securityEventSchema.index({ ipAddress: 1, createdAt: -1 });
securityEventSchema.index({ status: 1, createdAt: -1 });
securityEventSchema.index({ severity: 1, createdAt: -1 });
securityEventSchema.index({ resolved: 1, createdAt: -1 });

// Static methods
securityEventSchema.statics.getSecurityStats = async function () {
  const now = new Date();
  const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalEvents,
    last24HoursEvents,
    last7DaysEvents,
    last30DaysEvents,
    failedLogins,
    suspiciousActivity,
    criticalEvents,
    recentEvents
  ] = await Promise.all([
    this.countDocuments(),
    this.countDocuments({ createdAt: { $gte: last24Hours } }),
    this.countDocuments({ createdAt: { $gte: last7Days } }),
    this.countDocuments({ createdAt: { $gte: last30Days } }),
    this.countDocuments({
      eventType: 'login_failed',
      createdAt: { $gte: last24Hours }
    }),
    this.countDocuments({
      eventType: 'suspicious_activity',
      createdAt: { $gte: last24Hours }
    }),
    this.countDocuments({
      severity: 'critical',
      createdAt: { $gte: last7Days }
    }),
    this.find({})
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean()
  ]);

  return {
    totalEvents,
    last24HoursEvents,
    last7DaysEvents,
    last30DaysEvents,
    failedLogins,
    suspiciousActivity,
    criticalEvents,
    recentEvents
  };
};

securityEventSchema.statics.getEventTypesStats = async function () {
  const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  return await this.aggregate([
    { $match: { createdAt: { $gte: last30Days } } },
    {
      $group: {
        _id: '$eventType',
        count: { $sum: 1 },
        lastOccurrence: { $max: '$createdAt' }
      }
    },
    { $sort: { count: -1 } }
  ]);
};

module.exports = mongoose.model('SecurityEvent', securityEventSchema);




