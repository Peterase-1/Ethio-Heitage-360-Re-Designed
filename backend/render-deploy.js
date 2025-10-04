// Render Dashboard Helper Script for EthioHeritage360
const express = require('express');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

// Add these routes to your main server.js or use this as middleware

// ============ RENDER DASHBOARD ROUTES ============

// Download project files endpoint for Render dashboard
app.get('/api/render/download', (req, res) => {
  const { type } = req.query;
  
  try {
    switch (type) {
      case 'logs':
        return downloadLogs(res);
      case 'config':
        return downloadConfig(res);
      case 'project':
        return downloadProject(res);
      case 'database':
        return downloadDatabaseExport(res);
      default:
        return downloadProject(res);
    }
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ success: false, message: 'Download failed', error: error.message });
  }
});

// Download logs
function downloadLogs(res) {
  const logsDir = path.join(__dirname, 'logs');
  
  // Create logs directory if it doesn't exist
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
  
  // Create a log file with current server info
  const logContent = {
    timestamp: new Date().toISOString(),
    server_status: 'running',
    environment: process.env.NODE_ENV || 'production',
    memory_usage: process.memoryUsage(),
    uptime: process.uptime(),
    version: '2.0.0',
    features: {
      authentication: 'enabled',
      openai: process.env.OPENAI_API_KEY ? 'configured' : 'not_configured',
      mongodb: process.env.MONGODB_URI ? 'connected' : 'not_connected',
      cors: 'enabled'
    }
  };
  
  const logFile = path.join(logsDir, `server-log-${Date.now()}.json`);
  fs.writeFileSync(logFile, JSON.stringify(logContent, null, 2));
  
  res.download(logFile, 'ethioheritage360-logs.json', (err) => {
    if (err) console.error('Download error:', err);
    // Clean up temp file
    setTimeout(() => {
      try { fs.unlinkSync(logFile); } catch (e) {}
    }, 5000);
  });
}

// Download configuration
function downloadConfig(res) {
  const config = {
    name: 'EthioHeritage360',
    version: '2.0.0',
    environment: {
      NODE_ENV: process.env.NODE_ENV || 'production',
      PORT: process.env.PORT || 5000,
      MONGODB_URI: process.env.MONGODB_URI ? '***configured***' : 'not_set',
      OPENAI_API_KEY: process.env.OPENAI_API_KEY ? '***configured***' : 'not_set',
      FRONTEND_URL: process.env.FRONTEND_URL || 'not_set',
      JWT_SECRET: process.env.JWT_SECRET ? '***configured***' : 'default'
    },
    features: {
      authentication: 'enabled',
      ai_chat: 'enabled',
      heritage_info: 'enabled',
      tour_suggestions: 'enabled',
      cultural_context: 'enabled'
    },
    endpoints: [
      'GET /api/health',
      'POST /api/auth/login',
      'POST /api/auth/register',
      'GET /api/auth/me',
      'POST /api/chat',
      'POST /api/heritage-info',
      'POST /api/tour-suggestions',
      'POST /api/cultural-context',
      'GET /api/platform/info',
      'GET /api/help',
      'GET /api/openai/status'
    ]
  };
  
  res.json({
    success: true,
    message: 'EthioHeritage360 Configuration',
    data: config,
    download_timestamp: new Date().toISOString()
  });
}

