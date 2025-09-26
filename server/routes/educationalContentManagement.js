const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');

// Import controllers
const {
  getAllAchievementsAdmin,
  createAchievement,
  updateAchievement,
  deleteAchievement,
  getAllCertificatesAdmin,
  revokeCertificate,
  regenerateCertificate,
  getCategoryManagement
} = require('../controllers/educationalContentManagement');

// Import course management controller
const {
  createCourse,
  updateCourse,
  deleteCourse,
  getAllCoursesAdmin,
  createLesson,
  updateLesson,
  deleteLesson,
  getAllLessonsAdmin,
  getLessonAdmin,
  bulkUpdateLessons,
  reorderLessons,
  getAdminStats
} = require('../controllers/courseManagement');

// Import enrollment management controller
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
      message: 'Access denied. Admin role required.',
      userRole: req.user?.role || 'no-role'
    });
  }
  next();
};

// ===========================================
// DASHBOARD STATISTICS
// ===========================================
router.get('/admin/stats', auth, requireAdmin, getAdminStats);

// ===========================================
// COURSE MANAGEMENT ROUTES (Admin only)
// ===========================================
router.post('/admin/courses', auth, requireAdmin, createCourse);
router.get('/admin/courses', auth, requireAdmin, getAllCoursesAdmin);
router.put('/admin/courses/:courseId', auth, requireAdmin, updateCourse);
router.delete('/admin/courses/:courseId', auth, requireAdmin, deleteCourse);

// ===========================================
// LESSON MANAGEMENT ROUTES (Admin only)
// ===========================================
router.post('/admin/courses/:courseId/lessons', auth, requireAdmin, createLesson);
router.get('/admin/lessons', auth, requireAdmin, getAllLessonsAdmin);
router.get('/admin/lessons/:lessonId', auth, requireAdmin, getLessonAdmin);
router.put('/admin/lessons/:lessonId', auth, requireAdmin, updateLesson);
router.delete('/admin/lessons/:lessonId', auth, requireAdmin, deleteLesson);
router.patch('/admin/lessons/bulk', auth, requireAdmin, bulkUpdateLessons);
router.patch('/admin/courses/:courseId/lessons/reorder', auth, requireAdmin, reorderLessons);

// ===========================================
// ENROLLMENT MANAGEMENT ROUTES (Admin only)
// ===========================================
router.get('/admin/enrollments', auth, requireAdmin, getAllEnrollmentsAdmin);
router.get('/admin/enrollments/analytics', auth, requireAdmin, getEnrollmentAnalytics);
router.patch('/admin/enrollments/bulk', auth, requireAdmin, bulkEnrollmentOperations);
router.get('/admin/enrollments/:userId/:courseId', auth, requireAdmin, getEnrollmentDetails);

// ===========================================
// ACHIEVEMENT MANAGEMENT ROUTES (Admin only)
// ===========================================
router.get('/admin/achievements', auth, requireAdmin, getAllAchievementsAdmin);
router.post('/admin/achievements', auth, requireAdmin, createAchievement);
router.put('/admin/achievements/:achievementId', auth, requireAdmin, updateAchievement);
router.delete('/admin/achievements/:achievementId', auth, requireAdmin, deleteAchievement);

// ===========================================
// CERTIFICATE MANAGEMENT ROUTES (Admin only)
// ===========================================
router.get('/admin/certificates', auth, requireAdmin, getAllCertificatesAdmin);
router.patch('/admin/certificates/:certificateId/revoke', auth, requireAdmin, revokeCertificate);
router.patch('/admin/certificates/:certificateId/regenerate', auth, requireAdmin, regenerateCertificate);

// ===========================================
// CATEGORY MANAGEMENT ROUTES (Admin only)
// ===========================================
router.get('/admin/categories', auth, requireAdmin, getCategoryManagement);

module.exports = router;
