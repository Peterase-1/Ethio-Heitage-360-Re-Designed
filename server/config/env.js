try {
    require('dotenv').config();
} catch (error) {
    console.log('dotenv not available, using environment variables directly');
}

module.exports = {
  PORT: process.env.PORT || 5001,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/ethioheritage360',
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
  NODE_ENV: process.env.NODE_ENV || 'development',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  OPENAI_API_BASE: process.env.OPENAI_API_BASE
};

