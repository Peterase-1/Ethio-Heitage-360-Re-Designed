const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';
let authToken = null;
let seedCourseId = null;

async function login() {
  try {
    console.log('Logging in as Admin (admin@ethioheritage360.com)...');
    const response = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@ethioheritage360.com',
      password: 'admin123'
    });
    authToken = response.data.token;
    console.log('✅ Login Successful');
    return true;
  } catch (error) {
    console.log('❌ Login Failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function verifySeededCourses() {
  try {
    console.log('\nFetching Public Courses...');
    // Should be visible publicly
    const response = await axios.get(`${API_BASE}/education-hub/courses`);
    const courses = response.data.data;

    console.log(`Found ${courses.length} courses.`);

    const aksumCourse = courses.find(c => c.title.includes('Aksumite'));
    if (aksumCourse) {
      console.log('✅ Found seeded course: Aksumite Civilization Deep Dive');
      seedCourseId = aksumCourse.id || aksumCourse._id;
    } else {
      console.log('❌ Could not find seeded "Aksumite" course.');
    }

    const amharicCourse = courses.find(c => c.title.includes('Amharic'));
    if (amharicCourse) console.log('✅ Found seeded course: Amharic Language Basics');

  } catch (error) {
    console.log('❌ Error fetching courses:', error.message);
  }
}

async function testCRUD() {
  if (!authToken || !seedCourseId) {
    console.log('Skipping CRUD tests due to missing token or course ID.');
    return;
  }

  try {
    console.log(`\nTesting UPDATE on course ${seedCourseId}...`);
    // Note: The correct endpoint for course management might be /api/learning/courses/:id or similar depending on controller mapping
    // educationRoutes.js did NOT have update routes. Wait.
    // educationRoutes.js only had GET and enroll/progress routes!
    // The prompt asked for "Super admin can Crud Causes".
    // I need to find the CRUD routes. 
    // Based on `server.js`: `app.use('/api/learning', courseManagementRoutes);`
    // Let's assume the standard CRUD is there.

    const updateData = {
      title: 'Aksumite Civilization Deep Dive (Updated)',
      description: 'Updated description for verification.'
    };

    const updateResponse = await axios.put(`${API_BASE}/learning/admin/courses/${seedCourseId}`, updateData, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    if (updateResponse.data.success) {
      console.log('✅ Course Updated Successfully');
    }

  } catch (error) {
    console.log('❌ Update Failed:', error.response?.data?.message || error.message);
    console.log('Status:', error.response?.status);
  }

  try {
    console.log('\nTesting CREATE new course...');
    const newCourse = {
      title: 'CRUD Verification Course',
      description: 'Course created by automated test',
      category: 'history',
      difficulty: 'beginner',
      estimatedDuration: 60,
      instructor: {
        name: 'Admin Tester',
        email: 'admin@test.com'
      },
      isActive: true, // Will map to 'published'
      price: 0
    };

    // Note: Check what the create endpoint is. Likely POST /api/learning/courses
    const createResponse = await axios.post(`${API_BASE}/learning/admin/courses`, newCourse, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    if (createResponse.data.success) {
      console.log('✅ Course Created Successfully');
      const newId = createResponse.data.data.id || createResponse.data.data._id;

      // Clean up
      console.log('Cleaning up (Deleting created course)...');
      await axios.delete(`${API_BASE}/learning/admin/courses/${newId}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      console.log('✅ Course Deleted Successfully');
    }

  } catch (error) {
    console.log('❌ Create Failed:', error.response?.data?.message || error.message);
    console.log('Status:', error.response?.status);
  }
}

async function run() {
  if (await login()) {
    await verifySeededCourses();
    await testCRUD();
  }
}

run();
