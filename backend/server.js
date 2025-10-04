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

// Initialize AI clients with enhanced configuration
let openai = null;
let openRouter = null;
let huggingFace = null;
let openaiConfigured = false;
let openRouterConfigured = false;
let huggingFaceConfigured = false;

// Initialize OpenAI client
const initializeOpenAI = () => {
  try {
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.startsWith('sk-')) {
      openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        timeout: 30000,
        maxRetries: 3,
      });
      openaiConfigured = true;
      console.log('✅ OpenAI client initialized successfully');
      return true;
    } else {
      console.log('⚠️ OpenAI API key not configured or invalid format');
      return false;
    }
  } catch (error) {
    console.error('❌ OpenAI initialization error:', error.message);
    openaiConfigured = false;
    return false;
  }
};

// Initialize OpenRouter client
const initializeOpenRouter = () => {
  try {
    if (process.env.OPENROUTER_API_KEY && process.env.OPENROUTER_API_KEY.startsWith('sk-or-')) {
      openRouter = new OpenAI({
        baseURL: 'https://openrouter.ai/api/v1',
        apiKey: process.env.OPENROUTER_API_KEY,
        timeout: 45000,
        maxRetries: 3,
        defaultHeaders: {
          'HTTP-Referer': 'https://ethioheritage360.com',
          'X-Title': 'EthioHeritage360 - Ethiopian Heritage Platform'
        }
      });
      openRouterConfigured = true;
      console.log('✅ OpenRouter client initialized successfully');
      return true;
    } else {
      console.log('⚠️ OpenRouter API key not configured or invalid format');
      return false;
    }
  } catch (error) {
    console.error('❌ OpenRouter initialization error:', error.message);
    openRouterConfigured = false;
    return false;
  }
};

// Initialize Hugging Face client
const initializeHuggingFace = () => {
  try {
    if (process.env.HF_API_KEY && process.env.HF_API_KEY.startsWith('hf_')) {
      huggingFace = {
        apiKey: process.env.HF_API_KEY,
        baseURL: 'https://api-inference.huggingface.co/models',
        timeout: 30000
      };
      huggingFaceConfigured = true;
      console.log('✅ Hugging Face client initialized successfully');
      return true;
    } else {
      console.log('⚠️ Hugging Face API key not configured or invalid format');
      return false;
    }
  } catch (error) {
    console.error('❌ Hugging Face initialization error:', error.message);
    huggingFaceConfigured = false;
    return false;
  }
};

// Smart AI provider selection
const getAvailableProviders = () => {
  const providers = [];
  if (openRouterConfigured) providers.push('openrouter');
  if (openaiConfigured) providers.push('openai');
  if (huggingFaceConfigured) providers.push('huggingface');
  return providers;
};

const selectBestProvider = (queryType) => {
  const providers = getAvailableProviders();
  
  // OpenRouter has access to multiple advanced models
  if (providers.includes('openrouter')) {
    return 'openrouter';
  }
  
  // Fallback to OpenAI
  if (providers.includes('openai')) {
    return 'openai';
  }
  
  // Hugging Face for specialized tasks
  if (providers.includes('huggingface')) {
    return 'huggingface';
  }
  
  return null;
};

// Initialize all AI providers on startup
initializeOpenAI();
initializeOpenRouter();
initializeHuggingFace();

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

