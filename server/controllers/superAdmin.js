const User = require('../models/User');
const Museum = require('../models/Museum');
const HeritageSite = require('../models/HeritageSite');
const Artifact = require('../models/Artifact');
const Rental = require('../models/Rental');
const Analytics = require('../models/Analytics');
const SystemSettings = require('../models/SystemSettings');
const AuditLog = require('../models/AuditLog');
const Course = require('../models/Course');
const EducationalTour = require('../models/EducationalTour');
const Assignment = require('../models/Assignment');
const Discussion = require('../models/Discussion');
const LearningProgress = require('../models/LearningProgress');
const mongoose = require('mongoose');

// ======================
// DASHBOARD & ANALYTICS
// ======================

// GET /api/super-admin/analytics
async function getAnalytics(req, res) {
  try {
    const { startDate, endDate, museum, type } = req.query;

    const now = new Date();
    const defaultStartDate = startDate ? new Date(startDate) : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const defaultEndDate = endDate ? new Date(endDate) : now;

    const dateFilter = {
      createdAt: {
        $gte: defaultStartDate,
        $lte: defaultEndDate
      }
    };

    const [userStats, museumStats, artifactStats, rentalStats] = await Promise.all([
      User.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: '$role',
            count: { $sum: 1 }
          }
        }
      ]),
      Museum.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),
      Artifact.countDocuments(dateFilter),
      Rental.countDocuments(dateFilter)
    ]);

    res.json({
      success: true,
      data: {
        users: userStats,
        museums: museumStats,
        artifacts: artifactStats,
        rentals: rentalStats,
        dateRange: {
          start: defaultStartDate,
          end: defaultEndDate
        }
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics data',
      error: error.message
    });
  }
}

// GET /api/super-admin/dashboard
async function getDashboard(req, res) {
  try {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [
      totalUsers,
      activeUsers,
      totalMuseums,
      activeMuseums
    ] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ isActive: true }),
      Museum.countDocuments({}),
      Museum.countDocuments({ isActive: true })
    ]);

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          active: activeUsers
        },
        museums: {
          total: totalMuseums,
          active: activeMuseums
        }
      }
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data',
      error: error.message
    });
  }
}

// GET /api/super-admin/dashboard/comprehensive - Enhanced dashboard with full metrics
async function getComprehensiveDashboard(req, res) {
  try {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [
      // Basic counts
      totalUsers,
      activeUsers,
      newUsersThisMonth,
      newUsersLastMonth,
      newUsersThisWeek,
      newUsersToday,
      usersByRole,
      verifiedUsers,
      unverifiedUsers,

      // Enhanced Museum statistics
      totalMuseums,
      activeMuseums,
      pendingMuseumApprovals,
      rejectedMuseums,
      museumsByRegion,
      museumsByStatus,
      museumAdmins,

      // Enhanced Heritage Sites statistics
      totalHeritageSites,
      activeHeritageSites,
      unescoSites,
      sitesByRegion,
      sitesByType,
      sitesByDesignation,
      verifiedSites,
      pendingSites,

      // Enhanced Content statistics
      totalArtifacts,
      publishedArtifacts,
      pendingContentApprovals,
      artifactsByMuseum,
      artifactsByCategory,
      artifactsThisMonth,

      // Enhanced Rental statistics
      totalRentals,
      activeRentals,
      pendingRentalApprovals,
      completedRentals,
      rentalRevenue,

      // System health and monitoring
      systemHealth,
      recentActivities,
      performanceMetrics,
      securityMetrics
    ] = await Promise.all([
      // Basic user statistics
      User.countDocuments({}),
      User.countDocuments({ isActive: true })
    ]);

    const platformStats = {
      users: {
        total: totalUsers,
        active: activeUsers
      }
    };

    res.json({
      success: true,
      dashboard: {
        systemOverview: platformStats
      }
    });

  } catch (error) {
    console.error('Comprehensive Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load comprehensive dashboard data',
      error: error.message
    });
  }
}

// ======================
// EDUCATION MANAGEMENT
// ======================

// GET /api/super-admin/education/overview
async function getEducationOverview(req, res) {
  try {
    const [courseStats, tourStats, assignmentStats, enrollmentStats, progressStats] = await Promise.all([
      Course.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),
      EducationalTour.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),
      Assignment.countDocuments(),
      User.countDocuments({ role: 'student' }),
      LearningProgress.aggregate([
        {
          $group: {
            _id: null,
            totalProgress: { $avg: '$overallStats.averageScore' },
            totalTimeSpent: { $sum: '$overallStats.totalTimeSpent' }
          }
        }
      ])
    ]);

    res.json({
      success: true,
      data: {
        courses: courseStats,
        tours: tourStats,
        assignments: assignmentStats,
        enrollments: enrollmentStats,
        progress: progressStats[0] || { totalProgress: 0, totalTimeSpent: 0 }
      }
    });
  } catch (error) {
    console.error('Get education overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch education overview',
      error: error.message
    });
  }
}

// GET /api/super-admin/education/tours
async function getAllEducationalTours(req, res) {
  try {
    const { page = 1, limit = 20, status, search } = req.query;

    const query = {};
    if (status && status !== 'all') query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const [tours, total] = await Promise.all([
      EducationalTour.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .populate('organizer', 'name email')
        .populate('museum', 'name'),
      EducationalTour.countDocuments(query)
    ]);

    res.json({
      success: true,
      tours,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all educational tours error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch educational tours',
      error: error.message
    });
  }
}

// PUT /api/super-admin/education/tours/:id/status
async function updateEducationalTourStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['published', 'draft', 'archived'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be published, draft, or archived'
      });
    }

    const tour = await EducationalTour.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('organizer', 'name email');

    if (!tour) {
      return res.status(404).json({
        success: false,
        message: 'Educational tour not found'
      });
    }

    res.json({
      success: true,
      message: `Tour status updated to ${status}`,
      tour
    });
  } catch (error) {
    console.error('Update educational tour status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update tour status',
      error: error.message
    });
  }
}

// DELETE /api/super-admin/education/tours/:id
async function deleteEducationalTour(req, res) {
  try {
    const { id } = req.params;

    // Check if tour has enrollments
    const enrollmentCount = await User.countDocuments({
      'educationalTours.tourId': id
    });

    if (enrollmentCount > 0) {
      // Archive instead of delete if has enrollments
      const tour = await EducationalTour.findByIdAndUpdate(
        id,
        { status: 'archived' },
        { new: true }
      );

      return res.json({
        success: true,
        message: 'Tour archived due to existing enrollments',
        tour
      });
    }

    await EducationalTour.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Educational tour deleted successfully'
    });
  } catch (error) {
    console.error('Delete educational tour error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete educational tour',
      error: error.message
    });
  }
}

// GET /api/super-admin/education/courses
async function getAllCourses(req, res) {
  try {
    const { page = 1, limit = 20, status, search } = req.query;

    const query = {};
    if (status && status !== 'all') query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const [courses, total] = await Promise.all([
      Course.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .populate('instructor', 'name email')
        .populate('category', 'name'),
      Course.countDocuments(query)
    ]);

    res.json({
      success: true,
      courses,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch courses',
      error: error.message
    });
  }
}

// PUT /api/super-admin/education/courses/:id/status
async function updateCourseStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['published', 'draft', 'archived'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be published, draft, or archived'
      });
    }

    const course = await Course.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('instructor', 'name email');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    res.json({
      success: true,
      message: `Course status updated to ${status}`,
      course
    });
  } catch (error) {
    console.error('Update course status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update course status',
      error: error.message
    });
  }
}

// DELETE /api/super-admin/education/courses/:id
async function deleteCourse(req, res) {
  try {
    const { id } = req.params;

    // Check if course has enrollments
    const enrollmentCount = await LearningProgress.countDocuments({
      'courses.courseId': id
    });

    if (enrollmentCount > 0) {
      // Archive instead of delete if has enrollments
      const course = await Course.findByIdAndUpdate(
        id,
        { status: 'archived' },
        { new: true }
      );

      return res.json({
        success: true,
        message: 'Course archived due to existing enrollments',
        course
      });
    }

    await Course.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete course',
      error: error.message
    });
  }
}

// POST /api/super-admin/education/courses
async function createCourseSuperAdmin(req, res) {
  try {
    const courseData = {
      ...req.body,
      createdBy: req.user._id
    };

    const course = new Course(courseData);
    await course.save();

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      course
    });
  } catch (error) {
    console.error('Create course (super admin) error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create course',
      error: error.message
    });
  }
}

// GET /api/super-admin/education/assignments
async function getAllAssignments(req, res) {
  try {
    const { page = 1, limit = 20, courseId, search } = req.query;

    const query = {};
    if (courseId) query.courseId = courseId;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const [assignments, total] = await Promise.all([
      Assignment.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .populate('courseId', 'title')
        .populate('lessonId', 'title'),
      Assignment.countDocuments(query)
    ]);

    res.json({
      success: true,
      assignments,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all assignments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assignments',
      error: error.message
    });
  }
}

// POST /api/super-admin/education/assignments
async function createAssignmentAdmin(req, res) {
  try {
    const { title, description, courseId, type, maxPoints, dueDate, submissionFormat } = req.body;
    if (!title || !courseId || !dueDate) {
      return res.status(400).json({ success: false, message: 'title, courseId and dueDate are required' });
    }
    const assignment = new Assignment({
      title,
      description: description || '',
      courseId,
      type: type || 'assignment',
      maxPoints: maxPoints ?? 100,
      dueDate: new Date(dueDate),
      submissionFormat: submissionFormat || 'file',
    });
    await assignment.save();
    await assignment.populate('courseId', 'title');
    res.status(201).json({ success: true, message: 'Assignment created', assignment });
  } catch (error) {
    console.error('Create assignment (admin) error:', error);
    res.status(500).json({ success: false, message: 'Failed to create assignment', error: error.message });
  }
}

// GET /api/super-admin/education/assignments/:id
async function getAssignmentById(req, res) {
  try {
    const { id } = req.params;
    const assignment = await Assignment.findById(id).populate('courseId', 'title');
    if (!assignment) return res.status(404).json({ success: false, message: 'Assignment not found' });
    res.json({ success: true, assignment });
  } catch (error) {
    console.error('Get assignment by id error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch assignment', error: error.message });
  }
}

// PUT /api/super-admin/education/assignments/:id
async function updateAssignment(req, res) {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const assignment = await Assignment.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('courseId', 'title');

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    res.json({
      success: true,
      message: 'Assignment updated successfully',
      assignment
    });
  } catch (error) {
    console.error('Update assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update assignment',
      error: error.message
    });
  }
}

// DELETE /api/super-admin/education/assignments/:id
async function deleteAssignment(req, res) {
  try {
    const { id } = req.params;

    // Check if assignment has submissions
    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    if (assignment.submissions && assignment.submissions.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete assignment with existing submissions'
      });
    }

    await Assignment.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Assignment deleted successfully'
    });
  } catch (error) {
    console.error('Delete assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete assignment',
      error: error.message
    });
  }
}

// GET /api/super-admin/education/discussions
async function getAllDiscussions(req, res) {
  try {
    const { page = 1, limit = 20, courseId, category, search } = req.query;

    const query = {};
    if (courseId) query.courseId = courseId;
    if (category && category !== 'all') query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const [discussions, total] = await Promise.all([
      Discussion.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .populate('courseId', 'title')
        .populate('createdBy', 'name email'),
      Discussion.countDocuments(query)
    ]);

    res.json({
      success: true,
      discussions,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all discussions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch discussions',
      error: error.message
    });
  }
}

// GET /api/super-admin/education/discussions/:id
async function getDiscussionById(req, res) {
  try {
    const { id } = req.params;
    const discussion = await Discussion.findById(id)
      .populate('courseId', 'title')
      .populate('createdBy', 'name email')
      .populate('posts.author', 'name email');

    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: 'Discussion not found'
      });
    }

    res.json({
      success: true,
      discussion
    });
  } catch (error) {
    console.error('Get discussion by id error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch discussion',
      error: error.message
    });
  }
}

// PUT /api/super-admin/education/discussions/:id/moderate
async function moderateDiscussion(req, res) {
  try {
    const { id } = req.params;
    const { action, reason } = req.body; // pin, lock, unlock, etc.

    const updateData = {};

    switch (action) {
      case 'pin':
        updateData['posts.$[].isPinned'] = true;
        break;
      case 'lock':
        updateData['settings.isLocked'] = true;
        break;
      case 'unlock':
        updateData['settings.isLocked'] = false;
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid moderation action'
        });
    }

    const discussion = await Discussion.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: 'Discussion not found'
      });
    }

    res.json({
      success: true,
      message: `Discussion ${action}ed successfully`,
      discussion
    });
  } catch (error) {
    console.error('Moderate discussion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to moderate discussion',
      error: error.message
    });
  }
}

