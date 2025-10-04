const express = require('express');
const router = express.Router();
const { ChatRoom, ChatMessage } = require('../models/ChatHistory');
const User = require('../models/User');
const Notification = require('../models/Notification');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/chat');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|zip|rar/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only specific file types are allowed!'));
    }
  }
});

// Get all chat rooms for a user
router.get('/rooms', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const chatRooms = await ChatRoom.findByUser(userId);

    // Calculate unread counts for each room
    const roomsWithUnread = await Promise.all(
      chatRooms.map(async (room) => {
        const participant = room.participants.find(
          p => p.user._id.toString() === userId
        );

        const unreadCount = room.messages.filter(message => {
          return message.createdAt > participant.lastSeenAt &&
            message.sender.toString() !== userId &&
            !message.isDeleted;
        }).length;

        return {
          ...room.toObject(),
          unreadCount
        };
      })
    );

    res.json({
      success: true,
      data: roomsWithUnread
    });
  } catch (error) {
    console.error('Error fetching chat rooms:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chat rooms',
      error: error.message
    });
  }
});

// Get messages for a specific chat room
router.get('/rooms/:roomId/messages', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { page = 1, limit = 50, userId } = req.query;

    const room = await ChatRoom.findById(roomId)
      .populate('messages.sender', 'name email role profile.avatar')
      .populate('messages.readBy.user', 'name')
      .populate('messages.reactions.user', 'name');

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Chat room not found'
      });
    }

    // Check if user is participant
    const isParticipant = room.participants.some(
      p => p.user.toString() === userId
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not a participant of this chat room.'
      });
    }

    // Filter out deleted messages and sort by creation date
    const messages = room.messages
      .filter(msg => !msg.isDeleted)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice((page - 1) * limit, page * limit);

    res.json({
      success: true,
      data: {
        room: {
          id: room._id,
          name: room.name,
          type: room.type,
          participants: room.participants
        },
        messages: messages.reverse(), // Show oldest first
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: room.messages.filter(msg => !msg.isDeleted).length
        }
      }
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages',
      error: error.message
    });
  }
});

// Send a message
router.post('/rooms/:roomId/messages', upload.array('attachments', 5), async (req, res) => {
  try {
    const { roomId } = req.params;
    const { senderId, content, type = 'text', priority = 'normal', replyTo, mentions } = req.body;

    if (!senderId || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Sender ID and message content are required'
      });
    }

    const room = await ChatRoom.findById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Chat room not found'
      });
    }

    // Check if sender is participant
    const isParticipant = room.participants.some(
      p => p.user.toString() === senderId
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not a participant of this chat room.'
      });
    }

    // Process file attachments
    const attachments = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        attachments.push({
          fileName: file.originalname,
          fileType: file.mimetype,
          fileSize: file.size,
          filePath: file.path
        });
      });
    }

    // Parse mentions if provided
    let parsedMentions = [];
    if (mentions) {
      try {
        parsedMentions = JSON.parse(mentions);
      } catch (e) {
        console.warn('Invalid mentions format:', e);
      }
    }

    const metadata = {
      priority,
      mentions: parsedMentions,
      attachments
    };

    if (replyTo) {
      metadata.replyTo = replyTo;
    }

    // Add message to room
    await room.addChatMessage(senderId, content, type, metadata);

    // Get the newly added message with populated sender
    const updatedRoom = await ChatRoom.findById(roomId)
      .populate('messages.sender', 'name email role profile.avatar');

    const newChatMessage = updatedRoom.messages[updatedRoom.messages.length - 1];

    // Emit to all participants via Socket.IO
    const io = req.app.get('io');
    room.participants.forEach(participant => {
      if (participant.user.toString() !== senderId) {
        io.to(`user-${participant.user}`).emit('new-message', {
          roomId: roomId,
          message: newChatMessage,
          roomName: room.name
        });
      }
    });

    // Create notifications for mentioned users
    if (parsedMentions.length > 0) {
      const sender = await User.findById(senderId);

      for (const mention of parsedMentions) {
        const notification = new Notification({
          title: `You were mentioned by ${sender.name}`,
          message: `${sender.name} mentioned you in ${room.name}: "${content.substring(0, 100)}..."`,
          type: 'communication',
          category: 'communication',
          priority: 'medium',
          recipients: [{ user: mention.user }],
          context: {
            source: 'chat_system',
            relatedEntity: 'chat',
            relatedEntityId: roomId,
            metadata: {
              messageId: newChatMessage._id,
              roomName: room.name
            }
          },
          createdBy: senderId
        });

        await notification.save();
        await notification.send();

        // Emit notification
        io.to(`user-${mention.user}`).emit('new-notification', notification);
      }
    }

    res.json({
      success: true,
      message: 'ChatMessage sent successfully',
      data: newChatMessage
    });

  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message
    });
  }
});