// MongoDB connection with better error handling
const connectDB = async () => {
  try {
    // Check multiple possible MongoDB URI environment variables
    const mongoUri = process.env.MONGODB_URI || 
                     process.env.MONGO_URI || 
                     process.env.DATABASE_URL || 
                     process.env.DB_URI;
    
    if (!mongoUri) {
      console.error('❌ MongoDB URI environment variable is not set!');
      console.error('Looking for: MONGODB_URI, MONGO_URI, DATABASE_URL, or DB_URI');
      console.error('Available MongoDB-related env vars:', Object.keys(process.env).filter(k => k.toLowerCase().includes('mongo') || k.toLowerCase().includes('db')));
      process.exit(1);
    }
    
    console.log('🔄 Connecting to MongoDB...');
    console.log('Using MongoDB URI variable:', Object.keys(process.env).find(key => 
      [process.env.MONGODB_URI, process.env.MONGO_URI, process.env.DATABASE_URL, process.env.DB_URI].includes(process.env[key])
    ));
    console.log('MongoDB URI exists:', !!mongoUri);
    
    const conn = await mongoose.connect(mongoUri);
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.error('Full error:', error);
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
    enum: ['visitor', 'admin', 'super_admin', 'museum', 'museum_curator', 'tour_organizer', 'education_coordinator'], 
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
};

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

// ============ ROUTE IMPORTS ============

// Import route modules
const toursRouter = require('./routes/tours');
const educationRouter = require('./routes/education');

// Mount routes
app.use('/api/tours', toursRouter);
app.use('/api/education', educationRouter);

// ============ AI-POWERED ROUTES ============

// AI middleware for consistent error handling
const validateAI = (req, res, next) => {
  const providers = getAvailableProviders();
  if (providers.length === 0) {
    return res.status(503).json({
      success: false,
      message: 'AI services unavailable',
      error: 'No AI providers configured',
      suggestion: 'Check OPENAI_API_KEY, OPENROUTER_API_KEY, or HF_API_KEY environment variables',
      available_providers: {
        openai: openaiConfigured,
        openrouter: openRouterConfigured,
        huggingface: huggingFaceConfigured
      }
    });
  }
  next();
};

// Legacy middleware for backward compatibility
const validateOpenAI = validateAI;

// Rate limiting helper for OpenAI calls
const rateLimiter = new Map();
const checkRateLimit = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 20; // 20 requests per minute

  if (!rateLimiter.has(ip)) {
    rateLimiter.set(ip, { count: 1, resetTime: now + windowMs });
    return next();
  }

  const userLimit = rateLimiter.get(ip);
  if (now > userLimit.resetTime) {
    rateLimiter.set(ip, { count: 1, resetTime: now + windowMs });
    return next();
  }

  if (userLimit.count >= maxRequests) {
    return res.status(429).json({
      success: false,
      message: 'Rate limit exceeded',
      retryAfter: Math.ceil((userLimit.resetTime - now) / 1000)
    });
  }

  userLimit.count++;
  next();
};

