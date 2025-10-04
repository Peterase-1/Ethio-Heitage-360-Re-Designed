const mongoose = require('mongoose');
require('dotenv').config();

console.log('Testing MongoDB connection...');
console.log('MongoDB URI:', process.env.MONGODB_URI ? process.env.MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@') : 'Not set');

if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI environment variable is not set!');
  process.exit(1);
}

mongoose.connect(process.env.MONGODB_URI, {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000
}).then(() => {
  console.log('✅ Connection successful!');
  console.log('Database name:', mongoose.connection.name);
  console.log('Host:', mongoose.connection.host);
  process.exit(0);
}).catch((error) => {
  console.error('❌ Connection failed:', error.message);
  console.error('Error name:', error.name);
  if (error.name === 'MongoServerError' && error.codeName === 'AuthenticationFailed') {
    console.error('\n🔍 Troubleshooting tips:');
    console.error('1. Check if the username and password are correct');
    console.error('2. Verify the user has permission to access this database');
    console.error('3. Make sure the user was created in the correct database');
    console.error('4. Check if the cluster is accessible from your IP');
  }
  process.exit(1);
});
