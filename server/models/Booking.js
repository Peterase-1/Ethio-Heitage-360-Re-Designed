const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  tourPackageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TourPackage',
    required: [true, 'Tour package ID is required']
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Allow anonymous bookings
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
  customerPhone: {
    type: String,
    trim: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  guests: {
    type: Number,
    required: [true, 'Number of guests is required'],
    min: [1, 'At least 1 guest is required'],
    max: [50, 'Cannot exceed 50 guests']
  },
  tourDate: {
    type: Date,
    required: [true, 'Tour date is required'],
    validate: {
      validator: function(date) {
        return date > new Date();
      },
      message: 'Tour date must be in the future'
    }
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'refunded'],
    default: 'pending'
  },
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Total amount cannot be negative']
  },
  specialRequests: {
    type: String,
    maxLength: [500, 'Special requests cannot exceed 500 characters']
  },
  // Payment Information
  payment: {
    status: {
      type: String,
      enum: ['pending', 'partial', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    method: {
      type: String,
      enum: ['credit_card', 'bank_transfer', 'cash', 'mobile_money'],
      default: 'pending'
    },
    transactionId: String,
    paidAmount: {
      type: Number,
      default: 0,
      min: [0, 'Paid amount cannot be negative']
    },
    paymentDate: Date,
    refundAmount: {
      type: Number,
      default: 0,
      min: [0, 'Refund amount cannot be negative']
    },
    refundDate: Date
  },
  // Organizer Information
  organizerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Organizer ID is required']
  },
  // Guest Information
  guestDetails: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    age: {
      type: Number,
      min: 0,
      max: 120
    },
    nationality: String,
    passportNumber: String,
    dietaryRestrictions: [String],
    medicalConditions: String
  }],
  // Booking Details
  bookingReference: {
    type: String,
    unique: true,
    required: true
  },
  notes: {
    type: String,
    maxLength: [1000, 'Notes cannot exceed 1000 characters']
  },
  internalNotes: {
    type: String,
    maxLength: [1000, 'Internal notes cannot exceed 1000 characters']
  },
  // Review and Rating (after completion)
  review: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      maxLength: [500, 'Review comment cannot exceed 500 characters']
    },
    reviewDate: Date
  },
  // Confirmation and Communication
  confirmationSent: {
    type: Boolean,
    default: false
  },
  reminderSent: {
    type: Boolean,
    default: false
  },
  // Cancellation
  cancellation: {
    reason: String,
    cancelledBy: {
      type: String,
      enum: ['customer', 'organizer', 'admin']
    },
    cancellationDate: Date,
    refundEligible: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
bookingSchema.index({ tourPackageId: 1 });
bookingSchema.index({ customerId: 1 });
bookingSchema.index({ organizerId: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ tourDate: 1 });
bookingSchema.index({ bookingReference: 1 }, { unique: true });
bookingSchema.index({ customerEmail: 1 });
bookingSchema.index({ createdAt: -1 });
bookingSchema.index({ 'payment.status': 1 });

// Pre-save middleware to generate booking reference
bookingSchema.pre('save', function(next) {
  if (this.isNew && !this.bookingReference) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const timestamp = Date.now().toString().slice(-6);
    this.bookingReference = `EH${year}${month}${day}${timestamp}`;
  }
  next();
});

// Also handle findOneAndUpdate operations
bookingSchema.pre(['findOneAndUpdate', 'updateOne'], function(next) {
  const update = this.getUpdate();
  if (update && !update.bookingReference && (this.getOptions().upsert || this.isNew)) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const timestamp = Date.now().toString().slice(-6);
    update.bookingReference = `EH${year}${month}${day}${timestamp}`;
  }
  next();
});

// Virtual for remaining balance
bookingSchema.virtual('remainingBalance').get(function() {
  return Math.max(0, this.totalAmount - (this.payment.paidAmount || 0));
});

// Virtual for booking status display
bookingSchema.virtual('statusDisplay').get(function() {
  const statusMap = {
    'pending': 'Pending Confirmation',
    'confirmed': 'Confirmed',
    'cancelled': 'Cancelled',
    'completed': 'Completed',
    'refunded': 'Refunded'
  };
  return statusMap[this.status] || this.status;
});

// Virtual for payment status display
bookingSchema.virtual('paymentStatusDisplay').get(function() {
  const statusMap = {
    'pending': 'Payment Pending',
    'partial': 'Partially Paid',
    'completed': 'Fully Paid',
    'failed': 'Payment Failed',
    'refunded': 'Refunded'
  };
  return statusMap[this.payment?.status] || 'Unknown';
});

// Virtual for days until tour
bookingSchema.virtual('daysUntilTour').get(function() {
  const now = new Date();
  const tourDate = new Date(this.tourDate);
  const diffTime = tourDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Static method to find by organizer
bookingSchema.statics.findByOrganizer = function(organizerId, status = null) {
  const query = { organizerId };
  if (status) query.status = status;
  return this.find(query).populate('tourPackageId', 'title location duration');
};

// Static method to find by customer
bookingSchema.statics.findByCustomer = function(customerId) {
  return this.find({ customerId }).populate('tourPackageId', 'title location duration images');
};

// Static method to find pending bookings
bookingSchema.statics.findPending = function(organizerId = null) {
  const query = { status: 'pending' };
  if (organizerId) query.organizerId = organizerId;
  return this.find(query).populate('tourPackageId', 'title location');
};

// Static method to find upcoming tours
bookingSchema.statics.findUpcoming = function(organizerId = null, days = 30) {
  const now = new Date();
  const futureDate = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000));
  
  const query = {
    status: 'confirmed',
    tourDate: { $gte: now, $lte: futureDate }
  };
  if (organizerId) query.organizerId = organizerId;
  
  return this.find(query)
    .populate('tourPackageId', 'title location duration')
    .sort({ tourDate: 1 });
};

// Instance method to confirm booking
bookingSchema.methods.confirm = async function() {
  this.status = 'confirmed';
  this.confirmationSent = true;
  return await this.save();
};

// Instance method to cancel booking
bookingSchema.methods.cancel = async function(reason, cancelledBy) {
  this.status = 'cancelled';
  this.cancellation = {
    reason,
    cancelledBy,
    cancellationDate: new Date(),
    refundEligible: this.daysUntilTour > 7 // Example refund policy
  };
  return await this.save();
};

// Instance method to complete booking
bookingSchema.methods.complete = async function() {
  this.status = 'completed';
  return await this.save();
};

// Instance method to process payment
bookingSchema.methods.processPayment = async function(amount, method, transactionId) {
  if (!this.payment) this.payment = {};
  
  this.payment.paidAmount = (this.payment.paidAmount || 0) + amount;
  this.payment.method = method;
  this.payment.transactionId = transactionId;
  this.payment.paymentDate = new Date();
  
  if (this.payment.paidAmount >= this.totalAmount) {
    this.payment.status = 'completed';
  } else if (this.payment.paidAmount > 0) {
    this.payment.status = 'partial';
  }
  
  return await this.save();
};

// Instance method to add review
bookingSchema.methods.addReview = async function(rating, comment) {
  this.review = {
    rating,
    comment,
    reviewDate: new Date()
  };
  return await this.save();
};

module.exports = mongoose.model('Booking', bookingSchema);
