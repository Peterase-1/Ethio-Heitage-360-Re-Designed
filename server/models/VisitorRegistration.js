const mongoose = require('mongoose');

const visitorRegistrationSchema = new mongoose.Schema({
  // Basic Information
  registrationId: {
    type: String,
    unique: true,
    required: true
  },

  // Visitor Information
  visitorInfo: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    age: {
      type: Number,
      required: true,
      min: 1,
      max: 120
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer_not_to_say'],
      required: true
    },
    nationality: {
      type: String,
      required: true,
      trim: true
    },
    visitorType: {
      type: String,
      enum: ['local', 'international', 'student', 'researcher', 'tourist'],
      required: true
    }
  },

  // Visit Information
  visitDetails: {
    visitDate: {
      type: Date,
      required: true,
      default: Date.now
    },
    visitTime: {
      type: String,
      required: true
    },
    groupSize: {
      type: Number,
      required: true,
      min: 1,
      max: 50
    },
    visitPurpose: {
      type: String,
      enum: ['education', 'research', 'tourism', 'cultural', 'family', 'other'],
      required: true
    },
    expectedDuration: {
      type: Number, // in hours
      required: true,
      min: 0.5,
      max: 8
    }
  },

  // Museum Information
  museum: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Museum',
    required: true
  },

  // Registration Information
  registeredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Payment Information (Mock)
  payment: {
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'ETB'
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'mobile_money', 'free'],
      required: true
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'completed'
    },
    transactionId: {
      type: String,
      required: true
    }
  },

  // Visit Status
  status: {
    type: String,
    enum: ['registered', 'checked_in', 'checked_out', 'cancelled'],
    default: 'registered'
  },

  // Additional Information
  specialRequirements: {
    type: String,
    trim: true
  },

  notes: {
    type: String,
    trim: true
  },

  // Timestamps
  checkedInAt: {
    type: Date
  },

  checkedOutAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Generate unique registration ID
visitorRegistrationSchema.pre('save', async function (next) {
  if (!this.registrationId) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    this.registrationId = `VR-${timestamp}-${random}`.toUpperCase();
  }
  next();
});

// Generate transaction ID for payment
visitorRegistrationSchema.pre('save', async function (next) {
  if (!this.payment.transactionId) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 8);
    this.payment.transactionId = `TXN-${timestamp}-${random}`.toUpperCase();
  }
  next();
});

// Indexes for better performance
visitorRegistrationSchema.index({ museum: 1, visitDate: -1 });
visitorRegistrationSchema.index({ 'visitorInfo.email': 1 });
visitorRegistrationSchema.index({ status: 1 });
visitorRegistrationSchema.index({ 'visitDetails.visitDate': -1 });

module.exports = mongoose.model('VisitorRegistration', visitorRegistrationSchema);
