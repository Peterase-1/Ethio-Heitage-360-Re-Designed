
const mongoose = require('mongoose');

const artifactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Artifact name is required'],
    trim: true,
    maxlength: [200, 'Name cannot be more than 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'pottery',
      'jewelry',
      'tools',
      'weapons',
      'manuscripts',
      'coins',
      'textiles',
      'sculptures',
      'paintings',
      'religious-items',
      'household-items',
      'musical-instruments',
      'other'
    ]
  },
  period: {
    era: {
      type: String,
      enum: ['prehistoric', 'ancient', 'medieval', 'modern', 'contemporary'],
      required: true
    },
    startYear: {
      type: Number,
      validate: {
        validator: function(v) {
          return v <= new Date().getFullYear();
        },
        message: 'Start year cannot be in the future'
      }
    },
    endYear: {
      type: Number,
      validate: {
        validator: function(v) {
          return !v || v >= this.startYear;
        },
        message: 'End year must be after start year'
      }
    },
    dynasty: String,
    culturalPeriod: String
  },
  origin: {
    region: {
      type: String,
      required: [true, 'Origin region is required']
    },
    specificLocation: String,
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        index: '2dsphere'
      }
    },
    excavationSite: String,
    discoveryDate: Date,
    discoveredBy: String
  },
  museum: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Museum',
    required: [true, 'Museum is required']
  },
  accessionNumber: {
    type: String,
    required: [true, 'Accession number is required'],
    unique: true,
    trim: true
  },
  media: {
    images: [{
      url: String,
      caption: String,
      isPrimary: { type: Boolean, default: false },
      uploadedAt: { type: Date, default: Date.now }
    }],
    videos: [{
      url: String,
      title: String,
      description: String,
      duration: Number,
      uploadedAt: { type: Date, default: Date.now }
    }]
  },
  status: {
    type: String,
    enum: ['on_display', 'in_storage', 'under_conservation', 'on_loan', 'draft', 'pending-review', 'approved', 'published', 'archived'],
    default: 'in_storage'
  },
  
  // Physical condition as per frontend requirements
  condition: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'fragile'],
    default: 'good',
    required: true
  },
  
  // Display status
  isOnDisplay: {
    type: Boolean,
    default: false
  },
  
  // Featured artifact flag
  featured: {
    type: Boolean,
    default: false
  },
  
  // Location within museum
  location: {
    type: String,
    maxlength: [200, 'Location cannot be more than 200 characters']
  },
  visibility: {
    type: String,
    enum: ['public', 'restricted', 'private'],
    default: 'public'
  },
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    date: {
      type: Date,
      default: Date.now
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Physical Properties
  physicalProperties: {
    dimensions: {
      length: { type: Number, min: 0 },
      width: { type: Number, min: 0 },
      height: { type: Number, min: 0 },
      diameter: { type: Number, min: 0 },
      unit: { type: String, enum: ['cm', 'mm', 'inch'], default: 'cm' }
    },
    weight: {
      value: { type: Number, min: 0 },
      unit: { type: String, enum: ['g', 'kg', 'lb'], default: 'g' }
    },
    materials: [{
      name: { type: String, required: true },
      percentage: { type: Number, min: 0, max: 100 }
    }],
    condition: {
      overall: { type: String, enum: ['excellent', 'good', 'fair', 'poor', 'damaged'], default: 'good' },
      description: String,
      lastAssessed: Date,
      assessedBy: String
    },
    colors: [String],
    techniques: [String]
  },
  
  // Conservation and Care
  conservation: {
    history: [{
      date: Date,
      treatment: String,
      conservator: String,
      notes: String
    }],
    requirements: {
      temperature: { min: Number, max: Number },
      humidity: { min: Number, max: Number },
      lightLevel: Number,
      specialRequirements: [String]
    },
    nextMaintenanceDate: Date
  },
  
  // Cultural and Historical Context
  culturalContext: {
    culturalGroup: String,
    significance: String,
    usage: String,
    ritualImportance: String,
    symbolicMeaning: String,
    relatedArtifacts: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Artifact'
    }]
  },
  
  // Research and Documentation
  research: {
    publications: [{
      title: String,
      authors: [String],
      journal: String,
      year: Number,
      doi: String,
      url: String
    }],
    exhibitions: [{
      name: String,
      venue: String,
      startDate: Date,
      endDate: Date,
      catalogNumber: String
    }],
    analyses: [{
      type: { type: String, enum: ['carbon-dating', 'x-ray', 'chemical', 'microscopic', 'other'] },
      date: Date,
      results: String,
      laboratory: String,
      technician: String
    }]
  },
  
  // Rental and Availability
  availability: {
    isAvailableForRental: { type: Boolean, default: false },
    rentalPrice: {
      daily: { type: Number, min: 0 },
      weekly: { type: Number, min: 0 },
      monthly: { type: Number, min: 0 }
    },
    restrictions: [String],
    minimumRentalPeriod: { type: Number, default: 1 }, // in days
    maximumRentalPeriod: { type: Number, default: 30 }, // in days
    securityDeposit: { type: Number, min: 0 },
    insuranceRequired: { type: Boolean, default: true }
  },
  
  // Engagement and Analytics
  engagement: {
    averageViewTime: { type: Number, default: 0 }, // in seconds
    totalInteractions: { type: Number, default: 0 },
    bookmarks: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      date: { type: Date, default: Date.now }
    }],
    ratings: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      rating: { type: Number, min: 1, max: 5 },
      review: String,
      date: { type: Date, default: Date.now }
    }],
    lastUpdated: { type: Date, default: Date.now }
  },
  
  // Quality Control
  qualityControl: {
    isVerified: { type: Boolean, default: false },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    verifiedAt: Date,
    qualityScore: { type: Number, min: 0, max: 100 },
    completeness: { type: Number, min: 0, max: 100 }, // percentage of required fields filled
    flags: [{
      type: { type: String, enum: ['incomplete', 'inaccurate', 'duplicate', 'inappropriate'] },
      description: String,
      flaggedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      flaggedAt: { type: Date, default: Date.now },
      resolved: { type: Boolean, default: false }
    }]
  },
  
  // SEO and Metadata
  seo: {
    slug: { type: String, unique: true },
    metaTitle: String,
    metaDescription: String,
    keywords: [String],
    alternativeNames: [String]
  },
  
  // Soft delete
  deletedAt: { type: Date, default: null },
  isActive: { type: Boolean, default: true }
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Comprehensive indexes for performance optimization
artifactSchema.index({ name: 'text', description: 'text' }); // Full text search
artifactSchema.index({ category: 1, status: 1 }); // Category filtering
artifactSchema.index({ museum: 1, status: 1 }); // Museum's artifacts
artifactSchema.index({ 'period.era': 1, category: 1 }); // Historical period search
artifactSchema.index({ createdAt: -1 }); // Recent artifacts
artifactSchema.index({ views: -1 }); // Popular artifacts
artifactSchema.index({ 'availability.isAvailableForRental': 1 }); // Rental availability
artifactSchema.index({ 'qualityControl.isVerified': 1, status: 1 }); // Verified artifacts
artifactSchema.index({ 'seo.slug': 1 }, { unique: true, sparse: true }); // SEO slug
artifactSchema.index({ accessionNumber: 1 }, { unique: true }); // Unique accession number
artifactSchema.index({ 'origin.coordinates.coordinates': '2dsphere' }); // Geospatial origin
artifactSchema.index({ isActive: 1, deletedAt: 1 }); // Active artifacts

