const mongoose = require('mongoose');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const Achievement = require('../models/Achievement');
require('dotenv').config();

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ethio-heritage', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected for seeding');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

// Sample achievements data
const achievements = [
  {
    id: 'first_lesson_complete',
    name: 'First Steps',
    description: 'Completed your first learning lesson',
    type: 'first_lesson',
    icon: 'star',
    color: '#FFD700',
    criteria: { type: 'lessons_completed', threshold: 1 },
    points: 10,
    rarity: 'common'
  },
  {
    id: 'history_explorer',
    name: 'History Explorer',
    description: 'Completed 5 history lessons',
    type: 'category_master',
    category: 'history',
    icon: 'book-open',
    color: '#8B4513',
    criteria: { type: 'category_lessons', threshold: 5, category: 'history' },
    points: 50,
    rarity: 'uncommon'
  },
  {
    id: 'culture_ambassador',
    name: 'Cultural Ambassador',
    description: 'Completed 3 cultural courses',
    type: 'course_complete',
    category: 'culture',
    icon: 'globe',
    color: '#4169E1',
    criteria: { type: 'courses_completed', threshold: 3 },
    points: 100,
    rarity: 'rare'
  },
  {
    id: 'week_streak',
    name: 'Dedicated Learner',
    description: 'Maintained a 7-day learning streak',
    type: 'streak',
    icon: 'calendar',
    color: '#FF6347',
    criteria: { type: 'streak_days', threshold: 7 },
    points: 75,
    rarity: 'uncommon'
  },
  {
    id: 'perfect_score',
    name: 'Perfect Scholar',
    description: 'Achieved 100% on a quiz',
    type: 'perfect_score',
    icon: 'award',
    color: '#FF1493',
    criteria: { type: 'score_average', threshold: 100 },
    points: 150,
    rarity: 'epic'
  },
  {
    id: 'speed_learner',
    name: 'Speed Learner',
    description: 'Completed 10 lessons in one day',
    type: 'speed_learner',
    icon: 'zap',
    color: '#32CD32',
    criteria: { type: 'lessons_completed', threshold: 10 },
    points: 200,
    rarity: 'epic'
  },
  {
    id: 'heritage_master',
    name: 'Heritage Master',
    description: 'Completed all available courses',
    type: 'scholar',
    icon: 'crown',
    color: '#9400D3',
    criteria: { type: 'courses_completed', threshold: 15 },
    points: 500,
    rarity: 'legendary'
  }
];

