const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const collectionsController = require('../controllers/collectionsController');
const { auth, authorize, optionalAuth } = require('../middleware/auth');

// ===============================
// PUBLIC/DISCOVERY ROUTES
// ===============================

// Get public collections (discovery)
router.get('/public',
  optionalAuth,
  [
    query('type').optional().isIn(['learning-path', 'favorites', 'wishlist', 'completed', 'research', 'custom']),
    query('category').optional().isIn(['heritage', 'history', 'culture', 'artifacts', 'courses', 'games', 'mixed']),
    query('search').optional().isString().isLength({ max: 100 }),
    query('sortBy').optional().isIn(['stats.lastActivityAt', 'createdAt', 'stats.totalItems', 'likes']),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 })
  ],
  collectionsController.getPublicCollections
);

// ===============================
// AUTHENTICATED USER ROUTES
// ===============================

// Get user's collections
router.get('/',
  auth,
  [
    query('type').optional().isIn(['learning-path', 'favorites', 'wishlist', 'completed', 'research', 'custom']),
    query('category').optional().isIn(['heritage', 'history', 'culture', 'artifacts', 'courses', 'games', 'mixed']),
    query('search').optional().isString().isLength({ max: 100 }),
    query('sortBy').optional().isIn(['updatedAt', 'createdAt', 'name', 'stats.lastActivityAt', 'stats.totalItems']),
    query('sortOrder').optional().isIn(['asc', 'desc']),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 })
  ],
  collectionsController.getUserCollections
);

// Create new collection
router.post('/',
  auth,
  [
    body('name').notEmpty().isLength({ max: 100 }).withMessage('Name is required and must be under 100 characters'),
    body('description').optional().isLength({ max: 500 }),
    body('type').optional().isIn(['learning-path', 'favorites', 'wishlist', 'completed', 'research', 'custom']),
    body('category').optional().isIn(['heritage', 'history', 'culture', 'artifacts', 'courses', 'games', 'mixed']),
    body('isPublic').optional().isBoolean(),
    body('allowCollaborators').optional().isBoolean(),
    body('cover').optional().isObject(),
    body('tags').optional().isArray(),
    body('sortBy').optional().isIn(['dateAdded', 'alphabetical', 'priority', 'type', 'progress']),
    body('sortOrder').optional().isIn(['asc', 'desc']),
    body('viewMode').optional().isIn(['grid', 'list', 'timeline']),
    body('shareSettings').optional().isObject(),
    body('goals').optional().isObject(),
    body('reminders').optional().isArray()
  ],
  collectionsController.createCollection
);

// Get specific collection by ID
router.get('/:id',
  auth,
  [
    param('id').isMongoId().withMessage('Invalid collection ID'),
    query('includeItems').optional().isIn(['true', 'false'])
  ],
  collectionsController.getCollection
);

// Update collection
router.put('/:id',
  auth,
  [
    param('id').isMongoId().withMessage('Invalid collection ID'),
    body('name').optional().isLength({ max: 100 }),
    body('description').optional().isLength({ max: 500 }),
    body('type').optional().isIn(['learning-path', 'favorites', 'wishlist', 'completed', 'research', 'custom']),
    body('category').optional().isIn(['heritage', 'history', 'culture', 'artifacts', 'courses', 'games', 'mixed']),
    body('isPublic').optional().isBoolean(),
    body('allowCollaborators').optional().isBoolean(),
    body('cover').optional().isObject(),
    body('tags').optional().isArray(),
    body('sortBy').optional().isIn(['dateAdded', 'alphabetical', 'priority', 'type', 'progress']),
    body('sortOrder').optional().isIn(['asc', 'desc']),
    body('viewMode').optional().isIn(['grid', 'list', 'timeline']),
    body('shareSettings').optional().isObject(),
    body('goals').optional().isObject(),
    body('reminders').optional().isArray()
  ],
  collectionsController.updateCollection
);

// Delete collection
router.delete('/:id',
  auth,
  [
    param('id').isMongoId().withMessage('Invalid collection ID')
  ],
  collectionsController.deleteCollection
);

// ===============================
// COLLECTION ITEMS MANAGEMENT
// ===============================

