const mongoose = require('mongoose');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
require('dotenv').config();

const sampleCourses = [
  {
    title: "Kingdom of Aksum: Ancient Ethiopian Empire",
    description: "Discover the ancient Aksumite Empire, its trade networks, monumental obelisks, and lasting influence on Ethiopian culture. Learn about this powerful civilization that dominated trade routes between the Roman Empire and Ancient India.",
    category: "history",
    difficulty: "beginner",
    estimatedDuration: 360, // 6 hours
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=150&fit=crop",
    instructor: "Dr. Alemseged Beldados",
    tags: ["aksum", "ancient history", "trade routes", "obelisks", "civilization"],
    isActive: true
  },
  {
    title: "Rock-Hewn Churches of Lalibela",
    description: "Explore the architectural marvels of Lalibela and other rock-hewn churches throughout Ethiopia. Understand their construction techniques, spiritual significance, and role in Ethiopian Orthodox Christianity.",
    category: "archaeology",
    difficulty: "intermediate", 
    estimatedDuration: 480, // 8 hours
    image: "https://images.unsplash.com/photo-1566492031773-4f4e44671d66?w=400&h=300&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1566492031773-4f4e44671d66?w=200&h=150&fit=crop",
    instructor: "Prof. Tekle Hagos",
    tags: ["lalibela", "architecture", "christianity", "rock churches", "unesco"],
    isActive: true
  },
  {
    title: "Ethiopian Cultural Traditions and Festivals",
    description: "Learn about Ethiopian festivals, ceremonies, traditional crafts, music, and dance that define the country's cultural identity. Discover the rich diversity of Ethiopian ethnic groups and their unique traditions.",
    category: "culture",
    difficulty: "beginner",
    estimatedDuration: 240, // 4 hours
    image: "https://images.unsplash.com/photo-1578761499019-d7c2fcb82c6e?w=400&h=300&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1578761499019-d7c2fcb82c6e?w=200&h=150&fit=crop",
    instructor: "Dr. Muluneh Bekele",
    tags: ["culture", "festivals", "traditions", "music", "dance", "crafts"],
    isActive: true
  },
  {
    title: "Ancient Ge'ez Script and Language",
    description: "Study the ancient Ge'ez script, one of the world's oldest writing systems still in use. Learn about its historical development, religious significance, and influence on modern Ethiopian languages.",
    category: "language",
    difficulty: "intermediate",
    estimatedDuration: 300, // 5 hours
    image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=200&h=150&fit=crop",
    instructor: "Dr. Girma Demeke",
    tags: ["geez", "language", "script", "manuscripts", "ancient writing"],
    isActive: true
  },
  {
    title: "Ethiopian Orthodox Art and Iconography",
    description: "Explore the rich artistic traditions of the Ethiopian Orthodox Church, including manuscript illumination, church paintings, and traditional iconography that has flourished for over 1,500 years.",
    category: "art",
    difficulty: "intermediate",
    estimatedDuration: 420, // 7 hours
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=200&h=150&fit=crop",
    instructor: "Sister Almaz Teshome",
    tags: ["art", "orthodox", "iconography", "manuscripts", "religious art"],
    isActive: true
  },
  {
    title: "Traditional Ethiopian Architecture",
    description: "Study the diverse architectural styles across Ethiopia, from traditional round houses to palace architecture, and learn about the materials, techniques, and cultural significance of Ethiopian building traditions.",
    category: "archaeology",
    difficulty: "beginner",
    estimatedDuration: 270, // 4.5 hours
    image: "https://images.unsplash.com/photo-1571771019784-7c4f2b0b4ea4?w=400&h=300&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1571771019784-7c4f2b0b4ea4?w=200&h=150&fit=crop",
    instructor: "Arch. Dawit Worku",
    tags: ["architecture", "traditional building", "materials", "cultural heritage"],
    isActive: true
  }
];

