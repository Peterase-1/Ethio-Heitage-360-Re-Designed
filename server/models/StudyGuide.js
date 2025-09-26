const mongoose = require('mongoose');

const studyGuideSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['history', 'culture', 'archaeology', 'architecture', 'art', 'religion', 'general']
  },
  topics: [{
    type: String,
    required: true
  }],
  difficulty: {
    type: String,
    required: true,
    enum: ['beginner', 'intermediate', 'advanced']
  },
  estimatedTime: {
    type: Number, // in minutes
    required: true,
    min: 1
  },
  content: {
    type: String,
    required: true
  },
  downloadUrl: {
    type: String,
    required: false
  },
  fileSize: {
    type: Number, // in bytes
    required: false
  },
  fileType: {
    type: String,
    enum: ['pdf', 'doc', 'docx', 'html'],
    default: 'pdf'
  },
  tags: [{
    type: String,
    trim: true
  }],
  prerequisites: [{
    type: String
  }],
  learningObjectives: [{
    type: String
  }],
  references: [{
    title: String,
    author: String,
    url: String,
    year: Number
  }],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  authorName: {
    type: String,
    required: true
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  ratingCount: {
    type: Number,
    default: 0
  },
  version: {
    type: String,
    default: '1.0'
  },
  language: {
    type: String,
    default: 'English'
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better performance
studyGuideSchema.index({ category: 1 });
studyGuideSchema.index({ difficulty: 1 });
studyGuideSchema.index({ isPublished: 1, isActive: 1 });
studyGuideSchema.index({ tags: 1 });
studyGuideSchema.index({ title: 'text', description: 'text', content: 'text' });

// Virtual for formatted file size
studyGuideSchema.virtual('formattedFileSize').get(function() {
  if (!this.fileSize) return 'Unknown';
  
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (this.fileSize === 0) return '0 Bytes';
  
  const i = Math.floor(Math.log(this.fileSize) / Math.log(1024));
  return Math.round(this.fileSize / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
});

// Static method to get published guides
studyGuideSchema.statics.getPublished = function(filters = {}) {
  return this.find({ 
    isPublished: true, 
    isActive: true,
    ...filters 
  }).populate('author', 'firstName lastName');
};

// Instance method to increment download count
studyGuideSchema.methods.incrementDownload = function() {
  this.downloadCount += 1;
  return this.save();
};

// Pre-save middleware to update lastUpdated
studyGuideSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.lastUpdated = new Date();
  }
  next();
});

module.exports = mongoose.model('StudyGuide', studyGuideSchema);
