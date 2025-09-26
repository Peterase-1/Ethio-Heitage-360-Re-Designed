const mongoose = require('mongoose');
const { Schema } = mongoose;

const collectionItemSchema = new Schema({
  itemType: {
    type: String,
    enum: ['artifact', 'course', 'quiz', 'game', 'flashcard', 'museum', 'tour', 'lesson', 'livesession'],
    required: true
  },
  itemId: {
    type: Schema.Types.ObjectId,
    required: true,
    refPath: 'items.itemType'
  },
  itemTitle: {
    type: String,
    required: true
  },
  itemDescription: String,
  itemImage: String,
  addedAt: {
    type: Date,
    default: Date.now
  },
  personalNotes: {
    type: String,
    maxLength: 1000
  },
  tags: [String],
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  progress: {
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: Date,
    score: Number,
    timeSpent: Number // in minutes
  },
  customFields: [{
    key: String,
    value: String,
    type: {
      type: String,
      enum: ['text', 'number', 'date', 'boolean'],
      default: 'text'
    }
  }]
});

const collectionSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxLength: 100,
    index: true
  },
  description: {
    type: String,
    maxLength: 500
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Collection Type and Category
  type: {
    type: String,
    enum: ['learning-path', 'favorites', 'wishlist', 'completed', 'research', 'custom'],
    default: 'custom'
  },
  category: {
    type: String,
    enum: ['heritage', 'history', 'culture', 'artifacts', 'courses', 'games', 'mixed'],
    default: 'mixed'
  },
  
  // Collection Items
  items: [collectionItemSchema],
  
  // Organization and Display
  isPublic: {
    type: Boolean,
    default: false
  },
  allowCollaborators: {
    type: Boolean,
    default: false
  },
  collaborators: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['viewer', 'contributor', 'editor'],
      default: 'viewer'
    },
    addedAt: {
      type: Date,
      default: Date.now
    },
    addedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  
  // Visual and Metadata
  cover: {
    image: String,
    color: {
      type: String,
      default: '#3B82F6'
    }
  },
  tags: [String],
  
  // Organization Settings
  sortBy: {
    type: String,
    enum: ['dateAdded', 'alphabetical', 'priority', 'type', 'progress'],
    default: 'dateAdded'
  },
  sortOrder: {
    type: String,
    enum: ['asc', 'desc'],
    default: 'desc'
  },
  viewMode: {
    type: String,
    enum: ['grid', 'list', 'timeline'],
    default: 'grid'
  },
  
  // Progress and Statistics
  stats: {
    totalItems: {
      type: Number,
      default: 0
    },
    completedItems: {
      type: Number,
      default: 0
    },
    totalTimeSpent: {
      type: Number, // in minutes
      default: 0
    },
    averageScore: {
      type: Number,
      default: 0
    },
    lastActivityAt: Date
  },
  
  // Sharing and Discovery
  shareSettings: {
    allowComments: {
      type: Boolean,
      default: true
    },
    allowLikes: {
      type: Boolean,
      default: true
    },
    allowForks: {
      type: Boolean,
      default: true
    },
    requireApprovalForCollaborators: {
      type: Boolean,
      default: false
    }
  },
  
  // Social Features
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
  
  comments: [{
    user: {
      type: Schema.Types.ObjectId,
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
    },
    replies: [{
      user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      },
      content: {
        type: String,
        maxLength: 300
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }]
  }],
  
  forks: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    collectionId: {
      type: Schema.Types.ObjectId,
      ref: 'Collection'
    },
    forkedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // If this collection is forked from another
  originalCollection: {
    type: Schema.Types.ObjectId,
    ref: 'Collection'
  },
  
  // Goals and Targets
  goals: {
    targetCompletionDate: Date,
    dailyTarget: Number, // items per day
    weeklyTarget: Number, // items per week
    studyTimeGoal: Number, // minutes per week
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: Date
  },
  
  // Reminders and Notifications
  reminders: [{
    type: {
      type: String,
      enum: ['daily', 'weekly', 'custom']
    },
    time: String, // HH:mm format
    days: [String], // Days of week for weekly reminders
    message: String,
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  
  // AI and Smart Features
  aiSuggestions: {
    enabled: {
      type: Boolean,
      default: true
    },
    lastSuggestionAt: Date,
    suggestedItems: [{
      itemType: String,
      itemId: Schema.Types.ObjectId,
      reason: String,
      confidence: Number,
      suggestedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  
  // Export and Backup
  exportHistory: [{
    format: {
      type: String,
      enum: ['json', 'csv', 'pdf']
    },
    exportedAt: {
      type: Date,
      default: Date.now
    },
    fileUrl: String,
    expiresAt: Date
  }],
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  archivedAt: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
collectionSchema.index({ owner: 1, isActive: 1 });
collectionSchema.index({ type: 1, category: 1 });
collectionSchema.index({ isPublic: 1, isActive: 1 });
collectionSchema.index({ tags: 1 });
collectionSchema.index({ 'items.itemType': 1 });
collectionSchema.index({ name: 'text', description: 'text', tags: 'text' });
collectionSchema.index({ 'stats.lastActivityAt': -1 });
collectionSchema.index({ createdAt: -1 });

// Virtual properties
collectionSchema.virtual('completionPercentage').get(function() {
  return this.stats.totalItems > 0 ? 
    Math.round((this.stats.completedItems / this.stats.totalItems) * 100) : 0;
});

collectionSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

collectionSchema.virtual('commentCount').get(function() {
  return this.comments.length + this.comments.reduce((total, comment) => 
    total + comment.replies.length, 0
  );
});

collectionSchema.virtual('forkCount').get(function() {
  return this.forks.length;
});

collectionSchema.virtual('collaboratorCount').get(function() {
  return this.collaborators.length;
});

// Instance Methods
collectionSchema.methods.addItem = async function(itemData) {
  // Check if item already exists
  const existingItem = this.items.find(item => 
    item.itemId.toString() === itemData.itemId.toString() && 
    item.itemType === itemData.itemType
  );
  
  if (existingItem) {
    throw new Error('Item already exists in this collection');
  }
  
  // Add the item
  this.items.push(itemData);
  
  // Update stats
  this.stats.totalItems = this.items.length;
  this.stats.lastActivityAt = new Date();
  
  return this.save();
};

collectionSchema.methods.removeItem = async function(itemId, itemType) {
  const initialLength = this.items.length;
  
  this.items = this.items.filter(item => 
    !(item.itemId.toString() === itemId.toString() && item.itemType === itemType)
  );
  
  if (this.items.length === initialLength) {
    throw new Error('Item not found in collection');
  }
  
  // Update stats
  this.stats.totalItems = this.items.length;
  this.stats.completedItems = this.items.filter(item => item.progress.completed).length;
  this.stats.lastActivityAt = new Date();
  
  return this.save();
};

collectionSchema.methods.updateItemProgress = async function(itemId, itemType, progressData) {
  const item = this.items.find(item => 
    item.itemId.toString() === itemId.toString() && item.itemType === itemType
  );
  
  if (!item) {
    throw new Error('Item not found in collection');
  }
  
  // Update progress
  Object.assign(item.progress, progressData);
  
  if (progressData.completed && !item.progress.completedAt) {
    item.progress.completedAt = new Date();
  }
  
  // Recalculate stats
  this.stats.completedItems = this.items.filter(item => item.progress.completed).length;
  this.stats.totalTimeSpent = this.items.reduce((total, item) => 
    total + (item.progress.timeSpent || 0), 0
  );
  
  const scoresWithValues = this.items.filter(item => item.progress.score !== undefined);
  if (scoresWithValues.length > 0) {
    this.stats.averageScore = scoresWithValues.reduce((sum, item) => 
      sum + item.progress.score, 0) / scoresWithValues.length;
    this.stats.averageScore = Math.round(this.stats.averageScore * 10) / 10;
  }
  
  this.stats.lastActivityAt = new Date();
  
  // Check if collection goal is completed
  if (this.goals.targetCompletionDate && !this.goals.completed) {
    const completionPercentage = this.completionPercentage;
    if (completionPercentage >= 100) {
      this.goals.completed = true;
      this.goals.completedAt = new Date();
    }
  }
  
  return this.save();
};

collectionSchema.methods.addCollaborator = async function(userId, role = 'viewer', addedBy) {
  // Check if user is already a collaborator
  const existingCollaborator = this.collaborators.find(collab => 
    collab.user.toString() === userId.toString()
  );
  
  if (existingCollaborator) {
    // Update role if different
    if (existingCollaborator.role !== role) {
      existingCollaborator.role = role;
      return this.save();
    }
    return this;
  }
  
  // Add new collaborator
  this.collaborators.push({
    user: userId,
    role,
    addedBy
  });
  
  return this.save();
};

collectionSchema.methods.removeCollaborator = async function(userId) {
  const initialLength = this.collaborators.length;
  
  this.collaborators = this.collaborators.filter(collab => 
    collab.user.toString() !== userId.toString()
  );
  
  if (this.collaborators.length === initialLength) {
    throw new Error('Collaborator not found');
  }
  
  return this.save();
};

collectionSchema.methods.addLike = async function(userId) {
  // Check if user already liked
  const existingLike = this.likes.find(like => 
    like.user.toString() === userId.toString()
  );
  
  if (existingLike) {
    return this; // Already liked
  }
  
  this.likes.push({ user: userId });
  return this.save();
};

collectionSchema.methods.removeLike = async function(userId) {
  this.likes = this.likes.filter(like => 
    like.user.toString() !== userId.toString()
  );
  
  return this.save();
};

collectionSchema.methods.addComment = async function(userId, content) {
  this.comments.push({
    user: userId,
    content
  });
  
  return this.save();
};

collectionSchema.methods.addReply = async function(commentId, userId, content) {
  const comment = this.comments.id(commentId);
  if (!comment) {
    throw new Error('Comment not found');
  }
  
  comment.replies.push({
    user: userId,
    content
  });
  
  return this.save();
};

collectionSchema.methods.forkCollection = async function(newOwnerId, newName) {
  const Collection = this.constructor;
  
  const forkedCollection = new Collection({
    name: newName || `${this.name} (Fork)`,
    description: this.description,
    owner: newOwnerId,
    type: this.type,
    category: this.category,
    items: this.items.map(item => ({
      itemType: item.itemType,
      itemId: item.itemId,
      itemTitle: item.itemTitle,
      itemDescription: item.itemDescription,
      itemImage: item.itemImage,
      personalNotes: '', // Clear personal notes for fork
      tags: item.tags,
      priority: item.priority,
      progress: {
        completed: false,
        completedAt: null,
        score: null,
        timeSpent: 0
      }
    })),
    cover: this.cover,
    tags: this.tags,
    originalCollection: this._id,
    shareSettings: this.shareSettings,
    isPublic: false // Forks start as private
  });
  
  await forkedCollection.save();
  
  // Add fork reference to original collection
  this.forks.push({
    user: newOwnerId,
    collectionId: forkedCollection._id
  });
  
  await this.save();
  
  return forkedCollection;
};

collectionSchema.methods.getSortedItems = function() {
  let sortedItems = [...this.items];
  
  switch (this.sortBy) {
    case 'alphabetical':
      sortedItems.sort((a, b) => a.itemTitle.localeCompare(b.itemTitle));
      break;
    case 'priority':
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      sortedItems.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
      break;
    case 'type':
      sortedItems.sort((a, b) => a.itemType.localeCompare(b.itemType));
      break;
    case 'progress':
      sortedItems.sort((a, b) => {
        if (a.progress.completed !== b.progress.completed) {
          return a.progress.completed ? 1 : -1;
        }
        return (b.progress.score || 0) - (a.progress.score || 0);
      });
      break;
    default: // dateAdded
      sortedItems.sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));
  }
  
  if (this.sortOrder === 'asc') {
    sortedItems.reverse();
  }
  
  return sortedItems;
};

// Static Methods
collectionSchema.statics.getUserCollections = function(userId, includePublic = false) {
  const query = {
    $or: [
      { owner: userId },
      { 'collaborators.user': userId }
    ],
    isActive: true
  };
  
  if (includePublic) {
    query.$or.push({ isPublic: true });
  }
  
  return this.find(query)
    .populate('owner', 'name profileImage')
    .populate('collaborators.user', 'name profileImage')
    .sort({ 'stats.lastActivityAt': -1, updatedAt: -1 });
};

collectionSchema.statics.getPublicCollections = function(filters = {}) {
  const query = { 
    isPublic: true, 
    isActive: true,
    'stats.totalItems': { $gt: 0 }
  };
  
  if (filters.category) query.category = filters.category;
  if (filters.type) query.type = filters.type;
  if (filters.tags && filters.tags.length > 0) {
    query.tags = { $in: filters.tags };
  }
  
  return this.find(query)
    .populate('owner', 'name profileImage')
    .sort({ 'likes.length': -1, updatedAt: -1 });
};

collectionSchema.statics.searchCollections = function(searchTerm, userId = null, isPublicOnly = false) {
  let query = { isActive: true };
  
  if (searchTerm) {
    query.$text = { $search: searchTerm };
  }
  
  if (isPublicOnly) {
    query.isPublic = true;
  } else if (userId) {
    query.$or = [
      { owner: userId },
      { 'collaborators.user': userId },
      { isPublic: true }
    ];
  }
  
  return this.find(query)
    .populate('owner', 'name profileImage')
    .sort(searchTerm ? { score: { $meta: 'textScore' } } : { updatedAt: -1 });
};

// Pre-save middleware
collectionSchema.pre('save', function(next) {
  // Update stats when items change
  if (this.isModified('items')) {
    this.stats.totalItems = this.items.length;
    this.stats.completedItems = this.items.filter(item => item.progress.completed).length;
    this.stats.totalTimeSpent = this.items.reduce((total, item) => 
      total + (item.progress.timeSpent || 0), 0
    );
    
    const scoresWithValues = this.items.filter(item => item.progress.score !== undefined);
    if (scoresWithValues.length > 0) {
      this.stats.averageScore = scoresWithValues.reduce((sum, item) => 
        sum + item.progress.score, 0) / scoresWithValues.length;
      this.stats.averageScore = Math.round(this.stats.averageScore * 10) / 10;
    }
    
    this.stats.lastActivityAt = new Date();
  }
  
  next();
});

module.exports = mongoose.model('Collection', collectionSchema);
