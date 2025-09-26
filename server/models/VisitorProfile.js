const mongoose = require('mongoose');

const visitorProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  personalInfo: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ['male', 'female', 'other', 'prefer_not_to_say'] },
    phone: { type: String },
    address: {
      street: String,
      city: String,
      state: String,
      country: { type: String, default: 'Ethiopia' },
      zipCode: String
    }
  },
  preferences: {
    language: { type: String, default: 'en' },
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: true }
    },
    interests: [{
      type: String,
      enum: ['history', 'art', 'culture', 'archaeology', 'architecture', 'music', 'literature', 'religion', 'nature', 'science']
    }],
    favoriteCategories: [String],
    difficultyLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' }
  },
  stats: {
    totalPoints: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    streakDays: { type: Number, default: 0 },
    lastActivityDate: { type: Date, default: Date.now },
    
    // Learning statistics
    coursesEnrolled: { type: Number, default: 0 },
    coursesCompleted: { type: Number, default: 0 },
    totalStudyTime: { type: Number, default: 0 }, // in minutes
    averageScore: { type: Number, default: 0 },
    
    // Museum statistics
    museumsVisited: { type: Number, default: 0 },
    artifactsViewed: { type: Number, default: 0 },
    toursCompleted: { type: Number, default: 0 },
    virtualToursCompleted: { type: Number, default: 0 },
    
    // Social statistics
    reviewsWritten: { type: Number, default: 0 },
    photosUploaded: { type: Number, default: 0 },
    commentsPosted: { type: Number, default: 0 },
    sharesCount: { type: Number, default: 0 }
  },
  achievements: [{
    badgeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Badge' },
    name: String,
    description: String,
    iconUrl: String,
    dateEarned: { type: Date, default: Date.now },
    category: String
  }],
  learningPath: {
    currentPath: String,
    completedPaths: [String],
    recommendedCourses: [{
      courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
      reason: String,
      priority: { type: Number, default: 1 }
    }]
  },
  socialProfile: {
    bio: String,
    profilePicture: String,
    isPublic: { type: Boolean, default: true },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'VisitorProfile' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'VisitorProfile' }],
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'VisitorProfile' }]
  },
  privacy: {
    showProfile: { type: Boolean, default: true },
    showActivity: { type: Boolean, default: true },
    showAchievements: { type: Boolean, default: true },
    allowMessages: { type: Boolean, default: true }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
visitorProfileSchema.virtual('fullName').get(function() {
  return `${this.personalInfo.firstName} ${this.personalInfo.lastName}`;
});

// Virtual for completion rate
visitorProfileSchema.virtual('completionRate').get(function() {
  if (this.stats.coursesEnrolled === 0) return 0;
  return Math.round((this.stats.coursesCompleted / this.stats.coursesEnrolled) * 100);
});

// Virtual for level progress
visitorProfileSchema.virtual('levelProgress').get(function() {
  const pointsForCurrentLevel = this.stats.level * 1000; // Each level requires 1000 more points
  const pointsForNextLevel = (this.stats.level + 1) * 1000;
  const currentLevelPoints = this.stats.totalPoints - (pointsForCurrentLevel - 1000);
  const pointsNeededForNextLevel = 1000;
  return Math.min(Math.round((currentLevelPoints / pointsNeededForNextLevel) * 100), 100);
});

// Method to update level based on points
visitorProfileSchema.methods.updateLevel = function() {
  const newLevel = Math.floor(this.stats.totalPoints / 1000) + 1;
  if (newLevel > this.stats.level) {
    this.stats.level = newLevel;
    return true; // Level up occurred
  }
  return false;
};

// Method to add points and check for level up
visitorProfileSchema.methods.addPoints = function(points) {
  this.stats.totalPoints += points;
  return this.updateLevel();
};

// Method to update streak
visitorProfileSchema.methods.updateStreak = function() {
  const today = new Date();
  const lastActivity = new Date(this.stats.lastActivityDate);
  const daysDiff = Math.floor((today - lastActivity) / (1000 * 60 * 60 * 24));
  
  if (daysDiff === 1) {
    // Consecutive day
    this.stats.streakDays += 1;
  } else if (daysDiff > 1) {
    // Streak broken
    this.stats.streakDays = 1;
  }
  // If daysDiff === 0, it's the same day, no change needed
  
  this.stats.lastActivityDate = today;
  return this.save();
};

// Index for efficient queries
visitorProfileSchema.index({ userId: 1 });
visitorProfileSchema.index({ 'stats.totalPoints': -1 });
visitorProfileSchema.index({ 'stats.level': -1 });
visitorProfileSchema.index({ 'preferences.interests': 1 });

module.exports = mongoose.model('VisitorProfile', visitorProfileSchema);
