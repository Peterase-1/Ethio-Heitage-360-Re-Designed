require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const connectDB = require('../config/database');

const seedLearningData = async () => {
  try {
    await connectDB();

    // Clear existing learning data
    await Course.deleteMany({});
    await Lesson.deleteMany({});

    console.log('Cleared existing learning data');

    // Create sample courses
    const courses = [
      {
        title: "Introduction to Ethiopian History",
        description: "Discover the rich history of Ethiopia from ancient times to modern day. Learn about the Kingdom of Aksum, the Zagwe dynasty, and Ethiopia's unique position as an uncolonized African nation.",
        category: "history",
        difficulty: "beginner",
        estimatedDuration: 120, // 2 hours
        image: "https://picsum.photos/400/300?random=101",
        thumbnail: "https://picsum.photos/200/150?random=101",
        instructor: "Dr. Amare Tekle",
        tags: ["history", "aksum", "zagwe", "independence"],
        isActive: true
      },
      {
        title: "Ethiopian Cultural Traditions",
        description: "Explore the vibrant cultural traditions of Ethiopia including coffee ceremony, traditional music, dance, and festivals that have been passed down through generations.",
        category: "culture",
        difficulty: "beginner",
        estimatedDuration: 90,
        image: "https://picsum.photos/400/300?random=102",
        thumbnail: "https://picsum.photos/200/150?random=102",
        instructor: "Prof. Birtukan Mesfin",
        tags: ["culture", "coffee", "music", "festivals", "traditions"],
        isActive: true
      },
      {
        title: "Archaeological Wonders of Ethiopia",
        description: "Journey through Ethiopia's archaeological sites including the rock-hewn churches of Lalibela, the obelisks of Aksum, and the fossil discoveries in the Afar region.",
        category: "archaeology",
        difficulty: "intermediate",
        estimatedDuration: 150,
        image: "https://picsum.photos/400/300?random=103",
        thumbnail: "https://picsum.photos/200/150?random=103",
        instructor: "Dr. Zelalem Teshome",
        tags: ["archaeology", "lalibela", "aksum", "fossils", "lucy"],
        isActive: true
      },
      {
        title: "Ge'ez Language and Script",
        description: "Learn about Ethiopia's ancient Ge'ez language and script, still used in Ethiopian Orthodox liturgy and the basis for modern Ethiopian writing systems.",
        category: "language",
        difficulty: "advanced",
        estimatedDuration: 180,
        image: "https://picsum.photos/400/300?random=104",
        thumbnail: "https://picsum.photos/200/150?random=104",
        instructor: "Dr. Getatchew Haile",
        tags: ["language", "geez", "script", "orthodox", "liturgy"],
        isActive: true
      },
      {
        title: "Ethiopian Art and Manuscripts",
        description: "Discover the unique artistic traditions of Ethiopia including illuminated manuscripts, icon paintings, and contemporary art movements.",
        category: "art",
        difficulty: "intermediate",
        estimatedDuration: 100,
        image: "https://picsum.photos/400/300?random=105",
        thumbnail: "https://picsum.photos/200/150?random=105",
        instructor: "Artist Wosene Worke Kosrof",
        tags: ["art", "manuscripts", "icons", "contemporary", "painting"],
        isActive: true
      }
    ];

    const createdCourses = await Course.insertMany(courses);
    console.log(`Created ${createdCourses.length} courses`);

    // Create sample lessons for each course
    const lessons = [];

    // Lessons for Introduction to Ethiopian History
    const historyCourse = createdCourses.find(c => c.title === "Introduction to Ethiopian History");
    lessons.push(
      {
        title: "The Kingdom of Aksum",
        description: "Explore the ancient Kingdom of Aksum, one of the great civilizations of the ancient world, known for its monumental obelisks and trade networks.",
        courseId: historyCourse._id,
        order: 1,
        estimatedDuration: 30,
        content: [
          {
            type: "text",
            title: "Introduction to Aksum",
            content: "The Kingdom of Aksum was a major naval and trading power that ruled the region from approximately 100 to 960 AD. Located in what is now northern Ethiopia and Eritrea, Aksum was renowned for its monumental obelisks, sophisticated architecture, and extensive trade networks that connected Africa with the Mediterranean world and India.",
            duration: 10,
            order: 1
          },
          {
            type: "image",
            title: "Aksumite Obelisks",
            content: "https://picsum.photos/600/400?random=201",
            duration: 5,
            order: 2
          },
          {
            type: "text",
            title: "Trade and Commerce",
            content: "Aksum controlled important trade routes between the Roman Empire and Ancient India. The kingdom exported gold, ivory, and exotic animals, while importing silk, spices, and precious metals. This trade made Aksum incredibly wealthy and influential.",
            duration: 15,
            order: 3
          }
        ],
        objectives: [
          "Understand the historical significance of the Kingdom of Aksum",
          "Learn about Aksumite trade networks and their impact",
          "Identify the architectural achievements of Aksum"
        ],
        quiz: {
          questions: [
            {
              question: "During which period did the Kingdom of Aksum primarily flourish?",
              type: "multiple_choice",
              options: ["50-500 AD", "100-960 AD", "200-1200 AD", "500-1000 AD"],
              correctAnswer: "100-960 AD",
              explanation: "The Kingdom of Aksum was a major power from approximately 100 to 960 AD."
            },
            {
              question: "What were the main exports of the Aksumite kingdom?",
              type: "multiple_choice",
              options: ["Silk and spices", "Gold, ivory, and exotic animals", "Pottery and textiles", "Silver and copper"],
              correctAnswer: "Gold, ivory, and exotic animals",
              explanation: "Aksum was famous for exporting gold, ivory, and exotic animals to the Mediterranean and Indian Ocean trade networks."
            }
          ],
          passingScore: 70
        },
        isActive: true
      },
      {
        title: "The Zagwe Dynasty and Lalibela",
        description: "Learn about the Zagwe dynasty and the construction of the remarkable rock-hewn churches of Lalibela.",
        courseId: historyCourse._id,
        order: 2,
        estimatedDuration: 35,
        content: [
          {
            type: "text",
            title: "The Rise of the Zagwe Dynasty",
            content: "The Zagwe dynasty ruled Ethiopia from approximately 1137 to 1270 AD, following the decline of Aksum. The most famous ruler was King Lalibela, who commissioned the construction of eleven remarkable rock-hewn churches in the town that now bears his name.",
            duration: 15,
            order: 1
          },
          {
            type: "image",
            title: "Church of St. George, Lalibela",
            content: "https://picsum.photos/600/400?random=202",
            duration: 5,
            order: 2
          },
          {
            type: "text",
            title: "Architectural Marvel",
            content: "The churches of Lalibela were carved directly from solid volcanic rock in the 12th century. They represent a unique architectural achievement and are considered a 'New Jerusalem' by Ethiopian Orthodox Christians. The Church of St. George is the most famous, carved in a perfect cross shape.",
            duration: 15,
            order: 3
          }
        ],
        objectives: [
          "Learn about the Zagwe dynasty's historical importance",
          "Understand the significance of Lalibela's churches",
          "Appreciate the architectural innovations of the period"
        ],
        quiz: {
          questions: [
            {
              question: "Who was the most famous ruler of the Zagwe dynasty?",
              type: "multiple_choice",
              options: ["King Yekuno Amlak", "King Lalibela", "King Gebre Mesqel", "King Dawit"],
              correctAnswer: "King Lalibela",
              explanation: "King Lalibela is the most famous Zagwe ruler, known for commissioning the rock-hewn churches."
            }
          ],
          passingScore: 70
        },
        isActive: true
      }
    );

    // Lessons for Ethiopian Cultural Traditions
    const cultureCourse = createdCourses.find(c => c.title === "Ethiopian Cultural Traditions");
    lessons.push(
      {
        title: "The Ethiopian Coffee Ceremony",
        description: "Discover the sacred tradition of the Ethiopian coffee ceremony, a cornerstone of Ethiopian hospitality and social life.",
        courseId: cultureCourse._id,
        order: 1,
        estimatedDuration: 25,
        content: [
          {
            type: "text",
            title: "Origins of Coffee",
            content: "Ethiopia is considered the birthplace of coffee. Legend tells of a goat herder named Kaldi who discovered coffee when he noticed his goats becoming energetic after eating certain berries. The coffee ceremony has been central to Ethiopian culture for centuries.",
            duration: 10,
            order: 1
          },
          {
            type: "text",
            title: "The Three Rounds",
            content: "The traditional coffee ceremony involves three rounds: Abol (first round), Tona (second round), and Baraka (third round, meaning blessing). Each round has its own significance and the ceremony can take up to an hour, emphasizing the importance of taking time for community and conversation.",
            duration: 15,
            order: 2
          }
        ],
        objectives: [
          "Understand the cultural significance of coffee in Ethiopian society",
          "Learn the steps of the traditional coffee ceremony",
          "Appreciate the social aspects of the ceremony"
        ],
        quiz: {
          questions: [
            {
              question: "What are the three rounds of the Ethiopian coffee ceremony called?",
              type: "multiple_choice",
              options: ["Alpha, Beta, Gamma", "Abol, Tona, Baraka", "First, Second, Third", "Morning, Noon, Evening"],
              correctAnswer: "Abol, Tona, Baraka",
              explanation: "The three traditional rounds are called Abol, Tona, and Baraka, with Baraka meaning blessing."
            }
          ],
          passingScore: 70
        },
        isActive: true
      }
    );

    const createdLessons = await Lesson.insertMany(lessons);
    console.log(`Created ${createdLessons.length} lessons`);

    // Update courses with lesson references
    for (const course of createdCourses) {
      const courseLessons = createdLessons.filter(lesson => lesson.courseId.toString() === course._id.toString());
      course.lessons = courseLessons.map(lesson => lesson._id);
      await course.save();
    }

    console.log('Updated courses with lesson references');
    console.log('Learning data seeded successfully!');

    // Print summary
    console.log('\n=== SEEDED DATA SUMMARY ===');
    console.log(`Courses: ${createdCourses.length}`);
    console.log(`Lessons: ${createdLessons.length}`);
    
    createdCourses.forEach(course => {
      const lessonCount = createdLessons.filter(l => l.courseId.toString() === course._id.toString()).length;
      console.log(`- ${course.title}: ${lessonCount} lessons`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding learning data:', error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  seedLearningData();
}

module.exports = seedLearningData;
