// Fix Database - Clean up invalid user roles and ensure proper user creation
// Using EXACT credentials from server/scripts/seed.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');

// Load environment variables from the backend .env file
require('dotenv').config({ path: path.join(__dirname, '.env') });

console.log('🔧 EthioHeritage360 Database Fix Tool');
console.log('=====================================');
console.log('Using credentials from server/scripts/seed.js');

// Debug environment variables
console.log('🔍 Debug Info:');
console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);
console.log('MONGO_URI exists:', !!process.env.MONGO_URI);
if (process.env.MONGODB_URI) {
  console.log('MONGODB_URI starts with:', process.env.MONGODB_URI.substring(0, 20) + '...');
}

// User Schema - EXACT same as server.js (updated version)
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['visitor', 'admin', 'super_admin', 'museum', 'museum_curator', 'tour_organizer', 'education_coordinator'], 
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

async function fixDatabase() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    console.log('\n📋 Step 1: Check current users...');
    const allUsers = await User.find({});
    console.log(`Found ${allUsers.length} users in database`);

    if (allUsers.length > 0) {
      console.log('\nCurrent users:');
      allUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.email} - Role: ${user.role} - Active: ${user.isActive}`);
      });
    }

    console.log('\n🧹 Step 2: Remove users with invalid roles...');
    const validRoles = ['visitor', 'admin', 'super_admin', 'museum', 'museum_curator', 'tour_organizer', 'education_coordinator'];
    
    const invalidUsers = await User.find({ role: { $nin: validRoles } });
    if (invalidUsers.length > 0) {
      console.log(`Found ${invalidUsers.length} users with invalid roles:`);
      invalidUsers.forEach(user => {
        console.log(`- ${user.email}: "${user.role}" (INVALID)`);
      });
      
      const deleteResult = await User.deleteMany({ role: { $nin: validRoles } });
      console.log(`✅ Deleted ${deleteResult.deletedCount} users with invalid roles`);
    } else {
      console.log('✅ No users with invalid roles found');
    }

    console.log('\n👥 Step 3: Create admin users (from seed.js)...');
    
    // Admin users - EXACT from seed.js
    const adminUsers = [
      {
        name: 'Melkamu Wako',
        email: 'melkamuwako5@admin.com',
        password: 'melkamuwako5',
        role: 'super_admin',
        isActive: true
      },
      {
        name: 'Abdurazak M',
        email: 'abdurazakm343@admin.com',
        password: 'THpisvaHUbQNMsbX',
        role: 'super_admin',
        isActive: true
      },
      {
        name: 'Student Pasegid',
        email: 'student.pasegid@admin.com',
        password: 'Fs4HwlXCW4SJvkyN',
        role: 'super_admin',
        isActive: true
      },
      {
        name: 'Naol Aboma',
        email: 'naolaboma@admin.com',
        password: 'QR7ICwI5s6VMgAZD',
        role: 'super_admin',
        isActive: true
      }
    ];

    console.log('\n🏛️ Step 4: Create museum admin (from seed.js)...');
    
    // Museum admin - EXACT from seed.js
    const museumAdmins = [
      {
        name: 'National Museum Admin',
        email: 'museum.admin@ethioheritage360.com',
        password: 'museum123',
        role: 'admin',
        isActive: true
      }
    ];

    console.log('\n🗺️ Step 5: Create tour organizers (from seed.js)...');
    
    // Tour organizers - EXACT from seed.js
    const tourUsers = [
      {
        name: 'Heritage Tours Ethiopia',
        email: 'organizer@heritagetours.et',
        password: 'organizer123',
        role: 'tour_organizer',
        isActive: true
      },
      {
        name: 'Tour Guide Demo',
        email: 'tourguide@demo.com',
        password: 'tourguide123',
        role: 'visitor',
        isActive: true
      },
      {
        name: 'Test User',
        email: 'test@example.com',
        password: 'test123456',
        role: 'visitor',
        isActive: true
      }
    ];

    // Combine all users
    const allUsersToCreate = [...adminUsers, ...museumAdmins, ...tourUsers];
    const results = [];

    console.log('\n🚀 Processing all users...');
    for (const userData of allUsersToCreate) {
      try {
        // Check if user exists
        const existingUser = await User.findOne({ email: userData.email });
        
        if (existingUser) {
          // Update existing user
          existingUser.password = userData.password;
          existingUser.role = userData.role;
          existingUser.isActive = userData.isActive;
          existingUser.name = userData.name;
          await existingUser.save();
          
          results.push({
            email: userData.email,
            action: 'updated',
            role: userData.role,
            status: 'success'
          });
          console.log(`✅ Updated ${userData.email} - Role: ${userData.role}`);
        } else {
          // Create new user
          const newUser = new User(userData);
          await newUser.save();
          
          results.push({
            email: userData.email,
            action: 'created',
            role: userData.role,
            status: 'success'
          });
          console.log(`✅ Created ${userData.email} - Role: ${userData.role}`);
        }
        
        // Test password
        const testUser = await User.findOne({ email: userData.email });
        const passwordTest = await testUser.comparePassword(userData.password);
        results[results.length - 1].passwordTest = passwordTest ? 'PASS' : 'FAIL';
        
        console.log(`   Password test: ${passwordTest ? 'PASS ✅' : 'FAIL ❌'}`);
        
      } catch (error) {
        results.push({
          email: userData.email,
          action: 'failed',
          status: 'error',
          error: error.message
        });
        console.error(`❌ Failed ${userData.email}:`, error.message);
      }
    }

    console.log('\n📊 Step 6: Final verification...');
    const finalUsers = await User.find({});
    console.log(`\nFinal user count: ${finalUsers.length}`);
    
    console.log('\nAll users:');
    finalUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email}`);
      console.log(`   Name: ${user.name}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Active: ${user.isActive}`);
      console.log(`   Created: ${user.createdAt}`);
      console.log('');
    });

    console.log('🎉 DATABASE FIX COMPLETED SUCCESSFULLY!');
    console.log('=========================================');
    
    console.log('\n📋 RESULTS SUMMARY:');
    results.forEach(result => {
      const status = result.status === 'success' ? '✅' : '❌';
      console.log(`${status} ${result.email}: ${result.action} - Password: ${result.passwordTest || 'N/A'}`);
    });

    console.log('\n📝 CORRECTED LOGIN CREDENTIALS (from seed.js):');
    console.log('='.repeat(60));
    console.log('\n🔥 Super Admins:');
    console.log('1. melkamuwako5@admin.com / melkamuwako5');
    console.log('2. abdurazakm343@admin.com / THpisvaHUbQNMsbX');
    console.log('3. student.pasegid@admin.com / Fs4HwlXCW4SJvkyN');
    console.log('4. naolaboma@admin.com / QR7ICwI5s6VMgAZD');
    console.log('\n🏛️ Museum Admin:');
    console.log('5. museum.admin@ethioheritage360.com / museum123');
    console.log('\n🗺️ Tour Organizers/Users:');
    console.log('6. organizer@heritagetours.et / organizer123');
    console.log('7. tourguide@demo.com / tourguide123');
    console.log('\n🧪 Test User:');
    console.log('8. test@example.com / test123456');
    console.log('='.repeat(60));
    
    console.log('\n🚀 Your server should now work properly!');
    console.log('💡 Try logging in with any of the above credentials.');
    console.log('🔗 Login URL: https://ethioheritage360-ethiopianheritagepf.netlify.app/');

  } catch (error) {
    console.error('❌ Fix failed:', error);
    
    if (error.name === 'ValidationError') {
      console.error('\n📋 Validation Error Details:');
      Object.keys(error.errors).forEach(key => {
        console.error(`- ${key}: ${error.errors[key].message}`);
      });
    }
    
    if (error.message.includes('ENOTFOUND')) {
      console.error('\n🌐 This appears to be a network/DNS issue.');
      console.error('💡 Check: 1. Internet connection 2. MongoDB Atlas status');
    }
    
    if (error.code === 11000) {
      console.error('\n📧 Duplicate email error - this is normal during updates.');
    }
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
}

// Run the fix
fixDatabase();
