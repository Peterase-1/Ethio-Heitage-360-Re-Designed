const mongoose = require('mongoose');
const Course = require('../models/Course');
const User = require('../models/User');
require('dotenv').config();

const sampleOrganizerCourses = [
  {
    title: "Ethiopian Heritage Photography Workshop",
    description: "Learn professional photography techniques specifically for documenting Ethiopian heritage sites, artifacts, and cultural events. Master composition, lighting, and storytelling through imagery.",
    category: "art",
    difficulty: "intermediate",
    estimatedDuration: 480, // 8 hours
    image: "https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=400&h=300&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=200&h=150&fit=crop",
    instructor: "Photographer Solomon Tekalign",
    tags: ["photography", "heritage documentation", "visual storytelling", "cultural preservation"],
    curriculum: [
      "Introduction to Heritage Photography",
      "Equipment and Technical Setup",
      "Composition and Lighting for Artifacts",
      "Documentary Storytelling Techniques",
      "Ethical Considerations in Cultural Photography",
      "Post-Processing for Heritage Documentation"
    ],
    learningOutcomes: [
      "Master technical photography skills for heritage documentation",
      "Develop an eye for composition and lighting in cultural contexts",
      "Understand ethical guidelines for photographing cultural sites",
      "Create compelling visual narratives of Ethiopian heritage"
    ],
    maxStudents: 20,
    price: 2500,
    duration: 6, // weeks
    status: "published",
    isActive: true
  },
  {
    title: "Digital Preservation of Cultural Artifacts",
    description: "Comprehensive course on modern techniques for digitizing, cataloging, and preserving Ethiopian cultural artifacts for future generations using advanced digital technologies.",
    category: "archaeology",
    difficulty: "advanced",
    estimatedDuration: 600, // 10 hours
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=150&fit=crop",
    instructor: "Dr. Meron Tesfaye",
    tags: ["digital preservation", "3D scanning", "database management", "cultural heritage"],
    curriculum: [
      "Introduction to Digital Preservation",
      "3D Scanning Techniques for Artifacts",
      "Digital Photography Standards",
      "Metadata and Cataloging Systems",
      "Database Design for Heritage Collections",
      "Long-term Storage and Access Solutions"
    ],
    learningOutcomes: [
      "Implement professional digital preservation workflows",
      "Use 3D scanning technology for artifact documentation",
      "Design effective metadata schemas for cultural objects",
      "Develop sustainable digital archive systems"
    ],
    maxStudents: 15,
    price: 3200,
    duration: 8, // weeks
    status: "published",
    isActive: true
  },
  {
    title: "Community-Based Heritage Tourism Development",
    description: "Learn how to develop sustainable heritage tourism programs that benefit local communities while preserving Ethiopian cultural sites and traditions.",
    category: "culture",
    difficulty: "intermediate",
    estimatedDuration: 420, // 7 hours
    image: "https://images.unsplash.com/photo-1578761499019-d7c2fcb82c6e?w=400&h=300&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1578761499019-d7c2fcb82c6e?w=200&h=150&fit=crop",
    instructor: "Ato Bekele Mamo",
    tags: ["tourism development", "community engagement", "sustainable practices", "economic development"],
    curriculum: [
      "Principles of Community-Based Tourism",
      "Heritage Site Assessment and Planning",
      "Community Consultation and Engagement",
      "Sustainable Tourism Practices",
      "Marketing and Promotion Strategies",
      "Economic Impact and Benefit Distribution"
    ],
    learningOutcomes: [
      "Design community-centered tourism initiatives",
      "Conduct heritage site assessments",
      "Facilitate community engagement processes",
      "Implement sustainable tourism practices"
    ],
    maxStudents: 25,
    price: 1800,
    duration: 5, // weeks
    status: "published",
    isActive: true
  },
  {
    title: "Ethiopian Traditional Music and Instruments",
    description: "Explore the rich musical heritage of Ethiopia, learning about traditional instruments, scales, and performance practices from different regions and ethnic groups.",
    category: "traditions",
    difficulty: "beginner",
    estimatedDuration: 360, // 6 hours
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=150&fit=crop",
    instructor: "Embet Alemu Aga",
    tags: ["traditional music", "cultural instruments", "ethnomusicology", "performance"],
    curriculum: [
      "Overview of Ethiopian Musical Traditions",
      "Regional Musical Styles and Variations",
      "Traditional Instruments: Krar, Masinko, Washint",
      "Pentatonic Scales and Modal Systems",
      "Vocal Traditions and Singing Styles",
      "Music in Religious and Ceremonial Contexts"
    ],
    learningOutcomes: [
      "Identify different Ethiopian musical traditions",
      "Understand the cultural context of traditional music",
      "Recognize traditional instruments and their sounds",
      "Appreciate the role of music in Ethiopian society"
    ],
    maxStudents: 30,
    price: 1200,
    duration: 4, // weeks
    status: "published",
    isActive: true
  },
  {
    title: "Archaeological Field Methods in Ethiopia",
    description: "Hands-on course covering modern archaeological excavation techniques, artifact analysis, and site documentation methods specific to Ethiopian archaeological contexts.",
    category: "archaeology",
    difficulty: "advanced",
    estimatedDuration: 720, // 12 hours
    image: "https://images.unsplash.com/photo-1571771019784-7c4f2b0b4ea4?w=400&h=300&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1571771019784-7c4f2b0b4ea4?w=200&h=150&fit=crop",
    instructor: "Prof. Alemseged Beldados",
    tags: ["archaeology", "excavation", "fieldwork", "scientific methods"],
    curriculum: [
      "Archaeological Survey Techniques",
      "Excavation Methods and Stratigraphy",
      "Artifact Recording and Analysis",
      "Site Documentation and Mapping",
      "Dating Methods and Chronology",
      "Laboratory Processing and Conservation"
    ],
    learningOutcomes: [
      "Execute professional archaeological excavations",
      "Document and analyze archaeological findings",
      "Use scientific dating methods",
      "Apply conservation principles to artifacts"
    ],
    maxStudents: 12,
    price: 4500,
    duration: 10, // weeks
    status: "published",
    isActive: true
  },
  {
    title: "Cultural Heritage Law and Policy in Ethiopia",
    description: "Comprehensive overview of Ethiopian cultural heritage legislation, international conventions, and policy frameworks governing the protection and management of cultural resources.",
    category: "culture",
    difficulty: "intermediate",
    estimatedDuration: 300, // 5 hours
    image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=200&h=150&fit=crop",
    instructor: "Ato Girma Wolde-Giorgis",
    tags: ["heritage law", "policy", "legislation", "cultural protection"],
    curriculum: [
      "Ethiopian Cultural Heritage Legislation",
      "International Heritage Conventions",
      "World Heritage Site Designation Process",
      "Enforcement and Compliance Issues",
      "Community Rights and Heritage",
      "Contemporary Policy Challenges"
    ],
    learningOutcomes: [
      "Understand Ethiopian heritage law framework",
      "Navigate international heritage conventions",
      "Analyze policy implementation challenges",
      "Advocate for heritage protection"
    ],
    maxStudents: 40,
    price: 900,
    duration: 3, // weeks
    status: "published",
    isActive: true
  }
];

