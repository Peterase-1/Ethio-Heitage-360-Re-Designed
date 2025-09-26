const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  itemType: {
    type: String,
    enum: ['assignment', 'quiz', 'exam', 'project', 'participation', 'lesson'],
    required: true
  },
  itemTitle: String,
  
  // Grade details
  score: {
    type: Number,
    required: true,
    min: 0
  },
  maxScore: {
    type: Number,
    required: true,
    min: 1
  },
  percentage: {
    type: Number,
    min: 0,
    max: 100
  },
  letterGrade: {
    type: String,
    enum: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F', 'P', 'NP', 'I', 'W']
  },
  
  // Feedback and comments
  feedback: {
    type: String,
    maxLength: 2000
  },
  rubricScores: [{
    criteriaName: String,
    score: Number,
    maxScore: Number,
    feedback: String
  }],
  
  // Grader information
  gradedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  gradedAt: {
    type: Date,
    default: Date.now
  },
  
  // Status and flags
  status: {
    type: String,
    enum: ['draft', 'published', 'returned', 'disputed'],
    default: 'published'
  },
  isExcused: {
    type: Boolean,
    default: false
  },
  isLate: {
    type: Boolean,
    default: false
  },
  latePenalty: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  
  // Weighted grading
  weight: {
    type: Number,
    default: 1,
    min: 0
  },
  category: {
    type: String,
    enum: ['homework', 'quiz', 'exam', 'project', 'participation', 'extra_credit']
  },
  
  // Improvement tracking
  attempts: [{
    attemptNumber: Number,
    score: Number,
    submittedAt: Date,
    feedback: String
  }],
  
  // Metadata
  semester: String,
  academicYear: String,
  tags: [String]
}, {
  timestamps: true
});

// Indexes
gradeSchema.index({ studentId: 1, courseId: 1 });
gradeSchema.index({ courseId: 1, itemType: 1 });
gradeSchema.index({ gradedAt: -1 });
gradeSchema.index({ status: 1 });

// Calculate percentage before save
gradeSchema.pre('save', function(next) {
  if (this.score !== undefined && this.maxScore > 0) {
    this.percentage = Math.round((this.score / this.maxScore) * 100 * 100) / 100;
  }
  next();
});

// Methods
gradeSchema.methods.getLetterGrade = function() {
  const percentage = this.percentage;
  if (percentage >= 97) return 'A+';
  if (percentage >= 93) return 'A';
  if (percentage >= 90) return 'A-';
  if (percentage >= 87) return 'B+';
  if (percentage >= 83) return 'B';
  if (percentage >= 80) return 'B-';
  if (percentage >= 77) return 'C+';
  if (percentage >= 73) return 'C';
  if (percentage >= 70) return 'C-';
  if (percentage >= 67) return 'D+';
  if (percentage >= 65) return 'D';
  return 'F';
};

gradeSchema.statics.calculateCourseGrade = async function(studentId, courseId) {
  const grades = await this.find({ 
    studentId, 
    courseId, 
    status: 'published',
    isExcused: false 
  });
  
  if (grades.length === 0) return { percentage: 0, letterGrade: 'F' };
  
  const totalWeightedScore = grades.reduce((sum, grade) => 
    sum + (grade.score * grade.weight), 0
  );
  const totalWeight = grades.reduce((sum, grade) => sum + grade.weight, 0);
  
  if (totalWeight === 0) return { percentage: 0, letterGrade: 'F' };
  
  const finalPercentage = Math.round((totalWeightedScore / totalWeight) * 100) / 100;
  
  return {
    percentage: finalPercentage,
    letterGrade: this.prototype.getLetterGrade.call({ percentage: finalPercentage })
  };
};

module.exports = mongoose.model('Grade', gradeSchema);
