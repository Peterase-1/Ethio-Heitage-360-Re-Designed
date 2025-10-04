const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp'); // For creating test images

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

console.log(`${colors.cyan}🚀 EthioHeritage360 - Auto Upload Test Suite${colors.reset}\n`);

class AutoUploadTester {
  constructor() {
    this.baseURL = 'http://localhost:5000';
    this.token = null;
    this.museumId = null;
    this.testFiles = [];
  }

  // Create test images
  async createTestImages() {
    console.log(`${colors.yellow}📸 Creating test images...${colors.reset}`);
    
    const testDir = path.join(__dirname, 'test-uploads');
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }

    // Create different test images
    const images = [
      { name: 'museum-logo.png', width: 300, height: 200, color: '#1976d2' },
      { name: 'profile-avatar.jpg', width: 150, height: 150, color: '#388e3c' },
      { name: 'artifact-image.png', width: 800, height: 600, color: '#f57c00' }
    ];

    for (const img of images) {
      const filePath = path.join(testDir, img.name);
      
      // Create a simple colored rectangle as test image
      try {
        await sharp({
          create: {
            width: img.width,
            height: img.height,
            channels: 4,
            background: { r: 0, g: 0, b: 0, alpha: 1 }
          }
        })
        .png()
        .toFile(filePath);

        this.testFiles.push({
          name: img.name,
          path: filePath,
          type: img.name.includes('logo') ? 'logo' : 
                img.name.includes('avatar') ? 'avatar' : 'artifact'
        });

        console.log(`${colors.green}  ✅ Created: ${img.name}${colors.reset}`);
      } catch (error) {
        // Fallback: create a simple base64 PNG
        const base64PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9jU77kgAAAABJRU5ErkJggg==';
        fs.writeFileSync(filePath, Buffer.from(base64PNG, 'base64'));
        
        this.testFiles.push({
          name: img.name,
          path: filePath,
          type: img.name.includes('logo') ? 'logo' : 
                img.name.includes('avatar') ? 'avatar' : 'artifact'
        });
        
        console.log(`${colors.green}  ✅ Created (fallback): ${img.name}${colors.reset}`);
      }
    }
  }

  // Login and get authentication token
  async authenticate() {
    console.log(`${colors.yellow}🔐 Authenticating museum admin...${colors.reset}`);
    
    try {
      const response = await axios.post(`${this.baseURL}/api/auth/login`, {
        email: 'museum.admin@ethioheritage360.com',
        password: 'museum123'
      });

      if (response.data.success) {
        this.token = response.data.token;
        this.museumId = response.data.user.museumId;
        console.log(`${colors.green}  ✅ Authentication successful${colors.reset}`);
        console.log(`${colors.blue}  🏛️  Museum ID: ${this.museumId}${colors.reset}`);
        return true;
      }
    } catch (error) {
      console.log(`${colors.red}  ❌ Authentication failed: ${error.response?.data?.message || error.message}${colors.reset}`);
      return false;
    }
  }

  // Test museum logo upload
  async testMuseumLogoUpload() {
    console.log(`${colors.yellow}🖼️  Testing museum logo upload...${colors.reset}`);
    
    const logoFile = this.testFiles.find(f => f.type === 'logo');
    if (!logoFile) {
      console.log(`${colors.red}  ❌ No logo test file found${colors.reset}`);
      return false;
    }

    try {
      const form = new FormData();
      form.append('logo', fs.createReadStream(logoFile.path));

      const response = await axios.post(
        `${this.baseURL}/api/museums/profile/logo`,
        form,
        {
          headers: {
            ...form.getHeaders(),
            'Authorization': `Bearer ${this.token}`
          }
        }
      );

      if (response.data.success) {
        console.log(`${colors.green}  ✅ Museum logo uploaded successfully!${colors.reset}`);
        console.log(`${colors.cyan}  📷 Logo URL: ${response.data.data.logo.url}${colors.reset}`);
        return true;
      }
    } catch (error) {
      console.log(`${colors.red}  ❌ Logo upload failed: ${error.response?.data?.error?.message || error.message}${colors.reset}`);
      return false;
    }
  }

  // Test profile avatar upload
  async testProfileAvatarUpload() {
    console.log(`${colors.yellow}👤 Testing profile avatar upload...${colors.reset}`);
    
    const avatarFile = this.testFiles.find(f => f.type === 'avatar');
    if (!avatarFile) {
      console.log(`${colors.red}  ❌ No avatar test file found${colors.reset}`);
      return false;
    }

    try {
      const form = new FormData();
      form.append('avatar', fs.createReadStream(avatarFile.path));

      const response = await axios.post(
        `${this.baseURL}/api/user/avatar`,
        form,
        {
          headers: {
            ...form.getHeaders(),
            'Authorization': `Bearer ${this.token}`
          }
        }
      );

      if (response.data.success) {
        console.log(`${colors.green}  ✅ Profile avatar uploaded successfully!${colors.reset}`);
        console.log(`${colors.cyan}  👤 Avatar URL: ${response.data.data.avatar}${colors.reset}`);
        return true;
      }
    } catch (error) {
      console.log(`${colors.red}  ❌ Avatar upload failed: ${error.response?.data?.message || error.message}${colors.reset}`);
      return false;
    }
  }

  // Test artifact creation with image
  async testArtifactUpload() {
    console.log(`${colors.yellow}🏺 Testing artifact upload...${colors.reset}`);
    
    const artifactFile = this.testFiles.find(f => f.type === 'artifact');
    if (!artifactFile) {
      console.log(`${colors.red}  ❌ No artifact test file found${colors.reset}`);
      return false;
    }

    try {
      const form = new FormData();
      form.append('images', fs.createReadStream(artifactFile.path));
      form.append('title', 'Auto Test Artifact');
      form.append('description', 'This is an automatically created test artifact');
      form.append('category', 'Test');
      form.append('condition', 'excellent');
      form.append('status', 'in_storage');

      const response = await axios.post(
        `${this.baseURL}/api/artifacts`,
        form,
        {
          headers: {
            ...form.getHeaders(),
            'Authorization': `Bearer ${this.token}`
          }
        }
      );

      if (response.data.success) {
        console.log(`${colors.green}  ✅ Artifact uploaded successfully!${colors.reset}`);
        console.log(`${colors.cyan}  🏺 Artifact ID: ${response.data.data._id}${colors.reset}`);
        return true;
      }
    } catch (error) {
      console.log(`${colors.red}  ❌ Artifact upload failed: ${error.response?.data?.error?.message || error.message}${colors.reset}`);
      return false;
    }
  }

  // Clean up test files
  cleanup() {
    console.log(`${colors.yellow}🧹 Cleaning up test files...${colors.reset}`);
    
    this.testFiles.forEach(file => {
      try {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
          console.log(`${colors.green}  ✅ Deleted: ${file.name}${colors.reset}`);
        }
      } catch (error) {
        console.log(`${colors.red}  ❌ Failed to delete: ${file.name}${colors.reset}`);
      }
    });

    // Remove test directory if empty
    try {
      const testDir = path.join(__dirname, 'test-uploads');
      if (fs.existsSync(testDir)) {
        fs.rmdirSync(testDir);
        console.log(`${colors.green}  ✅ Removed test directory${colors.reset}`);
      }
    } catch (error) {
      // Directory not empty or other error - ignore
    }
  }

  // Run all tests
  async runTests() {
    console.log(`${colors.bright}🧪 Starting Automatic Upload Tests${colors.reset}\n`);
    
    const results = {
      authentication: false,
      logoUpload: false,
      avatarUpload: false,
      artifactUpload: false
    };

    try {
      // Step 1: Create test images
      await this.createTestImages();

      // Step 2: Authenticate
      results.authentication = await this.authenticate();
      if (!results.authentication) {
        throw new Error('Authentication failed - cannot proceed with upload tests');
      }

      // Step 3: Test uploads
      results.logoUpload = await this.testMuseumLogoUpload();
      results.avatarUpload = await this.testProfileAvatarUpload();
      results.artifactUpload = await this.testArtifactUpload();

    } catch (error) {
      console.log(`${colors.red}💥 Test suite failed: ${error.message}${colors.reset}`);
    } finally {
      // Always cleanup
      this.cleanup();
    }

    // Print summary
    this.printSummary(results);
    return results;
  }

  // Print test summary
  printSummary(results) {
    console.log(`\n${colors.bright}📊 Test Summary${colors.reset}`);
    console.log('=====================================');
    
    const tests = [
      { name: 'Authentication', status: results.authentication },
      { name: 'Museum Logo Upload', status: results.logoUpload },
      { name: 'Profile Avatar Upload', status: results.avatarUpload },
      { name: 'Artifact Image Upload', status: results.artifactUpload }
    ];

    tests.forEach(test => {
      const icon = test.status ? '✅' : '❌';
      const color = test.status ? colors.green : colors.red;
      console.log(`${color}${icon} ${test.name}${colors.reset}`);
    });

    const passedTests = tests.filter(t => t.status).length;
    const totalTests = tests.length;
    
    console.log(`\n${colors.cyan}Result: ${passedTests}/${totalTests} tests passed${colors.reset}`);
    
    if (passedTests === totalTests) {
      console.log(`${colors.green}🎉 All upload functionality is working perfectly!${colors.reset}`);
    } else {
      console.log(`${colors.yellow}⚠️  Some upload features need attention${colors.reset}`);
    }
  }
}

// Run the tests
async function runAutoUploadTest() {
  const tester = new AutoUploadTester();
  const results = await tester.runTests();
  process.exit(results.authentication ? 0 : 1);
}

// Run if called directly
if (require.main === module) {
  runAutoUploadTest();
}

module.exports = AutoUploadTester;
