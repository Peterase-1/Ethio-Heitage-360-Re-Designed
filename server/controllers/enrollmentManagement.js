const LearningProgress = require('../models/LearningProgress');
const Course = require('../models/Course');
const User = require('../models/User');

// Get all enrollments with admin filtering and stats
const getAllEnrollmentsAdmin = async (req, res) => {
  try {
    const { 
      courseId, 
      userId,
      status,
      enrollmentDate,
      page = 1, 
      limit = 20,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build aggregation pipeline for complex filtering
    const pipeline = [];

    // Match stage
    const matchConditions = {};
    if (courseId) matchConditions['courses.courseId'] = courseId;
    if (userId) matchConditions.userId = userId;
    
    // Date range filtering
    if (enrollmentDate) {
      const date = new Date(enrollmentDate);
      const nextDay = new Date(date.getTime() + 24 * 60 * 60 * 1000);
      matchConditions['courses.enrolledAt'] = {
        $gte: date,
        $lt: nextDay
      };
    }

    pipeline.push({ $match: matchConditions });

    // Unwind courses for individual enrollment records
    pipeline.push({ $unwind: '$courses' });

    // Status filtering after unwind
    if (status) {
      pipeline.push({ $match: { 'courses.status': status } });
    }

    // Lookup course details
    pipeline.push({
      $lookup: {
        from: 'courses',
        localField: 'courses.courseId',
        foreignField: '_id',
        as: 'courseDetails'
      }
    });

    // Lookup user details
    pipeline.push({
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'userDetails'
      }
    });

    // Add course and user info
    pipeline.push({
      $addFields: {
        course: { $arrayElemAt: ['$courseDetails', 0] },
        user: { $arrayElemAt: ['$userDetails', 0] }
      }
    });

    // Search functionality
    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { 'course.title': { $regex: search, $options: 'i' } },
            { 'course.category': { $regex: search, $options: 'i' } },
            { 'user.name': { $regex: search, $options: 'i' } },
            { 'user.email': { $regex: search, $options: 'i' } }
          ]
        }
      });
    }

    // Project final structure
    pipeline.push({
      $project: {
        enrollmentId: '$courses._id',
        userId: 1,
        courseId: '$courses.courseId',
        status: '$courses.status',
        enrolledAt: '$courses.enrolledAt',
        startedAt: '$courses.startedAt',
        completedAt: '$courses.completedAt',
        progress: '$courses.progress',
        totalLessonsCompleted: { $size: { $ifNull: ['$courses.lessons', []] } },
        course: {
          _id: '$course._id',
          title: '$course.title',
          category: '$course.category',
          difficulty: '$course.difficulty',
          image: '$course.image',
          instructor: '$course.instructor'
        },
        user: {
          _id: '$user._id',
          name: '$user.name',
          email: '$user.email',
          role: '$user.role'
        }
      }
    });

    // Get total count for pagination
    const countPipeline = [...pipeline];
    countPipeline.push({ $count: 'total' });
    const totalResult = await LearningProgress.aggregate(countPipeline);
    const totalCount = totalResult[0]?.total || 0;

    // Sort
    const sortStage = {};
    sortStage[sortBy] = sortOrder === 'asc' ? 1 : -1;
    pipeline.push({ $sort: sortStage });

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: parseInt(limit) });

    const enrollments = await LearningProgress.aggregate(pipeline);

    res.json({
      success: true,
      enrollments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalEnrollments: totalCount,
        hasNextPage: skip + enrollments.length < totalCount,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Get all enrollments admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch enrollments'
    });
  }
};

