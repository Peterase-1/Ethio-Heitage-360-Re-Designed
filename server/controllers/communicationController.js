const Communication = require('../models/Communication');
const User = require('../models/User');
const Museum = require('../models/Museum');
const { validationResult } = require('express-validator');

/**
 * @desc    Get all communications for a user
 * @route   GET /api/communications
 * @access  Private
 */
exports.getCommunications = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      type,
      status,
      priority,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const userId = req.user._id;
    const query = {
      $or: [
        { from: userId },
        { to: userId }
      ]
    };

    // Apply filters
    if (type) query.type = type;
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (search) {
      query.$and = [
        {
          $or: [
            { subject: { $regex: search, $options: 'i' } },
            { message: { $regex: search, $options: 'i' } }
          ]
        }
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const [communications, total] = await Promise.all([
      Communication.find(query)
        .populate('from to', 'name email role')
        .populate('museum', 'name')
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      Communication.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: communications,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get communications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch communications',
      error: error.message
    });
  }
};

/**
 * @desc    Get a specific communication
 * @route   GET /api/communications/:id
 * @access  Private
 */
exports.getCommunication = async (req, res) => {
  try {
    const communication = await Communication.findById(req.params.id)
      .populate('from to', 'name email role')
      .populate('museum', 'name')
      .populate('parentMessage');

    if (!communication) {
      return res.status(404).json({
        success: false,
        message: 'Communication not found'
      });
    }

    // Check if user has access to this communication
    if (communication.from._id.toString() !== req.user._id.toString() &&
      communication.to._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Mark as read if user is the recipient
    if (communication.to._id.toString() === req.user._id.toString() &&
      communication.status === 'sent') {
      await communication.markAsRead();
    }

    res.json({
      success: true,
      data: communication
    });
  } catch (error) {
    console.error('Get communication error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch communication',
      error: error.message
    });
  }
};

/**
 * @desc    Create a new communication
 * @route   POST /api/communications
 * @access  Private
 */
exports.createCommunication = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      type,
      to,
      museum,
      subject,
      message,
      priority = 'medium',
      relatedContent,
      tags = [],
      internalNotes
    } = req.body;

    // Verify recipient exists
    const recipient = await User.findById(to);
    if (!recipient) {
      return res.status(400).json({
        success: false,
        message: 'Recipient not found'
      });
    }

    // Verify museum exists (if provided)
    if (museum) {
      const museumExists = await Museum.findById(museum);
      if (!museumExists) {
        return res.status(400).json({
          success: false,
          message: 'Museum not found'
        });
      }
    }

    const communication = new Communication({
      type,
      from: req.user._id,
      to,
      museum,
      subject,
      message,
      priority,
      relatedContent,
      tags,
      internalNotes
    });

    await communication.save();

    // Populate the response
    await communication.populate('from to', 'name email role');
    if (museum) {
      await communication.populate('museum', 'name');
    }

    res.status(201).json({
      success: true,
      message: 'Communication sent successfully',
      data: communication
    });
  } catch (error) {
    console.error('Create communication error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create communication',
      error: error.message
    });
  }
};

/**
 * @desc    Reply to a communication
 * @route   POST /api/communications/:id/reply
 * @access  Private
 */
exports.replyToCommunication = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { message, priority = 'medium' } = req.body;
    const originalMessage = await Communication.findById(req.params.id);

    if (!originalMessage) {
      return res.status(404).json({
        success: false,
        message: 'Original communication not found'
      });
    }

    // Check if user has access to reply
    if (originalMessage.to._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const reply = new Communication({
      type: 'response',
      from: req.user._id,
      to: originalMessage.from,
      museum: originalMessage.museum,
      subject: `Re: ${originalMessage.subject}`,
      message,
      priority,
      isResponse: true,
      parentMessage: originalMessage._id,
      relatedContent: originalMessage.relatedContent
    });

    await reply.save();

    // Mark original message as replied
    await originalMessage.markAsReplied();

    // Populate the response
    await reply.populate('from to', 'name email role');
    if (originalMessage.museum) {
      await reply.populate('museum', 'name');
    }

    res.status(201).json({
      success: true,
      message: 'Reply sent successfully',
      data: reply
    });
  } catch (error) {
    console.error('Reply to communication error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send reply',
      error: error.message
    });
  }
};

/**
 * @desc    Get conversation thread
 * @route   GET /api/communications/:id/conversation
 * @access  Private
 */
exports.getConversation = async (req, res) => {
  try {
    const conversation = await Communication.getConversation(req.params.id);

    if (conversation.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Check if user has access to this conversation
    const hasAccess = conversation.some(msg =>
      msg.from._id.toString() === req.user._id.toString() ||
      msg.to._id.toString() === req.user._id.toString()
    );

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: conversation
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversation',
      error: error.message
    });
  }
};

/**
 * @desc    Mark communication as read
 * @route   PUT /api/communications/:id/read
 * @access  Private
 */
exports.markAsRead = async (req, res) => {
  try {
    const communication = await Communication.findById(req.params.id);

    if (!communication) {
      return res.status(404).json({
        success: false,
        message: 'Communication not found'
      });
    }

    // Check if user is the recipient
    if (communication.to._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await communication.markAsRead();

    res.json({
      success: true,
      message: 'Communication marked as read'
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark as read',
      error: error.message
    });
  }
};

/**
 * @desc    Archive communication
 * @route   PUT /api/communications/:id/archive
 * @access  Private
 */
exports.archiveCommunication = async (req, res) => {
  try {
    const communication = await Communication.findById(req.params.id);

    if (!communication) {
      return res.status(404).json({
        success: false,
        message: 'Communication not found'
      });
    }

    // Check if user has access
    if (communication.from._id.toString() !== req.user._id.toString() &&
      communication.to._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await communication.archive();

    res.json({
      success: true,
      message: 'Communication archived'
    });
  } catch (error) {
    console.error('Archive communication error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to archive communication',
      error: error.message
    });
  }
};

/**
 * @desc    Get unread count for user
 * @route   GET /api/communications/unread-count
 * @access  Private
 */
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Communication.getUnreadCount(req.user._id);

    res.json({
      success: true,
      data: { unreadCount: count }
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get unread count',
      error: error.message
    });
  }
};

/**
 * @desc    Get communications for Super Admin dashboard
 * @route   GET /api/communications/admin/dashboard
 * @access  Private (Super Admin only)
 */
exports.getAdminDashboard = async (req, res) => {
  try {
    // Check if user is super admin
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const [
      totalCommunications,
      unreadCommunications,
      recentCommunications,
      communicationsByType,
      communicationsByStatus
    ] = await Promise.all([
      Communication.countDocuments(),
      Communication.countDocuments({ status: { $in: ['sent', 'delivered'] } }),
      Communication.find()
        .populate('from to', 'name email role')
        .populate('museum', 'name')
        .sort({ createdAt: -1 })
        .limit(10),
      Communication.aggregate([
        { $group: { _id: '$type', count: { $sum: 1 } } }
      ]),
      Communication.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ])
    ]);

    res.json({
      success: true,
      data: {
        totalCommunications,
        unreadCommunications,
        recentCommunications,
        communicationsByType,
        communicationsByStatus
      }
    });
  } catch (error) {
    console.error('Get admin dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin dashboard data',
      error: error.message
    });
  }
};


