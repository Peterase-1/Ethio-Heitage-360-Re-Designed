const mongoose = require('mongoose');

const museumSettingsSchema = new mongoose.Schema({
  museumId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Museum',
    required: true,
    unique: true
  },

  // Notification Settings
  notifications: {
    email: {
      type: Boolean,
      default: true
    },
    sms: {
      type: Boolean,
      default: false
    },
    push: {
      type: Boolean,
      default: true
    },
    eventReminders: {
      type: Boolean,
      default: true
    },
    staffUpdates: {
      type: Boolean,
      default: true
    },
    systemAlerts: {
      type: Boolean,
      default: true
    }
  },

  // Security Settings
  security: {
    twoFactor: {
      type: Boolean,
      default: false
    },
    sessionTimeout: {
      type: Number,
      default: 30,
      min: 5,
      max: 480 // 8 hours max
    },
    passwordExpiry: {
      type: Number,
      default: 90,
      min: 30,
      max: 365
    },
    loginAttempts: {
      type: Number,
      default: 5,
      min: 3,
      max: 10
    },
    ipWhitelist: [{
      ip: {
        type: String,
        required: true,
        validate: {
          validator: function (v) {
            // Basic IP validation regex
            return /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(v);
          },
          message: 'Invalid IP address format'
        }
      },
      description: {
        type: String,
        maxlength: 100
      },
      addedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },

  // General Settings
  general: {
    language: {
      type: String,
      default: 'en',
      enum: ['en', 'am', 'fr', 'ar']
    },
    timezone: {
      type: String,
      default: 'Africa/Addis_Ababa'
    },
    theme: {
      type: String,
      default: 'light',
      enum: ['light', 'dark', 'auto']
    },
    dateFormat: {
      type: String,
      default: 'MM/DD/YYYY',
      enum: ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD']
    },
    currency: {
      type: String,
      default: 'USD',
      enum: ['USD', 'ETB', 'EUR', 'GBP']
    }
  },

  // Museum-specific Settings
  museum: {
    autoBackup: {
      type: Boolean,
      default: true
    },
    backupFrequency: {
      type: String,
      default: 'daily',
      enum: ['hourly', 'daily', 'weekly', 'monthly']
    },
    dataRetention: {
      type: Number,
      default: 365,
      min: 30,
      max: 2555 // ~7 years
    },
    analyticsEnabled: {
      type: Boolean,
      default: true
    },
    publicProfile: {
      type: Boolean,
      default: true
    }
  },

  // Audit fields
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lastModifiedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for faster queries
museumSettingsSchema.index({ museumId: 1 });

// Pre-save middleware to update lastModifiedAt
museumSettingsSchema.pre('save', function (next) {
  this.lastModifiedAt = new Date();
  next();
});

// Static method to get or create settings for a museum
museumSettingsSchema.statics.getOrCreateSettings = async function (museumId) {
  let settings = await this.findOne({ museumId });

  if (!settings) {
    settings = new this({ museumId });
    await settings.save();
  }

  return settings;
};

// Instance method to update specific settings category
museumSettingsSchema.methods.updateCategory = async function (category, updates) {
  this[category] = { ...this[category], ...updates };
  this.lastModifiedAt = new Date();
  return await this.save();
};

// Instance method to add IP to whitelist
museumSettingsSchema.methods.addToWhitelist = async function (ip, description = '') {
  // Check if IP already exists
  const existingIp = this.security.ipWhitelist.find(item => item.ip === ip);
  if (existingIp) {
    throw new Error('IP address already exists in whitelist');
  }

  this.security.ipWhitelist.push({
    ip,
    description,
    addedAt: new Date()
  });

  return await this.save();
};

// Instance method to remove IP from whitelist
museumSettingsSchema.methods.removeFromWhitelist = async function (ip) {
  this.security.ipWhitelist = this.security.ipWhitelist.filter(item => item.ip !== ip);
  return await this.save();
};

module.exports = mongoose.model('MuseumSettings', museumSettingsSchema);
