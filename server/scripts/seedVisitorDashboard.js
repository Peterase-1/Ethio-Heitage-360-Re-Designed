const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Museum = require('../models/Museum');
const Artifact = require('../models/Artifact');
const Course = require('../models/Course');
const TourPackage = require('../models/TourPackage');
const Event = require('../models/Event');
const VisitorProfile = require('../models/VisitorProfile');
const VisitorActivity = require('../models/VisitorActivity');
const VisitorFavorites = require('../models/VisitorFavorites');

// Database connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ethioheritage360', {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Sample data
const museumData = [
  {
    name: 'National Museum of Ethiopia',
    description: 'Home to Lucy, the most famous early human fossil, and a comprehensive collection of Ethiopian cultural artifacts.',
    location: 'Addis Ababa, Ethiopia',
    category: 'history',
    rating: 4.8,
    isActive: true,
    address: {
      street: 'King George VI St',
      city: 'Addis Ababa',
      country: 'Ethiopia'
    },
    contactInfo: {
      phone: '+251-11-117-3374',
      email: 'info@nationalmuseum.gov.et',
      website: 'https://nationalmuseum.gov.et'
    },
    openingHours: {
      monday: { open: '08:30', close: '17:30' },
      tuesday: { open: '08:30', close: '17:30' },
      wednesday: { open: '08:30', close: '17:30' },
      thursday: { open: '08:30', close: '17:30' },
      friday: { open: '08:30', close: '17:30' },
      saturday: { open: '08:30', close: '17:30' },
      sunday: { closed: true }
    },
    ticketPrices: {
      adult: 50,
      student: 25,
      child: 15
    }
  },
  {
    name: 'Ethnological Museum',
    description: 'Located in the former palace of Emperor Haile Selassie, showcasing Ethiopian traditional life and culture.',
    location: 'Addis Ababa University, Ethiopia',
    category: 'culture',
    rating: 4.6,
    isActive: true,
    address: {
      street: 'Algeria St',
      city: 'Addis Ababa',
      country: 'Ethiopia'
    },
    contactInfo: {
      phone: '+251-11-123-9763',
      email: 'info@ethnologicalmuseum.edu.et'
    },
    ticketPrices: {
      adult: 30,
      student: 15,
      child: 10
    }
  },
  {
    name: 'Institute of Ethiopian Studies',
    description: 'Research institution and museum focusing on Ethiopian history, culture, and manuscripts.',
    location: 'Addis Ababa University, Ethiopia',
    category: 'history',
    rating: 4.4,
    isActive: true,
    ticketPrices: {
      adult: 40,
      student: 20,
      child: 12
    }
  },
  {
    name: 'Rock-Hewn Churches of Lalibela Museum',
    description: 'Dedicated to the preservation and interpretation of the famous rock-hewn churches of Lalibela.',
    location: 'Lalibela, Ethiopia',
    category: 'religion',
    rating: 4.9,
    isActive: true,
    ticketPrices: {
      adult: 60,
      student: 30,
      child: 20
    }
  },
  {
    name: 'Axum Archaeological Museum',
    description: 'Showcasing the ancient kingdom of Axum with stelae, coins, and royal artifacts.',
    location: 'Axum, Ethiopia',
    category: 'archaeology',
    rating: 4.7,
    isActive: true,
    ticketPrices: {
      adult: 45,
      student: 22,
      child: 15
    }
  }
];

