const express = require('express');
const {
  auth,
  authorize,
  requirePermission,
  requireAdminOrSelf,
  ROLES,
  PERMISSIONS
} = require('../middleware/auth');
const userController = require('../controllers/usersController');
const { validateRequest } = require('../middleware/validation');
const { body, param, query } = require('express-validator');

const router = express.Router();

// Validation rules
const createUserValidation = [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('role').isIn(['superAdmin', 'museumAdmin', 'user']).withMessage('Valid role is required')
];

const updateUserValidation = [
  body('firstName').optional().notEmpty().withMessage('First name cannot be empty'),
  body('lastName').optional().notEmpty().withMessage('Last name cannot be empty'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('role').optional().isIn(['superAdmin', 'museumAdmin', 'user']).withMessage('Valid role is required')
];

const userIdValidation = [
  param('id').isMongoId().withMessage('Valid user ID is required')
];

// Apply authentication to all routes
router.use(auth);

// GET /api/users - Get all users (Admin only)
router.get('/',
  requirePermission(PERMISSIONS.MANAGE_ALL_USERS),
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('role').optional().isIn(['superAdmin', 'museumAdmin', 'user']).withMessage('Valid role filter required'),
    query('status').optional().isIn(['active', 'inactive']).withMessage('Valid status filter required'),
    query('search').optional().isLength({ min: 1 }).withMessage('Search term cannot be empty')
  ],
  validateRequest,
  userController.getAllUsers
);

// GET /api/users/stats - Get user statistics (Super Admin only)
router.get('/stats',
  authorize(ROLES.SUPER_ADMIN),
  userController.getUserStats
);

// GET /api/users/museum/:museumId - Get users by museum (Museum Admin can see own museum)
router.get('/museum/:museumId',
  [param('museumId').isMongoId().withMessage('Valid museum ID is required')],
  validateRequest,
  userController.getUsersByMuseum
);

// POST /api/users - Create new user (Admin only)
router.post('/',
  requirePermission(PERMISSIONS.MANAGE_ALL_USERS),
  createUserValidation,
  validateRequest,
  userController.createUser
);

// GET /api/users/:id - Get specific user (Admin or self)
router.get('/:id',
  userIdValidation,
  validateRequest,
  requireAdminOrSelf,
  userController.getUser
);

// PUT /api/users/:id - Update user (Admin or self with restrictions)
router.put('/:id',
  userIdValidation,
  updateUserValidation,
  validateRequest,
  userController.updateUser
);

// DELETE /api/users/:id - Delete user (Super Admin only)
router.delete('/:id',
  userIdValidation,
  validateRequest,
  authorize(ROLES.SUPER_ADMIN),
  userController.deleteUser
);

// PATCH /api/users/:id/activate - Activate user (Admin only)
router.patch('/:id/activate',
  userIdValidation,
  validateRequest,
  requirePermission(PERMISSIONS.MANAGE_ALL_USERS),
  userController.activateUser
);

// PATCH /api/users/:id/deactivate - Deactivate user (Admin only)
router.patch('/:id/deactivate',
  userIdValidation,
  validateRequest,
  requirePermission(PERMISSIONS.MANAGE_ALL_USERS),
  userController.deactivateUser
);

// PATCH /api/users/:id/role - Change user role (Super Admin only)
router.patch('/:id/role',
  userIdValidation,
  [body('role').isIn(['superAdmin', 'museumAdmin', 'user']).withMessage('Valid role is required')],
  validateRequest,
  authorize(ROLES.SUPER_ADMIN),
  userController.changeUserRole
);

// PATCH /api/users/:id/permissions - Update user permissions (Super Admin only)
router.patch('/:id/permissions',
  userIdValidation,
  [body('permissions').isArray().withMessage('Permissions must be an array')],
  validateRequest,
  authorize(ROLES.SUPER_ADMIN),
  userController.updateUserPermissions
);

// PATCH /api/users/:id/museum - Assign user to museum (Super Admin only)
router.patch('/:id/museum',
  userIdValidation,
  [body('museumId').isMongoId().withMessage('Valid museum ID is required')],
  validateRequest,
  authorize(ROLES.SUPER_ADMIN),
  userController.assignUserToMuseum
);

// GET /api/users/:id/activity - Get user activity log (Admin or self)
router.get('/:id/activity',
  userIdValidation,
  validateRequest,
  requireAdminOrSelf,
  userController.getUserActivity
);

// GET /api/users/:id/bookmarks - Get user bookmarks (Admin or self)
router.get('/:id/bookmarks',
  userIdValidation,
  validateRequest,
  requireAdminOrSelf,
  userController.getUserBookmarks
);

// POST /api/users/:id/bookmarks - Add bookmark (Self only)
router.post('/:id/bookmarks',
  userIdValidation,
  [body('artifactId').isMongoId().withMessage('Valid artifact ID is required')],
  validateRequest,
  userController.addBookmark
);

// DELETE /api/users/:id/bookmarks/:artifactId - Remove bookmark (Self only)
router.delete('/:id/bookmarks/:artifactId',
  userIdValidation,
  [param('artifactId').isMongoId().withMessage('Valid artifact ID is required')],
  validateRequest,
  userController.removeBookmark
);

// GET /api/users/:id/favorites - Get user favorite museums (Admin or self)
router.get('/:id/favorites',
  userIdValidation,
  validateRequest,
  requireAdminOrSelf,
  userController.getFavoriteMuseums
);

// POST /api/users/:id/favorites - Add favorite museum (Self only)
router.post('/:id/favorites',
  userIdValidation,
  [body('museumId').isMongoId().withMessage('Valid museum ID is required')],
  validateRequest,
  userController.addFavoriteMuseum
);

// DELETE /api/users/:id/favorites/:museumId - Remove favorite museum (Self only)
router.delete('/:id/favorites/:museumId',
  userIdValidation,
  [param('museumId').isMongoId().withMessage('Valid museum ID is required')],
  validateRequest,
  userController.removeFavoriteMuseum
);

// PATCH /api/users/:id/preferences - Update user preferences (Self only)
router.patch('/:id/preferences',
  userIdValidation,
  [
    body('language').optional().isIn(['en', 'am', 'om', 'ti']).withMessage('Valid language is required'),
    body('notifications').optional().isObject().withMessage('Notifications must be an object'),
    body('privacy').optional().isObject().withMessage('Privacy settings must be an object'),
    body('dashboard').optional().isObject().withMessage('Dashboard settings must be an object')
  ],
  validateRequest,
  userController.updateUserPreferences
);

module.exports = router;
