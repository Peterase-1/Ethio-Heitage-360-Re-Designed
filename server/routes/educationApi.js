const express = require('express');
const router = express.Router();
const { auth, optionalAuth } = require('../middleware/auth');

// Import models
const Course = require('../models/Course');
const LearningProgress = require('../models/LearningProgress');
const Certificate = require('../models/Certificate');
const User = require('../models/User');
const StudyGuide = require('../models/StudyGuide');
const TourPackage = require('../models/TourPackage');

// ============ COURSES ============

/**
 * GET /api/courses - Get all courses with filters
 * Matches: educationService.getCourses()
 */
router.get('/courses', async (req, res) => {
  try {
    const { category, difficulty, search, limit = 12, page = 1 } = req.query;
    
    let query = { isActive: true, status: 'published' };
    
    // Apply filters
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (difficulty && difficulty !== 'all') {
      query.difficulty = difficulty;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { instructor: { $regex: search, $options: 'i' } }
      ];
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const courses = await Course.find(query)
      .select('title description category difficulty image instructor averageRating enrollmentCount price estimatedDuration featured tags')
      .sort({ featured: -1, averageRating: -1, enrollmentCount: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    const total = await Course.countDocuments(query);
    
    // Transform courses to match frontend expectations
    const transformedCourses = courses.map(course => ({
      id: course._id.toString(),
      _id: course._id.toString(), // Also include _id for backward compatibility
      title: course.title,
      description: course.description,
      category: course.category,
      difficulty: course.difficulty,
      image: course.image || course.imageUrl || '/images/course-placeholder.jpg',
      instructor: course.instructor || 'Heritage Expert',
      rating: course.averageRating || 0,
      averageRating: course.averageRating || 0, // Also include averageRating for compatibility
      enrollmentCount: course.enrollmentCount || 0,
      price: course.price || 0,
      duration: course.estimatedDuration || 240, // in minutes
      estimatedDuration: course.estimatedDuration || 240, // Also include original field name
      isFeatured: course.featured || false,
      tags: course.tags || [] // Include tags to prevent undefined errors
    }));
    
    res.json({
      success: true,
      courses: transformedCourses,
      total: total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      message: 'Courses retrieved successfully'
    });
    
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({
      success: false,
      courses: [],
      total: 0,
      message: 'Error retrieving courses',
      error: error.message
    });
  }
});

/**
 * GET /api/courses/featured - Get featured courses
 * Matches: educationService.getFeaturedCourses()
 */
router.get('/courses/featured', async (req, res) => {
  try {
    const featuredCourses = await Course.find({
      isActive: true,
      status: 'published',
      featured: true
    })
.select('title description category difficulty image instructor averageRating enrollmentCount price estimatedDuration tags')
    .sort({ averageRating: -1, enrollmentCount: -1 })
    .limit(6)
    .lean();
    
    // If no featured courses, get popular ones
    let coursesToReturn = featuredCourses;
    if (featuredCourses.length === 0) {
      coursesToReturn = await Course.find({
        isActive: true,
        status: 'published'
      })
.select('title description category difficulty image instructor averageRating enrollmentCount price estimatedDuration tags')
      .sort({ enrollmentCount: -1, averageRating: -1 })
      .limit(6)
      .lean();
    }
    
const transformedCourses = coursesToReturn.map(course => ({
      id: course._id.toString(),
      _id: course._id.toString(),
      title: course.title,
      description: course.description,
      category: course.category,
      difficulty: course.difficulty,
      image: course.image || course.imageUrl || '/images/course-placeholder.jpg',
      instructor: course.instructor || 'Heritage Expert',
      rating: course.averageRating || 0,
      averageRating: course.averageRating || 0,
      enrollmentCount: course.enrollmentCount || 0,
      price: course.price || 0,
      duration: course.estimatedDuration || 240,
      estimatedDuration: course.estimatedDuration || 240,
      tags: course.tags || []
    }));
    
    res.json({
      success: true,
      courses: transformedCourses,
      message: 'Featured courses retrieved successfully'
    });
    
  } catch (error) {
    console.error('Get featured courses error:', error);
    res.status(500).json({
      success: false,
      courses: [],
      message: 'Error retrieving featured courses',
      error: error.message
    });
  }
});

/**
 * GET /api/courses/categories - Get course categories
 * Matches: educationService.getCategories()
 */
router.get('/courses/categories', async (req, res) => {
  try {
    // Get unique categories with course counts
    const categories = await Course.aggregate([
      { $match: { isActive: true, status: 'published' } },
      { 
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgRating: { $avg: '$averageRating' }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    // Predefined category info with icons and descriptions
    const categoryInfo = {
      'history': {
        name: 'History',
        description: 'Explore Ethiopia\'s rich historical heritage',
        icon: 'history',
        color: '#8B4513'
      },
      'art': {
        name: 'Art & Culture',
        description: 'Discover traditional and contemporary art',
        icon: 'palette',
        color: '#FF6347'
      },
      'archaeology': {
        name: 'Archaeology',
        description: 'Uncover ancient civilizations and discoveries',
        icon: 'archaeology',
        color: '#CD853F'
      },
      'architecture': {
        name: 'Architecture',
        description: 'Learn about traditional and modern architecture',
        icon: 'building',
        color: '#4682B4'
      },
      'culture': {
        name: 'Culture',
        description: 'Immerse in Ethiopian cultural traditions',
        icon: 'culture',
        color: '#32CD32'
      },
      'religion': {
        name: 'Religious Heritage',
        description: 'Explore religious history and significance',
        icon: 'church',
        color: '#9370DB'
      }
    };
    
    const transformedCategories = categories.map(cat => ({
      id: cat._id,
      name: categoryInfo[cat._id]?.name || cat._id,
      description: categoryInfo[cat._id]?.description || `Learn about ${cat._id}`,
      icon: categoryInfo[cat._id]?.icon || 'book',
      color: categoryInfo[cat._id]?.color || '#007BFF',
      courseCount: cat.count,
      averageRating: Math.round((cat.avgRating || 0) * 10) / 10
    }));
    
    // Add "All" category at the beginning
    const allCategory = {
      id: 'all',
      name: 'All Categories',
      description: 'Browse all available courses',
      icon: 'grid',
      color: '#007BFF',
      courseCount: await Course.countDocuments({ isActive: true, status: 'published' }),
      averageRating: 0
    };
    
    res.json({
      success: true,
      categories: [allCategory, ...transformedCategories],
      message: 'Categories retrieved successfully'
    });
    
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      categories: [],
      message: 'Error retrieving categories',
      error: error.message
    });
  }
});

/**
 * GET /api/courses/:courseId - Get single course
 * Matches: educationService.getCourse()
 */
router.get('/courses/:courseId', async (req, res) => {
  try {
    const { courseId } = req.params;
    
    const course = await Course.findById(courseId)
      .populate('organizerId', 'firstName lastName email')
      .populate('lessons')
      .lean();
    
    if (!course) {
      return res.status(404).json({
        success: false,
        course: null,
        message: 'Course not found'
      });
    }
    
    // Get enrollment statistics
    const enrollmentCount = await LearningProgress.countDocuments({
      'courses.courseId': courseId
    });
    
    const completionCount = await LearningProgress.countDocuments({
      'courses.courseId': courseId,
      'courses.status': 'completed'
    });
    
    const transformedCourse = {
      id: course._id.toString(),
      title: course.title,
      description: course.description,
      category: course.category,
      difficulty: course.difficulty,
      image: course.image || course.imageUrl || '/images/course-placeholder.jpg',
      instructor: course.instructor || 
        (course.organizerId ? `${course.organizerId.firstName} ${course.organizerId.lastName}` : 'Heritage Expert'),
      instructorEmail: course.organizerId?.email,
      rating: course.averageRating || 0,
      enrollmentCount: enrollmentCount,
      price: course.price || 0,
      duration: course.estimatedDuration || 240,
      lessonsCount: course.lessons?.length || 0,
      objectives: course.objectives || [],
      prerequisites: course.prerequisites || [],
      materials: course.materials || [],
      completionRate: enrollmentCount > 0 ? Math.round((completionCount / enrollmentCount) * 100) : 0,
      language: course.language || 'English',
      certificate: course.certificate || true,
      status: course.status,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt
    };
    
    res.json({
      success: true,
      course: transformedCourse,
      message: 'Course retrieved successfully'
    });
    
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({
      success: false,
      course: null,
      message: 'Error retrieving course',
      error: error.message
    });
  }
});

/**
 * POST /api/courses/:courseId/enroll - Enroll in course
 * Matches: educationService.enrollInCourse()
 */
router.post('/courses/:courseId/enroll', auth, async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;
    
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        enrollment: null,
        message: 'Course not found'
      });
    }
    
    // Check if already enrolled
    const existingProgress = await LearningProgress.findOne({
      userId: userId,
      'courses.courseId': courseId
    });
    
    if (existingProgress) {
      return res.status(400).json({
        success: false,
        enrollment: null,
        message: 'Already enrolled in this course'
      });
    }
    
    // Create or update learning progress
    let progress = await LearningProgress.findOne({ userId: userId });
    
    if (!progress) {
      progress = new LearningProgress({
        userId: userId,
        courses: []
      });
    }
    
    progress.courses.push({
      courseId: courseId,
      enrolledAt: new Date(),
      progressPercentage: 0,
      status: 'enrolled',
      lessons: []
    });
    
    await progress.save();
    
    // Update course enrollment count
    await Course.findByIdAndUpdate(courseId, { $inc: { enrollmentCount: 1 } });
    
    const enrollment = {
      courseId: courseId,
      userId: userId,
      enrolledAt: new Date(),
      status: 'enrolled'
    };
    
    res.json({
      success: true,
      enrollment: enrollment,
      message: 'Successfully enrolled in course'
    });
    
  } catch (error) {
    console.error('Enroll in course error:', error);
    res.status(500).json({
      success: false,
      enrollment: null,
      message: 'Error enrolling in course',
      error: error.message
    });
  }
});

