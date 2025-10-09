const mongoose = require('mongoose');
const User = require('../models/User');
const config = require('../config/env');

// Connect to MongoDB
mongoose.connect(config.MONGODB_URI);

async function checkUserRole() {
  try {
    console.log('🔍 Checking user role for: student.pasegid@admin.com');

    // Find the user
    const user = await User.findOne({ email: 'student.pasegid@admin.com' });

    if (user) {
      console.log('✅ User found:', {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      });

      // Check if role needs to be updated
      if (user.role === 'admin') {
        console.log('🔧 Updating role from "admin" to "superAdmin"...');
        user.role = 'superAdmin';
        await user.save();
        console.log('✅ Role updated to superAdmin');
      }

    } else {
      console.log('❌ User not found');

      // Create the user with correct role
      const newUser = new User({
        name: 'Student Pasegid',
        email: 'student.pasegid@admin.com',
        password: 'Fs4HwlXCW4SJvkyN',
        role: 'superAdmin',
        isActive: true,
        emailVerified: true
      });

      await newUser.save();
      console.log('✅ User created with superAdmin role');
    }

  } catch (error) {
    console.error('❌ Error checking user role:', error);
  } finally {
    mongoose.disconnect();
  }
}

checkUserRole();




