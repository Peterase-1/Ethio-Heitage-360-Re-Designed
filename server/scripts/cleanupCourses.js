const mongoose = require('mongoose');
const Course = require('../models/Course');
const User = require('../models/User');
require('dotenv').config();

async function cleanupCourses() {
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

    // 1. Deactivate all courses that are not organizer-managed
    const deactivatedNonOrganizerCourses = await Course.updateMany(
      { organizerId: { $exists: false } },
      { isActive: false }
    );
    console.log(`Deactivated ${deactivatedNonOrganizerCourses.modifiedCount} non-organizer courses`);

    // 2. Deactivate all advanced courses
    const deactivatedAdvancedCourses = await Course.updateMany(
      { difficulty: 'advanced' },
      { isActive: false }
    );
    console.log(`Deactivated ${deactivatedAdvancedCourses.modifiedCount} advanced courses`);

    // 3. Get all active organizer courses
    const organizerCourses = await Course.find({
      organizerId: organizer._id,
      isActive: true,
      status: 'published'
    }).sort({ createdAt: -1 });

    console.log(`Found ${organizerCourses.length} active organizer courses`);

    // 4. Keep only the first 6 courses, deactivate the rest
    if (organizerCourses.length > 6) {
      const coursesToDeactivate = organizerCourses.slice(6);
      const idsToDeactivate = coursesToDeactivate.map(c => c._id);
      
      const deactivatedExtraCourses = await Course.updateMany(
        { _id: { $in: idsToDeactivate } },
        { isActive: false }
      );
      
      console.log(`Deactivated ${deactivatedExtraCourses.modifiedCount} extra organizer courses`);
    }

    // 5. Get final count of active, published organizer courses
    const finalActiveCourses = await Course.find({
      organizerId: organizer._id,
      isActive: true,
      status: 'published',
      difficulty: { $ne: 'advanced' }
    });

    console.log('\n✅ Final Active Courses (for Education page):');
    finalActiveCourses.forEach((course, index) => {
      console.log(`${index + 1}. ${course.title} (${course.difficulty}, ${course.category})`);
    });

    // 6. Verify what will show on the public education page
    const publicCourses = await Course.find({
      isActive: true,
      status: 'published',
      organizerId: { $exists: true },
      difficulty: { $ne: 'advanced' }
    }).limit(6);

    console.log(`\n🎯 Courses that will show on Education page: ${publicCourses.length}/6`);

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

    console.log('\n📊 Organizer Dashboard Stats:');
    console.log(`Total Courses: ${stats.totalCourses}`);
    console.log(`Active/Published Courses: ${stats.activeCourses}`);
    console.log(`Total Students: ${stats.totalStudents}`);
    console.log(`Average Rating: ${stats.averageRating.toFixed(1)}`);

  } catch (error) {
    console.error('Error cleaning up courses:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

cleanupCourses();