// Enhanced AI request wrapper with multiple providers
const makeAIRequest = async (requestData, retries = 3, preferredProvider = null) => {
  const provider = preferredProvider || selectBestProvider(requestData.intent || 'general');
  
  if (!provider) {
    throw new Error('No AI providers available');
  }
  
  console.log(`🤖 Using AI provider: ${provider.toUpperCase()}`);
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      let completion;
      
      switch (provider) {
        case 'openrouter':
          // Use advanced models for complex queries
          const model = requestData.complex ? 'anthropic/claude-3-sonnet' : 'openai/gpt-3.5-turbo';
          completion = await openRouter.chat.completions.create({
            ...requestData,
            model
          });
          break;
          
        case 'openai':
          completion = await openai.chat.completions.create(requestData);
          break;
          
        case 'huggingface':
          // Use HuggingFace for specialized tasks
          const response = await axios.post(
            `${huggingFace.baseURL}/microsoft/DialoGPT-medium`,
            {
              inputs: requestData.messages[requestData.messages.length - 1].content,
              parameters: {
                max_length: requestData.max_tokens || 500,
                temperature: requestData.temperature || 0.7
              }
            },
            {
              headers: {
                'Authorization': `Bearer ${huggingFace.apiKey}`,
                'Content-Type': 'application/json'
              },
              timeout: huggingFace.timeout
            }
          );
          
          // Convert HF response to OpenAI format
          completion = {
            choices: [{
              message: {
                content: response.data[0]?.generated_text || 'I apologize, but I encountered an issue processing your request.'
              }
            }],
            usage: { total_tokens: 0 } // HF doesn't provide token usage
          };
          break;
          
        default:
          throw new Error(`Unsupported AI provider: ${provider}`);
      }
      
      return { ...completion, provider };
      
    } catch (error) {
      console.error(`${provider.toUpperCase()} attempt ${attempt} failed:`, error.message);
      
      if (error.status === 429) {
        const waitTime = Math.pow(2, attempt) * 1000;
        console.log(`Rate limited, waiting ${waitTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      
      if (error.status === 401) {
        throw new Error(`${provider.toUpperCase()} API key is invalid or expired`);
      }
      
      if (error.status >= 500 && attempt < retries) {
        console.log(`${provider.toUpperCase()} server error, retrying in ${attempt * 1000}ms...`);
        await new Promise(resolve => setTimeout(resolve, attempt * 1000));
        continue;
      }
      
      // Try fallback provider on final attempt
      if (attempt === retries && provider !== 'openai' && openaiConfigured) {
        console.log(`Falling back to OpenAI...`);
        return makeAIRequest(requestData, 1, 'openai');
      }
      
      throw error;
    }
  }
  throw new Error(`${provider.toUpperCase()} request failed after all retries`);
};

// Legacy wrapper for backward compatibility
const makeOpenAIRequest = async (requestData, retries = 3) => {
  return makeAIRequest(requestData, retries, 'openai');
};

// ============ ENHANCED AI CHAT SYSTEM ============

// Conversation memory storage
const conversationMemory = new Map();
const axios = require('axios'); // Add this to package.json if not present

// Real Ethiopian heritage data
const ethiopianHeritage = {
  sites: {
    'lalibela': {
      name: 'Rock-Hewn Churches of Lalibela',
      type: 'UNESCO World Heritage Site',
      location: 'Lalibela, Amhara Region',
      built: '12th-13th century',
      significance: 'Extraordinary architectural achievement, carved from solid volcanic rock',
      visitor_info: 'Open daily, best visited during Timkat (Ethiopian Orthodox Epiphany)',
      facts: ['11 medieval monolithic churches', 'Carved below ground level', 'Still active pilgrimage site']
    },
    'axum': {
      name: 'Axum Obelisks',
      type: 'UNESCO World Heritage Site', 
      location: 'Axum, Tigray Region',
      built: '3rd-4th century CE',
      significance: 'Capital of ancient Aksumite Kingdom, cradle of Ethiopian civilization',
      visitor_info: 'Museum and archaeological sites open year-round',
      facts: ['Tallest obelisk is 33 meters', 'Ancient trade empire center', 'Home to Queen of Sheba legend']
    },
    'gondar': {
      name: 'Fasil Ghebbi (Royal Enclosure)',
      type: 'UNESCO World Heritage Site',
      location: 'Gondar, Amhara Region', 
      built: '17th-18th century',
      significance: 'Former imperial capital, unique architectural fusion',
      visitor_info: 'Castles and churches complex, guided tours available',
      facts: ['Ethiopian Camelot', 'Six castles and multiple buildings', 'Blend of Hindu, Arab, and European styles']
    },
    'omo_valley': {
      name: 'Lower Valley of the Omo',
      type: 'UNESCO World Heritage Site',
      location: 'Southern Nations, Southern Ethiopia',
      built: 'Prehistoric',
      significance: 'Cradle of humanity, earliest human fossils',
      visitor_info: 'Cultural tours to indigenous communities, permits required',
      facts: ['Lucy (3.2 million years old) found here', '8 different indigenous tribes', 'Paleontological goldmine']
    }
  },
  culture: {
    languages: ['Amharic', 'Oromo', 'Tigrinya', 'Somali', 'Sidamo', 'Wolaytta', 'Gurage', 'Afar'],
    religions: ['Ethiopian Orthodox Christianity (43%)', 'Islam (34%)', 'Protestant Christianity (19%)', 'Traditional beliefs (3%)'],
    festivals: ['Timkat (Epiphany)', 'Meskel (Finding of True Cross)', 'Enkutatash (New Year)', 'Fasika (Easter)'],
    cuisine: ['Injera (sourdough flatbread)', 'Doro Wat (spicy chicken stew)', 'Kitfo (Ethiopian tartare)', 'Coffee ceremony'],
    music: ['Eskista (shoulder dance)', 'Traditional krar (lyre)', 'Masinko (one-string violin)', 'Ceremonial drums']
  }
};

// Enhanced intent detection with NLP
const detectIntent = (message) => {
  const lower = message.toLowerCase();
  
  // Specific heritage sites
  if (lower.includes('lalibela') || lower.includes('rock church')) return 'lalibela';
  if (lower.includes('axum') || lower.includes('obelisk') || lower.includes('queen of sheba')) return 'axum';
  if (lower.includes('gondar') || lower.includes('castle') || lower.includes('fasil')) return 'gondar';
  if (lower.includes('omo valley') || lower.includes('lucy') || lower.includes('fossil')) return 'omo_valley';
  
  // General categories
  if (lower.match(/\b(hello|hi|hey|greetings|good\s+(morning|afternoon|evening))\b/)) return 'greeting';
  if (lower.includes('weather') || lower.includes('temperature') || lower.includes('climate')) return 'weather';
  if (lower.includes('food') || lower.includes('cuisine') || lower.includes('restaurant')) return 'cuisine';
  if (lower.includes('language') || lower.includes('translate') || lower.includes('speak')) return 'language';
  if (lower.includes('festival') || lower.includes('celebration') || lower.includes('holiday')) return 'festivals';
  if (lower.includes('music') || lower.includes('dance') || lower.includes('song')) return 'music';
  if (lower.includes('history') || lower.includes('ancient') || lower.includes('past')) return 'history';
  if (lower.includes('tour') || lower.includes('visit') || lower.includes('travel') || lower.includes('trip')) return 'tour_planning';
  if (lower.includes('museum') || lower.includes('exhibit') || lower.includes('artifact')) return 'museum';
  if (lower.includes('learn') || lower.includes('education') || lower.includes('study')) return 'education';
  
  return 'general';
};

// Fetch real-time data from external APIs
const fetchExternalData = async (intent, query) => {
  const results = { source: 'internal', data: null };
  
  try {
    switch (intent) {
      case 'weather':
        // You can add weather API here
        results.data = {
          suggestion: 'For current weather in Ethiopia, I recommend checking a weather service. Ethiopia has diverse climates from the highlands to the desert regions.',
          tip: 'Best time to visit heritage sites is during dry season (October-May)'
        };
        break;
        
      case 'wikipedia_search':
        try {
          const wikiResponse = await axios.get(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`, {
            timeout: 5000
          });
          results.source = 'wikipedia';
          results.data = {
            title: wikiResponse.data.title,
            extract: wikiResponse.data.extract,
            url: wikiResponse.data.content_urls?.desktop?.page
          };
        } catch (err) {
          console.log('Wikipedia API error:', err.message);
        }
        break;
    }
  } catch (error) {
    console.log('External API error:', error.message);
  }
  
  return results;
};

