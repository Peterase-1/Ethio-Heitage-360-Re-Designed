const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  certificateId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  completionDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  finalScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  timeSpent: {
    type: Number, // in minutes
    required: true
  },
  lessonsCompleted: {
    type: Number,
    required: true
  },
  totalLessons: {
    type: Number,
    required: true
  },
  instructor: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['history', 'culture', 'archaeology', 'language', 'art', 'traditions']
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['beginner', 'intermediate', 'advanced']
  },
  certificateUrl: {
    type: String // URL to generated certificate PDF/image
  },
  verificationCode: {
    type: String,
    required: true,
    unique: true
  },
  isValid: {
    type: Boolean,
    default: true
  },
  metadata: {
    courseVersion: String,
    completionPercentage: Number,
    averageQuizScore: Number,
    skillsAcquired: [String],
    recognitions: [String]
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Generate certificate ID and verification code before saving
certificateSchema.pre('save', function(next) {
  if (!this.certificateId) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    this.certificateId = `ETHIO-${timestamp}-${random}`.toUpperCase();
  }
  
  if (!this.verificationCode) {
    this.verificationCode = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
  
  next();
});

// Indexes for efficient queries
certificateSchema.index({ userId: 1, courseId: 1 });
certificateSchema.index({ certificateId: 1 });
certificateSchema.index({ verificationCode: 1 });
certificateSchema.index({ completionDate: -1 });

// Methods
certificateSchema.methods.generateCertificateUrl = function() {
  return `/api/certificates/${this.certificateId}/download`;
};

certificateSchema.methods.getVerificationUrl = function() {
  return `/verify/${this.verificationCode}`;
};

module.exports = mongoose.model('Certificate', certificateSchema);
