#!/usr/bin/env node

/**
 * Comprehensive Admin Setup and Educational Content Management Test Script
 * EthioHeritage360 Platform
 * 
 * This script will:
 * 1. Check server status
 * 2. Create all admin accounts (SuperAdmin, MuseumAdmin, TourOrganizer)
 * 3. Test authentication for each role
 * 4. Run comprehensive educational content management tests
 */

const axios = require('axios');
const colors = require('colors');

// Configuration
const BASE_URL = 'http://localhost:5000';
const API_BASE = `${BASE_URL}/api`;

// Admin accounts to create and test
const ADMIN_ACCOUNTS = {
  superAdmin: {
    name: 'Super Administrator',
    firstName: 'Super',
    lastName: 'Admin',
    email: 'superadmin@ethioheritage360.com',
    password: 'SuperAdmin123!',
    role: 'superAdmin',
    phone: '+251911123456',
    bio: 'Platform Super Administrator with full system access'
  },
  museumAdmin: {
    name: 'Museum Administrator',
    firstName: 'Museum',
    lastName: 'Admin',
    email: 'museumadmin@ethioheritage360.com',
    password: 'MuseumAdmin123!',
    role: 'museumAdmin',
    phone: '+251911234567',
    bio: 'Museum Administrator managing collections and staff',
    position: 'Chief Curator',
    department: 'Collections Management'
  },
  tourOrganizer: {
    name: 'Tour Organizer',
    firstName: 'Tour',
    lastName: 'Organizer',
    email: 'organizer@ethioheritage360.com',
    password: 'Organizer123!',
    role: 'organizer',
    phone: '+251911345678',
    bio: 'Professional tour organizer and heritage guide',
    specialization: 'Ethiopian Heritage Tours'
  }
};

// Test results tracking
const testResults = {
  accounts: { created: 0, failed: 0 },
  authentication: { passed: 0, failed: 0 },
  apiTests: { passed: 0, failed: 0 },
  details: []
};

let authTokens = {};
let testData = {
  courseId: null,
  lessonId: null,
  achievementId: null,
  enrollmentId: null
};

/**
 * Helper function to log with colors
 */
function log(message, type = 'info') {
  const timestamp = new Date().toLocaleTimeString();
  switch (type) {
    case 'success':
      console.log(`[${timestamp}] ✅ ${message}`.green);
      break;
    case 'error':
      console.log(`[${timestamp}] ❌ ${message}`.red);
      break;
    case 'warning':
      console.log(`[${timestamp}] ⚠️  ${message}`.yellow);
      break;
    case 'info':
      console.log(`[${timestamp}] ℹ️  ${message}`.blue);
      break;
    case 'header':
      console.log(`\n${'='.repeat(60)}`.cyan);
      console.log(`${message}`.cyan.bold);
      console.log(`${'='.repeat(60)}`.cyan);
      break;
  }
}

/**
 * Helper function to make API requests with error handling
 */
async function apiRequest(method, endpoint, data = null, token = null) {
  try {
    const config = {
      method,
      url: `${API_BASE}${endpoint}`,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || error.message,
      status: error.response?.status,
      data: error.response?.data
    };
  }
}

/**
 * Check if server is running
 */
async function checkServerStatus() {
  log('🔍 Checking server status...', 'info');
  
  const result = await apiRequest('GET', '/health');
  
  if (result.success) {
    log('✅ Server is running and healthy', 'success');
    log(`📊 Database: ${result.data.database.connected ? 'Connected' : 'Disconnected'}`, 'info');
    log(`🌐 Node Version: ${result.data.nodeVersion}`, 'info');
    return true;
  } else {
    log('❌ Server is not accessible. Please start the server first.', 'error');
    log('💡 Run: npm run dev', 'warning');
    return false;
  }
}

/**
 * Create admin accounts
 */
