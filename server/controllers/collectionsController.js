const Collection = require('../models/Collection');
const { validationResult } = require('express-validator');

class CollectionsController {
  // ===============================
  // USER/VISITOR COLLECTION MANAGEMENT
  // ===============================

  // Get user's collections
  async getUserCollections(req, res) {
    try {
      const {
        type,
        category,
        search,
        sortBy = 'updatedAt',
        sortOrder = 'desc',
        page = 1,
        limit = 20
      } = req.query;

      const query = { 
        owner: req.user.id,
        isActive: true 
      };

      if (type) query.type = type;
      if (category) query.category = category;
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' }},
          { description: { $regex: search, $options: 'i' }},
          { tags: { $in: [new RegExp(search, 'i')] }}
        ];
      }

      const sortOptions = {};
      sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

      const collections = await Collection.find(query)
        .sort(sortOptions)
        .limit(parseInt(limit))
        .skip((page - 1) * limit)
        .populate('owner', 'name email')
        .select('-items.progress -aiSuggestions -exportHistory');

      const total = await Collection.countDocuments(query);

      // Get user's collection statistics
      const stats = await Collection.aggregate([
        { $match: { owner: req.user._id, isActive: true } },
        {
          $group: {
            _id: null,
            totalCollections: { $sum: 1 },
            totalItems: { $sum: '$stats.totalItems' },
            totalCompletedItems: { $sum: '$stats.completedItems' },
            totalTimeSpent: { $sum: '$stats.totalTimeSpent' },
            averageScore: { $avg: '$stats.averageScore' },
            publicCollections: {
              $sum: { $cond: [{ $eq: ['$isPublic', true] }, 1, 0] }
            }
          }
        }
      ]);