/**
 * PUT /api/courses/:courseId/progress - Update course progress
 * Matches: educationService.updateProgress()
 */
router.put('/courses/:courseId/progress', auth, async (req, res) => {
  try {
    const { courseId } = req.params;
    const { progress } = req.body;
    const userId = req.user.id;
    
    const learningProgress = await LearningProgress.findOne({ userId });
    if (!learningProgress) {
      return res.status(404).json({
        success: false,
        progress: null,
        message: 'Learning progress not found'
      });
    }
    
    const courseProgress = learningProgress.courses.find(c => 
      c.courseId.toString() === courseId
    );
    
    if (!courseProgress) {
      return res.status(404).json({
        success: false,
        progress: null,
        message: 'Course enrollment not found'
      });
    }
    
    courseProgress.progressPercentage = progress;
    
    // Update status based on progress
    if (progress >= 100) {
      courseProgress.status = 'completed';
      courseProgress.completedAt = new Date();
    } else if (progress > 0) {
      courseProgress.status = 'in_progress';
    }
    
    await learningProgress.save();
    
    res.json({
      success: true,
      progress: {
        courseId: courseId,
        progressPercentage: progress,
        status: courseProgress.status,
        completedAt: courseProgress.completedAt
      },
      message: 'Progress updated successfully'
    });
    
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({
      success: false,
      progress: null,
      message: 'Error updating progress',
      error: error.message
    });
  }
});

