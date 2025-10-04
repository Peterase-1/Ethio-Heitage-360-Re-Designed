#!/usr/bin/env node

const https = require('https');
const { execSync } = require('child_process');

console.log('🌐 Testing network connectivity...');

// Test npm registry connectivity
function testRegistry() {
  return new Promise((resolve) => {
    const req = https.get('https://registry.npmjs.org/', (res) => {
      console.log(`✅ NPM Registry: Status ${res.statusCode}`);
      resolve(true);
    });
    
    req.on('error', (err) => {
      console.log(`❌ NPM Registry: ${err.message}`);
      resolve(false);
    });
    
    req.setTimeout(5000, () => {
      console.log('❌ NPM Registry: Timeout');
      req.destroy();
      resolve(false);
    });
  });
}

// Test GitHub connectivity
function testGitHub() {
  return new Promise((resolve) => {
    const req = https.get('https://github.com/', (res) => {
      console.log(`✅ GitHub: Status ${res.statusCode}`);
      resolve(true);
    });
    
    req.on('error', (err) => {
      console.log(`❌ GitHub: ${err.message}`);
      resolve(false);
    });
    
    req.setTimeout(5000, () => {
      console.log('❌ GitHub: Timeout');
      req.destroy();
      resolve(false);
    });
  });
}

// Test npm ping
function testNpmPing() {
  try {
    execSync('npm ping', { stdio: 'pipe' });
    console.log('✅ NPM Ping: Success');
    return true;
  } catch (error) {
    console.log(`❌ NPM Ping: ${error.message}`);
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('🔍 Running connectivity tests...\n');
  
  const registryTest = await testRegistry();
  const githubTest = await testGitHub();
  const npmPingTest = testNpmPing();
  
  console.log('\n📊 Results:');
  console.log(`Registry: ${registryTest ? '✅' : '❌'}`);
  console.log(`GitHub: ${githubTest ? '✅' : '❌'}`);
  console.log(`NPM Ping: ${npmPingTest ? '✅' : '❌'}`);
  
  if (registryTest && githubTest && npmPingTest) {
    console.log('\n🎉 All connectivity tests passed! You are online and ready to develop.');
  } else {
    console.log('\n⚠️  Some connectivity issues detected. Consider:');
    console.log('1. Check your internet connection');
    console.log('2. Check firewall settings');
    console.log('3. Try using a different network');
    console.log('4. Consider using npm cache for offline development');
  }
}

runTests();
