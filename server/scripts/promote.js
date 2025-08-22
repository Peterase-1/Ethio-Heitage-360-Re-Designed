const mongoose = require('mongoose');
const User = require('../models/User');
const config = require('../config/env');

async function promote(email, role) {
  if (!email) {
    console.error('Usage: node scripts/promote.js <email> [role]');
    process.exit(1);
  }
  const targetRole = role || 'super_admin';
  try {
    await mongoose.connect(config.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.error(`User not found: ${email}`);
      process.exit(2);
    }
    user.role = targetRole;
    user.isActive = true;
    await user.save();
    console.log(`Updated ${email} -> role=${targetRole}`);
    process.exit(0);
  } catch (err) {
    console.error('Promotion error:', err.message);
    process.exit(3);
  }
}

const [,, email, role] = process.argv;
promote(email, role);

