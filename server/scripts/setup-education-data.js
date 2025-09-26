const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import models
const User = require('../models/User');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const Assignment = require('../models/Assignment');
const Discussion = require('../models/Discussion');
const LearningProgress = require('../models/LearningProgress');
const Feedback = require('../models/Feedback');

// Database connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ethioheritage360');
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ Database connection error:', error);
    process.exit(1);
  }
};

// Sample data
const sampleUsers = [
  {
    firstName: 'Dr. Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@heritage.edu',
    password: 'instructor123',
    role: 'organizer',
    phone: '+251911123456',
    isVerified: true,
    interests: ['Ancient History', 'Archaeology', 'Education'],
    bio: 'Ethiopian History Expert and Educational Content Creator'
  },
  {
    firstName: 'Prof. Michael',
    lastName: 'Chen',
    email: 'michael.chen@heritage.edu',
    password: 'instructor123',
    role: 'organizer',
    phone: '+251911234567',
    isVerified: true,
    interests: ['Art & Culture', 'Traditional Crafts', 'Education'],
    bio: 'Cultural Arts Specialist and Course Designer'
  },
  {
    firstName: 'Alice',
    lastName: 'Wonder',
    email: 'alice.wonder@student.edu',
    password: 'student123',
    role: 'user',
    phone: '+251911345678',
    isVerified: true,
    interests: ['Ancient History', 'Religious Heritage'],
    bio: 'History student passionate about Ethiopian heritage'
  },
  {
    firstName: 'Bob',
    lastName: 'Smith',
    email: 'bob.smith@student.edu',
    password: 'student123',
    role: 'user',
    phone: '+251911456789',
    isVerified: true,
    interests: ['Art & Culture', 'Photography'],
    bio: 'Art enthusiast exploring Ethiopian cultural heritage'
  }
];

const sampleCourses = [
  {
    title: 'Ethiopian Ancient History',
    description: 'Explore the rich history of ancient Ethiopian civilizations, from the Kingdom of Aksum to the medieval period.',
    category: 'history',
    difficulty: 'beginner',
    estimatedDuration: 480, // 8 hours
    instructor: 'Dr. Sarah Johnson',
    tags: ['ethiopia', 'history', 'aksum', 'ancient'],
    status: 'published',
    enrollmentCount: 15,
    averageRating: 4.5,
    price: 0,
    duration: 6, // 6 weeks
    curriculum: [
      'Introduction to Ethiopian Civilization',
      'The Kingdom of Aksum',
      'Medieval Ethiopian Kingdoms',
      'Religious Heritage and Churches',
      'Trade Routes and Cultural Exchange',
      'Archaeological Discoveries'
    ],
    learningOutcomes: [
      'Understand the timeline of Ethiopian ancient history',
      'Identify key archaeological sites and their significance',
      'Analyze the role of trade in cultural development',
      'Appreciate the religious and cultural heritage'
    ],
    isSuperAdminCourse: true,
    isActive: true
  },
  {
    title: 'Traditional Ethiopian Art & Culture',
    description: 'Learn about traditional Ethiopian art forms, cultural practices, and their modern interpretations.',
    category: 'art',
    difficulty: 'intermediate',
    estimatedDuration: 360, // 6 hours
    instructor: 'Prof. Michael Chen',
    tags: ['art', 'culture', 'traditional', 'crafts'],
    status: 'published',
    enrollmentCount: 12,
    averageRating: 4.7,
    price: 25,
    duration: 4, // 4 weeks
    curriculum: [
      'Traditional Painting Techniques',
      'Ethiopian Textile Arts',
      'Music and Dance Traditions',
      'Contemporary Ethiopian Art'
    ],
    learningOutcomes: [
      'Master basic traditional painting techniques',
      'Understand cultural significance of art forms',
      'Create your own traditional-inspired artwork',
      'Analyze modern interpretations of traditional art'
    ],
    isActive: true
  },
  {
    title: 'Archaeological Methods in Heritage Studies',
    description: 'Advanced course on archaeological techniques used in Ethiopian heritage site excavations.',
    category: 'archaeology',
    difficulty: 'advanced',
    estimatedDuration: 720, // 12 hours
    instructor: 'Dr. Sarah Johnson',
    tags: ['archaeology', 'methods', 'excavation', 'research'],
    status: 'published',
    enrollmentCount: 8,
    averageRating: 4.9,
    price: 50,
    duration: 8, // 8 weeks
    curriculum: [
      'Survey and Mapping Techniques',
      'Excavation Methodologies',
      'Artifact Analysis and Documentation',
      'Digital Archaeology Tools',
      'Site Conservation Principles',
      'Research Publication Methods'
    ],
    learningOutcomes: [
      'Apply professional archaeological survey methods',
      'Document and analyze archaeological findings',
      'Use digital tools for site documentation',
      'Develop conservation strategies for heritage sites'
    ],
    isActive: true
  }
];

