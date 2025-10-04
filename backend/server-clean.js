const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Middleware
app.use(express.json());

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    process.env.FRONTEND_URL,
    /\.netlify\.app$/
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// MongoDB connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['visitor', 'admin', 'super_admin', 'museum_curator', 'tour_organizer', 'education_coordinator'], 
    default: 'visitor' 
  },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
});

const User = mongoose.model('User', userSchema);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'EthioHeritage360 server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// ============ AI-POWERED ROUTES ============

// Intelligent Chat Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, context } = req.body;
    
    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ success: false, message: 'OpenAI API key not configured' });
    }

    // Detect query type for intelligent responses
    const lowerMessage = message.toLowerCase();
    const platformKeywords = {
      welcome: ['welcome', 'hello', 'hi', 'start', 'begin'],
      help: ['help', 'support', 'assistance', 'guide'],
      contact: ['contact', 'reach', 'support team', 'admin'],
      education: ['education', 'learn', 'study', 'school', 'university'],
      museum: ['museum', 'virtual museum', 'exhibits', 'collections'],
      tour: ['tour', 'visit', 'travel', 'trip', 'guide'],
      features: ['features', 'what can', 'capabilities', 'functions'],
      ecosystem: ['ecosystem', 'platform', 'system', 'about']
    };

    let queryType = 'general';
    for (const [type, keywords] of Object.entries(platformKeywords)) {
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        queryType = type;
        break;
      }
    }

    // Create context-aware system prompt
    let systemPrompt = `You are the AI assistant for EthioHeritage360, a comprehensive Ethiopian heritage ecosystem platform. You are knowledgeable, helpful, and enthusiastic about Ethiopian culture and heritage.`;

    switch (queryType) {
      case 'welcome':
        systemPrompt += ` Welcome users warmly to EthioHeritage360. Explain this is a complete ecosystem with Virtual Museum, Educational resources, Community features, Expert guides, Tour planning, Cultural events, and Research tools.`;
        break;
      case 'help':
        systemPrompt += ` Provide help about platform features: AI Chat Assistant (24/7), Super Admin for technical issues, Museum Curators for exhibits, Tour Organizers for travel, Educational Coordinators for learning, Community Moderators for interactions.`;
        break;
      case 'contact':
        systemPrompt += ` Provide contact info: Super Admin (technical issues), Museum Director (exhibits), Education Coordinator (learning), Tour Manager (travel), Community Manager (interactions), Cultural Expert (heritage questions).`;
        break;
      case 'education':
        systemPrompt += ` Focus on educational features: Interactive learning modules, Virtual field trips, Educational games, Research databases, Teacher resources, Student tools, Certification programs, University partnerships.`;
        break;
      case 'museum':
        systemPrompt += ` Explain virtual museum: 3D interactive exhibits, Historical timelines, Audio-visual storytelling, Artifact collections, VR heritage tours, Interactive maps, Curator presentations, Digital preservation.`;
        break;
      case 'tour':
        systemPrompt += ` Describe tour features: AI-powered itinerary creation, Local guide connections, Heritage site recommendations, Cultural event calendar, Transportation coordination, Safety tips, Group management.`;
        break;
      case 'features':
        systemPrompt += ` List all features: 🏛️ Virtual Museum, 📚 Education Hub, 🗺️ Tour Planner, 👥 Community, 🔍 Research, 📱 Mobile Access, 🎯 Personalization, 🌐 Multilingual support.`;
        break;
      case 'ecosystem':
        systemPrompt += ` Explain the ecosystem: Digital Heritage Preservation, Educational Development, Community Engagement, Tourism Development, Research Collaboration - all interconnected for comprehensive heritage experience.`;
        break;
      default:
        systemPrompt += ` Provide expert knowledge about Ethiopian heritage, culture, and history. Always relate back to platform features. ${context ? `Context: ${context}` : ''}`;
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      max_tokens: 800,
      temperature: 0.7
    });

    const response = completion.choices[0]?.message?.content;
    
    res.json({
      success: true,
      data: {
        message: response,
        query_type: queryType,
        usage: completion.usage
      }
    });
  } catch (error) {
    console.error('OpenAI API Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing chat request',
      error: error.message
    });
  }
});

