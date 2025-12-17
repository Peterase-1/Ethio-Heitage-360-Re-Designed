const axios = require('axios');
const assert = require('assert');

const API_BASE = 'http://localhost:5000/api';
const ADMIN_EMAIL = 'admin@ethioheritage360.com';
const ADMIN_PASSWORD = 'admin123';

let authToken = '';
let testTourId = '';

async function apiRequest(method, endpoint, data = null, token = authToken) {
  try {
    const config = {
      method,
      url: `${API_BASE}${endpoint}`,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      data
    };
    const response = await axios(config);
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      const data = error.response.data;
      throw new Error(data.message + (data.error ? `: ${data.error}` : ''));
    }
    throw error;
  }
}

async function runTests() {
  console.log('🚀 Starting Educational Tour CRUD Tests...\n');

  try {
    // 1. Authenticate as Admin
    console.log('🔐 Authenticating as admin...');
    const loginRes = await apiRequest('POST', '/auth/login', {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });
    authToken = loginRes.token;
    console.log('✅ Admin authenticated\n');

    // 2. Create Educational Tour
    console.log('📝 Testing Create Educational Tour...');
    const tourData = {
      title: 'Historical Tour of Gondar Castles',
      description: 'Experience the "Camelot of Africa" with our expert guides.',
      category: 'Cultural Heritage',
      difficulty: 'Intermediate',
      startDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
      endDate: new Date(Date.now() + 172800000).toISOString(),   // Day after
      duration: 4,
      maxParticipants: 15,
      location: {
        name: 'Gondar, Ethiopia',
        address: 'Fasil Ghebbi complex',
        meetingPoint: 'Main Gate'
      },
      pricing: {
        price: 500,
        currency: 'ETB'
      },
      learningObjectives: ['Understand the history of the Solomonic dynasty', 'Identify key architectural features of Gondar castles'],
      curriculum: [
        { title: 'Introduction to Fasilides Bath', description: 'Brief history and architectural overview', duration: 30, order: 1 },
        { title: 'The Palace of Kuskuam', description: 'Detailed tour of the Empress Mentewab complex', duration: 60, order: 2 }
      ],
      status: 'published'
    };

    const createRes = await apiRequest('POST', '/educational-tours', tourData);
    assert(createRes.success, 'Tour creation should succeed');
    assert(createRes.data._id, 'Tour should have an ID');
    testTourId = createRes.data._id;
    console.log('✅ Create Tour successful\n');

    // 3. Get All Educational Tours
    console.log('🔍 Testing Get All Educational Tours...');
    const getAllRes = await apiRequest('GET', '/educational-tours');
    assert(getAllRes.success, 'Fetch all tours should succeed');
    assert(Array.isArray(getAllRes.data), 'Should return an array of tours');
    console.log(`✅ Get All Tours successful (${getAllRes.data.length} found)\n`);

    // 4. Get Single Educational Tour
    console.log('🔍 Testing Get Single Educational Tour...');
    const getSingleRes = await apiRequest('GET', `/educational-tours/${testTourId}`);
    assert(getSingleRes.success, 'Fetch single tour should succeed');
    assert(getSingleRes.data.title === tourData.title, 'Title should match');
    console.log('✅ Get Single Tour successful\n');

    // 5. Update Educational Tour
    console.log('✏️ Testing Update Educational Tour...');
    const updateData = { title: 'Updated Gondar Castles Tour', maxParticipants: 20 };
    const updateRes = await apiRequest('PUT', `/educational-tours/${testTourId}`, updateData);
    assert(updateRes.success, 'Update tour should succeed');
    assert(updateRes.data.title === updateData.title, 'Title should be updated');
    console.log('✅ Update Tour successful\n');

    // 6. Delete (Archive) Educational Tour
    console.log('🗑️ Testing Delete (Archive) Educational Tour...');
    const deleteRes = await apiRequest('DELETE', `/educational-tours/${testTourId}`);
    assert(deleteRes.success, 'Delete tour should succeed');
    console.log('✅ Delete Tour successful\n');

    console.log('✨ All Educational Tour CRUD tests passed!\n');
  } catch (error) {
    console.error('❌ Test failed!');
    console.error(error.message || error);
    process.exit(1);
  }
}

runTests();
