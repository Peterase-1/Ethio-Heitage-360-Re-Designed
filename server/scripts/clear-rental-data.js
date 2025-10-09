const mongoose = require('mongoose');
const RentalRequest = require('../models/RentalRequest');
require('dotenv').config();

// Clear all rental request data
const clearRentalData = async () => {
  try {
    console.log('🗑️ Starting rental data cleanup...');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ethioheritage360');
    console.log('✅ Connected to MongoDB');

    // Clear all rental requests
    const result = await RentalRequest.deleteMany({});
    console.log(`🗑️ Cleared ${result.deletedCount} rental requests from database`);

    console.log('✅ Rental data cleanup completed successfully!');
    console.log('🎉 Database is now clean and ready for new bidirectional rental system');

  } catch (error) {
    console.error('❌ Error clearing rental data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

// Run the cleanup
if (require.main === module) {
  clearRentalData();
}

module.exports = clearRentalData;


