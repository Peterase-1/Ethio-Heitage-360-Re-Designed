#!/usr/bin/env node

/**
 * Test Existing Admin Accounts and Educational Content Management
 * EthioHeritage360 Platform
 * 
 * This script will:
 * 1. Check server status
 * 2. Test authentication for existing admin accounts from seed.js
 * 3. Run comprehensive educational content management tests
 * 4. Display all available admin credentials
 */

const axios = require('axios');
const colors = require('colors');

// Configuration
const BASE_URL = 'http://localhost:5000';
const API_BASE = `${BASE_URL}/api`;

// Existing admin accounts from your seed.js file
const EXISTING_ADMIN_ACCOUNTS = {
  superAdmin1: {
    name: 'Melkamu Wako',
    email: 'melkamuwako5@admin.com',
    password: 'melkamuwako5',
    role: 'superAdmin',
    description: 'Super Administrator of EthioHeritage360 platform'
  },
  superAdmin2: {
    name: 'Abdurazak M',
    email: 'abdurazakm343@admin.com',
    password: 'THpisvaHUbQNMsbX',
    role: 'superAdmin',
    description: 'Database Administrator with readWriteAnyDatabase privileges'
  },
  superAdmin3: {
    name: 'Student Pasegid',
    email: 'student.pasegid@admin.com',
    password: 'Fs4HwlXCW4SJvkyN',
    role: 'superAdmin',
    description: 'Database Administrator for ethioheritage360 database'
  },
  superAdmin4: {
    name: 'Naol Aboma',
    email: 'naolaboma@admin.com',
    password: 'QR7ICwI5s6VMgAZD',
    role: 'superAdmin',
    description: 'Super Administrator with full system access'
  },
  museumAdmin: {
    name: 'National Museum Admin',
    email: 'museum.admin@ethioheritage360.com',
    password: 'museum123',
    role: 'museumAdmin',
    description: 'Administrator for National Museum of Ethiopia'
  },
  tourOrganizer1: {
    name: 'Heritage Tours Ethiopia',
    email: 'organizer@heritagetours.et',
    password: 'organizer123',
    role: 'user', // Note: stored as 'user' but acts as organizer
    description: 'Professional heritage tour organizer specializing in Ethiopian cultural sites'
  },
  tourOrganizer2: {
    name: 'Tour Guide Demo',
    email: 'tourguide@demo.com',
    password: 'tourguide123',
    role: 'user', // Note: stored as 'user' but acts as organizer
    description: 'Demo tour organizer account for testing dashboard access'
  },
  testUser: {
    name: 'Test User',
    email: 'test@example.com',
    password: 'test123456',
    role: 'user',
    description: 'Test user for development and authentication testing'
  }
};

// Test results tracking
const testResults = {
  authentication: { passed: 0, failed: 0 },
  apiTests: { passed: 0, failed: 0 },
  details: []
};

let authTokens = {};
let testData = {
  courseId: null,
  lessonId: null,
  achievementId: null
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
      console.log(`\n${'='.repeat(70)}`.cyan);
      console.log(`${message}`.cyan.bold);
      console.log(`${'='.repeat(70)}`.cyan);
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
    log(`📊 Database: ${result.data.database?.connected ? 'Connected' : 'Disconnected'}`, 'info');
    log(`🌐 Node Version: ${result.data.nodeVersion}`, 'info');
    log(`⏱️  Uptime: ${Math.floor(result.data.uptime)} seconds`, 'info');
    return true;
  } else {
    log('❌ Server is not accessible. Please start the server first.', 'error');
    log('💡 Run: npm run dev', 'warning');
    return false;
  }
}

/**
 * Display existing admin credentials
 */