// Get detailed enrollment analytics
const getEnrollmentAnalytics = async (req, res) => {
  try {
    const { courseId, timeRange = '30d' } = req.query;

    // Calculate time range
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

    const matchConditions = {
      'courses.enrolledAt': { $gte: startDate }
    };
    if (courseId) matchConditions['courses.courseId'] = courseId;

    // Enrollment trends over time
    const enrollmentTrends = await LearningProgress.aggregate([
      { $match: matchConditions },
      { $unwind: '$courses' },
      { $match: { 'courses.enrolledAt': { $gte: startDate } } },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$courses.enrolledAt'
            }
          },
          enrollments: { $sum: 1 },
          completions: {
            $sum: {
              $cond: [{ $eq: ['$courses.status', 'completed'] }, 1, 0]
            }
          }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // Completion rate by course
    const completionRates = await LearningProgress.aggregate([
      { $match: matchConditions },
      { $unwind: '$courses' },
      {
        $lookup: {
          from: 'courses',
          localField: 'courses.courseId',
          foreignField: '_id',
          as: 'courseInfo'
        }
      },
      {
        $group: {
          _id: '$courses.courseId',
          courseTitle: { $first: { $arrayElemAt: ['$courseInfo.title', 0] } },
          totalEnrollments: { $sum: 1 },
          completions: {
            $sum: {
              $cond: [{ $eq: ['$courses.status', 'completed'] }, 1, 0]
            }
          },
          averageProgress: { $avg: '$courses.progress' }
        }
      },
      {
        $addFields: {
          completionRate: {
            $multiply: [
              { $divide: ['$completions', '$totalEnrollments'] },
              100
            ]
          }
        }
      },
      { $sort: { totalEnrollments: -1 } },
      { $limit: 10 }
    ]);

    // User engagement metrics
    const userEngagement = await LearningProgress.aggregate([
      { $match: matchConditions },
      {
        $group: {
          _id: '$userId',
          totalCourses: { $sum: { $size: '$courses' } },
          completedCourses: {
            $sum: {
              $size: {
                $filter: {
                  input: '$courses',
                  cond: { $eq: ['$$this.status', 'completed'] }
                }
              }
            }
          },
          averageProgress: {
            $avg: {
              $avg: '$courses.progress'
            }
          }
        }
      },
      {
        $group: {
          _id: null,
          totalActiveUsers: { $sum: 1 },
          averageCoursesPerUser: { $avg: '$totalCourses' },
          averageCompletionRate: {
            $avg: {
              $cond: [
                { $gt: ['$totalCourses', 0] },
                { $divide: ['$completedCourses', '$totalCourses'] },
                0
              ]
            }
          },
          averageUserProgress: { $avg: '$averageProgress' }
        }
      }
    ]);

    // Status distribution
    const statusDistribution = await LearningProgress.aggregate([
      { $match: matchConditions },
      { $unwind: '$courses' },
      {
        $group: {
          _id: '$courses.status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      analytics: {
        timeRange,
        enrollmentTrends,
        completionRates,
        userEngagement: userEngagement[0] || {
          totalActiveUsers: 0,
          averageCoursesPerUser: 0,
          averageCompletionRate: 0,
          averageUserProgress: 0
        },
        statusDistribution
      }
    });
  } catch (error) {
    console.error('Get enrollment analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch enrollment analytics'
    });
  }
};