// Generate personalized responses
const generatePersonalizedResponse = async (intent, message, userId, conversationHistory) => {
  let response = '';
  let additionalData = {};
  
  // Get real-time external data when relevant
  const externalData = await fetchExternalData(intent, message);
  
  switch (intent) {
    case 'greeting':
      const greetings = [
        '🇪🇹 Welcome to EthioHeritage360! I\'m your personal heritage guide. Ready to explore the wonders of Ethiopia?',
        'Selam! (Hello in Amharic) 🌟 I\'m here to take you on an incredible journey through Ethiopia\'s rich heritage!',
        'Greetings, cultural explorer! 🏛️ Let\'s discover the amazing stories of Ethiopian civilization together!',
        'Hello there! 🎭 I\'m your AI heritage companion, ready to share the fascinating world of Ethiopian culture with you!'
      ];
      response = greetings[Math.floor(Math.random() * greetings.length)];
      additionalData.suggestions = ['Tell me about Lalibela churches', 'What festivals are celebrated?', 'Plan a heritage tour', 'Learn about Ethiopian cuisine'];
      break;
      
    case 'lalibela':
      const site = ethiopianHeritage.sites.lalibela;
      response = `🏛️ **${site.name}**\n\n✨ *${site.significance}*\n\n📍 **Location**: ${site.location}\n🗓️ **Built**: ${site.built}\n\n**Amazing Facts:**\n${site.facts.map(fact => `• ${fact}`).join('\n')}\n\n🎫 **Visitor Info**: ${site.visitor_info}\n\nWould you like me to help plan a visit or tell you about other UNESCO sites in Ethiopia?`;
      additionalData.related_sites = ['Axum Obelisks', 'Gondar Castles', 'Omo Valley'];
      break;
      
    case 'axum':
      const axumSite = ethiopianHeritage.sites.axum;
      response = `👑 **${axumSite.name}**\n\n🌟 *${axumSite.significance}*\n\n📍 **Location**: ${axumSite.location}\n🗓️ **Era**: ${axumSite.built}\n\n**Incredible Facts:**\n${axumSite.facts.map(fact => `• ${fact}`).join('\n')}\n\n🎫 **Visit**: ${axumSite.visitor_info}\n\nFun fact: This is where the legendary Queen of Sheba supposedly ruled! 👸`;
      break;
      
    case 'cuisine':
      response = `🍽️ **Ethiopian Cuisine - A Culinary Adventure!**\n\n**Must-Try Dishes:**\n${ethiopianHeritage.culture.cuisine.map(dish => `• ${dish}`).join('\n')}\n\n☕ **Coffee Origin**: Ethiopia is the birthplace of coffee! The coffee ceremony is a sacred social ritual.\n\n🍞 **Injera**: The spongy sourdough bread that\'s both plate and utensil - made from ancient teff grain.\n\nWould you like recipes, restaurant recommendations, or to learn about the coffee ceremony?`;
      additionalData.experiences = ['Virtual coffee ceremony', 'Cooking classes', 'Restaurant finder'];
      break;
      
    case 'festivals':
      response = `🎉 **Ethiopian Festivals - Living Traditions!**\n\n**Major Celebrations:**\n${ethiopianHeritage.culture.festivals.map(fest => `• ${fest}`).join('\n')}\n\n🌟 **Timkat** (Jan 19): Spectacular water blessing ceremony with thousands of pilgrims\n✝️ **Meskel** (Sept 27): Bonfire festival celebrating the finding of the True Cross\n🎊 **Enkutatash** (Sept 11): Ethiopian New Year with flowers and gift-giving\n\nEach festival is a explosion of color, music, and ancient traditions! Which one interests you most?`;
      break;
      
    case 'tour_planning':
      response = `🗺️ **Let\'s Plan Your Ethiopian Heritage Adventure!**\n\n**Popular Routes:**\n• **Historic North Circuit**: Axum → Lalibela → Gondar (7-10 days)\n• **Omo Valley Cultural Tour**: Meet 8 indigenous tribes (5-7 days)\n• **Danakil Depression**: Otherworldly landscapes (3-4 days)\n• **Simien Mountains**: Wildlife & stunning vistas (4-6 days)\n\n🎯 **Tell me:**\n• How many days do you have?\n• What interests you most? (History/Culture/Nature/Adventure)\n• Preferred travel style? (Luxury/Mid-range/Budget)\n\nI\'ll create a personalized itinerary just for you!`;
      additionalData.planning_tools = ['Budget calculator', 'Best time to visit', 'Packing checklist', 'Local guides'];
      break;
      
    case 'history':
      response = `📜 **Ethiopian History - 3000 Years of Civilization!**\n\n🏛️ **Ancient Aksumite Kingdom** (100-960 CE): Major trading power connecting Roman Empire with Ancient India\n\n👸 **Queen of Sheba**: Legendary ruler who visited King Solomon\n\n🦁 **Ethiopian Empire**: Never fully colonized, defeated Italy at Battle of Adwa (1896)\n\n🌍 **Cradle of Humanity**: Lucy and other early human fossils discovered in Omo Valley\n\n📚 **Living Heritage**: Ancient Ge\'ez script, unchanged Orthodox traditions, and continuous cultural practices\n\nWhat specific period or aspect of Ethiopian history fascinates you?`;
      break;
      
    default:
      // Use AI for complex queries
      return null; // Will fall back to OpenAI
  }
  
  return { response, additionalData, source: 'enhanced_heritage_ai', externalData };
};