// Create a new chat room or get existing direct message
router.post('/rooms', async (req, res) => {
  try {
    const { name, type, participants, createdBy, description, category = 'general', priority = 'normal' } = req.body;

    if (!name || !type || !participants || !createdBy) {
      return res.status(400).json({
        success: false,
        message: 'Name, type, participants, and creator are required'
      });
    }

    // For direct messages, check if room already exists
    if (type === 'direct' && participants.length === 2) {
      const existingRoom = await ChatRoom.findDirectChatMessage(participants[0], participants[1]);
      if (existingRoom) {
        return res.json({
          success: true,
          message: 'Direct message room already exists',
          data: existingRoom
        });
      }
    }

    // Create new chat room
    const chatRoom = new ChatRoom({
      name,
      description,
      type,
      participants: participants.map(userId => ({
        user: userId,
        role: userId === createdBy ? 'admin' : 'member'
      })),
      createdBy,
      metadata: {
        category,
        priority
      }
    });

    await chatRoom.save();

    // Populate the created room
    const populatedRoom = await ChatRoom.findById(chatRoom._id)
      .populate('participants.user', 'name email role profile.avatar')
      .populate('createdBy', 'name email');

    // Notify participants via Socket.IO
    const io = req.app.get('io');
    participants.forEach(userId => {
      if (userId !== createdBy) {
        io.to(`user-${userId}`).emit('new-chat-room', {
          room: populatedRoom,
          message: `You have been added to ${name}`
        });
      }
    });

    res.status(201).json({
      success: true,
      message: 'Chat room created successfully',
      data: populatedRoom
    });

  } catch (error) {
    console.error('Error creating chat room:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create chat room',
      error: error.message
    });
  }
});

// Mark messages as read
router.put('/rooms/:roomId/read', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { userId, messageId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const room = await ChatRoom.findById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Chat room not found'
      });
    }

    await room.markAsRead(userId, messageId);

    res.json({
      success: true,
      message: 'ChatMessages marked as read'
    });

  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark messages as read',
      error: error.message
    });
  }
});

// Get admin communication channels (Super Admin and Museum Admin)
router.get('/admin-channels', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Get user to check role
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is admin
    if (!['super_admin', 'admin', 'museum_admin'].includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    // Get admin channels
    const adminChannels = await ChatRoom.findAdminChannels();

    res.json({
      success: true,
      data: adminChannels
    });

  } catch (error) {
    console.error('Error fetching admin channels:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin channels',
      error: error.message
    });
  }
});

