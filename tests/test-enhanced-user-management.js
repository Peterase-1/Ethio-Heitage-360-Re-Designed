const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const API_BASE_URL = 'http://localhost:5000/api/super-admin';
const AUTH_URL = 'http://localhost:5000/api/auth/login';

let authToken = '';

async function login() {
  try {
    const response = await fetch(AUTH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'superadmin@example.com',
        password: 'superadmin123'
      })
    });

    const data = await response.json();
    if (data.success && data.token) {
      authToken = data.token;
      console.log('✅ Login successful');
      return true;
    } else {
      console.log('❌ Login failed:', data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Login error:', error.message);
    return false;
  }
}

async function testGetAllUsers() {
  try {
    const response = await fetch(`${API_BASE_URL}/users?page=1&limit=10`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    if (data.success) {
      console.log('✅ Get All Users API working');
      console.log('   - Users found:', data.users?.length || 0);
      console.log('   - Total users:', data.pagination?.total || 0);
      console.log('   - Current page:', data.pagination?.page || 0);
      return true;
    } else {
      console.log('❌ Get All Users API error:', data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Get All Users error:', error.message);
    return false;
  }
}

async function testCreateUser() {
  try {
    const userData = {
      name: 'Test User',
      email: 'testuser@example.com',
      password: 'testpassword123',
      role: 'visitor',
      isActive: true
    };

    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });

    const data = await response.json();
    if (data.success) {
      console.log('✅ Create User API working');
      console.log('   - User created:', data.user?.name || 'Unknown');
      console.log('   - User email:', data.user?.email || 'Unknown');
      console.log('   - User role:', data.user?.role || 'Unknown');
      return { success: true, userId: data.user?._id };
    } else {
      console.log('❌ Create User API error:', data.message);
      return { success: false };
    }
  } catch (error) {
    console.log('❌ Create User error:', error.message);
    return { success: false };
  }
}

async function testUpdateUser(userId) {
  if (!userId) {
    console.log('⚠️  Skipping Update User test - no user ID available');
    return false;
  }

  try {
    const updateData = {
      name: 'Updated Test User',
      role: 'museum_admin',
      isActive: true
    };

    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });

    const data = await response.json();
    if (data.success) {
      console.log('✅ Update User API working');
      console.log('   - User updated:', data.user?.name || 'Unknown');
      console.log('   - New role:', data.user?.role || 'Unknown');
      return true;
    } else {
      console.log('❌ Update User API error:', data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Update User error:', error.message);
    return false;
  }
}

async function testBulkUserActions() {
  try {
    // First, get some users to perform bulk actions on
    const usersResponse = await fetch(`${API_BASE_URL}/users?limit=5`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    const usersData = await usersResponse.json();
    if (!usersData.success || !usersData.users?.length) {
      console.log('⚠️  Skipping Bulk Actions test - no users available');
      return false;
    }

    const userIds = usersData.users.slice(0, 2).map(user => user._id);

    const bulkData = {
      action: 'activate',
      userIds: userIds
    };

    const response = await fetch(`${API_BASE_URL}/users/bulk-actions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(bulkData)
    });

    const data = await response.json();
    if (data.success) {
      console.log('✅ Bulk User Actions API working');
      console.log('   - Action:', bulkData.action);
      console.log('   - Users affected:', data.modifiedCount || 0);
      console.log('   - Message:', data.message || 'Success');
      return true;
    } else {
      console.log('❌ Bulk User Actions API error:', data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Bulk User Actions error:', error.message);
    return false;
  }
}

async function testUserStatistics() {
  try {
    const response = await fetch(`${API_BASE_URL}/users/statistics?timeRange=30d`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    if (data.success) {
      console.log('✅ User Statistics API working');
      console.log('   - Total users:', data.statistics?.totalUsers || 0);
      console.log('   - Active users:', data.statistics?.activeUsers || 0);
      console.log('   - New users:', data.statistics?.newUsers || 0);
      console.log('   - Users by role:', data.statistics?.usersByRole?.length || 0);
      console.log('   - User activity data points:', data.statistics?.userActivity?.length || 0);
      return true;
    } else {
      console.log('❌ User Statistics API error:', data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ User Statistics error:', error.message);
    return false;
  }
}

async function testSearchUsers() {
  try {
    const response = await fetch(`${API_BASE_URL}/users/search?q=test&page=1&limit=10`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    if (data.success) {
      console.log('✅ Search Users API working');
      console.log('   - Search query:', data.searchQuery || 'test');
      console.log('   - Users found:', data.users?.length || 0);
      console.log('   - Total results:', data.pagination?.total || 0);
      return true;
    } else {
      console.log('❌ Search Users API error:', data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Search Users error:', error.message);
    return false;
  }
}

async function testUserVerification() {
  try {
    // First, get a user to verify
    const usersResponse = await fetch(`${API_BASE_URL}/users?limit=1`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    const usersData = await usersResponse.json();
    if (!usersData.success || !usersData.users?.length) {
      console.log('⚠️  Skipping User Verification test - no users available');
      return false;
    }

    const userId = usersData.users[0]._id;
    const verifyData = {
      verificationStatus: 'verified',
      notes: 'Test verification'
    };

    const response = await fetch(`${API_BASE_URL}/users/${userId}/verify`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(verifyData)
    });

    const data = await response.json();
    if (data.success) {
      console.log('✅ User Verification API working');
      console.log('   - User verified:', data.user?.name || 'Unknown');
      console.log('   - Verification status:', data.user?.profile?.verificationStatus || 'Unknown');
      return true;
    } else {
      console.log('❌ User Verification API error:', data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ User Verification error:', error.message);
    return false;
  }
}

async function testDeleteUser(userId) {
  if (!userId) {
    console.log('⚠️  Skipping Delete User test - no user ID available');
    return false;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    if (data.success) {
      console.log('✅ Delete User API working');
      console.log('   - Message:', data.message || 'User deleted');
      return true;
    } else {
      console.log('❌ Delete User API error:', data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Delete User error:', error.message);
    return false;
  }
}

async function runEnhancedUserManagementTests() {
  console.log('🚀 Starting Enhanced User Management Tests...\n');

  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log('❌ Cannot proceed without authentication');
    return;
  }

  console.log('\n👥 Testing Enhanced User Management APIs...\n');

  const tests = [
    { name: 'Get All Users', test: testGetAllUsers },
    { name: 'Create User', test: testCreateUser },
    { name: 'User Statistics', test: testUserStatistics },
    { name: 'Search Users', test: testSearchUsers },
    { name: 'Bulk User Actions', test: testBulkUserActions },
    { name: 'User Verification', test: testUserVerification }
  ];

  let passed = 0;
  let failed = 0;
  let createdUserId = null;

  for (const { name, test } of tests) {
    console.log(`Testing ${name}...`);
    try {
      const result = await test();
      if (result && typeof result === 'object' && result.success && result.userId) {
        createdUserId = result.userId;
        passed++;
      } else if (result === true) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${name} failed with error:`, error.message);
      failed++;
    }
    console.log('');
  }

  // Test update and delete with created user
  if (createdUserId) {
    console.log('Testing Update User...');
    try {
      const updateResult = await testUpdateUser(createdUserId);
      if (updateResult) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      console.log('❌ Update User failed:', error.message);
      failed++;
    }
    console.log('');

    console.log('Testing Delete User...');
    try {
      const deleteResult = await testDeleteUser(createdUserId);
      if (deleteResult) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      console.log('❌ Delete User failed:', error.message);
      failed++;
    }
    console.log('');
  }

  console.log('📈 Enhanced User Management Test Results:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Total: ${passed + failed}`);

  if (failed === 0) {
    console.log('\n🎉 All Enhanced User Management tests passed!');
  } else {
    console.log('\n⚠️  Some tests failed. Check the logs above for details.');
  }
}

// Run the tests
runEnhancedUserManagementTests().catch(console.error);
