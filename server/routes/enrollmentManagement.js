const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  getAllEnrollmentsAdmin,
  getEnrollmentAnalytics,
  bulkEnrollmentOperations,
  getEnrollmentDetails
} = require('../controllers/enrollmentManagement');

// Middleware to check admin role
const requireAdmin = (req, res, next) => {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'superAdmin')) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin role required.'
    });
  }
  next();
};

// Enrollment management routes (Admin only)
router.get('/admin/enrollments', auth, requireAdmin, getAllEnrollmentsAdmin);
router.get('/admin/enrollments/analytics', auth, requireAdmin, getEnrollmentAnalytics);
router.patch('/admin/enrollments/bulk', auth, requireAdmin, bulkEnrollmentOperations);
router.get('/admin/enrollments/:userId/:courseId', auth, requireAdmin, getEnrollmentDetails);

module.exports = router;
