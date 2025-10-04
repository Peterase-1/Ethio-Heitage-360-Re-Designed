const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Import database connection
const { connectDB } = require('../../server/config/database');

// Import all route handlers
const authRoutes = require('../../server/routes/auth');
const adminRoutes = require('../../server/routes/admin');
const museumRoutes = require('../../server/routes/museums');
const artifactRoutes = require('../../server/routes/artifacts');
const userRoutes = require('../../server/routes/User');
const visitorRoutes = require('../../server/routes/visitor');
const tourPackageRoutes = require('../../server/routes/TourPackage');
const bookingRoutes = require('../../server/routes/Booking');
const virtualMuseumRoutes = require('../../server/routes/virtualMuseum');
const educationRoutes = require('../../server/routes/education');

// Error handling middleware
const { errorHandler } = require('../../server/utils/errorHandler');

const app = express();

// Connect to MongoDB (with singleton pattern for serverless)
let dbConnected = false;
const ensureDbConnection = async () => {
  if (!dbConnected) {
    await connectDB();
    dbConnected = true;
  }
};

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for API
}));

// Rate limiting (more lenient for production)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Increased limit for production
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// CORS configuration for production
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests from any origin in production
    // You should replace this with your actual domain
    const allowedOrigins = [
      /https:\/\/.*\.netlify\.app$/,
      /https:\/\/.*\.vercel\.app$/,
      /https:\/\/ethioheritage360\.*/,
      'http://localhost:5173',
      'http://localhost:3000',
    ];
    
    if (!origin) return callback(null, true);
    
    const isAllowed = allowedOrigins.some(pattern => {
      if (typeof pattern === 'string') {
        return origin === pattern;
      }
      return pattern.test(origin);
    });
    
    if (isAllowed) {
      return callback(null, true);
    }
    
    return callback(null, true); // Allow all in development
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Database connection middleware
app.use(async (req, res, next) => {
  try {
    await ensureDbConnection();
    next();
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// API Routes
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/museums', museumRoutes);
app.use('/artifacts', artifactRoutes);
app.use('/user', userRoutes);
app.use('/visitor', visitorRoutes);
app.use('/tour-packages', tourPackageRoutes);
app.use('/bookings', bookingRoutes);
app.use('/virtual-museum', virtualMuseumRoutes);
app.use('/education', educationRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'EthioHeritage360 API is running on Netlify Functions',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to EthioHeritage360 API - Serverless Edition',
    version: '1.0.0',
    deployment: 'Netlify Functions',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.originalUrl
  });
});

// Export the serverless function
module.exports.handler = serverless(app, {
  binary: ['image/*', 'video/*', 'audio/*', 'application/*']
});
