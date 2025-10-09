const mongoose = require('mongoose');

const securitySettingsSchema = new mongoose.Schema({
  // Authentication Settings
  twoFactorAuth: {
    enabled: {
      type: Boolean,
      default: false
    },
    requiredForAdmins: {
      type: Boolean,
      default: true
    },
    requiredForUsers: {
      type: Boolean,
      default: false
    }
  },

  // Password Policy
  passwordPolicy: {
    minLength: {
      type: Number,
      default: 8
    },
    requireUppercase: {
      type: Boolean,
      default: true
    },
    requireLowercase: {
      type: Boolean,
      default: true
    },
    requireNumbers: {
      type: Boolean,
      default: true
    },
    requireSpecialChars: {
      type: Boolean,
      default: true
    },
    maxAge: {
      type: Number,
      default: 90 // days
    },
    preventReuse: {
      type: Number,
      default: 5 // last 5 passwords
    }
  },

  // Session Management
  sessionManagement: {
    timeout: {
      type: Number,
      default: 30 // minutes
    },
    maxConcurrentSessions: {
      type: Number,
      default: 3
    },
    extendOnActivity: {
      type: Boolean,
      default: true
    }
  },

  // IP Security
  ipSecurity: {
    whitelist: [{
      ip: String,
      description: String,
      addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      addedAt: {
        type: Date,
        default: Date.now
      }
    }],
    blacklist: [{
      ip: String,
      reason: String,
      addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      addedAt: {
        type: Date,
        default: Date.now
      }
    }],
    maxFailedAttempts: {
      type: Number,
      default: 5
    },
    lockoutDuration: {
      type: Number,
      default: 15 // minutes
    }
  },

  // API Security
  apiSecurity: {
    rateLimiting: {
      enabled: {
        type: Boolean,
        default: true
      },
      requestsPerMinute: {
        type: Number,
        default: 100
      },
      requestsPerHour: {
        type: Number,
        default: 1000
      }
    },
    apiKeyExpiration: {
      type: Number,
      default: 365 // days
    },
    requireApiKeyForSensitive: {
      type: Boolean,
      default: true
    }
  },

  // Data Security
  dataSecurity: {
    encryption: {
      enabled: {
        type: Boolean,
        default: true
      },
      algorithm: {
        type: String,
        default: 'AES-256-GCM'
      }
    },
    backupFrequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      default: 'daily'
    },
    backupRetention: {
      type: Number,
      default: 30 // days
    },
    dataAnonymization: {
      enabled: {
        type: Boolean,
        default: false
      },
      retentionPeriod: {
        type: Number,
        default: 2555 // days (7 years)
      }
    }
  },

  // Monitoring & Alerts
  monitoring: {
    enableSecurityAlerts: {
      type: Boolean,
      default: true
    },
    alertThresholds: {
      failedLogins: {
        type: Number,
        default: 5
      },
      suspiciousActivity: {
        type: Number,
        default: 3
      },
      apiAbuse: {
        type: Number,
        default: 10
      }
    },
    notificationChannels: [{
      type: {
        type: String,
        enum: ['email', 'sms', 'webhook']
      },
      config: {
        type: mongoose.Schema.Types.Mixed
      }
    }]
  },

  // System Status
  systemStatus: {
    sslCertificate: {
      valid: {
        type: Boolean,
        default: true
      },
      expiresAt: {
        type: Date
      },
      lastChecked: {
        type: Date,
        default: Date.now
      }
    },
    databaseEncryption: {
      enabled: {
        type: Boolean,
        default: true
      },
      lastVerified: {
        type: Date,
        default: Date.now
      }
    },
    lastBackup: {
      type: Date
    },
    nextBackup: {
      type: Date
    }
  },

  // Audit
  lastModified: {
    type: Date,
    default: Date.now
  },
  modifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  version: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

// Static methods
securitySettingsSchema.statics.getCurrentSettings = async function () {
  let settings = await this.findOne().sort({ createdAt: -1 });

  if (!settings) {
    // Create default settings if none exist
    settings = await this.create({});
  }

  return settings;
};

securitySettingsSchema.statics.updateSettings = async function (updates, modifiedBy) {
  const currentSettings = await this.getCurrentSettings();

  // Create new version
  const newSettings = new this({
    ...currentSettings.toObject(),
    ...updates,
    lastModified: new Date(),
    modifiedBy,
    version: currentSettings.version + 1
  });

  // Remove _id to create new document
  delete newSettings._id;

  return await newSettings.save();
};

securitySettingsSchema.statics.getSecurityStatus = async function () {
  const settings = await this.getCurrentSettings();
  const now = new Date();

  // Check SSL certificate status
  const sslStatus = settings.systemStatus.sslCertificate.valid &&
    (!settings.systemStatus.sslCertificate.expiresAt ||
      settings.systemStatus.sslCertificate.expiresAt > now);

  // Check backup status
  const backupStatus = settings.systemStatus.lastBackup &&
    (now - settings.systemStatus.lastBackup) < (24 * 60 * 60 * 1000); // 24 hours

  return {
    sslCertificate: sslStatus,
    databaseEncryption: settings.systemStatus.databaseEncryption.enabled,
    apiRateLimiting: settings.apiSecurity.rateLimiting.enabled,
    backupStatus: backupStatus,
    twoFactorAuth: settings.twoFactorAuth.enabled,
    lastBackup: settings.systemStatus.lastBackup,
    nextBackup: settings.systemStatus.nextBackup
  };
};

module.exports = mongoose.model('SecuritySettings', securitySettingsSchema);




