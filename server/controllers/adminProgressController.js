const User = require('../models/User');
const LearningProgress = require('../models/LearningProgress');
const Achievement = require('../models/Achievement');
const VisitorActivity = require('../models/VisitorActivity');
const Course = require('../models/Course');
const mongoose = require('mongoose');

/**
 * Admin Progress Controller
 * Super Admin endpoints for managing user progress, achievements, and analytics
 */

class AdminProgressController {
  // ===============================
  // USER PROGRESS MANAGEMENT
  // ===============================

  // Get all user progress data with filtering and pagination
  async getAllUserProgress(req, res) {
    try {
      const {
        search,
        filterType = 'all',
        sortBy = 'lastActivity',
        sortOrder = 'desc',
        page = 1,
        limit = 20,
        timeframe = 'all'
      } = req.query;

      // Build query for users
      let userQuery = { role: { $in: ['user'] }, isActive: true };
      
      if (search) {
        userQuery.$or = [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }

      // Get users with basic info
      const users = await User.find(userQuery)
        .select('firstName lastName email avatar stats gamification createdAt lastLogin')
        .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
        .limit(parseInt(limit))
        .skip((page - 1) * limit);

      // Get learning progress for each user
      const userIds = users.map(user => user._id);
      const learningProgresses = await LearningProgress.find({
        userId: { $in: userIds }
      }).populate('courses.courseId', 'title');

      // Get recent activities for filtering
      const recentActivities = await VisitorActivity.find({
        userId: { $in: userIds },
        timestamp: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      }).distinct('userId');

      // Combine data and apply filters
      const combinedData = users.map(user => {
        const progress = learningProgresses.find(p => 
          p.userId.toString() === user._id.toString()
        ) || {
          overallStats: {
            totalLessonsCompleted: 0,
            totalTimeSpent: 0,
            currentStreak: 0,
            longestStreak: 0,
            lastActivityDate: null,
            averageScore: 0
          },
          courses: [],
          achievements: []
        };

        const isRecentlyActive = recentActivities.includes(user._id);

        return {
          _id: user._id,
          user: {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            avatar: user.avatar
          },
          overallStats: progress.overallStats,
          courses: progress.courses || [],
          achievements: progress.achievements || [],
          isRecentlyActive,
          userStats: user.stats,
          gamification: user.gamification
        };
      });

      // Apply filtering
      let filteredData = combinedData;
      switch (filterType) {
        case 'active':
          filteredData = combinedData.filter(item => item.isRecentlyActive);
          break;
        case 'high_achievers':
          filteredData = combinedData.filter(item => 
            item.achievements.length >= 5 || item.userStats?.totalPoints > 1000
          );
          break;
        case 'struggling':
          filteredData = combinedData.filter(item => 
            item.overallStats.averageScore < 60 && item.overallStats.totalLessonsCompleted > 0
          );
          break;
      }

      // Get total count for pagination
      const totalUsers = await User.countDocuments(userQuery);
      
      // Get overview statistics
      const stats = await this.getProgressOverviewStats();

      res.json({
        success: true,
        data: filteredData,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(totalUsers / limit),
          total: totalUsers,
          hasNext: page * limit < totalUsers,
          hasPrev: page > 1
        },
        stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching user progress data',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get detailed progress for a specific user
  async getUserProgressDetail(req, res) {
    try {
      const { userId } = req.params;

      const user = await User.findById(userId)
        .select('firstName lastName email avatar stats gamification createdAt lastLogin');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Get learning progress
      const learningProgress = await LearningProgress.findOne({ userId })
        .populate('courses.courseId', 'title description');

      // Get recent activities
      const recentActivities = await VisitorActivity.find({ userId })
        .sort({ timestamp: -1 })
        .limit(50);

      // Get user achievements
      const userAchievements = user.gamification?.badges || [];
      
      // Get activity summary by type
      const activitySummary = await VisitorActivity.aggregate([
        { $match: { userId: mongoose.Types.ObjectId(userId) } },
        {
          $group: {
            _id: '$activityType',
            count: { $sum: 1 },
            totalPoints: { $sum: '$pointsEarned' },
            lastActivity: { $max: '$timestamp' }
          }
        },
        { $sort: { count: -1 } }
      ]);

      res.json({
        success: true,
        data: {
          user,
          learningProgress: learningProgress || {
            overallStats: {
              totalLessonsCompleted: 0,
              totalTimeSpent: 0,
              currentStreak: 0,
              longestStreak: 0,
              lastActivityDate: null,
              averageScore: 0
            },
            courses: [],
            achievements: []
          },
          recentActivities,
          activitySummary,
          achievements: userAchievements
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching user progress details',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Reset user progress (admin only)
  async resetUserProgress(req, res) {
    try {
      const { userId } = req.params;
      const { resetType = 'partial' } = req.body; // 'partial' or 'complete'

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      if (resetType === 'complete') {
        // Reset all progress
        await LearningProgress.findOneAndUpdate(
          { userId },
          {
            $set: {
              'overallStats.totalLessonsCompleted': 0,
              'overallStats.totalTimeSpent': 0,
              'overallStats.currentStreak': 0,
              'overallStats.averageScore': 0,
              courses: [],
              achievements: []
            }
          }
        );

        // Reset user stats
        user.stats = {
          totalPoints: 0,
          level: 1,
          achievementsUnlocked: 0
        };

        user.gamification = {
          badges: [],
          currentStreak: 0,
          longestStreak: 0
        };

        await user.save();

        // Log admin action
        await VisitorActivity.create({
          userId: req.user.id,
          activityType: 'admin_action',
          activityData: {
            action: 'reset_user_progress',
            targetUserId: userId,
            resetType: 'complete'
          }
        });

      } else {
        // Partial reset - only reset current progress but keep achievements
        await LearningProgress.findOneAndUpdate(
          { userId },
          {
            $set: {
              'overallStats.currentStreak': 0,
              'courses.$[].status': 'not_started',
              'courses.$[].progressPercentage': 0,
              'courses.$[].startedAt': null,
              'courses.$[].completedAt': null
            }
          }
        );
      }

      res.json({
        success: true,
        message: `User progress ${resetType}ly reset successfully`
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error resetting user progress',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // ===============================
  // ACHIEVEMENT MANAGEMENT
  // ===============================

  // Get all achievements with stats
  async getAllAchievements(req, res) {
    try {
      const {
        category,
        type,
        rarity,
        isActive,
        page = 1,
        limit = 50
      } = req.query;

      const query = {};
      if (category) query.category = category;
      if (type) query.type = type;
      if (rarity) query.rarity = rarity;
      if (isActive !== undefined) query.isActive = isActive === 'true';

      const achievements = await Achievement.find(query)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip((page - 1) * limit);

      // Get statistics for each achievement
      const achievementsWithStats = await Promise.all(
        achievements.map(async (achievement) => {
          // Count how many users have earned this achievement
          const earnedCount = await User.countDocuments({
            'gamification.badges.id': achievement.id
          });

          const totalActiveUsers = await User.countDocuments({
            role: 'user',
            isActive: true
          });

          return {
            ...achievement.toObject(),
            stats: {
              earnedCount,
              totalUsers: totalActiveUsers,
              earnedPercentage: totalActiveUsers > 0 ? 
                Math.round((earnedCount / totalActiveUsers) * 100) : 0
            }
          };
        })
      );

      const total = await Achievement.countDocuments(query);

      res.json({
        success: true,
        data: achievementsWithStats,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching achievements',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Create new achievement
  async createAchievement(req, res) {
    try {
      const {
        id,
        name,
        description,
        type,
        category,
        icon,
        badge,
        color,
        criteria,
        points,
        rarity
      } = req.body;

      // Check if achievement ID already exists
      const existingAchievement = await Achievement.findOne({ id });
      if (existingAchievement) {
        return res.status(400).json({
          success: false,
          message: 'Achievement with this ID already exists'
        });
      }

      const achievement = new Achievement({
        id,
        name,
        description,
        type,
        category,
        icon,
        badge,
        color,
        criteria,
        points,
        rarity
      });

      await achievement.save();

      res.status(201).json({
        success: true,
        data: achievement,
        message: 'Achievement created successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error creating achievement',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Update achievement
  async updateAchievement(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const achievement = await Achievement.findByIdAndUpdate(
        id,
        updates,
        { new: true, runValidators: true }
      );

      if (!achievement) {
        return res.status(404).json({
          success: false,
          message: 'Achievement not found'
        });
      }

      res.json({
        success: true,
        data: achievement,
        message: 'Achievement updated successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating achievement',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Delete achievement
  async deleteAchievement(req, res) {
    try {
      const { id } = req.params;

      const achievement = await Achievement.findByIdAndDelete(id);
      if (!achievement) {
        return res.status(404).json({
          success: false,
          message: 'Achievement not found'
        });
      }

      // Remove achievement from all users who have earned it
      await User.updateMany(
        { 'gamification.badges.id': achievement.id },
        { $pull: { 'gamification.badges': { id: achievement.id } } }
      );

      res.json({
        success: true,
        message: 'Achievement deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error deleting achievement',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Award achievement to user
  async awardAchievementToUser(req, res) {
    try {
      const { userId, achievementId } = req.params;

      const user = await User.findById(userId);
      const achievement = await Achievement.findById(achievementId);

      if (!user || !achievement) {
        return res.status(404).json({
          success: false,
          message: 'User or achievement not found'
        });
      }

      // Check if user already has this achievement
      const hasAchievement = user.gamification?.badges?.some(
        badge => badge.id === achievement.id
      );

      if (hasAchievement) {
        return res.status(400).json({
          success: false,
          message: 'User already has this achievement'
        });
      }

      // Award achievement
      await user.earnBadge({
        id: achievement.id,
        name: achievement.name,
        description: achievement.description,
        icon: achievement.icon,
        category: achievement.category
      });

      res.json({
        success: true,
        message: 'Achievement awarded successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error awarding achievement',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // ===============================
  // ANALYTICS AND REPORTING
  // ===============================

  // Get comprehensive progress analytics
  async getProgressAnalytics(req, res) {
    try {
      const { timeframe = 'month' } = req.query;
      const startDate = this.getStartDate(timeframe);

      // Daily active users
      const dailyActiveUsers = await VisitorActivity.aggregate([
        {
          $match: {
            timestamp: { $gte: startDate },
            activityType: { $ne: 'page_view' }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$timestamp' }
            },
            uniqueUsers: { $addToSet: '$userId' },
            totalActivities: { $sum: 1 }
          }
        },
        {
          $project: {
            date: '$_id',
            users: { $size: '$uniqueUsers' },
            activities: '$totalActivities'
          }
        },
        { $sort: { date: 1 } }
      ]);

      // Course enrollment trends
      const courseEnrollments = await LearningProgress.aggregate([
        {
          $unwind: '$courses'
        },
        {
          $match: {
            'courses.enrolledAt': { $gte: startDate }
          }
        },
        {
          $lookup: {
            from: 'courses',
            localField: 'courses.courseId',
            foreignField: '_id',
            as: 'courseInfo'
          }
        },
        {
          $group: {
            _id: '$courseInfo.title',
            enrollments: { $sum: 1 }
          }
        },
        { $sort: { enrollments: -1 } },
        { $limit: 10 }
      ]);

      // Achievement distribution
      const achievementStats = await Achievement.aggregate([
        {
          $lookup: {
            from: 'users',
            let: { achievementId: '$id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $in: ['$$achievementId', '$gamification.badges.id']
                  }
                }
              }
            ],
            as: 'earnedBy'
          }
        },
        {
          $project: {
            name: 1,
            category: 1,
            rarity: 1,
            earnedCount: { $size: '$earnedBy' }
          }
        },
        { $sort: { earnedCount: -1 } }
      ]);

      // User level distribution
      const levelDistribution = await User.aggregate([
        {
          $match: {
            role: 'user',
            isActive: true
          }
        },
        {
          $group: {
            _id: '$stats.level',
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      // Activity type breakdown
      const activityBreakdown = await VisitorActivity.aggregate([
        {
          $match: {
            timestamp: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: '$activityType',
            count: { $sum: 1 },
            totalPoints: { $sum: '$pointsEarned' }
          }
        },
        { $sort: { count: -1 } }
      ]);

      // Get overview stats
      const overviewStats = await this.getProgressOverviewStats();

      res.json({
        success: true,
        data: {
          overview: overviewStats,
          dailyActiveUsers,
          courseEnrollments,
          achievementStats,
          levelDistribution,
          activityBreakdown,
          timeframe
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching progress analytics',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get progress overview statistics
  async getProgressOverviewStats() {
    const totalUsers = await User.countDocuments({ role: 'user', isActive: true });
    
    const activeUsers = await VisitorActivity.distinct('userId', {
      timestamp: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });

    const totalAchievements = await Achievement.countDocuments({ isActive: true });
    
    const completionStats = await LearningProgress.aggregate([
      {
        $group: {
          _id: null,
          avgCompletionRate: { $avg: '$overallStats.averageScore' },
          avgProgress: { $avg: '$overallStats.totalLessonsCompleted' }
        }
      }
    ]);

    const achievementsEarned = await User.aggregate([
      {
        $match: { role: 'user', isActive: true }
      },
      {
        $project: {
          badgeCount: { $size: '$gamification.badges' }
        }
      },
      {
        $group: {
          _id: null,
          totalEarned: { $sum: '$badgeCount' }
        }
      }
    ]);

    return {
      totalUsers,
      activeUsers: activeUsers.length,
      completionRate: Math.round(completionStats[0]?.avgCompletionRate || 0),
      averageProgress: Math.round(completionStats[0]?.avgProgress || 0),
      totalAchievements,
      achievementsEarned: achievementsEarned[0]?.totalEarned || 0
    };
  }

  // Helper method to get start date based on timeframe
  getStartDate(timeframe) {
    const date = new Date();
    switch (timeframe) {
      case 'week':
        date.setDate(date.getDate() - 7);
        break;
      case 'month':
        date.setMonth(date.getMonth() - 1);
        break;
      case 'quarter':
        date.setMonth(date.getMonth() - 3);
        break;
      case 'year':
        date.setFullYear(date.getFullYear() - 1);
        break;
      default:
        date.setMonth(date.getMonth() - 1);
    }
    return date;
  }

  // Export user progress data
  async exportProgressData(req, res) {
    try {
      const { format = 'json', userIds } = req.query;
      
      let query = { role: 'user', isActive: true };
      if (userIds) {
        query._id = { $in: userIds.split(',') };
      }

      const users = await User.find(query)
        .select('firstName lastName email stats gamification createdAt lastLogin');

      const userProgressData = await Promise.all(
        users.map(async (user) => {
          const learningProgress = await LearningProgress.findOne({ 
            userId: user._id 
          }).populate('courses.courseId', 'title');

          const activitySummary = await VisitorActivity.aggregate([
            { $match: { userId: user._id } },
            {
              $group: {
                _id: '$activityType',
                count: { $sum: 1 },
                totalPoints: { $sum: '$pointsEarned' }
              }
            }
          ]);

          return {
            user: {
              id: user._id,
              name: `${user.firstName} ${user.lastName}`,
              email: user.email,
              joinDate: user.createdAt,
              lastLogin: user.lastLogin
            },
            stats: user.stats,
            gamification: user.gamification,
            learningProgress: learningProgress?.overallStats || {},
            courses: learningProgress?.courses || [],
            activitySummary
          };
        })
      );

      if (format === 'csv') {
        // Convert to CSV format
        const csv = this.convertToCSV(userProgressData);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="user_progress.csv"');
        return res.send(csv);
      }

      res.json({
        success: true,
        data: userProgressData,
        exportDate: new Date(),
        totalUsers: userProgressData.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error exporting progress data',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Helper method to convert data to CSV
  convertToCSV(data) {
    const headers = [
      'User ID', 'Name', 'Email', 'Join Date', 'Last Login',
      'Total Points', 'Level', 'Achievements Count',
      'Lessons Completed', 'Average Score', 'Current Streak'
    ];

    const rows = data.map(item => [
      item.user.id,
      item.user.name,
      item.user.email,
      item.user.joinDate,
      item.user.lastLogin || 'Never',
      item.stats?.totalPoints || 0,
      item.stats?.level || 1,
      item.gamification?.badges?.length || 0,
      item.learningProgress.totalLessonsCompleted || 0,
      item.learningProgress.averageScore || 0,
      item.gamification?.currentStreak || 0
    ]);

    return [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
  }
}

module.exports = new AdminProgressController();
