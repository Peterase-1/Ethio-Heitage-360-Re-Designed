// Test script to verify museum dashboard API
const fetch = require('node-fetch');

async function testMuseumDashboard() {
  try {
    console.log('Testing museum dashboard API...');

    // Test the API endpoint
    const response = await fetch('http://localhost:5001/api/museum-admin/dashboard', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Note: This will fail without proper authentication
        // 'Authorization': 'Bearer <token>'
      }
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (response.ok) {
      const data = await response.json();
      console.log('Response data:', JSON.stringify(data, null, 2));
    } else {
      const errorText = await response.text();
      console.log('Error response:', errorText);
    }

  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testMuseumDashboard();
