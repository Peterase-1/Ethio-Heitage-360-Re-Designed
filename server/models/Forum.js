const mongoose = require('mongoose');
const { Schema } = mongoose;

const forumPostSchema = new Schema({
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  attachments: [{
    type: {
      type: String,
      enum: ['image', 'video', 'document', 'link']
    },
    url: String,
    name: String
  }],
  likes: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    likedAt: {
      type: Date,
      default: Date.now
    }
  }],
  reports: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: String,
    reportedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isHidden: {
    type: Boolean,
    default: false
  },
  editedAt: Date,
  editHistory: [{
    content: String,
    editedAt: Date
  }]
}, {
  timestamps: true
});

const forumTopicSchema = new Schema({
  title: {
    type: String,
    required: true,
    index: true
  },
  description: String,
  category: {
    type: String,
    enum: ['general', 'heritage-discussion', 'learning-help', 'museums', 'events', 'artifacts', 'culture', 'announcements'],
    default: 'general',
    index: true
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  posts: [forumPostSchema],
  tags: [String],
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
  lastActivity: {
    type: Date,
    default: Date.now
  },
  lastPost: {
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: Date
  },
  subscribers: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    subscribedAt: {
      type: Date,
      default: Date.now
    }
  }],
  moderators: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  relatedResource: {
    type: {
      type: String,
      enum: ['course', 'museum', 'artifact', 'event', 'heritage-site']
    },
    id: Schema.Types.ObjectId
  }
}, {
  timestamps: true
});

// Indexes
forumTopicSchema.index({ category: 1, isPinned: -1, lastActivity: -1 });
forumTopicSchema.index({ tags: 1 });
forumTopicSchema.index({ title: 'text', description: 'text' });
forumTopicSchema.index({ author: 1, createdAt: -1 });

// Virtuals
forumTopicSchema.virtual('postCount').get(function() {
  return this.posts ? this.posts.length : 0;
});

forumTopicSchema.virtual('subscriberCount').get(function() {
  return this.subscribers ? this.subscribers.length : 0;
});

// Methods
forumTopicSchema.methods.addPost = function(userId, content, attachments = []) {
  this.posts.push({
    author: userId,
    content,
    attachments
  });
  
  this.lastActivity = new Date();
  this.lastPost = {
    author: userId,
    createdAt: new Date()
  };
  
  return this.save();
};

forumTopicSchema.methods.subscribe = function(userId) {
  const existingSubscriber = this.subscribers.find(s => s.user.toString() === userId.toString());
  if (!existingSubscriber) {
    this.subscribers.push({ user: userId });
    return this.save();
  }
  return Promise.resolve(this);
};

forumTopicSchema.methods.unsubscribe = function(userId) {
  this.subscribers = this.subscribers.filter(s => s.user.toString() !== userId.toString());
  return this.save();
};

forumTopicSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

module.exports = mongoose.model('ForumTopic', forumTopicSchema);
