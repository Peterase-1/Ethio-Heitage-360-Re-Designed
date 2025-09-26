const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const gamesController = require('../controllers/gamesController');
const { auth, authorize, optionalAuth } = require('../middleware/auth');

// ===============================
// VISITOR ROUTES (Public/Protected)
// ===============================

// Get published games (public with optional auth for personalization)
router.get('/public', 
  optionalAuth,
  [
    query('gameType').optional().isIn([
      'quiz', 'puzzle', 'memory', 'matching', 'sorting', 'drag-drop', 
      'word-game', 'math-game', 'timeline', 'map-game', 'simulation',
      'adventure', 'strategy', 'trivia', 'flashcards', 'ar-game', 
      'vr-experience', '3d-exploration', 'interactive-story'
    ]),
    query('category').optional().isIn([
      'history', 'archaeology', 'art', 'culture', 'geography', 
      'language', 'science', 'mathematics', 'literature', 'music',
      'architecture', 'technology', 'nature', 'social-studies'
    ]),
    query('difficulty').optional().isIn(['beginner', 'intermediate', 'advanced', 'expert']),
    query('subjects').optional().isString(),
    query('search').optional().isString().isLength({ max: 100 }),
    query('tags').optional().isString(),
    query('featured').optional().isIn(['true', 'false']),
    query('popular').optional().isIn(['true', 'false']),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('sort').optional().isIn(['popularityScore', 'createdAt', 'rating', 'title', 'playCount'])
  ],
  gamesController.getPublishedGames
);

// Get featured games for homepage/dashboard
router.get('/featured',
  optionalAuth,
  [
    query('limit').optional().isInt({ min: 1, max: 20 })
  ],
  gamesController.getFeaturedGames
);

// Get games grouped by category
router.get('/categories',
  optionalAuth,
  gamesController.getGamesByCategory
);

// Get specific game by ID (public with optional auth for usage tracking)
router.get('/public/:id',
  optionalAuth,
  [
    param('id').isMongoId().withMessage('Invalid game ID')
  ],
  gamesController.getGame
);

// Get game leaderboard
router.get('/:id/leaderboard',
  optionalAuth,
  [
    param('id').isMongoId().withMessage('Invalid game ID'),
    query('timeframe').optional().isIn(['all', 'daily', 'weekly', 'monthly']),
    query('limit').optional().isInt({ min: 1, max: 100 })
  ],
  gamesController.getGameLeaderboard
);

// ===============================
// AUTHENTICATED VISITOR ROUTES
// ===============================

// Start game session (requires auth)
router.post('/:id/start',
  auth,
  [
    param('id').isMongoId().withMessage('Invalid game ID'),
    body('playerData').optional().isObject()
  ],
  gamesController.startGameSession
);

// Record game play/score (requires auth)
router.post('/:id/play',
  auth,
  [
    param('id').isMongoId().withMessage('Invalid game ID'),
    body('sessionId').optional().isString(),
    body('score').optional().isInt({ min: 0 }),
    body('completed').optional().isBoolean(),
    body('timeSpent').optional().isInt({ min: 0 }),
    body('actions').optional().isArray(),
    body('achievements').optional().isArray(),
    body('metadata').optional().isObject()
  ],
  gamesController.recordGamePlay
);

// Get player's game history (requires auth)
router.get('/:id/history',
  auth,
  [
    param('id').isMongoId().withMessage('Invalid game ID'),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 })
  ],
  gamesController.getPlayerGameHistory
);

// ===============================
// SUPER ADMIN ROUTES
// ===============================

// Get all games for super admin management
router.get('/admin/all',
  auth,
  authorize('superAdmin'),
  [
    query('status').optional().isIn(['draft', 'testing', 'published', 'maintenance', 'archived']),
    query('gameType').optional().isIn([
      'quiz', 'puzzle', 'memory', 'matching', 'sorting', 'drag-drop', 
      'word-game', 'math-game', 'timeline', 'map-game', 'simulation',
      'adventure', 'strategy', 'trivia', 'flashcards', 'ar-game', 
      'vr-experience', '3d-exploration', 'interactive-story'
    ]),
    query('category').optional().isIn([
      'history', 'archaeology', 'art', 'culture', 'geography', 
      'language', 'science', 'mathematics', 'literature', 'music',
      'architecture', 'technology', 'nature', 'social-studies'
    ]),
    query('difficulty').optional().isIn(['beginner', 'intermediate', 'advanced', 'expert']),
    query('createdBy').optional().isMongoId(),
    query('search').optional().isString().isLength({ max: 100 }),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('sort').optional().isIn(['createdAt', 'updatedAt', 'title', 'status', 'popularityScore'])
  ],
  gamesController.getAllGames
);

