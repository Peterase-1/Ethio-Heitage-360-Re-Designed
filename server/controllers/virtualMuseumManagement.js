const mongoose = require('mongoose');
const VirtualMuseumSubmission = require('../models/VirtualMuseumSubmission');
const Artifact = require('../models/Artifact');
const { asyncHandler } = require('../middleware/asyncHandler');
const AppError = require('../utils/AppError');

/**
 * @desc    Get all virtual museum submissions for a museum
 * @route   GET /api/virtual-museum/submissions
 * @access  Private (museumAdmin, staff)
 */
const getMuseumSubmissions = asyncHandler(async (req, res) => {
  const museumId = req.user.museumId;
  const { status, page = 1, limit = 10 } = req.query;

  if (!museumId) {
    throw new AppError('Museum ID not found in user profile', 400);
  }

  const query = { museumId, isDeleted: false };
  if (status) {
    query.status = status;
  }

  const submissions = await VirtualMuseumSubmission.find(query)
    .populate('artifacts.artifactId', 'name image status')
    .populate('submittedBy', 'name email')
    .populate('review.reviewedBy', 'name email')
    .sort({ submissionDate: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await VirtualMuseumSubmission.countDocuments(query);

  res.status(200).json({
    success: true,
    data: submissions,
    pagination: {
      current: parseInt(page),
      pages: Math.ceil(total / limit),
      total
    }
  });
});

/**
 * @desc    Get single virtual museum submission
 * @route   GET /api/virtual-museum/submissions/:id
 * @access  Private (museumAdmin, staff, superAdmin)
 */
const getSubmission = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const museumId = req.user.museumId;

  const query = { _id: id, isDeleted: false };

  // Museum admin can only see their own submissions
  if (req.user.role === 'museumAdmin' || req.user.role === 'staff') {
    if (!museumId) {
      throw new AppError('Museum ID not found in user profile', 400);
    }
    query.museumId = museumId;
  }

  const submission = await VirtualMuseumSubmission.findOne(query)
    .populate('artifacts.artifactId')
    .populate('museumId', 'name location')
    .populate('submittedBy', 'name email')
    .populate('review.reviewedBy', 'name email');

  if (!submission) {
    throw new AppError('Virtual museum submission not found', 404);
  }

  res.status(200).json({
    success: true,
    data: submission
  });
});

/**
 * @desc    Create new virtual museum submission
 * @route   POST /api/virtual-museum/submissions
 * @access  Private (museumAdmin, staff)
 */
const createSubmission = asyncHandler(async (req, res) => {
  const museumId = req.user.museumId;
  const submittedBy = req.user._id;

  if (!museumId) {
    throw new AppError('Museum ID not found in user profile', 400);
  }

  const {
    title,
    type,
    description,
    artifacts,
    layout,
    theme,
    accessibility,
    media,
    interactiveContent,
    seo
  } = req.body;

  // Validate artifacts belong to the museum
  if (artifacts && artifacts.length > 0) {
    const artifactIds = artifacts.map(a => a.artifactId);
    const museumArtifacts = await Artifact.find({
      _id: { $in: artifactIds },
      museumId: museumId
    });

    if (museumArtifacts.length !== artifactIds.length) {
      throw new AppError('Some artifacts do not belong to your museum', 400);
    }
  }

  const submission = await VirtualMuseumSubmission.create({
    title,
    type,
    description,
    museumId,
    submittedBy,
    artifacts: artifacts || [],
    layout: layout || 'grid',
    theme: theme || {
      primaryColor: '#8B5A3C',
      secondaryColor: '#ffffff',
      fontFamily: 'Inter'
    },
    accessibility: accessibility || {
      audioDescriptions: false,
      subtitles: false,
      highContrast: false,
      screenReader: false,
      keyboardNavigation: true
    },
    media: media || {},
    interactiveContent: interactiveContent || {
      has3DModels: false,
      hasVRSupport: false,
      hasARSupport: false,
      modelFiles: []
    },
    seo: seo || {}
  });

  await submission.populate([
    { path: 'artifacts.artifactId', select: 'name image status' },
    { path: 'submittedBy', select: 'name email' }
  ]);

  res.status(201).json({
    success: true,
    data: submission,
    message: 'Virtual museum submission created successfully'
  });
});

/**
 * @desc    Update virtual museum submission
 * @route   PUT /api/virtual-museum/submissions/:id
 * @access  Private (museumAdmin, staff)
 */
const updateSubmission = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const museumId = req.user.museumId;

  if (!museumId) {
    throw new AppError('Museum ID not found in user profile', 400);
  }

  const submission = await VirtualMuseumSubmission.findOne({
    _id: id,
    museumId: museumId,
    isDeleted: false
  });

  if (!submission) {
    throw new AppError('Virtual museum submission not found', 404);
  }

  // Can only update if status is pending or rejected
  if (!['pending', 'rejected'].includes(submission.status)) {
    throw new AppError('Cannot update submission that is under review or approved', 400);
  }

  const updateData = { ...req.body };

  // If artifacts are being updated, validate they belong to the museum
  if (updateData.artifacts) {
    const artifactIds = updateData.artifacts.map(a => a.artifactId);
    const museumArtifacts = await Artifact.find({
      _id: { $in: artifactIds },
      museumId: museumId
    });

    if (museumArtifacts.length !== artifactIds.length) {
      throw new AppError('Some artifacts do not belong to your museum', 400);
    }
  }

  // Update status to resubmitted if it was rejected
  if (submission.status === 'rejected') {
    updateData.status = 'resubmitted';
  }

  const updatedSubmission = await VirtualMuseumSubmission.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  ).populate([
    { path: 'artifacts.artifactId', select: 'name image status' },
    { path: 'submittedBy', select: 'name email' }
  ]);

  res.status(200).json({
    success: true,
    data: updatedSubmission,
    message: 'Virtual museum submission updated successfully'
  });
});

