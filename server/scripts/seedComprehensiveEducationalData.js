const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config/env');

// Import models
const User = require('../models/User');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const Assignment = require('../models/Assignment');
const Discussion = require('../models/Discussion');
const Grade = require('../models/Grade');
const LearningProgress = require('../models/LearningProgress');
const Achievement = require('../models/Achievement');
const Certificate = require('../models/Certificate');

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(config.MONGODB_URI);
    console.log('MongoDB connected for seeding...');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Sample educational data
const sampleData = {
  users: [
    {
      firstName: 'Dr. Alem',
      lastName: 'Tekle',
      name: 'Dr. Alem Tekle',
      email: 'alem.tekle@ethioheritage.com',
      password: 'instructor123',
      role: 'superAdmin',
      isVerified: true,
      isActive: true,
      bio: 'PhD in Ethiopian History, specializing in ancient civilizations and archaeological discoveries.',
      interests: ['Ancient History', 'Archaeology', 'Education'],
      languages: ['English', 'Amharic', 'Tigrinya']
    },
    {
      firstName: 'Prof. Birtukan',
      lastName: 'Mideksa',
      name: 'Prof. Birtukan Mideksa',
      email: 'birtukan.mideksa@ethioheritage.com',
      password: 'instructor123',
      role: 'museumAdmin',
      isVerified: true,
      isActive: true,
      bio: 'Professor of Ethiopian Art and Culture, expert in traditional crafts and religious art.',
      interests: ['Art & Culture', 'Traditional Crafts', 'Religious Heritage'],
      languages: ['English', 'Amharic', 'Oromo']
    },
    {
      firstName: 'Kebede',
      lastName: 'Alemu',
      name: 'Kebede Alemu',
      email: 'kebede.student@gmail.com',
      password: 'student123',
      role: 'user',
      isVerified: true,
      isActive: true,
      bio: 'Passionate about Ethiopian heritage and culture.',
      interests: ['Ancient History', 'Traditional Crafts', 'Music & Dance'],
      languages: ['English', 'Amharic']
    },
    {
      firstName: 'Hanan',
      lastName: 'Mohammed',
      name: 'Hanan Mohammed',
      email: 'hanan.student@gmail.com',
      password: 'student123',
      role: 'user',
      isVerified: true,
      isActive: true,
      bio: 'Interested in cultural anthropology and Ethiopian traditions.',
      interests: ['Anthropology', 'Literature', 'Education'],
      languages: ['English', 'Amharic', 'Somali']
    },
    {
      firstName: 'Solomon',
      lastName: 'Tesfaye',
      name: 'Solomon Tesfaye',
      email: 'solomon.student@gmail.com',
      password: 'student123',
      role: 'user',
      isVerified: true,
      isActive: true,
      bio: 'Archaeology enthusiast and digital heritage advocate.',
      interests: ['Archaeology', 'Paleontology', 'Photography'],
      languages: ['English', 'Amharic', 'Gurage']
    }
  ],
  
  courses: [
    {
      title: 'Ancient Ethiopian Civilizations',
      description: 'Comprehensive study of ancient Ethiopian civilizations, including the Axumite Kingdom, Queen of Sheba, and archaeological discoveries.',
      category: 'history',
      difficulty: 'intermediate',
      estimatedDuration: 480,
      instructor: 'Dr. Alem Tekle',
      tags: ['Axum', 'Queen of Sheba', 'Ancient History', 'Archaeology'],
      prerequisites: []
    },
    {
      title: 'Ethiopian Orthodox Christianity and Religious Art',
      description: 'Deep dive into Ethiopian Orthodox Christianity, its history, traditions, and magnificent religious artwork.',
      category: 'culture',
      difficulty: 'beginner',
      estimatedDuration: 360,
      instructor: 'Prof. Birtukan Mideksa',
      tags: ['Orthodox Christianity', 'Religious Art', 'Manuscripts', 'Churches'],
      prerequisites: []
    },
    {
      title: 'Traditional Ethiopian Crafts and Techniques',
      description: 'Learn about traditional Ethiopian crafts including pottery, weaving, metalwork, and wood carving.',
      category: 'art',
      difficulty: 'beginner',
      estimatedDuration: 300,
      instructor: 'Prof. Birtukan Mideksa',
      tags: ['Crafts', 'Pottery', 'Weaving', 'Traditional Techniques'],
      prerequisites: []
    },
    {
      title: 'Archaeological Methods in Ethiopian Heritage',
      description: 'Introduction to archaeological methods and techniques used in Ethiopian heritage research.',
      category: 'archaeology',
      difficulty: 'advanced',
      estimatedDuration: 600,
      instructor: 'Dr. Alem Tekle',
      tags: ['Archaeology', 'Research Methods', 'Fieldwork', 'Heritage Preservation'],
      prerequisites: []
    },
    {
      title: 'Ethiopian Languages and Literature',
      description: 'Study of Ethiopian languages, ancient scripts like Ge\'ez, and classical literature.',
      category: 'language',
      difficulty: 'intermediate',
      estimatedDuration: 420,
      instructor: 'Dr. Alem Tekle',
      tags: ['Languages', 'Geez', 'Literature', 'Manuscripts'],
      prerequisites: []
    }
  ],

  achievements: [
    {
      id: 'first_steps',
      name: 'First Steps',
      description: 'Completed your first lesson in Ethiopian heritage studies',
      type: 'lesson_complete',
      category: 'general',
      criteria: { type: 'lessons_completed', threshold: 1 },
      points: 50,
      icon: 'star',
      badge: 'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=first-steps'
    },
    {
      id: 'heritage_enthusiast',
      name: 'Heritage Enthusiast',
      description: 'Enrolled in 3 different heritage courses',
      type: 'course_complete',
      category: 'general',
      criteria: { type: 'courses_completed', threshold: 3 },
      points: 200,
      icon: 'book',
      badge: 'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=heritage-enthusiast'
    },
    {
      id: 'dedicated_learner',
      name: 'Dedicated Learner',
      description: 'Maintained a 7-day learning streak',
      type: 'streak',
      category: 'general',
      criteria: { type: 'streak_days', threshold: 7 },
      points: 150,
      icon: 'flame',
      badge: 'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=dedicated-learner'
    },
    {
      id: 'scholar',
      name: 'Scholar',
      description: 'Achieved 90% or higher average score across all courses',
      type: 'score',
      category: 'general',
      criteria: { type: 'score_average', threshold: 90 },
      points: 500,
      icon: 'trophy',
      badge: 'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=scholar'
    },
    {
      id: 'history_master',
      name: 'History Master',
      description: 'Completed 5 history lessons',
      type: 'category_master',
      category: 'history',
      criteria: { type: 'category_lessons', threshold: 5, category: 'history' },
      points: 300,
      icon: 'scroll',
      badge: 'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=history-master'
    }
  ]
};