// Download entire project (simplified)
function downloadProject(res) {
  const tempDir = path.join(__dirname, 'temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  
  const zipPath = path.join(tempDir, `ethioheritage360-${Date.now()}.zip`);
  const output = fs.createWriteStream(zipPath);
  const archive = archiver('zip', { zlib: { level: 9 } });
  
  output.on('close', () => {
    res.download(zipPath, 'ethioheritage360-project.zip', (err) => {
      if (err) console.error('Download error:', err);
      // Clean up temp file
      setTimeout(() => {
        try { fs.unlinkSync(zipPath); } catch (e) {}
      }, 10000);
    });
  });
  
  archive.on('error', (err) => {
    console.error('Archive error:', err);
    res.status(500).json({ success: false, message: 'Archive creation failed' });
  });
  
  archive.pipe(output);
  
  // Add important files to archive
  archive.file(path.join(__dirname, 'server.js'), { name: 'server.js' });
  archive.file(path.join(__dirname, 'package.json'), { name: 'package.json' });
  archive.file(path.join(__dirname, '.env.example'), { name: '.env.example' });
  
  // Add README with instructions
  const readme = `# EthioHeritage360 - Render Deployment Package

## Quick Setup:
1. Extract this package
2. Set environment variables in Render dashboard
3. Deploy to Render

## Environment Variables Required:
- MONGODB_URI: Your MongoDB Atlas connection string
- OPENAI_API_KEY: Your OpenAI API key
- FRONTEND_URL: Your Netlify domain
- JWT_SECRET: Your JWT secret key

## Default Admin Accounts:
- Super Admin: melkamuwako5@admin.com / admin123
- Tour Organizer: organizer@heritagetours.et / tour123

## API Endpoints:
- POST /api/auth/login - User login
- POST /api/chat - AI chat assistant
- GET /api/health - Server health check
- GET /api/render/download - Download project files

Generated: ${new Date().toISOString()}
Version: 2.0.0
`;
  
  archive.append(readme, { name: 'README.md' });
  archive.finalize();
}

// Database export (mock)
function downloadDatabaseExport(res) {
  const exportData = {
    export_info: {
      timestamp: new Date().toISOString(),
      database: 'EthioHeritage360',
      collections: ['users', 'heritage_sites', 'tours'],
      total_records: 'N/A - Use MongoDB Atlas export tools'
    },
    instructions: {
      mongodb_atlas_export: [
        '1. Go to MongoDB Atlas Dashboard',
        '2. Select your cluster',
        '3. Click Collections',
        '4. Use Export Collection feature',
        '5. Choose JSON or CSV format'
      ],
      restore_instructions: [
        '1. Use mongorestore for JSON exports',
        '2. Use mongoimport for CSV exports',
        '3. Ensure connection string is correct',
        '4. Verify data integrity after restore'
      ]
    },
    sample_user_data: {
      admin: {
        email: 'melkamuwako5@admin.com',
        role: 'super_admin',
        note: 'Default admin account created by system'
      },
      tour_organizer: {
        email: 'organizer@heritagetours.et',
        role: 'tour_organizer',
        note: 'Default tour organizer account'
      }
    }
  };
  
  res.json({
    success: true,
    message: 'Database Export Information',
    data: exportData,
    note: 'For actual database export, use MongoDB Atlas tools or connect directly to your database'
  });
}

// ============ KEEP-ALIVE ROUTES ============

// Keep-alive endpoint for external monitoring
app.get('/api/render/ping', (req, res) => {
  res.json({
    success: true,
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: '2.0.0',
    environment: process.env.NODE_ENV || 'production'
  });
});

// Health check with detailed info for Render
app.get('/api/render/health', async (req, res) => {
  const healthStatus = {
    server: 'healthy',
    database: 'unknown',
    openai: 'unknown',
    timestamp: new Date().toISOString(),
    uptime_seconds: process.uptime(),
    memory_usage: process.memoryUsage(),
    environment: process.env.NODE_ENV || 'production'
  };
  
  // Check MongoDB connection
  try {
    if (mongoose.connection.readyState === 1) {
      healthStatus.database = 'connected';
    } else {
      healthStatus.database = 'disconnected';
    }
  } catch (error) {
    healthStatus.database = 'error';
  }
  
  // Check OpenAI configuration
  if (process.env.OPENAI_API_KEY) {
    healthStatus.openai = 'configured';
  } else {
    healthStatus.openai = 'not_configured';
  }
  
  res.json({
    success: true,
    status: 'healthy',
    details: healthStatus,
    keep_alive_url: `${req.protocol}://${req.get('host')}/api/render/ping`,
    dashboard_downloads: `${req.protocol}://${req.get('host')}/api/render/download`
  });
});

// Self-ping to keep server awake (for free tier)
let pingInterval;

function startKeepAlive() {
  if (process.env.NODE_ENV === 'production' && !process.env.RENDER_PAID_PLAN) {
    console.log('🔄 Starting keep-alive system for free tier...');
    
    pingInterval = setInterval(async () => {
      try {
        const selfUrl = process.env.RENDER_EXTERNAL_URL || 'https://your-app.onrender.com';
        const response = await fetch(`${selfUrl}/api/render/ping`);
        const data = await response.json();
        console.log(`💓 Keep-alive ping: ${data.status} at ${data.timestamp}`);
      } catch (error) {
        console.log('⚠️ Keep-alive ping failed:', error.message);
      }
    }, 14 * 60 * 1000); // Ping every 14 minutes
  }
}

// Start keep-alive when server starts
startKeepAlive();

// Export functions for use in main server
module.exports = {
  downloadLogs,
  downloadConfig,
  downloadProject,
  downloadDatabaseExport,
  startKeepAlive
};
