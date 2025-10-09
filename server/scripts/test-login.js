const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/env');

// Connect to MongoDB
mongoose.connect(config.MONGODB_URI);

async function testLogin() {
  try {
    console.log('🔍 Testing login for: student.pasegid@admin.com');

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
      isActive: user.isActive
    });

    // Test password verification
    const passwordMatch = await bcrypt.compare('Fs4HwlXCW4SJvkyN', user.password);
    console.log('🔐 Password match:', passwordMatch);

    if (passwordMatch) {
      // Generate token
      const token = jwt.sign(
        {
          id: user._id,
          role: user.role,
          email: user.email
        },
        config.JWT_SECRET,
        { expiresIn: '24h' }
      );

      console.log('✅ Login successful!');
      console.log('🔑 Token:', token.substring(0, 50) + '...');
      console.log('👤 User role:', user.role);

      // Test API call with this token
      console.log('\n📋 Test API call:');
      console.log(`curl -H "Authorization: Bearer ${token}" http://localhost:5000/api/rental`);

    } else {
      console.log('❌ Password does not match');
    }

  } catch (error) {
    console.error('❌ Error testing login:', error);
  } finally {
    mongoose.disconnect();
  }
}

testLogin();




