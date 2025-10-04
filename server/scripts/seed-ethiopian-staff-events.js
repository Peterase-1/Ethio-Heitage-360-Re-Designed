require('dotenv').config();
const mongoose = require('mongoose');
const Staff = require('../models/Staff');
const Event = require('../models/Event');
const Museum = require('../models/Museum');
const User = require('../models/User');

// Ethiopian names and data
const ethiopianNames = [
  { name: 'Alemayehu Tadesse', email: 'alemayehu.tadesse@ethnologicalmuseum.et', phone: '+251911123001' },
  { name: 'Birtukan Mesfin', email: 'birtukan.mesfin@ethnologicalmuseum.et', phone: '+251911123002' },
  { name: 'Dawit Haile', email: 'dawit.haile@ethnologicalmuseum.et', phone: '+251911123003' },
  { name: 'Eyerusalem Bekele', email: 'eyerusalem.bekele@ethnologicalmuseum.et', phone: '+251911123004' },
  { name: 'Fikadu Alemayehu', email: 'fikadu.alemayehu@ethnologicalmuseum.et', phone: '+251911123005' },
  { name: 'Genet Assefa', email: 'genet.assefa@ethnologicalmuseum.et', phone: '+251911123006' },
  { name: 'Hailemariam Desalegn', email: 'hailemariam.desalegn@ethnologicalmuseum.et', phone: '+251911123007' },
  { name: 'Itsegenet Worku', email: 'itsegenet.worku@ethnologicalmuseum.et', phone: '+251911123008' },
  { name: 'Jembere Tesfaye', email: 'jembere.tesfaye@ethnologicalmuseum.et', phone: '+251911123009' },
  { name: 'Kidist Mulugeta', email: 'kidist.mulugeta@ethnologicalmuseum.et', phone: '+251911123010' }
];

const staffRoles = [
  { role: 'Senior Curator', department: 'Collections' },
  { role: 'Education Coordinator', department: 'Education' },
  { role: 'Conservation Specialist', department: 'Conservation' },
  { role: 'Digital Archivist', department: 'Digital' },
  { role: 'Security Officer', department: 'Security' },
  { role: 'Tour Guide', department: 'Education' },
  { role: 'Registrar', department: 'Collections' },
  { role: 'Collections Manager', department: 'Collections' },
  { role: 'Exhibitions Coordinator', department: 'Operations' },
  { role: 'Marketing Coordinator', department: 'Marketing' }
];

const ethiopianCities = [
  'Addis Ababa', 'Bahir Dar', 'Dire Dawa', 'Gondar', 
  'Mekelle', 'Hawassa', 'Jimma', 'Adama', 'Dessie', 'Harar'
];

const ethiopianEventTitles = [
  'Ethiopian Coffee Ceremony Workshop',
  'Ancient Aksumite Civilization Exhibition',
  'Traditional Ethiopian Textiles & Weaving',
  'Lalibela Rock Churches Virtual Tour',
  'Ethiopian Orthodox Art & Manuscripts',
  'Omo Valley Cultural Heritage Presentation',
  'Traditional Ethiopian Music & Dance',
  'Ethiopian Cuisine & Cultural Identity',
  'Solomonic Dynasty Historical Lecture',
  'Ethiopian Traditional Games & Sports'
];

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected Successfully');
  } catch (error) {
    console.error('❌ Database Connection Failed:', error);
    process.exit(1);
  }
}

