const express = require('express');
const router = express.Router();
const {
  getDashboardData,
  getProfile,
  updateProfile,
  getFavorites,
  addFavorite,
  removeFavorite,
  getActivity,
  getStats,
  getRecommendations
} = require('../controllers/visitorDashboard');
const { auth: protect, authorize } = require('../middleware/auth');

// All routes are protected and require visitor role
router.use(protect);
router.use(authorize('user', 'visitor')); // Allow both 'user' and 'visitor' roles

/**
 * @desc    Get visitor dashboard data
 * @route   GET /api/visitor-dashboard/dashboard
 * @access  Private (Visitors only)
 */
router.get('/dashboard', getDashboardData);

/**
 * @desc    Get visitor profile
 * @route   GET /api/visitor-dashboard/profile
 * @access  Private (Visitors only)
 */
router.get('/profile', getProfile);

/**
 * @desc    Update visitor profile
 * @route   PUT /api/visitor-dashboard/profile
 * @access  Private (Visitors only)
 */
router.put('/profile', updateProfile);

/**
 * @desc    Get user favorites
 * @route   GET /api/visitor-dashboard/favorites
 * @access  Private (Visitors only)
 * @query   entityType, category, tags, page, limit, sortBy, sortOrder
 */
router.get('/favorites', getFavorites);

/**
 * @desc    Add item to favorites
 * @route   POST /api/visitor-dashboard/favorites
 * @access  Private (Visitors only)
 * @body    { entityId, entityType, entityData, notes?, tags?, priority?, isPublic? }
 */
router.post('/favorites', addFavorite);

/**
 * @desc    Remove item from favorites
 * @route   DELETE /api/visitor-dashboard/favorites/:entityId/:entityType
 * @access  Private (Visitors only)
 */
router.delete('/favorites/:entityId/:entityType', removeFavorite);

/**
 * @desc    Get user activity history
 * @route   GET /api/visitor-dashboard/activity
 * @access  Private (Visitors only)
 * @query   type, days, page, limit
 */
router.get('/activity', getActivity);

/**
 * @desc    Get user stats and analytics
 * @route   GET /api/visitor-dashboard/stats
 * @access  Private (Visitors only)
 * @query   period (week|month|year)
 */
router.get('/stats', getStats);

/**
 * @desc    Get personalized recommendations
 * @route   GET /api/visitor-dashboard/recommendations
 * @access  Private (Visitors only)
 * @query   type, limit
 */
router.get('/recommendations', getRecommendations);

module.exports = router;