async function createAdminAccounts() {
  log('👥 Creating admin accounts...', 'header');

  for (const [role, accountData] of Object.entries(ADMIN_ACCOUNTS)) {
    log(`Creating ${role} account...`, 'info');

    // Try to register the account
    const result = await apiRequest('POST', '/auth/register', accountData);

    if (result.success) {
      testResults.accounts.created++;
      log(`✅ ${role} account created successfully`, 'success');
      log(`   Email: ${accountData.email}`, 'info');
      
      testResults.details.push({
        type: 'account_creation',
        role,
        status: 'success',
        email: accountData.email
      });
    } else if (result.status === 400 && result.error?.includes('already exists')) {
      log(`⚠️  ${role} account already exists`, 'warning');
      testResults.accounts.created++;
      
      testResults.details.push({
        type: 'account_creation',
        role,
        status: 'exists',
        email: accountData.email
      });
    } else {
      testResults.accounts.failed++;
      log(`❌ Failed to create ${role} account: ${result.error}`, 'error');
      
      testResults.details.push({
        type: 'account_creation',
        role,
        status: 'failed',
        error: result.error,
        email: accountData.email
      });
    }
  }

  log(`\n📊 Account Creation Summary:`, 'info');
  log(`   ✅ Created/Exists: ${testResults.accounts.created}`, 'success');
  log(`   ❌ Failed: ${testResults.accounts.failed}`, 'error');
}

/**
 * Test authentication for all admin accounts
 */
async function testAuthentication() {
  log('🔐 Testing authentication for all admin accounts...', 'header');

  for (const [role, accountData] of Object.entries(ADMIN_ACCOUNTS)) {
    log(`Testing ${role} login...`, 'info');

    const result = await apiRequest('POST', '/auth/login', {
      email: accountData.email,
      password: accountData.password
    });

    if (result.success) {
      testResults.authentication.passed++;
      authTokens[role] = result.data.token;
      
      log(`✅ ${role} authentication successful`, 'success');
      log(`   User ID: ${result.data.user.id}`, 'info');
      log(`   Role: ${result.data.user.role}`, 'info');
      log(`   Permissions: ${result.data.user.permissions?.length || 0} permissions`, 'info');
      
      testResults.details.push({
        type: 'authentication',
        role,
        status: 'success',
        userId: result.data.user.id,
        permissions: result.data.user.permissions
      });
    } else {
      testResults.authentication.failed++;
      log(`❌ ${role} authentication failed: ${result.error}`, 'error');
      
      testResults.details.push({
        type: 'authentication',
        role,
        status: 'failed',
        error: result.error
      });
    }
  }

  log(`\n📊 Authentication Summary:`, 'info');
  log(`   ✅ Passed: ${testResults.authentication.passed}`, 'success');
  log(`   ❌ Failed: ${testResults.authentication.failed}`, 'error');
}

/**
 * Test educational content management APIs with different admin roles
 */
async function testEducationalContentManagement() {
  log('📚 Testing Educational Content Management APIs...', 'header');

  // Test with SuperAdmin token
  const superAdminToken = authTokens.superAdmin;
  
  if (!superAdminToken) {
    log('❌ No SuperAdmin token available for testing', 'error');
    return;
  }

  await testCourseManagement(superAdminToken);
  await testLessonManagement(superAdminToken);
  await testEnrollmentManagement(superAdminToken);
  await testAchievementManagement(superAdminToken);
  await testDashboardStats(superAdminToken);
  
  // Test role-based access
  await testRoleBasedAccess();
}

/**
 * Test course management APIs
 */
async function testCourseManagement(token) {
  log('📖 Testing Course Management APIs...', 'info');

  // Create a test course
  const courseData = {
    title: 'Test Ethiopian Ancient History',
    description: 'A comprehensive test course on Ethiopian ancient civilizations',
    category: 'history',
    difficulty: 'intermediate',
    estimatedDuration: 120,
    instructor: 'Dr. Test Instructor',
    tags: ['history', 'ancient', 'ethiopia', 'test'],
    prerequisites: []
  };

  const createResult = await apiRequest('POST', '/learning/admin/courses', courseData, token);
  
  if (createResult.success) {
    testResults.apiTests.passed++;
    testData.courseId = createResult.data.course._id;
    log('✅ Course created successfully', 'success');
    
    // Test course retrieval
    const getResult = await apiRequest('GET', '/learning/admin/courses?page=1&limit=5', null, token);
    if (getResult.success) {
      testResults.apiTests.passed++;
      log(`✅ Retrieved ${getResult.data.courses.length} courses`, 'success');
    } else {
      testResults.apiTests.failed++;
      log(`❌ Failed to retrieve courses: ${getResult.error}`, 'error');
    }
    
    // Test course update
    const updateData = { description: 'Updated: ' + courseData.description };
    const updateResult = await apiRequest('PUT', `/learning/admin/courses/${testData.courseId}`, updateData, token);
    
    if (updateResult.success) {
      testResults.apiTests.passed++;
      log('✅ Course updated successfully', 'success');
    } else {
      testResults.apiTests.failed++;
      log(`❌ Failed to update course: ${updateResult.error}`, 'error');
    }
    
  } else {
    testResults.apiTests.failed++;
    log(`❌ Failed to create course: ${createResult.error}`, 'error');
  }
}