const sampleLessons = [
  // Lessons for Kingdom of Aksum course
  {
    courseTitle: "Kingdom of Aksum: Ancient Ethiopian Empire",
    lessons: [
      {
        title: "Introduction to the Aksumite Empire",
        description: "Overview of the Kingdom of Aksum and its historical significance",
        order: 1,
        estimatedDuration: 60,
        content: [
          {
            type: "text",
            title: "The Rise of Aksum",
            content: "The Kingdom of Aksum emerged in the first century CE in what is now northern Ethiopia and Eritrea. It became one of the great civilizations of the ancient world, controlling important trade routes between the Roman Empire and Ancient India.",
            duration: 15,
            order: 1
          },
          {
            type: "video",
            title: "Aksum: Trading Empire of Africa",
            content: "https://example.com/aksum-video",
            duration: 30,
            order: 2
          },
          {
            type: "interactive",
            title: "Aksum Trade Routes Map",
            content: '{"type": "map", "routes": ["Red Sea", "Arabian Peninsula", "Mediterranean"]}',
            duration: 15,
            order: 3
          }
        ],
        objectives: [
          "Understand the geographical location of the Kingdom of Aksum",
          "Identify the key factors that led to Aksum's rise as a trading power",
          "Recognize the international connections of ancient Aksum"
        ],
        isActive: true
      },
      {
        title: "The Obelisks of Aksum",
        description: "Explore the magnificent stone obelisks and their significance",
        order: 2,
        estimatedDuration: 45,
        content: [
          {
            type: "text",
            title: "Monumental Architecture",
            content: "The obelisks of Aksum are among Africa's greatest archaeological treasures. These massive granite monuments, some reaching over 33 meters in height, were erected between the 3rd and 4th centuries CE.",
            duration: 20,
            order: 1
          },
          {
            type: "image",
            title: "The Great Obelisk",
            content: "https://example.com/great-obelisk.jpg",
            duration: 10,
            order: 2
          },
          {
            type: "quiz",
            title: "Obelisk Knowledge Check",
            content: '{"questions": [{"question": "How tall is the tallest standing obelisk in Aksum?", "options": ["23 meters", "33 meters", "43 meters"], "correct": 0}]}',
            duration: 15,
            order: 3
          }
        ],
        objectives: [
          "Describe the construction techniques used for Aksumite obelisks",
          "Explain the religious and political significance of the monuments",
          "Identify different types of obelisks found in Aksum"
        ],
        isActive: true
      }
    ]
  },
  // Lessons for Rock-Hewn Churches course
  {
    courseTitle: "Rock-Hewn Churches of Lalibela",
    lessons: [
      {
        title: "King Lalibela and the New Jerusalem",
        description: "The history behind Lalibela's rock-hewn churches",
        order: 1,
        estimatedDuration: 75,
        content: [
          {
            type: "text",
            title: "The Vision of King Lalibela",
            content: "In the 12th century, King Lalibela of the Zagwe dynasty undertook an ambitious project to create a 'New Jerusalem' in the Ethiopian highlands. This would become one of the world's most remarkable architectural achievements.",
            duration: 25,
            order: 1
          },
          {
            type: "video",
            title: "Building the Rock Churches",
            content: "https://example.com/lalibela-construction",
            duration: 35,
            order: 2
          },
          {
            type: "interactive",
            title: "Virtual Church Tour",
            content: '{"type": "3d_tour", "church": "St. George", "features": ["cross_shape", "windows", "interior"]}',
            duration: 15,
            order: 3
          }
        ],
        objectives: [
          "Explain the historical context of Lalibela's church construction",
          "Understand the religious motivations behind the project",
          "Identify the unique architectural features of rock-hewn churches"
        ],
        isActive: true
      }
    ]
  }
];

async function seedCourses() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing courses and lessons
    await Course.deleteMany({});
    await Lesson.deleteMany({});
    console.log('Cleared existing courses and lessons');

    // Insert courses
    console.log('Inserting courses...');
    const insertedCourses = await Course.insertMany(sampleCourses);
    console.log(`✅ Inserted ${insertedCourses.length} courses`);

    // Insert lessons and link them to courses
    console.log('Inserting lessons...');
    let totalLessons = 0;
    
    for (const lessonGroup of sampleLessons) {
      const course = insertedCourses.find(c => c.title === lessonGroup.courseTitle);
      if (course) {
        const lessonsWithCourseId = lessonGroup.lessons.map(lesson => ({
          ...lesson,
          courseId: course._id
        }));
        
        const insertedLessons = await Lesson.insertMany(lessonsWithCourseId);
        
        // Update course with lesson references
        await Course.findByIdAndUpdate(course._id, {
          $push: { lessons: { $each: insertedLessons.map(l => l._id) } }
        });
        
        totalLessons += insertedLessons.length;
        console.log(`  ✅ Added ${insertedLessons.length} lessons to "${course.title}"`);
      }
    }
    
    console.log(`✅ Inserted ${totalLessons} lessons total`);

    // Create a few more basic courses without detailed lessons
    const additionalCourses = [
      {
        title: "Queen of Sheba: Legend and History",
        description: "Explore the legendary Queen of Sheba and her connection to Ethiopian history and culture.",
        category: "history",
        difficulty: "beginner",
        estimatedDuration: 180,
        instructor: "Dr. Bethlehem Gebreyesus",
        tags: ["queen of sheba", "legend", "ancient history", "biblical history"],
        isActive: true
      },
      {
        title: "Ethiopian Cuisine and Food Culture", 
        description: "Discover the rich culinary traditions of Ethiopia, from injera bread to traditional cooking methods.",
        category: "culture",
        difficulty: "beginner", 
        estimatedDuration: 150,
        instructor: "Chef Rahel Getachew",
        tags: ["cuisine", "food culture", "cooking", "traditions"],
        isActive: true
      },
      {
        title: "Coffee: Ethiopia's Gift to the World",
        description: "Learn about Ethiopia's role as the birthplace of coffee and its cultural significance.",
        category: "culture",
        difficulty: "beginner",
        estimatedDuration: 120,
        instructor: "Dr. Mesfin Benti",
        tags: ["coffee", "agriculture", "cultural heritage", "trade"],
        isActive: true
      }
    ];

    const moreInsertedCourses = await Course.insertMany(additionalCourses);
    console.log(`✅ Inserted ${moreInsertedCourses.length} additional courses`);

    console.log('\n🎉 Course seeding completed successfully!');
    console.log(`📚 Total courses: ${insertedCourses.length + moreInsertedCourses.length}`);
    console.log(`📝 Total lessons: ${totalLessons}`);
    
  } catch (error) {
    console.error('Error seeding courses:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seeding function
if (require.main === module) {
  seedCourses();
}

module.exports = seedCourses;
