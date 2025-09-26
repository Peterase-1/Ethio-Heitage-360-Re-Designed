const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

class SocketManager {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map(); // userId -> socketId mapping
    this.activeRooms = new Set(); // Track active community rooms
  }

  initialize(server) {
    this.io = socketIo(server, {
      cors: {
        origin: process.env.CLIENT_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
          return next(new Error('Authentication error: No token provided'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        
        if (!user) {
          return next(new Error('Authentication error: User not found'));
        }

        socket.userId = user._id.toString();
        socket.userData = user;
        next();
      } catch (error) {
        console.error('Socket authentication error:', error);
        next(new Error('Authentication error: Invalid token'));
      }
    });

    this.io.on('connection', (socket) => {
      console.log(`User connected: ${socket.userData.name} (${socket.userId})`);
      
      // Store user connection
      this.connectedUsers.set(socket.userId, socket.id);
      
      // Join user to their personal room
      socket.join(`user:${socket.userId}`);
      
      // Join community rooms
      socket.join('community:general');
      
      // Broadcast user online status
      socket.broadcast.emit('user_online', {
        userId: socket.userId,
        userName: socket.userData.name,
        avatar: socket.userData.avatar
      });

      // Handle community events
      this.setupCommunityHandlers(socket);
      
      // Handle user disconnect
      socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.userData.name}`);
        this.connectedUsers.delete(socket.userId);
        
        // Broadcast user offline status
        socket.broadcast.emit('user_offline', {
          userId: socket.userId
        });
      });
    });

    console.log('Socket.IO initialized');
    return this.io;
  }

  setupCommunityHandlers(socket) {
    // Join/leave community rooms
    socket.on('join_community', (data) => {
      const { roomType, roomId } = data;
      const roomName = `${roomType}:${roomId}`;
      
      socket.join(roomName);
      this.activeRooms.add(roomName);
      
      console.log(`User ${socket.userData.name} joined room: ${roomName}`);
      
      // Notify others in the room
      socket.to(roomName).emit('user_joined_room', {
        userId: socket.userId,
        userName: socket.userData.name,
        roomName
      });
    });

    socket.on('leave_community', (data) => {
      const { roomType, roomId } = data;
      const roomName = `${roomType}:${roomId}`;
      
      socket.leave(roomName);
      
      console.log(`User ${socket.userData.name} left room: ${roomName}`);
      
      // Notify others in the room
      socket.to(roomName).emit('user_left_room', {
        userId: socket.userId,
        userName: socket.userData.name,
        roomName
      });
    });

    // Real-time typing indicators
    socket.on('typing_start', (data) => {
      const { roomType, roomId } = data;
      const roomName = `${roomType}:${roomId}`;
      
      socket.to(roomName).emit('user_typing', {
        userId: socket.userId,
        userName: socket.userData.name,
        isTyping: true
      });
    });

    socket.on('typing_stop', (data) => {
      const { roomType, roomId } = data;
      const roomName = `${roomType}:${roomId}`;
      
      socket.to(roomName).emit('user_typing', {
        userId: socket.userId,
        userName: socket.userData.name,
        isTyping: false
      });
    });

    // Handle real-time reactions
    socket.on('quick_reaction', (data) => {
      const { postId, reaction, roomType, roomId } = data;
      const roomName = roomType && roomId ? `${roomType}:${roomId}` : 'community:general';
      
      socket.to(roomName).emit('post_reaction', {
        postId,
        userId: socket.userId,
        userName: socket.userData.name,
        reaction,
        timestamp: new Date()
      });
    });

    // Handle live notifications
    socket.on('send_notification', (data) => {
      const { targetUserId, type, message, metadata } = data;
      
      const targetSocketId = this.connectedUsers.get(targetUserId);
      if (targetSocketId) {
        this.io.to(targetSocketId).emit('new_notification', {
          id: `notif_${Date.now()}`,
          type,
          message,
          metadata,
          from: {
            id: socket.userId,
            name: socket.userData.name,
            avatar: socket.userData.avatar
          },
          timestamp: new Date(),
          read: false
        });
      }
    });
  }

  // Broadcast to all users
  broadcast(event, data) {
    if (this.io) {
      this.io.emit(event, data);
    }
  }

  // Send to specific user
  sendToUser(userId, event, data) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId && this.io) {
      this.io.to(socketId).emit(event, data);
    }
  }

  // Send to room
  sendToRoom(roomName, event, data) {
    if (this.io) {
      this.io.to(roomName).emit(event, data);
    }
  }

  // Broadcast new post to community
  broadcastNewPost(post, author) {
    this.sendToRoom('community:general', 'new_post', {
      post: {
        ...post.toObject(),
        author
      },
      timestamp: new Date()
    });
  }

  // Broadcast post update (like, comment)
  broadcastPostUpdate(postId, updateType, data) {
    this.sendToRoom('community:general', 'post_updated', {
      postId,
      updateType, // 'like', 'comment', 'share'
      data,
      timestamp: new Date()
    });
  }

  // Broadcast study group updates
  broadcastGroupUpdate(groupId, updateType, data) {
    this.sendToRoom(`group:${groupId}`, 'group_updated', {
      groupId,
      updateType, // 'member_joined', 'member_left', 'discussion_added'
      data,
      timestamp: new Date()
    });
  }

  // Get online users count
  getOnlineUsersCount() {
    return this.connectedUsers.size;
  }

  // Get users in specific room
  getUsersInRoom(roomName) {
    if (!this.io) return [];
    
    const room = this.io.sockets.adapter.rooms.get(roomName);
    return room ? Array.from(room) : [];
  }

  // Middleware for adding socket to request
  addSocketToRequest() {
    return (req, res, next) => {
      req.io = this.io;
      req.socketManager = this;
      next();
    };
  }
}

const socketManager = new SocketManager();

module.exports = socketManager;
