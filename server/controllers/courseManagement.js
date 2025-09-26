const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const LearningProgress = require('../models/LearningProgress');

// Create a new course (Admin only)
const createCourse = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      difficulty,
      estimatedDuration,
      image,
      thumbnail,
      instructor,
      tags,
      prerequisites
    } = req.body;

    // Validate required fields
    if (!title || !description || !category || !estimatedDuration) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: title, description, category, estimatedDuration'
      });
    }

    // Check if course with same title already exists
    const existingCourse = await Course.findOne({ title });
    if (existingCourse) {
      return res.status(409).json({
        success: false,
        message: 'Course with this title already exists'
      });
    }

    // Create new course
    const courseData = {
      title: title.trim(),
      description: description.trim(),
      category,
      difficulty: difficulty || 'beginner',
      estimatedDuration: parseInt(estimatedDuration),
      image: image || `https://picsum.photos/400/300?random=${Date.now()}`,
      thumbnail: thumbnail || `https://picsum.photos/200/150?random=${Date.now()}`,
      instructor: instructor || 'Heritage Expert',
      tags: Array.isArray(tags) ? tags.map(tag => tag.trim()) : [],
      prerequisites: Array.isArray(prerequisites) ? prerequisites : [],
      createdBy: req.user.id,
      isActive: true
    };

    const course = new Course(courseData);
    await course.save();

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      course
    });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create course'
    });
  }
};

// Update an existing course (Admin only)
const updateCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const updateData = { ...req.body };

    // Remove fields that shouldn't be updated directly
    delete updateData._id;
    delete updateData.__v;
    delete updateData.createdAt;
    delete updateData.createdBy;
    
    // Update timestamps
    updateData.updatedAt = new Date();

    // Validate estimatedDuration if provided
    if (updateData.estimatedDuration) {
      updateData.estimatedDuration = parseInt(updateData.estimatedDuration);
    }

    // Sanitize tags if provided
    if (updateData.tags && Array.isArray(updateData.tags)) {
      updateData.tags = updateData.tags.map(tag => tag.trim());
    }

    const course = await Course.findByIdAndUpdate(
      courseId,
      updateData,
      { new: true, runValidators: true }
    ).populate('lessons');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    res.json({
      success: true,
      message: 'Course updated successfully',
      course
    });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update course'
    });
  }
};

// Delete a course (Admin only)
const deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { permanent } = req.query;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    if (permanent === 'true') {
      // Permanently delete course and associated data
      await Promise.all([
        Course.findByIdAndDelete(courseId),
        Lesson.deleteMany({ courseId }),
        LearningProgress.updateMany(
          {},
          { $pull: { courses: { courseId } } }
        )
      ]);

      res.json({
        success: true,
        message: 'Course permanently deleted'
      });
    } else {
      // Soft delete - just mark as inactive
      course.isActive = false;
      course.updatedAt = new Date();
      await course.save();

      res.json({
        success: true,
        message: 'Course deactivated'
      });
    }
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete course'
    });
  }
};

// Get all courses with admin details
const getAllCoursesAdmin = async (req, res) => {
  try {
    const { 
      category, 
      difficulty, 
      status, 
      page = 1, 
      limit = 20,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filter = {};
    
    // Apply filters
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    if (status === 'active') filter.isActive = true;
    if (status === 'inactive') filter.isActive = false;
    
    // Search functionality
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { instructor: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [courses, totalCount] = await Promise.all([
      Course.find(filter)
        .populate('lessons', 'title order estimatedDuration')
        .populate('createdBy', 'name email')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit)),
      Course.countDocuments(filter)
    ]);

    // Get enrollment counts for each course
    const coursesWithStats = await Promise.all(
      courses.map(async (course) => {
        const enrollmentCount = await LearningProgress.countDocuments({
          'courses.courseId': course._id
        });

        const completionCount = await LearningProgress.countDocuments({
          'courses.courseId': course._id,
          'courses.status': 'completed'
        });

        return {
          ...course.toObject(),
          stats: {
            enrollments: enrollmentCount,
            completions: completionCount,
            completionRate: enrollmentCount > 0 ? Math.round((completionCount / enrollmentCount) * 100) : 0,
            totalLessons: course.lessons.length
          }
        };
      })
    );

    res.json({
      success: true,
      courses: coursesWithStats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalCourses: totalCount,
        hasNextPage: skip + courses.length < totalCount,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Get all courses admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch courses'
    });
  }
};

