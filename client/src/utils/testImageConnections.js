// Test utility to verify image connections for courses
import imageMapper from '../services/imageMapperService.js';
import learningService from '../services/learningService.js';

/**
 * Test image connections for all courses
 * This utility helps verify that all courses have properly connected images
 */
export async function testImageConnections() {
  console.log('🖼️ Testing Ethiopian Heritage Image Connections...\n');
  
  try {
    // Get all courses
    const courses = await learningService.getCourses();
    console.log(`📚 Found ${courses.length} courses to test\n`);
    
    // Test each course
    const results = [];
    for (const course of courses) {
      const result = await testCourseImages(course);
      results.push(result);
    }
    
    // Display summary
    displayTestSummary(results);
    
    // Test image mapper statistics
    const stats = imageMapper.getImageStats();
    console.log('\n📊 Image Mapper Statistics:');
    console.log(`Total images available: ${stats.totalImages}`);
    console.log(`Clean images (no duplicates): ${stats.cleanImages}`);
    console.log(`Categories covered: ${stats.categories}`);
    console.log(`Mapping rules: ${stats.mappings}`);
    
    return results;
  } catch (error) {
    console.error('❌ Error testing image connections:', error);
    return [];
  }
}

/**
 * Test images for a single course
 * @param {Object} course - Course to test
 * @returns {Object} Test result
 */
async function testCourseImages(course) {
  const result = {
    courseId: course.id,
    title: course.title,
    category: course.category,
    primaryImage: course.image,
    recommendedImages: [],
    status: 'unknown',
    errors: []
  };
  
  try {
    // Test primary image
    const isValidPrimary = await imageMapper.validateImage(course.image);
    
    // Get recommended images
    const recommended = imageMapper.getRecommendedImages(course, 3);
    result.recommendedImages = recommended;
    
    // Test recommended images
    const validRecommended = [];
    for (const imgPath of recommended) {
      const isValid = await imageMapper.validateImage(imgPath);
      if (isValid) {
        validRecommended.push(imgPath);
      }
    }
    
    // Determine status
    if (isValidPrimary && validRecommended.length >= 2) {
      result.status = 'excellent';
    } else if (isValidPrimary && validRecommended.length >= 1) {
      result.status = 'good';
    } else if (isValidPrimary) {
      result.status = 'basic';
    } else {
      result.status = 'needs-attention';
      result.errors.push('Primary image failed validation');
    }
    
    // Log result
    const statusEmoji = getStatusEmoji(result.status);
    console.log(`${statusEmoji} ${course.title}`);
    console.log(`   📁 Category: ${course.category}`);
    console.log(`   🖼️ Primary: ${course.image}`);
    console.log(`   🎯 Status: ${result.status}`);
    if (result.errors.length > 0) {
      console.log(`   ⚠️ Issues: ${result.errors.join(', ')}`);
    }
    console.log('');
    
  } catch (error) {
    result.status = 'error';
    result.errors.push(error.message);
    console.log(`❌ ${course.title} - Error: ${error.message}\n`);
  }
  
  return result;
}

/**
 * Display test summary
 * @param {Array} results - Test results
 */
function displayTestSummary(results) {
  console.log('\n📋 Test Summary:');
  console.log('================');
  
  const statusCounts = {
    excellent: 0,
    good: 0,
    basic: 0,
    'needs-attention': 0,
    error: 0
  };
  
  results.forEach(result => {
    statusCounts[result.status]++;
  });
  
  console.log(`✅ Excellent: ${statusCounts.excellent} courses`);
  console.log(`👍 Good: ${statusCounts.good} courses`);
  console.log(`📝 Basic: ${statusCounts.basic} courses`);
  console.log(`⚠️ Needs Attention: ${statusCounts['needs-attention']} courses`);
  console.log(`❌ Errors: ${statusCounts.error} courses`);
  
  const totalTested = results.length;
  const successfulTests = totalTested - statusCounts.error;
  const successRate = totalTested > 0 ? ((successfulTests / totalTested) * 100).toFixed(1) : 0;
  
  console.log(`\n🎯 Success Rate: ${successRate}% (${successfulTests}/${totalTested})`);
  
  // Show courses that need attention
  const problemCourses = results.filter(r => r.status === 'needs-attention' || r.status === 'error');
  if (problemCourses.length > 0) {
    console.log('\n🔧 Courses needing attention:');
    problemCourses.forEach(course => {
      console.log(`   - ${course.title}: ${course.errors.join(', ')}`);
    });
  }
}

/**
 * Get emoji for status
 * @param {string} status - Status string
 * @returns {string} Emoji
 */
function getStatusEmoji(status) {
  const emojis = {
    excellent: '🌟',
    good: '✅',
    basic: '📝',
    'needs-attention': '⚠️',
    error: '❌'
  };
  return emojis[status] || '❓';
}

/**
 * Display available images by category
 */
export function displayImagesByCategory() {
  console.log('🗂️ Available Images by Category:\n');
  
  const categories = imageMapper.getCategories();
  categories.forEach(category => {
    const images = imageMapper.getImagesByCategory(category.id);
    console.log(`${category.icon} ${category.name} (${images.length} images):`);
    images.forEach(img => {
      console.log(`   - ${img.title}`);
      console.log(`     📁 ${img.url}`);
    });
    console.log('');
  });
}

/**
 * Test specific course image mapping
 * @param {number} courseId - Course ID to test
 */
export async function testSpecificCourse(courseId) {
  console.log(`🔍 Testing Course ID: ${courseId}\n`);
  
  try {
    const courses = await learningService.getCourses();
    const course = courses.find(c => c.id === courseId);
    
    if (!course) {
      console.log(`❌ Course with ID ${courseId} not found`);
      return;
    }
    
    const result = await testCourseImages(course);
    
    console.log('\n🔧 Detailed Results:');
    console.log(`Course: ${result.title}`);
    console.log(`Category: ${result.category}`);
    console.log(`Primary Image: ${result.primaryImage}`);
    console.log(`Status: ${result.status}`);
    
    if (result.recommendedImages.length > 0) {
      console.log('\n🎨 Recommended Images:');
      result.recommendedImages.forEach((img, index) => {
        console.log(`${index + 1}. ${img}`);
      });
    }
    
    if (result.errors.length > 0) {
      console.log('\n⚠️ Issues:');
      result.errors.forEach(error => {
        console.log(`- ${error}`);
      });
    }
    
    return result;
  } catch (error) {
    console.error('❌ Error testing specific course:', error);
  }
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  window.testImageConnections = testImageConnections;
  window.displayImagesByCategory = displayImagesByCategory;
  window.testSpecificCourse = testSpecificCourse;
}
