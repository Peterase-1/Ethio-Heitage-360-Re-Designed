const EducationalTour = require('../models/EducationalTour');
const User = require('../models/User');
const LearningProgress = require('../models/LearningProgress');
const { asyncHandler } = require('../middleware/asyncHandler');

// @desc    Get all published educational tours with filtering
// @route   GET /api/educational-tours
// @access  Public
const getPublishedTours = asyncHandler(async (req, res) => {
  const {
    category,
    difficulty,
    location,
    startDate,
    endDate,
    priceMin,
    priceMax,
    page = 1,
    limit = 12,
    sortBy = 'startDate',
    sortOrder = 'asc'
  } = req.query;

  // Build filter object
  const filters = {};
  if (category) filters.category = category;
  if (difficulty) filters.difficulty = difficulty;
  if (location) filters.location = location;

  // Get base query
  let query = EducationalTour.findPublishedTours(filters);

  // Additional filters
  if (startDate || endDate) {
    query = query.where('startDate');
    if (startDate) query.gte(new Date(startDate));
    if (endDate) query.lte(new Date(endDate));
  }

  if (priceMin || priceMax) {
    query = query.where('pricing.price');
    if (priceMin) query.gte(parseFloat(priceMin));
    if (priceMax) query.lte(parseFloat(priceMax));
  }

  // Sorting
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
  query = query.sort(sortOptions);

  // Pagination
  const startIndex = (page - 1) * limit;
  const total = await EducationalTour.countDocuments(query.getQuery());
  
  query = query.skip(startIndex).limit(parseInt(limit));

  // Populate organizer info
  query = query.populate('organizerId', 'firstName lastName profileImage');

  const tours = await query;

  // Calculate pagination info
  const totalPages = Math.ceil(total / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  res.status(200).json({
    success: true,
    data: tours,
    pagination: {
      current: parseInt(page),
      total: totalPages,
      count: tours.length,
      totalCount: total,
      hasNext,
      hasPrev
    }
  });
});

// @desc    Get single educational tour by ID
// @route   GET /api/educational-tours/:id
// @access  Public
const getTourById = asyncHandler(async (req, res) => {
  const tour = await EducationalTour.findById(req.params.id)
    .populate('organizerId', 'firstName lastName profileImage email phone')
    .populate('enrollments.userId', 'firstName lastName profileImage');

  if (!tour || !tour.isActive) {
    return res.status(404).json({
      success: false,
      message: 'Educational tour not found'
    });
  }

  // Increment view count
  tour.stats.views += 1;
  await tour.save();

  res.status(200).json({
    success: true,
    data: tour
  });
});

// @desc    Create new educational tour
// @route   POST /api/educational-tours
// @access  Private (Organizers only)
const createTour = asyncHandler(async (req, res) => {
  // Verify user is organizer
  if (req.user.role !== 'organizer') {
    return res.status(403).json({
      success: false,
      message: 'Only organizers can create educational tours'
    });
  }

  // Add organizer info to tour data
  const tourData = {
    ...req.body,
    organizerId: req.user._id,
    organizerName: `${req.user.firstName} ${req.user.lastName}`,
    createdBy: req.user._id
  };

  // Validate required curriculum structure
  if (tourData.curriculum && tourData.curriculum.length > 0) {
    tourData.curriculum = tourData.curriculum.map((lesson, index) => ({
      ...lesson,
      order: lesson.order || index + 1
    }));
  }

  const tour = await EducationalTour.create(tourData);
  
  await tour.populate('organizerId', 'firstName lastName profileImage email');

  res.status(201).json({
    success: true,
    data: tour,
    message: 'Educational tour created successfully'
  });
});

// @desc    Update educational tour
// @route   PUT /api/educational-tours/:id
// @access  Private (Organizer who created the tour)
const updateTour = asyncHandler(async (req, res) => {
  const tour = await EducationalTour.findById(req.params.id);

  if (!tour) {
    return res.status(404).json({
      success: false,
      message: 'Educational tour not found'
    });
  }

  // Check if user owns this tour
  if (tour.organizerId.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this tour'
    });
  }

  // Don't allow updates to published tours with enrollments
  if (tour.status === 'published' && tour.enrollments.length > 0) {
    const restrictedFields = ['startDate', 'endDate', 'maxParticipants', 'pricing'];
    const hasRestrictedChanges = restrictedFields.some(field => 
      req.body[field] !== undefined
    );
    
    if (hasRestrictedChanges) {
      return res.status(400).json({
        success: false,
        message: 'Cannot modify critical tour details after enrollment has begun'
      });
    }
  }

  // Update curriculum order if provided
  if (req.body.curriculum && req.body.curriculum.length > 0) {
    req.body.curriculum = req.body.curriculum.map((lesson, index) => ({
      ...lesson,
      order: lesson.order || index + 1
    }));
  }

  const updatedTour = await EducationalTour.findByIdAndUpdate(
    req.params.id,
    { 
      ...req.body,
      updatedBy: req.user._id
    },
    {
      new: true,
      runValidators: true
    }
  ).populate('organizerId', 'firstName lastName profileImage');

  res.status(200).json({
    success: true,
    data: updatedTour,
    message: 'Tour updated successfully'
  });
});

