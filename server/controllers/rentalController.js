const RentalRequest = require('../models/RentalRequest');
const Artifact = require('../models/Artifact');
const Museum = require('../models/Museum');
const User = require('../models/User');

// Generate unique request ID
const generateRequestId = () => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `RR-${timestamp}-${random}`.toUpperCase();
};

// Create rental request
async function createRentalRequest(req, res) {
  try {
    const {
      requestType,
      artifactId,
      duration,
      startDate,
      endDate,
      rentalFee,
      currency = 'ETB',
      description,
      specialRequirements,
      contactPerson,
      contactPhone,
      contactEmail
    } = req.body;

    const requestedBy = req.user.id;
    
    // Get museum ID from authenticated user
    const museumId = req.user.museumId;
    if (!museumId) {
      return res.status(400).json({
        success: false,
        message: 'User is not associated with a museum'
      });
    }

    // Validate artifact exists
    const artifact = await Artifact.findById(artifactId);
    if (!artifact) {
      return res.status(404).json({
        success: false,
        message: 'Artifact not found'
      });
    }

    // Validate museum exists
    const museum = await Museum.findById(museumId);
    if (!museum) {
      return res.status(404).json({
        success: false,
        message: 'Museum not found'
      });
    }

    // Create rental request
    const rentalRequest = new RentalRequest({
      requestId: generateRequestId(),
      requestType,
      artifact: artifactId,
      museum: museumId,
      requestedBy,
      rentalDetails: {
        duration,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        rentalFee,
        currency
      },
      contact: {
        person: contactPerson,
        phone: contactPhone,
        email: contactEmail
      },
      description,
      specialRequirements,
      approvals: [{
        approver: requestedBy,
        role: requestType === 'museum_to_super' ? 'museum_admin' : 'super_admin',
        status: 'pending'
      }]
    });

    await rentalRequest.save();

    // Populate the response
    await rentalRequest.populate([
      { path: 'artifact', select: 'name description images' },
      { path: 'museum', select: 'name location' },
      { path: 'requestedBy', select: 'name email role' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Rental request created successfully',
      data: rentalRequest
    });

  } catch (error) {
    console.error('Create rental request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create rental request',
      error: error.message
    });
  }
}

// Get all rental requests with filtering
async function getAllRentalRequests(req, res) {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      requestType,
      museumId,
      userId,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};

    // Only add filters if they are not undefined or empty
    if (status && status !== 'undefined' && status !== 'all') query.status = status;
    if (requestType && requestType !== 'undefined' && requestType !== 'all') query.requestType = requestType;
    if (museumId && museumId !== 'undefined') query.museum = museumId;
    if (userId && userId !== 'undefined') query.requestedBy = userId;

    // Add search functionality
    if (search && search.trim()) {
      query.$or = [
        { requestId: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { specialRequirements: { $regex: search, $options: 'i' } }
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    console.log('🔍 Rental query:', query);
    console.log('🔍 Rental sort:', sort);
    console.log('🔍 Rental pagination:', { page, limit });

    const [requests, total] = await Promise.all([
      RentalRequest.find(query)
        .populate('artifact', 'name description images')
        .populate('museum', 'name location')
        .populate('requestedBy', 'name email role')
        .populate('approvals.approver', 'name email role')
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      RentalRequest.countDocuments(query)
    ]);

    console.log('📋 Found rental requests:', requests.length);
    console.log('📋 Total rental requests:', total);

    res.json({
      success: true,
      data: {
        requests,
        pagination: {
          current: Number(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Get rental requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch rental requests',
      error: error.message
    });
  }
}

// Get single rental request
async function getRentalRequest(req, res) {
  try {
    const { id } = req.params;

    const request = await RentalRequest.findById(id)
      .populate('artifact')
      .populate('museum')
      .populate('requestedBy', 'name email role')
      .populate('approvals.approver', 'name email role')
      .populate('messages.sender', 'name email role');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Rental request not found'
      });
    }

    res.json({
      success: true,
      data: request
    });

  } catch (error) {
    console.error('Get rental request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch rental request',
      error: error.message
    });
  }
}

