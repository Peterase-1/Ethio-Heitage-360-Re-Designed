const mongoose = require('mongoose');

const museumSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Museum name is required'],
    trim: true,
    maxlength: [200, 'Name cannot be more than 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      index: '2dsphere',
      required: true
    },
    address: {
      type: String,
      required: true
    },
    city: String,
    region: String,
    country: {
      type: String,
      default: 'Ethiopia'
    }
  },
  contactInfo: {
    phone: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    website: String
  },
  operatingHours: {
    monday: { open: String, close: String, closed: { type: Boolean, default: false } },
    tuesday: { open: String, close: String, closed: { type: Boolean, default: false } },
    wednesday: { open: String, close: String, closed: { type: Boolean, default: false } },
    thursday: { open: String, close: String, closed: { type: Boolean, default: false } },
    friday: { open: String, close: String, closed: { type: Boolean, default: false } },
    saturday: { open: String, close: String, closed: { type: Boolean, default: false } },
    sunday: { open: String, close: String, closed: { type: Boolean, default: false } }
  },
  admissionFee: {
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
    }
  },
  images: [{
    url: String,
    caption: String,
    isPrimary: { type: Boolean, default: false },
    uploadedAt: { type: Date, default: Date.now }
  }],
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  staff: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['curator', 'guide', 'security', 'maintenance', 'education'],
      required: true
    },
    permissions: [{
      type: String,
      enum: ['manage_artifacts', 'manage_tours', 'view_analytics', 'manage_rentals']
    }]
  }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'suspended'],
    default: 'pending'
  },
  verified: {
    type: Boolean,
    default: false
  },
  rating: {
    average: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    }
  },
  statistics: {
    totalVisitors: { type: Number, default: 0 },
    totalArtifacts: { type: Number, default: 0 },
    totalTours: { type: Number, default: 0 },
    monthlyVisitors: { type: Number, default: 0 },
    weeklyVisitors: { type: Number, default: 0 },
    dailyVisitors: { type: Number, default: 0 },
    yearlyVisitors: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    averageVisitDuration: { type: Number, default: 0 }, // in minutes
    peakHours: [{
      hour: Number,
      visitCount: { type: Number, default: 0 }
    }],
    popularArtifacts: [{
      artifact: { type: mongoose.Schema.Types.ObjectId, ref: 'Artifact' },
      viewCount: { type: Number, default: 0 }
    }],
    lastVisitorUpdate: { type: Date, default: Date.now },
    lastStatsReset: { type: Date, default: Date.now }
  },
  features: {
    hasVirtualTour: { type: Boolean, default: false },
    hasAugmentedReality: { type: Boolean, default: false },
    hasGuidedTours: { type: Boolean, default: false },
    hasEducationalPrograms: { type: Boolean, default: false },
    hasGiftShop: { type: Boolean, default: false },
    hasCafe: { type: Boolean, default: false },
    hasParking: { type: Boolean, default: false },
    isWheelchairAccessible: { type: Boolean, default: false }
  },
  // Additional profile fields
  founded: {
    type: String,
    trim: true
  },
  capacity: {
    type: Number,
    min: [0, 'Capacity cannot be negative']
  },
  languages: [{
    type: String,
    trim: true
  }],
  facilities: [{
    type: String,
    trim: true
  }],
  logo: {
    url: String,
    filename: String,
    uploadedAt: { type: Date, default: Date.now }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance optimization
museumSchema.index({ name: 'text', description: 'text' }); // Full text search
museumSchema.index({ 'location.coordinates': '2dsphere' }); // Geospatial queries
museumSchema.index({ status: 1, verified: 1 }); // Status filtering
museumSchema.index({ admin: 1 }); // Admin lookup
museumSchema.index({ createdAt: -1 }); // Recent museums
museumSchema.index({ 'rating.average': -1 }); // Top rated museums
museumSchema.index({ 'statistics.totalVisitors': -1 }); // Popular museums
museumSchema.index({ isActive: 1, status: 1 }); // Active approved museums

// Compound indexes for common queries
museumSchema.index({ status: 1, verified: 1, isActive: 1 }); // Approved active museums
museumSchema.index({ 'location.city': 1, status: 1 }); // Museums by city
museumSchema.index({ admin: 1, isActive: 1 }); // Admin's active museums

// Virtual for staff count
museumSchema.virtual('staffCount').get(function () {
  return this.staff ? this.staff.length : 0;
});

// Static methods
museumSchema.statics.findByStatus = function (status) {
  return this.find({ status, isActive: true });
};

museumSchema.statics.findVerified = function () {
  return this.find({ verified: true, isActive: true });
};

museumSchema.statics.findNearby = function (coordinates, maxDistance = 10000) {
  return this.find({
    'location.coordinates': {
      $near: {
        $geometry: { type: 'Point', coordinates },
        $maxDistance: maxDistance
      }
    },
    status: 'approved',
    verified: true,
    isActive: true
  });
};

// Static method to search museums
museumSchema.statics.search = function (searchTerm, filters = {}) {
  let query = { isActive: true };

  if (searchTerm) {
    query.$text = { $search: searchTerm };
  }

  // Apply filters
  if (filters.status) query.status = filters.status;
  if (filters.verified !== undefined) query.verified = filters.verified;
  if (filters.city) query['location.city'] = new RegExp(filters.city, 'i');
  if (filters.region) query['location.region'] = new RegExp(filters.region, 'i');
  if (filters.hasVirtualTour !== undefined) query['features.hasVirtualTour'] = filters.hasVirtualTour;

  return this.find(query);
};

// Static method to get museum statistics
museumSchema.statics.getGlobalStats = async function () {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalMuseums: { $sum: 1 },
        approvedMuseums: {
          $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
        },
        verifiedMuseums: {
          $sum: { $cond: ['$verified', 1, 0] }
        },
        totalVisitors: { $sum: '$statistics.totalVisitors' },
        totalArtifacts: { $sum: '$statistics.totalArtifacts' },
        avgRating: { $avg: '$rating.average' },
        museumsWithVirtualTours: {
          $sum: { $cond: ['$features.hasVirtualTour', 1, 0] }
        }
      }
    }
  ]);

  return stats[0] || {};
};