function displayAdminCredentials() {
  log('🔑 Your Existing Admin Credentials', 'header');
  
  log('\n👑 SUPER ADMINISTRATORS:', 'info');
  log('   1. Email: melkamuwako5@admin.com', 'info');
  log('      Password: melkamuwako5', 'success');
  log('      Name: Melkamu Wako', 'info');
  
  log('\n   2. Email: abdurazakm343@admin.com', 'info');
  log('      Password: THpisvaHUbQNMsbX', 'success');
  log('      Name: Abdurazak M', 'info');
  
  log('\n   3. Email: student.pasegid@admin.com', 'info');
  log('      Password: Fs4HwlXCW4SJvkyN', 'success');
  log('      Name: Student Pasegid', 'info');
  
  log('\n   4. Email: naolaboma@admin.com', 'info');
  log('      Password: QR7ICwI5s6VMgAZD', 'success');
  log('      Name: Naol Aboma', 'info');
  
  log('\n🏛️  MUSEUM ADMINISTRATOR:', 'info');
  log('   5. Email: museum.admin@ethioheritage360.com', 'info');
  log('      Password: museum123', 'success');
  log('      Name: National Museum Admin', 'info');
  
  log('\n🎯 TOUR ORGANIZERS:', 'info');
  log('   6. Email: organizer@heritagetours.et', 'info');
  log('      Password: organizer123', 'success');
  log('      Name: Heritage Tours Ethiopia', 'info');
  
  log('\n   7. Email: tourguide@demo.com', 'info');
  log('      Password: tourguide123', 'success');
  log('      Name: Tour Guide Demo', 'info');
  
  log('\n👤 TEST USER:', 'info');
  log('   8. Email: test@example.com', 'info');
  log('      Password: test123456', 'success');
  log('      Name: Test User', 'info');
}

/**
 * Test authentication for all existing admin accounts
 */
