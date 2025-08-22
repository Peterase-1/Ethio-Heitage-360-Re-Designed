const mongoose = require('mongoose');

const lessonContentSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['text', 'video', 'audio', 'image', 'interactive', 'quiz'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String, // Can be text, URL, or JSON string for interactive content
    required: true
  },
  duration: {
    type: Number, // in minutes
    default: 0
  },
  order: {
    type: Number,
    required: true
  }
});

const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  order: {
    type: Number,
    required: true
  },
  estimatedDuration: {
    type: Number, // in minutes
    required: true
  },
  content: [lessonContentSchema],
  objectives: [{
    type: String,
    trim: true
  }],
  resources: [{
    title: String,
    url: String,
    type: {
      type: String,
      enum: ['article', 'video', 'audio', 'document', 'website']
    }
  }],
  quiz: {
    questions: [{
      question: String,
      type: {
        type: String,
        enum: ['multiple_choice', 'true_false', 'short_answer'],
        default: 'multiple_choice'
      },
      options: [String], // For multiple choice
      correctAnswer: String,
      explanation: String
    }],
    passingScore: {
      type: Number,
      default: 70
    }
  },
  prerequisites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  image: {
    type: String,
    default: 'https://picsum.photos/400/300'
  },
  thumbnail: {
    type: String,
    default: 'https://picsum.photos/200/150'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
lessonSchema.index({ courseId: 1, order: 1 });
lessonSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Lesson', lessonSchema);
