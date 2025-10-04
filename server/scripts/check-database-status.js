const mongoose = require('mongoose');
const Museum = require('../models/Museum');
const Artifact = require('../models/Artifact');
const User = require('../models/User');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB Atlas');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const checkDatabaseStatus = async () => {
  try {
    console.log('🔍 Checking database status...\n');

    // Check museums
    const museumCount = await Museum.countDocuments();
    console.log(`🏛️  Museums: ${museumCount}`);
    if (museumCount > 0) {
      const museums = await Museum.find({}, 'name status isActive').limit(5);
      console.log('   Sample museums:');
      museums.forEach(museum => {
        console.log(`   - ${museum.name} (${museum.status}, active: ${museum.isActive})`);
      });
    }

    // Check artifacts
    const artifactCount = await Artifact.countDocuments();
    console.log(`🏺 Artifacts: ${artifactCount}`);
    if (artifactCount > 0) {
      const artifacts = await Artifact.find({}, 'name category status').limit(5);
      console.log('   Sample artifacts:');
      artifacts.forEach(artifact => {
        console.log(`   - ${artifact.name} (${artifact.category}, ${artifact.status})`);
      });
    }

    // Check users
    const userCount = await User.countDocuments();
    console.log(`👥 Users: ${userCount}`);
    if (userCount > 0) {
      const users = await User.find({}, 'name email role').limit(5);
      console.log('   Sample users:');
      users.forEach(user => {
        console.log(`   - ${user.name} (${user.email}, ${user.role})`);
      });
    }

    console.log('\n📊 Database Summary:');
    console.log(`   - Total Museums: ${museumCount}`);
    console.log(`   - Total Artifacts: ${artifactCount}`);
    console.log(`   - Total Users: ${userCount}`);

    if (museumCount === 0) {
      console.log('\n⚠️  No museums found! This will cause empty dropdowns in the rental system.');
      console.log('   Run: node scripts/populate-rental-data.js');
    }

    if (artifactCount === 0) {
      console.log('\n⚠️  No artifacts found! This will cause empty dropdowns in the rental system.');
      console.log('   Run: node scripts/populate-rental-data.js');
    }

  } catch (error) {
    console.error('❌ Error checking database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

// Run the script
connectDB().then(() => {
  checkDatabaseStatus();
});

