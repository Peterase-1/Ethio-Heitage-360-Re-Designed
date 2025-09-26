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

async function testGetAllMuseums() {
  try {
    const response = await fetch(`${API_BASE_URL}/museums?page=1&limit=10`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    if (data.success) {
      console.log('✅ Get All Museums API working');
      console.log('   - Museums found:', data.museums?.length || 0);
      console.log('   - Total museums:', data.pagination?.total || 0);
      console.log('   - Current page:', data.pagination?.page || 0);
      return true;
    } else {
      console.log('❌ Get All Museums API error:', data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Get All Museums error:', error.message);
    return false;
  }
}

async function testMuseumStatistics() {
  try {
    const response = await fetch(`${API_BASE_URL}/museums/statistics?timeRange=30d`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    if (data.success) {
      console.log('✅ Museum Statistics API working');
      console.log('   - Total museums:', data.statistics?.totalMuseums || 0);
      console.log('   - Active museums:', data.statistics?.activeMuseums || 0);
      console.log('   - Pending museums:', data.statistics?.pendingMuseums || 0);
      console.log('   - Approved museums:', data.statistics?.approvedMuseums || 0);
      console.log('   - Rejected museums:', data.statistics?.rejectedMuseums || 0);
      console.log('   - Museums by status:', data.statistics?.museumsByStatus?.length || 0);
      console.log('   - Museums by region:', data.statistics?.museumsByRegion?.length || 0);
      return true;
    } else {
      console.log('❌ Museum Statistics API error:', data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Museum Statistics error:', error.message);
    return false;
  }
}

async function testSearchMuseums() {
  try {
    const response = await fetch(`${API_BASE_URL}/museums/search?q=test&page=1&limit=10`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    if (data.success) {
      console.log('✅ Search Museums API working');
      console.log('   - Search query:', data.searchQuery || 'test');
      console.log('   - Museums found:', data.museums?.length || 0);
      console.log('   - Total results:', data.pagination?.total || 0);
      return true;
    } else {
      console.log('❌ Search Museums API error:', data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Search Museums error:', error.message);
    return false;
  }
}

async function testBulkMuseumActions() {
  try {
    // First, get some museums to perform bulk actions on
    const museumsResponse = await fetch(`${API_BASE_URL}/museums?limit=5`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    const museumsData = await museumsResponse.json();
    if (!museumsData.success || !museumsData.museums?.length) {
      console.log('⚠️  Skipping Bulk Museum Actions test - no museums available');
      return false;
    }

    const museumIds = museumsData.museums.slice(0, 2).map(museum => museum._id);

    const bulkData = {
      action: 'approve',
      museumIds: museumIds
    };

    const response = await fetch(`${API_BASE_URL}/museums/bulk-actions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(bulkData)
    });

    const data = await response.json();
    if (data.success) {
      console.log('✅ Bulk Museum Actions API working');
      console.log('   - Action:', bulkData.action);
      console.log('   - Museums affected:', data.modifiedCount || 0);
      console.log('   - Message:', data.message || 'Success');
      return true;
    } else {
      console.log('❌ Bulk Museum Actions API error:', data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Bulk Museum Actions error:', error.message);
    return false;
  }
}

async function testMuseumPerformance() {
  try {
    const response = await fetch(`${API_BASE_URL}/museums/performance?timeRange=30d`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    if (data.success) {
      console.log('✅ Museum Performance API working');
      console.log('   - Museum stats:', data.performance?.museumStats?.length || 0);
      console.log('   - Artifact stats:', data.performance?.artifactStats || {});
      console.log('   - Rental stats:', data.performance?.rentalStats || {});
      console.log('   - Visitor stats:', data.performance?.visitorStats || {});
      console.log('   - Revenue stats:', data.performance?.revenueStats || {});
      return true;
    } else {
      console.log('❌ Museum Performance API error:', data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Museum Performance error:', error.message);
    return false;
  }
}

async function testMuseumAuditLogs() {
  try {
    const response = await fetch(`${API_BASE_URL}/museums/audit-logs?page=1&limit=10`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    if (data.success) {
      console.log('✅ Museum Audit Logs API working');
      console.log('   - Logs found:', data.logs?.length || 0);
      console.log('   - Total logs:', data.pagination?.total || 0);
      console.log('   - Current page:', data.pagination?.page || 0);
      return true;
    } else {
      console.log('❌ Museum Audit Logs API error:', data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Museum Audit Logs error:', error.message);
    return false;
  }
}

async function testUpdateMuseumStatus() {
  try {
    // First, get a museum to update
    const museumsResponse = await fetch(`${API_BASE_URL}/museums?limit=1`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    const museumsData = await museumsResponse.json();
    if (!museumsData.success || !museumsData.museums?.length) {
      console.log('⚠️  Skipping Update Museum Status test - no museums available');
      return false;
    }

    const museumId = museumsData.museums[0]._id;
    const updateData = {
      status: 'approved',
      reason: 'Test approval'
    };

    const response = await fetch(`${API_BASE_URL}/museums/${museumId}/status`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });

    const data = await response.json();
    if (data.success) {
      console.log('✅ Update Museum Status API working');
      console.log('   - Museum updated:', data.museum?.name || 'Unknown');
      console.log('   - New status:', data.museum?.status || 'Unknown');
      console.log('   - Message:', data.message || 'Success');
      return true;
    } else {
      console.log('❌ Update Museum Status API error:', data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Update Museum Status error:', error.message);
    return false;
  }
}

async function runMuseumOversightTests() {
  console.log('🚀 Starting Museum Oversight Tests...\n');

  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log('❌ Cannot proceed without authentication');
    return;
  }

  console.log('\n🏛️  Testing Museum Oversight APIs...\n');

  const tests = [
    { name: 'Get All Museums', test: testGetAllMuseums },
    { name: 'Museum Statistics', test: testMuseumStatistics },
    { name: 'Search Museums', test: testSearchMuseums },
    { name: 'Bulk Museum Actions', test: testBulkMuseumActions },
    { name: 'Museum Performance', test: testMuseumPerformance },
    { name: 'Museum Audit Logs', test: testMuseumAuditLogs },
    { name: 'Update Museum Status', test: testUpdateMuseumStatus }
  ];

  let passed = 0;
  let failed = 0;

  for (const { name, test } of tests) {
    console.log(`Testing ${name}...`);
    try {
      const result = await test();
      if (result === true) {
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

  console.log('📈 Museum Oversight Test Results:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Total: ${passed + failed}`);

  if (failed === 0) {
    console.log('\n🎉 All Museum Oversight tests passed!');
  } else {
    console.log('\n⚠️  Some tests failed. Check the logs above for details.');
  }
}

// Run the tests
runMuseumOversightTests().catch(console.error);
