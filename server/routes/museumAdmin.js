const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { requireMuseumAdminOrHigher } = require('../middleware/roleHierarchy');
const museumAdminController = require('../controllers/museumAdmin');

// Apply authentication and museum admin (or higher) check to all routes
// This allows super_admin to access all museum_admin functions
router.use(auth);
// router.use(requireMuseumAdminOrHigher);

// ======================
// DASHBOARD
// ======================

/**
 * @route   GET /api/museum-admin/dashboard
 * @desc    Get comprehensive museum dashboard data
 * @access  Museum Admin or Super Admin
 * @returns Museum stats, visitor trends, top artifacts, pending tasks
 */
router.get('/dashboard', museumAdminController.getDashboard);

// ======================
// MUSEUM PROFILE MANAGEMENT
// ======================

/**
 * @route   GET /api/museum-admin/profile
 * @desc    Get museum profile information
 * @access  Museum Admin or Super Admin
 */
router.get('/profile', museumAdminController.getMuseumProfile);

/**
 * @route   PUT /api/museum-admin/profile
 * @desc    Update museum profile information
 * @access  Museum Admin or Super Admin
 * @body    name, description, contactInfo, operatingHours, admissionFee, images, features
 */
router.put('/profile', museumAdminController.updateMuseumProfile);

// ======================
// ARTIFACT MANAGEMENT
// ======================

/**
 * @route   GET /api/museum-admin/artifacts
 * @desc    Get all artifacts for this museum with filtering
 * @access  Museum Admin or Super Admin
 * @params  page, limit, status, search, category, sortBy, sortOrder
 */
router.get('/artifacts', museumAdminController.getArtifacts);

/**
 * @route   PUT /api/museum-admin/artifacts/:id/approve
 * @desc    Approve or reject artifact from staff submissions
 * @access  Museum Admin or Super Admin
 * @params  id - Artifact ID
 * @body    status (approved|rejected), feedback
 */
router.put('/artifacts/:id/approve', museumAdminController.approveArtifact);

// ======================
// RENTAL MANAGEMENT
// ======================

/**
 * @route   GET /api/museum-admin/rentals
 * @desc    Get all rental requests for this museum's artifacts
 * @access  Museum Admin or Super Admin
 * @params  page, limit, status, sortBy, sortOrder
 */
router.get('/rentals', museumAdminController.getRentals);

/**
 * @route   PUT /api/museum-admin/rentals/:id/review
 * @desc    Review rental request (approve small local bookings or forward to Super Admin)
 * @access  Museum Admin or Super Admin
 * @params  id - Rental ID
 * @body    decision (approve|reject|forward_to_owner), comments, isLocalBooking, estimatedValue
 */
router.put('/rentals/:id/review', museumAdminController.approveRental);

// ======================
// ANALYTICS & REPORTS
// ======================

/**
 * @route   GET /api/museum-admin/analytics
 * @desc    Get detailed analytics for this museum
 * @access  Museum Admin or Super Admin
 * @params  startDate, endDate, type (overview|artifacts|revenue)
 */
router.get('/analytics', museumAdminController.getAnalytics);

// ======================
// EVENT MANAGEMENT
// ======================

/**
 * @route   GET /api/museum-admin/events
 * @desc    Get all events for this museum
 * @access  Museum Admin or Super Admin
 * @params  page, limit, status, type, search, sortBy, sortOrder
 */
router.get('/events', museumAdminController.getEvents);

/**
 * @route   POST /api/museum-admin/events
 * @desc    Create a new event for the museum
 * @access  Museum Admin or Super Admin
 * @body    Event data (title, description, schedule, location, etc.)
 */
router.post('/events', museumAdminController.createEvent);

/**
 * @route   PUT /api/museum-admin/events/:id
 * @desc    Update an existing event
 * @access  Museum Admin or Super Admin
 * @params  id - Event ID
 * @body    Event data to update
 */
router.put('/events/:id', museumAdminController.updateEvent);

/**
 * @route   DELETE /api/museum-admin/events/:id
 * @desc    Delete an event
 * @access  Museum Admin or Super Admin
 * @params  id - Event ID
 */