// Create a new lesson for a course (Admin only)
const createLesson = async (req, res) => {
  try {
    const { courseId } = req.params;
    const {
      title,
      description,
      order,
      estimatedDuration,
      content,
      objectives,
      resources,
      quiz,
      prerequisites,
      image,
      thumbnail
    } = req.body;

    // Validate required fields
    if (!title || !description || !order || !estimatedDuration) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: title, description, order, estimatedDuration'
      });
    }

    // Verify course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if lesson with same order already exists in this course
    const existingLesson = await Lesson.findOne({ courseId, order: parseInt(order) });
    if (existingLesson) {
      return res.status(409).json({
        success: false,
        message: `Lesson with order ${order} already exists in this course`
      });
    }

    // Create new lesson
    const lessonData = {
      title: title.trim(),
      description: description.trim(),
      courseId,
      order: parseInt(order),
      estimatedDuration: parseInt(estimatedDuration),
      content: Array.isArray(content) ? content : [],
      objectives: Array.isArray(objectives) ? objectives.map(obj => obj.trim()) : [],
      resources: Array.isArray(resources) ? resources : [],
      quiz: quiz || { questions: [], passingScore: 70 },
      prerequisites: Array.isArray(prerequisites) ? prerequisites : [],
      image: image || `https://picsum.photos/400/300?random=${Date.now()}`,
      thumbnail: thumbnail || `https://picsum.photos/200/150?random=${Date.now()}`,
      createdBy: req.user.id,
      isActive: true
    };

    const lesson = new Lesson(lessonData);
    await lesson.save();

    // Add lesson reference to course
    await Course.findByIdAndUpdate(courseId, {
      $push: { lessons: lesson._id },
      $set: { updatedAt: new Date() }
    });

    res.status(201).json({
      success: true,
      message: 'Lesson created successfully',
      lesson
    });
  } catch (error) {
    console.error('Create lesson error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create lesson'
    });
  }
};

// Update an existing lesson (Admin only)
const updateLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const updateData = { ...req.body };

    // Remove fields that shouldn't be updated directly
    delete updateData._id;
    delete updateData.__v;
    delete updateData.createdAt;
    delete updateData.createdBy;
    delete updateData.courseId; // Don't allow moving lessons between courses
    
    // Update timestamps
    updateData.updatedAt = new Date();

    // Validate numeric fields if provided
    if (updateData.order) updateData.order = parseInt(updateData.order);
    if (updateData.estimatedDuration) updateData.estimatedDuration = parseInt(updateData.estimatedDuration);

    // Sanitize arrays if provided
    if (updateData.objectives && Array.isArray(updateData.objectives)) {
      updateData.objectives = updateData.objectives.map(obj => obj.trim());
    }

    const lesson = await Lesson.findByIdAndUpdate(
      lessonId,
      updateData,
      { new: true, runValidators: true }
    ).populate('courseId', 'title');

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }

    res.json({
      success: true,
      message: 'Lesson updated successfully',
      lesson
    });
  } catch (error) {
    console.error('Update lesson error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update lesson'
    });
  }
};

// Delete a lesson (Admin only)
const deleteLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { permanent } = req.query;

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }

    if (permanent === 'true') {
      // Permanently delete lesson and remove from course
      await Promise.all([
        Lesson.findByIdAndDelete(lessonId),
        Course.findByIdAndUpdate(lesson.courseId, {
          $pull: { lessons: lessonId },
          $set: { updatedAt: new Date() }
        }),
        LearningProgress.updateMany(
          { 'courses.courseId': lesson.courseId },
          { $pull: { 'courses.$.lessons': { lessonId } } }
        )
      ]);

      res.json({
        success: true,
        message: 'Lesson permanently deleted'
      });
    } else {
      // Soft delete - just mark as inactive
      lesson.isActive = false;
      lesson.updatedAt = new Date();
      await lesson.save();

      res.json({
        success: true,
        message: 'Lesson deactivated'
      });
    }
  } catch (error) {
    console.error('Delete lesson error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete lesson'
    });
  }
};

