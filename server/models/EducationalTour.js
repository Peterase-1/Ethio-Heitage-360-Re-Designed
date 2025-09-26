const mongoose = require('mongoose');

const educationalTourSchema = new mongoose.Schema({
  // Basic Tour Information
  title: {
    type: String,
    required: [true, 'Tour title is required'],
    trim: true,
    maxLength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Tour description is required'],
    maxLength: [1000, 'Description cannot exceed 1000 characters']
  },
  shortDescription: {
    type: String,
    maxLength: [200, 'Short description cannot exceed 200 characters']
  },
  
  // Organizer Information
  organizerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Organizer ID is required']
  },
  organizerName: {
    type: String,
    required: true
  },
  
  // Educational Content
  category: {
    type: String,
    enum: [
      'Islamic Heritage', 'Islamic Architecture', 'Ethiopian Scripts', 
      'Traditional Arts', 'Religious Heritage', 'Cultural Festivals', 
      'Culinary Heritage', 'Musical Heritage', 'Cultural Heritage',
      'Traditional Knowledge', 'Natural Heritage', 'Modern Heritage'
    ],
    required: [true, 'Category is required']
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  
  // Tour Schedule & Logistics
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  duration: {
    type: Number, // in hours
    required: [true, 'Duration is required'],
    min: [1, 'Duration must be at least 1 hour']
  },
  maxParticipants: {
    type: Number,
    required: [true, 'Maximum participants is required'],
    min: [1, 'Must allow at least 1 participant'],
    max: [100, 'Cannot exceed 100 participants']
  },
  
  // Location Information
  location: {
    name: {
      type: String,
      required: [true, 'Location name is required']
    },
    address: {
      type: String,
      required: [true, 'Location address is required']
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    meetingPoint: {
      type: String,
      required: [true, 'Meeting point is required']
    }
  },
  
  // Educational Content Structure
  learningObjectives: [{
    type: String,
    required: true
  }],
  
  curriculum: [{
    order: {
      type: Number,
      required: true
    },
    title: {
      type: String,
      required: true,
      maxLength: [100, 'Lesson title cannot exceed 100 characters']
    },
    description: {
      type: String,
      required: true,
      maxLength: [500, 'Lesson description cannot exceed 500 characters']
    },
    duration: {
      type: Number, // in minutes
      required: true,
      min: [10, 'Lesson must be at least 10 minutes']
    },
    location: String, // Specific location within the tour
    activities: [{
      type: String,
      enum: ['Guided Tour', 'Hands-on Activity', 'Discussion', 'Quiz', 'Demonstration', 'Storytelling', 'Photography', 'Sketching']
    }],
    resources: [{
      type: {
        type: String,
        enum: ['document', 'image', 'video', 'audio', 'link']
      },
      url: String,
      title: String,
      description: String
    }],
    assessments: [{
      type: {
        type: String,
        enum: ['quiz', 'discussion', 'practical', 'observation']
      },
      title: String,
      description: String,
      points: {
        type: Number,
        default: 10
      }
    }]
  }],
  
  // Pricing and Enrollment
  pricing: {
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative']
    },
    currency: {
      type: String,
      enum: ['ETB', 'USD', 'EUR'],
      default: 'ETB'
    },
    includes: [{
      type: String // What's included in the price
    }],
    excludes: [{
      type: String // What's not included
    }]
  },
  
  // Requirements and Prerequisites
  requirements: {
    ageLimit: {
      min: {
        type: Number,
        default: 8
      },
      max: {
        type: Number,
        default: 100
      }
    },
    fitnessLevel: {
      type: String,
      enum: ['Easy', 'Moderate', 'Challenging'],
      default: 'Easy'
    },
    prerequisites: [{
      type: String // Any required knowledge or preparation
    }],
    recommendedItems: [{
      type: String // What participants should bring
    }]
  },
  
  // Media and Marketing
  images: [{
    url: {
      type: String,
      required: true
    },
    caption: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  tags: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  
  // Enrollment and Participants
  enrollments: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    enrolledAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'pending'
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'pending'
    },
    progress: {
      lessonsCompleted: {
        type: Number,
        default: 0
      },
      totalScore: {
        type: Number,
        default: 0
      },
      certificateEarned: {
        type: Boolean,
        default: false
      }
    },
    feedback: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      comment: String,
      submittedAt: Date
    }
  }],
  
  // Tour Status and Management
  status: {
    type: String,
    enum: ['draft', 'published', 'cancelled', 'completed', 'archived'],
    default: 'draft'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Statistics and Analytics
  stats: {
    views: {
      type: Number,
      default: 0
    },
    enrollments: {
      type: Number,
      default: 0
    },
    completions: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalRatings: {
      type: Number,
      default: 0
    }
  },
  
  // Communication
  announcements: [{
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    isImportant: {
      type: Boolean,
      default: false
    }
  }],
  
  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
educationalTourSchema.index({ organizerId: 1, status: 1 });
educationalTourSchema.index({ category: 1, difficulty: 1 });
educationalTourSchema.index({ startDate: 1, endDate: 1 });
educationalTourSchema.index({ 'location.coordinates': '2dsphere' });
educationalTourSchema.index({ tags: 1 });
educationalTourSchema.index({ status: 1, isActive: 1 });
educationalTourSchema.index({ 'stats.averageRating': -1 });

// Virtual for available spots
educationalTourSchema.virtual('availableSpots').get(function() {
  const confirmedEnrollments = this.enrollments.filter(e => e.status === 'confirmed').length;
  return this.maxParticipants - confirmedEnrollments;
});

// Virtual for enrollment status
educationalTourSchema.virtual('enrollmentStatus').get(function() {
  const confirmedEnrollments = this.enrollments.filter(e => e.status === 'confirmed').length;
  if (confirmedEnrollments >= this.maxParticipants) return 'full';
  if (new Date() > this.endDate) return 'expired';
  if (new Date() > this.startDate) return 'ongoing';
  return 'open';
});

// Virtual for total duration
educationalTourSchema.virtual('totalCurriculumDuration').get(function() {
  return this.curriculum.reduce((total, lesson) => total + lesson.duration, 0);
});

// Methods
educationalTourSchema.methods.canUserEnroll = function(userId) {
  // Check if user is already enrolled
  const existingEnrollment = this.enrollments.find(e => 
    e.userId.toString() === userId.toString() && 
    ['pending', 'confirmed'].includes(e.status)
  );
  
  if (existingEnrollment) return { canEnroll: false, reason: 'Already enrolled' };
  
  // Check if tour is full
  if (this.availableSpots <= 0) return { canEnroll: false, reason: 'Tour is full' };
  
  // Check if enrollment is still open
  if (new Date() >= this.startDate) return { canEnroll: false, reason: 'Enrollment closed' };
  
  // Check if tour is active and published
  if (!this.isActive || this.status !== 'published') {
    return { canEnroll: false, reason: 'Tour not available' };
  }
  
  return { canEnroll: true };
};

educationalTourSchema.methods.enrollUser = async function(userId, paymentStatus = 'pending') {
  const enrollmentCheck = this.canUserEnroll(userId);
  if (!enrollmentCheck.canEnroll) {
    throw new Error(enrollmentCheck.reason);
  }
  
  this.enrollments.push({
    userId,
    status: 'pending',
    paymentStatus,
    progress: {
      lessonsCompleted: 0,
      totalScore: 0,
      certificateEarned: false
    }
  });
  
  this.stats.enrollments += 1;
  return await this.save();
};

educationalTourSchema.methods.updateUserProgress = async function(userId, lessonIndex, score = 0) {
  const enrollment = this.enrollments.find(e => 
    e.userId.toString() === userId.toString()
  );
  
  if (!enrollment) {
    throw new Error('User not enrolled in this tour');
  }
  
  enrollment.progress.lessonsCompleted = Math.max(enrollment.progress.lessonsCompleted, lessonIndex + 1);
  enrollment.progress.totalScore += score;
  
  // Check if tour is completed
  if (enrollment.progress.lessonsCompleted >= this.curriculum.length) {
    enrollment.status = 'completed';
    enrollment.progress.certificateEarned = true;
    this.stats.completions += 1;
  }
  
  return await this.save();
};

educationalTourSchema.methods.addAnnouncement = async function(title, message, isImportant = false) {
  this.announcements.push({
    title,
    message,
    isImportant,
    createdAt: new Date()
  });
  
  return await this.save();
};

educationalTourSchema.methods.updateRating = async function(newRating) {
  const currentTotal = this.stats.averageRating * this.stats.totalRatings;
  this.stats.totalRatings += 1;
  this.stats.averageRating = (currentTotal + newRating) / this.stats.totalRatings;
  
  return await this.save();
};

// Static methods
educationalTourSchema.statics.findByOrganizer = function(organizerId, status = null) {
  const query = { organizerId, isActive: true };
  if (status) query.status = status;
  return this.find(query).sort({ createdAt: -1 });
};

educationalTourSchema.statics.findPublishedTours = function(filters = {}) {
  const query = { 
    status: 'published', 
    isActive: true,
    startDate: { $gte: new Date() }
  };
  
  if (filters.category) query.category = filters.category;
  if (filters.difficulty) query.difficulty = filters.difficulty;
  if (filters.location) {
    query['location.name'] = new RegExp(filters.location, 'i');
  }
  
  return this.find(query).sort({ startDate: 1, 'stats.averageRating': -1 });
};

educationalTourSchema.statics.getOrganizerStats = async function(organizerId) {
  const stats = await this.aggregate([
    { $match: { organizerId: new mongoose.Types.ObjectId(organizerId) } },
    {
      $group: {
        _id: null,
        totalTours: { $sum: 1 },
        publishedTours: { $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] } },
        completedTours: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        totalEnrollments: { $sum: '$stats.enrollments' },
        totalCompletions: { $sum: '$stats.completions' },
        averageRating: { $avg: '$stats.averageRating' },
        totalViews: { $sum: '$stats.views' }
      }
    }
  ]);
  
  return stats[0] || {
    totalTours: 0,
    publishedTours: 0,
    completedTours: 0,
    totalEnrollments: 0,
    totalCompletions: 0,
    averageRating: 0,
    totalViews: 0
  };
};

module.exports = mongoose.model('EducationalTour', educationalTourSchema);
