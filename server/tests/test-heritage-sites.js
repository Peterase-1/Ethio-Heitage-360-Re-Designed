const mongoose = require('mongoose');
const HeritageSite = require('./models/HeritageSite');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/ethioheritage360', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function testHeritageSites() {
  try {
    console.log('🔍 Testing Heritage Sites in Database...\n');

    // Count total heritage sites
    const totalSites = await HeritageSite.countDocuments();
    console.log(`📊 Total Heritage Sites: ${totalSites}`);

    if (totalSites === 0) {
      console.log('❌ No heritage sites found in database!');
      console.log('💡 Run: node scripts/create-sample-heritage-sites.js');
      return;
    }

    // Get active sites
    const activeSites = await HeritageSite.countDocuments({ status: 'active' });
    console.log(`✅ Active Sites: ${activeSites}`);

    // Get UNESCO sites
    const unescoSites = await HeritageSite.countDocuments({
      designation: 'UNESCO World Heritage'
    });
    console.log(`🏛️ UNESCO Sites: ${unescoSites}`);

    // Get featured sites
    const featuredSites = await HeritageSite.countDocuments({ featured: true });
    console.log(`⭐ Featured Sites: ${featuredSites}`);

    // Get verified sites
    const verifiedSites = await HeritageSite.countDocuments({ verified: true });
    console.log(`✅ Verified Sites: ${verifiedSites}`);

    // Show sample sites
    console.log('\n📋 Sample Heritage Sites:');
    const sampleSites = await HeritageSite.find()
      .select('name designation location.region status featured verified')
      .limit(3);

    sampleSites.forEach((site, index) => {
      console.log(`${index + 1}. ${site.name}`);
      console.log(`   📍 Region: ${site.location.region}`);
      console.log(`   🏛️ Designation: ${site.designation}`);
      console.log(`   📊 Status: ${site.status}`);
      console.log(`   ⭐ Featured: ${site.featured ? 'Yes' : 'No'}`);
      console.log(`   ✅ Verified: ${site.verified ? 'Yes' : 'No'}`);
      console.log('');
    });

    console.log('✅ Heritage Sites test completed successfully!');

  } catch (error) {
    console.error('❌ Error testing heritage sites:', error);
  } finally {
    mongoose.connection.close();
  }
}

testHeritageSites();