// ============ USER LEARNING DATA ============

/**
 * GET /api/user/courses/enrolled - Get user's enrolled courses
 * Matches: educationService.getEnrolledCourses()
 */
router.get('/user/courses/enrolled', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const learningProgress = await LearningProgress.findOne({ userId })
      .populate({
        path: 'courses.courseId',
        select: 'title description category difficulty image instructor averageRating estimatedDuration'
      })
      .lean();
    
    if (!learningProgress) {
      return res.json({
        success: true,
        courses: [],
        message: 'No enrolled courses found'
      });
    }
    
    const enrolledCourses = learningProgress.courses
      .filter(course => course.status !== 'completed')
      .map(courseProgress => ({
        id: courseProgress.courseId._id.toString(),
        title: courseProgress.courseId.title,
        description: courseProgress.courseId.description,
        category: courseProgress.courseId.category,
        difficulty: courseProgress.courseId.difficulty,
        image: courseProgress.courseId.image || '/images/course-placeholder.jpg',
        instructor: courseProgress.courseId.instructor || 'Heritage Expert',
        rating: courseProgress.courseId.averageRating || 0,
        duration: courseProgress.courseId.estimatedDuration || 240,
        progress: courseProgress.progressPercentage,
        status: courseProgress.status,
        enrolledAt: courseProgress.enrolledAt,
        lastAccessed: courseProgress.lessons?.reduce((latest, lesson) => 
          lesson.lastAccessedAt > latest ? lesson.lastAccessedAt : latest,
          courseProgress.enrolledAt
        ),
        completedLessons: courseProgress.lessons?.filter(l => l.status === 'completed').length || 0,
        totalLessons: courseProgress.lessons?.length || 0
      }));
    
    res.json({
      success: true,
      courses: enrolledCourses,
      message: 'Enrolled courses retrieved successfully'
    });
    
  } catch (error) {
    console.error('Get enrolled courses error:', error);
    res.status(500).json({
      success: false,
      courses: [],
      message: 'Error retrieving enrolled courses',
      error: error.message
    });
  }
});

