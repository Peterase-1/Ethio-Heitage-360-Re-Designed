const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });
const EducationalTour = require('../models/EducationalTour');

const checkEducationalTours = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ethioheritage360');
    console.log('Connected to MongoDB');

    // Get all tours
    const allTours = await EducationalTour.find({});
    console.log(`📊 Total tours in database: ${allTours.length}`);
    
    // Get published tours
    const publishedTours = await EducationalTour.find({ status: 'published', isActive: true });
    console.log(`📋 Published active tours: ${publishedTours.length}`);
    
    // Get future tours
    const futureTours = await EducationalTour.find({ 
      status: 'published', 
      isActive: true,
      startDate: { $gte: new Date() }
    });
    console.log(`🔮 Published active future tours: ${futureTours.length}`);
    
    // Show details of each tour
    console.log('\n📚 Tour Details:');
    allTours.forEach(tour => {
      console.log(`  - ${tour.title}`);
      console.log(`    Status: ${tour.status}, Active: ${tour.isActive}`);
      console.log(`    Start: ${tour.startDate}`);
      console.log(`    Now: ${new Date()}`);
      console.log(`    Is Future: ${new Date(tour.startDate) >= new Date()}`);
      console.log('');
    });

    // Test the findPublishedTours method
    console.log('🔍 Testing findPublishedTours method:');
    const methodResult = await EducationalTour.findPublishedTours();
    console.log(`Result count: ${methodResult.length}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

checkEducationalTours();