// Create admin announcement channel
router.post('/admin-announcement', async (req, res) => {
  try {
    const { title, message, priority = 'high', createdBy, targetRoles = ['museum_admin'] } = req.body;

    if (!title || !message || !createdBy) {
      return res.status(400).json({
        success: false,
        message: 'Title, message, and creator are required'
      });
    }

    // Get creator details
    const creator = await User.findById(createdBy);
    if (!creator || !['super_admin', 'admin'].includes(creator.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Super admin privileges required.'
      });
    }

    // Get target users based on roles
    const targetUsers = await User.find({
      role: { $in: targetRoles },
      isActive: true
    });

    // Create announcement room
    const announcementRoom = new ChatRoom({
      name: `📢 ${title}`,
      description: `Official announcement from ${creator.name}`,
      type: 'announcement',
      participants: [
        { user: createdBy, role: 'admin' },
        ...targetUsers.map(user => ({ user: user._id, role: 'member' }))
      ],
      createdBy,
      metadata: {
        category: 'administrative',
        priority: priority
      },
      settings: {
        requireApproval: true,
        allowFileUploads: false
      }
    });

    await announcementRoom.save();

    // Add the announcement message
    await announcementRoom.addChatMessage(createdBy, message, 'announcement', {
      priority: priority
    });

    // Create notifications
    for (const user of targetUsers) {
      const notification = new Notification({
        title: `📢 New Announcement: ${title}`,
        message: message.substring(0, 200) + (message.length > 200 ? '...' : ''),
        type: 'announcement',
        category: 'administrative',
        priority: priority,
        recipients: [{ user: user._id }],
        context: {
          source: 'admin_system',
          relatedEntity: 'chat',
          relatedEntityId: announcementRoom._id,
          metadata: {
            announcementTitle: title,
            createdBy: creator.name
          }
        },
        createdBy: createdBy
      });

      await notification.save();
      await notification.send();
    }

    // Emit via Socket.IO
    const io = req.app.get('io');
    targetUsers.forEach(user => {
      io.to(`user-${user._id}`).emit('new-announcement', {
        room: announcementRoom,
        title: title,
        message: message,
        priority: priority,
        from: creator.name
      });
    });

    res.status(201).json({
      success: true,
      message: 'Announcement sent successfully',
      data: {
        roomId: announcementRoom._id,
        recipients: targetUsers.length
      }
    });

  } catch (error) {
    console.error('Error creating admin announcement:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create announcement',
      error: error.message
    });
  }
});

// Get support chat (for museum admins to contact super admin)
router.get('/support', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Check if support chat exists
    let supportChat = await ChatRoom.findOne({
      type: 'support',
      'participants.user': userId,
      isActive: true
    }).populate('participants.user', 'name email role profile.avatar');

    if (!supportChat) {
      // Create new support chat
      const user = await User.findById(userId);
      const superAdmins = await User.find({
        role: 'super_admin',
        isActive: true
      }).limit(1);

      if (superAdmins.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No super admin available for support'
        });
      }

      supportChat = new ChatRoom({
        name: `🛟 Support - ${user.name}`,
        description: `Support chat for ${user.name}`,
        type: 'support',
        participants: [
          { user: userId, role: 'member' },
          { user: superAdmins[0]._id, role: 'admin' }
        ],
        createdBy: userId,
        metadata: {
          category: 'support',
          priority: 'normal'
        }
      });

      await supportChat.save();

      // Populate the created chat
      supportChat = await ChatRoom.findById(supportChat._id)
        .populate('participants.user', 'name email role profile.avatar');

      // Notify super admin
      const io = req.app.get('io');
      io.to(`user-${superAdmins[0]._id}`).emit('new-support-request', {
        room: supportChat,
        from: user.name,
        message: 'New support request created'
      });
    }

    res.json({
      success: true,
      data: supportChat
    });

  } catch (error) {
    console.error('Error getting support chat:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get support chat',
      error: error.message
    });
  }
});

// === ENHANCED CHATBOT WITH OPENAI INTEGRATION ===

/**
 * POST /api/chat/openai
 * Get intelligent response from OpenAI with cultural context for Ethiopian heritage
 */
