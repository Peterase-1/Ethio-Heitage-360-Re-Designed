const mongoose = require('mongoose');

const heritageSiteSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Site name is required'],
    trim: true,
    maxLength: [200, 'Site name cannot exceed 200 characters']
  },
  localName: {
    type: String,
    trim: true,
    maxLength: [200, 'Local name cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxLength: [5000, 'Description cannot exceed 5000 characters']
  },
  shortDescription: {
    type: String,
    maxLength: [500, 'Short description cannot exceed 500 characters']
  },
  significance: {
    type: String,
    required: [true, 'Historical significance is required'],
    maxLength: [2000, 'Significance cannot exceed 2000 characters']
  },

  // Classification
  type: {
    type: String,
    required: [true, 'Site type is required'],
    enum: {
      values: ['Archaeological', 'Historical', 'Religious', 'Natural', 'Cultural', 'Mixed'],
      message: 'Please select a valid site type'
    }
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: [
        'Ancient Ruins', 'Churches & Monasteries', 'Palaces & Castles', 'Rock Art Sites',
        'Burial Sites', 'Archaeological Sites', 'Museums', 'Cultural Landscapes',
        'Traditional Architecture', 'Natural Monuments', 'National Parks',
        'Religious Centers', 'Historical Cities', 'Trading Posts', 'Other'
      ],
      message: 'Please select a valid category'
    }
  },
  designation: {
    type: String,
    required: [true, 'Designation is required'],
    enum: {
      values: ['UNESCO World Heritage', 'National Heritage', 'Regional Heritage', 'Local Heritage', 'Proposed'],
      message: 'Please select a valid designation'
    }
  },
  unescoId: {
    type: String,
    unique: true,
    sparse: true // Allows null values but ensures uniqueness when present
  },

  // Location Information
  location: {
    region: {
      type: String,
      required: [true, 'Region is required'],
      enum: {
        values: [
          'Addis Ababa', 'Afar', 'Amhara', 'Benishangul-Gumuz', 'Dire Dawa',
          'Gambela', 'Harari', 'Oromia', 'Sidama', 'SNNPR', 'Somali', 'Tigray'
        ],
        message: 'Please select a valid region'
      }
    },
    zone: {
      type: String,
      required: [true, 'Zone/Special Woreda is required']
    },
    woreda: {
      type: String,
      required: [true, 'Woreda is required']
    },
    city: {
      type: String,
      required: [true, 'Nearest city is required']
    },
    coordinates: {
      latitude: {
        type: Number,
        required: [true, 'Latitude is required'],
        min: [-90, 'Latitude must be between -90 and 90'],
        max: [90, 'Latitude must be between -90 and 90']
      },
      longitude: {
        type: Number,
        required: [true, 'Longitude is required'],
        min: [-180, 'Longitude must be between -180 and 180'],
        max: [180, 'Longitude must be between -180 and 180']
      }
    },
    altitude: {
      type: Number,
      min: [-500, 'Altitude cannot be less than -500 meters'],
      max: [5000, 'Altitude cannot exceed 5000 meters']
    },
    accessibility: {
      type: String,
      enum: ['Easy', 'Moderate', 'Difficult', 'Very Difficult'],
      default: 'Moderate'
    },
    nearbyLandmarks: [String]
  },

  // Historical Information
  history: {
    established: {
      type: String,
      maxLength: [200, 'Establishment info cannot exceed 200 characters']
    },
    period: {
      type: String,
      enum: [
        'Prehistoric', 'Ancient (before 300 AD)', 'Aksumite (100-900 AD)',
        'Zagwe (900-1270 AD)', 'Solomonic (1270-1974)', 'Modern (1974-present)', 'Multiple Periods'
      ]
    },
    civilization: {
      type: String,
      maxLength: [200, 'Civilization info cannot exceed 200 characters']
    },
    dynasty: {
      type: String,
      maxLength: [200, 'Dynasty info cannot exceed 200 characters']
    },
    archaeologist: {
      type: String,
      maxLength: [200, 'Archaeologist name cannot exceed 200 characters']
    },
    excavationYear: {
      type: Number,
      min: [1800, 'Excavation year cannot be before 1800'],
      max: [new Date().getFullYear(), 'Excavation year cannot be in the future']
    },
    discoveryStory: {
      type: String,
      maxLength: [1000, 'Discovery story cannot exceed 1000 characters']
    }
  },

  // Physical Characteristics
  features: {
    area: {
      type: Number,
      min: [0, 'Area cannot be negative'],
      description: 'Area in hectares'
    },
    structures: [{
      type: String,
      enum: [
        'Obelisks', 'Churches', 'Monasteries', 'Palaces', 'Tombs', 'Caves',
        'Rock Carvings', 'Stone Circles', 'Terraces', 'Walls', 'Foundations',
        'Artifacts', 'Natural Formations', 'Other'
      ]
    }],
    materials: [{
      type: String,
      enum: [
        'Stone', 'Rock-hewn', 'Mud Brick', 'Fired Brick', 'Wood', 'Metal',
        'Plaster', 'Paint', 'Natural Rock', 'Coral', 'Other'
      ]
    }],
    condition: {
      type: String,
      required: [true, 'Condition assessment is required'],
      enum: ['Excellent', 'Good', 'Fair', 'Poor', 'Critical'],
      default: 'Good'
    },
    threats: [{
      type: String,
      enum: [
        'Weathering', 'Human Activity', 'Construction', 'Agriculture',
        'Tourism Pressure', 'Vandalism', 'Natural Disasters', 'Pollution',
        'Lack of Maintenance', 'Armed Conflict', 'Other'
      ]
    }],
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
      depth: Number
    }
  },

  // Visitor Information
  visitorInfo: {
    isOpen: {
      type: Boolean,
      default: true
    },
    visitingHours: {
      type: String,
      default: 'Daily 8:00 AM - 6:00 PM'
    },
    entryFee: {
      local: {
        type: Number,
        default: 0,
        min: [0, 'Entry fee cannot be negative']
      },
      foreign: {
        type: Number,
        default: 0,
        min: [0, 'Entry fee cannot be negative']
      },
      student: {
        type: Number,
        default: 0,
        min: [0, 'Entry fee cannot be negative']
      },
      currency: {
        type: String,
        enum: ['ETB', 'USD'],
        default: 'ETB'
      }
    },
    guidedTours: {
      available: {
        type: Boolean,
        default: false
      },
      cost: Number,
      languages: [{
        type: String,
        enum: ['Amharic', 'English', 'Oromo', 'Tigrinya', 'Arabic', 'French', 'German', 'Italian']
      }],
      duration: String
    },
    facilities: [{
      type: String,
      enum: [
        'Parking', 'Restrooms', 'Gift Shop', 'Cafe/Restaurant', 'Information Center',
        'Museum', 'Accommodation', 'Transportation', 'First Aid', 'WiFi', 'ATM'
      ]
    }],
    bestVisitTime: {
      type: String,
      default: 'Year-round'
    },
    restrictions: {
      type: String,
      maxLength: [500, 'Restrictions cannot exceed 500 characters']
    },
    safetyInfo: {
      type: String,
      maxLength: [500, 'Safety info cannot exceed 500 characters']
    }
  },

  // Media Assets
  media: {
    coverImage: {
      type: String,
      description: 'Main site image URL'
    },
    images: [{
      url: {
        type: String,
        required: true
      },
      caption: String,
      photographer: String,
      dateTaken: Date,
      category: {
        type: String,
        enum: ['General', 'Architecture', 'Artifacts', 'Landscape', 'People', 'Events']
      }
    }],
    videos: [{
      url: String,
      title: String,
      duration: String,
      description: String
    }],
    virtualTour: {
      type: String,
      description: '360° virtual tour URL'
    },
    audioGuide: [{
      language: String,
      url: String,
      duration: String
    }],
    documentaries: [{
      title: String,
      url: String,
      duration: String,
      language: String,
      year: Number
    }]
  },

  // Cultural Information
  cultural: {
    associatedGroups: [{
      type: String,
      description: 'Associated ethnic or cultural groups'
    }],
    traditions: [{
      type: String,
      description: 'Associated cultural traditions'
    }],
    festivals: [{
      name: String,
      date: String,
      description: String
    }],
    legends: {
      type: String,
      maxLength: [2000, 'Legends cannot exceed 2000 characters']
    },
    rituals: {
      type: String,
      maxLength: [1000, 'Rituals description cannot exceed 1000 characters']
    },
    religiousSignificance: {
      type: String,
      maxLength: [1000, 'Religious significance cannot exceed 1000 characters']
    }
  },

  // Conservation Status
  conservation: {
    status: {
      type: String,
      required: [true, 'Conservation status is required'],
      enum: ['Excellent', 'Good', 'At Risk', 'In Danger', 'Critical'],
      default: 'Good'
    },
    threats: [{
      type: String,
      severity: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Critical']
      },
      description: String
    }],
    projects: [{
      name: String,
      description: String,
      startDate: Date,
      endDate: Date,
      budget: Number,
      status: {
        type: String,
        enum: ['Planned', 'Ongoing', 'Completed', 'Suspended']
      }
    }],
    funding: [{
      source: String,
      amount: Number,
      year: Number,
      purpose: String
    }],
    lastAssessment: Date,
    nextAssessment: Date,
    recommendations: [{
      priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Urgent']
      },
      action: String,
      timeline: String,
      estimatedCost: Number
    }]
  },

  // Research & Documentation
  research: {
    publications: [{
      title: String,
      authors: [String],
      journal: String,
      year: Number,
      url: String,
      doi: String
    }],
    scholars: [{
      name: String,
      institution: String,
      expertise: String,
      contact: String
    }],
    ongoingStudies: [{
      title: String,
      institution: String,
      startDate: Date,
      expectedCompletion: Date,
      description: String
    }],
    discoveries: [{
      date: Date,
      description: String,
      significance: String,
      discoveredBy: String
    }],
    archives: [{
      location: String,
      description: String,
      contact: String
    }]
  },

  // Tourism Impact
  tourism: {
    annualVisitors: {
      type: Number,
      default: 0,
      min: [0, 'Annual visitors cannot be negative']
    },
    monthlyVisitors: [{
      month: {
        type: String,
        enum: ['January', 'February', 'March', 'April', 'May', 'June',
               'July', 'August', 'September', 'October', 'November', 'December']
      },
      count: Number,
      year: Number
    }],
    economicImpact: {
      type: Number,
      description: 'Annual economic impact in ETB'
    },
    employmentGenerated: {
      type: Number,
      description: 'Number of jobs created'
    },
    tourismGrowth: {
      type: Number,
      description: 'Year-over-year growth percentage'
    },
    seasonality: {
      peakSeason: String,
      offSeason: String,
      description: String
    }
  },

  // Management Information
  management: {
    authority: {
      type: String,
      required: [true, 'Managing authority is required'],
      enum: [
        'Authority for Research and Conservation of Cultural Heritage (ARCCH)',
        'Ethiopian Orthodox Church', 'Regional Culture Bureau', 'Local Administration',
        'International Organization', 'Private Foundation', 'Community-based'
      ]
    },
    contactPerson: {
      name: String,
      title: String,
      email: String,
      phone: String
    },
    lastInspection: Date,
    nextInspection: Date,
    managementPlan: {
      url: String,
      lastUpdated: Date,
      nextReview: Date
    },
    budget: {
      annual: Number,
      currency: {
        type: String,
        enum: ['ETB', 'USD'],
        default: 'ETB'
      },
      year: Number
    }
  },

  // Digital Presence
  digitalPresence: {
    website: String,
    socialMedia: {
      facebook: String,
      twitter: String,
      instagram: String,
      youtube: String
    },
    onlineResources: [{
      title: String,
      url: String,
      type: String,
      description: String
    }]
  },

  // Collaboration & Partnerships
  partnerships: [{
    partner: String,
    type: {
      type: String,
      enum: ['Government', 'International Organization', 'Academic Institution', 'Private Sector', 'NGO']
    },
    description: String,
    startDate: Date,
    endDate: Date,
    contact: String
  }],

  // Proposal Information (for suggested sites)
  proposal: {
    proposedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    proposalDate: Date,
    justification: {
      type: String,
      maxLength: [2000, 'Justification cannot exceed 2000 characters']
    },
    evidence: [{
      type: String,
      description: String
    }],
    status: {
      type: String,
      enum: ['pending', 'under_review', 'approved', 'rejected'],
      default: 'pending'
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewDate: Date,
    reviewComments: String
  },

  // System Fields
  status: {
    type: String,
    enum: ['active', 'under_construction', 'closed', 'restricted', 'proposed'],
    default: 'active',
    required: true
  },
  verified: {
    type: Boolean,
    default: false
  },
  featured: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },

  // Metadata
  tags: [String],
  keywords: [String],
  language: {
    type: String,
    enum: ['en', 'am', 'om', 'ti'],
    default: 'en'
  },
  
  // Administrative
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  deletedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance and geospatial queries
heritageSiteSchema.index({ 'location.coordinates.latitude': 1, 'location.coordinates.longitude': 1 });
heritageSiteSchema.index({ 'location.region': 1 });
heritageSiteSchema.index({ type: 1, category: 1 });
heritageSiteSchema.index({ status: 1 });
heritageSiteSchema.index({ designation: 1 });
heritageSiteSchema.index({ verified: 1, featured: 1 });
heritageSiteSchema.index({ 'proposal.status': 1 });
heritageSiteSchema.index({ name: 'text', description: 'text', significance: 'text' });
heritageSiteSchema.index({ createdAt: -1 });

