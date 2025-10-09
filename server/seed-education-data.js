const mongoose = require('mongoose');
const Course = require('./models/Course');
const EducationalTour = require('./models/EducationalTour');
const User = require('./models/User');

async function seedEducationData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ethioheritage360');
    console.log('🌱 Seeding education data...');

    // Get a dummy user ID for createdBy
    const dummyUser = await User.findOne({ role: 'superAdmin' });
    const createdBy = dummyUser ? dummyUser._id : new mongoose.Types.ObjectId();

    // Create sample courses
    const sampleCourses = [
      {
        title: 'Ethiopian History Fundamentals',
        description: 'Comprehensive course covering Ethiopian history from ancient times to modern era, including the Aksumite Kingdom, Zagwe Dynasty, and modern Ethiopia.',
        category: 'history',
        level: 'beginner',
        duration: 120,
        instructor: {
          name: 'Dr. Alemayehu Assefa',
          email: 'alemayehu@ethioheritage360.com',
          bio: 'Professor of Ethiopian History at Addis Ababa University'
        },
        price: 0,
        averageRating: 4.5,
        enrollmentCount: 45,
        featured: true,
        status: 'published',
        createdBy: createdBy,
        tags: ['history', 'ethiopia', 'ancient', 'civilization'],
        learningObjectives: [
          'Understand the major periods of Ethiopian history',
          'Learn about the Aksumite Kingdom and its significance',
          'Explore the Zagwe Dynasty and Lalibela churches',
          'Study modern Ethiopian history and independence'
        ],
        curriculum: [
          { title: 'Introduction to Ethiopian History', duration: 30 },
          { title: 'The Aksumite Kingdom', duration: 45 },
          { title: 'The Zagwe Dynasty and Lalibela', duration: 30 },
          { title: 'Modern Ethiopia', duration: 15 }
        ]
      },
      {
        title: 'Cultural Heritage Preservation',
        description: 'Learn about preserving Ethiopian cultural heritage, traditional practices, and the importance of cultural conservation.',
        category: 'culture',
        level: 'intermediate',
        duration: 90,
        instructor: {
          name: 'Prof. Mesfin Tadesse',
          email: 'mesfin@ethioheritage360.com',
          bio: 'Cultural Heritage Specialist and Conservation Expert'
        },
        price: 0,
        averageRating: 4.3,
        enrollmentCount: 32,
        featured: true,
        status: 'published',
        createdBy: createdBy,
        tags: ['culture', 'heritage', 'preservation', 'tradition'],
        learningObjectives: [
          'Understand the importance of cultural heritage',
          'Learn preservation techniques',
          'Study traditional Ethiopian practices',
          'Explore modern conservation methods'
        ],
        curriculum: [
          { title: 'Introduction to Cultural Heritage', duration: 20 },
          { title: 'Traditional Ethiopian Practices', duration: 35 },
          { title: 'Preservation Techniques', duration: 25 },
          { title: 'Modern Conservation', duration: 10 }
        ]
      },
      {
        title: 'Archaeological Methods and Techniques',
        description: 'Introduction to archaeological research methods, excavation techniques, and artifact analysis in Ethiopian context.',
        category: 'archaeology',
        level: 'advanced',
        duration: 150,
        instructor: {
          name: 'Dr. Yonas Beyene',
          email: 'yonas@ethioheritage360.com',
          bio: 'Senior Archaeologist and Research Director'
        },
        price: 0,
        averageRating: 4.1,
        enrollmentCount: 18,
        featured: false,
        status: 'published',
        createdBy: createdBy,
        tags: ['archaeology', 'excavation', 'research', 'methods'],
        learningObjectives: [
          'Master archaeological excavation techniques',
          'Learn artifact analysis methods',
          'Understand dating techniques',
          'Study Ethiopian archaeological sites'
        ],
        curriculum: [
          { title: 'Introduction to Archaeology', duration: 30 },
          { title: 'Excavation Techniques', duration: 45 },
          { title: 'Artifact Analysis', duration: 45 },
          { title: 'Ethiopian Archaeological Sites', duration: 30 }
        ]
      },
      {
        title: 'Ethiopian Coffee Culture',
        description: 'Explore the rich coffee culture of Ethiopia, from traditional coffee ceremonies to modern coffee production.',
        category: 'culture',
        level: 'beginner',
        duration: 60,
        instructor: {
          name: 'Dr. Selamawit Bekele',
          email: 'selamawit@ethioheritage360.com',
          bio: 'Coffee Culture Expert and Traditional Ceremony Specialist'
        },
        price: 0,
        averageRating: 4.8,
        enrollmentCount: 67,
        featured: true,
        status: 'published',
        createdBy: createdBy,
        tags: ['coffee', 'culture', 'ceremony', 'tradition'],
        learningObjectives: [
          'Understand Ethiopian coffee history',
          'Learn traditional coffee ceremony',
          'Study coffee production methods',
          'Explore modern coffee culture'
        ],
        curriculum: [
          { title: 'History of Ethiopian Coffee', duration: 15 },
          { title: 'Traditional Coffee Ceremony', duration: 25 },
          { title: 'Coffee Production', duration: 15 },
          { title: 'Modern Coffee Culture', duration: 5 }
        ]
      }
    ];

    console.log('📚 Creating sample courses...');
    const createdCourses = await Course.insertMany(sampleCourses);
    console.log(`✅ Created ${createdCourses.length} courses`);

    // Create sample educational tours
    const sampleTours = [
      {
        title: 'Lalibela Rock-Hewn Churches Tour',
        description: 'Explore the magnificent rock-hewn churches of Lalibela, a UNESCO World Heritage site. Learn about the architectural marvels and religious significance of these ancient churches.',
        location: 'Lalibela, Amhara Region',
        duration: '3 days',
        maxParticipants: 15,
        price: 2500,
        status: 'published',
        category: 'Religious Heritage',
        difficulty: 'Moderate',
        startDate: new Date('2025-11-01'),
        endDate: new Date('2025-11-03'),
        learningObjectives: [
          'Understand the architectural significance of rock-hewn churches',
          'Learn about the religious history of Lalibela',
          'Explore the UNESCO World Heritage site',
          'Study traditional Ethiopian Orthodox practices'
        ],
        itinerary: [
          { day: 1, activity: 'Arrival and orientation', duration: '2 hours' },
          { day: 1, activity: 'Visit Bete Giyorgis (St. George Church)', duration: '3 hours' },
          { day: 2, activity: 'Explore the Northern Group of churches', duration: '6 hours' },
          { day: 3, activity: 'Visit the Southern Group of churches', duration: '4 hours' }
        ],
        requirements: {
          ageLimit: { min: 12, max: 70 },
          fitnessLevel: 'Moderate',
          prerequisites: ['Basic knowledge of Ethiopian history'],
          recommendedItems: ['Comfortable walking shoes', 'Camera', 'Notebook']
        },
        images: [
          'https://picsum.photos/400/300?random=101',
          'https://picsum.photos/400/300?random=102'
        ]
      },
      {
        title: 'Aksum Archaeological Sites',
        description: 'Discover the ancient kingdom of Aksum and its archaeological treasures. Visit the famous obelisks, royal tombs, and archaeological sites.',
        location: 'Aksum, Tigray Region',
        duration: '2 days',
        maxParticipants: 20,
        price: 1800,
        status: 'published',
        category: 'Archaeological Heritage',
        difficulty: 'Easy',
        startDate: new Date('2025-11-15'),
        endDate: new Date('2025-11-16'),
        learningObjectives: [
          'Learn about the Aksumite Kingdom',
          'Understand the significance of the obelisks',
          'Explore royal tombs and archaeological sites',
          'Study ancient Ethiopian civilization'
        ],
        itinerary: [
          { day: 1, activity: 'Arrival and museum visit', duration: '3 hours' },
          { day: 1, activity: 'Visit the Great Obelisk', duration: '2 hours' },
          { day: 2, activity: 'Explore royal tombs', duration: '4 hours' },
          { day: 2, activity: 'Visit archaeological sites', duration: '3 hours' }
        ],
        requirements: {
          ageLimit: { min: 10, max: 75 },
          fitnessLevel: 'Easy',
          prerequisites: [],
          recommendedItems: ['Comfortable shoes', 'Camera', 'Water bottle']
        },
        images: [
          'https://picsum.photos/400/300?random=201',
          'https://picsum.photos/400/300?random=202'
        ]
      },
      {
        title: 'Harar Cultural Heritage',
        description: 'Experience the unique culture and architecture of Harar, the historic walled city. Explore the old town, traditional houses, and cultural sites.',
        location: 'Harar, Harari Region',
        duration: '1 day',
        maxParticipants: 25,
        price: 1200,
        status: 'published',
        category: 'Cultural Heritage',
        difficulty: 'Easy',
        startDate: new Date('2025-12-01'),
        endDate: new Date('2025-12-01'),
        learningObjectives: [
          'Explore the historic walled city of Harar',
          'Learn about traditional Harari architecture',
          'Understand the cultural significance of Harar',
          'Study the UNESCO World Heritage site'
        ],
        itinerary: [
          { day: 1, activity: 'Arrival and city orientation', duration: '1 hour' },
          { day: 1, activity: 'Explore the old walled city', duration: '4 hours' },
          { day: 1, activity: 'Visit traditional houses', duration: '2 hours' },
          { day: 1, activity: 'Cultural sites tour', duration: '3 hours' }
        ],
        requirements: {
          ageLimit: { min: 8, max: 80 },
          fitnessLevel: 'Easy',
          prerequisites: [],
          recommendedItems: ['Comfortable walking shoes', 'Camera', 'Hat']
        },
        images: [
          'https://picsum.photos/400/300?random=301',
          'https://picsum.photos/400/300?random=302'
        ]
      }
    ];

    console.log('🏛️ Creating sample educational tours...');
    const createdTours = await EducationalTour.insertMany(sampleTours);
    console.log(`✅ Created ${createdTours.length} educational tours`);

    console.log('\n🎉 Education data seeding completed!');
    console.log(`📚 Courses: ${createdCourses.length}`);
    console.log(`🏛️ Tours: ${createdTours.length}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding education data:', error);
    process.exit(1);
  }
}

seedEducationData();
