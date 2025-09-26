const mongoose = require('mongoose');
const { Schema } = mongoose;

const assignmentSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxLength: 200
  },
  description: {
    type: String,
    required: true,
    maxLength: 1000
  },
  type: {
    type: String,
    enum: ['essay', 'quiz', 'project', 'presentation', 'research', 'practical', 'discussion'],
    required: true
  },
  instructions: {
    type: String,
    maxLength: 2000
  },
  dueDate: {
    type: Date,
    required: true
  },
  points: {
    type: Number,
    default: 100,
    min: 1
  },
  resources: [{
    title: String,
    url: String,
    type: {
      type: String,
      enum: ['link', 'document', 'video', 'image']
    }
  }],
  rubric: [{
    criteria: String,
    points: Number,
    description: String
  }],
  isActive: {
    type: Boolean,
    default: true
  }
});

const homeworkSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxLength: 200
  },
  description: {
    type: String,
    required: true,
    maxLength: 1000
  },
  subject: {
    type: String,
    enum: ['heritage', 'history', 'culture', 'artifacts', 'geography', 'language', 'general'],
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  estimatedTime: {
    type: Number, // in minutes
    required: true
  },
  dueDate: Date,
  instructions: [{
    step: Number,
    instruction: String,
    resources: [String]
  }],
  questions: [{
    question: String,
    type: {
      type: String,
      enum: ['multiple-choice', 'short-answer', 'essay', 'true-false']
    },
    options: [String], // for multiple choice
    correctAnswer: String,
    points: {
      type: Number,
      default: 10
    }
  }],
  points: {
    type: Number,
    default: 50
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

const commentSchema = new Schema({
  content: {
    type: String,
    required: true,
    maxLength: 1000
  },
  type: {
    type: String,
    enum: ['feedback', 'suggestion', 'correction', 'encouragement', 'instruction'],
    default: 'feedback'
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  attachments: [{
    filename: String,
    url: String,
    type: String
  }],
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const submissionSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  content: {
    type: String,
    maxLength: 5000
  },
  attachments: [{
    filename: String,
    originalName: String,
    url: String,
    size: Number,
    mimeType: String
  }],
  answers: [{
    questionIndex: Number,
    answer: String,
    isCorrect: Boolean,
    points: Number
  }],
  status: {
    type: String,
    enum: ['submitted', 'graded', 'returned', 'late'],
    default: 'submitted'
  },
  grade: {
    score: Number,
    maxScore: Number,
    percentage: Number,
    letterGrade: String,
    feedback: String
  },
  timeSpent: {
    type: Number, // in minutes
    default: 0
  },
  attempts: {
    type: Number,
    default: 1
  },
  isLate: {
    type: Boolean,
    default: false
  }
});

const progressTrackerSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Academic Progress
  academicProgress: {
    overallGrade: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    totalPoints: {
      type: Number,
      default: 0
    },
    earnedPoints: {
      type: Number,
      default: 0
    },
    completionRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    currentLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: 'beginner'
    },
    experiencePoints: {
      type: Number,
      default: 0
    },
    streak: {
      current: {
        type: Number,
        default: 0
      },
      longest: {
        type: Number,
        default: 0
      },
      lastActivity: Date
    }
  },
  
  // Assignments
  assignments: [{
    assignment: assignmentSchema,
    assignedAt: {
      type: Date,
      default: Date.now
    },
    submissions: [submissionSchema],
    status: {
      type: String,
      enum: ['assigned', 'started', 'submitted', 'graded', 'completed', 'overdue'],
      default: 'assigned'
    },
    comments: [commentSchema],
    extensionRequested: {
      type: Boolean,
      default: false
    },
    extensionApproved: {
      type: Boolean,
      default: false
    },
    newDueDate: Date
  }],
  
  // Homework
  homework: [{
    homework: homeworkSchema,
    assignedAt: {
      type: Date,
      default: Date.now
    },
    submissions: [submissionSchema],
    status: {
      type: String,
      enum: ['assigned', 'started', 'submitted', 'graded', 'completed', 'overdue'],
      default: 'assigned'
    },
    comments: [commentSchema],
    attempts: {
      type: Number,
      default: 0
    },
    maxAttempts: {
      type: Number,
      default: 3
    }
  }],
  
  // Learning Activities
  activities: [{
    type: {
      type: String,
      enum: ['quiz', 'game', 'flashcard', 'live-session', 'reading', 'video', 'discussion'],
      required: true
    },
    resourceId: {
      type: Schema.Types.ObjectId,
      required: true
    },
    resourceTitle: String,
    completedAt: Date,
    score: Number,
    timeSpent: Number, // in minutes
    attempts: {
      type: Number,
      default: 1
    },
    progress: {
      type: Number, // percentage
      default: 0
    },
    notes: String,
    achievements: [String]
  }],
  
  // Comments and Feedback
  generalComments: [{
    comment: commentSchema,
    commentedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    category: {
      type: String,
      enum: ['progress', 'behavior', 'participation', 'general'],
      default: 'general'
    }
  }],
  
  // Goals and Targets
  goals: [{
    title: {
      type: String,
      required: true
    },
    description: String,
    targetDate: Date,
    targetScore: Number,
    category: {
      type: String,
      enum: ['academic', 'skill', 'participation', 'completion'],
      default: 'academic'
    },
    isCompleted: {
      type: Boolean,
      default: false
    },
    completedAt: Date,
    progress: {
      type: Number,
      default: 0
    }
  }],
  
  // Achievements and Badges
  achievements: [{
    title: String,
    description: String,
    icon: String,
    category: String,
    earnedAt: {
      type: Date,
      default: Date.now
    },
    points: {
      type: Number,
      default: 0
    }
  }],
  
  // Learning Analytics
  analytics: {
    studyTime: {
      daily: [{
        date: Date,
        minutes: Number
      }],
      weekly: [{
        weekStart: Date,
        minutes: Number
      }],
      monthly: [{
        month: Date,
        minutes: Number
      }],
      total: {
        type: Number,
        default: 0
      }
    },
    performance: {
      averageScore: {
        type: Number,
        default: 0
      },
      improvementRate: {
        type: Number,
        default: 0
      },
      strongSubjects: [String],
      weakSubjects: [String],
      recommendedTopics: [String]
    },
    engagement: {
      loginFrequency: {
        type: Number,
        default: 0
      },
      averageSessionTime: {
        type: Number,
        default: 0
      },
      participationRate: {
        type: Number,
        default: 0
      }
    }
  },
  
  // Notifications and Reminders
  notifications: [{
    type: {
      type: String,
      enum: ['assignment-due', 'homework-due', 'new-comment', 'grade-posted', 'achievement', 'reminder'],
      required: true
    },
    title: String,
    message: String,
    isRead: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    actionUrl: String,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    }
  }],
  
  // Parent/Guardian Access (if applicable)
  parentAccess: {
    enabled: {
      type: Boolean,
      default: false
    },
    parentEmails: [String],
    notificationSettings: {
      grades: {
        type: Boolean,
        default: true
      },
      assignments: {
        type: Boolean,
        default: true
      },
      attendance: {
        type: Boolean,
        default: true
      }
    }
  },
  
  // Settings
  settings: {
    privacy: {
      showProgressToOthers: {
        type: Boolean,
        default: false
      },
      showAchievements: {
        type: Boolean,
        default: true
      }
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
      sms: {
        type: Boolean,
        default: false
      }
    },
    learningPreferences: {
      difficulty: {
        type: String,
        enum: ['adaptive', 'easy', 'medium', 'hard'],
        default: 'adaptive'
      },
      pace: {
        type: String,
        enum: ['slow', 'medium', 'fast', 'self-paced'],
        default: 'self-paced'
      }
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
progressTrackerSchema.index({ user: 1 });
progressTrackerSchema.index({ 'assignments.status': 1 });
progressTrackerSchema.index({ 'homework.status': 1 });
progressTrackerSchema.index({ 'activities.type': 1, 'activities.completedAt': -1 });
progressTrackerSchema.index({ updatedAt: -1 });

// Virtual properties
progressTrackerSchema.virtual('overallProgress').get(function() {
  const totalActivities = this.activities.length;
  const completedActivities = this.activities.filter(a => a.progress >= 100).length;
  
  return totalActivities > 0 ? Math.round((completedActivities / totalActivities) * 100) : 0;
});

progressTrackerSchema.virtual('pendingTasks').get(function() {
  const pendingAssignments = this.assignments.filter(a => 
    ['assigned', 'started'].includes(a.status)
  ).length;
  
  const pendingHomework = this.homework.filter(h => 
    ['assigned', 'started'].includes(h.status)
  ).length;
  
  return pendingAssignments + pendingHomework;
});

progressTrackerSchema.virtual('upcomingDeadlines').get(function() {
  const now = new Date();
  const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  const upcomingAssignments = this.assignments.filter(a => 
    a.assignment.dueDate && 
    a.assignment.dueDate > now && 
    a.assignment.dueDate <= oneWeekFromNow &&
    !['completed', 'graded'].includes(a.status)
  );
  
  const upcomingHomework = this.homework.filter(h => 
    h.homework.dueDate && 
    h.homework.dueDate > now && 
    h.homework.dueDate <= oneWeekFromNow &&
    !['completed', 'graded'].includes(h.status)
  );
  
  return [...upcomingAssignments, ...upcomingHomework];
});

// Instance Methods
progressTrackerSchema.methods.addAssignment = async function(assignmentData, dueDate) {
  const assignment = {
    assignment: { ...assignmentData, dueDate },
    status: 'assigned'
  };
  
  this.assignments.push(assignment);
  
  // Add notification
  this.notifications.push({
    type: 'assignment-due',
    title: `New Assignment: ${assignmentData.title}`,
    message: `You have been assigned a new ${assignmentData.type}. Due: ${dueDate.toLocaleDateString()}`,
    actionUrl: `/assignments/${assignment._id}`
  });
  
  return this.save();
};

progressTrackerSchema.methods.addHomework = async function(homeworkData) {
  const homework = {
    homework: homeworkData,
    status: 'assigned'
  };
  
  this.homework.push(homework);
  
  // Add notification if due date exists
  if (homeworkData.dueDate) {
    this.notifications.push({
      type: 'homework-due',
      title: `New Homework: ${homeworkData.title}`,
      message: `New homework assigned in ${homeworkData.subject}. Due: ${homeworkData.dueDate.toLocaleDateString()}`,
      actionUrl: `/homework/${homework._id}`
    });
  }
  
  return this.save();
};

progressTrackerSchema.methods.submitAssignment = async function(assignmentId, submissionData) {
  const assignment = this.assignments.id(assignmentId);
  if (!assignment) {
    throw new Error('Assignment not found');
  }
  
  // Check if late
  const isLate = assignment.assignment.dueDate && new Date() > assignment.assignment.dueDate;
  
  const submission = {
    ...submissionData,
    user: this.user,
    isLate,
    status: isLate ? 'late' : 'submitted'
  };
  
  assignment.submissions.push(submission);
  assignment.status = 'submitted';
  
  return this.save();
};

progressTrackerSchema.methods.addComment = async function(targetType, targetId, commentData, commentedBy) {
  const comment = {
    comment: commentData,
    commentedBy,
    category: commentData.category || 'general'
  };
  
  if (targetType === 'assignment') {
    const assignment = this.assignments.id(targetId);
    if (assignment) {
      assignment.comments.push(commentData);
    }
  } else if (targetType === 'homework') {
    const homework = this.homework.id(targetId);
    if (homework) {
      homework.comments.push(commentData);
    }
  } else {
    this.generalComments.push(comment);
  }
  
  // Add notification
  this.notifications.push({
    type: 'new-comment',
    title: 'New Comment',
    message: `You have received a new comment on your ${targetType}`,
    actionUrl: `/${targetType}/${targetId}`
  });
  
  return this.save();
};

progressTrackerSchema.methods.recordActivity = async function(activityData) {
  this.activities.push(activityData);
  
  // Update analytics
  if (activityData.timeSpent) {
    this.analytics.studyTime.total += activityData.timeSpent;
    
    // Update daily study time
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let dailyRecord = this.analytics.studyTime.daily.find(d => 
      d.date.getTime() === today.getTime()
    );
    
    if (!dailyRecord) {
      dailyRecord = { date: today, minutes: 0 };
      this.analytics.studyTime.daily.push(dailyRecord);
    }
    
    dailyRecord.minutes += activityData.timeSpent;
  }
  
  // Update streak
  this.updateStreak();
  
  // Update experience points
  this.academicProgress.experiencePoints += (activityData.score || 0);
  
  return this.save();
};

progressTrackerSchema.methods.updateStreak = function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const lastActivity = this.academicProgress.streak.lastActivity;
  
  if (!lastActivity) {
    this.academicProgress.streak.current = 1;
    this.academicProgress.streak.lastActivity = today;
    return;
  }
  
  const lastActivityDate = new Date(lastActivity);
  lastActivityDate.setHours(0, 0, 0, 0);
  
  const daysDiff = Math.floor((today - lastActivityDate) / (1000 * 60 * 60 * 24));
  
  if (daysDiff === 1) {
    // Continue streak
    this.academicProgress.streak.current += 1;
    this.academicProgress.streak.longest = Math.max(
      this.academicProgress.streak.longest, 
      this.academicProgress.streak.current
    );
  } else if (daysDiff > 1) {
    // Reset streak
    this.academicProgress.streak.current = 1;
  }
  // If daysDiff === 0, it's the same day, don't change streak
  
  this.academicProgress.streak.lastActivity = today;
};

progressTrackerSchema.methods.calculateOverallGrade = function() {
  let totalPoints = 0;
  let earnedPoints = 0;
  
  // Calculate from assignments
  this.assignments.forEach(assignment => {
    if (assignment.status === 'graded') {
      assignment.submissions.forEach(submission => {
        if (submission.grade) {
          totalPoints += submission.grade.maxScore;
          earnedPoints += submission.grade.score;
        }
      });
    }
  });
  
  // Calculate from homework
  this.homework.forEach(homework => {
    if (homework.status === 'graded') {
      homework.submissions.forEach(submission => {
        if (submission.grade) {
          totalPoints += submission.grade.maxScore;
          earnedPoints += submission.grade.score;
        }
      });
    }
  });
  
  this.academicProgress.totalPoints = totalPoints;
  this.academicProgress.earnedPoints = earnedPoints;
  this.academicProgress.overallGrade = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
  
  // Update completion rate
  const totalTasks = this.assignments.length + this.homework.length;
  const completedTasks = this.assignments.filter(a => ['completed', 'graded'].includes(a.status)).length + 
                         this.homework.filter(h => ['completed', 'graded'].includes(h.status)).length;
  
  this.academicProgress.completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
};

// Static Methods
progressTrackerSchema.statics.getUserProgress = function(userId) {
  return this.findOne({ user: userId })
    .populate('user', 'name email profileImage')
    .populate('generalComments.commentedBy', 'name')
    .populate('assignments.submissions.user', 'name')
    .populate('homework.submissions.user', 'name');
};

progressTrackerSchema.statics.getClassProgress = function(userIds) {
  return this.find({ user: { $in: userIds } })
    .populate('user', 'name email profileImage')
    .sort({ 'academicProgress.overallGrade': -1 });
};

// Pre-save middleware
progressTrackerSchema.pre('save', function(next) {
  // Recalculate overall grade when assignments or homework change
  if (this.isModified('assignments') || this.isModified('homework')) {
    this.calculateOverallGrade();
  }
  
  // Sort notifications by date (newest first)
  if (this.isModified('notifications')) {
    this.notifications.sort((a, b) => b.createdAt - a.createdAt);
    
    // Keep only last 100 notifications
    this.notifications = this.notifications.slice(0, 100);
  }
  
  next();
});

module.exports = mongoose.model('ProgressTracker', progressTrackerSchema);
