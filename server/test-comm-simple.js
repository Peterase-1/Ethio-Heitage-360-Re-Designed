const mongoose = require('mongoose');
const Communication = require('./models/Communication');
const User = require('./models/User');

async function testMuseumAdminCommunications() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ethioheritage360');
    console.log('🔍 Testing Museum Admin Communications...');

    // Get Museum Admin user
    const museumAdmin = await User.findOne({ email: 'museum.admin@ethioheritage360.com' });
    if (!museumAdmin) {
      console.log('❌ Museum Admin not found');
      return;
    }

    console.log('👤 Museum Admin:', museumAdmin.name, '(' + museumAdmin.email + ')');
    console.log('👤 Museum Admin ID:', museumAdmin._id);

    // Test the same query that the API uses
    const query = {
      $or: [
        { from: museumAdmin._id },
        { to: museumAdmin._id }
      ]
    };

    console.log('🔍 Query:', JSON.stringify(query, null, 2));

    const communications = await Communication.find(query)
      .populate('from to', 'name email role')
      .populate('museum', 'name')
      .sort({ createdAt: -1 });

    console.log('📨 Found communications:', communications.length);

    if (communications.length > 0) {
      console.log('\n📋 Communications:');
      communications.forEach((comm, index) => {
        console.log(`  ${index + 1}. ${comm.subject}`);
        console.log(`     From: ${comm.from?.name} (${comm.from?.email})`);
        console.log(`     To: ${comm.to?.name} (${comm.to?.email})`);
        console.log(`     Type: ${comm.type}, Status: ${comm.status}`);
        console.log(`     Created: ${comm.createdAt}`);
        console.log('     ---');
      });
    } else {
      console.log('❌ No communications found');
    }

    // Test unread count
    const unreadCount = await Communication.countDocuments({
      to: museumAdmin._id,
      status: { $in: ['sent', 'delivered'] }
    });

    console.log('🔔 Unread count:', unreadCount);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testMuseumAdminCommunications();




