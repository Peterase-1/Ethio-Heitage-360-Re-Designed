const mongoose = require('mongoose');
const VisitorRegistration = require('../models/VisitorRegistration');
const Museum = require('../models/Museum');
const User = require('../models/User');
require('dotenv').config();

// Ethiopian cities and regions
const ethiopianCities = [
  'Addis Ababa', 'Dire Dawa', 'Bahir Dar', 'Gondar', 'Mekelle',
  'Hawassa', 'Jimma', 'Harar', 'Adama', 'Arba Minch',
  'Dessie', 'Sodo', 'Shashamane', 'Jijiga', 'Nekemte'
];

// Ethiopian names (common Ethiopian names)
const ethiopianNames = [
  'Abebe Bekele', 'Alemitu Tesfaye', 'Dawit Assefa', 'Eleni Tadesse', 'Fikadu Mulugeta',
  'Girma Hailu', 'Hirut Lemma', 'Kebede Yohannes', 'Lulit Solomon', 'Meron Abebe',
  'Nebiyu Tadesse', 'Oromia Lemma', 'Rahel Assefa', 'Sisay Bekele', 'Tigist Hailu',
  'Yonas Tadesse', 'Zewditu Lemma', 'Alemayehu Bekele', 'Birtukan Tesfaye', 'Chala Mulugeta'
];

// Ethiopian nationalities and ethnic groups
const ethiopianNationalities = [
  'Ethiopian', 'Ethiopian (Oromo)', 'Ethiopian (Amhara)', 'Ethiopian (Tigray)',
  'Ethiopian (Gurage)', 'Ethiopian (Sidama)', 'Ethiopian (Wolayta)', 'Ethiopian (Afar)',
  'Ethiopian (Somali)', 'Ethiopian (Gamo)', 'Ethiopian (Hadiya)', 'Ethiopian (Kembata)'
];