// Enhanced Chat Endpoint
app.post('/api/chat', validateOpenAI, checkRateLimit, async (req, res) => {
  try {
    const { message, context, userId = 'anonymous' } = req.body;
    
    if (!message || message.trim().length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Message is required and cannot be empty' 
      });
    }

    if (message.length > 2000) {
      return res.status(400).json({
        success: false,
        message: 'Message too long (max 2000 characters)'
      });
    }

    // Get or create conversation history
    if (!conversationMemory.has(userId)) {
      conversationMemory.set(userId, {
        messages: [],
        preferences: {},
        lastActive: Date.now()
      });
    }
    
    const userConversation = conversationMemory.get(userId);
    userConversation.messages.push({ role: 'user', content: message, timestamp: Date.now() });
    userConversation.lastActive = Date.now();
    
    // Keep only last 10 messages to manage memory
    if (userConversation.messages.length > 10) {
      userConversation.messages = userConversation.messages.slice(-10);
    }

    // Detect intent with enhanced NLP
    const intent = detectIntent(message);
    console.log(`🎯 Detected intent: ${intent} for message: "${message.substring(0, 50)}..."`);
    
    // Try to generate personalized response first
    const personalizedResult = await generatePersonalizedResponse(intent, message, userId, userConversation.messages);
    
    if (personalizedResult) {
      // Use our enhanced system
      userConversation.messages.push({ role: 'assistant', content: personalizedResult.response, timestamp: Date.now() });
      
      return res.json({
        success: true,
        data: {
          message: personalizedResult.response,
          intent: intent,
          additional_data: personalizedResult.additionalData,
          source: personalizedResult.source,
          external_data: personalizedResult.externalData,
          conversation_id: userId,
          timestamp: new Date().toISOString()
        }
      });
    }
    
    // Fall back to OpenAI for complex queries
    const conversationContext = userConversation.messages.slice(-5).map(m => `${m.role}: ${m.content}`).join('\n');
    
    const systemPrompt = `You are an expert Ethiopian Heritage Assistant for EthioHeritage360 platform. You have deep knowledge of:
    
    🏛️ UNESCO World Heritage Sites: Lalibela, Axum, Gondar, Omo Valley
    🎭 Cultural practices: 80+ ethnic groups, ancient traditions
    📚 History: 3000+ years, never fully colonized
    🍽️ Cuisine: Injera, coffee ceremony, spicy stews
    🎵 Arts: Traditional music, dance, handicrafts
    🗣️ Languages: 80+ languages, Amharic script
    
    Be conversational, enthusiastic, and helpful. Always relate responses back to available platform features.
    
    Previous conversation context:
    ${conversationContext}
    
    Current user intent detected: ${intent}`;

    const completion = await makeOpenAIRequest({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      max_tokens: 1000,
      temperature: 0.8
    });

    const aiResponse = completion.choices[0]?.message?.content;
    userConversation.messages.push({ role: 'assistant', content: aiResponse, timestamp: Date.now() });
    
    res.json({
      success: true,
      data: {
        message: aiResponse,
        intent: intent,
        source: 'openai_enhanced',
        conversation_id: userId,
        usage: completion.usage,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Enhanced Chat Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing chat request',
      error: error.message
    });
  }
});

