const mongoose = require('mongoose');

const advancedArtifactSchema = new mongoose.Schema({
  // Basic artifact information (extends existing Artifact model)
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: true,
    maxlength: [5000, 'Description cannot exceed 5000 characters']
  },
  category: {
    type: String,
    required: true,
    enum: [
      'paintings', 'sculptures', 'manuscripts', 'jewelry', 'textiles', 
      'pottery', 'weapons', 'coins', 'religious', 'archaeological', 
      'ethnographic', 'photographs', 'documents', 'fossils', 'minerals'
    ]
  },
  museum: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Museum',
    required: true,
    index: true
  },
  
  // Advanced Features
  
  // AI-Powered Analysis
  aiAnalysis: {
    objectDetection: [{
      label: String,
      confidence: Number,
      boundingBox: {
        x: Number,
        y: Number,
        width: Number,
        height: Number
      }
    }],
    colorPalette: [{
      color: String,
      percentage: Number,
      hex: String
    }],
    styleAnalysis: {
      period: String,
      style: String,
      confidence: Number,
      similarArtifacts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Artifact' }]
    },
    textExtraction: {
      extractedText: String,
      language: String,
      confidence: Number
    },
    contentTags: [{
      tag: String,
      confidence: Number,
      category: String
    }],
    analysisDate: Date,
    version: String
  },

  // Condition and Conservation
  condition: {
    overall: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor', 'critical'],
      default: 'good'
    },
    detailed: {
      physical: {
        cracks: { type: Boolean, default: false },
        chips: { type: Boolean, default: false },
        stains: { type: Boolean, default: false },
        fading: { type: Boolean, default: false },
        corrosion: { type: Boolean, default: false }
      },
      structural: {
        stable: { type: Boolean, default: true },
        loose: { type: Boolean, default: false },
        separated: { type: Boolean, default: false }
      }
    },
    lastInspection: Date,
    nextInspection: Date,
    inspectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    conservationHistory: [{
      date: Date,
      treatment: String,
      conservator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      notes: String,
      beforeImages: [String],
      afterImages: [String],
      cost: Number
    }],
    environmentalRequirements: {
      temperature: {
        min: Number,
        max: Number,
        optimal: Number
      },
      humidity: {
        min: Number,
        max: Number,
        optimal: Number
      },
      lightLevel: {
        max: Number,
        unit: { type: String, default: 'lux' }
      },
      specialRequirements: [String]
    }
  },

  // Provenance and Documentation
  provenance: {
    acquisition: {
      method: {
        type: String,
        enum: ['purchase', 'donation', 'exchange', 'loan', 'bequest', 'transfer', 'found', 'excavation']
      },
      date: Date,
      source: String,
      price: Number,
      currency: String,
      receipt: String, // file path
      documentation: [String] // file paths
    },
    previousOwners: [{
      name: String,
      period: {
        from: Date,
        to: Date
      },
      location: String,
      documentation: [String]
    }],
    exhibitions: [{
      name: String,
      venue: String,
      startDate: Date,
      endDate: Date,
      catalogNumber: String,
      loanAgreement: String
    }],
    publications: [{
      title: String,
      author: String,
      publication: String,
      year: Number,
      page: String,
      type: { type: String, enum: ['book', 'article', 'catalog', 'website'] }
    }],
    researchNotes: [{
      date: Date,
      researcher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      notes: String,
      attachments: [String]
    }]
  },

  // Digital Asset Management
  digitalAssets: {
    primaryImage: {
      url: String,
      filename: String,
      size: Number,
      dimensions: {
        width: Number,
        height: Number
      },
      format: String,
      quality: String,
      colorSpace: String
    },
    additionalImages: [{
      url: String,
      filename: String,
      type: { type: String, enum: ['detail', 'alternate_view', 'reverse', 'process', 'conservation'] },
      description: String,
      size: Number,
      dimensions: {
        width: Number,
        height: Number
      }
    }],
    threeDModel: {
      url: String,
      format: String,
      size: Number,
      vertices: Number,
      polygons: Number,
      quality: String,
      createdBy: String,
      createdDate: Date
    },
    videos: [{
      url: String,
      title: String,
      description: String,
      duration: Number,
      format: String,
      size: Number,
      thumbnail: String
    }],
    documents: [{
      title: String,
      type: { type: String, enum: ['research', 'conservation', 'loan', 'insurance', 'appraisal'] },
      url: String,
      filename: String,
      uploadDate: Date,
      size: Number
    }]
  },

  // Location and Display
  location: {
    current: {
      building: String,
      floor: String,
      room: String,
      case: String,
      shelf: String,
      position: String,
      coordinates: {
        x: Number,
        y: Number,
        z: Number
      }
    },
    storage: {
      facility: String,
      room: String,
      cabinet: String,
      drawer: String,
      box: String,
      coordinates: String
    },
    isOnDisplay: { type: Boolean, default: false },
    displayHistory: [{
      location: String,
      startDate: Date,
      endDate: Date,
      exhibition: String,
      notes: String
    }]
  },

  // Advanced Metadata
  technicalSpecs: {
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
      depth: Number,
      diameter: Number,
      weight: Number,
      unit: { type: String, default: 'cm' }
    },
    materials: [{
      primary: String,
      secondary: [String],
      technique: String,
      analysis: {
        method: String,
        result: String,
        date: Date,
        analyst: String
      }
    }],
    dating: {
      period: String,
      century: String,
      yearFrom: Number,
      yearTo: Number,
      circa: Boolean,
      datingMethod: String,
      confidence: {
        type: String,
        enum: ['certain', 'probable', 'possible', 'uncertain']
      }
    },
    origin: {
      culture: String,
      region: String,
      country: String,
      city: String,
      site: String,
      coordinates: {
        latitude: Number,
        longitude: Number
      }
    }
  },

  // Insurance and Valuation
  valuation: {
    currentValue: Number,
    currency: { type: String, default: 'ETB' },
    valuationDate: Date,
    valuedBy: String,
    method: String,
    purpose: { type: String, enum: ['insurance', 'loan', 'sale', 'tax', 'donation'] },
    history: [{
      value: Number,
      date: Date,
      valuedBy: String,
      notes: String
    }]
  },
  insurance: {
    policyNumber: String,
    provider: String,
    coverage: Number,
    deductible: Number,
    startDate: Date,
    endDate: Date,
    notes: String,
    claimHistory: [{
      date: Date,
      type: String,
      amount: Number,
      status: String,
      notes: String
    }]
  },

  // Access and Rights
  rights: {
    copyright: {
      owner: String,
      status: { type: String, enum: ['copyrighted', 'public_domain', 'creative_commons', 'unknown'] },
      license: String,
      expiryDate: Date
    },
    usage: {
      research: { type: Boolean, default: true },
      education: { type: Boolean, default: true },
      commercial: { type: Boolean, default: false },
      reproduction: { type: Boolean, default: false }
    },
    restrictions: [{
      type: String,
      description: String,
      expiryDate: Date
    }]
  },

  // Analytics and Engagement
  analytics: {
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    downloads: { type: Number, default: 0 },
    bookmarks: { type: Number, default: 0 },
    averageViewTime: { type: Number, default: 0 },
    searchRanking: { type: Number, default: 0 },
    popularityScore: { type: Number, default: 0 },
    lastViewed: Date,
    viewHistory: [{
      date: Date,
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      duration: Number,
      device: String,
      source: String
    }]
  },

  // Workflow and Status
  workflow: {
    status: {
      type: String,
      enum: ['draft', 'under_review', 'approved', 'published', 'archived', 'deaccessioned'],
      default: 'draft'
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    submissionDate: Date,
    reviewDate: Date,
    approvalDate: Date,
    publicationDate: Date,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    deadline: Date,
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    workflowHistory: [{
      status: String,
      date: Date,
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      notes: String
    }]
  },

  // Multilingual Support
  translations: [{
    language: {
      type: String,
      enum: ['en', 'am', 'or', 'ti']
    },
    title: String,
    description: String,
    keywords: [String],
    translator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    translationDate: Date,
    status: {
      type: String,
      enum: ['pending', 'approved', 'needs_revision'],
      default: 'pending'
    }
  }],

  // Tags and Keywords
  keywords: [String],
  tags: [{
    name: String,
    type: { type: String, enum: ['subject', 'style', 'period', 'technique', 'material', 'custom'] },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    confidence: Number
  }],

  // Relationships
  relationships: {
    partOf: { type: mongoose.Schema.Types.ObjectId, ref: 'Artifact' },
    relatedItems: [{
      artifact: { type: mongoose.Schema.Types.ObjectId, ref: 'Artifact' },
      relationship: { type: String, enum: ['similar', 'paired', 'series', 'variant', 'copy', 'inspiration'] },
      strength: Number
    }]
  },

  // System fields
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  isHighlight: { type: Boolean, default: false },
  visibility: {
    type: String,
    enum: ['public', 'restricted', 'private', 'staff_only'],
    default: 'public'
  }

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
advancedArtifactSchema.index({ museum: 1, status: 1 });
advancedArtifactSchema.index({ title: 'text', description: 'text', keywords: 'text' });
advancedArtifactSchema.index({ category: 1, 'workflow.status': 1 });
advancedArtifactSchema.index({ 'location.current.isOnDisplay': 1 });
advancedArtifactSchema.index({ 'analytics.popularityScore': -1 });
advancedArtifactSchema.index({ 'valuation.currentValue': -1 });
advancedArtifactSchema.index({ 'technicalSpecs.dating.yearFrom': 1, 'technicalSpecs.dating.yearTo': 1 });
advancedArtifactSchema.index({ 'provenance.acquisition.date': 1 });

// Virtual fields
advancedArtifactSchema.virtual('age').get(function() {
  if (this.technicalSpecs.dating.yearTo) {
    return new Date().getFullYear() - this.technicalSpecs.dating.yearTo;
  }
  return null;
});

advancedArtifactSchema.virtual('isOverdue').get(function() {
  return this.workflow.deadline && new Date() > this.workflow.deadline;
});

// Static methods
advancedArtifactSchema.statics.getByMuseum = function(museumId, options = {}) {
  const query = { museum: museumId };
  if (options.status) query['workflow.status'] = options.status;
  if (options.category) query.category = options.category;
  if (options.onDisplay !== undefined) query['location.current.isOnDisplay'] = options.onDisplay;
  
  return this.find(query)
    .populate('museum', 'name')
    .populate('workflow.assignedTo', 'name email')
    .sort(options.sort || { 'analytics.popularityScore': -1 });
};

advancedArtifactSchema.statics.search = function(query, options = {}) {
  const searchQuery = {
    $and: [
      { 'workflow.status': { $in: ['approved', 'published'] } },
      {
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { keywords: { $in: [new RegExp(query, 'i')] } },
          { 'tags.name': { $regex: query, $options: 'i' } }
        ]
      }
    ]
  };

  if (options.museum) searchQuery.$and.push({ museum: options.museum });
  if (options.category) searchQuery.$and.push({ category: options.category });
  
  return this.find(searchQuery)
    .populate('museum', 'name')
    .limit(options.limit || 50)
    .sort({ 'analytics.popularityScore': -1, score: { $meta: 'textScore' } });
};

