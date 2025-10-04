const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Museum = require('../models/Museum');
const Artifact = require('../models/Artifact');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB Atlas');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Sample museums data
const sampleMuseums = [
  {
    name: "National Museum of Ethiopia",
    description: "The National Museum of Ethiopia houses the famous Lucy skeleton and other important archaeological finds.",
    location: {
      type: "Point",
      coordinates: [38.7525, 9.0192],
      address: "King George VI Street, Addis Ababa",
      city: "Addis Ababa",
      region: "Addis Ababa"
    },
    contactInfo: {
      email: "info@nationalmuseum.et",
      phone: "+251-11-123-4567",
      website: "https://nationalmuseum.et"
    },
    operatingHours: {
      monday: { open: "09:00", close: "17:00", closed: false },
      tuesday: { open: "09:00", close: "17:00", closed: false },
      wednesday: { open: "09:00", close: "17:00", closed: false },
      thursday: { open: "09:00", close: "17:00", closed: false },
      friday: { open: "09:00", close: "17:00", closed: false },
      saturday: { open: "09:00", close: "17:00", closed: false },
      sunday: { open: "09:00", close: "17:00", closed: true }
    },
    admissionFees: {
      adult: 50,
      student: 25,
      child: 15,
      senior: 30
    },
    facilities: ["Parking", "Gift Shop", "Cafeteria", "Wheelchair Access", "Guided Tours"],
    status: "approved",
    verified: true,
    isActive: true,
    featured: true
  },
  {
    name: "Ethnological Museum",
    description: "Located at Addis Ababa University, showcasing Ethiopian culture and traditions.",
    location: {
      type: "Point",
      coordinates: [38.7600, 9.0400],
      address: "Addis Ababa University, Sidist Kilo",
      city: "Addis Ababa",
      region: "Addis Ababa"
    },
    contactInfo: {
      email: "info@ethnologicalmuseum.et",
      phone: "+251-11-234-5678",
      website: "https://ethnologicalmuseum.et"
    },
    operatingHours: {
      monday: { open: "08:00", close: "16:00", closed: false },
      tuesday: { open: "08:00", close: "16:00", closed: false },
      wednesday: { open: "08:00", close: "16:00", closed: false },
      thursday: { open: "08:00", close: "16:00", closed: false },
      friday: { open: "08:00", close: "16:00", closed: false },
      saturday: { open: "08:00", close: "16:00", closed: false },
      sunday: { open: "08:00", close: "16:00", closed: true }
    },
    admissionFees: {
      adult: 30,
      student: 15,
      child: 10,
      senior: 20
    },
    facilities: ["Parking", "Library", "Research Center", "Wheelchair Access"],
    status: "approved",
    verified: true,
    isActive: true,
    featured: false
  },
  {
    name: "Aksum Museum",
    description: "Museum dedicated to the ancient Aksumite civilization and its artifacts.",
    location: {
      type: "Point",
      coordinates: [38.7200, 14.1300],
      address: "Aksum, Tigray Region",
      city: "Aksum",
      region: "Tigray"
    },
    contactInfo: {
      email: "info@aksummuseum.et",
      phone: "+251-34-123-4567",
      website: "https://aksummuseum.et"
    },
    operatingHours: {
      monday: { open: "09:00", close: "17:00", closed: false },
      tuesday: { open: "09:00", close: "17:00", closed: false },
      wednesday: { open: "09:00", close: "17:00", closed: false },
      thursday: { open: "09:00", close: "17:00", closed: false },
      friday: { open: "09:00", close: "17:00", closed: false },
      saturday: { open: "09:00", close: "17:00", closed: false },
      sunday: { open: "09:00", close: "17:00", closed: true }
    },
    admissionFees: {
      adult: 40,
      student: 20,
      child: 12,
      senior: 25
    },
    facilities: ["Parking", "Gift Shop", "Guided Tours", "Archaeological Site Access"],
    status: "approved",
    verified: true,
    isActive: true,
    featured: true
  }
];