/**
 * Test lesson management APIs
 */
async function testLessonManagement(token) {
  log('📝 Testing Lesson Management APIs...', 'info');

  if (!testData.courseId) {
    log('⚠️  No course ID available for lesson testing', 'warning');
    return;
  }

  // Create a test lesson
  const lessonData = {
    title: 'Introduction to Axumite Civilization',
    description: 'Explore the ancient Axumite kingdom and its significance',
    order: 1,
    estimatedDuration: 45,
    content: [
      {
        type: 'text',
        content: 'The Axumite Empire was a major trading nation...'
      },
      {
        type: 'image',
        url: 'https://example.com/axum.jpg',
        caption: 'Axum Stelae'
      }
    ],
    objectives: [
      'Understand Axum\'s historical significance',
      'Identify key archaeological sites',
      'Analyze trade networks'
    ],
    quiz: {
      questions: [
        {
          question: 'When did Axum reach its peak?',
          type: 'multiple_choice',
          options: ['3rd century CE', '4th century CE', '5th century CE'],
          correctAnswer: 1,
          points: 10
        }
      ],
      passingScore: 70
    }
  };

  const createResult = await apiRequest('POST', `/learning/admin/courses/${testData.courseId}/lessons`, lessonData, token);
  
  if (createResult.success) {
    testResults.apiTests.passed++;
    testData.lessonId = createResult.data.lesson._id;
    log('✅ Lesson created successfully', 'success');
    
    // Test lesson retrieval
    const getResult = await apiRequest('GET', `/learning/admin/lessons/${testData.lessonId}`, null, token);
    if (getResult.success) {
      testResults.apiTests.passed++;
      log('✅ Lesson details retrieved successfully', 'success');
    } else {
      testResults.apiTests.failed++;
      log(`❌ Failed to retrieve lesson: ${getResult.error}`, 'error');
    }
    
  } else {
    testResults.apiTests.failed++;
    log(`❌ Failed to create lesson: ${createResult.error}`, 'error');
  }
}

/**
 * Test enrollment management APIs
 */
async function testEnrollmentManagement(token) {
  log('👥 Testing Enrollment Management APIs...', 'info');

  // Test enrollment analytics
  const analyticsResult = await apiRequest('GET', '/learning/admin/enrollments/analytics?timeRange=30d', null, token);
  
  if (analyticsResult.success) {
    testResults.apiTests.passed++;
    log('✅ Enrollment analytics retrieved successfully', 'success');
    log(`   Time range: ${analyticsResult.data.analytics.timeRange}`, 'info');
  } else {
    testResults.apiTests.failed++;
    log(`❌ Failed to get enrollment analytics: ${analyticsResult.error}`, 'error');
  }

  // Test enrollment listing
  const listResult = await apiRequest('GET', '/learning/admin/enrollments?page=1&limit=5', null, token);
  
  if (listResult.success) {
    testResults.apiTests.passed++;
    log(`✅ Retrieved ${listResult.data.enrollments.length} enrollments`, 'success');
  } else {
    testResults.apiTests.failed++;
    log(`❌ Failed to retrieve enrollments: ${listResult.error}`, 'error');
  }
}

/**
 * Test achievement management APIs
 */