router.post('/openai', async (req, res) => {
  try {
    const { messages, context, userRole, platform } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Messages array is required and cannot be empty'
      });
    }

    // Check if OpenAI service is available
    const openAIService = require('../services/openaiService');
    if (!openAIService.isAvailable()) {
      return res.status(503).json({
        success: false,
        message: 'OpenAI service is currently unavailable',
        fallback: true
      });
    }

    // Prepare the request for OpenAI
    const openAIRequest = {
      model: 'gpt-3.5-turbo',
      messages: messages,
      max_tokens: 500,
      temperature: 0.7,
      presence_penalty: 0.1,
      frequency_penalty: 0.1
    };

    // Get response from OpenAI
    const openAIResponse = await openAIService.getChatCompletion(openAIRequest);
    
    if (!openAIResponse || !openAIResponse.choices || openAIResponse.choices.length === 0) {
      return res.status(500).json({
        success: false,
        message: 'Failed to get response from OpenAI',
        fallback: true
      });
    }

    const responseText = openAIResponse.choices[0].message.content;

    // Enhance response with contextual suggestions
    const suggestions = generateOpenAIContextualSuggestions(context, userRole, responseText);
    
    // Analyze intent and confidence
    const analysis = analyzeOpenAIResponse(responseText, context);

    res.json({
      success: true,
      data: {
        text: responseText,
        suggestions: suggestions,
        intent: analysis.intent,
        confidence: analysis.confidence,
        context: context,
        userRole: userRole,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('OpenAI chat error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Internal server error while processing chat request',
      fallback: true,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/chat/context
 * Get contextual information for enhanced chatbot responses
 */
router.post('/context', async (req, res) => {
  try {
    const { currentPath, userActivity } = req.body;
    
    // Get user if authenticated
    let user = null;
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (token) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        user = await User.findById(decoded.userId).select('-password');
      } catch (error) {
        console.warn('Invalid token in context request:', error.message);
      }
    }

    // Determine user context based on their activity and current page
    const context = {
      userRole: user?.role || 'visitor',
      currentSection: detectSectionFromPath(currentPath),
      recentActivity: userActivity || [],
      preferences: user?.preferences || {},
      platformContext: detectPlatformContextFromPath(currentPath),
      timestamp: new Date().toISOString()
    };

    res.json({
      success: true,
      context: context
    });

  } catch (error) {
    console.error('Context detection error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to detect user context'
    });
  }
});

// === CHATBOT API ENDPOINTS ===

// Handle chatbot questions with intelligent responses
router.post('/ask', async (req, res) => {
  try {
    const {
      question,
      context = {},
      chatHistory = [],
      userInfo = {},
      metadata = {}
    } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Question is required'
      });
    }

    // Get user if authenticated
    let user = null;
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (token) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        user = await User.findById(decoded.userId).select('-password');
      } catch (error) {
        console.warn('Invalid token in chatbot request:', error.message);
      }
    }

    // Enhanced response generation based on question analysis
    const response = await generateChatbotResponse({
      question: question.trim(),
      context,
      chatHistory: chatHistory.slice(-10), // Keep last 10 messages for context
      user,
      userInfo,
      metadata
    });

    // Save chat interaction if user is authenticated
    if (user) {
      try {
        await saveChatInteraction(user._id, question, response);
      } catch (saveError) {
        console.warn('Failed to save chat interaction:', saveError.message);
      }
    }

    res.json({
      success: true,
      data: {
        answer: response.answer,
        suggestions: response.suggestions || [],
        references: response.references || [],
        confidence: response.confidence || 'medium',
        timestamp: new Date().toISOString(),
        conversationId: response.conversationId
      }
    });

  } catch (error) {
    console.error('Error processing chatbot question:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process question',
      error: error.message,
      data: {
        answer: 'I apologize, but I\'m experiencing technical difficulties right now. Please try again in a moment or contact support if the issue persists.',
        suggestions: [
          'Try rephrasing your question',
          'Contact support for assistance',
          'Check our FAQ section'
        ],
        references: [],
        confidence: 'low'
      }
    });
  }
});