/**
 * GET /api/user/courses/completed - Get user's completed courses
 * Matches: educationService.getCompletedCourses()
 */
router.get('/user/courses/completed', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const learningProgress = await LearningProgress.findOne({ userId })
      .populate({
        path: 'courses.courseId',
        select: 'title description category difficulty image instructor averageRating estimatedDuration'
      })
      .lean();
    
    if (!learningProgress) {
      return res.json({
        success: true,
        courses: [],
        message: 'No completed courses found'
      });
    }
    
    const completedCourses = learningProgress.courses
      .filter(course => course.status === 'completed')
      .map(courseProgress => ({
        id: courseProgress.courseId._id.toString(),
        title: courseProgress.courseId.title,
        description: courseProgress.courseId.description,
        category: courseProgress.courseId.category,
        difficulty: courseProgress.courseId.difficulty,
        image: courseProgress.courseId.image || '/images/course-placeholder.jpg',
        instructor: courseProgress.courseId.instructor || 'Heritage Expert',
        rating: courseProgress.courseId.averageRating || 0,
        duration: courseProgress.courseId.estimatedDuration || 240,
        progress: 100, // Always 100 for completed courses
        status: 'completed',
        enrolledAt: courseProgress.enrolledAt,
        completedAt: courseProgress.completedAt,
        completedLessons: courseProgress.lessons?.filter(l => l.status === 'completed').length || 0,
        totalLessons: courseProgress.lessons?.length || 0,
        finalScore: courseProgress.lessons?.length > 0 ? 
          courseProgress.lessons.reduce((sum, lesson) => sum + (lesson.score || 0), 0) / courseProgress.lessons.length : 0
      }));
    
    res.json({
      success: true,
      courses: completedCourses,
      message: 'Completed courses retrieved successfully'
    });
    
  } catch (error) {
    console.error('Get completed courses error:', error);
    res.status(500).json({
      success: false,
      courses: [],
      message: 'Error retrieving completed courses',
      error: error.message
    });
  }
});

/**
 * GET /api/user/learning/stats - Get user learning statistics
 * Matches: educationService.getLearningStats()
 */
