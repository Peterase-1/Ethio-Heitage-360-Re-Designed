const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  // Action details
  action: {
    type: String,
    required: true,
    enum: [
      'user_created',
      'user_updated',
      'user_deleted',
      'user_verified',
      'museum_approved',
      'museum_rejected',
      'museum_suspended',
      'heritage_site_created',
      'heritage_site_updated',
      'heritage_site_deleted',
      'artifact_approved',
      'artifact_rejected',
      'rental_approved',
      'rental_rejected',
      'system_setting_changed',
      'bulk_operation',
      'export_data',
      'import_data',
      'login',
      'logout',
      'password_changed',
      'role_changed',
      'permission_changed'
    ]
  },

  // User who performed the action
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Target entity (what was affected)
  targetEntity: {
    type: {
      type: String,
      enum: ['user', 'museum', 'heritage_site', 'artifact', 'rental', 'system_setting', 'bulk_operation']
    },
    id: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'targetEntity.type'
    },
    name: String // Human-readable name for the target
  },

  // Action details
  details: {
    description: String,
    changes: mongoose.Schema.Types.Mixed, // Before/after values
    reason: String,
    metadata: mongoose.Schema.Types.Mixed // Additional context
  },

  // Request information
  requestInfo: {
    ipAddress: String,
    userAgent: String,
    endpoint: String,
    method: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  },

  // Result information
  result: {
    success: {
      type: Boolean,
      required: true
    },
    errorMessage: String,
    responseTime: Number, // in milliseconds
    statusCode: Number
  },

  // Security and compliance
  security: {
    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'low'
    },
    requiresReview: {
      type: Boolean,
      default: false
    },
    complianceFlags: [String]
  },

  // Additional context
  context: {
    sessionId: String,
    correlationId: String,
    tags: [String],
    notes: String
  }
}, {
  timestamps: true,
  collection: 'audit_logs'
});

// Indexes for efficient querying
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ performedBy: 1, timestamp: -1 });
auditLogSchema.index({ 'targetEntity.type': 1, 'targetEntity.id': 1 });
auditLogSchema.index({ 'requestInfo.timestamp': -1 });
auditLogSchema.index({ 'security.riskLevel': 1 });
auditLogSchema.index({ 'result.success': 1 });

// Static methods for common queries
auditLogSchema.statics.getUserActivity = function (userId, limit = 50) {
  return this.find({ performedBy: userId })
    .sort({ timestamp: -1 })
    .limit(limit)
    .populate('performedBy', 'name email role');
};

auditLogSchema.statics.getEntityHistory = function (entityType, entityId, limit = 50) {
  return this.find({
    'targetEntity.type': entityType,
    'targetEntity.id': entityId
  })
    .sort({ timestamp: -1 })
    .limit(limit)
    .populate('performedBy', 'name email role');
};

auditLogSchema.statics.getSecurityEvents = function (riskLevel = 'medium', limit = 100) {
  return this.find({
    'security.riskLevel': { $gte: riskLevel }
  })
    .sort({ timestamp: -1 })
    .limit(limit)
    .populate('performedBy', 'name email role');
};

auditLogSchema.statics.getAuditSummary = function (startDate, endDate) {
  const matchStage = {
    timestamp: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    }
  };

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalActions: { $sum: 1 },
        successfulActions: {
          $sum: { $cond: ['$result.success', 1, 0] }
        },
        failedActions: {
          $sum: { $cond: ['$result.success', 0, 1] }
        },
        actionsByType: {
          $push: {
            action: '$action',
            success: '$result.success',
            riskLevel: '$security.riskLevel'
          }
        },
        uniqueUsers: { $addToSet: '$performedBy' },
        avgResponseTime: { $avg: '$result.responseTime' }
      }
    },
    {
      $project: {
        totalActions: 1,
        successfulActions: 1,
        failedActions: 1,
        successRate: {
          $multiply: [
            { $divide: ['$successfulActions', '$totalActions'] },
            100
          ]
        },
        uniqueUserCount: { $size: '$uniqueUsers' },
        avgResponseTime: { $round: ['$avgResponseTime', 2] },
        actionsByType: 1
      }
    }
  ]);
};

// Instance methods
auditLogSchema.methods.markForReview = function (reason) {
  this.security.requiresReview = true;
  this.context.notes = reason;
  return this.save();
};

auditLogSchema.methods.addComplianceFlag = function (flag) {
  if (!this.security.complianceFlags.includes(flag)) {
    this.security.complianceFlags.push(flag);
  }
  return this.save();
};

// Pre-save middleware for automatic risk assessment
auditLogSchema.pre('save', function (next) {
  // Auto-assess risk level based on action type
  const highRiskActions = [
    'user_deleted',
    'museum_suspended',
    'heritage_site_deleted',
    'system_setting_changed',
    'role_changed',
    'permission_changed'
  ];

  const mediumRiskActions = [
    'user_updated',
    'museum_rejected',
    'artifact_rejected',
    'rental_rejected',
    'bulk_operation'
  ];

  if (highRiskActions.includes(this.action)) {
    this.security.riskLevel = 'high';
    this.security.requiresReview = true;
  } else if (mediumRiskActions.includes(this.action)) {
    this.security.riskLevel = 'medium';
  }

  // Auto-assess based on result
  if (!this.result.success) {
    this.security.riskLevel = 'high';
    this.security.requiresReview = true;
  }

  next();
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
