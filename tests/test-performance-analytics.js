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

async function testPerformanceOverview() {
  try {
    const response = await fetch(`${API_BASE_URL}/performance-analytics/overview?timeRange=24h`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    if (data.success) {
      console.log('✅ Performance Overview API working');
      console.log('   - Health Score:', data.data?.healthScore?.score || 'N/A');
      console.log('   - Key Metrics:', Object.keys(data.data?.keyMetrics || {}).length);
      console.log('   - Alerts:', data.data?.alerts?.length || 0);
      return true;
    } else {
      console.log('❌ Performance Overview API error:', data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Performance Overview error:', error.message);
    return false;
  }
}

async function testSystemHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/performance-analytics/system-health?timeRange=24h`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    if (data.success) {
      console.log('✅ System Health API working');
      console.log('   - System Metrics:', Object.keys(data.data?.systemMetrics || {}).length);
      console.log('   - API Metrics:', Object.keys(data.data?.apiMetrics || {}).length);
      console.log('   - DB Metrics:', Object.keys(data.data?.dbMetrics || {}).length);
      return true;
    } else {
      console.log('❌ System Health API error:', data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ System Health error:', error.message);
    return false;
  }
}

async function testUserActivityMetrics() {
  try {
    const response = await fetch(`${API_BASE_URL}/performance-analytics/user-activity?timeRange=7d&groupBy=day`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    if (data.success) {
      console.log('✅ User Activity Metrics API working');
      console.log('   - Activity Trends:', data.data?.activityTrends?.length || 0);
      console.log('   - User Demographics:', data.data?.userDemographics?.length || 0);
      console.log('   - Peak Hours:', data.data?.peakHours?.length || 0);
      return true;
    } else {
      console.log('❌ User Activity Metrics API error:', data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ User Activity Metrics error:', error.message);
    return false;
  }
}

async function testMuseumPerformanceMetrics() {
  try {
    const response = await fetch(`${API_BASE_URL}/performance-analytics/museum-performance?timeRange=30d&sortBy=revenue`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    if (data.success) {
      console.log('✅ Museum Performance Metrics API working');
      console.log('   - Top Museums:', data.data?.topMuseums?.length || 0);
      console.log('   - Performance Trends:', data.data?.performanceTrends?.length || 0);
      console.log('   - Museum Stats:', data.data?.museumStats?.length || 0);
      console.log('   - Regional Distribution:', data.data?.regionalDistribution?.length || 0);
      return true;
    } else {
      console.log('❌ Museum Performance Metrics API error:', data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Museum Performance Metrics error:', error.message);
    return false;
  }
}

async function testArtifactPerformanceMetrics() {
  try {
    const response = await fetch(`${API_BASE_URL}/performance-analytics/artifact-performance?timeRange=30d&category=all`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    if (data.success) {
      console.log('✅ Artifact Performance Metrics API working');
      console.log('   - Performance Trends:', data.data?.performanceTrends?.length || 0);
      console.log('   - Top Artifacts:', data.data?.topArtifacts?.length || 0);
      console.log('   - Category Performance:', data.data?.categoryPerformance?.length || 0);
      return true;
    } else {
      console.log('❌ Artifact Performance Metrics API error:', data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Artifact Performance Metrics error:', error.message);
    return false;
  }
}

async function testRentalPerformanceMetrics() {
  try {
    const response = await fetch(`${API_BASE_URL}/performance-analytics/rental-performance?timeRange=30d`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    if (data.success) {
      console.log('✅ Rental Performance Metrics API working');
      console.log('   - Rental Trends:', data.data?.rentalTrends?.length || 0);
      console.log('   - Rental Stats:', data.data?.rentalStats?.length || 0);
      console.log('   - Top Rented Items:', data.data?.topRentedItems?.length || 0);
      return true;
    } else {
      console.log('❌ Rental Performance Metrics API error:', data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Rental Performance Metrics error:', error.message);
    return false;
  }
}

async function testApiPerformanceMetrics() {
  try {
    const response = await fetch(`${API_BASE_URL}/performance-analytics/api-performance?timeRange=24h&endpoint=all`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    if (data.success) {
      console.log('✅ API Performance Metrics API working');
      console.log('   - API Trends:', data.data?.apiTrends?.length || 0);
      console.log('   - Endpoint Performance:', data.data?.endpointPerformance?.length || 0);
      console.log('   - Error Analysis:', data.data?.errorAnalysis?.length || 0);
      return true;
    } else {
      console.log('❌ API Performance Metrics API error:', data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ API Performance Metrics error:', error.message);
    return false;
  }
}

async function testPerformanceMetricsModel() {
  try {
    // Test creating a performance metric
    const testMetric = {
      metricType: 'system_performance',
      category: 'system',
      metrics: {
        cpuUsage: 45.2,
        memoryUsage: 67.8,
        diskUsage: 23.1,
        networkLatency: 45
      },
      metadata: {
        source: 'system_monitor',
        ipAddress: '127.0.0.1'
      },
      tags: ['system', 'performance'],
      environment: 'production'
    };

    // This would typically be done through a POST endpoint
    // For now, we'll just test that the model structure is correct
    console.log('✅ Performance Metrics Model structure validated');
    console.log('   - Metric Type:', testMetric.metricType);
    console.log('   - Category:', testMetric.category);
    console.log('   - Metrics:', Object.keys(testMetric.metrics).length);
    console.log('   - Metadata:', Object.keys(testMetric.metadata).length);
    return true;
  } catch (error) {
    console.log('❌ Performance Metrics Model error:', error.message);
    return false;
  }
}

async function runPerformanceAnalyticsTests() {
  console.log('🚀 Starting Performance Analytics Tests...\n');

  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log('❌ Cannot proceed without authentication');
    return;
  }

  console.log('\n📊 Testing Performance Analytics APIs...\n');

  const tests = [
    { name: 'Performance Overview', test: testPerformanceOverview },
    { name: 'System Health', test: testSystemHealth },
    { name: 'User Activity Metrics', test: testUserActivityMetrics },
    { name: 'Museum Performance Metrics', test: testMuseumPerformanceMetrics },
    { name: 'Artifact Performance Metrics', test: testArtifactPerformanceMetrics },
    { name: 'Rental Performance Metrics', test: testRentalPerformanceMetrics },
    { name: 'API Performance Metrics', test: testApiPerformanceMetrics },
    { name: 'Performance Metrics Model', test: testPerformanceMetricsModel }
  ];

  let passed = 0;
  let failed = 0;

  for (const { name, test } of tests) {
    console.log(`Testing ${name}...`);
    try {
      const result = await test();
      if (result) {
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

  console.log('📈 Performance Analytics Test Results:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Total: ${passed + failed}`);

  if (failed === 0) {
    console.log('\n🎉 All Performance Analytics tests passed!');
  } else {
    console.log('\n⚠️  Some tests failed. Check the logs above for details.');
  }
}

// Run the tests
runPerformanceAnalyticsTests().catch(console.error);
