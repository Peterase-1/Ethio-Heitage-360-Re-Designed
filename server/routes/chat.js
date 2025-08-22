const express = require('express');
const router = express.Router();
const { ChatRoom, Message } = require('../models/ChatHistory');
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
    await room.addMessage(senderId, content, type, metadata);
    
    // Get the newly added message with populated sender
    const updatedRoom = await ChatRoom.findById(roomId)
      .populate('messages.sender', 'name email role profile.avatar');
    
    const newMessage = updatedRoom.messages[updatedRoom.messages.length - 1];
    
    // Emit to all participants via Socket.IO
    const io = req.app.get('io');
    room.participants.forEach(participant => {
      if (participant.user.toString() !== senderId) {
        io.to(`user-${participant.user}`).emit('new-message', {
          roomId: roomId,
          message: newMessage,
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
              messageId: newMessage._id,
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
      message: 'Message sent successfully',
      data: newMessage
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
      const existingRoom = await ChatRoom.findDirectMessage(participants[0], participants[1]);
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
      message: 'Messages marked as read'
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
    await announcementRoom.addMessage(createdBy, message, 'announcement', {
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

module.exports = router;