// Instance method to update statistics
museumSchema.methods.updateStats = async function (statsUpdate) {
  Object.assign(this.statistics, statsUpdate);
  this.statistics.lastVisitorUpdate = new Date();
  return await this.save();
};

// Instance method to add staff member
museumSchema.methods.addStaff = async function (userId, role, permissions = []) {
  // Check if user is already staff
  const existingStaff = this.staff.find(s => s.user.toString() === userId.toString());
  if (existingStaff) {
    throw new Error('User is already a staff member');
  }

  this.staff.push({ user: userId, role, permissions });
  return await this.save();
};

// Instance method to remove staff member
museumSchema.methods.removeStaff = async function (userId) {
  this.staff = this.staff.filter(s => s.user.toString() !== userId.toString());
  return await this.save();
};

// Instance method to update rating
museumSchema.methods.updateRating = async function (newRating) {
  const currentCount = this.rating.count;
  const currentAverage = this.rating.average;

  // Calculate new average
  const newCount = currentCount + 1;
  const newAverage = ((currentAverage * currentCount) + newRating) / newCount;

  this.rating.average = Math.round(newAverage * 10) / 10; // Round to 1 decimal
  this.rating.count = newCount;

  return await this.save();
};

// Instance method to check if museum is open
museumSchema.methods.isOpenNow = function () {
  const now = new Date();
  const dayName = now.toLocaleDateString('en', { weekday: 'lowercase' });
  const currentTime = now.toTimeString().slice(0, 5); // HH:MM format

  const daySchedule = this.operatingHours[dayName];
  if (!daySchedule || daySchedule.closed) return false;

  return currentTime >= daySchedule.open && currentTime <= daySchedule.close;
};

// Virtual for total artifacts count (relationship with Artifact model)
museumSchema.virtual('artifactsCount', {
  ref: 'Artifact',
  localField: '_id',
  foreignField: 'museum',
  count: true
});

// Virtual for bookings count (relationship with Booking model)
museumSchema.virtual('bookingsCount', {
  ref: 'Booking',
  localField: '_id',
  foreignField: 'museum',
  count: true
});

// Pre-save middleware to validate coordinates
museumSchema.pre('save', function (next) {
  if (this.location && this.location.coordinates) {
    const [lng, lat] = this.location.coordinates;
    if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
      return next(new Error('Invalid coordinates'));
    }
  }
  next();
});

// Pre-save middleware to ensure only one primary image
museumSchema.pre('save', function (next) {
  if (this.images && this.images.length > 0) {
    let primaryCount = 0;
    let lastPrimaryIndex = -1;

    this.images.forEach((image, index) => {
      if (image.isPrimary) {
        primaryCount++;
        lastPrimaryIndex = index;
      }
    });

    // If multiple primary images, keep only the last one
    if (primaryCount > 1) {
      this.images.forEach((image, index) => {
        image.isPrimary = index === lastPrimaryIndex;
      });
    }

    // If no primary image, make the first one primary
    if (primaryCount === 0 && this.images.length > 0) {
      this.images[0].isPrimary = true;
    }
  }
  next();
});

// Pre-remove middleware to clean up related data
museumSchema.pre('remove', async function (next) {
  try {
    // Remove related artifacts, bookings, etc.
    // This would require importing the models, so we'll handle it in the controller
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Museum', museumSchema);