// @desc    Delete educational tour
// @route   DELETE /api/educational-tours/:id
// @access  Private (Organizer who created the tour)
const deleteTour = asyncHandler(async (req, res) => {
  const tour = await EducationalTour.findById(req.params.id);

  if (!tour) {
    return res.status(404).json({
      success: false,
      message: 'Educational tour not found'
    });
  }

  // Check if user owns this tour
  if (tour.organizerId.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this tour'
    });
  }

  // Check if there are active enrollments
  const activeEnrollments = tour.enrollments.filter(e => 
    ['pending', 'confirmed'].includes(e.status)
  ).length;

  if (activeEnrollments > 0) {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete tour with active enrollments'
    });
  }

  // Soft delete by setting inactive
  tour.isActive = false;
  tour.status = 'archived';
  await tour.save();

  res.status(200).json({
    success: true,
    message: 'Tour archived successfully'
  });
});

// @desc    Get organizer's tours
// @route   GET /api/educational-tours/organizer/my-tours
// @access  Private (Organizers only)
const getOrganizerTours = asyncHandler(async (req, res) => {
  if (req.user.role !== 'organizer') {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  const { status, page = 1, limit = 10 } = req.query;
  
  const query = { 
    organizerId: req.user._id,
    isActive: true
  };
  
  if (status) query.status = status;

  const startIndex = (page - 1) * limit;
  const total = await EducationalTour.countDocuments(query);

  const tours = await EducationalTour.find(query)
    .sort({ createdAt: -1 })
    .skip(startIndex)
    .limit(parseInt(limit))
    .populate('enrollments.userId', 'firstName lastName profileImage');

  const totalPages = Math.ceil(total / limit);

  res.status(200).json({
    success: true,
    data: tours,
    pagination: {
      current: parseInt(page),
      total: totalPages,
      count: tours.length,
      totalCount: total,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  });
});

// @desc    Enroll user in educational tour
// @route   POST /api/educational-tours/:id/enroll
// @access  Private (Users only)
const enrollInTour = asyncHandler(async (req, res) => {
  const tour = await EducationalTour.findById(req.params.id);

  if (!tour || !tour.isActive || tour.status !== 'published') {
    return res.status(404).json({
      success: false,
      message: 'Tour not found or not available for enrollment'
    });
  }

  // Check enrollment eligibility
  const enrollmentCheck = tour.canUserEnroll(req.user._id);
  if (!enrollmentCheck.canEnroll) {
    return res.status(400).json({
      success: false,
      message: enrollmentCheck.reason
    });
  }

  try {
    // Enroll user in tour
    await tour.enrollUser(req.user._id, 'pending');

    // Update user's learning profile
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: {
        'learningProfile.enrolledCourses': {
          courseId: req.params.id,
          courseTitle: tour.title,
          enrolledAt: new Date(),
          courseType: 'educational-tour'
        }
      }
    });

    // Create learning progress record
    await LearningProgress.create({
      userId: req.user._id,
      courseId: req.params.id,
      courseTitle: tour.title,
      courseType: 'educational-tour',
      totalLessons: tour.curriculum.length,
      progress: {
        lessonsCompleted: 0,
        totalTimeSpent: 0,
        quizzesCompleted: 0,
        overallScore: 0
      }
    });

    res.status(200).json({
      success: true,
      message: 'Successfully enrolled in educational tour',
      data: {
        tourId: tour._id,
        enrollmentStatus: 'pending'
      }
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Update enrollment status (confirm/cancel)
// @route   PUT /api/educational-tours/:tourId/enrollments/:userId
// @access  Private (Organizer who owns the tour)
const updateEnrollmentStatus = asyncHandler(async (req, res) => {
  const { tourId, userId } = req.params;
  const { status, paymentStatus } = req.body;

  const tour = await EducationalTour.findById(tourId);

  if (!tour) {
    return res.status(404).json({
      success: false,
      message: 'Tour not found'
    });
  }

  // Check if user owns this tour
  if (tour.organizerId.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to manage enrollments for this tour'
    });
  }

  // Find enrollment
  const enrollment = tour.enrollments.find(e => 
    e.userId.toString() === userId.toString()
  );

  if (!enrollment) {
    return res.status(404).json({
      success: false,
      message: 'Enrollment not found'
    });
  }

  // Update enrollment
  if (status) enrollment.status = status;
  if (paymentStatus) enrollment.paymentStatus = paymentStatus;

  await tour.save();

  res.status(200).json({
    success: true,
    message: 'Enrollment status updated successfully',
    data: enrollment
  });
});

// @desc    Get user's enrolled tours
// @route   GET /api/educational-tours/user/enrolled
// @access  Private
const getUserEnrolledTours = asyncHandler(async (req, res) => {
  const enrolledTours = await EducationalTour.find({
    'enrollments.userId': req.user._id,
    'enrollments.status': { $in: ['pending', 'confirmed', 'completed'] }
  }).populate('organizerId', 'firstName lastName profileImage');

  // Filter and format user's enrollment data
  const toursWithProgress = enrolledTours.map(tour => {
    const userEnrollment = tour.enrollments.find(e => 
      e.userId.toString() === req.user._id.toString()
    );

    return {
      ...tour.toObject(),
      userEnrollment: userEnrollment
    };
  });

  res.status(200).json({
    success: true,
    data: toursWithProgress
  });
});

// @desc    Update user progress in tour
// @route   PUT /api/educational-tours/:id/progress
// @access  Private
const updateUserProgress = asyncHandler(async (req, res) => {
  const { lessonIndex, score = 0 } = req.body;
  const tourId = req.params.id;

  const tour = await EducationalTour.findById(tourId);

  if (!tour) {
    return res.status(404).json({
      success: false,
      message: 'Tour not found'
    });
  }

  try {
    await tour.updateUserProgress(req.user._id, lessonIndex, score);

    // Also update LearningProgress model
    await LearningProgress.findOneAndUpdate(
      { 
        userId: req.user._id, 
        courseId: tourId 
      },
      {
        $inc: {
          'progress.lessonsCompleted': 1,
          'progress.totalTimeSpent': req.body.timeSpent || 0,
          'progress.overallScore': score
        },
        lastAccessed: new Date()
      }
    );

    res.status(200).json({
      success: true,
      message: 'Progress updated successfully'
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Add announcement to tour
// @route   POST /api/educational-tours/:id/announcements
// @access  Private (Organizer who owns the tour)
const addAnnouncement = asyncHandler(async (req, res) => {
  const { title, message, isImportant = false } = req.body;
  const tour = await EducationalTour.findById(req.params.id);

  if (!tour) {
    return res.status(404).json({
      success: false,
      message: 'Tour not found'
    });
  }

  // Check if user owns this tour
  if (tour.organizerId.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to add announcements to this tour'
    });
  }

  await tour.addAnnouncement(title, message, isImportant);

  res.status(200).json({
    success: true,
    message: 'Announcement added successfully'
  });
});

// @desc    Submit tour feedback/rating
// @route   POST /api/educational-tours/:id/feedback
// @access  Private
const submitFeedback = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const tour = await EducationalTour.findById(req.params.id);

  if (!tour) {
    return res.status(404).json({
      success: false,
      message: 'Tour not found'
    });
  }

  // Find user's enrollment
  const enrollment = tour.enrollments.find(e => 
    e.userId.toString() === req.user._id.toString()
  );

  if (!enrollment || enrollment.status !== 'completed') {
    return res.status(400).json({
      success: false,
      message: 'You can only provide feedback after completing the tour'
    });
  }

  // Check if feedback already exists
  if (enrollment.feedback.rating) {
    return res.status(400).json({
      success: false,
      message: 'Feedback already submitted for this tour'
    });
  }

  // Add feedback to enrollment
  enrollment.feedback = {
    rating,
    comment,
    submittedAt: new Date()
  };

  // Update tour rating
  await tour.updateRating(rating);

  res.status(200).json({
    success: true,
    message: 'Feedback submitted successfully'
  });
});

// @desc    Get organizer statistics
// @route   GET /api/educational-tours/organizer/stats
// @access  Private (Organizers only)
const getOrganizerStats = asyncHandler(async (req, res) => {
  if (req.user.role !== 'organizer') {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  const stats = await EducationalTour.getOrganizerStats(req.user._id);

  res.status(200).json({
    success: true,
    data: stats
  });
});

// @desc    Get tour categories and statistics
// @route   GET /api/educational-tours/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
  const categories = await EducationalTour.aggregate([
    {
      $match: {
        status: 'published',
        isActive: true
      }
    },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        averageRating: { $avg: '$stats.averageRating' },
        totalEnrollments: { $sum: '$stats.enrollments' }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);

  res.status(200).json({
    success: true,
    data: categories
  });
});

module.exports = {
  getPublishedTours,
  getTourById,
  createTour,
  updateTour,
  deleteTour,
  getOrganizerTours,
  enrollInTour,
  updateEnrollmentStatus,
  getUserEnrolledTours,
  updateUserProgress,
  addAnnouncement,
  submitFeedback,
  getOrganizerStats,
  getCategories
};
