const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';
let authToken = null;
let testCourseId = null;

console.log('🧪 Testing EthioHeritage360 Education API Endpoints...\n');

async function login() {
  try {
    console.log('Logging in as Admin...');
    const response = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@ethioheritage360.com',
      password: 'admin123'
    });
    authToken = response.data.token;
    console.log('✅ Login Successful');
    return true;
  } catch (error) {
    console.log('⚠️ Login Failed (continuing without auth):', error.response?.data?.message || error.message);
    // Try registering if login fails? No, simpler to just skip auth tests if login fails
    return false;
  }
}

// Test function to make API calls
async function testEndpoint(method, endpoint, description, requiresAuth = false) {
  try {
    console.log(`Testing: ${description}`);
    console.log(`${method.toUpperCase()} ${endpoint}`);

    // Replace placeholders
    if (endpoint.includes(':courseId')) {
      if (testCourseId) {
        endpoint = endpoint.replace(':courseId', testCourseId);
      } else {
        console.log(`⚠️  Skipping ${description} (No Course ID available from previous steps)`);
        return true;
      }
    }

    const config = {
      method: method.toLowerCase(),
      url: `${API_BASE}${endpoint}`,
      timeout: 10000,
      headers: {}
    };

    // Add auth header if needed
    if (requiresAuth) {
      if (authToken) {
        config.headers['Authorization'] = `Bearer ${authToken}`;
      } else {
        console.log('⚠️  Skipping auth-required endpoint (no token)');
        return true;
      }
    }

    const response = await axios(config);

    if (response.data.success) {
      console.log('✅ PASSED');
      console.log(`Status: ${response.status}`);

      // Capture Course ID if available
      if (!testCourseId && (endpoint === '/education-hub/courses' || endpoint === '/courses')) {
        const courses = response.data.data;
        if (courses && courses.length > 0) {
          testCourseId = courses[0]._id || courses[0].id;
          console.log(`ℹ️  Captured Test Course ID: ${testCourseId}`);
        }
      }

      if (response.data.data) {
        const data = response.data.data;
        if (Array.isArray(data)) {
          console.log(`Data: ${data.length} items returned`);
        } else {
          console.log('Data returned successfully');
        }
      }
      console.log(`Message: ${response.data.message || 'No message'}\n`);
    } else {
      console.log('⚠️  Unexpected response format');
      console.log(response.data);
      console.log('');
    }

  } catch (error) {
    if (error.response) {
      console.log(`❌ FAILED - Status: ${error.response.status}`);
      console.log(`Error: ${error.response.data.message || error.response.data.error || 'Unknown error'}\n`);
    } else if (error.code === 'ECONNREFUSED') {
      console.log('❌ FAILED - Server not running at localhost:5000\n');
      return false;
    } else {
      console.log(`❌ FAILED - ${error.message}\n`);
    }
  }
  return true;
}

async function runTests() {
  console.log('Starting API endpoint tests...\n');

  await login();

  // Test new education API endpoints
  const endpoints = [
    // Public routes
    ['GET', '/education-hub/courses', 'Get all courses (Education Hub)', false],
    ['GET', '/education-hub/study-guides', 'Get study guides', false],
    ['GET', '/education-hub/quizzes', 'Get quizzes', false],
    ['GET', '/education-hub/flashcards', 'Get flashcards', false],
    ['GET', '/education-hub/live-sessions', 'Get live sessions', false],

    // Protected routes
    ['GET', '/education-hub/my-enrollments', 'Get my enrollments', true],
    ['GET', '/education-hub/certificates', 'Get my certificates', true],
    ['GET', '/education-hub/progress', 'Get learning progress', true],

    // Use captured ID
    ['GET', '/education-hub/courses/:courseId/analytics', 'Get course analytics', true],
  ];

  let totalCount = 0;
  let serverRunning = true;

  for (const [method, endpoint, description, requiresAuth] of endpoints) {
    if (!serverRunning) break;

    totalCount++;
    const result = await testEndpoint(method, endpoint, description, requiresAuth);
    if (result === false) {
      serverRunning = false;
      break;
    }

    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  if (serverRunning) {
    console.log('📊 Test Summary:');
    console.log(`Total endpoints tested: ${totalCount}`);
    console.log('\n🎉 Education API endpoints verification complete!');
  } else {
    console.log('❌ Tests stopped due to server connection issues.');
    console.log('Please ensure your server is running on localhost:5000');
  }
}

// Run the tests
runTests().catch(console.error);
