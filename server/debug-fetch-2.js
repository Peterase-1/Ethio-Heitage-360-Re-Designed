const axios = require('axios');

const ADMIN_EMAIL = 'admin@ethioheritage360.com';
const ADMIN_PASSWORD = 'admin123';
const BASE_URL = 'http://localhost:5000/api';

async function debug() {
  try {
    console.log('Logging in...');
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });
    const token = loginRes.data.token;
    const config = { headers: { Authorization: `Bearer ${token}` } };

    console.log('Testing Get All Lessons with invalid courseId...');
    try {
      const res = await axios.get(`${BASE_URL}/learning/admin/lessons?courseId=undefined`, config);
      console.log('Success:', res.data.success);
    } catch (err) {
      console.log('Failed:', err.response ? err.response.data : err.message);
    }

    console.log('Testing Get All Achievements...');
    try {
      const res = await axios.get(`${BASE_URL}/learning/admin/achievements`, config);
      console.log('Success:', res.data.success);
    } catch (err) {
      console.log('Failed:', err.response ? err.response.data : err.message);
    }
  } catch (err) {
    console.log('Debug failed:', err.message);
  }
}

debug();
