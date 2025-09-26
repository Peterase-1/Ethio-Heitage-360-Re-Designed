#!/usr/bin/env node

/**
 * Super Admin Functionality Test Script
 * Tests the newly created SuperAdminDashboardV4 and API connectivity
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuration
const BASE_URL = 'http://localhost:5000';
const API_BASE = `${BASE_URL}/api`;

// Test credentials from ADMIN_CREDENTIALS.md
const TEST_CREDENTIALS = {
  SUPER_ADMIN: {
    email: 'superadmin@ethioheritage360.com',
    password: 'SuperAdmin2024!'
  },
  ADMIN: {
    email: 'admin@ethioheritage360.com', 
    password: 'AdminPass2024!'
  }
};

// Test results storage
const testResults = {
  passed: 0,
  failed: 0,
  errors: []
};

// Helper functions
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const colors = {
    info: '\x1b[36m', // Cyan
    success: '\x1b[32m', // Green
    error: '\x1b[31m', // Red
    warning: '\x1b[33m', // Yellow
    reset: '\x1b[0m'
  };
  
  console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
}

function passed(testName) {
  testResults.passed++;
  log(`✅ PASSED: ${testName}`, 'success');
}

function failed(testName, error) {
  testResults.failed++;
  testResults.errors.push({ test: testName, error: error.message || error });
  log(`❌ FAILED: ${testName} - ${error.message || error}`, 'error');
}

// Test functions
async function testServerHealth() {
  try {
    const response = await axios.get(`${API_BASE}/health`);
    if (response.status === 200 && response.data.status === 'OK') {
      passed('Server Health Check');
      return true;
    } else {
      failed('Server Health Check', 'Unexpected response');
      return false;
    }
  } catch (error) {
    failed('Server Health Check', error);
    return false;
  }
}

async function testSuperAdminLogin() {
  try {
    const response = await axios.post(`${API_BASE}/auth/login`, {
      email: TEST_CREDENTIALS.SUPER_ADMIN.email,
      password: TEST_CREDENTIALS.SUPER_ADMIN.password
    });
    
    if (response.status === 200 && response.data.success && response.data.token) {
      passed('Super Admin Login');
      return response.data.token;
    } else {
      failed('Super Admin Login', 'Login failed or missing token');
      return null;
    }
  } catch (error) {
    failed('Super Admin Login', error);
    return null;
  }
}

async function testSuperAdminDashboard(token) {
  try {
    const response = await axios.get(`${API_BASE}/super-admin/dashboard`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.status === 200 && response.data.success) {
      passed('Super Admin Dashboard API');
      return response.data.dashboard;
    } else {
      failed('Super Admin Dashboard API', 'Dashboard data fetch failed');
      return null;
    }
  } catch (error) {
    failed('Super Admin Dashboard API', error);
    return null;
  }
}

async function testSystemHealth(token) {
  try {
    const response = await axios.get(`${API_BASE}/super-admin/system/health`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.status === 200 && response.data.success) {
      passed('System Health API');
      return response.data.health;
    } else {
      failed('System Health API', 'System health fetch failed');
      return null;
    }
  } catch (error) {
    failed('System Health API', error);
    return null;
  }
}

async function testUsersAPI(token) {
  try {
    const response = await axios.get(`${API_BASE}/super-admin/users?limit=10`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.status === 200) {
      passed('Users Management API');
      return response.data;
    } else {
      failed('Users Management API', 'Users fetch failed');
      return null;
    }
  } catch (error) {
    failed('Users Management API', error);
    return null;
  }
}

async function testMuseumsAPI(token) {
  try {
    const response = await axios.get(`${API_BASE}/super-admin/museums?limit=10`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.status === 200) {
      passed('Museums Management API');
      return response.data;
    } else {
      failed('Museums Management API', 'Museums fetch failed');
      return null;
    }
  } catch (error) {
    failed('Museums Management API', error);
    return null;
  }
}

async function testClientFiles() {
  try {
    const requiredFiles = [
      'client/src/pages/SuperAdminDashboardV4.jsx',
      'client/src/App.jsx',
      'server/routes/superAdmin.js',
      'server/controllers/superAdmin.js'
    ];
    
    for (const file of requiredFiles) {
      const filePath = path.join(__dirname, file);
      if (!fs.existsSync(filePath)) {
        failed('File Existence Check', `Missing file: ${file}`);
        return false;
      }
    }
    
    passed('Required Files Check');
    return true;
  } catch (error) {
    failed('Required Files Check', error);
    return false;
  }
}

async function testComponentIntegration() {
  try {
    // Check if SuperAdminDashboardV4 is properly imported in App.jsx
    const appJsPath = path.join(__dirname, 'client/src/App.jsx');
    const appJsContent = fs.readFileSync(appJsPath, 'utf8');
    
    if (!appJsContent.includes('SuperAdminDashboardV4')) {
      failed('Component Integration', 'SuperAdminDashboardV4 not imported in App.jsx');
      return false;
    }
    
    if (!appJsContent.includes('/super-admin-v4')) {
      failed('Component Integration', 'Route /super-admin-v4 not found in App.jsx');
      return false;
    }
    
    passed('Component Integration Check');
    return true;
  } catch (error) {
    failed('Component Integration Check', error);
    return false;
  }
}

// Main test runner
async function runTests() {
  log('🚀 Starting Super Admin Functionality Tests', 'info');
  log('='.repeat(50), 'info');
  
  // Test 1: Check required files
  log('📁 Testing file structure...', 'info');
  await testClientFiles();
  await testComponentIntegration();
  
  // Test 2: Server health
  log('🏥 Testing server health...', 'info');
  const serverHealthy = await testServerHealth();
  
  if (!serverHealthy) {
    log('⚠️  Server is not running. Please start the server with: npm run dev', 'warning');
    log('   From the server directory: cd server && npm start', 'warning');
    return printResults();
  }
  
  // Test 3: Authentication
  log('🔐 Testing authentication...', 'info');
  const token = await testSuperAdminLogin();
  
  if (!token) {
    log('⚠️  Authentication failed. Please check credentials and database.', 'warning');
    return printResults();
  }
  
  // Test 4: API endpoints
  log('🔌 Testing API endpoints...', 'info');
  await testSuperAdminDashboard(token);
  await testSystemHealth(token);
  await testUsersAPI(token);
  await testMuseumsAPI(token);
  
  printResults();
}

function printResults() {
  log('='.repeat(50), 'info');
  log('📊 TEST RESULTS', 'info');
  log('='.repeat(50), 'info');
  
  log(`✅ Tests Passed: ${testResults.passed}`, 'success');
  log(`❌ Tests Failed: ${testResults.failed}`, testResults.failed > 0 ? 'error' : 'info');
  
  if (testResults.errors.length > 0) {
    log('\\n🔍 ERROR DETAILS:', 'error');
    testResults.errors.forEach((error, index) => {
      log(`${index + 1}. ${error.test}: ${error.error}`, 'error');
    });
  }
  
  const successRate = (testResults.passed / (testResults.passed + testResults.failed) * 100).toFixed(1);
  log(`\\n🎯 Success Rate: ${successRate}%`, successRate >= 80 ? 'success' : 'warning');
  
  if (testResults.failed === 0) {
    log('\\n🎉 ALL TESTS PASSED! Super Admin functionality is ready to use!', 'success');
    log('   You can now login with:', 'info');
    log(`   Email: ${TEST_CREDENTIALS.SUPER_ADMIN.email}`, 'info');
    log('   Password: [As configured in ADMIN_CREDENTIALS.md]', 'info');
    log('   Dashboard: http://localhost:3000/super-admin-v4', 'info');
  } else {
    log('\\n⚠️  Some tests failed. Please check the errors above.', 'warning');
  }
  
  log('='.repeat(50), 'info');
}

// Help text
function showHelp() {
  console.log(`
🏛️  EthioHeritage360 - Super Admin Test Suite

USAGE:
  node test-super-admin.js [options]

OPTIONS:
  --help, -h     Show this help message
  --server-only  Test only server components
  --client-only  Test only client components

PREREQUISITES:
  1. Server running on http://localhost:5000
  2. Database connected and seeded with admin user
  3. Client built and accessible

EXAMPLES:
  node test-super-admin.js
  node test-super-admin.js --server-only
  node test-super-admin.js --help
  `);
}

// Command line argument handling
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  showHelp();
  process.exit(0);
}

// Run the tests
runTests().catch(error => {
  log(`💥 Test suite crashed: ${error.message}`, 'error');
  process.exit(1);
});