const artifactData = [
  {
    name: 'Lucy (Australopithecus afarensis)',
    description: 'The famous 3.2 million-year-old early human fossil discovered in Ethiopia in 1974.',
    category: 'archaeology',
    tags: ['fossil', 'early human', 'paleontology', 'discovery'],
    museum: 'National Museum of Ethiopia',
    rating: 4.9,
    viewCount: 15420,
    dateDiscovered: new Date('1974-11-24'),
    significance: 'One of the most important archaeological discoveries, providing crucial evidence for human evolution.',
    condition: 'excellent',
    isOnDisplay: true,
    dimensions: {
      height: 107,
      width: 30,
      depth: 25,
      unit: 'cm'
    }
  },
  {
    name: 'Ark of the Covenant Replica',
    description: 'Detailed replica of the legendary Ark of the Covenant, believed by Ethiopian Orthodox to reside in Axum.',
    category: 'religion',
    tags: ['religious', 'replica', 'orthodox', 'sacred'],
    museum: 'Axum Archaeological Museum',
    rating: 4.6,
    viewCount: 8730,
    significance: 'Central to Ethiopian Orthodox faith and national identity.',
    condition: 'excellent',
    isOnDisplay: true
  },
  {
    name: 'Medieval Ethiopian Manuscripts',
    description: 'Collection of ancient Ge\'ez manuscripts with illuminated religious texts and historical chronicles.',
    category: 'literature',
    tags: ['manuscript', 'geez', 'medieval', 'religious text'],
    museum: 'Institute of Ethiopian Studies',
    rating: 4.7,
    viewCount: 5240,
    dateCreated: new Date('1200-01-01'),
    condition: 'good',
    isOnDisplay: true
  },
  {
    name: 'Traditional Ethiopian Coffee Ceremony Set',
    description: 'Complete set of traditional coffee ceremony tools showcasing Ethiopia\'s coffee culture.',
    category: 'culture',
    tags: ['coffee', 'ceremony', 'traditional', 'cultural'],
    museum: 'Ethnological Museum',
    rating: 4.5,
    viewCount: 6850,
    condition: 'excellent',
    isOnDisplay: true
  },
  {
    name: 'Ancient Axumite Coins',
    description: 'Collection of gold, silver, and bronze coins from the ancient Kingdom of Axum (1st-8th centuries).',
    category: 'archaeology',
    tags: ['coins', 'ancient', 'axum', 'currency'],
    museum: 'Axum Archaeological Museum',
    rating: 4.8,
    viewCount: 4320,
    dateCreated: new Date('0300-01-01'),
    condition: 'good',
    isOnDisplay: true
  }
];

const courseData = [
  {
    title: 'Ethiopian Ancient History',
    description: 'Explore the rich ancient history of Ethiopia from the Kingdom of Axum to medieval times.',
    category: 'History',
    difficulty: 'Intermediate',
    duration: 12, // weeks
    lessonsCount: 24,
    enrollmentCount: 1250,
    rating: 4.8,
    averageRating: 4.8,
    isPublished: true,
    instructor: {
      name: 'Dr. Alemayehu Teshome',
      title: 'Professor of Ethiopian History',
      bio: 'Leading expert in Ethiopian ancient history with 20 years of research experience.'
    },
    syllabus: [
      'Introduction to Ethiopian Civilizations',
      'The Kingdom of Axum',
      'Medieval Ethiopian Kingdoms',
      'Religious Developments',
      'Trade and Economy',
      'Art and Architecture'
    ],
    learningOutcomes: [
      'Understand the development of Ethiopian civilizations',
      'Analyze the significance of the Kingdom of Axum',
      'Evaluate the impact of religion on Ethiopian history'
    ]
  },
  {
    title: 'Traditional Ethiopian Art & Culture',
    description: 'Learn about traditional Ethiopian art forms, cultural practices, and their modern interpretations.',
    category: 'Art & Culture',
    difficulty: 'Beginner',
    duration: 8,
    lessonsCount: 16,
    enrollmentCount: 980,
    rating: 4.6,
    averageRating: 4.6,
    isPublished: true,
    instructor: {
      name: 'Artist Yohannes Admasu',
      title: 'Traditional Arts Master',
      bio: 'Renowned Ethiopian artist specializing in traditional crafts and cultural preservation.'
    }
  },
  {
    title: 'Archaeological Methods in Ethiopian Context',
    description: 'Advanced course on archaeological techniques used in Ethiopian heritage site excavations.',
    category: 'Archaeology',
    difficulty: 'Advanced',
    duration: 16,
    lessonsCount: 32,
    enrollmentCount: 450,
    rating: 4.9,
    averageRating: 4.9,
    isPublished: true,
    instructor: {
      name: 'Dr. Sarah Johnson',
      title: 'Senior Archaeologist',
      bio: 'International expert in African archaeology with extensive fieldwork in Ethiopia.'
    }
  },
  {
    title: 'Ethiopian Orthodox Church Architecture',
    description: 'Study the unique architectural features of Ethiopian Orthodox churches, including rock-hewn churches.',
    category: 'Architecture',
    difficulty: 'Intermediate',
    duration: 10,
    lessonsCount: 20,
    enrollmentCount: 720,
    rating: 4.7,
    averageRating: 4.7,
    isPublished: true
  },
  {
    title: 'Coffee Culture and Traditions',
    description: 'Discover the origins of coffee in Ethiopia and the cultural significance of the coffee ceremony.',
    category: 'Culture',
    difficulty: 'Beginner',
    duration: 6,
    lessonsCount: 12,
    enrollmentCount: 1580,
    rating: 4.5,
    averageRating: 4.5,
    isPublished: true
  }
];

