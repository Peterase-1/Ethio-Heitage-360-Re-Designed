const User = require('../models/User');
const Museum = require('../models/Museum');
const Artifact = require('../models/Artifact');
const Rental = require('../models/Rental');
const Analytics = require('../models/Analytics');
const Event = require('../models/Event');
const Notification = require('../models/Notification');
const mongoose = require('mongoose');

// Heritage Site Model (assuming it exists)
try {
  const HeritageSite = require('../models/HeritageSite');
} catch (error) {
  console.log('HeritageSite model not found - will create placeholder functions');
}

// ======================
// DASHBOARD OVERVIEW
// ======================

// GET /api/museum-admin/dashboard
async function getDashboard(req, res) {
  try {
    const museumAdminId = req.user._id;

    // Find the museum this admin manages
    const museum = await Museum.findOne({ admin: museumAdminId })
      .populate('admin', 'name email')
      .populate('staff.user', 'name email');

    if (!museum) {
      return res.status(404).json({
        success: false,
        message: 'Museum not found for this admin'
      });
    }

    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // Get comprehensive museum statistics
    const [
      totalArtifacts,
      publishedArtifacts,
      pendingArtifacts,
      draftArtifacts,
      thisMonthVisitors,
      lastMonthVisitors,
      activeRentals,
      pendingRentals,
      completedRentals,
      totalRevenue,
      thisMonthRevenue
    ] = await Promise.all([
      Artifact.countDocuments({ museum: museum._id }),
      Artifact.countDocuments({ museum: museum._id, status: 'published' }),
      Artifact.countDocuments({ museum: museum._id, status: 'pending-review' }),
      Artifact.countDocuments({ museum: museum._id, status: 'draft' }),
      Analytics.aggregate([
        {
          $match: {
            museum: museum._id,
            type: 'museum_visits',
            date: { $gte: thisMonth }
          }
        },
        {
          $group: {
            _id: null,
            totalVisits: { $sum: '$museumMetrics.visits' },
            uniqueVisitors: { $sum: '$museumMetrics.uniqueVisitors' }
          }
        }
      ]),
      Analytics.aggregate([
        {
          $match: {
            museum: museum._id,
            type: 'museum_visits',
            date: { $gte: lastMonth, $lt: thisMonth }
          }
        },
        {
          $group: {
            _id: null,
            totalVisits: { $sum: '$museumMetrics.visits' },
            uniqueVisitors: { $sum: '$museumMetrics.uniqueVisitors' }
          }
        }
      ]),
      Rental.countDocuments({ museum: museum._id, status: 'active' }),
      Rental.countDocuments({
        museum: museum._id,
        'approvals.museumAdmin.status': 'pending'
      }),
      Rental.countDocuments({ museum: museum._id, status: 'completed' }),
      Rental.aggregate([
        {
          $match: {
            museum: museum._id,
            'approvals.superAdmin.status': 'approved'
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$pricing.totalAmount' }
          }
        }
      ]),
      Rental.aggregate([
        {
          $match: {
            museum: museum._id,
            'approvals.superAdmin.status': 'approved',
            createdAt: { $gte: thisMonth }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$pricing.totalAmount' }
          }
        }
      ])
    ]);

    // Calculate visitor growth
    const currentVisitors = thisMonthVisitors[0]?.uniqueVisitors || 0;
    const previousVisitors = lastMonthVisitors[0]?.uniqueVisitors || 0;
    const visitorGrowth = previousVisitors > 0
      ? ((currentVisitors - previousVisitors) / previousVisitors * 100).toFixed(1)
      : 0;

    // Get top viewed artifacts
    const topArtifacts = await Artifact.find({ museum: museum._id })
      .sort({ views: -1 })
      .limit(5)
      .select('name views likes category media accessionNumber');

    // Get recent rental requests
    const recentRentals = await Rental.find({
      museum: museum._id,
      'approvals.museumAdmin.status': 'pending'
    })
      .populate('artifact', 'name accessionNumber')
      .populate('renter', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get pending artifact approvals (staff submissions)
    const pendingApprovals = await Artifact.find({
      museum: museum._id,
      status: 'pending-review'
    })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get visitor analytics for chart (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const visitorTrends = await Analytics.aggregate([
      {
        $match: {
          museum: museum._id,
          type: 'museum_visits',
          date: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          visits: { $sum: '$museumMetrics.visits' },
          uniqueVisitors: { $sum: '$museumMetrics.uniqueVisitors' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.json({
      success: true,
      dashboard: {
        museum: {
          _id: museum._id,
          name: museum.name,
          description: museum.description,
          images: museum.images,
          contactInfo: museum.contactInfo,
          operatingHours: museum.operatingHours,
          verified: museum.verified,
          status: museum.status,
          admin: museum.admin
        },
        quickStats: {
          totalArtifacts,
          publishedArtifacts,
          pendingArtifacts,
          draftArtifacts,
          thisMonthVisitors: currentVisitors,
          visitorGrowth: parseFloat(visitorGrowth),
          activeRentals,
          pendingRentals,
          completedRentals,
          totalRevenue: totalRevenue[0]?.total || 0,
          thisMonthRevenue: thisMonthRevenue[0]?.total || 0
        },
        analytics: {
          visitorTrends,
          topArtifacts
        },
        tasks: {
          pendingApprovals: pendingApprovals.length,
          pendingRentals: recentRentals.length,
          recentRentals,
          pendingArtifacts: pendingApprovals
        }
      }
    });
  } catch (error) {
    console.error('Museum dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load dashboard data',
      error: error.message
    });
  }
}

// ======================
// MUSEUM PROFILE MANAGEMENT
// ======================

// GET /api/museum-admin/profile
async function getMuseumProfile(req, res) {
  try {
    const museum = await Museum.findOne({ admin: req.user._id })
      .populate('admin', 'name email profile')
      .populate('staff.user', 'name email profile');

    if (!museum) {
      return res.status(404).json({
        success: false,
        message: 'Museum not found'
      });
    }

    res.json({
      success: true,
      museum
    });
  } catch (error) {
    console.error('Get museum profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch museum profile',
      error: error.message
    });
  }
}

// PUT /api/museum-admin/profile
async function updateMuseumProfile(req, res) {
  try {
    const updateData = req.body;

    // Fields that can be updated by museum admin
    const allowedUpdates = [
      'name', 'description', 'contactInfo', 'operatingHours',
      'admissionFee', 'images', 'features'
    ];

    const updates = {};
    Object.keys(updateData).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = updateData[key];
      }
    });

    const museum = await Museum.findOneAndUpdate(
      { admin: req.user._id },
      { $set: updates },
      { new: true, runValidators: true }
    ).populate('admin', 'name email');

    if (!museum) {
      return res.status(404).json({
        success: false,
        message: 'Museum not found'
      });
    }

    res.json({
      success: true,
      message: 'Museum profile updated successfully',
      museum
    });
  } catch (error) {
    console.error('Update museum profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update museum profile',
      error: error.message
    });
  }
}

// ======================
// ARTIFACT MANAGEMENT
// ======================

// GET /api/museum-admin/artifacts
async function getArtifacts(req, res) {
  try {
    const museum = await Museum.findOne({ admin: req.user._id });
    if (!museum) {
      return res.status(404).json({
        success: false,
        message: 'Museum not found'
      });
    }

    const {
      page = 1,
      limit = 20,
      status,
      search,
      category,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = { museum: museum._id };

    if (status && status !== 'all') query.status = status;
    if (category && category !== 'all') query.category = category;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { accessionNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const [artifacts, total] = await Promise.all([
      Artifact.find(query)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .populate('createdBy', 'name email'),
      Artifact.countDocuments(query)
    ]);

    res.json({
      success: true,
      artifacts,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get artifacts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch artifacts',
      error: error.message
    });
  }
}

// PUT /api/museum-admin/artifacts/:id/approve
async function approveArtifact(req, res) {
  try {
    const { id } = req.params;
    const { status, feedback } = req.body;

    const museum = await Museum.findOne({ admin: req.user._id });
    if (!museum) {
      return res.status(404).json({
        success: false,
        message: 'Museum not found'
      });
    }

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be approved or rejected'
      });
    }

    const newStatus = status === 'approved' ? 'published' : 'draft';

    const artifact = await Artifact.findOneAndUpdate(
      { _id: id, museum: museum._id },
      {
        status: newStatus,
        $push: {
          reviews: {
            reviewer: req.user._id,
            status,
            feedback,
            reviewedAt: new Date()
          }
        }
      },
      { new: true }
    ).populate('createdBy', 'name email');

    if (!artifact) {
      return res.status(404).json({
        success: false,
        message: 'Artifact not found'
      });
    }

    res.json({
      success: true,
      message: `Artifact ${status} successfully`,
      artifact
    });
  } catch (error) {
    console.error('Approve artifact error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process artifact approval',
      error: error.message
    });
  }
}

