// Test script to verify museum endpoints
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test endpoints
const testEndpoints = async () => {
  console.log('🧪 Testing Museum API Endpoints...\n');

  const endpoints = [
    {
      name: 'Museum Profile',
      url: `${BASE_URL}/museums/profile`,
      method: 'GET'
    },
    {
      name: 'Museum Dashboard Stats',
      url: `${BASE_URL}/museums/dashboard/stats`,
      method: 'GET'
    },
    {
      name: 'Health Check',
      url: `${BASE_URL}/health`,
      method: 'GET'
    }
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`📡 Testing ${endpoint.name}...`);
      console.log(`   URL: ${endpoint.url}`);

      const response = await axios({
        method: endpoint.method,
        url: endpoint.url,
        timeout: 5000,
        // Note: These endpoints require authentication
        // Add Authorization header with valid JWT token for full testing
      });

      console.log(`   ✅ Status: ${response.status}`);
      console.log(`   📊 Response:`, response.data);

    } catch (error) {
      if (error.response) {
        console.log(`   ❌ Status: ${error.response.status}`);
        console.log(`   📝 Error:`, error.response.data);

        if (error.response.status === 401) {
          console.log(`   ℹ️  Note: Authentication required for this endpoint`);
        }
      } else if (error.code === 'ECONNREFUSED') {
        console.log(`   ❌ Connection refused - Server might not be running`);
      } else {
        console.log(`   ❌ Error:`, error.message);
      }
    }
    console.log('');
  }
};

// Run the tests
testEndpoints().catch(console.error);
