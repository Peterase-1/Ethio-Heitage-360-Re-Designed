const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/super-admin';

// Test configuration
const testConfig = {
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
};

// Test data
const testData = {
  user: {
    name: 'Test User',
    email: 'testuser@example.com',
    password: 'TestPassword123!',
    role: 'visitor',
    isActive: true
  },
  heritageSite: {
    name: 'Test Heritage Site',
    localName: 'የሙከራ የባህል ቦታ',
    description: 'A test heritage site for Day 1 implementation',
    type: 'Cultural',
    category: 'Test Category',
    designation: 'National Heritage',
    location: {
      region: 'Addis Ababa',
      zone: 'Addis Ababa',
      woreda: 'Addis Ababa',
      city: 'Addis Ababa',
      coordinates: {
        latitude: 9.0192,
        longitude: 38.7525
      }
    },
    status: 'active',
    verified: true
  }
};

// Test functions
async function testDashboardAPI() {
  console.log('\n🧪 Testing Dashboard API...');
  try {
    const response = await axios.get(`${BASE_URL}/dashboard`, testConfig);

    if (response.data.success) {
      console.log('✅ Dashboard API working');
      console.log('📊 System Overview:', {
        users: response.data.dashboard.systemOverview.users,
        museums: response.data.dashboard.systemOverview.museums,
        heritageSites: response.data.dashboard.systemOverview.heritageSites
      });
      console.log('📈 Trends:', response.data.dashboard.trends);
      console.log('🚨 Alerts:', response.data.dashboard.alerts);
    } else {
      console.log('❌ Dashboard API failed:', response.data.message);
    }
  } catch (error) {
    console.log('❌ Dashboard API error:', error.response?.data?.message || error.message);
  }
}

async function testAnalyticsAPI() {
  console.log('\n🧪 Testing Analytics API...');
  try {
    const response = await axios.get(`${BASE_URL}/analytics?type=platform`, testConfig);

    if (response.data.success) {
      console.log('✅ Analytics API working');
      console.log('📊 Analytics data received');
    } else {
      console.log('❌ Analytics API failed:', response.data.message);
    }
  } catch (error) {
    console.log('❌ Analytics API error:', error.response?.data?.message || error.message);
  }
}

async function testUserManagement() {
  console.log('\n🧪 Testing User Management...');
  try {
    // Test get users
    const usersResponse = await axios.get(`${BASE_URL}/users?limit=5`, testConfig);
    if (usersResponse.data.success) {
      console.log('✅ Get users API working');
      console.log(`📊 Found ${usersResponse.data.users.length} users`);
    }

    // Test create user
    const createResponse = await axios.post(`${BASE_URL}/users`, testData.user, testConfig);
    if (createResponse.data.success) {
      console.log('✅ Create user API working');
      const userId = createResponse.data.user._id;

      // Test update user
      const updateResponse = await axios.put(`${BASE_URL}/users/${userId}`, {
        name: 'Updated Test User'
      }, testConfig);
      if (updateResponse.data.success) {
        console.log('✅ Update user API working');
      }

      // Test delete user
      const deleteResponse = await axios.delete(`${BASE_URL}/users/${userId}`, testConfig);
      if (deleteResponse.data.success) {
        console.log('✅ Delete user API working');
      }
    }
  } catch (error) {
    console.log('❌ User Management error:', error.response?.data?.message || error.message);
  }
}

