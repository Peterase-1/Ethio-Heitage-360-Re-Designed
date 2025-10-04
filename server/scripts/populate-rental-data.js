const mongoose = require('mongoose');
const Museum = require('../models/Museum');
const Artifact = require('../models/Artifact');
const User = require('../models/User');

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
    category: "fossils",
    period: "prehistoric",
    material: "fossilized bone",
    origin: "Hadar, Ethiopia",
    status: "on_display",
    condition: "excellent",
    location: "National Museum of Ethiopia",
    featured: true,
    isActive: true
  },
  {
    name: "Aksumite Stelae",
    description: "Ancient obelisks from the Aksumite Kingdom, carved from single pieces of granite.",
    category: "sculptures",
    period: "ancient",
    material: "granite",
    origin: "Aksum, Ethiopia",
    status: "on_display",
    condition: "good",
    location: "Aksum Museum",
    featured: true,
    isActive: true
  },
  {
    name: "Ethiopian Cross",
    description: "Traditional Ethiopian Orthodox Christian cross with intricate metalwork.",
    category: "religious_artifacts",
    period: "medieval",
    material: "gold and silver",
    origin: "Ethiopia",
    status: "on_display",
    condition: "excellent",
    location: "Ethnological Museum",
    featured: false,
    isActive: true
  },
  {
    name: "Traditional Coffee Ceremony Set",
    description: "Complete set of traditional Ethiopian coffee ceremony equipment.",
    category: "cultural_artifacts",
    period: "traditional",
    material: "clay and wood",
    origin: "Ethiopia",
    status: "in_storage",
    condition: "good",
    location: "Ethnological Museum",
    featured: false,
    isActive: true
  },
  {
    name: "Aksumite Coins",
    description: "Ancient gold and silver coins from the Aksumite Kingdom.",
    category: "numismatics",
    period: "ancient",
    material: "gold and silver",
    origin: "Aksum, Ethiopia",
    status: "on_display",
    condition: "excellent",
    location: "Aksum Museum",
    featured: true,
    isActive: true
  }
];

const populateDatabase = async () => {
  try {
    console.log('🔄 Starting database population...');

    // Check if museums already exist
    const existingMuseums = await Museum.countDocuments();
    if (existingMuseums > 0) {
      console.log(`📊 Found ${existingMuseums} existing museums`);
    } else {
      console.log('🏛️ Creating sample museums...');
      for (const museumData of sampleMuseums) {
        const museum = new Museum(museumData);
        await museum.save();
        console.log(`✅ Created museum: ${museum.name}`);
      }
    }

    // Check if artifacts already exist
    const existingArtifacts = await Artifact.countDocuments();
    if (existingArtifacts > 0) {
      console.log(`📊 Found ${existingArtifacts} existing artifacts`);
    } else {
      console.log('🏺 Creating sample artifacts...');

      // Get museum IDs for artifacts
      const museums = await Museum.find({}, '_id name');
      const museumMap = {};
      museums.forEach(museum => {
        museumMap[museum.name] = museum._id;
      });

      for (const artifactData of sampleArtifacts) {
        // Find the museum for this artifact
        const museum = museums.find(m => m.name.includes(artifactData.location.split(' ')[0]));
        if (museum) {
          artifactData.museum = museum._id;
        }

        const artifact = new Artifact(artifactData);
        await artifact.save();
        console.log(`✅ Created artifact: ${artifact.name}`);
      }
    }

    console.log('✅ Database population completed successfully!');
    console.log('📊 Summary:');
    console.log(`   - Museums: ${await Museum.countDocuments()}`);
    console.log(`   - Artifacts: ${await Artifact.countDocuments()}`);

  } catch (error) {
    console.error('❌ Error populating database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run the script
connectDB().then(() => {
  populateDatabase();
});

