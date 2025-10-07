const mongoose = require('mongoose');

const virtualMuseumSchema = new mongoose.Schema({
  // Artifact Information
  artifact: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Artifact',
    required: true
  },

  // Museum Information
  museum: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Museum',
    required: true
  },

  // Rental Request that led to this virtual museum entry
  rentalRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RentalRequest',
    required: true
  },

  // Virtual Museum Display Information
  title: {
    type: String,
    required: true
  },

  description: {
    type: String,
    required: true
  },

  // Display Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'archived'],
    default: 'active'
  },

  // Virtual Museum Metrics
  views: {
    type: Number,
    default: 0
  },

  likes: {
    type: Number,
    default: 0
  },

  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },

  // 3D Model Information
  has3DModel: {
    type: Boolean,
    default: false
  },

  modelUrl: {
    type: String
  },

  // Virtual Museum Features
  isInteractive: {
    type: Boolean,
    default: false
  },

  hasAudioGuide: {
    type: Boolean,
    default: false
  },

  audioGuideUrl: {
    type: String
  },

  // Display Settings
  displayOrder: {
    type: Number,
    default: 0
  },

  featured: {
    type: Boolean,
    default: false
  },

  // Timestamps
  addedAt: {
    type: Date,
    default: Date.now
  },

  lastViewed: {
    type: Date
  },

  // Metadata
  tags: [{
    type: String
  }],

  category: {
    type: String
  },

  period: {
    type: String
  },

  origin: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes for better performance
virtualMuseumSchema.index({ artifact: 1 });
virtualMuseumSchema.index({ museum: 1 });
virtualMuseumSchema.index({ status: 1 });
virtualMuseumSchema.index({ featured: 1 });
virtualMuseumSchema.index({ views: -1 });
virtualMuseumSchema.index({ rating: -1 });

// Virtual for getting display URL
virtualMuseumSchema.virtual('displayUrl').get(function () {
  return `/virtual-museum/artifact/${this._id}`;
});

// Method to increment views
virtualMuseumSchema.methods.incrementViews = function () {
  this.views += 1;
  this.lastViewed = new Date();
  return this.save();
};

// Method to add like
virtualMuseumSchema.methods.addLike = function () {
  this.likes += 1;
  return this.save();
};

// Method to remove like
virtualMuseumSchema.methods.removeLike = function () {
  if (this.likes > 0) {
    this.likes -= 1;
  }
  return this.save();
};

// Method to update rating
virtualMuseumSchema.methods.updateRating = function (newRating) {
  this.rating = newRating;
  return this.save();
};

// Static method to get featured artifacts
virtualMuseumSchema.statics.getFeatured = function () {
  return this.find({ featured: true, status: 'active' })
    .populate('artifact', 'name description images')
    .populate('museum', 'name location')
    .sort({ displayOrder: 1, views: -1 });
};

// Static method to get popular artifacts
virtualMuseumSchema.statics.getPopular = function (limit = 10) {
  return this.find({ status: 'active' })
    .populate('artifact', 'name description images')
    .populate('museum', 'name location')
    .sort({ views: -1, rating: -1 })
    .limit(limit);
};

// Static method to get artifacts by museum
virtualMuseumSchema.statics.getByMuseum = function (museumId) {
  return this.find({ museum: museumId, status: 'active' })
    .populate('artifact', 'name description images')
    .populate('museum', 'name location')
    .sort({ displayOrder: 1, views: -1 });
};

const VirtualMuseum = mongoose.model('VirtualMuseum', virtualMuseumSchema);

module.exports = VirtualMuseum;
