const pointsSystem = require('../services/pointsSystem');
const User = require('../models/User');
const VisitorActivity = require('../models/VisitorActivity');
const Achievement = require('../models/Achievement');

class LeaderboardController {
  // ===============================
  // GLOBAL LEADERBOARDS
  // ===============================

  // Get main leaderboard
  async getLeaderboard(req, res) {
    try {
      const { 
        timeframe = 'allTime', 
        limit = 10,
        category = 'overall'
      } = req.query;

      let leaderboardData;

      switch (category) {
        case 'overall':
          leaderboardData = await pointsSystem.getLeaderboard(timeframe, parseInt(limit));
          break;
        case 'games':
          leaderboardData = await this.getGameLeaderboard(timeframe, parseInt(limit));
          break;
        case 'quizzes':
          leaderboardData = await this.getQuizLeaderboard(timeframe, parseInt(limit));
          break;
        case 'collections':
          leaderboardData = await this.getCollectionLeaderboard(timeframe, parseInt(limit));
          break;
        case 'courses':
          leaderboardData = await this.getCourseLeaderboard(timeframe, parseInt(limit));
          break;
        default:
          leaderboardData = await pointsSystem.getLeaderboard(timeframe, parseInt(limit));
      }

      // Anonymize data if user is not authenticated or opted for privacy
      const anonymizedData = this.anonymizeLeaderboard(leaderboardData, req.user);

      res.json({
        success: true,
        data: anonymizedData,
        metadata: {
          timeframe,
          category,
          limit: parseInt(limit),
          generatedAt: new Date()
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching leaderboard',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get user's leaderboard position
  async getUserPosition(req, res) {
    try {
      const { timeframe = 'allTime', category = 'overall' } = req.query;
      const userId = req.user.id;

      let position;
      let totalParticipants;
      let userStats;

      if (timeframe === 'allTime' && category === 'overall') {
        // Get user's all-time position
        const user = await User.findById(userId);
        const userPoints = user.stats?.totalPoints || 0;
        
        position = await User.countDocuments({
          'stats.totalPoints': { $gt: userPoints }
        }) + 1;

        totalParticipants = await User.countDocuments({
          'stats.totalPoints': { $gt: 0 }
        });

        userStats = {
          totalPoints: userPoints,
          level: user.stats?.level || 1,
          achievements: user.stats?.achievements?.length || 0
        };
      } else {
        // Get user's position for specific timeframe
        const endDate = new Date();
        let startDate = new Date();

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

        const userActivities = await VisitorActivity.find({
          user: userId,
          timestamp: { $gte: startDate, $lte: endDate }
        });

        const userPoints = userActivities.reduce((total, activity) => 
          total + (activity.pointsEarned || 0), 0
        );

        // Get aggregated data for all users in timeframe
        const aggregation = await VisitorActivity.aggregate([
          {
            $match: {
              timestamp: { $gte: startDate, $lte: endDate },
              pointsEarned: { $gt: 0 }
            }
          },
          {
            $group: {
              _id: '$user',
              totalPoints: { $sum: '$pointsEarned' }
            }
          },
          { $sort: { totalPoints: -1 } }
        ]);

        position = aggregation.findIndex(item => 
          item._id.toString() === userId.toString()
        ) + 1;

        totalParticipants = aggregation.length;

        userStats = {
          totalPoints: userPoints,
          activitiesCount: userActivities.length
        };
      }

      res.json({
        success: true,
        data: {
          position: position || 'Unranked',
          totalParticipants,
          percentile: totalParticipants > 0 ? 
            Math.round(((totalParticipants - position + 1) / totalParticipants) * 100) : 0,
          userStats,
          timeframe,
          category
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching user position',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // ===============================
  // CATEGORY-SPECIFIC LEADERBOARDS
  // ===============================

  // Get games leaderboard
  async getGameLeaderboard(timeframe, limit) {
    const endDate = new Date();
    let startDate = new Date();
    let matchStage = { type: 'GAME_COMPLETION' };

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
      matchStage.timestamp = { $gte: startDate, $lte: endDate };
    }

    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: '$user',
          totalPoints: { $sum: '$pointsEarned' },
          gamesCompleted: { $sum: 1 },
          avgScore: { $avg: '$details.score' }
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
          gamesCompleted: 1,
          avgScore: { $round: ['$avgScore', 1] },
          level: '$user.stats.level'
        }
      },
      { $sort: { totalPoints: -1 } },
      { $limit: limit }
    ];

    return await VisitorActivity.aggregate(pipeline);
  }

  // Get quiz leaderboard
  async getQuizLeaderboard(timeframe, limit) {
    const endDate = new Date();
    let startDate = new Date();
    let matchStage = { type: 'QUIZ_COMPLETION' };

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
      matchStage.timestamp = { $gte: startDate, $lte: endDate };
    }

    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: '$user',
          totalPoints: { $sum: '$pointsEarned' },
          quizzesCompleted: { $sum: 1 },
          avgScore: { $avg: '$details.score' },
          perfectScores: {
            $sum: { $cond: [{ $gte: ['$details.score', 100] }, 1, 0] }
          }
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
          quizzesCompleted: 1,
          avgScore: { $round: ['$avgScore', 1] },
          perfectScores: 1,
          level: '$user.stats.level'
        }
      },
      { $sort: { totalPoints: -1 } },
      { $limit: limit }
    ];

    return await VisitorActivity.aggregate(pipeline);
  }

  // Get collections leaderboard
  async getCollectionLeaderboard(timeframe, limit) {
    const endDate = new Date();
    let startDate = new Date();
    let matchStage = { 
      type: { $in: ['COLLECTION_CREATED', 'COLLECTION_SHARED', 'COLLECTION_LIKED'] }
    };

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
      matchStage.timestamp = { $gte: startDate, $lte: endDate };
    }

    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: '$user',
          totalPoints: { $sum: '$pointsEarned' },
          collectionsCreated: {
            $sum: { $cond: [{ $eq: ['$type', 'COLLECTION_CREATED'] }, 1, 0] }
          },
          collectionsShared: {
            $sum: { $cond: [{ $eq: ['$type', 'COLLECTION_SHARED'] }, 1, 0] }
          },
          likesReceived: {
            $sum: { $cond: [{ $eq: ['$type', 'COLLECTION_LIKED'] }, 1, 0] }
          }
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
          collectionsCreated: 1,
          collectionsShared: 1,
          likesReceived: 1,
          level: '$user.stats.level'
        }
      },
      { $sort: { totalPoints: -1 } },
      { $limit: limit }
    ];

    return await VisitorActivity.aggregate(pipeline);
  }

  // Get course leaderboard
  async getCourseLeaderboard(timeframe, limit) {
    const endDate = new Date();
    let startDate = new Date();
    let matchStage = { 
      type: { $in: ['COURSE_COMPLETION', 'LESSON_COMPLETION'] }
    };

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
      matchStage.timestamp = { $gte: startDate, $lte: endDate };
    }

    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: '$user',
          totalPoints: { $sum: '$pointsEarned' },
          coursesCompleted: {
            $sum: { $cond: [{ $eq: ['$type', 'COURSE_COMPLETION'] }, 1, 0] }
          },
          lessonsCompleted: {
            $sum: { $cond: [{ $eq: ['$type', 'LESSON_COMPLETION'] }, 1, 0] }
          }
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
          coursesCompleted: 1,
          lessonsCompleted: 1,
          level: '$user.stats.level'
        }
      },
      { $sort: { totalPoints: -1 } },
      { $limit: limit }
    ];

    return await VisitorActivity.aggregate(pipeline);
  }

  // ===============================
  // ACHIEVEMENTS LEADERBOARD
  // ===============================

  // Get achievements leaderboard
  async getAchievementsLeaderboard(req, res) {
    try {
      const { limit = 10 } = req.query;

      const pipeline = [
        { $match: { 'stats.achievements': { $exists: true, $ne: [] } } },
        {
          $project: {
            name: { $concat: ['$firstName', ' ', '$lastName'] },
            achievementCount: { $size: '$stats.achievements' },
            level: '$stats.level',
            totalPoints: '$stats.totalPoints'
          }
        },
        { $sort: { achievementCount: -1, totalPoints: -1 } },
        { $limit: parseInt(limit) }
      ];

      const leaderboard = await User.aggregate(pipeline);
      const anonymizedData = this.anonymizeLeaderboard(leaderboard, req.user);

      res.json({
        success: true,
        data: anonymizedData
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching achievements leaderboard',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // ===============================
  // STATISTICS AND INSIGHTS
  // ===============================

  // Get leaderboard statistics
  async getLeaderboardStats(req, res) {
    try {
      const stats = await Promise.all([
        // Total active users
        User.countDocuments({ 'stats.totalPoints': { $gt: 0 } }),
        
        // Average points
        User.aggregate([
          { $match: { 'stats.totalPoints': { $gt: 0 } } },
          { $group: { _id: null, avgPoints: { $avg: '$stats.totalPoints' } } }
        ]),
        
        // Level distribution
        User.aggregate([
          { $match: { 'stats.level': { $exists: true } } },
          { $group: { _id: '$stats.level', count: { $sum: 1 } } },
          { $sort: { _id: 1 } }
        ]),

        // Top achievements
        Achievement.find({ isActive: true })
          .populate({
            path: 'earnedBy',
            model: 'User',
            select: 'firstName lastName'
          })
          .sort({ 'earnedBy': -1 })
          .limit(5),

        // Recent activity stats
        VisitorActivity.aggregate([
          {
            $match: {
              timestamp: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
            }
          },
          {
            $group: {
              _id: '$type',
              count: { $sum: 1 },
              totalPoints: { $sum: '$pointsEarned' }
            }
          },
          { $sort: { count: -1 } },
          { $limit: 10 }
        ])
      ]);

      res.json({
        success: true,
        data: {
          activeUsers: stats[0],
          averagePoints: Math.round(stats[1][0]?.avgPoints || 0),
          levelDistribution: stats[2],
          topAchievements: stats[3],
          recentActivity: stats[4]
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching leaderboard statistics',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // ===============================
  // UTILITY METHODS
  // ===============================

  // Anonymize leaderboard data for privacy
  anonymizeLeaderboard(leaderboard, currentUser) {
    return leaderboard.map((entry, index) => {
      const isCurrentUser = currentUser && 
        (entry._id?.toString() === currentUser.id.toString() || 
         entry.user?._id?.toString() === currentUser.id.toString());

      return {
        ...entry,
        rank: index + 1,
        name: isCurrentUser ? entry.name : `Player ${index + 1}`,
        email: undefined, // Always hide email
        isCurrentUser
      };
    });
  }

  // Get user's weekly progress
  async getWeeklyProgress(req, res) {
    try {
      const userId = req.user.id;
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 7);

      const dailyProgress = await VisitorActivity.aggregate([
        {
          $match: {
            user: userId,
            timestamp: { $gte: startDate, $lte: endDate }
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

      // Fill in missing days with 0 points
      const progressMap = new Map();
      dailyProgress.forEach(day => {
        progressMap.set(day._id, day);
      });

      const completeProgress = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(endDate.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        completeProgress.push({
          date: dateStr,
          totalPoints: progressMap.get(dateStr)?.totalPoints || 0,
          activitiesCount: progressMap.get(dateStr)?.activitiesCount || 0
        });
      }

      res.json({
        success: true,
        data: completeProgress
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching weekly progress',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = new LeaderboardController();
