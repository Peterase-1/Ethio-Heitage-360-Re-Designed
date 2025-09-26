const UserGoal = require('../models/UserGoal');
const Achievement = require('../models/Achievement');
const VisitorActivity = require('../models/VisitorActivity');
const VisitorProfile = require('../models/VisitorProfile');
const Enrollment = require('../models/Enrollment');
const QuizAttempt = require('../models/QuizAttempt');
const { validationResult } = require('express-validator');

class ProgressController {
  // User Goals
  async getGoals(req, res) {
    try {
      const {
        status,
        category,
        type,
        page = 1,
        limit = 20,
        sort = 'createdAt'
      } = req.query;

      const query = { user: req.user.id };
      
      if (status) query.status = status;
      if (category) query.category = category;
      if (type) query.type = type;

      const goals = await UserGoal.find(query)
        .populate('relatedResource.id', 'title name')
        .sort({ [sort]: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await UserGoal.countDocuments(query);

      // Get goal statistics
      const stats = await UserGoal.aggregate([
        { $match: { user: req.user.id } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            avgProgress: { $avg: '$progress' }
          }
        }
      ]);

      res.json({
        success: true,
        data: goals,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        },
        stats
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async createGoal(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const {
        title,
        description,
        category = 'custom',
        type = 'one-time',
        target,
        unit,
        targetDate,
        priority = 'medium',
        relatedResource,
        milestones = [],
        tags = [],
        notes,
        isPublic = false
      } = req.body;

      const goal = new UserGoal({
        user: req.user.id,
        title,
        description,
        category,
        type,
        target,
        unit,
        targetDate: new Date(targetDate),
        priority,
        relatedResource,
        milestones,
        tags,
        notes,
        isPublic
      });

      // Set up reminders
      if (goal.type === 'daily') {
        goal.reminders.frequency = 'daily';
        goal.reminders.nextDue = new Date();
      } else if (goal.type === 'weekly') {
        goal.reminders.frequency = 'weekly';
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        goal.reminders.nextDue = nextWeek;
      }

      await goal.save();

      res.status(201).json({
        success: true,
        data: goal,
        message: 'Goal created successfully'
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getGoal(req, res) {
    try {
      const goal = await UserGoal.findOne({
        _id: req.params.id,
        user: req.user.id
      }).populate('relatedResource.id', 'title name');

      if (!goal) {
        return res.status(404).json({ success: false, message: 'Goal not found' });
      }

      res.json({
        success: true,
        data: goal
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async updateGoal(req, res) {
    try {
      const {
        title,
        description,
        targetDate,
        priority,
        notes,
        status,
        tags,
        isPublic
      } = req.body;

      const goal = await UserGoal.findOne({
        _id: req.params.id,
        user: req.user.id
      });

      if (!goal) {
        return res.status(404).json({ success: false, message: 'Goal not found' });
      }

      if (title !== undefined) goal.title = title;
      if (description !== undefined) goal.description = description;
      if (targetDate !== undefined) goal.targetDate = new Date(targetDate);
      if (priority !== undefined) goal.priority = priority;
      if (notes !== undefined) goal.notes = notes;
      if (status !== undefined) goal.status = status;
      if (tags !== undefined) goal.tags = tags;
      if (isPublic !== undefined) goal.isPublic = isPublic;

      await goal.save();

      res.json({
        success: true,
        data: goal,
        message: 'Goal updated successfully'
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async updateGoalProgress(req, res) {
    try {
      const { increment = 1, notes } = req.body;

      const goal = await UserGoal.findOne({
        _id: req.params.id,
        user: req.user.id
      });

      if (!goal) {
        return res.status(404).json({ success: false, message: 'Goal not found' });
      }

      await goal.updateProgress(increment);

      if (notes) {
        goal.notes = notes;
        await goal.save();
      }

      res.json({
        success: true,
        data: goal,
        message: 'Progress updated successfully'
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async deleteGoal(req, res) {
    try {
      const goal = await UserGoal.findOneAndDelete({
        _id: req.params.id,
        user: req.user.id
      });

      if (!goal) {
        return res.status(404).json({ success: false, message: 'Goal not found' });
      }

      res.json({
        success: true,
        message: 'Goal deleted successfully'
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Achievements
  async getAchievements(req, res) {
    try {
      const { category, earned, page = 1, limit = 50 } = req.query;

      const query = { isActive: true };
      
      if (category) query.category = category;

      const achievements = await Achievement.find(query)
        .sort({ points: -1, createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      // Get user's earned achievements
      const profile = await VisitorProfile.findOne({ visitor: req.user.id });
      const earnedAchievements = profile?.achievements || [];

      // Mark which achievements are earned
      const achievementsWithStatus = achievements.map(achievement => ({
        ...achievement.toObject(),
        earned: earnedAchievements.some(earned => 
          earned.achievement.toString() === achievement._id.toString()
        ),
        earnedAt: earnedAchievements.find(earned => 
          earned.achievement.toString() === achievement._id.toString()
        )?.earnedAt
      }));

      // Filter by earned status if specified
      let filteredAchievements = achievementsWithStatus;
      if (earned === 'true') {
        filteredAchievements = achievementsWithStatus.filter(a => a.earned);
      } else if (earned === 'false') {
        filteredAchievements = achievementsWithStatus.filter(a => !a.earned);
      }

      const total = filteredAchievements.length;

      res.json({
        success: true,
        data: filteredAchievements,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        },
        summary: {
          totalAchievements: achievements.length,
          earnedCount: achievementsWithStatus.filter(a => a.earned).length,
          totalPoints: earnedAchievements.reduce((sum, a) => {
            const achievement = achievements.find(ach => 
              ach._id.toString() === a.achievement.toString()
            );
            return sum + (achievement?.points || 0);
          }, 0)
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Activity Log
  async getActivityLog(req, res) {
    try {
      const {
        type,
        startDate,
        endDate,
        page = 1,
        limit = 50
      } = req.query;

      const query = { visitor: req.user.id };
      
      if (type) query.type = type;
      
      if (startDate || endDate) {
        query.timestamp = {};
        if (startDate) query.timestamp.$gte = new Date(startDate);
        if (endDate) query.timestamp.$lte = new Date(endDate);
      }

      const activities = await VisitorActivity.find(query)
        .populate('relatedResource.museum', 'name')
        .populate('relatedResource.artifact', 'name')
        .populate('relatedResource.course', 'title')
        .populate('relatedResource.event', 'title')
        .sort({ timestamp: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await VisitorActivity.countDocuments(query);

      // Get activity statistics
      const stats = await VisitorActivity.aggregate([
        { $match: { visitor: req.user.id } },
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 },
            pointsEarned: { $sum: '$pointsEarned' }
          }
        },
        { $sort: { count: -1 } }
      ]);

      res.json({
        success: true,
        data: activities,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        },
        stats
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Analytics
  async getProgressOverview(req, res) {
    try {
      const userId = req.user.id;
      const { timeframe = 'monthly' } = req.query;

      // Calculate date range
      let startDate = new Date();
      switch (timeframe) {
        case 'weekly':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'monthly':
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case 'yearly':
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
        default:
          startDate.setMonth(startDate.getMonth() - 1);
      }

      // Get user profile
      const profile = await VisitorProfile.findOne({ visitor: userId });

      // Goal statistics
      const goalStats = await UserGoal.aggregate([
        { $match: { user: userId } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            avgProgress: { $avg: '$progress' }
          }
        }
      ]);

      // Learning progress
      const enrollmentStats = await Enrollment.aggregate([
        { $match: { student: userId } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            avgProgress: { $avg: '$progress.percentComplete' }
          }
        }
      ]);

      // Quiz performance
      const quizStats = await QuizAttempt.aggregate([
        { 
          $match: { 
            user: userId, 
            status: 'submitted',
            createdAt: { $gte: startDate }
          } 
        },
        {
          $group: {
            _id: null,
            totalAttempts: { $sum: 1 },
            averageScore: { $avg: '$percentage' },
            totalTimespent: { $sum: '$timeSpent' },
            passedAttempts: { 
              $sum: { $cond: ['$passed', 1, 0] } 
            }
          }
        }
      ]);

      // Activity timeline
      const activityTimeline = await VisitorActivity.aggregate([
        { 
          $match: { 
            visitor: userId,
            timestamp: { $gte: startDate }
          } 
        },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
              type: "$type"
            },
            count: { $sum: 1 },
            points: { $sum: "$pointsEarned" }
          }
        },
        { $sort: { "_id.date": 1 } }
      ]);

      // Progress trends
      const progressTrend = await UserGoal.aggregate([
        { 
          $match: { 
            user: userId,
            lastUpdated: { $gte: startDate }
          } 
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$lastUpdated" } },
            avgProgress: { $avg: "$progress" },
            goalsUpdated: { $sum: 1 }
          }
        },
        { $sort: { "_id": 1 } }
      ]);

      res.json({
        success: true,
        data: {
          profile: {
            totalPoints: profile?.totalPoints || 0,
            level: profile?.level || 1,
            achievements: profile?.achievements?.length || 0,
            streak: profile?.streak?.current || 0
          },
          goals: {
            stats: goalStats,
            trend: progressTrend
          },
          learning: {
            enrollments: enrollmentStats,
            quizPerformance: quizStats[0] || {
              totalAttempts: 0,
              averageScore: 0,
              totalTimespent: 0,
              passedAttempts: 0
            }
          },
          activity: {
            timeline: activityTimeline,
            totalActivities: activityTimeline.reduce((sum, item) => sum + item.count, 0)
          }
        },
        timeframe
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getDetailedStats(req, res) {
    try {
      const userId = req.user.id;

      // Comprehensive statistics
      const [
        goalStats,
        enrollmentStats,
        activityStats,
        achievementStats,
        streakData
      ] = await Promise.all([
        // Goal statistics
        UserGoal.aggregate([
          { $match: { user: userId } },
          {
            $facet: {
              byStatus: [
                { $group: { _id: '$status', count: { $sum: 1 } } }
              ],
              byCategory: [
                { $group: { _id: '$category', count: { $sum: 1 } } }
              ],
              byType: [
                { $group: { _id: '$type', count: { $sum: 1 } } }
              ],
              overall: [
                {
                  $group: {
                    _id: null,
                    total: { $sum: 1 },
                    avgProgress: { $avg: '$progress' },
                    completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } }
                  }
                }
              ]
            }
          }
        ]),

        // Enrollment statistics
        Enrollment.aggregate([
          { $match: { student: userId } },
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 },
              avgProgress: { $avg: '$progress.percentComplete' },
              totalStudyTime: { $sum: '$studyTime' }
            }
          }
        ]),

        // Activity statistics
        VisitorActivity.aggregate([
          { $match: { visitor: userId } },
          {
            $group: {
              _id: '$type',
              count: { $sum: 1 },
              totalPoints: { $sum: '$pointsEarned' }
            }
          }
        ]),

        // Achievement statistics
        VisitorProfile.aggregate([
          { $match: { visitor: userId } },
          { $unwind: '$achievements' },
          {
            $lookup: {
              from: 'achievements',
              localField: 'achievements.achievement',
              foreignField: '_id',
              as: 'achievementDetails'
            }
          },
          { $unwind: '$achievementDetails' },
          {
            $group: {
              _id: '$achievementDetails.category',
              count: { $sum: 1 },
              totalPoints: { $sum: '$achievementDetails.points' }
            }
          }
        ]),

        // Streak data
        VisitorProfile.findOne({ visitor: userId }).select('streak')
      ]);

      res.json({
        success: true,
        data: {
          goals: goalStats[0] || { byStatus: [], byCategory: [], byType: [], overall: [] },
          learning: enrollmentStats,
          activities: activityStats,
          achievements: achievementStats,
          streak: streakData?.streak || { current: 0, longest: 0, lastActivity: null }
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Goal Templates
  async getGoalTemplates(req, res) {
    try {
      const templates = [
        {
          id: 'complete_courses',
          title: 'Complete Heritage Courses',
          description: 'Complete a certain number of heritage courses',
          category: 'course-completion',
          type: 'one-time',
          unit: 'courses',
          defaultTarget: 5,
          tags: ['learning', 'courses']
        },
        {
          id: 'visit_museums',
          title: 'Visit Virtual Museums',
          description: 'Explore Ethiopian museums virtually',
          category: 'exploration',
          type: 'monthly',
          unit: 'museums-visited',
          defaultTarget: 10,
          tags: ['exploration', 'museums']
        },
        {
          id: 'study_streak',
          title: 'Daily Study Streak',
          description: 'Maintain a daily learning streak',
          category: 'habit',
          type: 'daily',
          unit: 'days',
          defaultTarget: 30,
          tags: ['consistency', 'habit']
        },
        {
          id: 'quiz_mastery',
          title: 'Quiz Master',
          description: 'Pass quizzes with high scores',
          category: 'skill-building',
          type: 'monthly',
          unit: 'quizzes',
          defaultTarget: 20,
          tags: ['testing', 'knowledge']
        }
      ];

      res.json({
        success: true,
        data: templates
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new ProgressController();
