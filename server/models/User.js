const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Basic Information
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxLength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxLength: [50, 'Last name cannot exceed 50 characters']
  },
  name: {
    type: String,
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
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false
  },
  phone: {
    type: String,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  avatar: {
    type: String,
    default: null
  },

  // Role & Permissions - Three-Tier System
  role: {
    type: String,
    enum: {
      values: ['superAdmin', 'museumAdmin', 'organizer', 'user'],
      message: 'Role must be either superAdmin, museumAdmin, organizer, or user'
    },
    default: 'user',
    required: true
  },
  permissions: [{
    type: String,
    enum: [
      // Super Admin Permissions
      'manage_all_users', 'manage_all_museums', 'approve_museum_registrations',
      'manage_heritage_sites', 'view_platform_analytics', 'manage_system_settings',
      'approve_high_value_rentals', 'manage_api_keys', 'view_audit_logs',

      // Museum Admin Permissions  
      'manage_museum_profile', 'manage_museum_staff', 'manage_artifacts',
      'create_events', 'approve_local_rentals', 'view_museum_analytics',
      'suggest_heritage_sites', 'manage_virtual_museum',

      // Organizer Permissions
      'manage_tours', 'view_analytics', 'create_educational_tours', 'manage_educational_tours', 'view_educational_analytics',
      
      // User/Visitor Permissions
      'book_events', 'request_rentals', 'view_virtual_museum',
      'leave_reviews', 'manage_profile'
    ]
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },

  // Profile Details
  bio: {
    type: String,
    maxLength: [500, 'Bio cannot exceed 500 characters']
  },
  dateOfBirth: Date,
  nationality: {
    type: String,
    maxLength: [50, 'Nationality cannot exceed 50 characters']
  },
  languages: [{
    type: String,
    enum: ['English', 'Amharic', 'Oromo', 'Tigrinya', 'Somali', 'Afar', 'Sidamo', 'Gurage', 'Other']
  }],
  interests: [{
    type: String,
    enum: [
      'Ancient History', 'Art & Culture', 'Archaeology', 'Religious Heritage',
      'Traditional Crafts', 'Music & Dance', 'Literature', 'Architecture',
      'Paleontology', 'Anthropology', 'Photography', 'Education'
    ]
  }],

  // Museum Association (for Museum Admins/Staff)
  museumId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Museum',
    default: null
  },
  position: {
    type: String,
    maxLength: [100, 'Position cannot exceed 100 characters']
  },
  department: {
    type: String,
    maxLength: [100, 'Department cannot exceed 100 characters']
  },
  hireDate: Date,
  // Enhanced User Preferences
  preferences: {
    language: {
      type: String,
      enum: ['en', 'am', 'om', 'ti'],
      default: 'en'
    },
    timezone: {
      type: String,
      default: 'Africa/Addis_Ababa'
    },
    currency: {
      type: String,
      enum: ['ETB', 'USD', 'EUR'],
      default: 'ETB'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      },
      inApp: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: false
      },
      marketing: {
        type: Boolean,
        default: false
      },
      reminders: {
        type: Boolean,
        default: true
      }
    },
    privacy: {
      profileVisibility: {
        type: String,
        enum: ['public', 'private', 'friends-only'],
        default: 'public'
      },
      showEmail: {
        type: Boolean,
        default: false
      },
      showPhone: {
        type: Boolean,
        default: false
      },
      showLocation: {
        type: Boolean,
        default: false
      },
      dataTracking: {
        type: Boolean,
        default: true
      }
    },
    dashboard: {
      theme: {
        type: String,
        enum: ['light', 'dark', 'auto'],
        default: 'light'
      },
      defaultView: {
        type: String,
        enum: ['grid', 'list', 'card'],
        default: 'grid'
      },
      itemsPerPage: {
        type: Number,
        default: 12,
        min: 6,
        max: 50
      },
      autoPlay: {
        type: Boolean,
        default: true
      }
    },
    accessibility: {
      highContrast: {
        type: Boolean,
        default: false
      },
      fontSize: {
        type: String,
        enum: ['small', 'medium', 'large'],
        default: 'medium'
      },
      screenReader: {
        type: Boolean,
        default: false
      }
    }
  },

  // Activity Tracking
  lastLogin: Date,
  loginCount: {
    type: Number,
    default: 0
  },
  ipAddress: String,

  // User Statistics
  stats: {
    artifactsViewed: {
      type: Number,
      default: 0
    },
    eventsAttended: {
      type: Number,
      default: 0
    },
    toursBooked: {
      type: Number,
      default: 0
    },
    reviewsWritten: {
      type: Number,
      default: 0
    },
    artifactsBookmarked: {
      type: Number,
      default: 0
    },
    totalTimeSpent: {
      type: Number,
      default: 0 // in minutes
    },
    averageSessionTime: {
      type: Number,
      default: 0 // in minutes
    },
    totalPoints: {
      type: Number,
      default: 0
    },
    level: {
      type: Number,
      default: 1
    },
    streakDays: {
      type: Number,
      default: 0
    },
    achievementsUnlocked: {
      type: Number,
      default: 0
    }
  },

  // Social Features
  social: {
    followers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    following: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    friends: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      status: {
        type: String,
        enum: ['pending', 'accepted', 'blocked'],
        default: 'pending'
      },
      since: {
        type: Date,
        default: Date.now
      }
    }],
    profileViews: {
      type: Number,
      default: 0
    },
    isPublicProfile: {
      type: Boolean,
      default: true
    }
  },

  // Activity Tracking
  activityLog: [{
    action: {
      type: String,
      enum: [
        'login', 'logout', 'view_artifact', 'book_tour', 'write_review',
        'bookmark_artifact', 'share_content', 'attend_event', 'complete_course',
        'earn_achievement', 'update_profile', 'follow_user', 'visit_museum'
      ]
    },
    details: {
      type: mongoose.Schema.Types.Mixed
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    ipAddress: String,
    userAgent: String
  }],

  // Gamification
  gamification: {
    badges: [{
      id: String,
      name: String,
      description: String,
      icon: String,
      earnedAt: {
        type: Date,
        default: Date.now
      },
      category: {
        type: String,
        enum: ['exploration', 'learning', 'social', 'achievement']
      }
    }],
    currentStreak: {
      type: Number,
      default: 0
    },
    longestStreak: {
      type: Number,
      default: 0
    },
    lastActivityDate: Date,
    weeklyGoals: {
      artifactsToView: {
        type: Number,
        default: 5
      },
      toursToBook: {
        type: Number,
        default: 1
      },
      eventsToAttend: {
        type: Number,
        default: 1
      }
    },
    weeklyProgress: {
      artifactsViewed: {
        type: Number,
        default: 0
      },
      toursBooked: {
        type: Number,
        default: 0
      },
      eventsAttended: {
        type: Number,
        default: 0
      },
      weekStartDate: Date
    }
  },

  // Learning Profile
  learningProfile: {
    enrolledCourses: [{
      courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
      },
      enrolledAt: {
        type: Date,
        default: Date.now
      },
      status: {
        type: String,
        enum: ['enrolled', 'in_progress', 'completed', 'paused', 'dropped'],
        default: 'enrolled'
      },
      progress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
      },
      startedAt: Date,
      completedAt: Date,
      lastAccessedAt: Date
    }],
    learningStats: {
      totalCoursesEnrolled: {
        type: Number,
        default: 0
      },
      completedCourses: {
        type: Number,
        default: 0
      },
      totalLessonsCompleted: {
        type: Number,
        default: 0
      },
      totalTimeSpent: {
        type: Number,
        default: 0 // in minutes
      },
      averageScore: {
        type: Number,
        default: 0
      },
      currentStreak: {
        type: Number,
        default: 0
      },
      longestStreak: {
        type: Number,
        default: 0
      },
      lastActivityDate: Date,
      certificatesEarned: {
        type: Number,
        default: 0
      },
      achievementsUnlocked: {
        type: Number,
        default: 0
      }
    },
    preferences: {
      learningGoals: [{
        type: String,
        enum: ['Cultural Understanding', 'Historical Knowledge', 'Language Learning', 'Art Appreciation', 'Religious Studies']
      }],
      studyReminders: {
        type: Boolean,
        default: true
      },
      difficultyPreference: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced', 'mixed'],
        default: 'mixed'
      },
      studyTimePreference: {
        type: String,
        enum: ['morning', 'afternoon', 'evening', 'flexible'],
        default: 'flexible'
      },
      weeklyStudyGoal: {
        type: Number,
        default: 120 // minutes per week
      }
    }
  },

  // Bookmarks and Favorites
  bookmarkedArtifacts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Artifact'
  }],
  favoriteMuseums: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Museum'
  }],

  // Chatbot History
  chatHistory: [{
    question: {
      type: String,
      required: true,
      maxLength: [1000, 'Question cannot exceed 1000 characters']
    },
    answer: {
      type: String,
      required: true,
      maxLength: [5000, 'Answer cannot exceed 5000 characters']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    metadata: {
      confidence: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
      },
      suggestions: [{
        type: String,
        maxLength: [200, 'Suggestion cannot exceed 200 characters']
      }],
      references: [{
        title: {
          type: String,
          maxLength: [200, 'Reference title cannot exceed 200 characters']
        },
        url: {
          type: String,
          maxLength: [500, 'Reference URL cannot exceed 500 characters']
        },
        description: {
          type: String,
          maxLength: [300, 'Reference description cannot exceed 300 characters']
        }
      }],
      conversationId: String,
      userAgent: String,
      ipAddress: String
    }
  }],

  // Security
  passwordResetToken: String,
  passwordResetExpires: Date,
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },

  // Subscription/Membership
  membership: {
    type: {
      type: String,
      enum: ['free', 'premium', 'institutional'],
      default: 'free'
    },
    startDate: Date,
    endDate: Date,
    features: [String]
  },

  // Legacy fields for compatibility
  profile: {
    avatar: {
      type: String,
      default: ''
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot be more than 500 characters']
    },
    phone: {
      type: String,
      trim: true
    },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String
    }
  },

  isEmailVerified: {
    type: Boolean,
    default: false
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,

  // Timestamps
  deletedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ museumId: 1 });