// Get admin dashboard statistics
const getAdminStats = async (req, res) => {
  try {
    const [
      totalCourses,
      activeCourses,
      totalLessons,
      activeLessons,
      totalUsers,
      totalEnrollments,
      totalCompletions
    ] = await Promise.all([
      Course.countDocuments(),
      Course.countDocuments({ isActive: true }),
      Lesson.countDocuments(),
      Lesson.countDocuments({ isActive: true }),
      LearningProgress.distinct('userId').then(users => users.length),
      LearningProgress.aggregate([
        { $unwind: '$courses' },
        { $count: 'total' }
      ]).then(result => result[0]?.total || 0),
      LearningProgress.aggregate([
        { $unwind: '$courses' },
        { $match: { 'courses.status': 'completed' } },
        { $count: 'total' }
      ]).then(result => result[0]?.total || 0)
    ]);

    // Get course category distribution
    const categoryStats = await Course.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get difficulty distribution
    const difficultyStats = await Course.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$difficulty', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get recent activity (last 7 days)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentActivity = await LearningProgress.aggregate([
      { $match: { 'overallStats.lastActivityDate': { $gte: weekAgo } } },
      { $count: 'activeUsers' }
    ]);

    res.json({
      success: true,
      stats: {
        courses: {
          total: totalCourses,
          active: activeCourses,
          inactive: totalCourses - activeCourses
        },
        lessons: {
          total: totalLessons,
          active: activeLessons,
          inactive: totalLessons - activeLessons
        },
        users: {
          total: totalUsers,
          activeThisWeek: recentActivity[0]?.activeUsers || 0
        },
        enrollments: {
          total: totalEnrollments,
          completed: totalCompletions,
          completionRate: totalEnrollments > 0 ? Math.round((totalCompletions / totalEnrollments) * 100) : 0
        },
        distribution: {
          byCategory: categoryStats,
          byDifficulty: difficultyStats
        }
      }
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin statistics'
    });
  }
};

// Get all lessons with admin details and filtering
const getAllLessonsAdmin = async (req, res) => {
  try {
    const { 
      courseId, 
      status, 
      page = 1, 
      limit = 20,
      search,
      sortBy = 'order',
      sortOrder = 'asc'
    } = req.query;

    const filter = {};
    
    // Apply filters
    if (courseId) filter.courseId = courseId;
    if (status === 'active') filter.isActive = true;
    if (status === 'inactive') filter.isActive = false;
    
    // Search functionality
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { objectives: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [lessons, totalCount] = await Promise.all([
      Lesson.find(filter)
        .populate('courseId', 'title category')
        .populate('createdBy', 'name email')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit)),
      Lesson.countDocuments(filter)
    ]);

    // Get completion stats for each lesson
    const lessonsWithStats = await Promise.all(
      lessons.map(async (lesson) => {
        const completionCount = await LearningProgress.countDocuments({
          'courses.lessons.lessonId': lesson._id,
          'courses.lessons.status': 'completed'
        });

        const attemptCount = await LearningProgress.countDocuments({
          'courses.lessons.lessonId': lesson._id
        });

        return {
          ...lesson.toObject(),
          stats: {
            attempts: attemptCount,
            completions: completionCount,
            completionRate: attemptCount > 0 ? Math.round((completionCount / attemptCount) * 100) : 0,
            hasQuiz: lesson.quiz && lesson.quiz.questions && lesson.quiz.questions.length > 0
          }
        };
      })
    );

    res.json({
      success: true,
      lessons: lessonsWithStats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalLessons: totalCount,
        hasNextPage: skip + lessons.length < totalCount,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Get all lessons admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch lessons'
    });
  }
};

