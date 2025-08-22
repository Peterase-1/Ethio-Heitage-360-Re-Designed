const mongoose = require('mongoose');
const Notification = require('../models/Notification');
const User = require('../models/User');
const Museum = require('../models/Museum');
require('dotenv').config();

async function seedNotifications() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ethio-heritage-360');
    
    console.log('Connected to MongoDB');

    // Find a museum admin user
    const museumAdmin = await User.findOne({ role: 'museum_admin' });
    if (!museumAdmin) {
      console.log('No museum admin found. Please create a museum admin user first.');
      return;
    }

    // Find the museum this admin manages
    const museum = await Museum.findOne({ admin: museumAdmin._id });
    if (!museum) {
      console.log('No museum found for this admin.');
      return;
    }

    console.log(`Creating notifications for admin: ${museumAdmin.name} (${museum.name})`);

    // Sample notifications
    const sampleNotifications = [
      {
        title: 'Virtual Exhibition Approved',
        message: 'Your "Ethiopian Heritage Collection" has been approved for public display.',
        type: 'approval',
        category: 'content_approval',
        priority: 'high',
        recipients: [{ user: museumAdmin._id }],
        context: {
          source: 'system',
          relatedEntity: 'museum',
          relatedEntityId: museum._id
        },
        createdBy: museumAdmin._id
      },
      {
        title: 'New Rental Request',
        message: 'University of Addis Ababa has requested to rent the Ancient Ethiopian Vase.',
        type: 'rental',
        category: 'business_operations',
        priority: 'medium',
        recipients: [{ user: museumAdmin._id }],
        context: {
          source: 'system',
          relatedEntity: 'rental',
          relatedEntityId: museum._id
        },
        createdBy: museumAdmin._id,
        action: {
          type: 'redirect',
          url: '/museum-admin/rentals?status=pending',
          buttonText: 'View Rentals'
        }
      },
      {
        title: 'System Maintenance Scheduled',
        message: 'Scheduled maintenance will occur on Sunday from 2:00 AM to 4:00 AM.',
        type: 'system',
        category: 'system_administration',
        priority: 'low',
        recipients: [{ user: museumAdmin._id, readAt: new Date() }], // Mark as read
        context: {
          source: 'system',
          relatedEntity: 'system'
        },
        createdBy: museumAdmin._id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Expires in 7 days
      },
      {
        title: 'Artifact Submission Pending Review',
        message: 'Staff member John Doe has submitted 3 new artifacts for your review.',
        type: 'workflow',
        category: 'content_approval',
        priority: 'medium',
        recipients: [{ user: museumAdmin._id }],
        context: {
          source: 'system',
          relatedEntity: 'artifact',
          relatedEntityId: museum._id
        },
        createdBy: museumAdmin._id,
        action: {
          type: 'redirect',
          url: '/museum-admin/artifacts?status=pending-review',
          buttonText: 'Review Artifacts'
        }
      },
      {
        title: 'Monthly Report Available',
        message: 'Your monthly analytics report for ' + new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) + ' is now available.',
        type: 'milestone',
        category: 'analytics',
        priority: 'low',
        recipients: [{ user: museumAdmin._id }],
        context: {
          source: 'system',
          relatedEntity: 'museum',
          relatedEntityId: museum._id
        },
        createdBy: museumAdmin._id,
        action: {
          type: 'redirect',
          url: '/museum-admin/analytics',
          buttonText: 'View Report'
        }
      },
      {
        title: 'Security Alert',
        message: 'Multiple failed login attempts detected from an unknown IP address.',
        type: 'warning',
        category: 'security',
        priority: 'high',
        recipients: [{ user: museumAdmin._id }],
        context: {
          source: 'system',
          relatedEntity: 'user',
          relatedEntityId: museumAdmin._id
        },
        createdBy: museumAdmin._id
      },
      {
        title: 'New Staff Member Added',
        message: 'Jane Smith has been successfully added to your museum staff team.',
        type: 'success',
        category: 'user_management',
        priority: 'low',
        recipients: [{ user: museumAdmin._id, readAt: new Date() }],
        context: {
          source: 'system',
          relatedEntity: 'museum',
          relatedEntityId: museum._id
        },
        createdBy: museumAdmin._id
      },
      {
        title: 'Visitor Milestone Reached',
        message: 'Congratulations! Your virtual museum has reached 10,000 visitors this month.',
        type: 'milestone',
        category: 'analytics',
        priority: 'medium',
        recipients: [{ user: museumAdmin._id }],
        context: {
          source: 'system',
          relatedEntity: 'museum',
          relatedEntityId: museum._id
        },
        createdBy: museumAdmin._id
      }
    ];

    // Clear existing notifications for this user
    await Notification.deleteMany({ 'recipients.user': museumAdmin._id });
    console.log('Cleared existing notifications');

    // Create new notifications
    for (const notificationData of sampleNotifications) {
      const notification = new Notification(notificationData);
      await notification.save();
      
      // Send notification if immediate delivery is enabled
      if (notification.delivery.immediate) {
        await notification.send();
      }
      
      console.log(`Created notification: ${notification.title}`);
    }

    console.log(`Successfully created ${sampleNotifications.length} sample notifications`);
    console.log('Sample notifications have been added to the database.');

  } catch (error) {
    console.error('Error seeding notifications:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the seed function if this file is executed directly
if (require.main === module) {
  seedNotifications();
}

module.exports = seedNotifications;