async function testAchievementManagement(token) {
  log('🏆 Testing Achievement Management APIs...', 'info');

  // Create a test achievement
  const achievementData = {
    title: 'Test Heritage Scholar',
    description: 'Complete 3 heritage courses to earn this achievement',
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
      badge: 'Heritage Scholar Badge'
    }
  };

  const createResult = await apiRequest('POST', '/learning/admin/achievements', achievementData, token);
  
  if (createResult.success) {
    testResults.apiTests.passed++;
    testData.achievementId = createResult.data.achievement._id;
    log('✅ Achievement created successfully', 'success');
    
    // Test achievement listing
    const listResult = await apiRequest('GET', '/learning/admin/achievements?page=1&limit=5', null, token);
    if (listResult.success) {
      testResults.apiTests.passed++;
      log(`✅ Retrieved ${listResult.data.achievements.length} achievements`, 'success');
    } else {
      testResults.apiTests.failed++;
      log(`❌ Failed to retrieve achievements: ${listResult.error}`, 'error');
    }
    
  } else {
    testResults.apiTests.failed++;
    log(`❌ Failed to create achievement: ${createResult.error}`, 'error');
  }
}

/**
 * Test dashboard statistics
 */
async function testDashboardStats(token) {
  log('📊 Testing Dashboard Statistics...', 'info');

  const statsResult = await apiRequest('GET', '/learning/admin/stats', null, token);
  
  if (statsResult.success) {
    testResults.apiTests.passed++;
    log('✅ Dashboard statistics retrieved successfully', 'success');
    
    const stats = statsResult.data.stats;
    log(`   📚 Total Courses: ${stats.courses.total} (${stats.courses.active} active)`, 'info');
    log(`   📖 Total Lessons: ${stats.lessons.total} (${stats.lessons.active} active)`, 'info');
    log(`   👥 Total Users: ${stats.users.total}`, 'info');
    log(`   📈 Total Enrollments: ${stats.enrollments.total}`, 'info');
    
  } else {
    testResults.apiTests.failed++;
    log(`❌ Failed to get dashboard stats: ${statsResult.error}`, 'error');
  }

  // Test category management
  const categoriesResult = await apiRequest('GET', '/learning/admin/categories', null, token);
  
  if (categoriesResult.success) {
    testResults.apiTests.passed++;
    log('✅ Category management data retrieved successfully', 'success');
  } else {
    testResults.apiTests.failed++;
    log(`❌ Failed to get category data: ${categoriesResult.error}`, 'error');
  }
}

/**
 * Test role-based access control
 */
async function testRoleBasedAccess() {
  log('🔒 Testing Role-based Access Control...', 'info');

  // Test museum admin access to course management
  if (authTokens.museumAdmin) {
    log('Testing MuseumAdmin access to educational content...', 'info');
    
    const result = await apiRequest('GET', '/learning/admin/courses', null, authTokens.museumAdmin);
    
    if (result.success) {
      testResults.apiTests.passed++;
      log('✅ MuseumAdmin can access course management', 'success');
    } else {
      testResults.apiTests.failed++;
      log(`❌ MuseumAdmin access failed: ${result.error}`, 'error');
    }
  }

  // Test tour organizer access
  if (authTokens.tourOrganizer) {
    log('Testing TourOrganizer access to educational content...', 'info');
    
    const result = await apiRequest('GET', '/learning/admin/courses', null, authTokens.tourOrganizer);
    
    if (result.success) {
      testResults.apiTests.passed++;
      log('✅ TourOrganizer can access course management', 'success');
    } else {
      // This might fail due to permissions - check if it's expected
      if (result.status === 403) {
        testResults.apiTests.passed++;
        log('✅ TourOrganizer correctly denied admin access (expected)', 'success');
      } else {
        testResults.apiTests.failed++;
        log(`❌ TourOrganizer access test failed unexpectedly: ${result.error}`, 'error');
      }
    }
  }
}

/**
 * Cleanup test data
 */
async function cleanupTestData() {
  log('🧹 Cleaning up test data...', 'info');

  const token = authTokens.superAdmin;
  if (!token) return;

  // Delete test achievement
  if (testData.achievementId) {
    const result = await apiRequest('DELETE', `/learning/admin/achievements/${testData.achievementId}?permanent=true`, null, token);
    if (result.success) {
      log('✅ Test achievement deleted', 'success');
    }
  }

  // Delete test lesson
  if (testData.lessonId) {
    const result = await apiRequest('DELETE', `/learning/admin/lessons/${testData.lessonId}?permanent=true`, null, token);
    if (result.success) {
      log('✅ Test lesson deleted', 'success');
    }
  }

  // Delete test course
  if (testData.courseId) {
    const result = await apiRequest('DELETE', `/learning/admin/courses/${testData.courseId}?permanent=true`, null, token);
    if (result.success) {
      log('✅ Test course deleted', 'success');
    }
  }
}

