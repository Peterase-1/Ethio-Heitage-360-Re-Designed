const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '../../backend/.env' });

// User Schema - EXACT copy from server.js
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['visitor', 'admin', 'super_admin', 'museum_curator', 'tour_organizer', 'education_coordinator'], 
    default: 'visitor' 
  },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

const seedUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB for seeding...');

    // Clear existing users (optional - comment out if you want to keep existing data)
    // await User.deleteMany({});
    // console.log('Cleared existing users');

    // Create admin users based on provided credentials
    const adminUsers = [
      {
        firstName: 'Melkamu',
        lastName: 'Wako',
        name: 'Melkamu Wako',
        email: 'melkamuwako5@admin.com',
        password: 'melkamuwako5',
        role: 'super_admin',
        profile: {
          bio: 'Super Administrator of EthioHeritage360 platform'
        },
        preferences: {
          language: 'en',
          notifications: {
            email: true,
            push: true
          }
        },
        isVerified: true,
        isActive: true
      },
      {
        firstName: 'Abdurazak',
        lastName: 'M',
        name: 'Abdurazak M',
        email: 'abdurazakm343@admin.com',
        password: 'THpisvaHUbQNMsbX',
        role: 'super_admin',
        profile: {
          bio: 'Database Administrator with readWriteAnyDatabase privileges'
        },
        preferences: {
          language: 'en',
          notifications: {
            email: true,
            push: true
          }
        },
        isVerified: true,
        isActive: true
      },
      {
        firstName: 'Student',
        lastName: 'Pasegid',
        name: 'Student Pasegid',
        email: 'student.pasegid@admin.com',
        password: 'Fs4HwlXCW4SJvkyN',
        role: 'super_admin',
        profile: {
          bio: 'Database Administrator for ethioheritage360 database'
        },
        preferences: {
          language: 'en',
          notifications: {
            email: true,
            push: true
          }
        },
        isVerified: true,
        isActive: true
      },
      {
        firstName: 'Naol',
        lastName: 'Aboma',
        name: 'Naol Aboma',
        email: 'naolaboma@admin.com',
        password: 'QR7ICwI5s6VMgAZD',
        role: 'super_admin',
        profile: {
          bio: 'Super Administrator with full system access'
        },
        preferences: {
          language: 'en',
          notifications: {
            email: true,
            push: true
          }
        },
        isVerified: true,
        isActive: true
      }
    ];

    // Create museum admin users
    const museumAdmins = [
      {
        firstName: 'National Museum',
        lastName: 'Admin',
        name: 'National Museum Admin',
        email: 'museum.admin@ethioheritage360.com',
        password: 'museum123',
        role: 'admin',
        profile: {
          bio: 'Administrator for National Museum of Ethiopia'
        },
        preferences: {
          language: 'en',
          notifications: {
            email: true,
            push: true
          }
        },
        isVerified: true,
        isActive: true
      }
    ];

    // Create test users including organizers (note: using 'user' role since there's no organizer role in the model)
    const testUsers = [
      {
        firstName: 'Heritage Tours',
        lastName: 'Ethiopia',
        name: 'Heritage Tours Ethiopia',
        email: 'organizer@heritagetours.et',
        password: 'organizer123',
        role: 'tour_organizer',
        profile: {
          bio: 'Professional heritage tour organizer specializing in Ethiopian cultural sites'
        },
        preferences: {
          language: 'en',
          notifications: {
            email: true,
            push: true
          }
        },
        isVerified: true,
        isActive: true
      },
      {
        firstName: 'Tour Guide',
        lastName: 'Demo',
        name: 'Tour Guide Demo',
        email: 'tourguide@demo.com',
        password: 'tourguide123',
        role: 'visitor',
        profile: {
          bio: 'Demo tour organizer account for testing dashboard access'
        },
        preferences: {
          language: 'en',
          notifications: {
            email: true,
            push: true
          }
        },
        isVerified: true,
        isActive: true
      },
      {
        firstName: 'Test',
        lastName: 'User',
        name: 'Test User',
        email: 'test@example.com',
        password: 'test123456',
        role: 'visitor',
        profile: {
          bio: 'Test user for development and authentication testing'
        },
        preferences: {
          language: 'en',
          notifications: {
            email: true,
            push: true
          }
        },
        isVerified: true,
        isActive: true
      }
    ];

    // Combine all users
    const allUsers = [...adminUsers, ...museumAdmins, ...testUsers];

    // Insert users
    for (const userData of allUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        const user = new User(userData);
        await user.save();
        console.log(`Created user: ${userData.name} (${userData.email}) - Role: ${userData.role}`);
      } else {
        console.log(`User already exists: ${userData.email}`);
      }
    }

    console.log('Database seeding completed successfully!');
    console.log('\n=== LOGIN CREDENTIALS ===');
    console.log('\nSuper Admins:');
    console.log('1. melkamuwako5@admin.com / melkamuwako5');
    console.log('2. abdurazakm343@admin.com / THpisvaHUbQNMsbX');
    console.log('3. student.pasegid@admin.com / Fs4HwlXCW4SJvkyN');
    console.log('4. naolaboma@admin.com / QR7ICwI5s6VMgAZD');
    console.log('\nMuseum Admin:');
    console.log('5. museum.admin@ethioheritage360.com / museum123');
    console.log('\nTour Organizers/Users:');
    console.log('6. organizer@heritagetours.et / organizer123');
    console.log('7. tourguide@demo.com / tourguide123');
    console.log('\nTest User:');
    console.log('8. test@example.com / test123456');
    console.log('\n========================');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run the seeding function
seedUsers();