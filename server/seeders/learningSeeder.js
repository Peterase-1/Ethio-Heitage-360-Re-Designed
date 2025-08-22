const mongoose = require('mongoose');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const config = require('../config/env');

const connectDB = async () => {
  try {
    await mongoose.connect(config.MONGODB_URI);
    console.log('MongoDB connected for seeding');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const sampleCourses = [
  {
    title: 'Ethiopian History Fundamentals',
    description: 'Explore the rich and diverse history of Ethiopia from ancient civilizations to modern times.',
    category: 'history',
    difficulty: 'beginner',
    estimatedDuration: 120,
    image: 'https://picsum.photos/400/300?random=1',
    thumbnail: 'https://picsum.photos/200/150?random=1',
    instructor: 'Dr. Alemayehu Tadesse',
    tags: ['Ancient History', 'Ethiopian Kingdoms', 'Aksum', 'Zagwe Dynasty'],
    isActive: true
  },
  {
    title: 'Ethiopian Coffee Culture & Ceremony',
    description: 'Discover the birthplace of coffee and learn about the traditional Ethiopian coffee ceremony.',
    category: 'culture',
    difficulty: 'beginner',
    estimatedDuration: 90,
    image: 'https://picsum.photos/400/300?random=2',
    thumbnail: 'https://picsum.photos/200/150?random=2',
    instructor: 'Marta Bekele',
    tags: ['Coffee', 'Cultural Traditions', 'Ceremony', 'Social Customs'],
    isActive: true
  },
  {
    title: 'Ethiopian Orthodox Christianity',
    description: 'Learn about the ancient Christian traditions and architectural wonders of Ethiopian Orthodoxy.',
    category: 'history',
    difficulty: 'intermediate',
    estimatedDuration: 150,
    image: 'https://picsum.photos/400/300?random=3',
    thumbnail: 'https://picsum.photos/200/150?random=3',
    instructor: 'Father Tekle Haymanot',
    tags: ['Religion', 'Architecture', 'Lalibela', 'Ancient Churches'],
    isActive: true
  },
  {
    title: 'Traditional Ethiopian Music & Dance',
    description: 'Experience the vibrant musical traditions and diverse dance forms across Ethiopian regions.',
    category: 'culture',
    difficulty: 'beginner',
    estimatedDuration: 100,
    image: 'https://picsum.photos/400/300?random=4',
    thumbnail: 'https://picsum.photos/200/150?random=4',
    instructor: 'Aster Aweke',
    tags: ['Music', 'Dance', 'Traditional Arts', 'Cultural Expression'],
    isActive: true
  },
  {
    title: 'Ancient Ethiopian Scripts & Languages',
    description: 'Decode the mysteries of Geez script and explore Ethiopia\'s linguistic heritage.',
    category: 'language',
    difficulty: 'advanced',
    estimatedDuration: 180,
    image: 'https://picsum.photos/400/300?random=5',
    thumbnail: 'https://picsum.photos/200/150?random=5',
    instructor: 'Dr. Girma Demeke',
    tags: ['Geez', 'Ancient Scripts', 'Linguistics', 'Literature'],
    isActive: true
  },
  {
    title: 'Ethiopian Cuisine & Culinary Traditions',
    description: 'Learn about traditional Ethiopian dishes, spices, and culinary customs.',
    category: 'culture',
    difficulty: 'beginner',
    estimatedDuration: 80,
    image: 'https://picsum.photos/400/300?random=6',
    thumbnail: 'https://picsum.photos/200/150?random=6',
    instructor: 'Chef Yohannes Gebreselassie',
    tags: ['Cuisine', 'Cooking', 'Spices', 'Traditional Food'],
    isActive: true
  }
];

const createLessonsForCourse = (courseId, courseTitle, category) => {
  const lessonsMap = {
    'Ethiopian History Fundamentals': [
      {
        title: 'The Kingdom of Aksum',
        description: 'Discover the ancient trading empire of Aksum and its influence on Ethiopian history.',
        order: 1,
        estimatedDuration: 30,
        content: [
          {
            type: 'text',
            title: 'Introduction to Aksum',
            content: 'The Kingdom of Aksum was a trading nation in northern Ethiopia and Eritrea that existed from approximately 100 to 960 CE. It was one of the four great powers of its time, alongside Persia, Rome, and China.',
            duration: 10,
            order: 1
          },
          {
            type: 'video',
            title: 'Aksum Archaeological Sites',
            content: 'https://www.youtube.com/watch?v=sample-aksum-video',
            duration: 15,
            order: 2
          },
          {
            type: 'quiz',
            title: 'Test Your Knowledge',
            content: 'Quiz about Aksum Kingdom',
            duration: 5,
            order: 3
          }
        ],
        objectives: [
          'Understand the historical significance of the Aksum Kingdom',
          'Learn about Aksumite trade networks',
          'Explore archaeological evidence of Aksumite civilization'
        ],
        quiz: {
          questions: [
            {
              question: 'When did the Kingdom of Aksum approximately exist?',
              type: 'multiple_choice',
              options: ['50-500 CE', '100-960 CE', '200-1200 CE', '300-800 CE'],
              correctAnswer: '100-960 CE',
              explanation: 'The Kingdom of Aksum existed from approximately 100 to 960 CE, making it one of the longest-lasting ancient African kingdoms.'
            },
            {
              question: 'Aksum was one of the four great powers alongside Persia, Rome, and China.',
              type: 'true_false',
              options: ['True', 'False'],
              correctAnswer: 'True',
              explanation: 'Historical records indicate that Aksum was recognized as one of the four great powers of its time.'
            }
          ],
          passingScore: 70
        },
        isActive: true
      },
      {
        title: 'The Zagwe Dynasty and Lalibela',
        description: 'Explore the medieval Zagwe dynasty and the rock-hewn churches of Lalibela.',
        order: 2,
        estimatedDuration: 35,
        content: [
          {
            type: 'text',
            title: 'The Zagwe Period',
            content: 'The Zagwe dynasty ruled Ethiopia from approximately 900 to 1270 CE, following the decline of the Aksumite Kingdom.',
            duration: 10,
            order: 1
          },
          {
            type: 'image',
            title: 'Rock-Hewn Churches',
            content: 'https://picsum.photos/600/400?random=lalibela',
            duration: 10,
            order: 2
          },
          {
            type: 'interactive',
            title: 'Virtual Church Tour',
            content: 'Interactive 3D tour of Lalibela churches',
            duration: 15,
            order: 3
          }
        ],
        objectives: [
          'Learn about the Zagwe dynasty',
          'Understand the significance of Lalibela churches',
          'Explore medieval Ethiopian architecture'
        ],
        isActive: true
      }
    ],
    'Ethiopian Coffee Culture & Ceremony': [
      {
        title: 'Origins of Coffee',
        description: 'Learn about the legendary discovery of coffee in Ethiopia.',
        order: 1,
        estimatedDuration: 25,
        content: [
          {
            type: 'text',
            title: 'The Legend of Kaldi',
            content: 'According to Ethiopian legend, coffee was discovered by a goat herder named Kaldi who noticed his goats becoming energetic after eating certain berries.',
            duration: 10,
            order: 1
          },
          {
            type: 'audio',
            title: 'Traditional Coffee Songs',
            content: 'https://example.com/coffee-songs.mp3',
            duration: 15,
            order: 2
          }
        ],
        objectives: [
          'Understand the origin story of coffee',
          'Learn about Ethiopian coffee varieties',
          'Explore the cultural significance of coffee'
        ],
        isActive: true
      },
      {
        title: 'The Coffee Ceremony',
        description: 'Experience the traditional Ethiopian coffee ceremony step by step.',
        order: 2,
        estimatedDuration: 40,
        content: [
          {
            type: 'video',
            title: 'Coffee Ceremony Demonstration',
            content: 'https://www.youtube.com/watch?v=sample-ceremony-video',
            duration: 20,
            order: 1
          },
          {
            type: 'interactive',
            title: 'Virtual Coffee Ceremony',
            content: 'Interactive coffee ceremony simulation',
            duration: 20,
            order: 2
          }
        ],
        objectives: [
          'Learn the steps of the coffee ceremony',
          'Understand its social and cultural importance',
          'Practice virtual coffee preparation'
        ],
        isActive: true
      }
    ]
  };

  return lessonsMap[courseTitle] || [
    {
      title: `Introduction to ${courseTitle}`,
      description: `Learn the basics of ${courseTitle.toLowerCase()}.`,
      order: 1,
      estimatedDuration: 30,
      content: [
        {
          type: 'text',
          title: 'Course Overview',
          content: `Welcome to ${courseTitle}. This course will provide you with comprehensive knowledge about ${category}.`,
          duration: 15,
          order: 1
        },
        {
          type: 'quiz',
          title: 'Knowledge Check',
          content: 'Quick quiz to test understanding',
          duration: 15,
          order: 2
        }
      ],
      objectives: [
        `Understand the basics of ${category}`,
        'Learn key concepts and terminology',
        'Prepare for advanced topics'
      ],
      quiz: {
        questions: [
          {
            question: `What is the main focus of this ${courseTitle} course?`,
            type: 'multiple_choice',
            options: ['History', 'Culture', 'Language', 'All of the above'],
            correctAnswer: 'All of the above',
            explanation: 'This course covers multiple aspects of Ethiopian heritage.'
          }
        ],
        passingScore: 70
      },
      isActive: true
    }
  ];
};

const seedLearningData = async () => {
  try {
    console.log('Starting to seed learning data...');
    
    // Clear existing data
    await Course.deleteMany({});
    await Lesson.deleteMany({});
    console.log('Cleared existing courses and lessons');

    // Create courses
    const createdCourses = [];
    for (const courseData of sampleCourses) {
      const course = new Course(courseData);
      await course.save();
      createdCourses.push(course);
      console.log(`Created course: ${course.title}`);
    }

    // Create lessons for each course
    for (const course of createdCourses) {
      const lessonsData = createLessonsForCourse(course._id, course.title, course.category);
      const lessons = [];
      
      for (const lessonData of lessonsData) {
        const lesson = new Lesson({
          ...lessonData,
          courseId: course._id
        });
        await lesson.save();
        lessons.push(lesson);
        console.log(`Created lesson: ${lesson.title} for course: ${course.title}`);
      }

      // Update course with lesson references
      course.lessons = lessons.map(lesson => lesson._id);
      await course.save();
    }

    console.log('Successfully seeded learning data!');
    console.log(`Created ${createdCourses.length} courses with their lessons`);
  } catch (error) {
    console.error('Error seeding learning data:', error);
  }
};

const main = async () => {
  await connectDB();
  await seedLearningData();
  await mongoose.connection.close();
  console.log('Database connection closed');
};

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { seedLearningData };
