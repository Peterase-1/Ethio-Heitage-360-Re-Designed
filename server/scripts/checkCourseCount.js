const mongoose = require('mongoose');
const Course = require('../models/Course');
require('dotenv').config();

async function checkCourseCount() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const totalCourses = await Course.countDocuments({ isActive: true });
    const organizedCourses = await Course.countDocuments({ organizerId: { $exists: true }, isActive: true });
    const nonOrganizedCourses = await Course.countDocuments({ organizerId: { $exists: false }, isActive: true });
    
    console.log('Total Active Courses:', totalCourses);
    console.log('Organized Courses:', organizedCourses);
    console.log('Non-Organized Courses:', nonOrganizedCourses);
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkCourseCount();
