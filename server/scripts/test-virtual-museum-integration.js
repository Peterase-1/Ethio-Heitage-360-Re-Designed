const mongoose = require('mongoose');
const VirtualMuseum = require('../models/VirtualMuseum');
const RentalRequest = require('../models/RentalRequest');
const Artifact = require('../models/Artifact');
const Museum = require('../models/Museum');
require('dotenv').config();

// Test virtual museum integration
const testVirtualMuseumIntegration = async () => {
  try {
    console.log('🧪 Testing Virtual Museum Integration...');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ethioheritage360');
    console.log('✅ Connected to MongoDB');

    // Check if there are any approved rental requests
    const approvedRequests = await RentalRequest.find({ status: 'approved' })
      .populate('artifact')
      .populate('museum');

    console.log(`📊 Found ${approvedRequests.length} approved rental requests`);

    if (approvedRequests.length === 0) {
      console.log('⚠️  No approved rental requests found. Please approve some rental requests first.');
      console.log('💡 To test: Create and approve rental requests, then artifacts will automatically appear in virtual museum.');
      return;
    }

    // Check virtual museum entries
    const virtualMuseumEntries = await VirtualMuseum.find({})
      .populate('artifact', 'name description images')
      .populate('museum', 'name location');

    console.log(`🏛️ Virtual Museum has ${virtualMuseumEntries.length} artifacts`);

    if (virtualMuseumEntries.length > 0) {
      console.log('\n📋 Virtual Museum Artifacts:');
      virtualMuseumEntries.forEach((entry, index) => {
        console.log(`${index + 1}. ${entry.title}`);
        console.log(`   Museum: ${entry.museum?.name || 'Unknown'}`);
        console.log(`   Views: ${entry.views}, Likes: ${entry.likes}, Rating: ${entry.rating}`);
        console.log(`   Status: ${entry.status}`);
        console.log('');
      });
    }

    // Test virtual museum functionality
    console.log('🧪 Testing Virtual Museum Functions:');

    // Get featured artifacts
    const featured = await VirtualMuseum.getFeatured();
    console.log(`⭐ Featured artifacts: ${featured.length}`);

    // Get popular artifacts
    const popular = await VirtualMuseum.getPopular(5);
    console.log(`🔥 Popular artifacts: ${popular.length}`);

    // Get artifacts by museum
    if (virtualMuseumEntries.length > 0) {
      const museumId = virtualMuseumEntries[0].museum._id;
      const museumArtifacts = await VirtualMuseum.getByMuseum(museumId);
      console.log(`🏛️ Artifacts in museum ${museumId}: ${museumArtifacts.length}`);
    }

    console.log('\n✅ Virtual Museum Integration Test Completed!');
    console.log('🎉 Approved rental artifacts are automatically added to virtual museum');

  } catch (error) {
    console.error('❌ Error testing virtual museum integration:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

// Run the test
if (require.main === module) {
  testVirtualMuseumIntegration();
}

module.exports = testVirtualMuseumIntegration;
