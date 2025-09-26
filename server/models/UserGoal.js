const mongoose = require('mongoose');
const { Schema } = mongoose;

const userGoalSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  category: {
    type: String,
    enum: ['course-completion', 'skill-building', 'knowledge', 'certification', 'exploration', 'social', 'habit', 'custom'],
    default: 'custom',
    index: true
  },
  type: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'one-time'],
    default: 'one-time'
  },
  target: {
    type: Number,
    required: true,
    min: 1
  },
  current: {
    type: Number,
    default: 0,
    min: 0
  },
  unit: {
    type: String,
    enum: ['courses', 'lessons', 'hours', 'points', 'quizzes', 'museums-visited', 'artifacts-viewed', 'days', 'items'],
    required: true
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  targetDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'paused', 'abandoned'],
    default: 'active'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  relatedResource: {
    type: {
      type: String,
      enum: ['course', 'museum', 'skill', 'certificate', 'badge']
    },
    id: Schema.Types.ObjectId,
    title: String
  },
  milestones: [{
    title: String,
    description: String,
    target: Number,
    completedAt: Date,
    isCompleted: {
      type: Boolean,
      default: false
    }
  }],
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  streakCount: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  completedAt: Date,
  reminders: {
    enabled: {
      type: Boolean,
      default: true
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'bi-weekly', 'monthly'],
      default: 'weekly'
    },
    lastSent: Date,
    nextDue: Date
  },
  notes: String,
  isPublic: {
    type: Boolean,
    default: false
  },
  tags: [String],
  motivationalQuote: String,
  rewards: [{
    description: String,
    milestone: Number,
    claimed: {
      type: Boolean,
      default: false
    },
    claimedAt: Date
  }]
}, {
  timestamps: true
});

// Indexes
userGoalSchema.index({ user: 1, status: 1, targetDate: 1 });
userGoalSchema.index({ user: 1, category: 1, status: 1 });
userGoalSchema.index({ user: 1, type: 1, status: 1 });
userGoalSchema.index({ targetDate: 1, status: 1 });

// Virtual for days remaining
userGoalSchema.virtual('daysRemaining').get(function() {
  if (this.status === 'completed') return 0;
  const now = new Date();
  const target = new Date(this.targetDate);
  const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
});

// Virtual for is overdue
userGoalSchema.virtual('isOverdue').get(function() {
  return this.status === 'active' && new Date() > new Date(this.targetDate);
});

// Pre-save middleware to calculate progress
userGoalSchema.pre('save', function(next) {
  if (this.isModified('current') || this.isModified('target')) {
    this.progress = this.target > 0 ? Math.round((this.current / this.target) * 100) : 0;
    this.lastUpdated = new Date();
    
    // Check if goal is completed
    if (this.current >= this.target && this.status === 'active') {
      this.status = 'completed';
      this.completedAt = new Date();
    }
  }
  next();
});

// Methods
userGoalSchema.methods.updateProgress = function(increment = 1) {
  this.current = Math.min(this.current + increment, this.target);
  
  // Update streak for daily goals
  if (this.type === 'daily') {
    const now = new Date();
    const lastUpdate = new Date(this.lastUpdated);
    const daysDiff = Math.floor((now - lastUpdate) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 1) {
      this.streakCount += 1;
    } else if (daysDiff > 1) {
      this.streakCount = 1;
    }
  }
  
  return this.save();
};

userGoalSchema.methods.addMilestone = function(title, description, target) {
  this.milestones.push({
    title,
    description,
    target,
    isCompleted: this.current >= target
  });
  return this.save();
};

userGoalSchema.methods.completeMilestone = function(milestoneIndex) {
  if (this.milestones[milestoneIndex]) {
    this.milestones[milestoneIndex].isCompleted = true;
    this.milestones[milestoneIndex].completedAt = new Date();
  }
  return this.save();
};

userGoalSchema.methods.pause = function() {
  this.status = 'paused';
  return this.save();
};

userGoalSchema.methods.resume = function() {
  if (this.status === 'paused') {
    this.status = 'active';
  }
  return this.save();
};

module.exports = mongoose.model('UserGoal', userGoalSchema);
