const mongoose = require('mongoose');
const Communication = require('./models/Communication');
const User = require('./models/User');

async function testMuseumAdminAccess() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ethioheritage360');
    console.log('🔍 Testing Museum Admin Communications Access...');

    // Get Museum Admin user
    const museumAdmin = await User.findOne({ email: 'museum.admin@ethioheritage360.com' });
    if (!museumAdmin) {
      console.log('❌ Museum Admin not found');
      return;
    }

    console.log('👤 Museum Admin:', museumAdmin.name, '(' + museumAdmin.email + ')');
    console.log('👤 Museum Admin ID:', museumAdmin._id);
    console.log('👤 Museum Admin Role:', museumAdmin.role);
    console.log('👤 Museum Admin Active:', museumAdmin.isActive);

    // Test the exact query that the API uses
    const query = {
      $or: [
        { from: museumAdmin._id },
        { to: museumAdmin._id }
      ]
    };

    console.log('\n🔍 Testing API Query:');
    console.log('Query:', JSON.stringify(query, null, 2));

    const communications = await Communication.find(query)
      .populate('from to', 'name email role')
      .populate('museum', 'name')
      .sort({ createdAt: -1 });

    console.log('\n📨 Communications found:', communications.length);

    if (communications.length > 0) {
      console.log('\n📋 Communications Details:');
      communications.forEach((comm, index) => {
        console.log(`\n  ${index + 1}. ${comm.subject}`);
        console.log(`     ID: ${comm._id}`);
        console.log(`     From: ${comm.from?.name} (${comm.from?.email}) - Role: ${comm.from?.role}`);
        console.log(`     To: ${comm.to?.name} (${comm.to?.email}) - Role: ${comm.to?.role}`);
        console.log(`     Type: ${comm.type}, Status: ${comm.status}, Priority: ${comm.priority}`);
        console.log(`     Created: ${comm.createdAt}`);
        console.log(`     Message: ${comm.message.substring(0, 100)}...`);
        if (comm.museum) {
          console.log(`     Museum: ${comm.museum.name}`);
        }
      });
    } else {
      console.log('❌ No communications found');
    }

    // Test unread count
    const unreadCount = await Communication.countDocuments({
      to: museumAdmin._id,
      status: { $in: ['sent', 'delivered'] }
    });

    console.log('\n🔔 Unread count:', unreadCount);

    // Test if Museum Admin can see messages from Super Admin
    const superAdminMessages = await Communication.find({
      to: museumAdmin._id,
      'from.role': 'superAdmin'
    }).populate('from to', 'name email role');

    console.log('\n📨 Messages from Super Admin:', superAdminMessages.length);

    if (superAdminMessages.length > 0) {
      console.log('✅ Museum Admin can see messages from Super Admin');
      superAdminMessages.forEach(msg => {
        console.log(`  - ${msg.subject} (${msg.status})`);
      });
    } else {
      console.log('❌ Museum Admin cannot see messages from Super Admin');
    }

    console.log('\n✅ Museum Admin communications access test completed!');
    console.log('\n📋 Summary:');
    console.log(`  - Museum Admin: ${museumAdmin.name} (${museumAdmin.email})`);
    console.log(`  - Total communications: ${communications.length}`);
    console.log(`  - Unread count: ${unreadCount}`);
    console.log(`  - Messages from Super Admin: ${superAdminMessages.length}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testMuseumAdminAccess();




