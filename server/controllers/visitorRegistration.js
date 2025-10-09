const VisitorRegistration = require('../models/VisitorRegistration');
const Museum = require('../models/Museum');

// Generate unique registration ID
const generateRegistrationId = () => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `VR-${timestamp}-${random}`.toUpperCase();
};

// Generate transaction ID
const generateTransactionId = () => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 8);
  return `TXN-${timestamp}-${random}`.toUpperCase();
};

/**
 * @desc    Register a new visitor
 * @route   POST /api/visitor-registration
 * @access  Museum Admin
 */
const registerVisitor = async (req, res) => {
  try {
    const {
      visitorInfo,
      visitDetails,
      payment,
      specialRequirements,
      notes
    } = req.body;

    // For public visitor registration, get museum from request body or use default
    let museumId = req.body.museumId;

    // If no museum specified and user is authenticated, use their museum
    if (!museumId && req.user && req.user.museumId) {
      museumId = req.user.museumId;
    }

    // If still no museum, use a default museum (you can change this to your preferred default)
    if (!museumId) {
      // Find the first available museum or create a default one
      const defaultMuseum = await Museum.findOne({});
      if (defaultMuseum) {
        museumId = defaultMuseum._id;
      } else {
        return res.status(400).json({
          success: false,
          message: 'No museum available for registration. Please specify a museum ID.'
        });
      }
    }

    // Validate museum exists
    const museum = await Museum.findById(museumId);
    if (!museum) {
      return res.status(404).json({
        success: false,
        message: 'Museum not found'
      });
    }

    // Create visitor registration
    const registration = new VisitorRegistration({
      registrationId: generateRegistrationId(),
      visitorInfo,
      visitDetails,
      museum: museumId,
      registeredBy: req.user ? req.user.id : undefined, // Use undefined instead of null
      payment: {
        ...payment,
        transactionId: generateTransactionId()
      },
      specialRequirements,
      notes
    });

    await registration.save();

    // Populate the response
    await registration.populate([
      { path: 'museum', select: 'name location' },
      { path: 'registeredBy', select: 'name email role' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Visitor registered successfully',
      data: registration
    });

  } catch (error) {
    console.error('Register visitor error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register visitor',
      error: error.message
    });
  }
};

/**
 * @desc    Get all visitor registrations for a museum
 * @route   GET /api/visitor-registration
 * @access  Museum Admin
 */
const getVisitorRegistrations = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      visitorType,
      visitDate,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const museumId = req.user.museumId;
    if (!museumId) {
      return res.status(400).json({
        success: false,
        message: 'User is not associated with a museum'
      });
    }

    const query = { museum: museumId };

    // Add filters
    if (status && status !== 'all') query.status = status;
    if (visitorType && visitorType !== 'all') query['visitorInfo.visitorType'] = visitorType;
    if (visitDate) {
      const date = new Date(visitDate);
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      query['visitDetails.visitDate'] = {
        $gte: date,
        $lt: nextDay
      };
    }

    // Add search functionality
    if (search && search.trim()) {
      query.$or = [
        { registrationId: { $regex: search, $options: 'i' } },
        { 'visitorInfo.name': { $regex: search, $options: 'i' } },
        { 'visitorInfo.email': { $regex: search, $options: 'i' } },
        { 'visitorInfo.phone': { $regex: search, $options: 'i' } }
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [registrations, total] = await Promise.all([
      VisitorRegistration.find(query)
        .populate('museum', 'name location')
        .populate('registeredBy', 'name email role')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      VisitorRegistration.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        registrations,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          limit: parseInt(limit),
          hasNext: parseInt(page) < Math.ceil(total / parseInt(limit)),
          hasPrev: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Get visitor registrations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch visitor registrations',
      error: error.message
    });
  }
};

/**
 * @desc    Get visitor registration by ID
 * @route   GET /api/visitor-registration/:id
 * @access  Museum Admin
 */
const getVisitorRegistrationById = async (req, res) => {
  try {
    const registration = await VisitorRegistration.findById(req.params.id)
      .populate('museum', 'name location')
      .populate('registeredBy', 'name email role');

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Visitor registration not found'
      });
    }

    // Check if user has access to this registration
    if (req.user.role !== 'superAdmin' && registration.museum._id.toString() !== req.user.museumId?.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this visitor registration'
      });
    }

    res.json({
      success: true,
      data: registration
    });

  } catch (error) {
    console.error('Get visitor registration by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch visitor registration',
      error: error.message
    });
  }
};

/**
 * @desc    Update visitor registration status
 * @route   PUT /api/visitor-registration/:id/status
 * @access  Museum Admin
 */
const updateVisitorStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const registrationId = req.params.id;

    const registration = await VisitorRegistration.findById(registrationId);
    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Visitor registration not found'
      });
    }

    // Check if user has access to this registration
    if (req.user.role !== 'superAdmin' && registration.museum.toString() !== req.user.museumId?.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this visitor registration'
      });
    }

    // Update status and timestamps
    registration.status = status;
    if (status === 'checked_in') {
      registration.checkedInAt = new Date();
    } else if (status === 'checked_out') {
      registration.checkedOutAt = new Date();
    }

    await registration.save();

    res.json({
      success: true,
      message: 'Visitor status updated successfully',
      data: registration
    });

  } catch (error) {
    console.error('Update visitor status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update visitor status',
      error: error.message
    });
  }
};

