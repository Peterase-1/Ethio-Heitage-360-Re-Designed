const LiveSession = require('../models/LiveSession');
const { validationResult } = require('express-validator');

class LiveSessionsController {
  // ===============================
  // VISITOR ENDPOINTS
  // ===============================

  // Get upcoming and live sessions for visitors
  async getPublicSessions(req, res) {
    try {
      const { 
        category, 
        language, 
        status = 'all', 
        page = 1, 
        limit = 20 
      } = req.query;

      let query = {
        requiresRegistration: { $ne: true }
      };

      // Add filters
      if (category && category !== 'all') {
        query.category = category;
      }
      
      if (language && language !== 'all') {
        query.language = language;
      }

      // Status filter
      if (status === 'upcoming') {
        query.status = 'scheduled';
        query.scheduledAt = { $gte: new Date() };
      } else if (status === 'live') {
        query.status = 'live';
      } else if (status === 'completed') {
        query.status = 'completed';
      } else {
        // All sessions (excluding cancelled)
        query.status = { $in: ['scheduled', 'live', 'completed'] };
      }

      const sessions = await LiveSession.find(query)
        .populate('instructor', 'name profileImage')
        .populate('relatedMuseum', 'name')
        .populate('relatedCourse', 'title')
        .sort({ scheduledAt: status === 'completed' ? -1 : 1 })
        .limit(parseInt(limit))
        .skip((page - 1) * limit);

      const total = await LiveSession.countDocuments(query);

      res.json({
        success: true,
        data: sessions,
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
        message: 'Error fetching live sessions',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get session details
  async getSessionDetails(req, res) {
    try {
      const { id } = req.params;
      
      const session = await LiveSession.findById(id)
        .populate('instructor', 'name profileImage bio')
        .populate('participants.user', 'name profileImage')
        .populate('feedback.user', 'name profileImage')
        .populate('relatedMuseum', 'name description')
        .populate('relatedCourse', 'title description');

      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Session not found'
        });
      }

      // Check if user is registered (if authenticated)
      let isRegistered = false;
      if (req.user) {
        isRegistered = session.participants.some(p => 
          p.user._id.toString() === req.user.id.toString()
        );
      }

      res.json({
        success: true,
        data: {
          ...session.toJSON(),
          isRegistered
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching session details',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Register for a session
  async registerForSession(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const { id } = req.params;
      const session = await LiveSession.findById(id);

      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Session not found'
        });
      }

      // Check if session allows registration
      if (!session.requiresRegistration && session.status !== 'scheduled') {
        return res.status(400).json({
          success: false,
          message: 'Registration not required or session already started'
        });
      }

      // Check if already registered
      const alreadyRegistered = session.participants.some(p => 
        p.user.toString() === req.user.id.toString()
      );

      if (alreadyRegistered) {
        return res.status(400).json({
          success: false,
          message: 'You are already registered for this session'
        });
      }

      // Register user
      await session.registerParticipant(req.user.id);

      res.json({
        success: true,
        message: 'Successfully registered for the session',
        data: {
          sessionId: session._id,
          scheduledAt: session.scheduledAt
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || 'Error registering for session'
      });
    }
  }

  // Unregister from a session
  async unregisterFromSession(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const { id } = req.params;
      const session = await LiveSession.findById(id);

      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Session not found'
        });
      }

      // Remove participant
      session.participants = session.participants.filter(p => 
        p.user.toString() !== req.user.id.toString()
      );

      await session.save();

      res.json({
        success: true,
        message: 'Successfully unregistered from the session'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error unregistering from session',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get user's registered sessions
  async getUserSessions(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const { status = 'all' } = req.query;
      
      let query = {
        'participants.user': req.user.id
      };

      if (status === 'upcoming') {
        query.status = 'scheduled';
        query.scheduledAt = { $gte: new Date() };
      } else if (status === 'live') {
        query.status = 'live';
      } else if (status === 'completed') {
        query.status = 'completed';
      }

      const sessions = await LiveSession.find(query)
        .populate('instructor', 'name profileImage')
        .sort({ scheduledAt: status === 'completed' ? -1 : 1 });

      res.json({
        success: true,
        data: sessions
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching user sessions',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Submit feedback for a completed session
  async submitFeedback(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const { id } = req.params;
      const { rating, comment } = req.body;

      const session = await LiveSession.findById(id);

      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Session not found'
        });
      }

      // Check if session is completed
      if (session.status !== 'completed') {
        return res.status(400).json({
          success: false,
          message: 'Feedback can only be submitted for completed sessions'
        });
      }

      // Check if user attended the session
      const participated = session.participants.some(p => 
        p.user.toString() === req.user.id.toString() && p.status === 'attended'
      );

      if (!participated) {
        return res.status(403).json({
          success: false,
          message: 'You can only provide feedback for sessions you attended'
        });
      }

      // Check if feedback already submitted
      const existingFeedback = session.feedback.find(f => 
        f.user.toString() === req.user.id.toString()
      );

      if (existingFeedback) {
        // Update existing feedback
        existingFeedback.rating = rating;
        existingFeedback.comment = comment;
        existingFeedback.submittedAt = new Date();
      } else {
        // Add new feedback
        session.feedback.push({
          user: req.user.id,
          rating,
          comment
        });
      }

      // Update average rating
      await session.updateAverageRating();

      res.json({
        success: true,
        message: 'Feedback submitted successfully',
        data: {
          averageRating: session.averageRating,
          feedbackCount: session.feedback.length
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error submitting feedback',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // ===============================
  // SUPER ADMIN ENDPOINTS
  // ===============================

  // Get all sessions for admin management
  async getAllSessions(req, res) {
    try {
      const {
        status,
        category,
        instructor,
        search,
        page = 1,
        limit = 20,
        sort = 'scheduledAt'
      } = req.query;

      let query = {};
      
      if (status) query.status = status;
      if (category) query.category = category;
      if (instructor) query.instructor = instructor;
      
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' }},
          { description: { $regex: search, $options: 'i' }},
          { tags: { $in: [new RegExp(search, 'i')] }}
        ];
      }

      const sessions = await LiveSession.find(query)
        .populate('instructor', 'name email profileImage')
        .populate('participants.user', 'name email')
        .sort({ [sort]: sort === 'scheduledAt' ? 1 : -1 })
        .limit(parseInt(limit))
        .skip((page - 1) * limit);

      const total = await LiveSession.countDocuments(query);

      // Get statistics
      const stats = await LiveSession.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      res.json({
        success: true,
        data: sessions,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        },
        stats: stats.reduce((acc, stat) => {
          acc[stat._id] = stat.count;
          return acc;
        }, {})
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching sessions for admin',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Create new live session
  async createSession(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const sessionData = {
        ...req.body,
        instructor: req.body.instructor || req.user.id
      };

      const session = new LiveSession(sessionData);
      await session.save();

      const populatedSession = await LiveSession.findById(session._id)
        .populate('instructor', 'name email profileImage');

      res.status(201).json({
        success: true,
        data: populatedSession,
        message: 'Live session created successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error creating session',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Update session
  async updateSession(req, res) {
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

      const session = await LiveSession.findById(id);
      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Session not found'
        });
      }

      // Update fields
      Object.keys(updates).forEach(key => {
        if (updates[key] !== undefined) {
          session[key] = updates[key];
        }
      });

      await session.save();

      const populatedSession = await LiveSession.findById(session._id)
        .populate('instructor', 'name email profileImage');

      res.json({
        success: true,
        data: populatedSession,
        message: 'Session updated successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating session',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Delete session
  async deleteSession(req, res) {
    try {
      const { id } = req.params;

      const session = await LiveSession.findById(id);
      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Session not found'
        });
      }

      // Check if session can be deleted (not if it's live or completed with participants)
      if (session.status === 'live') {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete a live session'
        });
      }

      if (session.status === 'completed' && session.participants.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete completed sessions with participants'
        });
      }

      await LiveSession.findByIdAndDelete(id);

      res.json({
        success: true,
        message: 'Session deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error deleting session',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Start session
  async startSession(req, res) {
    try {
      const { id } = req.params;
      const { meetingLink } = req.body;

      const session = await LiveSession.findById(id);
      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Session not found'
        });
      }

      if (session.status !== 'scheduled') {
        return res.status(400).json({
          success: false,
          message: 'Session cannot be started from current status'
        });
      }

      // Update session status and meeting link
      session.status = 'live';
      if (meetingLink) {
        session.meetingLink = meetingLink;
      }

      await session.save();

      res.json({
        success: true,
        data: session,
        message: 'Session started successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error starting session',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // End session
  async endSession(req, res) {
    try {
      const { id } = req.params;
      const { recordingUrl } = req.body;

      const session = await LiveSession.findById(id);
      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Session not found'
        });
      }

      if (session.status !== 'live') {
        return res.status(400).json({
          success: false,
          message: 'Session is not currently live'
        });
      }

      // Update session status and recording
      session.status = 'completed';
      if (recordingUrl) {
        session.recordingUrl = recordingUrl;
      }

      // Mark registered participants as attended (basic implementation)
      session.participants.forEach(participant => {
        if (!participant.leftAt) {
          participant.status = 'attended';
          participant.leftAt = new Date();
        }
      });

      await session.save();

      res.json({
        success: true,
        data: session,
        message: 'Session ended successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error ending session',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get session analytics
  async getSessionAnalytics(req, res) {
    try {
      const { id } = req.params;

      const session = await LiveSession.findById(id)
        .populate('participants.user', 'name email profileImage')
        .populate('feedback.user', 'name profileImage');

      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Session not found'
        });
      }

      // Calculate analytics
      const analytics = {
        overview: {
          totalRegistrations: session.participants.length,
          totalAttendees: session.participants.filter(p => p.status === 'attended').length,
          attendanceRate: session.participants.length > 0 ? 
            Math.round((session.participants.filter(p => p.status === 'attended').length / session.participants.length) * 100) : 0,
          averageRating: session.averageRating,
          feedbackCount: session.feedback.length
        },
        participants: session.participants.map(p => ({
          user: p.user,
          joinedAt: p.joinedAt,
          leftAt: p.leftAt,
          status: p.status,
          duration: p.leftAt && p.joinedAt ? 
            Math.round((new Date(p.leftAt) - new Date(p.joinedAt)) / (1000 * 60)) : null
        })),
        feedback: session.feedback.map(f => ({
          user: f.user,
          rating: f.rating,
          comment: f.comment,
          submittedAt: f.submittedAt
        })),
        ratingDistribution: {
          5: session.feedback.filter(f => f.rating === 5).length,
          4: session.feedback.filter(f => f.rating === 4).length,
          3: session.feedback.filter(f => f.rating === 3).length,
          2: session.feedback.filter(f => f.rating === 2).length,
          1: session.feedback.filter(f => f.rating === 1).length
        }
      };

      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching session analytics',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get dashboard summary for super admin
  async getDashboardSummary(req, res) {
    try {
      const summary = await LiveSession.aggregate([
        {
          $facet: {
            statusCounts: [
              { $group: { _id: '$status', count: { $sum: 1 } } }
            ],
            upcomingSessions: [
              { $match: { 
                status: 'scheduled',
                scheduledAt: { $gte: new Date() }
              }},
              { $sort: { scheduledAt: 1 } },
              { $limit: 5 },
              { 
                $lookup: {
                  from: 'users',
                  localField: 'instructor',
                  foreignField: '_id',
                  as: 'instructor'
                }
              },
              { $unwind: '$instructor' },
              { 
                $project: { 
                  title: 1, 
                  scheduledAt: 1, 
                  participantCount: { $size: '$participants' },
                  'instructor.name': 1 
                } 
              }
            ],
            recentSessions: [
              { $match: { status: 'completed' } },
              { $sort: { scheduledAt: -1 } },
              { $limit: 5 },
              { 
                $lookup: {
                  from: 'users',
                  localField: 'instructor',
                  foreignField: '_id',
                  as: 'instructor'
                }
              },
              { $unwind: '$instructor' },
              { 
                $project: { 
                  title: 1, 
                  scheduledAt: 1, 
                  participantCount: { $size: '$participants' },
                  averageRating: 1,
                  'instructor.name': 1 
                } 
              }
            ],
            totalParticipants: [
              { $unwind: '$participants' },
              { $group: { _id: null, total: { $sum: 1 } } }
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
        message: 'Error fetching dashboard summary',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = new LiveSessionsController();
