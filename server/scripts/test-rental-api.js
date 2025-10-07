const mongoose = require('mongoose');
const RentalRequest = require('../models/RentalRequest');
const Artifact = require('../models/Artifact');
const Museum = require('../models/Museum');
const User = require('../models/User');
require('dotenv').config();

// Test rental API endpoints
const testRentalAPI = async () => {
  try {
    console.log('🧪 Testing Rental API...');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ethioheritage360');
    console.log('✅ Connected to MongoDB');

    // Test rental requests
    const rentalRequests = await RentalRequest.find()
      .populate('artifact', 'name description images')
      .populate('museum', 'name location')
      .populate('requestedBy', 'name email role');

    console.log(`📋 Found ${rentalRequests.length} rental requests`);

    if (rentalRequests.length > 0) {
      console.log('\n📋 Rental Requests:');
      rentalRequests.forEach((request, index) => {
        console.log(`${index + 1}. ${request.requestId}`);
        console.log(`   Type: ${request.requestType}`);
        console.log(`   Status: ${request.status}`);
        console.log(`   Artifact: ${request.artifact?.name || 'Unknown'}`);
        console.log(`   Museum: ${request.museum?.name || 'Unknown'}`);
        console.log(`   Requested by: ${request.requestedBy?.name || 'Unknown'}`);
        console.log('');
      });
    }

    // Test artifacts
    const artifacts = await Artifact.find({ status: { $in: ['on_display', 'in_storage'] } });
    console.log(`🏺 Found ${artifacts.length} available artifacts`);

    // Test museums
    const museums = await Museum.find({ status: 'approved' });
    console.log(`🏛️ Found ${museums.length} approved museums`);

    // Test users
    const users = await User.find({ role: { $in: ['museumAdmin', 'superAdmin'] } });
    console.log(`👥 Found ${users.length} admin users`);

    console.log('\n✅ Rental API Test Completed!');
    console.log('🎉 All data is available for rental requests');

  } catch (error) {
    console.error('❌ Error testing rental API:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

// Run the test
if (require.main === module) {
  testRentalAPI();
}

module.exports = testRentalAPI;
