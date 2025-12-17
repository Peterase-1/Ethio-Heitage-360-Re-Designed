const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');
const Notification = require('../models/Notification');
const Communication = require('../models/Communication');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ethioheritage360';

const seedData = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const museumAdminEmail = 'museum.admin@ethioheritage360.com';
    const superAdminEmail = 'melkamuwako5@admin.com'; // Admin credentials from summary

    const museumAdmin = await User.findOne({ email: museumAdminEmail });
    const superAdmin = await User.findOne({ email: superAdminEmail });

    if (!museumAdmin) {
      console.error(`Museum Admin (${museumAdminEmail}) not found. Please run main seed script first.`);
      process.exit(1);
    }

    console.log(`Found Museum Admin: ${museumAdmin._id}`);
    console.log(`Found Super Admin: ${superAdmin ? superAdmin._id : 'Not Found (using generic ID if needed)'}`);

    // --- Notifications ---
    console.log('Seeding Notifications...');
    const notifications = [
      {
        title: 'Welcome to the System',
        message: 'Your museum profile has been successfully created. Please update your settings.',
        type: 'info',
        category: 'system_administration',
        priority: 'medium',
        status: 'delivered',
        recipients: [{ user: museumAdmin._id }],
        createdBy: superAdmin ? superAdmin._id : museumAdmin._id,
        context: { source: 'system' }
      },
      {
        title: 'New Rental Request',
        message: 'You have a new rental request for "Ancient Vase" pending approval.',
        type: 'rental',
        category: 'artifact_management',
        priority: 'high',
        status: 'delivered',
        recipients: [{ user: museumAdmin._id }],
        createdBy: superAdmin ? superAdmin._id : museumAdmin._id,
        context: { source: 'system', relatedEntity: 'rental' }
      },
      {
        title: 'Security Alert',
        message: 'A login attempt was made from a new device.',
        type: 'security',
        category: 'security',
        priority: 'critical',
        status: 'delivered',
        recipients: [{ user: museumAdmin._id }],
        createdBy: superAdmin ? superAdmin._id : museumAdmin._id,
        context: { source: 'security_system', relatedEntity: 'system' }
      }
    ];

    // Delete existing test notifications for clarity (optional)
    // await Notification.deleteMany({ 'recipients.user': museumAdmin._id });

    await Notification.insertMany(notifications);
    console.log('Notifications seeded.');

    // --- Communications ---
    if (superAdmin) {
      console.log('Seeding Communications...');
      const communications = [
        {
          type: 'announcement',
          from: superAdmin._id,
          to: museumAdmin._id,
          subject: 'System Maintenance',
          message: 'The system will be down for maintenance on Sunday at 2 AM.',
          priority: 'medium',
          status: 'sent',
          readAt: null
        },
        {
          type: 'inquiry',
          from: museumAdmin._id,
          to: superAdmin._id,
          subject: 'Question about verification',
          message: 'How long does the museum verification process take?',
          priority: 'medium',
          status: 'sent'
        },
        {
          type: 'response',
          from: superAdmin._id,
          to: museumAdmin._id,
          subject: 'Re: Question about verification',
          message: 'It usually takes 2-3 business days.',
          priority: 'medium',
          status: 'sent',
          readAt: null
        }
      ];

      // await Communication.deleteMany({ $or: [{ from: museumAdmin._id }, { to: museumAdmin._id }] });
      await Communication.insertMany(communications);
      console.log('Communications seeded.');
    }

    console.log('Seeding complete!');
    process.exit(0);

  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
