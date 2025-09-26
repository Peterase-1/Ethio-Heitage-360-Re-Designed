const mongoose = require('mongoose');

const visitorFavoritesSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  entityType: {
    type: String,
    required: true,
    enum: ['artifact', 'museum', 'course', 'tour', 'event', 'heritage_site', 'exhibition']
  },
  entityData: {
    // Cache commonly accessed entity data to avoid frequent lookups
    name: String,
    title: String,
    description: String,
    imageUrl: String,
    category: String,
    tags: [String],
    rating: Number,
    location: String
  },
  notes: {
    type: String,
    maxlength: 500
  },
  tags: [{
    type: String,
    trim: true
  }],
  isPublic: {
    type: Boolean,
    default: true
  },
  priority: {
    type: Number,
    default: 1,
    min: 1,
    max: 5
  }
}, {
  timestamps: true
});

// Compound index to ensure unique favorites per user per entity
visitorFavoritesSchema.index({ userId: 1, entityId: 1, entityType: 1 }, { unique: true });
visitorFavoritesSchema.index({ userId: 1, entityType: 1 });
visitorFavoritesSchema.index({ userId: 1, createdAt: -1 });
visitorFavoritesSchema.index({ entityType: 1, 'entityData.category': 1 });

// Static method to add favorite
visitorFavoritesSchema.statics.addFavorite = async function(userId, entityId, entityType, entityData = {}, options = {}) {
  try {
    const favorite = new this({
      userId,
      entityId,
      entityType,
      entityData,
      notes: options.notes || '',
      tags: options.tags || [],
      isPublic: options.isPublic !== undefined ? options.isPublic : true,
      priority: options.priority || 1
    });
    
    await favorite.save();
    
    // Log activity
    const VisitorActivity = require('./VisitorActivity');
    await VisitorActivity.logActivity({
      userId,
      sessionId: options.sessionId || 'system',
      activityType: 'favorite_added',
      activityData: {
        entityId,
        entityType,
        entityName: entityData.name || entityData.title,
        metadata: { priority: options.priority }
      },
      pointsEarned: 5 // Award 5 points for adding favorites
    });
    
    return favorite;
  } catch (error) {
    if (error.code === 11000) {
      throw new Error('Item is already in favorites');
    }
    throw error;
  }
};

// Static method to remove favorite
visitorFavoritesSchema.statics.removeFavorite = async function(userId, entityId, entityType, sessionId = 'system') {
  const favorite = await this.findOneAndDelete({ userId, entityId, entityType });
  
  if (favorite) {
    // Log activity
    const VisitorActivity = require('./VisitorActivity');
    await VisitorActivity.logActivity({
      userId,
      sessionId,
      activityType: 'favorite_removed',
      activityData: {
        entityId,
        entityType,
        entityName: favorite.entityData.name || favorite.entityData.title
      },
      pointsEarned: 0
    });
  }
  
  return favorite;
};

// Static method to get user favorites with pagination
visitorFavoritesSchema.statics.getUserFavorites = async function(userId, options = {}) {
  const {
    entityType,
    category,
    tags,
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = -1
  } = options;
  
  const query = { userId };
  
  if (entityType) {
    query.entityType = entityType;
  }
  
  if (category) {
    query['entityData.category'] = new RegExp(category, 'i');
  }
  
  if (tags && tags.length > 0) {
    query.tags = { $in: tags };
  }
  
  const skip = (page - 1) * limit;
  const sort = { [sortBy]: sortOrder };
  
  const [favorites, total] = await Promise.all([
    this.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('entityId')
      .lean(),
    this.countDocuments(query)
  ]);
  
  return {
    favorites,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

// Static method to get favorite statistics
visitorFavoritesSchema.statics.getUserFavoriteStats = async function(userId) {
  const pipeline = [
    { $match: { userId: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$entityType',
        count: { $sum: 1 },
        avgPriority: { $avg: '$priority' },
        latestAdded: { $max: '$createdAt' }
      }
    },
    { $sort: { count: -1 } }
  ];
  
  const stats = await this.aggregate(pipeline);
  const totalFavorites = stats.reduce((sum, stat) => sum + stat.count, 0);
  
  return {
    totalFavorites,
    byType: stats,
    mostFavorited: stats[0]?.entityType || null
  };
};

// Method to check if item is favorited
visitorFavoritesSchema.statics.isFavorited = async function(userId, entityId, entityType) {
  const favorite = await this.findOne({ userId, entityId, entityType });
  return !!favorite;
};

// Static method to get popular favorites (public ones)
visitorFavoritesSchema.statics.getPopularFavorites = async function(entityType, limit = 10) {
  const pipeline = [
    {
      $match: {
        entityType,
        isPublic: true
      }
    },
    {
      $group: {
        _id: '$entityId',
        count: { $sum: 1 },
        entityData: { $first: '$entityData' },
        entityType: { $first: '$entityType' }
      }
    },
    { $sort: { count: -1 } },
    { $limit: limit }
  ];
  
  return this.aggregate(pipeline);
};

module.exports = mongoose.model('VisitorFavorites', visitorFavoritesSchema);
