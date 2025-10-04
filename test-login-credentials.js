#!/usr/bin/env node

/**
 * Login Credentials Testing Script
 * Tests the login credentials from SEED_CREDENTIALS.txt
 */

const axios = require('axios');

// Test credentials from SEED_CREDENTIALS.txt
const testCredentials = [
  // Super Admins
  { email: 'melkamuwako5@admin.com', password: 'melkamuwako5', role: 'Super Admin' },
  { email: 'abdurazakm343@admin.com', password: 'THpisvaHUbQNMsbX', role: 'Super Admin' },
  { email: 'student.pasegid@admin.com', password: 'Fs4HwlXCW4SJvkyN', role: 'Super Admin' },
  { email: 'naolaboma@admin.com', password: 'QR7ICwI5s6VMgAZD', role: 'Super Admin' },
  
  // Museum Admins
  { email: 'museum.admin@ethioheritage360.com', password: 'museum123', role: 'Museum Admin' },
  { email: 'testadmin@ethioheritage360.com', password: 'admin123', role: 'Museum Admin (CONFIRMED)' },
  
  // Tour Organizers
  { email: 'organizer@heritagetours.et', password: 'organizer123', role: 'Tour Organizer' },
  { email: 'tourguide@demo.com', password: 'tourguide123', role: 'Tour Guide' },
  { email: 'test@example.com', password: 'test123456', role: 'Test User' }
];

// Backend URLs to test
const backendUrls = [
  'http://localhost:5000',
  'https://ethioheritage360-backend.onrender.com',
  'https://ethioheritage360-ethiopian-heritage.onrender.com'
];

async function testLogin(baseUrl, credentials) {
  try {
    console.log(`\n🧪 Testing login for ${credentials.email} (${credentials.role})`);
    console.log(`📡 Backend: ${baseUrl}`);
    
    const response = await axios.post(`${baseUrl}/api/auth/login`, {
      email: credentials.email,
      password: credentials.password
    }, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 200 && response.data.success) {
      console.log(`✅ SUCCESS: Login successful for ${credentials.email}`);
      console.log(`   Token: ${response.data.token ? 'Generated' : 'Missing'}`);
      console.log(`   User Role: ${response.data.user?.role || 'Unknown'}`);
      console.log(`   User ID: ${response.data.user?.id || response.data.user?._id || 'Unknown'}`);
      return { success: true, response: response.data };
    } else {
      console.log(`❌ FAILED: Unexpected response for ${credentials.email}`);
      return { success: false, error: 'Unexpected response' };
    }
  } catch (error) {
    console.log(`❌ ERROR: Login failed for ${credentials.email}`);
    
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Message: ${error.response.data?.message || 'Unknown error'}`);
      
      if (error.response.status === 400) {
        console.log(`   🔒 Possible issue: Invalid credentials or account locked`);
      } else if (error.response.status === 423) {
        console.log(`   🔒 Account is LOCKED - run unlock script`);
      } else if (error.response.status === 403) {
        console.log(`   🚫 Account is DEACTIVATED`);
      }
    } else if (error.code === 'ECONNREFUSED') {
      console.log(`   🚫 Connection refused - server is down`);
    } else if (error.code === 'ENOTFOUND') {
      console.log(`   🌐 DNS resolution failed - check URL`);
    } else {
      console.log(`   💥 Network error: ${error.message}`);
    }
    
    return { success: false, error: error.message };
  }
}

async function testBackendHealth(baseUrl) {
  try {
    console.log(`\n🏥 Testing backend health: ${baseUrl}`);
    const response = await axios.get(`${baseUrl}/api/health`, { timeout: 5000 });
    
    if (response.status === 200) {
      console.log(`✅ Backend is healthy`);
      console.log(`   Status: ${response.data.status}`);
      console.log(`   Uptime: ${Math.floor(response.data.uptime || 0)}s`);
      console.log(`   Database: ${response.data.database?.connected ? 'Connected' : 'Disconnected'}`);
      return true;
    }
  } catch (error) {
    console.log(`❌ Backend health check failed`);
    if (error.response?.status) {
      console.log(`   Status: ${error.response.status}`);
    } else {
      console.log(`   Error: ${error.message}`);
    }
  }
  return false;
}

async function main() {
  console.log('🔐 LOGIN CREDENTIALS TESTING SCRIPT');
  console.log('=====================================\n');
  
  // Test each backend URL
  for (const baseUrl of backendUrls) {
    console.log(`\n🎯 Testing Backend: ${baseUrl}`);
    console.log('='.repeat(50));
    
    // First test health
    const isHealthy = await testBackendHealth(baseUrl);
    
    if (!isHealthy && !baseUrl.includes('localhost')) {
      console.log('⏭️  Skipping login tests for unhealthy backend\n');
      continue;
    }
    
    // Test each credential
    let successfulLogins = 0;
    for (const credentials of testCredentials) {
      const result = await testLogin(baseUrl, credentials);
      if (result.success) successfulLogins++;
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log(`\n📊 Summary for ${baseUrl}:`);
    console.log(`   Successful logins: ${successfulLogins}/${testCredentials.length}`);
    console.log(`   Success rate: ${Math.round((successfulLogins/testCredentials.length) * 100)}%`);
  }
  
  console.log('\n🎯 RECOMMENDATIONS:');
  console.log('==================');
  console.log('1. If accounts are locked, run: node server/scripts/unlock-account.js unlock-all');
  console.log('2. If backend is down, check your Render deployment');
  console.log('3. For local testing, start with: npm run dev');
  console.log('4. Use testadmin@ethioheritage360.com / admin123 for immediate access');
  console.log('\n✅ Test complete!');
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testLogin, testBackendHealth };