      res.json({
        success: true,
        data: collections,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          hasNext: page * limit < total,
          hasPrev: page > 1
        },
        stats: stats[0] || {
          totalCollections: 0,
          totalItems: 0,
          totalCompletedItems: 0,
          totalTimeSpent: 0,
          averageScore: 0,
          publicCollections: 0
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching collections',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get specific collection by ID
  async getCollection(req, res) {
    try {
      const { id } = req.params;
      const { includeItems = 'true' } = req.query;

      const collection = await Collection.findOne({
        _id: id,
        $or: [
          { owner: req.user.id },
          { isPublic: true },
          { 'collaborators.user': req.user.id }
        ],
        isActive: true
      })
        .populate('owner', 'name email profileImage')
        .populate('collaborators.user', 'name email profileImage')
        .populate('comments.user', 'name profileImage')
        .populate('comments.replies.user', 'name profileImage');

      if (!collection) {
        return res.status(404).json({
          success: false,
          message: 'Collection not found or access denied'
        });
      }

      // If user doesn't want items, exclude them
      if (includeItems === 'false') {
        collection.items = [];
      } else {
        // Sort items based on collection settings
        const sortedItems = collection.getSortedItems();
        collection.items = sortedItems;
      }

      res.json({
        success: true,
        data: collection
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching collection',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Create new collection
  async createCollection(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const collectionData = {
        ...req.body,
        owner: req.user.id
      };

      const collection = new Collection(collectionData);
      await collection.save();

      const populatedCollection = await Collection.findById(collection._id)
        .populate('owner', 'name email');

      res.status(201).json({
        success: true,
        data: populatedCollection,
        message: 'Collection created successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error creating collection',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Update collection
  async updateCollection(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const { id } = req.params;
      const updates = req.body;

      const collection = await Collection.findOne({
        _id: id,
        owner: req.user.id,
        isActive: true
      });

      if (!collection) {
        return res.status(404).json({
          success: false,
          message: 'Collection not found or access denied'
        });
      }

      // Update fields
      Object.keys(updates).forEach(key => {
        if (updates[key] !== undefined && key !== 'items' && key !== 'owner') {
          collection[key] = updates[key];
        }
      });

      await collection.save();

      const populatedCollection = await Collection.findById(collection._id)
        .populate('owner', 'name email');

      res.json({
        success: true,
        data: populatedCollection,
        message: 'Collection updated successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating collection',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Delete collection
  async deleteCollection(req, res) {
    try {
      const { id } = req.params;

      const collection = await Collection.findOne({
        _id: id,
        owner: req.user.id,
        isActive: true
      });

      if (!collection) {
        return res.status(404).json({
          success: false,
          message: 'Collection not found or access denied'
        });
      }

      // Soft delete by setting isActive to false
      collection.isActive = false;
      collection.isArchived = true;
      collection.archivedAt = new Date();
      await collection.save();

      res.json({
        success: true,
        message: 'Collection deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error deleting collection',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // ===============================
  // COLLECTION ITEMS MANAGEMENT
  // ===============================

  // Add item to collection
  async addItem(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const { id } = req.params;
      const itemData = req.body;

      const collection = await Collection.findOne({
        _id: id,
        owner: req.user.id,
        isActive: true
      });

      if (!collection) {
        return res.status(404).json({
          success: false,
          message: 'Collection not found or access denied'
        });
      }

      try {
        await collection.addItem(itemData);
        
        res.status(201).json({
          success: true,
          message: 'Item added to collection successfully'
        });
      } catch (addError) {
        if (addError.message === 'Item already exists in this collection') {
          return res.status(409).json({
            success: false,
            message: 'Item already exists in this collection'
          });
        }
        throw addError;
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error adding item to collection',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Remove item from collection
  async removeItem(req, res) {
    try {
      const { id, itemId } = req.params;
      const { itemType } = req.body;

      const collection = await Collection.findOne({
        _id: id,
        owner: req.user.id,
        isActive: true
      });

      if (!collection) {
        return res.status(404).json({
          success: false,
          message: 'Collection not found or access denied'
        });
      }

      try {
        await collection.removeItem(itemId, itemType);
        
        res.json({
          success: true,
          message: 'Item removed from collection successfully'
        });
      } catch (removeError) {
        if (removeError.message === 'Item not found in collection') {
          return res.status(404).json({
            success: false,
            message: 'Item not found in collection'
          });
        }
        throw removeError;
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error removing item from collection',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Update item progress
  async updateItemProgress(req, res) {
    try {
      const { id, itemId } = req.params;
      const { itemType, progress } = req.body;

      const collection = await Collection.findOne({
        _id: id,
        owner: req.user.id,
        isActive: true
      });

      if (!collection) {
        return res.status(404).json({
          success: false,
          message: 'Collection not found or access denied'
        });
      }

      try {
        await collection.updateItemProgress(itemId, itemType, progress);
        
        res.json({
          success: true,
          message: 'Item progress updated successfully',
          data: {
            completionPercentage: collection.completionPercentage,
            totalCompleted: collection.stats.completedItems,
            goalCompleted: collection.goals.completed
          }
        });
      } catch (updateError) {
        if (updateError.message === 'Item not found in collection') {
          return res.status(404).json({
            success: false,
            message: 'Item not found in collection'
          });
        }
        throw updateError;
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating item progress',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Reorder collection items
  async reorderItems(req, res) {
    try {
      const { id } = req.params;
      const { itemOrder } = req.body; // Array of { itemId, itemType, newIndex }

      const collection = await Collection.findOne({
        _id: id,
        owner: req.user.id,
        isActive: true
      });

      if (!collection) {
        return res.status(404).json({
          success: false,
          message: 'Collection not found or access denied'
        });
      }

      // Create a new ordered items array
      const reorderedItems = [];
      
      itemOrder.forEach(orderItem => {
        const item = collection.items.find(i => 
          i.itemId.toString() === orderItem.itemId.toString() && 
          i.itemType === orderItem.itemType
        );
        
        if (item) {
          reorderedItems[orderItem.newIndex] = item;
        }
      });

      // Fill in any missing items at the end
      collection.items.forEach(item => {
        if (!reorderedItems.some(ri => 
          ri && ri.itemId.toString() === item.itemId.toString() && ri.itemType === item.itemType
        )) {
          reorderedItems.push(item);
        }
      });

      // Filter out undefined values and update collection
      collection.items = reorderedItems.filter(item => item);
      collection.sortBy = 'manual'; // Set to manual sorting
      await collection.save();

      res.json({
        success: true,
        message: 'Items reordered successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error reordering items',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // ===============================
  // SOCIAL FEATURES
  // ===============================

  // Get public collections (discovery)
  async getPublicCollections(req, res) {
    try {
      const {
        type,
        category,
        search,
        sortBy = 'stats.lastActivityAt',
        page = 1,
        limit = 20
      } = req.query;

      const query = {
        isPublic: true,
        isActive: true
      };

      if (type) query.type = type;
      if (category) query.category = category;
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' }},
          { description: { $regex: search, $options: 'i' }},
          { tags: { $in: [new RegExp(search, 'i')] }}
        ];
      }

      const sortOptions = {};
      sortOptions[sortBy] = -1;

      const collections = await Collection.find(query)
        .sort(sortOptions)
        .limit(parseInt(limit))
        .skip((page - 1) * limit)
        .populate('owner', 'name profileImage')
        .select('name description type category cover tags stats likes comments forks owner createdAt');

      const total = await Collection.countDocuments(query);

      res.json({
        success: true,
        data: collections,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching public collections',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Like/unlike collection
  async toggleLike(req, res) {
    try {
      const { id } = req.params;

      const collection = await Collection.findOne({
        _id: id,
        isPublic: true,
        isActive: true
      });

      if (!collection) {
        return res.status(404).json({
          success: false,
          message: 'Collection not found'
        });
      }

      const existingLike = collection.likes.find(like => 
        like.user.toString() === req.user.id.toString()
      );

      if (existingLike) {
        await collection.removeLike(req.user.id);
      } else {
        await collection.addLike(req.user.id);
      }

      res.json({
        success: true,
        data: {
          liked: !existingLike,
          likeCount: collection.likes.length
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error toggling like',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Add comment to collection
  async addComment(req, res) {
    try {
      const { id } = req.params;
      const { content } = req.body;

      const collection = await Collection.findOne({
        _id: id,
        isPublic: true,
        isActive: true,
        'shareSettings.allowComments': true
      });

      if (!collection) {
        return res.status(404).json({
          success: false,
          message: 'Collection not found or comments not allowed'
        });
      }

      await collection.addComment(req.user.id, content);

      res.status(201).json({
        success: true,
        message: 'Comment added successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error adding comment',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Fork collection
  async forkCollection(req, res) {
    try {
      const { id } = req.params;
      const { name } = req.body;

      const originalCollection = await Collection.findOne({
        _id: id,
        isPublic: true,
        isActive: true,
        'shareSettings.allowForks': true
      });

      if (!originalCollection) {
        return res.status(404).json({
          success: false,
          message: 'Collection not found or forking not allowed'
        });
      }

      const forkedCollection = await originalCollection.forkCollection(req.user.id, name);

      res.status(201).json({
        success: true,
        data: forkedCollection,
        message: 'Collection forked successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error forking collection',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // ===============================
  // COLLABORATION FEATURES
  // ===============================

  // Add collaborator to collection
  async addCollaborator(req, res) {
    try {
      const { id } = req.params;
      const { userId, role = 'viewer' } = req.body;

      const collection = await Collection.findOne({
        _id: id,
        owner: req.user.id,
        isActive: true,
        allowCollaborators: true
      });

      if (!collection) {
        return res.status(404).json({
          success: false,
          message: 'Collection not found or collaboration not allowed'
        });
      }

      await collection.addCollaborator(userId, role, req.user.id);

      res.json({
        success: true,
        message: 'Collaborator added successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error adding collaborator',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Remove collaborator from collection
  async removeCollaborator(req, res) {
    try {
      const { id, userId } = req.params;

      const collection = await Collection.findOne({
        _id: id,
        owner: req.user.id,
        isActive: true
      });

      if (!collection) {
        return res.status(404).json({
          success: false,
          message: 'Collection not found or access denied'
        });
      }

      await collection.removeCollaborator(userId);

      res.json({
        success: true,
        message: 'Collaborator removed successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error removing collaborator',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = new CollectionsController();