// Comprehensive Ethiopian heritage courses
const courses = [
  {
    title: "Ancient Axum: Cradle of Ethiopian Civilization",
    description: "Explore the magnificent Kingdom of Axum, one of the great civilizations of the ancient world. Learn about its towering obelisks, powerful queens and kings, and its role in early Christianity and trade.",
    category: "history",
    difficulty: "intermediate",
    estimatedDuration: 240,
    image: "/assets/ancient-axum.jpg",
    instructor: "Dr. Alemayehu Teshome",
    tags: ["axum", "ancient-history", "obelisks", "christianity", "archaeology"],
    prerequisites: []
  },
  {
    title: "Queen of Sheba: Legend and Historical Reality",
    description: "Uncover the fascinating story of the legendary Queen of Sheba (Queen Makeda) and her connections to Ethiopian history, Biblical traditions, and cultural identity.",
    category: "history",
    difficulty: "beginner",
    estimatedDuration: 180,
    image: "/assets/queen-of-sheba.jpg",
    instructor: "Prof. Rahel Mehari",
    tags: ["queen-sheba", "makeda", "legends", "solomon", "ancient-rulers"],
    prerequisites: []
  },
  {
    title: "Ethiopian Orthodox Christianity: Faith and Tradition",
    description: "Delve into the rich spiritual heritage of Ethiopian Orthodox Christianity, its unique practices, ancient manuscripts, and architectural marvels like Lalibela.",
    category: "culture",
    difficulty: "intermediate",
    estimatedDuration: 300,
    image: "/assets/orthodox-christianity.jpg",
    instructor: "Abuna Paulos Tesfaye",
    tags: ["orthodox", "christianity", "lalibela", "manuscripts", "religious-art"],
    prerequisites: []
  },
  {
    title: "The Art of Ethiopian Coffee Culture",
    description: "Discover Ethiopia's role as the birthplace of coffee and explore the rich ceremonial traditions, cultivation methods, and cultural significance of coffee in Ethiopian society.",
    category: "culture",
    difficulty: "beginner",
    estimatedDuration: 120,
    image: "/assets/coffee-ceremony.jpg",
    instructor: "Ato Kebede Worku",
    tags: ["coffee", "ceremony", "culture", "traditions", "agriculture"],
    prerequisites: []
  },
  {
    title: "Ancient Ge'ez Script and Manuscripts",
    description: "Learn about the ancient Ge'ez script, one of the world's oldest writing systems, and explore Ethiopia's rich manuscript tradition including the famous Book of Henoch.",
    category: "language",
    difficulty: "advanced",
    estimatedDuration: 360,
    image: "/assets/geez-manuscripts.jpg",
    instructor: "Dr. Getatchew Haile",
    tags: ["geez", "manuscripts", "writing-systems", "ancient-languages", "literature"],
    prerequisites: []
  },
  {
    title: "Traditional Ethiopian Music and Dance",
    description: "Experience the diverse musical and dance traditions of Ethiopia's many ethnic groups, from the shoulder-shaking Eskista to the haunting melodies of traditional instruments.",
    category: "art",
    difficulty: "beginner",
    estimatedDuration: 200,
    image: "/assets/traditional-music.jpg",
    instructor: "Emebet Mulugeta Seyoum",
    tags: ["music", "dance", "eskista", "traditional-instruments", "cultural-expression"],
    prerequisites: []
  },
  {
    title: "Ethiopian Architecture: From Axumite to Modern",
    description: "Journey through Ethiopian architectural evolution, from ancient Axumite stelae to the rock-hewn churches of Lalibela and modern Addis Ababa developments.",
    category: "archaeology",
    difficulty: "intermediate",
    estimatedDuration: 280,
    image: "/assets/ethiopian-architecture.jpg",
    instructor: "Arch. Fasil Giorghis",
    tags: ["architecture", "lalibela", "axum", "rock-churches", "construction-techniques"],
    prerequisites: []
  },
  {
    title: "The Cuisine of Ethiopia: History and Culture on a Plate",
    description: "Explore Ethiopian culinary traditions, from injera and berbere to the cultural significance of communal eating and fasting traditions.",
    category: "culture",
    difficulty: "beginner",
    estimatedDuration: 150,
    image: "/assets/ethiopian-cuisine.jpg",
    instructor: "Chef Samrawit Fikre",
    tags: ["cuisine", "injera", "spices", "food-culture", "cooking-techniques"],
    prerequisites: []
  },
  {
    title: "Harar: The Fourth Holy City of Islam",
    description: "Discover the walled city of Harar, its 99 mosques, unique Islamic architecture, and its significance in Islamic scholarship and Sufi traditions.",
    category: "culture",
    difficulty: "intermediate",
    estimatedDuration: 220,
    image: "/assets/harar-city.jpg",
    instructor: "Sheikh Ahmed Negash",
    tags: ["harar", "islam", "mosques", "architecture", "sufi-traditions"],
    prerequisites: []
  },
  {
    title: "Ethiopian Textile Arts and Traditional Clothing",
    description: "Learn about the beautiful traditions of Ethiopian weaving, the significance of traditional clothing like the habesha kemis, and regional variations in textile arts.",
    category: "art",
    difficulty: "beginner",
    estimatedDuration: 180,
    image: "/assets/traditional-textiles.jpg",
    instructor: "W/ro Tiruwork Bekele",
    tags: ["textiles", "weaving", "traditional-clothing", "habesha-kemis", "craftsmanship"],
    prerequisites: []
  }
];

