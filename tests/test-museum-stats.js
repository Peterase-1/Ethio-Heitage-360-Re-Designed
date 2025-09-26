// Simple test script to verify museum stats API
const axios = require('axios');

const testMuseumStats = async () => {
  try {
    console.log('Testing Museum Stats API...');

    // Test the dashboard stats endpoint
    const response = await axios.get('http://localhost:5000/api/museums/dashboard/stats', {
      headers: {
        'Authorization': 'Bearer YOUR_JWT_TOKEN_HERE' // Replace with actual token
      }
    });

    console.log('✅ API Response:', response.data);

    if (response.data.success && response.data.data) {
      const stats = response.data.data;
      console.log('📊 Museum Statistics:');
      console.log(`  - Total Artifacts: ${stats.totalArtifacts}`);
      console.log(`  - Total Staff: ${stats.totalStaff}`);
      console.log(`  - Total Events: ${stats.totalEvents}`);
      console.log(`  - Active Rentals: ${stats.activeRentals}`);
      console.log(`  - Monthly Visitors: ${stats.monthlyVisitors}`);
      console.log(`  - Total Revenue: ${stats.totalRevenue}`);
    }

  } catch (error) {
    console.error('❌ API Test Failed:', error.response?.data || error.message);
  }
};

// Uncomment the line below to run the test
// testMuseumStats();

console.log('Museum Stats API Test Script Ready');
console.log('To run the test:');
console.log('1. Make sure the server is running on port 5000');
console.log('2. Replace YOUR_JWT_TOKEN_HERE with a valid JWT token');
console.log('3. Uncomment the testMuseumStats() call at the bottom');
