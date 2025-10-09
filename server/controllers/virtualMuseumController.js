const VirtualMuseumSubmission = require('../models/VirtualMuseumSubmission');
const Rental = require('../models/Rental');
const Artifact = require('../models/Artifact');
const Museum = require('../models/Museum');

// GET /api/virtual-museum/submissions
const getSubmissions = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      museumId,
      source,
      search
    } = req.query;


    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (museumId) {
      query.museumId = museumId;
    }

    if (source) {
      query.source = source;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'artifacts.artifactName': { $regex: search, $options: 'i' } }
      ];
    }

    // If museum admin but no museumId specified, filter by their museum
    if (req.user.role === 'museumAdmin' && req.user.museum && !museumId) {
      query.museumId = req.user.museum;
    }

    const [submissions, total] = await Promise.all([
      VirtualMuseumSubmission.find(query)
        .populate('artifacts.artifactId', 'name accessionNumber media category description status')
        .populate('museumId', 'name')
        .populate('createdBy', 'name email')
        .populate('rentalId', 'status startDate endDate renter')
        .sort({ submissionDate: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      VirtualMuseumSubmission.countDocuments(query)
    ]);


    res.json({
      success: true,
      submissions,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get virtual museum submissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch virtual museum submissions',
      error: error.message
    });
  }
};

// GET /api/virtual-museum/submissions/rental-artifacts
const getRentalArtifacts = async (req, res) => {
  try {
    const { museumId } = req.query;


    // Get approved rentals with their artifacts
    const query = {
      'approvals.superAdmin.status': 'approved',
      status: { $in: ['payment_pending', 'active', 'completed'] }
    };

    if (museumId) {
      query.museum = museumId;
    } else if (req.user.role === 'museumAdmin' && req.user.museum) {
      // If museum admin but no museumId specified, filter by their museum
      query.museum = req.user.museum;
    }

    const approvedRentals = await Rental.find(query)
      .populate('artifact', 'name accessionNumber media category description status')
      .populate('museum', 'name')
      .populate('renter', 'name email')
      .sort({ 'approvals.superAdmin.approvedAt': -1 });


    // Get virtual museum submissions for these artifacts
    const artifactIds = approvedRentals.map(rental => rental.artifact._id);
    const virtualSubmissions = await VirtualMuseumSubmission.find({
      'artifacts.artifactId': { $in: artifactIds }
    }).populate('artifacts.artifactId', 'name accessionNumber media category description');

    // Create a map of artifacts already in virtual museum
    const artifactsInVirtualMuseum = new Set();
    virtualSubmissions.forEach(submission => {
      submission.artifacts.forEach(artifact => {
        artifactsInVirtualMuseum.add(artifact.artifactId.toString());
      });
    });

    // Show all approved rental artifacts (both in and not in virtual museum)
    const availableArtifacts = approvedRentals;

    res.json({
      success: true,
      availableArtifacts,
      totalAvailable: availableArtifacts.length,
      totalApproved: approvedRentals.length,
      alreadyInVirtualMuseum: artifactsInVirtualMuseum.size
    });
  } catch (error) {
    console.error('Get rental artifacts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch rental artifacts',
      error: error.message
    });
  }
};

// POST /api/virtual-museum/submissions
const createSubmission = async (req, res) => {
  try {
    const submissionData = {
      ...req.body,
      createdBy: req.user._id,
      museumId: req.user.museum || req.body.museumId
    };

    const submission = new VirtualMuseumSubmission(submissionData);
    await submission.save();

    await submission.populate([
      { path: 'artifacts.artifactId', select: 'name accessionNumber media category description' },
      { path: 'museumId', select: 'name' },
      { path: 'createdBy', select: 'name email' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Virtual museum submission created successfully',
      submission
    });
  } catch (error) {
    console.error('Create virtual museum submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create virtual museum submission',
      error: error.message
    });
  }
};

// PUT /api/virtual-museum/submissions/:id/approve
const approveSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, feedback, rating } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be approved or rejected'
      });
    }

    const submission = await VirtualMuseumSubmission.findByIdAndUpdate(
      id,
      {
        status,
        'review.reviewedBy': req.user._id,
        'review.reviewedAt': new Date(),
        'review.feedback': feedback,
        'review.rating': rating,
        published: status === 'approved'
      },
      { new: true }
    )
      .populate('artifacts.artifactId', 'name accessionNumber media category description')
      .populate('museumId', 'name')
      .populate('createdBy', 'name email');

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Virtual museum submission not found'
      });
    }

    res.json({
      success: true,
      message: `Submission ${status} successfully`,
      submission
    });
  } catch (error) {
    console.error('Approve virtual museum submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process submission approval',
      error: error.message
    });
  }
};

// GET /api/virtual-museum/stats
const getStats = async (req, res) => {
  try {
    const { museumId } = req.query;

    const query = {};
    if (museumId) {
      query.museumId = museumId;
    }

    const [
      totalSubmissions,
      approvedSubmissions,
      pendingSubmissions,
      rentalSubmissions,
      totalViews
    ] = await Promise.all([
      VirtualMuseumSubmission.countDocuments(query),
      VirtualMuseumSubmission.countDocuments({ ...query, status: 'approved' }),
      VirtualMuseumSubmission.countDocuments({ ...query, status: 'pending' }),
      VirtualMuseumSubmission.countDocuments({ ...query, source: 'rental_approval' }),
      VirtualMuseumSubmission.aggregate([
        { $match: query },
        { $group: { _id: null, totalViews: { $sum: '$metrics.views' } } }
      ])
    ]);

    res.json({
      success: true,
      stats: {
        totalSubmissions,
        approvedSubmissions,
        pendingSubmissions,
        rentalSubmissions,
        totalViews: totalViews[0]?.totalViews || 0
      }
    });
  } catch (error) {
    console.error('Get virtual museum stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch virtual museum statistics',
      error: error.message
    });
  }
};

// DELETE /api/virtual-museum/submissions/:id
const deleteSubmission = async (req, res) => {
  try {
    const { id } = req.params;

    const submission = await VirtualMuseumSubmission.findByIdAndDelete(id);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Virtual museum submission not found'
      });
    }

    res.json({
      success: true,
      message: 'Virtual museum submission deleted successfully'
    });
  } catch (error) {
    console.error('Delete virtual museum submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete virtual museum submission',
      error: error.message
    });
  }
};

module.exports = {
  getSubmissions,
  getRentalArtifacts,
  createSubmission,
  approveSubmission,
  getStats,
  deleteSubmission
};