// Bulk enrollment management
const bulkEnrollmentOperations = async (req, res) => {
  try {
    const { operation, userIds, courseIds, enrollmentIds } = req.body;

    if (!operation) {
      return res.status(400).json({
        success: false,
        message: 'Operation is required'
      });
    }

    let result = { modifiedCount: 0, matchedCount: 0 };
    const timestamp = new Date();

    switch (operation) {
      case 'enroll':
        if (!Array.isArray(userIds) || !Array.isArray(courseIds)) {
          return res.status(400).json({
            success: false,
            message: 'userIds and courseIds arrays are required for enroll operation'
          });
        }

        // Bulk enroll users in courses
        const enrollmentPromises = [];
        for (const userId of userIds) {
          for (const courseId of courseIds) {
            enrollmentPromises.push(
              LearningProgress.updateOne(
                { userId },
                {
                  $setOnInsert: { userId, createdAt: timestamp },
                  $addToSet: {
                    courses: {
                      courseId,
                      status: 'enrolled',
                      progress: 0,
                      enrolledAt: timestamp,
                      lessons: []
                    }
                  }
                },
                { upsert: true }
              )
            );
          }
        }

        const enrollResults = await Promise.all(enrollmentPromises);
        result.modifiedCount = enrollResults.filter(r => r.modifiedCount > 0).length;
        result.matchedCount = enrollResults.length;
        break;

      case 'unenroll':
        if (!Array.isArray(enrollmentIds)) {
          return res.status(400).json({
            success: false,
            message: 'enrollmentIds array is required for unenroll operation'
          });
        }

        // Remove specific enrollments
        for (const enrollmentId of enrollmentIds) {
          await LearningProgress.updateMany(
            { 'courses._id': enrollmentId },
            { $pull: { courses: { _id: enrollmentId } } }
          );
        }
        result.modifiedCount = enrollmentIds.length;
        break;

      case 'changeStatus':
        const { newStatus } = req.body;
        if (!newStatus || !Array.isArray(enrollmentIds)) {
          return res.status(400).json({
            success: false,
            message: 'newStatus and enrollmentIds array are required'
          });
        }

        const updateResult = await LearningProgress.updateMany(
          { 'courses._id': { $in: enrollmentIds } },
          { 
            $set: { 
              'courses.$.status': newStatus,
              'courses.$.updatedAt': timestamp
            }
          }
        );
        result = updateResult;
        break;

      case 'resetProgress':
        if (!Array.isArray(enrollmentIds)) {
          return res.status(400).json({
            success: false,
            message: 'enrollmentIds array is required for resetProgress operation'
          });
        }

        const resetResult = await LearningProgress.updateMany(
          { 'courses._id': { $in: enrollmentIds } },
          { 
            $set: { 
              'courses.$.progress': 0,
              'courses.$.status': 'enrolled',
              'courses.$.lessons': [],
              'courses.$.startedAt': null,
              'courses.$.completedAt': null,
              'courses.$.updatedAt': timestamp
            }
          }
        );
        result = resetResult;
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid operation. Allowed: enroll, unenroll, changeStatus, resetProgress'
        });
    }

    res.json({
      success: true,
      message: `Bulk ${operation} completed successfully`,
      result
    });
  } catch (error) {
    console.error('Bulk enrollment operations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to perform bulk enrollment operation'
    });
  }
};

// Get enrollment details for specific user/course combination
const getEnrollmentDetails = async (req, res) => {
  try {
    const { userId, courseId } = req.params;

    const learningProgress = await LearningProgress.findOne({ userId })
      .populate('userId', 'name email profile')
      .lean();

    if (!learningProgress) {
      return res.status(404).json({
        success: false,
        message: 'User learning progress not found'
      });
    }

    const courseProgress = learningProgress.courses.find(
      c => c.courseId.toString() === courseId
    );

    if (!courseProgress) {
      return res.status(404).json({
        success: false,
        message: 'Course enrollment not found'
      });
    }

    // Get course details
    const course = await Course.findById(courseId)
      .populate('lessons', 'title order estimatedDuration')
      .lean();

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Calculate detailed progress metrics
    const totalLessons = course.lessons.length;
    const completedLessons = courseProgress.lessons?.filter(l => l.status === 'completed').length || 0;
    const lessonsInProgress = courseProgress.lessons?.filter(l => l.status === 'in_progress').length || 0;

    res.json({
      success: true,
      enrollment: {
        user: learningProgress.userId,
        course: {
          _id: course._id,
          title: course.title,
          category: course.category,
          difficulty: course.difficulty,
          estimatedDuration: course.estimatedDuration,
          totalLessons
        },
        progress: {
          status: courseProgress.status,
          overallProgress: courseProgress.progress,
          enrolledAt: courseProgress.enrolledAt,
          startedAt: courseProgress.startedAt,
          completedAt: courseProgress.completedAt,
          totalLessons,
          completedLessons,
          lessonsInProgress,
          remainingLessons: totalLessons - completedLessons - lessonsInProgress
        },
        lessons: courseProgress.lessons || [],
        certificates: courseProgress.certificates || []
      }
    });
  } catch (error) {
    console.error('Get enrollment details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch enrollment details'
    });
  }
};

// Export functions
module.exports = {
  getAllEnrollmentsAdmin,
  getEnrollmentAnalytics,
  bulkEnrollmentOperations,
  getEnrollmentDetails
};