// DELETE /api/super-admin/education/discussions/:id
async function deleteDiscussion(req, res) {
  try {
    const { id } = req.params;

    const discussion = await Discussion.findById(id);
    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: 'Discussion not found'
      });
    }

    // Check if discussion has posts
    if (discussion.posts && discussion.posts.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete discussion with existing posts. Consider locking it instead.'
      });
    }

    await Discussion.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Discussion deleted successfully'
    });
  } catch (error) {
    console.error('Delete discussion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete discussion',
      error: error.message
    });
  }
}

// GET /api/super-admin/education/enrollments
async function getAllEnrollments(req, res) {
  try {
    const { page = 1, limit = 20, courseId, userId, status } = req.query;

    const query = {};
    if (courseId) query['courses.courseId'] = courseId;
    if (userId) query.userId = userId;

    const [enrollments, total] = await Promise.all([
      LearningProgress.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .populate('userId', 'name email')
        .populate('courses.courseId', 'title'),
      LearningProgress.countDocuments(query)
    ]);

    res.json({
      success: true,
      enrollments,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all enrollments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch enrollments',
      error: error.message
    });
  }
}

// PUT /api/super-admin/education/enrollments/:id
async function updateEnrollment(req, res) {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const enrollment = await LearningProgress.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('userId', 'name email');

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    res.json({
      success: true,
      message: 'Enrollment updated successfully',
      enrollment
    });
  } catch (error) {
    console.error('Update enrollment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update enrollment',
      error: error.message
    });
  }
}

// DELETE /api/super-admin/education/enrollments/:id
async function deleteEnrollment(req, res) {
  try {
    const { id } = req.params;

    const enrollment = await LearningProgress.findByIdAndDelete(id);

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    res.json({
      success: true,
      message: 'Enrollment deleted successfully'
    });
  } catch (error) {
    console.error('Delete enrollment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete enrollment',
      error: error.message
    });
  }
}

// GET /api/super-admin/education/progress
async function getAllProgress(req, res) {
  try {
    const { page = 1, limit = 20, userId, courseId } = req.query;

    const query = {};
    if (userId) query.userId = userId;
    if (courseId) query['courses.courseId'] = courseId;

    const [progressRecords, total] = await Promise.all([
      LearningProgress.find(query)
        .sort({ 'overallStats.lastActivityDate': -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .populate('userId', 'name email')
        .populate('courses.courseId', 'title'),
      LearningProgress.countDocuments(query)
    ]);

    res.json({
      success: true,
      progress: progressRecords,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch progress records',
      error: error.message
    });
  }
}

// PUT /api/super-admin/education/progress/:id
async function updateProgress(req, res) {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const progress = await LearningProgress.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('userId', 'name email');

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'Progress record not found'
      });
    }

    res.json({
      success: true,
      message: 'Progress updated successfully',
      progress
    });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update progress',
      error: error.message
    });
  }
}

// DELETE /api/super-admin/education/progress/:id
async function deleteProgress(req, res) {
  try {
    const { id } = req.params;

    const progress = await LearningProgress.findByIdAndDelete(id);

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'Progress record not found'
      });
    }

    res.json({
      success: true,
      message: 'Progress record deleted successfully'
    });
  } catch (error) {
    console.error('Delete progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete progress record',
      error: error.message
    });
  }
}

// POST /api/super-admin/education/discussions
async function createDiscussionAdmin(req, res) {
  try {
    const { title, description, courseId, type, category, createdBy } = req.body;
    if (!title || !courseId) {
      return res.status(400).json({ success: false, message: 'title and courseId are required' });
    }
    const discussion = new Discussion({
      title,
      description: description || '',
      courseId,
      type: type || 'general',
      category: category || 'general',
      createdBy: createdBy || (req.user ? req.user._id : undefined),
      lastActivity: new Date(),
    });
    await discussion.save();
    await discussion.populate('courseId', 'title');
    await discussion.populate('createdBy', 'firstName lastName email');
    res.status(201).json({ success: true, message: 'Discussion created', discussion });
  } catch (error) {
    console.error('Create discussion (admin) error:', error);
    res.status(500).json({ success: false, message: 'Failed to create discussion', error: error.message });
  }
}

// GET /api/super-admin/education/discussions/:id
async function getDiscussionById(req, res) {
  try {
    const { id } = req.params;
    const discussion = await Discussion.findById(id)
      .populate('courseId', 'title')
      .populate('createdBy', 'firstName lastName email');
    if (!discussion) return res.status(404).json({ success: false, message: 'Discussion not found' });
    res.json({ success: true, discussion });
  } catch (error) {
    console.error('Get discussion by id error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch discussion', error: error.message });
  }
}

// ======================
// ASSIGNMENTS (REAL DATA)
// ======================

// GET /api/super-admin/education/assignments
async function getAllAssignments(req, res) {
  try {
    const { page = 1, limit = 20, courseId, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    const query = {};
    if (courseId) query.courseId = courseId;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    const sort = {}; sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const [items, total] = await Promise.all([
      Assignment.find(query)
        .populate('courseId', 'title')
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      Assignment.countDocuments(query)
    ]);

    res.json({ success: true, items, pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) } });
  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch assignments', error: error.message });
  }
}

// PUT /api/super-admin/education/assignments/:id
async function updateAssignment(req, res) {
  try {
    const { id } = req.params;
    const update = { ...req.body, updatedAt: new Date() };
    const updated = await Assignment.findByIdAndUpdate(id, update, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ success: false, message: 'Assignment not found' });
    res.json({ success: true, message: 'Assignment updated', assignment: updated });
  } catch (error) {
    console.error('Update assignment error:', error);
    res.status(500).json({ success: false, message: 'Failed to update assignment', error: error.message });
  }
}

// DELETE /api/super-admin/education/assignments/:id
async function deleteAssignment(req, res) {
  try {
    const { id } = req.params;
    const existing = await Assignment.findById(id);
    if (!existing) return res.status(404).json({ success: false, message: 'Assignment not found' });
    await Assignment.deleteOne({ _id: id });
    res.json({ success: true, message: 'Assignment deleted' });
  } catch (error) {
    console.error('Delete assignment error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete assignment', error: error.message });
  }
}

// ======================
// DISCUSSIONS (REAL DATA)
// ======================

// GET /api/super-admin/education/discussions
async function getAllDiscussions(req, res) {
  try {
    const { page = 1, limit = 20, courseId, search, sortBy = 'lastActivity', sortOrder = 'desc' } = req.query;
    const query = {};
    if (courseId) query.courseId = courseId;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    const sort = {}; sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const [items, total] = await Promise.all([
      Discussion.find(query)
        .populate('courseId', 'title')
        .populate('createdBy', 'firstName lastName email')
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      Discussion.countDocuments(query)
    ]);

    res.json({ success: true, items, pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) } });
  } catch (error) {
    console.error('Get discussions error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch discussions', error: error.message });
  }
}

// PUT /api/super-admin/education/discussions/:id/moderate
async function moderateDiscussion(req, res) {
  try {
    const { id } = req.params;
    const { isPinned, isLocked } = req.body;
    const update = { lastActivity: new Date() };
    if (typeof isPinned === 'boolean') update.isPinned = isPinned;
    if (typeof isLocked === 'boolean') update.isLocked = isLocked;
    const updated = await Discussion.findByIdAndUpdate(id, { $set: update }, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: 'Discussion not found' });
    res.json({ success: true, message: 'Discussion updated', discussion: updated });
  } catch (error) {
    console.error('Moderate discussion error:', error);
    res.status(500).json({ success: false, message: 'Failed to update discussion', error: error.message });
  }
}

// DELETE /api/super-admin/education/discussions/:id
async function deleteDiscussion(req, res) {
  try {
    const { id } = req.params;
    const existing = await Discussion.findById(id);
    if (!existing) return res.status(404).json({ success: false, message: 'Discussion not found' });
    await Discussion.deleteOne({ _id: id });
    res.json({ success: true, message: 'Discussion deleted' });
  } catch (error) {
    console.error('Delete discussion error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete discussion', error: error.message });
  }
}

// ======================
// ENROLLMENTS (REAL DATA)
// ======================

// GET /api/super-admin/education/enrollments
async function getAllEnrollments(req, res) {
  try {
    const { page = 1, limit = 20, courseId, userId, status, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    // Build aggregation pipeline for complex filtering
    const pipeline = [];

    // Match stage
    const matchConditions = {};
    if (courseId) matchConditions['courses.courseId'] = courseId;
    if (userId) matchConditions.userId = userId;

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
    console.error('Get enrollments error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch enrollments', error: error.message });
  }
}

// PUT /api/super-admin/education/enrollments/:id
async function updateEnrollment(req, res) {
  try {
    const { id } = req.params;
    const { status, progress } = req.body;

    const updateData = { updatedAt: new Date() };
    if (status) updateData['courses.$.status'] = status;
    if (typeof progress === 'number') updateData['courses.$.progress'] = progress;

    if (status === 'completed') {
      updateData['courses.$.completedAt'] = new Date();
    }

    const updated = await LearningProgress.findOneAndUpdate(
      { 'courses._id': id },
      { $set: updateData },
      { new: true }
    );

    if (!updated) return res.status(404).json({ success: false, message: 'Enrollment not found' });

    res.json({ success: true, message: 'Enrollment updated', enrollment: updated });
  } catch (error) {
    console.error('Update enrollment error:', error);
    res.status(500).json({ success: false, message: 'Failed to update enrollment', error: error.message });
  }
}

// DELETE /api/super-admin/education/enrollments/:id
async function deleteEnrollment(req, res) {
  try {
    const { id } = req.params;

    const result = await LearningProgress.updateMany(
      { 'courses._id': id },
      { $pull: { courses: { _id: id } } }
    );

    if (result.modifiedCount === 0) return res.status(404).json({ success: false, message: 'Enrollment not found' });

    res.json({ success: true, message: 'Enrollment deleted' });
  } catch (error) {
    console.error('Delete enrollment error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete enrollment', error: error.message });
  }
}

// ======================
// LEARNING PROGRESS (REAL DATA)
// ======================

// GET /api/super-admin/education/progress
async function getAllProgress(req, res) {
  try {
    const { page = 1, limit = 20, userId, courseId, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const query = {};
    if (userId) query.userId = userId;
    if (courseId) query['courses.courseId'] = courseId;
    if (search) {
      // This would require more complex aggregation for search
    }

    const sort = {}; sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const [items, total] = await Promise.all([
      LearningProgress.find(query)
        .populate('userId', 'name email')
        .populate('courses.courseId', 'title category')
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      LearningProgress.countDocuments(query)
    ]);

    res.json({ success: true, items, pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) } });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch progress', error: error.message });
  }
}

// ======================
// COURSE CREATION (SUPER ADMIN)
// ======================

// POST /api/super-admin/education/courses
async function createCourseSuperAdmin(req, res) {
  try {
    const courseData = req.body;

    // Handle uploaded files
    let imageUrl = courseData.image || 'https://picsum.photos/400/300';
    let thumbnailUrl = courseData.thumbnail || 'https://picsum.photos/200/150';

    if (req.files) {
      if (req.files.courseImage && req.files.courseImage[0]) {
        imageUrl = `/uploads/courses/images/${req.files.courseImage[0].filename}`;
      }
      if (req.files.courseThumbnail && req.files.courseThumbnail[0]) {
        thumbnailUrl = `/uploads/courses/images/${req.files.courseThumbnail[0].filename}`;
      }
    }

    const newCourse = new Course({
      ...courseData,
      organizerId: null, // Super admin created courses don't belong to specific organizers
      createdBy: req.user ? req.user._id : null,
      status: 'published', // Super admin courses are published by default
      enrollmentCount: 0,
      averageRating: 0,
      isActive: true,
      image: imageUrl,
      imageUrl: imageUrl,
      thumbnail: thumbnailUrl,
      thumbnailUrl: thumbnailUrl,
      isSuperAdminCourse: true // Flag to identify super admin created courses
    });

    await newCourse.save();

    const transformedCourse = {
      id: newCourse._id.toString(),
      title: newCourse.title,
      description: newCourse.description,
      category: newCourse.category,
      difficulty: newCourse.difficulty,
      duration: newCourse.duration || 4,
      maxStudents: newCourse.maxStudents || 30,
      enrolledStudents: 0,
      startDate: newCourse.startDate,
      endDate: newCourse.endDate,
      price: newCourse.price || 0,
      status: 'published',
      instructor: newCourse.instructor || 'Heritage Expert',
      rating: 0,
      completionRate: 0,
      totalLessons: Math.floor((newCourse.estimatedDuration || 240) / 30),
      curriculum: newCourse.curriculum || [],
      createdAt: newCourse.createdAt,
      updatedAt: newCourse.updatedAt,
      isSuperAdminCourse: true
    };

    res.status(201).json({
      success: true,
      data: transformedCourse,
      message: 'Course created successfully by Super Admin'
    });
  } catch (error) {
    console.error('Create course (super admin) error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

// PUT /api/super-admin/education/progress/:id
async function updateProgress(req, res) {
  try {
    const { id } = req.params;
    const { courses } = req.body;

    const updated = await LearningProgress.findByIdAndUpdate(
      id,
      { $set: { courses, updatedAt: new Date() } },
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).json({ success: false, message: 'Progress record not found' });

    res.json({ success: true, message: 'Progress updated', progress: updated });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ success: false, message: 'Failed to update progress', error: error.message });
  }
}

// DELETE /api/super-admin/education/progress/:id
async function deleteProgress(req, res) {
  try {
    const { id } = req.params;

    const deleted = await LearningProgress.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Progress record not found' });

    res.json({ success: true, message: 'Progress record deleted' });
  } catch (error) {
    console.error('Delete progress error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete progress', error: error.message });
  }
}

