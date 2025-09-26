const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const toolsAndResourcesController = require('../controllers/toolsAndResourcesController');
const { auth, authorize, optionalAuth } = require('../middleware/auth');

// ===============================
// VISITOR ROUTES (Public/Protected)
// ===============================

// Get published tools and resources (public with optional auth for personalization)
router.get('/public', 
  optionalAuth,
  [
    query('type').optional().isIn([
      'calculator', 'converter', 'timeline', 'map', 'dictionary', 
      'translator', 'quiz-maker', 'note-taker', 'citation-tool',
      'research-guide', 'study-planner', 'flashcard-maker', 
      'presentation-tool', 'document-viewer', 'image-editor',
      'audio-recorder', 'video-player', 'ar-viewer', 'vr-experience',
      'interactive-simulation', 'virtual-lab', 'reference-guide'
    ]),
    query('category').optional().isIn([
      'educational', 'research', 'productivity', 'creative', 
      'language', 'historical', 'cultural', 'scientific',
      'archaeological', 'geographic', 'artistic'
    ]),
    query('access').optional().isIn(['free', 'premium', 'subscription', 'one-time']),
    query('subjects').optional().isString(),
    query('search').optional().isString().isLength({ max: 100 }),
    query('tags').optional().isString(),
    query('featured').optional().isIn(['true', 'false']),
    query('popular').optional().isIn(['true', 'false']),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('sort').optional().isIn(['popularityScore', 'createdAt', 'rating', 'title', 'usage'])
  ],
  toolsAndResourcesController.getPublishedTools
);

// Get featured tools for homepage/dashboard
router.get('/featured',
  optionalAuth,
  [
    query('limit').optional().isInt({ min: 1, max: 20 })
  ],
  toolsAndResourcesController.getFeaturedTools
);

// Get tools grouped by category
router.get('/categories',
  optionalAuth,
  toolsAndResourcesController.getToolsByCategory
);

// Get specific tool by ID (public with optional auth for usage tracking)
router.get('/public/:id',
  optionalAuth,
  [
    param('id').isMongoId().withMessage('Invalid tool ID')
  ],
  toolsAndResourcesController.getTool
);

// ===============================
// AUTHENTICATED VISITOR ROUTES
// ===============================

// Record tool usage session (requires auth)
router.post('/:id/usage',
  auth,
  [
    param('id').isMongoId().withMessage('Invalid tool ID'),
    body('duration').optional().isInt({ min: 0 }).withMessage('Duration must be a non-negative integer'),
    body('actionsPerformed').optional().isInt({ min: 0 }),
    body('completionStatus').optional().isIn(['completed', 'abandoned', 'interrupted']),
    body('feedback').optional().isObject()
  ],
  toolsAndResourcesController.recordUsageSession
);

