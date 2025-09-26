const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });
const EducationalTour = require('../models/EducationalTour');
const User = require('../models/User');

const seedEducationalTours = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ethioheritage360');
    console.log('Connected to MongoDB');

    // Find the organizer user
    const organizer = await User.findOne({ email: 'organizer@heritagetours.et' });
    if (!organizer) {
      console.log('❌ Organizer user not found');
      process.exit(1);
    }

    // Clear existing educational tours
    await EducationalTour.deleteMany({});
    console.log('🗑️  Cleared existing educational tours');

    // Sample educational tours data
    const sampleTours = [
      {
        title: 'Islamic Architecture of Harar',
        shortDescription: 'Explore the ancient Islamic architecture and cultural sites of the walled city',
        description: 'Join us for a comprehensive exploration of Harar\'s Islamic architectural heritage. This immersive tour will take you through the narrow alleyways of the walled city, showcasing centuries-old mosques, traditional Harari houses, and the unique architectural elements that make this UNESCO World Heritage site so special.',
        category: 'Islamic Architecture',
        difficulty: 'Intermediate',
        startDate: new Date('2025-12-15T09:00:00Z'),
        endDate: new Date('2025-12-15T17:00:00Z'),
        duration: 8,
        maxParticipants: 15,
        location: {
          name: 'Harar Jugol',
          address: 'Old City, Harar, Ethiopia',
          coordinates: {
            latitude: 9.3111,
            longitude: 42.1290
          },
          meetingPoint: 'Harar Gate Main Entrance'
        },
        organizerId: organizer._id,
        organizerName: `${organizer.firstName} ${organizer.lastName}`,
        curriculum: [
          {
            order: 1,
            title: 'Introduction to Harar\'s Islamic Heritage',
            description: 'Overview of the city\'s history and Islamic significance',
            duration: 60,
            activities: ['Guided Tour', 'Discussion'],
            resources: [
              { type: 'document', title: 'Historical timeline', description: 'Chronological history of Harar' },
              { type: 'image', title: 'Map of key sites', description: 'Interactive map of important locations' }
            ]
          },
          {
            order: 2,
            title: 'Architectural Styles and Techniques',
            description: 'Understanding traditional Islamic architectural elements',
            duration: 90,
            activities: ['Guided Tour', 'Photography', 'Sketching'],
            resources: [
              { type: 'document', title: 'Architecture guide', description: 'Comprehensive guide to Islamic architecture' },
              { type: 'document', title: 'Sketching materials', description: 'Materials and instructions for architectural sketching' }
            ]
          },
          {
            order: 3,
            title: 'Cultural Integration and Modern Preservation',
            description: 'How Islamic architecture integrates with local culture',
            duration: 60,
            activities: ['Discussion', 'Hands-on Activity'],
            resources: [
              { type: 'document', title: 'Preservation techniques guide', description: 'Modern methods for heritage preservation' }
            ]
          }
        ],
        learningObjectives: [
          'Identify key elements of Islamic architecture in Harar',
          'Understand the historical development of the city',
          'Appreciate cultural preservation efforts',
          'Learn basic architectural sketching techniques'
        ],
        pricing: {
          price: 850,
          currency: 'ETB',
          includes: [
            'Expert guide',
            'Entry fees to historical sites',
            'Traditional lunch',
            'Course materials',
            'Certificate of completion'
          ],
          excludes: [
            'Transportation to Harar',
            'Personal expenses',
            'Additional meals'
          ]
        },
        status: 'published',
        isActive: true,
        createdBy: organizer._id
      },
      {
        title: 'Ethiopian Scripts and Ancient Writing',
        shortDescription: 'Learn about the evolution of Ethiopian writing systems and their cultural significance',
        description: 'Dive deep into the fascinating world of Ethiopian scripts, from ancient Ge\'ez to modern Amharic. This hands-on workshop will teach you about the historical development, cultural significance, and practical application of Ethiopia\'s unique writing systems.',
        category: 'Ethiopian Scripts',
        difficulty: 'Beginner',
        startDate: new Date('2025-12-20T14:00:00Z'),
        endDate: new Date('2025-12-20T18:00:00Z'),
        duration: 4,
        maxParticipants: 20,
        location: {
          name: 'National Library of Ethiopia',
          address: 'Churchill Ave, Addis Ababa, Ethiopia',
          coordinates: {
            latitude: 9.0192,
            longitude: 38.7525
          },
          meetingPoint: 'Library Main Entrance'
        },
        organizerId: organizer._id,
        organizerName: `${organizer.firstName} ${organizer.lastName}`,
        curriculum: [
          {
            order: 1,
            title: 'History of Ethiopian Writing Systems',
            description: 'From ancient Ge\'ez to modern Amharic scripts',
            duration: 90,
            activities: ['Guided Tour', 'Discussion'],
            resources: [
              { type: 'image', title: 'Script evolution chart', description: 'Visual timeline of Ethiopian script development' },
              { type: 'image', title: 'Historical manuscripts', description: 'Examples of ancient Ethiopian texts' }
            ]
          },
          {
            order: 2,
            title: 'Hands-on Script Writing',
            description: 'Practice writing with traditional tools and methods',
            duration: 90,
            activities: ['Hands-on Activity', 'Demonstration'],
            resources: [
              { type: 'document', title: 'Writing materials', description: 'List of traditional writing tools and supplies' },
              { type: 'document', title: 'Practice sheets', description: 'Printable practice sheets for script writing' }
            ]
          }
        ],
        learningObjectives: [
          'Understand the history of Ethiopian scripts',
          'Learn basic Ge\'ez and Amharic writing',
          'Appreciate the cultural importance of written language',
          'Practice traditional writing techniques'
        ],
        pricing: {
          price: 450,
          currency: 'ETB',
          includes: [
            'Expert linguist guide',
            'Writing materials',
            'Reference books',
            'Refreshments',
            'Certificate of completion'
          ],
          excludes: [
            'Transportation',
            'Personal expenses'
          ]
        },
        status: 'published',
        isActive: true,
        createdBy: organizer._id
      },
      {
        title: 'Traditional Arts and Crafts Workshop',
        shortDescription: 'Learn traditional Ethiopian arts and crafts from master artisans',
        description: 'Experience the rich tradition of Ethiopian arts and crafts through hands-on workshops with master artisans. Learn pottery, weaving, basket making, and other traditional crafts while understanding their cultural significance.',
        category: 'Traditional Arts',
        difficulty: 'Beginner',
        startDate: new Date('2025-12-25T10:00:00Z'),
        endDate: new Date('2025-12-25T16:00:00Z'),
        duration: 6,
        maxParticipants: 12,
        location: {
          name: 'Addis Ababa Artisan Center',
          address: 'Mercato Area, Addis Ababa, Ethiopia',
          coordinates: {
            latitude: 9.0192,
            longitude: 38.7525
          },
          meetingPoint: 'Artisan Center Main Gate'
        },
        organizerId: organizer._id,
        organizerName: `${organizer.firstName} ${organizer.lastName}`,
        curriculum: [
          {
            order: 1,
            title: 'Introduction to Traditional Crafts',
            description: 'Overview of Ethiopian traditional arts and their cultural significance',
            duration: 60,
            activities: ['Guided Tour', 'Discussion'],
            resources: [
              { type: 'image', title: 'Craft examples', description: 'Gallery of traditional Ethiopian crafts' },
              { type: 'document', title: 'Cultural context guide', description: 'Cultural significance of traditional arts' }
            ]
          },
          {
            order: 2,
            title: 'Pottery Workshop',
            description: 'Learn traditional pottery techniques',
            duration: 120,
            activities: ['Hands-on Activity', 'Demonstration'],
            resources: [
              { type: 'document', title: 'Clay preparation', description: 'Guide to preparing clay for pottery' },
              { type: 'document', title: 'Pottery tools guide', description: 'Introduction to traditional pottery tools' },
              { type: 'document', title: 'Kiln usage', description: 'Safety and techniques for kiln operation' }
            ]
          },
          {
            order: 3,
            title: 'Weaving and Basket Making',
            description: 'Traditional weaving and basket making techniques',
            duration: 120,
            activities: ['Hands-on Activity', 'Demonstration'],
            resources: [
              { type: 'document', title: 'Natural fibers guide', description: 'Types and preparation of natural fibers' },
              { type: 'document', title: 'Weaving tools manual', description: 'Traditional weaving tools and techniques' }
            ]
          }
        ],
        learningObjectives: [
          'Understand the cultural significance of traditional crafts',
          'Learn basic pottery techniques',
          'Master simple weaving patterns',
          'Create your own traditional craft items'
        ],
        pricing: {
          price: 650,
          currency: 'ETB',
          includes: [
            'Master artisan instruction',
            'All materials',
            'Tools usage',
            'Traditional lunch',
            'Take-home crafts',
            'Certificate of completion'
          ],
          excludes: [
            'Transportation',
            'Personal expenses'
          ]
        },
        status: 'published',
        isActive: true,
        createdBy: organizer._id
      }
    ];

    // Insert sample tours
    const createdTours = await EducationalTour.insertMany(sampleTours);
    console.log(`✅ Created ${createdTours.length} educational tours`);

    // Display created tours
    console.log('\n📚 Created Educational Tours:');
    createdTours.forEach(tour => {
      console.log(`  - ${tour.title} (${tour.category}) - ${tour.pricing.price} ${tour.pricing.currency}`);
    });

  } catch (error) {
    console.error('Error seeding educational tours:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

seedEducationalTours();