router.get('/user/learning/stats', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const learningProgress = await LearningProgress.findOne({ userId }).lean();
    const certificates = await Certificate.countDocuments({ userId });
    
    if (!learningProgress) {
      return res.json({
        success: true,
        stats: {
          totalCoursesEnrolled: 0,
          completedCourses: 0,
          certificatesEarned: certificates,
          totalHoursLearned: 0,
          averageProgress: 0,
          currentStreak: 0,
          totalLessonsCompleted: 0,
          averageScore: 0,
          lastActivityDate: null
        },
        message: 'Learning statistics retrieved'
      });
    }
    
    const stats = {
      totalCoursesEnrolled: learningProgress.courses.length,
      completedCourses: learningProgress.courses.filter(c => c.status === 'completed').length,
      certificatesEarned: certificates,
      totalHoursLearned: Math.round((learningProgress.overallStats.totalTimeSpent || 0) / 60 * 10) / 10,
      averageProgress: learningProgress.courses.length > 0 ? 
        Math.round(learningProgress.courses.reduce((sum, c) => sum + c.progressPercentage, 0) / learningProgress.courses.length) : 0,
      currentStreak: learningProgress.overallStats.currentStreak || 0,
      totalLessonsCompleted: learningProgress.overallStats.totalLessonsCompleted || 0,
      averageScore: Math.round((learningProgress.overallStats.averageScore || 0) * 10) / 10,
      lastActivityDate: learningProgress.overallStats.lastActivityDate || null,
      longestStreak: learningProgress.overallStats.longestStreak || 0,
      totalTimeSpent: learningProgress.overallStats.totalTimeSpent || 0
    };
    
    res.json({
      success: true,
      stats: stats,
      message: 'Learning statistics retrieved successfully'
    });
    
  } catch (error) {
    console.error('Get learning stats error:', error);
    res.status(500).json({
      success: false,
      stats: {
        totalCoursesEnrolled: 0,
        completedCourses: 0,
        certificatesEarned: 0,
        totalHoursLearned: 0,
        averageProgress: 0
      },
      message: 'Error retrieving learning statistics',
      error: error.message
    });
  }
});

// ============ CERTIFICATES ============

/**
 * GET /api/user/certificates - Get user's certificates
 * Matches: educationService.getCertificates()
 */
router.get('/user/certificates', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const certificates = await Certificate.find({ userId })
      .populate('courseId', 'title category instructor')
      .sort({ earnedDate: -1 })
      .lean();
    
    const transformedCertificates = certificates.map(cert => ({
      id: cert._id.toString(),
      courseId: cert.courseId._id.toString(),
      courseTitle: cert.courseId.title,
      courseCategory: cert.courseId.category,
      instructor: cert.courseId.instructor || 'Heritage Expert',
      earnedDate: cert.earnedDate,
      verificationCode: cert.verificationCode,
      certificateUrl: cert.certificateUrl || `/certificates/${cert._id}`,
      grade: cert.grade || 'Pass',
      validUntil: cert.validUntil || null,
      skills: cert.skills || []
    }));
    
    res.json({
      success: true,
      certificates: transformedCertificates,
      message: 'Certificates retrieved successfully'
    });
    
  } catch (error) {
    console.error('Get certificates error:', error);
    res.status(500).json({
      success: false,
      certificates: [],
      message: 'Error retrieving certificates',
      error: error.message
    });
  }
});

/**
 * GET /api/certificates/:certificateId/download - Download certificate
 * Matches: educationService.downloadCertificate()
 */
router.get('/certificates/:certificateId/download', auth, async (req, res) => {
  try {
    const { certificateId } = req.params;
    const userId = req.user.id;
    
    const certificate = await Certificate.findOne({ 
      _id: certificateId, 
      userId: userId 
    }).populate('courseId', 'title');
    
    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }
    
    // In a real application, you would generate a PDF here
    // For now, we'll return certificate data that the frontend can use
    const certificateData = {
      id: certificate._id,
      courseTitle: certificate.courseId.title,
      studentName: `${req.user.firstName} ${req.user.lastName}`,
      earnedDate: certificate.earnedDate,
      verificationCode: certificate.verificationCode,
      instructor: certificate.courseId.instructor || 'Heritage Expert'
    };
    
    res.json({
      success: true,
      certificate: certificateData,
      message: 'Certificate data retrieved for download'
    });
    
  } catch (error) {
    console.error('Download certificate error:', error);
    res.status(500).json({
      success: false,
      message: 'Error downloading certificate',
      error: error.message
    });
  }
});

