const mongoose = require('mongoose');

const systemSettingsSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    enum: [
      'general',
      'branding',
      'security',
      'notifications',
      'payments',
      'features',
      'api',
      'analytics',
      'maintenance'
    ],
    index: true
  },
  key: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  dataType: {
    type: String,
    enum: ['string', 'number', 'boolean', 'object', 'array'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  isPublic: {
    type: Boolean,
    default: false // whether this setting can be accessed by non-admin users
  },
  isEditable: {
    type: Boolean,
    default: true
  },
  validation: {
    required: { type: Boolean, default: false },
    min: Number,
    max: Number,
    minLength: Number,
    maxLength: Number,
    pattern: String,
    options: [mongoose.Schema.Types.Mixed] // for enum-like validation
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  version: {
    type: Number,
    default: 1
  },
  history: [{
    value: mongoose.Schema.Types.Mixed,
    modifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    modifiedAt: {
      type: Date,
      default: Date.now
    },
    reason: String
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound index for category and key
systemSettingsSchema.index({ category: 1, key: 1 });

// Static methods
systemSettingsSchema.statics.getSetting = function(key) {
  return this.findOne({ key });
};

systemSettingsSchema.statics.getSettingValue = async function(key, defaultValue = null) {
  const setting = await this.findOne({ key });
  return setting ? setting.value : defaultValue;
};

systemSettingsSchema.statics.getSettingsByCategory = function(category) {
  return this.find({ category }).sort({ key: 1 });
};

systemSettingsSchema.statics.getPublicSettings = function() {
  return this.find({ isPublic: true }).select('key value dataType description');
};

systemSettingsSchema.statics.setSetting = async function(key, value, userId, reason = '') {
  const setting = await this.findOne({ key });
  
  if (!setting) {
    throw new Error(`Setting ${key} not found`);
  }
  
  if (!setting.isEditable) {
    throw new Error(`Setting ${key} is not editable`);
  }
  
  // Add to history
  setting.history.push({
    value: setting.value,
    modifiedBy: userId,
    reason
  });
  
  // Update setting
  setting.value = value;
  setting.lastModifiedBy = userId;
  setting.version += 1;
  
  return setting.save();
};

systemSettingsSchema.statics.createSetting = function(data) {
  return this.create(data);
};

systemSettingsSchema.statics.deleteSetting = function(key) {
  return this.findOneAndDelete({ key });
};

// Instance methods
systemSettingsSchema.methods.updateValue = function(value, userId, reason = '') {
  if (!this.isEditable) {
    throw new Error(`Setting ${this.key} is not editable`);
  }
  
  // Add to history
  this.history.push({
    value: this.value,
    modifiedBy: userId,
    reason
  });
  
  // Update setting
  this.value = value;
  this.lastModifiedBy = userId;
  this.version += 1;
  
  return this.save();
};

systemSettingsSchema.methods.validateValue = function(value) {
  const validation = this.validation;
  
  if (validation.required && (value === null || value === undefined || value === '')) {
    return { valid: false, error: 'Value is required' };
  }
  
  if (this.dataType === 'number') {
    if (isNaN(value)) {
      return { valid: false, error: 'Value must be a number' };
    }
    if (validation.min !== undefined && value < validation.min) {
      return { valid: false, error: `Value must be at least ${validation.min}` };
    }
    if (validation.max !== undefined && value > validation.max) {
      return { valid: false, error: `Value must be at most ${validation.max}` };
    }
  }
  
  if (this.dataType === 'string') {
    if (validation.minLength && value.length < validation.minLength) {
      return { valid: false, error: `Value must be at least ${validation.minLength} characters` };
    }
    if (validation.maxLength && value.length > validation.maxLength) {
      return { valid: false, error: `Value must be at most ${validation.maxLength} characters` };
    }
    if (validation.pattern) {
      const regex = new RegExp(validation.pattern);
      if (!regex.test(value)) {
        return { valid: false, error: 'Value does not match required pattern' };
      }
    }
  }
  
  if (validation.options && validation.options.length > 0) {
    if (!validation.options.includes(value)) {
      return { valid: false, error: `Value must be one of: ${validation.options.join(', ')}` };
    }
  }
  
  return { valid: true };
};

// Pre-save middleware
systemSettingsSchema.pre('save', function(next) {
  // Validate the value before saving
  const validationResult = this.validateValue(this.value);
  if (!validationResult.valid) {
    return next(new Error(validationResult.error));
  }
  
  next();
});

module.exports = mongoose.model('SystemSettings', systemSettingsSchema);
