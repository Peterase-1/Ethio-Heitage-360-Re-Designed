const express = require('express');
const { body, param, query } = require('express-validator');
const { auth } = require('../middleware/auth');
const {
  getAdminExhibitions,
  getAdminExhibition,
  createExhibition,
  updateExhibition,
  deleteExhibition,
  archiveExhibition,
  publishExhibition,
  addArtifactToExhibition,
  removeArtifactFromExhibition,
  getExhibitionStatistics
} = require('../controllers/adminExhibitions');

const router = express.Router();

// Middleware to ensure only museum admins and super admins can access these routes
const adminOnly = (req, res, next) => {
  if (!['museum_admin', 'super_admin', 'admin'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }
  next();
};

/**
 * @route   GET /api/admin/exhibitions
 * @desc    Get all exhibitions for admin
 * @access  Museum Admin, Super Admin
 */
router.get('/', [
  auth,
  adminOnly,
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('sortBy').optional().isIn(['createdAt', 'updatedAt', 'title', 'schedule.startDate', 'status']).withMessage('Invalid sort field'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc'),
  query('status').optional().isIn(['planning', 'in_preparation', 'active', 'extended', 'closing_soon', 'closed', 'archived']).withMessage('Invalid status'),
  query('type').optional().isIn(['permanent', 'temporary', 'traveling', 'special', 'virtual', 'interactive', 'outdoor', 'educational', 'research', 'community']).withMessage('Invalid type'),
  query('category').optional().isIn(['art', 'history', 'culture', 'archaeology', 'science', 'technology', 'nature', 'photography', 'contemporary', 'traditional', 'religious', 'ethnographic', 'decorative_arts', 'textiles', 'ceramics', 'jewelry', 'manuscripts', 'coins', 'weapons', 'tools']).withMessage('Invalid category'),
  query('search').optional().isLength({ min: 1, max: 100 }).withMessage('Search term must be between 1 and 100 characters'),
  query('museumId').optional().isMongoId().withMessage('Invalid museum ID')
], getAdminExhibitions);

/**
 * @route   GET /api/admin/exhibitions/:id
 * @desc    Get single exhibition for admin
 * @access  Museum Admin, Super Admin
 */
router.get('/:id', [
  auth,
  adminOnly,
  param('id').isMongoId().withMessage('Invalid exhibition ID')
], getAdminExhibition);

/**
 * @route   POST /api/admin/exhibitions
 * @desc    Create new exhibition
 * @access  Museum Admin, Super Admin
 */
router.post('/', [
  auth,
  adminOnly,
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 200 })
    .withMessage('Title must not exceed 200 characters'),
  body('description')
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 3000 })
    .withMessage('Description must not exceed 3000 characters'),
  body('shortDescription')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Short description must not exceed 500 characters'),
  body('type')
    .notEmpty()
    .withMessage('Type is required')
    .isIn(['permanent', 'temporary', 'traveling', 'special', 'virtual', 'interactive', 'outdoor', 'educational', 'research', 'community'])
    .withMessage('Invalid exhibition type'),
  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isIn(['art', 'history', 'culture', 'archaeology', 'science', 'technology', 'nature', 'photography', 'contemporary', 'traditional', 'religious', 'ethnographic', 'decorative_arts', 'textiles', 'ceramics', 'jewelry', 'manuscripts', 'coins', 'weapons', 'tools'])
    .withMessage('Invalid category'),
  body('schedule.startDate')
    .notEmpty()
    .withMessage('Start date is required')
    .isISO8601()
    .withMessage('Invalid start date format'),
  body('schedule.endDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid end date format')
    .custom((value, { req }) => {
      if (req.body.type !== 'permanent' && (!value || new Date(value) <= new Date(req.body.schedule?.startDate))) {
        throw new Error('End date must be after start date for non-permanent exhibitions');
      }
      return true;
    }),
  body('location.gallery')
    .notEmpty()
    .withMessage('Gallery location is required'),
  body('museum')
    .optional()
    .isMongoId()
    .withMessage('Invalid museum ID'),
  body('artifacts')
    .optional()
    .isArray()
    .withMessage('Artifacts must be an array'),
  body('artifacts.*.artifact')
    .optional()
    .isMongoId()
    .withMessage('Invalid artifact ID')
], createExhibition);

/**
 * @route   PUT /api/admin/exhibitions/:id
 * @desc    Update exhibition
 * @access  Museum Admin, Super Admin
 */