// ============ STUDY GUIDES ============

/**
 * GET /api/study-guides - Get study guides
 * Matches: educationService.getStudyGuides()
 */
router.get('/study-guides', optionalAuth, async (req, res) => {
  try {
    // For now, return mock study guides as you might not have this model yet
    const studyGuides = [
      {
        id: '1',
        title: 'Ethiopian History Study Guide',
        description: 'Comprehensive guide covering ancient to modern Ethiopian history',
        category: 'history',
        topics: ['Ancient Civilizations', 'Medieval Period', 'Modern History'],
        difficulty: 'intermediate',
        estimatedTime: 120,
        downloadUrl: '/downloads/ethiopian-history-guide.pdf',
        lastUpdated: new Date()
      },
      {
        id: '2',
        title: 'Cultural Heritage Guide',
        description: 'Essential guide to Ethiopian cultural traditions and practices',
        category: 'culture',
        topics: ['Traditional Festivals', 'Religious Practices', 'Art Forms'],
        difficulty: 'beginner',
        estimatedTime: 90,
        downloadUrl: '/downloads/cultural-heritage-guide.pdf',
        lastUpdated: new Date()
      },
      {
        id: '3',
        title: 'Archaeological Sites Reference',
        description: 'Detailed reference for major archaeological sites in Ethiopia',
        category: 'archaeology',
        topics: ['Lalibela', 'Aksum', 'Hadar', 'Omo Valley'],
        difficulty: 'advanced',
        estimatedTime: 180,
        downloadUrl: '/downloads/archaeological-sites-guide.pdf',
        lastUpdated: new Date()
      }
    ];
    
    res.json({
      success: true,
      guides: studyGuides,
      message: 'Study guides retrieved successfully'
    });
    
  } catch (error) {
    console.error('Get study guides error:', error);
    res.status(500).json({
      success: false,
      guides: [],
      message: 'Error retrieving study guides',
      error: error.message
    });
  }
});

// ============ EDUCATIONAL TOURS ============

/**
 * GET /api/tours/educational - Get educational tours
 * Matches: educationService.getEducationalTours()
 */
router.get('/tours/educational', optionalAuth, async (req, res) => {
  try {
    const tours = await TourPackage.find({
      isActive: true,
      category: { $in: ['educational', 'cultural', 'historical'] }
    })
    .select('title description duration price difficulty highlights images rating bookingCount category')
    .sort({ rating: -1, bookingCount: -1 })
    .limit(12)
    .lean();
    
    const transformedTours = tours.map(tour => ({
      id: tour._id.toString(),
      title: tour.title,
      description: tour.description,
      category: tour.category,
      duration: tour.duration,
      price: tour.price,
      difficulty: tour.difficulty,
      highlights: tour.highlights || [],
      images: tour.images || [],
      rating: tour.rating || 0,
      bookingCount: tour.bookingCount || 0,
      type: 'educational'
    }));
    
    res.json({
      success: true,
      tours: transformedTours,
      message: 'Educational tours retrieved successfully'
    });
    
  } catch (error) {
    console.error('Get educational tours error:', error);
    res.status(500).json({
      success: false,
      tours: [],
      message: 'Error retrieving educational tours',
      error: error.message
    });
  }
});

/**
 * GET /api/platform/stats - Get platform statistics for visitor dashboard
 * Matches: educationService.getPlatformStats()
 */
