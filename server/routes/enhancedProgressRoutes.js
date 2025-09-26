const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const enhancedProgressController = require('../controllers/enhancedProgressController');
const { auth } = require('../middleware/auth');

// Middleware to ensure user is authenticated
router.use(auth);

// ===============================
// ENHANCED PROGRESS AND POINTS ROUTES
// ===============================

// Get user's points overview
router.get('/points',
  [
    query('timeframe').optional().isIn(['week', 'month', 'year'])
  ],
  enhancedProgressController.getPointsOverview
);

// Complete a goal with points reward
router.post('/goals/:id/complete',
  [
    param('id').isMongoId().withMessage('Invalid goal ID'),
    body('notes').optional().isString()
  ],
  enhancedProgressController.completeGoal
);

// Get detailed progress analytics with points
router.get('/analytics/detailed',
  [
    query('timeframe').optional().isIn(['week', 'month', 'year'])
  ],
  enhancedProgressController.getDetailedProgressAnalytics
);

// Check milestone achievements
router.get('/milestones',
  enhancedProgressController.checkMilestones
);

// ===============================
// DELEGATED ROUTES FROM ORIGINAL CONTROLLER
// ===============================

// Goal routes (enhanced with points integration)
router.get('/goals',
  [
    query('status').optional().isIn(['active', 'completed', 'paused', 'abandoned']),
    query('category').optional().isIn(['course-completion', 'skill-building', 'knowledge', 'certification', 'exploration', 'social', 'habit', 'custom']),
    query('type').optional().isIn(['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'one-time']),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('sort').optional().isIn(['createdAt', 'targetDate', 'progress', 'priority'])
  ],
  enhancedProgressController.getGoals
);

router.post('/goals',
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').optional().isString(),
    body('category').optional().isIn(['course-completion', 'skill-building', 'knowledge', 'certification', 'exploration', 'social', 'habit', 'custom']),
    body('type').optional().isIn(['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'one-time']),
    body('target').isInt({ min: 1 }).withMessage('Target must be a positive integer'),
    body('unit').isIn(['courses', 'lessons', 'hours', 'points', 'quizzes', 'museums-visited', 'artifacts-viewed', 'days', 'items']),
    body('targetDate').isISO8601().withMessage('Valid target date is required'),
    body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
    body('relatedResource').optional().isObject(),
    body('milestones').optional().isArray(),
    body('tags').optional().isArray(),
    body('notes').optional().isString(),
    body('isPublic').optional().isBoolean()
  ],
  enhancedProgressController.createGoal
);

router.get('/goals/:id',
  [param('id').isMongoId()],
  enhancedProgressController.getGoal
);

router.put('/goals/:id',
  [
    param('id').isMongoId(),
    body('title').optional().notEmpty(),
    body('description').optional().isString(),
    body('targetDate').optional().isISO8601(),
    body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
    body('notes').optional().isString(),
    body('status').optional().isIn(['active', 'completed', 'paused', 'abandoned']),
    body('tags').optional().isArray(),
    body('isPublic').optional().isBoolean()
  ],
  enhancedProgressController.updateGoal
);

router.post('/goals/:id/progress',
  [
    param('id').isMongoId(),
    body('increment').optional().isInt({ min: 0 }),
    body('notes').optional().isString()
  ],
  enhancedProgressController.updateGoalProgress
);

router.delete('/goals/:id',
  [param('id').isMongoId()],
  enhancedProgressController.deleteGoal
);

// Achievement routes
router.get('/achievements',
  [
    query('category').optional().isIn(['learning', 'exploration', 'social', 'milestone', 'special']),
    query('earned').optional().isIn(['true', 'false']),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 })
  ],
  enhancedProgressController.getAchievements
);

// Activity log routes
router.get('/activity',
  [
    query('type').optional().isIn(['course-completion', 'quiz-completion', 'museum-visit', 'artifact-view', 'goal-completion', 'achievement-earned', 'login', 'interaction']),
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 })
  ],
  enhancedProgressController.getActivityLog
);

// Analytics routes
router.get('/overview',
  [
    query('timeframe').optional().isIn(['weekly', 'monthly', 'yearly'])
  ],
  enhancedProgressController.getProgressOverview
);

router.get('/detailed-stats',
  enhancedProgressController.getDetailedStats
);

// Goal templates
router.get('/goal-templates',
  enhancedProgressController.getGoalTemplates
);

module.exports = router;
