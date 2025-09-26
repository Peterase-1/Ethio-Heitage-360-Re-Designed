const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    text: String,
    files: [{
      filename: String,
      originalName: String,
      mimetype: String,
      size: Number,
      path: String,
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }],
    links: [String]
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['submitted', 'graded', 'returned', 'resubmitted'],
    default: 'submitted'
  },
  grade: {
    score: {
      type: Number,
      min: 0,
      max: 100
    },
    feedback: String,
    rubricScores: [{
      criteriaId: String,
      criteriaName: String,
      score: Number,
      maxScore: Number,
      feedback: String
    }],
    gradedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    gradedAt: Date
  },
  plagiarismCheck: {
    checked: {
      type: Boolean,
      default: false
    },
    score: Number,
    sources: [String],
    checkedAt: Date
  },
  attempts: {
    type: Number,
    default: 1
  },
  timeSpent: {
    type: Number, // in minutes
    default: 0
  }
});

const rubricCriteriaSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  maxScore: {
    type: Number,
    required: true,
    min: 1
  },
  levels: [{
    name: String,
    description: String,
    score: Number
  }]
});

const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxLength: 200
  },
  description: {
    type: String,
    required: true
  },
  instructions: {
    type: String,
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  lessonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson'
  },
  type: {
    type: String,
    enum: ['essay', 'project', 'presentation', 'research', 'practical', 'group', 'peer_review'],
    required: true
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  totalPoints: {
    type: Number,
    required: true,
    min: 1,
    max: 1000
  },
  
  // Timing
  assignedDate: {
    type: Date,
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: true
  },
  allowLateSubmission: {
    type: Boolean,
    default: false
  },
  latePenalty: {
    type: Number, // percentage deduction per day
    default: 0,
    min: 0,
    max: 100
  },
  
  // Submission settings
  submissionType: {
    type: String,
    enum: ['text', 'file', 'link', 'mixed'],
    default: 'mixed'
  },
  allowedFileTypes: [String],
  maxFileSize: {
    type: Number, // in MB
    default: 10
  },
  maxSubmissions: {
    type: Number,
    default: 1,
    min: 1
  },
  
  // Assessment
  gradingType: {
    type: String,
    enum: ['points', 'percentage', 'letter', 'pass_fail', 'rubric'],
    default: 'points'
  },
  rubric: {
    criteria: [rubricCriteriaSchema],
    totalMaxScore: Number
  },
  autoGrading: {
    enabled: {
      type: Boolean,
      default: false
    },
    keywords: [String],
    minimumLength: Number,
    maximumLength: Number
  },
  
  // Collaboration settings
  groupWork: {
    enabled: {
      type: Boolean,
      default: false
    },
    maxGroupSize: {
      type: Number,
      default: 4,
      min: 2
    },
    groupFormation: {
      type: String,
      enum: ['instructor', 'student', 'random'],
      default: 'student'
    }
  },
  
  // Peer review settings
  peerReview: {
    enabled: {
      type: Boolean,
      default: false
    },
    reviewsPerSubmission: {
      type: Number,
      default: 3,
      min: 1,
      max: 10
    },
    reviewDeadline: Date,
    reviewCriteria: [String],
    anonymousReview: {
      type: Boolean,
      default: true
    }
  },
  
  // Resources and materials
  resources: [{
    title: String,
    url: String,
    type: {
      type: String,
      enum: ['link', 'document', 'video', 'audio', 'image']
    },
    description: String
  }],
  
  // Submissions
  submissions: [submissionSchema],
  
  // Statistics
  stats: {
    totalSubmissions: {
      type: Number,
      default: 0
    },
    onTimeSubmissions: {
      type: Number,
      default: 0
    },
    lateSubmissions: {
      type: Number,
      default: 0
    },
    averageScore: {
      type: Number,
      default: 0
    },
    averageTimeSpent: {
      type: Number,
      default: 0
    }
  },
  
  // Visibility and access
  isActive: {
    type: Boolean,
    default: true
  },
  visibility: {
    type: String,
    enum: ['all_students', 'specific_students', 'groups'],
    default: 'all_students'
  },
  targetStudents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  tags: [String],
  category: {
    type: String,
    enum: ['homework', 'quiz', 'exam', 'project', 'discussion', 'practice']
  }
}, {
  timestamps: true
});

// Indexes for performance
assignmentSchema.index({ courseId: 1, isActive: 1 });
assignmentSchema.index({ dueDate: 1 });
assignmentSchema.index({ createdBy: 1 });
assignmentSchema.index({ 'submissions.studentId': 1 });
assignmentSchema.index({ tags: 1 });
assignmentSchema.index({ title: 'text', description: 'text' });

// Virtuals
assignmentSchema.virtual('isOverdue').get(function() {
  return new Date() > this.dueDate;
});

assignmentSchema.virtual('daysUntilDue').get(function() {
  const now = new Date();
  const dueDate = new Date(this.dueDate);
  const diffTime = dueDate - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Methods
assignmentSchema.methods.getSubmissionByStudent = function(studentId) {
  return this.submissions.find(sub => sub.studentId.toString() === studentId.toString());
};

assignmentSchema.methods.calculateStats = async function() {
  const submissions = this.submissions;
  
  this.stats.totalSubmissions = submissions.length;
  this.stats.onTimeSubmissions = submissions.filter(sub => 
    sub.submittedAt <= this.dueDate
  ).length;
  this.stats.lateSubmissions = submissions.filter(sub => 
    sub.submittedAt > this.dueDate
  ).length;
  
  const gradedSubmissions = submissions.filter(sub => 
    sub.grade && sub.grade.score !== undefined
  );
  
  if (gradedSubmissions.length > 0) {
    const totalScore = gradedSubmissions.reduce((sum, sub) => sum + sub.grade.score, 0);
    this.stats.averageScore = Math.round((totalScore / gradedSubmissions.length) * 100) / 100;
    
    const totalTime = submissions.reduce((sum, sub) => sum + sub.timeSpent, 0);
    this.stats.averageTimeSpent = Math.round((totalTime / submissions.length) * 100) / 100;
  }
  
  return this.save();
};

assignmentSchema.methods.isSubmissionAllowed = function(studentId) {
  if (!this.isActive) return false;
  
  const existingSubmissions = this.submissions.filter(sub => 
    sub.studentId.toString() === studentId.toString()
  );
  
  if (existingSubmissions.length >= this.maxSubmissions) return false;
  
  if (!this.allowLateSubmission && new Date() > this.dueDate) return false;
  
  return true;
};

assignmentSchema.methods.calculateLatePenalty = function(submissionDate) {
  if (submissionDate <= this.dueDate) return 0;
  
  if (!this.allowLateSubmission) return 100; // 100% penalty
  
  const daysLate = Math.ceil((submissionDate - this.dueDate) / (1000 * 60 * 60 * 24));
  return Math.min(this.latePenalty * daysLate, 100);
};

// Pre-save middleware
assignmentSchema.pre('save', function(next) {
  if (this.rubric && this.rubric.criteria && this.rubric.criteria.length > 0) {
    this.rubric.totalMaxScore = this.rubric.criteria.reduce((sum, criteria) => 
      sum + criteria.maxScore, 0
    );
  }
  next();
});

module.exports = mongoose.model('Assignment', assignmentSchema);