const tourPackageData = [
  {
    title: 'Historic Axum & Lalibela Tour',
    description: 'Visit the ancient kingdom of Axum and the famous rock-hewn churches of Lalibela.',
    duration: 7, // days
    price: 1200,
    maxGroupSize: 15,
    category: 'history',
    rating: 4.8,
    bookingCount: 245,
    isActive: true,
    includes: [
      'Professional guide',
      'Accommodation',
      'Meals',
      'Transportation',
      'Entry fees'
    ],
    itinerary: [
      'Day 1: Arrival in Axum',
      'Day 2: Axum Stelae and Queen of Sheba Palace',
      'Day 3: Travel to Lalibela',
      'Day 4-5: Rock-hewn churches exploration',
      'Day 6: Local cultural experiences',
      'Day 7: Departure'
    ]
  },
  {
    title: 'Simien Mountains & Cultural Heritage',
    description: 'Combine natural beauty with cultural heritage in the Simien Mountains region.',
    duration: 5,
    price: 850,
    maxGroupSize: 12,
    category: 'nature',
    rating: 4.7,
    bookingCount: 180,
    isActive: true
  },
  {
    title: 'Addis Ababa Museums & Culture Tour',
    description: 'Comprehensive tour of Addis Ababa\'s museums and cultural sites.',
    duration: 2,
    price: 180,
    maxGroupSize: 20,
    category: 'culture',
    rating: 4.4,
    bookingCount: 420,
    isActive: true
  },
  {
    title: 'Omo Valley Cultural Expedition',
    description: 'Explore the diverse ethnic cultures of the Omo Valley region.',
    duration: 8,
    price: 1500,
    maxGroupSize: 10,
    category: 'culture',
    rating: 4.9,
    bookingCount: 95,
    isActive: true
  }
];

const eventData = [
  {
    title: 'Ethiopian Heritage Day Celebration',
    description: 'Annual celebration of Ethiopian cultural heritage with exhibitions, performances, and workshops.',
    category: 'culture',
    startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    endDate: new Date(Date.now() + 32 * 24 * 60 * 60 * 1000), // 32 days from now
    location: 'National Museum of Ethiopia, Addis Ababa',
    ticketPrice: 25,
    maxAttendees: 500,
    currentAttendees: 280,
    isActive: true,
    organizer: 'Ministry of Culture and Tourism'
  },
  {
    title: 'Lucy Discovery Anniversary Exhibition',
    description: 'Special exhibition commemorating the discovery of Lucy with new research findings.',
    category: 'archaeology',
    startDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
    location: 'National Museum of Ethiopia, Addis Ababa',
    ticketPrice: 15,
    maxAttendees: 300,
    currentAttendees: 85,
    isActive: true
  },
  {
    title: 'Traditional Coffee Ceremony Workshop',
    description: 'Learn the art of Ethiopian coffee ceremony from master practitioners.',
    category: 'culture',
    startDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
    endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // Same day
    location: 'Ethnological Museum, Addis Ababa',
    ticketPrice: 35,
    maxAttendees: 50,
    currentAttendees: 32,
    isActive: true
  },
  {
    title: 'Medieval Manuscript Conservation Workshop',
    description: 'Professional development workshop on medieval manuscript preservation techniques.',
    category: 'education',
    startDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
    endDate: new Date(Date.now() + 47 * 24 * 60 * 60 * 1000), // 47 days from now
    location: 'Institute of Ethiopian Studies, Addis Ababa',
    ticketPrice: 100,
    maxAttendees: 25,
    currentAttendees: 18,
    isActive: true
  }
];

// Create sample visitor user
const createSampleVisitor = async () => {
  const existingUser = await User.findOne({ email: 'visitor@ethioheritage360.com' });
  if (existingUser) {
    console.log('Sample visitor user already exists');
    return existingUser;
  }

  const salt = await bcryptjs.genSalt(10);
  const hashedPassword = await bcryptjs.hash('visitor123', salt);

  const visitor = new User({
    name: 'Sample Visitor',
    email: 'visitor@ethioheritage360.com',
    password: hashedPassword,
    role: 'user',
    isActive: true,
    emailVerified: true
  });

  await visitor.save();
  console.log('Sample visitor user created');
  return visitor;
};

