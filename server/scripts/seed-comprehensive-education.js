const mongoose = require('mongoose');
const Course = require('./models/Course');
const EducationalTour = require('./models/EducationalTour');
const Game = require('./models/Game');
const User = require('./models/User');
const LearningProgress = require('./models/LearningProgress');
const Achievement = require('./models/Achievement');

async function seedComprehensiveEducation() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ethioheritage360');
    console.log('🌱 Seeding comprehensive education data...');

    // Get a dummy user ID for createdBy
    const dummyUser = await User.findOne({ role: 'superAdmin' });
    const createdBy = dummyUser ? dummyUser._id : new mongoose.Types.ObjectId();

    // Clear existing data
    console.log('🧹 Clearing existing education data...');
    await Course.deleteMany({});
    await EducationalTour.deleteMany({});
    await Game.deleteMany({});
    await LearningProgress.deleteMany({});
    await Achievement.deleteMany({});

    // Create comprehensive courses
    const courses = [
      {
        title: 'Ethiopian History Fundamentals',
        description: 'Comprehensive course covering Ethiopian history from ancient times to modern era, including the Aksumite Kingdom, Zagwe Dynasty, and modern Ethiopia.',
        category: 'history',
        level: 'beginner',
        duration: 120,
        instructor: {
          name: 'Dr. Alemayehu Assefa',
          email: 'alemayehu@ethioheritage360.com',
          bio: 'Professor of Ethiopian History at Addis Ababa University with 20+ years of experience'
        },
        price: 0,
        averageRating: 4.5,
        enrollmentCount: 45,
        featured: true,
        status: 'published',
        createdBy: createdBy,
        tags: ['history', 'ethiopia', 'ancient', 'civilization', 'aksum'],
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
        ],
        thumbnail: 'https://picsum.photos/400/300?random=101'
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
          bio: 'Cultural Heritage Specialist and Conservation Expert with UNESCO experience'
        },
        price: 0,
        averageRating: 4.3,
        enrollmentCount: 32,
        featured: true,
        status: 'published',
        createdBy: createdBy,
        tags: ['culture', 'heritage', 'preservation', 'tradition', 'conservation'],
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
        ],
        thumbnail: 'https://picsum.photos/400/300?random=102'
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
          bio: 'Senior Archaeologist and Research Director at Ethiopian Heritage Authority'
        },
        price: 0,
        averageRating: 4.1,
        enrollmentCount: 18,
        featured: false,
        status: 'published',
        createdBy: createdBy,
        tags: ['archaeology', 'excavation', 'research', 'methods', 'artifacts'],
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
        ],
        thumbnail: 'https://picsum.photos/400/300?random=103'
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
        tags: ['coffee', 'culture', 'ceremony', 'tradition', 'ethiopia'],
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
        ],
        thumbnail: 'https://picsum.photos/400/300?random=104'
      },
      {
        title: 'Traditional Ethiopian Arts and Crafts',
        description: 'Discover the rich tradition of Ethiopian arts and crafts, including weaving, pottery, and metalwork.',
        category: 'art',
        level: 'beginner',
        duration: 90,
        instructor: {
          name: 'Master Tewodros Worku',
          email: 'tewodros@ethioheritage360.com',
          bio: 'Master Craftsman and Traditional Arts Teacher'
        },
        price: 0,
        averageRating: 4.7,
        enrollmentCount: 38,
        featured: true,
        status: 'published',
        createdBy: createdBy,
        tags: ['art', 'crafts', 'traditional', 'weaving', 'pottery'],
        learningObjectives: [
          'Learn traditional weaving techniques',
          'Understand pottery making methods',
          'Study metalwork traditions',
          'Explore contemporary adaptations'
        ],
        curriculum: [
          { title: 'Introduction to Traditional Arts', duration: 20 },
          { title: 'Weaving Techniques', duration: 30 },
          { title: 'Pottery Making', duration: 25 },
          { title: 'Metalwork Traditions', duration: 15 }
        ],
        thumbnail: 'https://picsum.photos/400/300?random=105'
      },
      {
        title: 'Ethiopian Languages and Scripts',
        description: 'Study the diverse languages and writing systems of Ethiopia, including Amharic, Ge\'ez, and other regional languages.',
        category: 'language',
        level: 'intermediate',
        duration: 100,
        instructor: {
          name: 'Dr. Abebe Kebede',
          email: 'abebe@ethioheritage360.com',
          bio: 'Linguist and Ethiopian Language Specialist'
        },
        price: 0,
        averageRating: 4.4,
        enrollmentCount: 25,
        featured: false,
        status: 'published',
        createdBy: createdBy,
        tags: ['language', 'amharic', 'geez', 'script', 'linguistics'],
        learningObjectives: [
          'Understand Ethiopian language diversity',
          'Learn basic Amharic script',
          'Study Ge\'ez writing system',
          'Explore regional language variations'
        ],
        curriculum: [
          { title: 'Language Diversity in Ethiopia', duration: 25 },
          { title: 'Amharic Script and Grammar', duration: 35 },
          { title: 'Ge\'ez Writing System', duration: 25 },
          { title: 'Regional Languages', duration: 15 }
        ],
        thumbnail: 'https://picsum.photos/400/300?random=106'
      }
    ];

    console.log('📚 Creating comprehensive courses...');
    const createdCourses = await Course.insertMany(courses);
    console.log(`✅ Created ${createdCourses.length} courses`);

    // Create educational games
    const games = [
      {
        title: 'Ethiopian Kingdoms Quest',
        description: 'Travel through time and explore the great kingdoms of Ethiopia from Aksum to the Zagwe dynasty!',
        gameType: 'heritage-hunt',
        category: 'history',
        difficulty: 'intermediate',
        playTime: '15-20 min',
        image: 'https://picsum.photos/400/300?random=201',
        instructions: 'Navigate through different historical periods and answer questions about Ethiopian kingdoms.',
        rules: [
          'Answer questions correctly to advance',
          'Collect historical artifacts',
          'Learn about different dynasties',
          'Complete all levels to win'
        ],
        learningObjectives: [
          'Understand Ethiopian historical periods',
          'Learn about different kingdoms',
          'Identify key historical figures',
          'Recognize important events'
        ],
        tags: ['history', 'kingdoms', 'aksum', 'zagwe', 'quest'],
        isActive: true,
        isPublished: true,
        publishedAt: new Date(),
        createdBy: createdBy,
        points: 100,
        achievements: ['Kingdom Explorer', 'History Master']
      },
      {
        title: 'Coffee Culture Quiz',
        description: 'Test your knowledge about Ethiopian coffee culture and the traditional coffee ceremony!',
        gameType: 'quiz-adventure',
        category: 'culture',
        difficulty: 'beginner',
        playTime: '5-10 min',
        image: 'https://picsum.photos/400/300?random=202',
        instructions: 'Answer multiple choice questions about Ethiopian coffee culture.',
        rules: [
          'Select the correct answer',
          'No time limit',
          'Learn from explanations',
          'Try to get 100% score'
        ],
        learningObjectives: [
          'Understand coffee ceremony steps',
          'Learn coffee culture traditions',
          'Recognize coffee types',
          'Appreciate cultural significance'
        ],
        tags: ['coffee', 'culture', 'ceremony', 'quiz', 'tradition'],
        isActive: true,
        isPublished: true,
        publishedAt: new Date(),
        createdBy: createdBy,
        points: 50,
        achievements: ['Coffee Expert', 'Culture Enthusiast']
      },
      {
        title: 'Archaeological Treasures Hunt',
        description: 'Discover Ethiopia\'s ancient archaeological wonders and unlock the secrets of the past!',
        gameType: 'artifact-discovery',
        category: 'artifacts',
        difficulty: 'intermediate',
        playTime: '10-15 min',
        image: 'https://picsum.photos/400/300?random=203',
        instructions: 'Find and identify archaeological artifacts from different Ethiopian sites.',
        rules: [
          'Explore different archaeological sites',
          'Identify artifacts correctly',
          'Learn about excavation methods',
          'Complete the treasure hunt'
        ],
        learningObjectives: [
          'Identify archaeological artifacts',
          'Understand excavation techniques',
          'Learn about Ethiopian sites',
          'Appreciate archaeological importance'
        ],
        tags: ['archaeology', 'artifacts', 'excavation', 'treasure', 'hunt'],
        isActive: true,
        isPublished: true,
        publishedAt: new Date(),
        createdBy: createdBy,
        points: 75,
        achievements: ['Archaeology Explorer', 'Treasure Hunter']
      },
      {
        title: 'Festival Memory Match',
        description: 'Match traditional festival images and learn about Ethiopian celebrations like Timkat and Meskel!',
        gameType: 'memory-match',
        category: 'traditions',
        difficulty: 'beginner',
        playTime: '5-8 min',
        image: 'https://picsum.photos/400/300?random=204',
        instructions: 'Match festival images with their names and descriptions.',
        rules: [
          'Flip cards to find matches',
          'Learn about different festivals',
          'Complete all matches',
          'Beat the timer'
        ],
        learningObjectives: [
          'Recognize Ethiopian festivals',
          'Learn festival traditions',
          'Understand cultural significance',
          'Improve memory skills'
        ],
        tags: ['festivals', 'memory', 'culture', 'traditions', 'match'],
        isActive: true,
        isPublished: true,
        publishedAt: new Date(),
        createdBy: createdBy,
        points: 40,
        achievements: ['Festival Expert', 'Memory Master']
      },
      {
        title: 'Heritage Site Explorer',
        description: 'Explore UNESCO World Heritage Sites in Ethiopia and learn about their significance!',
        gameType: 'heritage-hunt',
        category: 'heritage',
        difficulty: 'intermediate',
        playTime: '12-18 min',
        image: 'https://picsum.photos/400/300?random=205',
        instructions: 'Navigate through different heritage sites and complete challenges.',
        rules: [
          'Visit different heritage sites',
          'Complete site-specific challenges',
          'Learn about UNESCO criteria',
          'Collect site certificates'
        ],
        learningObjectives: [
          'Understand UNESCO criteria',
          'Learn about heritage site importance',
          'Recognize different site types',
          'Appreciate conservation efforts'
        ],
        tags: ['heritage', 'unesco', 'sites', 'exploration', 'conservation'],
        isActive: true,
        isPublished: true,
        publishedAt: new Date(),
        createdBy: createdBy,
        points: 120,
        achievements: ['Heritage Explorer', 'UNESCO Expert']
      }
    ];

    console.log('🎮 Creating educational games...');
    const createdGames = await Game.insertMany(games);
    console.log(`✅ Created ${createdGames.length} games`);

    // Create educational tours
    const tours = [
      {
        title: 'Lalibela Rock-Hewn Churches Tour',
        description: 'Explore the magnificent rock-hewn churches of Lalibela, a UNESCO World Heritage site. Learn about the architectural marvels and religious significance of these ancient churches.',
        location: {
          name: 'Lalibela, Amhara Region',
          address: 'Lalibela, Amhara, Ethiopia',
          meetingPoint: 'Lalibela Airport'
        },
        duration: 3, // days
        maxParticipants: 15,
        pricing: {
          price: 2500,
          currency: 'ETB',
          includes: ['Transportation', 'Guide', 'Accommodation', 'Meals'],
          excludes: ['Personal expenses', 'Travel insurance']
        },
        status: 'published',
        category: 'Religious Heritage',
        difficulty: 'Intermediate',
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
          {
            url: 'https://picsum.photos/400/300?random=301',
            caption: 'Lalibela Rock-Hewn Churches',
            isPrimary: true
          },
          {
            url: 'https://picsum.photos/400/300?random=302',
            caption: 'Bete Giyorgis Church',
            isPrimary: false
          }
        ],
        organizerName: 'EthioHeritage360 Tours',
        organizerId: createdBy,
        createdBy: createdBy
      },
      {
        title: 'Aksum Archaeological Sites',
        description: 'Discover the ancient kingdom of Aksum and its archaeological treasures. Visit the famous obelisks, royal tombs, and archaeological sites.',
        location: {
          name: 'Aksum, Tigray Region',
          address: 'Aksum, Tigray, Ethiopia',
          meetingPoint: 'Aksum Airport'
        },
        duration: 2, // days
        maxParticipants: 20,
        pricing: {
          price: 1800,
          currency: 'ETB',
          includes: ['Transportation', 'Guide', 'Accommodation'],
          excludes: ['Meals', 'Personal expenses']
        },
        status: 'published',
        category: 'Cultural Heritage',
        difficulty: 'Beginner',
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
          {
            url: 'https://picsum.photos/400/300?random=303',
            caption: 'Aksum Obelisks',
            isPrimary: true
          },
          {
            url: 'https://picsum.photos/400/300?random=304',
            caption: 'Archaeological Sites',
            isPrimary: false
          }
        ],
        organizerName: 'EthioHeritage360 Tours',
        organizerId: createdBy,
        createdBy: createdBy
      }
    ];

    console.log('🏛️ Creating educational tours...');
    const createdTours = await EducationalTour.insertMany(tours);
    console.log(`✅ Created ${createdTours.length} educational tours`);

    // Create achievements
    const achievements = [
      {
        id: 'heritage_explorer_001',
        name: 'Heritage Explorer',
        description: 'Complete 5 heritage-related activities',
        type: 'category_master',
        category: 'general',
        icon: 'explore',
        points: 100,
        criteria: {
          type: 'category_lessons',
          threshold: 5,
          category: 'heritage'
        },
        rarity: 'uncommon',
        isActive: true,
        createdBy: createdBy
      },
      {
        id: 'quiz_master_001',
        name: 'Quiz Master',
        description: 'Complete 10 quizzes with 90% accuracy',
        type: 'score',
        category: 'general',
        icon: 'quiz',
        points: 250,
        criteria: {
          type: 'score_average',
          threshold: 90
        },
        rarity: 'rare',
        isActive: true,
        createdBy: createdBy
      },
      {
        id: 'course_completer_001',
        name: 'Course Completer',
        description: 'Complete your first course',
        type: 'course_complete',
        category: 'general',
        icon: 'graduation',
        points: 50,
        criteria: {
          type: 'courses_completed',
          threshold: 1
        },
        rarity: 'common',
        isActive: true,
        createdBy: createdBy
      },
      {
        id: 'game_champion_001',
        name: 'Game Champion',
        description: 'Win 5 educational games',
        type: 'score',
        category: 'general',
        icon: 'trophy',
        points: 200,
        criteria: {
          type: 'score_average',
          threshold: 80
        },
        rarity: 'epic',
        isActive: true,
        createdBy: createdBy
      }
    ];

    console.log('🏆 Creating achievements...');
    const createdAchievements = await Achievement.insertMany(achievements);
    console.log(`✅ Created ${createdAchievements.length} achievements`);

    console.log('\n🎉 Comprehensive education data seeding completed!');
    console.log(`📚 Courses: ${createdCourses.length}`);
    console.log(`🎮 Games: ${createdGames.length}`);
    console.log(`🏛️ Tours: ${createdTours.length}`);
    console.log(`🏆 Achievements: ${createdAchievements.length}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding comprehensive education data:', error);
    process.exit(1);
  }
}

seedComprehensiveEducation();