// Heritage Information Endpoint
app.post('/api/heritage-info', validateOpenAI, checkRateLimit, async (req, res) => {
  try {
    const { site, query } = req.body;
    
    if (!site && !query) {
      return res.status(400).json({ success: false, message: 'Site name or query required' });
    }

    // Validate input length
    const input = site || query;
    if (input.length > 200) {
      return res.status(400).json({
        success: false,
        message: 'Input too long (max 200 characters)'
      });
    }

    const prompt = site 
      ? `Tell me about the Ethiopian heritage site: ${site}. Include historical significance, cultural importance, and visitor information.`
      : query;

    const completion = await makeOpenAIRequest({
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
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching heritage information',
      error: error.message
    });
  }
});

// Tour Suggestions Endpoint
app.post('/api/tour-suggestions', validateOpenAI, checkRateLimit, async (req, res) => {
  try {
    const { interests, duration, location } = req.body;
    
    if (!interests || interests.trim().length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Interests are required for tour suggestions' 
      });
    }

    // Validate input lengths
    if (interests.length > 300) {
      return res.status(400).json({
        success: false,
        message: 'Interests description too long (max 300 characters)'
      });
    }

    if (duration && duration.length > 50) {
      return res.status(400).json({
        success: false,
        message: 'Duration description too long (max 50 characters)'
      });
    }

    if (location && location.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Location description too long (max 100 characters)'
      });
    }

    const prompt = `Create a personalized Ethiopian heritage tour based on:
    - Interests: ${interests}
    - Duration: ${duration || 'flexible'}
    - Starting location: ${location || 'flexible'}
    
    Provide detailed itinerary with sites, experiences, and practical tips.`;

    const completion = await makeOpenAIRequest({
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
    res.status(500).json({ 
      success: false, 
      message: 'Error generating tour suggestions',
      error: error.message
    });
  }
});

