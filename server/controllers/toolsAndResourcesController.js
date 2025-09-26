const ToolsAndResources = require('../models/ToolsAndResources');
const { validationResult } = require('express-validator');

class ToolsAndResourcesController {
  // ===============================
  // VISITOR ENDPOINTS
  // ===============================

  // Get published tools and resources for visitors
  async getPublishedTools(req, res) {
    try {
      const {
        type,
        category,
        access,
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
      
      if (type) filters.type = type;
      if (category) filters.category = category;
      if (access) filters.access = access;
      if (subjects) filters.subjects = subjects.split(',');
      if (featured === 'true') filters.isFeatured = true;
      if (tags) filters.tags = tags.split(',');

      let tools;
      if (search) {
        tools = await ToolsAndResources.searchTools(search, filters);
      } else if (popular === 'true') {
        tools = await ToolsAndResources.getPopularTools(parseInt(limit));
      } else if (featured === 'true') {
        tools = await ToolsAndResources.getFeaturedTools(parseInt(limit));
      } else {
        tools = await ToolsAndResources.getPublishedTools(filters);
      }

      // Apply pagination for non-static method calls
      if (!popular && !featured) {
        const skip = (page - 1) * limit;
        tools = tools.limit(parseInt(limit)).skip(skip);
      }

      const results = await tools;
      const total = await ToolsAndResources.countDocuments({
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
        message: 'Error fetching tools and resources',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get a specific tool by ID (for visitors)
  async getTool(req, res) {
    try {
      const { id } = req.params;
      const tool = await ToolsAndResources.findOne({
        _id: id,
        status: 'published',
        isActive: true,
        'permissions.visitorAccess': true
      }).populate('createdBy', 'name')
        .populate('relatedTools', 'title type category media.thumbnail rating.average');

      if (!tool) {
        return res.status(404).json({
          success: false,
          message: 'Tool not found or not accessible'
        });
      }

      // Record usage (view) - optionally with user tracking
      await tool.recordUsage(req.user?.id, {
        sessionStart: new Date(),
        actionsPerformed: 1
      });

      res.json({
        success: true,
        data: tool
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching tool details',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Record tool usage session
  async recordUsageSession(req, res) {
    try {
      const { id } = req.params;
      const { duration, actionsPerformed, completionStatus, feedback } = req.body;

      const tool = await ToolsAndResources.findOne({
        _id: id,
        status: 'published',
        isActive: true,
        'permissions.visitorAccess': true
      });

      if (!tool) {
        return res.status(404).json({
          success: false,
          message: 'Tool not found'
        });
      }

      await tool.recordUsage(req.user?.id, {
        sessionEnd: new Date(),
        duration,
        actionsPerformed,
        completionStatus,
        feedback
      });

      res.json({
        success: true,
        message: 'Usage session recorded successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error recording usage session',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Add review for a tool
  async addReview(req, res) {
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
      const { 
        rating, 
        comment, 
        pros = [], 
        cons = [], 
        wouldRecommend = true,
        usageContext 
      } = req.body;

      const tool = await ToolsAndResources.findOne({
        _id: id,
        status: 'published',
        isActive: true,
        'permissions.visitorAccess': true
      });

      if (!tool) {
        return res.status(404).json({
          success: false,
          message: 'Tool not found'
        });
      }

      await tool.addReview(req.user.id, {
        rating,
        comment,
        pros,
        cons,
        wouldRecommend,
        usageContext
      });

      res.status(201).json({
        success: true,
        message: 'Review added successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error adding review',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get tools grouped by category
  async getToolsByCategory(req, res) {
    try {
      const categories = await ToolsAndResources.getToolsByCategory();
      
      res.json({
        success: true,
        data: categories
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching tools by category',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get featured tools for homepage/dashboard
  async getFeaturedTools(req, res) {
    try {
      const { limit = 6 } = req.query;
      const tools = await ToolsAndResources.getFeaturedTools(parseInt(limit));
      
      res.json({
        success: true,
        data: tools
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching featured tools',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // ===============================
  // SUPER ADMIN ENDPOINTS
  // ===============================

  // Get all tools for super admin management
  async getAllTools(req, res) {
    try {
      const {
        status,
        type,
        category,
        createdBy,
        search,
        page = 1,
        limit = 20,
        sort = 'createdAt'
      } = req.query;

      const query = {};
      
      if (status) query.status = status;
      if (type) query.type = type;
      if (category) query.category = category;
      if (createdBy) query.createdBy = createdBy;
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' }},
          { description: { $regex: search, $options: 'i' }},
          { tags: { $in: [new RegExp(search, 'i')] }}
        ];
      }

      const tools = await ToolsAndResources.find(query)
        .populate('createdBy', 'name email')
        .sort({ [sort]: -1 })
        .limit(parseInt(limit))
        .skip((page - 1) * limit);

      const total = await ToolsAndResources.countDocuments(query);

      // Get status statistics
      const statusStats = await ToolsAndResources.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      res.json({
        success: true,
        data: tools,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        },
        stats: {
          byStatus: statusStats.reduce((acc, stat) => {
            acc[stat._id] = stat.count;
            return acc;
          }, {})
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching tools for admin',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Create new tool (super admin only)
  async createTool(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const toolData = {
        ...req.body,
        createdBy: req.user.id
      };

      const tool = new ToolsAndResources(toolData);
      await tool.save();

      const populatedTool = await ToolsAndResources.findById(tool._id)
        .populate('createdBy', 'name email');

      res.status(201).json({
        success: true,
        data: populatedTool,
        message: 'Tool created successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error creating tool',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Update tool (super admin only)
  async updateTool(req, res) {
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

      const tool = await ToolsAndResources.findById(id);
      if (!tool) {
        return res.status(404).json({
          success: false,
          message: 'Tool not found'
        });
      }

      // Update fields
      Object.keys(updates).forEach(key => {
        if (updates[key] !== undefined) {
          tool[key] = updates[key];
        }
      });

      await tool.save();

      const populatedTool = await ToolsAndResources.findById(tool._id)
        .populate('createdBy', 'name email');

      res.json({
        success: true,
        data: populatedTool,
        message: 'Tool updated successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating tool',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Delete tool (super admin only)
  async deleteTool(req, res) {
    try {
      const { id } = req.params;

      const tool = await ToolsAndResources.findById(id);
      if (!tool) {
        return res.status(404).json({
          success: false,
          message: 'Tool not found'
        });
      }

      await ToolsAndResources.findByIdAndDelete(id);

      res.json({
        success: true,
        message: 'Tool deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error deleting tool',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Publish/unpublish tool
  async togglePublishStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body; // 'published' or 'draft'

      const tool = await ToolsAndResources.findById(id);
      if (!tool) {
        return res.status(404).json({
          success: false,
          message: 'Tool not found'
        });
      }

      tool.status = status;
      if (status === 'published' && !tool.publishedAt) {
        tool.publishedAt = new Date();
      }

      await tool.save();

      res.json({
        success: true,
        data: tool,
        message: `Tool ${status === 'published' ? 'published' : 'unpublished'} successfully`
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating tool status',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Update tool version
  async updateToolVersion(req, res) {
    try {
      const { id } = req.params;
      const { newVersion, changes } = req.body;

      const tool = await ToolsAndResources.findById(id);
      if (!tool) {
        return res.status(404).json({
          success: false,
          message: 'Tool not found'
        });
      }

      await tool.updateVersion(newVersion, changes);

      res.json({
        success: true,
        data: tool,
        message: 'Tool version updated successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating tool version',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Report tool issue
  async reportIssue(req, res) {
    try {
      const { id } = req.params;
      const { description, severity, workaround } = req.body;

      const tool = await ToolsAndResources.findById(id);
      if (!tool) {
        return res.status(404).json({
          success: false,
          message: 'Tool not found'
        });
      }

      await tool.reportIssue({
        description,
        severity,
        workaround
      });

      res.json({
        success: true,
        message: 'Issue reported successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error reporting issue',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get tool analytics (super admin only)
  async getToolAnalytics(req, res) {
    try {
      const { id } = req.params;
      const { timeframe = 'monthly' } = req.query;

      const tool = await ToolsAndResources.findById(id);
      if (!tool) {
        return res.status(404).json({
          success: false,
          message: 'Tool not found'
        });
      }

      // Basic analytics from the tool document
      const analytics = {
        overview: {
          totalViews: tool.usage.totalViews,
          totalUsers: tool.usage.totalUsers,
          totalSessions: tool.usage.totalSessions,
          averageSessionDuration: tool.usage.averageSessionDuration,
          popularityScore: tool.usage.popularityScore,
          averageRating: tool.rating.average,
          totalReviews: tool.reviews.length
        },
        ratings: {
          distribution: tool.reviews.reduce((acc, review) => {
            acc[review.rating] = (acc[review.rating] || 0) + 1;
            return acc;
          }, {}),
          recentReviews: tool.reviews.slice(-10)
        },
        sessions: {
          completionRate: tool.userSessions.filter(s => s.completionStatus === 'completed').length / Math.max(1, tool.userSessions.length) * 100,
          averageDuration: tool.usage.averageSessionDuration,
          totalSessions: tool.usage.totalSessions
        }
      };

      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching tool analytics',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get tools summary for super admin dashboard
  async getToolsSummary(req, res) {
    try {
      const summary = await ToolsAndResources.aggregate([
        {
          $facet: {
            statusCounts: [
              { $group: { _id: '$status', count: { $sum: 1 } } }
            ],
            typeCounts: [
              { $group: { _id: '$type', count: { $sum: 1 } } }
            ],
            recentTools: [
              { $match: { status: 'published' } },
              { $sort: { publishedAt: -1 } },
              { $limit: 5 },
              { $project: { title: 1, type: 1, 'usage.totalUsers': 1, 'rating.average': 1 } }
            ],
            topPerformers: [
              { $match: { status: 'published' } },
              { $sort: { 'usage.popularityScore': -1 } },
              { $limit: 5 },
              { $project: { title: 1, type: 1, 'usage.popularityScore': 1, 'usage.totalUsers': 1 } }
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
        message: 'Error fetching tools summary',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = new ToolsAndResourcesController();
