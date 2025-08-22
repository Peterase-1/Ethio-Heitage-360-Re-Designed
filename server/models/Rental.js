const mongoose = require('mongoose');

const rentalSchema = new mongoose.Schema({
  // Request Information
  requestId: {
    type: String,
    unique: true,
    required: true,
    default: function() {
      return 'REQ-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }
  },
  artifact: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Artifact',
    required: [true, 'Artifact is required']
  },
  museum: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Museum',
    required: [true, 'Museum is required']
  },
  renter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Renter is required']
  },
  
  // Renter Information
  renterInfo: {
    name: {
      type: String,
      required: [true, 'Renter name is required']
    },
    organization: {
      type: String,
      required: [true, 'Organization is required']
    },
    contactEmail: {
      type: String,
      required: [true, 'Contact email is required'],
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required']
    },
    address: {
      street: String,
      city: String,
      state: String,
      country: {
        type: String,
        required: true
      },
      postalCode: String
    },
    credentials: String,
    references: [{
      name: String,
      organization: String,
      email: String,
      phone: String
    }]
  },
  rentalType: {
    type: String,
    enum: ['exhibition', 'research', 'educational', 'commercial', 'other'],
    required: [true, 'Rental type is required']
  },
  purpose: {
    type: String,
    required: [true, 'Purpose is required'],
    maxlength: [1000, 'Purpose cannot be more than 1000 characters']
  },
  requestedDuration: {
    startDate: {
      type: Date,
      required: [true, 'Start date is required']
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required']
    },
    duration: {
      type: Number, // days
      required: true
    }
  },
  actualDuration: {
    startDate: Date,
    endDate: Date,
    extended: { type: Boolean, default: false },
    extensionDays: { type: Number, default: 0 }
  },
  location: {
    venue: {
      type: String,
      required: [true, 'Venue is required']
    },
    address: {
      type: String,
      required: [true, 'Address is required']
    },
    city: String,
    country: String,
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        index: '2dsphere'
      }
    }
  },
  pricing: {
    dailyRate: {
      type: Number,
      required: [true, 'Daily rate is required'],
      min: [0, 'Daily rate cannot be negative']
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required']
    },
    securityDeposit: {
      type: Number,
      default: 0
    },
    currency: {
      type: String,
      enum: ['ETB', 'USD', 'EUR'],
      default: 'ETB'
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'partial', 'paid', 'refunded'],
      default: 'pending'
    },
    paymentMethod: {
      type: String,
      enum: ['bank_transfer', 'credit_card', 'cash', 'check'],
      default: 'bank_transfer'
    }
  },
  insurance: {
    required: { type: Boolean, default: true },
    provider: String,
    policyNumber: String,
    coverage: Number,
    expiryDate: Date,
    documents: [{
      name: String,
      url: String,
      uploadedAt: { type: Date, default: Date.now }
    }]
  },
  conditions: {
    handlingInstructions: String,
    environmentalRequirements: {
      temperature: { min: Number, max: Number },
      humidity: { min: Number, max: Number },
      lighting: String
    },
    securityRequirements: [String],
    transportationMethod: {
      type: String,
      enum: ['specialized_courier', 'museum_staff', 'third_party', 'self_pickup']
    },
    restrictions: [String]
  },
  status: {
    type: String,
    enum: [
      'pending_review',
      'approved',
      'rejected',
      'payment_pending',
      'confirmed',
      'in_transit',
      'active',
      'completed',
      'overdue',
      'cancelled',
      'dispute'
    ],
    default: 'pending_review'
  },
  // Risk Assessment
  riskAssessment: {
    value: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    isHighValue: {
      type: Boolean,
      default: false
    },
    isInternational: {
      type: Boolean,
      default: false
    },
    requiresSuperAdminApproval: {
      type: Boolean,
      default: false
    },
    valueThreshold: {
      type: Number,
      default: 50000 // ETB
    },
    riskFactors: [String],
    assessedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    assessmentDate: Date,
    notes: String
  },

  // Three-Tier Approval Workflow
  approvals: {
    museumAdmin: {
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'review_requested'],
        default: 'pending'
      },
      approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      approvedAt: Date,
      comments: String,
      conditions: String,
      decision: String,
      approvalLevel: {
        type: String,
        enum: ['local', 'escalate'],
        default: 'local'
      }
    },
    superAdmin: {
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'not_required'],
        default: 'not_required'
      },
      approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      approvedAt: Date,
      comments: String,
      finalDecision: String,
      overrideReason: String,
      specialConditions: String
    }
  },
  documents: [{
    type: {
      type: String,
      enum: ['contract', 'insurance', 'receipt', 'condition_report', 'other'],
      required: true
    },
    name: String,
    url: String,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: { type: Date, default: Date.now }
  }],
  communications: [{
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
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['message', 'status_update', 'reminder', 'alert'],
      default: 'message'
    },
    timestamp: { type: Date, default: Date.now }
  }],
  timeline: [{
    event: {
      type: String,
      required: true
    },
    description: String,
    timestamp: { type: Date, default: Date.now },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  rating: {
    renterRating: {
      score: { type: Number, min: 1, max: 5 },
      review: String,
      date: Date
    },
    museumRating: {
      score: { type: Number, min: 1, max: 5 },
      review: String,
      date: Date
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
rentalSchema.index({ artifact: 1, status: 1 });
rentalSchema.index({ museum: 1, status: 1 });
rentalSchema.index({ renter: 1, status: 1 });
rentalSchema.index({ 'requestedDuration.startDate': 1, 'requestedDuration.endDate': 1 });
rentalSchema.index({ status: 1, createdAt: -1 });

// Virtual for total duration
rentalSchema.virtual('totalDays').get(function() {
  if (this.actualDuration.startDate && this.actualDuration.endDate) {
    return Math.ceil((this.actualDuration.endDate - this.actualDuration.startDate) / (1000 * 60 * 60 * 24));
  }
  return this.requestedDuration.duration;
});

// Virtual for days remaining
rentalSchema.virtual('daysRemaining').get(function() {
  if (this.status === 'active' && this.actualDuration.endDate) {
    const today = new Date();
    const endDate = new Date(this.actualDuration.endDate);
    const diff = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  }
  return 0;
});

// Virtual for overdue status
rentalSchema.virtual('isOverdue').get(function() {
  if (this.status === 'active' && this.actualDuration.endDate) {
    return new Date() > new Date(this.actualDuration.endDate);
  }
  return false;
});

// Static methods
rentalSchema.statics.findByStatus = function(status) {
  return this.find({ status }).populate('artifact museum renter');
};

rentalSchema.statics.findOverdue = function() {
  return this.find({
    status: 'active',
    'actualDuration.endDate': { $lt: new Date() }
  }).populate('artifact museum renter');
};

rentalSchema.statics.findPendingApproval = function() {
  return this.find({
    status: 'pending_review'
  }).populate('artifact museum renter');
};

// Pre-save middleware
rentalSchema.pre('save', function(next) {
  // Calculate duration if not set
  if (this.requestedDuration.startDate && this.requestedDuration.endDate && !this.requestedDuration.duration) {
    const diffTime = Math.abs(this.requestedDuration.endDate - this.requestedDuration.startDate);
    this.requestedDuration.duration = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  
  // Calculate total amount
  if (this.pricing.dailyRate && this.requestedDuration.duration) {
    this.pricing.totalAmount = this.pricing.dailyRate * this.requestedDuration.duration;
  }

  // Risk Assessment
  const isHighValue = this.pricing.totalAmount > this.riskAssessment.valueThreshold;
  const isInternational = this.renterInfo.address.country !== 'Ethiopia';
  
  this.riskAssessment.isHighValue = isHighValue;
  this.riskAssessment.isInternational = isInternational;
  this.riskAssessment.requiresSuperAdminApproval = isHighValue || isInternational;

  // Set approval requirements
  if (this.riskAssessment.requiresSuperAdminApproval && this.approvals.superAdmin.status === 'not_required') {
    this.approvals.superAdmin.status = 'pending';
  }
  
  next();
});

// Method to add timeline entry
rentalSchema.methods.addTimelineEntry = function(event, description, user) {
  this.timeline.push({
    event,
    description,
    user,
    timestamp: new Date()
  });
  return this.save();
};

// Method to add communication
rentalSchema.methods.addCommunication = function(from, to, message, type = 'message') {
  this.communications.push({
    from,
    to,
    message,
    type,
    timestamp: new Date()
  });
  return this.save();
};

// Method to approve by museum admin
rentalSchema.methods.approveByMuseumAdmin = async function(adminUserId, comments = '', conditions = '') {
  this.approvals.museumAdmin.status = 'approved';
  this.approvals.museumAdmin.approvedBy = adminUserId;
  this.approvals.museumAdmin.approvedAt = new Date();
  this.approvals.museumAdmin.comments = comments;
  this.approvals.museumAdmin.conditions = conditions;
  
  // Add timeline entry
  await this.addTimelineEntry('museum_admin_approved', 'Approved by museum admin', adminUserId);
  
  // If super admin approval is not required, approve the rental
  if (!this.riskAssessment.requiresSuperAdminApproval) {
    this.status = 'approved';
    await this.addTimelineEntry('approved', 'Rental fully approved', adminUserId);
  } else {
    this.status = 'pending_review';
    await this.addTimelineEntry('escalated', 'Escalated to super admin for approval', adminUserId);
  }
  
  return this.save();
};

// Method to reject by museum admin
rentalSchema.methods.rejectByMuseumAdmin = async function(adminUserId, comments = '') {
  this.approvals.museumAdmin.status = 'rejected';
  this.approvals.museumAdmin.approvedBy = adminUserId;
  this.approvals.museumAdmin.approvedAt = new Date();
  this.approvals.museumAdmin.comments = comments;
  this.status = 'rejected';
  
  await this.addTimelineEntry('rejected', 'Rejected by museum admin: ' + comments, adminUserId);
  return this.save();
};

// Method to approve by super admin
rentalSchema.methods.approveBySuperAdmin = async function(superAdminUserId, comments = '', specialConditions = '') {
  this.approvals.superAdmin.status = 'approved';
  this.approvals.superAdmin.approvedBy = superAdminUserId;
  this.approvals.superAdmin.approvedAt = new Date();
  this.approvals.superAdmin.comments = comments;
  this.approvals.superAdmin.specialConditions = specialConditions;
  this.status = 'approved';
  
  await this.addTimelineEntry('super_admin_approved', 'Final approval by super admin', superAdminUserId);
  await this.addTimelineEntry('approved', 'Rental fully approved', superAdminUserId);
  
  return this.save();
};

// Method to reject by super admin
rentalSchema.methods.rejectBySuperAdmin = async function(superAdminUserId, comments = '') {
  this.approvals.superAdmin.status = 'rejected';
  this.approvals.superAdmin.approvedBy = superAdminUserId;
  this.approvals.superAdmin.approvedAt = new Date();
  this.approvals.superAdmin.comments = comments;
  this.status = 'rejected';
  
  await this.addTimelineEntry('rejected', 'Rejected by super admin: ' + comments, superAdminUserId);
  return this.save();
};

// Method to escalate to super admin
rentalSchema.methods.escalateToSuperAdmin = async function(adminUserId, reason = '') {
  this.approvals.museumAdmin.approvalLevel = 'escalate';
  this.approvals.superAdmin.status = 'pending';
  this.status = 'pending_review';
  
  await this.addTimelineEntry('escalated', 'Escalated to super admin: ' + reason, adminUserId);
  return this.save();
};

// Static method to find rentals requiring museum admin approval
rentalSchema.statics.findPendingMuseumAdminApproval = function(museumId) {
  return this.find({
    museum: museumId,
    'approvals.museumAdmin.status': 'pending',
    status: 'pending_review'
  }).populate('artifact renter');
};

// Static method to find rentals requiring super admin approval
rentalSchema.statics.findPendingSuperAdminApproval = function() {
  return this.find({
    'approvals.superAdmin.status': 'pending',
    status: 'pending_review'
  }).populate('artifact museum renter');
};

// Static method to get rental statistics for museum
rentalSchema.statics.getMuseumStats = async function(museumId) {
  const stats = await this.aggregate([
    { $match: { museum: new mongoose.Types.ObjectId(museumId) } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        pending: { $sum: { $cond: [{ $eq: ['$status', 'pending_review'] }, 1, 0] } },
        approved: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] } },
        active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
        completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        rejected: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } },
        totalRevenue: { $sum: '$pricing.totalAmount' },
        averageValue: { $avg: '$pricing.totalAmount' }
      }
    }
  ]);
  
  return stats[0] || {
    total: 0, pending: 0, approved: 0, active: 0, 
    completed: 0, rejected: 0, totalRevenue: 0, averageValue: 0
  };
};

