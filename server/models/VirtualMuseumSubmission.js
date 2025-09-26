const mongoose = require('mongoose');

const virtualMuseumSubmissionSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },

  type: {
    type: String,
    required: true,
    enum: ['Exhibition', '3D Experience', 'Gallery', 'Digital Archive', 'Interactive Tour']
  },

  description: {
    type: String,
    required: true,
    maxlength: 2000
  },

  // Museum Information
  museumId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Museum',
    required: true
  },

  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Submission Status
  status: {
    type: String,
    enum: ['pending', 'under_review', 'approved', 'rejected', 'resubmitted', 'published'],
    default: 'pending'
  },

  // Artifacts included in this submission
  artifacts: [{
    artifactId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Artifact',
      required: true
    },
    displayOrder: {
      type: Number,
      default: 0
    },
    customDescription: {
      type: String,
      maxlength: 500
    },
    featured: {
      type: Boolean,
      default: false
    }
  }],

  // Layout and Design
  layout: {
    type: String,
    enum: ['grid', 'timeline', 'story', '3d_gallery'],
    default: 'grid'
  },

  theme: {
    primaryColor: {
      type: String,
      default: '#8B5A3C'
    },
    secondaryColor: {
      type: String,
      default: '#ffffff'
    },
    fontFamily: {
      type: String,
      default: 'Inter'
    }
  },

  // Accessibility Features
  accessibility: {
    audioDescriptions: {
      type: Boolean,
      default: false
    },
    subtitles: {
      type: Boolean,
      default: false
    },
    highContrast: {
      type: Boolean,
      default: false
    },
    screenReader: {
      type: Boolean,
      default: false
    },
    keyboardNavigation: {
      type: Boolean,
      default: true
    }
  },

  // Media and Resources
  media: {
    bannerImage: {
      type: String, // URL to uploaded banner image
      default: null
    },
    thumbnail: {
      type: String, // URL to thumbnail image
      default: null
    },
    backgroundMusic: {
      type: String, // URL to background music file
      default: null
    },
    introVideo: {
      type: String, // URL to intro video
      default: null
    }
  },

  // 3D Models and Interactive Content
  interactiveContent: {
    has3DModels: {
      type: Boolean,
      default: false
    },
    hasVRSupport: {
      type: Boolean,
      default: false
    },
    hasARSupport: {
      type: Boolean,
      default: false
    },
    modelFiles: [{
      artifactId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Artifact'
      },
      modelUrl: String,
      textureUrl: String,
      animationUrl: String,
      fileSize: Number,
      format: {
        type: String,
        enum: ['gltf', 'glb', 'obj', 'fbx']
      }
    }]
  },

  // Review and Feedback
  review: {
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: Date,
    feedback: {
      type: String,
      maxlength: 1000
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    rejectionReason: {
      type: String,
      maxlength: 500
    }
  },

  // Performance Metrics
  metrics: {
    views: {
      type: Number,
      default: 0
    },
    uniqueVisitors: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      default: 0
    },
    totalRatings: {
      type: Number,
      default: 0
    },
    favorites: {
      type: Number,
      default: 0
    },
    shares: {
      type: Number,
      default: 0
    },
    lastViewed: Date
  },

  // Publishing Information
  publishing: {
    publishedAt: Date,
    publishedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    isPublic: {
      type: Boolean,
      default: false
    },
    featured: {
      type: Boolean,
      default: false
    },
    tags: [{
      type: String,
      trim: true,
      lowercase: true
    }]
  },

  // SEO and Discovery
  seo: {
    metaTitle: {
      type: String,
      maxlength: 60
    },
    metaDescription: {
      type: String,
      maxlength: 160
    },
    keywords: [{
      type: String,
      trim: true,
      lowercase: true
    }]
  },

  // Timestamps
  submissionDate: {
    type: Date,
    default: Date.now
  },

  lastModified: {
    type: Date,
    default: Date.now
  },

  // Soft delete
  isDeleted: {
    type: Boolean,
    default: false
  },

  deletedAt: Date,
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
virtualMuseumSubmissionSchema.index({ museumId: 1, status: 1 });
virtualMuseumSubmissionSchema.index({ submittedBy: 1 });
virtualMuseumSubmissionSchema.index({ status: 1, submissionDate: -1 });
virtualMuseumSubmissionSchema.index({ 'publishing.isPublic': 1, 'publishing.featured': 1 });
virtualMuseumSubmissionSchema.index({ 'metrics.views': -1 });
virtualMuseumSubmissionSchema.index({ 'seo.keywords': 1 });

