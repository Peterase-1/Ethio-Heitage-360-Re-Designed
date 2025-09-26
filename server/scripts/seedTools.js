const mongoose = require('mongoose');
const Tool = require('../models/Tool');
const colors = require('colors');

// Sample tools data that matches your frontend
const sampleTools = [
  // Educational Tools
  {
    name: 'Interactive Flashcards',
    description: 'Study Ethiopian heritage with spaced repetition flashcards',
    longDescription: 'Master Ethiopian heritage concepts with our scientifically-designed flashcard system. Features spaced repetition algorithms, progress tracking, and multimedia content to help you retain information effectively.',
    category: 'Educational Tools',
    icon: 'FaBook',
    color: 'bg-purple-500',
    path: '/education?section=flashcards',
    available: true,
    featured: true,
    priority: 10,
    difficulty: 'beginner',
    estimatedTime: 15,
    keywords: ['flashcards', 'study', 'heritage', 'spaced repetition', 'learning'],
    requirements: ['Internet connection', 'Modern web browser'],
    features: [
      'Spaced repetition algorithm',
      'Progress tracking',
      'Multiple difficulty levels',
      'Image and audio support',
      'Offline capability'
    ],
    screenshots: [
      {
        url: '/images/screenshots/flashcards-1.jpg',
        caption: 'Flashcard study interface',
        order: 1
      },
      {
        url: '/images/screenshots/flashcards-2.jpg',
        caption: 'Progress tracking dashboard',
        order: 2
      }
    ],
    instructions: [
      {
        step: 1,
        title: 'Choose Your Deck',
        description: 'Select from various Ethiopian heritage topics',
        image: '/images/instructions/flashcards-step1.jpg'
      },
      {
        step: 2,
        title: 'Study and Review',
        description: 'Go through cards at your own pace',
        image: '/images/instructions/flashcards-step2.jpg'
      },
      {
        step: 3,
        title: 'Track Progress',
        description: 'Monitor your learning progress and statistics',
        image: '/images/instructions/flashcards-step3.jpg'
      }
    ],
    metadata: {
      version: '2.1.0',
      tags: ['study', 'flashcards', 'mobile-friendly'],
      platform: ['web', 'mobile'],
      language: ['en', 'am']
    }
  },
  {
    name: 'Practice Quizzes',
    description: 'Test your knowledge with interactive quizzes',
    longDescription: 'Challenge yourself with comprehensive quizzes covering all aspects of Ethiopian heritage. Features multiple question types, detailed explanations, and performance analytics.',
    category: 'Educational Tools',
    icon: 'FaGamepad',
    color: 'bg-green-500',
    path: '/education?section=quizzes',
    available: true,
    featured: true,
    priority: 9,
    difficulty: 'intermediate',
    estimatedTime: 20,
    keywords: ['quiz', 'test', 'assessment', 'heritage', 'knowledge'],
    requirements: ['Internet connection', 'User account (recommended)'],
    features: [
      'Multiple question types',
      'Instant feedback',
      'Performance analytics',
      'Timed and untimed modes',
      'Achievement system'
    ]
  },
  {
    name: 'Educational Games',
    description: 'Learn through fun and engaging games',
    longDescription: 'Make learning fun with our collection of educational games. From word puzzles to matching games, discover Ethiopian heritage through interactive gameplay.',
    category: 'Educational Tools',
    icon: 'FaGamepad',
    color: 'bg-red-500',
    path: '/visitor/games',
    available: true,
    featured: false,
    priority: 7,
    difficulty: 'beginner',
    estimatedTime: 25,
    keywords: ['games', 'fun', 'interactive', 'heritage', 'educational'],
    requirements: ['Modern web browser', 'Audio capability (optional)'],
    features: [
      'Various game types',
      'Progressive difficulty',
      'Leaderboards',
      'Multiplayer options',
      'Rewards system'
    ]
  },

  // Navigation & Geography
  {
    name: 'Heritage Map',
    description: 'Interactive map of Ethiopian heritage sites and museums',
    longDescription: 'Explore Ethiopia\'s rich cultural heritage through our interactive map. Discover historical sites, museums, cultural centers, and hidden gems across the country.',
    category: 'Navigation & Geography',
    icon: 'FaMapMarkerAlt',
    color: 'bg-blue-500',
    path: '/map',
    available: true,
    featured: true,
    priority: 8,
    difficulty: 'beginner',
    estimatedTime: 30,
    keywords: ['map', 'heritage sites', 'museums', 'geography', 'navigation'],
    requirements: ['Internet connection', 'Location access (optional)'],
    features: [
      'Interactive map interface',
      'Detailed site information',
      'Virtual tour integration',
      'GPS navigation support',
      'Offline map download'
    ]
  },

  // Language & Culture
  {
    name: 'Language Guide',
    description: 'Learn basic Amharic phrases and cultural etiquette',
    longDescription: 'Master essential Amharic phrases and understand Ethiopian cultural etiquette. Perfect for visitors and anyone interested in Ethiopian culture.',
    category: 'Language & Culture',
    icon: 'FaLanguage',
    color: 'bg-green-500',
    path: '/visitor/language',
    available: false,
    featured: false,
    priority: 5,
    difficulty: 'beginner',
    estimatedTime: 45,
    keywords: ['amharic', 'language', 'culture', 'phrases', 'etiquette'],
    requirements: ['Audio capability', 'Internet connection'],
    features: [
      'Audio pronunciation',
      'Cultural context',
      'Practice exercises',
      'Common phrases',
      'Writing system basics'
    ]
  },
  {
    name: 'Cultural Calendar',
    description: 'Ethiopian holidays, festivals, and important dates',
    longDescription: 'Stay informed about Ethiopian holidays, religious festivals, cultural celebrations, and important historical dates throughout the year.',
    category: 'Language & Culture',
    icon: 'FaCalendarAlt',
    color: 'bg-purple-500',
    path: '/visitor/cultural-calendar',
    available: false,
    featured: false,
    priority: 6,
    difficulty: 'beginner',
    estimatedTime: 15,
    keywords: ['calendar', 'holidays', 'festivals', 'culture', 'celebrations'],
    requirements: ['Internet connection'],
    features: [
      'Annual calendar view',
      'Event details',
      'Historical context',
      'Notification system',
      'Export to personal calendar'
    ]
  },

  // Utilities & Converters
  {
    name: 'Ethiopian Calendar',
    description: 'Convert between Ethiopian and Gregorian calendars',
    longDescription: 'Easily convert dates between the Ethiopian calendar system and the Gregorian calendar. Includes historical dates and cultural significance.',
    category: 'Utilities & Converters',
    icon: 'FaCalculator',
    color: 'bg-orange-500',
    path: '/visitor/converters',
    available: false,
    featured: false,
    priority: 4,
    difficulty: 'beginner',
    estimatedTime: 5,
    keywords: ['calendar', 'converter', 'dates', 'ethiopian calendar', 'gregorian'],
    requirements: ['Modern web browser'],
    features: [
      'Bi-directional conversion',
      'Historical date support',
      'Cultural significance notes',
      'Offline functionality',
      'API integration'
    ]
  },

  // Mobile & Apps
  {
    name: 'Mobile App',
    description: 'Download our mobile app for on-the-go learning',
    longDescription: 'Take Ethiopian heritage education wherever you go with our comprehensive mobile app. Features offline content, push notifications, and mobile-optimized learning tools.',
    category: 'Mobile & Apps',
    icon: 'FaMobile',
    color: 'bg-pink-500',
    path: '/visitor/mobile',
    available: false,
    featured: false,
    priority: 3,
    difficulty: 'beginner',
    estimatedTime: 10,
    keywords: ['mobile', 'app', 'download', 'offline', 'learning'],
    requirements: ['iOS 12+ or Android 8+', 'Storage space (100MB)'],
    features: [
      'Offline content access',
      'Push notifications',
      'Progress synchronization',
      'Mobile-optimized interface',
      'Location-based features'
    ],
    metadata: {
      version: '1.2.0',
      downloadUrl: 'https://apps.example.com/ethioheritage',
      size: '95MB',
      platform: ['ios', 'android'],
      language: ['en', 'am', 'or']
    }
  }
];

