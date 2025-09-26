const mongoose = require('mongoose');

// Community Post Schema
const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxLength: 200
  },
  content: {
    type: String,
    required: true,
    maxLength: 5000
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    enum: ['general', 'artifacts', 'history', 'culture', 'heritage-sites', 'museums', 'events'],
    default: 'general'
  },
  tags: [{
    type: String,
    trim: true
  }],
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      maxLength: 1000
    },
    likes: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    replies: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      content: {
        type: String,
        required: true,
        maxLength: 500
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isPinned: {
    type: Boolean,
    default: false
  },
  isLocked: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0
  },
  viewedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    viewedAt: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['active', 'archived', 'reported', 'moderated'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Study Group Schema
const studyGroupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxLength: 100
  },
  description: {
    type: String,
    required: true,
    maxLength: 500
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['member', 'moderator', 'admin'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  topics: [{
    type: String,
    trim: true
  }],
  maxMembers: {
    type: Number,
    default: 50,
    min: 2,
    max: 100
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  meetingSchedule: {
    frequency: {
      type: String,
      enum: ['weekly', 'biweekly', 'monthly', 'irregular'],
      default: 'weekly'
    },
    dayOfWeek: {
      type: Number, // 0-6, Sunday-Saturday
      min: 0,
      max: 6
    },
    time: String, // Format: "HH:MM"
    timezone: {
      type: String,
      default: 'UTC'
    }
  },
  nextMeeting: Date,
  status: {
    type: String,
    enum: ['active', 'inactive', 'archived'],
    default: 'active'
  },
  statistics: {
    totalSessions: {
      type: Number,
      default: 0
    },
    avgAttendance: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// User Follow Schema
const followSchema = new mongoose.Schema({
  follower: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  following: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  followedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Activity Feed Schema
const activitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: [
      'post_created', 
      'comment_added', 
      'post_liked', 
      'user_followed', 
      'group_joined', 
      'achievement_earned',
      'course_completed',
      'artifact_favorited',
      'quiz_completed'
    ],
    required: true
  },
  entityType: {
    type: String,
    enum: ['post', 'comment', 'user', 'group', 'achievement', 'course', 'artifact', 'quiz']
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId
  },
  entityName: String,
  metadata: {
    type: mongoose.Schema.Types.Mixed
  },
  isPublic: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Community Statistics Schema
const communityStatsSchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now
  },
  totalPosts: {
    type: Number,
    default: 0
  },
  totalComments: {
    type: Number,
    default: 0
  },
  totalUsers: {
    type: Number,
    default: 0
  },
  activeUsers: {
    type: Number,
    default: 0
  },
  totalGroups: {
    type: Number,
    default: 0
  },
  activeGroups: {
    type: Number,
    default: 0
  },
  engagementMetrics: {
    avgPostsPerUser: {
      type: Number,
      default: 0
    },
    avgCommentsPerPost: {
      type: Number,
      default: 0
    },
    avgLikesPerPost: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Indexes for better performance
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ category: 1, status: 1, createdAt: -1 });
postSchema.index({ tags: 1 });
postSchema.index({ 'likes.user': 1 });
postSchema.index({ views: -1 });

studyGroupSchema.index({ creator: 1 });
studyGroupSchema.index({ 'members.user': 1 });
studyGroupSchema.index({ topics: 1 });
studyGroupSchema.index({ status: 1, isPrivate: 1 });

followSchema.index({ follower: 1, following: 1 }, { unique: true });
followSchema.index({ follower: 1 });
followSchema.index({ following: 1 });

activitySchema.index({ user: 1, createdAt: -1 });
activitySchema.index({ type: 1, createdAt: -1 });
activitySchema.index({ entityType: 1, entityId: 1 });

communityStatsSchema.index({ date: -1 });

// Virtual fields for Post
postSchema.virtual('likesCount').get(function() {
  return this.likes.length;
});

postSchema.virtual('commentsCount').get(function() {
  return this.comments.length;
});

// Virtual fields for Study Group
studyGroupSchema.virtual('membersCount').get(function() {
  return this.members.length;
});

// Middleware to update timestamps
postSchema.pre('save', function(next) {
  if (this.isModified('comments')) {
    this.updatedAt = new Date();
  }
  next();
});

// Static methods for Post
postSchema.statics.getPopularPosts = function(limit = 10) {
  return this.find({ status: 'active' })
    .sort({ views: -1, likesCount: -1, createdAt: -1 })
    .limit(limit)
    .populate('author', 'name email avatar')
    .populate('comments.user', 'name avatar');
};

postSchema.statics.getRecentPosts = function(limit = 10) {
  return this.find({ status: 'active' })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('author', 'name email avatar')
    .populate('comments.user', 'name avatar');
};

// Static methods for Study Group
studyGroupSchema.statics.getActiveGroups = function() {
  return this.find({ status: 'active' })
    .populate('creator', 'name email avatar')
    .populate('members.user', 'name avatar')
    .sort({ createdAt: -1 });
};

// Check if models already exist before creating them
const Post = mongoose.models.Post || mongoose.model('Post', postSchema);
const StudyGroup = mongoose.models.StudyGroup || mongoose.model('StudyGroup', studyGroupSchema);
const Follow = mongoose.models.Follow || mongoose.model('Follow', followSchema);
const Activity = mongoose.models.Activity || mongoose.model('Activity', activitySchema);
const CommunityStats = mongoose.models.CommunityStats || mongoose.model('CommunityStats', communityStatsSchema);

module.exports = {
  Post,
  StudyGroup,
  Follow,
  Activity,
  CommunityStats
};
