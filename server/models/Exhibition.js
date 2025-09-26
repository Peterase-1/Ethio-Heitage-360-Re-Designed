const mongoose = require('mongoose');

const exhibitionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Exhibition title is required'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Exhibition description is required'],
    maxlength: [3000, 'Description cannot be more than 3000 characters']
  },
  shortDescription: {
    type: String,
    maxlength: [500, 'Short description cannot be more than 500 characters']
  },
  museum: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Museum',
    required: [true, 'Museum is required']
  },
  curator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: [
      'permanent',
      'temporary',
      'traveling',
      'special',
      'virtual',
      'interactive',
      'outdoor',
      'educational',
      'research',
      'community'
    ],
    required: [true, 'Exhibition type is required']
  },
  category: {
    type: String,
    enum: [
      'art',
      'history',
      'culture',
      'archaeology',
      'science',
      'technology',
      'nature',
      'photography',
      'contemporary',
      'traditional',
      'religious',
      'ethnographic',
      'decorative_arts',
      'textiles',
      'ceramics',
      'jewelry',
      'manuscripts',
      'coins',
      'weapons',
      'tools'
    ],
    required: [true, 'Exhibition category is required']
  },
  schedule: {
    startDate: {
      type: Date,
      required: [true, 'Start date is required']
    },
    endDate: {
      type: Date,
      validate: {
        validator: function (v) {
          // For permanent exhibitions, end date is optional
          if (this.type === 'permanent') return true;
          return v && v >= this.schedule.startDate;
        },
        message: 'End date must be after start date'
      }
    },
    openingHours: {
      monday: { open: String, close: String, closed: { type: Boolean, default: false } },
      tuesday: { open: String, close: String, closed: { type: Boolean, default: false } },
      wednesday: { open: String, close: String, closed: { type: Boolean, default: false } },
      thursday: { open: String, close: String, closed: { type: Boolean, default: false } },
      friday: { open: String, close: String, closed: { type: Boolean, default: false } },
      saturday: { open: String, close: String, closed: { type: Boolean, default: false } },
      sunday: { open: String, close: String, closed: { type: Boolean, default: false } }
    },
    specialHours: [{
      date: Date,
      open: String,
      close: String,
      closed: Boolean,
      note: String
    }],
    timezone: {
      type: String,
      default: 'Africa/Addis_Ababa'
    }
  },
  location: {
    gallery: {
      type: String,
      required: [true, 'Gallery location is required']
    },
    floor: String,
    wing: String,
    room: String,
    area: String,
    coordinates: {
      type: {
        type: String,
        enum: ['Point']
      },
      coordinates: {
        type: [Number],
        index: '2dsphere'
      }
    }
  },
  ticketing: {
    required: {
      type: Boolean,
      default: false
    },
    includedInGeneral: {
      type: Boolean,
      default: true // Usually included in general museum admission
    },
    additionalFees: {
      adult: {
        type: Number,
        default: 0,
        min: [0, 'Fee cannot be negative']
      },
      child: {
        type: Number,
        default: 0,
        min: [0, 'Fee cannot be negative']
      },
      student: {
        type: Number,
        default: 0,
        min: [0, 'Fee cannot be negative']
      },
      senior: {
        type: Number,
        default: 0,
        min: [0, 'Fee cannot be negative']
      },
      member: {
        type: Number,
        default: 0,
        min: [0, 'Fee cannot be negative']
      }
    },
    currency: {
      type: String,
      enum: ['ETB', 'USD', 'EUR'],
      default: 'ETB'
    }
  },
  media: {
    images: [{
      url: String,
      caption: String,
      credit: String,
      isPrimary: { type: Boolean, default: false },
      isGallery: { type: Boolean, default: true },
      order: { type: Number, default: 0 },
      uploadedAt: { type: Date, default: Date.now }
    }],
    videos: [{
      url: String,
      title: String,
      description: String,
      duration: Number,
      type: {
        type: String,
        enum: ['trailer', 'documentary', 'tour', 'interview', 'behind_scenes', 'educational']
      },
      uploadedAt: { type: Date, default: Date.now }
    }],
    virtualTour: {
      url: String,
      provider: String, // e.g., 'matterport', 'google_street_view', 'custom'
      description: String
    },
    audioGuide: [{
      language: String,
      url: String,
      duration: Number,
      description: String
    }],
    documents: [{
      name: String,
      url: String,
      type: {
        type: String,
        enum: ['catalog', 'brochure', 'press_release', 'educational_material', 'research', 'map', 'other']
      },
      language: String,
      uploadedAt: { type: Date, default: Date.now }
    }]
  },
  artifacts: [{
    artifact: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Artifact'
    },
    displayOrder: Number,
    displayNote: String,
    isHighlight: { type: Boolean, default: false },
    section: String
  }],
  sections: [{
    title: String,
    description: String,
    order: Number,
    artifacts: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Artifact'
    }]
  }],
  themes: [String],
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  collaborations: [{
    organization: String,
    type: {
      type: String,
      enum: ['sponsor', 'partner', 'lender', 'researcher', 'community']
    },
    website: String,
    logo: String,
    description: String
  }],
  staff: {
    curator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    assistantCurators: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    researchers: [{
      name: String,
      title: String,
      institution: String,
      bio: String,
      contact: String
    }],
    designers: [{
      name: String,
      role: String,
      company: String
    }]
  },
  educational: {
    targetAudience: [{
      type: String,
      enum: ['children', 'teenagers', 'adults', 'families', 'students', 'researchers', 'tourists']
    }],
    ageGroups: [{
      min: Number,
      max: Number,
      label: String
    }],
    learningObjectives: [String],
    activities: [{
      name: String,
      description: String,
      type: {
        type: String,
        enum: ['worksheet', 'quiz', 'game', 'workshop', 'tour', 'hands_on', 'digital']
      },
      materials: String,
      duration: Number
    }],
    resources: [{
      name: String,
      type: {
        type: String,
        enum: ['lesson_plan', 'activity_sheet', 'presentation', 'video', 'reading_list', 'bibliography']
      },
      url: String,
      description: String
    }]
  },
  accessibility: {
    wheelchairAccessible: { type: Boolean, default: false },
    visuallyImpairedFriendly: { type: Boolean, default: false },
    hearingImpairedFriendly: { type: Boolean, default: false },
    touchTourAvailable: { type: Boolean, default: false },
    largeTextAvailable: { type: Boolean, default: false },
    signLanguageAvailable: { type: Boolean, default: false },
    audioDescriptionAvailable: { type: Boolean, default: false },
    brailleLabelsAvailable: { type: Boolean, default: false },
    specialNeeds: String
  },
  interactivity: {
    hasInteractiveElements: { type: Boolean, default: false },
    digitalInteractives: [{
      name: String,
      description: String,
      type: {
        type: String,
        enum: ['touchscreen', 'vr', 'ar', 'game', 'simulation', 'multimedia']
      },
      location: String
    }],
    handsOnElements: [{
      name: String,
      description: String,
      safetyInstructions: String
    }]
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
    comment: String,
    isVerified: { type: Boolean, default: false }, // Verified visitor
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  statistics: {
    totalViews: { type: Number, default: 0 },
    totalVisitors: { type: Number, default: 0 },
    averageRating: { type: Number, min: 0, max: 5, default: 0 },
    totalReviews: { type: Number, default: 0 },
    monthlyVisitors: [{
      month: String, // YYYY-MM format
      count: Number
    }],
    popularTimes: {
      monday: [Number],
      tuesday: [Number],
      wednesday: [Number],
      thursday: [Number],
      friday: [Number],
      saturday: [Number],
      sunday: [Number]
    }
  },
  status: {
    type: String,
    enum: ['planning', 'in_preparation', 'active', 'extended', 'closing_soon', 'closed', 'archived'],
    default: 'planning'
  },
  visibility: {
    type: String,
    enum: ['public', 'members_only', 'private', 'preview'],
    default: 'public'
  },
  featured: {
    type: Boolean,
    default: false
  },
  highlights: [{
    title: String,
    description: String,
    image: String,
    artifact: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Artifact'
    },
    order: Number
  }],
  relatedExhibitions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exhibition'
  }],
  relatedEvents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  }],
  socialMedia: {
    hashtags: [String],
    instagramTag: String,
    facebookEvent: String,
    twitterHandle: String
  },
  contact: {
    email: String,
    phone: String,
    person: String
  },
  notes: {
    public: String,
    curatorial: String, // Only visible to curators and museum staff
    administrative: String // Internal administrative notes
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
exhibitionSchema.index({ museum: 1, status: 1 });
exhibitionSchema.index({ 'schedule.startDate': 1, 'schedule.endDate': 1 });
exhibitionSchema.index({ type: 1, category: 1 });
exhibitionSchema.index({ tags: 1 });
exhibitionSchema.index({ title: 'text', description: 'text', tags: 'text' });
exhibitionSchema.index({ 'location.coordinates': '2dsphere' });

// Virtual for exhibition status based on dates
exhibitionSchema.virtual('exhibitionStatus').get(function () {
  const now = new Date();
  
  if (this.status === 'closed' || this.status === 'archived') return this.status;
  if (this.status === 'planning' || this.status === 'in_preparation') return this.status;
  
  if (this.type === 'permanent') {
    return this.status === 'active' ? 'ongoing' : this.status;
  }
  
  if (now < this.schedule.startDate) return 'upcoming';
  if (this.schedule.endDate && now > this.schedule.endDate) return 'ended';
  if (this.status === 'closing_soon') return 'closing_soon';
  
  return 'ongoing';
});

// Virtual for duration in days
exhibitionSchema.virtual('duration').get(function () {
  if (this.type === 'permanent' || !this.schedule.endDate) return null;
  
  const start = new Date(this.schedule.startDate);
  const end = new Date(this.schedule.endDate);
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24)); // in days
});

