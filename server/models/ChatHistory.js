const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Message content is required'],
    maxlength: [2000, 'Message cannot exceed 2000 characters']
  },
  type: {
    type: String,
    enum: ['text', 'file', 'image', 'system', 'announcement'],
    default: 'text'
  },
  attachments: [{
    fileName: String,
    fileType: String,
    fileSize: Number,
    filePath: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  metadata: {
    isEdited: {
      type: Boolean,
      default: false
    },
    editedAt: Date,
    originalContent: String,
    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'urgent'],
      default: 'normal'
    },
    tags: [String],
    mentions: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      startIndex: Number,
      endIndex: Number
    }]
  },
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  reactions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    emoji: {
      type: String,
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date,
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

const chatRoomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Chat room name is required'],
    maxlength: [200, 'Room name cannot exceed 200 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  type: {
    type: String,
    enum: ['direct', 'group', 'channel', 'support', 'announcement'],
    required: true
  },
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['admin', 'moderator', 'member'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    lastSeenAt: {
      type: Date,
      default: Date.now
    },
    permissions: {
      canSendMessages: {
        type: Boolean,
        default: true
      },
      canSendFiles: {
        type: Boolean,
        default: true
      },
      canMention: {
        type: Boolean,
        default: true
      },
      canReact: {
        type: Boolean,
        default: true
      }
    },
    notificationSettings: {
      mute: {
        type: Boolean,
        default: false
      },
      muteUntil: Date,
      mentionOnly: {
        type: Boolean,
        default: false
      }
    }
  }],
  messages: [messageSchema],
  settings: {
    isPrivate: {
      type: Boolean,
      default: false
    },
    requireApproval: {
      type: Boolean,
      default: false
    },
    allowFileUploads: {
      type: Boolean,
      default: true
    },
    maxFileSize: {
      type: Number,
      default: 10 * 1024 * 1024 // 10MB
    },
    allowedFileTypes: [String],
    messageRetention: {
      enabled: {
        type: Boolean,
        default: false
      },
      days: {
        type: Number,
        default: 30
      }
    },
    autoDelete: {
      enabled: {
        type: Boolean,
        default: false
      },
      afterDays: {
        type: Number,
        default: 90
      }
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  archivedAt: Date,
  archivedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  tags: [String],
  metadata: {
    category: {
      type: String,
      enum: ['general', 'support', 'technical', 'administrative', 'museum_operations', 'system_updates'],
      default: 'general'
    },
    department: String,
    project: String,
    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'critical'],
      default: 'normal'
    },
    relatedEntity: {
      type: String,
      enum: ['museum', 'artifact', 'tour', 'event', 'user', 'system']
    },
    relatedEntityId: mongoose.Schema.Types.ObjectId
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
chatRoomSchema.index({ type: 1, isActive: 1 });
chatRoomSchema.index({ 'participants.user': 1 });
chatRoomSchema.index({ createdBy: 1 });
chatRoomSchema.index({ lastActivity: -1 });
chatRoomSchema.index({ 'metadata.category': 1, 'metadata.priority': 1 });
chatRoomSchema.index({ tags: 1 });

// Message indexes
chatRoomSchema.index({ 'messages.sender': 1, 'messages.createdAt': -1 });
chatRoomSchema.index({ 'messages.type': 1 });
chatRoomSchema.index({ 'messages.isDeleted': 1 });

// Text search index
chatRoomSchema.index({
  name: 'text',
  description: 'text',
  'messages.content': 'text'
});

// Virtual fields
chatRoomSchema.virtual('participantCount').get(function() {
  return this.participants.length;
});

chatRoomSchema.virtual('messageCount').get(function() {
  return this.messages.filter(msg => !msg.isDeleted).length;
});

chatRoomSchema.virtual('unreadCount').get(function() {
  // This would need to be calculated based on user's last seen time
  return 0;
});

// Static methods
chatRoomSchema.statics.findByUser = function(userId) {
  return this.find({
    'participants.user': userId,
    isActive: true
  })
  .populate('participants.user', 'name email role profile.avatar')
  .populate('createdBy', 'name email')
  .sort({ lastActivity: -1 });
};

chatRoomSchema.statics.findDirectMessage = function(user1Id, user2Id) {
  return this.findOne({
    type: 'direct',
    'participants.user': { $all: [user1Id, user2Id] },
    isActive: true
  });
};

chatRoomSchema.statics.findSupportChats = function() {
  return this.find({
    type: 'support',
    isActive: true
  })
  .populate('participants.user', 'name email role')
  .sort({ 'metadata.priority': 1, lastActivity: -1 });
};

chatRoomSchema.statics.findAdminChannels = function() {
  return this.find({
    $or: [
      { type: 'channel' },
      { type: 'announcement' }
    ],
    'participants.user': {
      $elemMatch: {
        role: { $in: ['admin', 'super_admin', 'museum_admin'] }
      }
    },
    isActive: true
  })
  .populate('participants.user', 'name email role')
  .sort({ 'metadata.priority': 1, lastActivity: -1 });
};

// Instance methods
chatRoomSchema.methods.addParticipant = function(userId, role = 'member', permissions = {}) {
  const existingParticipant = this.participants.find(
    p => p.user.toString() === userId.toString()
  );
  
  if (!existingParticipant) {
    this.participants.push({
      user: userId,
      role: role,
      permissions: {
        canSendMessages: permissions.canSendMessages !== undefined ? permissions.canSendMessages : true,
        canSendFiles: permissions.canSendFiles !== undefined ? permissions.canSendFiles : true,
        canMention: permissions.canMention !== undefined ? permissions.canMention : true,
        canReact: permissions.canReact !== undefined ? permissions.canReact : true
      }
    });
    return this.save();
  }
  return Promise.resolve(this);
};

chatRoomSchema.methods.removeParticipant = function(userId) {
  this.participants = this.participants.filter(
    p => p.user.toString() !== userId.toString()
  );
  return this.save();
};

chatRoomSchema.methods.addMessage = function(senderId, content, type = 'text', metadata = {}) {
  const message = {
    sender: senderId,
    content: content,
    type: type,
    metadata: {
      priority: metadata.priority || 'normal',
      tags: metadata.tags || [],
      mentions: metadata.mentions || []
    },
    attachments: metadata.attachments || []
  };
  
  if (metadata.replyTo) {
    message.replyTo = metadata.replyTo;
  }
  
  this.messages.push(message);
  this.lastActivity = new Date();
  return this.save();
};

chatRoomSchema.methods.markAsRead = function(userId, messageId = null) {
  const participant = this.participants.find(
    p => p.user.toString() === userId.toString()
  );
  
  if (participant) {
    participant.lastSeenAt = new Date();
    
    if (messageId) {
      const message = this.messages.id(messageId);
      if (message) {
        const existingRead = message.readBy.find(
          r => r.user.toString() === userId.toString()
        );
        if (!existingRead) {
          message.readBy.push({ user: userId });
        }
      }
    } else {
      // Mark all messages as read
      this.messages.forEach(message => {
        const existingRead = message.readBy.find(
          r => r.user.toString() === userId.toString()
        );
        if (!existingRead) {
          message.readBy.push({ user: userId });
        }
      });
    }
  }
  
  return this.save();
};

chatRoomSchema.methods.deleteMessage = function(messageId, deletedBy) {
  const message = this.messages.id(messageId);
  if (message) {
    message.isDeleted = true;
    message.deletedAt = new Date();
    message.deletedBy = deletedBy;
    return this.save();
  }
  return Promise.resolve(this);
};

chatRoomSchema.methods.editMessage = function(messageId, newContent, editedBy) {
  const message = this.messages.id(messageId);
  if (message && message.sender.toString() === editedBy.toString()) {
    message.metadata.originalContent = message.content;
    message.content = newContent;
    message.metadata.isEdited = true;
    message.metadata.editedAt = new Date();
    return this.save();
  }
  return Promise.resolve(this);
};

chatRoomSchema.methods.addReaction = function(messageId, userId, emoji) {
  const message = this.messages.id(messageId);
  if (message) {
    // Remove existing reaction from same user for same emoji
    message.reactions = message.reactions.filter(
      r => !(r.user.toString() === userId.toString() && r.emoji === emoji)
    );
    
    // Add new reaction
    message.reactions.push({
      user: userId,
      emoji: emoji
    });
    
    return this.save();
  }
  return Promise.resolve(this);
};

chatRoomSchema.methods.removeReaction = function(messageId, userId, emoji) {
  const message = this.messages.id(messageId);
  if (message) {
    message.reactions = message.reactions.filter(
      r => !(r.user.toString() === userId.toString() && r.emoji === emoji)
    );
    return this.save();
  }
  return Promise.resolve(this);
};

// Pre-save middleware
chatRoomSchema.pre('save', function(next) {
  // Update lastActivity when messages are added
  if (this.isModified('messages')) {
    this.lastActivity = new Date();
  }
  next();
});

// Create models
const Message = mongoose.model('Message', messageSchema);
const ChatRoom = mongoose.model('ChatRoom', chatRoomSchema);

module.exports = {
  ChatRoom,
  Message
};
