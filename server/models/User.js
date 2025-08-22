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
  // User Preferences
  preferences: {
    language: {
      type: String,
      enum: ['en', 'am', 'om', 'ti'],
      default: 'en'
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
      }
    },
    privacy: {
      profileVisibility: {
        type: String,
        enum: ['public', 'private'],
        default: 'public'
      },
      showEmail: {
        type: Boolean,
        default: false
      },
      showPhone: {
        type: Boolean,
        default: false
      }
    },
    dashboard: {
      theme: {
        type: String,
        enum: ['light', 'dark'],
        default: 'light'
      },
      defaultView: {
        type: String,
        enum: ['grid', 'list'],
        default: 'grid'
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
userSchema.virtual('fullName').get(function() {
  if (this.firstName && this.lastName) {
    return `${this.firstName} ${this.lastName}`;
  }
  return this.name || 'Unknown User';
});

// Virtual for role display name
userSchema.virtual('roleDisplayName').get(function() {
  const roleMap = {
    'superAdmin': 'Super Administrator (Owner)',
    'museumAdmin': 'Museum Administrator',
    'organizer': 'Tour Organizer / Guide',
    'user': 'Visitor'
  };
  return roleMap[this.role] || this.role;
});

// Virtual for checking if account is locked
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Index for text search
userSchema.index({
  name: 'text',
  firstName: 'text',
  lastName: 'text',
  email: 'text',
  'profile.bio': 'text'
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
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
userSchema.pre('save', function(next) {
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
          'request_rentals', 'view_virtual_museum', 'leave_reviews', 'manage_profile'
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
userSchema.pre(/^find/, function(next) {
  this.where({ deletedAt: null });
  next();
});

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Instance method to increment login attempts
userSchema.methods.incLoginAttempts = function() {
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
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

// Static method to find user by email
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Static method to find active users
userSchema.statics.findActive = function() {
  return this.find({ isActive: true });
};

// Static method to find users by role
userSchema.statics.findByRole = function(role) {
  return this.find({ role, isActive: true });
};

// Method to check permissions
userSchema.methods.hasPermission = function(permission) {
  return this.permissions.includes(permission) || this.role === 'superAdmin';
};

// Method to check if user can access museum
userSchema.methods.canAccessMuseum = function(museumId) {
  if (this.role === 'superAdmin') return true;
  if (this.role === 'museumAdmin' && this.museumId && this.museumId.toString() === museumId.toString()) return true;
  return false;
};

// Static method to create super admin
userSchema.statics.createSuperAdmin = async function(userData) {
  userData.role = 'superAdmin';
  userData.isVerified = true;
  userData.isActive = true;
  
  const superAdmin = new this(userData);
  return await superAdmin.save();
};

// Static method to create museum admin
userSchema.statics.createMuseumAdmin = async function(userData, museumId) {
  userData.role = 'museumAdmin';
  userData.museumId = museumId;
  userData.isVerified = true;
  userData.isActive = true;
  
  const museumAdmin = new this(userData);
  return await museumAdmin.save();
};

// Method to update last login
userSchema.methods.updateLastLogin = async function(ipAddress) {
  this.lastLogin = new Date();
  this.loginCount += 1;
  if (ipAddress) this.ipAddress = ipAddress;
  return await this.save();
};

// Method to soft delete
userSchema.methods.softDelete = async function() {
  this.deletedAt = new Date();
  this.isActive = false;
  return await this.save();
};

// Method to check if user is super admin
userSchema.methods.isSuperAdmin = function() {
  return this.role === 'superAdmin';
};

// Method to check if user is museum admin
userSchema.methods.isMuseumAdmin = function() {
  return this.role === 'museumAdmin';
};

// Method to check if user is regular user/visitor
userSchema.methods.isUser = function() {
  return this.role === 'user';
};

// Method to add bookmark
userSchema.methods.addBookmark = async function(artifactId) {
  if (!this.bookmarkedArtifacts.includes(artifactId)) {
    this.bookmarkedArtifacts.push(artifactId);
    this.stats.artifactsBookmarked += 1;
    return await this.save();
  }
  return this;
};

// Method to remove bookmark
userSchema.methods.removeBookmark = async function(artifactId) {
  const index = this.bookmarkedArtifacts.indexOf(artifactId);
  if (index > -1) {
    this.bookmarkedArtifacts.splice(index, 1);
    this.stats.artifactsBookmarked = Math.max(0, this.stats.artifactsBookmarked - 1);
    return await this.save();
  }
  return this;
};

// Method to add favorite museum
userSchema.methods.addFavoriteMuseum = async function(museumId) {
  if (!this.favoriteMuseums.includes(museumId)) {
    this.favoriteMuseums.push(museumId);
    return await this.save();
  }
  return this;
};

// Method to remove favorite museum
userSchema.methods.removeFavoriteMuseum = async function(museumId) {
  const index = this.favoriteMuseums.indexOf(museumId);
  if (index > -1) {
    this.favoriteMuseums.splice(index, 1);
    return await this.save();
  }
  return this;
};

// Method to increment artifact views
userSchema.methods.incrementArtifactViews = async function() {
  this.stats.artifactsViewed += 1;
  return await this.save();
};

// Method to increment events attended
userSchema.methods.incrementEventsAttended = async function() {
  this.stats.eventsAttended += 1;
  return await this.save();
};

// Method to increment tours booked
userSchema.methods.incrementToursBooked = async function() {
  this.stats.toursBooked += 1;
  return await this.save();
};

// Method to increment reviews written
userSchema.methods.incrementReviewsWritten = async function() {
  this.stats.reviewsWritten += 1;
  return await this.save();
};

// Static method to get user hierarchy level
userSchema.statics.getHierarchyLevel = function(role) {
  const levels = {
    'superAdmin': 3,
    'museumAdmin': 2,
    'user': 1
  };
  return levels[role] || 0;
};

// Method to check if user can manage another user
userSchema.methods.canManageUser = function(targetUser) {
  const currentLevel = this.constructor.getHierarchyLevel(this.role);
  const targetLevel = this.constructor.getHierarchyLevel(targetUser.role);
  return currentLevel > targetLevel;
};

// Static method to find museum admins by museum
userSchema.statics.findMuseumAdmins = function(museumId) {
  return this.find({ role: 'museumAdmin', museumId, isActive: true });
};

// Static method to get platform statistics
userSchema.statics.getPlatformStats = async function() {
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

module.exports = mongoose.model('User', userSchema);

