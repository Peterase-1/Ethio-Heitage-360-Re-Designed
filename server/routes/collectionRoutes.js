const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const collectionController = require('../controllers/collectionController');
const { auth: authenticate } = require('../middleware/auth');

// Middleware to ensure user is authenticated
router.use(authenticate);

// Bookmark routes
router.get('/bookmarks',
  [
    query('folder').optional().isString(),
    query('resourceType').optional().isIn(['course', 'museum', 'artifact', 'event', 'tour', 'quiz', 'flashcard', 'live-session', 'heritage-site']),
    query('priority').optional().isInt({ min: 1, max: 5 }),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('sort').optional().isIn(['createdAt', 'lastAccessed', 'priority', 'title'])
  ],
  collectionController.getBookmarks
);

router.post('/bookmarks',
  [
    body('resourceType').isIn(['course', 'museum', 'artifact', 'event', 'tour', 'quiz', 'flashcard', 'live-session', 'heritage-site']),
    body('resourceId').isMongoId(),
    body('title').notEmpty().withMessage('Title is required'),
    body('description').optional().isString(),
    body('imageUrl').optional().isURL(),
    body('url').optional().isURL(),
    body('category').optional().isString(),
    body('tags').optional().isArray(),
    body('notes').optional().isString(),
    body('folder').optional().isString(),
    body('priority').optional().isInt({ min: 1, max: 5 })
  ],
  collectionController.createBookmark
);

router.put('/bookmarks/:id',
  [
    param('id').isMongoId(),
    body('notes').optional().isString(),
    body('folder').optional().isString(),
    body('priority').optional().isInt({ min: 1, max: 5 }),
    body('tags').optional().isArray()
  ],
  collectionController.updateBookmark
);

router.delete('/bookmarks/:id',
  [param('id').isMongoId()],
  collectionController.deleteBookmark
);

router.post('/bookmarks/:id/access',
  [param('id').isMongoId()],
  collectionController.accessBookmark
);

// Note routes
router.get('/notes',
  [
    query('category').optional().isIn(['general', 'heritage', 'history', 'culture', 'artifacts', 'course', 'museum', 'personal']),
    query('folder').optional().isString(),
    query('tags').optional().isString(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('sort').optional().isString(),
    query('search').optional().isString()
  ],
  collectionController.getNotes
);

router.post('/notes',
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('content').notEmpty().withMessage('Content is required'),
    body('category').optional().isIn(['general', 'heritage', 'history', 'culture', 'artifacts', 'course', 'museum', 'personal']),
    body('tags').optional().isArray(),
    body('relatedResource').optional().isObject(),
    body('folder').optional().isString(),
    body('priority').optional().isInt({ min: 1, max: 5 }),
    body('reminderDate').optional().isISO8601(),
    body('attachments').optional().isArray()
  ],
  collectionController.createNote
);

router.get('/notes/:id',
  [param('id').isMongoId()],
  collectionController.getNote
);

router.put('/notes/:id',
  [
    param('id').isMongoId(),
    body('title').optional().notEmpty(),
    body('content').optional().notEmpty(),
    body('category').optional().isIn(['general', 'heritage', 'history', 'culture', 'artifacts', 'course', 'museum', 'personal']),
    body('tags').optional().isArray(),
    body('folder').optional().isString(),
    body('priority').optional().isInt({ min: 1, max: 5 }),
    body('isPinned').optional().isBoolean(),
    body('reminderDate').optional().isISO8601(),
    body('attachments').optional().isArray()
  ],
  collectionController.updateNote
);

router.delete('/notes/:id',
  [param('id').isMongoId()],
  collectionController.deleteNote
);

router.post('/notes/:id/pin',
  [param('id').isMongoId()],
  collectionController.togglePinNote
);

// Favorites routes
router.get('/favorites',
  [
    query('type').optional().isIn(['museums', 'artifacts', 'courses', 'events', 'tours']),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 })
  ],
  collectionController.getFavorites
);

router.post('/favorites',
  [
    body('type').isIn(['museums', 'artifacts', 'courses', 'events', 'tours']),
    body('itemId').isMongoId(),
    body('notes').optional().isString()
  ],
  collectionController.addToFavorites
);

router.delete('/favorites',
  [
    body('type').isIn(['museums', 'artifacts', 'courses', 'events', 'tours']),
    body('itemId').isMongoId()
  ],
  collectionController.removeFromFavorites
);

// Recently viewed routes
router.get('/recent',
  [
    query('limit').optional().isInt({ min: 1, max: 100 })
  ],
  collectionController.getRecentlyViewed
);

// Collection statistics
router.get('/stats',
  collectionController.getCollectionStats
);

module.exports = router;