// ======================
// RENTAL MANAGEMENT
// ======================

// GET /api/museum-admin/rentals
async function getRentals(req, res) {
  try {
    const museum = await Museum.findOne({ admin: req.user._id });
    if (!museum) {
      return res.status(404).json({
        success: false,
        message: 'Museum not found'
      });
    }

    const {
      page = 1,
      limit = 20,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = { museum: museum._id };
    if (status && status !== 'all') query.status = status;

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const [rentals, total] = await Promise.all([
      Rental.find(query)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .populate('artifact', 'name accessionNumber media')
        .populate('renter', 'name email profile')
        .populate('approvals.museumAdmin.approvedBy', 'name'),
      Rental.countDocuments(query)
    ]);

    res.json({
      success: true,
      rentals,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get rentals error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch rentals',
      error: error.message
    });
  }
}

// PUT /api/museum-admin/rentals/:id/review
async function reviewRental(req, res) {
  try {
    const { id } = req.params;
    const { decision, comments, isLocalBooking = false, estimatedValue = 0 } = req.body;

    const museum = await Museum.findOne({ admin: req.user._id });
    if (!museum) {
      return res.status(404).json({
        success: false,
        message: 'Museum not found'
      });
    }

    if (!['approve', 'reject', 'forward_to_owner'].includes(decision)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid decision. Must be approve, reject, or forward_to_owner'
      });
    }

    const rental = await Rental.findOne({ _id: id, museum: museum._id })
      .populate('artifact', 'name accessionNumber estimatedValue')
      .populate('renter', 'name email');

    if (!rental) {
      return res.status(404).json({
        success: false,
        message: 'Rental not found'
      });
    }

    // Define criteria for local vs high-value rentals
    const HIGH_VALUE_THRESHOLD = 5000; // USD
    const isHighValue = estimatedValue > HIGH_VALUE_THRESHOLD ||
      rental.pricing?.totalAmount > HIGH_VALUE_THRESHOLD;
    const isInternational = rental.shipping?.international || false;

    // Museum Admins can only approve small local bookings
    if (decision === 'approve' && (isHighValue || isInternational || !isLocalBooking)) {
      return res.status(403).json({
        success: false,
        message: 'High-value, international, or external rentals must be forwarded to Super Admin (Owner)'
      });
    }

    let newStatus, finalDecision;

    if (decision === 'approve' && isLocalBooking && !isHighValue && !isInternational) {
      // Museum Admin can approve small local bookings
      newStatus = 'approved_by_museum';
      finalDecision = 'approved';
    } else if (decision === 'reject') {
      // Museum Admin can reject any rental
      newStatus = 'rejected_by_museum';
      finalDecision = 'rejected';
    } else {
      // Forward to Super Admin (Owner)
      newStatus = 'pending_owner_approval';
      finalDecision = 'forwarded_to_owner';
    }

    const updatedRental = await Rental.findByIdAndUpdate(
      id,
      {
        'approvals.museumAdmin.status': finalDecision,
        'approvals.museumAdmin.approvedBy': req.user._id,
        'approvals.museumAdmin.approvedAt': new Date(),
        'approvals.museumAdmin.comments': comments,
        'approvals.museumAdmin.isLocalBooking': isLocalBooking,
        'approvals.museumAdmin.estimatedValue': estimatedValue,
        status: newStatus,
        $push: {
          timeline: {
            event: `Museum Admin ${finalDecision} rental request`,
            description: comments,
            user: req.user._id,
            timestamp: new Date()
          }
        }
      },
      { new: true }
    )
      .populate('artifact', 'name accessionNumber')
      .populate('renter', 'name email');

    // Send notifications based on decision
    if (finalDecision === 'forwarded_to_owner') {
      // Notify Super Admins
      const superAdmins = await User.find({ role: 'super_admin' });
      if (superAdmins.length > 0) {
        const recipients = superAdmins.map(admin => ({ user: admin._id }));

        await createSystemNotification({
          title: `Rental Forwarded: ${rental.artifact.name}`,
          message: `${museum.name} has forwarded a rental request for "${rental.artifact.name}" requiring Owner approval.`,
          type: 'rental_forwarded',
          category: 'rental_approval',
          priority: isHighValue || isInternational ? 'high' : 'medium',
          recipients,
          action: {
            type: 'review_rental',
            url: `/super-admin/rentals/${rental._id}`
          },
          data: {
            rentalId: rental._id,
            artifactId: rental.artifact._id,
            museumId: museum._id,
            isHighValue,
            isInternational,
            estimatedValue
          },
          context: {
            source: 'museum_rental_forward',
            sourceId: req.user._id,
            relatedEntity: 'rental',
            relatedEntityId: rental._id
          },
          createdBy: req.user._id
        });
      }
    }

    // Notify renter of decision
    await createSystemNotification({
      title: `Rental Request Update`,
      message: `Your rental request for "${rental.artifact.name}" has been ${finalDecision === 'forwarded_to_owner' ? 'forwarded for final approval' : finalDecision}.`,
      type: 'rental_update',
      category: 'rental_status',
      priority: 'medium',
      recipients: [{ user: rental.renter._id }],
      action: {
        type: 'view_rental',
        url: `/user/rentals/${rental._id}`
      },
      context: {
        source: 'museum_rental_decision',
        sourceId: req.user._id,
        relatedEntity: 'rental',
        relatedEntityId: rental._id
      },
      createdBy: req.user._id
    });

    res.json({
      success: true,
      message: `Rental ${finalDecision} successfully`,
      rental: updatedRental,
      decision: finalDecision,
      requiresOwnerApproval: finalDecision === 'forwarded_to_owner'
    });
  } catch (error) {
    console.error('Review rental error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process rental review',
      error: error.message
    });
  }
}

