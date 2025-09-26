const mongoose = require('mongoose');
const { Schema } = mongoose;

const studyGroupSchema = new Schema({
  name: {
    type: String,
    required: true,
    index: true
  },
  description: String,
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['owner', 'moderator', 'member'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true
    },
    lastSeen: {
      type: Date,
      default: Date.now
    }
  }],
  category: {
    type: String,
    enum: ['heritage', 'history', 'culture', 'artifacts', 'language', 'general'],
    default: 'heritage',
    index: true
  },
  tags: [String],
  relatedCourse: {
    type: Schema.Types.ObjectId,
    ref: 'Course'
  },
  maxMembers: {
    type: Number,
    default: 20,
    min: 2,
    max: 100
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  requiresApproval: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'archived'],
    default: 'active'
  },
  settings: {
    allowInvites: {
      type: Boolean,
      default: true
    },
    allowFileSharing: {
      type: Boolean,
      default: true
    },
    enableNotifications: {
      type: Boolean,
      default: true
    }
  },
  schedule: {
    meetingTime: String, // e.g., "Every Sunday at 3 PM"
    timezone: {
      type: String,
      default: 'Africa/Addis_Ababa'
    },
    nextMeeting: Date
  },
  resources: [{
    title: String,
    type: {
      type: String,
      enum: ['link', 'document', 'video', 'image', 'note']
    },
    url: String,
    description: String,
    addedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  discussions: [{
    title: String,
    content: String,
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    replies: [{
      content: String,
      author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  inviteCode: {
    type: String,
    unique: true,
    sparse: true
  },
  lastActivity: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
studyGroupSchema.index({ category: 1, isPrivate: 1, status: 1 });
studyGroupSchema.index({ tags: 1 });
studyGroupSchema.index({ name: 'text', description: 'text' });
studyGroupSchema.index({ creator: 1, createdAt: -1 });
studyGroupSchema.index({ lastActivity: -1 });

// Virtual for member count
studyGroupSchema.virtual('memberCount').get(function() {
  return this.members ? this.members.filter(m => m.isActive).length : 0;
});

// Virtual for active member count
studyGroupSchema.virtual('activeMemberCount').get(function() {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  return this.members ? this.members.filter(m => 
    m.isActive && m.lastSeen && m.lastSeen > sevenDaysAgo
  ).length : 0;
});

// Methods
studyGroupSchema.methods.addMember = function(userId, role = 'member') {
  if (this.memberCount >= this.maxMembers) {
    throw new Error('Group is full');
  }
  
  const existingMember = this.members.find(m => m.user.toString() === userId.toString());
  if (existingMember) {
    if (!existingMember.isActive) {
      existingMember.isActive = true;
      existingMember.joinedAt = new Date();
    }
    return this.save();
  }
  
  this.members.push({ user: userId, role });
  this.lastActivity = new Date();
  return this.save();
};

studyGroupSchema.methods.removeMember = function(userId) {
  const member = this.members.find(m => m.user.toString() === userId.toString());
  if (member) {
    member.isActive = false;
  }
  return this.save();
};

studyGroupSchema.methods.updateMemberRole = function(userId, newRole) {
  const member = this.members.find(m => 
    m.user.toString() === userId.toString() && m.isActive
  );
  if (member) {
    member.role = newRole;
    return this.save();
  }
  throw new Error('Member not found');
};

studyGroupSchema.methods.generateInviteCode = function() {
  if (!this.inviteCode) {
    this.inviteCode = Math.random().toString(36).substring(2, 15) + 
                     Math.random().toString(36).substring(2, 15);
    return this.save();
  }
  return Promise.resolve(this);
};

module.exports = mongoose.models.StudyGroup || mongoose.model('StudyGroup', studyGroupSchema);
