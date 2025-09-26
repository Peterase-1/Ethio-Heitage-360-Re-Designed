const mongoose = require('mongoose');
const { Schema } = mongoose;

const bookmarkSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  resourceType: {
    type: String,
    enum: ['course', 'museum', 'artifact', 'event', 'tour', 'quiz', 'flashcard', 'live-session', 'heritage-site'],
    required: true,
    index: true
  },
  resourceId: {
    type: Schema.Types.ObjectId,
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  imageUrl: String,
  url: String, // Direct link to the resource
  category: String,
  tags: [String],
  notes: {
    type: String,
    default: ''
  },
  isPrivate: {
    type: Boolean,
    default: true
  },
  folder: {
    type: String,
    default: 'General',
    index: true
  },
  priority: {
    type: Number,
    enum: [1, 2, 3, 4, 5], // 1=low, 5=high
    default: 3
  },
  lastAccessed: {
    type: Date,
    default: Date.now
  },
  accessCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Compound indexes
bookmarkSchema.index({ user: 1, resourceType: 1, resourceId: 1 }, { unique: true });
bookmarkSchema.index({ user: 1, folder: 1, createdAt: -1 });
bookmarkSchema.index({ user: 1, priority: -1, createdAt: -1 });
bookmarkSchema.index({ user: 1, lastAccessed: -1 });

// Method to update access info
bookmarkSchema.methods.updateAccess = function() {
  this.lastAccessed = new Date();
  this.accessCount += 1;
  return this.save();
};

module.exports = mongoose.model('Bookmark', bookmarkSchema);
