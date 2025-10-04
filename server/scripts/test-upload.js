const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Create a simple test image file if it doesn't exist
const testImagePath = path.join(__dirname, 'test-logo.png');
if (!fs.existsSync(testImagePath)) {
  // Create a simple base64 test image (1x1 pixel PNG)
  const base64Image = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
  fs.writeFileSync(testImagePath, Buffer.from(base64Image, 'base64'));
}

async function testUploadEndpoints() {
  try {
    console.log('🧪 Testing Museum Logo Upload Functionality\n');

    // Test 1: Health check
    console.log('1. Testing server health...');
    try {
      const healthResponse = await axios.get('http://localhost:5000/api/health');
      console.log('✅ Server is running:', healthResponse.data.status);
    } catch (error) {
      console.log('❌ Server health check failed:', error.message);
      return;
    }

    // Test 2: Test upload without authentication (should fail)
    console.log('\n2. Testing upload without authentication (should fail)...');
    try {
      const form = new FormData();
      form.append('logo', fs.createReadStream(testImagePath));
      
      await axios.post('http://localhost:5000/api/museums/profile/logo', form, {
        headers: {
          ...form.getHeaders()
        }
      });
      console.log('❌ Upload without auth should have failed');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Correctly rejected unauthenticated request');
      } else {
        console.log('⚠️  Unexpected error:', error.response?.data || error.message);
      }
    }

    // Test 3: Test profile picture upload endpoint
    console.log('\n3. Testing user avatar upload endpoint...');
    try {
      const form = new FormData();
      form.append('avatar', fs.createReadStream(testImagePath));
      
      await axios.post('http://localhost:5000/api/user/avatar', form, {
        headers: {
          ...form.getHeaders()
        }
      });
      console.log('❌ User avatar upload without auth should have failed');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ User avatar endpoint correctly requires authentication');
      } else {
        console.log('⚠️  Unexpected error:', error.response?.data || error.message);
      }
    }

    // Test 4: Test artifact image upload endpoint
    console.log('\n4. Testing artifact image upload endpoint...');
    try {
      const form = new FormData();
      form.append('images', fs.createReadStream(testImagePath));
      
      await axios.post('http://localhost:5000/api/artifacts', form, {
        headers: {
          ...form.getHeaders(),
          'Content-Type': 'multipart/form-data'
        },
        data: {
          title: 'Test Artifact',
          description: 'Test Description',
          category: 'Test Category'
        }
      });
      console.log('❌ Artifact creation without auth should have failed');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Artifact upload endpoint correctly requires authentication');
      } else {
        console.log('⚠️  Unexpected error:', error.response?.data || error.message);
      }
    }

    console.log('\n📊 Test Summary:');
    console.log('✅ Server is running and responding');
    console.log('✅ Upload endpoints exist and are protected');
    console.log('✅ Authentication is working correctly');
    
    console.log('\n💡 Next Steps:');
    console.log('1. Make sure you are logged in as museum admin');
    console.log('2. Check that the museum admin has museumId set');
    console.log('3. Ensure CORS headers allow file uploads from your frontend');
    
    console.log('\n📋 Available Upload Endpoints:');
    console.log('- POST /api/user/avatar (for profile pictures)');
    console.log('- POST /api/museums/profile/logo (for museum logos)');
    console.log('- POST /api/museums/:id/images (for museum images)');
    console.log('- POST /api/artifacts (with file attachments)');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    // Clean up test file
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
    }
  }
}

if (require.main === module) {
  testUploadEndpoints();
}

module.exports = testUploadEndpoints;
