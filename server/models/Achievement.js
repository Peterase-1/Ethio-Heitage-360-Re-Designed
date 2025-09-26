const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      'lesson_complete',
      'course_complete',
      'streak',
      'score',
      'time_spent',
      'category_master',
      'first_lesson',
      'perfect_score',
      'speed_learner',
      'dedicated_learner',
      'explorer',
      'scholar'
    ]
  },
  category: {
    type: String,
    enum: ['history', 'culture', 'archaeology', 'language', 'art', 'traditions', 'general']
  },
  icon: {
    type: String,
    default: 'trophy'
  },
  badge: {
    type: String // URL to badge image
  },
  color: {
    type: String,
    default: '#FFD700' // Gold color
  },
  criteria: {
    type: {
      type: String,
      enum: ['lessons_completed', 'courses_completed', 'streak_days', 'score_average', 'time_spent_hours', 'category_lessons'],
      required: true
    },
    threshold: {
      type: Number,
      required: true
    },
    category: String // For category-specific achievements
  },
  points: {
    type: Number,
    default: 10,
    min: 1
  },
  rarity: {
    type: String,
    enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
    default: 'common'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
achievementSchema.index({ type: 1, category: 1 });
achievementSchema.index({ isActive: 1 });

module.exports = mongoose.model('Achievement', achievementSchema);
