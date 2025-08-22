const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Event description is required'],
    maxlength: [2000, 'Description cannot be more than 2000 characters']
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
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: [
      'exhibition',
      'workshop',
      'lecture',
      'tour',
      'conference',
      'cultural_event',
      'educational_program',
      'special_exhibition',
      'community_event',
      'virtual_event',
      'other'
    ],
    required: [true, 'Event type is required']
  },
  category: {
    type: String,
    enum: [
      'art',
      'history',
      'culture',
      'archaeology',
      'science',
      'education',
      'entertainment',
      'community',
      'research',
      'preservation'
    ],
    required: [true, 'Event category is required']
  },
  schedule: {
    startDate: {
      type: Date,
      required: [true, 'Start date is required']
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
      validate: {
        validator: function(v) {
          return v >= this.schedule.startDate;
        },
        message: 'End date must be after start date'
      }
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required'],
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)']
    },
    endTime: {
      type: String,
      required: [true, 'End time is required'],
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)']
    },
    timezone: {
      type: String,
      default: 'Africa/Addis_Ababa'
    },
    isRecurring: {
      type: Boolean,
      default: false
    },
    recurrence: {
      frequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'yearly'],
        required: function() {
          return this.schedule.isRecurring;
        }
      },
      interval: {
        type: Number,
        min: 1,
        default: 1
      },
      endRecurrence: Date,
      daysOfWeek: [{
        type: Number,
        min: 0,
        max: 6 // 0 = Sunday, 6 = Saturday
      }]
    }
  },
  location: {
    type: {
      type: String,
      enum: ['physical', 'virtual', 'hybrid'],
      required: true,
      default: 'physical'
    },
    venue: String,
    address: String,
    room: String,
    virtualLink: String,
    virtualPlatform: {
      type: String,
      enum: ['zoom', 'teams', 'webex', 'youtube', 'facebook', 'custom', 'other']
    },
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
    }
  },
  registration: {
    required: {
      type: Boolean,
      default: false
    },
    capacity: {
      type: Number,
      min: 1,
      validate: {
        validator: function(v) {
          return !this.registration.required || v > 0;
        },
        message: 'Capacity must be specified if registration is required'
      }
    },
    currentRegistrations: {
      type: Number,
      default: 0,
      min: 0
    },
    registrationDeadline: Date,
    fees: {
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
      isPrimary: { type: Boolean, default: false },
      uploadedAt: { type: Date, default: Date.now }
    }],
    videos: [{
      url: String,
      title: String,
      description: String,
      duration: Number,
      uploadedAt: { type: Date, default: Date.now }
    }],
    documents: [{
      name: String,
      url: String,
      type: {
        type: String,
        enum: ['program', 'brochure', 'schedule', 'map', 'other']
      },
      uploadedAt: { type: Date, default: Date.now }
    }]
  },
  speakers: [{
    name: {
      type: String,
      required: true
    },
    title: String,
    bio: String,
    image: String,
    contact: {
      email: String,
      phone: String
    },
    social: {
      twitter: String,
      linkedin: String,
      website: String
    }
  }],
  sponsors: [{
    name: String,
    logo: String,
    website: String,
    level: {
      type: String,
      enum: ['platinum', 'gold', 'silver', 'bronze', 'partner']
    }
  }],
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'cancelled', 'completed', 'archived'],
    default: 'draft'
  },
  visibility: {
    type: String,
    enum: ['public', 'members_only', 'private', 'unlisted'],
    default: 'public'
  },
  featured: {
    type: Boolean,
    default: false
  },
  attendees: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    registeredAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['registered', 'confirmed', 'attended', 'cancelled', 'no_show'],
      default: 'registered'
    },
    ticketType: String,
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded', 'waived'],
      default: 'pending'
    },
    specialRequirements: String
  }],
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
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  statistics: {
    totalViews: { type: Number, default: 0 },
    totalRegistrations: { type: Number, default: 0 },
    totalAttendees: { type: Number, default: 0 },
    averageRating: { type: Number, min: 0, max: 5, default: 0 },
    totalReviews: { type: Number, default: 0 }
  },
  requirements: {
    ageRestriction: {
      minimum: Number,
      maximum: Number
    },
    prerequisites: [String],
    equipment: [String],
    accessibility: {
      wheelchairAccessible: { type: Boolean, default: false },
      signLanguage: { type: Boolean, default: false },
      audioDescription: { type: Boolean, default: false },
      largePrint: { type: Boolean, default: false }
    }
  },
  contact: {
    email: String,
    phone: String,
    person: String
  },
  notes: {
    public: String,
    private: String // Only visible to organizers
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
eventSchema.index({ museum: 1, status: 1 });
eventSchema.index({ 'schedule.startDate': 1, 'schedule.endDate': 1 });
eventSchema.index({ type: 1, category: 1 });
eventSchema.index({ tags: 1 });
eventSchema.index({ title: 'text', description: 'text', tags: 'text' });
eventSchema.index({ 'location.coordinates': '2dsphere' });

// Virtual for available spots
eventSchema.virtual('availableSpots').get(function() {
  if (!this.registration.required || !this.registration.capacity) return null;
  return Math.max(0, this.registration.capacity - this.registration.currentRegistrations);
});

// Virtual for full status
eventSchema.virtual('isFull').get(function() {
  if (!this.registration.required || !this.registration.capacity) return false;
  return this.registration.currentRegistrations >= this.registration.capacity;
});

// Virtual for event status based on dates
eventSchema.virtual('eventStatus').get(function() {
  const now = new Date();
  if (this.status === 'cancelled') return 'cancelled';
  if (now < this.schedule.startDate) return 'upcoming';
  if (now >= this.schedule.startDate && now <= this.schedule.endDate) return 'ongoing';
  return 'completed';
});

// Virtual for duration in hours
eventSchema.virtual('duration').get(function() {
  const start = new Date(`2000-01-01 ${this.schedule.startTime}`);
  const end = new Date(`2000-01-01 ${this.schedule.endTime}`);
  return Math.abs(end - start) / (1000 * 60 * 60); // in hours
});

// Static methods
eventSchema.statics.findByStatus = function(status) {
  return this.find({ status }).populate('museum organizer');
};

eventSchema.statics.findUpcoming = function(limit = 10) {
  return this.find({
    'schedule.startDate': { $gte: new Date() },
    status: 'published',
    visibility: 'public'
  })
    .sort({ 'schedule.startDate': 1 })
    .limit(limit)
    .populate('museum', 'name location')
    .populate('organizer', 'name email');
};

eventSchema.statics.findByDateRange = function(startDate, endDate) {
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
      }
    ],
    status: 'published'
  });
};