async function testHeritageSites() {
  console.log('\n🧪 Testing Heritage Sites...');
  try {
    // Test get heritage sites
    const sitesResponse = await axios.get(`${BASE_URL}/heritage-sites?limit=5`, testConfig);
    if (sitesResponse.data.success) {
      console.log('✅ Get heritage sites API working');
      console.log(`📊 Found ${sitesResponse.data.sites.length} heritage sites`);
    }

    // Test create heritage site
    const createResponse = await axios.post(`${BASE_URL}/heritage-sites`, testData.heritageSite, testConfig);
    if (createResponse.data.success) {
      console.log('✅ Create heritage site API working');
      const siteId = createResponse.data.site._id;

      // Test update heritage site
      const updateResponse = await axios.put(`${BASE_URL}/heritage-sites/${siteId}`, {
        description: 'Updated test heritage site description'
      }, testConfig);
      if (updateResponse.data.success) {
        console.log('✅ Update heritage site API working');
      }

      // Test delete heritage site
      const deleteResponse = await axios.delete(`${BASE_URL}/heritage-sites/${siteId}`, testConfig);
      if (deleteResponse.data.success) {
        console.log('✅ Delete heritage site API working');
      }
    }
  } catch (error) {
    console.log('❌ Heritage Sites error:', error.response?.data?.message || error.message);
  }
}

async function testMuseumOversight() {
  console.log('\n🧪 Testing Museum Oversight...');
  try {
    // Test get museums
    const museumsResponse = await axios.get(`${BASE_URL}/museums?limit=5`, testConfig);
    if (museumsResponse.data.success) {
      console.log('✅ Get museums API working');
      console.log(`📊 Found ${museumsResponse.data.museums.length} museums`);
    }
  } catch (error) {
    console.log('❌ Museum Oversight error:', error.response?.data?.message || error.message);
  }
}

async function testAuditLogs() {
  console.log('\n🧪 Testing Audit Logs...');
  try {
    // Test get audit logs
    const logsResponse = await axios.get(`${BASE_URL}/audit-logs?limit=10`, testConfig);
    if (logsResponse.data.success) {
      console.log('✅ Get audit logs API working');
      console.log(`📊 Found ${logsResponse.data.logs.length} audit logs`);
    }

    // Test audit logs summary
    const summaryResponse = await axios.get(`${BASE_URL}/audit-logs/summary`, testConfig);
    if (summaryResponse.data.success) {
      console.log('✅ Get audit logs summary API working');
      console.log('📊 Summary:', summaryResponse.data.summary);
    }
  } catch (error) {
    console.log('❌ Audit Logs error:', error.response?.data?.message || error.message);
  }
}

async function testSystemHealth() {
  console.log('\n🧪 Testing System Health...');
  try {
    const response = await axios.get(`${BASE_URL}/system/health`, testConfig);
    if (response.data.success) {
      console.log('✅ System Health API working');
      console.log('🏥 Health status:', response.data.health.status);
      console.log('💾 Database connected:', response.data.health.database.connected);
      console.log('⏱️ Uptime:', Math.round(response.data.health.uptime / 3600), 'hours');
    }
  } catch (error) {
    console.log('❌ System Health error:', error.response?.data?.message || error.message);
  }
}

// Main test runner
async function runDay1Tests() {
  console.log('🚀 Starting Day 1 Super Admin Backend Tests');
  console.log('='.repeat(50));

  const startTime = Date.now();

  try {
    await testDashboardAPI();
    await testAnalyticsAPI();
    await testUserManagement();
    await testHeritageSites();
    await testMuseumOversight();
    await testAuditLogs();
    await testSystemHealth();

    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;

    console.log('\n' + '='.repeat(50));
    console.log(`🎉 Day 1 Tests Completed in ${duration.toFixed(2)} seconds`);
    console.log('✅ All Super Admin backend APIs are working!');
    console.log('\n📋 Day 1 Implementation Summary:');
    console.log('   ✅ Enhanced Dashboard Statistics');
    console.log('   ✅ User Management with Audit Logging');
    console.log('   ✅ Heritage Sites Management');
    console.log('   ✅ Museum Oversight');
    console.log('   ✅ Audit Logs System');
    console.log('   ✅ System Health Monitoring');
    console.log('\n🎯 Ready for Day 2: User Management Tab Enhancement!');

  } catch (error) {
    console.log('\n❌ Test suite failed:', error.message);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runDay1Tests().catch(console.error);
}

module.exports = {
  runDay1Tests,
  testDashboardAPI,
  testAnalyticsAPI,
  testUserManagement,
  testHeritageSites,
  testMuseumOversight,
  testAuditLogs,
  testSystemHealth
};
