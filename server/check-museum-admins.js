const mongoose = require('mongoose');
const User = require('./models/User');
const Communication = require('./models/Communication');

async function checkBothMuseumAdmins() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ethioheritage360');
    console.log('🔍 Checking both Museum Admin users...');

    // Get both Museum Admin users
    const museumAdmins = await User.find({ role: 'museumAdmin' });
    console.log('👥 All Museum Admin users:');
    museumAdmins.forEach(user => {
      console.log('  -', user.name, '(' + user.email + ') - ID:', user._id);
    });

    // Check communications for each user
    for (const user of museumAdmins) {
      console.log('\n📨 Communications for', user.name, '(' + user.email + '):');
      const comms = await Communication.find({
        $or: [
          { from: user._id },
          { to: user._id }
        ]
      }).populate('from to', 'name email role');

      console.log('  Total:', comms.length);
      comms.forEach(comm => {
        console.log('    -', comm.subject, '(From:', comm.from?.name, ', To:', comm.to?.name + ')');
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkBothMuseumAdmins();