// Get chatbot conversation folders/categories for enhanced suggestions
router.get('/folders', async (req, res) => {
  try {
    const folders = {
      'getting-started': {
        name: 'Getting Started',
        description: 'Basic information and setup guides',
        topics: [
          'Account creation',
          'First steps',
          'Basic navigation',
          'Profile setup'
        ]
      },
      'features': {
        name: 'Features & Functions',
        description: 'Learn about available features',
        topics: [
          'Museum management',
          'Artifact cataloging',
          'User roles',
          'Communication tools'
        ]
      },
      'technical': {
        name: 'Technical Support',
        description: 'Technical issues and troubleshooting',
        topics: [
          'Login issues',
          'Performance problems',
          'Browser compatibility',
          'Data backup'
        ]
      },
      'administration': {
        name: 'Administration',
        description: 'Admin and management features',
        topics: [
          'User management',
          'System settings',
          'Reports and analytics',
          'Security settings'
        ]
      }
    };

    res.json({
      success: true,
      data: folders
    });

  } catch (error) {
    console.error('Error fetching chatbot folders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch folders',
      error: error.message
    });
  }
});

// Get chat history for authenticated users
router.get('/history', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get chat history from user's chatHistory field or a separate ChatbotHistory model
    const chatHistory = user.chatHistory || [];

    // Return recent chat interactions (last 50)
    const recentHistory = chatHistory
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 50);

    res.json({
      success: true,
      data: recentHistory
    });

  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chat history',
      error: error.message
    });
  }
});

// Save chat message to history
router.post('/save', async (req, res) => {
  try {
    const { question, answer, metadata = {} } = req.body;
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await saveChatInteraction(user._id, question, { answer, ...metadata });

    res.json({
      success: true,
      message: 'Chat interaction saved successfully'
    });

  } catch (error) {
    console.error('Error saving chat interaction:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save chat interaction',
      error: error.message
    });
  }
});

// Clear chat history
router.delete('/history', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Clear chat history
    user.chatHistory = [];
    await user.save();

    res.json({
      success: true,
      message: 'Chat history cleared successfully'
    });

  } catch (error) {
    console.error('Error clearing chat history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear chat history',
      error: error.message
    });
  }
});

// === CHATBOT HELPER FUNCTIONS ===

