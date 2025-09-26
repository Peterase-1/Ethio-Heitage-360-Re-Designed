const express = require('express');
const router = express.Router();
const {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  getUserRecommendations,
  getUserProfile,
  searchUsers,
  getActivityFeed,
  getLeaderboard
} = require('../controllers/socialController');
const { auth: protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

/**
 * @desc    Get activity feed (user's and followed users' activities)
 * @route   GET /api/social/feed
 * @access  Private
 * @query   page, limit
 */
router.get('/feed', getActivityFeed);

/**
 * @desc    Get user's followers
 * @route   GET /api/social/followers
 * @access  Private
 * @query   page, limit
 */
router.get('/followers', getFollowers);

/**
 * @desc    Get users that current user is following
 * @route   GET /api/social/following
 * @access  Private
 * @query   page, limit
 */
router.get('/following', getFollowing);

/**
 * @desc    Get user recommendations based on interests
 * @route   GET /api/social/recommendations
 * @access  Private
 * @query   limit
 */
router.get('/recommendations', getUserRecommendations);

/**
 * @desc    Search users by name, bio, or interests
 * @route   GET /api/social/search
 * @access  Private
 * @query   q (search query), interests, page, limit
 */
router.get('/search', searchUsers);

/**
 * @desc    Get leaderboard
 * @route   GET /api/social/leaderboard
 * @access  Private
 * @query   type (points|level|artifacts|events), period (all|month|week), limit
 */
router.get('/leaderboard', getLeaderboard);

/**
 * @desc    Get user profile for social view
 * @route   GET /api/social/profile/:userId
 * @access  Private
 */
router.get('/profile/:userId', getUserProfile);

/**
 * @desc    Follow a user
 * @route   POST /api/social/follow/:userId
 * @access  Private
 */
router.post('/follow/:userId', followUser);

/**
 * @desc    Unfollow a user
 * @route   DELETE /api/social/follow/:userId
 * @access  Private
 */
router.delete('/follow/:userId', unfollowUser);

module.exports = router;
