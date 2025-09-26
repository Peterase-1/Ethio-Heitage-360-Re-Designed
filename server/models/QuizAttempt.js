const mongoose = require('mongoose');
const { Schema } = mongoose;

const quizAttemptSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  quiz: {
    type: Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true,
    index: true
  },
  answers: [{
    questionId: Schema.Types.ObjectId,
    answer: Schema.Types.Mixed, // Can be string, number, array for different question types
    timeSpent: {
      type: Number, // in seconds
      default: 0
    }
  }],
  score: {
    type: Number,
    default: 0
  },
  totalPoints: {
    type: Number,
    default: 0
  },
  percentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  passed: {
    type: Boolean,
    default: false
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  submittedAt: {
    type: Date,
    default: null
  },
  timeSpent: {
    type: Number, // in seconds
    default: 0
  },
  status: {
    type: String,
    enum: ['in-progress', 'submitted', 'abandoned'],
    default: 'in-progress'
  },
  attemptNumber: {
    type: Number,
    required: true
  },
  feedback: String,
  certificateGenerated: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Compound indexes
quizAttemptSchema.index({ user: 1, quiz: 1, attemptNumber: 1 }, { unique: true });
quizAttemptSchema.index({ quiz: 1, percentage: -1 });
quizAttemptSchema.index({ submittedAt: -1 });

// Method to calculate final score
quizAttemptSchema.methods.calculateFinalScore = function(quiz) {
  const result = quiz.calculateScore(this.answers.map(a => a.answer));
  this.score = result.score;
  this.totalPoints = result.totalPoints;
  this.percentage = result.percentage;
  this.passed = result.passed;
  return result;
};

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);
