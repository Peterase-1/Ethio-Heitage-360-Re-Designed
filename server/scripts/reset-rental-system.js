const mongoose = require('mongoose');
const RentalRequest = require('../models/RentalRequest');
const Artifact = require('../models/Artifact');
const Museum = require('../models/Museum');
const User = require('../models/User');
require('dotenv').config();

// Clear all rental request data and reset the system
const resetRentalSystem = async () => {
  try {
    console.log('🔄 Starting rental system reset...');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ethioheritage360');
    console.log('✅ Connected to MongoDB');

    // Clear all rental requests
    const result = await RentalRequest.deleteMany({});
    console.log(`🗑️ Cleared ${result.deletedCount} rental requests from database`);

    // Verify system components
    const museums = await Museum.find({});
    const artifacts = await Artifact.find({});
    const users = await User.find({ role: { $in: ['museumAdmin', 'superAdmin'] } });

    console.log('\n📊 System Status:');
    console.log(`🏛️ Museums: ${museums.length}`);
    console.log(`🏺 Artifacts: ${artifacts.length}`);
    console.log(`👥 Users: ${users.length}`);

    if (museums.length === 0) {
      console.log('⚠️  Warning: No museums found. Please seed museums first.');
    }

    if (artifacts.length === 0) {
      console.log('⚠️  Warning: No artifacts found. Please seed artifacts first.');
    }

    if (users.length === 0) {
      console.log('⚠️  Warning: No admin users found. Please seed users first.');
    }

    console.log('\n✅ Rental system reset completed successfully!');
    console.log('🎉 Database is now clean and ready for bidirectional rental system');
    console.log('\n📋 Next steps:');
    console.log('1. Museum Admins can create "museum_to_super" requests');
    console.log('2. Super Admins can create "super_to_museum" requests');
    console.log('3. Both can approve each other\'s requests');
    console.log('4. Test the bidirectional approval workflow');

  } catch (error) {
    console.error('❌ Error resetting rental system:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

// Run the reset
if (require.main === module) {
  resetRentalSystem();
}

module.exports = resetRentalSystem;


