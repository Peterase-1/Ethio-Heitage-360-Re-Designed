const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const config = require('../config/env');

// Connect to MongoDB
mongoose.connect(config.MONGODB_URI);

async function fixUserPassword() {
  try {
    console.log('🔧 Fixing password for: student.pasegid@admin.com');

    // Find the user
    const user = await User.findOne({ email: 'student.pasegid@admin.com' });

    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log('✅ User found, current password hash:', user.password ? 'exists' : 'missing');

    // Hash the password properly
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash('Fs4HwlXCW4SJvkyN', saltRounds);

    // Update the user's password
    user.password = hashedPassword;
    await user.save();

    console.log('✅ Password updated successfully');

    // Test the new password
    const passwordMatch = await bcrypt.compare('Fs4HwlXCW4SJvkyN', user.password);
    console.log('🔐 Password verification:', passwordMatch ? 'SUCCESS' : 'FAILED');

    if (passwordMatch) {
      console.log('🎉 User is ready for login!');
      console.log('📧 Email: student.pasegid@admin.com');
      console.log('🔑 Password: Fs4HwlXCW4SJvkyN');
      console.log('👤 Role: superAdmin');
    }

  } catch (error) {
    console.error('❌ Error fixing password:', error);
  } finally {
    mongoose.disconnect();
  }
}

fixUserPassword();
