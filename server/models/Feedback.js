const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['question', 'feedback', 'help_request', 'suggestion', 'bug_report'],
    default: 'question'
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['content', 'technical', 'navigation', 'assignment', 'general'],
    default: 'general'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'resolved', 'closed'],
    default: 'open'
  },
  attachments: [{
    filename: String,
    url: String,
    size: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  responses: [{
    responderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    message: {
      type: String,
      required: true
    },
    isOfficialResponse: {
      type: Boolean,
      default: false
    },
    helpful: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      helpful: Boolean,
      markedAt: {
        type: Date,
        default: Date.now
      }
    }],
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  resolved: {
    type: Boolean,
    default: false
  },
  resolvedAt: Date,
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  tags: [{
    type: String,
    trim: true
  }],
  isPublic: {
    type: Boolean,
    default: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
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

// Index for performance
feedbackSchema.index({ courseId: 1, status: 1 });
feedbackSchema.index({ userId: 1 });
feedbackSchema.index({ type: 1, category: 1 });
feedbackSchema.index({ createdAt: -1 });

// Virtual for response count
feedbackSchema.virtual('responseCount').get(function() {
  return this.responses.length;
});

// Virtual for helpful count
feedbackSchema.virtual('helpfulCount').get(function() {
  return this.responses.reduce((total, response) => {
    return total + response.helpful.filter(h => h.helpful === true).length;
  }, 0);
});

// Method to add a response
feedbackSchema.methods.addResponse = function(responderId, message, isOfficialResponse = false) {
  this.responses.push({
    responderId,
    message,
    isOfficialResponse
  });
  
  if (isOfficialResponse) {
    this.status = 'in_progress';
  }
  
  this.updatedAt = new Date();
  return this.save();
};

// Method to mark as resolved
feedbackSchema.methods.markResolved = function(resolvedBy) {
  this.resolved = true;
  this.status = 'resolved';
  this.resolvedAt = new Date();
  this.resolvedBy = resolvedBy;
  this.updatedAt = new Date();
  return this.save();
};

// Method to mark response as helpful
feedbackSchema.methods.markResponseHelpful = function(responseId, userId, helpful) {
  const response = this.responses.id(responseId);
  if (!response) throw new Error('Response not found');
  
  const existingMark = response.helpful.find(h => h.userId.toString() === userId.toString());
  if (existingMark) {
    existingMark.helpful = helpful;
    existingMark.markedAt = new Date();
  } else {
    response.helpful.push({ userId, helpful });
  }
  
  this.updatedAt = new Date();
  return this.save();
};

module.exports = mongoose.model('Feedback', feedbackSchema);
