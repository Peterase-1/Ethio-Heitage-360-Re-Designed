const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Course title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Course description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  category: {
    type: String,
    required: [true, 'Course category is required'],
    enum: ['history', 'culture', 'art', 'archaeology', 'heritage', 'tourism', 'language', 'other'],
    default: 'heritage'
  },
  level: {
    type: String,
    required: [true, 'Course level is required'],
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  duration: {
    type: Number, // in minutes
    required: [true, 'Course duration is required'],
    min: [1, 'Duration must be at least 1 minute']
  },
  instructor: {
    name: {
      type: String,
      required: [true, 'Instructor name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Instructor email is required'],
      trim: true,
      lowercase: true
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [500, 'Bio cannot exceed 500 characters']
    }
  },
  content: {
    objectives: [{
      type: String,
      trim: true
    }],
    topics: [{
      title: {
        type: String,
        required: true,
        trim: true
      },
      description: {
        type: String,
        trim: true
      },
      duration: Number // in minutes
    }],
    resources: [{
      title: {
        type: String,
        required: true,
        trim: true
      },
      type: {
        type: String,
        enum: ['video', 'document', 'link', 'image', 'audio'],
        required: true
      },
      url: {
        type: String,
        required: true,
        trim: true
      },
      description: {
        type: String,
        trim: true
      }
    }]
  },
  pricing: {
    type: {
      type: String,
      enum: ['free', 'paid'],
      default: 'free'
    },
    amount: {
      type: Number,
      min: [0, 'Amount cannot be negative'],
      default: 0
    },
    currency: {
      type: String,
      default: 'ETB'
    }
  },
  enrollment: {
    totalEnrolled: {
      type: Number,
      default: 0,
      min: [0, 'Enrollment count cannot be negative']
    },
    maxStudents: {
      type: Number,
      default: 100,
      min: [1, 'Max students must be at least 1']
    },
    isOpen: {
      type: Boolean,
      default: true
    }
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  tags: [{
    type: String,
    trim: true
  }],
  thumbnail: {
    type: String,
    trim: true
  },
  images: [{
    type: String,
    trim: true
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes for better performance
courseSchema.index({ title: 'text', description: 'text' });
courseSchema.index({ category: 1, level: 1 });
courseSchema.index({ status: 1, createdBy: 1 });
courseSchema.index({ 'enrollment.isOpen': 1 });

// Virtual for enrollment percentage
courseSchema.virtual('enrollmentPercentage').get(function() {
  if (this.enrollment.maxStudents === 0) return 0;
  return Math.round((this.enrollment.totalEnrolled / this.enrollment.maxStudents) * 100);
});

// Virtual for total content duration
courseSchema.virtual('totalContentDuration').get(function() {
  return this.content.topics.reduce((total, topic) => total + (topic.duration || 0), 0);
});

// Methods
courseSchema.methods.incrementEnrollment = function() {
  if (this.enrollment.totalEnrolled < this.enrollment.maxStudents) {
    this.enrollment.totalEnrolled += 1;
    return this.save();
  }
  throw new Error('Course is full');
};

courseSchema.methods.decrementEnrollment = function() {
  if (this.enrollment.totalEnrolled > 0) {
    this.enrollment.totalEnrolled -= 1;
    return this.save();
  }
};

courseSchema.methods.isAvailable = function() {
  return this.status === 'published' && this.enrollment.isOpen && this.enrollment.totalEnrolled < this.enrollment.maxStudents;
};

module.exports = mongoose.model('Course', courseSchema);