/**
 * Comprehensive Testing Suite for Educational Content Management APIs
 * EthioHeritage360 Platform
 * 
 * This test suite verifies all CRUD operations for the educational content management system
 */

const axios = require('axios');
const assert = require('assert');

// Configuration
const BASE_URL = 'http://localhost:5000/api/learning';
const ADMIN_EMAIL = 'admin@ethioheritage360.com';
const ADMIN_PASSWORD = 'admin123';

let authToken = '';
let testCourseId = '';
let testLessonId = '';
let testUserId = '';
let testEnrollmentId = '';
let testAchievementId = '';
let testCertificateId = '';

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  details: []
};

/**
 * Helper function to log test results
 */
function logTest(testName, success, error = null) {
  if (success) {
    testResults.passed++;
    console.log(`✅ ${testName}`);
    testResults.details.push({ test: testName, status: 'PASS' });
  } else {
    testResults.failed++;
    console.log(`❌ ${testName}`);
    console.log(`   Error: ${error?.message || error}`);
    testResults.details.push({ test: testName, status: 'FAIL', error: error?.message || error });
  }
}

/**
 * Helper function to make authenticated API requests
 */
async function apiRequest(method, url, data = null) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${url}`,
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
}

/**
 * Authentication Setup
 */
async function authenticate() {
  try {
    console.log('🔐 Authenticating admin user...');
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });

    if (response.data.token) {
      authToken = response.data.token;
      testUserId = response.data.user.id;
      console.log('✅ Authentication successful');
      return true;
    } else {
      console.log('❌ Authentication failed - no token received');
      return false;
    }
  } catch (error) {
    console.log('❌ Authentication failed:', error.message);
    
    // Try to create admin user if login fails
    try {
      console.log('🔐 Attempting to create admin user...');
      const createResponse = await axios.post('http://localhost:5000/api/auth/register', {
        name: 'Test Admin',
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        role: 'admin'
      });

      if (createResponse.data.token) {
        authToken = createResponse.data.token;
        testUserId = createResponse.data.user.id;
        console.log('✅ Admin user created and authenticated');
        return true;
      }
    } catch (createError) {
      console.log('❌ Failed to create admin user:', createError.message);
    }

    return false;
  }
}

/**
 * Test Course Management APIs
 */
async function testCourseManagement() {
  console.log('\n📚 Testing Course Management APIs...');

  // Test Create Course
  try {
    const courseData = {
      title: 'Test Ethiopian Ancient Civilizations',
      description: 'A comprehensive test course exploring the rich ancient civilizations of Ethiopia, from Axum to Lalibela.',
      category: 'history',
      difficulty: 'intermediate',
      estimatedDuration: 120,
      instructor: 'Dr. Test Instructor',
      tags: ['history', 'ancient', 'civilization', 'ethiopia'],
      prerequisites: ['Basic Ethiopian History']
    };

    const createResponse = await apiRequest('POST', '/admin/courses', courseData);
    assert(createResponse.success, 'Course creation should succeed');
    assert(createResponse.course._id, 'Course should have an ID');
    testCourseId = createResponse.course._id;
    
    logTest('Create Course', true);
  } catch (error) {
    logTest('Create Course', false, error);
  }

  // Test Get All Courses
  try {
    const coursesResponse = await apiRequest('GET', '/admin/courses?page=1&limit=10');
    assert(coursesResponse.success, 'Get courses should succeed');
    assert(Array.isArray(coursesResponse.courses), 'Should return courses array');
    assert(coursesResponse.pagination, 'Should include pagination');
    
    logTest('Get All Courses', true);
  } catch (error) {
    logTest('Get All Courses', false, error);
  }

  // Test Update Course
  try {
    const updateData = {
      description: 'Updated: A comprehensive test course exploring Ethiopian ancient civilizations.',
      tags: ['history', 'ancient', 'civilization', 'ethiopia', 'updated']
    };

    const updateResponse = await apiRequest('PUT', `/admin/courses/${testCourseId}`, updateData);
    assert(updateResponse.success, 'Course update should succeed');
    assert(updateResponse.course.description.includes('Updated'), 'Course description should be updated');
    
    logTest('Update Course', true);
  } catch (error) {
    logTest('Update Course', false, error);
  }

  // Test Search Courses
  try {
    const searchResponse = await apiRequest('GET', '/admin/courses?search=Test Ethiopian&category=history');
    assert(searchResponse.success, 'Course search should succeed');
    assert(searchResponse.courses.length > 0, 'Should find matching courses');
    
    logTest('Search Courses', true);
  } catch (error) {
    logTest('Search Courses', false, error);
  }
}

/**
 * Test Lesson Management APIs
 */
async function testLessonManagement() {
  console.log('\n📖 Testing Lesson Management APIs...');

  // Test Create Lesson
  try {
    const lessonData = {
      title: 'Introduction to Axumite Civilization',
      description: 'Explore the ancient Axumite kingdom, its trade networks, and cultural significance.',
      order: 1,
      estimatedDuration: 45,
      content: [
        {
          type: 'text',
          content: 'The Axumite Empire was a major trading nation in northeastern Africa...'
        },
        {
          type: 'image',
          url: 'https://example.com/axum-stelae.jpg',
          caption: 'The famous Axum Stelae'
        }
      ],
      objectives: [
        'Understand the historical significance of Axum',
        'Identify key archaeological findings',
        'Analyze trade relationships'
      ],
      quiz: {
        questions: [
          {
            question: 'In which century did the Axumite Empire reach its peak?',
            type: 'multiple_choice',
            options: ['3rd century CE', '4th century CE', '5th century CE', '6th century CE'],
            correctAnswer: 1,
            points: 10
          }
        ],
        passingScore: 70
      }
    };

    const createResponse = await apiRequest('POST', `/admin/courses/${testCourseId}/lessons`, lessonData);
    assert(createResponse.success, 'Lesson creation should succeed');
    assert(createResponse.lesson._id, 'Lesson should have an ID');
    testLessonId = createResponse.lesson._id;
    
    logTest('Create Lesson', true);
  } catch (error) {
    logTest('Create Lesson', false, error);
  }

  // Test Get All Lessons
  try {
    const lessonsResponse = await apiRequest('GET', '/admin/lessons?courseId=' + testCourseId);
    assert(lessonsResponse.success, 'Get lessons should succeed');
    assert(Array.isArray(lessonsResponse.lessons), 'Should return lessons array');
    
    logTest('Get All Lessons', true);
  } catch (error) {
    logTest('Get All Lessons', false, error);
  }

  // Test Get Single Lesson
  try {
    const lessonResponse = await apiRequest('GET', `/admin/lessons/${testLessonId}`);
    assert(lessonResponse.success, 'Get lesson details should succeed');
    assert(lessonResponse.lesson._id === testLessonId, 'Should return correct lesson');
    assert(lessonResponse.lesson.stats, 'Should include lesson statistics');
    
    logTest('Get Single Lesson Details', true);
  } catch (error) {
    logTest('Get Single Lesson Details', false, error);
  }

  // Test Update Lesson
  try {
    const updateData = {
      description: 'Updated: Explore the ancient Axumite kingdom and its lasting legacy.',
      estimatedDuration: 50
    };

    const updateResponse = await apiRequest('PUT', `/admin/lessons/${testLessonId}`, updateData);
    assert(updateResponse.success, 'Lesson update should succeed');
    assert(updateResponse.lesson.estimatedDuration === 50, 'Duration should be updated');
    
    logTest('Update Lesson', true);
  } catch (error) {
    logTest('Update Lesson', false, error);
  }

  // Test Reorder Lessons
  try {
    const reorderData = {
      lessonOrders: [
        {
          lessonId: testLessonId,
          newOrder: 1
        }
      ]
    };

    const reorderResponse = await apiRequest('PATCH', `/admin/courses/${testCourseId}/lessons/reorder`, reorderData);
    assert(reorderResponse.success, 'Lesson reordering should succeed');
    
    logTest('Reorder Lessons', true);
  } catch (error) {
    logTest('Reorder Lessons', false, error);
  }

  // Test Bulk Lesson Operations
  try {
    const bulkData = {
      lessonIds: [testLessonId],
      operation: 'update',
      updateData: {
        isActive: true
      }
    };

    const bulkResponse = await apiRequest('PATCH', '/admin/lessons/bulk', bulkData);
    assert(bulkResponse.success, 'Bulk lesson operations should succeed');
    
    logTest('Bulk Lesson Operations', true);
  } catch (error) {
    logTest('Bulk Lesson Operations', false, error);
  }
}

/**
 * Test Enrollment Management APIs
 */
async function testEnrollmentManagement() {
  console.log('\n👥 Testing Enrollment Management APIs...');

  // Create a test enrollment first
  try {
    const enrollmentData = {
      operation: 'enroll',
      userIds: [testUserId],
      courseIds: [testCourseId]
    };

    const enrollResponse = await apiRequest('PATCH', '/admin/enrollments/bulk', enrollmentData);
    assert(enrollResponse.success, 'Test enrollment should succeed');
    
    logTest('Create Test Enrollment', true);
  } catch (error) {
    logTest('Create Test Enrollment', false, error);
  }

  // Test Get All Enrollments
  try {
    const enrollmentsResponse = await apiRequest('GET', '/admin/enrollments?page=1&limit=10');
    assert(enrollmentsResponse.success, 'Get enrollments should succeed');
    assert(Array.isArray(enrollmentsResponse.enrollments), 'Should return enrollments array');
    
    if (enrollmentsResponse.enrollments.length > 0) {
      testEnrollmentId = enrollmentsResponse.enrollments[0].enrollmentId;
    }
    
    logTest('Get All Enrollments', true);
  } catch (error) {
    logTest('Get All Enrollments', false, error);
  }

  // Test Enrollment Analytics
  try {
    const analyticsResponse = await apiRequest('GET', '/admin/enrollments/analytics?timeRange=30d');
    assert(analyticsResponse.success, 'Enrollment analytics should succeed');
    assert(analyticsResponse.analytics, 'Should return analytics data');
    assert(analyticsResponse.analytics.timeRange === '30d', 'Should respect time range parameter');
    
    logTest('Get Enrollment Analytics', true);
  } catch (error) {
    logTest('Get Enrollment Analytics', false, error);
  }

  // Test Get Specific Enrollment Details
  try {
    const detailsResponse = await apiRequest('GET', `/admin/enrollments/${testUserId}/${testCourseId}`);
    assert(detailsResponse.success, 'Get enrollment details should succeed');
    assert(detailsResponse.enrollment, 'Should return enrollment details');
    
    logTest('Get Enrollment Details', true);
  } catch (error) {
    logTest('Get Enrollment Details', false, error);
  }

  // Test Bulk Enrollment Status Change
  try {
    if (testEnrollmentId) {
      const statusData = {
        operation: 'changeStatus',
        enrollmentIds: [testEnrollmentId],
        newStatus: 'in_progress'
      };

      const statusResponse = await apiRequest('PATCH', '/admin/enrollments/bulk', statusData);
      assert(statusResponse.success, 'Bulk status change should succeed');
      
      logTest('Change Enrollment Status', true);
    } else {
      logTest('Change Enrollment Status', false, 'No enrollment ID available');
    }
  } catch (error) {
    logTest('Change Enrollment Status', false, error);
  }
}

/**
 * Test Achievement Management APIs
 */
async function testAchievementManagement() {
  console.log('\n🏆 Testing Achievement Management APIs...');

  // Test Create Achievement
  try {
    const achievementData = {
      title: 'Test Heritage Explorer',
      description: 'Complete 3 heritage-related test courses',
      type: 'course_completion',
      category: 'heritage',
      difficulty: 'intermediate',
      criteria: {
        type: 'course_completion',
        requiredCount: 3,
        categoryFilter: 'heritage'
      },
      reward: {
        points: 100,
        badge: 'Heritage Explorer Badge',
        certificate: false
      }
    };

    const createResponse = await apiRequest('POST', '/admin/achievements', achievementData);
    assert(createResponse.success, 'Achievement creation should succeed');
    assert(createResponse.achievement._id, 'Achievement should have an ID');
    testAchievementId = createResponse.achievement._id;
    
    logTest('Create Achievement', true);
  } catch (error) {
    logTest('Create Achievement', false, error);
  }

  // Test Get All Achievements
  try {
    const achievementsResponse = await apiRequest('GET', '/admin/achievements?page=1&limit=10');
    assert(achievementsResponse.success, 'Get achievements should succeed');
    assert(Array.isArray(achievementsResponse.achievements), 'Should return achievements array');
    
    logTest('Get All Achievements', true);
  } catch (error) {
    logTest('Get All Achievements', false, error);
  }

  // Test Update Achievement
  try {
    const updateData = {
      description: 'Updated: Complete 3 heritage-related test courses and unlock special content',
      difficulty: 'advanced'
    };

    const updateResponse = await apiRequest('PUT', `/admin/achievements/${testAchievementId}`, updateData);
    assert(updateResponse.success, 'Achievement update should succeed');
    assert(updateResponse.achievement.difficulty === 'advanced', 'Difficulty should be updated');
    
    logTest('Update Achievement', true);
  } catch (error) {
    logTest('Update Achievement', false, error);
  }

  // Test Search Achievements
  try {
    const searchResponse = await apiRequest('GET', '/admin/achievements?search=Test Heritage&category=heritage');
    assert(searchResponse.success, 'Achievement search should succeed');
    
    logTest('Search Achievements', true);
  } catch (error) {
    logTest('Search Achievements', false, error);
  }
}

/**
 * Test Certificate Management APIs
 */
async function testCertificateManagement() {
  console.log('\n📜 Testing Certificate Management APIs...');

  // Test Get All Certificates
  try {
    const certificatesResponse = await apiRequest('GET', '/admin/certificates?page=1&limit=10');
    assert(certificatesResponse.success, 'Get certificates should succeed');
    assert(Array.isArray(certificatesResponse.certificates), 'Should return certificates array');
    
    if (certificatesResponse.certificates.length > 0) {
      testCertificateId = certificatesResponse.certificates[0]._id;
    }
    
    logTest('Get All Certificates', true);
  } catch (error) {
    logTest('Get All Certificates', false, error);
  }

  // Test Certificate Search
  try {
    const searchResponse = await apiRequest('GET', '/admin/certificates?search=test&status=active');
    assert(searchResponse.success, 'Certificate search should succeed');
    
    logTest('Search Certificates', true);
  } catch (error) {
    logTest('Search Certificates', false, error);
  }

  // Test Certificate Operations (only if we have a certificate)
  if (testCertificateId) {
    // Test Revoke Certificate
    try {
      const revokeData = {
        reason: 'Testing certificate revocation functionality'
      };

      const revokeResponse = await apiRequest('PATCH', `/admin/certificates/${testCertificateId}/revoke`, revokeData);
      assert(revokeResponse.success, 'Certificate revocation should succeed');
      
      logTest('Revoke Certificate', true);
    } catch (error) {
      logTest('Revoke Certificate', false, error);
    }

    // Test Regenerate Certificate
    try {
      const regenerateResponse = await apiRequest('PATCH', `/admin/certificates/${testCertificateId}/regenerate`);
      assert(regenerateResponse.success, 'Certificate regeneration should succeed');
      
      logTest('Regenerate Certificate', true);
    } catch (error) {
      logTest('Regenerate Certificate', false, error);
    }
  } else {
    logTest('Revoke Certificate', false, 'No certificate available for testing');
    logTest('Regenerate Certificate', false, 'No certificate available for testing');
  }
}

/**
 * Test Category Management APIs
 */
async function testCategoryManagement() {
  console.log('\n📊 Testing Category Management APIs...');

  // Test Get Category Management Data
  try {
    const categoriesResponse = await apiRequest('GET', '/admin/categories');
    assert(categoriesResponse.success, 'Get categories should succeed');
    assert(categoriesResponse.categories, 'Should return categories data');
    assert(categoriesResponse.categories.courses, 'Should include course categories');
    
    logTest('Get Category Management Data', true);
  } catch (error) {
    logTest('Get Category Management Data', false, error);
  }
}

/**
 * Test Dashboard Statistics API
 */
async function testDashboardStatistics() {
  console.log('\n📈 Testing Dashboard Statistics APIs...');

  // Test Get Admin Statistics
  try {
    const statsResponse = await apiRequest('GET', '/admin/stats');
    assert(statsResponse.success, 'Get admin stats should succeed');
    assert(statsResponse.stats, 'Should return statistics');
    assert(statsResponse.stats.courses, 'Should include course statistics');
    assert(statsResponse.stats.lessons, 'Should include lesson statistics');
    assert(statsResponse.stats.enrollments, 'Should include enrollment statistics');
    
    logTest('Get Admin Statistics', true);
  } catch (error) {
    logTest('Get Admin Statistics', false, error);
  }
}

/**
 * Cleanup Test Data
 */
async function cleanupTestData() {
  console.log('\n🧹 Cleaning up test data...');

  // Delete test achievement
  if (testAchievementId) {
    try {
      await apiRequest('DELETE', `/admin/achievements/${testAchievementId}?permanent=true`);
      logTest('Delete Test Achievement', true);
    } catch (error) {
      logTest('Delete Test Achievement', false, error);
    }
  }

  // Delete test lesson
  if (testLessonId) {
    try {
      await apiRequest('DELETE', `/admin/lessons/${testLessonId}?permanent=true`);
      logTest('Delete Test Lesson', true);
    } catch (error) {
      logTest('Delete Test Lesson', false, error);
    }
  }

  // Delete test course
  if (testCourseId) {
    try {
      await apiRequest('DELETE', `/admin/courses/${testCourseId}?permanent=true`);
      logTest('Delete Test Course', true);
    } catch (error) {
      logTest('Delete Test Course', false, error);
    }
  }
}

/**
 * Main Test Runner
 */
async function runTests() {
  console.log('🚀 Starting Educational Content Management API Tests...');
  console.log('=' .repeat(60));

  // Authenticate first
  const authSuccess = await authenticate();
  if (!authSuccess) {
    console.log('❌ Authentication failed. Stopping tests.');
    return;
  }

  // Run all test suites
  await testCourseManagement();
  await testLessonManagement();
  await testEnrollmentManagement();
  await testAchievementManagement();
  await testCertificateManagement();
  await testCategoryManagement();
  await testDashboardStatistics();

  // Cleanup
  await cleanupTestData();

  // Print test summary
  console.log('\n' + '=' .repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('=' .repeat(60));
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Total: ${testResults.passed + testResults.failed}`);
  console.log(`🎯 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);

  if (testResults.failed > 0) {
    console.log('\n❌ Failed Tests:');
    testResults.details
      .filter(test => test.status === 'FAIL')
      .forEach(test => console.log(`   - ${test.test}: ${test.error}`));
  }

  console.log('\n🏁 Test execution completed!');

  // Exit with appropriate code
  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Handle uncaught errors
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Run tests if this file is executed directly
if (require.main === module) {
  runTests();
}

module.exports = {
  runTests,
  testResults
};
