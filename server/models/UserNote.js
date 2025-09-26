const mongoose = require('mongoose');
const { Schema } = mongoose;

const userNoteSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['general', 'heritage', 'history', 'culture', 'artifacts', 'course', 'museum', 'personal'],
    default: 'general',
    index: true
  },
  tags: [String],
  relatedResource: {
    type: {
      type: String,
      enum: ['course', 'museum', 'artifact', 'event', 'tour', 'quiz', 'lesson'],
      default: null
    },
    id: {
      type: Schema.Types.ObjectId,
      default: null
    },
    title: String
  },
  folder: {
    type: String,
    default: 'My Notes',
    index: true
  },
  priority: {
    type: Number,
    enum: [1, 2, 3, 4, 5], // 1=low, 5=high
    default: 3
  },
  isPrivate: {
    type: Boolean,
    default: true
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  reminderDate: {
    type: Date,
    default: null
  },
  attachments: [{
    name: String,
    type: {
      type: String,
      enum: ['image', 'document', 'link', 'video', 'audio']
    },
    url: String,
    size: Number
  }],
  lastModified: {
    type: Date,
    default: Date.now
  },
  wordCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes
userNoteSchema.index({ user: 1, category: 1, createdAt: -1 });
userNoteSchema.index({ user: 1, folder: 1, isPinned: -1, createdAt: -1 });
userNoteSchema.index({ user: 1, tags: 1 });
userNoteSchema.index({ user: 1, reminderDate: 1 });
userNoteSchema.index({ title: 'text', content: 'text' });

// Pre-save middleware to calculate word count
userNoteSchema.pre('save', function(next) {
  if (this.isModified('content')) {
    this.wordCount = this.content.split(/\s+/).filter(word => word.length > 0).length;
    this.lastModified = new Date();
  }
  next();
});

module.exports = mongoose.model('UserNote', userNoteSchema);
