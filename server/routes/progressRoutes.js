const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const progressController = require('../controllers/progressController');
const { auth: authenticate } = require('../middleware/auth');

// Middleware to ensure user is authenticated
router.use(authenticate);

// Goal routes
router.get('/goals',
  [
    query('status').optional().isIn(['active', 'completed', 'paused', 'abandoned']),
    query('category').optional().isIn(['course-completion', 'skill-building', 'knowledge', 'certification', 'exploration', 'social', 'habit', 'custom']),
    query('type').optional().isIn(['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'one-time']),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('sort').optional().isIn(['createdAt', 'targetDate', 'progress', 'priority'])
  ],
  progressController.getGoals
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
  progressController.createGoal
);

router.get('/goals/:id',
  [param('id').isMongoId()],
  progressController.getGoal
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
  progressController.updateGoal
);

router.post('/goals/:id/progress',
  [
    param('id').isMongoId(),
    body('increment').optional().isInt({ min: 0 }),
    body('notes').optional().isString()
  ],
  progressController.updateGoalProgress
);

router.delete('/goals/:id',
  [param('id').isMongoId()],
  progressController.deleteGoal
);

// Achievement routes
router.get('/achievements',
  [
    query('category').optional().isIn(['learning', 'exploration', 'social', 'milestone', 'special']),
    query('earned').optional().isIn(['true', 'false']),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 })
  ],
  progressController.getAchievements
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
  progressController.getActivityLog
);

// Analytics routes
router.get('/overview',
  [
    query('timeframe').optional().isIn(['weekly', 'monthly', 'yearly'])
  ],
  progressController.getProgressOverview
);

router.get('/detailed-stats',
  progressController.getDetailedStats
);

// Goal templates
router.get('/goal-templates',
  progressController.getGoalTemplates
);

module.exports = router;
