const User = require('../models/User');
const VisitorActivity = require('../models/VisitorActivity');
const UserGoal = require('../models/UserGoal');
const Achievement = require('../models/Achievement');

/**
 * Points System Service
 * Handles point calculation, awarding, and tracking for user activities
 */

class PointsSystem {
  constructor() {
    // Define point values for different activities
    this.POINT_VALUES = {
      // Quiz and Assessment Activities
      QUIZ_COMPLETION: 50,
      QUIZ_PERFECT_SCORE: 100,
      QUIZ_FIRST_TRY: 25,
      
      // Game Activities
      GAME_COMPLETION: 40,
      GAME_HIGH_SCORE: 75,
      GAME_FIRST_PLAY: 20,
      GAME_STREAK: 30, // Playing games on consecutive days
      
      // Tool Usage
      TOOL_USAGE: 15,
      TOOL_SESSION_COMPLETE: 25,
      TOOL_REVIEW: 20,
      
      // Collection Activities
      COLLECTION_CREATED: 30,
      COLLECTION_ITEM_ADDED: 5,
      COLLECTION_SHARED: 40,
      COLLECTION_LIKED: 10,
      COLLECTION_FORKED: 35,
      
      // Course and Learning Activities
      COURSE_ENROLLMENT: 25,
      COURSE_COMPLETION: 200,
      LESSON_COMPLETION: 30,
      
      // Museum and Tour Activities
      MUSEUM_VISIT: 20,
      TOUR_COMPLETION: 60,
      ARTIFACT_VIEWED: 5,
      
      // Social Activities
      COMMENT_POSTED: 10,
      HELPFUL_REVIEW: 15,
      FORUM_PARTICIPATION: 12,
      
      // Goal and Progress Activities
      GOAL_CREATED: 20,
      GOAL_COMPLETED: 100,
      MILESTONE_REACHED: 50,
      STREAK_MAINTAINED: 25, // Daily activity streak
      
      // Achievement Bonuses
      ACHIEVEMENT_EARNED: 150,
      RARE_ACHIEVEMENT: 300,
      
      // Daily/Weekly Bonuses
      DAILY_LOGIN: 5,
      FIRST_ACTIVITY_OF_DAY: 10,
      WEEKLY_GOAL_MET: 100
    };

    // Multipliers for different contexts
    this.MULTIPLIERS = {
      DIFFICULTY: {
        beginner: 1.0,
        intermediate: 1.2,
        advanced: 1.5,
        expert: 2.0
      },
      
      TIME_BONUS: {
        QUICK_COMPLETION: 1.3, // Completing within expected time
        EXTENDED_SESSION: 1.1   // Long study sessions
      },
      
      STREAK_BONUS: {
        WEEK_1: 1.0,
        WEEK_2: 1.1,
        WEEK_3: 1.2,
        WEEK_4: 1.3,
        MONTH_PLUS: 1.5
      },
      
      PERFORMANCE: {
        EXCELLENT: 1.5, // 90-100% score
        GOOD: 1.2,      // 70-89% score
        AVERAGE: 1.0,   // 50-69% score
        BELOW_AVERAGE: 0.8 // Below 50% score
      }
    };
  }

  /**
   * Award points for a specific activity
   */
  async awardPoints(userId, activity, metadata = {}) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const pointData = await this.calculatePoints(activity, metadata);
      
      // Update user points
      if (!user.stats) {
        user.stats = {
          totalPoints: 0,
          level: 1,
          achievements: []
        };
      }

      user.stats.totalPoints += pointData.points;
      
      // Calculate new level
      const newLevel = this.calculateLevel(user.stats.totalPoints);
      const leveledUp = newLevel > user.stats.level;
      user.stats.level = newLevel;

      // Record activity
      const activityRecord = new VisitorActivity({
        user: userId,
        type: activity,
        details: {
          pointsEarned: pointData.points,
          basePoints: pointData.basePoints,
          multiplier: pointData.multiplier,
          bonuses: pointData.bonuses,
          ...metadata
        },
        pointsEarned: pointData.points
      });

      await Promise.all([
        user.save(),
        activityRecord.save()
      ]);

