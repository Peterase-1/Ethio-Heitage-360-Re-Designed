const express = require('express');
const {
  auth,
  authorize,
  requirePermission,
  requireMuseumAccess,
  ROLES,
  PERMISSIONS
} = require('../middleware/auth');
const rentalController = require('../controllers/rentalController');
const { validateRequest } = require('../middleware/validation');
const { body, param, query } = require('express-validator');

const router = express.Router();

// Validation rules
const createRentalValidation = [
  body('artifact').isMongoId().withMessage('Valid artifact ID is required'),
  body('museum').isMongoId().withMessage('Valid museum ID is required'),
  body('renterInfo.name').notEmpty().withMessage('Renter name is required'),
  body('renterInfo.organization').notEmpty().withMessage('Organization is required'),
  body('renterInfo.contactEmail').isEmail().withMessage('Valid contact email is required'),
  body('renterInfo.phone').notEmpty().withMessage('Phone number is required'),
  body('renterInfo.address.country').notEmpty().withMessage('Country is required'),
  body('rentalType').isIn(['exhibition', 'research', 'educational', 'commercial', 'other']).withMessage('Valid rental type is required'),
  body('purpose').isLength({ min: 10, max: 1000 }).withMessage('Purpose must be between 10 and 1000 characters'),
  body('requestedDuration.startDate').isISO8601().withMessage('Valid start date is required'),
  body('requestedDuration.endDate').isISO8601().withMessage('Valid end date is required'),
  body('location.venue').notEmpty().withMessage('Venue is required'),
  body('location.address').notEmpty().withMessage('Address is required'),
  body('pricing.dailyRate').isNumeric().withMessage('Valid daily rate is required')
];

const updateRentalValidation = [
  body('renterInfo.name').optional().notEmpty().withMessage('Renter name cannot be empty'),
  body('renterInfo.organization').optional().notEmpty().withMessage('Organization cannot be empty'),
  body('renterInfo.contactEmail').optional().isEmail().withMessage('Valid contact email is required'),
  body('purpose').optional().isLength({ min: 10, max: 1000 }).withMessage('Purpose must be between 10 and 1000 characters')
];

const approvalValidation = [
  body('comments').optional().isString().withMessage('Comments must be a string'),
  body('conditions').optional().isString().withMessage('Conditions must be a string')
];

const rentalIdValidation = [
  param('id').isMongoId().withMessage('Valid rental ID is required')
];

// Apply authentication to all routes
router.use(auth);

// GET /api/rentals - Get all rentals (with role-based filtering)
router.get('/',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('status').optional().isIn([
      'pending_review', 'approved', 'rejected', 'payment_pending', 'confirmed',
      'in_transit', 'active', 'completed', 'overdue', 'cancelled', 'dispute'
    ]).withMessage('Valid status filter required'),
    query('museum').optional().isMongoId().withMessage('Valid museum ID is required'),
    query('search').optional().isLength({ min: 1 }).withMessage('Search term cannot be empty')
  ],
  validateRequest,
  rentalController.getAllRentals
);

// GET /api/rentals/stats - Get rental statistics
router.get('/stats',
  rentalController.getRentalStats
);

// GET /api/rentals/pending-approval - Get rentals pending approval (Admin only)
router.get('/pending-approval',
  authorize(ROLES.MUSEUM_ADMIN, ROLES.SUPER_ADMIN),
  rentalController.getPendingApprovals
);

// GET /api/rentals/museum/:museumId/pending - Get museum's pending rentals (Museum Admin)
router.get('/museum/:museumId/pending',
  [param('museumId').isMongoId().withMessage('Valid museum ID is required')],
  validateRequest,
  requireMuseumAccess,
  rentalController.getMuseumPendingRentals
);

// GET /api/rentals/super-admin/pending - Get rentals pending super admin approval
router.get('/super-admin/pending',
  authorize(ROLES.SUPER_ADMIN),
  rentalController.getSuperAdminPendingRentals
);

// GET /api/rentals/overdue - Get overdue rentals (Admin only)
router.get('/overdue',
  authorize(ROLES.MUSEUM_ADMIN, ROLES.SUPER_ADMIN),
  rentalController.getOverdueRentals
);

// POST /api/rentals - Create new rental request
router.post('/',
  createRentalValidation,
  validateRequest,
  rentalController.createRental
);

// GET /api/rentals/:id - Get specific rental
router.get('/:id',
  rentalIdValidation,
  validateRequest,
  rentalController.getRental
);

// PUT /api/rentals/:id - Update rental (before approval)
router.put('/:id',
  rentalIdValidation,
  updateRentalValidation,
  validateRequest,
  rentalController.updateRental
);

// DELETE /api/rentals/:id - Cancel rental request
router.delete('/:id',
  rentalIdValidation,
  validateRequest,
  rentalController.cancelRental
);

// PATCH /api/rentals/:id/museum-admin/approve - Museum admin approval
router.patch('/:id/museum-admin/approve',
  rentalIdValidation,
  approvalValidation,
  validateRequest,
  authorize(ROLES.MUSEUM_ADMIN, ROLES.SUPER_ADMIN),
  rentalController.approveByMuseumAdmin
);

// PATCH /api/rentals/:id/museum-admin/reject - Museum admin rejection
router.patch('/:id/museum-admin/reject',
  rentalIdValidation,
  [body('comments').notEmpty().withMessage('Rejection reason is required')],
  validateRequest,
  authorize(ROLES.MUSEUM_ADMIN, ROLES.SUPER_ADMIN),
  rentalController.rejectByMuseumAdmin
);

