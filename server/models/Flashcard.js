const mongoose = require('mongoose');
const { Schema } = mongoose;

const flashcardSchema = new Schema({
  front: {
    content: {
      type: String,
      required: true
    },
    media: {
      type: {
        type: String,
        enum: ['image', 'video', 'audio']
      },
      url: String,
      caption: String
    }
  },
  back: {
    content: {
      type: String,
      required: true
    },
    media: {
      type: {
        type: String,
        enum: ['image', 'video', 'audio']
      },
      url: String,
      caption: String
    }
  },
  category: {
    type: String,
    enum: ['heritage', 'history', 'culture', 'artifacts', 'geography', 'language', 'general'],
    default: 'heritage',
    index: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  tags: [String],
  relatedCourse: {
    type: Schema.Types.ObjectId,
    ref: 'Course'
  },
  relatedMuseum: {
    type: Schema.Types.ObjectId,
    ref: 'Museum'
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    validate: {
      validator: async function(userId) {
        const User = mongoose.model('User');
        const user = await User.findById(userId);
        return user && ['super-admin', 'admin', 'museum-admin'].includes(user.role);
      },
      message: 'Only admins can create flashcards'
    }
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  studyCount: {
    type: Number,
    default: 0
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  }
}, {
  timestamps: true
});

// Indexes
flashcardSchema.index({ category: 1, isPublished: 1 });
flashcardSchema.index({ tags: 1 });
flashcardSchema.index({ difficulty: 1, category: 1 });
flashcardSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Flashcard', flashcardSchema);
