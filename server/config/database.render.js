const mongoose = require('mongoose');
const config = require('./env');

// Connection options optimized for Render deployment
const connectionOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10, // Maximum number of connections in the connection pool
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  family: 4, // Use IPv4, skip trying IPv6
  bufferCommands: false, // Disable mongoose buffering
  bufferMaxEntries: 0, // Disable mongoose buffering
  // Render-specific optimizations
  heartbeatFrequencyMS: 10000, // Heartbeat every 10 seconds
  retryWrites: true,
  w: 'majority',
  readPreference: 'primary',
  // Connection pool settings for serverless/container environments
  minPoolSize: 0, // Minimum number of connections
  maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
  waitQueueTimeoutMS: 10000, // How long to wait for a connection to become available
};

// Enhanced connection with retry logic for Render
let isConnected = false;
let connectionAttempts = 0;
const maxRetries = 5;

const connectWithRetry = async () => {
  try {
    connectionAttempts++;
    console.log(`🔄 Connecting to MongoDB Atlas (attempt ${connectionAttempts}/${maxRetries})...`);
    
    await mongoose.connect(config.MONGODB_URI, connectionOptions);
    
    isConnected = true;
    connectionAttempts = 0;
    console.log('✅ MongoDB connected successfully to Atlas cluster');
    console.log(`📍 Database: ${mongoose.connection.db.databaseName}`);
    console.log(`🌐 Host: ${mongoose.connection.host}`);
    
    // Handle connection events
    mongoose.connection.on('error', (error) => {
      console.error('❌ MongoDB connection error:', error);
      isConnected = false;
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
      isConnected = false;
      
      // Attempt to reconnect if not intentionally disconnected
      if (connectionAttempts < maxRetries) {
        console.log('🔄 Attempting to reconnect to MongoDB...');
        setTimeout(connectWithRetry, 5000);
      }
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
      isConnected = true;
    });

    // Graceful shutdown handling for Render
    process.on('SIGINT', async () => {
      console.log('🔄 Gracefully shutting down MongoDB connection...');
      await mongoose.connection.close();
      console.log('✅ MongoDB connection closed');
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log('🔄 Gracefully shutting down MongoDB connection...');
      await mongoose.connection.close();
      console.log('✅ MongoDB connection closed');
      process.exit(0);
    });

  } catch (error) {
    console.error(`❌ MongoDB connection failed (attempt ${connectionAttempts}/${maxRetries}):`, error.message);
    
    if (connectionAttempts < maxRetries) {
      console.log(`⏳ Retrying in 5 seconds...`);
      setTimeout(connectWithRetry, 5000);
    } else {
      console.error('💥 Max connection attempts reached. Exiting...');
      process.exit(1);
    }
  }
};

// Database utilities for Render environment
const dbUtils = {
  isConnected: () => isConnected && mongoose.connection.readyState === 1,
  
  getConnectionStatus: () => {
    const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    return states[mongoose.connection.readyState] || 'unknown';
  },
  
  async getDbStats() {
    if (!this.isConnected()) {
      throw new Error('Database not connected');
    }
    
    try {
      const stats = await mongoose.connection.db.stats();
      return {
        collections: stats.collections,
        dataSize: stats.dataSize,
        storageSize: stats.storageSize,
        indexes: stats.indexes,
        indexSize: stats.indexSize,
        objects: stats.objects
      };
    } catch (error) {
      console.error('Error getting database stats:', error);
      throw error;
    }
  },
  
  async ping() {
    if (!this.isConnected()) {
      throw new Error('Database not connected');
    }
    
    try {
      await mongoose.connection.db.admin().ping();
      return true;
    } catch (error) {
      console.error('Database ping failed:', error);
      return false;
    }
  },
  
  // Health check specifically for Render
  async healthCheck() {
    const status = {
      connected: this.isConnected(),
      status: this.getConnectionStatus(),
      database: mongoose.connection.db?.databaseName || 'unknown',
      host: mongoose.connection.host || 'unknown',
      timestamp: new Date().toISOString()
    };
    
    if (status.connected) {
      try {
        await this.ping();
        status.ping = 'success';
      } catch (error) {
        status.ping = 'failed';
        status.error = error.message;
      }
    }
    
    return status;
  }
};

module.exports = {
  connectDB: connectWithRetry,
  dbUtils,
  mongoose
};