// Compound indexes for common queries
artifactSchema.index({ museum: 1, category: 1, status: 1 }); // Museum category filter
artifactSchema.index({ status: 1, visibility: 1, isActive: 1 }); // Public artifacts
artifactSchema.index({ 'period.era': 1, 'origin.region': 1 }); // Historical origin search

// Comprehensive virtual properties
artifactSchema.virtual('likeCount').get(function() {
  return this.likes ? this.likes.length : 0;
});

artifactSchema.virtual('bookmarkCount').get(function() {
  return this.engagement?.bookmarks ? this.engagement.bookmarks.length : 0;
});

artifactSchema.virtual('averageRating').get(function() {
  if (!this.engagement?.ratings || this.engagement.ratings.length === 0) return 0;
  const sum = this.engagement.ratings.reduce((acc, rating) => acc + rating.rating, 0);
  return Math.round((sum / this.engagement.ratings.length) * 10) / 10;
});

artifactSchema.virtual('ratingCount').get(function() {
  return this.engagement?.ratings ? this.engagement.ratings.length : 0;
});

artifactSchema.virtual('primaryImage').get(function() {
  if (!this.media?.images || this.media.images.length === 0) return null;
  return this.media.images.find(img => img.isPrimary) || this.media.images[0];
});

artifactSchema.virtual('ageInYears').get(function() {
  if (!this.period?.startYear) return null;
  return new Date().getFullYear() - this.period.startYear;
});