// Add review for a tool (requires auth)
router.post('/:id/reviews',
  auth,
  [
    param('id').isMongoId().withMessage('Invalid tool ID'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('comment').optional().isString().isLength({ max: 500 }),
    body('pros').optional().isArray(),
    body('cons').optional().isArray(),
    body('wouldRecommend').optional().isBoolean(),
    body('usageContext').optional().isIn(['personal-study', 'group-project', 'research', 'teaching', 'presentation'])
  ],
  toolsAndResourcesController.addReview
);

// ===============================
// SUPER ADMIN ROUTES
// ===============================

// Get all tools for super admin management
router.get('/admin/all',
  auth,
  authorize('superAdmin'),
  [
    query('status').optional().isIn(['draft', 'testing', 'published', 'maintenance', 'deprecated']),
    query('type').optional().isIn([
      'calculator', 'converter', 'timeline', 'map', 'dictionary', 
      'translator', 'quiz-maker', 'note-taker', 'citation-tool',
      'research-guide', 'study-planner', 'flashcard-maker', 
      'presentation-tool', 'document-viewer', 'image-editor',
      'audio-recorder', 'video-player', 'ar-viewer', 'vr-experience',
      'interactive-simulation', 'virtual-lab', 'reference-guide'
    ]),
    query('category').optional().isIn([
      'educational', 'research', 'productivity', 'creative', 
      'language', 'historical', 'cultural', 'scientific',
      'archaeological', 'geographic', 'artistic'
    ]),
    query('createdBy').optional().isMongoId(),
    query('search').optional().isString().isLength({ max: 100 }),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('sort').optional().isIn(['createdAt', 'updatedAt', 'title', 'status', 'popularityScore'])
  ],
  toolsAndResourcesController.getAllTools
);

// Get tools summary for super admin dashboard
router.get('/admin/summary',
  auth,
  authorize('superAdmin'),
  toolsAndResourcesController.getToolsSummary
);

// Create new tool (super admin only)
router.post('/admin',
  auth,
  authorize('superAdmin'),
  [
    body('title').notEmpty().isLength({ max: 200 }).withMessage('Title is required and must be under 200 characters'),
    body('description').notEmpty().isLength({ max: 1000 }).withMessage('Description is required and must be under 1000 characters'),
    body('shortDescription').optional().isLength({ max: 200 }),
    body('type').isIn([
      'calculator', 'converter', 'timeline', 'map', 'dictionary', 
      'translator', 'quiz-maker', 'note-taker', 'citation-tool',
      'research-guide', 'study-planner', 'flashcard-maker', 
      'presentation-tool', 'document-viewer', 'image-editor',
      'audio-recorder', 'video-player', 'ar-viewer', 'vr-experience',
      'interactive-simulation', 'virtual-lab', 'reference-guide'
    ]).withMessage('Invalid tool type'),
    body('category').isIn([
      'educational', 'research', 'productivity', 'creative', 
      'language', 'historical', 'cultural', 'scientific',
      'archaeological', 'geographic', 'artistic'
    ]).withMessage('Invalid category'),
    body('access').optional().isIn(['free', 'premium', 'subscription', 'one-time']),
    body('toolConfig').optional().isObject(),
    body('permissions').optional().isObject(),
    body('content').optional().isObject(),
    body('media').optional().isObject(),
    body('features').optional().isArray(),
    body('integration').optional().isObject(),
    body('educational').optional().isObject(),
    body('technicalRequirements').optional().isObject(),
    body('tags').optional().isArray(),
    body('keywords').optional().isArray(),
    body('status').optional().isIn(['draft', 'testing', 'published', 'maintenance', 'deprecated']),
    body('isFeatured').optional().isBoolean(),
    body('isActive').optional().isBoolean()
  ],
  toolsAndResourcesController.createTool
);

// Get specific tool by ID for admin
router.get('/admin/:id',
  auth,
  authorize('superAdmin'),
  [
    param('id').isMongoId().withMessage('Invalid tool ID')
  ],
  toolsAndResourcesController.getTool
);

// Update tool (super admin only)
router.put('/admin/:id',
  auth,
  authorize('superAdmin'),
  [
    param('id').isMongoId().withMessage('Invalid tool ID'),
    body('title').optional().isLength({ max: 200 }),
    body('description').optional().isLength({ max: 1000 }),
    body('shortDescription').optional().isLength({ max: 200 }),
    body('type').optional().isIn([
      'calculator', 'converter', 'timeline', 'map', 'dictionary', 
      'translator', 'quiz-maker', 'note-taker', 'citation-tool',
      'research-guide', 'study-planner', 'flashcard-maker', 
      'presentation-tool', 'document-viewer', 'image-editor',
      'audio-recorder', 'video-player', 'ar-viewer', 'vr-experience',
      'interactive-simulation', 'virtual-lab', 'reference-guide'
    ]),
    body('category').optional().isIn([
      'educational', 'research', 'productivity', 'creative', 
      'language', 'historical', 'cultural', 'scientific',
      'archaeological', 'geographic', 'artistic'
    ]),
    body('access').optional().isIn(['free', 'premium', 'subscription', 'one-time']),
    body('toolConfig').optional().isObject(),
    body('permissions').optional().isObject(),
    body('content').optional().isObject(),
    body('media').optional().isObject(),
    body('features').optional().isArray(),
    body('integration').optional().isObject(),
    body('educational').optional().isObject(),
    body('technicalRequirements').optional().isObject(),
    body('tags').optional().isArray(),
    body('keywords').optional().isArray(),
    body('status').optional().isIn(['draft', 'testing', 'published', 'maintenance', 'deprecated']),
    body('isFeatured').optional().isBoolean(),
    body('isActive').optional().isBoolean()
  ],
  toolsAndResourcesController.updateTool
);

// Delete tool (super admin only)
router.delete('/admin/:id',
  auth,
  authorize('superAdmin'),
  [
    param('id').isMongoId().withMessage('Invalid tool ID')
  ],
  toolsAndResourcesController.deleteTool
);

// Toggle publish status
router.patch('/admin/:id/publish',
  auth,
  authorize('superAdmin'),
  [
    param('id').isMongoId().withMessage('Invalid tool ID'),
    body('status').isIn(['draft', 'testing', 'published', 'maintenance', 'deprecated']).withMessage('Invalid status')
  ],
  toolsAndResourcesController.togglePublishStatus
);

// Update tool version
router.post('/admin/:id/version',
  auth,
  authorize('superAdmin'),
  [
    param('id').isMongoId().withMessage('Invalid tool ID'),
    body('newVersion').notEmpty().withMessage('New version is required'),
    body('changes').isArray().withMessage('Changes must be an array')
  ],
  toolsAndResourcesController.updateToolVersion
);

// Report tool issue
router.post('/admin/:id/issues',
  auth,
  authorize('superAdmin'),
  [
    param('id').isMongoId().withMessage('Invalid tool ID'),
    body('description').notEmpty().withMessage('Issue description is required'),
    body('severity').isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid severity level'),
    body('workaround').optional().isString()
  ],
  toolsAndResourcesController.reportIssue
);

// Get tool analytics (super admin only)
router.get('/admin/:id/analytics',
  auth,
  authorize('superAdmin'),
  [
    param('id').isMongoId().withMessage('Invalid tool ID'),
    query('timeframe').optional().isIn(['weekly', 'monthly', 'quarterly', 'yearly'])
  ],
  toolsAndResourcesController.getToolAnalytics
);

module.exports = router;
