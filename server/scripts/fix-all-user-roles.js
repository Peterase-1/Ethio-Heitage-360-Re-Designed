const mongoose = require('mongoose');
const User = require('../models/User');
const config = require('../config/env');

// Connect to MongoDB
mongoose.connect(config.MONGODB_URI);

async function fixAllUserRoles() {
  try {
    console.log('🔧 Fixing all user roles and fields...');

    // Fix invalid roles
    const invalidRoles = await User.find({
      role: { $nin: ['superAdmin', 'museumAdmin', 'organizer', 'user'] }
    });

    console.log(`🔧 Found ${invalidRoles.length} users with invalid roles`);

    for (const user of invalidRoles) {
      console.log(`🔧 Fixing user: ${user.email} (role: ${user.role})`);

      // Map invalid roles to valid ones
      if (user.role === 'visitor' || user.role === 'guest') {
        user.role = 'user';
      } else if (user.role === 'admin' || user.role === 'super_admin') {
        user.role = 'superAdmin';
      } else if (user.role === 'museum_admin' || user.role === 'museum') {
        user.role = 'museumAdmin';
      } else {
        user.role = 'user'; // Default fallback
      }

      // Fix missing name fields
      if (!user.firstName) {
        user.firstName = user.name ? user.name.split(' ')[0] : 'User';
      }
      if (!user.lastName) {
        user.lastName = user.name ? user.name.split(' ').slice(1).join(' ') || 'User' : 'User';
      }
      if (!user.name) {
        user.name = `${user.firstName} ${user.lastName}`;
      }

      await user.save();
      console.log(`✅ Fixed: ${user.email} -> role: ${user.role}`);
    }

    // Also fix any users with missing firstName/lastName
    const usersWithMissingFields = await User.find({
      $or: [
        { firstName: { $exists: false } },
        { lastName: { $exists: false } },
        { firstName: null },
        { lastName: null }
      ]
    });

    console.log(`🔧 Found ${usersWithMissingFields.length} users with missing name fields`);

    for (const user of usersWithMissingFields) {
      if (!user.firstName) {
        user.firstName = user.name ? user.name.split(' ')[0] : 'User';
      }
      if (!user.lastName) {
        user.lastName = user.name ? user.name.split(' ').slice(1).join(' ') || 'User' : 'User';
      }
      if (!user.name) {
        user.name = `${user.firstName} ${user.lastName}`;
      }
      await user.save();
    }

    console.log('✅ All users fixed successfully');

    // Verify the main user
    const mainUser = await User.findOne({ email: 'student.pasegid@admin.com' });
    if (mainUser) {
      console.log('✅ Main user verified:', {
        email: mainUser.email,
        role: mainUser.role,
        firstName: mainUser.firstName,
        lastName: mainUser.lastName,
        name: mainUser.name
      });
    }

  } catch (error) {
    console.error('❌ Error fixing user roles:', error);
  } finally {
    mongoose.disconnect();
  }
}

fixAllUserRoles();