// ======================
// EDUCATION MANAGEMENT (REAL DATA)
// ======================

// GET /api/super-admin/education/overview
async function getEducationOverview(req, res) {
  try {
    const [
      totalTours,
      publishedTours,
      draftTours,
      archivedTours,
      upcomingTours,
      ongoingTours,
      totalEnrollments,
      avgTourRating,
      totalCourses,
      publishedCourses,
      draftCourses,
      archivedCourses
    ] = await Promise.all([
      EducationalTour.countDocuments({}),
      EducationalTour.countDocuments({ status: 'published', isActive: true }),
      EducationalTour.countDocuments({ status: 'draft', isActive: true }),
      EducationalTour.countDocuments({ status: 'archived' }),
      EducationalTour.countDocuments({ startDate: { $gt: new Date() }, isActive: true }),
      EducationalTour.countDocuments({ startDate: { $lte: new Date() }, endDate: { $gte: new Date() }, isActive: true }),
      EducationalTour.aggregate([
        { $unwind: '$enrollments' },
        { $match: { 'enrollments.status': { $in: ['pending', 'confirmed', 'completed'] } } },
        { $count: 'count' }
      ]).then(r => r[0]?.count || 0),
      EducationalTour.aggregate([
        { $group: { _id: null, rating: { $avg: '$stats.averageRating' } } }
      ]).then(r => r[0]?.rating || 0),
      Course.countDocuments({}),
      Course.countDocuments({ status: 'published', isActive: true }),
      Course.countDocuments({ status: 'draft', isActive: true }),
      Course.countDocuments({ status: 'archived' })
    ]);

    res.json({
      success: true,
      data: {
        tours: {
          total: totalTours,
          published: publishedTours,
          draft: draftTours,
          archived: archivedTours,
          upcoming: upcomingTours,
          ongoing: ongoingTours,
          totalEnrollments,
          averageRating: Number(avgTourRating?.toFixed?.(2) || 0)
        },
        courses: {
          total: totalCourses,
          published: publishedCourses,
          draft: draftCourses,
          archived: archivedCourses
        }
      }
    });
  } catch (error) {
    console.error('Education overview error:', error);
    res.status(500).json({ success: false, message: 'Failed to load education overview', error: error.message });
  }
}

// GET /api/super-admin/education/tours
async function getAllEducationalTours(req, res) {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};
    if (status && status !== 'all') query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { shortDescription: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    const sort = {}; sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const [items, total] = await Promise.all([
      EducationalTour.find(query)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .populate('organizerId', 'firstName lastName email'),
      EducationalTour.countDocuments(query)
    ]);

    res.json({ success: true, items, pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) } });
  } catch (error) {
    console.error('Get educational tours error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch educational tours', error: error.message });
  }
}

// PUT /api/super-admin/education/tours/:id/status
async function updateEducationalTourStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body; // expected: 'published' | 'draft' | 'archived'
    if (!['published', 'draft', 'archived'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    const updated = await EducationalTour.findByIdAndUpdate(
      id,
      { $set: { status, isActive: status !== 'archived', updatedAt: new Date() } },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ success: false, message: 'Tour not found' });
    res.json({ success: true, message: 'Tour status updated', tour: updated });
  } catch (error) {
    console.error('Update tour status error:', error);
    res.status(500).json({ success: false, message: 'Failed to update tour status', error: error.message });
  }
}

// DELETE /api/super-admin/education/tours/:id
async function deleteEducationalTour(req, res) {
  try {
    const { id } = req.params;
    const tour = await EducationalTour.findById(id);
    if (!tour) return res.status(404).json({ success: false, message: 'Tour not found' });
    // If active enrollments exist, prefer archive over delete in production
    const activeEnrollments = (tour.enrollments || []).filter(e => ['pending', 'confirmed'].includes(e.status)).length;
    if (activeEnrollments > 0) {
      tour.status = 'archived';
      tour.isActive = false;
      await tour.save();
      return res.json({ success: true, message: 'Tour had active enrollments; archived instead of delete', tour });
    }
    await EducationalTour.deleteOne({ _id: id });
    res.json({ success: true, message: 'Tour deleted' });
  } catch (error) {
    console.error('Delete tour error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete tour', error: error.message });
  }
}

// GET /api/super-admin/education/courses
async function getAllCourses(req, res) {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};
    if (status && status !== 'all') query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    const sort = {}; sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const [items, total] = await Promise.all([
      Course.find(query)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .populate('organizerId', 'firstName lastName email'),
      Course.countDocuments(query)
    ]);

    res.json({ success: true, items, pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) } });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch courses', error: error.message });
  }
}

// PUT /api/super-admin/education/courses/:id/status
async function updateCourseStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'published' | 'draft' | 'archived'
    if (!['published', 'draft', 'archived'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    const updated = await Course.findByIdAndUpdate(
      id,
      { $set: { status, isActive: status !== 'archived', updatedAt: new Date() } },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ success: false, message: 'Course not found' });
    res.json({ success: true, message: 'Course status updated', course: updated });
  } catch (error) {
    console.error('Update course status error:', error);
    res.status(500).json({ success: false, message: 'Failed to update course status', error: error.message });
  }
}

// DELETE /api/super-admin/education/courses/:id
async function deleteCourse(req, res) {
  try {
    const { id } = req.params;
    const course = await Course.findById(id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    // If enrollments tracked elsewhere, consider archiving; for now delete when safe
    if (course.enrollmentCount && course.enrollmentCount > 0) {
      course.status = 'archived';
      course.isActive = false;
      await course.save();
      return res.json({ success: true, message: 'Course had enrollments; archived instead of delete', course });
    }
    await Course.deleteOne({ _id: id });
    res.json({ success: true, message: 'Course deleted' });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete course', error: error.message });
  }
}

// GET /api/super-admin/dashboard/stats (Fixed)
async function getDashboardStats(req, res) {
  try {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [
      totalUsers,
      activeUsers,
      newUsersThisMonth,
      newUsersLastMonth,
      newUsersThisWeek,
      newUsersToday,
      usersByRole,
      verifiedUsers,
      unverifiedUsers,
      totalMuseums,
      activeMuseums,
      pendingMuseumApprovals,
      rejectedMuseums,
      museumsByRegion,
      museumsByStatus,
      museumAdmins,
      totalHeritageSites,
      activeHeritageSites,
      unescoSites,
      sitesByRegion,
      sitesByType,
      sitesByDesignation,
      verifiedSites,
      pendingSites,
      totalArtifacts,
      publishedArtifacts,
      pendingArtifacts,
      artifactsByMuseum,
      artifactsByCategory,
      newArtifactsThisMonth,
      totalRentals,
      activeRentals,
      pendingRentalApprovals,
      completedRentals,
      totalRevenueResult,
      systemHealth,
      recentActivities,
      performanceMetrics,
      securityMetrics
    ] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({
        lastLoginAt: { $gte: lastWeek }
      }),
      User.countDocuments({ createdAt: { $gte: thisMonth } }),
      User.countDocuments({
        createdAt: {
          $gte: lastMonth,
          $lt: thisMonth
        }
      }),
      User.countDocuments({ createdAt: { $gte: lastWeek } }),
      User.countDocuments({ createdAt: { $gte: last24Hours } }),
      User.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } }
      ]),
      User.countDocuments({ isEmailVerified: true }),
      User.countDocuments({ isEmailVerified: false }),

      // Enhanced Museum statistics
      Museum.countDocuments({ isActive: true }),
      Museum.countDocuments({ isActive: true, status: 'approved' }),
      Museum.countDocuments({ status: 'pending' }),
      Museum.countDocuments({ status: 'rejected' }),
      Museum.aggregate([
        { $group: { _id: '$location.region', count: { $sum: 1 } } }
      ]),
      Museum.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      User.countDocuments({ role: 'museumAdmin' }),

      // Enhanced Heritage Sites statistics
      HeritageSite.countDocuments({}),
      HeritageSite.countDocuments({ status: 'active', verified: true }),
      HeritageSite.countDocuments({ designation: 'UNESCO World Heritage' }),
      HeritageSite.aggregate([
        { $group: { _id: '$location.region', count: { $sum: 1 } } }
      ]),
      HeritageSite.aggregate([
        { $group: { _id: '$type', count: { $sum: 1 } } }
      ]),
      HeritageSite.aggregate([
        { $group: { _id: '$designation', count: { $sum: 1 } } }
      ]),
      HeritageSite.countDocuments({ verified: true }),
      HeritageSite.countDocuments({ status: 'pending' }),

      // Enhanced Content statistics
      Artifact.countDocuments({}),
      Artifact.countDocuments({ status: 'published' }),
      Artifact.countDocuments({ status: 'pending-review' }),
      Artifact.aggregate([
        { $group: { _id: '$museum', count: { $sum: 1 } } }
      ]),
      Artifact.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]),
      Artifact.countDocuments({ createdAt: { $gte: thisMonth } }),

      // Enhanced Rental statistics
      Rental.countDocuments({}),
      Rental.countDocuments({ status: 'active' }),
      Rental.countDocuments({ 'approvals.superAdmin.status': 'pending' }),
      Rental.countDocuments({ status: 'completed' }),
      Rental.aggregate([
        { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
      ]),

      // System health and monitoring
      getSystemHealthStatus(),
      getRecentSystemActivities(),
      getPerformanceMetrics(),
      getSecurityMetrics()
    ]);

    // Enhanced Platform statistics with detailed breakdowns
    const platformStats = {
      users: {
        total: totalUsers,
        active: activeUsers,
        newThisMonth: newUsersThisMonth,
        newLastMonth: newUsersLastMonth,
        newThisWeek: newUsersThisWeek,
        newToday: newUsersToday,
        verified: verifiedUsers,
        unverified: unverifiedUsers,
        growthRate: newUsersLastMonth > 0 ? ((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth * 100).toFixed(1) : 0,
        weeklyGrowth: newUsersThisWeek,
        dailyGrowth: newUsersToday,
        byRole: usersByRole.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {})
      },
      museums: {
        total: totalMuseums,
        active: activeMuseums,
        pendingApprovals: pendingMuseumApprovals,
        rejected: rejectedMuseums,
        museumAdmins: museumAdmins,
        approvalRate: totalMuseums > 0 ? ((activeMuseums / totalMuseums) * 100).toFixed(1) : 0,
        byRegion: museumsByRegion.reduce((acc, item) => {
          acc[item._id || 'Unknown'] = item.count;
          return acc;
        }, {}),
        byStatus: museumsByStatus.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {})
      },
      heritageSites: {
        total: totalHeritageSites,
        active: activeHeritageSites,
        unesco: unescoSites,
        verified: verifiedSites,
        pending: pendingSites,
        activationRate: totalHeritageSites > 0 ? ((activeHeritageSites / totalHeritageSites) * 100).toFixed(1) : 0,
        verificationRate: totalHeritageSites > 0 ? ((verifiedSites / totalHeritageSites) * 100).toFixed(1) : 0,
        byRegion: sitesByRegion.reduce((acc, item) => {
          acc[item._id || 'Unknown'] = item.count;
          return acc;
        }, {}),
        byType: sitesByType.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        byDesignation: sitesByDesignation.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {})
      },
      content: {
        totalArtifacts,
        publishedArtifacts,
        pendingApprovals: pendingContentApprovals,
        newThisMonth: artifactsThisMonth,
        publishRate: totalArtifacts > 0 ? ((publishedArtifacts / totalArtifacts) * 100).toFixed(1) : 0,
        byMuseum: artifactsByMuseum.slice(0, 10), // Top 10 museums
        byCategory: artifactsByCategory.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {})
      },
      rentals: {
        total: totalRentals,
        active: activeRentals,
        pendingApprovals: pendingRentalApprovals,
        completed: completedRentals,
        revenue: rentalRevenue[0]?.totalRevenue || 0,
        completionRate: totalRentals > 0 ? ((completedRentals / totalRentals) * 100).toFixed(1) : 0
      }
    };

    // Quick action buttons data
    const quickActions = {
      pendingApprovals: pendingMuseumApprovals + pendingContentApprovals + pendingRentalApprovals,
      systemAlerts: systemHealth.alerts || 0,
      activeIssues: systemHealth.issues || 0
    };

    // Advanced dashboard features
    const [
      advancedPerformanceMetrics,
      systemAlerts,
      realtimeStats,
      advancedSecurityMetrics,
      usagePatterns
    ] = await Promise.all([
      getPerformanceMetrics(),
      getSystemAlerts(),
      getRealtimeStats(),
      getSecurityMetrics(),
      getUsagePatterns()
    ]);

    res.json({
      success: true,
      dashboard: {
        systemOverview: platformStats,
        systemHealth,
        quickActions,
        recentActivities,
        performanceMetrics: advancedPerformanceMetrics,
        securityMetrics: advancedSecurityMetrics,
        // Enhanced dashboard data
        trends: {
          userGrowth: {
            daily: newUsersToday,
            weekly: newUsersThisWeek,
            monthly: newUsersThisMonth,
            growthRate: newUsersLastMonth > 0 ? ((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth * 100).toFixed(1) : 0
          },
          museumGrowth: {
            total: totalMuseums,
            active: activeMuseums,
            pending: pendingMuseumApprovals,
            approvalRate: totalMuseums > 0 ? ((activeMuseums / totalMuseums) * 100).toFixed(1) : 0
          },
          heritageSiteGrowth: {
            total: totalHeritageSites,
            active: activeHeritageSites,
            unesco: unescoSites,
            verificationRate: totalHeritageSites > 0 ? ((verifiedSites / totalHeritageSites) * 100).toFixed(1) : 0
          }
        },
        alerts: {
          pendingApprovals: pendingMuseumApprovals + pendingContentApprovals + pendingRentalApprovals,
          systemIssues: systemHealth.issues || 0,
          securityAlerts: securityMetrics?.threatLevel === 'high' ? 1 : 0,
          performanceAlerts: advancedPerformanceMetrics?.responseTime?.status === 'critical' ? 1 : 0
        }
      }
    });

  } catch (error) {
    console.error('Super Admin Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load dashboard data',
      error: error.message
    });
  }
}