// Cultural Context Endpoint
app.post('/api/cultural-context', validateOpenAI, checkRateLimit, async (req, res) => {
  try {
    const { text, context_type } = req.body;
    
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Text is required for cultural context' 
      });
    }

    // Validate input length
    if (text.length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Text too long (max 500 characters)'
      });
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

    const completion = await makeOpenAIRequest({
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
    res.status(500).json({ 
      success: false, 
      message: 'Error providing cultural context',
      error: error.message
    });
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

// ============ ADMIN SEED ENDPOINT ============

// Seed admin users endpoint (for production setup)
app.post('/api/admin/seed-users', async (req, res) => {
  try {
    const { secretKey } = req.body;
    
    // Security check
    if (secretKey !== 'ethioheritage360-setup-secret-2024') {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    console.log('🌱 Seeding admin users...');
    
    const results = [];
    
    // Admin users to create
    const adminUsers = [
      {
        name: 'Melkamu Wako',
        email: 'melkamuwako5@admin.com',
        password: 'admin123',
        role: 'super_admin',
        isActive: true
      },
      {
        name: 'Museum Administrator', 
        email: 'museum.admin@ethioheritage360.com',
        password: 'museum123',
        role: 'admin',
        isActive: true
      },
      {
        name: 'Heritage Tour Organizer',
        email: 'organizer@heritagetours.et', 
        password: 'tour123',
        role: 'tour_organizer',
        isActive: true
      }
    ];

    for (const userData of adminUsers) {
      try {
        // Check if user exists
        const existingUser = await User.findOne({ email: userData.email });
        
        if (existingUser) {
          // Update existing user
          existingUser.password = userData.password;
          existingUser.role = userData.role;
          existingUser.isActive = userData.isActive;
          await existingUser.save();
          
          results.push({
            email: userData.email,
            action: 'updated',
            role: userData.role,
            status: 'success'
          });
          console.log(`✅ Updated ${userData.email}`);
        } else {
          // Create new user
          const newUser = new User(userData);
          await newUser.save();
          
          results.push({
            email: userData.email,
            action: 'created',
            role: userData.role,
            status: 'success'
          });
          console.log(`✅ Created ${userData.email}`);
        }
        
        // Test password
        const testUser = await User.findOne({ email: userData.email });
        const passwordTest = await testUser.comparePassword(userData.password);
        results[results.length - 1].passwordTest = passwordTest ? 'PASS' : 'FAIL';
        
      } catch (error) {
        results.push({
          email: userData.email,
          action: 'failed',
          status: 'error',
          error: error.message
        });
        console.error(`❌ Failed ${userData.email}:`, error.message);
      }
    }

    res.json({
      success: true,
      message: 'Admin users seeded successfully',
      results: results,
      credentials: {
        super_admin: 'melkamuwako5@admin.com / admin123',
        museum_admin: 'museum.admin@ethioheritage360.com / museum123', 
        tour_organizer: 'organizer@heritagetours.et / tour123'
      }
    });
    
  } catch (error) {
    console.error('Seeding error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Seeding failed', 
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
        name: 'National Museum Admin',
        email: museumEmail,
        password: 'museum123', // Change this password!
        role: 'museum'
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