// Seed function
const seedEducationalData = async () => {
  try {
    console.log('Starting comprehensive educational data seeding...');
    
    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Course.deleteMany({}),
      Lesson.deleteMany({}),
      Assignment.deleteMany({}),
      Discussion.deleteMany({}),
      Grade.deleteMany({}),
      LearningProgress.deleteMany({}),
      Achievement.deleteMany({}),
      Certificate.deleteMany({})
    ]);
    console.log('Existing data cleared');

    // Create users
    console.log('Creating users...');
    const users = [];
    for (const userData of sampleData.users) {
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      const user = await User.create({
        ...userData,
        password: hashedPassword
      });
      users.push(user);
    }
    console.log(`Created ${users.length} users`);

    // Find admin and student users
    const admin = users.find(u => u.role === 'superAdmin');
    const instructor = users.find(u => u.role === 'museumAdmin');
    const students = users.filter(u => u.role === 'user');

    // Create courses
    console.log('Creating courses...');
    const courses = [];
    for (const courseData of sampleData.courses) {
      const course = await Course.create({
        ...courseData,
        createdBy: admin._id
      });
      courses.push(course);
    }
    console.log(`Created ${courses.length} courses`);

    // Create lessons for each course
    console.log('Creating lessons...');
    const lessons = [];
    for (const course of courses) {
      const lessonCount = Math.floor(Math.random() * 5) + 3; // 3-7 lessons per course
      
      for (let i = 1; i <= lessonCount; i++) {
        const lesson = await Lesson.create({
          title: `${course.title} - Lesson ${i}`,
          description: `Comprehensive lesson covering key aspects of ${course.title.toLowerCase()}`,
          courseId: course._id,
          order: i,
          estimatedDuration: Math.floor(Math.random() * 60) + 30, // 30-90 minutes
          content: [
            {
              type: 'text',
              title: 'Introduction',
              content: `This lesson introduces you to the fundamental concepts of ${course.title}. You'll learn about historical contexts, cultural significance, and modern relevance.`,
              duration: 15,
              order: 1
            },
            {
              type: 'video',
              title: 'Visual Exploration',
              content: `https://example.com/video/${course._id}/lesson${i}`,
              duration: 20,
              order: 2
            },
            {
              type: 'interactive',
              title: 'Interactive Activity',
              content: JSON.stringify({
                type: 'quiz',
                questions: [
                  {
                    question: `What is the significance of ${course.title}?`,
                    options: ['Historical importance', 'Cultural value', 'Educational merit', 'All of the above'],
                    correct: 3
                  }
                ]
              }),
              duration: 10,
              order: 3
            }
          ],
          objectives: [
            `Understand the historical context of ${course.title}`,
            'Identify key cultural elements and their significance',
            'Analyze the impact on modern Ethiopian society',
            'Evaluate preservation and documentation efforts'
          ],
          resources: [
            {
              title: 'Additional Reading',
              url: `https://ethioheritage.com/resources/${course._id}`,
              type: 'article'
            }
          ],
          quiz: {
            questions: [
              {
                question: `What is a key characteristic of ${course.title}?`,
                type: 'multiple_choice',
                options: ['Historical significance', 'Cultural importance', 'Educational value', 'All of the above'],
                correctAnswer: 'All of the above',
                explanation: `${course.title} encompasses historical significance, cultural importance, and educational value.`
              }
            ],
            passingScore: 70
          },
          createdBy: admin._id
        });
        
        lessons.push(lesson);
        
        // Add lesson to course
        course.lessons.push(lesson._id);
      }
      
      await course.save();
    }
    console.log(`Created ${lessons.length} lessons`);

    // Create assignments
    console.log('Creating assignments...');
    const assignments = [];
    for (const course of courses) {
      const assignmentCount = Math.floor(Math.random() * 3) + 1; // 1-3 assignments per course
      
      for (let i = 1; i <= assignmentCount; i++) {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + Math.floor(Math.random() * 30) + 7); // 7-37 days from now
        
        const assignment = await Assignment.create({
          title: `${course.title} - Assignment ${i}`,
          description: `Research and analysis assignment for ${course.title}`,
          instructions: `Write a comprehensive essay (1000-1500 words) analyzing the key themes covered in ${course.title}. Include historical context, cultural significance, and modern relevance. Support your analysis with examples and scholarly references.`,
          courseId: course._id,
          type: 'essay',
          difficulty: course.difficulty,
          totalPoints: 100,
          dueDate,
          allowLateSubmission: true,
          latePenalty: 5, // 5% per day
          submissionType: 'mixed',
          allowedFileTypes: ['pdf', 'doc', 'docx'],
          maxFileSize: 10,
          maxSubmissions: 2,
          gradingType: 'rubric',
          rubric: {
            criteria: [
              {
                name: 'Content Knowledge',
                description: 'Demonstrates understanding of course material',
                maxScore: 40,
                levels: [
                  { name: 'Excellent', description: 'Comprehensive understanding', score: 40 },
                  { name: 'Good', description: 'Good understanding with minor gaps', score: 32 },
                  { name: 'Satisfactory', description: 'Basic understanding', score: 24 },
                  { name: 'Needs Improvement', description: 'Limited understanding', score: 16 }
                ]
              },
              {
                name: 'Analysis and Critical Thinking',
                description: 'Quality of analysis and critical evaluation',
                maxScore: 30,
                levels: [
                  { name: 'Excellent', description: 'Insightful analysis', score: 30 },
                  { name: 'Good', description: 'Sound analysis', score: 24 },
                  { name: 'Satisfactory', description: 'Basic analysis', score: 18 },
                  { name: 'Needs Improvement', description: 'Weak analysis', score: 12 }
                ]
              },
              {
                name: 'Organization and Writing',
                description: 'Clarity, organization, and writing quality',
                maxScore: 20,
                levels: [
                  { name: 'Excellent', description: 'Clear and well-organized', score: 20 },
                  { name: 'Good', description: 'Generally clear', score: 16 },
                  { name: 'Satisfactory', description: 'Adequate organization', score: 12 },
                  { name: 'Needs Improvement', description: 'Poor organization', score: 8 }
                ]
              },
              {
                name: 'Use of Sources',
                description: 'Appropriate use of scholarly sources',
                maxScore: 10,
                levels: [
                  { name: 'Excellent', description: 'Excellent use of sources', score: 10 },
                  { name: 'Good', description: 'Good use of sources', score: 8 },
                  { name: 'Satisfactory', description: 'Adequate sources', score: 6 },
                  { name: 'Needs Improvement', description: 'Limited sources', score: 4 }
                ]
              }
            ]
          },
          resources: [
            {
              title: 'Assignment Guidelines',
              url: 'https://ethioheritage.com/assignment-guidelines',
              type: 'document',
              description: 'Detailed guidelines for completing this assignment'
            }
          ],
          category: 'project',
          tags: [course.category, 'research', 'analysis'],
          createdBy: admin._id
        });
        
        assignments.push(assignment);
      }
    }
    console.log(`Created ${assignments.length} assignments`);

    // Create discussions
    console.log('Creating discussions...');
    const discussions = [];
    for (const course of courses) {
      const discussionCount = Math.floor(Math.random() * 3) + 2; // 2-4 discussions per course
      
      for (let i = 1; i <= discussionCount; i++) {
        const categories = ['general', 'question', 'resource'];
        const discussion = await Discussion.create({
          title: `Discussion ${i}: ${course.title} Insights`,
          description: `Share your thoughts and insights about ${course.title}. What aspects did you find most interesting?`,
          courseId: course._id,
          category: categories[Math.floor(Math.random() * categories.length)],
          tags: [course.category, 'discussion', 'insights'],
          posts: [
            {
              author: admin._id,
              content: `Welcome to our discussion on ${course.title}! This is a space for you to share your thoughts, ask questions, and engage with fellow learners. What aspects of this topic interest you most?`,
              isPinned: true
            }
          ],
          settings: {
            allowStudentPosts: true,
            requireApproval: false,
            isLocked: false
          },
          createdBy: admin._id
        });
        
        discussions.push(discussion);
      }
    }
    console.log(`Created ${discussions.length} discussions`);

    // Create achievements
    console.log('Creating achievements...');
    const achievements = [];
    for (const achievementData of sampleData.achievements) {
      const achievement = await Achievement.create({
        ...achievementData,
        createdBy: admin._id
      });
      achievements.push(achievement);
    }
    console.log(`Created ${achievements.length} achievements`);

    // Create learning progress and enrollments for students
    console.log('Creating learning progress...');
    for (const student of students) {
      // Enroll student in 2-4 random courses
      const enrollmentCount = Math.floor(Math.random() * 3) + 2;
      const selectedCourses = courses.sort(() => 0.5 - Math.random()).slice(0, enrollmentCount);
      
      const courseProgress = selectedCourses.map(course => {
        const courseLessons = lessons.filter(l => l.courseId.toString() === course._id.toString());
        const completedLessonsCount = Math.floor(Math.random() * courseLessons.length);
        
        return {
          courseId: course._id,
          status: completedLessonsCount === courseLessons.length ? 'completed' : 'in_progress',
          enrolledAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Within last 30 days
          startedAt: new Date(Date.now() - Math.random() * 25 * 24 * 60 * 60 * 1000),
          completedAt: completedLessonsCount === courseLessons.length ? new Date() : null,
          progressPercentage: Math.round((completedLessonsCount / courseLessons.length) * 100),
          lessons: courseLessons.map((lesson, index) => ({
            lessonId: lesson._id,
            status: index < completedLessonsCount ? 'completed' : 'not_started',
            startedAt: index < completedLessonsCount ? new Date(Date.now() - Math.random() * 20 * 24 * 60 * 60 * 1000) : null,
            completedAt: index < completedLessonsCount ? new Date(Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000) : null,
            timeSpent: index < completedLessonsCount ? Math.floor(Math.random() * 60) + 15 : 0,
            score: index < completedLessonsCount ? Math.floor(Math.random() * 40) + 60 : null,
            attempts: index < completedLessonsCount ? Math.floor(Math.random() * 2) + 1 : 0
          }))
        };
      });
      
      const totalLessonsCompleted = courseProgress.reduce((sum, course) => 
        sum + course.lessons.filter(l => l.status === 'completed').length, 0
      );
      
      const progress = await LearningProgress.create({
        userId: student._id,
        courses: courseProgress,
        overallStats: {
          totalLessonsCompleted,
          totalTimeSpent: totalLessonsCompleted * 45, // Average 45 min per lesson
          currentStreak: Math.floor(Math.random() * 10),
          longestStreak: Math.floor(Math.random() * 20) + 5,
          lastActivityDate: new Date(),
          averageScore: Math.floor(Math.random() * 30) + 70 // 70-100
        },
        achievements: achievements.slice(0, Math.floor(Math.random() * 3) + 1).map(achievement => ({
          achievementId: achievement._id,
          earnedAt: new Date(Date.now() - Math.random() * 20 * 24 * 60 * 60 * 1000),
          type: achievement.type
        })),
        preferences: {
          preferredCategories: [courses[Math.floor(Math.random() * courses.length)].category],
          difficulty: 'beginner',
          notifications: true
        }
      });
      
      // Create some grades
      for (const courseProgress of progress.courses) {
        const courseAssignments = assignments.filter(a => a.courseId.toString() === courseProgress.courseId.toString());
        
        for (const assignment of courseAssignments.slice(0, Math.floor(Math.random() * courseAssignments.length) + 1)) {
          if (Math.random() > 0.3) { // 70% chance of submission
            const score = Math.floor(Math.random() * 40) + 60; // 60-100
            const isLate = Math.random() > 0.8;
            
            await Grade.create({
              studentId: student._id,
              courseId: courseProgress.courseId,
              itemId: assignment._id,
              itemType: 'assignment',
              itemTitle: assignment.title,
              score,
              maxScore: assignment.totalPoints,
              feedback: score >= 90 ? 'Excellent work! Your analysis demonstrates deep understanding.' :
                       score >= 80 ? 'Good work. Some areas could be expanded further.' :
                       score >= 70 ? 'Satisfactory work. Please review the feedback for improvement areas.' :
                       'Please see detailed feedback and consider resubmitting.',
              gradedBy: admin._id,
              isLate,
              latePenalty: isLate ? 5 : 0,
              category: assignment.category,
              weight: 1
            });
          }
        }
      }
    }
    console.log('Created learning progress for all students');

    // Generate certificates for completed courses
    console.log('Generating certificates...');
    const allProgress = await LearningProgress.find({ 'courses.status': 'completed' });
    let certificateCount = 0;
    
    for (const progress of allProgress) {
      const completedCourses = progress.courses.filter(c => c.status === 'completed');
      
      for (const courseProgress of completedCourses) {
        const course = courses.find(c => c._id.toString() === courseProgress.courseId.toString());
        
        if (course) {
          const crypto = require('crypto');
          const certificateId = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          const verificationHash = crypto.randomBytes(32).toString('hex');
          
          await Certificate.create({
            certificateId,
            userId: progress.userId,
            courseId: course._id,
            verificationHash,
            status: 'active',
            issuedAt: courseProgress.completedAt || new Date(),
            metadata: {
              courseName: course.title,
              instructor: course.instructor,
              duration: course.estimatedDuration,
              difficulty: course.difficulty,
              category: course.category,
              completionDate: courseProgress.completedAt,
              finalScore: 85 + Math.floor(Math.random() * 15), // 85-100
              skillsAcquired: course.tags,
              institution: 'EthioHeritage360 Learning Platform'
            }
          });
          
          certificateCount++;
        }
      }
    }
    console.log(`Generated ${certificateCount} certificates`);

    console.log('\n✅ COMPREHENSIVE EDUCATIONAL DATA SEEDING COMPLETED SUCCESSFULLY!');
    console.log('\n📊 SUMMARY:');
    console.log(`👥 Users: ${users.length}`);
    console.log(`📚 Courses: ${courses.length}`);
    console.log(`📖 Lessons: ${lessons.length}`);
    console.log(`📝 Assignments: ${assignments.length}`);
    console.log(`💬 Discussions: ${discussions.length}`);
    console.log(`🏆 Achievements: ${achievements.length}`);
    console.log(`📋 Learning Progress Records: ${students.length}`);
    console.log(`🏅 Certificates: ${certificateCount}`);
    
    console.log('\n🔑 LOGIN CREDENTIALS:');
    console.log('👤 Super Admin: alem.tekle@ethioheritage.com / instructor123');
    console.log('👤 Museum Admin: birtukan.mideksa@ethioheritage.com / instructor123');
    console.log('👤 Student 1: kebede.student@gmail.com / student123');
    console.log('👤 Student 2: hanan.student@gmail.com / student123');
    console.log('👤 Student 3: solomon.student@gmail.com / student123');

  } catch (error) {
    console.error('Seeding error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed.');
  }
};

// Run seeding
const runSeed = async () => {
  await connectDB();
  await seedEducationalData();
};

if (require.main === module) {
  runSeed();
}

module.exports = { seedEducationalData };
