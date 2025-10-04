// Diagnose and Fix Museum Admin Login Issue
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// User Schema (exact same as server.js)
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

async function diagnoseAndFix() {
  try {
    console.log('🔄 Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to production MongoDB');

    // Check what users currently exist
    console.log('\n📋 Current users in database:');
    const allUsers = await User.find({}, 'name email role isActive createdAt');
    if (allUsers.length === 0) {
      console.log('⚠️ No users found in database!');
    } else {
      allUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name} (${user.email}) - Role: ${user.role} - Active: ${user.isActive}`);
      });
    }

    // Check specifically for museum admin
    console.log('\n🏛️ Checking museum admin account...');
    const museumAdmin = await User.findOne({ email: 'museum.admin@ethioheritage360.com' });
    
    if (!museumAdmin) {
      console.log('❌ Museum admin does NOT exist. Creating now...');
      
      // Create museum admin
      const newMuseumAdmin = new User({
        name: 'Museum Administrator',
        email: 'museum.admin@ethioheritage360.com',
        password: 'museum123',
        role: 'admin',
        isActive: true
      });

      await newMuseumAdmin.save();
      console.log('✅ Museum admin created successfully!');
      
      // Test the password
      const passwordTest = await newMuseumAdmin.comparePassword('museum123');
      console.log('🔓 Password test result:', passwordTest ? 'PASS' : 'FAIL');
      
    } else {
      console.log('✅ Museum admin EXISTS in database');
      console.log('📧 Email:', museumAdmin.email);
      console.log('👤 Name:', museumAdmin.name);
      console.log('🔑 Role:', museumAdmin.role);
      console.log('✅ Active:', museumAdmin.isActive);
      console.log('📅 Created:', museumAdmin.createdAt);
      console.log('🔄 Last Login:', museumAdmin.lastLogin || 'Never');

      // Test password comparison
      console.log('\n🔓 Testing password "museum123"...');
      const isPasswordValid = await museumAdmin.comparePassword('museum123');
      console.log('Password validation:', isPasswordValid ? 'CORRECT ✅' : 'INCORRECT ❌');
      
      if (!isPasswordValid) {
        console.log('🔧 Password is wrong! Resetting to "museum123"...');
        museumAdmin.password = 'museum123';
        await museumAdmin.save();
        console.log('✅ Password reset successfully!');
        
        // Test again
        const retestPassword = await museumAdmin.comparePassword('museum123');
        console.log('🔓 Retest password:', retestPassword ? 'CORRECT ✅' : 'STILL INCORRECT ❌');
      }
    }

    // Ensure all default users exist
    console.log('\n👥 Checking all default admin accounts...');
    
    const defaultUsers = [
      { name: 'Super Admin', email: 'melkamuwako5@admin.com', password: 'admin123', role: 'super_admin' },
      { name: 'Heritage Tour Organizer', email: 'organizer@heritagetours.et', password: 'tour123', role: 'tour_organizer' },
      { name: 'Museum Administrator', email: 'museum.admin@ethioheritage360.com', password: 'museum123', role: 'admin' }
    ];

    for (const defaultUser of defaultUsers) {
      const existing = await User.findOne({ email: defaultUser.email });
      if (!existing) {
        const newUser = new User(defaultUser);
        await newUser.save();
        console.log(`✅ Created ${defaultUser.role}: ${defaultUser.email}`);
      } else {
        console.log(`✅ Exists ${defaultUser.role}: ${defaultUser.email}`);
      }
    }

    console.log('\n🎉 DIAGNOSIS COMPLETE!');
    console.log('\n📋 PRODUCTION LOGIN CREDENTIALS:');
    console.log('='.repeat(50));
    console.log('Super Admin: melkamuwako5@admin.com / admin123');
    console.log('Museum Admin: museum.admin@ethioheritage360.com / museum123');
    console.log('Tour Organizer: organizer@heritagetours.et / tour123');
    console.log('='.repeat(50));

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('ENOTFOUND')) {
      console.error('🌐 This appears to be a network/DNS issue with MongoDB Atlas');
      console.error('💡 Try: 1. Check internet connection 2. Verify MongoDB Atlas cluster is running');
    }
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

diagnoseAndFix();
