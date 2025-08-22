const mongoose = require('mongoose');
const User = require('../models/User');
const config = require('../config/env');

const updateAdminRoles = async () => {
  try {
    await mongoose.connect(config.MONGODB_URI);
    console.log('Connected to MongoDB...');
    
    const adminEmails = [
      'melkamuwako5@admin.com',
      'abdurazakm343@admin.com', 
      'student.pasegid@admin.com',
      'naolaboma@admin.com'
    ];
    
    for (const email of adminEmails) {
      const result = await User.updateOne(
        { email: email },
        { $set: { role: 'super_admin' } }
      );
      console.log(`Updated ${email}: ${result.modifiedCount} document(s) modified`);
    }
    
    console.log('\nAll admin roles updated to super_admin!');
    console.log('These users can now access the Super Admin dashboard at /super-admin');
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error updating roles:', error);
  }
};

updateAdminRoles();