// ======================
// ANALYTICS & REPORTS
// ======================

// GET /api/museum-admin/analytics
async function getAnalytics(req, res) {
  try {
    const museum = await Museum.findOne({ admin: req.user._id });
    if (!museum) {
      return res.status(404).json({
        success: false,
        message: 'Museum not found'
      });
    }

    const {
      startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate = new Date(),
      type = 'overview'
    } = req.query;

    const dateRange = { start: new Date(startDate), end: new Date(endDate) };
    let analyticsData = {};

    switch (type) {
      case 'overview':
        analyticsData = await Analytics.aggregate([
          {
            $match: {
              museum: museum._id,
              date: { $gte: dateRange.start, $lte: dateRange.end }
            }
          },
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
              visits: { $sum: '$museumMetrics.visits' },
              uniqueVisitors: { $sum: '$museumMetrics.uniqueVisitors' },
              virtualTours: { $sum: '$museumMetrics.virtualTours' }
            }
          },
          { $sort: { _id: 1 } }
        ]);
        break;

      case 'artifacts':
        analyticsData = await Analytics.aggregate([
          {
            $match: {
              museum: museum._id,
              type: 'artifact_views',
              date: { $gte: dateRange.start, $lte: dateRange.end }
            }
          },
          {
            $group: {
              _id: '$artifact',
              totalViews: { $sum: '$artifactMetrics.views' },
              totalLikes: { $sum: '$artifactMetrics.likes' },
              totalShares: { $sum: '$artifactMetrics.shares' }
            }
          },
          { $sort: { totalViews: -1 } },
          { $limit: 10 },
          {
            $lookup: {
              from: 'artifacts',
              localField: '_id',
              foreignField: '_id',
              as: 'artifact'
            }
          }
        ]);
        break;

      case 'revenue':
        analyticsData = await Rental.aggregate([
          {
            $match: {
              museum: museum._id,
              'approvals.superAdmin.status': 'approved',
              createdAt: { $gte: dateRange.start, $lte: dateRange.end }
            }
          },
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
              revenue: { $sum: '$pricing.totalAmount' },
              count: { $sum: 1 }
            }
          },
          { $sort: { _id: 1 } }
        ]);
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid analytics type'
        });
    }

    res.json({
      success: true,
      analytics: analyticsData,
      dateRange,
      type
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load analytics data',
      error: error.message
    });
  }
}

// ======================
// EVENT MANAGEMENT
// ======================

// GET /api/museum-admin/events
async function getEvents(req, res) {
  try {
    const museum = await Museum.findOne({ admin: req.user._id });
    if (!museum) {
      return res.status(404).json({
        success: false,
        message: 'Museum not found'
      });
    }

    const {
      page = 1,
      limit = 20,
      status,
      type,
      search,
      sortBy = 'schedule.startDate',
      sortOrder = 'desc'
    } = req.query;

    const query = { museum: museum._id };

    if (status && status !== 'all') query.status = status;
    if (type && type !== 'all') query.type = type;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const [events, total] = await Promise.all([
      Event.find(query)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .populate('organizer', 'name email'),
      Event.countDocuments(query)
    ]);

    res.json({
      success: true,
      events,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch events',
      error: error.message
    });
  }
}