artifactSchema.virtual('displayName').get(function() {
  return this.name || 'Unnamed Artifact';
});

// Instance methods
artifactSchema.methods.incrementViews = async function() {
  this.views += 1;
  this.engagement.totalInteractions += 1;
  this.engagement.lastUpdated = new Date();
  return await this.save();
};

artifactSchema.methods.addLike = async function(userId) {
  // Check if user already liked
  const existingLike = this.likes.find(like => like.user.toString() === userId.toString());
  if (existingLike) {
    throw new Error('User has already liked this artifact');
  }
  
  this.likes.push({ user: userId });
  this.engagement.totalInteractions += 1;
  this.engagement.lastUpdated = new Date();
  return await this.save();
};

artifactSchema.methods.removeLike = async function(userId) {
  this.likes = this.likes.filter(like => like.user.toString() !== userId.toString());
  this.engagement.lastUpdated = new Date();
  return await this.save();
};

artifactSchema.methods.addBookmark = async function(userId) {
  // Check if user already bookmarked
  const existingBookmark = this.engagement.bookmarks?.find(bookmark => 
    bookmark.user.toString() === userId.toString());
  if (existingBookmark) {
    throw new Error('User has already bookmarked this artifact');
  }
  
  if (!this.engagement.bookmarks) this.engagement.bookmarks = [];
  this.engagement.bookmarks.push({ user: userId });
  this.engagement.totalInteractions += 1;
  this.engagement.lastUpdated = new Date();
  return await this.save();
};

artifactSchema.methods.removeBookmark = async function(userId) {
  if (this.engagement.bookmarks) {
    this.engagement.bookmarks = this.engagement.bookmarks.filter(bookmark => 
      bookmark.user.toString() !== userId.toString());
  }
  this.engagement.lastUpdated = new Date();
  return await this.save();
};

artifactSchema.methods.addRating = async function(userId, rating, review = '') {
  // Check if user already rated
  const existingRating = this.engagement.ratings?.find(r => r.user.toString() === userId.toString());
  if (existingRating) {
    // Update existing rating
    existingRating.rating = rating;
    existingRating.review = review;
    existingRating.date = new Date();
  } else {
    // Add new rating
    if (!this.engagement.ratings) this.engagement.ratings = [];
    this.engagement.ratings.push({ user: userId, rating, review });
  }
  
  this.engagement.totalInteractions += 1;
  this.engagement.lastUpdated = new Date();
  return await this.save();
};

artifactSchema.methods.updateQualityScore = function() {
  let score = 0;
  let maxScore = 100;
  
  // Basic information completeness (30 points)
  if (this.name) score += 5;
  if (this.description && this.description.length >= 50) score += 10;
  if (this.category) score += 5;
  if (this.accessionNumber) score += 5;
  if (this.period?.era) score += 5;
  
  // Media quality (25 points)
  if (this.media?.images?.length > 0) score += 10;
  if (this.media?.images?.some(img => img.isPrimary)) score += 5;
  if (this.media?.images?.length >= 3) score += 5;
  if (this.media?.videos?.length > 0) score += 5;
  
  // Historical context (20 points)
  if (this.period?.startYear) score += 5;
  if (this.origin?.region) score += 5;
  if (this.culturalContext?.significance) score += 5;
  if (this.culturalContext?.usage) score += 5;
  
  // Physical properties (15 points)
  if (this.physicalProperties?.materials?.length > 0) score += 5;
  if (this.physicalProperties?.dimensions?.length) score += 5;
  if (this.physicalProperties?.condition?.overall) score += 5;
  
  // Research and verification (10 points)
  if (this.qualityControl?.isVerified) score += 10;
  
  this.qualityControl.qualityScore = Math.min(score, maxScore);
  this.qualityControl.completeness = (score / maxScore) * 100;
};