// Compound indexes
heritageSiteSchema.index({ status: 1, verified: 1, featured: 1 });
heritageSiteSchema.index({ 'location.region': 1, type: 1 });

// 2dsphere index for geospatial queries
heritageSiteSchema.index({
  'location.coordinates': '2dsphere'
});

// Virtual for full location name
heritageSiteSchema.virtual('fullLocation').get(function() {
  return `${this.location.city}, ${this.location.woreda}, ${this.location.zone}, ${this.location.region}`;
});

// Virtual for coordinate string
heritageSiteSchema.virtual('coordinateString').get(function() {
  return `${this.location.coordinates.latitude}, ${this.location.coordinates.longitude}`;
});

// Virtual for tourism rating
heritageSiteSchema.virtual('tourismRating').get(function() {
  const baseScore = 3; // Base score
  let score = baseScore;
  
  if (this.designation === 'UNESCO World Heritage') score += 2;
  else if (this.designation === 'National Heritage') score += 1;
  
  if (this.visitorInfo.guidedTours.available) score += 0.5;
  if (this.facilities && this.facilities.length > 5) score += 0.5;
  if (this.conservation.status === 'Excellent') score += 1;
  else if (this.conservation.status === 'Good') score += 0.5;
  
  return Math.min(5, Math.max(1, score));
});

