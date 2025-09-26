const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { requireMuseumAdminOrHigher } = require('../middleware/roleHierarchy');
const { body, param, query } = require('express-validator');
const staffController = require('../controllers/staff');

// Apply authentication and museum admin (or higher) check to all routes
router.use(auth);
router.use(requireMuseumAdminOrHigher);

// ======================
// STAFF MANAGEMENT ROUTES
// ======================

/**
 * @route   GET /api/staff
 * @desc    Get all staff members for a museum with filtering and pagination
 * @access  Museum Admin or Super Admin
 * @params  page, limit, department, role, status, search, sortBy, sortOrder
 */
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('department').optional().isIn([
    'Collections', 'Education', 'Conservation', 'Digital', 'Security',
    'Administration', 'Marketing', 'Research', 'Operations'
  ]).withMessage('Invalid department'),
  query('role').optional().isString().trim().withMessage('Role must be a string'),
  query('status').optional().isIn(['active', 'on_leave', 'inactive', 'terminated']).withMessage('Invalid status'),
  query('search').optional().isString().trim().withMessage('Search must be a string'),
  query('sortBy').optional().isIn(['name', 'email', 'role', 'department', 'hireDate', 'status']).withMessage('Invalid sort field'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc')
], staffController.getStaff);

/**
 * @route   GET /api/staff/stats
 * @desc    Get staff statistics and analytics
 * @access  Museum Admin or Super Admin
 */
router.get('/stats', staffController.getStaffStats);

/**
 * @route   GET /api/staff/roles-permissions
 * @desc    Get available roles, permissions, and departments
 * @access  Museum Admin or Super Admin
 */
router.get('/roles-permissions', staffController.getRolesAndPermissions);

/**
 * @route   GET /api/staff/:id
 * @desc    Get single staff member by ID
 * @access  Museum Admin or Super Admin
 */
router.get('/:id', [
  param('id').isMongoId().withMessage('Invalid staff ID')
], staffController.getStaffById);

/**
 * @route   POST /api/staff
 * @desc    Create new staff member
 * @access  Museum Admin or Super Admin
 */
router.post('/', [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('phone')
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),
  body('role')
    .isIn([
      'Senior Curator', 'Education Coordinator', 'Conservation Specialist',
      'Digital Archivist', 'Security Officer', 'Tour Guide', 'Registrar',
      'Collections Manager', 'Exhibitions Coordinator', 'Marketing Coordinator',
      'Administrative Assistant', 'Other'
    ])
    .withMessage('Invalid role'),
  body('department')
    .isIn([
      'Collections', 'Education', 'Conservation', 'Digital', 'Security',
      'Administration', 'Marketing', 'Research', 'Operations'
    ])
    .withMessage('Invalid department'),
  body('hireDate')
    .isISO8601()
    .withMessage('Please provide a valid hire date'),
  body('userId')
    .optional()
    .isMongoId()
    .withMessage('Invalid user ID'),
  body('permissions')
    .optional()
    .isArray()
    .withMessage('Permissions must be an array'),
  body('permissions.*')
    .optional()
    .isString()
    .withMessage('Each permission must be a string'),
  body('schedule')
    .optional()
    .isObject()
    .withMessage('Schedule must be an object'),
  body('emergencyContact')
    .optional()
    .isObject()
    .withMessage('Emergency contact must be an object'),
  body('personalInfo')
    .optional()
    .isObject()
    .withMessage('Personal info must be an object'),
  body('workInfo')
    .optional()
    .isObject()
    .withMessage('Work info must be an object'),
  body('profile')
    .optional()
    .isObject()
    .withMessage('Profile must be an object')
], staffController.createStaff);

/**
 * @route   PUT /api/staff/:id
 * @desc    Update staff member
 * @access  Museum Admin or Super Admin
 */
router.put('/:id', [
  param('id').isMongoId().withMessage('Invalid staff ID'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('phone')
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),
  body('role')
    .optional()
    .isIn([
      'Senior Curator', 'Education Coordinator', 'Conservation Specialist',
      'Digital Archivist', 'Security Officer', 'Tour Guide', 'Registrar',
      'Collections Manager', 'Exhibitions Coordinator', 'Marketing Coordinator',
      'Administrative Assistant', 'Other'
    ])
    .withMessage('Invalid role'),
  body('department')
    .optional()
    .isIn([
      'Collections', 'Education', 'Conservation', 'Digital', 'Security',
      'Administration', 'Marketing', 'Research', 'Operations'
    ])
    .withMessage('Invalid department'),
  body('status')
    .optional()
    .isIn(['active', 'on_leave', 'inactive', 'terminated'])
    .withMessage('Invalid status'),
  body('hireDate')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid hire date'),
  body('terminationDate')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid termination date'),
  body('permissions')
    .optional()
    .isArray()
    .withMessage('Permissions must be an array'),
  body('permissions.*')
    .optional()
    .isString()
    .withMessage('Each permission must be a string'),
  body('schedule')
    .optional()
    .isObject()
    .withMessage('Schedule must be an object'),
  body('emergencyContact')
    .optional()
    .isObject()
    .withMessage('Emergency contact must be an object'),
  body('personalInfo')
    .optional()
    .isObject()
    .withMessage('Personal info must be an object'),
  body('workInfo')
    .optional()
    .isObject()
    .withMessage('Work info must be an object'),
  body('profile')
    .optional()
    .isObject()
    .withMessage('Profile must be an object')
], staffController.updateStaff);

