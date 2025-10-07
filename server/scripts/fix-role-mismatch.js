const mongoose = require('mongoose');
const User = require('../models/User');
const config = require('../config/env');

// Connect to MongoDB
mongoose.connect(config.MONGODB_URI);

async function fixRoleMismatch() {
  try {
    console.log('🔧 Fixing role mismatch: super_admin → superAdmin');

    // Update all users with 'super_admin' role to 'superAdmin'
    const result = await User.updateMany(
      { role: 'super_admin' },
      { role: 'superAdmin' }
    );

    console.log(`✅ Updated ${result.modifiedCount} users from 'super_admin' to 'superAdmin'`);

    // Also update any 'admin' roles to 'superAdmin'
    const adminResult = await User.updateMany(
      { role: 'admin' },
      { role: 'superAdmin' }
    );

    console.log(`✅ Updated ${adminResult.modifiedCount} users from 'admin' to 'superAdmin'`);

    // Verify the user
    const user = await User.findOne({ email: 'student.pasegid@admin.com' });
    if (user) {
      console.log('✅ User role fixed:', {
        email: user.email,
        role: user.role
      });
    }

  } catch (error) {
    console.error('❌ Error fixing role mismatch:', error);
  } finally {
    mongoose.disconnect();
  }
}

fixRoleMismatch();