userSchema.index({ createdAt: -1 });

// Virtual for user's full name
userSchema.virtual('fullName').get(function () {
  if (this.firstName && this.lastName) {
    return `${this.firstName} ${this.lastName}`;
  }
  return this.name || 'Unknown User';
});

// Virtual for role display name
userSchema.virtual('roleDisplayName').get(function () {
  const roleMap = {
    'superAdmin': 'Super Administrator (Owner)',
    'museumAdmin': 'Museum Administrator',
    'organizer': 'Tour Organizer / Guide',
    'user': 'Visitor'
  };
  return roleMap[this.role] || this.role;
});

// Virtual for checking if account is locked
userSchema.virtual('isLocked').get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Comprehensive text search index
userSchema.index({
  name: 'text',
  firstName: 'text',
  lastName: 'text',
  email: 'text',
  'profile.bio': 'text'
});

// Additional performance indexes
userSchema.index({ lastLogin: -1 }); // Recent logins
userSchema.index({ loginCount: -1 }); // Active users
userSchema.index({ isVerified: 1, isActive: 1 }); // Verified active users
userSchema.index({ 'membership.type': 1 }); // Membership filtering
userSchema.index({ 'stats.artifactsViewed': -1 }); // Most engaged users
userSchema.index({ 'stats.eventsAttended': -1 }); // Event participants
userSchema.index({ lockUntil: 1 }, { sparse: true }); // Locked accounts
userSchema.index({ passwordResetToken: 1 }, { sparse: true }); // Password reset
userSchema.index({ emailVerificationToken: 1 }, { sparse: true }); // Email verification
userSchema.index({ deletedAt: 1 }, { sparse: true }); // Soft deleted users