async function generateChatbotResponse({ question, context, chatHistory, user, userInfo, metadata }) {
  const questionLower = question.toLowerCase();

  // Define response patterns and keywords
  const responses = {
    // Greetings
    greetings: {
      keywords: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'],
      responses: [
        user ? `Hello ${user.name}! How can I assist you today?` : 'Hello! How can I help you today?',
        'Hi there! What would you like to know?',
        'Greetings! I\'m here to help you with any questions you might have.'
      ]
    },

    // Account and profile questions
    account: {
      keywords: ['account', 'profile', 'login', 'password', 'register', 'sign up', 'sign in'],
      responses: [
        'For account-related questions, you can manage your profile in the user settings. If you\'re having trouble logging in, try using the "Forgot Password" feature.',
        'Account issues can usually be resolved through your profile settings. Would you like me to guide you to the right section?'
      ],
      suggestions: [
        'How do I reset my password?',
        'How do I update my profile?',
        'What information do I need to register?',
        'Why can\'t I log in?'
      ]
    },

    // Museum management
    museum: {
      keywords: ['museum', 'artifact', 'collection', 'exhibit', 'catalog', 'inventory'],
      responses: [
        'Our museum management system helps you catalog artifacts, manage collections, and organize exhibits. You can access these features through the main dashboard.',
        'For museum operations, you can manage artifacts, create exhibits, and track your collections. What specific aspect would you like to know more about?'
      ],
      suggestions: [
        'How do I add a new artifact?',
        'How do I create an exhibit?',
        'How do I manage my collection?',
        'Can I export my catalog data?'
      ]
    },

    // Technical support
    technical: {
      keywords: ['error', 'bug', 'problem', 'issue', 'not working', 'slow', 'crash', 'loading'],
      responses: [
        'I\'m sorry you\'re experiencing technical difficulties. Can you describe what specific issue you\'re encountering? This will help me provide better assistance.',
        'Technical issues can be frustrating. Let me help you troubleshoot the problem. What exactly is happening?'
      ],
      suggestions: [
        'The page is loading slowly',
        'I\'m getting an error message',
        'Features are not responding',
        'I need to report a bug'
      ]
    },

    // User roles and permissions
    permissions: {
      keywords: ['role', 'permission', 'access', 'admin', 'user', 'staff', 'curator'],
      responses: [
        'User roles determine what features and data you can access. The system supports various roles including visitors, staff, curators, and administrators.',
        'Access permissions are managed through user roles. Would you like to know more about what each role can do?'
      ],
      suggestions: [
        'What can a curator do?',
        'How do I get admin access?',
        'What are the different user roles?',
        'Who can modify artifacts?'
      ]
    }
  };

  // Find the best matching category
  let bestMatch = null;
  let matchScore = 0;

  for (const [category, data] of Object.entries(responses)) {
    const score = data.keywords.filter(keyword => questionLower.includes(keyword)).length;
    if (score > matchScore) {
      matchScore = score;
      bestMatch = { category, ...data };
    }
  }

  // Generate response
  let answer, suggestions = [], references = [];
  let confidence = 'medium';

  if (bestMatch && matchScore > 0) {
    answer = bestMatch.responses[Math.floor(Math.random() * bestMatch.responses.length)];
    suggestions = bestMatch.suggestions || [];
    confidence = 'high';
    references = [
      {
        title: `${bestMatch.category.charAt(0).toUpperCase() + bestMatch.category.slice(1)} Help`,
        url: `/help/${bestMatch.category}`,
        description: `Learn more about ${bestMatch.category}-related topics`
      }
    ];
  } else {
    // Fallback responses
    const fallbackResponses = [
      'I understand you have a question, but I need a bit more context to provide the best answer. Could you please provide more details?',
      'That\'s an interesting question! While I may not have a specific answer right now, I can help you find the right resources or contact support for detailed assistance.',
      'I\'m here to help! Could you rephrase your question or provide more specific details so I can assist you better?'
    ];

    answer = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
    suggestions = [
      'Tell me about museum features',
      'How do I manage my account?',
      'What are user roles and permissions?',
      'I need technical support'
    ];
    confidence = 'low';
  }

  // Add personalization if user is authenticated
  if (user) {
    references.push({
      title: 'Your Profile',
      url: '/profile',
      description: 'View and edit your account settings'
    });

    if (user.role === 'museum_admin' || user.role === 'admin') {
      suggestions.push('How do I manage users?', 'What admin features are available?');
    }
  }

  return {
    answer,
    suggestions: suggestions.slice(0, 6), // Limit to 6 suggestions
    references: references.slice(0, 3), // Limit to 3 references
    confidence,
    conversationId: metadata.conversationId || generateConversationId()
  };
}

async function saveChatInteraction(userId, question, response) {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    // Initialize chatHistory if it doesn't exist
    if (!user.chatHistory) {
      user.chatHistory = [];
    }

    // Add new interaction
    user.chatHistory.push({
      question,
      answer: response.answer || response,
      timestamp: new Date(),
      metadata: {
        confidence: response.confidence,
        suggestions: response.suggestions,
        references: response.references
      }
    });

    // Keep only last 100 interactions to prevent unbounded growth
    if (user.chatHistory.length > 100) {
      user.chatHistory = user.chatHistory.slice(-100);
    }

    await user.save();
  } catch (error) {
    console.error('Error saving chat interaction:', error);
    throw error;
  }
}