router.put('/:id', [
  auth,
  adminOnly,
  param('id').isMongoId().withMessage('Invalid exhibition ID'),
  body('title')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Title must not exceed 200 characters'),
  body('description')
    .optional()
    .isLength({ max: 3000 })
    .withMessage('Description must not exceed 3000 characters'),
  body('shortDescription')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Short description must not exceed 500 characters'),
  body('type')
    .optional()
    .isIn(['permanent', 'temporary', 'traveling', 'special', 'virtual', 'interactive', 'outdoor', 'educational', 'research', 'community'])
    .withMessage('Invalid exhibition type'),
  body('category')
    .optional()
    .isIn(['art', 'history', 'culture', 'archaeology', 'science', 'technology', 'nature', 'photography', 'contemporary', 'traditional', 'religious', 'ethnographic', 'decorative_arts', 'textiles', 'ceramics', 'jewelry', 'manuscripts', 'coins', 'weapons', 'tools'])
    .withMessage('Invalid category'),
  body('schedule.startDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid start date format'),
  body('schedule.endDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid end date format'),
  body('location.gallery')
    .optional()
    .notEmpty()
    .withMessage('Gallery location cannot be empty'),
  body('status')
    .optional()
    .isIn(['planning', 'in_preparation', 'active', 'extended', 'closing_soon', 'closed', 'archived'])
    .withMessage('Invalid status'),
  body('visibility')
    .optional()
    .isIn(['public', 'members_only', 'private', 'preview'])
    .withMessage('Invalid visibility'),
  body('artifacts')
    .optional()
    .isArray()
    .withMessage('Artifacts must be an array'),
  body('artifacts.*.artifact')
    .optional()
    .isMongoId()
    .withMessage('Invalid artifact ID')
], updateExhibition);

/**
 * @route   DELETE /api/admin/exhibitions/:id
 * @desc    Delete exhibition
 * @access  Museum Admin, Super Admin
 */
router.delete('/:id', [
  auth,
  adminOnly,
  param('id').isMongoId().withMessage('Invalid exhibition ID')
], deleteExhibition);

/**
 * @route   PATCH /api/admin/exhibitions/:id/archive
 * @desc    Archive exhibition
 * @access  Museum Admin, Super Admin
 */
router.patch('/:id/archive', [
  auth,
  adminOnly,
  param('id').isMongoId().withMessage('Invalid exhibition ID')
], archiveExhibition);

/**
 * @route   PATCH /api/admin/exhibitions/:id/publish
 * @desc    Publish exhibition
 * @access  Museum Admin, Super Admin
 */
router.patch('/:id/publish', [
  auth,
  adminOnly,
  param('id').isMongoId().withMessage('Invalid exhibition ID')
], publishExhibition);

/**
 * @route   POST /api/admin/exhibitions/:id/artifacts
 * @desc    Add artifact to exhibition
 * @access  Museum Admin, Super Admin
 */
router.post('/:id/artifacts', [
  auth,
  adminOnly,
  param('id').isMongoId().withMessage('Invalid exhibition ID'),
  body('artifactId')
    .notEmpty()
    .withMessage('Artifact ID is required')
    .isMongoId()
    .withMessage('Invalid artifact ID'),
  body('displayOrder')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Display order must be a non-negative integer'),
  body('displayNote')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Display note must not exceed 500 characters'),
  body('isHighlight')
    .optional()
    .isBoolean()
    .withMessage('isHighlight must be a boolean'),
  body('section')
    .optional()
    .isString()
    .withMessage('Section must be a string')
], addArtifactToExhibition);

/**
 * @route   DELETE /api/admin/exhibitions/:id/artifacts/:artifactId
 * @desc    Remove artifact from exhibition
 * @access  Museum Admin, Super Admin
 */
router.delete('/:id/artifacts/:artifactId', [
  auth,
  adminOnly,
  param('id').isMongoId().withMessage('Invalid exhibition ID'),
  param('artifactId').isMongoId().withMessage('Invalid artifact ID')
], removeArtifactFromExhibition);

/**
 * @route   GET /api/admin/exhibitions/:id/statistics
 * @desc    Get exhibition statistics
 * @access  Museum Admin, Super Admin
 */
router.get('/:id/statistics', [
  auth,
  adminOnly,
  param('id').isMongoId().withMessage('Invalid exhibition ID')
], getExhibitionStatistics);

module.exports = router;
