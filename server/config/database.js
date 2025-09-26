const mongoose = require('mongoose');

// Database utility functions
const dbUtils = {
  // Get connection status
  getConnectionStatus: () => {
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
      99: 'uninitialized'
    };
    return states[mongoose.connection.readyState] || 'unknown';
  },

  // Check if database is connected
  isConnected: () => mongoose.connection.readyState === 1,

  // Get database statistics
  getDbStats: async () => {
    if (!dbUtils.isConnected()) {
      throw new Error('Database not connected');
    }
    try {
      const collections = await mongoose.connection.db.listCollections().toArray();
      const stats = await mongoose.connection.db.stats();
      return {
        collections: collections.map(col => col.name),
        collectionsCount: collections.length,
        dbSize: stats.dataSize,
        storageSize: stats.storageSize,
        indexes: stats.indexes
      };
    } catch (error) {
      throw new Error(`Error getting database stats: ${error.message}`);
    }
  },

  // Create database indexes for performance
  createIndexes: async () => {
    try {
      console.log('Creating database indexes...');
      
      // User collection indexes
      await mongoose.connection.db.collection('users').createIndex({ email: 1 }, { unique: true });
      await mongoose.connection.db.collection('users').createIndex({ role: 1 });
      await mongoose.connection.db.collection('users').createIndex({ isActive: 1 });
      await mongoose.connection.db.collection('users').createIndex({ museumId: 1 });
      await mongoose.connection.db.collection('users').createIndex({ createdAt: -1 });
      
      console.log('✅ Database indexes created successfully');
    } catch (error) {
      console.error('Error creating indexes:', error.message);
    }
  },

  // Close database connection gracefully
  closeConnection: async () => {
    try {
      await mongoose.connection.close();
      console.log('Database connection closed');
    } catch (error) {
      console.error('Error closing database connection:', error.message);
    }
  }
};

const connectDB = async () => {
  try {
    // Set mongoose options
    mongoose.set('strictQuery', false);
    
    console.log('Connecting to MongoDB...');
    console.log('Database URI:', process.env.MONGODB_URI?.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@') || 'Not set');
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000 // Close sockets after 45 seconds of inactivity
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    console.log(`🔗 Connection Status: ${dbUtils.getConnectionStatus()}`);
    
    // Create indexes on connection
    await dbUtils.createIndexes();
    
    // Set up connection event listeners
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });
    
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error.message);
    if (error.name === 'MongoNetworkError') {
      console.error('Network error - check if MongoDB is running and accessible');
    }
    if (error.name === 'MongoAuthenticationError') {
      console.error('Authentication error - check your credentials');
    }
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nReceived SIGINT. Gracefully shutting down...');
  await dbUtils.closeConnection();
  process.exit(0);
});

module.exports = { connectDB, dbUtils };