eventSchema.statics.findByMuseum = function(museumId, status = null) {
  const query = { museum: museumId };
  if (status) query.status = status;
  return this.find(query).sort({ 'schedule.startDate': -1 });
};

// Instance methods
eventSchema.methods.addAttendee = function(userId, ticketType = 'general') {
  if (this.isFull) {
    throw new Error('Event is full');
  }
  
  const existingAttendee = this.attendees.find(a => a.user.toString() === userId);
  if (existingAttendee) {
    throw new Error('User is already registered for this event');
  }
  
  this.attendees.push({
    user: userId,
    ticketType,
    status: 'registered'
  });
  
  this.registration.currentRegistrations += 1;
  this.statistics.totalRegistrations += 1;
  
  return this.save();
};

eventSchema.methods.removeAttendee = function(userId) {
  const attendeeIndex = this.attendees.findIndex(a => a.user.toString() === userId);
  if (attendeeIndex === -1) {
    throw new Error('User is not registered for this event');
  }
  
  this.attendees.splice(attendeeIndex, 1);
  this.registration.currentRegistrations = Math.max(0, this.registration.currentRegistrations - 1);
  
  return this.save();
};

eventSchema.methods.addReview = function(userId, rating, comment) {
  // Remove existing review from same user
  this.reviews = this.reviews.filter(r => r.user.toString() !== userId);
  
  this.reviews.push({
    user: userId,
    rating,
    comment
  });
  
  // Update statistics
  this.statistics.totalReviews = this.reviews.length;
  this.statistics.averageRating = this.reviews.reduce((sum, r) => sum + r.rating, 0) / this.reviews.length;
  
  return this.save();
};

eventSchema.methods.incrementViews = function() {
  this.statistics.totalViews += 1;
  return this.save();
};

// Pre-save middleware
eventSchema.pre('save', function(next) {
  // Ensure end date is after start date
  if (this.schedule.endDate < this.schedule.startDate) {
    return next(new Error('End date must be after start date'));
  }
  
  // Ensure registration capacity is set if required
  if (this.registration.required && !this.registration.capacity) {
    return next(new Error('Capacity must be set if registration is required'));
  }
  
  next();
});

module.exports = mongoose.model('Event', eventSchema);