// Add item to collection
router.post('/:id/items',
  auth,
  [
    param('id').isMongoId().withMessage('Invalid collection ID'),
    body('itemType').isIn(['artifact', 'course', 'quiz', 'game', 'flashcard', 'museum', 'tour', 'lesson', 'livesession']).withMessage('Invalid item type'),
    body('itemId').isMongoId().withMessage('Invalid item ID'),
    body('itemTitle').notEmpty().withMessage('Item title is required'),
    body('itemDescription').optional().isString(),
    body('itemImage').optional().isString(),
    body('personalNotes').optional().isLength({ max: 1000 }),
    body('tags').optional().isArray(),
    body('priority').optional().isIn(['low', 'medium', 'high']),
    body('customFields').optional().isArray()
  ],
  collectionsController.addItem
);

// Remove item from collection
router.delete('/:id/items/:itemId',
  auth,
  [
    param('id').isMongoId().withMessage('Invalid collection ID'),
    param('itemId').isMongoId().withMessage('Invalid item ID'),
    body('itemType').isIn(['artifact', 'course', 'quiz', 'game', 'flashcard', 'museum', 'tour', 'lesson', 'livesession']).withMessage('Invalid item type')
  ],
  collectionsController.removeItem
);

// Update item progress
router.patch('/:id/items/:itemId/progress',
  auth,
  [
    param('id').isMongoId().withMessage('Invalid collection ID'),
    param('itemId').isMongoId().withMessage('Invalid item ID'),
    body('itemType').isIn(['artifact', 'course', 'quiz', 'game', 'flashcard', 'museum', 'tour', 'lesson', 'livesession']).withMessage('Invalid item type'),
    body('progress').isObject().withMessage('Progress data must be an object'),
    body('progress.completed').optional().isBoolean(),
    body('progress.score').optional().isNumeric(),
    body('progress.timeSpent').optional().isInt({ min: 0 })
  ],
  collectionsController.updateItemProgress
);

// Reorder collection items
router.patch('/:id/reorder',
  auth,
  [
    param('id').isMongoId().withMessage('Invalid collection ID'),
    body('itemOrder').isArray().withMessage('Item order must be an array'),
    body('itemOrder.*.itemId').isMongoId().withMessage('Invalid item ID in order'),
    body('itemOrder.*.itemType').isIn(['artifact', 'course', 'quiz', 'game', 'flashcard', 'museum', 'tour', 'lesson', 'livesession']),
    body('itemOrder.*.newIndex').isInt({ min: 0 }).withMessage('New index must be a non-negative integer')
  ],
  collectionsController.reorderItems
);

// ===============================
// SOCIAL FEATURES
// ===============================

// Like/unlike collection
router.post('/:id/like',
  auth,
  [
    param('id').isMongoId().withMessage('Invalid collection ID')
  ],
  collectionsController.toggleLike
);

// Add comment to collection
router.post('/:id/comments',
  auth,
  [
    param('id').isMongoId().withMessage('Invalid collection ID'),
    body('content').notEmpty().isLength({ max: 500 }).withMessage('Comment content is required and must be under 500 characters')
  ],
  collectionsController.addComment
);

// Fork collection
router.post('/:id/fork',
  auth,
  [
    param('id').isMongoId().withMessage('Invalid collection ID'),
    body('name').optional().isLength({ max: 100 }).withMessage('Collection name must be under 100 characters')
  ],
  collectionsController.forkCollection
);

// ===============================
// COLLABORATION FEATURES
// ===============================

// Add collaborator to collection
router.post('/:id/collaborators',
  auth,
  [
    param('id').isMongoId().withMessage('Invalid collection ID'),
    body('userId').isMongoId().withMessage('Invalid user ID'),
    body('role').optional().isIn(['viewer', 'contributor', 'editor']).withMessage('Invalid collaborator role')
  ],
  collectionsController.addCollaborator
);

// Remove collaborator from collection
router.delete('/:id/collaborators/:userId',
  auth,
  [
    param('id').isMongoId().withMessage('Invalid collection ID'),
    param('userId').isMongoId().withMessage('Invalid user ID')
  ],
  collectionsController.removeCollaborator
);

module.exports = router;