// POST /api/museum-admin/events
async function createEvent(req, res) {
  try {
    const museum = await Museum.findOne({ admin: req.user._id });
    if (!museum) {
      return res.status(404).json({
        success: false,
        message: 'Museum not found'
      });
    }

    const eventData = {
      ...req.body,
      museum: museum._id,
      organizer: req.user._id
    };

    const event = new Event(eventData);
    await event.save();

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      event
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create event',
      error: error.message
    });
  }
}

// PUT /api/museum-admin/events/:id
async function updateEvent(req, res) {
  try {
    const { id } = req.params;
    const museum = await Museum.findOne({ admin: req.user._id });

    if (!museum) {
      return res.status(404).json({
        success: false,
        message: 'Museum not found'
      });
    }

    const event = await Event.findOneAndUpdate(
      { _id: id, museum: museum._id },
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('organizer', 'name email');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.json({
      success: true,
      message: 'Event updated successfully',
      event
    });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update event',
      error: error.message
    });
  }
}

// DELETE /api/museum-admin/events/:id
async function deleteEvent(req, res) {
  try {
    const { id } = req.params;
    const museum = await Museum.findOne({ admin: req.user._id });

    if (!museum) {
      return res.status(404).json({
        success: false,
        message: 'Museum not found'
      });
    }

    const event = await Event.findOneAndDelete({
      _id: id,
      museum: museum._id
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete event',
      error: error.message
    });
  }
}

// ======================
// NOTIFICATION MANAGEMENT
// ======================

// GET /api/museum-admin/notifications
async function getNotifications(req, res) {
  try {
    const museum = await Museum.findOne({ admin: req.user._id });
    if (!museum) {
      return res.status(404).json({
        success: false,
        message: 'Museum not found'
      });
    }

    const {
      page = 1,
      limit = 50,
      type,
      category,
      priority,
      unreadOnly = false,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const options = {
      limit: Number(limit),
      unreadOnly: unreadOnly === 'true'
    };

    if (type && type !== 'all') options.type = type;
    if (category && category !== 'all') options.category = category;
    if (priority && priority !== 'all') options.priority = priority;

    // Get notifications for this museum admin
    const notifications = await Notification.getForUser(req.user._id, options);

    // Get total count for pagination
    const totalQuery = {
      'recipients.user': req.user._id,
      isActive: true,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: new Date() } }
      ]
    };

    if (unreadOnly === 'true') {
      totalQuery['recipients.readAt'] = { $exists: false };
    }
    if (type && type !== 'all') totalQuery.type = type;
    if (category && category !== 'all') totalQuery.category = category;
    if (priority && priority !== 'all') totalQuery.priority = priority;

    const total = await Notification.countDocuments(totalQuery);

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
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
      },
      unreadCount
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message
    });
  }
}

// PUT /api/museum-admin/notifications/:id/read
async function markNotificationAsRead(req, res) {
  try {
    const { id } = req.params;

    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Check if user is a recipient
    const recipient = notification.recipients.find(r => r.user.toString() === req.user._id.toString());
    if (!recipient) {
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
}

// PUT /api/museum-admin/notifications/:id/dismiss
async function dismissNotification(req, res) {
  try {
    const { id } = req.params;

    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Check if user is a recipient
    const recipient = notification.recipients.find(r => r.user.toString() === req.user._id.toString());
    if (!recipient) {
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
}

// PUT /api/museum-admin/notifications/:id/action
async function takeNotificationAction(req, res) {
  try {
    const { id } = req.params;
    const { response } = req.body;

    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Check if user is a recipient
    const recipient = notification.recipients.find(r => r.user.toString() === req.user._id.toString());
    if (!recipient) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await notification.markAsActedUpon(req.user._id, response);

    res.json({
      success: true,
      message: 'Action recorded for notification'
    });
  } catch (error) {
    console.error('Take notification action error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record notification action',
      error: error.message
    });
  }
}

// POST /api/museum-admin/notifications
async function createNotification(req, res) {
  try {
    const museum = await Museum.findOne({ admin: req.user._id });
    if (!museum) {
      return res.status(404).json({
        success: false,
        message: 'Museum not found'
      });
    }

    const {
      title,
      message,
      type,
      category,
      priority = 'medium',
      recipients,
      action,
      expiresAt
    } = req.body;

    // Validate required fields
    if (!title || !message || !type || !category) {
      return res.status(400).json({
        success: false,
        message: 'Title, message, type, and category are required'
      });
    }

    // Create notification
    const notification = new Notification({
      title,
      message,
      type,
      category,
      priority,
      recipients: recipients || [{ user: req.user._id }],
      action: action || { type: 'none' },
      context: {
        source: 'museum_admin',
        sourceId: req.user._id,
        relatedEntity: 'museum',
        relatedEntityId: museum._id
      },
      createdBy: req.user._id,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined
    });

    await notification.save();

    // Send notification if immediate delivery is enabled
    if (notification.delivery.immediate) {
      await notification.send();
    }

    // Send real-time notification via WebSocket
    const notificationService = req.app.get('notificationService');
    if (notificationService) {
      const notificationRecipients = recipients || [{ user: req.user._id }];

      for (const recipient of notificationRecipients) {
        await notificationService.sendNotificationToUser(recipient.user, notification);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      notification
    });
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create notification',
      error: error.message
    });
  }
}

// Helper function to create system notifications
async function createSystemNotification(data) {
  try {
    const notification = new Notification({
      ...data,
      context: {
        source: 'system',
        ...data.context
      },
      delivery: {
        immediate: true,
        channels: [{ type: 'in_app', enabled: true }]
      }
    });

    await notification.save();
    await notification.send();

    return notification;
  } catch (error) {
    console.error('Create system notification error:', error);
    throw error;
  }
}

// ======================
// STAFF MANAGEMENT
// ======================

// GET /api/museum-admin/staff
async function getStaff(req, res) {
  try {
    const museum = await Museum.findOne({ admin: req.user._id })
      .populate('staff.user', 'name email profile isActive lastLogin');

    if (!museum) {
      return res.status(404).json({
        success: false,
        message: 'Museum not found'
      });
    }

    res.json({
      success: true,
      staff: museum.staff
    });
  } catch (error) {
    console.error('Get staff error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch staff',
      error: error.message
    });
  }
}