// Heritage Information Endpoint
app.post('/api/heritage-info', async (req, res) => {
  try {
    const { site, query } = req.body;
    
    if (!site && !query) {
      return res.status(400).json({ success: false, message: 'Site name or query required' });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ success: false, message: 'OpenAI API key not configured' });
    }

    const prompt = site 
      ? `Tell me about the Ethiopian heritage site: ${site}. Include historical significance, cultural importance, and visitor information.`
      : query;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert on Ethiopian history, culture, and heritage sites. Provide accurate, detailed information about Ethiopian historical sites, cultural practices, and traditions."
        },
        { role: "user", content: prompt }
      ],
      max_tokens: 600,
      temperature: 0.5
    });

    res.json({
      success: true,
      data: {
        site: site || 'General Query',
        information: completion.choices[0]?.message?.content,
        usage: completion.usage
      }
    });
  } catch (error) {
    console.error('Heritage Info Error:', error);
    res.status(500).json({ success: false, message: 'Error fetching heritage information' });
  }
});

// Tour Suggestions Endpoint
app.post('/api/tour-suggestions', async (req, res) => {
  try {
    const { interests, duration, location } = req.body;
    
    if (!interests) {
      return res.status(400).json({ success: false, message: 'Interests required for tour suggestions' });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ success: false, message: 'OpenAI API key not configured' });
    }

    const prompt = `Create a personalized Ethiopian heritage tour based on:
    - Interests: ${interests}
    - Duration: ${duration || 'flexible'}
    - Starting location: ${location || 'flexible'}
    
    Provide detailed itinerary with sites, experiences, and practical tips.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert Ethiopian tour guide. Create personalized tour recommendations showcasing Ethiopia's diverse heritage with specific locations, timing, and practical advice."
        },
        { role: "user", content: prompt }
      ],
      max_tokens: 800,
      temperature: 0.6
    });

    res.json({
      success: true,
      data: {
        suggestions: completion.choices[0]?.message?.content,
        parameters: { interests, duration, location },
        usage: completion.usage
      }
    });
  } catch (error) {
    console.error('Tour Suggestions Error:', error);
    res.status(500).json({ success: false, message: 'Error generating tour suggestions' });
  }
});

// Cultural Context Endpoint
app.post('/api/cultural-context', async (req, res) => {
  try {
    const { text, context_type } = req.body;
    
    if (!text) {
      return res.status(400).json({ success: false, message: 'Text required for cultural context' });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ success: false, message: 'OpenAI API key not configured' });
    }

    let systemPrompt = "You are an expert on Ethiopian culture, languages, and traditions.";
    
    switch (context_type) {
      case 'translation':
        systemPrompt += " Help translate and explain Ethiopian terms with cultural significance.";
        break;
      case 'tradition':
        systemPrompt += " Explain Ethiopian cultural traditions and historical background.";
        break;
      case 'etiquette':
        systemPrompt += " Provide cultural etiquette guidance for heritage sites and communities.";
        break;
      default:
        systemPrompt += " Provide cultural context about Ethiopian heritage and customs.";
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text }
      ],
      max_tokens: 500,
      temperature: 0.4
    });

    res.json({
      success: true,
      data: {
        context: completion.choices[0]?.message?.content,
        type: context_type || 'general',
        usage: completion.usage
      }
    });
  } catch (error) {
    console.error('Cultural Context Error:', error);
    res.status(500).json({ success: false, message: 'Error providing cultural context' });
  }
});

// Platform Information Endpoint
app.get('/api/platform/info', (req, res) => {
  res.json({
    success: true,
    data: {
      platform_name: 'EthioHeritage360',
      description: 'Comprehensive Ethiopian Heritage Ecosystem',
      version: '2.0.0',
      features: {
        virtual_museum: {
          name: '🏛️ Virtual Museum',
          description: '3D interactive exhibits and artifact collections'
        },
        education_hub: {
          name: '📚 Education Hub', 
          description: 'Learning resources and programs'
        },
        tour_planner: {
          name: '🗺️ AI Tour Planner',
          description: 'Intelligent travel planning system'
        },
        community_platform: {
          name: '👥 Community Hub',
          description: 'Cultural discussions and connections'
        },
        research_center: {
          name: '🔍 Research Center',
          description: 'Academic databases and resources'
        }
      },
      contact_info: {
        general: 'info@ethioheritage360.com',
        support: 'support@ethioheritage360.com',
        education: 'education@ethioheritage360.com',
        tours: 'tours@ethioheritage360.com'
      }
    }
  });
});

// Help Endpoint
app.get('/api/help', (req, res) => {
  res.json({
    success: true,
    data: {
      platform_name: 'EthioHeritage360',
      welcome_message: 'Welcome to EthioHeritage360 - Your Gateway to Ethiopian Heritage!',
      quick_help: {
        getting_started: [
          'Explore virtual museum exhibits',
          'Try the AI chat assistant',
          'Browse heritage site information',
          'Plan tours with AI recommendations'
        ],
        support_channels: {
          ai_assistant: 'Available 24/7 for instant help',
          technical_support: 'support@ethioheritage360.com',
          educational_support: 'education@ethioheritage360.com',
          tour_assistance: 'tours@ethioheritage360.com'
        }
      }
    }
  });
});

// OpenAI Status Check
app.get('/api/openai/status', async (req, res) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.json({
        success: true,
        status: 'not_configured',
        message: 'OpenAI API key not configured'
      });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: "Hello" }],
      max_tokens: 5
    });

    res.json({
      success: true,
      status: 'active',
      message: 'OpenAI API working correctly',
      model: 'gpt-3.5-turbo'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      status: 'error',
      message: 'OpenAI API configuration issue',
      error: error.message
    });
  }
});

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
      case 'modules':
        return downloadModules(res);
      case 'openai':
        return downloadOpenAIModules(res);
      case 'environment':
        return downloadEnvironmentTemplate(res);
      case 'backup':
        return downloadFullBackup(res);
      case 'deployment':
        return downloadDeploymentGuide(res);
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
  
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
  
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
    }
  };
  
  res.json({
    success: true,
    message: 'EthioHeritage360 Configuration',
    data: config,
    download_timestamp: new Date().toISOString()
  });
}

// Download entire project
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
  
  archive.file(path.join(__dirname, 'server.js'), { name: 'server.js' });
  archive.file(path.join(__dirname, 'package.json'), { name: 'package.json' });
  
  const readme = `# EthioHeritage360 - Render Deployment Package\n\n## Environment Variables Required:\n- MONGODB_URI: Your MongoDB Atlas connection string\n- OPENAI_API_KEY: Your OpenAI API key\n- FRONTEND_URL: Your Netlify domain\n- JWT_SECRET: Your JWT secret key\n\nGenerated: ${new Date().toISOString()}\nVersion: 2.0.0`;
  
  archive.append(readme, { name: 'README.md' });
  archive.finalize();
}