async function seedStaff() {
  try {
    console.log('\n🏛️  Starting Staff Seeding...');

    // Find the Ethnological Museum
    const museum = await Museum.findOne({ name: 'Ethnological Museum' });
    if (!museum) {
      console.error('❌ Ethnological Museum not found. Please ensure it exists in the database.');
      return;
    }

    console.log(`📍 Found Museum: ${museum.name} (ID: ${museum._id})`);

    // Clear existing staff for this museum
    await Staff.deleteMany({ museum: museum._id });
    console.log('🗑️  Cleared existing staff records');

    const staffData = [];

    for (let i = 0; i < 10; i++) {
      const person = ethiopianNames[i];
      const roleInfo = staffRoles[i];
      const city = ethiopianCities[Math.floor(Math.random() * ethiopianCities.length)];
      
      // Generate realistic hire date (within last 5 years)
      const hireDate = new Date();
      hireDate.setFullYear(hireDate.getFullYear() - Math.floor(Math.random() * 5));
      hireDate.setMonth(Math.floor(Math.random() * 12));
      hireDate.setDate(Math.floor(Math.random() * 28) + 1);

      // Generate permissions based on role
      let permissions = ['view_museum_data', 'view_artifacts'];
      
      if (roleInfo.role === 'Senior Curator' || roleInfo.role === 'Collections Manager') {
        permissions.push('edit_artifacts', 'approve_artifacts', 'manage_artifact_status', 'view_analytics');
      }
      
      if (roleInfo.role === 'Education Coordinator' || roleInfo.role === 'Tour Guide') {
        permissions.push('view_events', 'edit_events', 'create_events', 'manage_registrations');
      }
      
      if (roleInfo.role === 'Conservation Specialist') {
        permissions.push('edit_artifacts', 'manage_artifact_status', 'upload_artifacts');
      }

      if (roleInfo.role === 'Digital Archivist') {
        permissions.push('upload_artifacts', 'edit_artifacts', 'view_analytics');
      }

      if (roleInfo.role === 'Marketing Coordinator') {
        permissions.push('view_events', 'edit_events', 'view_analytics', 'export_analytics');
      }

      const staffMember = {
        name: person.name,
        email: person.email,
        phone: person.phone,
        role: roleInfo.role,
        department: roleInfo.department,
        status: 'active',
        hireDate: hireDate,
        museum: museum._id,
        permissions: permissions,
        
        // Work Schedule (Monday-Friday, 8 AM - 5 PM)
        schedule: {
          monday: { working: true, startTime: '08:00', endTime: '17:00', breakTime: 60 },
          tuesday: { working: true, startTime: '08:00', endTime: '17:00', breakTime: 60 },
          wednesday: { working: true, startTime: '08:00', endTime: '17:00', breakTime: 60 },
          thursday: { working: true, startTime: '08:00', endTime: '17:00', breakTime: 60 },
          friday: { working: true, startTime: '08:00', endTime: '17:00', breakTime: 60 },
          saturday: { working: false },
          sunday: { working: false }
        },

        // Performance data
        performance: {
          rating: Math.floor(Math.random() * 3) + 3, // 3-5 rating
          completedTasks: Math.floor(Math.random() * 100) + 20,
          onTimeRate: Math.floor(Math.random() * 21) + 80, // 80-100%
          lastReviewDate: new Date(Date.now() - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000),
          goals: [
            {
              description: 'Complete professional development training',
              deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
              completed: Math.random() > 0.5
            }
          ]
        },

        // Personal Information
        personalInfo: {
          address: {
            street: `${Math.floor(Math.random() * 999) + 1} Kebele ${Math.floor(Math.random() * 20) + 1}`,
            city: city,
            state: city === 'Addis Ababa' ? 'Addis Ababa' : 'Regional State',
            country: 'Ethiopia'
          },
          nationality: 'Ethiopian',
          languages: ['Amharic', 'English', Math.random() > 0.5 ? 'Oromo' : 'Tigrinya'],
          education: [
            {
              degree: 'Bachelor of Arts',
              institution: 'Addis Ababa University',
              year: 2015 + Math.floor(Math.random() * 8),
              field: roleInfo.department === 'Collections' ? 'History' :
                     roleInfo.department === 'Education' ? 'Education' :
                     roleInfo.department === 'Conservation' ? 'Chemistry' :
                     roleInfo.department === 'Digital' ? 'Computer Science' :
                     'Museum Studies'
            }
          ]
        },

        // Emergency Contact
        emergencyContact: {
          name: `${person.name.split(' ')[0]} Family Contact`,
          relationship: Math.random() > 0.5 ? 'Spouse' : 'Parent',
          phone: `+251911${Math.floor(Math.random() * 999999).toString().padStart(6, '0')}`,
          email: `emergency.${person.email.split('@')[0]}@gmail.com`
        },

        // Employment Details
        employment: {
          employmentType: 'full-time',
          salary: {
            amount: Math.floor(Math.random() * 15000) + 8000, // 8,000 - 23,000 ETB
            currency: 'ETB',
            payFrequency: 'monthly'
          },
          benefits: ['Health Insurance', 'Annual Leave', 'Professional Development'],
          workLocation: 'on-site'
        },

        // Activity
        activity: {
          lastSeen: new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000),
          totalHoursWorked: Math.floor(Math.random() * 2000) + 1000,
          totalDaysWorked: Math.floor(Math.random() * 500) + 200,
          leaveBalance: {
            annual: Math.floor(Math.random() * 20) + 10,
            sick: Math.floor(Math.random() * 10) + 5,
            personal: Math.floor(Math.random() * 5) + 2
          }
        }
      };

      staffData.push(staffMember);
    }

    // Insert all staff members
    const insertedStaff = await Staff.insertMany(staffData);
    console.log(`✅ Successfully inserted ${insertedStaff.length} staff members`);

    // Display summary
    console.log('\n📋 Staff Summary:');
    insertedStaff.forEach((staff, index) => {
      console.log(`   ${index + 1}. ${staff.name} - ${staff.role} (${staff.department})`);
    });

    return insertedStaff;

  } catch (error) {
    console.error('❌ Error seeding staff:', error);
    throw error;
  }
}