// Compound indexes for complex queries
userSchema.index({ role: 1, museumId: 1, isActive: 1 }); // Museum staff lookup
userSchema.index({ isActive: 1, isVerified: 1, role: 1 }); // Active verified users by role
userSchema.index({ createdAt: -1, role: 1 }); // Recent users by role
userSchema.index({ 'interests': 1, isActive: 1 }); // Users by interests

// Pre-save middleware to hash password
userSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save middleware to set permissions based on role
userSchema.pre('save', function (next) {
  if (this.isModified('role') || this.isNew) {
    switch (this.role) {
      case 'superAdmin':
        this.permissions = [
          'manage_all_users', 'manage_all_museums', 'approve_museum_registrations',
          'manage_heritage_sites', 'view_platform_analytics', 'manage_system_settings',
          'approve_high_value_rentals', 'manage_api_keys', 'view_audit_logs'
        ];
        break;
      case 'museumAdmin':
        this.permissions = [
          'manage_museum_profile', 'manage_museum_staff', 'manage_artifacts',
          'create_events', 'approve_local_rentals', 'view_museum_analytics',
          'suggest_heritage_sites', 'manage_virtual_museum'
        ];
        break;
      case 'organizer':
        this.permissions = [
          'create_events', 'book_events', 'manage_tours', 'view_analytics',
          'request_rentals', 'view_virtual_museum', 'leave_reviews', 'manage_profile',
          'create_educational_tours', 'manage_educational_tours', 'view_educational_analytics'
        ];
        break;
      case 'user':
        this.permissions = [
          'book_events', 'request_rentals', 'view_virtual_museum',
          'leave_reviews', 'manage_profile'
        ];
        break;
    }
  }
  next();
});

