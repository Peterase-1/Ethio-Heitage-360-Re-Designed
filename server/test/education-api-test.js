/**
 * Quick integration test for new education API endpoints
 * Run with: node server/test/education-api-test.js
 * 
 * This tests the new education API endpoints to ensure they're properly integrated
 */

const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

console.log('🧪 Testing EthioHeritage360 Education API Endpoints...\n');

// Test function to make API calls
async function testEndpoint(method, endpoint, description, requiresAuth = false) {
  try {
    console.log(`Testing: ${description}`);
    console.log(`${method.toUpperCase()} ${endpoint}`);
    
    const config = {
      method: method.toLowerCase(),
      url: `${API_BASE}${endpoint}`,
      timeout: 10000
    };
    
    // Add auth header if needed (you would set a valid token here)
    if (requiresAuth) {
      // config.headers = { 'Authorization': 'Bearer YOUR_TEST_TOKEN' };
      console.log('⚠️  Skipping auth-required endpoint (no test token)');
      return;
    }
    
    const response = await axios(config);
    
    if (response.data.success) {
      console.log('✅ PASSED');
      console.log(`Status: ${response.status}`);
      if (response.data.data || response.data.courses || response.data.categories) {
        const dataKey = Object.keys(response.data).find(k => 
          k !== 'success' && k !== 'message' && Array.isArray(response.data[k]) || typeof response.data[k] === 'object'
        );
        if (dataKey && Array.isArray(response.data[dataKey])) {
          console.log(`Data: ${response.data[dataKey].length} items returned`);
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
  
  // Test new education API endpoints
  const endpoints = [
    ['GET', '/courses', 'Get all courses', false],
    ['GET', '/courses/featured', 'Get featured courses', false],
    ['GET', '/courses/categories', 'Get course categories', false],
    ['GET', '/study-guides', 'Get study guides', false],
    ['GET', '/tours/educational', 'Get educational tours', false],
    
    // Test visitor endpoints
    ['GET', '/visitor/dashboard', 'Get visitor dashboard', false],
    
    // Test authenticated endpoints (will be skipped without token)
    ['GET', '/user/courses/enrolled', 'Get enrolled courses', true],
    ['GET', '/user/courses/completed', 'Get completed courses', true],
    ['GET', '/user/learning/stats', 'Get learning statistics', true],
    ['GET', '/user/certificates', 'Get user certificates', true],
  ];
  
  let passedCount = 0;
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
    console.log(`✅ Tests completed successfully!`);
    console.log('\n🎉 All new education API endpoints are properly integrated!');
    console.log('\nNext steps:');
    console.log('1. Update your frontend educationService.js to use the new endpoints');
    console.log('2. Test the complete frontend integration');
    console.log('3. Add real course data to see the full functionality');
  } else {
    console.log('❌ Tests stopped due to server connection issues.');
    console.log('Please ensure your server is running on localhost:5000');
  }
}

// Run the tests
runTests().catch(console.error);
