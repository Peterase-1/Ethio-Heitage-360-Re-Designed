const express = require('express');
const router = express.Router();
const adminProgressController = require('../controllers/adminProgressController');
const { auth, authorize } = require('../middleware/auth');

// Middleware to ensure only super admins can access these routes
const requireSuperAdmin = [auth, authorize('superAdmin')];

// ===============================
// USER PROGRESS MANAGEMENT ROUTES
// ===============================

/**
 * @route GET /api/admin-progress/users
 * @desc Get all user progress data with filtering and pagination
 * @access Super Admin only
 * @query {string} search - Search users by name or email
 * @query {string} filterType - Filter type: 'all', 'active', 'high_achievers', 'struggling'
 * @query {string} sortBy - Sort field: 'lastActivity', 'progress', 'achievements', 'score'
 * @query {string} sortOrder - Sort order: 'asc', 'desc'
 * @query {number} page - Page number for pagination
 * @query {number} limit - Items per page
 * @query {string} timeframe - Timeframe for filtering: 'week', 'month', 'quarter', 'year', 'all'
 */
router.get('/users', requireSuperAdmin, adminProgressController.getAllUserProgress);

/**
 * @route GET /api/admin-progress/users/:userId
 * @desc Get detailed progress for a specific user
 * @access Super Admin only
 * @param {string} userId - User ID
 */
router.get('/users/:userId', requireSuperAdmin, adminProgressController.getUserProgressDetail);

/**
 * @route POST /api/admin-progress/users/:userId/reset
 * @desc Reset user progress (admin only)
 * @access Super Admin only
 * @param {string} userId - User ID
 * @body {string} resetType - Reset type: 'partial' or 'complete'
 */
router.post('/users/:userId/reset', requireSuperAdmin, adminProgressController.resetUserProgress);

// ===============================
// ACHIEVEMENT MANAGEMENT ROUTES
// ===============================

/**
 * @route GET /api/admin-progress/achievements
 * @desc Get all achievements with statistics
 * @access Super Admin only
 * @query {string} category - Filter by achievement category
 * @query {string} type - Filter by achievement type
 * @query {string} rarity - Filter by achievement rarity
 * @query {boolean} isActive - Filter by active status
 * @query {number} page - Page number for pagination
 * @query {number} limit - Items per page
 */
router.get('/achievements', requireSuperAdmin, adminProgressController.getAllAchievements);

/**
 * @route POST /api/admin-progress/achievements
 * @desc Create new achievement
 * @access Super Admin only
 * @body {string} id - Unique achievement ID
 * @body {string} name - Achievement name
 * @body {string} description - Achievement description
 * @body {string} type - Achievement type
 * @body {string} category - Achievement category
 * @body {string} icon - Achievement icon
 * @body {string} badge - Achievement badge URL
 * @body {string} color - Achievement color
 * @body {object} criteria - Achievement criteria
 * @body {number} points - Points awarded
 * @body {string} rarity - Achievement rarity
 */
router.post('/achievements', requireSuperAdmin, adminProgressController.createAchievement);

/**
 * @route PUT /api/admin-progress/achievements/:id
 * @desc Update achievement
 * @access Super Admin only
 * @param {string} id - Achievement ID
 * @body {object} updates - Fields to update
 */
router.put('/achievements/:id', requireSuperAdmin, adminProgressController.updateAchievement);

/**
 * @route DELETE /api/admin-progress/achievements/:id
 * @desc Delete achievement
 * @access Super Admin only
 * @param {string} id - Achievement ID
 */
router.delete('/achievements/:id', requireSuperAdmin, adminProgressController.deleteAchievement);

/**
 * @route POST /api/admin-progress/achievements/:achievementId/award/:userId
 * @desc Award achievement to specific user
 * @access Super Admin only
 * @param {string} achievementId - Achievement ID
 * @param {string} userId - User ID
 */
router.post('/achievements/:achievementId/award/:userId', requireSuperAdmin, adminProgressController.awardAchievementToUser);

// ===============================
// ANALYTICS AND REPORTING ROUTES
// ===============================

