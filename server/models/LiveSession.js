const mongoose = require('mongoose');
const { Schema } = mongoose;

const liveSessionSchema = new Schema({
  title: {
    type: String,
    required: true,
    index: true
  },
  description: String,
  instructor: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    validate: {
      validator: async function(userId) {
        const User = mongoose.model('User');
        const user = await User.findById(userId);
        return user && ['super-admin', 'admin', 'museum-admin', 'staff'].includes(user.role);
      },
      message: 'Only staff members can host live sessions'
    }
  },
  category: {
    type: String,
    enum: ['heritage', 'history', 'culture', 'artifacts', 'geography', 'guided-tour', 'workshop'],
    default: 'heritage',
    index: true
  },
  scheduledAt: {
    type: Date,
    required: true,
    index: true
  },
  duration: {
    type: Number, // in minutes
    required: true,
    min: 15,
    max: 300
  },
  maxParticipants: {
    type: Number,
    default: 50,
    min: 1,
    max: 1000
  },
  participants: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    leftAt: Date,
    status: {
      type: String,
      enum: ['registered', 'attended', 'absent'],
      default: 'registered'
    }
  }],
  status: {
    type: String,
    enum: ['scheduled', 'live', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  meetingLink: String,
  recordingUrl: String,
  materials: [{
    name: String,
    type: {
      type: String,
      enum: ['pdf', 'video', 'image', 'link', 'presentation']
    },
    url: String,
    description: String
  }],
  tags: [String],
  relatedCourse: {
    type: Schema.Types.ObjectId,
    ref: 'Course'
  },
  relatedMuseum: {
    type: Schema.Types.ObjectId,
    ref: 'Museum'
  },
  language: {
    type: String,
    enum: ['english', 'amharic', 'oromo', 'tigrinya'],
    default: 'english'
  },
  isRecorded: {
    type: Boolean,
    default: false
  },
  chatEnabled: {
    type: Boolean,
    default: true
  },
  requiresRegistration: {
    type: Boolean,
    default: true
  },
  feedback: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    submittedAt: {
      type: Date,
      default: Date.now
    }
  }],
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
liveSessionSchema.index({ scheduledAt: 1, status: 1 });
liveSessionSchema.index({ instructor: 1, scheduledAt: -1 });
liveSessionSchema.index({ category: 1, scheduledAt: 1 });
liveSessionSchema.index({ status: 1, scheduledAt: 1 });

// Virtual for current participant count
liveSessionSchema.virtual('participantCount').get(function() {
  return this.participants ? this.participants.length : 0;
});

// Method to register participant
liveSessionSchema.methods.registerParticipant = function(userId) {
  if (this.participantCount >= this.maxParticipants) {
    throw new Error('Session is full');
  }
  
  const existingParticipant = this.participants.find(p => p.user.toString() === userId.toString());
  if (existingParticipant) {
    throw new Error('User already registered');
  }
  
  this.participants.push({ user: userId });
  return this.save();
};

// Method to calculate average rating
liveSessionSchema.methods.updateAverageRating = function() {
  if (this.feedback.length === 0) {
    this.averageRating = 0;
  } else {
    const sum = this.feedback.reduce((total, fb) => total + fb.rating, 0);
    this.averageRating = Math.round((sum / this.feedback.length) * 10) / 10;
  }
  return this.save();
};

module.exports = mongoose.model('LiveSession', liveSessionSchema);