// Query middleware to exclude soft deleted users
userSchema.pre(/^find/, function (next) {
  this.where({ deletedAt: null });
  next();
});

// Instance method to check password
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Instance method to increment login attempts
userSchema.methods.incLoginAttempts = function () {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }

  const updates = { $inc: { loginAttempts: 1 } };

  // Lock account after 5 failed attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }

  return this.updateOne(updates);
};

// Instance method to reset login attempts
userSchema.methods.resetLoginAttempts = function () {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

// Static method to find user by email
userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Static method to find active users
userSchema.statics.findActive = function () {
  return this.find({ isActive: true });
};

// Static method to find users by role
userSchema.statics.findByRole = function (role) {
  return this.find({ role, isActive: true });
};

// Method to check permissions
userSchema.methods.hasPermission = function (permission) {
  return this.permissions.includes(permission) || this.role === 'superAdmin';
};

// Method to check if user can access museum
userSchema.methods.canAccessMuseum = function (museumId) {
  if (this.role === 'superAdmin') return true;
  if (this.role === 'museumAdmin' && this.museumId && this.museumId.toString() === museumId.toString()) return true;
  return false;
};

// Static method to create super admin
userSchema.statics.createSuperAdmin = async function (userData) {
  userData.role = 'superAdmin';
  userData.isVerified = true;
  userData.isActive = true;

  const superAdmin = new this(userData);
  return await superAdmin.save();
};

// Static method to create museum admin
userSchema.statics.createMuseumAdmin = async function (userData, museumId) {
  userData.role = 'museumAdmin';
  userData.museumId = museumId;
  userData.isVerified = true;
  userData.isActive = true;

  const museumAdmin = new this(userData);
  return await museumAdmin.save();
};

// Method to update last login
userSchema.methods.updateLastLogin = async function (ipAddress) {
  this.lastLogin = new Date();
  this.loginCount += 1;
  if (ipAddress) this.ipAddress = ipAddress;
  return await this.save();
};

// Method to soft delete
userSchema.methods.softDelete = async function () {
  this.deletedAt = new Date();
  this.isActive = false;
  return await this.save();
};

// Method to check if user is super admin
userSchema.methods.isSuperAdmin = function () {
  return this.role === 'superAdmin';
};

// Method to check if user is museum admin
userSchema.methods.isMuseumAdmin = function () {
  return this.role === 'museumAdmin';
};

// Method to check if user is regular user/visitor
userSchema.methods.isUser = function () {
  return this.role === 'user';
};

// Method to add bookmark
userSchema.methods.addBookmark = async function (artifactId) {
  if (!this.bookmarkedArtifacts.includes(artifactId)) {
    this.bookmarkedArtifacts.push(artifactId);
    this.stats.artifactsBookmarked += 1;
    return await this.save();
  }
  return this;
};

// Method to remove bookmark
userSchema.methods.removeBookmark = async function (artifactId) {
  const index = this.bookmarkedArtifacts.indexOf(artifactId);
  if (index > -1) {
    this.bookmarkedArtifacts.splice(index, 1);
    this.stats.artifactsBookmarked = Math.max(0, this.stats.artifactsBookmarked - 1);
    return await this.save();
  }
  return this;
};

// Method to add favorite museum
userSchema.methods.addFavoriteMuseum = async function (museumId) {
  if (!this.favoriteMuseums.includes(museumId)) {
    this.favoriteMuseums.push(museumId);
    return await this.save();
  }
  return this;
};

// Method to remove favorite museum
userSchema.methods.removeFavoriteMuseum = async function (museumId) {
  const index = this.favoriteMuseums.indexOf(museumId);
  if (index > -1) {
    this.favoriteMuseums.splice(index, 1);
    return await this.save();
  }
  return this;
};

// Method to increment artifact views
userSchema.methods.incrementArtifactViews = async function () {
  this.stats.artifactsViewed += 1;
  return await this.save();
};

// Method to increment events attended
userSchema.methods.incrementEventsAttended = async function () {
  this.stats.eventsAttended += 1;
  return await this.save();
};

// Method to increment tours booked
userSchema.methods.incrementToursBooked = async function () {
  this.stats.toursBooked += 1;
  return await this.save();
};

// Method to increment reviews written
userSchema.methods.incrementReviewsWritten = async function () {
  this.stats.reviewsWritten += 1;
  return await this.save();
};

// Static method to get user hierarchy level
userSchema.statics.getHierarchyLevel = function (role) {
  const levels = {
    'superAdmin': 3,
    'museumAdmin': 2,
    'user': 1
  };
  return levels[role] || 0;
};

// Method to check if user can manage another user
userSchema.methods.canManageUser = function (targetUser) {
  const currentLevel = this.constructor.getHierarchyLevel(this.role);
  const targetLevel = this.constructor.getHierarchyLevel(targetUser.role);
  return currentLevel > targetLevel;
};

// Static method to find museum admins by museum
userSchema.statics.findMuseumAdmins = function (museumId) {
  return this.find({ role: 'museumAdmin', museumId, isActive: true });
};

// Static method to get platform statistics
userSchema.statics.getPlatformStats = async function () {
  const totalUsers = await this.countDocuments({ isActive: true });
  const superAdmins = await this.countDocuments({ role: 'superAdmin', isActive: true });
  const museumAdmins = await this.countDocuments({ role: 'museumAdmin', isActive: true });
  const regularUsers = await this.countDocuments({ role: 'user', isActive: true });

  return {
    total: totalUsers,
    superAdmins,
    museumAdmins,
    users: regularUsers,
    breakdown: {
      superAdmin: superAdmins,
      museumAdmin: museumAdmins,
      user: regularUsers
    }
  };
};

// Instance method to check if user has a specific permission
userSchema.methods.hasPermission = function (permission) {
  // Super admin has all permissions
  if (this.role === 'superAdmin') {
    return true;
  }

  // Define role permissions mapping
  const rolePermissions = {
    'user': [
      'book_events',
      'request_rentals',
      'view_virtual_museum',
      'leave_reviews',
      'manage_profile'
    ],
    'museumAdmin': [
      'manage_museum_profile',
      'manage_museum_staff',
      'manage_artifacts',
      'create_events',
      'approve_local_rentals',
      'view_museum_analytics',
      'suggest_heritage_sites',
      'manage_virtual_museum',
      'book_events',
      'request_rentals',
      'view_virtual_museum',
      'leave_reviews',
      'manage_profile'
    ],
    'superAdmin': [
      'manage_all_users',
      'manage_all_museums',
      'approve_museum_registrations',
      'manage_heritage_sites',
      'view_platform_analytics',
      'manage_system_settings',
      'approve_high_value_rentals',
      'manage_api_keys',
      'view_audit_logs',
      'manage_museum_profile',
      'manage_museum_staff',
      'manage_artifacts',
      'create_events',
      'approve_local_rentals',
      'view_museum_analytics',
      'suggest_heritage_sites',
      'manage_virtual_museum',
      'book_events',
      'request_rentals',
      'view_virtual_museum',
      'leave_reviews',
      'manage_profile'
    ]
  };

  const permissions = rolePermissions[this.role] || [];
  return permissions.includes(permission);
};

// Advanced methods for new features

// Method to log activity
userSchema.methods.logActivity = async function (action, details = {}, req = null) {
  const activityEntry = {
    action,
    details,
    timestamp: new Date(),
    ipAddress: req?.ip || req?.connection?.remoteAddress,
    userAgent: req?.get('User-Agent')
  };

  this.activityLog.push(activityEntry);

  // Keep only last 100 activities
  if (this.activityLog.length > 100) {
    this.activityLog = this.activityLog.slice(-100);
  }

  return await this.save();
};

// Method to add points and update level
userSchema.methods.addPoints = async function (points, reason = '') {
  this.stats.totalPoints += points;

  // Level up logic (every 1000 points = 1 level)
  const newLevel = Math.floor(this.stats.totalPoints / 1000) + 1;
  if (newLevel > this.stats.level) {
    this.stats.level = newLevel;
    await this.logActivity('level_up', { newLevel, points, reason });
  }

  return await this.save();
};

// Method to update streak
userSchema.methods.updateStreak = async function () {
  const today = new Date();
  const lastActivity = this.gamification.lastActivityDate;

  if (lastActivity) {
    const daysDiff = Math.floor((today - lastActivity) / (1000 * 60 * 60 * 24));

    if (daysDiff === 1) {
      // Continue streak
      this.gamification.currentStreak += 1;
    } else if (daysDiff > 1) {
      // Reset streak
      this.gamification.currentStreak = 1;
    }
    // If daysDiff === 0, same day, don't update streak
  } else {
    // First activity
    this.gamification.currentStreak = 1;
  }

  // Update longest streak
  if (this.gamification.currentStreak > this.gamification.longestStreak) {
    this.gamification.longestStreak = this.gamification.currentStreak;
  }

  this.gamification.lastActivityDate = today;
  return await this.save();
};

// Method to earn badge
userSchema.methods.earnBadge = async function (badgeData) {
  const existingBadge = this.gamification.badges.find(b => b.id === badgeData.id);
  if (!existingBadge) {
    this.gamification.badges.push({
      ...badgeData,
      earnedAt: new Date()
    });
    this.stats.achievementsUnlocked += 1;
    await this.addPoints(100, `Earned badge: ${badgeData.name}`);
    await this.logActivity('earn_achievement', { badge: badgeData.name });
    return await this.save();
  }
  return this;
};

// Social methods
userSchema.methods.follow = async function (userId) {
  if (!this.social.following.includes(userId)) {
    this.social.following.push(userId);

    // Add to target user's followers
    const targetUser = await this.constructor.findById(userId);
    if (targetUser && !targetUser.social.followers.includes(this._id)) {
      targetUser.social.followers.push(this._id);
      await targetUser.save();
    }

    await this.logActivity('follow_user', { userId });
    return await this.save();
  }
  return this;
};

userSchema.methods.unfollow = async function (userId) {
  const index = this.social.following.indexOf(userId);
  if (index > -1) {
    this.social.following.splice(index, 1);

    // Remove from target user's followers
    const targetUser = await this.constructor.findById(userId);
    if (targetUser) {
      const followerIndex = targetUser.social.followers.indexOf(this._id);
      if (followerIndex > -1) {
        targetUser.social.followers.splice(followerIndex, 1);
        await targetUser.save();
      }
    }

    return await this.save();
  }
  return this;
};

// Method to increment profile views
userSchema.methods.incrementProfileViews = async function () {
  this.social.profileViews += 1;
  return await this.save();
};

// Method to get user recommendations
userSchema.methods.getRecommendations = async function () {
  const recommendations = {
    users: [],
    artifacts: [],
    events: [],
    museums: []
  };

  // Find users with similar interests
  if (this.interests && this.interests.length > 0) {
    recommendations.users = await this.constructor.find({
      _id: { $ne: this._id },
      interests: { $in: this.interests },
      isActive: true,
      'preferences.privacy.profileVisibility': 'public'
    }).limit(10).select('firstName lastName avatar interests');
  }

  return recommendations;
};

// Method to reset weekly progress
userSchema.methods.resetWeeklyProgress = async function () {
  const now = new Date();
  const weekStartDate = this.gamification.weeklyProgress.weekStartDate;

  if (!weekStartDate || (now - weekStartDate) >= (7 * 24 * 60 * 60 * 1000)) {
    this.gamification.weeklyProgress = {
      artifactsViewed: 0,
      toursBooked: 0,
      eventsAttended: 0,
      weekStartDate: now
    };
    return await this.save();
  }
  return this;
};

// Method to check and award weekly achievements
userSchema.methods.checkWeeklyAchievements = async function () {
  const progress = this.gamification.weeklyProgress;
  const goals = this.gamification.weeklyGoals;

  // Check if weekly goals are met
  if (progress.artifactsViewed >= goals.artifactsToView &&
    progress.toursBooked >= goals.toursToBook &&
    progress.eventsAttended >= goals.eventsToAttend) {

    await this.earnBadge({
      id: 'weekly_achiever',
      name: 'Weekly Achiever',
      description: 'Completed all weekly goals',
      icon: 'trophy',
      category: 'achievement'
    });
  }
};

// Virtual for follower count
userSchema.virtual('followerCount').get(function () {
  return this.social?.followers?.length || 0;
});

// Virtual for following count
userSchema.virtual('followingCount').get(function () {
  return this.social?.following?.length || 0;
});

// Virtual for badge count
userSchema.virtual('badgeCount').get(function () {
  return this.gamification?.badges?.length || 0;
});

module.exports = mongoose.model('User', userSchema);

