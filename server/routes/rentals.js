const express = require('express');
const { auth } = require('../middleware/auth');
const rentalController = require('../controllers/rentalController');
const { validateRequest } = require('../middleware/validation');
const { body, param, query } = require('express-validator');

const router = express.Router();

// Apply authentication to all routes
router.use(auth);

// GET /api/rentals - Get all rental requests
router.get('/', rentalController.getAllRentalRequests);

// GET /api/rentals/stats - Get rental statistics
router.get('/stats', rentalController.getRentalStatistics);

// POST /api/rentals - Create new rental request
router.post('/', rentalController.createRentalRequest);

// GET /api/rentals/museum-stats - Get museum-specific rental statistics
router.get('/museum-stats', rentalController.getMuseumRentalStats);

// GET /api/rentals/artifacts - Get artifacts for museum rental system
router.get('/artifacts', rentalController.getMuseumArtifacts);

// GET /api/rentals/artifacts/:museumId - Get artifacts for specific museum
router.get('/artifacts/:museumId', rentalController.getMuseumArtifacts);

// GET /api/rentals/:id - Get specific rental request
router.get('/:id', rentalController.getRentalRequest);

// PATCH /api/rentals/:id/status - Update rental request status (approve/reject)
router.patch('/:id/status', rentalController.updateRentalRequestStatus);

// POST /api/rentals/:id/messages - Add message to rental request
router.post('/:id/messages', rentalController.addRentalRequestMessage);

// PATCH /api/rentals/:id/payment-status - Update payment status
router.patch('/:id/payment-status', rentalController.updatePaymentStatus);

// PATCH /api/rentals/:id/3d-integration - Update 3D integration status
router.patch('/:id/3d-integration', rentalController.update3DIntegrationStatus);

// PATCH /api/rentals/:id/virtual-museum - Update virtual museum integration
router.patch('/:id/virtual-museum', rentalController.updateVirtualMuseumIntegration);

module.exports = router;