async function seedEvents() {
  try {
    console.log('\n🎭 Starting Events Seeding...');

    // Find the museum and a museum admin user
    const museum = await Museum.findOne({ name: 'Ethnological Museum' });
    const organizer = await User.findOne({ 
      email: 'museum.admin@ethioheritage360.com',
      role: 'museumAdmin' 
    });

    if (!museum || !organizer) {
      console.error('❌ Required museum or organizer not found');
      return;
    }

    console.log(`📍 Found Museum: ${museum.name}`);
    console.log(`👤 Found Organizer: ${organizer.name}`);

    // Clear existing events for this museum
    await Event.deleteMany({ museum: museum._id });
    console.log('🗑️  Cleared existing event records');

    const eventsData = [];

    for (let i = 0; i < 8; i++) {
      const title = ethiopianEventTitles[i];
      
      // Generate future dates for events
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 90) + 1); // 1-90 days from now
      
      const endDate = new Date(startDate);
      endDate.setHours(endDate.getHours() + (Math.floor(Math.random() * 4) + 1)); // 1-4 hours duration

      const eventTypes = ['exhibition', 'workshop', 'lecture', 'cultural_event', 'educational_program'];
      const eventCategories = ['art', 'history', 'culture', 'archaeology', 'education'];
      
      const event = {
        title: title,
        description: `Join us for an immersive experience exploring ${title.toLowerCase()}. This event will provide deep insights into Ethiopian cultural heritage, featuring authentic demonstrations, expert presentations, and interactive sessions. Perfect for students, researchers, and anyone interested in Ethiopian culture and history.`,
        shortDescription: `Explore ${title.toLowerCase()} in this engaging cultural experience.`,
        museum: museum._id,
        organizer: organizer._id,
        type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
        category: eventCategories[Math.floor(Math.random() * eventCategories.length)],
        
        schedule: {
          startDate: startDate,
          endDate: endDate,
          startTime: `${Math.floor(Math.random() * 4) + 9}:00`, // 9:00-12:00
          endTime: `${Math.floor(Math.random() * 4) + 14}:00`, // 14:00-17:00
          timezone: 'Africa/Addis_Ababa',
          isRecurring: Math.random() > 0.8 // 20% chance of recurring
        },

        location: {
          type: 'physical',
          venue: 'Ethnological Museum Main Hall',
          address: 'Addis Ababa University, Sidist Kilo, Addis Ababa',
          room: `Hall ${String.fromCharCode(65 + Math.floor(Math.random() * 4))}` // Hall A, B, C, or D
        },

        registration: {
          required: Math.random() > 0.3, // 70% require registration
          capacity: Math.floor(Math.random() * 80) + 20, // 20-100 people
          currentRegistrations: 0,
          registrationDeadline: new Date(startDate.getTime() - 24 * 60 * 60 * 1000), // 1 day before
          fees: {
            adult: Math.floor(Math.random() * 100) + 50, // 50-150 ETB
            child: Math.floor(Math.random() * 50) + 20,   // 20-70 ETB
            student: Math.floor(Math.random() * 30) + 30, // 30-60 ETB
            member: Math.floor(Math.random() * 20) + 10   // 10-30 ETB
          },
          currency: 'ETB'
        },

        media: {
          images: [
            {
              url: `/uploads/events/event_${i + 1}_main.jpg`,
              caption: `Main promotional image for ${title}`,
              isPrimary: true,
              uploadedAt: new Date()
            }
          ]
        },

        speakers: [
          {
            name: ethiopianNames[Math.floor(Math.random() * ethiopianNames.length)].name,
            title: 'Cultural Heritage Expert',
            bio: 'Renowned expert in Ethiopian cultural studies with over 15 years of experience.',
            contact: {
              email: 'speaker@ethioheritage360.com'
            }
          }
        ],

        tags: [
          'ethiopian-culture',
          'heritage',
          'education',
          'museum',
          title.toLowerCase().replace(/\s+/g, '-')
        ],

        status: Math.random() > 0.2 ? 'published' : 'draft', // 80% published
        visibility: 'public',
        featured: Math.random() > 0.7, // 30% featured

        attendees: [], // Start with no attendees
        reviews: []
      };

      // Add recurrence details if recurring
      if (event.schedule.isRecurring) {
        event.schedule.recurrence = {
          frequency: 'weekly',
          interval: 1,
          endRecurrence: new Date(startDate.getTime() + 90 * 24 * 60 * 60 * 1000), // 3 months
          daysOfWeek: [startDate.getDay()] // Same day of week
        };
      }

      eventsData.push(event);
    }

    // Insert all events
    const insertedEvents = await Event.insertMany(eventsData);
    console.log(`✅ Successfully inserted ${insertedEvents.length} events`);

    // Display summary
    console.log('\n📅 Events Summary:');
    insertedEvents.forEach((event, index) => {
      const startDate = new Date(event.schedule.startDate).toLocaleDateString();
      console.log(`   ${index + 1}. ${event.title} - ${startDate} (${event.status})`);
    });

    return insertedEvents;

  } catch (error) {
    console.error('❌ Error seeding events:', error);
    throw error;
  }
}

async function main() {
  try {
    console.log('🌱 Starting Database Seeding with Ethiopian Data...');
    
    // Connect to database
    await connectDB();

    // Seed staff and events
    const staff = await seedStaff();
    const events = await seedEvents();

    console.log('\n🎉 Seeding Completed Successfully!');
    console.log(`📊 Summary:`);
    console.log(`   👥 Staff Members: ${staff.length}`);
    console.log(`   🎭 Events: ${events.length}`);
    console.log(`   🏛️  Museum: Ethnological Museum`);

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('\n📝 Database connection closed');
  }
}

// Run the seeding script
if (require.main === module) {
  main();
}

module.exports = { seedStaff, seedEvents };