function generateConversationId() {
  return 'conv_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// === OPENAI HELPER FUNCTIONS ===

/**
 * Generate contextual suggestions for OpenAI responses
 */
function generateOpenAIContextualSuggestions(context, userRole, responseText) {
  const contextSuggestions = {
    museum_exploration: [
      "Browse artifact collections",
      "Learn about artifact history", 
      "Search for specific items"
    ],
    artifact_viewing: [
      "View related artifacts",
      "Learn more about this period",
      "Save to favorites"
    ],
    tour_booking: [
      "Available virtual tours",
      "Book physical tours", 
      "Check tour schedules"
    ],
    virtual_tour: [
      "Start 3D heritage tour",
      "Navigate to different sites",
      "Access tour guides"
    ],
    learning: [
      "Browse courses available",
      "Track learning progress",
      "Join study groups"
    ],
    admin_overview: [
      "View visitor analytics",
      "Manage artifacts",
      "Staff coordination"
    ],
    artifact_management: [
      "Upload new artifacts",
      "Edit descriptions", 
      "Organize collections"
    ],
    visitor_analytics: [
      "View engagement metrics",
      "Popular content analysis",
      "Export reports"
    ]
  };

  // Get context-specific suggestions
  let suggestions = contextSuggestions[context] || [
    "Tell me about Ethiopian heritage",
    "How do I use this platform?",
    "Contact support"
  ];

  // Add role-specific suggestions
  if (userRole === 'museumAdmin') {
    suggestions = suggestions.concat([
      "Help with platform management",
      "Staff coordination tips"
    ]);
  } else if (userRole === 'user') {
    suggestions = suggestions.concat([
      "Explore more heritage sites",
      "Join cultural discussions"
    ]);
  }

  // Limit to 3-4 most relevant suggestions
  return suggestions.slice(0, 4);
}

/**
 * Analyze OpenAI response for intent and confidence
 */
function analyzeOpenAIResponse(responseText, context) {
  const text = responseText.toLowerCase();
  
  // Detect intent based on keywords and context
  let intent = 'informational';
  let confidence = 0.8; // Higher confidence for OpenAI responses

  if (text.includes('book') || text.includes('reserve') || text.includes('schedule')) {
    intent = 'booking';
    confidence = 0.85;
  } else if (text.includes('learn') || text.includes('course') || text.includes('study')) {
    intent = 'educational';
    confidence = 0.85;
  } else if (text.includes('tour') || text.includes('visit') || text.includes('explore')) {
    intent = 'navigation';
    confidence = 0.9;
  } else if (text.includes('help') || text.includes('support') || text.includes('assistance')) {
    intent = 'support';
    confidence = 0.95;
  } else if (context.includes('admin')) {
    intent = 'administrative';
    confidence = 0.8;
  }

  return { intent, confidence };
}

/**
 * Detect platform context from URL path
 */
function detectPlatformContextFromPath(path) {
  if (!path) return 'general';
  
  const contextMap = {
    '/museums': 'museum_exploration',
    '/artifacts': 'artifact_viewing', 
    '/tours': 'tour_booking',
    '/virtual-tours': 'virtual_tour',
    '/education': 'learning',
    '/admin/dashboard': 'admin_overview',
    '/admin/artifacts': 'artifact_management',
    '/admin/visitors': 'visitor_analytics',
    '/admin/staff': 'staff_management',
    '/profile': 'user_profile',
    '/booking': 'tour_booking'
  };
  
  // Check for exact matches first
  if (contextMap[path]) {
    return contextMap[path];
  }
  
  // Check for partial matches
  for (const [route, context] of Object.entries(contextMap)) {
    if (path.includes(route.replace('/', ''))) {
      return context;
    }
  }
  
  // Default context based on URL patterns
  if (path.includes('admin')) {
    return 'admin_overview';
  } else if (path.includes('museum')) {
    return 'museum_exploration';
  } else if (path.includes('tour')) {
    return 'tour_booking';
  } else if (path.includes('learn') || path.includes('education')) {
    return 'learning';
  }
  
  return 'general';
}

module.exports = router;

