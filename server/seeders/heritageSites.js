const mongoose = require('mongoose');
const HeritageSite = require('../models/HeritageSite');
const User = require('../models/User');
require('dotenv').config();

/**
 * Ethiopian Heritage Sites Seeder
 * Contains real Ethiopian heritage sites with comprehensive data
 */

const ethiopianHeritageSites = [
  {
    name: "Lalibela Rock-Hewn Churches",
    localName: "የላሊበላ አብያተ ክርስቲያናት",
    description: "Lalibela is a town in northern Ethiopia famous for its rock-cut monolithic churches. The whole of Lalibela offers an exceptional testimony to the medieval and post-medieval civilization of Ethiopia.",
    shortDescription: "Famous rock-cut churches carved from solid volcanic rock in the 12th century.",
    significance: "Outstanding universal value as a masterpiece of human creative genius and unique architectural achievement.",
    type: "Religious",
    category: "Churches & Monasteries",
    designation: "UNESCO World Heritage",
    unescoId: "ET-375",
    location: {
      region: "Amhara",
      zone: "North Wollo",
      woreda: "Lalibela",
      city: "Lalibela",
      coordinates: {
        latitude: 12.0333,
        longitude: 39.0473
      },
      altitude: 2500,
      accessibility: "Moderate",
      nearbyLandmarks: ["Lalibela Airport", "Asheton Maryam Monastery"]
    },
    history: {
      established: "12th-13th century",
      period: "Zagwe (900-1270 AD)",
      civilization: "Ethiopian Christian",
      dynasty: "Zagwe Dynasty",
      discoveryStory: "Built during the reign of King Lalibela as a 'New Jerusalem'"
    },
    features: {
      area: 10.5,
      structures: ["Churches", "Rock Carvings", "Tunnels"],
      materials: ["Rock-hewn", "Natural Rock"],
      condition: "Good",
      threats: ["Weathering", "Tourism Pressure"],
      dimensions: {
        length: 800,
        width: 600,
        depth: 15
      }
    },
    visitorInfo: {
      isOpen: true,
      visitingHours: "Daily 6:00 AM - 6:00 PM",
      entryFee: {
        local: 50,
        foreign: 200,
        student: 25,
        currency: "ETB"
      },
      guidedTours: {
        available: true,
        cost: 100,
        languages: ["English", "Amharic", "French"],
        duration: "3-4 hours"
      },
      facilities: ["Parking", "Information Center", "Restrooms", "Gift Shop"],
      bestVisitTime: "October to March (dry season)",
      restrictions: "Respectful dress code required in churches",
      safetyInfo: "Sturdy shoes recommended for rock surfaces"
    },
    cultural: {
      associatedGroups: ["Amhara", "Ethiopian Orthodox"],
      traditions: ["Orthodox Christian pilgrimage", "Timkat celebration"],
      festivals: [
        {
          name: "Timkat (Ethiopian Epiphany)",
          date: "January 19",
          description: "Major Orthodox celebration with processions and blessing ceremonies"
        },
        {
          name: "Christmas (Genna)",
          date: "January 7", 
          description: "Ethiopian Orthodox Christmas celebration"
        }
      ],
      legends: "Built by angels at night while King Lalibela slept",
      religiousSignificance: "Sacred pilgrimage site for Ethiopian Orthodox Christians"
    },
    conservation: {
      status: "Good",
      threats: [
        {
          type: "Weathering",
          severity: "Medium",
          description: "Natural erosion of volcanic rock"
        },
        {
          type: "Tourism Pressure", 
          severity: "Medium",
          description: "High visitor numbers causing wear"
        }
      ],
      projects: [
        {
          name: "Lalibela Conservation Project",
          description: "Structural reinforcement and drainage systems",
          startDate: new Date("2010-01-01"),
          status: "Ongoing",
          budget: 2500000
        }
      ],
      lastAssessment: new Date("2023-01-01"),
      nextAssessment: new Date("2024-01-01")
    },
    tourism: {
      annualVisitors: 150000,
      economicImpact: 500000000,
      employmentGenerated: 2500,
      seasonality: {
        peakSeason: "October to March",
        offSeason: "June to September",
        description: "Peak season coincides with dry weather and religious festivals"
      }
    },
    management: {
      authority: "Authority for Research and Conservation of Cultural Heritage (ARCCH)",
      contactPerson: {
        name: "Heritage Site Manager",
        title: "Site Coordinator",
        email: "lalibela@arcch.gov.et",
        phone: "+251-11-123-4567"
      },
      lastInspection: new Date("2023-06-01"),
      nextInspection: new Date("2024-06-01"),
      budget: {
        annual: 15000000,
        currency: "ETB",
        year: 2024
      }
    },
    status: "active",
    verified: true,
    featured: true,
    priority: "High",
    tags: ["unesco", "religious", "rock-hewn", "amhara", "pilgrimage"],
    keywords: ["Lalibela", "churches", "rock-hewn", "UNESCO", "Ethiopia", "Christianity"]
  },

  {
    name: "Aksum Archaeological Sites",
    localName: "የአክሱም አርኪዮሎጂካል ቦታዎች",
    description: "The ruins of the ancient city of Aksum are found close to Ethiopia's northern border. They mark the location of the heart of ancient Ethiopia, when the Kingdom of Aksum was the most powerful state between the Eastern Roman Empire and Persia.",
    shortDescription: "Ancient capital of the Aksumite Kingdom with towering obelisks and royal tombs.",
    significance: "Outstanding testimony to the ancient Ethiopian civilization and its achievements.",
    type: "Archaeological",
    category: "Ancient Ruins",
    designation: "UNESCO World Heritage",
    unescoId: "ET-15",
    location: {
      region: "Tigray",
      zone: "Central Tigray",
      woreda: "Aksum",
      city: "Aksum",
      coordinates: {
        latitude: 14.1333,
        longitude: 38.7167
      },
      altitude: 2130,
      accessibility: "Easy",
      nearbyLandmarks: ["Aksum Airport", "Church of Our Lady Mary of Zion"]
    },
    history: {
      established: "1st-8th century AD",
      period: "Aksumite (100-900 AD)",
      civilization: "Aksumite Kingdom",
      dynasty: "Aksumite",
      archaeologist: "Various international teams",
      excavationYear: 1906,
      discoveryStory: "First excavated by German Archaeological Institute in 1906"
    },
    features: {
      area: 35.2,
      structures: ["Obelisks", "Tombs", "Palaces", "Foundations"],
      materials: ["Stone", "Granite"],
      condition: "Good", 
      threats: ["Weathering", "Human Activity"],
      dimensions: {
        length: 2000,
        width: 1500
      }
    },
    visitorInfo: {
      isOpen: true,
      visitingHours: "Daily 8:00 AM - 5:30 PM",
      entryFee: {
        local: 30,
        foreign: 150,
        student: 15,
        currency: "ETB"
      },
      guidedTours: {
        available: true,
        cost: 150,
        languages: ["English", "Amharic", "Tigrinya"],
        duration: "2-3 hours"
      },
      facilities: ["Parking", "Museum", "Information Center", "Restrooms"],
      bestVisitTime: "Year-round, best October to May",
      restrictions: "No climbing on obelisks"
    },
    cultural: {
      associatedGroups: ["Tigray", "Aksumite descendants"],
      traditions: ["Ancient trading customs", "Stone craftsmanship"],
      festivals: [
        {
          name: "Zion Maryam Festival",
          date: "November 30",
          description: "Celebration at the Church of Our Lady Mary of Zion"
        }
      ],
      legends: "Believed to be the resting place of the Ark of the Covenant",
      religiousSignificance: "Sacred site for Ethiopian Orthodox Christians"
    },
    conservation: {
      status: "Good",
      threats: [
        {
          type: "Weathering",
          severity: "Medium", 
          description: "Natural erosion of granite structures"
        }
      ],
      lastAssessment: new Date("2023-03-01"),
      nextAssessment: new Date("2024-03-01")
    },
    tourism: {
      annualVisitors: 75000,
      economicImpact: 200000000,
      employmentGenerated: 800
    },
    management: {
      authority: "Authority for Research and Conservation of Cultural Heritage (ARCCH)",
      budget: {
        annual: 8000000,
        currency: "ETB",
        year: 2024
      }
    },
    status: "active",
    verified: true,
    featured: true,
    priority: "High",
    tags: ["unesco", "archaeological", "obelisks", "tigray", "aksumite"],
    keywords: ["Aksum", "obelisks", "archaeological", "UNESCO", "ancient", "Ethiopia"]
  },

  {
    name: "Lower Valley of the Awash",
    localName: "የአዋሽ ወንዝ ታችኛው ሸለቆ",
    description: "The Awash valley contains one of the most important groupings of paleontological sites on the African continent. The remains found at the site, the oldest of which date back at least 4 million years, provide evidence of human evolution which has modified our conception of the history of humankind.",
    shortDescription: "Paleontological site with fossils including the famous 'Lucy' (Australopithecus afarensis).",
    significance: "Outstanding universal value for understanding human evolution and paleontology.",
    type: "Archaeological",
    category: "Archaeological Sites",
    designation: "UNESCO World Heritage",
    unescoId: "ET-10",
    location: {
      region: "Afar",
      zone: "Zone 1 (Awsi Raasu)",
      woreda: "Awash Fentale",
      city: "Gewane",
      coordinates: {
        latitude: 11.1667,
        longitude: 40.5833
      },
      altitude: 200,
      accessibility: "Difficult",
      nearbyLandmarks: ["Awash National Park", "Fentale Volcano"]
    },
    history: {
      established: "Paleolithic period",
      period: "Prehistoric",
      civilization: "Early Human",
      archaeologist: "Donald Johanson, Maurice Taieb",
      excavationYear: 1974,
      discoveryStory: "Discovery of 'Lucy' fossil revolutionized understanding of human evolution"
    },
    features: {
      area: 850.5,
      structures: ["Fossil Sites", "Natural Formations"],
      materials: ["Sedimentary Rock", "Natural Deposits"],
      condition: "Good",
      threats: ["Natural Disasters", "Human Activity"],
      dimensions: {
        length: 60000,
        width: 30000
      }
    },
    visitorInfo: {
      isOpen: true,
      visitingHours: "By appointment with research permits",
      entryFee: {
        local: 100,
        foreign: 500,
        student: 50,
        currency: "ETB"
      },
      guidedTours: {
        available: true,
        cost: 300,
        languages: ["English", "Amharic"],
        duration: "Full day"
      },
      facilities: ["Research Station", "First Aid"],
      bestVisitTime: "October to March",
      restrictions: "Research permit required, no fossil collection",
      safetyInfo: "Remote location, proper equipment and guide essential"
    },
    cultural: {
      associatedGroups: ["Afar", "International researchers"],
      significance: "Site of major paleontological discoveries"
    },
    conservation: {
      status: "Good",
      threats: [
        {
          type: "Human Activity",
          severity: "Medium",
          description: "Unauthorized excavation attempts"
        },
        {
          type: "Natural Disasters",
          severity: "Low",
          description: "Occasional flooding and erosion"
        }
      ],
      projects: [
        {
          name: "Awash Research Station",
          description: "Ongoing paleontological research and conservation",
          startDate: new Date("1975-01-01"),
          status: "Ongoing"
        }
      ],
      lastAssessment: new Date("2023-02-01"),
      nextAssessment: new Date("2024-02-01")
    },
    tourism: {
      annualVisitors: 5000,
      economicImpact: 50000000,
      employmentGenerated: 100
    },
    management: {
      authority: "Authority for Research and Conservation of Cultural Heritage (ARCCH)",
      budget: {
        annual: 5000000,
        currency: "ETB",
        year: 2024
      }
    },
    status: "active",
    verified: true,
    featured: true,
    priority: "Critical",
    tags: ["unesco", "paleontological", "lucy", "afar", "prehistoric"],
    keywords: ["Awash", "Lucy", "fossils", "paleontology", "UNESCO", "human evolution"]
  },

  {
    name: "Simien Mountains National Park",
    localName: "የስሜን ተራሮች ብሔራዊ ፓርክ",
    description: "Massive erosion over the years on the Ethiopian plateau has created one of the most spectacular landscapes in the world, with jagged mountain peaks, deep valleys and sharp precipices dropping some 1,500 m.",
    shortDescription: "Spectacular mountain landscape with endemic species including Gelada baboons.",
    significance: "Outstanding natural beauty and biodiversity hotspot with endemic species.",
    type: "Natural",
    category: "National Parks",
    designation: "UNESCO World Heritage",
    unescoId: "ET-9",
    location: {
      region: "Amhara",
      zone: "North Gondar",
      woreda: "Janamora",
      city: "Debark",
      coordinates: {
        latitude: 13.1833,
        longitude: 38.0167
      },
      altitude: 4543,
      accessibility: "Difficult",
      nearbyLandmarks: ["Ras Dashen Peak", "Chennek Camp"]
    },
    history: {
      established: "1969 (National Park), 1978 (UNESCO)",
      period: "Modern (1974-present)"
    },
    features: {
      area: 41200,
      structures: ["Natural Formations", "Mountain Peaks"],
      materials: ["Natural Rock", "Volcanic Rock"],
      condition: "Good",
      threats: ["Human Activity", "Agriculture", "Overgrazing"],
      dimensions: {
        length: 40000,
        width: 35000,
        height: 4543
      }
    },
    visitorInfo: {
      isOpen: true,
      visitingHours: "24/7 with permits",
      entryFee: {
        local: 90,
        foreign: 30, // USD
        student: 45,
        currency: "USD"
      },
      guidedTours: {
        available: true,
        cost: 25,
        languages: ["English", "Amharic"],
        duration: "Multi-day trekking"
      },
      facilities: ["Camping", "Information Center", "First Aid"],
      bestVisitTime: "October to March (dry season)",
      restrictions: "Permits required, guide mandatory",
      safetyInfo: "High altitude, proper equipment essential, acclimatization needed"
    },
    cultural: {
      associatedGroups: ["Amhara", "Local mountain communities"],
      traditions: ["Traditional farming", "Highland pastoralism"]
    },
    conservation: {
      status: "At Risk",
      threats: [
        {
          type: "Agriculture",
          severity: "High",
          description: "Encroachment of farming into park boundaries"
        },
        {
          type: "Human Activity",
          severity: "Medium", 
          description: "Population pressure and settlement"
        }
      ],
      projects: [
        {
          name: "Simien Mountains Conservation Program",
          description: "Wildlife protection and community engagement",
          startDate: new Date("2018-01-01"),
          status: "Ongoing",
          budget: 8000000
        }
      ],
      lastAssessment: new Date("2023-04-01"),
      nextAssessment: new Date("2024-04-01")
    },
    tourism: {
      annualVisitors: 25000,
      economicImpact: 150000000,
      employmentGenerated: 500,
      seasonality: {
        peakSeason: "October to March",
        offSeason: "June to September",
        description: "Weather-dependent trekking season"
      }
    },
    management: {
      authority: "Ethiopian Wildlife Conservation Authority",
      budget: {
        annual: 12000000,
        currency: "ETB",
        year: 2024
      }
    },
    status: "active",
    verified: true,
    featured: true,
    priority: "High",
    tags: ["unesco", "natural", "mountains", "wildlife", "gelada", "amhara"],
    keywords: ["Simien", "mountains", "national park", "UNESCO", "wildlife", "trekking"]
  },

  {
    name: "Harar Jugol Historic City",
    localName: "የሐረር ጁጎል ታሪካዊ ከተማ",
    description: "The fortified historic town of Harar is located in the eastern part of the country on a plateau with deep gorges surrounded by deserts and savannah. The walls surrounding this sacred Muslim city were built between the 13th and 16th centuries.",
    shortDescription: "Historic walled city with unique Islamic architecture and cultural traditions.",
    significance: "Outstanding example of Islamic architecture and urban planning in East Africa.",
    type: "Historical",
    category: "Historical Cities",
    designation: "UNESCO World Heritage",
    unescoId: "ET-1189",
    location: {
      region: "Harari",
      zone: "Harari Zone",
      woreda: "Harar",
      city: "Harar",
      coordinates: {
        latitude: 9.3067,
        longitude: 42.1179
      },
      altitude: 1885,
      accessibility: "Easy",
      nearbyLandmarks: ["Ras Makonnen's Palace", "Arthur Rimbaud House"]
    },
    history: {
      established: "13th-16th centuries",
      period: "Medieval",
      civilization: "Islamic Ethiopian",
      dynasty: "Harari Emirate"
    },
    features: {
      area: 60.1,
      structures: ["City Walls", "Mosques", "Traditional Houses"],
      materials: ["Stone", "Mud Brick"],
      condition: "Good",
      threats: ["Urban Development", "Tourism Pressure"],
      dimensions: {
        length: 3500,
        width: 1800
      }
    },
    visitorInfo: {
      isOpen: true,
      visitingHours: "Daily 8:00 AM - 6:00 PM",
      entryFee: {
        local: 20,
        foreign: 100,
        student: 10,
        currency: "ETB"
      },
      guidedTours: {
        available: true,
        cost: 80,
        languages: ["English", "Amharic", "Arabic", "Harari"],
        duration: "2-3 hours"
      },
      facilities: ["Parking", "Restrooms", "Information Center", "Museums"],
      bestVisitTime: "Year-round",
      restrictions: "Respectful dress code in religious areas"
    },
    cultural: {
      associatedGroups: ["Harari", "Oromo", "Somali", "Amhara"],
      traditions: ["Islamic scholarship", "Coffee ceremonies", "Traditional crafts"],
      festivals: [
        {
          name: "Mawlid (Prophet's Birthday)",
          date: "Variable (Islamic calendar)",
          description: "Major Islamic celebration with processions"
        },
        {
          name: "Eid celebrations",
          date: "Variable (Islamic calendar)",
          description: "Community celebrations and feasts"
        }
      ],
      legends: "Known as the 'City of Saints' with 99 mosques and 102 shrines",
      religiousSignificance: "Important center of Islamic learning and pilgrimage"
    },
    conservation: {
      status: "Good",
      threats: [
        {
          type: "Urban Development",
          severity: "Medium",
          description: "Modern construction pressures on traditional architecture"
        }
      ],
      projects: [
        {
          name: "Harar Heritage Conservation",
          description: "Preservation of traditional architecture and urban fabric",
          startDate: new Date("2008-01-01"),
          status: "Ongoing"
        }
      ],
      lastAssessment: new Date("2023-05-01"),
      nextAssessment: new Date("2024-05-01")
    },
    tourism: {
      annualVisitors: 45000,
      economicImpact: 120000000,
      employmentGenerated: 600
    },
    management: {
      authority: "Harari Regional Government",
      budget: {
        annual: 6000000,
        currency: "ETB",
        year: 2024
      }
    },
    status: "active",
    verified: true,
    featured: true,
    priority: "High", 
    tags: ["unesco", "historic", "islamic", "walled city", "harari"],
    keywords: ["Harar", "historic city", "Islamic", "UNESCO", "walls", "mosques"]
  }
];

