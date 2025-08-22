const mongoose = require('mongoose');
const User = require('../models/User');
const connectDB = require('../config/database');
require('dotenv').config();

const cleanDatabase = async () => {
  try {
    console.log('🧹 Starting Database Cleanup...\n');

    // Connect to MongoDB
    await connectDB();

    // Remove mock/test users
    const mockEmails = [
      'test@example.com',
      'demo@demo.com',
      'sample@sample.com',
      'mock@mock.com',
      'museum.admin@ethioheritage360.com', // From seed file
      'organizer@heritagetours.et' // From seed file
    ];
    
    console.log('🗑️  Removing mock user accounts...');
    const deletedUsers = await User.deleteMany({
      $or: [
        { email: { $in: mockEmails } },
        { email: { $regex: /test|demo|mock|sample/i } },
        { name: { $regex: /test|demo|mock|sample/i } }
      ]
    });
    
    console.log(`   ✅ Removed ${deletedUsers.deletedCount} mock user accounts`);

    // Clean up any documents with test/mock data
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    for (const collection of collections) {
      const collectionName = collection.name;
      if (['users', 'museums', 'artifacts', 'rentals', 'heritagesites'].includes(collectionName)) {
        continue; // Skip user collection as we already cleaned it
      }
      
      try {
        const coll = mongoose.connection.db.collection(collectionName);
        const result = await coll.deleteMany({
          $or: [
            { name: { $regex: /test|demo|mock|sample/i } },
            { title: { $regex: /test|demo|mock|sample/i } },
            { description: { $regex: /test|demo|mock|sample/i } }
          ]
        });
        
        if (result.deletedCount > 0) {
          console.log(`   ✅ Cleaned ${result.deletedCount} mock records from ${collectionName}`);
        }
      } catch (error) {
        console.log(`   ⚠️  Could not clean ${collectionName}: ${error.message}`);
      }
    }

    // Display final statistics
    const userCount = await User.countDocuments();
    console.log(`\n📊 Database Status:`)
    console.log(`   Total Users: ${userCount}`);
    
    if (userCount === 0) {
      console.log('\n⚠️  Database is now empty. You can start fresh!');
    } else {
      const userStats = await User.getPlatformStats();
      console.log(`   Super Admins: ${userStats.superAdmins}`);
      console.log(`   Museum Admins: ${userStats.museumAdmins}`);
      console.log(`   Regular Users: ${userStats.users}`);
    }

    console.log('\n✨ Database cleanup completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error cleaning database:', error);
    process.exit(1);
  }
};

// Run the cleanup
cleanDatabase();
