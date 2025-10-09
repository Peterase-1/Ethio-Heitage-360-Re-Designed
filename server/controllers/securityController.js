const SecurityEvent = require('../models/SecurityEvent');
const UserSession = require('../models/UserSession');
const SecuritySettings = require('../models/SecuritySettings');
const User = require('../models/User');

// Get security dashboard data
const getSecurityDashboard = async (req, res) => {
  try {
    const [
      securityStats,
      sessionStats,
      securitySettings,
      recentEvents
    ] = await Promise.all([
      SecurityEvent.getSecurityStats(),
      UserSession.getSessionStats(),
      SecuritySettings.getSecurityStatus(),
      SecurityEvent.find({})
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean()
    ]);

    // Calculate system status
    const systemStatus = {
      secure: securityStats.criticalEvents === 0 &&
        securityStats.suspiciousActivity < 5 &&
        securitySettings.sslCertificate &&
        securitySettings.databaseEncryption,
      activeSessions: sessionStats.totalActiveSessions,
      failedLogins: securityStats.failedLogins,
      apiCalls: securityStats.last24HoursEvents
    };

    res.json({
      success: true,
      data: {
        systemStatus,
        securityStats,
        sessionStats,
        securitySettings,
        recentEvents
      }
    });
  } catch (error) {
    console.error('Error getting security dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch security dashboard data'
    });
  }
};

// Get security events with filtering
const getSecurityEvents = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      eventType,
      severity,
      status,
      userId,
      ipAddress,
      startDate,
      endDate,
      resolved
    } = req.query;

    const filter = {};

    if (eventType) filter.eventType = eventType;
    if (severity) filter.severity = severity;
    if (status) filter.status = status;
    if (userId) filter.userId = userId;
    if (ipAddress) filter.ipAddress = { $regex: ipAddress, $options: 'i' };
    if (resolved !== undefined) filter.resolved = resolved === 'true';

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [events, total] = await Promise.all([
      SecurityEvent.find(filter)
        .populate('userId', 'name email role')
        .populate('resolvedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      SecurityEvent.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: {
        events,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / parseInt(limit)),
          count: events.length,
          totalCount: total
        }
      }
    });
  } catch (error) {
    console.error('Error getting security events:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch security events'
    });
  }
};

// Get active sessions
const getActiveSessions = async (req, res) => {
  try {
    const { page = 1, limit = 20, userId, ipAddress } = req.query;

    const filter = { isActive: true, expiresAt: { $gt: new Date() } };

    if (userId) filter.userId = userId;
    if (ipAddress) filter.ipAddress = { $regex: ipAddress, $options: 'i' };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [sessions, total] = await Promise.all([
      UserSession.find(filter)
        .populate('userId', 'name email role')
        .sort({ lastActivity: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      UserSession.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: {
        sessions,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / parseInt(limit)),
          count: sessions.length,
          totalCount: total
        }
      }
    });
  } catch (error) {
    console.error('Error getting active sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch active sessions'
    });
  }
};

// Terminate session
const terminateSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await UserSession.findOne({ sessionId });
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    await session.terminate();

    // Log the security event
    await SecurityEvent.create({
      eventType: 'session_timeout',
      userId: session.userId,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      status: 'success',
      description: 'Session terminated by admin',
      severity: 'low'
    });

    res.json({
      success: true,
      message: 'Session terminated successfully'
    });
  } catch (error) {
    console.error('Error terminating session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to terminate session'
    });
  }
};

// Get security settings
const getSecuritySettings = async (req, res) => {
  try {
    const settings = await SecuritySettings.getCurrentSettings();
    const status = await SecuritySettings.getSecurityStatus();

    res.json({
      success: true,
      data: {
        settings,
        status
      }
    });
  } catch (error) {
    console.error('Error getting security settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch security settings'
    });
  }
};

// Update security settings
const updateSecuritySettings = async (req, res) => {
  try {
    const updates = req.body;
    const modifiedBy = req.user.id;

    const updatedSettings = await SecuritySettings.updateSettings(updates, modifiedBy);

    // Log the configuration change
    await SecurityEvent.create({
      eventType: 'configuration_change',
      userId: modifiedBy,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      status: 'success',
      description: 'Security settings updated',
      severity: 'medium',
      metadata: { changes: Object.keys(updates) }
    });

    res.json({
      success: true,
      message: 'Security settings updated successfully',
      data: updatedSettings
    });
  } catch (error) {
    console.error('Error updating security settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update security settings'
    });
  }
};

// Resolve security event
const resolveSecurityEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { notes } = req.body;
    const resolvedBy = req.user.id;

    const event = await SecurityEvent.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Security event not found'
      });
    }

    event.resolved = true;
    event.resolvedBy = resolvedBy;
    event.resolvedAt = new Date();
    event.notes = notes;

    await event.save();

    res.json({
      success: true,
      message: 'Security event resolved successfully'
    });
  } catch (error) {
    console.error('Error resolving security event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resolve security event'
    });
  }
};

// Get security statistics
const getSecurityStatistics = async (req, res) => {
  try {
    const { period = '30d' } = req.query;

    let startDate;
    switch (period) {
      case '24h':
        startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }

    const [
      eventTypesStats,
      severityStats,
      statusStats,
      hourlyStats,
      topIPs,
      topUsers
    ] = await Promise.all([
      SecurityEvent.getEventTypesStats(),
      SecurityEvent.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: '$severity', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      SecurityEvent.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      SecurityEvent.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: {
              hour: { $hour: '$createdAt' },
              day: { $dayOfMonth: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.day': 1, '_id.hour': 1 } }
      ]),
      SecurityEvent.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: '$ipAddress', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      SecurityEvent.aggregate([
        { $match: { createdAt: { $gte: startDate }, userId: { $exists: true } } },
        { $group: { _id: '$userId', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user'
          }
        }
      ])
    ]);

    res.json({
      success: true,
      data: {
        eventTypes: eventTypesStats,
        severity: severityStats,
        status: statusStats,
        hourly: hourlyStats,
        topIPs,
        topUsers
      }
    });
  } catch (error) {
    console.error('Error getting security statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch security statistics'
    });
  }
};

// Cleanup expired sessions
const cleanupExpiredSessions = async (req, res) => {
  try {
    const result = await UserSession.cleanupExpiredSessions();

    // Log the cleanup
    await SecurityEvent.create({
      eventType: 'system_backup',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      status: 'success',
      description: `Cleaned up ${result.modifiedCount} expired sessions`,
      severity: 'low'
    });

    res.json({
      success: true,
      message: `Cleaned up ${result.modifiedCount} expired sessions`
    });
  } catch (error) {
    console.error('Error cleaning up expired sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cleanup expired sessions'
    });
  }
};

module.exports = {
  getSecurityDashboard,
  getSecurityEvents,
  getActiveSessions,
  terminateSession,
  getSecuritySettings,
  updateSecuritySettings,
  resolveSecurityEvent,
  getSecurityStatistics,
  cleanupExpiredSessions
};