// POST /api/museum-admin/staff
async function addStaff(req, res) {
  try {
    const { userId, role, permissions } = req.body;

    const museum = await Museum.findOne({ admin: req.user._id });
    if (!museum) {
      return res.status(404).json({
        success: false,
        message: 'Museum not found'
      });
    }

    // Check if user exists and is not already staff
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const existingStaff = museum.staff.find(s => s.user.toString() === userId);
    if (existingStaff) {
      return res.status(400).json({
        success: false,
        message: 'User is already a staff member'
      });
    }

    museum.staff.push({
      user: userId,
      role,
      permissions: permissions || []
    });

    await museum.save();
    await museum.populate('staff.user', 'name email profile');

    res.status(201).json({
      success: true,
      message: 'Staff member added successfully',
      staff: museum.staff
    });
  } catch (error) {
    console.error('Add staff error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add staff member',
      error: error.message
    });
  }
}

// PUT /api/museum-admin/staff/:userId
async function updateStaff(req, res) {
  try {
    const { userId } = req.params;
    const { role, permissions } = req.body;

    const museum = await Museum.findOne({ admin: req.user._id });
    if (!museum) {
      return res.status(404).json({
        success: false,
        message: 'Museum not found'
      });
    }

    const staffIndex = museum.staff.findIndex(s => s.user.toString() === userId);
    if (staffIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    if (role) museum.staff[staffIndex].role = role;
    if (permissions) museum.staff[staffIndex].permissions = permissions;

    await museum.save();
    await museum.populate('staff.user', 'name email profile');

    res.json({
      success: true,
      message: 'Staff member updated successfully',
      staff: museum.staff
    });
  } catch (error) {
    console.error('Update staff error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update staff member',
      error: error.message
    });
  }
}

// DELETE /api/museum-admin/staff/:userId
async function removeStaff(req, res) {
  try {
    const { userId } = req.params;

    const museum = await Museum.findOne({ admin: req.user._id });
    if (!museum) {
      return res.status(404).json({
        success: false,
        message: 'Museum not found'
      });
    }

    museum.staff = museum.staff.filter(s => s.user.toString() !== userId);
    await museum.save();

    res.json({
      success: true,
      message: 'Staff member removed successfully'
    });
  } catch (error) {
    console.error('Remove staff error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove staff member',
      error: error.message
    });
  }
}

// ======================
// MUSEUM CONTENT MANAGEMENT
// ======================

// GET /api/museum-admin/artifacts/all
async function getAllMuseumArtifacts(req, res) {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      search,
      category,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Find museum for this admin (or if super admin, get from query)
    let museum;
    if (req.user.role === 'super_admin' && req.query.museumId) {
      museum = await Museum.findById(req.query.museumId);
    } else {
      museum = await Museum.findOne({ admin: req.user._id });
    }

    if (!museum) {
      return res.status(404).json({
        success: false,
        message: 'Museum not found'
      });
    }

    const query = { museum: museum._id };

    if (status && status !== 'all') query.status = status;
    if (category && category !== 'all') query.category = category;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { accessionNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const [artifacts, total] = await Promise.all([
      Artifact.find(query)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .populate('createdBy', 'name email')
        .populate('museum', 'name'),
      Artifact.countDocuments(query)
    ]);

    res.json({
      success: true,
      artifacts,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit)
      },
      museum: {
        _id: museum._id,
        name: museum.name
      }
    });
  } catch (error) {
    console.error('Get all museum artifacts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch artifacts',
      error: error.message
    });
  }
}

// GET /api/museum-admin/museums (for super admin access)
async function getAllMuseumsForAdmin(req, res) {
  try {
    // This function is accessible by super admin to manage all museums
    const {
      page = 1,
      limit = 20,
      status,
      verified,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = { isActive: true };

    if (status && status !== 'all') query.status = status;
    if (verified !== undefined) query.verified = verified === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const [museums, total] = await Promise.all([
      Museum.find(query)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .populate('admin', 'name email')
        .populate('staff.user', 'name email'),
      Museum.countDocuments(query)
    ]);

    res.json({
      success: true,
      museums,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all museums error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch museums',
      error: error.message
    });
  }
}

// PUT /api/museum-admin/museums/:id/status (for super admin access)
async function updateMuseumStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    if (!['pending', 'approved', 'rejected', 'suspended'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const museum = await Museum.findByIdAndUpdate(
      id,
      {
        status,
        verified: status === 'approved'
      },
      { new: true, runValidators: true }
    ).populate('admin', 'name email');

    if (!museum) {
      return res.status(404).json({
        success: false,
        message: 'Museum not found'
      });
    }

    res.json({
      success: true,
      message: `Museum ${status} successfully`,
      museum
    });
  } catch (error) {
    console.error('Update museum status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update museum status',
      error: error.message
    });
  }
}

