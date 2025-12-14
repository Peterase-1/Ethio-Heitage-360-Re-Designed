const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000';

async function testMuseumAdminCommunications() {
  try {
    console.log('🧪 Testing Museum Admin Communications...');

    // Step 1: Login as Museum Admin
    console.log('\n🔐 Step 1: Login as Museum Admin');
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'museum.admin@ethioheritage360.com',
        password: 'museum123'
      })
    });

    const loginData = await loginResponse.json();
    console.log('Login status:', loginResponse.status);
    console.log('Login success:', loginData.success);

    if (!loginData.success || !loginData.token) {
      console.log('❌ Login failed:', loginData.message);
      return;
    }

    const token = loginData.token;
    console.log('✅ Login successful');
    console.log('Token (first 20 chars):', token.substring(0, 20) + '...');

    // Step 2: Test communications API
    console.log('\n📨 Step 2: Test communications API');
    const commsResponse = await fetch(`${BASE_URL}/api/communications`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const commsData = await commsResponse.json();
    console.log('Communications status:', commsResponse.status);
    console.log('Communications success:', commsData.success);
    console.log('Communications count:', commsData.data?.length || 0);

    if (commsData.success && commsData.data) {
      console.log('\n📋 Communications found:');
      commsData.data.forEach((comm, index) => {
        console.log(`  ${index + 1}. ${comm.subject}`);
        console.log(`     From: ${comm.from?.name} (${comm.from?.email})`);
        console.log(`     To: ${comm.to?.name} (${comm.to?.email})`);
        console.log(`     Type: ${comm.type}, Status: ${comm.status}`);
        console.log(`     Created: ${comm.createdAt}`);
        console.log('     ---');
      });
    } else {
      console.log('❌ No communications found or API error');
      console.log('Response:', commsData);
    }

    // Step 3: Test unread count
    console.log('\n🔔 Step 3: Test unread count');
    const unreadResponse = await fetch(`${BASE_URL}/api/communications/unread-count`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const unreadData = await unreadResponse.json();
    console.log('Unread count status:', unreadResponse.status);
    console.log('Unread count:', unreadData.count || 0);

    console.log('\n✅ Museum Admin communications test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testMuseumAdminCommunications();