/**
 * @desc    Get visitor analytics for museum
 * @route   GET /api/visitor-registration/analytics
 * @access  Museum Admin
 */
const getVisitorAnalytics = async (req, res) => {
  try {
    const museumId = req.user.museumId;
    if (!museumId) {
      return res.status(400).json({
        success: false,
        message: 'User is not associated with a museum'
      });
    }

    const { period = '30' } = req.query; // days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Get basic statistics
    const [
      totalVisitors,
      todayVisitors,
      thisWeekVisitors,
      thisMonthVisitors,
      visitorsByType,
      visitorsByStatus,
      dailyVisitors,
      revenueStats
    ] = await Promise.all([
      // Total visitors
      VisitorRegistration.countDocuments({ museum: museumId }),

      // Today's visitors
      VisitorRegistration.countDocuments({
        museum: museumId,
        'visitDetails.visitDate': {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          $lt: new Date(new Date().setHours(23, 59, 59, 999))
        }
      }),

      // This week's visitors
      VisitorRegistration.countDocuments({
        museum: museumId,
        'visitDetails.visitDate': {
          $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      }),

      // This month's visitors
      VisitorRegistration.countDocuments({
        museum: museumId,
        'visitDetails.visitDate': {
          $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      }),

      // Visitors by type
      VisitorRegistration.aggregate([
        { $match: { museum: museumId } },
        { $group: { _id: '$visitorInfo.visitorType', count: { $sum: 1 } } }
      ]),

      // Visitors by status
      VisitorRegistration.aggregate([
        { $match: { museum: museumId } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),

      // Daily visitors for the period
      VisitorRegistration.aggregate([
        { $match: { museum: museumId, 'visitDetails.visitDate': { $gte: startDate } } },
        {
          $group: {
            _id: {
              year: { $year: '$visitDetails.visitDate' },
              month: { $month: '$visitDetails.visitDate' },
              day: { $dayOfMonth: '$visitDetails.visitDate' }
            },
            count: { $sum: 1 },
            revenue: { $sum: '$payment.amount' }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
      ]),

      // Revenue statistics
      VisitorRegistration.aggregate([
        { $match: { museum: museumId, 'payment.paymentStatus': 'completed' } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$payment.amount' },
            averageRevenue: { $avg: '$payment.amount' },
            maxRevenue: { $max: '$payment.amount' },
            minRevenue: { $min: '$payment.amount' }
          }
        }
      ])
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalVisitors,
          todayVisitors,
          thisWeekVisitors,
          thisMonthVisitors
        },
        distribution: {
          byType: visitorsByType,
          byStatus: visitorsByStatus
        },
        trends: {
          dailyVisitors
        },
        revenue: revenueStats[0] || {
          totalRevenue: 0,
          averageRevenue: 0,
          maxRevenue: 0,
          minRevenue: 0
        }
      }
    });

  } catch (error) {
    console.error('Get visitor analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch visitor analytics',
      error: error.message
    });
  }
};

/**
 * @desc    Refresh visitor registration data and analytics
 * @route   POST /api/visitor-registration/refresh
 * @access  Museum Admin
 */
const refreshData = async (req, res) => {
  try {
    console.log('🔄 Refreshing visitor registration data...');

    const museumId = req.user.museumId;
    if (!museumId) {
      return res.status(400).json({
        success: false,
        message: 'User is not associated with a museum'
      });
    }

    // Get fresh data
    const registrations = await VisitorRegistration.find({ museum: museumId })
      .populate('museum', 'name location')
      .populate('registeredBy', 'name email role')
      .sort({ createdAt: -1 });

    // Get analytics data
    const totalVisitors = await VisitorRegistration.countDocuments({ museum: museumId });
    const todayVisitors = await VisitorRegistration.countDocuments({
      museum: museumId,
      createdAt: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        $lt: new Date(new Date().setHours(23, 59, 59, 999))
      }
    });

    const thisWeekVisitors = await VisitorRegistration.countDocuments({
      museum: museumId,
      createdAt: {
        $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      }
    });

    const thisMonthVisitors = await VisitorRegistration.countDocuments({
      museum: museumId,
      createdAt: {
        $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      }
    });

    // Calculate revenue
    const revenueData = await VisitorRegistration.aggregate([
      { $match: { museum: museumId } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$payment.amount' },
          averageRevenue: { $avg: '$payment.amount' },
          maxRevenue: { $max: '$payment.amount' },
          minRevenue: { $min: '$payment.amount' }
        }
      }
    ]);

    const refreshData = {
      registrations,
      analytics: {
        overview: {
          totalVisitors,
          todayVisitors,
          thisWeekVisitors,
          thisMonthVisitors
        },
        revenue: revenueData[0] || {
          totalRevenue: 0,
          averageRevenue: 0,
          maxRevenue: 0,
          minRevenue: 0
        }
      },
      lastRefreshed: new Date()
    };

    console.log('✅ Data refreshed successfully');
    res.json({
      success: true,
      message: 'Data refreshed successfully',
      data: refreshData
    });

  } catch (error) {
    console.error('Refresh data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to refresh data',
      error: error.message
    });
  }
};

module.exports = {
  registerVisitor,
  getVisitorRegistrations,
  getVisitorRegistrationById,
  updateVisitorStatus,
  getVisitorAnalytics,
  refreshData
};
