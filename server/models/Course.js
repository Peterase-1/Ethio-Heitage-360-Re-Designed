const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['history', 'culture', 'archaeology', 'language', 'art', 'traditions']
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  estimatedDuration: {
    type: Number, // in minutes
    required: true
  },
  image: {
    type: String,
    default: 'https://picsum.photos/400/300'
  },
  thumbnail: {
    type: String,
    default: 'https://picsum.photos/200/150'
  },
  instructor: {
    type: String,
    default: 'Heritage Expert'
  },
  tags: [{
    type: String,
    trim: true
  }],
  prerequisites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lessons: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson'
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  organizerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'published', 'archived'],
    default: 'draft'
  },
  enrollmentCount: {
    type: Number,
    default: 0
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  maxStudents: {
    type: Number,
    default: 30
  },
  price: {
    type: Number,
    default: 0,
    min: 0
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  duration: {
    type: Number, // in weeks
    default: 4
  },
  curriculum: [{
    type: String,
    trim: true
  }],
  learningOutcomes: [{
    type: String,
    trim: true
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  isSuperAdminCourse: {
    type: Boolean,
    default: false
  },
  featured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for search and filtering
courseSchema.index({ category: 1, difficulty: 1, isActive: 1 });
courseSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Course', courseSchema);
