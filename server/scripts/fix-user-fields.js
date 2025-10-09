const mongoose = require('mongoose');
const User = require('../models/User');
const config = require('../config/env');

// Connect to MongoDB
mongoose.connect(config.MONGODB_URI);

async function fixUserFields() {
  try {
    console.log('🔧 Fixing user fields for: student.pasegid@admin.com');

    // Find the user
    const user = await User.findOne({ email: 'student.pasegid@admin.com' });

    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log('✅ User found:', {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName
    });

    // Update missing fields
    if (!user.firstName) {
      user.firstName = 'Student';
    }
    if (!user.lastName) {
      user.lastName = 'Pasegid';
    }
    if (!user.name) {
      user.name = `${user.firstName} ${user.lastName}`;
    }

    await user.save();

    console.log('✅ User fields updated:', {
      firstName: user.firstName,
      lastName: user.lastName,
      name: user.name
    });

    // Also fix any other users with missing fields
    const usersWithMissingFields = await User.find({
      $or: [
        { firstName: { $exists: false } },
        { lastName: { $exists: false } },
        { firstName: null },
        { lastName: null }
      ]
    });

    console.log(`🔧 Found ${usersWithMissingFields.length} users with missing fields`);

    for (const u of usersWithMissingFields) {
      if (!u.firstName) {
        u.firstName = u.name ? u.name.split(' ')[0] : 'User';
      }
      if (!u.lastName) {
        u.lastName = u.name ? u.name.split(' ').slice(1).join(' ') || 'User' : 'User';
      }
      if (!u.name) {
        u.name = `${u.firstName} ${u.lastName}`;
      }
      await u.save();
    }

    console.log('✅ All users updated successfully');

  } catch (error) {
    console.error('❌ Error fixing user fields:', error);
  } finally {
    mongoose.disconnect();
  }
}

fixUserFields();




