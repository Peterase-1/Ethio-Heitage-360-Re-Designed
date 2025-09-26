const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });
const User = require('../models/User');

const updateOrganizerRole = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ethioheritage360');
    console.log('Connected to MongoDB');

    // Find and update the organizer user
    const result = await User.updateOne(
      { email: 'organizer@heritagetours.et' },
      { 
        $set: { 
          role: 'organizer',
          permissions: [
            'create_events', 'book_events', 'manage_tours', 'view_analytics',
            'request_rentals', 'view_virtual_museum', 'leave_reviews', 'manage_profile',
            'create_educational_tours', 'manage_educational_tours', 'view_educational_analytics'
          ]
        }
      }
    );

    if (result.matchedCount === 0) {
      console.log('❌ User not found');
    } else if (result.modifiedCount === 0) {
      console.log('⚠️  User found but already has organizer role');
    } else {
      console.log('✅ User role updated to organizer successfully!');
    }

    // Verify the update
    const user = await User.findByEmail('organizer@heritagetours.et');
    if (user) {
      console.log(`📋 User: ${user.firstName} ${user.lastName}`);
      console.log(`📧 Email: ${user.email}`);
      console.log(`🔐 Role: ${user.role}`);
      console.log(`✨ Permissions: ${user.permissions.join(', ')}`);
    }

  } catch (error) {
    console.error('Error updating user role:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

updateOrganizerRole();