// Database export info
function downloadDatabaseExport(res) {
  const exportData = {
    export_info: {
      timestamp: new Date().toISOString(),
      database: 'EthioHeritage360',
      collections: ['users']
    },
    default_accounts: {
      admin: 'melkamuwako5@admin.com / admin123',
      tour_organizer: 'organizer@heritagetours.et / tour123'
    }
  };
  
  res.json({
    success: true,
    message: 'Database Export Information',
    data: exportData
  });
}

// Download Node modules information
function downloadModules(res) {
  const packageData = require('./package.json');
  const modules = {
    name: packageData.name,
    version: packageData.version,
    production_dependencies: packageData.dependencies,
    dev_dependencies: packageData.devDependencies,
    scripts: packageData.scripts,
    installation_command: 'npm install',
    module_status: {
      express: 'Web framework - REQUIRED',
      mongoose: 'MongoDB ODM - REQUIRED',
      cors: 'Cross-Origin Resource Sharing - REQUIRED',
      bcryptjs: 'Password hashing - REQUIRED',
      jsonwebtoken: 'JWT authentication - REQUIRED',
      openai: 'OpenAI API client - REQUIRED for AI features',
      archiver: 'File compression - REQUIRED for downloads',
      dotenv: 'Environment variables - REQUIRED'
    }
  };
  
  res.json({
    success: true,
    message: 'Node.js Modules Information',
    data: modules,
    timestamp: new Date().toISOString()
  });
}

