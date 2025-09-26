const mongoose = require('mongoose');

const rentalRequestSchema = new mongoose.Schema({
  // Basic Information
  requestId: {
    type: String,
    unique: true,
    required: true
  },

  // Request Details
  requestType: {
    type: String,
    enum: ['museum_to_super', 'super_to_museum'],
    required: true
  },

  // Artifact Information
  artifact: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Artifact',
    required: true
  },

  // Museum Information
  museum: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Museum',
    required: true
  },

  // Requesting Party
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Approval Information
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled', 'completed'],
    default: 'pending'
  },

  // Rental Details
  rentalDetails: {
    duration: {
      type: Number, // in days
      required: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    rentalFee: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      enum: ['ETB', 'USD'],
      default: 'ETB'
    }
  },

  // Payment Information
  payment: {
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending'
    },
    amount: Number,
    currency: String,
    paymentMethod: String,
    transactionId: String,
    paidAt: Date
  },

  // 3D Integration
  threeDIntegration: {
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'failed'],
      default: 'pending'
    },
    modelUrl: String,
    previewUrl: String,
    completedAt: Date
  },

  // Virtual Museum Integration
  virtualMuseum: {
    status: {
      type: String,
      enum: ['pending', 'added', 'removed'],
      default: 'pending'
    },
    addedAt: Date,
    removedAt: Date
  },

  // Approval Workflow
  approvals: [{
    approver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['museum_admin', 'super_admin']
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected']
    },
    comments: String,
    approvedAt: Date
  }],

  // Communication
  messages: [{
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],

  // Contact Information
  contact: {
    person: String,
    phone: String,
    email: String
  },

  // Metadata
  description: String,
  specialRequirements: String,
  notes: String,

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date
}, {
  timestamps: true
});

// Indexes
rentalRequestSchema.index({ requestId: 1 });
rentalRequestSchema.index({ status: 1 });
rentalRequestSchema.index({ museum: 1 });
rentalRequestSchema.index({ requestedBy: 1 });
rentalRequestSchema.index({ 'rentalDetails.startDate': 1, 'rentalDetails.endDate': 1 });

// Pre-save middleware
rentalRequestSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

// Instance Methods
rentalRequestSchema.methods.addApproval = function (approverId, role, status, comments = '') {
  this.approvals.push({
    approver: approverId,
    role: role,
    status: status,
    comments: comments,
    approvedAt: new Date()
  });
  return this.save();
};

rentalRequestSchema.methods.addMessage = function (senderId, message) {
  this.messages.push({
    sender: senderId,
    message: message
  });
  return this.save();
};

rentalRequestSchema.methods.updateStatus = function (newStatus) {
  this.status = newStatus;
  if (newStatus === 'completed') {
    this.completedAt = new Date();
  }
  return this.save();
};

module.exports = mongoose.model('RentalRequest', rentalRequestSchema);