artifactSchema.methods.generateSlug = function() {
  if (!this.name) return;
  
  let baseSlug = this.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  
  // Add accession number for uniqueness
  if (this.accessionNumber) {
    baseSlug += '-' + this.accessionNumber.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  }
  
  this.seo.slug = baseSlug;
};

artifactSchema.methods.softDelete = async function() {
  this.deletedAt = new Date();
  this.isActive = false;
  return await this.save();
};

artifactSchema.methods.restore = async function() {
  this.deletedAt = null;
  this.isActive = true;
  return await this.save();
};

// Static methods
artifactSchema.statics.findPublic = function() {
  return this.find({ 
    status: 'published', 
    visibility: 'public', 
    isActive: true, 
    deletedAt: null 
  });
};

artifactSchema.statics.findByMuseum = function(museumId) {
  return this.find({ 
    museum: museumId, 
    isActive: true, 
    deletedAt: null 
  });
};

artifactSchema.statics.findByCategory = function(category) {
  return this.find({ 
    category, 
    status: 'published', 
    visibility: 'public', 
    isActive: true, 
    deletedAt: null 
  });
};

artifactSchema.statics.findByPeriod = function(era) {
  return this.find({ 
    'period.era': era, 
    status: 'published', 
    visibility: 'public', 
    isActive: true, 
    deletedAt: null 
  });
};

artifactSchema.statics.findAvailableForRental = function() {
  return this.find({ 
    'availability.isAvailableForRental': true,
    status: 'published',
    visibility: 'public',
    isActive: true,
    deletedAt: null
  });
};

artifactSchema.statics.searchArtifacts = function(searchTerm, filters = {}) {
  let query = { 
    isActive: true, 
    deletedAt: null 
  };
  
  if (searchTerm) {
    query.$text = { $search: searchTerm };
  }
  
  // Apply filters
  if (filters.category) query.category = filters.category;
  if (filters.era) query['period.era'] = filters.era;
  if (filters.museum) query.museum = filters.museum;
  if (filters.status) query.status = filters.status;
  if (filters.visibility) query.visibility = filters.visibility;
  if (filters.availableForRental) query['availability.isAvailableForRental'] = true;
  if (filters.verified) query['qualityControl.isVerified'] = true;
  
  return this.find(query);
};

// Pre-save middleware
artifactSchema.pre('save', function(next) {
  // Generate slug if name changed
  if (this.isModified('name') || this.isModified('accessionNumber')) {
    this.generateSlug();
  }
  
  // Update quality score if relevant fields changed
  if (this.isModified('name') || this.isModified('description') || 
      this.isModified('media') || this.isModified('period') ||
      this.isModified('physicalProperties') || this.isModified('culturalContext')) {
    this.updateQualityScore();
  }
  
  // Ensure only one primary image
  if (this.media?.images?.length > 0) {
    let primaryCount = 0;
    let lastPrimaryIndex = -1;
    
    this.media.images.forEach((image, index) => {
      if (image.isPrimary) {
        primaryCount++;
        lastPrimaryIndex = index;
      }
    });
    
    if (primaryCount > 1) {
      this.media.images.forEach((image, index) => {
        image.isPrimary = index === lastPrimaryIndex;
      });
    } else if (primaryCount === 0) {
      this.media.images[0].isPrimary = true;
    }
  }
  
  // Update engagement timestamp
  if (this.isModified()) {
    this.engagement.lastUpdated = new Date();
  }
  
  next();
});

// Pre-find middleware to exclude soft deleted
artifactSchema.pre(/^find/, function(next) {
  this.where({ deletedAt: null });
  next();
});

module.exports = mongoose.model('Artifact', artifactSchema);

