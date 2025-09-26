const mongoose = require('mongoose');
const { Schema } = mongoose;

const enrollmentSchema = new Schema({
  student: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  course: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
    index: true
  },
  enrollmentDate: {
    type: Date,
    default: Date.now
  },
  completionDate: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['enrolled', 'in-progress', 'completed', 'dropped', 'paused'],
    default: 'enrolled'
  },
  progress: {
    completedLessons: {
      type: Number,
      default: 0
    },
    totalLessons: {
      type: Number,
      default: 0
    },
    percentComplete: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    lastAccessedDate: {
      type: Date,
      default: Date.now
    }
  },
  grades: [{
    assignment: {
      type: Schema.Types.ObjectId,
      ref: 'Assignment'
    },
    score: {
      type: Number,
      min: 0,
      max: 100
    },
    submittedAt: {
      type: Date,
      default: Date.now
    },
    feedback: String
  }],
  studyTime: {
    type: Number, // in minutes
    default: 0
  },
  currentLesson: {
    type: Schema.Types.ObjectId,
    ref: 'Lesson',
    default: null
  },
  achievements: [{
    badge: {
      type: Schema.Types.ObjectId,
      ref: 'Achievement'
    },
    earnedAt: {
      type: Date,
      default: Date.now
    }
  }],
  notes: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound indexes for performance
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });
enrollmentSchema.index({ status: 1, enrollmentDate: -1 });

// Virtual for average grade
enrollmentSchema.virtual('averageGrade').get(function() {
  if (!this.grades || this.grades.length === 0) return null;
  const sum = this.grades.reduce((acc, grade) => acc + grade.score, 0);
  return Math.round((sum / this.grades.length) * 100) / 100;
});

// Method to update progress
enrollmentSchema.methods.updateProgress = function(completedLessons, totalLessons) {
  this.progress.completedLessons = completedLessons;
  this.progress.totalLessons = totalLessons;
  this.progress.percentComplete = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  this.progress.lastAccessedDate = new Date();
  
  if (this.progress.percentComplete === 100) {
    this.status = 'completed';
    this.completionDate = new Date();
  } else if (this.progress.percentComplete > 0) {
    this.status = 'in-progress';
  }
  
  return this.save();
};

module.exports = mongoose.model('Enrollment', enrollmentSchema);