async function addOrganizerCourses() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find a user with organizer role to assign courses to
    let organizer = await User.findOne({ role: 'organizer' });
    
    if (!organizer) {
      // Create a sample organizer if none exists
      console.log('Creating sample organizer user...');
      organizer = new User({
        firstName: 'Heritage',
        lastName: 'Organizer',
        email: 'organizer@heritage.et',
        password: 'password123', // This should be hashed in production
        role: 'organizer',
        isEmailVerified: true
      });
      await organizer.save();
      console.log('Sample organizer created with ID:', organizer._id);
    }

    console.log('Using organizer:', organizer.firstName, organizer.lastName, '(ID:', organizer._id + ')');

    // Clear existing organizer courses
    const existingCount = await Course.countDocuments({ organizerId: organizer._id });
    if (existingCount > 0) {
      await Course.deleteMany({ organizerId: organizer._id });
      console.log(`Deleted ${existingCount} existing organizer courses`);
    }

    // Add organizerId and random enrollment data to sample courses
    const coursesWithOrganizer = sampleOrganizerCourses.map(course => ({
      ...course,
      organizerId: organizer._id,
      createdBy: organizer._id,
      enrollmentCount: Math.floor(Math.random() * (course.maxStudents * 0.8)), // Random enrollment up to 80% capacity
      averageRating: Math.random() * 1.5 + 3.5, // Random rating between 3.5 and 5
      startDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000), // Random start date within next 30 days
      endDate: new Date(Date.now() + (course.duration + Math.random() * 14) * 7 * 24 * 60 * 60 * 1000) // End date based on duration
    }));

    // Insert courses
    const insertedCourses = await Course.insertMany(coursesWithOrganizer);
    console.log(`✅ Added ${insertedCourses.length} organizer courses`);

    // Display summary
    console.log('\n📊 Course Summary:');
    insertedCourses.forEach((course, index) => {
      console.log(`${index + 1}. ${course.title}`);
      console.log(`   - Category: ${course.category}, Difficulty: ${course.difficulty}`);
      console.log(`   - Enrolled: ${course.enrollmentCount}/${course.maxStudents} students`);
      console.log(`   - Rating: ${course.averageRating.toFixed(1)}/5.0`);
      console.log(`   - Price: ${course.price} ETB, Duration: ${course.duration} weeks`);
      console.log('');
    });

    // Verify totals
    const totalCourses = await Course.countDocuments({ organizerId: organizer._id });
    const publishedCourses = await Course.countDocuments({ organizerId: organizer._id, status: 'published' });
    const totalEnrollments = await Course.aggregate([
      { $match: { organizerId: organizer._id } },
      { $group: { _id: null, total: { $sum: '$enrollmentCount' } } }
    ]);

    console.log('🎯 Dashboard Statistics:');
    console.log(`Total Courses: ${totalCourses}`);
    console.log(`Published Courses: ${publishedCourses}`);
    console.log(`Total Student Enrollments: ${totalEnrollments[0]?.total || 0}`);

  } catch (error) {
    console.error('Error adding organizer courses:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
addOrganizerCourses();