// GET /api/museum-admin/rentals/all (comprehensive rental management)
async function getAllRentalsForMuseum(req, res) {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Find museum for this admin (or if super admin, get from query)
    let museumQuery = {};
    if (req.user.role === 'super_admin' && req.query.museumId) {
      museumQuery._id = req.query.museumId;
    } else {
      museumQuery.admin = req.user._id;
    }

    const museum = await Museum.findOne(museumQuery);
    if (!museum && req.user.role !== 'super_admin') {
      return res.status(404).json({
        success: false,
        message: 'Museum not found'
      });
    }

    const query = {};
    if (museum) query.museum = museum._id;
    if (status && status !== 'all') query.status = status;

    if (search) {
      // Search in artifact names or renter names
      const users = await User.find({
        name: { $regex: search, $options: 'i' }
      }).select('_id');

      const artifacts = await Artifact.find({
        name: { $regex: search, $options: 'i' }
      }).select('_id');

      query.$or = [
        { renter: { $in: users.map(u => u._id) } },
        { artifact: { $in: artifacts.map(a => a._id) } }
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const [rentals, total] = await Promise.all([
      Rental.find(query)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .populate('artifact', 'name accessionNumber')
        .populate('museum', 'name')
        .populate('renter', 'name email')
        .populate('approvals.superAdmin.approvedBy', 'name')
        .populate('approvals.museumAdmin.approvedBy', 'name'),
      Rental.countDocuments(query)
    ]);

    res.json({
      success: true,
      rentals,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit)
      },
      museum: museum ? { _id: museum._id, name: museum.name } : null
    });
  } catch (error) {
    console.error('Get all rentals error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch rentals',
      error: error.message
    });
  }
}

// ======================
// CONTENT MODERATION
// ======================

// GET /api/museum-admin/content/pending
async function getPendingContent(req, res) {
  try {
    const museum = await Museum.findOne({ admin: req.user._id });
    if (!museum) {
      return res.status(404).json({
        success: false,
        message: 'Museum not found'
      });
    }

    const {
      page = 1,
      limit = 20,
      type = 'all',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    let pendingContent = {};
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Get pending artifacts for this museum
    if (type === 'all' || type === 'artifacts') {
      const artifactsQuery = {
        museum: museum._id,
        status: { $in: ['pending-review', 'needs-revision'] }
      };

      const [pendingArtifacts, artifactsTotal] = await Promise.all([
        Artifact.find(artifactsQuery)
          .sort(sort)
          .limit(type === 'artifacts' ? Number(limit) : 10)
          .populate('createdBy', 'name email')
          .populate('reviews.reviewer', 'name email'),
        Artifact.countDocuments(artifactsQuery)
      ]);

      pendingContent.artifacts = {
        items: pendingArtifacts,
        total: artifactsTotal
      };
    }

    // Get pending virtual museum content
    if (type === 'all' || type === 'virtual_museums') {
      // For now, return empty array - virtual museum model may need to be created
      pendingContent.virtualMuseums = {
        items: [],
        total: 0
      };
    }

    // Get pending events
    if (type === 'all' || type === 'events') {
      const eventsQuery = {
        museum: museum._id,
        status: { $in: ['pending', 'needs-revision'] }
      };

      const [pendingEvents, eventsTotal] = await Promise.all([
        Event.find(eventsQuery)
          .sort(sort)
          .limit(type === 'events' ? Number(limit) : 5)
          .populate('organizer', 'name email'),
        Event.countDocuments(eventsQuery)
      ]);

      pendingContent.events = {
        items: pendingEvents,
        total: eventsTotal
      };
    }

    res.json({
      success: true,
      pendingContent,
      museum: {
        _id: museum._id,
        name: museum.name
      }
    });
  } catch (error) {
    console.error('Get pending content error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending content',
      error: error.message
    });
  }
}

// PUT /api/museum-admin/content/artifacts/:id/submit
async function submitArtifactForApproval(req, res) {
  try {
    const { id } = req.params;
    const { notes, culturalContext, educationalValue, recommendation } = req.body;

    const museum = await Museum.findOne({ admin: req.user._id });
    if (!museum) {
      return res.status(404).json({
        success: false,
        message: 'Museum not found'
      });
    }

    const artifact = await Artifact.findOne({
      _id: id,
      museum: museum._id
    });

    if (!artifact) {
      return res.status(404).json({
        success: false,
        message: 'Artifact not found'
      });
    }

    // Add museum admin review before submitting to Super Admin
    const reviewData = {
      reviewer: req.user._id,
      reviewerRole: 'museum_admin',
      status: 'submitted_to_super_admin',
      notes: notes || '',
      culturalContext: culturalContext || '',
      educationalValue: educationalValue || '',
      recommendation: recommendation || 'approve',
      reviewedAt: new Date(),
      reviewLevel: 'museum_submission'
    };

    artifact.reviews.push(reviewData);
    artifact.status = 'pending_super_admin_approval';
    artifact.submittedToSuperAdmin = {
      submittedBy: req.user._id,
      submittedAt: new Date(),
      museumRecommendation: recommendation
    };

    await artifact.save();

    // Create notification for Super Admins
    const superAdmins = await User.find({ role: 'super_admin' });
    if (superAdmins.length > 0) {
      const recipients = superAdmins.map(admin => ({ user: admin._id }));

      await createSystemNotification({
        title: `Artifact Submission: ${artifact.name}`,
        message: `${museum.name} has submitted artifact "${artifact.name}" for your approval.`,
        type: 'artifact_submission',
        category: 'content_approval',
        priority: 'medium',
        recipients,
        action: {
          type: 'review_artifact',
          url: `/super-admin/content/artifacts/${artifact._id}`
        },
        data: {
          artifactId: artifact._id,
          museumId: museum._id,
          museumRecommendation: recommendation,
          culturalContext
        },
        context: {
          source: 'museum_submission',
          sourceId: req.user._id,
          relatedEntity: 'artifact',
          relatedEntityId: artifact._id
        },
        createdBy: req.user._id
      });
    }

    await artifact.populate('createdBy', 'name email');

    res.json({
      success: true,
      message: 'Artifact submitted to Super Admin for approval',
      artifact
    });
  } catch (error) {
    console.error('Submit artifact for approval error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit artifact for approval',
      error: error.message
    });
  }
}