// Static method to get platform-wide rental statistics
rentalSchema.statics.getPlatformStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        pending: { $sum: { $cond: [{ $eq: ['$status', 'pending_review'] }, 1, 0] } },
        approved: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] } },
        active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
        completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        rejected: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } },
        highValue: { $sum: { $cond: ['$riskAssessment.isHighValue', 1, 0] } },
        international: { $sum: { $cond: ['$riskAssessment.isInternational', 1, 0] } },
        totalRevenue: { $sum: '$pricing.totalAmount' },
        averageValue: { $avg: '$pricing.totalAmount' }
      }
    }
  ]);
  
  return stats[0] || {
    total: 0, pending: 0, approved: 0, active: 0, completed: 0, rejected: 0,
    highValue: 0, international: 0, totalRevenue: 0, averageValue: 0
  };
};

// Method to check if rental needs super admin approval
rentalSchema.methods.needsSuperAdminApproval = function() {
  return this.riskAssessment.requiresSuperAdminApproval;
};

// Virtual for approval status summary
rentalSchema.virtual('approvalStatusSummary').get(function() {
  if (this.approvals.superAdmin.status === 'approved') return 'fully_approved';
  if (this.approvals.superAdmin.status === 'rejected') return 'rejected_super_admin';
  if (this.approvals.museumAdmin.status === 'rejected') return 'rejected_museum_admin';
  if (this.approvals.superAdmin.status === 'pending') return 'pending_super_admin';
  if (this.approvals.museumAdmin.status === 'pending') return 'pending_museum_admin';
  return 'draft';
});

module.exports = mongoose.model('Rental', rentalSchema);
