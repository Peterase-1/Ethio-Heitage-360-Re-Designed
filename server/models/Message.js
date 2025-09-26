const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Allow anonymous messages
  },
  customerName: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true,
    maxLength: [100, 'Customer name cannot exceed 100 characters']
  },
  customerEmail: {
    type: String,
    required: [true, 'Customer email is required'],
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email'
    ]
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
    maxLength: [200, 'Subject cannot exceed 200 characters']
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    maxLength: [2000, 'Message cannot exceed 2000 characters']
  },
  status: {
    type: String,
    enum: ['unread', 'read', 'replied', 'archived'],
    default: 'unread'
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  category: {
    type: String,
    enum: [
      'general_inquiry',
      'booking_question',
      'tour_information',
      'payment_issue',
      'complaint',
      'compliment',
      'technical_support',
      'other'
    ],
    default: 'general_inquiry'
  },
  // If related to a specific booking or tour
  relatedBookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: false
  },
  relatedTourId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TourPackage',
    required: false
  },
  // Organizer/Admin response
  organizerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  response: {
    message: {
      type: String,
      maxLength: [2000, 'Response cannot exceed 2000 characters']
    },
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    respondedAt: Date
  },
  // Additional metadata
  tags: [String],
  internalNotes: {
    type: String,
    maxLength: [1000, 'Internal notes cannot exceed 1000 characters']
  },
  // For future features
  attachments: [{
    filename: String,
    url: String,
    fileType: String,
    fileSize: Number
  }],
  isSpam: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
messageSchema.index({ customerEmail: 1 });
messageSchema.index({ organizerId: 1 });
messageSchema.index({ status: 1 });
messageSchema.index({ priority: 1 });
messageSchema.index({ category: 1 });
messageSchema.index({ createdAt: -1 });
messageSchema.index({ relatedBookingId: 1 });

// Text index for search
messageSchema.index({
  subject: 'text',
  message: 'text',
  customerName: 'text'
});

// Virtual for response status
messageSchema.virtual('hasResponse').get(function () {
  return !!(this.response && this.response.message);
});

// Virtual for age in hours
messageSchema.virtual('ageInHours').get(function () {
  const now = new Date();
  const created = new Date(this.createdAt);
  const diffTime = now - created;
  return Math.floor(diffTime / (1000 * 60 * 60));
});

// Static method to find unread messages
messageSchema.statics.findUnread = function (organizerId = null) {
  const query = { status: 'unread' };
  if (organizerId) query.organizerId = organizerId;
  return this.find(query).sort({ createdAt: -1 });
};

// Static method to find by organizer
messageSchema.statics.findByOrganizer = function (organizerId) {
  return this.find({ organizerId }).sort({ createdAt: -1 });
};

// Instance method to mark as read
messageSchema.methods.markAsRead = async function () {
  this.status = 'read';
  return await this.save();
};

// Instance method to reply to message
messageSchema.methods.reply = async function (responseMessage, respondedBy) {
  this.response = {
    message: responseMessage,
    respondedBy,
    respondedAt: new Date()
  };
  this.status = 'replied';
  return await this.save();
};

// Instance method to archive message
messageSchema.methods.archive = async function () {
  this.status = 'archived';
  return await this.save();
};

module.exports = mongoose.model('SystemMessage', messageSchema);