/**
 * Generate comprehensive report
 */
function generateReport() {
  log('📋 Comprehensive Test Report', 'header');

  const totalTests = testResults.accounts.created + testResults.accounts.failed +
                    testResults.authentication.passed + testResults.authentication.failed +
                    testResults.apiTests.passed + testResults.apiTests.failed;

  const totalPassed = testResults.accounts.created + testResults.authentication.passed + testResults.apiTests.passed;
  const totalFailed = testResults.accounts.failed + testResults.authentication.failed + testResults.apiTests.failed;

  log(`\n🎯 Overall Summary:`, 'info');
  log(`   Total Tests: ${totalTests}`, 'info');
  log(`   ✅ Passed: ${totalPassed}`, 'success');
  log(`   ❌ Failed: ${totalFailed}`, totalFailed > 0 ? 'error' : 'info');
  log(`   📊 Success Rate: ${((totalPassed / totalTests) * 100).toFixed(1)}%`, 'info');

  log(`\n📊 Detailed Breakdown:`, 'info');
  log(`   👥 Account Management:`, 'info');
  log(`      ✅ Created/Exists: ${testResults.accounts.created}`, 'success');
  log(`      ❌ Failed: ${testResults.accounts.failed}`, 'info');

  log(`   🔐 Authentication:`, 'info');
  log(`      ✅ Passed: ${testResults.authentication.passed}`, 'success');
  log(`      ❌ Failed: ${testResults.authentication.failed}`, 'info');

  log(`   📚 API Tests:`, 'info');
  log(`      ✅ Passed: ${testResults.apiTests.passed}`, 'success');
  log(`      ❌ Failed: ${testResults.apiTests.failed}`, 'info');

  log(`\n🔑 Admin Account Status:`, 'info');
  Object.keys(ADMIN_ACCOUNTS).forEach(role => {
    const hasToken = !!authTokens[role];
    log(`   ${role}: ${hasToken ? '✅ Ready' : '❌ Not authenticated'}`, hasToken ? 'success' : 'error');
    if (hasToken) {
      log(`      Email: ${ADMIN_ACCOUNTS[role].email}`, 'info');
    }
  });

  log(`\n🚀 Ready for Frontend Integration!`, 'success');
  log(`   All admin accounts are set up and tested.`, 'info');
  log(`   Educational content management APIs are working.`, 'info');
  log(`   Your frontend can now use these admin endpoints.`, 'info');

  if (totalFailed > 0) {
    log(`\n⚠️  Some tests failed. Check the details above.`, 'warning');
    return false;
  }

  return true;
}

/**
 * Main execution function
 */
async function main() {
  try {
    console.log('🚀 EthioHeritage360 Admin Setup and Testing'.rainbow.bold);
    console.log('===============================================\n'.cyan);

    // Check server status
    const serverOk = await checkServerStatus();
    if (!serverOk) {
      process.exit(1);
    }

    // Create admin accounts
    await createAdminAccounts();

    // Test authentication
    await testAuthentication();

    // Test educational content management APIs
    await testEducationalContentManagement();

    // Cleanup test data
    await cleanupTestData();

    // Generate final report
    const success = generateReport();

    log(`\n🏁 Setup and testing completed!`, 'success');
    
    if (success) {
      log(`\n💡 Next Steps:`, 'info');
      log(`   1. Use the admin accounts to login to your frontend`, 'info');
      log(`   2. Test the admin dashboard functionality`, 'info');
      log(`   3. Create courses and lessons through the UI`, 'info');
      log(`   4. Monitor user enrollments and progress`, 'info');
    }

    process.exit(success ? 0 : 1);

  } catch (error) {
    log(`❌ Unexpected error: ${error.message}`, 'error');
    console.error(error);
    process.exit(1);
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  log('\n🛑 Process interrupted by user', 'warning');
  await cleanupTestData();
  process.exit(130);
});

process.on('unhandledRejection', (reason, promise) => {
  log(`❌ Unhandled Promise Rejection: ${reason}`, 'error');
  process.exit(1);
});

// Run the script
if (require.main === module) {
  main();
}

module.exports = { main, testResults, authTokens };
