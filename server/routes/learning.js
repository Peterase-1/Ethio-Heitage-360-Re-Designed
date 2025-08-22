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
  submitQuiz
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

module.exports = router;
