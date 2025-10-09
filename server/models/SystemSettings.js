const mongoose = require('mongoose');

const systemSettingsSchema = new mongoose.Schema({
  // Platform Configuration
  platform: {
    name: {
      type: String,
      default: 'Ethiopian Heritage 360'
    },
    description: {
      type: String,
      default: 'Digital platform for Ethiopian cultural heritage management'
    },
    version: {
      type: String,
      default: '1.0.0'
    },
    defaultLanguage: {
      type: String,
      enum: ['en', 'am', 'om'],
      default: 'en'
    },
    supportedLanguages: [{
      type: String,
      enum: ['en', 'am', 'om']
    }],
    maxUploadSize: {
      type: Number,
      default: 50 // MB
    },
    allowedFileTypes: [{
      type: String,
      enum: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'mp4', 'avi', 'mov']
    }]
  },

  // Rental System Settings
  rentalSystem: {
    defaultRentalPeriod: {
      type: Number,
      default: 30 // days
    },
    securityDepositPercentage: {
      type: Number,
      default: 20,
      min: 0,
      max: 100
    },
    lateFeePerDay: {
      type: Number,
      default: 100 // ETB
    },
    maxRentalDuration: {
      type: Number,
      default: 90 // days
    },
    autoApprovalThreshold: {
      type: Number,
      default: 7 // days
    },
    requireInsurance: {
      type: Boolean,
      default: true
    }
  },

  // Email Notification Settings
  emailNotifications: {
    newUserRegistrations: {
      type: Boolean,
      default: true
    },
    artifactApprovals: {
      type: Boolean,
      default: true
    },
    rentalActivities: {
      type: Boolean,
      default: true
    },
    weeklyReports: {
      type: Boolean,
      default: false
    },
    systemAlerts: {
      type: Boolean,
      default: true
    },
    securityAlerts: {
      type: Boolean,
      default: true
    },
    maintenanceNotifications: {
      type: Boolean,
      default: true
    }
  },

  // Security Settings
  security: {
    sessionTimeout: {
      type: Number,
      default: 30 // minutes
    },
    maxLoginAttempts: {
      type: Number,
      default: 5
    },
    lockoutDuration: {
      type: Number,
      default: 15 // minutes
    },
    requireTwoFactor: {
      type: Boolean,
      default: false
    },
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
      }
    }
  },

  // API Settings
  apiSettings: {
    rateLimitPerMinute: {
      type: Number,
      default: 100
    },
    rateLimitPerHour: {
      type: Number,
      default: 1000
    },
    apiKeyExpiration: {
      type: Number,
      default: 365 // days
    },
    enableCORS: {
      type: Boolean,
      default: true
    },
    allowedOrigins: [{
      type: String
    }]
  },

  // Maintenance Settings
  maintenance: {
    enableMaintenanceMode: {
      type: Boolean,
      default: false
    },
    maintenanceMessage: {
      type: String,
      default: 'System is under maintenance. Please try again later.'
    },
    scheduledMaintenance: {
      enabled: {
        type: Boolean,
        default: false
      },
      startTime: {
        type: Date
      },
      endTime: {
        type: Date
      },
      frequency: {
        type: String,
        enum: ['weekly', 'monthly', 'quarterly'],
        default: 'monthly'
      }
    },
    backupSettings: {
      frequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly'],
        default: 'daily'
      },
      retentionDays: {
        type: Number,
        default: 30
      },
      autoBackup: {
        type: Boolean,
        default: true
      }
    }
  },

  // Theme and Branding
  branding: {
    primaryColor: {
      type: String,
      default: '#3B82F6'
    },
    secondaryColor: {
      type: String,
      default: '#1E40AF'
    },
    logoUrl: {
      type: String
    },
    faviconUrl: {
      type: String
    },
    customCSS: {
      type: String
    }
  },

  // Analytics Settings
  analytics: {
    enableGoogleAnalytics: {
      type: Boolean,
      default: false
    },
    googleAnalyticsId: {
      type: String
    },
    enableCustomAnalytics: {
      type: Boolean,
      default: true
    },
    trackUserBehavior: {
      type: Boolean,
      default: true
    },
    dataRetentionDays: {
      type: Number,
      default: 365
    }
  },

  // Feature Flags
  features: {
    enableVirtualMuseum: {
      type: Boolean,
      default: true
    },
    enableRentalSystem: {
      type: Boolean,
      default: true
    },
    enableEducationalContent: {
      type: Boolean,
      default: true
    },
    enableUserRegistration: {
      type: Boolean,
      default: true
    },
    enablePublicAPI: {
      type: Boolean,
      default: false
    },
    enableSocialLogin: {
      type: Boolean,
      default: false
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
systemSettingsSchema.statics.getCurrentSettings = async function () {
  let settings = await this.findOne().sort({ createdAt: -1 });

  if (!settings) {
    // Create default settings if none exist
    settings = await this.create({});
  }

  return settings;
};

systemSettingsSchema.statics.updateSettings = async function (updates, modifiedBy) {
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

systemSettingsSchema.statics.getPublicSettings = async function () {
  const settings = await this.getCurrentSettings();

  // Return only public settings
  return {
    platform: {
      name: settings.platform.name,
      description: settings.platform.description,
      version: settings.platform.version,
      defaultLanguage: settings.platform.defaultLanguage,
      supportedLanguages: settings.platform.supportedLanguages
    },
    features: settings.features,
    branding: {
      primaryColor: settings.branding.primaryColor,
      secondaryColor: settings.branding.secondaryColor,
      logoUrl: settings.branding.logoUrl
    }
  };
};

systemSettingsSchema.statics.resetToDefaults = async function () {
  return this.deleteMany({});
};

module.exports = mongoose.model('SystemSettings', systemSettingsSchema);