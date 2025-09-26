const mongoose = require('mongoose');
const Museum = require('../models/Museum');
const User = require('../models/User');

// Configuration from environment
const config = require('../config/env');

async function createMuseumForUser() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(config.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find the user that needs a museum
    const user = await User.findById('68a37c044c85575c3470a715');
    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log('📋 Found user:', user.fullName, '- Role:', user.role);
    console.log('🏛️ User museumId:', user.museumId);

    // Check if museum already exists
    const existingMuseum = await Museum.findById(user.museumId);
    if (existingMuseum) {
      console.log('✅ Museum already exists:', existingMuseum.name);
      return;
    }

    console.log('🔧 Creating museum for user...');

    // Create a museum document with the exact ID the user is referencing
    const museumData = {
      _id: user.museumId, // Use the exact ID from user
      name: 'National Museum of Ethiopia',
      description: 'The National Museum of Ethiopia is located in Addis Ababa, Ethiopia. It houses the fossilized remains of Lucy, the partial skeleton of a hominid australopithecine discovered in the Awash Valley. The museum is one of the most important museums in Ethiopia, showcasing the country\'s rich cultural heritage.',
      location: {
        type: 'Point',
        coordinates: [38.7578, 9.0192], // Addis Ababa coordinates
        address: 'King George VI St, Addis Ababa, Ethiopia',
        city: 'Addis Ababa',
        region: 'Addis Ababa',
        country: 'Ethiopia'
      },
      contactInfo: {
        phone: '+251-11-117-15-10',
        email: 'museum.admin@ethioheritage360.com',
        website: 'https://www.ethioheritage360.com'
      },
      operatingHours: {
        monday: { open: '09:00', close: '17:00', closed: false },
        tuesday: { open: '09:00', close: '17:00', closed: false },
        wednesday: { open: '09:00', close: '17:00', closed: false },
        thursday: { open: '09:00', close: '17:00', closed: false },
        friday: { open: '09:00', close: '17:00', closed: false },
        saturday: { open: '09:00', close: '17:00', closed: false },
        sunday: { open: '10:00', close: '16:00', closed: false }
      },
      admissionFee: {
        adult: 50,
        child: 25,
        student: 30,
        senior: 35
      },
      admin: user._id,
      status: 'approved',
      verified: true,
      rating: {
        average: 4.5,
        count: 128
      },
      statistics: {
        totalVisitors: 15420,
        totalArtifacts: 4,
        totalTours: 24,
        monthlyVisitors: 1200,
        weeklyVisitors: 300,
        dailyVisitors: 45,
        yearlyVisitors: 14400,
        totalRevenue: 771000,
        averageVisitDuration: 90,
        lastVisitorUpdate: new Date(),
        lastStatsReset: new Date()
      },
      features: {
        hasVirtualTour: true,
        hasAugmentedReality: false,
        hasGuidedTours: true,
        hasEducationalPrograms: true,
        hasGiftShop: true,
        hasCafe: true,
        hasParking: true,
        isWheelchairAccessible: true
      },
      founded: '1936',
      capacity: 500,
      languages: ['English', 'Amharic', 'French'],
      facilities: ['Gift Shop', 'Café', 'Parking', 'Audio Guides', 'Wheelchair Access', 'Library'],
      isActive: true
    };

    // Create the museum
    const museum = new Museum(museumData);
    await museum.save();

    console.log('✅ Museum created successfully!');
    console.log('🏛️ Museum Name:', museum.name);
    console.log('🆔 Museum ID:', museum._id);
    console.log('👤 Admin:', museum.admin);

    // Verify the connection works
    const verifyMuseum = await Museum.findById(user.museumId);
    if (verifyMuseum) {
      console.log('✅ Verification successful - Museum can be found by ID');
    } else {
      console.log('❌ Verification failed - Museum not found');
    }

    console.log('🎉 Museum data setup completed successfully!');

  } catch (error) {
    console.error('❌ Error setting up museum data:', error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('📚 Database connection closed');
  }
}

// Run the script
createMuseumForUser().catch(console.error);
