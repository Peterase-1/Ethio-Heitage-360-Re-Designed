const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { connectDB } = require('../config/database');

// Import all models
const User = require('../models/User');
const Course = require('../models/Course');
const Museum = require('../models/Museum');
const Artifact = require('../models/Artifact');
const Event = require('../models/Event');
const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const Flashcard = require('../models/Flashcard');
const LiveSession = require('../models/LiveSession');
const Enrollment = require('../models/Enrollment');
const Bookmark = require('../models/Bookmark');
const UserNote = require('../models/UserNote');
const ForumTopic = require('../models/Forum');
const StudyGroup = require('../models/StudyGroup');
const UserGoal = require('../models/UserGoal');
const VisitorProfile = require('../models/VisitorProfile');
const VisitorActivity = require('../models/VisitorActivity');
const VisitorFavorites = require('../models/VisitorFavorites');
const Achievement = require('../models/Achievement');
const Certificate = require('../models/Certificate');

const seedComprehensiveFeatures = async () => {
  try {
    console.log('🌱 Starting comprehensive seeding...');
    await connectDB();

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await Promise.all([
      Quiz.deleteMany({}),
      QuizAttempt.deleteMany({}),
      Flashcard.deleteMany({}),
      LiveSession.deleteMany({}),
      Enrollment.deleteMany({}),
      Bookmark.deleteMany({}),
      UserNote.deleteMany({}),
      ForumTopic.deleteMany({}),
      StudyGroup.deleteMany({}),
      UserGoal.deleteMany({})
    ]);

    // 1. Create Super Admin (if doesn't exist)
    console.log('👑 Creating Super Admin...');
    let superAdmin = await User.findOne({ email: 'superadmin@heritage360.et' });
    
    if (!superAdmin) {
      const hashedPassword = await bcrypt.hash('SuperAdmin123!', 12);
      superAdmin = new User({
        name: 'Heritage 360 Super Admin',
        email: 'superadmin@heritage360.et',
        password: hashedPassword,
        role: 'super-admin',
        isVerified: true,
        profileImage: '/uploads/profiles/superadmin-avatar.jpg'
      });
      await superAdmin.save();
    }

    // 2. Create Sample Visitor User
    console.log('👤 Creating Sample Visitor...');
    let visitor = await User.findOne({ email: 'visitor@heritage360.et' });
    
    if (!visitor) {
      const hashedPassword = await bcrypt.hash('Visitor123!', 12);
      visitor = new User({
        name: 'Sample Heritage Explorer',
        email: 'visitor@heritage360.et',
        password: hashedPassword,
        role: 'visitor',
        isVerified: true,
        profileImage: '/uploads/profiles/visitor-avatar.jpg'
      });
      await visitor.save();
    }

    // 3. Create Staff for Live Sessions
    console.log('👥 Creating Staff Members...');
    let staffMember = await User.findOne({ email: 'staff@heritage360.et' });
    
    if (!staffMember) {
      const hashedPassword = await bcrypt.hash('Staff123!', 12);
      staffMember = new User({
        name: 'Dr. Abebe Kebede',
        email: 'staff@heritage360.et',
        password: hashedPassword,
        role: 'staff',
        isVerified: true,
        profileImage: '/uploads/profiles/staff-avatar.jpg',
        bio: 'Ethiopian Heritage Expert and Museum Curator with 15+ years experience'
      });
      await staffMember.save();
    }

    // 4. Create Comprehensive Quizzes (Super Admin Created)
    console.log('🧠 Creating Quizzes by Super Admin...');
    const quizzes = [
      {
        title: 'Ethiopian Heritage Foundations',
        description: 'Test your knowledge of basic Ethiopian heritage and culture',
        instructions: 'Answer all questions to the best of your ability. You have 3 attempts.',
        category: 'heritage',
        difficulty: 'beginner',
        questions: [
          {
            question: 'What is the ancient name of Ethiopia?',
            type: 'multiple-choice',
            options: [
              { text: 'Abyssinia', isCorrect: true, explanation: 'Ethiopia was historically known as Abyssinia' },
              { text: 'Nubia', isCorrect: false, explanation: 'Nubia was a different ancient kingdom' },
              { text: 'Kush', isCorrect: false, explanation: 'Kush was located in present-day Sudan' },
              { text: 'Axum', isCorrect: false, explanation: 'Axum was a city and kingdom within Ethiopia' }
            ],
            points: 10,
            timeLimit: 30
          },
          {
            question: 'Which Ethiopian city is famous for its rock-hewn churches?',
            type: 'multiple-choice',
            options: [
              { text: 'Addis Ababa', isCorrect: false, explanation: 'Addis Ababa is the capital but not known for rock churches' },
              { text: 'Lalibela', isCorrect: true, explanation: 'Lalibela is famous for its 11 rock-hewn churches' },
              { text: 'Gondar', isCorrect: false, explanation: 'Gondar is known for castles, not rock churches' },
              { text: 'Bahir Dar', isCorrect: false, explanation: 'Bahir Dar is known for Lake Tana and the Blue Nile' }
            ],
            points: 10,
            timeLimit: 30
          },
          {
            question: 'True or False: Ethiopia uses its own unique calendar system',
            type: 'true-false',
            options: [
              { text: 'True', isCorrect: true, explanation: 'Ethiopia follows the Ethiopian calendar with 13 months' },
              { text: 'False', isCorrect: false, explanation: 'Ethiopia indeed has its own calendar system' }
            ],
            points: 5,
            timeLimit: 20
          }
        ],
        settings: {
          timeLimit: 15,
          attemptsAllowed: 3,
          shuffleQuestions: true,
          showCorrectAnswers: true,
          passingScore: 70,
          certificateEligible: true
        },
        tags: ['basic', 'culture', 'history'],
        createdBy: superAdmin._id,
        isPublished: true
      },
      {
        title: 'Ancient Kingdom of Axum',
        description: 'Explore the rich history of the Axumite Empire',
        category: 'history',
        difficulty: 'intermediate',
        questions: [
          {
            question: 'When did the Kingdom of Axum reach its peak?',
            type: 'multiple-choice',
            options: [
              { text: '1st-3rd century CE', isCorrect: false },
              { text: '3rd-6th century CE', isCorrect: true, explanation: 'Axum peaked between 3rd-6th centuries CE' },
              { text: '7th-9th century CE', isCorrect: false },
              { text: '10th-12th century CE', isCorrect: false }
            ],
            points: 15
          },
          {
            question: 'What were the famous stone monuments of Axum called?',
            type: 'fill-blank',
            correctAnswer: 'stelae',
            points: 10,
            hints: ['These are tall stone pillars', 'Also called obelisks']
          }
        ],
        settings: {
          timeLimit: 20,
          attemptsAllowed: 2,
          passingScore: 75,
          certificateEligible: true
        },
        tags: ['axum', 'ancient', 'kingdom'],
        createdBy: superAdmin._id,
        isPublished: true
      },
      {
        title: 'Ethiopian Coffee Culture',
        description: 'Learn about the birthplace of coffee',
        category: 'culture',
        difficulty: 'beginner',
        questions: [
          {
            question: 'Ethiopia is considered the birthplace of coffee',
            type: 'true-false',
            options: [
              { text: 'True', isCorrect: true, explanation: 'Coffee originated in Ethiopia' },
              { text: 'False', isCorrect: false }
            ],
            points: 5
          }
        ],
        settings: {
          timeLimit: 10,
          attemptsAllowed: 5,
          passingScore: 60
        },
        tags: ['coffee', 'culture', 'tradition'],
        createdBy: superAdmin._id,
        isPublished: true
      }
    ];

    const createdQuizzes = await Quiz.insertMany(quizzes);
    console.log(`✅ Created ${createdQuizzes.length} quizzes`);

    // 5. Create Flashcards (Super Admin Created)
    console.log('💭 Creating Flashcards...');
    const flashcards = [
      {
        front: { content: 'What does "Ethiopia" mean in Greek?' },
        back: { content: 'Ethiopia means "Land of Burnt Faces" from the Greek words "Aethiops"' },
        category: 'heritage',
        difficulty: 'easy',
        tags: ['etymology', 'history'],
        createdBy: superAdmin._id,
        isPublished: true
      },
      {
        front: { content: 'Name the 13th month in the Ethiopian calendar' },
        back: { content: 'Pagumē - it has 5 or 6 days depending on whether it\'s a leap year' },
        category: 'culture',
        difficulty: 'medium',
        tags: ['calendar', 'time'],
        createdBy: superAdmin._id,
        isPublished: true
      },
      {
        front: { content: 'What is the traditional Ethiopian bread called?' },
        back: { content: 'Injera - a spongy sourdough flatbread made from teff flour' },
        category: 'culture',
        difficulty: 'easy',
        tags: ['food', 'tradition'],
        createdBy: superAdmin._id,
        isPublished: true
      },
      {
        front: { 
          content: 'Identify this ancient script',
          media: { type: 'image', url: '/uploads/flashcards/geez-script.jpg' }
        },
        back: { content: 'Ge\'ez script - ancient Ethiopic script still used for Amharic and other Ethiopian languages' },
        category: 'language',
        difficulty: 'hard',
        tags: ['script', 'writing', 'language'],
        createdBy: superAdmin._id,
        isPublished: true
      },
      {
        front: { content: 'What are the Lalibela churches carved from?' },
        back: { content: 'Solid volcanic rock - carved downward from the ground level' },
        category: 'heritage',
        difficulty: 'medium',
        tags: ['architecture', 'lalibela', 'churches'],
        createdBy: superAdmin._id,
        isPublished: true
      }
    ];

    await Flashcard.insertMany(flashcards);
    console.log(`✅ Created ${flashcards.length} flashcards`);

    // 6. Create Live Sessions (Staff Created)
    console.log('📺 Creating Live Sessions...');
    const liveSessions = [
      {
        title: 'Introduction to Ethiopian Heritage',
        description: 'A comprehensive overview of Ethiopia\'s rich cultural heritage',
        instructor: staffMember._id,
        category: 'heritage',
        scheduledAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next week
        duration: 60,
        maxParticipants: 100,
        status: 'scheduled',
        materials: [
          { name: 'Heritage Overview PDF', type: 'pdf', url: '/uploads/materials/heritage-overview.pdf' },
          { name: 'Ethiopian Timeline', type: 'image', url: '/uploads/materials/timeline.jpg' }
        ],
        tags: ['overview', 'beginner', 'culture'],
        language: 'english',
        isRecorded: true,
        chatEnabled: true,
        requiresRegistration: true
      },
      {
        title: 'Virtual Tour: Rock Churches of Lalibela',
        description: 'Take a virtual journey through the famous rock-hewn churches',
        instructor: staffMember._id,
        category: 'guided-tour',
        scheduledAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        duration: 90,
        maxParticipants: 75,
        status: 'scheduled',
        tags: ['lalibela', 'architecture', 'virtual-tour'],
        language: 'english',
        isRecorded: true
      },
      {
        title: 'Ethiopian Coffee Ceremony Workshop',
        description: 'Learn the traditional Ethiopian coffee ceremony',
        instructor: staffMember._id,
        category: 'workshop',
        scheduledAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        duration: 120,
        maxParticipants: 30,
        status: 'scheduled',
        tags: ['coffee', 'ceremony', 'hands-on'],
        language: 'english',
        isRecorded: false,
        chatEnabled: true
      }
    ];

    await LiveSession.insertMany(liveSessions);
    console.log(`✅ Created ${liveSessions.length} live sessions`);

    // 7. Create Sample Enrollments for Visitor
    console.log('📚 Creating Sample Enrollments...');
    const courses = await Course.find().limit(3);
    if (courses.length > 0) {
      const enrollments = courses.map((course, index) => ({
        student: visitor._id,
        course: course._id,
        status: index === 0 ? 'completed' : index === 1 ? 'in-progress' : 'enrolled',
        progress: {
          completedLessons: index === 0 ? 10 : index === 1 ? 5 : 0,
          totalLessons: 10,
          percentComplete: index === 0 ? 100 : index === 1 ? 50 : 0,
          lastAccessedDate: new Date()
        },
        studyTime: index === 0 ? 300 : index === 1 ? 150 : 0,
        enrollmentDate: new Date(Date.now() - (30 - index * 10) * 24 * 60 * 60 * 1000)
      }));

      await Enrollment.insertMany(enrollments);
      console.log(`✅ Created ${enrollments.length} enrollments`);
    }

    // 8. Create Quiz Attempts for Visitor
    console.log('🎯 Creating Quiz Attempts...');
    const quizAttempts = createdQuizzes.slice(0, 2).map((quiz, index) => ({
      user: visitor._id,
      quiz: quiz._id,
      answers: [
        { questionId: quiz.questions[0]._id, answer: 0, timeSpent: 25 }, // Correct answer
        { questionId: quiz.questions[1]._id, answer: 1, timeSpent: 30 }, // Correct answer
      ],
      score: quiz.questions.length * 10,
      totalPoints: quiz.questions.length * 10,
      percentage: 100,
      passed: true,
      startedAt: new Date(Date.now() - 60 * 60 * 1000),
      submittedAt: new Date(Date.now() - 30 * 60 * 1000),
      timeSpent: 120,
      status: 'submitted',
      attemptNumber: 1
    }));

    await QuizAttempt.insertMany(quizAttempts);
    console.log(`✅ Created ${quizAttempts.length} quiz attempts`);

    // 9. Create Bookmarks for Visitor
    console.log('🔖 Creating Bookmarks...');
    const museums = await Museum.find().limit(3);
    const artifacts = await Artifact.find().limit(2);

    const bookmarks = [
      ...museums.map((museum, index) => ({
        user: visitor._id,
        resourceType: 'museum',
        resourceId: museum._id,
        title: museum.name,
        description: museum.description,
        imageUrl: museum.images?.[0],
        url: `/museums/${museum._id}`,
        category: 'heritage',
        tags: ['museum', 'visit'],
        notes: `Want to visit this ${museum.name} soon!`,
        folder: 'Must Visit',
        priority: index + 3,
        lastAccessed: new Date(Date.now() - index * 24 * 60 * 60 * 1000)
      })),
      ...artifacts.map((artifact, index) => ({
        user: visitor._id,
        resourceType: 'artifact',
        resourceId: artifact._id,
        title: artifact.name,
        description: artifact.description,
        imageUrl: artifact.images?.[0],
        url: `/artifacts/${artifact._id}`,
        category: 'artifacts',
        tags: ['artifact', 'study'],
        notes: `Fascinating ${artifact.name} from ${artifact.period}`,
        folder: 'Study Collection',
        priority: 4 + index
      })),
      ...createdQuizzes.slice(0, 2).map((quiz, index) => ({
        user: visitor._id,
        resourceType: 'quiz',
        resourceId: quiz._id,
        title: quiz.title,
        description: quiz.description,
        url: `/quizzes/${quiz._id}`,
        category: quiz.category,
        tags: ['quiz', 'learning'],
        notes: 'Great quiz for testing knowledge',
        folder: 'Learning Resources',
        priority: 3
      }))
    ];

    await Bookmark.insertMany(bookmarks);
    console.log(`✅ Created ${bookmarks.length} bookmarks`);

    // 10. Create User Notes
    console.log('📝 Creating User Notes...');
    const userNotes = [
      {
        user: visitor._id,
        title: 'Ethiopian Calendar System',
        content: 'The Ethiopian calendar has 13 months:\n- 12 months of 30 days each\n- 1 month (Pagumē) with 5 or 6 days\n- New Year starts on September 11 (Gregorian)\n- Currently 7-8 years behind Gregorian calendar',
        category: 'culture',
        tags: ['calendar', 'time', 'culture'],
        folder: 'Cultural Studies',
        priority: 5,
        isPinned: true,
        wordCount: 45
      },
      {
        user: visitor._id,
        title: 'Lalibela Churches Architecture',
        content: 'The 11 medieval monolithic cave churches of Lalibela:\n1. House of St. George (Bet Giyorgis) - most famous\n2. House of St. Mary (Bet Maryam)\n3. House of the Saviour of the World (Bet Madhane Alem)\n\nCarved directly into solid volcanic rock in the 12th century.',
        category: 'heritage',
        tags: ['lalibela', 'architecture', 'churches'],
        relatedResource: {
          type: 'museum',
          title: 'Rock Churches Virtual Tour'
        },
        folder: 'Architecture Notes',
        priority: 4,
        wordCount: 52
      },
      {
        user: visitor._id,
        title: 'Coffee Ceremony Steps',
        content: '1. Wash green coffee beans\n2. Roast beans over charcoal\n3. Grind beans by hand\n4. Brew in traditional pot (jebena)\n5. Serve in small cups\n6. Three rounds: Abol, Tona, Baraka',
        category: 'culture',
        tags: ['coffee', 'ceremony', 'tradition'],
        folder: 'Cultural Practices',
        priority: 3,
        reminderDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        wordCount: 38
      }
    ];

    await UserNote.insertMany(userNotes);
    console.log(`✅ Created ${userNotes.length} user notes`);

    // 11. Create Forum Topics
    console.log('💬 Creating Forum Topics...');
    const forumTopics = [
      {
        title: 'Best Ethiopian Heritage Sites to Visit',
        description: 'Share your recommendations for must-visit heritage sites in Ethiopia',
        category: 'heritage-discussion',
        author: visitor._id,
        tags: ['travel', 'heritage', 'recommendations'],
        posts: [
          {
            author: visitor._id,
            content: 'I\'ve been exploring Ethiopian heritage and would love to hear about your favorite sites! I\'m particularly interested in Lalibela and Gondar.',
            likes: []
          }
        ],
        views: 45,
        lastActivity: new Date()
      },
      {
        title: 'Ethiopian Coffee vs Other Coffee Cultures',
        description: 'Discussion about Ethiopian coffee traditions compared to other cultures',
        category: 'culture',
        author: visitor._id,
        tags: ['coffee', 'culture', 'comparison'],
        posts: [
          {
            author: visitor._id,
            content: 'Having experienced the Ethiopian coffee ceremony, I\'m curious how it compares to coffee cultures in other countries. What are your thoughts?',
            likes: []
          }
        ],
        views: 23
      },
      {
        title: 'Learning Amharic - Tips and Resources',
        description: 'Share resources and tips for learning Amharic language',
        category: 'learning-help',
        author: visitor._id,
        tags: ['language', 'amharic', 'learning'],
        posts: [
          {
            author: visitor._id,
            content: 'I\'m starting to learn Amharic and would appreciate any recommendations for good resources, apps, or learning strategies!',
            likes: []
          }
        ],
        views: 67,
        isPinned: false
      }
    ];

    await ForumTopic.insertMany(forumTopics);
    console.log(`✅ Created ${forumTopics.length} forum topics`);

    // 12. Create Study Groups
    console.log('👥 Creating Study Groups...');
    const studyGroups = [
      {
        name: 'Ethiopian Heritage Enthusiasts',
        description: 'A group for people passionate about Ethiopian heritage and culture',
        creator: visitor._id,
        category: 'heritage',
        tags: ['heritage', 'culture', 'history'],
        maxMembers: 50,
        isPrivate: false,
        requiresApproval: false,
        members: [{ user: visitor._id, role: 'owner' }],
        settings: {
          allowInvites: true,
          allowFileSharing: true,
          enableNotifications: true
        },
        discussions: [
          {
            title: 'Welcome to our Heritage Group!',
            content: 'Let\'s share our knowledge and learn together about Ethiopia\'s rich heritage',
            author: visitor._id,
            replies: []
          }
        ]
      },
      {
        name: 'Lalibela Architecture Study Circle',
        description: 'Deep dive into the architecture and history of Lalibela churches',
        creator: visitor._id,
        category: 'heritage',
        tags: ['lalibela', 'architecture', 'churches'],
        maxMembers: 25,
        isPrivate: false,
        members: [{ user: visitor._id, role: 'owner' }],
        resources: [
          {
            title: 'Lalibela Architecture Guide',
            type: 'document',
            url: '/uploads/resources/lalibela-guide.pdf',
            description: 'Comprehensive guide to Lalibela church architecture',
            addedBy: visitor._id
          }
        ]
      }
    ];

    await StudyGroup.insertMany(studyGroups);
    console.log(`✅ Created ${studyGroups.length} study groups`);

    // 13. Create User Goals
    console.log('🎯 Creating User Goals...');
    const userGoals = [
      {
        user: visitor._id,
        title: 'Complete 5 Heritage Courses',
        description: 'Finish 5 comprehensive courses about Ethiopian heritage by end of year',
        category: 'course-completion',
        type: 'yearly',
        target: 5,
        current: 1, // One completed enrollment
        unit: 'courses',
        targetDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        priority: 'high',
        tags: ['learning', 'heritage', 'courses'],
        notes: 'Focusing on heritage and cultural courses',
        isPublic: true,
        progress: 20,
        milestones: [
          { title: 'First Course Complete', target: 1, isCompleted: true, completedAt: new Date() },
          { title: 'Halfway Point', target: 3, isCompleted: false },
          { title: 'Almost There', target: 4, isCompleted: false }
        ]
      },
      {
        user: visitor._id,
        title: 'Visit 10 Museums Virtually',
        description: 'Explore 10 different Ethiopian museums through virtual tours',
        category: 'exploration',
        type: 'monthly',
        target: 10,
        current: 3,
        unit: 'museums-visited',
        targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        priority: 'medium',
        tags: ['museums', 'exploration'],
        isPublic: true,
        progress: 30
      },
      {
        user: visitor._id,
        title: 'Daily Learning Streak',
        description: 'Maintain a 30-day learning streak',
        category: 'habit',
        type: 'daily',
        target: 30,
        current: 7,
        unit: 'days',
        targetDate: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000),
        priority: 'high',
        tags: ['consistency', 'daily'],
        isPublic: false,
        progress: 23,
        streakCount: 7,
        reminders: {
          enabled: true,
          frequency: 'daily',
          nextDue: new Date(Date.now() + 24 * 60 * 60 * 1000)
        }
      }
    ];

    await UserGoal.insertMany(userGoals);
    console.log(`✅ Created ${userGoals.length} user goals`);

    // 14. Create Achievements
    console.log('🏆 Creating Achievements...');
    const achievements = [
      {
        title: 'First Steps',
        description: 'Complete your first heritage course',
        icon: '🎓',
        category: 'learning',
        points: 100,
        requirements: {
          type: 'course-completion',
          target: 1
        },
        rarity: 'common',
        isActive: true
      },
      {
        title: 'Quiz Master',
        description: 'Score 100% on 5 different quizzes',
        icon: '🧠',
        category: 'learning',
        points: 250,
        requirements: {
          type: 'perfect-quiz-scores',
          target: 5
        },
        rarity: 'rare',
        isActive: true
      },
      {
        title: 'Explorer',
        description: 'Visit 25 different heritage sites or museums',
        icon: '🗺️',
        category: 'exploration',
        points: 300,
        requirements: {
          type: 'site-visits',
          target: 25
        },
        rarity: 'rare',
        isActive: true
      },
      {
        title: 'Community Builder',
        description: 'Create a study group with 10+ members',
        icon: '👥',
        category: 'social',
        points: 200,
        requirements: {
          type: 'group-creation',
          target: 10
        },
        rarity: 'uncommon',
        isActive: true
      },
      {
        title: 'Heritage Scholar',
        description: 'Complete all heritage-related courses',
        icon: '📚',
        category: 'milestone',
        points: 1000,
        requirements: {
          type: 'heritage-mastery',
          target: 1
        },
        rarity: 'legendary',
        isActive: true
      }
    ];

    await Achievement.insertMany(achievements);
    console.log(`✅ Created ${achievements.length} achievements`);

    // 15. Update/Create Visitor Profile with Progress
    console.log('👤 Creating/Updating Visitor Profile...');
    const visitorProfile = await VisitorProfile.findOneAndUpdate(
      { visitor: visitor._id },
      {
        visitor: visitor._id,
        totalPoints: 350, // From completed quiz and course
        level: 2,
        totalMuseumsVisited: 3,
        totalArtifactsViewed: 15,
        totalCoursesCompleted: 1,
        totalQuizzesTaken: 2,
        averageQuizScore: 100,
        totalStudyHours: 5.0,
        achievements: [
          { 
            achievement: achievements[0]._id, // First Steps achievement
            earnedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
          }
        ],
        streak: {
          current: 7,
          longest: 7,
          lastActivity: new Date()
        },
        preferences: {
          favoriteCategories: ['heritage', 'history', 'culture'],
          preferredLanguage: 'english',
          emailNotifications: true,
          mobilePush: true
        }
      },
      { upsert: true, new: true }
    );

    // 16. Create Activity Log
    console.log('📊 Creating Activity Log...');
    const activities = [
      {
        visitor: visitor._id,
        type: 'course-completion',
        description: 'Completed course: Introduction to Ethiopian Heritage',
        pointsEarned: 100,
        relatedResource: {
          type: 'course',
          id: courses[0]?._id,
          title: courses[0]?.title
        },
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      },
      {
        visitor: visitor._id,
        type: 'quiz-completion',
        description: 'Scored 100% on Ethiopian Heritage Foundations quiz',
        pointsEarned: 50,
        relatedResource: {
          type: 'quiz',
          id: createdQuizzes[0]._id,
          title: createdQuizzes[0].title
        },
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      },
      {
        visitor: visitor._id,
        type: 'achievement-earned',
        description: 'Earned "First Steps" achievement',
        pointsEarned: 100,
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      },
      {
        visitor: visitor._id,
        type: 'museum-visit',
        description: 'Visited National Museum virtually',
        pointsEarned: 25,
        relatedResource: {
          type: 'museum',
          id: museums[0]?._id,
          title: museums[0]?.name
        },
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        visitor: visitor._id,
        type: 'goal-progress',
        description: 'Made progress on heritage courses goal',
        pointsEarned: 10,
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      }
    ];

    await VisitorActivity.insertMany(activities);
    console.log(`✅ Created ${activities.length} activity entries`);

    // 17. Create Favorites
    console.log('❤️ Creating Favorites...');
    const favorites = {
      visitor: visitor._id,
      museums: museums.slice(0, 2).map(museum => ({
        museum: museum._id,
        notes: `Love the ${museum.name} collection!`,
        addedAt: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000)
      })),
      artifacts: artifacts.map(artifact => ({
        artifact: artifact._id,
        notes: `Fascinating ${artifact.name}`,
        addedAt: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000)
      })),
      courses: courses.slice(0, 1).map(course => ({
        course: course._id,
        notes: 'Excellent course content',
        addedAt: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000)
      })),
      events: [],
      tours: []
    };

    await VisitorFavorites.findOneAndUpdate(
      { visitor: visitor._id },
      favorites,
      { upsert: true, new: true }
    );

    console.log('✅ Created favorites collection');

    console.log('\n🎉 COMPREHENSIVE SEEDING COMPLETED! 🎉');
    console.log('\n📈 Summary of Created Data:');
    console.log(`👑 Super Admin: superadmin@heritage360.et (password: SuperAdmin123!)`);
    console.log(`👤 Sample Visitor: visitor@heritage360.et (password: Visitor123!)`);
    console.log(`👥 Staff Member: staff@heritage360.et (password: Staff123!)`);
    console.log(`🧠 Quizzes: ${createdQuizzes.length} (created by Super Admin)`);
    console.log(`💭 Flashcards: ${flashcards.length} (created by Super Admin)`);
    console.log(`📺 Live Sessions: ${liveSessions.length} (created by Staff)`);
    console.log(`📚 Enrollments: Sample enrollments for visitor`);
    console.log(`🔖 Bookmarks: ${bookmarks.length} bookmarks`);
    console.log(`📝 Notes: ${userNotes.length} personal notes`);
    console.log(`💬 Forum Topics: ${forumTopics.length} discussion topics`);
    console.log(`👥 Study Groups: ${studyGroups.length} collaborative groups`);
    console.log(`🎯 Goals: ${userGoals.length} learning goals`);
    console.log(`🏆 Achievements: ${achievements.length} available achievements`);
    console.log(`📊 Activities: ${activities.length} activity log entries`);
    console.log(`❤️ Favorites: Complete favorites collection`);

    console.log('\n🚀 Ready to test the visitor dashboard!');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    mongoose.connection.close();
  }
};

// Run the seeder if called directly
if (require.main === module) {
  seedComprehensiveFeatures()
    .then(() => {
      console.log('✅ Seeding completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedComprehensiveFeatures };
