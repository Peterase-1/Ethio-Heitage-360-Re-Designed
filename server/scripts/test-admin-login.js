const mongoose = require('mongoose');
const User = require('../models/User');
const config = require('../config/env');

const testAdminLogin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB for testing...');

    // Test finding admin user
    const email = 'melkamuwako5@admin.com';
    const password = 'melkamuwako5';

    console.log(`Testing login for: ${email}`);

    // Find user by email with password field
    const user = await User.findByEmail(email).select('+password');
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log('✅ User found:', {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      isVerified: user.isVerified,
      isLocked: user.isLocked,
      loginAttempts: user.loginAttempts,
      hasPassword: !!user.password
    });

    // Test password comparison
    const isMatch = await user.comparePassword(password);
    console.log(`🔑 Password match: ${isMatch ? '✅ YES' : '❌ NO'}`);

    if (!isMatch) {
      console.log('🔍 Debugging password comparison...');
      
      // Check if password is hashed
      console.log('Password hash starts with $2b$:', user.password?.startsWith('$2b$'));
      console.log('Password hash length:', user.password?.length);
      
      // Try manual bcrypt comparison
      const bcrypt = require('bcryptjs');
      const manualMatch = await bcrypt.compare(password, user.password);
      console.log('Manual bcrypt comparison:', manualMatch ? '✅ YES' : '❌ NO');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run the test
testAdminLogin();