advancedArtifactSchema.statics.getPopular = function(museumId = null, limit = 10) {
  const query = {
    'workflow.status': 'published',
    'location.current.isOnDisplay': true
  };
  
  if (museumId) query.museum = museumId;
  
  return this.find(query)
    .populate('museum', 'name')
    .sort({ 'analytics.popularityScore': -1, 'analytics.views': -1 })
    .limit(limit);
};

// Instance methods
advancedArtifactSchema.methods.updateAnalytics = function(action, userId = null, duration = null) {
  switch (action) {
    case 'view':
      this.analytics.views += 1;
      this.analytics.lastViewed = new Date();
      if (duration) this.analytics.averageViewTime = 
        (this.analytics.averageViewTime + duration) / 2;
      break;
    case 'like':
      this.analytics.likes += 1;
      break;
    case 'share':
      this.analytics.shares += 1;
      break;
    case 'download':
      this.analytics.downloads += 1;
      break;
    case 'bookmark':
      this.analytics.bookmarks += 1;
      break;
  }
  
  // Update popularity score (weighted algorithm)
  this.analytics.popularityScore = 
    (this.analytics.views * 1) +
    (this.analytics.likes * 5) +
    (this.analytics.shares * 10) +
    (this.analytics.downloads * 3) +
    (this.analytics.bookmarks * 7);
  
  if (userId && duration) {
    this.analytics.viewHistory.push({
      date: new Date(),
      user: userId,
      duration: duration,
      device: 'web', // This could be determined from user agent
      source: 'direct'
    });
  }
  
  return this.save();
};

advancedArtifactSchema.methods.updateWorkflowStatus = function(status, userId, notes = '') {
  const oldStatus = this.workflow.status;
  this.workflow.status = status;
  
  // Update relevant dates and users
  switch (status) {
    case 'under_review':
      this.workflow.submissionDate = new Date();
      this.workflow.submittedBy = userId;
      break;
    case 'approved':
      this.workflow.reviewDate = new Date();
      this.workflow.reviewedBy = userId;
      break;
    case 'published':
      this.workflow.approvalDate = new Date();
      this.workflow.approvedBy = userId;
      this.workflow.publicationDate = new Date();
      break;
  }
  
  // Add to workflow history
  this.workflow.workflowHistory.push({
    status: oldStatus,
    date: new Date(),
    user: userId,
    notes: notes
  });
  
  return this.save();
};

module.exports = mongoose.model('AdvancedArtifact', advancedArtifactSchema);