// Approve/Reject rental request
async function updateRentalRequestStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, comments } = req.body;
    const approverId = req.user.id;
    // Map role to schema enum values
    const roleMapping = {
      'superAdmin': 'super_admin',
      'museumAdmin': 'museum_admin',
      'super_admin': 'super_admin',
      'museum_admin': 'museum_admin'
    };
    const approverRole = roleMapping[req.user.role] || req.user.role;

    const request = await RentalRequest.findById(id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Rental request not found'
      });
    }

    // Add approval to the request
    request.approvals.push({
      approver: approverId,
      role: approverRole,
      status: status,
      comments: comments,
      approvedAt: new Date()
    });

    // Update overall status based on approvals
    if (status === 'approved') {
      // For museum_to_super requests, super admin approval is final
      if (request.requestType === 'museum_to_super' && approverRole === 'super_admin') {
        request.status = 'approved';
      }
      // For super_to_museum requests, museum admin approval is final
      else if (request.requestType === 'super_to_museum' && approverRole === 'museum_admin') {
        request.status = 'approved';
      }
      // Otherwise, check if all required approvals are received
      else {
        const requiredApprovals = request.requestType === 'museum_to_super'
          ? ['museum_admin', 'super_admin']
          : ['super_admin', 'museum_admin'];

        const receivedApprovals = request.approvals
          .filter(a => a.status === 'approved')
          .map(a => a.role);

        const hasAllApprovals = requiredApprovals.every(role =>
          receivedApprovals.includes(role)
        );

        if (hasAllApprovals) {
          request.status = 'approved';
        }
      }
    } else if (status === 'rejected') {
      request.status = 'rejected';
    }

    await request.save();

    res.json({
      success: true,
      message: `Rental request ${status} successfully`,
      data: request
    });

  } catch (error) {
    console.error('Update rental request status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update rental request status',
      error: error.message
    });
  }
}

// Add message to rental request
async function addRentalRequestMessage(req, res) {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const senderId = req.user.id;

    const request = await RentalRequest.findById(id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Rental request not found'
      });
    }

    await request.addMessage(senderId, message);

    res.json({
      success: true,
      message: 'Message added successfully',
      data: request
    });

  } catch (error) {
    console.error('Add rental request message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add message',
      error: error.message
    });
  }
}

// Update payment status
async function updatePaymentStatus(req, res) {
  try {
    const { id } = req.params;
    const { paymentStatus, transactionId, paymentMethod } = req.body;

    const request = await RentalRequest.findById(id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Rental request not found'
      });
    }

    request.payment.status = paymentStatus;
    if (transactionId) request.payment.transactionId = transactionId;
    if (paymentMethod) request.payment.paymentMethod = paymentMethod;
    if (paymentStatus === 'paid') {
      request.payment.paidAt = new Date();
    }

    await request.save();

    res.json({
      success: true,
      message: 'Payment status updated successfully',
      data: request
    });

  } catch (error) {
    console.error('Update payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update payment status',
      error: error.message
    });
  }
}

// Update 3D integration status
async function update3DIntegrationStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, modelUrl, previewUrl } = req.body;

    const request = await RentalRequest.findById(id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Rental request not found'
      });
    }

    request.threeDIntegration.status = status;
    if (modelUrl) request.threeDIntegration.modelUrl = modelUrl;
    if (previewUrl) request.threeDIntegration.previewUrl = previewUrl;
    if (status === 'completed') {
      request.threeDIntegration.completedAt = new Date();
    }

    await request.save();

    res.json({
      success: true,
      message: '3D integration status updated successfully',
      data: request
    });

  } catch (error) {
    console.error('Update 3D integration status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update 3D integration status',
      error: error.message
    });
  }
}

// Update virtual museum integration
async function updateVirtualMuseumIntegration(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const request = await RentalRequest.findById(id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Rental request not found'
      });
    }

    request.virtualMuseum.status = status;
    if (status === 'added') {
      request.virtualMuseum.addedAt = new Date();
    } else if (status === 'removed') {
      request.virtualMuseum.removedAt = new Date();
    }

    await request.save();

    res.json({
      success: true,
      message: 'Virtual museum integration updated successfully',
      data: request
    });

  } catch (error) {
    console.error('Update virtual museum integration error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update virtual museum integration',
      error: error.message
    });
  }
}