// Download OpenAI specific modules and configuration
function downloadOpenAIModules(res) {
  const openaiConfig = {
    module: 'openai',
    version: '^4.20.1',
    status: process.env.OPENAI_API_KEY ? 'CONFIGURED' : 'NOT CONFIGURED',
    installation: {
      command: 'npm install openai@^4.20.1',
      import: 'const OpenAI = require(\'openai\');',
      initialization: `const openai = new OpenAI({\n  apiKey: process.env.OPENAI_API_KEY,\n});`
    },
    endpoints: {
      chat: '/api/chat',
      heritage_info: '/api/heritage-info',
      tour_suggestions: '/api/tour-suggestions',
      cultural_context: '/api/cultural-context',
      status_check: '/api/openai/status'
    },
    models_used: {
      primary: 'gpt-3.5-turbo',
      fallback: 'gpt-3.5-turbo',
      purpose: 'Ethiopian heritage and cultural assistance'
    },
    configuration_required: {
      api_key: 'OPENAI_API_KEY environment variable',
      note: 'Get your API key from https://platform.openai.com/api-keys'
    }
  };
  
  res.json({
    success: true,
    message: 'OpenAI Module Configuration',
    data: openaiConfig,
    timestamp: new Date().toISOString()
  });
}

// Download environment template
function downloadEnvironmentTemplate(res) {
  const envTemplate = `# EthioHeritage360 Environment Configuration\n# Generated: ${new Date().toISOString()}\n\n# Database Configuration\nMONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ethioheritage360?retryWrites=true&w=majority\n\n# OpenAI Configuration\nOPENAI_API_KEY=sk-your-openai-api-key-here\n\n# JWT Configuration\nJWT_SECRET=your-super-secret-jwt-key-here\n\n# Frontend Configuration\nFRONTEND_URL=https://your-netlify-app.netlify.app\n\n# Server Configuration\nNODE_ENV=production\nPORT=5000\n\n# Render Configuration (Optional)\nRENDER_EXTERNAL_URL=https://your-app.onrender.com\nRENDER_PAID_PLAN=false\n\n# Security Notes:\n# 1. Never commit this file to version control\n# 2. Change all default values for production\n# 3. Use strong passwords and secrets\n# 4. Regularly rotate API keys`;
  
  const tempDir = path.join(__dirname, 'temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  
  const envFile = path.join(tempDir, `.env-template-${Date.now()}`);
  fs.writeFileSync(envFile, envTemplate);
  
  res.download(envFile, 'ethioheritage360.env.template', (err) => {
    if (err) console.error('Download error:', err);
    setTimeout(() => {
      try { fs.unlinkSync(envFile); } catch (e) {}
    }, 5000);
  });
}

// Download full backup with everything
function downloadFullBackup(res) {
  const tempDir = path.join(__dirname, 'temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  
  const zipPath = path.join(tempDir, `ethioheritage360-full-backup-${Date.now()}.zip`);
  const output = fs.createWriteStream(zipPath);
  const archive = archiver('zip', { zlib: { level: 9 } });
  
  output.on('close', () => {
    res.download(zipPath, 'ethioheritage360-full-backup.zip', (err) => {
      if (err) console.error('Download error:', err);
      setTimeout(() => {
        try { fs.unlinkSync(zipPath); } catch (e) {}
      }, 10000);
    });
  });
  
  archive.on('error', (err) => {
    console.error('Archive error:', err);
    res.status(500).json({ success: false, message: 'Backup creation failed' });
  });
  
  archive.pipe(output);
  
  // Add all project files
  archive.file(path.join(__dirname, 'server.js'), { name: 'backend/server.js' });
  archive.file(path.join(__dirname, 'package.json'), { name: 'backend/package.json' });
  
  // Add environment template
  const envTemplate = `MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ethioheritage360\nOPENAI_API_KEY=sk-your-key-here\nJWT_SECRET=your-secret\nFRONTEND_URL=https://your-app.netlify.app\nNODE_ENV=production`;
  archive.append(envTemplate, { name: 'backend/.env.example' });
  
  // Add deployment guide
  const deployGuide = `# EthioHeritage360 - Complete Deployment Guide\n\n## 🚀 Quick Setup:\n\n### 1. MongoDB Atlas:\n- Create account at mongodb.com\n- Create cluster and get connection string\n- Add to MONGODB_URI environment variable\n\n### 2. OpenAI API:\n- Get API key from platform.openai.com\n- Add to OPENAI_API_KEY environment variable\n\n### 3. Deploy Backend (Render):\n- Connect GitHub repository\n- Set environment variables\n- Deploy!\n\n### 4. Deploy Frontend (Netlify):\n- Connect repository\n- Build and deploy\n\n## 🔗 Important URLs:\n- Backend: https://ethioheritage360-ethiopian-heritage.onrender.com\n- Downloads: /api/render/download\n- Health: /api/health\n- OpenAI Status: /api/openai/status\n\nGenerated: ${new Date().toISOString()}`;
  archive.append(deployGuide, { name: 'DEPLOYMENT.md' });
  
  archive.finalize();
}

// Download deployment guide
function downloadDeploymentGuide(res) {
  const deploymentGuide = {
    title: 'EthioHeritage360 - Complete Deployment Guide',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    backend_deployment: {
      platform: 'Render.com',
      url: 'https://ethioheritage360-ethiopian-heritage.onrender.com',
      repository: 'https://github.com/Melke27/group_25',
      build_command: 'npm install',
      start_command: 'npm start',
      environment_variables: {
        MONGODB_URI: 'Your MongoDB Atlas connection string',
        OPENAI_API_KEY: 'Your OpenAI API key from platform.openai.com',
        JWT_SECRET: 'Your JWT secret key (generate strong random string)',
        FRONTEND_URL: 'Your Netlify domain',
        NODE_ENV: 'production'
      }
    },
    frontend_deployment: {
      platform: 'Netlify.com',
      build_settings: {
        build_command: 'npm run build',
        publish_directory: 'dist' 
      },
      redirects: {
        api_proxy: '/api/* https://ethioheritage360-ethiopian-heritage.onrender.com/api/:splat 200',
        spa_fallback: '/* /index.html 200'
      }
    },
    database_setup: {
      provider: 'MongoDB Atlas',
      steps: [
        '1. Create account at mongodb.com',
        '2. Create new cluster (free tier available)',
        '3. Create database user',
        '4. Get connection string',
        '5. Add connection string to MONGODB_URI'
      ]
    },
    openai_setup: {
      provider: 'OpenAI Platform',
      steps: [
        '1. Create account at platform.openai.com',
        '2. Go to API Keys section',
        '3. Create new API key',
        '4. Add API key to OPENAI_API_KEY environment variable',
        '5. Test connection at /api/openai/status'
      ]
    },
    available_downloads: {
      logs: '/api/render/download?type=logs',
      config: '/api/render/download?type=config',
      project: '/api/render/download?type=project',
      database: '/api/render/download?type=database',
      modules: '/api/render/download?type=modules',
      openai: '/api/render/download?type=openai',
      environment: '/api/render/download?type=environment',
      backup: '/api/render/download?type=backup',
      deployment: '/api/render/download?type=deployment'
    }
  };
  
  res.json({
    success: true,
    message: 'Complete Deployment Guide',
    data: deploymentGuide
  });
}

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
  
  try {
    if (mongoose.connection.readyState === 1) {
      healthStatus.database = 'connected';
    } else {
      healthStatus.database = 'disconnected';
    }
  } catch (error) {
    healthStatus.database = 'error';
  }
  
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
        const selfUrl = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;
        const response = await fetch(`${selfUrl}/api/render/ping`);
        const data = await response.json();
        console.log(`💓 Keep-alive ping: ${data.status} at ${data.timestamp}`);
      } catch (error) {
        console.log('⚠️ Keep-alive ping failed:', error.message);
      }
    }, 14 * 60 * 1000); // Ping every 14 minutes
  }
}

