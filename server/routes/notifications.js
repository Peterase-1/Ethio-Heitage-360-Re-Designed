const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Notification = require('../models/Notification');
const User = require('../models/User');

// GET /api/notifications - Get notifications for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      unreadOnly = false,
      type,
      category,
      priority
    } = req.query;

    const options = {
      unreadOnly: unreadOnly === 'true',
      type,
      category,
      priority,
      limit: parseInt(limit)
    };

    const notifications = await Notification.getForUser(req.user._id, options);
    const total = await Notification.countDocuments({
      'recipients.user': req.user._id,
      isActive: true,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: new Date() } }
      ]
    });

    // Get unread count
    const unreadCount = await Notification.countDocuments({
      'recipients.user': req.user._id,
      'recipients.readAt': { $exists: false },
      isActive: true,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: new Date() } }
      ]
    });

    res.json({
      success: true,
      notifications,
      unreadCount,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message
    });
  }
});

// GET /api/notifications/unread-count - Get unread notification count
router.get('/unread-count', auth, async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      'recipients.user': req.user._id,
      'recipients.readAt': { $exists: false },
      isActive: true,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: new Date() } }
      ]
    });

    res.json({
      success: true,
      count
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get unread count',
      error: error.message
    });
  }
});

// PUT /api/notifications/:id/read - Mark notification as read
router.put('/:id/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Check if user is a recipient
    const isRecipient = notification.recipients.some(
      recipient => recipient.user.toString() === req.user._id.toString()
    );

    if (!isRecipient) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await notification.markAsRead(req.user._id);

    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message
    });
  }
});

// PUT /api/notifications/:id/dismiss - Dismiss notification
router.put('/:id/dismiss', auth, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Check if user is a recipient
    const isRecipient = notification.recipients.some(
      recipient => recipient.user.toString() === req.user._id.toString()
    );

    if (!isRecipient) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await notification.dismiss(req.user._id);

    res.json({
      success: true,
      message: 'Notification dismissed'
    });
  } catch (error) {
    console.error('Dismiss notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to dismiss notification',
      error: error.message
    });
  }
});

// PUT /api/notifications/:id/act - Mark notification as acted upon
router.put('/:id/act', auth, async (req, res) => {
  try {
    const { response } = req.body;
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Check if user is a recipient
    const isRecipient = notification.recipients.some(
      recipient => recipient.user.toString() === req.user._id.toString()
    );

    if (!isRecipient) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await notification.markAsActedUpon(req.user._id, response);

    res.json({
      success: true,
      message: 'Notification marked as acted upon'
    });
  } catch (error) {
    console.error('Mark notification as acted upon error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as acted upon',
      error: error.message
    });
  }
});

// PUT /api/notifications/mark-all-read - Mark all notifications as read
router.put('/mark-all-read', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({
      'recipients.user': req.user._id,
      'recipients.readAt': { $exists: false },
      isActive: true
    });

    for (const notification of notifications) {
      await notification.markAsRead(req.user._id);
    }

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read',
      error: error.message
    });
  }
});

// GET /api/notifications/analytics - Get notification analytics (for admin users)
router.get('/analytics', auth, async (req, res) => {
  try {
    // Check if user has admin privileges
    if (!['superAdmin', 'museumAdmin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const { startDate, endDate, type, category } = req.query;

    const filters = {};
    if (startDate && endDate) {
      filters.startDate = new Date(startDate);
      filters.endDate = new Date(endDate);
    }
    if (type) filters.type = type;
    if (category) filters.category = category;

    const analytics = await Notification.getAnalytics(filters);

    res.json({
      success: true,
      analytics
    });
  } catch (error) {
    console.error('Get notification analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get notification analytics',
      error: error.message
    });
  }
});

module.exports = router;
