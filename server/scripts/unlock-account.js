#!/usr/bin/env node

const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};

// Unlock account by email
const unlockAccount = async (email) => {
  try {
    console.log(`Looking for user: ${email}`);
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      console.log('❌ User not found');
      return false;
    }
    
    console.log(`Found user: ${user.name} (${user.email})`);
    console.log(`Current status:`);
    console.log(`  - Login attempts: ${user.loginAttempts || 0}`);
    console.log(`  - Lock until: ${user.lockUntil || 'Not locked'}`);
    console.log(`  - Is locked: ${user.isLocked}`);
    console.log(`  - Is active: ${user.isActive}`);
    console.log(`  - Is verified: ${user.isVerified}`);
    
    if (user.isLocked) {
      // Reset login attempts and unlock
      await user.resetLoginAttempts();
      console.log('✅ Account unlocked successfully');
    } else {
      console.log('ℹ️  Account was not locked');
    }
    
    // Also ensure account is active and verified
    user.isActive = true;
    user.isVerified = true;
    await user.save();
    
    console.log('✅ Account status updated (active and verified)');
    return true;
    
  } catch (error) {
    console.error('Error unlocking account:', error);
    return false;
  }
};

// Test login credentials
const testCredentials = async (email, password) => {
  try {
    console.log(`\nTesting credentials for: ${email}`);
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      console.log('❌ User not found');
      return false;
    }
    
    const isPasswordValid = await user.comparePassword(password);
    console.log(`Password valid: ${isPasswordValid ? '✅' : '❌'}`);
    
    return isPasswordValid;
  } catch (error) {
    console.error('Error testing credentials:', error);
    return false;
  }
};

// Main function
const main = async () => {
  await connectDB();
  
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (command === 'unlock') {
    const email = args[1];
    if (!email) {
      console.log('Usage: node unlock-account.js unlock <email>');
      process.exit(1);
    }
    await unlockAccount(email);
  } else if (command === 'test') {
    const email = args[1];
    const password = args[2];
    if (!email || !password) {
      console.log('Usage: node unlock-account.js test <email> <password>');
      process.exit(1);
    }
    await testCredentials(email, password);
  } else if (command === 'unlock-all') {
    console.log('Unlocking all locked accounts...');
    const lockedUsers = await User.find({
      $or: [
        { lockUntil: { $exists: true, $ne: null } },
        { loginAttempts: { $gte: 5 } }
      ]
    });
    
    console.log(`Found ${lockedUsers.length} potentially locked accounts`);
    
    for (const user of lockedUsers) {
      console.log(`Unlocking ${user.email}...`);
      await user.resetLoginAttempts();
      user.isActive = true;
      user.isVerified = true;
      await user.save();
    }
    
    console.log('✅ All accounts unlocked');
  } else {
    console.log('Available commands:');
    console.log('  unlock <email>           - Unlock specific account');
    console.log('  test <email> <password>  - Test login credentials');
    console.log('  unlock-all               - Unlock all locked accounts');
    console.log('');
    console.log('Examples:');
    console.log('  node unlock-account.js unlock melkamuwako5@admin.com');
    console.log('  node unlock-account.js test museum.admin@ethioheritage360.com museum123');
    console.log('  node unlock-account.js unlock-all');
  }
  
  await mongoose.connection.close();
  console.log('Database connection closed');
};

// Run the script
main().catch(error => {
  console.error('Script error:', error);
  process.exit(1);
});
