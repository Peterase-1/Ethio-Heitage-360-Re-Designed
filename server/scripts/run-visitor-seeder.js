#!/usr/bin/env node

const seedVisitorRegistrations = require('./seed-visitor-registrations');

console.log('🌱 Starting Ethiopian Visitor Registration Seeder...');
console.log('📊 This will populate the database with realistic Ethiopian visitor data');
console.log('');

seedVisitorRegistrations()
  .then(() => {
    console.log('');
    console.log('✅ Seeding completed successfully!');
    console.log('🎉 You can now test the Visitor Registration system with Ethiopian data');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  });
