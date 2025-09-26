const axios = require('axios');

async function testPlatformStats() {
    console.log('🧪 Testing API endpoints...');
    
    // Test existing endpoints first
    try {
        console.log('\n1. Testing health endpoint...');
        const health = await axios.get('http://localhost:5000/api/health');
        console.log('✅ Health endpoint works');
    } catch (error) {
        console.error('❌ Health endpoint failed:', error.message);
    }
    
    try {
        console.log('\n2. Testing courses endpoint...');
        const courses = await axios.get('http://localhost:5000/api/courses');
        console.log('✅ Courses endpoint works, found', courses.data.total || 0, 'courses');
    } catch (error) {
        console.error('❌ Courses endpoint failed:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
    }
    
    try {
        console.log('\n3. Testing platform stats endpoint...');
        const response = await axios.get('http://localhost:5000/api/platform/stats', {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ API Response Status:', response.status);
        console.log('✅ API Response Data:', JSON.stringify(response.data, null, 2));
        
        // Check if the response has the expected structure
        const data = response.data;
        if (data.success) {
            console.log('\n📊 Platform Statistics:');
            console.log('- Total Courses:', data.stats?.totalCourses || 0);
            console.log('- Total Learners:', data.stats?.totalLearners || 0);
            console.log('- Featured Courses:', data.featured?.courses?.length || 0);
            console.log('- Categories:', data.categories?.length || 0);
            console.log('- Museums:', data.featured?.museums?.length || 0);
            console.log('- Artifacts:', data.featured?.artifacts?.length || 0);
            console.log('- Events:', data.upcoming?.events?.length || 0);
        } else {
            console.error('❌ API returned success: false');
        }
        
    } catch (error) {
        console.error('❌ Error testing platform stats API:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
    }
}

testPlatformStats();