// Pre-save middleware
heritageSiteSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Auto-generate tags based on content
  if (!this.tags || this.tags.length === 0) {
    this.tags = [
      this.type.toLowerCase(),
      this.category.toLowerCase(),
      this.location.region.toLowerCase()
    ];
  }
  
  // Set UNESCO ID if designation is UNESCO
  if (this.designation === 'UNESCO World Heritage' && !this.unescoId) {
    // This would normally be set by an admin
    this.unescoId = `ET-${Date.now()}`;
  }
  
  next();
});

// Query middleware to exclude soft deleted sites
heritageSiteSchema.pre(/^find/, function(next) {
  this.where({ deletedAt: null });
  next();
});

// Instance Methods

// Method to add visitor count
heritageSiteSchema.methods.addVisitorCount = function(month, year, count) {
  const existingEntry = this.tourism.monthlyVisitors.find(
    v => v.month === month && v.year === year
  );
  
  if (existingEntry) {
    existingEntry.count = count;
  } else {
    this.tourism.monthlyVisitors.push({ month, year, count });
  }
  
  // Update annual visitors
  const currentYearVisitors = this.tourism.monthlyVisitors
    .filter(v => v.year === year)
    .reduce((sum, v) => sum + (v.count || 0), 0);
  
  this.tourism.annualVisitors = currentYearVisitors;
  
  return this.save();
};

