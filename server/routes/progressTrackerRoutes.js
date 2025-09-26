const express = require('express');
const router = express.Router();
const progressTrackerController = require('../controllers/progressTrackerController');
const { auth: protect, authorize: restrictTo } = require('../middleware/auth');
const { body, param } = require('express-validator');

// ==================== VISITOR ROUTES ====================

// Get user's own progress dashboard
router.get('/my-progress', 
  protect,
  progressTrackerController.getMyProgress
);

// Get user's own assignments
router.get('/my-assignments', 
  protect,
  progressTrackerController.getMyAssignments
);

// Get user's own homework
router.get('/my-homework', 
  protect,
  progressTrackerController.getMyHomework
);

// Submit assignment
router.post('/assignments/:assignmentId/submit',
  protect,
  [
    param('assignmentId').isMongoId().withMessage('Valid assignment ID required'),
    body('submission').notEmpty().withMessage('Submission data is required'),
    body('submission.content').notEmpty().withMessage('Submission content is required')
  ],
  progressTrackerController.submitAssignment
);

// Submit homework
router.post('/homework/:homeworkId/submit',
  protect,
  [
    param('homeworkId').isMongoId().withMessage('Valid homework ID required'),
    body('submission').notEmpty().withMessage('Submission data is required'),
    body('submission.content').notEmpty().withMessage('Submission content is required')
  ],
  progressTrackerController.submitHomework
);

// Record activity (quiz, game, flashcard study, etc.)
router.post('/activities/record',
  protect,
  [
    body('type').isIn([
      'quiz_completed', 'game_played', 'flashcard_study', 'lesson_completed', 
      'video_watched', 'reading_completed', 'practice_exercise', 'live_session_attended'
    ]).withMessage('Valid activity type is required'),
    body('activityId').notEmpty().withMessage('Activity ID is required'),
    body('data').isObject().withMessage('Activity data must be an object')
  ],
  progressTrackerController.recordActivity
);

// Get user's notifications
router.get('/notifications', 
  protect,
  progressTrackerController.getMyNotifications
);

// Mark notifications as read
router.put('/notifications/read',
  protect,
  [
    body('notificationIds').optional().isArray().withMessage('Notification IDs must be an array')
  ],
  progressTrackerController.markNotificationsRead
);

// Get user's analytics and progress summary
router.get('/analytics',
  protect,
  progressTrackerController.getMyProgress  // Uses same endpoint with different processing
);

// ==================== ADMIN ROUTES ====================

// Get all users' progress (super admin only)
router.get('/admin/all-users',
  protect,
  restrictTo('superAdmin'),
  progressTrackerController.getAllUsersProgress
);

// Get specific user's progress (admin)
router.get('/admin/users/:userId',
  protect,
  restrictTo('superAdmin', 'museumAdmin'),
  [
    param('userId').isMongoId().withMessage('Valid user ID required')
  ],
  progressTrackerController.getUserProgressForAdmin
);

// Assign homework to user
router.post('/admin/users/:userId/homework',
  protect,
  restrictTo('superAdmin', 'museumAdmin'),
  [
    param('userId').isMongoId().withMessage('Valid user ID required'),
    body('title').notEmpty().withMessage('Homework title is required'),
    body('description').notEmpty().withMessage('Homework description is required'),
    body('subject').notEmpty().withMessage('Subject is required'),
    body('dueDate').isISO8601().withMessage('Valid due date is required'),
    body('maxAttempts').optional().isInt({ min: 1 }).withMessage('Max attempts must be a positive integer'),
    body('difficulty').optional().isIn(['beginner', 'intermediate', 'advanced']).withMessage('Valid difficulty level required')
  ],
  progressTrackerController.assignHomework
);

// Assign assignment to user
router.post('/admin/users/:userId/assignments',
  protect,
  restrictTo('superAdmin', 'museumAdmin'),
  [
    param('userId').isMongoId().withMessage('Valid user ID required'),
    body('assignmentData').isObject().withMessage('Assignment data is required'),
    body('dueDate').isISO8601().withMessage('Valid due date is required')
  ],
  progressTrackerController.assignAssignment
);