// ============ AUTHENTICATION ROUTES ============

// JWT token generation
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'ethioheritage360_secret_key', {
    expiresIn: '7d'
  });
};

// Register new user
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      role: role || 'visitor'
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Error registering user', error: error.message });
  }
});

// Login user
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid email or password' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(400).json({ success: false, message: 'Account is deactivated. Please contact support.' });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({ success: false, message: 'Invalid email or password' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Error during login', error: error.message });
  }
});

// Get current user profile
app.get('/api/auth/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'ethioheritage360_secret_key');
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
});

// Create default admin users if they don't exist
const createDefaultUsers = async () => {
  try {
    const adminEmail = 'melkamuwako5@admin.com';
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (!existingAdmin) {
      const adminUser = new User({
        name: 'Super Admin',
        email: adminEmail,
        password: 'admin123', // Change this password!
        role: 'super_admin'
      });
      await adminUser.save();
      console.log('✅ Default super admin created:', adminEmail);
    }

    // Create tour organizer
    const tourEmail = 'organizer@heritagetours.et';
    const existingTourOrganizer = await User.findOne({ email: tourEmail });
    
    if (!existingTourOrganizer) {
      const tourUser = new User({
        name: 'Heritage Tour Organizer',
        email: tourEmail,
        password: 'tour123', // Change this password!
        role: 'tour_organizer'
      });
      await tourUser.save();
      console.log('✅ Default tour organizer created:', tourEmail);
    }

    // Create museum admin
    const museumEmail = 'museum.admin@ethioheritage360.com';
    const existingMuseumAdmin = await User.findOne({ email: museumEmail });
    
    if (!existingMuseumAdmin) {
      const museumUser = new User({
        name: 'Museum Administrator',
        email: museumEmail,
        password: 'museum123', // Change this password!
        role: 'admin'
      });
      await museumUser.save();
      console.log('✅ Default museum admin created:', museumEmail);
    }
  } catch (error) {
    console.error('Error creating default users:', error);
  }
};

// User CRUD routes (existing)
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching users' });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and email required' });
    }
    const user = new User({ name, email });
    const savedUser = await user.save();
    res.status(201).json({ success: true, data: savedUser });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }
    res.status(500).json({ success: false, message: 'Error creating user' });
  }
});

// Catch-all route
app.all('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Something went wrong!' });
});

// Start server
const startServer = async () => {
  await connectDB();
  
  // Create default users after DB connection
  await createDefaultUsers();
  
  // Initialize keep-alive system
  startKeepAlive();
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 EthioHeritage360 AI Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔥 Keep-alive system: ${process.env.NODE_ENV === 'production' && !process.env.RENDER_PAID_PLAN ? 'Active' : 'Disabled'}`);
    console.log(`📜 Download API: ${process.env.NODE_ENV === 'production' ? 'https://your-app.onrender.com' : 'http://localhost:' + PORT}/api/render/download`);
  });
};

startServer();

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down server...');
  await mongoose.connection.close();
  process.exit(0);
});