      // Check for achievements
      const achievements = await this.checkAchievements(userId, activity, metadata);

      // Check for level-up achievements
      if (leveledUp) {
        achievements.push(...await this.checkLevelAchievements(userId, newLevel));
      }

      return {
        pointsEarned: pointData.points,
        totalPoints: user.stats.totalPoints,
        level: user.stats.level,
        leveledUp,
        achievements,
        breakdown: pointData
      };
    } catch (error) {
      console.error('Error awarding points:', error);
      throw error;
    }
  }

  /**
   * Calculate points for an activity with multipliers and bonuses
   */
  async calculatePoints(activity, metadata = {}) {
    const basePoints = this.POINT_VALUES[activity] || 0;
    let multiplier = 1.0;
    let bonuses = [];

    // Apply difficulty multiplier
    if (metadata.difficulty && this.MULTIPLIERS.DIFFICULTY[metadata.difficulty]) {
      multiplier *= this.MULTIPLIERS.DIFFICULTY[metadata.difficulty];
      bonuses.push(`${metadata.difficulty} difficulty`);
    }

    // Apply performance multiplier
    if (metadata.score !== undefined) {
      const performanceMultiplier = this.getPerformanceMultiplier(metadata.score);
      multiplier *= performanceMultiplier.multiplier;
      if (performanceMultiplier.multiplier !== 1.0) {
        bonuses.push(performanceMultiplier.description);
      }
    }

    // Apply time-based bonuses
    if (metadata.completionTime && metadata.expectedTime) {
      const timeRatio = metadata.completionTime / metadata.expectedTime;
      if (timeRatio <= 0.8) { // Completed 20% faster than expected
        multiplier *= this.MULTIPLIERS.TIME_BONUS.QUICK_COMPLETION;
        bonuses.push('Quick completion');
      }
    }

    // Apply streak bonuses
    if (metadata.streakDays) {
      const streakMultiplier = this.getStreakMultiplier(metadata.streakDays);
      multiplier *= streakMultiplier.multiplier;
      if (streakMultiplier.multiplier > 1.0) {
        bonuses.push(streakMultiplier.description);
      }
    }

    const finalPoints = Math.round(basePoints * multiplier);

    return {
      basePoints,
      multiplier,
      bonuses,
      points: finalPoints
    };
  }

  /**
   * Get performance-based multiplier
   */
  getPerformanceMultiplier(score) {
    if (score >= 90) {
      return { multiplier: this.MULTIPLIERS.PERFORMANCE.EXCELLENT, description: 'Excellent performance' };
    } else if (score >= 70) {
      return { multiplier: this.MULTIPLIERS.PERFORMANCE.GOOD, description: 'Good performance' };
    } else if (score >= 50) {
      return { multiplier: this.MULTIPLIERS.PERFORMANCE.AVERAGE, description: 'Average performance' };
    } else {
      return { multiplier: this.MULTIPLIERS.PERFORMANCE.BELOW_AVERAGE, description: 'Below average performance' };
    }
  }

  /**
   * Get streak-based multiplier
   */
  getStreakMultiplier(streakDays) {
    if (streakDays >= 30) {
      return { multiplier: this.MULTIPLIERS.STREAK_BONUS.MONTH_PLUS, description: 'Monthly streak' };
    } else if (streakDays >= 21) {
      return { multiplier: this.MULTIPLIERS.STREAK_BONUS.WEEK_4, description: '3+ week streak' };
    } else if (streakDays >= 14) {
      return { multiplier: this.MULTIPLIERS.STREAK_BONUS.WEEK_3, description: '2+ week streak' };
    } else if (streakDays >= 7) {
      return { multiplier: this.MULTIPLIERS.STREAK_BONUS.WEEK_2, description: '1+ week streak' };
    } else {
      return { multiplier: this.MULTIPLIERS.STREAK_BONUS.WEEK_1, description: 'Starting streak' };
    }
  }

  /**
   * Calculate user level based on total points
   */
  calculateLevel(totalPoints) {
    // Exponential level calculation
    // Level 1: 0-99 points
    // Level 2: 100-299 points  
    // Level 3: 300-599 points
    // etc.
    return Math.floor(Math.sqrt(totalPoints / 50)) + 1;
  }

  /**
   * Get points required for next level
   */
  getPointsForNextLevel(currentLevel) {
    const nextLevel = currentLevel + 1;
    return Math.pow(nextLevel - 1, 2) * 50;
  }

  /**
   * Check and award achievements
   */
  async checkAchievements(userId, activity, metadata) {
    const newAchievements = [];
    
    try {
      const user = await User.findById(userId);
      if (!user) return newAchievements;

      const userActivities = await VisitorActivity.find({ user: userId });
      const userAchievements = user.stats?.achievements || [];

      // Activity-specific achievements
      const achievementChecks = {
        QUIZ_COMPLETION: () => this.checkQuizAchievements(userActivities, userAchievements),
        GAME_COMPLETION: () => this.checkGameAchievements(userActivities, userAchievements),
        COLLECTION_CREATED: () => this.checkCollectionAchievements(userActivities, userAchievements),
        COURSE_COMPLETION: () => this.checkCourseAchievements(userActivities, userAchievements),
        DAILY_LOGIN: () => this.checkStreakAchievements(userActivities, userAchievements)
      };

      if (achievementChecks[activity]) {
        const achievements = await achievementChecks[activity]();
        
        for (const achievement of achievements) {
          // Check if user already has this achievement
          if (!userAchievements.find(a => a.achievementId?.toString() === achievement._id.toString())) {
            // Award achievement
            user.stats.achievements.push({
              achievementId: achievement._id,
              earnedAt: new Date(),
              progress: 100
            });

            // Award achievement points
            const achievementPoints = achievement.rarity === 'rare' || achievement.rarity === 'legendary' 
              ? this.POINT_VALUES.RARE_ACHIEVEMENT 
              : this.POINT_VALUES.ACHIEVEMENT_EARNED;
            
            user.stats.totalPoints += achievementPoints;

            newAchievements.push({
              ...achievement.toObject(),
              pointsEarned: achievementPoints
            });
          }
        }

        await user.save();
      }

      return newAchievements;
    } catch (error) {
      console.error('Error checking achievements:', error);
      return newAchievements;
    }
  }

  /**
   * Check quiz-related achievements
   */
  async checkQuizAchievements(userActivities, userAchievements) {
    const achievements = [];
    const quizCompletions = userActivities.filter(a => a.type === 'QUIZ_COMPLETION');
    
    // First quiz completion
    if (quizCompletions.length === 1) {
      const firstQuizAchievement = await Achievement.findOne({ key: 'first_quiz_completed' });
      if (firstQuizAchievement) achievements.push(firstQuizAchievement);
    }

    // Multiple quiz completions
    if (quizCompletions.length === 10) {
      const tenQuizzesAchievement = await Achievement.findOne({ key: 'ten_quizzes_completed' });
      if (tenQuizzesAchievement) achievements.push(tenQuizzesAchievement);
    }

    return achievements;
  }

  /**
   * Check game-related achievements
   */
  async checkGameAchievements(userActivities, userAchievements) {
    const achievements = [];
    const gameCompletions = userActivities.filter(a => a.type === 'GAME_COMPLETION');
    
    if (gameCompletions.length === 1) {
      const firstGameAchievement = await Achievement.findOne({ key: 'first_game_completed' });
      if (firstGameAchievement) achievements.push(firstGameAchievement);
    }

    return achievements;
  }

  /**
   * Check collection-related achievements
   */
  async checkCollectionAchievements(userActivities, userAchievements) {
    const achievements = [];
    const collectionsCreated = userActivities.filter(a => a.type === 'COLLECTION_CREATED');
    
    if (collectionsCreated.length === 1) {
      const firstCollectionAchievement = await Achievement.findOne({ key: 'first_collection_created' });
      if (firstCollectionAchievement) achievements.push(firstCollectionAchievement);
    }

    return achievements;
  }

  /**
   * Check course-related achievements
   */
  async checkCourseAchievements(userActivities, userAchievements) {
    const achievements = [];
    const courseCompletions = userActivities.filter(a => a.type === 'COURSE_COMPLETION');
    
    if (courseCompletions.length === 1) {
      const firstCourseAchievement = await Achievement.findOne({ key: 'first_course_completed' });
      if (firstCourseAchievement) achievements.push(firstCourseAchievement);
    }

    return achievements;
  }

  /**
   * Check streak-related achievements
   */
  async checkStreakAchievements(userActivities, userAchievements) {
    const achievements = [];
    
    // Calculate current streak
    const streak = this.calculateCurrentStreak(userActivities);
    
    if (streak >= 7) {
      const weekStreakAchievement = await Achievement.findOne({ key: 'week_streak' });
      if (weekStreakAchievement) achievements.push(weekStreakAchievement);
    }

    if (streak >= 30) {
      const monthStreakAchievement = await Achievement.findOne({ key: 'month_streak' });
      if (monthStreakAchievement) achievements.push(monthStreakAchievement);
    }

    return achievements;
  }

  /**
   * Check level-based achievements
   */
  async checkLevelAchievements(userId, newLevel) {
    const achievements = [];
    
    const levelMilestones = [5, 10, 25, 50, 100];
    
    for (const milestone of levelMilestones) {
      if (newLevel >= milestone) {
        const levelAchievement = await Achievement.findOne({ 
          key: `level_${milestone}_reached` 
        });
        if (levelAchievement) achievements.push(levelAchievement);
      }
    }

    return achievements;
  }

  /**
   * Calculate current activity streak
   */
  calculateCurrentStreak(userActivities) {
    const today = new Date();
    const activities = userActivities
      .filter(a => a.type === 'DAILY_LOGIN')
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    let streak = 0;
    let currentDate = new Date(today);

    for (const activity of activities) {
      const activityDate = new Date(activity.timestamp);
      const daysDiff = Math.floor((currentDate - activityDate) / (1000 * 60 * 60 * 24));

      if (daysDiff === streak) {
        streak++;
        currentDate = new Date(activityDate);
      } else if (daysDiff > streak + 1) {
        break;
      }
    }

    return streak;
  }

  /**
   * Get user's point history
   */
  async getUserPointHistory(userId, timeframe = 'month') {
    const endDate = new Date();
    let startDate = new Date();

    switch (timeframe) {
      case 'week':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(endDate.getMonth() - 1);
    }

    const activities = await VisitorActivity.find({
      user: userId,
      timestamp: { $gte: startDate, $lte: endDate },
      pointsEarned: { $gt: 0 }
    }).sort({ timestamp: 1 });

    return activities;
  }

  /**
   * Get leaderboard data
   */
  async getLeaderboard(timeframe = 'allTime', limit = 10) {
    const endDate = new Date();
    let startDate = new Date();
    let matchStage = {};

    if (timeframe !== 'allTime') {
      switch (timeframe) {
        case 'daily':
          startDate.setDate(endDate.getDate() - 1);
          break;
        case 'weekly':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case 'monthly':
          startDate.setMonth(endDate.getMonth() - 1);
          break;
      }

      matchStage = {
        timestamp: { $gte: startDate, $lte: endDate }
      };
    }

    let pipeline;

    if (timeframe === 'allTime') {
      // For all-time, use user stats
      pipeline = [
        { $match: { 'stats.totalPoints': { $gt: 0 } } },
        {
          $project: {
            name: { $concat: ['$firstName', ' ', '$lastName'] },
            email: 1,
            totalPoints: '$stats.totalPoints',
            level: '$stats.level'
          }
        },
        { $sort: { totalPoints: -1 } },
        { $limit: limit }
      ];

      return await User.aggregate(pipeline);
    } else {
      // For time-based leaderboards, use activity data
      pipeline = [
        { $match: matchStage },
        {
          $group: {
            _id: '$user',
            totalPoints: { $sum: '$pointsEarned' },
            activitiesCount: { $sum: 1 }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        { $unwind: '$user' },
        {
          $project: {
            name: { $concat: ['$user.firstName', ' ', '$user.lastName'] },
            totalPoints: 1,
            level: '$user.stats.level',
            activitiesCount: 1
          }
        },
        { $sort: { totalPoints: -1 } },
        { $limit: limit }
      ];

      return await VisitorActivity.aggregate(pipeline);
    }
  }
}

module.exports = new PointsSystem();