/**
 * @route GET /api/admin-progress/analytics
 * @desc Get comprehensive progress analytics
 * @access Super Admin only
 * @query {string} timeframe - Timeframe: 'week', 'month', 'quarter', 'year'
 */
router.get('/analytics', requireSuperAdmin, adminProgressController.getProgressAnalytics);

/**
 * @route GET /api/admin-progress/export
 * @desc Export user progress data
 * @access Super Admin only
 * @query {string} format - Export format: 'json', 'csv'
 * @query {string} userIds - Comma-separated user IDs (optional, exports all if not specified)
 */
router.get('/export', requireSuperAdmin, adminProgressController.exportProgressData);

// ===============================
// BULK OPERATIONS ROUTES
// ===============================

/**
 * @route POST /api/admin-progress/bulk/reset-progress
 * @desc Bulk reset progress for multiple users
 * @access Super Admin only
 * @body {array} userIds - Array of user IDs
 * @body {string} resetType - Reset type: 'partial' or 'complete'
 */
router.post('/bulk/reset-progress', requireSuperAdmin, async (req, res) => {
  try {
    const { userIds, resetType = 'partial' } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'User IDs array is required'
      });
    }

    const results = await Promise.allSettled(
      userIds.map(async (userId) => {
        // Call the reset function for each user
        const mockReq = { user: req.user, params: { userId }, body: { resetType } };
        const mockRes = {
          json: (data) => data,
          status: (code) => ({ json: (data) => ({ ...data, statusCode: code }) })
        };
        
        return adminProgressController.resetUserProgress(mockReq, mockRes);
      })
    );

    const successful = results.filter(result => result.status === 'fulfilled').length;
    const failed = results.filter(result => result.status === 'rejected').length;

    res.json({
      success: true,
      message: `Bulk progress reset completed`,
      results: {
        total: userIds.length,
        successful,
        failed,
        details: results
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error performing bulk progress reset',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route POST /api/admin-progress/bulk/award-achievement
 * @desc Bulk award achievement to multiple users
 * @access Super Admin only
 * @body {array} userIds - Array of user IDs
 * @body {string} achievementId - Achievement ID to award
 */
router.post('/bulk/award-achievement', requireSuperAdmin, async (req, res) => {
  try {
    const { userIds, achievementId } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'User IDs array is required'
      });
    }

    if (!achievementId) {
      return res.status(400).json({
        success: false,
        message: 'Achievement ID is required'
      });
    }

    const results = await Promise.allSettled(
      userIds.map(async (userId) => {
        const mockReq = { user: req.user, params: { userId, achievementId } };
        const mockRes = {
          json: (data) => data,
          status: (code) => ({ json: (data) => ({ ...data, statusCode: code }) })
        };
        
        return adminProgressController.awardAchievementToUser(mockReq, mockRes);
      })
    );

    const successful = results.filter(result => result.status === 'fulfilled').length;
    const failed = results.filter(result => result.status === 'rejected').length;

    res.json({
      success: true,
      message: `Bulk achievement award completed`,
      results: {
        total: userIds.length,
        successful,
        failed,
        details: results
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error performing bulk achievement award',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ===============================
// STATISTICS AND OVERVIEW ROUTES
// ===============================

/**
 * @route GET /api/admin-progress/overview
 * @desc Get progress overview statistics for admin dashboard
 * @access Super Admin only
 */
router.get('/overview', requireSuperAdmin, async (req, res) => {
  try {
    const stats = await adminProgressController.getProgressOverviewStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching progress overview',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route GET /api/admin-progress/trends
 * @desc Get progress trends data
 * @access Super Admin only
 * @query {string} timeframe - Timeframe: 'week', 'month', 'quarter', 'year'
 * @query {string} metric - Metric to track: 'users', 'activities', 'achievements', 'completions'
 */
router.get('/trends', requireSuperAdmin, async (req, res) => {
  try {
    const { timeframe = 'month', metric = 'users' } = req.query;
    
    // This would implement specific trend analysis
    // For now, return a placeholder response
    res.json({
      success: true,
      data: {
        timeframe,
        metric,
        trends: []
      },
      message: 'Trends analysis endpoint - implementation pending'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching progress trends',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