// Ethiopian phone number formats
const generateEthiopianPhone = () => {
  const prefixes = ['0911', '0922', '0933', '0944', '0955', '0966', '0977', '0988', '0999'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const number = Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
  return `+251${prefix}${number}`;
};

// Ethiopian email domains
const ethiopianEmailDomains = [
  'gmail.com', 'yahoo.com', 'hotmail.com', 'ethionet.et', 'aau.edu.et',
  'ju.edu.et', 'aastu.edu.et', 'addisababa.gov.et', 'ethiopia.gov.et'
];

// Generate Ethiopian email
const generateEthiopianEmail = (name) => {
  const cleanName = name.toLowerCase().replace(/\s+/g, '');
  const domain = ethiopianEmailDomains[Math.floor(Math.random() * ethiopianEmailDomains.length)];
  return `${cleanName}@${domain}`;
};

// Ethiopian visitor types with realistic distribution
const visitorTypes = [
  { type: 'local', weight: 60 },
  { type: 'student', weight: 20 },
  { type: 'researcher', weight: 10 },
  { type: 'tourist', weight: 8 },
  { type: 'international', weight: 2 }
];

// Ethiopian visit purposes
const visitPurposes = [
  'education', 'research', 'cultural', 'tourism', 'family', 'other'
];

// Ethiopian payment methods
const paymentMethods = ['cash', 'card', 'mobile_money', 'free'];

// Generate random visitor type based on weights
const getRandomVisitorType = () => {
  const random = Math.random() * 100;
  let cumulative = 0;
  for (const visitorType of visitorTypes) {
    cumulative += visitorType.weight;
    if (random <= cumulative) {
      return visitorType.type;
    }
  }
  return 'local';
};

// Generate Ethiopian visitor registration data
const generateEthiopianVisitorData = (museumId, registeredById) => {
  const name = ethiopianNames[Math.floor(Math.random() * ethiopianNames.length)];
  const visitorType = getRandomVisitorType();
  const nationality = ethiopianNationalities[Math.floor(Math.random() * ethiopianNationalities.length)];

  // Generate visit date (last 30 days)
  const visitDate = new Date();
  visitDate.setDate(visitDate.getDate() - Math.floor(Math.random() * 30));

  // Generate visit time (museum hours: 8 AM to 6 PM)
  const hour = 8 + Math.floor(Math.random() * 10);
  const minute = Math.floor(Math.random() * 60);
  const visitTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

  // Generate payment amount based on visitor type
  let paymentAmount = 0;
  if (visitorType === 'student') {
    paymentAmount = Math.floor(Math.random() * 50) + 10; // 10-60 ETB
  } else if (visitorType === 'local') {
    paymentAmount = Math.floor(Math.random() * 100) + 50; // 50-150 ETB
  } else if (visitorType === 'international') {
    paymentAmount = Math.floor(Math.random() * 200) + 100; // 100-300 ETB
  } else if (visitorType === 'researcher') {
    paymentAmount = Math.floor(Math.random() * 80) + 20; // 20-100 ETB
  } else {
    paymentAmount = Math.floor(Math.random() * 150) + 30; // 30-180 ETB
  }

  // Free entry for some visitors
  if (Math.random() < 0.1) { // 10% free entry
    paymentAmount = 0;
  }

  const paymentMethod = paymentAmount === 0 ? 'free' :
    paymentMethods[Math.floor(Math.random() * paymentMethods.length)];

  // Generate status based on visit date
  let status = 'registered';
  if (visitDate < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) { // Older than 7 days
    status = Math.random() < 0.8 ? 'checked_out' : 'checked_in';
  } else if (visitDate < new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)) { // Yesterday
    status = Math.random() < 0.6 ? 'checked_out' : 'checked_in';
  } else { // Today
    status = Math.random() < 0.3 ? 'checked_in' : 'registered';
  }

  return {
    visitorInfo: {
      name: name,
      email: generateEthiopianEmail(name),
      phone: generateEthiopianPhone(),
      age: Math.floor(Math.random() * 60) + 18, // 18-78 years
      gender: Math.random() < 0.5 ? 'male' : 'female',
      nationality: nationality,
      visitorType: visitorType
    },
    visitDetails: {
      visitDate: visitDate,
      visitTime: visitTime,
      groupSize: Math.floor(Math.random() * 5) + 1, // 1-5 people
      visitPurpose: visitPurposes[Math.floor(Math.random() * visitPurposes.length)],
      expectedDuration: Math.floor(Math.random() * 4) + 1 // 1-5 hours
    },
    payment: {
      amount: paymentAmount,
      currency: 'ETB',
      paymentMethod: paymentMethod,
      paymentStatus: 'completed',
      transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`
    },
    museum: museumId,
    registeredBy: registeredById,
    status: status,
    specialRequirements: Math.random() < 0.2 ? 'Wheelchair accessible' : '',
    notes: Math.random() < 0.3 ? 'First time visitor' : ''
  };
};

// Seed visitor registrations
const seedVisitorRegistrations = async () => {
  try {
    console.log('🌱 Starting visitor registration seeding...');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ethioheritage360');
    console.log('✅ Connected to MongoDB');

    // Clear existing visitor registrations
    await VisitorRegistration.deleteMany({});
    console.log('🗑️ Cleared existing visitor registrations');

    // Get museums and users
    const museums = await Museum.find({});
    const users = await User.find({ role: 'museumAdmin' });

    if (museums.length === 0) {
      console.log('❌ No museums found. Please seed museums first.');
      return;
    }

    if (users.length === 0) {
      console.log('❌ No museum admin users found. Please seed users first.');
      return;
    }

    console.log(`📊 Found ${museums.length} museums and ${users.length} museum admins`);

    // Generate visitor registrations for each museum
    const allRegistrations = [];

    for (const museum of museums) {
      const museumUsers = users.filter(user => user.museumId?.toString() === museum._id.toString());
      if (museumUsers.length === 0) continue;

      const registeredBy = museumUsers[0]; // Use first museum admin

      // Generate 20-50 registrations per museum
      const registrationCount = Math.floor(Math.random() * 31) + 20;

      for (let i = 0; i < registrationCount; i++) {
        const registrationData = generateEthiopianVisitorData(museum._id, registeredBy._id);
        allRegistrations.push(registrationData);
      }

      console.log(`📝 Generated ${registrationCount} registrations for ${museum.name}`);
    }

    // Insert all registrations
    const registrations = await VisitorRegistration.insertMany(allRegistrations);
    console.log(`✅ Successfully seeded ${registrations.length} visitor registrations`);

    // Display summary statistics
    const stats = {
      total: registrations.length,
      byStatus: {},
      byType: {},
      byMuseum: {},
      totalRevenue: 0
    };

    registrations.forEach(reg => {
      // Status stats
      stats.byStatus[reg.status] = (stats.byStatus[reg.status] || 0) + 1;

      // Type stats
      stats.byType[reg.visitorInfo.visitorType] = (stats.byType[reg.visitorInfo.visitorType] || 0) + 1;

      // Revenue stats
      stats.totalRevenue += reg.payment.amount;
    });

    console.log('\n📊 Seeding Summary:');
    console.log(`Total Registrations: ${stats.total}`);
    console.log(`Total Revenue: ETB ${stats.totalRevenue.toLocaleString()}`);
    console.log('\nBy Status:');
    Object.entries(stats.byStatus).forEach(([status, count]) => {
      console.log(`  ${status}: ${count}`);
    });
    console.log('\nBy Visitor Type:');
    Object.entries(stats.byType).forEach(([type, count]) => {
      console.log(`  ${type}: ${count}`);
    });

    console.log('\n🎉 Visitor registration seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error seeding visitor registrations:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

// Run the seeder
if (require.main === module) {
  seedVisitorRegistrations();
}

module.exports = seedVisitorRegistrations;