// Virtual for days remaining
exhibitionSchema.virtual('daysRemaining').get(function () {
  if (this.type === 'permanent' || !this.schedule.endDate) return null;
  
  const now = new Date();
  const end = new Date(this.schedule.endDate);
  if (now > end) return 0;
  
  return Math.ceil((end - now) / (1000 * 60 * 60 * 24));
});

// Static methods
exhibitionSchema.statics.findByStatus = function (status) {
  return this.find({ status }).populate('museum curator');
};

exhibitionSchema.statics.findActive = function (limit = 10) {
  return this.find({
    status: { $in: ['active', 'extended', 'closing_soon'] },
    visibility: 'public'
  })
    .sort({ 'schedule.startDate': -1 })
    .limit(limit)
    .populate('museum', 'name location images')
    .populate('curator', 'name email');
};

exhibitionSchema.statics.findUpcoming = function (limit = 10) {
  return this.find({
    'schedule.startDate': { $gte: new Date() },
    status: { $in: ['in_preparation', 'active'] },
    visibility: 'public'
  })
    .sort({ 'schedule.startDate': 1 })
    .limit(limit)
    .populate('museum', 'name location images')
    .populate('curator', 'name email');
};

exhibitionSchema.statics.findByDateRange = function (startDate, endDate) {
  return this.find({
    $or: [
      {
        'schedule.startDate': { $gte: startDate, $lte: endDate }
      },
      {
        'schedule.endDate': { $gte: startDate, $lte: endDate }
      },
      {
        'schedule.startDate': { $lte: startDate },
        'schedule.endDate': { $gte: endDate }
      },
      {
        type: 'permanent',
        'schedule.startDate': { $lte: endDate }
      }
    ],
    status: { $in: ['active', 'extended', 'closing_soon'] },
    visibility: 'public'
  });
};

exhibitionSchema.statics.findByMuseum = function (museumId, status = null) {
  const query = { museum: museumId };
  if (status) query.status = status;
  return this.find(query).sort({ 'schedule.startDate': -1 });
};

// Instance methods
exhibitionSchema.methods.addReview = function (userId, rating, comment, isVerified = false) {
  // Remove existing review from same user
  this.reviews = this.reviews.filter(r => r.user.toString() !== userId);

  this.reviews.push({
    user: userId,
    rating,
    comment,
    isVerified
  });

  // Update statistics
  this.statistics.totalReviews = this.reviews.length;
  this.statistics.averageRating = this.reviews.reduce((sum, r) => sum + r.rating, 0) / this.reviews.length;

  return this.save();
};

exhibitionSchema.methods.incrementViews = function () {
  this.statistics.totalViews += 1;
  return this.save();
};

exhibitionSchema.methods.recordVisit = function (month = null) {
  this.statistics.totalVisitors += 1;
  
  if (month) {
    const existingMonth = this.statistics.monthlyVisitors.find(m => m.month === month);
    if (existingMonth) {
      existingMonth.count += 1;
    } else {
      this.statistics.monthlyVisitors.push({ month, count: 1 });
    }
  }
  
  return this.save();
};

exhibitionSchema.methods.addArtifact = function (artifactId, displayOrder = 0, section = null) {
  const existingArtifact = this.artifacts.find(a => a.artifact.toString() === artifactId);
  if (existingArtifact) {
    throw new Error('Artifact is already in this exhibition');
  }

  this.artifacts.push({
    artifact: artifactId,
    displayOrder,
    section
  });

  return this.save();
};

exhibitionSchema.methods.removeArtifact = function (artifactId) {
  this.artifacts = this.artifacts.filter(a => a.artifact.toString() !== artifactId);
  return this.save();
};

// Pre-save middleware
exhibitionSchema.pre('save', function (next) {
  // For non-permanent exhibitions, ensure end date is after start date
  if (this.type !== 'permanent' && this.schedule.endDate) {
    if (this.schedule.endDate < this.schedule.startDate) {
      return next(new Error('End date must be after start date'));
    }
  }

  // Auto-set closing_soon status for exhibitions ending within 30 days
  if (this.type !== 'permanent' && this.schedule.endDate && this.status === 'active') {
    const now = new Date();
    const daysUntilEnd = Math.ceil((this.schedule.endDate - now) / (1000 * 60 * 60 * 24));
    
    if (daysUntilEnd <= 30 && daysUntilEnd > 0) {
      this.status = 'closing_soon';
    }
  }

  next();
});

module.exports = mongoose.model('Exhibition', exhibitionSchema);
