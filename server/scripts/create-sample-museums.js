const mongoose = require('mongoose');
const Museum = require('../models/Museum');
const User = require('../models/User');

// Sample museums data with correct schema
const sampleMuseums = [
  {
    name: "National Museum of Ethiopia",
    description: "The National Museum of Ethiopia houses the famous Lucy skeleton and other important archaeological finds.",
    location: {
      type: "Point",
      coordinates: [38.7525, 9.0192], // [longitude, latitude] for GeoJSON
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
      phone: "+251-11-123-4568",
      website: "https://ethnologicalmuseum.et"
    },
    operatingHours: {
      monday: { open: "08:00", close: "18:00", closed: false },
      tuesday: { open: "08:00", close: "18:00", closed: false },
      wednesday: { open: "08:00", close: "18:00", closed: false },
      thursday: { open: "08:00", close: "18:00", closed: false },
      friday: { open: "08:00", close: "18:00", closed: false },
      saturday: { open: "08:00", close: "18:00", closed: false },
      sunday: { open: "08:00", close: "18:00", closed: true }
    },
    admissionFees: {
      adult: 30,
      student: 15,
      child: 10,
      senior: 20
    },
    facilities: ["Library", "Research Center", "Gift Shop", "Wheelchair Access"],
    status: "approved",
    verified: true,
    isActive: true,
    featured: false
  },
  {
    name: "Aksum Heritage Museum",
    description: "Dedicated to the ancient Aksumite civilization and its artifacts.",
    location: {
      type: "Point",
      coordinates: [38.7234, 14.1214],
      address: "Aksum Town Center",
      city: "Aksum",
      region: "Tigray"
    },
    contactInfo: {
      email: "info@aksumheritage.et",
      phone: "+251-34-123-4567",
      website: "https://aksumheritage.et"
    },
    operatingHours: {
      monday: { open: "09:00", close: "16:00", closed: false },
      tuesday: { open: "09:00", close: "16:00", closed: false },
      wednesday: { open: "09:00", close: "16:00", closed: false },
      thursday: { open: "09:00", close: "16:00", closed: false },
      friday: { open: "09:00", close: "16:00", closed: false },
      saturday: { open: "09:00", close: "16:00", closed: false },
      sunday: { open: "09:00", close: "16:00", closed: true }
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
  },
  {
    name: "Lalibela Rock-Hewn Churches Museum",
    description: "Museum showcasing the famous rock-hewn churches of Lalibela.",
    location: {
      type: "Point",
      coordinates: [39.0417, 12.0317],
      address: "Lalibela Town",
      city: "Lalibela",
      region: "Amhara"
    },
    contactInfo: {
      email: "info@lalibelamuseum.et",
      phone: "+251-33-123-4567",
      website: "https://lalibelamuseum.et"
    },
    operatingHours: {
      monday: { open: "08:00", close: "17:00", closed: false },
      tuesday: { open: "08:00", close: "17:00", closed: false },
      wednesday: { open: "08:00", close: "17:00", closed: false },
      thursday: { open: "08:00", close: "17:00", closed: false },
      friday: { open: "08:00", close: "17:00", closed: false },
      saturday: { open: "08:00", close: "17:00", closed: false },
      sunday: { open: "08:00", close: "17:00", closed: false }
    },
    admissionFees: {
      adult: 60,
      student: 30,
      child: 20,
      senior: 40
    },
    facilities: ["Parking", "Gift Shop", "Religious Tours", "Photography Permits"],
    status: "approved",
    verified: true,
    isActive: true,
    featured: true
  },
  {
    name: "Harar Heritage Museum",
    description: "Preserving the rich cultural heritage of Harar, the walled city.",
    location: {
      type: "Point",
      coordinates: [42.1258, 9.3097],
      address: "Harar City Center",
      city: "Harar",
      region: "Harari"
    },
    contactInfo: {
      email: "info@hararheritage.et",
      phone: "+251-25-123-4567",
      website: "https://hararheritage.et"
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
      adult: 35,
      student: 18,
      child: 12,
      senior: 25
    },
    facilities: ["Parking", "Cultural Tours", "Traditional Crafts", "Wheelchair Access"],
    status: "approved",
    verified: true,
    isActive: true,
    featured: false
  }
];

async function createSampleMuseums() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/ethioheritage360');
    console.log('✅ Connected to MongoDB');

    // Find a super admin user to assign as admin
    const superAdmin = await User.findOne({ role: 'superAdmin' });
    if (!superAdmin) {
      console.log('❌ No super admin found. Please create a super admin user first.');
      return;
    }

    // Create sample museums
    const createdMuseums = [];
    for (const museumData of sampleMuseums) {
      const museum = new Museum({
        ...museumData,
        admin: superAdmin._id,
        createdBy: superAdmin._id
      });

      const savedMuseum = await museum.save();
      createdMuseums.push(savedMuseum);
      console.log(`✅ Created museum: ${savedMuseum.name}`);
    }

    console.log(`\n🎉 Successfully created ${createdMuseums.length} sample museums!`);
    console.log('\n📋 Created museums:');
    createdMuseums.forEach((museum, index) => {
      console.log(`${index + 1}. ${museum.name} (${museum.location.city}, ${museum.location.region})`);
    });

  } catch (error) {
    console.error('❌ Error creating sample museums:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the script
createSampleMuseums();