// Method to add conservation project
heritageSiteSchema.methods.addConservationProject = function(project) {
  this.conservation.projects.push(project);
  return this.save();
};

// Method to update condition
heritageSiteSchema.methods.updateCondition = function(newCondition, assessorId) {
  this.features.condition = newCondition;
  this.conservation.lastAssessment = new Date();
  this.updatedBy = assessorId;
  return this.save();
};

// Method to approve proposal
heritageSiteSchema.methods.approveProposal = function(reviewerId, comments = '') {
  this.proposal.status = 'approved';
  this.proposal.reviewedBy = reviewerId;
  this.proposal.reviewDate = new Date();
  this.proposal.reviewComments = comments;
  this.status = 'active';
  this.verified = true;
  return this.save();
};

// Method to reject proposal
heritageSiteSchema.methods.rejectProposal = function(reviewerId, comments) {
  this.proposal.status = 'rejected';
  this.proposal.reviewedBy = reviewerId;
  this.proposal.reviewDate = new Date();
  this.proposal.reviewComments = comments;
  return this.save();
};

// Method to soft delete
heritageSiteSchema.methods.softDelete = function() {
  this.deletedAt = new Date();
  this.status = 'closed';
  return this.save();
};

// Static Methods

// Find sites by region
heritageSiteSchema.statics.findByRegion = function(region) {
  return this.find({ 'location.region': region, status: 'active', verified: true });
};

