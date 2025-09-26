const mongoose = require('mongoose');
const HeritageSite = require('../models/HeritageSite');
const User = require('../models/User');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ethioheritage360');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Sample heritage sites data based on the mock data from Map.jsx
const sampleHeritageSites = [
  {
    name: "Rock-Hewn Churches of Lalibela",
    localName: "ላሊበላ የዓለት ቤተክርስትያናት",
    description: "Eleven medieval monolithic cave churches carved from rock, representing one of the most remarkable architectural achievements of the medieval period.",
    shortDescription: "Eleven medieval monolithic cave churches carved from rock",
    significance: "The Rock-Hewn Churches of Lalibela are a UNESCO World Heritage site representing one of the most remarkable architectural achievements of the medieval period. These churches were carved directly from the rock and are considered one of the most sacred places in Ethiopia.",

    // Classification
    type: "Religious",
    category: "Churches & Monasteries",
    designation: "UNESCO World Heritage",
    unescoId: "ET-001",

    // Location Information
    location: {
      region: "Amhara",
      zone: "North Wollo",
      woreda: "Lalibela",
      city: "Lalibela",
      coordinates: {
        latitude: 12.0333,
        longitude: 39.0333
      },
      altitude: 2500,
      accessibility: "Moderate",
      nearbyLandmarks: ["Asheton Maryam Monastery", "Na'akuto La'ab Church"]
    },

    // Historical Information
    history: {
      established: "12th-13th century",
      period: "Zagwe (900-1270 AD)",
      civilization: "Ethiopian Orthodox",
      dynasty: "Zagwe Dynasty",
      archaeologist: "Various international teams",
      excavationYear: 1978,
      discoveryStory: "The churches were built during the reign of King Lalibela (1181-1221) as a 'New Jerusalem' after Muslim conquests halted Christian pilgrimages to the Holy Land."
    },

    // Physical Characteristics
    features: {
      area: 2.5,
      structures: ["Churches", "Monasteries", "Caves", "Rock Carvings"],
      materials: ["Stone", "Rock-hewn", "Natural Rock"],
      condition: "Good",
      threats: ["Weathering", "Tourism Pressure"],
      dimensions: {
        length: 100,
        width: 50,
        height: 15
      }
    },

    // Visitor Information
    visitorInfo: {
      isOpen: true,
      visitingHours: "Daily 6:00 AM - 6:00 PM",
      entryFee: {
        local: 50,
        foreign: 500,
        student: 25,
        currency: "ETB"
      },
      guidedTours: {
        available: true,
        cost: 200,
        languages: ["Amharic", "English", "French"],
        duration: "2-3 hours"
      },
      facilities: ["Parking", "Restrooms", "Gift Shop", "Information Center"],
      bestVisitTime: "October to March",
      restrictions: "Dress modestly, remove shoes in churches",
      safetyInfo: "Wear comfortable walking shoes, bring water"
    },

    // Media Assets
    media: {
      coverImage: "https://example.com/lalibela-cover.jpg",
      images: [
        {
          url: "https://example.com/lalibela-1.jpg",
          caption: "Bete Giyorgis (Church of St. George)",
          photographer: "Ethiopian Tourism",
          category: "Architecture"
        }
      ]
    },

    // Cultural Information
    cultural: {
      associatedGroups: ["Ethiopian Orthodox Christians", "Amhara"],
      traditions: ["Religious Pilgrimage", "Timkat Festival"],
      festivals: [
        {
          name: "Timkat (Epiphany)",
          date: "January 19",
          description: "Annual celebration of Jesus' baptism"
        }
      ],
      legends: "According to legend, King Lalibela was visited by angels who helped him carve the churches in just 24 years.",
      religiousSignificance: "One of the most sacred places in Ethiopian Orthodox Christianity, often called the 'New Jerusalem'."
    },

    // Conservation Status
    conservation: {
      status: "Good",
      lastAssessment: new Date('2023-01-15'),
      nextAssessment: new Date('2024-01-15')
    },

    // Tourism Impact
    tourism: {
      annualVisitors: 50000,
      economicImpact: 5000000,
      employmentGenerated: 200,
      tourismGrowth: 15
    },

    // Management Information
    management: {
      authority: "Authority for Research and Conservation of Cultural Heritage (ARCCH)",
      contactPerson: {
        name: "Dr. Alemayehu Hailu",
        title: "Site Manager",
        email: "lalibela@arcch.gov.et",
        phone: "+251-11-123-4567"
      },
      lastInspection: new Date('2023-06-15'),
      nextInspection: new Date('2024-06-15')
    },

    // System Fields
    status: "active",
    verified: true,
    featured: true,
    priority: "High",

    // Metadata
    tags: ["unesco", "religious", "amhara", "medieval", "rock-hewn"],
    keywords: ["Lalibela", "churches", "UNESCO", "Ethiopian Orthodox", "medieval"],
    language: "en"
  },

  {
    name: "Aksum Obelisks",
    localName: "አክሱም ሐውልቶች",
    description: "Ancient granite obelisks marking royal tombs, representing the pinnacle of Aksumite civilization and engineering.",
    shortDescription: "Ancient granite obelisks marking royal tombs",
    significance: "The Aksum Obelisks are monumental granite stelae that represent the pinnacle of Aksumite civilization. These massive stone monuments were erected to mark royal tombs and demonstrate the advanced engineering capabilities of the ancient Aksumite kingdom.",

    type: "Archaeological",
    category: "Ancient Ruins",
    designation: "UNESCO World Heritage",
    unescoId: "ET-002",

    location: {
      region: "Tigray",
      zone: "Central Tigray",
      woreda: "Aksum",
      city: "Aksum",
      coordinates: {
        latitude: 14.1319,
        longitude: 38.7195
      },
      altitude: 2100,
      accessibility: "Easy",
      nearbyLandmarks: ["Church of St. Mary of Zion", "Queen of Sheba's Palace"]
    },

    history: {
      established: "1st-4th century AD",
      period: "Aksumite (100-900 AD)",
      civilization: "Aksumite Kingdom",
      dynasty: "Aksumite Dynasty",
      archaeologist: "Various international teams",
      excavationYear: 1906,
      discoveryStory: "The obelisks were discovered by European archaeologists in the early 20th century, though they were known to local communities for centuries."
    },

    features: {
      area: 1.2,
      structures: ["Obelisks", "Tombs", "Foundations"],
      materials: ["Stone"],
      condition: "Good",
      threats: ["Weathering", "Human Activity"],
      dimensions: {
        length: 33,
        width: 2.5,
        height: 33
      }
    },

    visitorInfo: {
      isOpen: true,
      visitingHours: "Daily 8:00 AM - 5:00 PM",
      entryFee: {
        local: 30,
        foreign: 200,
        student: 15,
        currency: "ETB"
      },
      guidedTours: {
        available: true,
        cost: 150,
        languages: ["Amharic", "English", "Tigrinya"],
        duration: "1-2 hours"
      },
      facilities: ["Parking", "Information Center"],
      bestVisitTime: "Year-round",
      restrictions: "Do not climb on obelisks",
      safetyInfo: "Stay on designated paths"
    },

    conservation: {
      status: "Good",
      lastAssessment: new Date('2023-03-10'),
      nextAssessment: new Date('2024-03-10')
    },

    tourism: {
      annualVisitors: 25000,
      economicImpact: 2000000,
      employmentGenerated: 100,
      tourismGrowth: 12
    },

    management: {
      authority: "Authority for Research and Conservation of Cultural Heritage (ARCCH)",
      contactPerson: {
        name: "Dr. Yonas Beyene",
        title: "Site Manager",
        email: "aksum@arcch.gov.et",
        phone: "+251-34-123-4567"
      }
    },

    status: "active",
    verified: true,
    featured: true,
    priority: "High",

    tags: ["unesco", "archaeological", "tigray", "aksumite", "obelisks"],
    keywords: ["Aksum", "obelisks", "UNESCO", "ancient", "granite"],
    language: "en"
  },

  {
    name: "Simien Mountains National Park",
    localName: "ሲሚየን ተራሮች ብሔራዊ ፓርክ",
    description: "Dramatic mountain landscape with endemic wildlife, including the endangered Ethiopian wolf and Walia ibex.",
    shortDescription: "Dramatic mountain landscape with endemic wildlife",
    significance: "The Simien Mountains National Park is a UNESCO World Heritage site known for its dramatic landscapes and unique biodiversity. It is home to several endemic species including the Ethiopian wolf, Walia ibex, and Gelada baboon.",

    type: "Natural",
    category: "National Parks",
    designation: "UNESCO World Heritage",
    unescoId: "ET-003",

    location: {
      region: "Amhara",
      zone: "North Gondar",
      woreda: "Simien",
      city: "Debark",
      coordinates: {
        latitude: 13.1885,
        longitude: 38.0404
      },
      altitude: 4000,
      accessibility: "Difficult",
      nearbyLandmarks: ["Ras Dashen", "Geech Abyss"]
    },

    history: {
      established: "1969",
      period: "Modern (1974-present)",
      civilization: "Modern Ethiopia",
      discoveryStory: "The park was established to protect the unique biodiversity and dramatic landscapes of the Simien Mountains."
    },

    features: {
      area: 22000,
      structures: ["Natural Formations"],
      materials: ["Natural Rock"],
      condition: "Good",
      threats: ["Human Activity", "Natural Disasters"],
      dimensions: {
        length: 100,
        width: 220,
        height: 1000
      }
    },

    visitorInfo: {
      isOpen: true,
      visitingHours: "Daily 6:00 AM - 6:00 PM",
      entryFee: {
        local: 50,
        foreign: 300,
        student: 25,
        currency: "ETB"
      },
      guidedTours: {
        available: true,
        cost: 500,
        languages: ["Amharic", "English"],
        duration: "3-5 days"
      },
      facilities: ["Parking", "Information Center"],
      bestVisitTime: "October to March",
      restrictions: "Permit required for overnight stays",
      safetyInfo: "Acclimatize to altitude, bring warm clothing"
    },

    conservation: {
      status: "Good",
      lastAssessment: new Date('2023-05-20'),
      nextAssessment: new Date('2024-05-20')
    },

    tourism: {
      annualVisitors: 15000,
      economicImpact: 3000000,
      employmentGenerated: 150,
      tourismGrowth: 20
    },

    management: {
      authority: "Authority for Research and Conservation of Cultural Heritage (ARCCH)",
      contactPerson: {
        name: "Dr. Tewodros Assefa",
        title: "Park Manager",
        email: "simien@ewca.gov.et",
        phone: "+251-58-123-4567"
      }
    },

    status: "active",
    verified: true,
    featured: true,
    priority: "High",

    tags: ["unesco", "natural", "amhara", "mountains", "wildlife"],
    keywords: ["Simien", "mountains", "UNESCO", "wildlife", "endemic"],
    language: "en"
  },

  {
    name: "Fasil Ghebbi Castle",
    localName: "ፋሲል ግቢ",
    description: "17th century royal fortress and palace complex, the former residence of Ethiopian emperors.",
    shortDescription: "17th century royal fortress and palace complex",
    significance: "Fasil Ghebbi is a royal fortress and palace complex that served as the residence of Ethiopian emperors from the 17th to 19th centuries. It represents the pinnacle of Ethiopian castle architecture and is a UNESCO World Heritage site.",

    type: "Historical",
    category: "Palaces & Castles",
    designation: "UNESCO World Heritage",
    unescoId: "ET-004",

    location: {
      region: "Amhara",
      zone: "North Gondar",
      woreda: "Gondar",
      city: "Gondar",
      coordinates: {
        latitude: 12.6087,
        longitude: 37.4679
      },
      altitude: 2200,
      accessibility: "Easy",
      nearbyLandmarks: ["Debre Berhan Selassie Church", "Bath of Fasilidas"]
    },

    history: {
      established: "1636",
      period: "Solomonic (1270-1974)",
      civilization: "Ethiopian Empire",
      dynasty: "Solomonic Dynasty",
      discoveryStory: "Built by Emperor Fasilidas as his royal residence, it became the capital of Ethiopia for over 200 years."
    },

    features: {
      area: 7.5,
      structures: ["Palaces", "Walls", "Foundations"],
      materials: ["Stone", "Mud Brick", "Wood"],
      condition: "Good",
      threats: ["Weathering", "Tourism Pressure"],
      dimensions: {
        length: 900,
        width: 800,
        height: 15
      }
    },

    visitorInfo: {
      isOpen: true,
      visitingHours: "Daily 8:00 AM - 5:00 PM",
      entryFee: {
        local: 40,
        foreign: 200,
        student: 20,
        currency: "ETB"
      },
      guidedTours: {
        available: true,
        cost: 200,
        languages: ["Amharic", "English"],
        duration: "2-3 hours"
      },
      facilities: ["Parking", "Restrooms", "Gift Shop", "Information Center"],
      bestVisitTime: "Year-round",
      restrictions: "Do not touch historical structures",
      safetyInfo: "Wear comfortable walking shoes"
    },

    conservation: {
      status: "Good",
      lastAssessment: new Date('2023-04-15'),
      nextAssessment: new Date('2024-04-15')
    },

    tourism: {
      annualVisitors: 30000,
      economicImpact: 2500000,
      employmentGenerated: 120,
      tourismGrowth: 10
    },

    management: {
      authority: "Authority for Research and Conservation of Cultural Heritage (ARCCH)",
      contactPerson: {
        name: "Dr. Meseret Hailu",
        title: "Site Manager",
        email: "gondar@arcch.gov.et",
        phone: "+251-58-123-4567"
      }
    },

    status: "active",
    verified: true,
    featured: true,
    priority: "High",

    tags: ["unesco", "historical", "amhara", "castle", "palace"],
    keywords: ["Fasil Ghebbi", "Gondar", "UNESCO", "castle", "palace"],
    language: "en"
  },

  {
    name: "Harar Jugol",
    localName: "ሐረር ጁጎል",
    description: "Historic fortified city with unique Islamic architecture, known as the 'City of Saints'.",
    shortDescription: "Historic fortified city with unique Islamic architecture",
    significance: "Harar Jugol is a historic fortified city that served as a major center of Islamic culture and learning. Known as the 'City of Saints', it features unique architecture and is considered the fourth holiest city in Islam.",

    type: "Cultural",
    category: "Historical Cities",
    designation: "UNESCO World Heritage",
    unescoId: "ET-005",

    location: {
      region: "Harari",
      zone: "Harari",
      woreda: "Harar",
      city: "Harar",
      coordinates: {
        latitude: 9.3133,
        longitude: 42.1333
      },
      altitude: 1800,
      accessibility: "Easy",
      nearbyLandmarks: ["Arthur Rimbaud House", "Harar Museum"]
    },

    history: {
      established: "7th century",
      period: "Multiple Periods",
      civilization: "Islamic",
      dynasty: "Various Islamic dynasties",
      discoveryStory: "Harar has been a center of Islamic culture and learning for over 1000 years, serving as a major trading hub between Africa and the Middle East."
    },

    features: {
      area: 0.5,
      structures: ["Walls", "Other"],
      materials: ["Stone", "Mud Brick", "Wood"],
      condition: "Good",
      threats: ["Weathering", "Construction"],
      dimensions: {
        length: 1000,
        width: 1000,
        height: 5
      }
    },

    visitorInfo: {
      isOpen: true,
      visitingHours: "Daily 8:00 AM - 6:00 PM",
      entryFee: {
        local: 30,
        foreign: 150,
        student: 15,
        currency: "ETB"
      },
      guidedTours: {
        available: true,
        cost: 150,
        languages: ["Amharic", "English", "Arabic"],
        duration: "2-3 hours"
      },
      facilities: ["Parking", "Restrooms", "Gift Shop"],
      bestVisitTime: "Year-round",
      restrictions: "Dress modestly, respect local customs",
      safetyInfo: "Stay with guide in narrow alleys"
    },

    conservation: {
      status: "Good",
      lastAssessment: new Date('2023-02-28'),
      nextAssessment: new Date('2024-02-28')
    },

    tourism: {
      annualVisitors: 20000,
      economicImpact: 1500000,
      employmentGenerated: 80,
      tourismGrowth: 8
    },

    management: {
      authority: "Regional Culture Bureau",
      contactPerson: {
        name: "Dr. Fatima Ahmed",
        title: "Site Manager",
        email: "harar@culture.gov.et",
        phone: "+251-25-123-4567"
      }
    },

    status: "active",
    verified: true,
    featured: true,
    priority: "High",

    tags: ["unesco", "cultural", "harari", "islamic", "fortified"],
    keywords: ["Harar", "Jugol", "UNESCO", "Islamic", "fortified"],
    language: "en"
  },

  {
    name: "Lower Valley of the Awash",
    localName: "የአዋሽ ታችኛው ሸለቆ",
    description: "Archaeological site with early human fossils including Lucy, one of the most important paleoanthropological sites in the world.",
    shortDescription: "Archaeological site with early human fossils including Lucy",
    significance: "The Lower Valley of the Awash is one of the most important paleoanthropological sites in the world, containing fossils that have revolutionized our understanding of human evolution, including the famous 'Lucy' skeleton.",

    type: "Archaeological",
    category: "Archaeological Sites",
    designation: "UNESCO World Heritage",
    unescoId: "ET-006",

    location: {
      region: "Afar",
      zone: "Zone 1",
      woreda: "Hadar",
      city: "Hadar",
      coordinates: {
        latitude: 11.0833,
        longitude: 40.5833
      },
      altitude: 500,
      accessibility: "Difficult",
      nearbyLandmarks: ["Hadar Research Station", "Awash National Park"]
    },

    history: {
      established: "3.2 million years ago",
      period: "Prehistoric",
      civilization: "Early Hominids",
      archaeologist: "Donald Johanson",
      excavationYear: 1974,
      discoveryStory: "The site was discovered by Donald Johanson in 1974, who found the famous 'Lucy' skeleton, one of the most complete early human fossils ever discovered."
    },

    features: {
      area: 150,
      structures: ["Other"],
      materials: ["Other"],
      condition: "Good",
      threats: ["Weathering", "Human Activity"],
      dimensions: {
        length: 15000,
        width: 10000,
        height: 50
      }
    },

    visitorInfo: {
      isOpen: true,
      visitingHours: "Daily 8:00 AM - 4:00 PM",
      entryFee: {
        local: 20,
        foreign: 100,
        student: 10,
        currency: "ETB"
      },
      guidedTours: {
        available: true,
        cost: 300,
        languages: ["Amharic", "English"],
        duration: "4-6 hours"
      },
      facilities: ["Parking", "Information Center"],
      bestVisitTime: "October to March",
      restrictions: "Research permit required for excavation areas",
      safetyInfo: "Bring water, sun protection, and sturdy shoes"
    },

    conservation: {
      status: "Good",
      lastAssessment: new Date('2023-06-10'),
      nextAssessment: new Date('2024-06-10')
    },

    tourism: {
      annualVisitors: 10000,
      economicImpact: 1000000,
      employmentGenerated: 50,
      tourismGrowth: 15
    },

    management: {
      authority: "Authority for Research and Conservation of Cultural Heritage (ARCCH)",
      contactPerson: {
        name: "Dr. Yohannes Haile-Selassie",
        title: "Site Manager",
        email: "awash@arcch.gov.et",
        phone: "+251-33-123-4567"
      }
    },

    status: "active",
    verified: true,
    featured: true,
    priority: "High",

    tags: ["unesco", "archaeological", "afar", "fossils", "paleoanthropology"],
    keywords: ["Awash", "Lucy", "UNESCO", "fossils", "paleoanthropology"],
    language: "en"
  }
];

