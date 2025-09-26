// Test script with authentication
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test museum endpoints with authentication
const testWithAuth = async () => {
  console.log('🔐 Testing Museum API with Authentication...\n');

  try {
    // First, try to login (you'll need to replace with actual credentials)
    console.log('📡 Attempting login...');

    // Note: Replace these with actual museum admin credentials
    const loginData = {
      email: 'museum@admin.com', // Replace with actual email
      password: 'password123'     // Replace with actual password
    };

    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, loginData);

    if (loginResponse.data.success && loginResponse.data.token) {
      const token = loginResponse.data.token;
      console.log('✅ Login successful!');
      console.log('👤 User:', loginResponse.data.user?.name || 'Unknown');
      console.log('🎭 Role:', loginResponse.data.user?.role || 'Unknown');

      // Set up axios instance with auth header
      const authAxios = axios.create({
        baseURL: BASE_URL,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Test museum profile endpoint
      console.log('\n📊 Testing Museum Profile...');
      try {
        const profileResponse = await authAxios.get('/museums/profile');
        console.log('✅ Museum Profile:', profileResponse.data);
      } catch (error) {
        console.log('❌ Museum Profile Error:', error.response?.data || error.message);
      }

      // Test museum dashboard stats endpoint
      console.log('\n📈 Testing Museum Dashboard Stats...');
      try {
        const statsResponse = await authAxios.get('/museums/dashboard/stats');
        console.log('✅ Museum Stats:', statsResponse.data);

        if (statsResponse.data.success && statsResponse.data.data) {
          const stats = statsResponse.data.data;
          console.log('\n📊 Statistics Summary:');
          console.log(`  - Total Artifacts: ${stats.totalArtifacts}`);
          console.log(`  - Total Staff: ${stats.totalStaff}`);
          console.log(`  - Total Events: ${stats.totalEvents}`);
          console.log(`  - Active Rentals: ${stats.activeRentals}`);
          console.log(`  - Monthly Visitors: ${stats.monthlyVisitors}`);
          console.log(`  - Total Revenue: ${stats.totalRevenue}`);
        }
      } catch (error) {
        console.log('❌ Museum Stats Error:', error.response?.data || error.message);
      }

    } else {
      console.log('❌ Login failed:', loginResponse.data);
    }

  } catch (error) {
    if (error.response?.status === 401) {
      console.log('❌ Authentication failed - Invalid credentials');
      console.log('💡 Please update the login credentials in this script');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('❌ Connection refused - Server might not be running');
    } else {
      console.log('❌ Error:', error.response?.data || error.message);
    }
  }
};

// Run the test
testWithAuth().catch(console.error);
