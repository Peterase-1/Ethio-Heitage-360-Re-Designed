const Museum = require('../models/Museum');
const Artifact = require('../models/Artifact');
const Event = require('../models/Event');
const Rental = require('../models/Rental');
const Staff = require('../models/Staff');

/**
 * @desc    Get museum dashboard statistics
 * @route   GET /api/museums/dashboard/stats
 * @access  Private (museumAdmin, staff)
 */
exports.getMuseumDashboardStats = async (req, res) => {
  try {
    console.log('=== GET MUSEUM DASHBOARD STATS DEBUG ===');
    console.log('User:', req.user);

    // Get museum ID from user's profile
    let museumId = req.user.museumId;

    // If museumId is not directly available, try to find it from the Museum collection
    if (!museumId) {
      console.log('No museumId in user, searching by admin field...');
      const museum = await Museum.findOne({ admin: req.user._id });
      if (museum) {
        museumId = museum._id;
        console.log('Found museum by admin:', museumId);
      }
    }

    console.log('Using museumId:', museumId);

    if (!museumId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_MUSEUM_ASSOCIATED',
          message: 'User is not associated with any museum'
        }
      });
    }

    // Get current date info
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // Parallel queries for better performance
    const [
      totalArtifacts,
      artifactsInStorage,
      artifactsOnDisplay,
      activeRentals,
      pendingRentals,
      totalEvents,
      upcomingEvents,
      totalStaff
    ] = await Promise.all([
      // Total artifacts count
      Artifact.countDocuments({ museum: museumId }),

      // Artifacts in storage
      Artifact.countDocuments({
        museum: museumId,
        status: { $in: ['in_storage', 'under_conservation'] }
      }),

      // Artifacts on display
      Artifact.countDocuments({
        museum: museumId,
        status: 'on_display'
      }),

      // Active rentals (approved)
      Rental.countDocuments({
        museum: museumId,
        status: 'approved'
      }),

      // Pending rental requests
      Rental.countDocuments({
        museum: museumId,
        status: 'pending_review'
      }),

      // Total events this year
      Event.countDocuments({
        museum: museumId,
        startDate: { $gte: startOfYear }
      }),

      // Upcoming events
      Event.countDocuments({
        museum: museumId,
        startDate: { $gte: now },
        status: 'published'
      }),

      // Total staff
      Staff.countDocuments({ museum: museumId })
    ]);

    // Calculate monthly visitors (placeholder - set to 0 as requested)
    const monthlyVisitors = 0;

    // Calculate revenue from approved rentals
    const revenueData = await Rental.aggregate([
      {
        $match: {
          museum: museumId,
          status: 'approved'
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$pricing.totalAmount' }
        }
      }
    ]);

    const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

    const stats = {
      totalArtifacts,
      artifactsInStorage,
      artifactsOnDisplay,
      activeRentals,
      pendingRentals,
      monthlyVisitors, // Set to 0 as requested
      totalEvents,
      upcomingEvents,
      totalStaff,
      totalRevenue
    };

    console.log('Dashboard stats calculated:', stats);

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Get museum dashboard stats error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch dashboard statistics',
        details: error.message
      }
    });
  }
};

/**
 * @desc    Get recent artifacts for museum dashboard
 * @route   GET /api/museums/dashboard/recent-artifacts
 * @access  Private (museumAdmin, staff)
 */
