const mongoose = require('mongoose');
const User = require('../models/User');
const Museum = require('../models/Museum');
require('dotenv').config();

async function fixMuseumAdmin() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find the museum admin user
    const museumAdmin = await User.findOne({ 
      email: 'museum.admin@ethioheritage360.com',
      role: 'museumAdmin'
    });

    if (!museumAdmin) {
      console.log('❌ Museum admin user not found');
      // Create a museum admin if not exists
      const newMuseumAdmin = await User.create({
        firstName: 'Museum',
        lastName: 'Admin',
        email: 'museum.admin@ethioheritage360.com',
        password: 'TempPassword123!', // This will be hashed
        role: 'museumAdmin',
        isVerified: true,
        permissions: [
          'manage_museum_profile',
          'manage_museum_staff',
          'manage_artifacts',
          'create_events',
          'approve_local_rentals',
          'view_museum_analytics',
          'suggest_heritage_sites',
          'manage_virtual_museum'
        ]
      });
      console.log('✅ Museum admin created:', newMuseumAdmin.email);
      museumAdmin = newMuseumAdmin;
    } else {
      console.log('✅ Museum admin found:', museumAdmin.email);
    }

    // Check if museum admin already has a museum assigned
    if (museumAdmin.museumId) {
      console.log('✅ Museum admin already has museum assigned:', museumAdmin.museumId);
      await mongoose.connection.close();
      return;
    }

    // Find or create the National Museum
    let museum = await Museum.findOne({ 
      name: { $regex: 'National Museum', $options: 'i' }
    });

    if (!museum) {
      // Create the National Museum
      museum = await Museum.create({
        name: 'National Museum of Ethiopia',
        description: 'The National Museum of Ethiopia, also referred to as the Ethiopian National Museum, is a national museum in Ethiopia.',
        location: {
          type: 'Point',
          coordinates: [38.7612, 9.0084], // [longitude, latitude] for GeoJSON
          address: 'King George VI St, Addis Ababa, Ethiopia',
          city: 'Addis Ababa',
          country: 'Ethiopia'
        },
        contactInfo: {
          phone: '+251-11-117-150',
          email: 'info@nationalmuseum.gov.et',
          website: 'http://www.nationalmuseum.gov.et'
        },
        operatingHours: {
          monday: { open: '08:30', close: '17:30', closed: false },
          tuesday: { open: '08:30', close: '17:30', closed: false },
          wednesday: { open: '08:30', close: '17:30', closed: false },
          thursday: { open: '08:30', close: '17:30', closed: false },
          friday: { open: '08:30', close: '17:30', closed: false },
          saturday: { open: '08:30', close: '17:30', closed: false },
          sunday: { open: '08:30', close: '17:30', closed: false }
        },
        admin: museumAdmin._id,
        status: 'approved',
        verified: true,
        isActive: true,
        founded: '1958',
        facilities: ['Parking', 'Gift Shop', 'Cafe', 'Guided Tours', 'Audio Guide'],
        features: {
          hasGuidedTours: true,
          hasEducationalPrograms: true,
          hasGiftShop: true,
          hasCafe: true,
          hasParking: true
        },
        admissionFee: {
          adult: 10,
          student: 5,
          child: 0,
          senior: 8
        }
      });
      console.log('✅ National Museum created:', museum.name);
    } else {
      console.log('✅ National Museum found:', museum.name);
    }

    // Assign the museum to the museum admin
    await User.findByIdAndUpdate(
      museumAdmin._id,
      { 
        museumId: museum._id,
        position: 'Museum Administrator',
        department: 'Administration'
      }
    );

    console.log('✅ Museum admin successfully associated with museum');
    console.log(`   Admin: ${museumAdmin.email}`);
    console.log(`   Museum: ${museum.name}`);
    console.log(`   Museum ID: ${museum._id}`);

    // Also ensure the museum has the admin as a staff member
    await Museum.findByIdAndUpdate(
      museum._id,
      { 
        $push: { 
          staff: {
            user: museumAdmin._id,
            role: 'curator',
            permissions: ['manage_artifacts', 'manage_tours', 'view_analytics', 'manage_rentals']
          }
        }
      }
    );

    console.log('✅ Museum updated with admin reference');
    console.log('\n🎉 Museum admin setup completed successfully!');
    console.log('\n📋 Login Details:');
    console.log(`   Email: museum.admin@ethioheritage360.com`);
    console.log(`   Museum: ${museum.name}`);
    console.log(`   Role: Museum Administrator`);

  } catch (error) {
    console.error('❌ Error fixing museum admin:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the fix
if (require.main === module) {
  fixMuseumAdmin();
}

module.exports = fixMuseumAdmin;
