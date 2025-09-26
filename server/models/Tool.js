const mongoose = require('mongoose');

const toolSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    maxlength: 500
  },
  longDescription: {
    type: String,
    maxlength: 2000
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Educational Tools',
      'Navigation & Geography',
      'Language & Culture',
      'Utilities & Converters',
      'Mobile & Apps'
    ]
  },
  icon: {
    type: String,
    default: 'FaTools' // React icon name
  },
  color: {
    type: String,
    default: 'bg-blue-500'
  },
  path: {
    type: String, // Internal app route
    required: false
  },
  externalUrl: {
    type: String, // External URL if tool is hosted elsewhere
    required: false
  },
  available: {
    type: Boolean,
    default: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  priority: {
    type: Number,
    default: 0 // Higher numbers = higher priority
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  estimatedTime: {
    type: Number, // Estimated time in minutes
    default: 10
  },
  keywords: [{
    type: String,
    trim: true
  }],
  requirements: [{
    type: String,
    trim: true
  }],
  features: [{
    type: String,
    trim: true
  }],
  screenshots: [{
    url: String,
    caption: String,
    order: { type: Number, default: 0 }
  }],
  instructions: [{
    step: Number,
    title: String,
    description: String,
    image: String
  }],
  usageCount: {
    type: Number,
    default: 0
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  metadata: {
    version: { type: String, default: '1.0.0' },
    lastUpdated: Date,
    tags: [String],
    downloadUrl: String,
    size: String, // e.g., "2.5MB"
    platform: [String], // e.g., ['web', 'mobile', 'desktop']
    language: [String] // e.g., ['en', 'am', 'or']
  }
}, {
  timestamps: true
});

// Indexes for better performance
toolSchema.index({ category: 1, available: 1, isActive: 1 });
toolSchema.index({ featured: 1, priority: -1 });
toolSchema.index({ name: 'text', description: 'text', keywords: 'text' });

// Virtual for full path including external URLs
toolSchema.virtual('fullPath').get(function() {
  return this.path || this.externalUrl;
});

// Method to increment usage count
toolSchema.methods.incrementUsage = function() {
  this.usageCount += 1;
  this.metadata.lastUpdated = new Date();
  return this.save();
};

// Method to update average rating
toolSchema.methods.updateAverageRating = async function() {
  const ToolReview = mongoose.model('ToolReview');
  const stats = await ToolReview.aggregate([
    { $match: { toolId: this._id, isActive: true } },
    { $group: { _id: null, avgRating: { $avg: '$rating' } } }
  ]);
  
  this.averageRating = stats.length > 0 ? Math.round(stats[0].avgRating * 10) / 10 : 0;
  return this.save();
};

// Static method to get featured tools
toolSchema.statics.getFeatured = function(limit = 6) {
  return this.find({ 
    featured: true, 
    available: true, 
    isActive: true 
  })
  .sort({ priority: -1, usageCount: -1 })
  .limit(limit);
};

// Static method to get tools by category
toolSchema.statics.getByCategory = function(category, limit = 10) {
  return this.find({ 
    category: category, 
    isActive: true 
  })
  .sort({ featured: -1, priority: -1, name: 1 })
  .limit(limit);
};

// Pre-save middleware
toolSchema.pre('save', function(next) {
  if (this.isModified()) {
    this.metadata.lastUpdated = new Date();
  }
  
  // Validate that either path or externalUrl is provided
  if (!this.path && !this.externalUrl) {
    return next(new Error('Tool must have either a path or external URL'));
  }
  
  next();
});

module.exports = mongoose.model('Tool', toolSchema);
