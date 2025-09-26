const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const toolsController = require('../controllers/toolsController');
const { auth: authenticate, optionalAuth } = require('../middleware/auth');

// ===== PUBLIC ROUTES =====

// Get all tools and resources (public access)
router.get('/', 
  [
    query('category').optional().isIn([
      'Educational Tools',
      'Navigation & Geography',
      'Language & Culture',
      'Utilities & Converters',
      'Mobile & Apps'
    ]),
    query('available').optional().isBoolean(),
    query('search').optional().isString().isLength({ max: 100 }),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 })
  ],
  toolsController.getToolsAndResources
);

// Get tools grouped by category (public access)
router.get('/by-category', toolsController.getToolsByCategory);

// Get featured tools (public access)
router.get('/featured',
  [
    query('limit').optional().isInt({ min: 1, max: 20 })
  ],
  toolsController.getFeaturedTools
);

// Get specific tool details (public access)
router.get('/:id',
  [param('id').isMongoId()],
  toolsController.getTool
);

// Get tool reviews (public access)
router.get('/:id/reviews',
  [
    param('id').isMongoId(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
    query('rating').optional().isInt({ min: 1, max: 5 })
  ],
  toolsController.getToolReviews
);

// Get tool analytics (public access for basic stats)
router.get('/:id/analytics',
  [
    param('id').isMongoId(),
    query('period').optional().isIn(['7d', '30d', '90d', '1y'])
  ],
  toolsController.getToolAnalytics
);

// ===== SPECIFIC TOOL DATA ENDPOINTS =====

// Get language guide data
router.get('/data/language-guide',
  [
    query('category').optional().isIn(['basics', 'numbers', 'family', 'food', 'directions', 'time'])
  ],
  toolsController.getLanguageGuideData
);

// Get cultural calendar data
router.get('/data/cultural-calendar',
  [
    query('year').optional().isInt({ min: 2020, max: 2030 }),
    query('category').optional().isIn(['religious', 'cultural', 'modern'])
  ],
  toolsController.getCulturalCalendarData
);

// Get converter data (exchange rates, etc.)
router.get('/data/converters',
  [
    query('type').optional().isIn(['exchangeRates', 'unitConversions'])
  ],
  toolsController.getConverterData
);

// Get mobile app data
router.get('/data/mobile-app', toolsController.getMobileAppData);

// ===== USAGE TRACKING ROUTES =====

// Track tool usage (optional auth - works for both logged in and anonymous users)
router.post('/:id/track-usage',
  [
    param('id').isMongoId(),
    body('sessionId').optional().isString(),
    body('userAgent').optional().isString(),
    body('ipAddress').optional().isIP()
  ],
  optionalAuth, // Optional authentication
  toolsController.trackToolUsage
);

// ===== AUTHENTICATED ROUTES =====

// Submit a review for a tool (requires authentication)
router.post('/:id/reviews',
  authenticate,
  [
    param('id').isMongoId(),
    body('rating').isInt({ min: 1, max: 5 }),
    body('comment').optional().isString().isLength({ max: 1000 }),
    body('recommend').optional().isBoolean()
  ],
  toolsController.submitToolReview
);

// ===== ADMIN ROUTES =====

// Admin routes would go here for creating/editing tools
// For now, tools are seeded through database or admin panel

module.exports = router;
