const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  createAssignment,
  getAssignments,
  getAssignment,
  submitAssignment,
  gradeSubmission,
  getAssignmentStats
} = require('../controllers/assignments');

// Middleware to check admin role
const requireInstructor = (req, res, next) => {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'superAdmin' && req.user.role !== 'museumAdmin')) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Instructor role required.'
    });
  }
  next();
};

// Public routes (with optional auth)
router.get('/courses/:courseId/assignments', getAssignments);
router.get('/:assignmentId', getAssignment);

// Student routes (auth required)
router.post('/:assignmentId/submit', auth, submitAssignment);

// Instructor routes (admin required)
router.post('/courses/:courseId', auth, requireInstructor, createAssignment);
router.post('/:assignmentId/submissions/:submissionId/grade', auth, requireInstructor, gradeSubmission);
router.get('/:assignmentId/stats', auth, requireInstructor, getAssignmentStats);

module.exports = router;