// PATCH /api/rentals/:id/super-admin/approve - Super admin approval
router.patch('/:id/super-admin/approve',
  rentalIdValidation,
  approvalValidation,
  validateRequest,
  authorize(ROLES.SUPER_ADMIN),
  rentalController.approveBySuperAdmin
);

// PATCH /api/rentals/:id/super-admin/reject - Super admin rejection
router.patch('/:id/super-admin/reject',
  rentalIdValidation,
  [body('comments').notEmpty().withMessage('Rejection reason is required')],
  validateRequest,
  authorize(ROLES.SUPER_ADMIN),
  rentalController.rejectBySuperAdmin
);

// PATCH /api/rentals/:id/escalate - Escalate to super admin
router.patch('/:id/escalate',
  rentalIdValidation,
  [body('reason').notEmpty().withMessage('Escalation reason is required')],
  validateRequest,
  authorize(ROLES.MUSEUM_ADMIN),
  rentalController.escalateToSuperAdmin
);

// PATCH /api/rentals/:id/activate - Mark rental as active (after payment)
router.patch('/:id/activate',
  rentalIdValidation,
  validateRequest,
  authorize(ROLES.MUSEUM_ADMIN, ROLES.SUPER_ADMIN),
  rentalController.activateRental
);

// PATCH /api/rentals/:id/complete - Mark rental as completed
router.patch('/:id/complete',
  rentalIdValidation,
  validateRequest,
  authorize(ROLES.MUSEUM_ADMIN, ROLES.SUPER_ADMIN),
  rentalController.completeRental
);

// PATCH /api/rentals/:id/extend - Request rental extension
router.patch('/:id/extend',
  rentalIdValidation,
  [
    body('extensionDays').isInt({ min: 1, max: 30 }).withMessage('Extension days must be between 1 and 30'),
    body('reason').notEmpty().withMessage('Extension reason is required')
  ],
  validateRequest,
  rentalController.requestExtension
);

// POST /api/rentals/:id/messages - Add communication message
router.post('/:id/messages',
  rentalIdValidation,
  [
    body('message').isLength({ min: 1, max: 2000 }).withMessage('Message must be between 1 and 2000 characters'),
    body('type').optional().isIn(['message', 'status_update', 'reminder', 'alert']).withMessage('Valid message type required')
  ],
  validateRequest,
  rentalController.addMessage
);

// GET /api/rentals/:id/messages - Get rental communication history
router.get('/:id/messages',
  rentalIdValidation,
  validateRequest,
  rentalController.getMessages
);

// POST /api/rentals/:id/documents - Upload rental documents
router.post('/:id/documents',
  rentalIdValidation,
  [
    body('type').isIn(['contract', 'insurance', 'receipt', 'condition_report', 'other']).withMessage('Valid document type required'),
    body('name').notEmpty().withMessage('Document name is required'),
    body('url').isURL().withMessage('Valid document URL is required')
  ],
  validateRequest,
  rentalController.uploadDocument
);

// GET /api/rentals/:id/documents - Get rental documents
router.get('/:id/documents',
  rentalIdValidation,
  validateRequest,
  rentalController.getDocuments
);

// POST /api/rentals/:id/condition-report - Add condition report
router.post('/:id/condition-report',
  rentalIdValidation,
  [
    body('type').isIn(['pre_rental', 'post_rental']).withMessage('Valid condition report type required'),
    body('condition').isIn(['excellent', 'good', 'fair', 'poor']).withMessage('Valid condition required'),
    body('notes').optional().isString().withMessage('Notes must be a string')
  ],
  validateRequest,
  authorize(ROLES.MUSEUM_ADMIN, ROLES.SUPER_ADMIN),
  rentalController.addConditionReport
);

// GET /api/rentals/:id/timeline - Get rental timeline
router.get('/:id/timeline',
  rentalIdValidation,
  validateRequest,
  rentalController.getRentalTimeline
);

// PATCH /api/rentals/:id/payment-status - Update payment status
router.patch('/:id/payment-status',
  rentalIdValidation,
  [body('paymentStatus').isIn(['pending', 'partial', 'paid', 'refunded']).withMessage('Valid payment status required')],
  validateRequest,
  authorize(ROLES.MUSEUM_ADMIN, ROLES.SUPER_ADMIN),
  rentalController.updatePaymentStatus
);

// GET /api/rentals/user/:userId - Get user's rentals
router.get('/user/:userId',
  [param('userId').isMongoId().withMessage('Valid user ID is required')],
  validateRequest,
  rentalController.getUserRentals
);

// GET /api/rentals/artifact/:artifactId - Get artifact's rental history
router.get('/artifact/:artifactId',
  [param('artifactId').isMongoId().withMessage('Valid artifact ID is required')],
  validateRequest,
  rentalController.getArtifactRentals
);

// POST /api/rentals/:id/review - Add rental review/rating
router.post('/:id/review',
  rentalIdValidation,
  [
    body('renterRating.score').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('renterRating.review').optional().isLength({ max: 1000 }).withMessage('Review cannot exceed 1000 characters'),
    body('museumRating.score').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('museumRating.review').optional().isLength({ max: 1000 }).withMessage('Review cannot exceed 1000 characters')
  ],
  validateRequest,
  rentalController.addReview
);

module.exports = router;