// Seed function
const seedVisitorDashboard = async () => {
  try {
    console.log('🌱 Starting visitor dashboard seeding...\n');

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await Museum.deleteMany({});
    await Artifact.deleteMany({});
    await Course.deleteMany({});
    await TourPackage.deleteMany({});
    await Event.deleteMany({});
    
    // Create sample visitor user
    const visitor = await createSampleVisitor();

    // Seed museums
    console.log('🏛️  Seeding museums...');
    const museums = await Museum.insertMany(museumData);
    console.log(`✅ Created ${museums.length} museums`);

    // Seed artifacts
    console.log('🏺 Seeding artifacts...');
    const artifacts = [];
    for (const artifactInfo of artifactData) {
      const museum = museums.find(m => m.name === artifactInfo.museum);
      if (museum) {
        artifactInfo.museumId = museum._id;
      }
      artifacts.push(artifactInfo);
    }
    const createdArtifacts = await Artifact.insertMany(artifacts);
    console.log(`✅ Created ${createdArtifacts.length} artifacts`);

    // Seed courses
    console.log('📚 Seeding courses...');
    const courses = await Course.insertMany(courseData);
    console.log(`✅ Created ${courses.length} courses`);

    // Seed tour packages
    console.log('🎒 Seeding tour packages...');
    const tours = await TourPackage.insertMany(tourPackageData);
    console.log(`✅ Created ${tours.length} tour packages`);

    // Seed events
    console.log('🎉 Seeding events...');
    const events = await Event.insertMany(eventData);
    console.log(`✅ Created ${events.length} events`);

    // Create visitor profile
    console.log('👤 Creating visitor profile...');
    const existingProfile = await VisitorProfile.findOne({ userId: visitor._id });
    if (!existingProfile) {
      const profile = new VisitorProfile({
        userId: visitor._id,
        personalInfo: {
          firstName: 'Sample',
          lastName: 'Visitor'
        },
        preferences: {
          interests: ['history', 'culture', 'archaeology'],
          language: 'en'
        },
        stats: {
          totalPoints: 150,
          level: 2,
          streakDays: 5,
          coursesEnrolled: 2,
          coursesCompleted: 1,
          museumsVisited: 3,
          artifactsViewed: 8
        }
      });
      await profile.save();
      console.log('✅ Created visitor profile');
    }

    // Create sample activities
    console.log('⚡ Creating sample activities...');
    const activities = [
      {
        userId: visitor._id,
        sessionId: 'sample-session-1',
        activityType: 'artifact_view',
        activityData: {
          entityId: createdArtifacts[0]._id,
          entityType: 'artifact',
          entityName: createdArtifacts[0].name,
          duration: 120
        },
        pointsEarned: 10
      },
      {
        userId: visitor._id,
        sessionId: 'sample-session-1',
        activityType: 'museum_visit',
        activityData: {
          entityId: museums[0]._id,
          entityType: 'museum',
          entityName: museums[0].name,
          duration: 300
        },
        pointsEarned: 25
      },
      {
        userId: visitor._id,
        sessionId: 'sample-session-2',
        activityType: 'course_enrollment',
        activityData: {
          entityId: courses[0]._id,
          entityType: 'course',
          entityName: courses[0].title
        },
        pointsEarned: 50
      }
    ];
    
    await VisitorActivity.insertMany(activities);
    console.log(`✅ Created ${activities.length} sample activities`);

    // Create sample favorites
    console.log('❤️  Creating sample favorites...');
    const favorites = [
      {
        userId: visitor._id,
        entityId: createdArtifacts[0]._id,
        entityType: 'artifact',
        entityData: {
          name: createdArtifacts[0].name,
          description: createdArtifacts[0].description,
          category: createdArtifacts[0].category,
          rating: createdArtifacts[0].rating
        }
      },
      {
        userId: visitor._id,
        entityId: museums[0]._id,
        entityType: 'museum',
        entityData: {
          name: museums[0].name,
          description: museums[0].description,
          category: museums[0].category,
          rating: museums[0].rating,
          location: museums[0].location
        }
      },
      {
        userId: visitor._id,
        entityId: courses[0]._id,
        entityType: 'course',
        entityData: {
          title: courses[0].title,
          description: courses[0].description,
          category: courses[0].category,
          rating: courses[0].rating
        }
      }
    ];

    await VisitorFavorites.insertMany(favorites);
    console.log(`✅ Created ${favorites.length} sample favorites`);

    console.log('\n🎉 Visitor dashboard seeding completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`- Museums: ${museums.length}`);
    console.log(`- Artifacts: ${createdArtifacts.length}`);
    console.log(`- Courses: ${courses.length}`);
    console.log(`- Tour Packages: ${tours.length}`);
    console.log(`- Events: ${events.length}`);
    console.log(`- Sample visitor profile created`);
    console.log(`- Activities: ${activities.length}`);
    console.log(`- Favorites: ${favorites.length}`);
    console.log('\n🔐 Test visitor login:');
    console.log('Email: visitor@ethioheritage360.com');
    console.log('Password: visitor123');

  } catch (error) {
    console.error('❌ Error seeding visitor dashboard:', error);
    throw error;
  }
};

// Run seeding
const runSeeding = async () => {
  await connectDB();
  await seedVisitorDashboard();
  process.exit(0);
};

// Run if called directly
if (require.main === module) {
  runSeeding();
}

module.exports = { seedVisitorDashboard };