/**
 * @route   DELETE /api/staff/:id
 * @desc    Delete staff member (soft delete)
 * @access  Museum Admin or Super Admin
 */
router.delete('/:id', [
  param('id').isMongoId().withMessage('Invalid staff ID')
], staffController.deleteStaff);

/**
 * @route   PUT /api/staff/:id/permissions
 * @desc    Update staff permissions
 * @access  Museum Admin or Super Admin
 */
router.put('/:id/permissions', [
  param('id').isMongoId().withMessage('Invalid staff ID'),
  body('permissions')
    .isArray()
    .withMessage('Permissions must be an array'),
  body('permissions.*')
    .isString()
    .withMessage('Each permission must be a string')
], staffController.updateStaffPermissions);

/**
 * @route   PUT /api/staff/:id/schedule
 * @desc    Update staff schedule
 * @access  Museum Admin or Super Admin
 */
router.put('/:id/schedule', [
  param('id').isMongoId().withMessage('Invalid staff ID'),
  body('schedule')
    .isObject()
    .withMessage('Schedule must be an object'),
  body('schedule.monday')
    .optional()
    .isString()
    .withMessage('Monday schedule must be a string'),
  body('schedule.tuesday')
    .optional()
    .isString()
    .withMessage('Tuesday schedule must be a string'),
  body('schedule.wednesday')
    .optional()
    .isString()
    .withMessage('Wednesday schedule must be a string'),
  body('schedule.thursday')
    .optional()
    .isString()
    .withMessage('Thursday schedule must be a string'),
  body('schedule.friday')
    .optional()
    .isString()
    .withMessage('Friday schedule must be a string'),
  body('schedule.saturday')
    .optional()
    .isString()
    .withMessage('Saturday schedule must be a string'),
  body('schedule.sunday')
    .optional()
    .isString()
    .withMessage('Sunday schedule must be a string')
], staffController.updateStaffSchedule);

/**
 * @route   GET /api/staff/:id/performance
 * @desc    Get staff performance metrics
 * @access  Museum Admin or Super Admin
 */
router.get('/:id/performance', [
  param('id').isMongoId().withMessage('Invalid staff ID')
], staffController.getStaffPerformance);

/**
 * @route   POST /api/staff/:id/attendance
 * @desc    Record staff attendance
 * @access  Museum Admin or Super Admin
 */
router.post('/:id/attendance', [
  param('id').isMongoId().withMessage('Invalid staff ID'),
  body('date')
    .isISO8601()
    .withMessage('Please provide a valid date'),
  body('status')
    .isIn(['present', 'absent', 'late', 'half_day', 'sick_leave', 'vacation'])
    .withMessage('Invalid attendance status'),
  body('checkInTime')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid check-in time'),
  body('checkOutTime')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid check-out time'),
  body('notes')
    .optional()
    .isString()
    .trim()
    .withMessage('Notes must be a string')
], staffController.recordAttendance);

/**
 * @route   POST /api/staff/:id/leave
 * @desc    Submit leave request
 * @access  Museum Admin or Super Admin
 */
router.post('/:id/leave', [
  param('id').isMongoId().withMessage('Invalid staff ID'),
  body('startDate')
    .isISO8601()
    .withMessage('Please provide a valid start date'),
  body('endDate')
    .isISO8601()
    .withMessage('Please provide a valid end date'),
  body('type')
    .isIn(['sick_leave', 'vacation', 'personal', 'emergency', 'maternity', 'paternity', 'other'])
    .withMessage('Invalid leave type'),
  body('reason')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Reason must be between 10 and 500 characters'),
  body('emergencyContact')
    .optional()
    .isObject()
    .withMessage('Emergency contact must be an object')
], staffController.submitLeaveRequest);

/**
 * @route   PUT /api/staff/leave/:leaveId/approve
 * @desc    Approve/reject leave request
 * @access  Museum Admin or Super Admin
 */
router.put('/leave/:leaveId/approve', [
  param('leaveId').isMongoId().withMessage('Invalid leave request ID'),
  body('status')
    .isIn(['approved', 'rejected'])
    .withMessage('Status must be approved or rejected'),
  body('comments')
    .optional()
    .isString()
    .trim()
    .withMessage('Comments must be a string')
], staffController.approveLeaveRequest);

module.exports = router;
