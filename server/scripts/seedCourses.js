const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Course = require('../models/Course');
const User = require('../models/User');

// Load env vars
dotenv.config({ path: './.env' });

const seedCourses = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected...');

    // Find a user to assign as creator/instructor
    // Try to find a superAdmin first, then any admin, then create one if needed
    let instructor = await User.findOne({ role: 'superAdmin' });
    if (!instructor) {
      instructor = await User.findOne({ role: 'admin' });
    }

    if (!instructor) {
      console.log('No admin found. Creating a temporary Super Admin...');
      instructor = await User.create({
        firstName: 'Super',
        lastName: 'Admin',
        email: 'superadmin@example.com',
        password: 'password123',
        role: 'superAdmin',
        isActive: true
      });
      console.log('Created temporary Super Admin:', instructor.email);
    } else {
      console.log('Using existing instructor:', instructor.email);
    }

    const courses = [
      {
        title: 'Introduction to Ethiopian Heritage',
        description: 'Explore the rich and diverse heritage of Ethiopia, from ancient civilizations to modern traditions. This course provides a comprehensive overview of the country\'s historical landmarks and cultural significance.',
        category: 'heritage',
        level: 'beginner',
        duration: 120, // 2 hours
        instructor: {
          name: `${instructor.firstName} ${instructor.lastName}`,
          email: instructor.email,
          bio: 'Expert in Ethiopian Studies'
        },
        content: {
          objectives: ['Understand Ethiopian history', 'Identify key landmarks', 'Appreciate cultural diversity'],
          topics: [
            { title: 'Ancient Civilizations', description: 'Aksumite Empire', duration: 45 },
            { title: 'Medieval Period', description: 'Lalibela and Gondar', duration: 45 },
            { title: 'Modern Era', description: 'Contemporary Heritage', duration: 30 }
          ],
          resources: [
            { title: 'History of Ethiopia', type: 'document', url: 'http://example.com/doc', description: 'PDF Guide' }
          ]
        },
        pricing: { type: 'free', amount: 0, currency: 'ETB' },
        enrollment: { totalEnrolled: 0, maxStudents: 100, isOpen: true },
        status: 'published',
        tags: ['ethiopia', 'history', 'culture'],
        createdBy: instructor._id
      },
      {
        title: 'Aksumite Civilization Deep Dive',
        description: 'A detailed look at the Aksumite Empire, its obelisks, trade routes, and influence in the ancient world.',
        category: 'history',
        level: 'intermediate',
        duration: 180, // 3 hours
        instructor: {
          name: `${instructor.firstName} ${instructor.lastName}`,
          email: instructor.email,
          bio: 'Expert in Ethiopian Studies'
        },
        content: {
          objectives: ['Analyze Aksumite architecture', 'Understand trade networks'],
          topics: [
            { title: 'The Obelisks', description: 'Engineering marvels', duration: 60 },
            { title: 'Trade & Coinage', description: 'Economic power', duration: 60 },
            { title: 'Religious Transition', description: 'Christianity arrival', duration: 60 }
          ],
          resources: [
            { title: 'Aksum Architect', type: 'video', url: 'http://example.com/video', description: '3D reconstruction' }
          ]
        },
        pricing: { type: 'paid', amount: 500, currency: 'ETB' },
        enrollment: { totalEnrolled: 15, maxStudents: 50, isOpen: true },
        status: 'published',
        tags: ['aksum', 'archaeology', 'ancient'],
        createdBy: instructor._id
      },
      {
        title: 'Amharic Language Basics',
        description: 'Learn the fundamentals of Amharic, the official working language of Ethiopia. Covers alphabet (Fidel), basic greetings, and grammar.',
        category: 'language',
        level: 'beginner',
        duration: 300, // 5 hours
        instructor: {
          name: `${instructor.firstName} ${instructor.lastName}`,
          email: instructor.email,
          bio: 'Linguist and Educator'
        },
        content: {
          objectives: ['Read Fidel', 'Basic conversation', 'Grammar structure'],
          topics: [
            { title: 'The Fidel', description: 'Alphabet introduction', duration: 100 },
            { title: 'Greetings', description: 'Daily conversation', duration: 100 },
            { title: 'Sentence Building', description: 'Subject-Object-Verb', duration: 100 }
          ],
          resources: [
            { title: 'Amharic Workbook', type: 'document', url: 'http://example.com/workbook', description: 'Practice sheets' }
          ]
        },
        pricing: { type: 'paid', amount: 200, currency: 'ETB' },
        enrollment: { totalEnrolled: 45, maxStudents: 200, isOpen: true },
        status: 'published',
        tags: ['language', 'amharic', 'communication'],
        createdBy: instructor._id
      }
    ];

    await Course.deleteMany({ title: { $in: courses.map(c => c.title) } }); // Prevent duplicates of these specific mock courses
    console.log('Cleared existing mock courses...');

    await Course.insertMany(courses);
    console.log('✅ Mock courses seeded successfully!');

    process.exit();
  } catch (error) {
    console.error('❌ Error seeding courses:', error);
    process.exit(1);
  }
};

seedCourses();