// Get single lesson details for admin
const getLessonAdmin = async (req, res) => {
  try {
    const { lessonId } = req.params;

    const lesson = await Lesson.findById(lessonId)
      .populate('courseId', 'title category')
      .populate('createdBy', 'name email');

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }

    // Get detailed stats
    const [completionCount, attemptCount, averageScore] = await Promise.all([
      LearningProgress.countDocuments({
        'courses.lessons.lessonId': lesson._id,
        'courses.lessons.status': 'completed'
      }),
      LearningProgress.countDocuments({
        'courses.lessons.lessonId': lesson._id
      }),
      LearningProgress.aggregate([
        { $unwind: '$courses' },
        { $unwind: '$courses.lessons' },
        { $match: { 'courses.lessons.lessonId': lesson._id } },
        { $group: { _id: null, avgScore: { $avg: '$courses.lessons.quizScore' } } }
      ])
    ]);

    res.json({
      success: true,
      lesson: {
        ...lesson.toObject(),
        stats: {
          attempts: attemptCount,
          completions: completionCount,
          completionRate: attemptCount > 0 ? Math.round((completionCount / attemptCount) * 100) : 0,
          averageQuizScore: averageScore[0]?.avgScore ? Math.round(averageScore[0].avgScore) : null,
          hasQuiz: lesson.quiz && lesson.quiz.questions && lesson.quiz.questions.length > 0,
          totalQuestions: lesson.quiz?.questions?.length || 0
        }
      }
    });
  } catch (error) {
    console.error('Get lesson admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch lesson details'
    });
  }
};

// Bulk operations for lessons
const bulkUpdateLessons = async (req, res) => {
  try {
    const { lessonIds, updateData, operation } = req.body;

    if (!Array.isArray(lessonIds) || lessonIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'lessonIds array is required'
      });
    }

    let result;
    updateData.updatedAt = new Date();

    switch (operation) {
      case 'activate':
        result = await Lesson.updateMany(
          { _id: { $in: lessonIds } },
          { $set: { isActive: true, updatedAt: new Date() } }
        );
        break;
      
      case 'deactivate':
        result = await Lesson.updateMany(
          { _id: { $in: lessonIds } },
          { $set: { isActive: false, updatedAt: new Date() } }
        );
        break;
      
      case 'delete':
        // Soft delete by default
        result = await Lesson.updateMany(
          { _id: { $in: lessonIds } },
          { $set: { isActive: false, updatedAt: new Date() } }
        );
        break;
      
      case 'update':
        if (!updateData) {
          return res.status(400).json({
            success: false,
            message: 'updateData is required for update operation'
          });
        }
        result = await Lesson.updateMany(
          { _id: { $in: lessonIds } },
          { $set: updateData }
        );
        break;
      
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid operation. Allowed: activate, deactivate, delete, update'
        });
    }

    res.json({
      success: true,
      message: `Bulk ${operation} completed`,
      modifiedCount: result.modifiedCount,
      matchedCount: result.matchedCount
    });
  } catch (error) {
    console.error('Bulk update lessons error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to perform bulk operation'
    });
  }
};

// Reorder lessons within a course
const reorderLessons = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { lessonOrders } = req.body; // Array of { lessonId, newOrder }

    if (!Array.isArray(lessonOrders)) {
      return res.status(400).json({
        success: false,
        message: 'lessonOrders array is required'
      });
    }

    // Verify all lessons belong to the course
    const lessonIds = lessonOrders.map(lo => lo.lessonId);
    const lessons = await Lesson.find({ _id: { $in: lessonIds }, courseId });
    
    if (lessons.length !== lessonOrders.length) {
      return res.status(400).json({
        success: false,
        message: 'Some lessons do not belong to this course'
      });
    }

    // Update lesson orders
    const updatePromises = lessonOrders.map(({ lessonId, newOrder }) => 
      Lesson.findByIdAndUpdate(lessonId, { 
        order: parseInt(newOrder),
        updatedAt: new Date()
      })
    );

    await Promise.all(updatePromises);

    // Update course timestamp
    await Course.findByIdAndUpdate(courseId, { updatedAt: new Date() });

    res.json({
      success: true,
      message: 'Lessons reordered successfully'
    });
  } catch (error) {
    console.error('Reorder lessons error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reorder lessons'
    });
  }
};

module.exports = {
  createCourse,
  updateCourse,
  deleteCourse,
  getAllCoursesAdmin,
  createLesson,
  updateLesson,
  deleteLesson,
  getAllLessonsAdmin,
  getLessonAdmin,
  bulkUpdateLessons,
  reorderLessons,
  getAdminStats
};