// Add comment to user's progress
router.post('/admin/users/:userId/comments',
  protect,
  restrictTo('superAdmin', 'museumAdmin'),
  [
    param('userId').isMongoId().withMessage('Valid user ID required'),
    body('commentData').isObject().withMessage('Comment data is required'),
    body('commentData.content').notEmpty().withMessage('Comment content is required'),
    body('targetType').optional().isIn(['general', 'assignment', 'homework', 'activity']).withMessage('Valid target type required'),
    body('targetId').optional().isMongoId().withMessage('Valid target ID required')
  ],
  progressTrackerController.addComment
);

// Grade assignment or homework submission
router.put('/admin/users/:userId/submissions/:submissionId/grade',
  protect,
  restrictTo('superAdmin', 'museumAdmin'),
  [
    param('userId').isMongoId().withMessage('Valid user ID required'),
    param('submissionId').isMongoId().withMessage('Valid submission ID required'),
    body('grade').isObject().withMessage('Grade data is required'),
    body('grade.score').isNumeric().withMessage('Grade score must be numeric'),
    body('grade.maxScore').isNumeric().withMessage('Max score must be numeric'),
    body('grade.percentage').optional().isFloat({ min: 0, max: 100 }).withMessage('Percentage must be between 0 and 100'),
    body('feedback').optional().isString().withMessage('Feedback must be a string')
  ],
  progressTrackerController.gradeSubmission
);

// Get progress analytics dashboard (admin)
router.get('/admin/analytics',
  protect,
  restrictTo('superAdmin', 'museumAdmin'),
  progressTrackerController.getProgressAnalytics
);

// Reset user's progress (super admin only)
router.delete('/admin/users/:userId/reset',
  protect,
  restrictTo('superAdmin'),
  [
    param('userId').isMongoId().withMessage('Valid user ID required'),
    body('resetType').optional().isIn(['all', 'assignments', 'homework', 'activities', 'achievements', 'analytics']).withMessage('Valid reset type required')
  ],
  progressTrackerController.resetUserProgress || ((req, res) => {
    res.status(501).json({ success: false, message: 'Reset functionality not yet implemented' });
  })
);

// Send notification to user (admin)
router.post('/admin/users/:userId/notifications',
  protect,
  restrictTo('superAdmin', 'museumAdmin'),
  [
    param('userId').isMongoId().withMessage('Valid user ID required'),
    body('title').notEmpty().withMessage('Notification title is required'),
    body('message').notEmpty().withMessage('Notification message is required'),
    body('type').optional().isIn(['general', 'grade-posted', 'assignment-due', 'achievement-unlocked', 'system']).withMessage('Valid notification type required'),
    body('priority').optional().isIn(['low', 'normal', 'high', 'urgent']).withMessage('Valid priority level required')
  ],
  progressTrackerController.addUserNotification || ((req, res) => {
    res.status(501).json({ success: false, message: 'Notification functionality not yet implemented' });
  })
);

// Bulk operations for admin
router.post('/admin/bulk-operations',
  protect,
  restrictTo('superAdmin'),
  [
    body('userIds').isArray({ min: 1 }).withMessage('User IDs array is required'),
    body('operation').isIn(['reset_all', 'add_achievement', 'send_notification']).withMessage('Valid operation is required'),
    body('data').optional().isObject().withMessage('Operation data must be an object')
  ],
  progressTrackerController.bulkUpdateProgress || ((req, res) => {
    res.status(501).json({ success: false, message: 'Bulk operations not yet implemented' });
  })
);

// ==================== STATISTICS AND REPORTS ====================

// Get user's detailed analytics (visitor)
router.get('/analytics/detailed',
  protect,
  progressTrackerController.getAnalytics || ((req, res) => {
    res.status(501).json({ success: false, message: 'Detailed analytics not yet implemented' });
  })
);

// Get leaderboard data (visitor)
router.get('/leaderboard',
  protect,
  (req, res) => {
    // This would integrate with the leaderboard system
    res.status(501).json({ success: false, message: 'Leaderboard integration pending' });
  }
);

// Export user's progress data (visitor)
router.get('/export',
  protect,
  (req, res) => {
    res.status(501).json({ success: false, message: 'Data export not yet implemented' });
  }
);

// Generate progress report for admin
router.get('/admin/reports/:userId',
  protect,
  restrictTo('superAdmin', 'museumAdmin'),
  [
    param('userId').isMongoId().withMessage('Valid user ID required')
  ],
  (req, res) => {
    res.status(501).json({ success: false, message: 'Progress reports not yet implemented' });
  }
);

module.exports = router;