// Setup function
const setupEducationData = async () => {
  try {
    console.log('🚀 Starting education database setup...\n');

    // Connect to database
    await connectDB();

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('🧹 Clearing existing education data...');
    await User.deleteMany({ email: { $in: sampleUsers.map(u => u.email) } });
    await Course.deleteMany({});
    await Lesson.deleteMany({});
    await Assignment.deleteMany({});
    await Discussion.deleteMany({});
    await LearningProgress.deleteMany({});
    await Feedback.deleteMany({});
    console.log('✅ Existing data cleared\n');

    // Create users
    console.log('👥 Creating sample users...');
    const hashedPassword = await bcrypt.hash('password123', 12);
    const createdUsers = [];
    
    for (let userData of sampleUsers) {
      const user = new User({
        ...userData,
        password: hashedPassword
      });
      const savedUser = await user.save();
      createdUsers.push(savedUser);
      console.log(`   ✅ Created user: ${userData.firstName} ${userData.lastName} (${userData.role})`);
    }

    // Get instructors
    const instructors = createdUsers.filter(u => u.role === 'organizer');
    const students = createdUsers.filter(u => u.role === 'user');

    // Create courses
    console.log('\n📚 Creating sample courses...');
    const createdCourses = [];
    
    for (let i = 0; i < sampleCourses.length; i++) {
      const courseData = sampleCourses[i];
      const instructor = instructors[i % instructors.length];
      
      const course = new Course({
        ...courseData,
        organizerId: instructor._id,
        createdBy: instructor._id
      });
      const savedCourse = await course.save();
      createdCourses.push(savedCourse);
      console.log(`   ✅ Created course: ${courseData.title}`);
    }

    // Create lessons for each course
    console.log('\n📖 Creating sample lessons...');
    const createdLessons = [];
    
    for (let course of createdCourses) {
      const lessonCount = Math.floor(Math.random() * 6) + 3; // 3-8 lessons per course
      
      for (let i = 1; i <= lessonCount; i++) {
        const lesson = new Lesson({
          title: `${course.curriculum[Math.min(i-1, course.curriculum.length-1)]} - Lesson ${i}`,
          description: `Detailed lesson content for ${course.curriculum[Math.min(i-1, course.curriculum.length-1)]}`,
          courseId: course._id,
          order: i,
          estimatedDuration: Math.floor(Math.random() * 45) + 15, // 15-60 minutes
          content: [
            {
              type: 'text',
              title: 'Introduction',
              content: `Welcome to lesson ${i}. In this lesson, we will explore key concepts and practical applications.`,
              duration: 5,
              order: 1
            },
            {
              type: 'video',
              title: 'Main Content Video',
              content: '/uploads/lessons/video/sample-video.mp4',
              duration: 20,
              order: 2
            },
            {
              type: 'text',
              title: 'Summary',
              content: 'Key takeaways and next steps for your learning journey.',
              duration: 5,
              order: 3
            }
          ],
          objectives: [
            `Understand the key concepts of ${course.curriculum[Math.min(i-1, course.curriculum.length-1)]}`,
            'Apply learned concepts to practical scenarios',
            'Prepare for the next lesson in the sequence'
          ],
          resources: [
            {
              title: 'Additional Reading',
              url: 'https://example.com/reading-material',
              type: 'article'
            },
            {
              title: 'Reference Document',
              url: '/uploads/lessons/documents/reference.pdf',
              type: 'document'
            }
          ],
          quiz: {
            questions: [
              {
                question: `What is the main focus of ${course.curriculum[Math.min(i-1, course.curriculum.length-1)]}?`,
                type: 'multiple_choice',
                options: ['Option A', 'Option B', 'Option C', 'Option D'],
                correctAnswer: 'Option A',
                explanation: 'This is the correct answer because...'
              }
            ],
            passingScore: 70
          },
          createdBy: course.organizerId,
          isActive: true
        });
        
        const savedLesson = await lesson.save();
        createdLessons.push(savedLesson);
        
        // Add lesson to course
        await Course.findByIdAndUpdate(course._id, {
          $addToSet: { lessons: savedLesson._id }
        });
      }
      console.log(`   ✅ Created ${lessonCount} lessons for: ${course.title}`);
    }

    // Create assignments
    console.log('\n📝 Creating sample assignments...');
    for (let course of createdCourses) {
      const assignmentCount = Math.floor(Math.random() * 3) + 1; // 1-3 assignments per course
      
      for (let i = 1; i <= assignmentCount; i++) {
        const assignment = new Assignment({
          title: `Assignment ${i}: ${course.title}`,
          description: `Complete this assignment to demonstrate your understanding of ${course.title}.`,
          instructions: 'Please read all materials carefully and submit your work by the due date.',
          courseId: course._id,
          type: ['essay', 'project', 'research'][Math.floor(Math.random() * 3)],
          difficulty: course.difficulty,
          totalPoints: 100,
          dueDate: new Date(Date.now() + (Math.random() * 30 + 7) * 24 * 60 * 60 * 1000), // 7-37 days from now
          allowLateSubmission: true,
          latePenalty: 10,
          submissionType: 'mixed',
          gradingType: 'points',
          createdBy: course.organizerId,
          organizerId: course.organizerId,
          isActive: true
        });
        
        await assignment.save();
        console.log(`   ✅ Created assignment: Assignment ${i} for ${course.title}`);
      }
    }

    // Create discussions
    console.log('\n💬 Creating sample discussions...');
    for (let course of createdCourses) {
      const discussionCount = Math.floor(Math.random() * 2) + 1; // 1-2 discussions per course
      
      for (let i = 1; i <= discussionCount; i++) {
        const discussion = new Discussion({
          title: `Discussion ${i}: ${course.title}`,
          description: `Open discussion about key topics in ${course.title}`,
          courseId: course._id,
          category: ['general', 'question', 'resource'][Math.floor(Math.random() * 3)],
          tags: course.tags,
          createdBy: course.organizerId,
          organizerId: course.organizerId,
          stats: {
            totalPosts: 0,
            totalViews: Math.floor(Math.random() * 50),
            lastActivity: new Date()
          },
          settings: {
            allowStudentPosts: true,
            requireApproval: false,
            isLocked: false
          }
        });
        
        await discussion.save();
        console.log(`   ✅ Created discussion: Discussion ${i} for ${course.title}`);
      }
    }

    // Create learning progress for students
    console.log('\n📊 Creating sample learning progress...');
    for (let student of students) {
      const enrolledCourses = createdCourses.slice(0, Math.floor(Math.random() * createdCourses.length) + 1);
      
      const progress = new LearningProgress({
        userId: student._id,
        courses: enrolledCourses.map(course => {
          const courseLessons = createdLessons.filter(lesson => 
            lesson.courseId.toString() === course._id.toString()
          );
          
          const completedLessonsCount = Math.floor(Math.random() * courseLessons.length);
          const lessonProgress = courseLessons.map((lesson, index) => ({
            lessonId: lesson._id,
            status: index < completedLessonsCount ? 'completed' : 
                    index === completedLessonsCount ? 'in_progress' : 'not_started',
            startedAt: index <= completedLessonsCount ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) : null,
            completedAt: index < completedLessonsCount ? new Date(Date.now() - Math.random() * 20 * 24 * 60 * 60 * 1000) : null,
            timeSpent: index <= completedLessonsCount ? Math.floor(Math.random() * 60) + 10 : 0,
            score: index < completedLessonsCount ? Math.floor(Math.random() * 30) + 70 : null,
            attempts: index <= completedLessonsCount ? Math.floor(Math.random() * 2) + 1 : 0,
            lastAccessedAt: index <= completedLessonsCount ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) : null
          }));
          
          const progressPercentage = courseLessons.length > 0 ? 
            Math.round((completedLessonsCount / courseLessons.length) * 100) : 0;
          
          return {
            courseId: course._id,
            status: progressPercentage === 100 ? 'completed' : 
                   progressPercentage > 0 ? 'in_progress' : 'enrolled',
            enrolledAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000),
            startedAt: progressPercentage > 0 ? new Date(Date.now() - Math.random() * 45 * 24 * 60 * 60 * 1000) : null,
            completedAt: progressPercentage === 100 ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) : null,
            progressPercentage: progressPercentage,
            lessons: lessonProgress
          };
        }),
        overallStats: {
          totalLessonsCompleted: Math.floor(Math.random() * 20) + 5,
          totalTimeSpent: Math.floor(Math.random() * 1000) + 100, // in minutes
          currentStreak: Math.floor(Math.random() * 10),
          longestStreak: Math.floor(Math.random() * 20) + 5,
          lastActivityDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
          averageScore: Math.floor(Math.random() * 25) + 75
        },
        achievements: [
          {
            achievementId: 'first_lesson_complete',
            type: 'lesson_complete',
            earnedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
          }
        ],
        preferences: {
          preferredCategories: ['history', 'culture', 'art'][Math.floor(Math.random() * 3)],
          difficulty: ['beginner', 'intermediate'][Math.floor(Math.random() * 2)],
          notifications: true
        }
      });
      
      await progress.save();
      
      // Update course enrollment counts
      for (let courseProgress of progress.courses) {
        await Course.findByIdAndUpdate(courseProgress.courseId, {
          $inc: { enrollmentCount: 1 }
        });
      }
      
      console.log(`   ✅ Created learning progress for: ${student.firstName} ${student.lastName}`);
    }

    console.log('\n🎉 Education database setup completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   👥 Users: ${createdUsers.length}`);
    console.log(`   📚 Courses: ${createdCourses.length}`);
    console.log(`   📖 Lessons: ${createdLessons.length}`);
    console.log(`   📝 Assignments: ${await Assignment.countDocuments()}`);
    console.log(`   💬 Discussions: ${await Discussion.countDocuments()}`);
    console.log(`   📊 Learning Progress: ${students.length}`);
    
    console.log('\n🔑 Sample Login Credentials:');
    console.log('   Instructors:');
    console.log('   - Email: sarah.johnson@heritage.edu | Password: password123');
    console.log('   - Email: michael.chen@heritage.edu | Password: password123');
    console.log('   Students:');
    console.log('   - Email: alice.wonder@student.edu | Password: password123');
    console.log('   - Email: bob.smith@student.edu | Password: password123');

  } catch (error) {
    console.error('❌ Error setting up education data:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

// Run the setup
if (require.main === module) {
  setupEducationData();
}

module.exports = { setupEducationData };
