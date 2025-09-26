const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Staff name is required'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      'Please enter a valid email'
    ]
  },
  phone: {
    type: String,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },

  // Employment Details
  role: {
    type: String,
    required: [true, 'Role is required'],
    enum: [
      'Senior Curator',
      'Education Coordinator', 
      'Conservation Specialist',
      'Digital Archivist',
      'Security Officer',
      'Tour Guide',
      'Registrar',
      'Collections Manager',
      'Exhibitions Coordinator',
      'Marketing Coordinator',
      'Administrative Assistant',
      'Other'
    ]
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    enum: [
      'Collections',
      'Education', 
      'Conservation',
      'Digital',
      'Security',
      'Administration',
      'Marketing',
      'Research',
      'Operations'
    ]
  },
  status: {
    type: String,
    enum: ['active', 'on_leave', 'inactive', 'terminated'],
    default: 'active'
  },
  hireDate: {
    type: Date,
    required: [true, 'Hire date is required']
  },
  terminationDate: Date,
  
  // Museum Association
  museum: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Museum',
    required: [true, 'Museum assignment is required']
  },
  
  // User Account Link (optional - staff might not have user accounts)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },

  // Permissions - Fine-grained access control
  permissions: [{
    type: String,
    enum: [
      // Artifact permissions
      'view_artifacts',
      'edit_artifacts', 
      'delete_artifacts',
      'upload_artifacts',
      'approve_artifacts',
      'manage_artifact_status',
      
      // Event permissions
      'view_events',
      'edit_events',
      'delete_events',
      'create_events',
      'manage_registrations',
      
      // Staff permissions
      'view_staff',
      'edit_staff',
      'delete_staff',
      'manage_permissions',
      
      // Rental permissions
      'view_rentals',
      'approve_rentals', 
      'reject_rentals',
      'manage_contracts',
      
      // Analytics permissions
      'view_analytics',
      'export_analytics',
      'view_reports',
      
      // Museum permissions
      'edit_museum_profile',
      'manage_museum_settings',
      'view_museum_data'
    ]
  }],

  // Work Schedule
  schedule: {
    monday: {
      working: { type: Boolean, default: true },
      startTime: { type: String, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
      endTime: { type: String, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
      breakTime: { type: Number, min: 0, max: 480 } // minutes
    },
    tuesday: {
      working: { type: Boolean, default: true },
      startTime: { type: String, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
      endTime: { type: String, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
      breakTime: { type: Number, min: 0, max: 480 }
    },
    wednesday: {
      working: { type: Boolean, default: true },
      startTime: { type: String, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
      endTime: { type: String, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
      breakTime: { type: Number, min: 0, max: 480 }
    },
    thursday: {
      working: { type: Boolean, default: true },
      startTime: { type: String, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
      endTime: { type: String, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
      breakTime: { type: Number, min: 0, max: 480 }
    },
    friday: {
      working: { type: Boolean, default: true },
      startTime: { type: String, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
      endTime: { type: String, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
      breakTime: { type: Number, min: 0, max: 480 }
    },
    saturday: {
      working: { type: Boolean, default: false },
      startTime: String,
      endTime: String,
      breakTime: { type: Number, min: 0, max: 480 }
    },
    sunday: {
      working: { type: Boolean, default: false },
      startTime: String,
      endTime: String,
      breakTime: { type: Number, min: 0, max: 480 }
    }
  },

  // Performance Tracking
  performance: {
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    completedTasks: {
      type: Number,
      default: 0
    },
    onTimeRate: {
      type: Number,
      min: 0,
      max: 100,
      default: 100
    },
    lastReviewDate: Date,
    nextReviewDate: Date,
    goals: [{
      description: String,
      deadline: Date,
      completed: { type: Boolean, default: false },
      completedDate: Date
    }],
    achievements: [{
      title: String,
      description: String,
      date: Date,
      category: String
    }]
  },

  // Personal Information
  personalInfo: {
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: { type: String, default: 'Ethiopia' }
    },
    dateOfBirth: Date,
    nationality: String,
    languages: [String],
    education: [{
      degree: String,
      institution: String,
      year: Number,
      field: String
    }],
    certifications: [{
      name: String,
      issuingOrganization: String,
      issueDate: Date,
      expiryDate: Date,
      credentialId: String
    }]
  },

  // Emergency Contact
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String,
    email: String,
    address: String
  },

  // Employment Details
  employment: {
    employmentType: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'intern', 'volunteer'],
      default: 'full-time'
    },
    salary: {
      amount: Number,
      currency: { type: String, default: 'ETB' },
      payFrequency: {
        type: String,
        enum: ['monthly', 'bi-weekly', 'weekly', 'hourly'],
        default: 'monthly'
      }
    },
    benefits: [String],
    workLocation: {
      type: String,
      enum: ['on-site', 'remote', 'hybrid'],
      default: 'on-site'
    }
  },

  // Activity Tracking
  activity: {
    lastSeen: Date,
    totalHoursWorked: { type: Number, default: 0 },
    totalDaysWorked: { type: Number, default: 0 },
    averageHoursPerDay: { type: Number, default: 0 },
    
    // Leave tracking
    leaveBalance: {
      annual: { type: Number, default: 0 },
      sick: { type: Number, default: 0 },
      personal: { type: Number, default: 0 }
    },
    leaveHistory: [{
      type: {
        type: String,
        enum: ['annual', 'sick', 'personal', 'emergency', 'maternity', 'paternity']
      },
      startDate: Date,
      endDate: Date,
      days: Number,
      reason: String,
      approved: { type: Boolean, default: false },
      approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      approvedDate: Date
    }],
    
    // Attendance tracking
    attendance: [{
      date: { type: Date, required: true },
      checkIn: Date,
      checkOut: Date,
      hoursWorked: Number,
      status: {
        type: String,
        enum: ['present', 'absent', 'late', 'half-day', 'on-leave'],
        default: 'present'
      },
      notes: String
    }]
  },

  // Professional Development
  development: {
    skills: [{
      name: String,
      level: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced', 'expert']
      },
      lastAssessed: Date
    }],
    trainingRecords: [{
      title: String,
      provider: String,
      startDate: Date,
      endDate: Date,
      status: {
        type: String,
        enum: ['enrolled', 'in-progress', 'completed', 'cancelled']
      },
      certificateUrl: String,
      cost: Number
    }],
    specializations: [String],
    researchAreas: [String]
  },

  // Profile and Preferences
  profile: {
    avatar: String,
    bio: String,
    workPreferences: {
      preferredShifts: [String],
      workingWithPublic: { type: Boolean, default: true },
      travelWillingness: { type: Boolean, default: false },
      overtimeAvailability: { type: Boolean, default: true }
    },
    communicationPreferences: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      phone: { type: Boolean, default: true },
      inApp: { type: Boolean, default: true }
    }
  },

  // Notes and Comments
  notes: [{
    content: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
    type: {
      type: String,
      enum: ['general', 'performance', 'disciplinary', 'achievement', 'training']
    },
    private: { type: Boolean, default: true }
  }],

  // Soft Delete
  deletedAt: { type: Date, default: null },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance optimization
staffSchema.index({ museum: 1, status: 1 }); // Museum's active staff
staffSchema.index({ email: 1 }, { unique: true }); // Unique email
staffSchema.index({ role: 1, department: 1 }); // Role and department filtering
staffSchema.index({ 'performance.rating': -1 }); // Top performers
staffSchema.index({ hireDate: -1 }); // Recent hires
staffSchema.index({ status: 1, isActive: 1 }); // Active staff
staffSchema.index({ name: 'text', email: 'text', role: 'text' }); // Text search
staffSchema.index({ deletedAt: 1 }, { sparse: true }); // Soft deleted

// Compound indexes for common queries
staffSchema.index({ museum: 1, department: 1, status: 1 }); // Department staff lookup
staffSchema.index({ museum: 1, role: 1, isActive: 1 }); // Role-based queries
staffSchema.index({ status: 1, 'schedule.monday.working': 1 }); // Available staff

// Virtual properties
staffSchema.virtual('fullName').get(function() {
  return this.name;
});

staffSchema.virtual('yearsOfService').get(function() {
  if (!this.hireDate) return 0;
  const now = new Date();
  const diff = now - this.hireDate;
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
});

staffSchema.virtual('weeklyHours').get(function() {
  let totalHours = 0;
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  
  days.forEach(day => {
    const schedule = this.schedule[day];
    if (schedule && schedule.working && schedule.startTime && schedule.endTime) {
      const start = new Date(`2000-01-01T${schedule.startTime}:00`);
      const end = new Date(`2000-01-01T${schedule.endTime}:00`);
      const hours = (end - start) / (1000 * 60 * 60);
      const breakHours = (schedule.breakTime || 0) / 60;
      totalHours += Math.max(0, hours - breakHours);
    }
  });
  
  return Math.round(totalHours * 10) / 10;
});

staffSchema.virtual('currentLeaveBalance').get(function() {
  const balance = this.activity?.leaveBalance || {};
  return {
    annual: balance.annual || 0,
    sick: balance.sick || 0,
    personal: balance.personal || 0,
    total: (balance.annual || 0) + (balance.sick || 0) + (balance.personal || 0)
  };
});

staffSchema.virtual('isOnLeave').get(function() {
  const today = new Date();
  const currentLeave = this.activity?.leaveHistory?.find(leave => 
    leave.approved && 
    leave.startDate <= today && 
    leave.endDate >= today
  );
  return !!currentLeave;
});

// Instance Methods
staffSchema.methods.addPermission = function(permission) {
  if (!this.permissions.includes(permission)) {
    this.permissions.push(permission);
    return this.save();
  }
  return Promise.resolve(this);
};

staffSchema.methods.removePermission = function(permission) {
  this.permissions = this.permissions.filter(p => p !== permission);
  return this.save();
};

staffSchema.methods.hasPermission = function(permission) {
  return this.permissions.includes(permission);
};

staffSchema.methods.updatePerformance = function(rating, notes = '') {
  this.performance.rating = rating;
  this.performance.lastReviewDate = new Date();
  
  // Calculate next review date (annual)
  const nextReview = new Date();
  nextReview.setFullYear(nextReview.getFullYear() + 1);
  this.performance.nextReviewDate = nextReview;
  
  // Add note if provided
  if (notes) {
    this.notes.push({
      content: notes,
      type: 'performance',
      createdAt: new Date()
    });
  }
  
  return this.save();
};

staffSchema.methods.recordAttendance = function(checkIn, checkOut = null, status = 'present') {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Check if attendance already recorded for today
  const existingAttendance = this.activity?.attendance?.find(att => {
    const attDate = new Date(att.date);
    attDate.setHours(0, 0, 0, 0);
    return attDate.getTime() === today.getTime();
  });
  
  if (existingAttendance) {
    // Update existing attendance
    existingAttendance.checkIn = checkIn;
    if (checkOut) existingAttendance.checkOut = checkOut;
    existingAttendance.status = status;
    
    if (checkIn && checkOut) {
      existingAttendance.hoursWorked = (checkOut - checkIn) / (1000 * 60 * 60);
    }
  } else {
    // Add new attendance record
    if (!this.activity) this.activity = { attendance: [] };
    if (!this.activity.attendance) this.activity.attendance = [];
    
    const hoursWorked = (checkIn && checkOut) ? (checkOut - checkIn) / (1000 * 60 * 60) : 0;
    
    this.activity.attendance.push({
      date: today,
      checkIn,
      checkOut,
      hoursWorked,
      status
    });
  }
  
  return this.save();
};

staffSchema.methods.requestLeave = function(type, startDate, endDate, reason) {
  if (!this.activity) this.activity = { leaveHistory: [] };
  if (!this.activity.leaveHistory) this.activity.leaveHistory = [];
  
  // Calculate number of days
  const diffTime = Math.abs(endDate - startDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  
  this.activity.leaveHistory.push({
    type,
    startDate,
    endDate,
    days: diffDays,
    reason,
    approved: false
  });
  
  return this.save();
};

staffSchema.methods.approveLeave = function(leaveId, approvedBy) {
  const leave = this.activity?.leaveHistory?.id(leaveId);
  if (leave) {
    leave.approved = true;
    leave.approvedBy = approvedBy;
    leave.approvedDate = new Date();
    
    // Deduct from leave balance
    if (this.activity.leaveBalance && this.activity.leaveBalance[leave.type] !== undefined) {
      this.activity.leaveBalance[leave.type] = Math.max(0, this.activity.leaveBalance[leave.type] - leave.days);
    }
  }
  
  return this.save();
};

staffSchema.methods.softDelete = function() {
  this.deletedAt = new Date();
  this.isActive = false;
  this.status = 'terminated';
  return this.save();
};

staffSchema.methods.restore = function() {
  this.deletedAt = null;
  this.isActive = true;
  this.status = 'active';
  return this.save();
};

// Static Methods
staffSchema.statics.findByMuseum = function(museumId, includeInactive = false) {
  const query = { museum: museumId, deletedAt: null };
  if (!includeInactive) {
    query.isActive = true;
    query.status = 'active';
  }
  return this.find(query);
};

staffSchema.statics.findByRole = function(role, museumId = null) {
  const query = { role, isActive: true, status: 'active', deletedAt: null };
  if (museumId) query.museum = museumId;
  return this.find(query);
};

staffSchema.statics.findByDepartment = function(department, museumId = null) {
  const query = { department, isActive: true, status: 'active', deletedAt: null };
  if (museumId) query.museum = museumId;
  return this.find(query);
};

staffSchema.statics.searchStaff = function(searchTerm, filters = {}) {
  let query = { isActive: true, deletedAt: null };
  
  if (searchTerm) {
    query.$text = { $search: searchTerm };
  }
  
  // Apply filters
  if (filters.museum) query.museum = filters.museum;
  if (filters.role) query.role = filters.role;
  if (filters.department) query.department = filters.department;
  if (filters.status) query.status = filters.status;
  
  return this.find(query);
};

staffSchema.statics.getPerformanceStats = async function(museumId) {
  const pipeline = [
    { $match: { museum: mongoose.Types.ObjectId(museumId), isActive: true } },
    {
      $group: {
        _id: null,
        totalStaff: { $sum: 1 },
        averageRating: { $avg: '$performance.rating' },
        topPerformers: {
          $push: {
            $cond: [
              { $gte: ['$performance.rating', 4.5] },
              { name: '$name', rating: '$performance.rating' },
              null
            ]
          }
        }
      }
    }
  ];
  
  const result = await this.aggregate(pipeline);
  return result[0] || {};
};

// Pre-save middleware
staffSchema.pre('save', function(next) {
  // Set default schedule if not provided
  if (this.isNew && (!this.schedule || Object.keys(this.schedule).length === 0)) {
    const defaultSchedule = {
      startTime: '09:00',
      endTime: '17:00',
      breakTime: 60
    };
    
    ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].forEach(day => {
      if (!this.schedule[day]) {
        this.schedule[day] = { working: true, ...defaultSchedule };
      }
    });
    
    ['saturday', 'sunday'].forEach(day => {
      if (!this.schedule[day]) {
        this.schedule[day] = { working: false };
      }
    });
  }
  
  // Set default permissions based on role
  if (this.isModified('role') && this.permissions.length === 0) {
    const rolePermissions = {
      'Senior Curator': ['view_artifacts', 'edit_artifacts', 'approve_artifacts', 'view_analytics'],
      'Education Coordinator': ['view_events', 'edit_events', 'create_events', 'manage_registrations'],
      'Conservation Specialist': ['view_artifacts', 'edit_artifacts', 'manage_artifact_status'],
      'Digital Archivist': ['view_artifacts', 'upload_artifacts', 'edit_artifacts'],
      'Security Officer': ['view_museum_data'],
      'Tour Guide': ['view_events', 'view_artifacts']
    };
    
    if (rolePermissions[this.role]) {
      this.permissions = rolePermissions[this.role];
    }
  }
  
  next();
});

// Pre-find middleware to exclude soft deleted
staffSchema.pre(/^find/, function(next) {
  this.where({ deletedAt: null });
  next();
});

module.exports = mongoose.model('Staff', staffSchema);