// Sample artifacts data
const sampleArtifacts = [
  {
    name: "Lucy (Australopithecus afarensis)",
    description: "The famous 3.2 million-year-old fossil skeleton of an early human ancestor.",
    category: "other", // Changed from "fossils" to valid enum
    period: {
      era: "prehistoric",
      startYear: 1974 // Discovery year
      // endYear: removed to avoid validation issues
    },
    origin: {
      region: "Afar Region",
      specificLocation: "Hadar, Ethiopia"
    },
    status: "on_display",
    condition: "excellent",
    featured: true,
    isActive: true,
    accessionNumber: "NME-001-LUCY"
  },
  {
    name: "Aksumite Stelae",
    description: "Ancient obelisks from the Aksumite Kingdom, carved from single pieces of granite.",
    category: "sculptures",
    period: {
      era: "ancient",
      startYear: 100,
      dynasty: "Aksumite Kingdom"
    },
    origin: {
      region: "Tigray Region",
      specificLocation: "Aksum, Ethiopia"
    },
    status: "on_display",
    condition: "good",
    featured: true,
    isActive: true,
    accessionNumber: "AKM-001-STELAE"
  },
  {
    name: "Ethiopian Cross",
    description: "Traditional Ethiopian Orthodox Christian cross with intricate metalwork.",
    category: "religious-items",
    period: {
      era: "medieval",
      startYear: 1200
    },
    origin: {
      region: "Amhara Region",
      specificLocation: "Lalibela, Ethiopia"
    },
    status: "on_display",
    condition: "excellent",
    featured: false,
    isActive: true,
    accessionNumber: "ETH-001-CROSS"
  },
  {
    name: "Traditional Coffee Ceremony Set",
    description: "Complete set of traditional Ethiopian coffee ceremony equipment.",
    category: "household-items",
    period: {
      era: "contemporary",
      startYear: 1900
    },
    origin: {
      region: "Oromia Region",
      specificLocation: "Harar, Ethiopia"
    },
    status: "in_storage",
    condition: "good",
    featured: false,
    isActive: true,
    accessionNumber: "COF-001-SET"
  },
  {
    name: "Aksumite Coins",
    description: "Ancient gold and silver coins from the Aksumite Kingdom.",
    category: "coins",
    period: {
      era: "ancient",
      startYear: 200,
      dynasty: "Aksumite Kingdom"
    },
    origin: {
      region: "Tigray Region",
      specificLocation: "Aksum, Ethiopia"
    },
    status: "on_display",
    condition: "excellent",
    featured: true,
    isActive: true,
    accessionNumber: "AKM-002-COINS"
  }
];

// Admin users data
const adminUsers = [
  {
    name: "Super Admin",
    email: "admin@ethioheritage360.com",
    password: "admin123",
    role: "superAdmin",
    isActive: true,
    isVerified: true
  },
  {
    name: "Museum Admin",
    email: "museum.admin@ethioheritage360.com",
    password: "museum123",
    role: "museumAdmin",
    isActive: true,
    isVerified: true
  }
];

const seedDatabase = async () => {
  try {
    console.log('🔄 Starting complete database seeding...\n');

    // 1. Create admin users first
    console.log('👥 Creating admin users...');
    const createdAdmins = [];
    for (const userData of adminUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        const user = new User(userData);
        await user.save();
        createdAdmins.push(user);
        console.log(`✅ Created user: ${user.name} (${user.email}) - Role: ${user.role}`);
      } else {
        createdAdmins.push(existingUser);
        console.log(`📊 User already exists: ${userData.email}`);
      }
    }

    // 2. Create museums with admin reference
    console.log('🏛️ Creating museums...');
    const createdMuseums = [];
    for (let i = 0; i < sampleMuseums.length; i++) {
      const museumData = sampleMuseums[i];
      const existingMuseum = await Museum.findOne({ name: museumData.name });

      if (!existingMuseum) {
        // Assign admin to museum (cycle through available admins)
        museumData.admin = createdAdmins[i % createdAdmins.length]._id;

        const museum = new Museum(museumData);
        await museum.save();
        createdMuseums.push(museum);
        console.log(`✅ Created museum: ${museum.name}`);
      } else {
        createdMuseums.push(existingMuseum);
        console.log(`📊 Museum already exists: ${museumData.name}`);
      }
    }

    // 3. Create artifacts and link to museums
    console.log('\n🏺 Creating artifacts...');
    for (let i = 0; i < sampleArtifacts.length; i++) {
      const artifactData = sampleArtifacts[i];
      const existingArtifact = await Artifact.findOne({ name: artifactData.name });

      if (!existingArtifact) {
        // Link artifact to appropriate museum
        if (artifactData.name.includes('Lucy') || artifactData.name.includes('Ethiopian Cross')) {
          artifactData.museum = createdMuseums[0]._id; // National Museum
        } else if (artifactData.name.includes('Coffee') || artifactData.name.includes('Traditional')) {
          artifactData.museum = createdMuseums[1]._id; // Ethnological Museum
        } else {
          artifactData.museum = createdMuseums[2]._id; // Aksum Museum
        }

        // Assign createdBy to an admin user
        artifactData.createdBy = createdAdmins[0]._id;

        const artifact = new Artifact(artifactData);
        await artifact.save();
        console.log(`✅ Created artifact: ${artifact.name}`);
      } else {
        console.log(`📊 Artifact already exists: ${artifactData.name}`);
      }
    }

    // 4. Summary
    console.log('\n📊 Database Seeding Summary:');
    console.log(`   - Museums: ${await Museum.countDocuments()}`);
    console.log(`   - Artifacts: ${await Artifact.countDocuments()}`);
    console.log(`   - Users: ${await User.countDocuments()}`);

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n🔑 Login Credentials:');
    console.log('   Super Admin: admin@ethioheritage360.com / admin123');
    console.log('   Museum Admin: museum.admin@ethioheritage360.com / museum123');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

// Run the seeding function
connectDB().then(() => {
  seedDatabase();
});

