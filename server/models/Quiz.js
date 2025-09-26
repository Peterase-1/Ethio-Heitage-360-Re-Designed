const mongoose = require('mongoose');
const { Schema } = mongoose;

const questionSchema = new Schema({
  question: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['multiple-choice', 'true-false', 'fill-blank', 'drag-drop', 'matching'],
    default: 'multiple-choice'
  },
  options: [{
    text: String,
    isCorrect: Boolean,
    explanation: String
  }],
  correctAnswer: String, // For fill-blank questions
  points: {
    type: Number,
    default: 1,
    min: 0
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  category: String,
  media: {
    type: {
      type: String,
      enum: ['image', 'video', 'audio'],
      default: null
    },
    url: String,
    caption: String
  },
  hints: [String],
  timeLimit: {
    type: Number, // in seconds
    default: 60
  }
});

const quizSchema = new Schema({
  title: {
    type: String,
    required: true,
    index: true
  },
  description: String,
  instructions: String,
  category: {
    type: String,
    enum: ['heritage', 'history', 'culture', 'artifacts', 'geography', 'general'],
    default: 'heritage',
    index: true
  },
  questions: [questionSchema],
  settings: {
    timeLimit: {
      type: Number, // in minutes
      default: 30
    },
    attemptsAllowed: {
      type: Number,
      default: 3
    },
    shuffleQuestions: {
      type: Boolean,
      default: true
    },
    showCorrectAnswers: {
      type: Boolean,
      default: true
    },
    passingScore: {
      type: Number,
      default: 70,
      min: 0,
      max: 100
    },
    certificateEligible: {
      type: Boolean,
      default: false
    }
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'intermediate'
  },
  tags: [String],
  relatedCourse: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    default: null
  },
  relatedMuseum: {
    type: Schema.Types.ObjectId,
    ref: 'Museum',
    default: null
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    validate: {
      validator: async function(userId) {
        const User = mongoose.model('User');
        const user = await User.findById(userId);
        return user && user.role === 'super-admin';
      },
      message: 'Only super admins can create quizzes'
    }
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  totalPoints: {
    type: Number,
    default: 0
  },
  averageScore: {
    type: Number,
    default: 0
  },
  timesAttempted: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for performance
quizSchema.index({ category: 1, isPublished: 1 });
quizSchema.index({ tags: 1 });
quizSchema.index({ difficulty: 1, category: 1 });
quizSchema.index({ createdAt: -1 });

// Pre-save middleware to calculate total points
quizSchema.pre('save', function(next) {
  if (this.isModified('questions')) {
    this.totalPoints = this.questions.reduce((sum, q) => sum + q.points, 0);
  }
  next();
});

// Methods
quizSchema.methods.calculateScore = function(answers) {
  let totalScore = 0;
  let correctAnswers = 0;
  
  answers.forEach((answer, index) => {
    const question = this.questions[index];
    if (question) {
      if (question.type === 'multiple-choice') {
        const selectedOption = question.options[answer];
        if (selectedOption && selectedOption.isCorrect) {
          totalScore += question.points;
          correctAnswers++;
        }
      } else if (question.type === 'true-false') {
        const correctOption = question.options.find(opt => opt.isCorrect);
        if (correctOption && answer === correctOption.text) {
          totalScore += question.points;
          correctAnswers++;
        }
      } else if (question.type === 'fill-blank') {
        if (answer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim()) {
          totalScore += question.points;
          correctAnswers++;
        }
      }
    }
  });
  
  const percentage = this.totalPoints > 0 ? Math.round((totalScore / this.totalPoints) * 100) : 0;
  
  return {
    score: totalScore,
    totalPoints: this.totalPoints,
    percentage,
    correctAnswers,
    totalQuestions: this.questions.length,
    passed: percentage >= this.settings.passingScore
  };
};

module.exports = mongoose.model('Quiz', quizSchema);
