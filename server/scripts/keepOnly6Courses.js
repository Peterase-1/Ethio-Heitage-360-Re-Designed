const mongoose = require('mongoose');
const Course = require('../models/Course');
const User = require('../models/User');
require('dotenv').config();

async function keepOnly6Courses() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get the organizer
    const organizer = await User.findOne({ role: 'organizer' });
    if (!organizer) {
      console.log('No organizer found');
      return;
    }

    console.log('Using organizer:', organizer.firstName, organizer.lastName);

    // 1. First, delete ALL non-organizer courses completely
    const deletedNonOrganizerCourses = await Course.deleteMany({
      organizerId: { $exists: false }
    });
    console.log(`🗑️ Deleted ${deletedNonOrganizerCourses.deletedCount} non-organizer courses completely`);

    // 2. Get all organizer courses, sorted by creation date (newest first)
    const allOrganizerCourses = await Course.find({
      organizerId: organizer._id
    }).sort({ createdAt: -1 });

    console.log(`Found ${allOrganizerCourses.length} total organizer courses`);

    // 3. Keep only the first 6 courses (newest), delete the rest
    if (allOrganizerCourses.length > 6) {
      const coursesToDelete = allOrganizerCourses.slice(6);
      const idsToDelete = coursesToDelete.map(c => c._id);
      
      const deletedExtraCourses = await Course.deleteMany({
        _id: { $in: idsToDelete }
      });
      
      console.log(`🗑️ Deleted ${deletedExtraCourses.deletedCount} extra organizer courses`);
      
      // Log which courses were deleted
      coursesToDelete.forEach((course, index) => {
        console.log(`   Deleted: "${course.title}" (${course.difficulty})`);
      });
    }

    // 4. Ensure the remaining 6 courses are published and active
    const finalCourses = await Course.find({
      organizerId: organizer._id
    }).sort({ createdAt: -1 }).limit(6);

    // Update all remaining courses to be published and active
    await Course.updateMany(
      { organizerId: organizer._id },
      { 
        status: 'published', 
        isActive: true 
      }
    );

    console.log('\n✅ Final 6 Courses (for Learning/Education page):');
    finalCourses.forEach((course, index) => {
      console.log(`${index + 1}. ${course.title}`);
      console.log(`   - Category: ${course.category}, Difficulty: ${course.difficulty}`);
      console.log(`   - Students: ${course.enrollmentCount || 0}, Price: ${course.price || 0} ETB`);
      console.log('');
    });

    // 5. Verify total counts
    const totalCourses = await Course.countDocuments({});
    const organizerCourses = await Course.countDocuments({ organizerId: organizer._id });
    const publishedCourses = await Course.countDocuments({ 
      organizerId: organizer._id, 
      status: 'published', 
      isActive: true 
    });

    console.log('📊 Database Summary:');
    console.log(`Total Courses in Database: ${totalCourses}`);
    console.log(`Organizer Courses: ${organizerCourses}`);
    console.log(`Published Active Courses: ${publishedCourses}`);

    // 6. Test learning API query
    const learningCourses = await Course.find({
      isActive: true,
      status: 'published',
      organizerId: { $exists: true },
      difficulty: { $ne: 'advanced' }
    }).limit(6);

    console.log(`\n🎯 Courses that will show on Learning page: ${learningCourses.length}/6`);

    // 7. Get organizer dashboard stats
    const courseStats = await Course.aggregate([
      { $match: { organizerId: organizer._id } },
      {
        $group: {
          _id: null,
          totalCourses: { $sum: 1 },
          activeCourses: { $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] } },
          totalStudents: { $sum: '$enrollmentCount' },
          averageRating: { $avg: '$averageRating' }
        }
      }
    ]);

    const stats = courseStats[0] || {
      totalCourses: 0,
      activeCourses: 0,
      totalStudents: 0,
      averageRating: 0
    };

    console.log('\n📈 Organizer Dashboard Stats:');
    console.log(`Total Courses: ${stats.totalCourses}`);
    console.log(`Active/Published Courses: ${stats.activeCourses}`);
    console.log(`Total Students: ${stats.totalStudents}`);
    console.log(`Average Rating: ${stats.averageRating.toFixed(1)}`);

  } catch (error) {
    console.error('Error keeping only 6 courses:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

keepOnly6Courses();
