const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  getCourses,
  getCourseById,
  getLessons,
  getLessonById,
  startLesson,
  completeLesson,
  getLearningProgress,
  getLearningAchievements,
  getRecommendations,
  submitQuiz,
  enrollInCourse,
  getEnrolledCourses,
  unenrollFromCourse,
  generateCertificate,
  getCertificates,
  verifyCertificate,
  getDashboardStats
} = require('../controllers/learning');

// Public routes (no authentication required)
router.get('/courses', getCourses);
router.get('/courses/:courseId', getCourseById);
router.get('/courses/:courseId/lessons', getLessons);
router.get('/lessons/:lessonId', getLessonById);

// Routes with optional authentication (will show mock data if not authenticated)
router.get('/progress', getLearningProgress);
router.get('/achievements', getLearningAchievements);
router.get('/recommendations', getRecommendations);

// Protected routes (authentication required)
router.post('/lessons/:lessonId/start', auth, startLesson);
router.post('/lessons/:lessonId/complete', auth, completeLesson); // This is the endpoint the client service calls
router.post('/quizzes/:quizId/submit', auth, submitQuiz);

// Course enrollment routes
router.post('/courses/:courseId/enroll', auth, enrollInCourse);
router.get('/enrollments', auth, getEnrolledCourses);
router.delete('/courses/:courseId/unenroll', auth, unenrollFromCourse);

// Certificates
router.post('/courses/:courseId/certificate', auth, generateCertificate);
router.get('/certificates', auth, getCertificates);

// Dashboard statistics with optional authentication
router.get('/stats', getDashboardStats);

// Public certificate verification
router.get('/verify/:verificationCode', verifyCertificate);

module.exports = router;