router.get('/platform/stats', async (req, res) => {
  try {
    console.log('📊 Fetching platform statistics...');
    
    // Get featured courses
    const featuredCourses = await Course.find({
      isActive: true,
      status: 'published',
      featured: true
    })
    .select('title description category difficulty image instructor averageRating enrollmentCount price estimatedDuration')
    .sort({ averageRating: -1, enrollmentCount: -1 })
    .limit(6)
    .lean();
    
    // If no featured courses, get popular ones
    let coursesToReturn = featuredCourses;
    if (featuredCourses.length === 0) {
      coursesToReturn = await Course.find({
        isActive: true,
        status: 'published'
      })
      .select('title description category difficulty image instructor averageRating enrollmentCount price estimatedDuration')
      .sort({ enrollmentCount: -1, averageRating: -1 })
      .limit(6)
      .lean();
    }
    
    const transformedCourses = coursesToReturn.map(course => ({
      _id: course._id.toString(),
      title: course.title,
      description: course.description,
      category: course.category,
      difficulty: course.difficulty,
      image: course.image || course.imageUrl || '/images/course-placeholder.jpg',
      instructor: course.instructor || 'Heritage Expert',
      averageRating: course.averageRating || 0,
      enrollmentCount: course.enrollmentCount || 0,
      price: course.price || 0,
      estimatedDuration: course.estimatedDuration || 240
    }));
    
    // Get course categories with counts
    const categories = await Course.aggregate([
      { $match: { isActive: true, status: 'published' } },
      { 
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgRating: { $avg: '$averageRating' }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    // Predefined category info with descriptions
    const categoryInfo = {
      'history': {
        name: 'History',
        description: 'Explore Ethiopia\'s rich historical heritage',
        coursesCount: 0
      },
      'art': {
        name: 'Art & Culture', 
        description: 'Discover traditional and contemporary art',
        coursesCount: 0
      },
      'archaeology': {
        name: 'Archaeology',
        description: 'Uncover ancient civilizations and discoveries',
        coursesCount: 0
      },
      'culture': {
        name: 'Culture',
        description: 'Immerse in Ethiopian cultural traditions',
        coursesCount: 0
      }
    };
    
    // Update category counts
    categories.forEach(cat => {
      if (categoryInfo[cat._id]) {
        categoryInfo[cat._id].coursesCount = cat.count;
      }
    });
    
    const transformedCategories = Object.values(categoryInfo);
    
    // Calculate platform statistics
    const totalCourses = await Course.countDocuments({ isActive: true, status: 'published' });
    const totalLearners = await LearningProgress.countDocuments({});
    const coursesCompleted = await LearningProgress.countDocuments({
      'courses.status': 'completed'
    });
    
    const platformStats = {
      totalCourses: totalCourses,
      totalLearners: totalLearners,
      coursesCompleted: coursesCompleted,
      successRate: totalLearners > 0 ? Math.round((coursesCompleted / totalLearners) * 100) : 0
    };
    
    // Generate sample testimonials (until real data is available)
    const testimonials = [
      {
        id: 1,
        name: 'Sarah Johnson',
        role: 'History Student',
        message: 'The Ethiopian heritage courses opened my eyes to the incredible depth of this ancient civilization.',
        rating: 5,
        image: 'https://picsum.photos/64/64?random=1'
      },
      {
        id: 2,
        name: 'Michael Chen',
        role: 'Cultural Researcher',
        message: 'Exceptional quality content with expert instructors. Highly recommended for anyone interested in African history.',
        rating: 5,
        image: 'https://picsum.photos/64/64?random=2'
      },
      {
        id: 3,
        name: 'Fatima Al-Hassan',
        role: 'Archaeology Student',
        message: 'The interactive virtual tours bring Ethiopia\'s heritage sites to life. Amazing learning experience!',
        rating: 5,
        image: 'https://picsum.photos/64/64?random=3'
      }
    ];
    
    // Generate quick actions
    const quickActions = [
      {
        id: 1,
        title: 'Start Learning',
        description: 'Browse our extensive course catalog',
        icon: 'book-open',
        link: '/courses',
        color: 'blue'
      },
      {
        id: 2,
        title: 'Virtual Tours',
        description: 'Explore heritage sites virtually',
        icon: 'map',
        link: '/virtual-tours',
        color: 'green'
      },
      {
        id: 3,
        title: 'Study Guides',
        description: 'Download comprehensive study materials',
        icon: 'file-text',
        link: '/study-guides',
        color: 'purple'
      },
      {
        id: 4,
        title: 'Community',
        description: 'Join discussions and connect',
        icon: 'users',
        link: '/community',
        color: 'amber'
      }
    ];
    
    // Generate featured museums (sample data)
    const featuredMuseums = [
      {
        _id: 'museum1',
        name: 'National Museum of Ethiopia',
        description: 'Home to Lucy and other archaeological treasures',
        location: 'Addis Ababa',
        rating: 4.8,
        image: 'https://picsum.photos/300/200?random=10'
      },
      {
        _id: 'museum2',
        name: 'Ethnological Museum',
        description: 'Showcasing Ethiopia\'s diverse cultural heritage',
        location: 'Addis Ababa University',
        rating: 4.6,
        image: 'https://picsum.photos/300/200?random=11'
      },
      {
        _id: 'museum3',
        name: 'Harar Cultural Center',
        description: 'Islamic heritage and traditional architecture',
        location: 'Harar',
        rating: 4.7,
        image: 'https://picsum.photos/300/200?random=12'
      }
    ];
    
    // Generate featured artifacts (sample data)
    const featuredArtifacts = [
      {
        id: 'artifact1',
        name: 'Lucy Fossil',
        museum: 'National Museum',
        addedAt: '2 days ago',
        image: 'https://picsum.photos/300/200?random=20'
      },
      {
        id: 'artifact2',
        name: 'Axumite Obelisk',
        museum: 'Axum Museum',
        addedAt: '1 week ago',
        image: 'https://picsum.photos/300/200?random=21'
      },
      {
        id: 'artifact3',
        name: 'Ancient Manuscripts',
        museum: 'Holy Trinity Cathedral',
        addedAt: '3 days ago',
        image: 'https://picsum.photos/300/200?random=22'
      }
    ];
    
    // Generate upcoming events (sample data)
    const upcomingEvents = [
      {
        id: 'event1',
        title: 'Ethiopian Heritage Week',
        location: 'National Museum',
        date: 'Dec 15, 2024',
        type: 'Cultural Event',
        image: 'https://picsum.photos/64/64?random=30'
      },
      {
        id: 'event2',
        title: 'Lalibela Virtual Tour',
        location: 'Online',
        date: 'Dec 20, 2024',
        type: 'Virtual Event',
        image: 'https://picsum.photos/64/64?random=31'
      },
      {
        id: 'event3',
        title: 'Archaeology Workshop',
        location: 'University Campus',
        date: 'Jan 5, 2025',
        type: 'Workshop',
        image: 'https://picsum.photos/64/64?random=32'
      }
    ];
    
    const responseData = {
      success: true,
      featured: {
        courses: transformedCourses,
        museums: featuredMuseums,
        artifacts: featuredArtifacts
      },
      categories: transformedCategories,
      stats: platformStats,
      testimonials: testimonials,
      quickActions: quickActions,
      upcoming: {
        events: upcomingEvents
      },
      message: 'Platform statistics retrieved successfully'
    };
    
    console.log('✅ Platform stats loaded successfully:', {
      courses: transformedCourses.length,
      categories: transformedCategories.length,
      totalCourses: platformStats.totalCourses,
      totalLearners: platformStats.totalLearners
    });
    
    res.json(responseData);
    
  } catch (error) {
    console.error('❌ Error fetching platform statistics:', error);
    res.status(500).json({
      success: false,
      featured: { courses: [], museums: [], artifacts: [] },
      categories: [],
      stats: { totalCourses: 0, totalLearners: 0, coursesCompleted: 0, successRate: 0 },
      testimonials: [],
      quickActions: [],
      upcoming: { events: [] },
      message: 'Error retrieving platform statistics',
      error: error.message
    });
  }
});

module.exports = router;
