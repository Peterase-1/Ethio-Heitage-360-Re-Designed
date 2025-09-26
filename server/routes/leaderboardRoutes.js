const express = require('express');
const router = express.Router();
const { query } = require('express-validator');
const leaderboardController = require('../controllers/leaderboardController');
const { auth, optionalAuth } = require('../middleware/auth');

// ===============================
// PUBLIC LEADERBOARD ROUTES
// ===============================

// Get main leaderboard (public with optional auth for user highlighting)
router.get('/',
  optionalAuth,
  [
    query('timeframe').optional().isIn(['allTime', 'daily', 'weekly', 'monthly']),
    query('category').optional().isIn(['overall', 'games', 'quizzes', 'collections', 'courses']),
    query('limit').optional().isInt({ min: 1, max: 100 })
  ],
  leaderboardController.getLeaderboard
);

// Get leaderboard statistics (public)
router.get('/stats',
  leaderboardController.getLeaderboardStats
);

// Get achievements leaderboard (public with optional auth)
router.get('/achievements',
  optionalAuth,
  [
    query('limit').optional().isInt({ min: 1, max: 100 })
  ],
  leaderboardController.getAchievementsLeaderboard
);

// ===============================
// AUTHENTICATED USER ROUTES
// ===============================

// Get user's leaderboard position (requires auth)
router.get('/my-position',
  auth,
  [
    query('timeframe').optional().isIn(['allTime', 'daily', 'weekly', 'monthly']),
    query('category').optional().isIn(['overall', 'games', 'quizzes', 'collections', 'courses'])
  ],
  leaderboardController.getUserPosition
);

// Get user's weekly progress (requires auth)
router.get('/my-progress',
  auth,
  leaderboardController.getWeeklyProgress
);

module.exports = router;