// Find sites by type
heritageSiteSchema.statics.findByType = function(type) {
  return this.find({ type, status: 'active', verified: true });
};

// Find UNESCO World Heritage Sites
heritageSiteSchema.statics.findUNESCOSites = function() {
  return this.find({ designation: 'UNESCO World Heritage', status: 'active', verified: true });
};

// Find featured sites
heritageSiteSchema.statics.findFeatured = function() {
  return this.find({ featured: true, status: 'active', verified: true });
};

// Find sites within radius (geospatial query)
heritageSiteSchema.statics.findNearby = function(latitude, longitude, radiusKm = 50) {
  return this.find({
    'location.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: radiusKm * 1000 // Convert to meters
      }
    },
    status: 'active',
    verified: true
  });
};

// Find pending proposals
heritageSiteSchema.statics.findPendingProposals = function() {
  return this.find({ 'proposal.status': { $in: ['pending', 'under_review'] } })
    .populate('proposal.proposedBy', 'name email role');
};

// Get platform statistics
heritageSiteSchema.statics.getPlatformStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
        unesco: { $sum: { $cond: [{ $eq: ['$designation', 'UNESCO World Heritage'] }, 1, 0] } },
        proposals: { $sum: { $cond: [{ $eq: ['$status', 'proposed'] }, 1, 0] } },
        byRegion: {
          $push: {
            region: '$location.region',
            type: '$type'
          }
        }
      }
    }
  ]);
  
  // Get statistics by region
  const regionStats = await this.aggregate([
    { $match: { status: 'active', verified: true } },
    {
      $group: {
        _id: '$location.region',
        count: { $sum: 1 },
        types: { $addToSet: '$type' }
      }
    },
    { $sort: { count: -1 } }
  ]);
  
  return {
    overview: stats[0] || { total: 0, active: 0, unesco: 0, proposals: 0 },
    byRegion: regionStats
  };
};

// Search sites
heritageSiteSchema.statics.searchSites = function(query, filters = {}) {
  const searchCriteria = {
    status: 'active',
    verified: true,
    ...filters
  };
  
  if (query && query.trim()) {
    searchCriteria.$or = [
      { name: { $regex: query, $options: 'i' } },
      { localName: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
      { significance: { $regex: query, $options: 'i' } },
      { tags: { $in: [new RegExp(query, 'i')] } }
    ];
  }
  
  return this.find(searchCriteria)
    .sort({ featured: -1, 'tourism.annualVisitors': -1 })
    .limit(50);
};

module.exports = mongoose.model('HeritageSite', heritageSiteSchema);
