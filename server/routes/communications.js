const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { auth } = require('../middleware/auth');
const { requireSuperAdmin } = require('../middleware/roleHierarchy');
const {
  getCommunications,
  getCommunication,
  createCommunication,
  replyToCommunication,
  getConversation,
  markAsRead,
  archiveCommunication,
  getUnreadCount,
  getAdminDashboard
} = require('../controllers/communicationController');

// Apply authentication to all routes
router.use(auth);

// Validation middleware
const createCommunicationValidation = [
  body('type').isIn(['feedback', 'inquiry', 'announcement', 'request', 'response']).withMessage('Invalid communication type'),
  body('to').isMongoId().withMessage('Invalid recipient ID'),
  body('subject').isLength({ min: 1, max: 200 }).withMessage('Subject must be between 1 and 200 characters'),
  body('message').isLength({ min: 1, max: 2000 }).withMessage('Message must be between 1 and 2000 characters'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
  body('museum').optional().isMongoId().withMessage('Invalid museum ID'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('internalNotes').optional().isLength({ max: 500 }).withMessage('Internal notes must be less than 500 characters')
];

const replyValidation = [
  body('message').isLength({ min: 1, max: 2000 }).withMessage('Message must be between 1 and 2000 characters'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority')
];

// ======================
// GENERAL COMMUNICATION ROUTES
// ======================

/**
 * @route   GET /api/communications
 * @desc    Get all communications for authenticated user
 * @access  Private
 * @params  page, limit, type, status, priority, search, sortBy, sortOrder
 */
router.get('/', getCommunications);

/**
 * @route   GET /api/communications/unread-count
 * @desc    Get unread communication count for user
 * @access  Private
 */
router.get('/unread-count', getUnreadCount);

/**
 * @route   GET /api/communications/:id
 * @desc    Get specific communication
 * @access  Private
 */
router.get('/:id', getCommunication);

/**
 * @route   GET /api/communications/:id/conversation
 * @desc    Get conversation thread
 * @access  Private
 */
router.get('/:id/conversation', getConversation);

/**
 * @route   POST /api/communications
 * @desc    Create new communication
 * @access  Private
 * @body    type, to, subject, message, priority, museum, relatedContent, tags, internalNotes
 */
router.post('/', createCommunicationValidation, createCommunication);

/**
 * @route   POST /api/communications/:id/reply
 * @desc    Reply to communication
 * @access  Private
 * @body    message, priority
 */
router.post('/:id/reply', replyValidation, replyToCommunication);

/**
 * @route   PUT /api/communications/:id/read
 * @desc    Mark communication as read
 * @access  Private
 */
router.put('/:id/read', markAsRead);

/**
 * @route   PUT /api/communications/:id/archive
 * @desc    Archive communication
 * @access  Private
 */
router.put('/:id/archive', archiveCommunication);

// ======================
// ADMIN ROUTES
// ======================

/**
 * @route   GET /api/communications/admin/dashboard
 * @desc    Get communications dashboard data for Super Admin
 * @access  Private (Super Admin only)
 */
router.get('/admin/dashboard', requireSuperAdmin, getAdminDashboard);

module.exports = router;


