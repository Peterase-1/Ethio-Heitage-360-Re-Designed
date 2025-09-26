const express = require('express');
const { body, param, query } = require('express-validator');
const { auth, optionalAuth } = require('../middleware/auth');
const {
  getPublicEvents,
  getPublicEventById,
  getFeaturedEvents,
  getUpcomingEvents,
  getEventsByCategory,
  getEventFilters,
  registerForPublicEvent,
  cancelEventRegistration,
  getMyEventRegistrations
} = require('../controllers/visitorEvents');

const router = express.Router();

/**
 * @route   GET /api/visitor/events
 * @desc    Get all public events for visitors
 * @access  Public
 */
router.get('/', [
  optionalAuth, // Allow both authenticated and non-authenticated access
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('sortBy').optional().isIn(['schedule.startDate', 'schedule.endDate', 'title', 'createdAt']).withMessage('Invalid sort field'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc'),
  query('type').optional().isIn(['exhibition', 'workshop', 'lecture', 'tour', 'conference', 'cultural_event', 'educational_program', 'special_exhibition', 'community_event', 'virtual_event', 'other']).withMessage('Invalid event type'),
  query('category').optional().isIn(['art', 'history', 'culture', 'archaeology', 'science', 'education', 'entertainment', 'community', 'research', 'preservation']).withMessage('Invalid category'),
  query('search').optional().isLength({ min: 1, max: 100 }).withMessage('Search term must be between 1 and 100 characters'),
  query('museumId').optional().isMongoId().withMessage('Invalid museum ID'),
  query('city').optional().isString().withMessage('City must be a string'),
  query('featured').optional().isBoolean().withMessage('Featured must be boolean'),
  query('upcoming').optional().isBoolean().withMessage('Upcoming must be boolean'),
  query('dateRange').optional().matches(/^\d{4}-\d{2}-\d{2},\d{4}-\d{2}-\d{2}$/).withMessage('Date range must be in format YYYY-MM-DD,YYYY-MM-DD')
], getPublicEvents);

/**
 * @route   GET /api/visitor/events/featured
 * @desc    Get featured events
 * @access  Public
 */
router.get('/featured', [
  query('limit').optional().isInt({ min: 1, max: 20 }).withMessage('Limit must be between 1 and 20')
], getFeaturedEvents);

/**
 * @route   GET /api/visitor/events/upcoming
 * @desc    Get upcoming events
 * @access  Public
 */
router.get('/upcoming', [
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('museumId').optional().isMongoId().withMessage('Invalid museum ID')
], getUpcomingEvents);

/**
 * @route   GET /api/visitor/events/by-category
 * @desc    Get events grouped by category
 * @access  Public
 */
router.get('/by-category', getEventsByCategory);

/**
 * @route   GET /api/visitor/events/filters
 * @desc    Get available filters (types, categories, museums, cities)
 * @access  Public
 */
router.get('/filters', getEventFilters);

/**
 * @route   GET /api/visitor/events/my-registrations
 * @desc    Get user's registered events
 * @access  Authenticated
 */
router.get('/my-registrations', [
  auth,
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('status').optional().isIn(['all', 'registered', 'confirmed', 'attended', 'cancelled', 'no_show']).withMessage('Invalid status')
], getMyEventRegistrations);

/**
 * @route   GET /api/visitor/events/:id
 * @desc    Get event by ID for visitors
 * @access  Public (with optional auth for registration status)
 */
router.get('/:id', [
  optionalAuth,
  param('id').isMongoId().withMessage('Invalid event ID')
], getPublicEventById);

/**
 * @route   POST /api/visitor/events/:id/register
 * @desc    Register for public event
 * @access  Authenticated
 */
router.post('/:id/register', [
  auth,
  param('id').isMongoId().withMessage('Invalid event ID'),
  body('ticketType')
    .optional()
    .isIn(['adult', 'child', 'student', 'member'])
    .withMessage('Invalid ticket type'),
  body('specialRequirements')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Special requirements must not exceed 500 characters')
], registerForPublicEvent);

/**
 * @route   DELETE /api/visitor/events/:id/register
 * @desc    Cancel event registration
 * @access  Authenticated
 */
router.delete('/:id/register', [
  auth,
  param('id').isMongoId().withMessage('Invalid event ID')
], cancelEventRegistration);

module.exports = router;
