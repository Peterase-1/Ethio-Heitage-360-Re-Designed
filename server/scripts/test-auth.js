const mongoose = require('mongoose');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const config = require('../config/env');

// Connect to MongoDB
mongoose.connect(config.MONGODB_URI);

async function testAuth() {
  try {
    console.log('🔍 Testing authentication...');

    // Find super admin
    const superAdmin = await User.findOne({ role: 'superAdmin' });
    if (!superAdmin) {
      console.log('❌ No Super Admin found');
      return;
    }

    console.log('✅ Super Admin found:', {
      id: superAdmin._id,
      name: superAdmin.name,
      email: superAdmin.email,
      role: superAdmin.role
    });

    // Generate a test token
    const token = jwt.sign(
      {
        id: superAdmin._id,
        role: superAdmin.role,
        email: superAdmin.email
      },
      config.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('🔑 Test token generated:', token.substring(0, 50) + '...');

    // Test token verification
    const decoded = jwt.verify(token, config.JWT_SECRET);
    console.log('✅ Token verification successful:', {
      id: decoded.id,
      role: decoded.role,
      email: decoded.email
    });

    console.log('\n📋 To test the API, use this token:');
    console.log(`Authorization: Bearer ${token}`);

  } catch (error) {
    console.error('❌ Error testing auth:', error);
  } finally {
    mongoose.disconnect();
  }
}

testAuth();