router.delete('/events/:id', museumAdminController.deleteEvent);

// ======================
// STAFF MANAGEMENT
// ======================

/**
 * @route   GET /api/museum-admin/staff
 * @desc    Get all staff members for this museum
 * @access  Museum Admin or Super Admin
 */
router.get('/staff', museumAdminController.getStaff);

/**
 * @route   POST /api/museum-admin/staff
 * @desc    Add new staff member to museum
 * @access  Museum Admin or Super Admin
 * @body    userId, role, permissions[]
 */
router.post('/staff', museumAdminController.addStaff);

/**
 * @route   PUT /api/museum-admin/staff/:userId
 * @desc    Update staff member role and permissions
 * @access  Museum Admin or Super Admin
 * @params  userId - User ID of staff member
 * @body    role, permissions[]
 */
router.put('/staff/:userId', museumAdminController.updateStaff);

/**
 * @route   DELETE /api/museum-admin/staff/:userId
 * @desc    Remove staff member from museum
 * @access  Museum Admin or Super Admin
 * @params  userId - User ID of staff member
 */
router.delete('/staff/:userId', museumAdminController.removeStaff);

// ======================
// NOTIFICATIONS & ALERTS
// ======================

/**
 * @route   GET /api/museum-admin/notifications
 * @desc    Get notifications for museum admin
 * @access  Museum Admin or Super Admin
 * @params  page, limit, type, category, priority, unreadOnly
 */
router.get('/notifications', museumAdminController.getNotifications);

/**
 * @route   POST /api/museum-admin/notifications
 * @desc    Create a new notification
 * @access  Museum Admin or Super Admin
 * @body    title, message, type, category, priority, recipients, action, expiresAt
 */
router.post('/notifications', museumAdminController.createNotification);

/**
 * @route   PUT /api/museum-admin/notifications/:id/read
 * @desc    Mark notification as read
 * @access  Museum Admin or Super Admin
 * @params  id - Notification ID
 */
router.put('/notifications/:id/read', museumAdminController.markNotificationAsRead);

/**
 * @route   PUT /api/museum-admin/notifications/:id/dismiss
 * @desc    Dismiss a notification
 * @access  Museum Admin or Super Admin
 * @params  id - Notification ID
 */
router.put('/notifications/:id/dismiss', museumAdminController.dismissNotification);

/**
 * @route   PUT /api/museum-admin/notifications/:id/action
 * @desc    Take action on a notification
 * @access  Museum Admin or Super Admin
 * @params  id - Notification ID
 * @body    response
 */
router.put('/notifications/:id/action', museumAdminController.takeNotificationAction);

// ======================
// QUICK ACTIONS
// ======================

/**
 * @route   GET /api/museum-admin/quick-stats
 * @desc    Get quick statistics for header/sidebar display
 * @access  Museum Admin or Super Admin
 */