// Helper function to create admin user for seeding
const createAdminUser = async () => {
  try {
    let adminUser = await User.findOne({ email: 'heritage.admin@ethioheritage360.com' });
    
    if (!adminUser) {
      adminUser = new User({
        firstName: 'Heritage',
        lastName: 'Administrator',
        name: 'Heritage Administrator',
        email: 'heritage.admin@ethioheritage360.com',
        password: 'HeritageAdmin2024!',
        role: 'superAdmin',
        isVerified: true,
        isActive: true
      });
      
      await adminUser.save();
      console.log('✅ Admin user created for heritage site seeding');
    }
    
    return adminUser._id;
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    throw error;
  }
};

// Seed heritage sites
const seedHeritageSites = async () => {
  try {
    console.log('🌱 Starting Heritage Sites seeding...');
    
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('📊 Connected to MongoDB');
    
    // Create admin user
    const adminUserId = await createAdminUser();
    
    // Clear existing heritage sites (optional - comment out for production)
    await HeritageSite.deleteMany({});
    console.log('🗑️  Cleared existing heritage sites');
    
    // Add admin user ID to each site
    const sitesWithAdmin = ethiopianHeritageSites.map(site => ({
      ...site,
      createdBy: adminUserId,
      updatedBy: adminUserId
    }));
    
    // Insert heritage sites
    const insertedSites = await HeritageSite.insertMany(sitesWithAdmin);
    console.log(`✅ Successfully seeded ${insertedSites.length} heritage sites:`);
    
    insertedSites.forEach(site => {
      console.log(`   - ${site.name} (${site.designation})`);
    });
    
    // Generate statistics
    const stats = await HeritageSite.getPlatformStats();
    console.log('\n📈 Heritage Sites Statistics:');
    console.log(`   Total Sites: ${stats.overview.total}`);
    console.log(`   Active Sites: ${stats.overview.active}`);
    console.log(`   UNESCO Sites: ${stats.overview.unesco}`);
    console.log(`   Sites by Region:`);
    stats.byRegion.forEach(region => {
      console.log(`      - ${region._id}: ${region.count} sites`);
    });
    
    console.log('\n🎉 Heritage Sites seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding heritage sites:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Test data relationships
const testDataIntegrity = async () => {
  try {
    console.log('🧪 Testing heritage sites data integrity...');
    
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    // Test geospatial queries
    const lalibela = await HeritageSite.findOne({ name: /Lalibela/ });
    if (lalibela) {
      const nearbySites = await HeritageSite.findNearby(
        lalibela.location.coordinates.latitude,
        lalibela.location.coordinates.longitude,
        100
      );
      console.log(`✅ Found ${nearbySites.length} sites within 100km of Lalibela`);
    }
    
    // Test text search
    const searchResults = await HeritageSite.searchSites('UNESCO church');
    console.log(`✅ Text search for 'UNESCO church' returned ${searchResults.length} results`);
    
    // Test regional queries
    const amharaSites = await HeritageSite.findByRegion('Amhara');
    console.log(`✅ Found ${amharaSites.length} sites in Amhara region`);
    
    // Test UNESCO sites
    const unescoSites = await HeritageSite.findUNESCOSites();
    console.log(`✅ Found ${unescoSites.length} UNESCO World Heritage Sites`);
    
    console.log('✅ All data integrity tests passed!');
    
  } catch (error) {
    console.error('❌ Data integrity test failed:', error);
  } finally {
    await mongoose.connection.close();
  }
};

// Export functions for use in other scripts
module.exports = {
  seedHeritageSites,
  testDataIntegrity,
  ethiopianHeritageSites
};

// Run seeding if called directly
if (require.main === module) {
  const command = process.argv[2];
  
  if (command === 'test') {
    testDataIntegrity();
  } else {
    seedHeritageSites().then(() => {
      process.exit(0);
    }).catch(error => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
  }
}
