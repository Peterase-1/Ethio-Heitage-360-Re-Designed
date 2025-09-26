const express = require('express');
const { body, param, query } = require('express-validator');
const { auth } = require('../middleware/auth');
const { requireMuseumAdminOrHigher } = require('../middleware/roleHierarchy');
const {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventStats,
  getEventTypesAndCategories,
  registerForEvent,
  cancelEventRegistration,
  addEventReview,
  bulkUpdateEventStatus,
  duplicateEvent,
  getEventAnalytics,
  exportEventAttendees,
  getUpcomingEvents
} = require('../controllers/event');

const router = express.Router();

// ======================
// EVENT MANAGEMENT ROUTES
// ======================

/**
 * @route   GET /api/events
 * @desc    Get all events with filtering, pagination, and sorting
 * @access  Museum Admin or Super Admin
 */
router.get('/', [
  auth,
  requireMuseumAdminOrHigher,
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('sortBy').optional().isIn(['title', 'schedule.startDate', 'schedule.endDate', 'createdAt', 'status']).withMessage('Invalid sort field'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc'),
  query('status').optional().isIn(['draft', 'published', 'cancelled', 'completed', 'archived']).withMessage('Invalid status'),
  query('type').optional().isIn(['exhibition', 'workshop', 'lecture', 'tour', 'conference', 'cultural_event', 'educational_program', 'special_exhibition', 'community_event', 'virtual_event', 'other']).withMessage('Invalid event type'),
  query('category').optional().isIn(['art', 'history', 'culture', 'archaeology', 'science', 'education', 'entertainment', 'community', 'research', 'preservation']).withMessage('Invalid category'),
  query('search').optional().isLength({ min: 1, max: 100 }).withMessage('Search term must be between 1 and 100 characters'),
  query('museumId').optional().isMongoId().withMessage('Invalid museum ID')
], getAllEvents);

/**
 * @route   GET /api/events/stats
 * @desc    Get event statistics
 * @access  Museum Admin or Super Admin
 */
router.get('/stats', [
  auth,
  requireMuseumAdminOrHigher,
  query('museumId').optional().isMongoId().withMessage('Invalid museum ID'),
  query('startDate').optional().isISO8601().withMessage('Invalid start date format'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date format')
], getEventStats);

/**
 * @route   GET /api/events/types-categories
 * @desc    Get event types and categories
 * @access  Public
 */
router.get('/types-categories', getEventTypesAndCategories);

/**
 * @route   GET /api/events/:id
 * @desc    Get event by ID
 * @access  Museum Admin or Super Admin
 */
router.get('/:id', [
  auth,
  requireMuseumAdminOrHigher,
  param('id').isMongoId().withMessage('Invalid event ID')
], getEventById);

/**
 * @route   POST /api/events
 * @desc    Create new event
 * @access  Museum Admin or Super Admin
 */
router.post('/', [
  auth,
  requireMuseumAdminOrHigher,
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('description')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Description must be between 1 and 2000 characters'),
  body('type')
    .isIn(['exhibition', 'workshop', 'lecture', 'tour', 'conference', 'cultural_event', 'educational_program', 'special_exhibition', 'community_event', 'virtual_event', 'other'])
    .withMessage('Invalid event type'),
  body('category')
    .isIn(['art', 'history', 'culture', 'archaeology', 'science', 'education', 'entertainment', 'community', 'research', 'preservation'])
    .withMessage('Invalid category'),
  body('schedule.startDate')
    .isISO8601()
    .withMessage('Invalid start date format'),
  body('schedule.endDate')
    .isISO8601()
    .withMessage('Invalid end date format'),
  body('schedule.startTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Invalid start time format (HH:MM)'),
  body('schedule.endTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Invalid end time format (HH:MM)'),
  body('location.type')
    .optional()
    .isIn(['physical', 'virtual', 'hybrid'])
    .withMessage('Invalid location type'),
  body('registration.required')
    .optional()
    .isBoolean()
    .withMessage('Registration required must be boolean'),
  body('registration.capacity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Capacity must be a positive integer'),
  body('registration.fees.adult')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Adult fee must be a non-negative number'),
  body('registration.fees.child')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Child fee must be a non-negative number'),
  body('registration.fees.student')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Student fee must be a non-negative number'),
  body('registration.fees.member')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Member fee must be a non-negative number'),
  body('status')
    .optional()
    .isIn(['draft', 'published', 'cancelled', 'completed', 'archived'])
    .withMessage('Invalid status'),
  body('visibility')
    .optional()
    .isIn(['public', 'members_only', 'private', 'unlisted'])
    .withMessage('Invalid visibility'),
  body('featured')
    .optional()
    .isBoolean()
    .withMessage('Featured must be boolean'),
  body('museum')
    .optional()
    .isMongoId()
    .withMessage('Invalid museum ID')
], createEvent);

/**
 * @route   PUT /api/events/:id
 * @desc    Update event
 * @access  Museum Admin or Super Admin
 */
router.put('/:id', [
  auth,
  requireMuseumAdminOrHigher,
  param('id').isMongoId().withMessage('Invalid event ID'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Description must be between 1 and 2000 characters'),
  body('type')
    .optional()
    .isIn(['exhibition', 'workshop', 'lecture', 'tour', 'conference', 'cultural_event', 'educational_program', 'special_exhibition', 'community_event', 'virtual_event', 'other'])
    .withMessage('Invalid event type'),
  body('category')
    .optional()
    .isIn(['art', 'history', 'culture', 'archaeology', 'science', 'education', 'entertainment', 'community', 'research', 'preservation'])
    .withMessage('Invalid category'),
  body('schedule.startDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid start date format'),
  body('schedule.endDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid end date format'),
  body('schedule.startTime')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Invalid start time format (HH:MM)'),
  body('schedule.endTime')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Invalid end time format (HH:MM)'),
  body('location.type')
    .optional()
    .isIn(['physical', 'virtual', 'hybrid'])
    .withMessage('Invalid location type'),
  body('registration.required')
    .optional()
    .isBoolean()
    .withMessage('Registration required must be boolean'),
  body('registration.capacity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Capacity must be a positive integer'),
  body('registration.fees.adult')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Adult fee must be a non-negative number'),
  body('registration.fees.child')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Child fee must be a non-negative number'),
  body('registration.fees.student')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Student fee must be a non-negative number'),
  body('registration.fees.member')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Member fee must be a non-negative number'),
  body('status')
    .optional()
    .isIn(['draft', 'published', 'cancelled', 'completed', 'archived'])
    .withMessage('Invalid status'),
  body('visibility')
    .optional()
    .isIn(['public', 'members_only', 'private', 'unlisted'])
    .withMessage('Invalid visibility'),
  body('featured')
    .optional()
    .isBoolean()
    .withMessage('Featured must be boolean')
], updateEvent);

/**
 * @route   DELETE /api/events/:id
 * @desc    Delete event
 * @access  Museum Admin or Super Admin
 */
router.delete('/:id', [
  auth,
  requireMuseumAdminOrHigher,
  param('id').isMongoId().withMessage('Invalid event ID')
], deleteEvent);

/**
 * @route   POST /api/events/:id/register
 * @desc    Register user for event
 * @access  Authenticated
 */
router.post('/:id/register', [
  auth,
  param('id').isMongoId().withMessage('Invalid event ID'),
  body('ticketType')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Ticket type must be between 1 and 50 characters'),
  body('specialRequirements')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Special requirements must not exceed 500 characters')
], registerForEvent);

/**
 * @route   DELETE /api/events/:id/register
 * @desc    Cancel event registration
 * @access  Authenticated
 */
router.delete('/:id/register', [
  auth,
  param('id').isMongoId().withMessage('Invalid event ID')
], cancelEventRegistration);

/**
 * @route   POST /api/events/:id/review
 * @desc    Add event review
 * @access  Authenticated
 */
router.post('/:id/review', [
  auth,
  param('id').isMongoId().withMessage('Invalid event ID'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Comment must not exceed 1000 characters')
], addEventReview);

/**
 * @route   GET /api/events/upcoming
 * @desc    Get upcoming events for dashboard
 * @access  Museum Admin or Super Admin
 */
router.get('/upcoming', [
  auth,
  requireMuseumAdminOrHigher,
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
], getUpcomingEvents);

/**
 * @route   PUT /api/events/bulk/status
 * @desc    Bulk update event status
 * @access  Museum Admin or Super Admin
 */
router.put('/bulk/status', [
  auth,
  requireMuseumAdminOrHigher,
  body('eventIds')
    .isArray({ min: 1 })
    .withMessage('Event IDs must be a non-empty array'),
  body('eventIds.*')
    .isMongoId()
    .withMessage('Invalid event ID'),
  body('status')
    .isIn(['draft', 'published', 'cancelled', 'completed', 'archived'])
    .withMessage('Invalid status')
], bulkUpdateEventStatus);

/**
 * @route   POST /api/events/:id/duplicate
 * @desc    Duplicate event
 * @access  Museum Admin or Super Admin
 */
router.post('/:id/duplicate', [
  auth,
  requireMuseumAdminOrHigher,
  param('id').isMongoId().withMessage('Invalid event ID')
], duplicateEvent);

/**
 * @route   GET /api/events/:id/analytics
 * @desc    Get event analytics
 * @access  Museum Admin or Super Admin
 */
router.get('/:id/analytics', [
  auth,
  requireMuseumAdminOrHigher,
  param('id').isMongoId().withMessage('Invalid event ID')
], getEventAnalytics);

/**
 * @route   GET /api/events/:id/export/attendees
 * @desc    Export event attendees
 * @access  Museum Admin or Super Admin
 */
router.get('/:id/export/attendees', [
  auth,
  requireMuseumAdminOrHigher,
  param('id').isMongoId().withMessage('Invalid event ID')
], exportEventAttendees);

module.exports = router;
