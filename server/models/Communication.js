const mongoose = require('mongoose');

const communicationSchema = new mongoose.Schema({
  // Communication metadata
  type: {
    type: String,
    enum: ['feedback', 'inquiry', 'announcement', 'request', 'response'],
    required: true
  },

  // Participants
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Museum context (if applicable)
  museum: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Museum',
    required: false
  },

  // Content
  subject: {
    type: String,
    required: true,
    maxlength: 200
  },
  message: {
    type: String,
    required: true,
    maxlength: 2000
  },

  // Related content (if applicable)
  relatedContent: {
    contentType: {
      type: String,
      enum: ['artifact', 'virtual_museum', 'event', 'rental', 'museum_profile'],
      required: false
    },
    contentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false
    }
  },

  // Status and priority
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read', 'replied', 'resolved', 'archived'],
    default: 'sent'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },

  // Response tracking
  isResponse: {
    type: Boolean,
    default: false
  },
  parentMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Communication',
    required: false
  },

  // Timestamps
  sentAt: {
    type: Date,
    default: Date.now
  },
  readAt: {
    type: Date,
    required: false
  },
  repliedAt: {
    type: Date,
    required: false
  },

  // Attachments
  attachments: [{
    filename: String,
    originalName: String,
    mimeType: String,
    size: Number,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Tags for categorization
  tags: [{
    type: String,
    maxlength: 50
  }],

  // Internal notes (for Super Admin use)
  internalNotes: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
communicationSchema.index({ from: 1, createdAt: -1 });
communicationSchema.index({ to: 1, status: 1, createdAt: -1 });
communicationSchema.index({ museum: 1, createdAt: -1 });
communicationSchema.index({ type: 1, status: 1 });
communicationSchema.index({ parentMessage: 1 });

// Virtual for conversation thread
communicationSchema.virtual('conversation', {
  ref: 'Communication',
  localField: '_id',
  foreignField: 'parentMessage'
});

// Methods
communicationSchema.methods.markAsRead = function () {
  this.status = 'read';
  this.readAt = new Date();
  return this.save();
};

communicationSchema.methods.markAsReplied = function () {
  this.status = 'replied';
  this.repliedAt = new Date();
  return this.save();
};

communicationSchema.methods.archive = function () {
  this.status = 'archived';
  return this.save();
};

// Static methods
communicationSchema.statics.getConversation = function (messageId) {
  return this.find({
    $or: [
      { _id: messageId },
      { parentMessage: messageId }
    ]
  }).populate('from to', 'name email role').sort({ createdAt: 1 });
};

communicationSchema.statics.getUnreadCount = function (userId) {
  return this.countDocuments({
    to: userId,
    status: { $in: ['sent', 'delivered'] }
  });
};

module.exports = mongoose.model('Communication', communicationSchema);


