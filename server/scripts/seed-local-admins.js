const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ethioheritage360';

const seedAdmins = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const accounts = [
      {
        firstName: 'Melkamu',
        lastName: 'Wako',
        email: 'melkamuwako5@admin.com',
        password: 'melkamuwako5',
        role: 'superAdmin',
        isVerified: true,
        isActive: true,
        phone: '+251911111111',
        name: 'Melkamu Wako'
      },
      {
        firstName: 'Heritage',
        lastName: 'Tours',
        email: 'organizer@heritagetours.et',
        password: 'organizer123',
        role: 'organizer',
        isVerified: true,
        isActive: true,
        phone: '+251922222222',
        name: 'Heritage Tours Ethiopia'
      },
      {
        firstName: 'Super',
        lastName: 'Admin',
        email: 'superadmin@ethioheritage360.com',
        password: 'SuperAdmin123!',
        role: 'superAdmin',
        isVerified: true,
        isActive: true,
        phone: '+251933333333',
        name: 'System Super Admin'
      }
    ];

    for (const account of accounts) {
      // Delete existing user if present to ensure clean state
      const deleteResult = await User.deleteOne({ email: account.email });
      if (deleteResult.deletedCount > 0) {
        console.log(`Deleted existing user: ${account.email}`);
      }

      await User.create(account);
      console.log(`Created new user: ${account.email} with password: ${account.password}`);
    }

    console.log('Admin account seeding completed.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admins:', error);
    process.exit(1);
  }
};

seedAdmins();