// Get rental statistics
async function getRentalStatistics(req, res) {
  try {
    const { timeRange = '30d' } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate;
    switch (timeRange) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const [
      totalRequests,
      pendingRequests,
      approvedRequests,
      completedRequests,
      totalRevenue,
      requestsByStatus,
      requestsByType
    ] = await Promise.all([
      RentalRequest.countDocuments(),
      RentalRequest.countDocuments({ status: 'pending' }),
      RentalRequest.countDocuments({ status: 'approved' }),
      RentalRequest.countDocuments({ status: 'completed' }),
      RentalRequest.aggregate([
        { $match: { 'payment.status': 'paid' } },
        { $group: { _id: null, total: { $sum: '$rentalDetails.rentalFee' } } }
      ]),
      RentalRequest.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      RentalRequest.aggregate([
        { $group: { _id: '$requestType', count: { $sum: 1 } } }
      ])
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalRequests,
          pendingRequests,
          approvedRequests,
          completedRequests,
          totalRevenue: totalRevenue[0]?.total || 0
        },
        distribution: {
          byStatus: requestsByStatus,
          byType: requestsByType
        }
      }
    });

  } catch (error) {
    console.error('Get rental statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch rental statistics',
      error: error.message
    });
  }
}

/**
 * Get museum-specific rental statistics
 */
const getMuseumRentalStats = async (req, res) => {
  try {
    console.log('🔍 Museum stats request - User:', req.user);
    const museumId = req.user?.museumId;

    if (!museumId) {
      console.log('⚠️ No museum ID found, returning default stats');
      return res.json({
        success: true,
        data: {
          totalRequests: 0,
          pendingRequests: 0,
          approvedRequests: 0,
          totalRevenue: 0,
          revenueByMonth: [],
          requestsByStatus: {
            pending: 0,
            approved: 0,
            rejected: 0,
            completed: 0
          }
        }
      });
    }

    console.log('🔍 Getting rental requests for museum:', museumId);
    // Get rental requests for this museum
    const requests = await RentalRequest.find({
      $or: [
        { museum: museumId },
        { 'artifact.museum': museumId }
      ]
    }).populate('artifact museum requestedBy');

    // Calculate statistics
    const totalRequests = requests.length;
    const pendingRequests = requests.filter(r => r.status === 'pending').length;
    const approvedRequests = requests.filter(r => r.status === 'approved').length;
    const totalRevenue = requests
      .filter(r => r.status === 'approved')
      .reduce((sum, r) => sum + (r.rentalDetails?.rentalFee || 0), 0);

    res.json({
      success: true,
      data: {
        totalRequests,
        pendingRequests,
        approvedRequests,
        totalRevenue,
        revenueByMonth: [], // TODO: Implement monthly revenue breakdown
        requestsByStatus: {
          pending: pendingRequests,
          approved: approvedRequests,
          rejected: requests.filter(r => r.status === 'rejected').length,
          completed: requests.filter(r => r.status === 'completed').length
        }
      }
    });

  } catch (error) {
    console.error('Get museum rental stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get museum rental statistics',
      error: error.message
    });
  }
};

/**
 * Get artifacts for museum rental system
 */
const getMuseumArtifacts = async (req, res) => {
  try {
    console.log('🔍 Museum artifacts request - Params:', req.params, 'User:', req.user);
    const museumId = req.params.museumId || req.user?.museumId;

    if (!museumId) {
      console.log('⚠️ No museum ID found, returning empty artifacts');
      return res.json({
        success: true,
        data: []
      });
    }

    console.log('🔍 Getting artifacts for museum:', museumId);
    // Get artifacts from the specified museum
    const artifacts = await Artifact.find({ museum: museumId })
      .select('name description category images status')
      .populate('museum', 'name location');

    res.json({
      success: true,
      data: artifacts
    });

  } catch (error) {
    console.error('Get museum artifacts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get museum artifacts',
      error: error.message
    });
  }
};

module.exports = {
  createRentalRequest,
  getAllRentalRequests,
  getRentalRequest,
  updateRentalRequestStatus,
  addRentalRequestMessage,
  updatePaymentStatus,
  update3DIntegrationStatus,
  updateVirtualMuseumIntegration,
  getRentalStatistics,
  getMuseumRentalStats,
  getMuseumArtifacts
};