#!/usr/bin/env node

/**
 * Educational Content Management API Test Runner
 * EthioHeritage360 Platform
 * 
 * Run this script to test all educational content management APIs
 */

const path = require('path');
const { spawn } = require('child_process');

console.log('🚀 EthioHeritage360 Educational Content Management API Test Runner');
console.log('=' .repeat(70));

// Check if server is running
const checkServer = () => {
  return new Promise((resolve) => {
    const http = require('http');
    const req = http.request({
      host: 'localhost',
      port: 5000,
      path: '/api/health',
      method: 'GET',
      timeout: 5000
    }, (res) => {
      resolve(true);
    });

    req.on('error', () => {
      resolve(false);
    });

    req.on('timeout', () => {
      resolve(false);
    });

    req.end();
  });
};

const runTests = async () => {
  // Check if server is running
  console.log('🔍 Checking if server is running...');
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    console.log('❌ Server is not running on localhost:5000');
    console.log('💡 Please start the server first with: npm run dev');
    process.exit(1);
  }

  console.log('✅ Server is running');
  console.log('🧪 Starting test suite...\n');

  // Run the test file
  const testFile = path.join(__dirname, '..', 'tests', 'educational-content-management.test.js');
  
  const testProcess = spawn('node', [testFile], {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  });

  testProcess.on('exit', (code) => {
    if (code === 0) {
      console.log('\n🎉 All tests completed successfully!');
    } else {
      console.log('\n💥 Some tests failed. Check the output above for details.');
    }
    process.exit(code);
  });

  testProcess.on('error', (error) => {
    console.error('❌ Error running tests:', error);
    process.exit(1);
  });
};

// Handle SIGINT (Ctrl+C)
process.on('SIGINT', () => {
  console.log('\n🛑 Test execution interrupted by user');
  process.exit(130);
});

// Run tests
runTests().catch((error) => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});
