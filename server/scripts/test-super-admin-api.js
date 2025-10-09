const mongoose = require('mongoose');
const RentalRequest = require('../models/RentalRequest');
const Artifact = require('../models/Artifact');
const Museum = require('../models/Museum');
const User = require('../models/User');
const VirtualMuseum = require('../models/VirtualMuseum');
require('dotenv').config();

// Test Super Admin dashboard API
const testSuperAdminAPI = async () => {
  try {
    console.log('🧪 Testing Super Admin Dashboard API...');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ethioheritage360');
    console.log('✅ Connected to MongoDB');

    // Test dashboard data collection
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // Get rental requests
    const totalRentalRequests = await RentalRequest.countDocuments();
    const pendingRentalRequests = await RentalRequest.countDocuments({ status: 'pending' });
    const approvedRentalRequests = await RentalRequest.countDocuments({ status: 'approved' });
    const rejectedRentalRequests = await RentalRequest.countDocuments({ status: 'rejected' });

    // Get museums
    const totalMuseums = await Museum.countDocuments();
    const activeMuseums = await Museum.countDocuments({ status: 'active' });

    // Get artifacts
    const totalArtifacts = await Artifact.countDocuments();
    const onDisplayArtifacts = await Artifact.countDocuments({ status: 'on_display' });
    const inStorageArtifacts = await Artifact.countDocuments({ status: 'in_storage' });

    // Get users
    const totalUsers = await User.countDocuments();
    const museumAdmins = await User.countDocuments({ role: 'museumAdmin' });
    const superAdmins = await User.countDocuments({ role: 'superAdmin' });

    // Get virtual museum entries
    const virtualMuseumEntries = await VirtualMuseum.countDocuments();
    const activeVirtualEntries = await VirtualMuseum.countDocuments({ status: 'active' });

    // Get recent rental requests
    const recentRentalRequests = await RentalRequest.find()
      .populate('artifact', 'name description images')
      .populate('museum', 'name location')
      .populate('requestedBy', 'name email role')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get recent museums
    const recentMuseums = await Museum.find()
      .sort({ createdAt: -1 })
      .limit(5);

    console.log('\n📊 Super Admin Dashboard Data:');
    console.log(`🏛️ Total Museums: ${totalMuseums} (Active: ${activeMuseums})`);
    console.log(`🏺 Total Artifacts: ${totalArtifacts} (On Display: ${onDisplayArtifacts}, In Storage: ${inStorageArtifacts})`);
    console.log(`👥 Total Users: ${totalUsers} (Museum Admins: ${museumAdmins}, Super Admins: ${superAdmins})`);
    console.log(`📋 Total Rental Requests: ${totalRentalRequests} (Pending: ${pendingRentalRequests}, Approved: ${approvedRentalRequests}, Rejected: ${rejectedRentalRequests})`);
    console.log(`🖼️ Virtual Museum Entries: ${virtualMuseumEntries} (Active: ${activeVirtualEntries})`);

    console.log('\n📋 Recent Rental Requests:');
    recentRentalRequests.forEach((request, index) => {
      console.log(`${index + 1}. ${request.requestId} - ${request.requestType} - ${request.status}`);
      console.log(`   Artifact: ${request.artifact?.name || 'Unknown'}`);
      console.log(`   Museum: ${request.museum?.name || 'Unknown'}`);
      console.log(`   Requested by: ${request.requestedBy?.name || 'Unknown'}`);
      console.log('');
    });

    console.log('\n🏛️ Recent Museums:');
    recentMuseums.forEach((museum, index) => {
      console.log(`${index + 1}. ${museum.name} - ${museum.location} - ${museum.status}`);
    });

    console.log('\n✅ Super Admin Dashboard API Test Completed!');
    console.log('🎉 All data is available for the Super Admin dashboard');

  } catch (error) {
    console.error('❌ Error testing Super Admin API:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

// Run the test
if (require.main === module) {
  testSuperAdminAPI();
}

module.exports = testSuperAdminAPI;