// Get games summary for super admin dashboard
router.get('/admin/summary',
  auth,
  authorize('superAdmin'),
  gamesController.getGamesSummary
);

// Create new game (super admin only)
router.post('/admin',
  auth,
  authorize('superAdmin'),
  [
    body('title').notEmpty().isLength({ max: 200 }).withMessage('Title is required and must be under 200 characters'),
    body('description').notEmpty().isLength({ max: 1000 }).withMessage('Description is required and must be under 1000 characters'),
    body('gameType').isIn([
      'quiz', 'puzzle', 'memory', 'matching', 'sorting', 'drag-drop', 
      'word-game', 'math-game', 'timeline', 'map-game', 'simulation',
      'adventure', 'strategy', 'trivia', 'flashcards', 'ar-game', 
      'vr-experience', '3d-exploration', 'interactive-story'
    ]).withMessage('Invalid game type'),
    body('category').isIn([
      'history', 'archaeology', 'art', 'culture', 'geography', 
      'language', 'science', 'mathematics', 'literature', 'music',
      'architecture', 'technology', 'nature', 'social-studies'
    ]).withMessage('Invalid category'),
    body('difficulty').isIn(['beginner', 'intermediate', 'advanced', 'expert']).withMessage('Invalid difficulty level'),
    body('gameConfig').optional().isObject(),
    body('content').optional().isObject(),
    body('media').optional().isObject(),
    body('scoring').optional().isObject(),
    body('permissions').optional().isObject(),
    body('educational').optional().isObject(),
    body('technical').optional().isObject(),
    body('tags').optional().isArray(),
    body('status').optional().isIn(['draft', 'testing', 'published', 'maintenance', 'archived']),
    body('isFeatured').optional().isBoolean(),
    body('isActive').optional().isBoolean()
  ],
  gamesController.createGame
);

// Get specific game by ID for admin
router.get('/admin/:id',
  auth,
  authorize('superAdmin'),
  [
    param('id').isMongoId().withMessage('Invalid game ID')
  ],
  gamesController.getGame
);

// Update game (super admin only)
router.put('/admin/:id',
  auth,
  authorize('superAdmin'),
  [
    param('id').isMongoId().withMessage('Invalid game ID'),
    body('title').optional().isLength({ max: 200 }),
    body('description').optional().isLength({ max: 1000 }),
    body('gameType').optional().isIn([
      'quiz', 'puzzle', 'memory', 'matching', 'sorting', 'drag-drop', 
      'word-game', 'math-game', 'timeline', 'map-game', 'simulation',
      'adventure', 'strategy', 'trivia', 'flashcards', 'ar-game', 
      'vr-experience', '3d-exploration', 'interactive-story'
    ]),
    body('category').optional().isIn([
      'history', 'archaeology', 'art', 'culture', 'geography', 
      'language', 'science', 'mathematics', 'literature', 'music',
      'architecture', 'technology', 'nature', 'social-studies'
    ]),
    body('difficulty').optional().isIn(['beginner', 'intermediate', 'advanced', 'expert']),
    body('gameConfig').optional().isObject(),
    body('content').optional().isObject(),
    body('media').optional().isObject(),
    body('scoring').optional().isObject(),
    body('permissions').optional().isObject(),
    body('educational').optional().isObject(),
    body('technical').optional().isObject(),
    body('tags').optional().isArray(),
    body('status').optional().isIn(['draft', 'testing', 'published', 'maintenance', 'archived']),
    body('isFeatured').optional().isBoolean(),
    body('isActive').optional().isBoolean()
  ],
  gamesController.updateGame
);

// Delete game (super admin only)
router.delete('/admin/:id',
  auth,
  authorize('superAdmin'),
  [
    param('id').isMongoId().withMessage('Invalid game ID')
  ],
  gamesController.deleteGame
);

// Toggle publish status
router.patch('/admin/:id/publish',
  auth,
  authorize('superAdmin'),
  [
    param('id').isMongoId().withMessage('Invalid game ID'),
    body('status').isIn(['draft', 'testing', 'published', 'maintenance', 'archived']).withMessage('Invalid status')
  ],
  gamesController.togglePublishStatus
);

// Get game analytics (super admin only)
router.get('/admin/:id/analytics',
  auth,
  authorize('superAdmin'),
  [
    param('id').isMongoId().withMessage('Invalid game ID'),
    query('timeframe').optional().isIn(['weekly', 'monthly', 'quarterly', 'yearly'])
  ],
  gamesController.getGameAnalytics
);

module.exports = router;
