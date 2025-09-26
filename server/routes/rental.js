const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { requireSuperAdmin } = require('../middleware/roleHierarchy');
const rentalController = require('../controllers/rentalController');

// Apply authentication to all routes
router.use(auth);

// ======================
// RENTAL REQUEST ROUTES
// ======================

/**
 * @route   POST /api/rental/requests
 * @desc    Create a new rental request
 * @access  Authenticated users (museum admin or super admin)
 * @body    requestType, artifactId, museumId, duration, startDate, endDate, rentalFee, currency, description, specialRequirements
 */
router.post('/requests', rentalController.createRentalRequest);

/**
 * @route   GET /api/rental/requests
 * @desc    Get all rental requests with filtering and pagination
 * @access  Authenticated users
 * @params  page, limit, status, requestType, museumId, userId, sortBy, sortOrder
 */
router.get('/requests', rentalController.getAllRentalRequests);

/**
 * @route   GET /api/rental/requests/:id
 * @desc    Get a specific rental request
 * @access  Authenticated users
 */
router.get('/requests/:id', rentalController.getRentalRequest);

/**
 * @route   PUT /api/rental/requests/:id/status
 * @desc    Approve/Reject a rental request
 * @access  Museum admin or Super admin
 * @body    status, comments
 */
router.put('/requests/:id/status', rentalController.updateRentalRequestStatus);

/**
 * @route   POST /api/rental/requests/:id/messages
 * @desc    Add a message to rental request
 * @access  Authenticated users
 * @body    message
 */
router.post('/requests/:id/messages', rentalController.addRentalRequestMessage);

// ======================
// PAYMENT ROUTES
// ======================

/**
 * @route   PUT /api/rental/requests/:id/payment
 * @desc    Update payment status
 * @access  Super admin or Museum admin
 * @body    paymentStatus, transactionId, paymentMethod
 */
router.put('/requests/:id/payment', rentalController.updatePaymentStatus);

// ======================
// 3D INTEGRATION ROUTES
// ======================

/**
 * @route   PUT /api/rental/requests/:id/3d-integration
 * @desc    Update 3D integration status
 * @access  Super admin
 * @body    status, modelUrl, previewUrl
 */
router.put('/requests/:id/3d-integration', requireSuperAdmin, rentalController.update3DIntegrationStatus);

// ======================
// VIRTUAL MUSEUM INTEGRATION ROUTES
// ======================

/**
 * @route   PUT /api/rental/requests/:id/virtual-museum
 * @desc    Update virtual museum integration status
 * @access  Super admin
 * @body    status
 */
router.put('/requests/:id/virtual-museum', requireSuperAdmin, rentalController.updateVirtualMuseumIntegration);

// ======================
// STATISTICS ROUTES
// ======================

/**
 * @route   GET /api/rental/statistics
 * @desc    Get rental system statistics
 * @access  Super admin or Museum admin
 * @params  timeRange
 */
router.get('/statistics', rentalController.getRentalStatistics);

/**
 * @route   GET /api/rental/museum-stats
 * @desc    Get museum-specific rental statistics
 * @access  Museum admin
 */
router.get('/museum-stats', rentalController.getMuseumRentalStats);

/**
 * @route   GET /api/rental/artifacts
 * @desc    Get artifacts for museum rental system
 * @access  Museum admin
 */
router.get('/artifacts', rentalController.getMuseumArtifacts);

/**
 * @route   GET /api/rental/artifacts/:museumId
 * @desc    Get artifacts for specific museum
 * @access  Museum admin
 */
router.get('/artifacts/:museumId', rentalController.getMuseumArtifacts);

module.exports = router;
