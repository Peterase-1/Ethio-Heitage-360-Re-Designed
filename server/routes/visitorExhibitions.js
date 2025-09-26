const express = require('express');
const { body, param, query } = require('express-validator');
const { auth, optionalAuth } = require('../middleware/auth');
const {
  getPublicExhibitions,
  getPublicExhibitionById,
  getFeaturedExhibitions,
  getActiveExhibitions,
  getExhibitionsByCategory,
  getExhibitionFilters,
  addExhibitionReview
} = require('../controllers/visitorExhibitions');

const router = express.Router();

/**
 * @route   GET /api/visitor/exhibitions
 * @desc    Get all public exhibitions for visitors
 * @access  Public
 */
router.get('/', [
  optionalAuth, // Allow both authenticated and non-authenticated access
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('sortBy').optional().isIn(['schedule.startDate', 'schedule.endDate', 'title', 'createdAt', 'statistics.totalViews']).withMessage('Invalid sort field'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc'),
  query('type').optional().isIn([
    'permanent', 'temporary', 'traveling', 'special', 'virtual', 
    'interactive', 'outdoor', 'educational', 'research', 'community'
  ]).withMessage('Invalid exhibition type'),
  query('category').optional().isIn([
    'art', 'history', 'culture', 'archaeology', 'science', 'technology',
    'nature', 'photography', 'contemporary', 'traditional', 'religious',
    'ethnographic', 'decorative_arts', 'textiles', 'ceramics', 'jewelry',
    'manuscripts', 'coins', 'weapons', 'tools'
  ]).withMessage('Invalid category'),
  query('search').optional().isLength({ min: 1, max: 100 }).withMessage('Search term must be between 1 and 100 characters'),
  query('museumId').optional().isMongoId().withMessage('Invalid museum ID'),
  query('city').optional().isString().withMessage('City must be a string'),
  query('featured').optional().isBoolean().withMessage('Featured must be boolean'),
  query('active').optional().isBoolean().withMessage('Active must be boolean'),
  query('permanent').optional().isBoolean().withMessage('Permanent must be boolean'),
  query('dateRange').optional().matches(/^\d{4}-\d{2}-\d{2},\d{4}-\d{2}-\d{2}$/).withMessage('Date range must be in format YYYY-MM-DD,YYYY-MM-DD')
], getPublicExhibitions);

/**
 * @route   GET /api/visitor/exhibitions/featured
 * @desc    Get featured exhibitions
 * @access  Public
 */
router.get('/featured', [
  query('limit').optional().isInt({ min: 1, max: 20 }).withMessage('Limit must be between 1 and 20')
], getFeaturedExhibitions);

/**
 * @route   GET /api/visitor/exhibitions/active
 * @desc    Get active exhibitions
 * @access  Public
 */
router.get('/active', [
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('museumId').optional().isMongoId().withMessage('Invalid museum ID'),
  query('type').optional().isIn([
    'permanent', 'temporary', 'traveling', 'special', 'virtual', 
    'interactive', 'outdoor', 'educational', 'research', 'community'
  ]).withMessage('Invalid exhibition type')
], getActiveExhibitions);

/**
 * @route   GET /api/visitor/exhibitions/by-category
 * @desc    Get exhibitions grouped by category
 * @access  Public
 */
router.get('/by-category', getExhibitionsByCategory);

/**
 * @route   GET /api/visitor/exhibitions/filters
 * @desc    Get available filters (types, categories, museums, cities)
 * @access  Public
 */
router.get('/filters', getExhibitionFilters);

/**
 * @route   GET /api/visitor/exhibitions/:id
 * @desc    Get exhibition by ID for visitors
 * @access  Public (with optional auth for user-specific data)
 */
router.get('/:id', [
  optionalAuth,
  param('id').isMongoId().withMessage('Invalid exhibition ID')
], getPublicExhibitionById);

/**
 * @route   POST /api/visitor/exhibitions/:id/review
 * @desc    Add review to exhibition
 * @access  Authenticated
 */
router.post('/:id/review', [
  auth,
  param('id').isMongoId().withMessage('Invalid exhibition ID'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Comment must not exceed 1000 characters')
    .trim()
], addExhibitionReview);

module.exports = router;