exports.getRecentArtifacts = async (req, res) => {
  try {
    console.log('=== GET RECENT ARTIFACTS DEBUG ===');
    console.log('User:', req.user);

    // Get museum ID from user's profile
    let museumId = req.user.museumId;

    // If museumId is not directly available, try to find it from the Museum collection
    if (!museumId) {
      console.log('No museumId in user, searching by admin field...');
      const museum = await Museum.findOne({ admin: req.user._id });
      if (museum) {
        museumId = museum._id;
        console.log('Found museum by admin:', museumId);
      }
    }

    if (!museumId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_MUSEUM_ASSOCIATED',
          message: 'User is not associated with any museum'
        }
      });
    }

    // Get recent artifacts (last 10, sorted by updatedAt)
    const recentArtifacts = await Artifact.find({ museum: museumId })
      .select('name status category updatedAt createdAt')
      .sort({ updatedAt: -1 })
      .limit(10)
      .lean();

    console.log('Recent artifacts found:', recentArtifacts.length);

    // Format the response
    const formattedArtifacts = recentArtifacts.map(artifact => ({
      id: artifact._id,
      name: artifact.name,
      status: artifact.status,
      category: artifact.category,
      lastUpdated: artifact.updatedAt,
      createdAt: artifact.createdAt
    }));

    res.json({
      success: true,
      data: formattedArtifacts
    });

  } catch (error) {
    console.error('Get recent artifacts error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch recent artifacts',
        details: error.message
      }
    });
  }
};

/**
 * @desc    Get pending tasks for museum dashboard
 * @route   GET /api/museums/dashboard/pending-tasks
 * @access  Private (museumAdmin, staff)
 */
exports.getPendingTasks = async (req, res) => {
  try {
    console.log('=== GET PENDING TASKS DEBUG ===');
    console.log('User:', req.user);

    // Get museum ID from user's profile
    let museumId = req.user.museumId;

    // If museumId is not directly available, try to find it from the Museum collection
    if (!museumId) {
      console.log('No museumId in user, searching by admin field...');
      const museum = await Museum.findOne({ admin: req.user._id });
      if (museum) {
        museumId = museum._id;
        console.log('Found museum by admin:', museumId);
      }
    }

    if (!museumId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_MUSEUM_ASSOCIATED',
          message: 'User is not associated with any museum'
        }
      });
    }

    // Get pending tasks from different sources
    const [
      pendingRentals,
      pendingEvents,
      pendingStaff
    ] = await Promise.all([
      // Pending rental requests
      Rental.find({
        museum: museumId,
        status: 'pending_review'
      }).select('artifactName requesterName createdAt').limit(5),

      // Pending events (draft status)
      Event.find({
        museum: museumId,
        status: 'draft'
      }).select('title startDate createdAt').limit(3),

      // Pending staff (if any pending approval system exists)
      Staff.find({
        museum: museumId,
        status: 'pending'
      }).select('name email createdAt').limit(3)
    ]);

    // Format pending tasks
    const pendingTasks = [];

    // Add rental requests
    pendingRentals.forEach(rental => {
      pendingTasks.push({
        id: rental._id,
        type: 'rental_request',
        title: `Rental request for ${rental.artifactName}`,
        description: `Requested by ${rental.requesterName}`,
        priority: 'medium',
        createdAt: rental.createdAt,
        actionUrl: `/museum-dashboard/rentals/${rental._id}`
      });
    });

    // Add draft events
    pendingEvents.forEach(event => {
      pendingTasks.push({
        id: event._id,
        type: 'draft_event',
        title: `Draft event: ${event.title}`,
        description: `Event scheduled for ${new Date(event.startDate).toLocaleDateString()}`,
        priority: 'low',
        createdAt: event.createdAt,
        actionUrl: `/museum-dashboard/events/${event._id}/edit`
      });
    });

    // Add pending staff
    pendingStaff.forEach(staff => {
      pendingTasks.push({
        id: staff._id,
        type: 'staff_approval',
        title: `Staff member: ${staff.name}`,
        description: `Email: ${staff.email}`,
        priority: 'high',
        createdAt: staff.createdAt,
        actionUrl: `/museum-dashboard/staff/${staff._id}`
      });
    });

    // Sort by priority and creation date
    pendingTasks.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    console.log('Pending tasks found:', pendingTasks.length);

    res.json({
      success: true,
      data: pendingTasks
    });

  } catch (error) {
    console.error('Get pending tasks error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch pending tasks',
        details: error.message
      }
    });
  }
};

