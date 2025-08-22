const mongoose = require('mongoose');

const lessonProgressSchema = new mongoose.Schema({
  lessonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson',
    required: true
  },
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'completed'],
    default: 'not_started'
  },
  startedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  timeSpent: {
    type: Number, // in minutes
    default: 0
  },
  score: {
    type: Number, // quiz score
    min: 0,
    max: 100
  },
  attempts: {
    type: Number,
    default: 0
  },
  lastAccessedAt: {
    type: Date,
    default: Date.now
  }
});

const courseProgressSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'completed'],
    default: 'not_started'
  },
  enrolledAt: {
    type: Date,
    default: Date.now
  },
  startedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  progressPercentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  lessons: [lessonProgressSchema]
});

const learningProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  courses: [courseProgressSchema],
  overallStats: {
    totalLessonsCompleted: {
      type: Number,
      default: 0
    },
    totalTimeSpent: {
      type: Number, // in minutes
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
    lastActivityDate: {
      type: Date
    },
    averageScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    }
  },
  achievements: [{
    achievementId: String,
    earnedAt: {
      type: Date,
      default: Date.now
    },
    type: {
      type: String,
      enum: ['lesson_complete', 'course_complete', 'streak', 'score', 'time_spent']
    }
  }],
  preferences: {
    preferredCategories: [{
      type: String,
      enum: ['history', 'culture', 'archaeology', 'language', 'art', 'traditions']
    }],
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner'
    },
    notifications: {
      type: Boolean,
      default: true
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
learningProgressSchema.index({ userId: 1 });
learningProgressSchema.index({ 'courses.courseId': 1 });
learningProgressSchema.index({ 'overallStats.lastActivityDate': -1 });

// Methods
learningProgressSchema.methods.updateStreak = function() {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const lastActivity = this.overallStats.lastActivityDate;
  
  if (!lastActivity) {
    this.overallStats.currentStreak = 1;
  } else if (lastActivity.toDateString() === yesterday.toDateString()) {
    this.overallStats.currentStreak += 1;
  } else if (lastActivity.toDateString() !== today.toDateString()) {
    this.overallStats.currentStreak = 1;
  }
  
  // Update longest streak if needed
  if (this.overallStats.currentStreak > this.overallStats.longestStreak) {
    this.overallStats.longestStreak = this.overallStats.currentStreak;
  }
  
  this.overallStats.lastActivityDate = today;
};

learningProgressSchema.methods.getCourseProgress = function(courseId) {
  return this.courses.find(course => course.courseId.toString() === courseId.toString());
};

learningProgressSchema.methods.updateCourseProgress = function(courseId) {
  const courseProgress = this.getCourseProgress(courseId);
  if (!courseProgress) return;
  
  const completedLessons = courseProgress.lessons.filter(lesson => lesson.status === 'completed').length;
  const totalLessons = courseProgress.lessons.length;
  
  if (totalLessons > 0) {
    courseProgress.progressPercentage = Math.round((completedLessons / totalLessons) * 100);
    
    if (courseProgress.progressPercentage === 100 && courseProgress.status !== 'completed') {
      courseProgress.status = 'completed';
      courseProgress.completedAt = new Date();
    } else if (courseProgress.progressPercentage > 0 && courseProgress.status === 'not_started') {
      courseProgress.status = 'in_progress';
      if (!courseProgress.startedAt) {
        courseProgress.startedAt = new Date();
      }
    }
  }
};

module.exports = mongoose.model('LearningProgress', learningProgressSchema);
