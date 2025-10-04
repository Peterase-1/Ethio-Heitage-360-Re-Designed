#!/usr/bin/env node

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.test' });

console.log('🔍 Testing MongoDB Atlas Connection...');
console.log('=====================================\n');

// MongoDB connection string
const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://melkamuwako5:rhkLGujTdrlrQkAu@ethioheritage360.tuhmybp.mongodb.net/ethioheritage360?retryWrites=true&w=majority&appName=ethioheritage360';
const dbName = process.env.DB_NAME || 'ethioheritage360';

console.log('📍 Database:', dbName);
console.log('🌐 Connection String:', mongoURI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));

const connectionOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4,
  bufferCommands: false,
  retryWrites: true,
  w: 'majority'
};

async function testConnection() {
  try {
    console.log('\n🔄 Attempting to connect to MongoDB Atlas...\n');
    
    // Connect to MongoDB
    await mongoose.connect(mongoURI, connectionOptions);
    
    console.log('✅ Successfully connected to MongoDB Atlas!');
    console.log(`📊 Database: ${mongoose.connection.db.databaseName}`);
    console.log(`🏠 Host: ${mongoose.connection.host}`);
    console.log(`🔗 Ready State: ${mongoose.connection.readyState} (1=connected)`);
    
    // Test database operations
    console.log('\n🧪 Testing database operations...');
    
    // Get database stats
    const stats = await mongoose.connection.db.stats();
    console.log('📈 Database Stats:');
    console.log(`   Collections: ${stats.collections}`);
    console.log(`   Data Size: ${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Storage Size: ${(stats.storageSize / 1024 / 1024).toFixed(2)} MB`);
    
    // List collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`📁 Collections (${collections.length}):`);
    collections.forEach(collection => {
      console.log(`   - ${collection.name}`);
    });
    
    // Test ping
    await mongoose.connection.db.admin().ping();
    console.log('🏓 Ping test: ✅ Success');
    
    console.log('\n🎉 All tests passed! MongoDB Atlas is working correctly.\n');
    
  } catch (error) {
    console.error('\n❌ MongoDB connection failed:');
    console.error('Error:', error.message);
    
    if (error.message.includes('authentication failed')) {
      console.error('\n🔐 Authentication Error:');
      console.error('- Check your username and password');
      console.error('- Ensure the database user has proper permissions');
    } else if (error.message.includes('timeout')) {
      console.error('\n⏱️ Timeout Error:');
      console.error('- Check your network connection');
      console.error('- Verify MongoDB Atlas IP whitelist settings');
    } else if (error.message.includes('ENOTFOUND')) {
      console.error('\n🌐 DNS Error:');
      console.error('- Check the connection string format');
      console.error('- Verify the cluster name and region');
    }
    
    console.error('\n🛠️ Troubleshooting Steps:');
    console.error('1. Verify MongoDB Atlas cluster is running');
    console.error('2. Check IP whitelist (should include 0.0.0.0/0 for Render)');
    console.error('3. Confirm username and password are correct');
    console.error('4. Ensure database user has read/write permissions');
    
    process.exit(1);
  } finally {
    // Close connection
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('🔌 Connection closed.\n');
    }
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n⚠️ Received SIGINT, closing connection...');
  await mongoose.connection.close();
  process.exit(0);
});

// Run the test
testConnection();