// Sample lessons for the first course (Ancient Axum)
const axumLessons = [
  {
    title: "Introduction to the Axumite Kingdom",
    description: "Overview of the Axumite Kingdom, its geographical location, and historical significance in ancient world trade.",
    order: 1,
    estimatedDuration: 30,
    content: [
      {
        type: "text",
        title: "The Rise of Axum",
        content: "The Kingdom of Axum emerged around the 1st century CE in what is now northern Ethiopia and Eritrea. It became one of the four great powers of the ancient world, alongside Rome, Persia, and China.",
        order: 1,
        duration: 5
      },
      {
        type: "image",
        title: "Map of Ancient Axum",
        content: "/assets/axum-map.jpg",
        order: 2,
        duration: 3
      },
      {
        type: "video",
        title: "Archaeological Evidence",
        content: "https://example.com/axum-archaeology.mp4",
        order: 3,
        duration: 15
      }
    ],
    objectives: [
      "Understand the geographical extent of the Axumite Kingdom",
      "Identify key factors that led to Axum's rise to power",
      "Recognize Axum's place in ancient world history"
    ],
    resources: [
      {
        title: "UNESCO World Heritage: Axum",
        url: "https://whc.unesco.org/en/list/15/",
        type: "website"
      }
    ],
    quiz: {
      questions: [
        {
          question: "In which century did the Kingdom of Axum emerge?",
          type: "multiple_choice",
          options: ["1st century BCE", "1st century CE", "3rd century CE", "5th century CE"],
          correctAnswer: "1st century CE",
          explanation: "The Kingdom of Axum emerged around the 1st century CE, becoming a major trading power."
        },
        {
          question: "Axum was considered one of the four great powers of the ancient world.",
          type: "true_false",
          options: ["True", "False"],
          correctAnswer: "True",
          explanation: "Yes, Axum was recognized alongside Rome, Persia, and China as one of the four great powers."
        }
      ],
      passingScore: 70
    }
  },
  {
    title: "The Obelisks of Axum: Monuments to Power",
    description: "Explore the magnificent stelae (obelisks) of Axum, their construction techniques, and symbolic significance.",
    order: 2,
    estimatedDuration: 40,
    content: [
      {
        type: "text",
        title: "The Great Stelae",
        content: "The stelae of Axum are among the tallest single pieces of stone ever erected by humans. These granite monuments served as markers for underground burial chambers of Axumite royalty.",
        order: 1,
        duration: 8
      },
      {
        type: "interactive",
        title: "Virtual Obelisk Tour",
        content: JSON.stringify({
          type: "360_tour",
          url: "/virtual-tours/axum-obelisks",
          hotspots: ["Great Stele", "King Ezana's Stele", "Obelisk of Axum"]
        }),
        order: 2,
        duration: 20
      }
    ],
    objectives: [
      "Identify different types of Axumite stelae",
      "Understand the construction techniques used",
      "Recognize the religious and political significance of the monuments"
    ],
    quiz: {
      questions: [
        {
          question: "What material were the Axumite stelae primarily made from?",
          type: "multiple_choice",
          options: ["Marble", "Granite", "Limestone", "Sandstone"],
          correctAnswer: "Granite",
          explanation: "The Axumite stelae were carved from single pieces of granite, showcasing advanced stone-working techniques."
        }
      ],
      passingScore: 70
    }
  },
  {
    title: "King Ezana and the Conversion to Christianity",
    description: "Learn about King Ezana's reign and his historic conversion of the Axumite Kingdom to Christianity.",
    order: 3,
    estimatedDuration: 35,
    content: [
      {
        type: "text",
        title: "The Reign of King Ezana",
        content: "King Ezana ruled Axum during the 4th century CE and is remembered for making Axum one of the first nations to officially adopt Christianity as the state religion.",
        order: 1,
        duration: 10
      },
      {
        type: "audio",
        title: "The Ezana Stone Inscription",
        content: "/audio/ezana-inscription.mp3",
        order: 2,
        duration: 12
      }
    ],
    objectives: [
      "Understand King Ezana's role in Ethiopian history",
      "Learn about the conversion to Christianity",
      "Analyze the Ezana Stone inscriptions"
    ],
    quiz: {
      questions: [
        {
          question: "In which century did King Ezana rule Axum?",
          type: "multiple_choice",
          options: ["3rd century CE", "4th century CE", "5th century CE", "6th century CE"],
          correctAnswer: "4th century CE",
          explanation: "King Ezana ruled during the 4th century CE and converted the kingdom to Christianity."
        }
      ],
      passingScore: 70
    }
  }
];

// Function to seed all data
const seedEducationalData = async () => {
  try {
    console.log('🌱 Starting educational data seeding...');
    
    // Clear existing data
    await Course.deleteMany({});
    await Lesson.deleteMany({});
    await Achievement.deleteMany({});
    
    console.log('🗑️  Cleared existing data');
    
    // Seed achievements
    const createdAchievements = await Achievement.insertMany(achievements);
    console.log(`✅ Created ${createdAchievements.length} achievements`);
    
    // Seed courses
    const createdCourses = await Course.insertMany(courses);
    console.log(`✅ Created ${createdCourses.length} courses`);
    
    // Seed lessons for the first course (Ancient Axum)
    const axumCourse = createdCourses[0];
    const lessonsWithCourseId = axumLessons.map(lesson => ({
      ...lesson,
      courseId: axumCourse._id
    }));
    
    const createdLessons = await Lesson.insertMany(lessonsWithCourseId);
    console.log(`✅ Created ${createdLessons.length} lessons for Ancient Axum course`);
    
    // Update course with lesson references
    await Course.findByIdAndUpdate(axumCourse._id, {
      $set: { lessons: createdLessons.map(lesson => lesson._id) }
    });
    
    console.log('🎉 Educational data seeding completed successfully!');
    console.log(`
    Summary:
    - ${createdAchievements.length} achievements
    - ${createdCourses.length} courses  
    - ${createdLessons.length} lessons
    `);
    
  } catch (error) {
    console.error('❌ Error seeding educational data:', error);
    throw error;
  }
};

// Run if called directly
if (require.main === module) {
  connectDB().then(() => {
    seedEducationalData()
      .then(() => {
        console.log('✨ Seeding completed');
        process.exit(0);
      })
      .catch((error) => {
        console.error('💥 Seeding failed:', error);
        process.exit(1);
      });
  });
}

module.exports = { seedEducationalData };