// Function to create sample heritage sites
const createSampleHeritageSites = async () => {
  try {
    console.log('🚀 Starting to create sample heritage sites...');

    // Find a super admin user to assign as creator
    const superAdmin = await User.findOne({ role: 'superAdmin' });
    if (!superAdmin) {
      console.log('❌ No super admin user found. Please create a super admin user first.');
      return;
    }

    console.log(`👤 Using super admin: ${superAdmin.name} (${superAdmin.email})`);

    // Clear existing heritage sites
    await HeritageSite.deleteMany({});
    console.log('🗑️ Cleared existing heritage sites');

    // Create new heritage sites
    const heritageSitesWithCreator = sampleHeritageSites.map(site => ({
      ...site,
      createdBy: superAdmin._id,
      updatedBy: superAdmin._id
    }));

    const createdSites = await HeritageSite.insertMany(heritageSitesWithCreator);
    console.log(`✅ Successfully created ${createdSites.length} heritage sites`);

    // Display created sites
    console.log('\n📋 Created Heritage Sites:');
    createdSites.forEach((site, index) => {
      console.log(`${index + 1}. ${site.name} (${site.designation}) - ${site.location.region}`);
    });

    // Get platform statistics
    const stats = await HeritageSite.getPlatformStats();
    console.log('\n📊 Platform Statistics:');
    console.log(`Total Sites: ${stats.overview.total}`);
    console.log(`Active Sites: ${stats.overview.active}`);
    console.log(`UNESCO Sites: ${stats.overview.unesco}`);
    console.log(`Proposals: ${stats.overview.proposals}`);

    console.log('\n🎉 Sample heritage sites created successfully!');

  } catch (error) {
    console.error('❌ Error creating sample heritage sites:', error);
  }
};

// Main execution
const main = async () => {
  try {
    await connectDB();
    await createSampleHeritageSites();
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run the script
if (require.main === module) {
  main();
}

module.exports = { createSampleHeritageSites, sampleHeritageSites };
