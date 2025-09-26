const ProgressTracker = require('../models/ProgressTracker');
const { validationResult } = require('express-validator');

class ProgressTrackerController {
  // ===============================
  // VISITOR ENDPOINTS
  // ===============================

  // Get user's progress dashboard
  async getMyProgress(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      let progress = await ProgressTracker.getUserProgress(req.user.id);

      // Create progress tracker if doesn't exist
      if (!progress) {
        progress = new ProgressTracker({
          user: req.user.id,
          academicProgress: {},
          assignments: [],
          homework: [],
          activities: [],
          generalComments: [],
          goals: [],
          achievements: [],
          analytics: {
            studyTime: { daily: [], weekly: [], monthly: [], total: 0 },
            performance: { averageScore: 0, improvementRate: 0, strongSubjects: [], weakSubjects: [], recommendedTopics: [] },
            engagement: { loginFrequency: 0, averageSessionTime: 0, participationRate: 0 }
          },
          notifications: [],
          settings: {
            privacy: { showProgressToOthers: false, showAchievements: true },
            notifications: { email: true, push: true, sms: false },
            learningPreferences: { difficulty: 'adaptive', pace: 'self-paced' }
          }
        });
        await progress.save();
      }

      // Calculate additional metrics
      const dashboardData = {
        ...progress.toJSON(),
        summary: {
          totalPoints: progress.academicProgress.totalPoints,
          earnedPoints: progress.academicProgress.earnedPoints,
          overallGrade: progress.academicProgress.overallGrade,
          completionRate: progress.academicProgress.completionRate,
          currentStreak: progress.academicProgress.streak.current,
          longestStreak: progress.academicProgress.streak.longest,
          totalStudyTime: progress.analytics.studyTime.total,
          pendingTasks: progress.pendingTasks,
          upcomingDeadlines: progress.upcomingDeadlines.length,
          recentAchievements: progress.achievements.slice(0, 5),
          unreadNotifications: progress.notifications.filter(n => !n.isRead).length
        },
        recentActivity: progress.activities
          .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
          .slice(0, 10)
      };

      res.json({
        success: true,
        data: dashboardData
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching progress data',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get assignments for current user
  async getMyAssignments(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const { status = 'all' } = req.query;
      
      const progress = await ProgressTracker.getUserProgress(req.user.id);
      if (!progress) {
        return res.json({
          success: true,
          data: []
        });
      }

      let assignments = progress.assignments;

      if (status !== 'all') {
        assignments = assignments.filter(a => a.status === status);
      }

      // Sort by due date
      assignments.sort((a, b) => {
        if (!a.assignment.dueDate) return 1;
        if (!b.assignment.dueDate) return -1;
        return new Date(a.assignment.dueDate) - new Date(b.assignment.dueDate);
      });

      res.json({
        success: true,
        data: assignments
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching assignments',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get homework for current user
  async getMyHomework(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const { status = 'all', subject } = req.query;
      
      const progress = await ProgressTracker.getUserProgress(req.user.id);
      if (!progress) {
        return res.json({
          success: true,
          data: []
        });
      }

      let homework = progress.homework;

      if (status !== 'all') {
        homework = homework.filter(h => h.status === status);
      }

      if (subject) {
        homework = homework.filter(h => h.homework.subject === subject);
      }

      // Sort by due date
      homework.sort((a, b) => {
        if (!a.homework.dueDate) return 1;
        if (!b.homework.dueDate) return -1;
        return new Date(a.homework.dueDate) - new Date(b.homework.dueDate);
      });

      res.json({
        success: true,
        data: homework
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching homework',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Submit assignment
  async submitAssignment(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const { assignmentId } = req.params;
      const submissionData = req.body;

      const progress = await ProgressTracker.getUserProgress(req.user.id);
      if (!progress) {
        return res.status(404).json({
          success: false,
          message: 'Progress tracker not found'
        });
      }

      await progress.submitAssignment(assignmentId, submissionData);

      res.json({
        success: true,
        message: 'Assignment submitted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || 'Error submitting assignment',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Submit homework
  async submitHomework(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const { homeworkId } = req.params;
      const submissionData = req.body;

      const progress = await ProgressTracker.getUserProgress(req.user.id);
      if (!progress) {
        return res.status(404).json({
          success: false,
          message: 'Progress tracker not found'
        });
      }

      const homework = progress.homework.id(homeworkId);
      if (!homework) {
        return res.status(404).json({
          success: false,
          message: 'Homework not found'
        });
      }

      // Check if max attempts reached
      if (homework.attempts >= homework.maxAttempts) {
        return res.status(400).json({
          success: false,
          message: 'Maximum attempts reached for this homework'
        });
      }

      // Check if late
      const isLate = homework.homework.dueDate && new Date() > homework.homework.dueDate;
      
      const submission = {
        ...submissionData,
        user: req.user.id,
        isLate,
        status: isLate ? 'late' : 'submitted'
      };

      homework.submissions.push(submission);
      homework.status = 'submitted';
      homework.attempts += 1;

      await progress.save();

      res.json({
        success: true,
        message: 'Homework submitted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error submitting homework',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Record activity (quiz, game, flashcard study, etc.)
  async recordActivity(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const activityData = {
        ...req.body,
        completedAt: new Date()
      };

      let progress = await ProgressTracker.getUserProgress(req.user.id);
      
      if (!progress) {
        progress = new ProgressTracker({ user: req.user.id });
        await progress.save();
      }

      await progress.recordActivity(activityData);

      res.json({
        success: true,
        message: 'Activity recorded successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error recording activity',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get user notifications
  async getMyNotifications(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const { limit = 20, unreadOnly = false } = req.query;

      const progress = await ProgressTracker.getUserProgress(req.user.id);
      if (!progress) {
        return res.json({
          success: true,
          data: []
        });
      }

      let notifications = progress.notifications;

      if (unreadOnly === 'true') {
        notifications = notifications.filter(n => !n.isRead);
      }

      notifications = notifications.slice(0, parseInt(limit));

      res.json({
        success: true,
        data: notifications
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching notifications',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Mark notifications as read
  async markNotificationsRead(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const { notificationIds } = req.body;

      const progress = await ProgressTracker.getUserProgress(req.user.id);
      if (!progress) {
        return res.status(404).json({
          success: false,
          message: 'Progress tracker not found'
        });
      }

      if (notificationIds && notificationIds.length > 0) {
        // Mark specific notifications as read
        progress.notifications.forEach(notification => {
          if (notificationIds.includes(notification._id.toString())) {
            notification.isRead = true;
          }
        });
      } else {
        // Mark all as read
        progress.notifications.forEach(notification => {
          notification.isRead = true;
        });
      }

      await progress.save();

      res.json({
        success: true,
        message: 'Notifications marked as read'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error marking notifications as read',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // ===============================
  // SUPER ADMIN ENDPOINTS
  // ===============================

  // Get all users' progress for admin dashboard
  async getAllUsersProgress(req, res) {
    try {
      const { page = 1, limit = 20, search, sortBy = 'overallGrade' } = req.query;

      let query = {};

      if (search) {
        // Search by user name (requires lookup)
        // For simplicity, we'll skip the search filter for now
      }

      const progressRecords = await ProgressTracker.find(query)
        .populate('user', 'name email profileImage createdAt')
        .sort({ [`academicProgress.${sortBy}`]: -1 })
        .limit(parseInt(limit))
        .skip((page - 1) * limit);

      const total = await ProgressTracker.countDocuments(query);

      // Calculate summary statistics
      const summary = await ProgressTracker.aggregate([
        {
          $group: {
            _id: null,
            totalUsers: { $sum: 1 },
            averageGrade: { $avg: '$academicProgress.overallGrade' },
            averageCompletionRate: { $avg: '$academicProgress.completionRate' },
            totalStudyTime: { $sum: '$analytics.studyTime.total' },
            totalAssignments: { $sum: { $size: '$assignments' } },
            totalHomework: { $sum: { $size: '$homework' } }
          }
        }
      ]);

      res.json({
        success: true,
        data: progressRecords,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        },
        summary: summary[0] || {
          totalUsers: 0,
          averageGrade: 0,
          averageCompletionRate: 0,
          totalStudyTime: 0,
          totalAssignments: 0,
          totalHomework: 0
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching users progress',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get specific user's progress for admin
  async getUserProgressForAdmin(req, res) {
    try {
      const { userId } = req.params;

      const progress = await ProgressTracker.getUserProgress(userId);
      if (!progress) {
        return res.status(404).json({
          success: false,
          message: 'User progress not found'
        });
      }

      res.json({
        success: true,
        data: progress
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching user progress',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Assign homework to user
  async assignHomework(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const { userId } = req.params;
      const homeworkData = req.body;

      let progress = await ProgressTracker.getUserProgress(userId);
      
      if (!progress) {
        progress = new ProgressTracker({ user: userId });
        await progress.save();
      }

      await progress.addHomework(homeworkData);

      res.json({
        success: true,
        message: 'Homework assigned successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error assigning homework',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Assign assignment to user
  async assignAssignment(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const { userId } = req.params;
      const { assignmentData, dueDate } = req.body;

      let progress = await ProgressTracker.getUserProgress(userId);
      
      if (!progress) {
        progress = new ProgressTracker({ user: userId });
        await progress.save();
      }

      await progress.addAssignment(assignmentData, new Date(dueDate));

      res.json({
        success: true,
        message: 'Assignment assigned successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error assigning assignment',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Add comment to user's progress
  async addComment(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const { userId } = req.params;
      const { targetType = 'general', targetId, commentData } = req.body;

      const progress = await ProgressTracker.getUserProgress(userId);
      if (!progress) {
        return res.status(404).json({
          success: false,
          message: 'User progress not found'
        });
      }

      await progress.addComment(targetType, targetId, commentData, req.user.id);

      res.json({
        success: true,
        message: 'Comment added successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error adding comment',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Grade assignment or homework
  async gradeSubmission(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const { userId, submissionId } = req.params;
      const { grade, feedback } = req.body;

      const progress = await ProgressTracker.getUserProgress(userId);
      if (!progress) {
        return res.status(404).json({
          success: false,
          message: 'User progress not found'
        });
      }

      // Find submission in assignments or homework
      let submission = null;
      let parentTask = null;

      // Search in assignments
      for (let assignment of progress.assignments) {
        submission = assignment.submissions.id(submissionId);
        if (submission) {
          parentTask = assignment;
          break;
        }
      }

      // If not found in assignments, search in homework
      if (!submission) {
        for (let homework of progress.homework) {
          submission = homework.submissions.id(submissionId);
          if (submission) {
            parentTask = homework;
            break;
          }
        }
      }

      if (!submission) {
        return res.status(404).json({
          success: false,
          message: 'Submission not found'
        });
      }

      // Update grade
      submission.grade = {
        ...grade,
        feedback
      };
      submission.status = 'graded';
      parentTask.status = 'graded';

      // Add notification
      progress.notifications.push({
        type: 'grade-posted',
        title: 'Grade Posted',
        message: `Your submission has been graded. Score: ${grade.score}/${grade.maxScore}`,
        actionUrl: `/progress/submissions/${submissionId}`
      });

      await progress.save();

      res.json({
        success: true,
        message: 'Submission graded successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error grading submission',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }


  // Get progress analytics dashboard
  async getProgressAnalytics(req, res) {
    try {
      const { timeframe = 'monthly' } = req.query;

      // This would typically involve complex aggregation queries
      // For now, we'll return basic analytics
      const analytics = await ProgressTracker.aggregate([
        {
          $facet: {
            overallStats: [
              {
                $group: {
                  _id: null,
                  totalUsers: { $sum: 1 },
                  averageGrade: { $avg: '$academicProgress.overallGrade' },
                  totalStudyTime: { $sum: '$analytics.studyTime.total' },
                  averageCompletionRate: { $avg: '$academicProgress.completionRate' }
                }
              }
            ],
            gradeDistribution: [
              {
                $bucket: {
                  groupBy: '$academicProgress.overallGrade',
                  boundaries: [0, 60, 70, 80, 90, 100],
                  default: 'other',
                  output: {
                    count: { $sum: 1 },
                    users: { $push: '$user' }
                  }
                }
              }
            ],
            subjectPerformance: [
              { $unwind: '$homework' },
              {
                $group: {
                  _id: '$homework.homework.subject',
                  averageScore: { $avg: '$homework.submissions.grade.percentage' },
                  totalHomework: { $sum: 1 },
                  completedHomework: { 
                    $sum: { $cond: [{ $eq: ['$homework.status', 'graded'] }, 1, 0] } 
                  }
                }
              }
            ]
          }
        }
      ]);

      res.json({
        success: true,
        data: analytics[0]
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching progress analytics',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = new ProgressTrackerController();
