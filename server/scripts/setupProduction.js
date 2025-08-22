const mongoose = require('mongoose');
const User = require('../models/User');
const connectDB = require('../config/database');
require('dotenv').config();

const setupProduction = async () => {
  try {
    console.log('🚀 Setting up EthioHeritage360 Production Environment...\n');

    // Connect to MongoDB
    await connectDB();

    // Clean up any existing mock/test data
    console.log('🧹 Cleaning up mock data...');
    
    // Remove any test/mock users (but keep real admin accounts)
    const mockEmails = [
      'test@example.com',
      'demo@demo.com',
      'sample@sample.com',
      'mock@mock.com'
    ];
    
    const deletedMockUsers = await User.deleteMany({
      email: { $in: mockEmails }
    });
    
    if (deletedMockUsers.deletedCount > 0) {
      console.log(`   ✅ Removed ${deletedMockUsers.deletedCount} mock user accounts`);
    }

    // Check if we have any super admin accounts
    const superAdminCount = await User.countDocuments({ role: 'superAdmin' });
    
    if (superAdminCount === 0) {
      console.log('\n⚠️  No Super Admin accounts found!');
      console.log('📝 Please create your first Super Admin account using the registration endpoint:');
      console.log('   POST /api/auth/register');
      console.log('   Body: {');
      console.log('     "firstName": "Your First Name",');
      console.log('     "lastName": "Your Last Name",');
      console.log('     "email": "your@email.com",');
      console.log('     "password": "your_secure_password",');
      console.log('     "role": "superAdmin"');
      console.log('   }');
      console.log('\n   Note: The first super admin can be created without authentication.');
    } else {
      console.log(`\n✅ Found ${superAdminCount} Super Admin account(s) in the system`);
    }

    // Display current user statistics
    const userStats = await User.getPlatformStats();
    console.log('\n📊 Current User Statistics:');
    console.log(`   Total Users: ${userStats.total}`);
    console.log(`   Super Admins: ${userStats.superAdmins}`);
    console.log(`   Museum Admins: ${userStats.museumAdmins}`);
    console.log(`   Regular Users: ${userStats.users}`);

    // Verify database indexes
    console.log('\n🔍 Verifying database indexes...');
    
    const collections = ['users', 'rentals', 'heritagesites', 'museums', 'artifacts'];
    for (const collectionName of collections) {
      try {
        const collection = mongoose.connection.db.collection(collectionName);
        const indexes = await collection.indexes();
        console.log(`   ✅ ${collectionName}: ${indexes.length} indexes configured`);
      } catch (error) {
        console.log(`   ⚠️  ${collectionName}: Collection not found (will be created on first use)`);
      }
    }

    console.log('\n✨ Production Environment Setup Complete!');
    console.log('\n🔗 API Endpoints:');
    console.log('   Authentication: http://localhost:5000/api/auth');
    console.log('   Users: http://localhost:5000/api/users');
    console.log('   Rentals: http://localhost:5000/api/rentals');
    console.log('   Heritage Sites: http://localhost:5000/api/heritage-sites');
    console.log('   Health Check: http://localhost:5000/api/health');
    
    console.log('\n📋 Next Steps:');
    console.log('   1. Create your Super Admin account');
    console.log('   2. Set up museums and assign museum administrators');
    console.log('   3. Configure heritage sites');
    console.log('   4. Start accepting user registrations');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up production environment:', error);
    process.exit(1);
  }
};

// Run the setup
setupProduction();