// Virtual fields
virtualMuseumSubmissionSchema.virtual('artifactCount').get(function () {
  return this.artifacts.length;
});

virtualMuseumSubmissionSchema.virtual('has3DContent').get(function () {
  return this.interactiveContent.has3DModels || this.interactiveContent.modelFiles.length > 0;
});

virtualMuseumSubmissionSchema.virtual('isPublished').get(function () {
  return this.status === 'published' && this.publishing.isPublic;
});

// Pre-save middleware
virtualMuseumSubmissionSchema.pre('save', function (next) {
  this.lastModified = new Date();

  // Auto-generate SEO fields if not provided
  if (!this.seo.metaTitle && this.title) {
    this.seo.metaTitle = this.title.substring(0, 60);
  }

  if (!this.seo.metaDescription && this.description) {
    this.seo.metaDescription = this.description.substring(0, 160);
  }

  next();
});

// Instance methods
virtualMuseumSubmissionSchema.methods.incrementViews = async function () {
  this.metrics.views += 1;
  this.metrics.lastViewed = new Date();
  return await this.save();
};

virtualMuseumSubmissionSchema.methods.addRating = async function (rating, userId) {
  // Update average rating
  const totalRatings = this.metrics.totalRatings + 1;
  const newAverage = ((this.metrics.averageRating * this.metrics.totalRatings) + rating) / totalRatings;

  this.metrics.averageRating = Math.round(newAverage * 10) / 10;
  this.metrics.totalRatings = totalRatings;

  return await this.save();
};

virtualMuseumSubmissionSchema.methods.updateStatus = async function (newStatus, reviewedBy, feedback = null) {
  this.status = newStatus;
  this.review.reviewedBy = reviewedBy;
  this.review.reviewedAt = new Date();

  if (feedback) {
    this.review.feedback = feedback;
  }

  if (newStatus === 'published') {
    this.publishing.publishedAt = new Date();
    this.publishing.publishedBy = reviewedBy;
    this.publishing.isPublic = true;
  }

  return await this.save();
};

// Static methods
virtualMuseumSubmissionSchema.statics.getByMuseum = function (museumId, status = null) {
  const query = { museumId, isDeleted: false };
  if (status) {
    query.status = status;
  }
  return this.find(query).populate('artifacts.artifactId').sort({ submissionDate: -1 });
};

virtualMuseumSubmissionSchema.statics.getPublicSubmissions = function (limit = 20, skip = 0) {
  return this.find({
    'publishing.isPublic': true,
    status: 'published',
    isDeleted: false
  })
    .populate('artifacts.artifactId')
    .populate('museumId', 'name location')
    .sort({ 'publishing.featured': -1, 'metrics.views': -1 })
    .limit(limit)
    .skip(skip);
};

virtualMuseumSubmissionSchema.statics.getFeaturedSubmissions = function () {
  return this.find({
    'publishing.featured': true,
    'publishing.isPublic': true,
    status: 'published',
    isDeleted: false
  })
    .populate('artifacts.artifactId')
    .populate('museumId', 'name location')
    .sort({ 'metrics.views': -1 })
    .limit(10);
};

module.exports = mongoose.model('VirtualMuseumSubmission', virtualMuseumSubmissionSchema);