// PUT /api/museum-admin/content/virtual-museums/:id/review
async function reviewVirtualMuseum(req, res) {
  try {
    const { id } = req.params;
    const { status, feedback, userExperienceNotes, educationalValueNotes } = req.body;

    const museum = await Museum.findOne({ admin: req.user._id });
    if (!museum) {
      return res.status(404).json({
        success: false,
        message: 'Museum not found'
      });
    }

    // For now, return a placeholder response since VirtualMuseum model may not exist
    // This function would need to be implemented once VirtualMuseum model is created
    res.json({
      success: true,
      message: 'Virtual museum review functionality will be implemented with VirtualMuseum model',
      note: 'Placeholder function - requires VirtualMuseum model implementation'
    });
  } catch (error) {
    console.error('Review virtual museum error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to review virtual museum',
      error: error.message
    });
  }
}

// GET /api/museum-admin/content/reviews
async function getContentReviews(req, res) {
  try {
    const museum = await Museum.findOne({ admin: req.user._id });
    if (!museum) {
      return res.status(404).json({
        success: false,
        message: 'Museum not found'
      });
    }

    const {
      page = 1,
      limit = 20,
      status,
      reviewerRole,
      sortBy = 'reviewedAt',
      sortOrder = 'desc'
    } = req.query;

    // Get all artifacts with reviews for this museum
    const matchQuery = {
      museum: museum._id,
      'reviews.0': { $exists: true }
    };

    if (status && status !== 'all') {
      matchQuery['reviews.status'] = status;
    }
    if (reviewerRole && reviewerRole !== 'all') {
      matchQuery['reviews.reviewerRole'] = reviewerRole;
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const [artifactReviews, total] = await Promise.all([
      Artifact.find(matchQuery)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .populate('createdBy', 'name email')
        .populate('reviews.reviewer', 'name email')
        .select('name accessionNumber status reviews createdAt'),
      Artifact.countDocuments(matchQuery)
    ]);

    res.json({
      success: true,
      reviews: artifactReviews,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit)
      },
      museum: {
        _id: museum._id,
        name: museum.name
      }
    });
  } catch (error) {
    console.error('Get content reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch content reviews',
      error: error.message
    });
  }
}

// POST /api/museum-admin/content/feedback
async function provideFeedback(req, res) {
  try {
    const {
      contentType,
      contentId,
      feedbackType,
      message,
      suggestions,
      priority = 'medium',
      requiresResponse = false
    } = req.body;

    const museum = await Museum.findOne({ admin: req.user._id });
    if (!museum) {
      return res.status(404).json({
        success: false,
        message: 'Museum not found'
      });
    }

    // Validate required fields
    if (!contentType || !contentId || !feedbackType || !message) {
      return res.status(400).json({
        success: false,
        message: 'Content type, content ID, feedback type, and message are required'
      });
    }

    // Find the content creator to send feedback to
    let contentCreator = null;
    let contentTitle = 'Content';

    if (contentType === 'artifact') {
      const artifact = await Artifact.findOne({ _id: contentId, museum: museum._id });
      if (artifact) {
        contentCreator = artifact.createdBy;
        contentTitle = artifact.name;
      }
    } else if (contentType === 'event') {
      const event = await Event.findOne({ _id: contentId, museum: museum._id });
      if (event) {
        contentCreator = event.organizer;
        contentTitle = event.title;
      }
    }

    if (!contentCreator) {
      return res.status(404).json({
        success: false,
        message: 'Content not found or invalid content type'
      });
    }

    // Create feedback notification
    const feedbackNotification = await createSystemNotification({
      title: `Feedback on ${contentTitle}`,
      message: `Museum Admin has provided ${feedbackType} feedback on your ${contentType}: ${message}`,
      type: 'feedback',
      category: 'content_improvement',
      priority,
      recipients: [{ user: contentCreator }],
      action: {
        type: 'view_content',
        url: `/${contentType}s/${contentId}`,
        requiresResponse
      },
      data: {
        feedbackType,
        suggestions: suggestions || [],
        contentType,
        contentId,
        providedBy: req.user._id
      },
      context: {
        source: 'museum_admin_feedback',
        sourceId: req.user._id,
        relatedEntity: contentType,
        relatedEntityId: contentId
      },
      createdBy: req.user._id,
      requiresResponse
    });

    res.status(201).json({
      success: true,
      message: 'Feedback provided successfully',
      feedbackId: feedbackNotification._id
    });
  } catch (error) {
    console.error('Provide feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to provide feedback',
      error: error.message
    });
  }
}

// ======================
// HERITAGE SITE MANAGEMENT
// ======================

// GET /api/museum-admin/heritage-sites
async function getHeritageSites(req, res) {
  try {
    const museum = await Museum.findOne({ admin: req.user._id });
    if (!museum) {
      return res.status(404).json({
        success: false,
        message: 'Museum not found'
      });
    }

    const {
      page = 1,
      limit = 20,
      region,
      status,
      search,
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;

    // For now, return placeholder data since HeritageSite model may not exist
    // This would need to be implemented with actual HeritageSite model

    const placeholderSites = [
      {
        _id: '507f1f77bcf86cd799439011',
        name: 'Lalibela Rock Churches',
        description: 'Medieval churches carved out of rock',
        region: 'Amhara',
        status: 'active',
        coordinates: [39.0473, 12.0313],
        relatedMuseum: museum._id,
        suggestedBy: req.user._id
      }
    ];

    res.json({
      success: true,
      heritageSites: placeholderSites,
      pagination: {
        total: placeholderSites.length,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(placeholderSites.length / limit)
      },
      note: 'This is placeholder data - requires HeritageSite model implementation'
    });
  } catch (error) {
    console.error('Get heritage sites error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch heritage sites',
      error: error.message
    });
  }
}

