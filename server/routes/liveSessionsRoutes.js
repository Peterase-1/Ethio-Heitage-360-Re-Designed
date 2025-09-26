const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const liveSessionsController = require('../controllers/liveSessionsController');
const { auth, authorize } = require('../middleware/auth');

// Validation middleware
const validateSessionCreation = [
  body('title').isLength({ min: 3, max: 200 }).trim().withMessage('Title must be 3-200 characters'),
  body('description').isLength({ min: 10, max: 2000 }).trim().withMessage('Description must be 10-2000 characters'),
  body('category').isIn(['heritage', 'history', 'culture', 'artifacts', 'geography', 'guided-tour', 'workshop']).withMessage('Invalid category'),
  body('scheduledAt').isISO8601().toDate().withMessage('Valid scheduled date is required'),
  body('duration').isInt({ min: 15, max: 300 }).withMessage('Duration must be between 15-300 minutes'),
  body('maxParticipants').optional().isInt({ min: 1, max: 1000 }).withMessage('Max participants must be 1-1000'),
  body('language').optional().isIn(['english', 'amharic', 'oromo', 'tigrinya']).withMessage('Invalid language')
];

const validateFeedback = [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().isLength({ max: 500 }).trim().withMessage('Comment must be max 500 characters')
];

// ===============================
// PUBLIC/VISITOR ROUTES
// ===============================

// Get public sessions (upcoming and live)
router.get('/public', liveSessionsController.getPublicSessions);

// Get session details
router.get('/public/:id', liveSessionsController.getSessionDetails);

// Register for session (requires authentication)
router.post('/:id/register', auth, liveSessionsController.registerForSession);

// Unregister from session (requires authentication)
router.delete('/:id/register', auth, liveSessionsController.unregisterFromSession);

// Get user's registered sessions (requires authentication)
router.get('/user/sessions', auth, liveSessionsController.getUserSessions);

// Submit feedback for completed session (requires authentication)
router.post('/:id/feedback', auth, validateFeedback, liveSessionsController.submitFeedback);

// ===============================
// SUPER ADMIN ROUTES
// ===============================

// Get all sessions for admin management
router.get('/admin/all', auth, authorize('superAdmin'), liveSessionsController.getAllSessions);

// Create new live session
router.post('/admin/create', auth, authorize('superAdmin'), validateSessionCreation, liveSessionsController.createSession);

// Update session
router.put('/admin/:id', auth, authorize('superAdmin'), validateSessionCreation, liveSessionsController.updateSession);

// Delete session
router.delete('/admin/:id', auth, authorize('superAdmin'), liveSessionsController.deleteSession);

// Start session
router.post('/admin/:id/start', auth, authorize('superAdmin'), liveSessionsController.startSession);

// End session
router.post('/admin/:id/end', auth, authorize('superAdmin'), liveSessionsController.endSession);

// Get session analytics
router.get('/admin/:id/analytics', auth, authorize('superAdmin'), liveSessionsController.getSessionAnalytics);

// Get dashboard summary
router.get('/admin/dashboard/summary', auth, authorize('superAdmin'), liveSessionsController.getDashboardSummary);

module.exports = router;
