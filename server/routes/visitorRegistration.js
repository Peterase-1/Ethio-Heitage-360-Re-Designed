const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const visitorRegistrationController = require('../controllers/visitorRegistration');
const { auth } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(auth);

/**
 * @route   POST /api/visitor-registration
 * @desc    Register a new visitor
 * @access  Museum Admin
 */
router.post('/', [
  // Visitor Information Validation
  body('visitorInfo.name')
    .notEmpty()
    .withMessage('Visitor name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),

  body('visitorInfo.email')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),

  body('visitorInfo.phone')
    .notEmpty()
    .withMessage('Phone number is required')
    .isMobilePhone()
    .withMessage('Valid phone number is required'),

  body('visitorInfo.age')
    .isInt({ min: 1, max: 120 })
    .withMessage('Age must be between 1 and 120'),

  body('visitorInfo.gender')
    .isIn(['male', 'female', 'other', 'prefer_not_to_say'])
    .withMessage('Invalid gender selection'),

  body('visitorInfo.nationality')
    .notEmpty()
    .withMessage('Nationality is required'),

  body('visitorInfo.visitorType')
    .isIn(['local', 'international', 'student', 'researcher', 'tourist'])
    .withMessage('Invalid visitor type'),

  // Visit Details Validation
  body('visitDetails.visitDate')
    .isISO8601()
    .withMessage('Valid visit date is required'),

  body('visitDetails.visitTime')
    .notEmpty()
    .withMessage('Visit time is required'),

  body('visitDetails.groupSize')
    .isInt({ min: 1, max: 50 })
    .withMessage('Group size must be between 1 and 50'),

  body('visitDetails.visitPurpose')
    .isIn(['education', 'research', 'tourism', 'cultural', 'family', 'other'])
    .withMessage('Invalid visit purpose'),

  body('visitDetails.expectedDuration')
    .isFloat({ min: 0.5, max: 8 })
    .withMessage('Expected duration must be between 0.5 and 8 hours'),

  // Payment Validation
  body('payment.amount')
    .isFloat({ min: 0 })
    .withMessage('Payment amount must be non-negative'),

  body('payment.paymentMethod')
    .isIn(['cash', 'card', 'mobile_money', 'free'])
    .withMessage('Invalid payment method'),

  // Optional fields
  body('specialRequirements')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Special requirements must not exceed 500 characters'),

  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes must not exceed 500 characters')
], visitorRegistrationController.registerVisitor);

/**
 * @route   GET /api/visitor-registration
 * @desc    Get all visitor registrations for a museum
 * @access  Museum Admin
 */
router.get('/', [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  query('status')
    .optional()
    .isIn(['registered', 'checked_in', 'checked_out', 'cancelled', 'all'])
    .withMessage('Invalid status filter'),

  query('visitorType')
    .optional()
    .isIn(['local', 'international', 'student', 'researcher', 'tourist', 'all'])
    .withMessage('Invalid visitor type filter'),

  query('sortBy')
    .optional()
    .isIn(['createdAt', 'visitDetails.visitDate', 'visitorInfo.name', 'payment.amount'])
    .withMessage('Invalid sort field'),

  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc')
], visitorRegistrationController.getVisitorRegistrations);

/**
 * @route   GET /api/visitor-registration/analytics
 * @desc    Get visitor analytics for museum
 * @access  Museum Admin
 */
router.get('/analytics', [
  query('period')
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage('Period must be between 1 and 365 days')
], visitorRegistrationController.getVisitorAnalytics);

/**
 * @route   GET /api/visitor-registration/:id
 * @desc    Get visitor registration by ID
 * @access  Museum Admin
 */
router.get('/:id', [
  param('id')
    .isMongoId()
    .withMessage('Invalid visitor registration ID')
], visitorRegistrationController.getVisitorRegistrationById);

/**
 * @route   PUT /api/visitor-registration/:id/status
 * @desc    Update visitor registration status
 * @access  Museum Admin
 */
router.put('/:id/status', [
  param('id')
    .isMongoId()
    .withMessage('Invalid visitor registration ID'),

  body('status')
    .isIn(['registered', 'checked_in', 'checked_out', 'cancelled'])
    .withMessage('Invalid status value')
], visitorRegistrationController.updateVisitorStatus);

module.exports = router;
