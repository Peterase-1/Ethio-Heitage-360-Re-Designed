const mongoose = require('mongoose');
const { Schema } = mongoose;

const gameQuestionSchema = new Schema({
  question: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['multiple-choice', 'true-false', 'drag-drop', 'matching', 'word-puzzle', 'image-select'],
    default: 'multiple-choice'
  },
  options: [{
    text: String,
    isCorrect: Boolean,
    image: String // URL for image-based options
  }],
  correctAnswer: String, // For word puzzles or text-based answers
  media: {
    type: {
      type: String,
      enum: ['image', 'video', 'audio']
    },
    url: String,
    caption: String
  },
  points: {
    type: Number,
    default: 10,
    min: 1
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  timeLimit: {
    type: Number, // in seconds
    default: 30
  },
  hints: [String],
  explanation: String
});

const gameLevelSchema = new Schema({
  level: {
    type: Number,
    required: true,
    min: 1
  },
  name: {
    type: String,
    required: true
  },
  description: String,
  questions: [gameQuestionSchema],
  pointsToUnlock: {
    type: Number,
    default: 0
  },
  minScoreToPass: {
    type: Number,
    default: 70,
    min: 0,
    max: 100
  },
  rewardPoints: {
    type: Number,
    default: 100
  },
  unlockRequirements: [{
    type: {
      type: String,
      enum: ['level', 'course', 'achievement', 'quiz']
    },
    resourceId: Schema.Types.ObjectId,
    resourceName: String
  }]
});

const gameSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxLength: 200,
    index: true
  },
  description: {
    type: String,
    required: true,
    maxLength: 1000
  },
  instructions: {
    type: String,
    required: true,
    maxLength: 2000
  },
  gameType: {
    type: String,
    enum: ['quiz-adventure', 'memory-match', 'heritage-hunt', 'timeline-challenge', 'artifact-discovery', 'culture-quest'],
    required: true
  },
  category: {
    type: String,
    enum: ['heritage', 'history', 'culture', 'artifacts', 'geography', 'traditions', 'language', 'art'],
    required: true,
    index: true
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  
  // Game Structure
  levels: [gameLevelSchema],
  
  // Game Settings
  settings: {
    timeLimit: {
      type: Number, // in minutes for entire game
      default: 60
    },
    attemptsAllowed: {
      type: Number,
      default: 3
    },
    showHints: {
      type: Boolean,
      default: true
    },
    showExplanations: {
      type: Boolean,
      default: true
    },
    allowPause: {
      type: Boolean,
      default: true
    },
    shuffleLevels: {
      type: Boolean,
      default: false
    },
    shuffleQuestions: {
      type: Boolean,
      default: true
    },
    enableLeaderboard: {
      type: Boolean,
      default: true
    },
    enableMultiplayer: {
      type: Boolean,
      default: false
    },
    maxPlayers: {
      type: Number,
      default: 1,
      min: 1,
      max: 10
    }
  },
  
  // Rewards and Progression
  rewards: {
    pointsPerCorrectAnswer: {
      type: Number,
      default: 10
    },
    bonusPointsForPerfectScore: {
      type: Number,
      default: 100
    },
    bonusPointsForSpeed: {
      type: Number,
      default: 50
    },
    achievements: [{
      name: String,
      description: String,
      icon: String,
      points: Number,
      criteria: {
        type: String, // 'score', 'time', 'streak', 'completion'
        value: Number
      }
    }],
    badges: [{
      name: String,
      image: String,
      description: String,
      unlockCriteria: String
    }]
  },
  
  // Media and Assets
  media: {
    thumbnail: String,
    banner: String,
    backgroundMusic: String,
    soundEffects: {
      correct: String,
      incorrect: String,
      levelUp: String,
      gameOver: String
    },
    gameAssets: [{
      name: String,
      type: {
        type: String,
        enum: ['image', 'audio', 'video', 'animation']
      },
      url: String,
      description: String
    }]
  },
  
  // Educational Content
  educationalContent: {
    learningObjectives: [String],
    skillsTargeted: [String],
    vocabulary: [{
      term: String,
      definition: String,
      pronunciation: String
    }],
    culturalContext: String,
    historicalBackground: String
  },
  
  // Publishing and Management
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    validate: {
      validator: async function(userId) {
        const User = mongoose.model('User');
        const user = await User.findById(userId);
        return user && user.role === 'superAdmin';
      },
      message: 'Only super admins can create games'
    }
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  publishedAt: Date,
  
  // Statistics and Analytics
  stats: {
    totalPlays: {
      type: Number,
      default: 0
    },
    totalCompletions: {
      type: Number,
      default: 0
    },
    averageScore: {
      type: Number,
      default: 0
    },
    averagePlayTime: {
      type: Number, // in seconds
      default: 0
    },
    highScore: {
      type: Number,
      default: 0
    },
    totalPoints: {
      type: Number,
      default: 0
    }
  },
  
  // Player Data and Leaderboard
  playerScores: [{
    player: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    playerName: String,
    score: Number,
    completionTime: Number, // in seconds
    levelsCompleted: Number,
    perfectLevels: Number,
    playedAt: {
      type: Date,
      default: Date.now
    },
    achievements: [String],
    badges: [String]
  }],
  
  // Version Control
  version: {
    type: String,
    default: '1.0.0'
  },
  changeLog: [{
    version: String,
    changes: [String],
    date: {
      type: Date,
      default: Date.now
    }
  }],
  
  // SEO and Metadata
  tags: [String],
  relatedCourse: {
    type: Schema.Types.ObjectId,
    ref: 'Course'
  },
  relatedMuseum: {
    type: Schema.Types.ObjectId,
    ref: 'Museum'
  },
  
  // Content Rating and Reviews
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  reviews: [{
    player: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    date: {
      type: Date,
      default: Date.now
    },
    helpful: {
      type: Number,
      default: 0
    }
  }],
  
  // Accessibility Features
  accessibility: {
    supportScreenReader: {
      type: Boolean,
      default: false
    },
    highContrast: {
      type: Boolean,
      default: false
    },
    keyboardNavigation: {
      type: Boolean,
      default: true
    },
    audioSupport: {
      type: Boolean,
      default: false
    },
    subtitles: {
      type: Boolean,
      default: false
    }
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
gameSchema.index({ title: 'text', description: 'text', tags: 'text' });
gameSchema.index({ category: 1, difficulty: 1, isPublished: 1 });
gameSchema.index({ createdBy: 1, isActive: 1 });
gameSchema.index({ 'stats.totalPlays': -1 });
gameSchema.index({ 'stats.averageScore': -1 });
gameSchema.index({ 'rating.average': -1 });
gameSchema.index({ publishedAt: -1 });

// Virtual properties
gameSchema.virtual('totalLevels').get(function() {
  return this.levels.length;
});

gameSchema.virtual('totalQuestions').get(function() {
  return this.levels.reduce((total, level) => total + level.questions.length, 0);
});

gameSchema.virtual('completionRate').get(function() {
  return this.stats.totalPlays > 0 ? 
    Math.round((this.stats.totalCompletions / this.stats.totalPlays) * 100) : 0;
});

gameSchema.virtual('difficultyRating').get(function() {
  // Calculate based on average completion time and score
  const avgTime = this.stats.averagePlayTime;
  const avgScore = this.stats.averageScore;
  
  if (avgScore > 80 && avgTime < 300) return 'easy';
  if (avgScore > 60 && avgTime < 600) return 'medium';
  return 'hard';
});

// Instance Methods
gameSchema.methods.calculateTotalPoints = function() {
  return this.levels.reduce((total, level) => {
    return total + level.questions.reduce((levelTotal, question) => {
      return levelTotal + question.points;
    }, 0);
  }, 0);
};

gameSchema.methods.addPlayerScore = async function(playerId, scoreData) {
  // Remove previous score for same player
  this.playerScores = this.playerScores.filter(score => 
    score.player.toString() !== playerId.toString()
  );
  
  // Add new score
  this.playerScores.push({
    player: playerId,
    ...scoreData
  });
  
  // Sort by score descending
  this.playerScores.sort((a, b) => b.score - a.score);
  
  // Keep only top 100 scores
  this.playerScores = this.playerScores.slice(0, 100);
  
  // Update game statistics
  this.stats.totalPlays += 1;
  if (scoreData.levelsCompleted === this.levels.length) {
    this.stats.totalCompletions += 1;
  }
  
  // Update average score
  const allScores = this.playerScores.map(p => p.score);
  this.stats.averageScore = Math.round(
    allScores.reduce((sum, score) => sum + score, 0) / allScores.length
  );
  
  // Update high score
  this.stats.highScore = Math.max(this.stats.highScore, scoreData.score);
  
  // Update average play time
  const allTimes = this.playerScores.map(p => p.completionTime).filter(t => t > 0);
  if (allTimes.length > 0) {
    this.stats.averagePlayTime = Math.round(
      allTimes.reduce((sum, time) => sum + time, 0) / allTimes.length
    );
  }
  
  return this.save();
};

gameSchema.methods.getLeaderboard = function(limit = 10) {
  return this.playerScores
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((score, index) => ({
      rank: index + 1,
      ...score.toObject()
    }));
};

gameSchema.methods.getUserRank = function(userId) {
  const userScoreIndex = this.playerScores.findIndex(score => 
    score.player.toString() === userId.toString()
  );
  return userScoreIndex !== -1 ? userScoreIndex + 1 : null;
};

gameSchema.methods.addReview = async function(userId, rating, comment = '') {
  // Remove existing review from same user
  this.reviews = this.reviews.filter(review => 
    review.player.toString() !== userId.toString()
  );
  
  // Add new review
  this.reviews.push({
    player: userId,
    rating,
    comment
  });
  
  // Update average rating
  this.rating.count = this.reviews.length;
  this.rating.average = this.reviews.reduce((sum, review) => sum + review.rating, 0) / this.reviews.length;
  this.rating.average = Math.round(this.rating.average * 10) / 10; // Round to 1 decimal
  
  return this.save();
};

// Static Methods
gameSchema.statics.getPublishedGames = function(filters = {}) {
  const query = { isPublished: true, isActive: true };
  
  if (filters.category) query.category = filters.category;
  if (filters.difficulty) query.difficulty = filters.difficulty;
  if (filters.gameType) query.gameType = filters.gameType;
  
  return this.find(query).populate('createdBy', 'name').sort({ publishedAt: -1 });
};

gameSchema.statics.getPopularGames = function(limit = 10) {
  return this.find({ isPublished: true, isActive: true })
    .sort({ 'stats.totalPlays': -1, 'rating.average': -1 })
    .limit(limit)
    .populate('createdBy', 'name');
};

gameSchema.statics.searchGames = function(searchTerm, filters = {}) {
  let query = { isPublished: true, isActive: true };
  
  if (searchTerm) {
    query.$text = { $search: searchTerm };
  }
  
  if (filters.category) query.category = filters.category;
  if (filters.difficulty) query.difficulty = filters.difficulty;
  if (filters.gameType) query.gameType = filters.gameType;
  
  return this.find(query).populate('createdBy', 'name');
};

// Pre-save middleware
gameSchema.pre('save', function(next) {
  // Calculate total points if levels modified
  if (this.isModified('levels')) {
    this.stats.totalPoints = this.calculateTotalPoints();
  }
  
  // Set published date when first published
  if (this.isModified('isPublished') && this.isPublished && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  next();
});

module.exports = mongoose.model('Game', gameSchema);
