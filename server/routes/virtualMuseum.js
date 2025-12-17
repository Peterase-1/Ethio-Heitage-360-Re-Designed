const express = require('express');
const router = express.Router();
const virtualMuseumController = require('../controllers/virtualMuseumController');
const { auth } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleHierarchy');

// GET /api/virtual-museum/active
router.get('/active', virtualMuseumController.getActiveVirtualArtifacts);

// GET /api/virtual-museum/submissions
router.get('/submissions', auth, virtualMuseumController.getSubmissions);

// GET /api/virtual-museum/submissions/rental-artifacts
router.get('/submissions/rental-artifacts', auth, virtualMuseumController.getRentalArtifacts);

// POST /api/virtual-museum/submissions
router.post('/submissions', auth, virtualMuseumController.createSubmission);

// PUT /api/virtual-museum/submissions/:id/approve
router.put('/submissions/:id/approve', auth, requireRole('superAdmin'), virtualMuseumController.approveSubmission);

// GET /api/virtual-museum/stats
router.get('/stats', auth, virtualMuseumController.getStats);

// DELETE /api/virtual-museum/submissions/:id
router.delete('/submissions/:id', auth, virtualMuseumController.deleteSubmission);

module.exports = router;