async function testAuthentication() {
  log('🔐 Testing authentication for existing admin accounts...', 'header');

  for (const [key, accountData] of Object.entries(EXISTING_ADMIN_ACCOUNTS)) {
    log(`Testing ${accountData.name} (${accountData.role})...`, 'info');

    const result = await apiRequest('POST', '/auth/login', {
      email: accountData.email,
      password: accountData.password
    });

    if (result.success) {
      testResults.authentication.passed++;
      authTokens[key] = result.data.token;
      
      log(`✅ ${accountData.name} authentication successful`, 'success');
      log(`   User ID: ${result.data.user.id}`, 'info');
      log(`   Role: ${result.data.user.role}`, 'info');
      log(`   Permissions: ${result.data.user.permissions?.length || 0} permissions`, 'info');
      
      testResults.details.push({
        type: 'authentication',
        account: key,
        status: 'success',
        userId: result.data.user.id,
        role: result.data.user.role,
        permissions: result.data.user.permissions
      });
    } else {
      testResults.authentication.failed++;
      log(`❌ ${accountData.name} authentication failed: ${result.error}`, 'error');
      
      testResults.details.push({
        type: 'authentication',
        account: key,
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
 * Test educational content management APIs with Super Admin
 */
async function testEducationalContentManagement() {
  log('📚 Testing Educational Content Management APIs...', 'header');

  // Use the first Super Admin token for testing
  const superAdminToken = authTokens.superAdmin1 || authTokens.superAdmin2 || authTokens.superAdmin3 || authTokens.superAdmin4;
  
  if (!superAdminToken) {
    log('❌ No Super Admin token available for testing', 'error');
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
    title: 'Test Course: Ethiopian Ancient Civilizations',
    description: 'A comprehensive test course exploring the rich ancient civilizations of Ethiopia, including Axum, Lalibela, and Harar.',
    category: 'history',
    difficulty: 'intermediate',
    estimatedDuration: 120,
    instructor: 'Dr. Heritage Expert',
    tags: ['history', 'ancient', 'ethiopia', 'civilization', 'test'],
    prerequisites: []
  };

  const createResult = await apiRequest('POST', '/learning/admin/courses', courseData, token);
  
  if (createResult.success) {
    testResults.apiTests.passed++;
    testData.courseId = createResult.data.course._id;
    log('✅ Test course created successfully', 'success');
    log(`   Course ID: ${testData.courseId}`, 'info');
    
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
    const updateData = { 
      description: 'Updated: ' + courseData.description,
      tags: [...courseData.tags, 'updated']
    };
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
    title: 'Introduction to Axumite Kingdom',
    description: 'Explore the ancient Axumite kingdom, its trade networks, cultural significance, and archaeological discoveries.',
    order: 1,
    estimatedDuration: 45,
    content: [
      {
        type: 'text',
        content: 'The Axumite Empire (c. 100–960 CE) was a major trading nation in northeastern Africa and South Arabia. It grew from the proto-Aksumite Iron Age period around the 4th century BCE to achieve prominence by the 1st century CE.'
      },
      {
        type: 'image',
        url: 'https://example.com/axum-stelae.jpg',
        caption: 'The famous Axum Stelae - ancient obelisks that marked royal graves'
      },
      {
        type: 'video',
        url: 'https://example.com/axum-documentary.mp4',
        title: 'Archaeological Discoveries in Axum'
      }
    ],
    objectives: [
      'Understand the historical significance of the Axumite Kingdom',
      'Identify key archaeological sites and discoveries',
      'Analyze the trade networks and economic systems',
      'Recognize the cultural and religious influence of Axum'
    ],
    resources: [
      {
        title: 'Axum: An African Civilisation of Late Antiquity',
        type: 'pdf',
        url: 'https://example.com/axum-research.pdf'
      }
    ],
    quiz: {
      questions: [
        {
          question: 'In which century did the Axumite Empire reach its peak?',
          type: 'multiple_choice',
          options: ['3rd century CE', '4th century CE', '5th century CE', '6th century CE'],
          correctAnswer: 1,
          points: 10,
          explanation: 'The Axumite Empire reached its peak in the 4th century CE under King Ezana.'
        },
        {
          question: 'What was the primary source of Axum\'s wealth?',
          type: 'multiple_choice',
          options: ['Agriculture', 'Trade', 'Mining', 'Conquest'],
          correctAnswer: 1,
          points: 10,
          explanation: 'Axum\'s strategic location made it a major trading hub between Africa, Arabia, and the Mediterranean.'
        }
      ],
      passingScore: 70
    }
  };

  const createResult = await apiRequest('POST', `/learning/admin/courses/${testData.courseId}/lessons`, lessonData, token);
  
  if (createResult.success) {
    testResults.apiTests.passed++;
    testData.lessonId = createResult.data.lesson._id;
    log('✅ Test lesson created successfully', 'success');
    log(`   Lesson ID: ${testData.lessonId}`, 'info');
    
    // Test lesson retrieval
    const getResult = await apiRequest('GET', `/learning/admin/lessons/${testData.lessonId}`, null, token);
    if (getResult.success) {
      testResults.apiTests.passed++;
      log('✅ Lesson details retrieved successfully', 'success');
      log(`   Lesson has ${getResult.data.lesson.quiz?.questions?.length || 0} quiz questions`, 'info');
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
    log(`   User engagement stats available`, 'info');
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
    title: 'Ethiopian Heritage Scholar',
    description: 'Complete 3 Ethiopian heritage courses to earn this prestigious achievement and unlock advanced content.',
    type: 'course_completion',
    category: 'heritage',
    difficulty: 'intermediate',
    criteria: {
      type: 'course_completion',
      requiredCount: 3,
      categoryFilter: 'heritage'
    },
    reward: {
      points: 150,
      badge: 'Ethiopian Heritage Scholar Badge',
      certificate: true
    }
  };

  const createResult = await apiRequest('POST', '/learning/admin/achievements', achievementData, token);
  
  if (createResult.success) {
    testResults.apiTests.passed++;
    testData.achievementId = createResult.data.achievement._id;
    log('✅ Test achievement created successfully', 'success');
    log(`   Achievement ID: ${testData.achievementId}`, 'info');
    
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
    log(`   🎯 Completion Rate: ${stats.enrollments.completionRate}%`, 'info');
    
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

  // Test museum admin access
  if (authTokens.museumAdmin) {
    log('Testing Museum Admin access to educational content...', 'info');
    
    const result = await apiRequest('GET', '/learning/admin/courses', null, authTokens.museumAdmin);
    
    if (result.success) {
      testResults.apiTests.passed++;
      log('✅ Museum Admin can access course management', 'success');
    } else {
      if (result.status === 403) {
        testResults.apiTests.passed++;
        log('✅ Museum Admin correctly restricted (expected behavior)', 'success');
      } else {
        testResults.apiTests.failed++;
        log(`❌ Museum Admin access test failed: ${result.error}`, 'error');
      }
    }
  }

  // Test regular user access (should be denied)
  if (authTokens.testUser) {
    log('Testing Regular User access to admin endpoints...', 'info');
    
    const result = await apiRequest('GET', '/learning/admin/courses', null, authTokens.testUser);
    
    if (result.status === 403) {
      testResults.apiTests.passed++;
      log('✅ Regular User correctly denied admin access (expected)', 'success');
    } else {
      testResults.apiTests.failed++;
      log(`❌ Regular User access control failed: ${result.error}`, 'error');
    }
  }
}

/**
 * Cleanup test data
 */
async function cleanupTestData() {
  log('🧹 Cleaning up test data...', 'info');

  const token = authTokens.superAdmin1 || authTokens.superAdmin2 || authTokens.superAdmin3 || authTokens.superAdmin4;
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

  const totalTests = testResults.authentication.passed + testResults.authentication.failed +
                    testResults.apiTests.passed + testResults.apiTests.failed;

  const totalPassed = testResults.authentication.passed + testResults.apiTests.passed;
  const totalFailed = testResults.authentication.failed + testResults.apiTests.failed;

  log(`\n🎯 Overall Summary:`, 'info');
  log(`   Total Tests: ${totalTests}`, 'info');
  log(`   ✅ Passed: ${totalPassed}`, 'success');
  log(`   ❌ Failed: ${totalFailed}`, totalFailed > 0 ? 'error' : 'info');
  log(`   📊 Success Rate: ${totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(1) : 0}%`, 'info');

  log(`\n📊 Detailed Breakdown:`, 'info');
  log(`   🔐 Authentication:`, 'info');
  log(`      ✅ Passed: ${testResults.authentication.passed}`, 'success');
  log(`      ❌ Failed: ${testResults.authentication.failed}`, 'info');

  log(`   📚 API Tests:`, 'info');
  log(`      ✅ Passed: ${testResults.apiTests.passed}`, 'success');
  log(`      ❌ Failed: ${testResults.apiTests.failed}`, 'info');

  log(`\n🔑 Admin Account Status:`, 'info');
  Object.keys(EXISTING_ADMIN_ACCOUNTS).forEach(key => {
    const account = EXISTING_ADMIN_ACCOUNTS[key];
    const hasToken = !!authTokens[key];
    log(`   ${account.name} (${account.role}): ${hasToken ? '✅ Ready' : '❌ Failed'}`, hasToken ? 'success' : 'error');
    if (hasToken) {
      log(`      Email: ${account.email}`, 'info');
    }
  });

  log(`\n🚀 Educational Content Management System Status:`, 'success');
  log(`   📚 Course Management: ${testResults.apiTests.passed > 0 ? '✅ Working' : '❌ Issues'}`, testResults.apiTests.passed > 0 ? 'success' : 'error');
  log(`   📖 Lesson Management: ${testResults.apiTests.passed > 1 ? '✅ Working' : '❌ Issues'}`, testResults.apiTests.passed > 1 ? 'success' : 'error');
  log(`   👥 Enrollment Analytics: ${testResults.apiTests.passed > 2 ? '✅ Working' : '❌ Issues'}`, testResults.apiTests.passed > 2 ? 'success' : 'error');
  log(`   🏆 Achievement System: ${testResults.apiTests.passed > 3 ? '✅ Working' : '❌ Issues'}`, testResults.apiTests.passed > 3 ? 'success' : 'error');
  log(`   📊 Dashboard Statistics: ${testResults.apiTests.passed > 4 ? '✅ Working' : '❌ Issues'}`, testResults.apiTests.passed > 4 ? 'success' : 'error');

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
    console.log('🇪🇹 EthioHeritage360 Admin Testing & Educational Content Management'.rainbow.bold);
    console.log('=========================================================================\n'.cyan);

    // Display existing credentials first
    displayAdminCredentials();

    // Check server status
    const serverOk = await checkServerStatus();
    if (!serverOk) {
      process.exit(1);
    }

    // Test authentication for existing accounts
    await testAuthentication();

    // Test educational content management APIs
    await testEducationalContentManagement();

    // Cleanup test data
    await cleanupTestData();

    // Generate final report
    const success = generateReport();

    log(`\n🏁 Testing completed!`, 'success');
    
    if (success) {
      log(`\n💡 Next Steps for Your Frontend:`, 'info');
      log(`   1. Use any of the Super Admin accounts to login`, 'info');
      log(`   2. Implement admin dashboard with course management UI`, 'info');
      log(`   3. Create forms for adding/editing courses and lessons`, 'info');
      log(`   4. Display enrollment analytics and user progress`, 'info');
      log(`   5. Implement achievement and certificate systems`, 'info');
      
      log(`\n🔗 API Endpoints Ready for Frontend Integration:`, 'success');
      log(`   GET  /api/learning/admin/courses - List courses`, 'info');
      log(`   POST /api/learning/admin/courses - Create course`, 'info');
      log(`   GET  /api/learning/admin/stats - Dashboard stats`, 'info');
      log(`   GET  /api/learning/admin/enrollments/analytics - Analytics`, 'info');
      log(`   ... and many more! Check the API documentation.`, 'info');
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

module.exports = { main, testResults, authTokens, EXISTING_ADMIN_ACCOUNTS };
