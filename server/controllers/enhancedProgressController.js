const progressController = require('./progressController');
const pointsSystem = require('../services/pointsSystem');
const UserGoal = require('../models/UserGoal');
const Achievement = require('../models/Achievement');
const VisitorActivity = require('../models/VisitorActivity');
const User = require('../models/User');

/**
 * Enhanced Progress Controller with Points Integration
 * Extends the existing progressController with points system functionality
 */

class EnhancedProgressController {
  // ===============================
  // POINTS AND REWARDS
  // ===============================

  // Get user's points overview
  async getPointsOverview(req, res) {
    try {
      const userId = req.user.id;
      const { timeframe = 'month' } = req.query;

      // Get user's current stats
      const user = await User.findById(userId);
      const userStats = user.stats || { totalPoints: 0, level: 1, achievements: [] };

      // Get point history
      const pointHistory = await pointsSystem.getUserPointHistory(userId, timeframe);

      // Calculate points by activity type
      const pointsByActivity = await VisitorActivity.aggregate([
        {
          $match: {
            user: userId,
            pointsEarned: { $gt: 0 }
          }
        },
        {
          $group: {
            _id: '$type',
            totalPoints: { $sum: '$pointsEarned' },
            count: { $sum: 1 }
          }
        },
        { $sort: { totalPoints: -1 } }
      ]);

      // Get level progress
      const currentLevel = userStats.level;
      const currentPoints = userStats.totalPoints;
      const pointsForNextLevel = pointsSystem.getPointsForNextLevel(currentLevel);
      const pointsForCurrentLevel = currentLevel > 1 ? pointsSystem.getPointsForNextLevel(currentLevel - 1) : 0;
      const pointsProgress = currentPoints - pointsForCurrentLevel;
      const pointsNeeded = pointsForNextLevel - pointsForCurrentLevel;

      res.json({
        success: true,
        data: {
          currentStats: {
            totalPoints: userStats.totalPoints,
            level: userStats.level,
            achievements: userStats.achievements.length
          },
          levelProgress: {
            currentLevel,
            pointsProgress,
            pointsNeeded,
            progressPercentage: Math.min(100, Math.round((pointsProgress / pointsNeeded) * 100))
          },
          pointHistory,
          pointsByActivity,
          timeframe
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching points overview',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Award points for completing a goal
  async completeGoal(req, res) {
    try {
      const { id } = req.params;
      const { notes } = req.body;

      const goal = await UserGoal.findOne({
        _id: id,
        user: req.user.id
      });

      if (!goal) {
        return res.status(404).json({ 
          success: false, 
          message: 'Goal not found' 
        });
      }

      if (goal.status === 'completed') {
        return res.status(400).json({
          success: false,
          message: 'Goal is already completed'
        });
      }

      // Update goal status
      goal.status = 'completed';
      goal.progress = goal.target;
      goal.completedAt = new Date();
      
      if (notes) {
        goal.notes = notes;
      }

      await goal.save();

      // Award points for goal completion
      const pointsResult = await pointsSystem.awardPoints(
        req.user.id, 
        'GOAL_COMPLETED', 
        {
          goalId: goal._id,
          goalType: goal.type,
          targetValue: goal.target,
          completionTime: Date.now() - goal.createdAt.getTime(),
          category: goal.category
        }
      );

      res.json({
        success: true,
        data: {
          goal,
          pointsAwarded: pointsResult.pointsEarned,
          newLevel: pointsResult.level,
          leveledUp: pointsResult.leveledUp,
          achievements: pointsResult.achievements,
          pointsBreakdown: pointsResult.breakdown
        },
        message: 'Goal completed successfully!'
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: error.message 
      });
    }
  }

  // Create goal with points integration
  async createGoalWithRewards(req, res) {
    try {
      // Call original createGoal method
      const originalResult = await progressController.createGoal(req, res);
      
      // If goal creation was successful, award points
      if (res.statusCode === 201) {
        try {
          await pointsSystem.awardPoints(
            req.user.id,
            'GOAL_CREATED',
            {
              goalType: req.body.type,
              category: req.body.category,
              target: req.body.target
            }
          );
        } catch (pointsError) {
          console.error('Error awarding points for goal creation:', pointsError);
          // Don't fail the request if points awarding fails
        }
      }

      return originalResult;
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // ===============================
  // ENHANCED ANALYTICS
  // ===============================

  // Get comprehensive progress analytics with points
  async getDetailedProgressAnalytics(req, res) {
    try {
      const userId = req.user.id;
      const { timeframe = 'month' } = req.query;

      // Get original progress overview
      const progressOverview = await this.getProgressOverviewData(userId, timeframe);
      
      // Get points data
      const pointsData = await this.getPointsAnalytics(userId, timeframe);
      
      // Get achievement progress
      const achievementProgress = await this.getAchievementProgress(userId);
      
      // Get activity streaks
      const streakData = await this.getStreakAnalytics(userId);

      res.json({
        success: true,
        data: {
          progress: progressOverview,
          points: pointsData,
          achievements: achievementProgress,
          streaks: streakData,
          timeframe
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching detailed analytics',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Helper method to get progress overview data
  async getProgressOverviewData(userId, timeframe) {
    const startDate = this.getStartDate(timeframe);
    
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

    // Activity statistics
    const activityStats = await VisitorActivity.aggregate([
      {
        $match: {
          user: userId,
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalPoints: { $sum: '$pointsEarned' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    return {
      goals: goalStats,
      activities: activityStats
    };
  }

  // Helper method to get points analytics
  async getPointsAnalytics(userId, timeframe) {
    const startDate = this.getStartDate(timeframe);
    
    // Daily points breakdown
    const dailyPoints = await VisitorActivity.aggregate([
      {
        $match: {
          user: userId,
          timestamp: { $gte: startDate },
          pointsEarned: { $gt: 0 }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$timestamp' }
          },
          totalPoints: { $sum: '$pointsEarned' },
          activitiesCount: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Points by category
    const pointsByCategory = await VisitorActivity.aggregate([
      {
        $match: {
          user: userId,
          timestamp: { $gte: startDate },
          pointsEarned: { $gt: 0 }
        }
      },
      {
        $group: {
          _id: '$type',
          totalPoints: { $sum: '$pointsEarned' },
          count: { $sum: 1 },
          avgPoints: { $avg: '$pointsEarned' }
        }
      },
      { $sort: { totalPoints: -1 } }
    ]);

    return {
      dailyBreakdown: dailyPoints,
      categoryBreakdown: pointsByCategory,
      totalEarned: dailyPoints.reduce((sum, day) => sum + day.totalPoints, 0)
    };
  }

  // Helper method to get achievement progress
  async getAchievementProgress(userId) {
    const user = await User.findById(userId);
    const userAchievements = user.stats?.achievements || [];

    // Get available achievements
    const allAchievements = await Achievement.find({ isActive: true });
    
    // Calculate progress for each category
    const achievementsByCategory = {};
    allAchievements.forEach(achievement => {
      if (!achievementsByCategory[achievement.category]) {
        achievementsByCategory[achievement.category] = {
          total: 0,
          earned: 0,
          achievements: []
        };
      }
      
      const isEarned = userAchievements.some(ua => 
        ua.achievementId?.toString() === achievement._id.toString()
      );
      
      achievementsByCategory[achievement.category].total++;
      if (isEarned) {
        achievementsByCategory[achievement.category].earned++;
      }
      
      achievementsByCategory[achievement.category].achievements.push({
        ...achievement.toObject(),
        earned: isEarned,
        earnedAt: userAchievements.find(ua => 
          ua.achievementId?.toString() === achievement._id.toString()
        )?.earnedAt
      });
    });

    return {
      total: allAchievements.length,
      earned: userAchievements.length,
      byCategory: achievementsByCategory,
      recentlyEarned: userAchievements
        .sort((a, b) => new Date(b.earnedAt) - new Date(a.earnedAt))
        .slice(0, 5)
    };
  }

  // Helper method to get streak analytics
  async getStreakAnalytics(userId) {
    const activities = await VisitorActivity.find({ user: userId });
    const currentStreak = pointsSystem.calculateCurrentStreak(activities);
    
    // Calculate longest streak
    const dailyActivities = new Map();
    activities.forEach(activity => {
      const date = activity.timestamp.toDateString();
      if (!dailyActivities.has(date)) {
        dailyActivities.set(date, true);
      }
    });
    
    const sortedDates = Array.from(dailyActivities.keys())
      .map(date => new Date(date))
      .sort((a, b) => a - b);
    
    let longestStreak = 0;
    let currentStreakCount = 0;
    
    for (let i = 0; i < sortedDates.length; i++) {
      if (i === 0) {
        currentStreakCount = 1;
      } else {
        const prevDate = sortedDates[i - 1];
        const currDate = sortedDates[i];
        const daysDiff = (currDate - prevDate) / (1000 * 60 * 60 * 24);
        
        if (daysDiff === 1) {
          currentStreakCount++;
        } else {
          longestStreak = Math.max(longestStreak, currentStreakCount);
          currentStreakCount = 1;
        }
      }
    }
    longestStreak = Math.max(longestStreak, currentStreakCount);

    return {
      current: currentStreak,
      longest: longestStreak,
      activeDays: dailyActivities.size,
      streakBonus: currentStreak >= 7
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
      case 'year':
        date.setFullYear(date.getFullYear() - 1);
        break;
      default:
        date.setMonth(date.getMonth() - 1);
    }
    return date;
  }

  // ===============================
  // MILESTONE AND ACHIEVEMENT TRACKING
  // ===============================

  // Check for milestone achievements
  async checkMilestones(req, res) {
    try {
      const userId = req.user.id;
      
      // Get user's current stats
      const user = await User.findById(userId);
      const activities = await VisitorActivity.find({ user: userId });
      
      // Check various milestones
      const milestones = {
        pointMilestones: this.checkPointMilestones(user.stats?.totalPoints || 0),
        activityMilestones: this.checkActivityMilestones(activities),
        streakMilestones: this.checkStreakMilestones(activities),
        goalMilestones: await this.checkGoalMilestones(userId)
      };

      res.json({
        success: true,
        data: milestones
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error checking milestones',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Helper methods for milestone checking
  checkPointMilestones(totalPoints) {
    const milestones = [100, 500, 1000, 2500, 5000, 10000];
    return milestones.map(milestone => ({
      milestone,
      achieved: totalPoints >= milestone,
      progress: Math.min(100, (totalPoints / milestone) * 100)
    }));
  }

  checkActivityMilestones(activities) {
    const activityCounts = activities.reduce((counts, activity) => {
      counts[activity.type] = (counts[activity.type] || 0) + 1;
      return counts;
    }, {});

    const milestones = {
      'QUIZ_COMPLETION': [1, 5, 10, 25, 50],
      'GAME_COMPLETION': [1, 5, 10, 25, 50],
      'COLLECTION_CREATED': [1, 3, 5, 10, 25]
    };

    const results = {};
    Object.keys(milestones).forEach(type => {
      const count = activityCounts[type] || 0;
      results[type] = milestones[type].map(milestone => ({
        milestone,
        achieved: count >= milestone,
        progress: Math.min(100, (count / milestone) * 100)
      }));
    });

    return results;
  }

  checkStreakMilestones(activities) {
    const currentStreak = pointsSystem.calculateCurrentStreak(activities);
    const milestones = [3, 7, 14, 30, 60, 100];
    
    return milestones.map(milestone => ({
      milestone,
      achieved: currentStreak >= milestone,
      progress: Math.min(100, (currentStreak / milestone) * 100)
    }));
  }

  async checkGoalMilestones(userId) {
    const goalStats = await UserGoal.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const completedGoals = goalStats.find(stat => stat._id === 'completed')?.count || 0;
    const milestones = [1, 5, 10, 25, 50];
    
    return milestones.map(milestone => ({
      milestone,
      achieved: completedGoals >= milestone,
      progress: Math.min(100, (completedGoals / milestone) * 100)
    }));
  }

  // ===============================
  // DELEGATION TO ORIGINAL CONTROLLER
  // ===============================

  // Delegate all other methods to the original controller
  async getGoals(req, res) {
    return progressController.getGoals(req, res);
  }

  async createGoal(req, res) {
    return this.createGoalWithRewards(req, res);
  }

  async getGoal(req, res) {
    return progressController.getGoal(req, res);
  }

  async updateGoal(req, res) {
    return progressController.updateGoal(req, res);
  }

  async updateGoalProgress(req, res) {
    return progressController.updateGoalProgress(req, res);
  }

  async deleteGoal(req, res) {
    return progressController.deleteGoal(req, res);
  }

  async getAchievements(req, res) {
    return progressController.getAchievements(req, res);
  }

  async getActivityLog(req, res) {
    return progressController.getActivityLog(req, res);
  }

  async getProgressOverview(req, res) {
    return progressController.getProgressOverview(req, res);
  }

  async getDetailedStats(req, res) {
    return progressController.getDetailedStats(req, res);
  }

  async getGoalTemplates(req, res) {
    return progressController.getGoalTemplates(req, res);
  }
}

module.exports = new EnhancedProgressController();
