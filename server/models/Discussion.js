const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    maxLength: 5000
  },
  attachments: [{
    filename: String,
    url: String,
    type: String
  }],
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    likedAt: {
      type: Date,
      default: Date.now
    }
  }],
  replies: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      maxLength: 2000
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    likes: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      likedAt: {
        type: Date,
        default: Date.now
      }
    }]
  }],
  isPinned: {
    type: Boolean,
    default: false
  },
  isAnswer: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const discussionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxLength: 200
  },
  description: String,
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  lessonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson'
  },
  category: {
    type: String,
    enum: ['general', 'question', 'announcement', 'resource', 'assignment'],
    default: 'general'
  },
  tags: [String],
  posts: [postSchema],
  stats: {
    totalPosts: {
      type: Number,
      default: 0
    },
    totalViews: {
      type: Number,
      default: 0
    },
    lastActivity: Date
  },
  settings: {
    allowStudentPosts: {
      type: Boolean,
      default: true
    },
    requireApproval: {
      type: Boolean,
      default: false
    },
    isLocked: {
      type: Boolean,
      default: false
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

discussionSchema.index({ courseId: 1, category: 1 });
discussionSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Discussion', discussionSchema);
