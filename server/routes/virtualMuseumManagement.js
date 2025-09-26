const express = require('express');
const router = express.Router();
const {
  getMuseumSubmissions,
  getSubmission,
  createSubmission,
  updateSubmission,
  deleteSubmission,
  getMuseumStats,
  getAvailableArtifacts,
  submitForReview,
  getPublicSubmissions,
  viewPublicSubmission
} = require('../controllers/virtualMuseumManagement');

// Import middleware
const { auth, authorize } = require('../middleware/auth');

/**
 * @desc    Get museum virtual museum submissions
 * @route   GET /api/virtual-museum/submissions
 * @access  Private (museumAdmin, staff)
 */
router.get('/submissions',
  auth,
  authorize(['museumAdmin', 'staff']),
  getMuseumSubmissions
);

/**
 * @desc    Get single virtual museum submission
 * @route   GET /api/virtual-museum/submissions/:id
 * @access  Private (museumAdmin, staff, superAdmin)
 */
router.get('/submissions/:id',
  auth,
  authorize(['museumAdmin', 'staff', 'superAdmin']),
  getSubmission
);

/**
 * @desc    Create new virtual museum submission
 * @route   POST /api/virtual-museum/submissions
 * @access  Private (museumAdmin, staff)
 */
router.post('/submissions',
  auth,
  authorize(['museumAdmin', 'staff']),
  createSubmission
);

/**
 * @desc    Update virtual museum submission
 * @route   PUT /api/virtual-museum/submissions/:id
 * @access  Private (museumAdmin, staff)
 */
router.put('/submissions/:id',
  auth,
  authorize(['museumAdmin', 'staff']),
  updateSubmission
);

/**
 * @desc    Delete virtual museum submission
 * @route   DELETE /api/virtual-museum/submissions/:id
 * @access  Private (museumAdmin, staff)
 */
router.delete('/submissions/:id',
  auth,
  authorize(['museumAdmin', 'staff']),
  deleteSubmission
);

/**
 * @desc    Get museum virtual museum statistics
 * @route   GET /api/virtual-museum/stats
 * @access  Private (museumAdmin, staff)
 */
router.get('/stats',
  auth,
  authorize(['museumAdmin', 'staff']),
  getMuseumStats
);

/**
 * @desc    Get available artifacts for virtual museum
 * @route   GET /api/virtual-museum/artifacts
 * @access  Private (museumAdmin, staff)
 */
router.get('/artifacts',
  auth,
  authorize(['museumAdmin', 'staff']),
  getAvailableArtifacts
);

/**
 * @desc    Submit submission for review
 * @route   POST /api/virtual-museum/submissions/:id/submit
 * @access  Private (museumAdmin, staff)
 */
router.post('/submissions/:id/submit',
  auth,
  authorize(['museumAdmin', 'staff']),
  submitForReview
);

/**
 * @desc    Get public virtual museum submissions
 * @route   GET /api/virtual-museum/public
 * @access  Public
 */
router.get('/public',
  getPublicSubmissions
);

/**
 * @desc    View public submission details
 * @route   GET /api/virtual-museum/public/:id
 * @access  Public
 */
router.get('/public/:id',
  viewPublicSubmission
);

module.exports = router;
