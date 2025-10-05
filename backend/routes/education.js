const express = require('express');
const router = express.Router();

// Basic education routes to prevent server startup errors
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Education API endpoint',
    data: []
  });
});

router.get('/courses', (req, res) => {
  res.json({
    success: true,
    message: 'Education courses',
    data: []
  });
});

// Public route to get limited course info (for homepage and course listing)
router.get('/public/courses', async (req, res) => {
  try {
    const { category, limit = 6, page = 1 } = req.query;

    // Mock course data for now
    const mockCourses = [
      {
        id: '1',
        title: 'Ethiopian Heritage Basics',
        description: 'Learn about the rich cultural heritage of Ethiopia, from ancient kingdoms to modern traditions.',
        category: 'heritage',
        difficulty: 'beginner',
        duration: 4,
        enrolledStudents: 1247,
        price: 0,
        instructor: 'Heritage Expert',
        rating: 4.8,
        totalLessons: 12,
        image: '/images/course-placeholder.jpg',
        completionRate: 92,
        isSuperAdminCourse: true
      },
      {
        id: '2',
        title: 'Ancient Ethiopian Kingdoms',
        description: 'Explore the fascinating history of Aksum, Zagwe dynasty, and the Ethiopian Empire.',
        category: 'history',
        difficulty: 'intermediate',
        duration: 6,
        enrolledStudents: 892,
        price: 0,
        instructor: 'History Scholar',
        rating: 4.7,
        totalLessons: 18,
        image: '/images/course-placeholder.jpg',
        completionRate: 87,
        isSuperAdminCourse: true
      },
      {
        id: '3',
        title: 'Ethiopian Art and Crafts',
        description: 'Discover traditional Ethiopian art forms, from church paintings to contemporary crafts.',
        category: 'culture',
        difficulty: 'beginner',
        duration: 3,
        enrolledStudents: 634,
        price: 0,
        instructor: 'Cultural Expert',
        rating: 4.9,
        totalLessons: 10,
        image: '/images/course-placeholder.jpg',
        completionRate: 95,
        isSuperAdminCourse: false
      },
      {
        id: '4',
        title: 'Rock-Hewn Churches of Lalibela',
        description: 'Deep dive into the architectural marvels and spiritual significance of Lalibela churches.',
        category: 'heritage',
        difficulty: 'advanced',
        duration: 5,
        enrolledStudents: 456,
        price: 0,
        instructor: 'Architecture Specialist',
        rating: 4.8,
        totalLessons: 15,
        image: '/images/course-placeholder.jpg',
        completionRate: 89,
        isSuperAdminCourse: true
      },
      {
        id: '5',
        title: 'Ethiopian Languages & Scripts',
        description: 'Learn about Ge\'ez, Amharic, and other Ethiopian languages and their unique scripts.',
        category: 'language',
        difficulty: 'intermediate',
        duration: 4,
        enrolledStudents: 378,
        price: 0,
        instructor: 'Linguist',
        rating: 4.6,
        totalLessons: 14,
        image: '/images/course-placeholder.jpg',
        completionRate: 85,
        isSuperAdminCourse: false
      },
      {
        id: '6',
        title: 'Ethiopian Coffee Culture',
        description: 'Explore the birthplace of coffee and its deep cultural significance in Ethiopian society.',
        category: 'culture',
        difficulty: 'beginner',
        duration: 2,
        enrolledStudents: 1156,
        price: 0,
        instructor: 'Cultural Historian',
        rating: 4.9,
        totalLessons: 8,
        image: '/images/course-placeholder.jpg',
        completionRate: 96,
        isSuperAdminCourse: false
      }
    ];

    // Filter by category if provided
    let filteredCourses = mockCourses;
    if (category && category !== 'all') {
      filteredCourses = mockCourses.filter(course => course.category === category);
    }

    // Prioritize super admin courses first, then sort by enrollment count
    filteredCourses.sort((a, b) => {
      if (a.isSuperAdminCourse && !b.isSuperAdminCourse) return -1;
      if (!a.isSuperAdminCourse && b.isSuperAdminCourse) return 1;
      return b.enrolledStudents - a.enrolledStudents;
    });

    // Apply pagination
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const paginatedCourses = filteredCourses.slice(startIndex, startIndex + parseInt(limit));

    res.json({
      success: true,
      data: paginatedCourses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: paginatedCourses.length,
        totalCount: filteredCourses.length
      }
    });
  } catch (error) {
    console.error('Get public courses error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