router.get('/quick-stats', async (req, res) => {
  try {
    const Museum = require('../models/Museum');
    const Artifact = require('../models/Artifact');
    const Rental = require('../models/Rental');

    const museum = await Museum.findOne({ admin: req.user._id });
    if (!museum) {
      return res.status(404).json({
        success: false,
        message: 'Museum not found'
      });
    }

    const [
      totalArtifacts,
      publishedArtifacts,
      pendingApprovals,
      activeRentals
    ] = await Promise.all([
      Artifact.countDocuments({ museum: museum._id }),
      Artifact.countDocuments({ museum: museum._id, status: 'published' }),
      Artifact.countDocuments({ museum: museum._id, status: 'pending-review' }) +
      Rental.countDocuments({ museum: museum._id, 'approvals.museumAdmin.status': 'pending' }),
      Rental.countDocuments({ museum: museum._id, status: 'active' })
    ]);

    res.json({
      success: true,
      stats: {
        totalArtifacts,
        publishedArtifacts,
        pendingApprovals,
        activeRentals
      }
    });
  } catch (error) {
    console.error('Quick stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quick stats',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/museum-admin/search
 * @desc    Global search within museum data
 * @access  Museum Admin or Super Admin
 * @params  q - Search query
 * @params  type - Search type (artifacts|rentals|staff|all)
 */
router.get('/search', async (req, res) => {
  try {
    const { q, type = 'all' } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters'
      });
    }

    const Museum = require('../models/Museum');
    const Artifact = require('../models/Artifact');
    const Rental = require('../models/Rental');
    const User = require('../models/User');

    const museum = await Museum.findOne({ admin: req.user._id });
    if (!museum) {
      return res.status(404).json({
        success: false,
        message: 'Museum not found'
      });
    }

    const searchQuery = { $regex: q.trim(), $options: 'i' };
    const results = {};

    if (type === 'all' || type === 'artifacts') {
      results.artifacts = await Artifact.find({
        museum: museum._id,
        $or: [
          { name: searchQuery },
          { description: searchQuery },
          { accessionNumber: searchQuery }
        ]
      })
        .limit(10)
        .select('name description accessionNumber status category media')
        .populate('createdBy', 'name');
    }

    if (type === 'all' || type === 'rentals') {
      const artifacts = await Artifact.find({
        museum: museum._id,
        name: searchQuery
      }).select('_id');

      results.rentals = await Rental.find({
        $or: [
          { museum: museum._id, artifact: { $in: artifacts.map(a => a._id) } }
        ]
      })
        .limit(10)
        .populate('artifact', 'name accessionNumber')
        .populate('renter', 'name email');
    }

    if (type === 'all' || type === 'staff') {
      const staffIds = museum.staff.map(s => s.user);
      results.staff = await User.find({
        _id: { $in: staffIds },
        $or: [
          { name: searchQuery },
          { email: searchQuery }
        ]
      })
        .limit(10)
        .select('name email profile');
    }

    res.json({
      success: true,
      results,
      query: q.trim()
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      message: 'Search failed',
      error: error.message
    });
  }
});

// ======================
// MUSEUM MANAGEMENT (Super Admin Access)
// ======================

/**
 * @route   GET /api/museum-admin/museums
 * @desc    Get all museums (Super Admin access through Museum Admin interface)
 * @access  Super Admin only
 * @params  page, limit, status, verified, search, sortBy, sortOrder
 */
router.get('/museums', museumAdminController.getAllMuseumsForAdmin);

/**
 * @route   PUT /api/museum-admin/museums/:id/status
 * @desc    Update museum status (Super Admin access)
 * @access  Super Admin only
 * @params  id - Museum ID
 * @body    status, reason
 */
router.put('/museums/:id/status', museumAdminController.updateMuseumStatus);

/**
 * @route   GET /api/museum-admin/artifacts/all
 * @desc    Get all artifacts from a specific museum (enhanced view)
 * @access  Museum Admin or Super Admin
 * @params  page, limit, status, search, category, sortBy, sortOrder, museumId (for super admin)
 */
router.get('/artifacts/all', museumAdminController.getAllMuseumArtifacts);

/**
 * @route   GET /api/museum-admin/rentals/all
 * @desc    Get all rentals with comprehensive management features
 * @access  Museum Admin or Super Admin
 * @params  page, limit, status, search, sortBy, sortOrder, museumId (for super admin)
 */
router.get('/rentals/all', museumAdminController.getAllRentalsForMuseum);

// ======================
// CONTENT MODERATION
// ======================

/**
 * @route   GET /api/museum-admin/content/pending
 * @desc    Get all pending content for review by museum admin
 * @access  Museum Admin or Super Admin
 * @params  page, limit, type (all|artifacts|virtual_museums|events), sortBy, sortOrder
 */
router.get('/content/pending', museumAdminController.getPendingContent);

/**
 * @route   PUT /api/museum-admin/content/artifacts/:id/submit
 * @desc    Submit artifact to Super Admin for approval after museum review
 * @access  Museum Admin or Super Admin
 * @params  id - Artifact ID
 * @body    notes, culturalContext, educationalValue, recommendation (approve|reject)
 */
router.put('/content/artifacts/:id/submit', museumAdminController.submitArtifactForApproval);

/**
 * @route   PUT /api/museum-admin/content/virtual-museums/:id/review
 * @desc    Review virtual museum content
 * @access  Museum Admin or Super Admin
 * @params  id - Virtual Museum ID
 * @body    status, feedback, userExperienceNotes, educationalValueNotes
 */
router.put('/content/virtual-museums/:id/review', museumAdminController.reviewVirtualMuseum);

/**
 * @route   GET /api/museum-admin/content/reviews
 * @desc    Get all content reviews for this museum
 * @access  Museum Admin or Super Admin
 * @params  page, limit, status, reviewerRole, sortBy, sortOrder
 */
router.get('/content/reviews', museumAdminController.getContentReviews);

/**
 * @route   POST /api/museum-admin/content/feedback
 * @desc    Provide structured feedback to content creators
 * @access  Museum Admin or Super Admin
 * @body    contentType, contentId, feedbackType, message, suggestions[], priority, requiresResponse
 */
router.post('/content/feedback', museumAdminController.provideFeedback);

// ======================
// HERITAGE SITE MANAGEMENT
// ======================

/**
 * @route   GET /api/museum-admin/heritage-sites
 * @desc    Get heritage sites related to this museum
 * @access  Museum Admin or Super Admin
 * @params  page, limit, region, status, search, sortBy, sortOrder
 */
router.get('/heritage-sites', museumAdminController.getHeritageSites);

/**
 * @route   POST /api/museum-admin/heritage-sites/suggest
 * @desc    Suggest a new heritage site for Super Admin approval
 * @access  Museum Admin or Super Admin
 * @body    name, description, location, historicalSignificance, culturalImportance, proposedClassification, supportingDocuments[], images[], relatedArtifacts[]
 */
router.post('/heritage-sites/suggest', museumAdminController.suggestHeritageSite);

/**
 * @route   GET /api/museum-admin/heritage-sites/suggestions
 * @desc    Get heritage site suggestions submitted by this museum
 * @access  Museum Admin or Super Admin
 * @params  page, limit, status, sortBy, sortOrder
 */
router.get('/heritage-sites/suggestions', museumAdminController.getHeritageSiteSuggestions);

/**
 * @route   PUT /api/museum-admin/heritage-sites/suggestions/:id
 * @desc    Update heritage site suggestion
 * @access  Museum Admin or Super Admin
 * @params  id - Suggestion ID
 * @body    Updated heritage site suggestion data
 */
router.put('/heritage-sites/suggestions/:id', museumAdminController.updateHeritageSiteSuggestion);

// ======================
// COMMUNICATIONS
// ======================

/**
 * @route   GET /api/museum-admin/communications
 * @desc    Get communications for museum admin
 * @access  Museum Admin or Super Admin
 */
router.get('/communications', museumAdminController.getCommunications);

/**
 * @route   GET /api/museum-admin/communications/:id
 * @desc    Get specific communication
 * @access  Museum Admin or Super Admin
 */
router.get('/communications/:id', museumAdminController.getCommunication);

/**
 * @route   POST /api/museum-admin/communications
 * @desc    Create new communication (send to Super Admin)
 * @access  Museum Admin
 */
router.post('/communications', museumAdminController.createCommunication);

/**
 * @route   POST /api/museum-admin/communications/:id/reply
 * @desc    Reply to communication
 * @access  Museum Admin or Super Admin
 */
router.post('/communications/:id/reply', museumAdminController.replyToCommunication);

/**
 * @route   PUT /api/museum-admin/communications/:id/read
 * @desc    Mark communication as read
 * @access  Museum Admin or Super Admin
 */
router.put('/communications/:id/read', museumAdminController.markAsRead);

/**
 * @route   GET /api/museum-admin/communications/unread-count
 * @desc    Get unread communications count
 * @access  Museum Admin or Super Admin
 */
router.get('/communications/unread-count', museumAdminController.getUnreadCount);

/**
 * @route   GET /api/museum-admin/communications/:id/conversation
 * @desc    Get conversation thread for a communication
 * @access  Museum Admin or Super Admin
 */
router.get('/communications/:id/conversation', museumAdminController.getConversation);

/**
 * @route   PUT /api/museum-admin/communications/:id/archive
 * @desc    Archive communication
 * @access  Museum Admin or Super Admin
 */
router.put('/communications/:id/archive', museumAdminController.archiveCommunication);

module.exports = router;