// GET /api/super-admin/analytics
async function getAnalytics(req, res) {
  try {
    const {
      startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate = new Date(),
      museum,
      type = 'platform'
    } = req.query;

    const dateRange = { start: new Date(startDate), end: new Date(endDate) };

    let analyticsData = {};

    switch (type) {
      case 'platform':
        analyticsData = await Analytics.aggregate([
          {
            $match: {
              date: { $gte: dateRange.start, $lte: dateRange.end },
              type: 'daily_stats'
            }
          },
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
              totalUsers: { $sum: '$platformStats.totalUsers' },
              activeUsers: { $sum: '$platformStats.activeUsers' },
              newUsers: { $sum: '$platformStats.newUsers' },
              totalRevenue: { $sum: '$platformStats.totalRevenue' }
            }
          },
          { $sort: { _id: 1 } }
        ]);
        break;

      case 'user_engagement':
        analyticsData = await Analytics.getUserEngagement(dateRange, museum);
        break;

      case 'revenue':
        analyticsData = await Analytics.getRevenueStats(dateRange, museum);
        break;

      case 'top_artifacts':
        analyticsData = await Analytics.getTopArtifacts(10, museum, dateRange);
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
// USER MANAGEMENT
// ======================

// GET /api/super-admin/users
async function getAllUsers(req, res) {
  try {
    const {
      page = 1,
      limit = 20,
      role,
      status,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};

    if (role && role !== 'all') query.role = role;
    if (status === 'active') query.isActive = true;
    if (status === 'inactive') query.isActive = false;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password -emailVerificationToken -passwordResetToken -passwordResetExpires -loginAttempts -lockUntil')
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      User.countDocuments(query)
    ]);

    res.json({
      success: true,
      users,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
}

// POST /api/super-admin/users
async function createUser(req, res) {
  try {
    const { name, email, password, role = 'visitor', isActive = true, profile = {} } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    const userData = {
      name,
      email: email.toLowerCase(),
      password,
      role,
      isActive,
      isEmailVerified: true, // Super admin created users are auto-verified
      profile
    };

    const user = new User(userData);
    await user.save();

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: userResponse
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create user',
      error: error.message
    });
  }
}

// PUT /api/super-admin/users/:id
async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Fields that can be updated
    const allowedUpdates = [
      'name', 'email', 'role', 'isActive', 'isEmailVerified',
      'profile', 'museumInfo', 'organizerInfo'
    ];

    const updates = {};
    Object.keys(updateData).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = updateData[key];
      }
    });

    // Normalize email if provided
    if (updates.email) {
      updates.email = updates.email.toLowerCase();
    }

    const user = await User.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      user
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: error.message
    });
  }
}

// DELETE /api/super-admin/users/:id
async function deleteUser(req, res) {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message
    });
  }
}

// POST /api/super-admin/users/import
async function importUsers(req, res) {
  try {
    const { users, options = {} } = req.body;

    if (!Array.isArray(users) || users.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Users array is required and cannot be empty'
      });
    }

    const results = {
      imported: 0,
      failed: 0,
      skipped: 0,
      errors: []
    };

    for (let i = 0; i < users.length; i++) {
      const userData = users[i];

      try {
        // Validate required fields
        if (!userData.name || !userData.email) {
          results.failed++;
          results.errors.push({
            row: i + 1,
            error: 'Name and email are required',
            data: userData
          });
          continue;
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: userData.email.toLowerCase() });
        if (existingUser && !options.updateExisting) {
          results.skipped++;
          continue;
        }

        const userPayload = {
          name: userData.name,
          email: userData.email.toLowerCase(),
          password: userData.password || generateRandomPassword(),
          role: userData.role || 'visitor',
          isActive: userData.isActive !== undefined ? userData.isActive : true,
          isEmailVerified: true,
          profile: userData.profile || {},
          createdAt: userData.createdAt || new Date()
        };

        if (existingUser && options.updateExisting) {
          await User.findByIdAndUpdate(existingUser._id, { $set: userPayload });
        } else {
          const newUser = new User(userPayload);
          await newUser.save();
        }

        results.imported++;

      } catch (error) {
        results.failed++;
        results.errors.push({
          row: i + 1,
          error: error.message,
          data: userData
        });
      }
    }

    res.json({
      success: true,
      message: `Import completed. ${results.imported} users imported, ${results.failed} failed, ${results.skipped} skipped.`,
      results
    });

  } catch (error) {
    console.error('Import users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to import users',
      error: error.message
    });
  }
}

