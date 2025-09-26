const express = require('express');
const router = express.Router();
const {
  createArtifact,
  getArtifact,
  updateArtifact,
  deleteArtifact,
  listArtifacts,
  searchArtifacts,
  uploadArtifactImages,
  upload3DModel,
  deleteArtifactMedia,
  updateArtifactStatus,
  toggleFeaturedStatus,
  getArtifactsByMuseum
} = require('../controllers/artifacts');

// Middleware imports
const { auth: authenticate, optionalAuth, authorize, requireMuseumAccess: checkMuseumAccess } = require('../middleware/auth');
const {
  validateArtifact,
  validateArtifactUpdate,
  validateObjectId,
  validatePagination,
  validateSearchQuery
} = require('../middleware/validation');

// File upload configuration
const { uploadArtifactImages: multerImageUpload, upload3DModels: multer3DUpload } = require('../config/fileUpload');

/**
 * @desc    Create a new artifact
 * @route   POST /api/artifacts
 * @access  Private (superAdmin, museumAdmin, staff with permissions)
 */
router.post('/',
  optionalAuth,
  authorize('superAdmin', 'museumAdmin', 'staff'),
  validateArtifact,
  createArtifact
);

/**
 * @desc    Get all artifacts with pagination, search, and filtering
 * @route   GET /api/artifacts
 * @access  Public (with optional authentication for enhanced access)
 */
router.get('/',
  optionalAuth,
  validatePagination,
  listArtifacts
);

/**
 * @desc    Search artifacts with advanced filters
 * @route   GET /api/artifacts/search
 * @access  Public (with optional authentication for enhanced access)
 */
router.get('/search',
  optionalAuth,
  validateSearchQuery,
  searchArtifacts
);

/**
 * @desc    Get artifacts by museum
 * @route   GET /api/artifacts/museum/:museumId
 * @access  Public
 */
router.get('/museum/:museumId',
  validateObjectId('museumId', 'Museum ID'),
  validatePagination,
  getArtifactsByMuseum
);

/**
 * @desc    Get single artifact by ID
 * @route   GET /api/artifacts/:id
 * @access  Public
 */
router.get('/:id',
  validateObjectId('id', 'Artifact ID'),
  getArtifact
);

/**
 * @desc    Update artifact
 * @route   PUT /api/artifacts/:id
 * @access  Private (superAdmin, museumAdmin for own museum, staff with permissions)
 */
router.put('/:id',
  authenticate,
  validateObjectId('id', 'Artifact ID'),
  authorize('superAdmin', 'museumAdmin', 'staff'),
  validateArtifactUpdate,
  updateArtifact
);

/**
 * @desc    Delete artifact (soft delete)
 * @route   DELETE /api/artifacts/:id
 * @access  Private (superAdmin, museumAdmin for own museum)
 */
router.delete('/:id',
  authenticate,
  validateObjectId('id', 'Artifact ID'),
  authorize('superAdmin', 'museumAdmin'),
  deleteArtifact
);

/**
 * @desc    Upload artifact images
 * @route   POST /api/artifacts/:id/images
 * @access  Private (superAdmin, museumAdmin for own museum, staff with permissions)
 */
router.post('/:id/images',
  authenticate,
  validateObjectId('id', 'Artifact ID'),
  authorize('superAdmin', 'museumAdmin', 'staff'),
  multerImageUpload.array('images', 10), // Allow up to 10 images
  uploadArtifactImages
);

/**
 * @desc    Update artifact images (same as upload - adds to existing)
 * @route   PUT /api/artifacts/:id/images
 * @access  Private (superAdmin, museumAdmin for own museum, staff with permissions)
 */
router.put('/:id/images',
  authenticate,
  validateObjectId('id', 'Artifact ID'),
  authorize('superAdmin', 'museumAdmin', 'staff'),
  multerImageUpload.array('images', 10), // Allow up to 10 images
  uploadArtifactImages
);

/**
 * @desc    Upload 3D model for artifact
 * @route   POST /api/artifacts/:id/model
 * @access  Private (superAdmin, museumAdmin for own museum, staff with permissions)
 */
router.post('/:id/model',
  optionalAuth,
  validateObjectId('id', 'Artifact ID'),
  authorize('superAdmin', 'museumAdmin', 'staff'),
  multer3DUpload.single('model'), // Single 3D model file
  upload3DModel
);

/**
 * @desc    Delete artifact media (image or 3D model)
 * @route   DELETE /api/artifacts/:id/media/:mediaId
 * @access  Private (superAdmin, museumAdmin for own museum, staff with permissions)
 */
router.delete('/:id/media/:mediaId',
  optionalAuth,
  validateObjectId('id', 'Artifact ID'),
  validateObjectId('mediaId', 'Media ID'),
  authorize('superAdmin', 'museumAdmin', 'staff'),
  deleteArtifactMedia
);

/**
 * @desc    Update artifact status
 * @route   PUT /api/artifacts/:id/status
 * @access  Private (superAdmin, museumAdmin for own museum, staff with permissions)
 */
router.put('/:id/status',
  authenticate,
  validateObjectId('id', 'Artifact ID'),
  authorize('superAdmin', 'museumAdmin', 'staff'),
  updateArtifactStatus
);

/**
 * @desc    Toggle featured status
 * @route   PUT /api/artifacts/:id/featured
 * @access  Private (superAdmin, museumAdmin for own museum, staff with permissions)
 */
router.put('/:id/featured',
  authenticate,
  validateObjectId('id', 'Artifact ID'),
  authorize('superAdmin', 'museumAdmin', 'staff'),
  toggleFeaturedStatus
);

module.exports = router;