/**
 * @desc    Delete virtual museum submission
 * @route   DELETE /api/virtual-museum/submissions/:id
 * @access  Private (museumAdmin, staff)
 */
const deleteSubmission = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const museumId = req.user.museumId;

  if (!museumId) {
    throw new AppError('Museum ID not found in user profile', 400);
  }

  const submission = await VirtualMuseumSubmission.findOne({
    _id: id,
    museumId: museumId,
    isDeleted: false
  });

  if (!submission) {
    throw new AppError('Virtual museum submission not found', 404);
  }

  // Can only delete if status is pending or rejected
  if (!['pending', 'rejected'].includes(submission.status)) {
    throw new AppError('Cannot delete submission that is under review or approved', 400);
  }

  // Soft delete
  submission.isDeleted = true;
  submission.deletedAt = new Date();
  submission.deletedBy = req.user._id;
  await submission.save();

  res.status(200).json({
    success: true,
    message: 'Virtual museum submission deleted successfully'
  });
});

/**
 * @desc    Get museum statistics for virtual museum
 * @route   GET /api/virtual-museum/stats
 * @access  Private (museumAdmin, staff)
 */
const getMuseumStats = asyncHandler(async (req, res) => {
  const museumId = req.user.museumId;

  if (!museumId) {
    throw new AppError('Museum ID not found in user profile', 400);
  }

  const stats = await VirtualMuseumSubmission.aggregate([
    { $match: { museumId: new mongoose.Types.ObjectId(museumId), isDeleted: false } },
    {
      $group: {
        _id: null,
        totalSubmissions: { $sum: 1 },
        approvedSubmissions: {
          $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
        },
        pendingSubmissions: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
        },
        totalViews: { $sum: '$metrics.views' },
        totalFavorites: { $sum: '$metrics.favorites' },
        averageRating: { $avg: '$metrics.averageRating' }
      }
    }
  ]);

  const result = stats[0] || {
    totalSubmissions: 0,
    approvedSubmissions: 0,
    pendingSubmissions: 0,
    totalViews: 0,
    totalFavorites: 0,
    averageRating: 0
  };

  res.status(200).json({
    success: true,
    data: result
  });
});

/**
 * @desc    Get available artifacts for virtual museum
 * @route   GET /api/virtual-museum/artifacts
 * @access  Private (museumAdmin, staff)
 */
const getAvailableArtifacts = asyncHandler(async (req, res) => {
  const museumId = req.user.museumId;

  if (!museumId) {
    throw new AppError('Museum ID not found in user profile', 400);
  }

  const artifacts = await Artifact.find({
    museumId: museumId,
    status: { $in: ['on_display', 'in_storage'] }
  }).select('name description image category status featured');

  res.status(200).json({
    success: true,
    data: artifacts
  });
});

/**
 * @desc    Submit submission for review
 * @route   POST /api/virtual-museum/submissions/:id/submit
 * @access  Private (museumAdmin, staff)
 */
const submitForReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const museumId = req.user.museumId;

  if (!museumId) {
    throw new AppError('Museum ID not found in user profile', 400);
  }

  const submission = await VirtualMuseumSubmission.findOne({
    _id: id,
    museumId: museumId,
    isDeleted: false
  });

  if (!submission) {
    throw new AppError('Virtual museum submission not found', 404);
  }

  if (submission.status !== 'pending') {
    throw new AppError('Submission can only be submitted for review if status is pending', 400);
  }

  if (submission.artifacts.length === 0) {
    throw new AppError('Cannot submit submission without any artifacts', 400);
  }

  submission.status = 'under_review';
  await submission.save();

  res.status(200).json({
    success: true,
    data: submission,
    message: 'Submission submitted for review successfully'
  });
});

/**
 * @desc    Get public virtual museum submissions (for visitors)
 * @route   GET /api/virtual-museum/public
 * @access  Public
 */
const getPublicSubmissions = asyncHandler(async (req, res) => {
  const { page = 1, limit = 12, featured } = req.query;

  const query = {
    'publishing.isPublic': true,
    status: 'published',
    isDeleted: false
  };

  if (featured === 'true') {
    query['publishing.featured'] = true;
  }

  const submissions = await VirtualMuseumSubmission.find(query)
    .populate('artifacts.artifactId', 'name image category')
    .populate('museumId', 'name location')
    .sort({ 'publishing.featured': -1, 'metrics.views': -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await VirtualMuseumSubmission.countDocuments(query);

  res.status(200).json({
    success: true,
    data: submissions,
    pagination: {
      current: parseInt(page),
      pages: Math.ceil(total / limit),
      total
    }
  });
});

/**
 * @desc    View public submission details
 * @route   GET /api/virtual-museum/public/:id
 * @access  Public
 */
const viewPublicSubmission = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const submission = await VirtualMuseumSubmission.findOne({
    _id: id,
    'publishing.isPublic': true,
    status: 'published',
    isDeleted: false
  })
    .populate('artifacts.artifactId')
    .populate('museumId', 'name location description');

  if (!submission) {
    throw new AppError('Virtual museum submission not found', 404);
  }

  // Increment view count
  await submission.incrementViews();

  res.status(200).json({
    success: true,
    data: submission
  });
});

module.exports = {
  getMuseumSubmissions,
  getSubmission,
  createSubmission,
  updateSubmission,
  deleteSubmission,
  getMuseumStats,
  getAvailableArtifacts,
  submitForReview,
  getPublicSubmissions,
  viewPublicSubmission
};
