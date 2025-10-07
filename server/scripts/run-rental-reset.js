#!/usr/bin/env node

const resetRentalSystem = require('./reset-rental-system');

console.log('🔄 Starting Rental System Reset...');
console.log('🗑️ This will clear all existing rental request data');
console.log('');

resetRentalSystem()
  .then(() => {
    console.log('');
    console.log('✅ Rental system reset completed successfully!');
    console.log('🎉 You can now test the bidirectional rental system');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Rental system reset failed:', error);
    process.exit(1);
  });