async function seedTools() {
  try {
    console.log('🌱 Starting tools seeding process...'.yellow);

    // Connect to MongoDB
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ethioheritage360');
      console.log('📦 Connected to MongoDB'.green);
    }

    // Clear existing tools (optional - remove in production)
    const existingCount = await Tool.countDocuments();
    console.log(`📊 Found ${existingCount} existing tools`.cyan);

    if (process.argv.includes('--clear')) {
      await Tool.deleteMany({});
      console.log('🗑️ Cleared existing tools'.yellow);
    }

    // Insert sample tools
    const createdTools = [];
    for (const toolData of sampleTools) {
      try {
        // Check if tool already exists
        const existing = await Tool.findOne({ name: toolData.name });
        if (existing) {
          console.log(`⚠️ Tool "${toolData.name}" already exists, skipping...`.yellow);
          continue;
        }

        const tool = new Tool(toolData);
        const savedTool = await tool.save();
        createdTools.push(savedTool);
        console.log(`✅ Created tool: ${savedTool.name}`.green);
      } catch (error) {
        console.error(`❌ Error creating tool "${toolData.name}":`.red, error.message);
      }
    }

    console.log(`\n🎉 Successfully created ${createdTools.length} tools!`.green);
    console.log('\nTools created:'.cyan);
    createdTools.forEach(tool => {
      const status = tool.available ? '✅ Available' : '🚧 Coming Soon';
      const featured = tool.featured ? '⭐ Featured' : '';
      console.log(`  • ${tool.name} (${tool.category}) ${status} ${featured}`.white);
    });

    // Summary statistics
    const totalTools = await Tool.countDocuments();
    const availableTools = await Tool.countDocuments({ available: true });
    const featuredTools = await Tool.countDocuments({ featured: true });

    console.log('\n📊 Database Summary:'.cyan);
    console.log(`  Total tools: ${totalTools}`);
    console.log(`  Available tools: ${availableTools}`);
    console.log(`  Featured tools: ${featuredTools}`);

    // Tools by category
    const categories = await Tool.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    console.log('\n📈 Tools by Category:'.cyan);
    categories.forEach(cat => {
      console.log(`  ${cat._id}: ${cat.count} tools`);
    });

  } catch (error) {
    console.error('❌ Seeding failed:'.red, error);
    process.exit(1);
  }
}

// Run seeding if called directly
if (require.main === module) {
  seedTools()
    .then(() => {
      console.log('\n🏁 Seeding completed successfully!'.green);
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:'.red, error);
      process.exit(1);
    });
}

module.exports = { seedTools, sampleTools };
