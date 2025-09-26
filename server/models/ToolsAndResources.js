const mongoose = require('mongoose');
const { Schema } = mongoose;

const resourceSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxLength: 200,
    index: true
  },
  description: {
    type: String,
    required: true,
    maxLength: 1000
  },
  shortDescription: {
    type: String,
    maxLength: 200
  },
  
  // Resource Type and Category
  type: {
    type: String,
    enum: [
      'calculator', 'converter', 'timeline', 'map', 'dictionary', 
      'translator', 'quiz-maker', 'note-taker', 'citation-tool',
      'research-guide', 'study-planner', 'flashcard-maker', 
      'presentation-tool', 'document-viewer', 'image-editor',
      'audio-recorder', 'video-player', 'ar-viewer', 'vr-experience',
      'interactive-simulation', 'virtual-lab', 'reference-guide'
    ],
    required: true,
    index: true
  },
  category: {
    type: String,
    enum: [
      'educational', 'research', 'productivity', 'creative', 
      'language', 'historical', 'cultural', 'scientific',
      'archaeological', 'geographic', 'artistic'
    ],
    required: true,
    index: true
  },
  
  // Tool Configuration
  toolConfig: {
    isInteractive: {
      type: Boolean,
      default: true
    },
    requiresAuth: {
      type: Boolean,
      default: false
    },
    isWebBased: {
      type: Boolean,
      default: true
    },
    isEmbeddable: {
      type: Boolean,
      default: true
    },
    hasAPI: {
      type: Boolean,
      default: false
    },
    supportedFormats: [String], // File formats supported
    maxFileSize: Number, // in MB
    sessionTimeout: Number, // in minutes
    concurrentUsers: Number
  },
  
  // Access and Availability
  access: {
    type: String,
    enum: ['free', 'premium', 'subscription', 'one-time'],
    default: 'free'
  },
  availability: {
    type: String,
    enum: ['always', 'scheduled', 'on-demand'],
    default: 'always'
  },
  permissions: {
    visitorAccess: {
      type: Boolean,
      default: true
    },
    guestAccess: {
      type: Boolean,
      default: false
    },
    requiresCourse: {
      type: Boolean,
      default: false
    },
    minimumLevel: {
      type: Number,
      default: 0
    }
  },
  
  // Content and Media
  content: {
    instructions: {
      type: String,
      maxLength: 2000
    },
    tutorial: {
      videoUrl: String,
      documentsUrl: [String],
      stepsGuide: [String]
    },
    helpDocumentation: {
      faq: [{
        question: String,
        answer: String
      }],
      userManual: String,
      troubleshooting: [String]
    }
  },
  
  media: {
    icon: String,
    thumbnail: String,
    screenshots: [String],
    demoVideo: String,
    previewImage: String
  },
  
  // Tool-Specific Features
  features: [{
    name: {
      type: String,
      required: true
    },
    description: String,
    isCore: {
      type: Boolean,
      default: false
    },
    isPremium: {
      type: Boolean,
      default: false
    },
    icon: String
  }],
  
  // Integration and Embedding
  integration: {
    embedUrl: String,
    apiEndpoint: String,
    iframeConfig: {
      width: {
        type: String,
        default: '100%'
      },
      height: {
        type: String,
        default: '600px'
      },
      allowFullscreen: {
        type: Boolean,
        default: true
      },
      sandbox: [String]
    },
    externalLinks: [{
      title: String,
      url: String,
      description: String,
      isOfficial: {
        type: Boolean,
        default: false
      }
    }]
  },
  
  // Educational Metadata
  educational: {
    subjects: [String],
    gradeLevel: [{
      type: String,
      enum: ['elementary', 'middle', 'high-school', 'college', 'graduate', 'professional']
    }],
    learningObjectives: [String],
    skillsSupported: [String],
    languagesSupported: [String],
    accessibility: {
      screenReaderCompatible: {
        type: Boolean,
        default: false
      },
      keyboardNavigation: {
        type: Boolean,
        default: true
      },
      highContrast: {
        type: Boolean,
        default: false
      },
      closedCaptions: {
        type: Boolean,
        default: false
      }
    }
  },
  
  // Usage and Analytics
  usage: {
    totalViews: {
      type: Number,
      default: 0
    },
    totalUsers: {
      type: Number,
      default: 0
    },
    totalSessions: {
      type: Number,
      default: 0
    },
    averageSessionDuration: {
      type: Number, // in minutes
      default: 0
    },
    popularityScore: {
      type: Number,
      default: 0
    },
    lastUsed: Date
  },
  
  // User Feedback and Ratings
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  
  reviews: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
    comment: {
      type: String,
      maxLength: 500
    },
    pros: [String],
    cons: [String],
    wouldRecommend: {
      type: Boolean,
      default: true
    },
    usageContext: {
      type: String,
      enum: ['personal-study', 'group-project', 'research', 'teaching', 'presentation']
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    helpful: {
      type: Number,
      default: 0
    }
  }],
  
  // Technical Requirements
  technicalRequirements: {
    browsers: [String],
    operatingSystems: [String],
    minRAM: String,
    minStorage: String,
    internetRequired: {
      type: Boolean,
      default: true
    },
    minBandwidth: String,
    plugins: [String],
    mobileSupported: {
      type: Boolean,
      default: true
    }
  },
  
  // Maintenance and Updates
  maintenance: {
    version: {
      type: String,
      default: '1.0.0'
    },
    lastUpdated: Date,
    updateFrequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'quarterly', 'annually', 'as-needed']
    },
    changeLog: [{
      version: String,
      changes: [String],
      date: {
        type: Date,
        default: Date.now
      },
      isBreaking: {
        type: Boolean,
        default: false
      }
    }],
    knownIssues: [{
      description: String,
      severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical']
      },
      workaround: String,
      reportedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  
  // Publishing and Management
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    validate: {
      validator: async function(userId) {
        const User = mongoose.model('User');
        const user = await User.findById(userId);
        return user && user.role === 'superAdmin';
      },
      message: 'Only super admins can create tools and resources'
    }
  },
  
  status: {
    type: String,
    enum: ['draft', 'testing', 'published', 'maintenance', 'deprecated'],
    default: 'draft'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  publishedAt: Date,
  
  // SEO and Discovery
  tags: [String],
  keywords: [String],
  relatedTools: [{
    type: Schema.Types.ObjectId,
    ref: 'ToolsAndResources'
  }],
  
  // Usage Statistics by User
  userSessions: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    sessionStart: {
      type: Date,
      default: Date.now
    },
    sessionEnd: Date,
    duration: Number, // in minutes
    actionsPerformed: Number,
    completionStatus: {
      type: String,
      enum: ['completed', 'abandoned', 'interrupted']
    },
    feedback: {
      helpful: Boolean,
      easyToUse: Boolean,
      comments: String
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
resourceSchema.index({ type: 1, category: 1, status: 1 });
resourceSchema.index({ title: 'text', description: 'text', tags: 'text' });
resourceSchema.index({ createdBy: 1, status: 1 });
resourceSchema.index({ 'rating.average': -1 });
resourceSchema.index({ 'usage.popularityScore': -1 });
resourceSchema.index({ isFeatured: 1, status: 1 });
resourceSchema.index({ publishedAt: -1 });
resourceSchema.index({ 'educational.subjects': 1 });

// Virtual properties
resourceSchema.virtual('averageRating').get(function() {
  return Math.round(this.rating.average * 10) / 10;
});

resourceSchema.virtual('reviewCount').get(function() {
  return this.reviews.length;
});

resourceSchema.virtual('isPopular').get(function() {
  return this.usage.totalUsers > 100 && this.rating.average > 4.0;
});

resourceSchema.virtual('uptimePercentage').get(function() {
  // Calculate based on maintenance windows and known issues
  const criticalIssues = this.maintenance.knownIssues.filter(issue => 
    issue.severity === 'critical'
  ).length;
  
  return Math.max(0, 100 - (criticalIssues * 10));
});

// Instance Methods
resourceSchema.methods.recordUsage = async function(userId, sessionData) {
  // Update usage statistics
  this.usage.totalViews += 1;
  if (userId && !this.userSessions.find(session => 
    session.user.toString() === userId.toString() && 
    !session.sessionEnd
  )) {
    this.usage.totalUsers += 1;
  }
  
  this.usage.totalSessions += 1;
  this.usage.lastUsed = new Date();
  
  // Add user session if provided
  if (userId && sessionData) {
    this.userSessions.push({
      user: userId,
      ...sessionData
    });
    
    // Update average session duration
    const completedSessions = this.userSessions.filter(session => session.duration);
    if (completedSessions.length > 0) {
      this.usage.averageSessionDuration = completedSessions.reduce((sum, session) => 
        sum + session.duration, 0) / completedSessions.length;
    }
  }
  
  // Update popularity score (combination of usage and rating)
  this.usage.popularityScore = this.calculatePopularityScore();
  
  return this.save();
};

resourceSchema.methods.calculatePopularityScore = function() {
  const usageWeight = 0.4;
  const ratingWeight = 0.6;
  
  // Normalize usage (logarithmic scale to handle large numbers)
  const normalizedUsage = Math.log10(Math.max(1, this.usage.totalUsers)) / 4; // Max score of 1 at 10k users
  
  // Normalize rating (0-5 to 0-1)
  const normalizedRating = this.rating.average / 5;
  
  return Math.round((normalizedUsage * usageWeight + normalizedRating * ratingWeight) * 100);
};

resourceSchema.methods.addReview = async function(userId, reviewData) {
  // Remove existing review from same user
  this.reviews = this.reviews.filter(review => 
    review.user.toString() !== userId.toString()
  );
  
  // Add new review
  this.reviews.push({
    user: userId,
    ...reviewData
  });
  
  // Update average rating
  this.rating.count = this.reviews.length;
  this.rating.average = this.reviews.reduce((sum, review) => 
    sum + review.rating, 0) / this.reviews.length;
  
  // Update popularity score
  this.usage.popularityScore = this.calculatePopularityScore();
  
  return this.save();
};

resourceSchema.methods.reportIssue = async function(issueData) {
  this.maintenance.knownIssues.push(issueData);
  return this.save();
};

resourceSchema.methods.updateVersion = async function(newVersion, changes) {
  this.maintenance.changeLog.push({
    version: newVersion,
    changes,
    date: new Date()
  });
  
  this.maintenance.version = newVersion;
  this.maintenance.lastUpdated = new Date();
  
  return this.save();
};

resourceSchema.methods.getCompatibilityScore = function(userAgent, requirements) {
  let score = 100;
  
  // Check browser compatibility
  if (this.technicalRequirements.browsers.length > 0) {
    // Implementation would check if user's browser is in supported list
    // For now, assume compatibility
  }
  
  // Check mobile support
  if (!this.technicalRequirements.mobileSupported && /mobile/i.test(userAgent)) {
    score -= 30;
  }
  
  return Math.max(0, score);
};

// Static Methods
resourceSchema.statics.getPublishedTools = function(filters = {}) {
  const query = { 
    status: 'published', 
    isActive: true,
    'permissions.visitorAccess': true
  };
  
  if (filters.type) query.type = filters.type;
  if (filters.category) query.category = filters.category;
  if (filters.access) query.access = filters.access;
  if (filters.subjects) {
    query['educational.subjects'] = { $in: filters.subjects };
  }
  
  return this.find(query)
    .populate('createdBy', 'name')
    .sort({ isFeatured: -1, 'usage.popularityScore': -1 });
};

resourceSchema.statics.getFeaturedTools = function(limit = 6) {
  return this.find({ 
    status: 'published', 
    isActive: true, 
    isFeatured: true,
    'permissions.visitorAccess': true
  })
    .populate('createdBy', 'name')
    .sort({ 'usage.popularityScore': -1 })
    .limit(limit);
};

resourceSchema.statics.getPopularTools = function(limit = 10) {
  return this.find({ 
    status: 'published', 
    isActive: true,
    'permissions.visitorAccess': true
  })
    .populate('createdBy', 'name')
    .sort({ 'usage.popularityScore': -1, 'rating.average': -1 })
    .limit(limit);
};

resourceSchema.statics.searchTools = function(searchTerm, filters = {}) {
  let query = { 
    status: 'published', 
    isActive: true,
    'permissions.visitorAccess': true
  };
  
  if (searchTerm) {
    query.$text = { $search: searchTerm };
  }
  
  if (filters.type) query.type = filters.type;
  if (filters.category) query.category = filters.category;
  if (filters.access) query.access = filters.access;
  if (filters.tags && filters.tags.length > 0) {
    query.tags = { $in: filters.tags };
  }
  
  return this.find(query)
    .populate('createdBy', 'name')
    .sort(searchTerm ? { score: { $meta: 'textScore' } } : { 'usage.popularityScore': -1 });
};

resourceSchema.statics.getToolsByCategory = function() {
  return this.aggregate([
    { $match: { status: 'published', isActive: true, 'permissions.visitorAccess': true } },
    {
      $group: {
        _id: '$category',
        tools: { $push: '$$ROOT' },
        count: { $sum: 1 },
        averageRating: { $avg: '$rating.average' }
      }
    },
    { $sort: { count: -1 } }
  ]);
};

// Pre-save middleware
resourceSchema.pre('save', function(next) {
  // Set published date when first published
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  // Update popularity score when relevant fields change
  if (this.isModified('usage') || this.isModified('rating')) {
    this.usage.popularityScore = this.calculatePopularityScore();
  }
  
  next();
});

module.exports = mongoose.model('ToolsAndResources', resourceSchema);
