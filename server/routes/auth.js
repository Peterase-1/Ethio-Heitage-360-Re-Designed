
const express = require('express');
const { body } = require('express-validator');
const { auth } = require('../middleware/auth');

// Import controller functions
const {
  register,
  login,
  getCurrentUser,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  updateProfile,
  changePassword,
  getUserStats,
  updatePreferences,
  followUser,
  unfollowUser,
  getUserActivity,
  getRecommendations,
  earnBadge,
  updateWeeklyGoals
} = require('../controllers/auth');

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
  body('role')
    .optional()
    .isIn(['admin', 'museum', 'organizer', 'visitor', 'educator', 'tour_admin', 'museum_admin', 'super_admin'])
    .withMessage('Invalid role specified')
], register);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .exists()
    .withMessage('Password is required')
], login);

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, getCurrentUser);

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', auth, logout);

// @route   POST /api/auth/refresh
// @desc    Refresh authentication tokens
// @access  Public (requires valid refresh token)
router.post('/refresh', refreshTokens);

// @route   POST /api/auth/forgot-password
// @desc    Forgot password
// @access  Public
router.post('/forgot-password', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email')
], forgotPassword);

// @route   POST /api/auth/reset-password
// @desc    Reset password
// @access  Public
router.post('/reset-password', [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
], resetPassword);

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('phone')
    .optional()
    .trim(),
  body('bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Bio cannot be more than 500 characters')
], updateProfile);

// @route   PUT /api/auth/change-password
// @desc    Change password
// @access  Private
router.put('/change-password', auth, [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
], changePassword);

// =============== ADVANCED USER FEATURES ===============

// @route   GET /api/auth/stats
// @desc    Get user statistics and analytics
// @access  Private
router.get('/stats', auth, getUserStats);

// @route   PUT /api/auth/preferences
// @desc    Update user preferences
// @access  Private
router.put('/preferences', auth, [
  body('language')
    .optional()
    .isIn(['en', 'am', 'om', 'ti'])
    .withMessage('Invalid language code'),
  body('timezone')
    .optional()
    .isString()
    .withMessage('Timezone must be a string'),
  body('currency')
    .optional()
    .isIn(['ETB', 'USD', 'EUR'])
    .withMessage('Invalid currency code')
], updatePreferences);

// @route   POST /api/auth/follow/:userId
// @desc    Follow another user
// @access  Private
router.post('/follow/:userId', auth, followUser);

// @route   DELETE /api/auth/follow/:userId
// @desc    Unfollow a user
// @access  Private
router.delete('/follow/:userId', auth, unfollowUser);

// @route   GET /api/auth/activity
// @desc    Get user activity log
// @access  Private
router.get('/activity', auth, getUserActivity);

// @route   GET /api/auth/recommendations
// @desc    Get personalized recommendations
// @access  Private
router.get('/recommendations', auth, getRecommendations);

// @route   POST /api/auth/badge
// @desc    Award badge to user (admin only)
// @access  Private (admin)
router.post('/badge', auth, [
  body('userId')
    .notEmpty()
    .withMessage('User ID is required'),
  body('badgeId')
    .notEmpty()
    .withMessage('Badge ID is required'),
  body('name')
    .notEmpty()
    .withMessage('Badge name is required'),
  body('description')
    .optional()
    .isString(),
  body('icon')
    .optional()
    .isString(),
  body('category')
    .isIn(['exploration', 'learning', 'social', 'achievement'])
    .withMessage('Invalid badge category')
], earnBadge);

// @route   PUT /api/auth/weekly-goals
// @desc    Update weekly goals
// @access  Private
router.put('/weekly-goals', auth, [
  body('artifactsToView')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Artifacts to view must be between 1 and 50'),
  body('toursToBook')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Tours to book must be between 1 and 10'),
  body('eventsToAttend')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Events to attend must be between 1 and 10')
], updateWeeklyGoals);

module.exports = router;

