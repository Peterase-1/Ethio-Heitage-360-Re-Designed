const mongoose = require('mongoose');
const User = require('../models/User');
const config = require('../config/env');

const fixAdminVerification = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB for fixing admin verification...');

    // Update all admin users to be verified
    const adminEmails = [
      'melkamuwako5@admin.com',
      'abdurazakm343@admin.com', 
      'student.pasegid@admin.com',
      'naolaboma@admin.com',
      'museum.admin@ethioheritage360.com'
    ];

    for (const email of adminEmails) {
      const result = await User.updateOne(
        { email: email },
        { 
          $set: { 
            isVerified: true,
            isActive: true
          } 
        }
      );
      
      if (result.matchedCount > 0) {
        console.log(`✅ Updated verification for: ${email}`);
      } else {
        console.log(`❌ User not found: ${email}`);
      }
    }

    console.log('✅ Admin verification fix completed!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run the fix
fixAdminVerification();
