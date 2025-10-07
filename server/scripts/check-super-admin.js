const mongoose = require('mongoose');
const User = require('../models/User');

// Connect to MongoDB using the same connection as the server
const config = require('../config/env');
mongoose.connect(config.MONGODB_URI);

async function checkSuperAdmin() {
  try {
    console.log('🔍 Checking for Super Admin user...');

    // Check if super admin exists
    const superAdmin = await User.findOne({ role: 'superAdmin' });

    if (superAdmin) {
      console.log('✅ Super Admin found:', {
        id: superAdmin._id,
        name: superAdmin.name,
        email: superAdmin.email,
        role: superAdmin.role
      });
    } else {
      console.log('❌ No Super Admin found');

      // Create a super admin
      const newSuperAdmin = new User({
        name: 'Super Admin',
        email: 'super.admin@ethioheritage360.com',
        password: 'super123', // This will be hashed by the pre-save middleware
        role: 'superAdmin',
        isActive: true,
        emailVerified: true
      });

      await newSuperAdmin.save();
      console.log('✅ Super Admin created:', {
        id: newSuperAdmin._id,
        name: newSuperAdmin.name,
        email: newSuperAdmin.email,
        role: newSuperAdmin.role
      });
    }

    // Also check for any users with role 'admin' that should be 'superAdmin'
    const adminUsers = await User.find({ role: 'admin' });
    if (adminUsers.length > 0) {
      console.log('🔧 Found users with role "admin", updating to "superAdmin"...');
      await User.updateMany({ role: 'admin' }, { role: 'superAdmin' });
      console.log('✅ Updated', adminUsers.length, 'users from "admin" to "superAdmin"');
    }

  } catch (error) {
    console.error('❌ Error checking Super Admin:', error);
  } finally {
    mongoose.disconnect();
  }
}

checkSuperAdmin();