// GET /api/super-admin/users/export
async function exportUsers(req, res) {
  try {
    const { format = 'json', filters = {} } = req.query;

    // Build query based on filters
    const query = {};
    if (filters.role && filters.role !== 'all') query.role = filters.role;
    if (filters.isActive !== undefined) query.isActive = filters.isActive === 'true';
    if (filters.dateFrom) query.createdAt = { $gte: new Date(filters.dateFrom) };
    if (filters.dateTo) {
      if (query.createdAt) {
        query.createdAt.$lte = new Date(filters.dateTo);
      } else {
        query.createdAt = { $lte: new Date(filters.dateTo) };
      }
    }

    const users = await User.find(query)
      .select('-password -emailVerificationToken -passwordResetToken -passwordResetExpires -loginAttempts -lockUntil')
      .populate('museumInfo', 'name verified')
      .populate('organizerInfo', 'company verified')
      .lean();

    const exportData = users.map(user => ({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
      profile: user.profile,
      museumName: user.museumInfo?.name,
      museumVerified: user.museumInfo?.verified,
      organizerCompany: user.organizerInfo?.company,
      organizerVerified: user.organizerInfo?.verified
    }));

    if (format === 'csv') {
      const csvData = convertToCSV(exportData);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="users_export_${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csvData);
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="users_export_${new Date().toISOString().split('T')[0]}.json"`);
      res.json({ users: exportData, exportedAt: new Date(), total: exportData.length });
    }

  } catch (error) {
    console.error('Export users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export users',
      error: error.message
    });
  }
}

// GET /api/super-admin/users/:id/activity
async function getUserActivity(req, res) {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20, type } = req.query;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Query user activities from analytics
    const query = { userId: id };
    if (type && type !== 'all') query.type = type;

    const [activities, total] = await Promise.all([
      Analytics.find(query)
        .sort({ date: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .lean(),
      Analytics.countDocuments(query)
    ]);

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      activities,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get user activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user activity',
      error: error.message
    });
  }
}

// POST /api/super-admin/users/bulk-message
async function sendBulkMessage(req, res) {
  try {
    const { userIds, message, subject, type = 'email', urgency = 'normal' } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'User IDs array is required'
      });
    }

    if (!message || !subject) {
      return res.status(400).json({
        success: false,
        message: 'Message and subject are required'
      });
    }

    const users = await User.find({ _id: { $in: userIds } }).select('name email');

    const results = {
      sent: 0,
      failed: 0,
      errors: []
    };

    // Send messages (implement actual messaging logic based on type)
    for (const user of users) {
      try {
        // Here you would integrate with your email/SMS/notification system
        // For now, we'll simulate the sending

        // Create notification record
        await Analytics.create({
          type: 'notification_sent',
          userId: user._id,
          data: {
            subject,
            message,
            type,
            urgency,
            sentBy: req.user._id
          },
          date: new Date()
        });

        results.sent++;

      } catch (error) {
        results.failed++;
        results.errors.push({
          userId: user._id,
          userEmail: user.email,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      message: `Bulk message completed. ${results.sent} sent, ${results.failed} failed.`,
      results
    });

  } catch (error) {
    console.error('Send bulk message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send bulk message',
      error: error.message
    });
  }
}

// PUT /api/super-admin/users/:id/verify
async function verifyUser(req, res) {
  try {
    const { id } = req.params;
    const { verificationStatus, notes } = req.body;

    if (!['verified', 'rejected', 'pending'].includes(verificationStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification status'
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      {
        isEmailVerified: verificationStatus === 'verified',
        'profile.verificationStatus': verificationStatus,
        'profile.verificationNotes': notes,
        'profile.verifiedBy': req.user._id,
        'profile.verifiedAt': new Date()
      },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Log verification action
    await Analytics.create({
      type: 'user_verification',
      userId: user._id,
      data: {
        verificationStatus,
        notes,
        verifiedBy: req.user._id
      },
      date: new Date()
    });

    res.json({
      success: true,
      message: `User ${verificationStatus} successfully`,
      user
    });

  } catch (error) {
    console.error('Verify user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify user',
      error: error.message
    });
  }
}

// ======================
// MUSEUM OVERSIGHT
// ======================

// GET /api/super-admin/museums
async function getAllMuseums(req, res) {
  try {
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
    console.error('Get museums error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch museums',
      error: error.message
    });
  }
}

// PUT /api/super-admin/museums/:id/status
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



// ======================
// RENTAL SYSTEM
// ======================

// GET /api/super-admin/rentals
async function getAllRentals(req, res) {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};
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

// PUT /api/super-admin/rentals/:id/approve
async function approveRental(req, res) {
  try {
    const { id } = req.params;
    const { status, comments } = req.body; // 'approved' or 'rejected'

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be approved or rejected'
      });
    }

    const rental = await Rental.findByIdAndUpdate(
      id,
      {
        'approvals.superAdmin.status': status,
        'approvals.superAdmin.approvedBy': req.user._id,
        'approvals.superAdmin.approvedAt': new Date(),
        'approvals.superAdmin.comments': comments,
        status: status === 'approved' ? 'payment_pending' : 'rejected'
      },
      { new: true }
    )
      .populate('artifact', 'name')
      .populate('museum', 'name')
      .populate('renter', 'name email');

    if (!rental) {
      return res.status(404).json({
        success: false,
        message: 'Rental not found'
      });
    }

    res.json({
      success: true,
      message: `Rental ${status} successfully`,
      rental
    });
  } catch (error) {
    console.error('Approve rental error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process rental approval',
      error: error.message
    });
  }
}

// ======================
// SYSTEM SETTINGS
// ======================

// GET /api/super-admin/settings
async function getSystemSettings(req, res) {
  try {
    const { category } = req.query;

    let query = {};
    if (category && category !== 'all') {
      query.category = category;
    }

    const settings = await SystemSettings.find(query)
      .sort({ category: 1, key: 1 })
      .populate('lastModifiedBy', 'name email');

    res.json({
      success: true,
      settings
    });
  } catch (error) {
    console.error('Get system settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch system settings',
      error: error.message
    });
  }
}

// PUT /api/super-admin/settings/:key
async function updateSystemSetting(req, res) {
  try {
    const { key } = req.params;
    const { value, reason } = req.body;

    const setting = await SystemSettings.setSetting(key, value, req.user._id, reason);

    res.json({
      success: true,
      message: 'Setting updated successfully',
      setting
    });
  } catch (error) {
    console.error('Update system setting error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update system setting',
      error: error.message
    });
  }
}

// POST /api/super-admin/settings
async function createSystemSetting(req, res) {
  try {
    const settingData = {
      ...req.body,
      lastModifiedBy: req.user._id
    };

    const setting = await SystemSettings.createSetting(settingData);

    res.status(201).json({
      success: true,
      message: 'Setting created successfully',
      setting
    });
  } catch (error) {
    console.error('Create system setting error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create system setting',
      error: error.message
    });
  }
}

// ======================
// HELPER FUNCTIONS
// ======================

/**
 * Get system health status
 */
async function getSystemHealthStatus() {
  try {
    const health = {
      status: 'healthy',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      database: {
        connected: mongoose.connection.readyState === 1,
        status: mongoose.connection.readyState
      },
      alerts: 0,
      issues: 0,
      lastCheck: new Date()
    };

    // Check database connection
    if (mongoose.connection.readyState !== 1) {
      health.status = 'degraded';
      health.issues += 1;
    }

    // Check memory usage (alert if over 80%)
    const memoryUsagePercent = (health.memory.heapUsed / health.memory.heapTotal) * 100;
    if (memoryUsagePercent > 80) {
      health.status = 'degraded';
      health.alerts += 1;
    }

    return health;
  } catch (error) {
    return {
      status: 'error',
      error: error.message,
      issues: 1,
      lastCheck: new Date()
    };
  }
}

/**
 * Get recent system activities
 */
async function getRecentSystemActivities() {
  try {
    const activities = [];

    // Recent user registrations
    const recentUsers = await User.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email role createdAt');

    recentUsers.forEach(user => {
      activities.push({
        type: 'user_registration',
        description: `New ${user.role} account created: ${user.name}`,
        timestamp: user.createdAt,
        data: { userId: user._id, userEmail: user.email }
      });
    });

    // Recent museum applications
    const recentMuseums = await Museum.find({ status: 'pending' })
      .sort({ createdAt: -1 })
      .limit(3)
      .select('name admin createdAt')
      .populate('admin', 'name email');

    recentMuseums.forEach(museum => {
      activities.push({
        type: 'museum_application',
        description: `New museum application: ${museum.name}`,
        timestamp: museum.createdAt,
        data: { museumId: museum._id, adminName: museum.admin?.name }
      });
    });

    // Sort all activities by timestamp and return top 10
    return activities
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10);

  } catch (error) {
    console.error('Error fetching recent activities:', error);
    return [];
  }
}

/**
 * Get performance metrics
 */
async function getPerformanceMetrics() {
  try {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Database performance metrics
    const [responseTimeResults, throughputResults] = await Promise.all([
      // Simulate response time calculation (in real app, you'd measure actual response times)
      Analytics.aggregate([
        {
          $match: {
            date: { $gte: last24Hours },
            type: 'performance'
          }
        },
        {
          $group: {
            _id: null,
            avgResponseTime: { $avg: '$responseTime' },
            maxResponseTime: { $max: '$responseTime' }
          }
        }
      ]),
      // Throughput metrics
      Analytics.aggregate([
        {
          $match: {
            date: { $gte: lastWeek },
            type: 'daily_stats'
          }
        },
        {
          $group: {
            _id: null,
            totalRequests: { $sum: '$requestCount' },
            avgDaily: { $avg: '$requestCount' }
          }
        }
      ])
    ]);

    const responseTime = responseTimeResults[0] || { avgResponseTime: 120, maxResponseTime: 500 };
    const throughput = throughputResults[0] || { totalRequests: 10000, avgDaily: 1428 };

    return {
      responseTime: {
        average: Math.round(responseTime.avgResponseTime),
        peak: Math.round(responseTime.maxResponseTime),
        status: responseTime.avgResponseTime < 200 ? 'good' : responseTime.avgResponseTime < 500 ? 'warning' : 'critical'
      },
      throughput: {
        requestsPerDay: Math.round(throughput.avgDaily),
        totalRequests: throughput.totalRequests,
        trend: 'up' // Could be calculated from historical data
      },
      serverHealth: {
        cpuUsage: Math.round(Math.random() * 30 + 20), // Simulated - in real app, get actual CPU
        memoryUsage: Math.round((process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100),
        diskUsage: Math.round(Math.random() * 40 + 30),
        uptime: Math.round(process.uptime() / 3600) // Hours
      },
      lastUpdated: new Date()
    };
  } catch (error) {
    console.error('Error fetching performance metrics:', error);
    return {
      responseTime: { average: 0, peak: 0, status: 'unknown' },
      throughput: { requestsPerDay: 0, totalRequests: 0, trend: 'stable' },
      serverHealth: { cpuUsage: 0, memoryUsage: 0, diskUsage: 0, uptime: 0 },
      lastUpdated: new Date()
    };
  }
}

/**
 * Get system alerts
 */
async function getSystemAlerts() {
  try {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const alerts = [];

    // Check for high error rates
    const errorCount = await Analytics.countDocuments({
      date: { $gte: last24Hours },
      type: 'error',
      severity: { $in: ['high', 'critical'] }
    });

    if (errorCount > 10) {
      alerts.push({
        id: 'high-error-rate',
        type: 'error',
        severity: 'high',
        title: 'High Error Rate Detected',
        message: `${errorCount} high-severity errors in the last 24 hours`,
        timestamp: now,
        actions: ['view-logs', 'investigate']
      });
    }

    // Check for pending approvals
    const pendingCount = await Promise.all([
      Museum.countDocuments({ status: 'pending' }),
      Artifact.countDocuments({ status: 'pending-review' }),
      Rental.countDocuments({ 'approvals.superAdmin.status': 'pending' })
    ]);

    const totalPending = pendingCount.reduce((sum, count) => sum + count, 0);
    if (totalPending > 20) {
      alerts.push({
        id: 'pending-approvals',
        type: 'workflow',
        severity: 'medium',
        title: 'High Pending Approvals',
        message: `${totalPending} items pending approval`,
        timestamp: now,
        actions: ['view-approvals', 'bulk-process']
      });
    }

    // Check system resources
    const memoryUsage = (process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100;
    if (memoryUsage > 85) {
      alerts.push({
        id: 'high-memory-usage',
        type: 'system',
        severity: 'high',
        title: 'High Memory Usage',
        message: `Memory usage at ${Math.round(memoryUsage)}%`,
        timestamp: now,
        actions: ['restart-service', 'scale-up']
      });
    }

    return alerts.sort((a, b) => {
      const severityOrder = { critical: 3, high: 2, medium: 1, low: 0 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    }).slice(0, 5);

  } catch (error) {
    console.error('Error fetching system alerts:', error);
    return [];
  }
}

/**
 * Get real-time statistics
 */
async function getRealtimeStats() {
  try {
    const now = new Date();
    const lastHour = new Date(now.getTime() - 60 * 60 * 1000);
    const last5Minutes = new Date(now.getTime() - 5 * 60 * 1000);

    const [activeUsers, onlineUsers, recentActions] = await Promise.all([
      // Active users in last hour
      User.countDocuments({
        lastLogin: { $gte: lastHour }
      }),

      // Simulated online users (in real app, track with websockets/sessions)
      User.countDocuments({
        lastLogin: { $gte: last5Minutes }
      }),

      // Recent system actions
      Analytics.countDocuments({
        date: { $gte: lastHour },
        type: 'user_action'
      })
    ]);

    return {
      activeUsers,
      onlineUsers,
      recentActions,
      systemLoad: Math.round(Math.random() * 30 + 40), // Simulated
      requestsPerMinute: Math.round(Math.random() * 50 + 100),
      averageResponseTime: Math.round(Math.random() * 100 + 150),
      lastUpdated: now
    };

  } catch (error) {
    console.error('Error fetching realtime stats:', error);
    return {
      activeUsers: 0,
      onlineUsers: 0,
      recentActions: 0,
      systemLoad: 0,
      requestsPerMinute: 0,
      averageResponseTime: 0,
      lastUpdated: new Date()
    };
  }
}

/**
 * Get security metrics
 */
async function getSecurityMetrics() {
  try {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [failedLogins, suspiciousActivity, blockedIPs] = await Promise.all([
      // Failed login attempts
      Analytics.countDocuments({
        date: { $gte: last24Hours },
        type: 'security',
        action: 'failed_login'
      }),

      // Suspicious activities
      Analytics.countDocuments({
        date: { $gte: lastWeek },
        type: 'security',
        severity: { $in: ['medium', 'high', 'critical'] }
      }),

      // Blocked IPs (simulated)
      Analytics.countDocuments({
        date: { $gte: lastWeek },
        type: 'security',
        action: 'ip_blocked'
      })
    ]);

    return {
      failedLogins,
      suspiciousActivity,
      blockedIPs,
      securityScore: Math.max(0, 100 - failedLogins - suspiciousActivity * 2),
      threatLevel: failedLogins > 50 || suspiciousActivity > 10 ? 'high' :
        failedLogins > 20 || suspiciousActivity > 5 ? 'medium' : 'low',
      lastSecurityScan: new Date(now.getTime() - Math.random() * 60 * 60 * 1000),
      recommendations: generateSecurityRecommendations(failedLogins, suspiciousActivity)
    };

  } catch (error) {
    console.error('Error fetching security metrics:', error);
    return {
      failedLogins: 0,
      suspiciousActivity: 0,
      blockedIPs: 0,
      securityScore: 100,
      threatLevel: 'low',
      lastSecurityScan: new Date(),
      recommendations: []
    };
  }
}

/**
 * Get usage patterns
 */
async function getUsagePatterns() {
  try {
    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [hourlyPattern, deviceTypes, topPages] = await Promise.all([
      // Hourly usage pattern
      Analytics.aggregate([
        {
          $match: {
            date: { $gte: lastWeek },
            type: 'usage_pattern'
          }
        },
        {
          $group: {
            _id: { $hour: '$date' },
            avgUsers: { $avg: '$activeUsers' },
            totalRequests: { $sum: '$requestCount' }
          }
        },
        { $sort: { '_id': 1 } }
      ]),

      // Device types (simulated)
      Analytics.aggregate([
        {
          $match: {
            date: { $gte: lastWeek },
            type: 'device_stats'
          }
        },
        {
          $group: {
            _id: '$deviceType',
            count: { $sum: '$userCount' }
          }
        }
      ]),

      // Top pages
      Analytics.aggregate([
        {
          $match: {
            date: { $gte: lastWeek },
            type: 'page_view'
          }
        },
        {
          $group: {
            _id: '$page',
            views: { $sum: '$viewCount' },
            uniqueUsers: { $sum: '$uniqueUsers' }
          }
        },
        { $sort: { views: -1 } },
        { $limit: 10 }
      ])
    ]);

    return {
      peakHours: hourlyPattern.length > 0 ?
        hourlyPattern.sort((a, b) => b.avgUsers - a.avgUsers).slice(0, 3) : [],
      deviceTypes: deviceTypes.length > 0 ? deviceTypes : [
        { _id: 'desktop', count: 450 },
        { _id: 'mobile', count: 380 },
        { _id: 'tablet', count: 120 }
      ],
      topPages: topPages.length > 0 ? topPages : [
        { _id: '/dashboard', views: 1250, uniqueUsers: 890 },
        { _id: '/artifacts', views: 980, uniqueUsers: 720 },
        { _id: '/museums', views: 850, uniqueUsers: 620 }
      ],
      userBehavior: {
        avgSessionDuration: Math.round(Math.random() * 300 + 600), // 10-15 minutes
        bounceRate: Math.round(Math.random() * 20 + 25), // 25-45%
        returnVisitorRate: Math.round(Math.random() * 30 + 60) // 60-90%
      }
    };

  } catch (error) {
    console.error('Error fetching usage patterns:', error);
    return {
      peakHours: [],
      deviceTypes: [],
      topPages: [],
      userBehavior: {
        avgSessionDuration: 0,
        bounceRate: 0,
        returnVisitorRate: 0
      }
    };
  }
}

/**
 * Generate security recommendations
 */
function generateSecurityRecommendations(failedLogins, suspiciousActivity) {
  const recommendations = [];

  if (failedLogins > 50) {
    recommendations.push({
      type: 'high',
      message: 'Consider implementing additional rate limiting for login attempts',
      action: 'update-rate-limits'
    });
  }

  if (suspiciousActivity > 10) {
    recommendations.push({
      type: 'medium',
      message: 'Review and update security monitoring rules',
      action: 'review-security-rules'
    });
  }

  if (failedLogins > 20) {
    recommendations.push({
      type: 'medium',
      message: 'Enable two-factor authentication for admin accounts',
      action: 'enable-2fa'
    });
  }

  return recommendations;
}

/**
 * Generate random password
 */
function generateRandomPassword(length = 12) {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

/**
 * Convert array of objects to CSV format
 */
function convertToCSV(data) {
  if (!data || data.length === 0) {
    return '';
  }

  const headers = Object.keys(data[0]);
  const csvHeaders = headers.join(',');

  const csvRows = data.map(row => {
    return headers.map(header => {
      const value = row[header];
      // Handle nested objects, arrays, and special characters
      if (value === null || value === undefined) {
        return '';
      }
      if (typeof value === 'object') {
        return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
      }
      if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',');
  });

  return [csvHeaders, ...csvRows].join('\n');
}

// ======================
// CONTENT MANAGEMENT
// ======================

// GET /api/super-admin/content/pending
async function getPendingContent(req, res) {
  try {
    const {
      page = 1,
      limit = 20,
      type = 'all',
      status = 'pending'
    } = req.query;

    const results = {};

    if (type === 'all' || type === 'museums') {
      const [museums, museumTotal] = await Promise.all([
        Museum.find({ status: 'pending' })
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(Number(limit))
          .populate('admin', 'name email'),
        Museum.countDocuments({ status: 'pending' })
      ]);
      results.museums = { data: museums, total: museumTotal };
    }

    if (type === 'all' || type === 'artifacts') {
      const [artifacts, artifactTotal] = await Promise.all([
        Artifact.find({ status: 'pending-review' })
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(Number(limit))
          .populate('museum', 'name')
          .populate('submittedBy', 'name email'),
        Artifact.countDocuments({ status: 'pending-review' })
      ]);
      results.artifacts = { data: artifacts, total: artifactTotal };
    }

    if (type === 'all' || type === 'rentals') {
      const [rentals, rentalTotal] = await Promise.all([
        Rental.find({ 'approvals.superAdmin.status': 'pending' })
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(Number(limit))
          .populate('artifact', 'name')
          .populate('museum', 'name')
          .populate('renter', 'name email'),
        Rental.countDocuments({ 'approvals.superAdmin.status': 'pending' })
      ]);
      results.rentals = { data: rentals, total: rentalTotal };
    }

    res.json({
      success: true,
      pendingContent: results,
      pagination: {
        page: Number(page),
        limit: Number(limit)
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

// PUT /api/super-admin/content/artifacts/:id/approve
async function approveArtifact(req, res) {
  try {
    const { id } = req.params;
    const { status, feedback } = req.body; // 'approved' or 'rejected'

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be approved or rejected'
      });
    }

    const artifact = await Artifact.findByIdAndUpdate(
      id,
      {
        status: status === 'approved' ? 'published' : 'rejected',
        'moderation.status': status,
        'moderation.reviewedBy': req.user._id,
        'moderation.reviewedAt': new Date(),
        'moderation.feedback': feedback
      },
      { new: true }
    )
      .populate('museum', 'name')
      .populate('submittedBy', 'name email');

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
// HERITAGE SITES MANAGEMENT
// ======================

// GET /api/super-admin/heritage-sites
async function getHeritageSites(req, res) {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      designation,
      region,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};

    if (status && status !== 'all') query.status = status;
    if (designation && designation !== 'all') query.designation = designation;
    if (region && region !== 'all') query['location.region'] = region;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { localName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { significance: { $regex: search, $options: 'i' } }
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const [sites, total] = await Promise.all([
      HeritageSite.find(query)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .populate('createdBy', 'name email')
        .populate('updatedBy', 'name email'),
      HeritageSite.countDocuments(query)
    ]);

    res.json({
      success: true,
      sites,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit)
      }
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

// POST /api/super-admin/heritage-sites
async function createHeritageSite(req, res) {
  try {
    const siteData = {
      ...req.body,
      createdBy: req.user._id,
      updatedBy: req.user._id
    };

    const site = new HeritageSite(siteData);
    await site.save();

    res.status(201).json({
      success: true,
      message: 'Heritage site created successfully',
      site
    });
  } catch (error) {
    console.error('Create heritage site error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create heritage site',
      error: error.message
    });
  }
}

// PUT /api/super-admin/heritage-sites/:id
async function updateHeritageSite(req, res) {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updatedBy: req.user._id
    };

    const site = await HeritageSite.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!site) {
      return res.status(404).json({
        success: false,
        message: 'Heritage site not found'
      });
    }

    res.json({
      success: true,
      message: 'Heritage site updated successfully',
      site
    });
  } catch (error) {
    console.error('Update heritage site error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update heritage site',
      error: error.message
    });
  }
}

// DELETE /api/super-admin/heritage-sites/:id
async function deleteHeritageSite(req, res) {
  try {
    const { id } = req.params;

    const site = await HeritageSite.findById(id);
    if (!site) {
      return res.status(404).json({
        success: false,
        message: 'Heritage site not found'
      });
    }

    // Soft delete
    await site.softDelete();

    res.json({
      success: true,
      message: 'Heritage site deleted successfully'
    });
  } catch (error) {
    console.error('Delete heritage site error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete heritage site',
      error: error.message
    });
  }
}

// POST /api/super-admin/heritage-sites/migrate-mock-data
async function migrateMockDataToDatabase(req, res) {
  try {
    // Mock heritage sites data from the map
    const mockSites = [
      {
        name: 'Rock-Hewn Churches of Lalibela',
        localName: 'የላሊበላ ተንሳኤ ቤተ ክርስቲያናት',
        description: 'Eleven medieval monolithic cave churches carved from volcanic rock in the 12th and 13th centuries. These churches are among the finest examples of Ethiopian architecture and are still active places of worship.',
        significance: 'Represents the New Jerusalem of Ethiopia and demonstrates outstanding universal value as a masterpiece of human creative genius in religious architecture.',
        type: 'Religious',
        category: 'Churches & Monasteries',
        designation: 'UNESCO World Heritage',
        unescoId: 'ET-001',
        location: {
          region: 'Amhara',
          zone: 'North Wollo',
          woreda: 'Lalibela',
          city: 'Lalibela',
          coordinates: {
            latitude: 12.0309,
            longitude: 39.0406
          },
          altitude: 2630
        },
        history: {
          established: '12th-13th Century',
          period: 'Zagwe (900-1270 AD)',
          civilization: 'Ethiopian Orthodox Christian',
          dynasty: 'Zagwe Dynasty'
        },
        features: {
          structures: ['Churches', 'Rock Carvings'],
          materials: ['Rock-hewn', 'Natural Rock'],
          condition: 'Good'
        },
        visitorInfo: {
          isOpen: true,
          visitingHours: 'Daily 6:00 AM - 6:00 PM',
          entryFee: {
            local: 50,
            foreign: 500,
            student: 25,
            currency: 'ETB'
          },
          guidedTours: {
            available: true,
            languages: ['Amharic', 'English'],
            duration: '2-3 hours'
          }
        },
        media: {
          coverImage: 'https://picsum.photos/800/600?random=101'
        },
        status: 'active',
        verified: true,
        featured: true,
        createdBy: req.user._id
      },
      {
        name: 'Aksum Archaeological Site',
        localName: 'የአክሱም አርኪዮሎጂካል ቦታ',
        description: 'Ancient capital of the Kingdom of Aksum featuring towering granite obelisks, royal tombs, and palace ruins that showcase the power of this ancient trading empire.',
        significance: 'Center of ancient Ethiopian civilization and testimony to the ancient Kingdom of Aksum, one of the four great powers of its time alongside Persia, Rome, and China.',
        type: 'Archaeological',
        category: 'Archaeological Sites',
        designation: 'UNESCO World Heritage',
        unescoId: 'ET-002',
        location: {
          region: 'Tigray',
          zone: 'Central Tigray',
          woreda: 'Aksum',
          city: 'Aksum',
          coordinates: {
            latitude: 14.1319,
            longitude: 38.7166
          },
          altitude: 2131
        },
        history: {
          established: '1st-8th Century AD',
          period: 'Aksumite (100-900 AD)',
          civilization: 'Kingdom of Aksum',
          dynasty: 'Aksumite Dynasty'
        },
        features: {
          structures: ['Obelisks', 'Tombs', 'Palaces', 'Foundations'],
          materials: ['Stone', 'Fired Brick'],
          condition: 'Good'
        },
        visitorInfo: {
          isOpen: true,
          visitingHours: 'Daily 8:00 AM - 5:00 PM',
          entryFee: {
            local: 30,
            foreign: 300,
            student: 15,
            currency: 'ETB'
          },
          guidedTours: {
            available: true,
            languages: ['Amharic', 'English', 'Tigrinya'],
            duration: '1-2 hours'
          }
        },
        media: {
          coverImage: 'https://picsum.photos/800/600?random=102'
        },
        status: 'active',
        verified: true,
        featured: true,
        createdBy: req.user._id
      },
      {
        name: 'Harar Jugol',
        localName: 'የሀረር ጁጎል',
        description: 'Fortified historic town known as the fourth holiest city of Islam, featuring traditional architecture and serving as a cultural crossroads between Africa and Arabia.',
        significance: 'Outstanding example of cultural interchange between Africa and Arabia, representing a traditional Islamic town with remarkable architectural heritage.',
        type: 'Cultural',
        category: 'Historical Cities',
        designation: 'UNESCO World Heritage',
        unescoId: 'ET-003',
        location: {
          region: 'Harari',
          zone: 'Harari Zone',
          woreda: 'Harar',
          city: 'Harar',
          coordinates: {
            latitude: 9.3147,
            longitude: 42.1184
          },
          altitude: 1885
        },
        history: {
          established: '10th Century onwards',
          period: 'Multiple Periods',
          civilization: 'Islamic Harari',
          dynasty: 'Various Islamic Rulers'
        },
        features: {
          structures: ['Walls', 'Traditional Architecture'],
          materials: ['Stone', 'Mud Brick'],
          condition: 'Good'
        },
        visitorInfo: {
          isOpen: true,
          visitingHours: 'Daily 8:00 AM - 6:00 PM',
          entryFee: {
            local: 20,
            foreign: 200,
            student: 10,
            currency: 'ETB'
          },
          guidedTours: {
            available: true,
            languages: ['Amharic', 'English', 'Arabic'],
            duration: '2-3 hours'
          }
        },
        media: {
          coverImage: 'https://picsum.photos/800/600?random=103'
        },
        status: 'active',
        verified: true,
        featured: true,
        createdBy: req.user._id
      },
      {
        name: 'Simien Mountains National Park',
        localName: 'የስሜን ተራሮች ብሔራዊ ፓርክ',
        description: 'Spectacular landscapes with rare wildlife including Gelada baboons, Walia ibex, and Ethiopian wolves in a dramatic mountain setting.',
        significance: 'Biodiversity hotspot and endemic species sanctuary representing outstanding natural beauty and ecological importance.',
        type: 'Natural',
        category: 'National Parks',
        designation: 'UNESCO World Heritage',
        unescoId: 'ET-004',
        location: {
          region: 'Amhara',
          zone: 'North Gondar',
          woreda: 'Janamora',
          city: 'Debark',
          coordinates: {
            latitude: 13.1833,
            longitude: 38.0167
          },
          altitude: 4550
        },
        history: {
          established: '1969 (as National Park)',
          period: 'Modern (1974-present)',
          civilization: 'Natural Formation'
        },
        features: {
          area: 41200,
          structures: ['Natural Formations'],
          materials: ['Natural Rock'],
          condition: 'Excellent'
        },
        visitorInfo: {
          isOpen: true,
          visitingHours: 'Daily sunrise to sunset',
          entryFee: {
            local: 90,
            foreign: 900,
            student: 45,
            currency: 'ETB'
          },
          guidedTours: {
            available: true,
            languages: ['Amharic', 'English'],
            duration: '1-7 days (various options)'
          }
        },
        media: {
          coverImage: 'https://picsum.photos/800/600?random=104'
        },
        status: 'active',
        verified: true,
        featured: true,
        createdBy: req.user._id
      }
    ];

    const results = {
      created: 0,
      updated: 0,
      skipped: 0,
      errors: []
    };

    for (const siteData of mockSites) {
      try {
        // Check if site already exists
        const existingSite = await HeritageSite.findOne({ name: siteData.name });

        if (existingSite) {
          results.skipped++;
          continue;
        }

        const site = new HeritageSite(siteData);
        await site.save();
        results.created++;

      } catch (error) {
        results.errors.push({
          site: siteData.name,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      message: `Mock data migration completed. ${results.created} sites created, ${results.updated} updated, ${results.skipped} skipped.`,
      results
    });

  } catch (error) {
    console.error('Migrate mock data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to migrate mock data',
      error: error.message
    });
  }
}

// ======================
// AUDIT LOGS
// ======================

// GET /api/super-admin/audit-logs
async function getAuditLogs(req, res) {
  try {
    const {
      page = 1,
      limit = 50,
      action,
      userId,
      startDate,
      endDate,
      riskLevel,
      sortBy = 'timestamp',
      sortOrder = 'desc'
    } = req.query;

    const query = {};

    if (action && action !== 'all') query.action = action;
    if (userId) query.performedBy = userId;
    if (riskLevel && riskLevel !== 'all') query['security.riskLevel'] = riskLevel;
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .populate('performedBy', 'name email role')
        .populate('targetEntity.id'),
      AuditLog.countDocuments(query)
    ]);

    res.json({
      success: true,
      logs,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch audit logs',
      error: error.message
    });
  }
}

// GET /api/super-admin/audit-logs/summary
async function getAuditLogsSummary(req, res) {
  try {
    const { startDate, endDate } = req.query;

    const dateRange = {
      start: startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end: endDate ? new Date(endDate) : new Date()
    };

    const summary = await AuditLog.getAuditSummary(dateRange.start, dateRange.end);

    // Get additional statistics
    const [actionBreakdown, riskLevelBreakdown, topUsers] = await Promise.all([
      AuditLog.aggregate([
        { $match: { timestamp: { $gte: dateRange.start, $lte: dateRange.end } } },
        { $group: { _id: '$action', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      AuditLog.aggregate([
        { $match: { timestamp: { $gte: dateRange.start, $lte: dateRange.end } } },
        { $group: { _id: '$security.riskLevel', count: { $sum: 1 } } }
      ]),
      AuditLog.aggregate([
        { $match: { timestamp: { $gte: dateRange.start, $lte: dateRange.end } } },
        { $group: { _id: '$performedBy', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } }
      ])
    ]);

    res.json({
      success: true,
      summary: summary[0] || {
        totalActions: 0,
        successfulActions: 0,
        failedActions: 0,
        successRate: 0,
        uniqueUserCount: 0,
        avgResponseTime: 0
      },
      breakdown: {
        actions: actionBreakdown,
        riskLevels: riskLevelBreakdown,
        topUsers: topUsers.map(item => ({
          user: item.user[0],
          actionCount: item.count
        }))
      },
      dateRange
    });
  } catch (error) {
    console.error('Get audit logs summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch audit logs summary',
      error: error.message
    });
  }
}

// ======================
// ENHANCED USER MANAGEMENT
// ======================

// POST /api/super-admin/users/bulk-actions
async function bulkUserActions(req, res) {
  try {
    const { action, userIds, data = {} } = req.body;

    if (!action || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Action and user IDs are required'
      });
    }

    let updateData = {};
    let message = '';

    switch (action) {
      case 'activate':
        updateData = { isActive: true };
        message = 'Users activated successfully';
        break;
      case 'deactivate':
        updateData = { isActive: false };
        message = 'Users deactivated successfully';
        break;
      case 'verify':
        updateData = { isEmailVerified: true };
        message = 'Users verified successfully';
        break;
      case 'unverify':
        updateData = { isEmailVerified: false };
        message = 'Users unverified successfully';
        break;
      case 'changeRole':
        if (!data.role) {
          return res.status(400).json({
            success: false,
            message: 'Role is required for role change action'
          });
        }
        updateData = { role: data.role };
        message = `Users role changed to ${data.role} successfully`;
        break;
      case 'delete':
        const deleteResult = await User.deleteMany({ _id: { $in: userIds } });
        return res.json({
          success: true,
          message: `${deleteResult.deletedCount} users deleted successfully`,
          deletedCount: deleteResult.deletedCount
        });
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid action'
        });
    }

    const result = await User.updateMany(
      { _id: { $in: userIds } },
      { $set: updateData }
    );

    res.json({
      success: true,
      message,
      modifiedCount: result.modifiedCount,
      matchedCount: result.matchedCount
    });
  } catch (error) {
    console.error('Bulk user actions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to perform bulk actions',
      error: error.message
    });
  }
}

// GET /api/super-admin/users/statistics
async function getUserStatistics(req, res) {
  try {
    const { timeRange = '30d' } = req.query;

    const now = new Date();
    const startDate = new Date(now.getTime() - (parseInt(timeRange.replace('d', '')) * 24 * 60 * 60 * 1000));

    const [
      totalUsers,
      activeUsers,
      newUsers,
      usersByRole,
      usersByStatus,
      userActivity,
      topUsers
    ] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ createdAt: { $gte: startDate } }),
      User.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      User.aggregate([
        { $group: { _id: { isActive: '$isActive', isEmailVerified: '$isEmailVerified' }, count: { $sum: 1 } } }
      ]),
      User.aggregate([
        { $match: { lastLogin: { $gte: startDate } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$lastLogin' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]),
      User.find({})
        .select('name email role lastLogin createdAt')
        .sort({ lastLogin: -1 })
        .limit(10)
    ]);

    res.json({
      success: true,
      statistics: {
        totalUsers,
        activeUsers,
        newUsers,
        usersByRole,
        usersByStatus,
        userActivity,
        topUsers,
        timeRange
      }
    });
  } catch (error) {
    console.error('Get user statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user statistics',
      error: error.message
    });
  }
}

// GET /api/super-admin/users/search
async function searchUsers(req, res) {
  try {
    const {
      q,
      page = 1,
      limit = 20,
      role,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};

    // Search query
    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { 'profile.phone': { $regex: q, $options: 'i' } }
      ];
    }

    // Role filter
    if (role && role !== 'all') {
      query.role = role;
    }

    // Status filter
    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    } else if (status === 'verified') {
      query.isEmailVerified = true;
    } else if (status === 'unverified') {
      query.isEmailVerified = false;
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password -emailVerificationToken -passwordResetToken -passwordResetExpires -loginAttempts -lockUntil')
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      User.countDocuments(query)
    ]);

    res.json({
      success: true,
      users,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit)
      },
      searchQuery: q
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search users',
      error: error.message
    });
  }
}

// ======================
// ENHANCED MUSEUM OVERSIGHT
// ======================

// GET /api/super-admin/museums/statistics
async function getMuseumStatistics(req, res) {
  try {
    const { timeRange = '30d' } = req.query;

    const now = new Date();
    const startDate = new Date(now.getTime() - (parseInt(timeRange.replace('d', '')) * 24 * 60 * 60 * 1000));

    const [
      totalMuseums,
      activeMuseums,
      pendingMuseums,
      approvedMuseums,
      rejectedMuseums,
      museumsByStatus,
      museumsByRegion,
      newMuseums,
      museumActivity,
      topMuseums
    ] = await Promise.all([
      Museum.countDocuments({}),
      Museum.countDocuments({ isActive: true }),
      Museum.countDocuments({ status: 'pending' }),
      Museum.countDocuments({ status: 'approved' }),
      Museum.countDocuments({ status: 'rejected' }),
      Museum.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Museum.aggregate([
        { $group: { _id: '$location.region', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Museum.countDocuments({ createdAt: { $gte: startDate } }),
      Museum.aggregate([
        { $match: { updatedAt: { $gte: startDate } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$updatedAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]),
      Museum.find({})
        .select('name status verified createdAt updatedAt')
        .sort({ updatedAt: -1 })
        .limit(10)
    ]);

    res.json({
      success: true,
      statistics: {
        totalMuseums,
        activeMuseums,
        pendingMuseums,
        approvedMuseums,
        rejectedMuseums,
        museumsByStatus,
        museumsByRegion,
        newMuseums,
        museumActivity,
        topMuseums,
        timeRange
      }
    });
  } catch (error) {
    console.error('Get museum statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch museum statistics',
      error: error.message
    });
  }
}

// POST /api/super-admin/museums/bulk-actions
async function bulkMuseumActions(req, res) {
  try {
    const { action, museumIds, data = {} } = req.body;

    if (!action || !Array.isArray(museumIds) || museumIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Action and museum IDs are required'
      });
    }

    let updateData = {};
    let message = '';

    switch (action) {
      case 'approve':
        updateData = { status: 'approved', verified: true };
        message = 'Museums approved successfully';
        break;
      case 'reject':
        updateData = { status: 'rejected', verified: false };
        message = 'Museums rejected successfully';
        break;
      case 'suspend':
        updateData = { status: 'suspended', isActive: false };
        message = 'Museums suspended successfully';
        break;
      case 'activate':
        updateData = { isActive: true };
        message = 'Museums activated successfully';
        break;
      case 'deactivate':
        updateData = { isActive: false };
        message = 'Museums deactivated successfully';
        break;
      case 'verify':
        updateData = { verified: true };
        message = 'Museums verified successfully';
        break;
      case 'unverify':
        updateData = { verified: false };
        message = 'Museums unverified successfully';
        break;
      case 'delete':
        const deleteResult = await Museum.deleteMany({ _id: { $in: museumIds } });
        return res.json({
          success: true,
          message: `${deleteResult.deletedCount} museums deleted successfully`,
          deletedCount: deleteResult.deletedCount
        });
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid action'
        });
    }

    const result = await Museum.updateMany(
      { _id: { $in: museumIds } },
      { $set: updateData }
    );

    res.json({
      success: true,
      message,
      modifiedCount: result.modifiedCount,
      matchedCount: result.matchedCount
    });
  } catch (error) {
    console.error('Bulk museum actions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to perform bulk actions',
      error: error.message
    });
  }
}

// GET /api/super-admin/museums/search
async function searchMuseums(req, res) {
  try {
    const {
      q,
      page = 1,
      limit = 20,
      status,
      verified,
      region,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};

    // Search query
    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { 'location.address': { $regex: q, $options: 'i' } },
        { 'contact.email': { $regex: q, $options: 'i' } }
      ];
    }

    // Status filter
    if (status && status !== 'all') {
      query.status = status;
    }

    // Verification filter
    if (verified !== undefined) {
      query.verified = verified === 'true';
    }

    // Region filter
    if (region && region !== 'all') {
      query['location.region'] = region;
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
      },
      searchQuery: q
    });
  } catch (error) {
    console.error('Search museums error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search museums',
      error: error.message
    });
  }
}

// GET /api/super-admin/museums/performance
async function getMuseumPerformance(req, res) {
  try {
    const { timeRange = '30d', museumId } = req.query;

    const now = new Date();
    const startDate = new Date(now.getTime() - (parseInt(timeRange.replace('d', '')) * 24 * 60 * 60 * 1000));

    const query = museumId ? { _id: museumId } : {};

    const [
      museumStats,
      artifactStats,
      rentalStats,
      visitorStats,
      revenueStats
    ] = await Promise.all([
      Museum.find(query).select('name status verified createdAt'),
      Artifact.aggregate([
        { $match: { museum: museumId ? new mongoose.Types.ObjectId(museumId) : { $exists: true } } },
        { $group: { _id: null, total: { $sum: 1 }, active: { $sum: { $cond: ['$isActive', 1, 0] } } } }
      ]),
      Rental.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
            ...(museumId ? { museum: new mongoose.Types.ObjectId(museumId) } : {})
          }
        },
        { $group: { _id: null, total: { $sum: 1 }, completed: { $sum: { $cond: ['$status', 1, 0] } } } }
      ]),
      // Mock visitor stats - replace with actual visitor tracking
      Promise.resolve({ totalVisitors: 0, uniqueVisitors: 0 }),
      Rental.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
            status: 'completed',
            ...(museumId ? { museum: new mongoose.Types.ObjectId(museumId) } : {})
          }
        },
        { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
      ])
    ]);

    res.json({
      success: true,
      performance: {
        museumStats,
        artifactStats: artifactStats[0] || { total: 0, active: 0 },
        rentalStats: rentalStats[0] || { total: 0, completed: 0 },
        visitorStats,
        revenueStats: revenueStats[0] || { totalRevenue: 0 },
        timeRange
      }
    });
  } catch (error) {
    console.error('Get museum performance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch museum performance',
      error: error.message
    });
  }
}

// GET /api/super-admin/museums/audit-logs
async function getMuseumAuditLogs(req, res) {
  try {
    const {
      page = 1,
      limit = 20,
      museumId,
      action,
      startDate,
      endDate,
      sortBy = 'timestamp',
      sortOrder = 'desc'
    } = req.query;

    const query = {};

    if (museumId) query['targetEntity.id'] = museumId;
    if (action) query.action = action;
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .populate('performedBy', 'name email role')
        .populate('targetEntity.id'),
      AuditLog.countDocuments(query)
    ]);

    res.json({
      success: true,
      logs,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get museum audit logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch museum audit logs',
      error: error.message
    });
  }
}

// Heritage Sites Management Functions

// Get all heritage sites for Super Admin
async function getAllHeritageSites(req, res) {
  try {
    const { page = 1, limit = 10, status, verified, region, type, designation, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    // Build query
    const query = {};
    if (status) query.status = status;
    if (verified !== undefined) query.verified = verified === 'true';
    if (region) query['location.region'] = region;
    if (type) query.type = type;
    if (designation) query.designation = designation;

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [sites, total] = await Promise.all([
      HeritageSite.find(query)
        .select('name description location type category designation status verified featured significance tourism.annualVisitors conservation.status createdAt updatedAt')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      HeritageSite.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: sites,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get heritage sites error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch heritage sites'
    });
  }
}

// Get heritage site statistics
async function getHeritageSiteStatistics(req, res) {
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

    // Get basic statistics
    const [
      totalSites,
      activeSites,
      unescoSites,
      verifiedSites,
      featuredSites,
      newSites,
      sitesByRegion,
      sitesByType,
      sitesByDesignation,
      conservationStatus
    ] = await Promise.all([
      HeritageSite.countDocuments(),
      HeritageSite.countDocuments({ status: 'active' }),
      HeritageSite.countDocuments({ designation: 'UNESCO World Heritage' }),
      HeritageSite.countDocuments({ verified: true }),
      HeritageSite.countDocuments({ featured: true }),
      HeritageSite.countDocuments({ createdAt: { $gte: startDate } }),
      HeritageSite.aggregate([
        { $group: { _id: '$location.region', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      HeritageSite.aggregate([
        { $group: { _id: '$type', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      HeritageSite.aggregate([
        { $group: { _id: '$designation', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      HeritageSite.aggregate([
        { $group: { _id: '$conservation.status', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ])
    ]);

    // Get activity trends (monthly for the last 12 months)
    const activityTrends = await HeritageSite.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(now.getTime() - 12 * 30 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Get top heritage sites by visitor count
    const topSites = await HeritageSite.find({ 'tourism.annualVisitors': { $gt: 0 } })
      .select('name location.region tourism.annualVisitors designation')
      .sort({ 'tourism.annualVisitors': -1 })
      .limit(10);

    res.json({
      success: true,
      data: {
        overview: {
          totalSites,
          activeSites,
          unescoSites,
          verifiedSites,
          featuredSites,
          newSites
        },
        distribution: {
          byRegion: sitesByRegion,
          byType: sitesByType,
          byDesignation: sitesByDesignation,
          byConservationStatus: conservationStatus
        },
        trends: {
          activityTrends,
          topSites
        }
      }
    });
  } catch (error) {
    console.error('Get heritage site statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch heritage site statistics'
    });
  }
}

// Search heritage sites
async function searchHeritageSites(req, res) {
  try {
    const {
      query: searchQuery,
      status,
      verified,
      region,
      type,
      designation,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10
    } = req.query;

    // Build query
    const query = {};
    if (status) query.status = status;
    if (verified !== undefined) query.verified = verified === 'true';
    if (region) query['location.region'] = region;
    if (type) query.type = type;
    if (designation) query.designation = designation;

    // Add text search if query provided
    if (searchQuery && searchQuery.trim()) {
      query.$or = [
        { name: { $regex: searchQuery, $options: 'i' } },
        { description: { $regex: searchQuery, $options: 'i' } },
        { significance: { $regex: searchQuery, $options: 'i' } },
        { tags: { $in: [new RegExp(searchQuery, 'i')] } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [sites, total] = await Promise.all([
      HeritageSite.find(query)
        .select('name description location type category designation status verified featured significance tourism.annualVisitors conservation.status createdAt')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      HeritageSite.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: sites,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Search heritage sites error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search heritage sites'
    });
  }
}

// Bulk heritage site actions
async function bulkHeritageSiteActions(req, res) {
  try {
    const { action, siteIds, data = {} } = req.body;

    if (!action || !siteIds || !Array.isArray(siteIds) || siteIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid action or site IDs'
      });
    }

    let result;
    const validActions = ['approve', 'reject', 'verify', 'unverify', 'feature', 'unfeature', 'activate', 'deactivate', 'delete'];

    if (!validActions.includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid action'
      });
    }

    switch (action) {
      case 'approve':
        result = await HeritageSite.updateMany(
          { _id: { $in: siteIds } },
          { $set: { status: 'active', verified: true, updatedAt: new Date() } }
        );
        break;

      case 'reject':
        result = await HeritageSite.updateMany(
          { _id: { $in: siteIds } },
          { $set: { status: 'closed', verified: false, updatedAt: new Date() } }
        );
        break;

      case 'verify':
        result = await HeritageSite.updateMany(
          { _id: { $in: siteIds } },
          { $set: { verified: true, updatedAt: new Date() } }
        );
        break;

      case 'unverify':
        result = await HeritageSite.updateMany(
          { _id: { $in: siteIds } },
          { $set: { verified: false, updatedAt: new Date() } }
        );
        break;

      case 'feature':
        result = await HeritageSite.updateMany(
          { _id: { $in: siteIds } },
          { $set: { featured: true, updatedAt: new Date() } }
        );
        break;

      case 'unfeature':
        result = await HeritageSite.updateMany(
          { _id: { $in: siteIds } },
          { $set: { featured: false, updatedAt: new Date() } }
        );
        break;

      case 'activate':
        result = await HeritageSite.updateMany(
          { _id: { $in: siteIds } },
          { $set: { status: 'active', updatedAt: new Date() } }
        );
        break;

      case 'deactivate':
        result = await HeritageSite.updateMany(
          { _id: { $in: siteIds } },
          { $set: { status: 'closed', updatedAt: new Date() } }
        );
        break;

      case 'delete':
        result = await HeritageSite.updateMany(
          { _id: { $in: siteIds } },
          { $set: { deletedAt: new Date(), status: 'closed', updatedAt: new Date() } }
        );
        break;
    }

    res.json({
      success: true,
      message: `Successfully ${action}ed ${result.modifiedCount} heritage sites`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Bulk heritage site actions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to perform bulk actions'
    });
  }
}

// Get heritage site performance metrics
async function getHeritageSitePerformance(req, res) {
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

    // Get performance metrics
    const [
      totalVisitors,
      averageVisitors,
      topPerformingSites,
      regionalPerformance,
      conservationMetrics
    ] = await Promise.all([
      HeritageSite.aggregate([
        { $group: { _id: null, total: { $sum: '$tourism.annualVisitors' } } }
      ]),
      HeritageSite.aggregate([
        { $group: { _id: null, average: { $avg: '$tourism.annualVisitors' } } }
      ]),
      HeritageSite.find({ 'tourism.annualVisitors': { $gt: 0 } })
        .select('name location.region tourism.annualVisitors designation')
        .sort({ 'tourism.annualVisitors': -1 })
        .limit(10),
      HeritageSite.aggregate([
        {
          $group: {
            _id: '$location.region',
            totalVisitors: { $sum: '$tourism.annualVisitors' },
            siteCount: { $sum: 1 },
            averageVisitors: { $avg: '$tourism.annualVisitors' }
          }
        },
        { $sort: { totalVisitors: -1 } }
      ]),
      HeritageSite.aggregate([
        {
          $group: {
            _id: '$conservation.status',
            count: { $sum: 1 },
            averageVisitors: { $avg: '$tourism.annualVisitors' }
          }
        },
        { $sort: { count: -1 } }
      ])
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalVisitors: totalVisitors[0]?.total || 0,
          averageVisitors: Math.round(averageVisitors[0]?.average || 0),
          totalSites: await HeritageSite.countDocuments()
        },
        topPerformingSites,
        regionalPerformance,
        conservationMetrics
      }
    });
  } catch (error) {
    console.error('Get heritage site performance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch heritage site performance'
    });
  }
}

// Get heritage site audit logs
async function getHeritageSiteAuditLogs(req, res) {
  try {
    const {
      page = 1,
      limit = 20,
      action,
      siteId,
      userId,
      startDate,
      endDate,
      sortBy = 'timestamp',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = { targetEntity: 'heritage_site' };
    if (action) query.action = action;
    if (siteId) query['details.siteId'] = siteId;
    if (userId) query.performedBy = userId;
    if (startDate) query.timestamp = { ...query.timestamp, $gte: new Date(startDate) };
    if (endDate) query.timestamp = { ...query.timestamp, $lte: new Date(endDate) };

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .populate('performedBy', 'name email role')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      AuditLog.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get heritage site audit logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch heritage site audit logs'
    });
  }
}

// Heritage Site CRUD Operations

// Create a new heritage site
async function createHeritageSite(req, res) {
  console.log('🏛️ CREATE HERITAGE SITE - Function called');
  console.log('📝 Request body:', req.body);
  console.log('👤 Request user:', req.user);

  try {
    const heritageSiteData = { ...req.body };

    // Don't require createdBy field for now - make it optional
    if (req.user && req.user.id) {
      heritageSiteData.createdBy = req.user.id;
      console.log('✅ Using authenticated user ID:', req.user.id);
    } else {
      console.log('⚠️ No authenticated user, using default createdBy');
      // Use a default createdBy for testing purposes
      heritageSiteData.createdBy = '507f1f77bcf86cd799439011'; // Default admin user ID
    }

    console.log('📋 Final heritage site data:', heritageSiteData);

    const heritageSite = new HeritageSite(heritageSiteData);
    await heritageSite.save();

    console.log('✅ Heritage site created successfully:', heritageSite._id);

    res.status(201).json({
      success: true,
      message: 'Heritage site created successfully',
      data: heritageSite
    });
  } catch (error) {
    console.error('❌ Create heritage site error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create heritage site',
      error: error.message
    });
  }
}

// Get a specific heritage site
async function getHeritageSite(req, res) {
  try {
    const { id } = req.params;

    const heritageSite = await HeritageSite.findById(id);

    if (!heritageSite) {
      return res.status(404).json({
        success: false,
        message: 'Heritage site not found'
      });
    }

    res.json({
      success: true,
      data: heritageSite
    });
  } catch (error) {
    console.error('Get heritage site error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get heritage site',
      error: error.message
    });
  }
}

// Update a heritage site
async function updateHeritageSite(req, res) {
  try {
    const { id } = req.params;
    const updateData = req.body;

    console.log('🔄 UPDATE HERITAGE SITE - ID:', id);
    console.log('📋 Update data received:', JSON.stringify(updateData, null, 2));
    console.log('📋 Request headers:', req.headers);

    // Find the existing site first
    const existingSite = await HeritageSite.findById(id);
    if (!existingSite) {
      console.log('❌ Heritage site not found:', id);
      return res.status(404).json({
        success: false,
        message: 'Heritage site not found'
      });
    }

    console.log('📋 Existing site data:', JSON.stringify(existingSite.toObject(), null, 2));

    // Merge the update data with existing data to avoid validation errors
    const mergedData = {
      ...existingSite.toObject(),
      ...updateData,
      updatedAt: new Date()
    };

    // Preserve existing management.authority if the new one is empty
    if (mergedData.management && mergedData.management.authority === '') {
      mergedData.management.authority = existingSite.management.authority;
    }

    console.log('🔄 Merged data:', JSON.stringify(mergedData, null, 2));

    const heritageSite = await HeritageSite.findByIdAndUpdate(
      id,
      mergedData,
      { new: true, runValidators: true }
    );

    console.log('✅ Heritage site updated successfully:', heritageSite._id);

    res.json({
      success: true,
      message: 'Heritage site updated successfully',
      data: heritageSite
    });
  } catch (error) {
    console.error('❌ Update heritage site error:', error);
    console.error('❌ Error details:', error.message);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to update heritage site',
      error: error.message
    });
  }
}

// Delete a heritage site
async function deleteHeritageSite(req, res) {
  try {
    const { id } = req.params;

    const heritageSite = await HeritageSite.findByIdAndDelete(id);

    if (!heritageSite) {
      return res.status(404).json({
        success: false,
        message: 'Heritage site not found'
      });
    }

    res.json({
      success: true,
      message: 'Heritage site deleted successfully'
    });
  } catch (error) {
    console.error('Delete heritage site error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete heritage site',
      error: error.message
    });
  }
}

module.exports = {
  // Dashboard & Analytics
  getDashboard,
  getAnalytics,
  // Education Overview/Tours/Courses
  getEducationOverview,
  getAllEducationalTours,
  updateEducationalTourStatus,
  deleteEducationalTour,
  getAllCourses,
  updateCourseStatus,
  deleteCourse,
  // Course Creation (Super Admin)
  createCourseSuperAdmin,
  // Assignments (Super Admin)
  createAssignmentAdmin,
  getAllAssignments,
  getAssignmentById,
  updateAssignment,
  deleteAssignment,
  // Discussions (Super Admin)
  createDiscussionAdmin,
  getAllDiscussions,
  getDiscussionById,
  moderateDiscussion,
  deleteDiscussion,

  // User Management
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  importUsers,
  exportUsers,
  getUserActivity,
  sendBulkMessage,
  verifyUser,

  // Museum Oversight
  getAllMuseums,
  updateMuseumStatus,

  // Heritage Sites Management
  getHeritageSites,
  createHeritageSite,
  updateHeritageSite,
  deleteHeritageSite,
  migrateMockDataToDatabase,

  // Rental System
  getAllRentals,
  approveRental,

  // System Settings
  getSystemSettings,
  updateSystemSetting,
  createSystemSetting,

  // Content Management
  getPendingContent,
  approveArtifact,

  // Audit Logs
  getAuditLogs,
  getAuditLogsSummary,

  // Enhanced User Management
  bulkUserActions,
  getUserStatistics,
  searchUsers,

  // Enhanced Museum Oversight
  getMuseumStatistics,
  bulkMuseumActions,
  searchMuseums,
  getMuseumPerformance,
  getMuseumAuditLogs,

  // Enhanced Heritage Sites Management
  getAllHeritageSites,
  getHeritageSiteStatistics,
  searchHeritageSites,
  bulkHeritageSiteActions,
  getHeritageSitePerformance,
  getHeritageSiteAuditLogs,

  // Heritage Site CRUD Operations
  createHeritageSite,
  getHeritageSite,
  updateHeritageSite,
  deleteHeritageSite,

  // Enrollment Management
  getAllEnrollments,
  updateEnrollment,
  deleteEnrollment,

  // Learning Progress Management
  getAllProgress,
  updateProgress,
  deleteProgress
};
