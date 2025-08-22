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
    lastVisitorUpdate: { type: Date, default: Date.now }
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
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
museumSchema.index({ name: 'text', description: 'text' });
museumSchema.index({ 'location.coordinates': '2dsphere' });
museumSchema.index({ status: 1, verified: 1 });
museumSchema.index({ admin: 1 });

// Virtual for staff count
museumSchema.virtual('staffCount').get(function() {
  return this.staff ? this.staff.length : 0;
});

// Static methods
museumSchema.statics.findByStatus = function(status) {
  return this.find({ status, isActive: true });
};

museumSchema.statics.findVerified = function() {
  return this.find({ verified: true, isActive: true });
};

museumSchema.statics.findNearby = function(coordinates, maxDistance = 10000) {
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

module.exports = mongoose.model('Museum', museumSchema);
