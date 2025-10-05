// Test script to verify rental API endpoints
const fetch = require('node-fetch');

async function testRentalEndpoints() {
  try {
    console.log('Testing rental API endpoints...');

    // Test the rental requests endpoint
    console.log('\n1. Testing /api/rental/requests...');
    const requestsResponse = await fetch('http://localhost:5001/api/rental/requests?page=1&limit=10', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    console.log('Requests endpoint status:', requestsResponse.status);
    if (requestsResponse.ok) {
      const data = await requestsResponse.json();
      console.log('Requests response:', JSON.stringify(data, null, 2));
    } else {
      const errorText = await requestsResponse.text();
      console.log('Requests error:', errorText);
    }

    // Test the rental artifacts endpoint
    console.log('\n2. Testing /api/rental/artifacts...');
    const artifactsResponse = await fetch('http://localhost:5001/api/rental/artifacts', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    console.log('Artifacts endpoint status:', artifactsResponse.status);
    if (artifactsResponse.ok) {
      const data = await artifactsResponse.json();
      console.log('Artifacts response:', JSON.stringify(data, null, 2));
    } else {
      const errorText = await artifactsResponse.text();
      console.log('Artifacts error:', errorText);
    }

    // Test the health endpoint
    console.log('\n3. Testing /api/health...');
    const healthResponse = await fetch('http://localhost:5001/api/health', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    console.log('Health endpoint status:', healthResponse.status);
    if (healthResponse.ok) {
      const data = await healthResponse.json();
      console.log('Health response:', JSON.stringify(data, null, 2));
    } else {
      const errorText = await healthResponse.text();
      console.log('Health error:', errorText);
    }

  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testRentalEndpoints();

