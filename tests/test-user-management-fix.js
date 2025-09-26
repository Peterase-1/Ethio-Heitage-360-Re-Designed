const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testUserManagementFix() {
  console.log('🧪 Testing User Management Fix...\n');

  // First, let's test the health endpoint to make sure the server is responding
  try {
    console.log('Testing server health...');
    const healthResponse = await fetch('http://localhost:5000/api/health', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ Server is healthy!');
      console.log('   - Status:', healthData.status);
    } else {
      console.log('❌ Server health check failed');
      return;
    }
  } catch (error) {
    console.log('❌ Cannot connect to server:', error.message);
    return;
  }

  try {
    // Test the users endpoint
    console.log('\nTesting GET /api/super-admin/users...');
    const response = await fetch('http://localhost:5000/api/super-admin/users?page=1&limit=10', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Users API is working!');
      console.log('   - Status:', response.status);
      console.log('   - Success:', data.success);
      console.log('   - Users found:', data.users?.length || 0);
      console.log('   - Total users:', data.pagination?.total || 0);
    } else {
      console.log('❌ Users API failed');
      console.log('   - Status:', response.status);
      const errorText = await response.text();
      console.log('   - Error:', errorText);
    }
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }

  try {
    // Test the user statistics endpoint
    console.log('\nTesting GET /api/super-admin/users/statistics...');
    const response = await fetch('http://localhost:5000/api/super-admin/users/statistics?timeRange=30d', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ User Statistics API is working!');
      console.log('   - Status:', response.status);
      console.log('   - Success:', data.success);
      console.log('   - Total users:', data.statistics?.totalUsers || 0);
    } else {
      console.log('❌ User Statistics API failed');
      console.log('   - Status:', response.status);
      const errorText = await response.text();
      console.log('   - Error:', errorText);
    }
  } catch (error) {
    console.log('❌ Statistics test failed:', error.message);
  }
}

// Run the test
testUserManagementFix().catch(console.error);