// POST /api/museum-admin/heritage-sites/suggest
async function suggestHeritageSite(req, res) {
  try {
    const museum = await Museum.findOne({ admin: req.user._id });
    if (!museum) {
      return res.status(404).json({
        success: false,
        message: 'Museum not found'
      });
    }

    const {
      name,
      description,
      location,
      historicalSignificance,
      culturalImportance,
      proposedClassification,
      supportingDocuments,
      images,
      relatedArtifacts
    } = req.body;

    // Validate required fields
    if (!name || !description || !location || !historicalSignificance) {
      return res.status(400).json({
        success: false,
        message: 'Name, description, location, and historical significance are required'
      });
    }

    // For now, create a placeholder suggestion object
    // This would need to be implemented with actual HeritageSite model
    const suggestionData = {
      name,
      description,
      location,
      historicalSignificance,
      culturalImportance,
      proposedClassification: proposedClassification || 'regional',
      supportingDocuments: supportingDocuments || [],
      images: images || [],
      relatedArtifacts: relatedArtifacts || [],
      suggestedBy: req.user._id,
      suggestedByMuseum: museum._id,
      status: 'pending_review',
      submittedAt: new Date(),
      reviewLevel: 'awaiting_super_admin'
    };

    // Create notification for Super Admin about new heritage site suggestion
    const superAdmins = await User.find({ role: 'super_admin' });
    const recipients = superAdmins.map(admin => ({ user: admin._id }));

    if (recipients.length > 0) {
      await createSystemNotification({
        title: 'New Heritage Site Suggestion',
        message: `${museum.name} has suggested a new heritage site: "${name}" for review and approval.`,
        type: 'heritage_site_suggestion',
        category: 'cultural_heritage',
        priority: 'medium',
        recipients,
        action: {
          type: 'review_heritage_site',
          url: `/super-admin/heritage-sites/suggestions`
        },
        data: suggestionData,
        context: {
          source: 'museum_heritage_suggestion',
          sourceId: req.user._id,
          relatedEntity: 'museum',
          relatedEntityId: museum._id
        },
        createdBy: req.user._id
      });
    }

    res.status(201).json({
      success: true,
      message: 'Heritage site suggestion submitted successfully',
      suggestion: suggestionData,
      note: 'This is placeholder functionality - requires HeritageSite model implementation'
    });
  } catch (error) {
    console.error('Suggest heritage site error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit heritage site suggestion',
      error: error.message
    });
  }
}

// GET /api/museum-admin/heritage-sites/suggestions
async function getHeritageSiteSuggestions(req, res) {
  try {
    const museum = await Museum.findOne({ admin: req.user._id });
    if (!museum) {
      return res.status(404).json({
        success: false,
        message: 'Museum not found'
      });
    }

    const {
      page = 1,
      limit = 20,
      status,
      sortBy = 'submittedAt',
      sortOrder = 'desc'
    } = req.query;

    // For now, return placeholder data
    // This would query HeritageSite model for suggestions by this museum
    const placeholderSuggestions = [
      {
        _id: '507f1f77bcf86cd799439012',
        name: 'Ancient Trading Post Ruins',
        description: 'Recently discovered ruins of ancient trading post',
        status: 'pending_review',
        submittedAt: new Date(),
        reviewComments: [],
        suggestedBy: req.user._id,
        suggestedByMuseum: museum._id
      }
    ];

    res.json({
      success: true,
      suggestions: placeholderSuggestions,
      pagination: {
        total: placeholderSuggestions.length,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(placeholderSuggestions.length / limit)
      },
      museum: {
        _id: museum._id,
        name: museum.name
      },
      note: 'This is placeholder data - requires HeritageSite model implementation'
    });
  } catch (error) {
    console.error('Get heritage site suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch heritage site suggestions',
      error: error.message
    });
  }
}

// PUT /api/museum-admin/heritage-sites/suggestions/:id
async function updateHeritageSiteSuggestion(req, res) {
  try {
    const { id } = req.params;
    const museum = await Museum.findOne({ admin: req.user._id });

    if (!museum) {
      return res.status(404).json({
        success: false,
        message: 'Museum not found'
      });
    }

    const updateData = req.body;

    // For now, return placeholder response
    // This would update the HeritageSite suggestion in the database
    res.json({
      success: true,
      message: 'Heritage site suggestion updated successfully',
      suggestionId: id,
      note: 'This is placeholder functionality - requires HeritageSite model implementation'
    });
  } catch (error) {
    console.error('Update heritage site suggestion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update heritage site suggestion',
      error: error.message
    });
  }
}

module.exports = {
  // Dashboard
  getDashboard,

  // Museum Profile
  getMuseumProfile,
  updateMuseumProfile,

  // Artifact Management
  getArtifacts,
  approveArtifact,
  getAllMuseumArtifacts,

  // Rental Management
  getRentals,
  approveRental: reviewRental, // Updated to use reviewRental function
  getAllRentalsForMuseum,

  // Analytics
  getAnalytics,

  // Event Management
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,

  // Notification Management
  getNotifications,
  markNotificationAsRead,
  dismissNotification,
  takeNotificationAction,
  createNotification,
  createSystemNotification,

  // Staff Management
  getStaff,
  addStaff,
  updateStaff,
  removeStaff,

  // Museum Management (for super admin access)
  getAllMuseumsForAdmin,
  updateMuseumStatus,

  // Content Moderation (Limited - Submit to Super Admin)
  getPendingContent,
  submitArtifactForApproval, // Museum Admin submits to Super Admin
  reviewVirtualMuseum,
  getContentReviews,
  provideFeedback,

  // Heritage Site Management (Suggestions Only)
  getHeritageSites,
  suggestHeritageSite,
  getHeritageSiteSuggestions,
  updateHeritageSiteSuggestion
};
