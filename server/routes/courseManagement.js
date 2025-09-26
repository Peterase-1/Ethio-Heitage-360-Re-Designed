const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
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

// Admin dashboard statistics
router.get('/admin/stats', auth, requireAdmin, getAdminStats);

// Course management routes (Admin only)
router.post('/admin/courses', auth, requireAdmin, createCourse);
router.get('/admin/courses', auth, requireAdmin, getAllCoursesAdmin);
router.put('/admin/courses/:courseId', auth, requireAdmin, updateCourse);
router.delete('/admin/courses/:courseId', auth, requireAdmin, deleteCourse);

// Lesson management routes (Admin only)
router.post('/admin/courses/:courseId/lessons', auth, requireAdmin, createLesson);
router.get('/admin/lessons', auth, requireAdmin, getAllLessonsAdmin);
router.get('/admin/lessons/:lessonId', auth, requireAdmin, getLessonAdmin);
router.put('/admin/lessons/:lessonId', auth, requireAdmin, updateLesson);
router.delete('/admin/lessons/:lessonId', auth, requireAdmin, deleteLesson);
router.patch('/admin/lessons/bulk', auth, requireAdmin, bulkUpdateLessons);
router.patch('/admin/courses/:courseId/lessons/reorder', auth, requireAdmin, reorderLessons);

module.exports = router;
