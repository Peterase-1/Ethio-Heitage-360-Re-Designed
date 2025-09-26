const Game = require('../models/Game');
const { validationResult } = require('express-validator');

class GamesController {
  // ===============================
  // VISITOR ENDPOINTS
  // ===============================

  // Get published games for visitors
  async getPublishedGames(req, res) {
    try {
      const {
        gameType,
        category,
        difficulty,
        subjects,
        search,
        tags,
        featured,
        popular,
        page = 1,
        limit = 20,
        sort = 'popularityScore'
      } = req.query;

      const filters = {};
      
      if (gameType) filters.gameType = gameType;
      if (category) filters.category = category;
      if (difficulty) filters.difficulty = difficulty;
      if (subjects) filters.subjects = subjects.split(',');
      if (featured === 'true') filters.isFeatured = true;
      if (tags) filters.tags = tags.split(',');

      let games;
      if (search) {
        games = await Game.searchGames(search, filters);
      } else if (popular === 'true') {
        games = await Game.getPopularGames(parseInt(limit));
      } else if (featured === 'true') {
        games = await Game.getFeaturedGames(parseInt(limit));
      } else {
        games = await Game.getPublishedGames(filters);
      }

      // Apply pagination for non-static method calls
      if (!popular && !featured) {
        const skip = (page - 1) * limit;
        games = games.limit(parseInt(limit)).skip(skip);
      }

      const results = await games;
      const total = await Game.countDocuments({
        status: 'published',
        isActive: true,
        'permissions.visitorAccess': true,
        ...filters
      });

      res.json({
        success: true,
        data: results,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching games',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get a specific game by ID (for visitors)
  async getGame(req, res) {
    try {
      const { id } = req.params;
      const game = await Game.findOne({
        _id: id,
        status: 'published',
        isActive: true,
        'permissions.visitorAccess': true
      }).populate('createdBy', 'name')
        .populate('relatedGames', 'title gameType category media.thumbnail stats.averageScore');

      if (!game) {
        return res.status(404).json({
          success: false,
          message: 'Game not found or not accessible'
        });
      }

      // Record view/access
      await game.recordGamePlay(req.user?.id, {
        action: 'viewed',
        timestamp: new Date()
      });

      res.json({
        success: true,
        data: game
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching game details',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Start game session
  async startGameSession(req, res) {
    try {
      const { id } = req.params;
      const { playerData = {} } = req.body;

      const game = await Game.findOne({
        _id: id,
        status: 'published',
        isActive: true,
        'permissions.visitorAccess': true
      });

      if (!game) {
        return res.status(404).json({
          success: false,
          message: 'Game not found or not accessible'
        });
      }

      // Create game session
      const sessionData = await game.createGameSession(req.user?.id, playerData);

      res.json({
        success: true,
        data: sessionData,
        message: 'Game session started successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error starting game session',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Record game play/score
  async recordGamePlay(req, res) {
    try {
      const { id } = req.params;
      const { 
        sessionId, 
        score, 
        completed, 
        timeSpent, 
        actions = [],
        achievements = [],
        metadata = {} 
      } = req.body;

      const game = await Game.findOne({
        _id: id,
        status: 'published',
        isActive: true,
        'permissions.visitorAccess': true
      });

      if (!game) {
        return res.status(404).json({
          success: false,
          message: 'Game not found'
        });
      }

      const playData = await game.recordGamePlay(req.user?.id, {
        sessionId,
        action: completed ? 'completed' : 'played',
        score,
        timeSpent,
        completed,
        actions,
        achievements,
        metadata,
        timestamp: new Date()
      });

      res.json({
        success: true,
        data: playData,
        message: 'Game play recorded successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error recording game play',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get player's game history
  async getPlayerGameHistory(req, res) {
    try {
      const { id } = req.params;
      const { page = 1, limit = 10 } = req.query;

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const game = await Game.findById(id);
      if (!game) {
        return res.status(404).json({
          success: false,
          message: 'Game not found'
        });
      }

      const playerSessions = game.playerSessions.filter(session => 
        session.player.toString() === req.user.id.toString()
      );

      // Pagination
      const skip = (page - 1) * limit;
      const paginatedSessions = playerSessions
        .sort((a, b) => b.playedAt - a.playedAt)
        .slice(skip, skip + limit);

      const playerStats = game.getPlayerStats(req.user.id);

      res.json({
        success: true,
        data: {
          sessions: paginatedSessions,
          stats: playerStats,
          pagination: {
            current: parseInt(page),
            pages: Math.ceil(playerSessions.length / limit),
            total: playerSessions.length
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching player game history',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get leaderboard for a game
  async getGameLeaderboard(req, res) {
    try {
      const { id } = req.params;
      const { timeframe = 'all', limit = 10 } = req.query;

      const game = await Game.findById(id);
      if (!game) {
        return res.status(404).json({
          success: false,
          message: 'Game not found'
        });
      }

      const leaderboard = await game.getLeaderboard(timeframe, parseInt(limit));

      res.json({
        success: true,
        data: leaderboard
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching game leaderboard',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get games grouped by category
  async getGamesByCategory(req, res) {
    try {
      const categories = await Game.getGamesByCategory();
      
      res.json({
        success: true,
        data: categories
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching games by category',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get featured games for homepage/dashboard
  async getFeaturedGames(req, res) {
    try {
      const { limit = 6 } = req.query;
      const games = await Game.getFeaturedGames(parseInt(limit));
      
      res.json({
        success: true,
        data: games
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching featured games',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // ===============================
  // SUPER ADMIN ENDPOINTS
  // ===============================

  // Get all games for super admin management
  async getAllGames(req, res) {
    try {
      const {
        status,
        gameType,
        category,
        difficulty,
        createdBy,
        search,
        page = 1,
        limit = 20,
        sort = 'createdAt'
      } = req.query;

      const query = {};
      
      if (status) query.status = status;
      if (gameType) query.gameType = gameType;
      if (category) query.category = category;
      if (difficulty) query.difficulty = difficulty;
      if (createdBy) query.createdBy = createdBy;
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' }},
          { description: { $regex: search, $options: 'i' }},
          { tags: { $in: [new RegExp(search, 'i')] }}
        ];
      }

      const games = await Game.find(query)
        .populate('createdBy', 'name email')
        .sort({ [sort]: -1 })
        .limit(parseInt(limit))
        .skip((page - 1) * limit);

      const total = await Game.countDocuments(query);

      // Get status and type statistics
      const statusStats = await Game.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      const typeStats = await Game.aggregate([
        {
          $group: {
            _id: '$gameType',
            count: { $sum: 1 }
          }
        }
      ]);

      res.json({
        success: true,
        data: games,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        },
        stats: {
          byStatus: statusStats.reduce((acc, stat) => {
            acc[stat._id] = stat.count;
            return acc;
          }, {}),
          byType: typeStats.reduce((acc, stat) => {
            acc[stat._id] = stat.count;
            return acc;
          }, {})
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching games for admin',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Create new game (super admin only)
  async createGame(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const gameData = {
        ...req.body,
        createdBy: req.user.id
      };

      const game = new Game(gameData);
      await game.save();

      const populatedGame = await Game.findById(game._id)
        .populate('createdBy', 'name email');

      res.status(201).json({
        success: true,
        data: populatedGame,
        message: 'Game created successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error creating game',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Update game (super admin only)
  async updateGame(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const { id } = req.params;
      const updates = req.body;

      const game = await Game.findById(id);
      if (!game) {
        return res.status(404).json({
          success: false,
          message: 'Game not found'
        });
      }

      // Update fields
      Object.keys(updates).forEach(key => {
        if (updates[key] !== undefined) {
          game[key] = updates[key];
        }
      });

      await game.save();

      const populatedGame = await Game.findById(game._id)
        .populate('createdBy', 'name email');

      res.json({
        success: true,
        data: populatedGame,
        message: 'Game updated successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating game',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Delete game (super admin only)
  async deleteGame(req, res) {
    try {
      const { id } = req.params;

      const game = await Game.findById(id);
      if (!game) {
        return res.status(404).json({
          success: false,
          message: 'Game not found'
        });
      }

      await Game.findByIdAndDelete(id);

      res.json({
        success: true,
        message: 'Game deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error deleting game',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Publish/unpublish game
  async togglePublishStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body; // 'published' or 'draft'

      const game = await Game.findById(id);
      if (!game) {
        return res.status(404).json({
          success: false,
          message: 'Game not found'
        });
      }

      game.status = status;
      if (status === 'published' && !game.publishedAt) {
        game.publishedAt = new Date();
      }

      await game.save();

      res.json({
        success: true,
        data: game,
        message: `Game ${status === 'published' ? 'published' : 'unpublished'} successfully`
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating game status',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get game analytics (super admin only)
  async getGameAnalytics(req, res) {
    try {
      const { id } = req.params;
      const { timeframe = 'monthly' } = req.query;

      const game = await Game.findById(id);
      if (!game) {
        return res.status(404).json({
          success: false,
          message: 'Game not found'
        });
      }

      // Basic analytics from the game document
      const analytics = {
        overview: {
          totalPlays: game.stats.totalPlays,
          uniquePlayers: game.stats.uniquePlayers,
          averageScore: game.stats.averageScore,
          averagePlayTime: game.stats.averagePlayTime,
          completionRate: game.stats.completionRate,
          popularityScore: game.stats.popularityScore
        },
        playerDistribution: {
          byDifficulty: game.playerSessions.reduce((acc, session) => {
            const difficulty = session.metadata?.selectedDifficulty || 'unknown';
            acc[difficulty] = (acc[difficulty] || 0) + 1;
            return acc;
          }, {}),
          byScore: game.playerSessions.reduce((acc, session) => {
            const scoreRange = Math.floor(session.score / 100) * 100;
            const range = `${scoreRange}-${scoreRange + 99}`;
            acc[range] = (acc[range] || 0) + 1;
            return acc;
          }, {})
        },
        recentActivity: game.playerSessions
          .sort((a, b) => b.playedAt - a.playedAt)
          .slice(0, 20)
          .map(session => ({
            player: session.player,
            score: session.score,
            timeSpent: session.timeSpent,
            completed: session.completed,
            playedAt: session.playedAt
          }))
      };

      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching game analytics',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get games summary for super admin dashboard
  async getGamesSummary(req, res) {
    try {
      const summary = await Game.aggregate([
        {
          $facet: {
            statusCounts: [
              { $group: { _id: '$status', count: { $sum: 1 } } }
            ],
            typeCounts: [
              { $group: { _id: '$gameType', count: { $sum: 1 } } }
            ],
            recentGames: [
              { $match: { status: 'published' } },
              { $sort: { publishedAt: -1 } },
              { $limit: 5 },
              { $project: { title: 1, gameType: 1, 'stats.totalPlays': 1, 'stats.averageScore': 1 } }
            ],
            topPerformers: [
              { $match: { status: 'published' } },
              { $sort: { 'stats.popularityScore': -1 } },
              { $limit: 5 },
              { $project: { title: 1, gameType: 1, 'stats.popularityScore': 1, 'stats.totalPlays': 1 } }
            ]
          }
        }
      ]);

      res.json({
        success: true,
        data: summary[0]
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching games summary',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = new GamesController();
