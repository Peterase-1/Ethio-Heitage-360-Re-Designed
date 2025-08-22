const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Museum = require('../models/Museum');
const Notification = require('../models/Notification');

class NotificationSocketService {
  constructor(io) {
    this.io = io;
    this.userSockets = new Map(); // Map userId to socket instances
    this.setupNamespace();
  }

  setupNamespace() {
    // Create a dedicated namespace for notifications
    this.notificationNamespace = this.io.of('/notifications');
    
    this.notificationNamespace.use(async (socket, next) => {
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
        socket.userRole = user.role;
        socket.userData = user;
        
        next();
      } catch (error) {
        console.error('Socket authentication error:', error);
        next(new Error('Authentication error'));
      }
    });

    this.notificationNamespace.on('connection', (socket) => {
      this.handleConnection(socket);
    });
  }

  handleConnection(socket) {
    console.log(`User ${socket.userId} connected to notifications (${socket.userRole})`);
    
    // Store socket reference
    if (!this.userSockets.has(socket.userId)) {
      this.userSockets.set(socket.userId, new Set());
    }
    this.userSockets.get(socket.userId).add(socket);

    // Join user-specific room
    socket.join(`user:${socket.userId}`);
    
    // Join role-specific room
    socket.join(`role:${socket.userRole}`);
    
    // If museum admin, join museum-specific room
    if (socket.userRole === 'museum_admin') {
      this.joinMuseumRoom(socket);
    }

    // Handle events
    socket.on('mark-notification-read', (data) => this.handleMarkAsRead(socket, data));
    socket.on('dismiss-notification', (data) => this.handleDismissNotification(socket, data));
    socket.on('get-unread-count', () => this.handleGetUnreadCount(socket));
    socket.on('join-notification-room', (room) => this.handleJoinRoom(socket, room));
    socket.on('leave-notification-room', (room) => this.handleLeaveRoom(socket, room));
    
    socket.on('disconnect', () => {
      console.log(`User ${socket.userId} disconnected from notifications`);
      
      // Remove socket reference
      if (this.userSockets.has(socket.userId)) {
        this.userSockets.get(socket.userId).delete(socket);
        if (this.userSockets.get(socket.userId).size === 0) {
          this.userSockets.delete(socket.userId);
        }
      }
    });

    // Send initial unread count
    this.sendUnreadCount(socket);
  }

  async joinMuseumRoom(socket) {
    try {
      const museum = await Museum.findOne({ admin: socket.userId });
      if (museum) {
        socket.museumId = museum._id.toString();
        socket.join(`museum:${museum._id}`);
        console.log(`Museum admin ${socket.userId} joined museum room: ${museum._id}`);
      }
    } catch (error) {
      console.error('Error joining museum room:', error);
    }
  }

  async handleMarkAsRead(socket, data) {
    try {
      const { notificationId } = data;
      const notification = await Notification.findById(notificationId);
      
      if (notification) {
        await notification.markAsRead(socket.userId);
        
        // Broadcast to all user's connected devices
        this.notificationNamespace.to(`user:${socket.userId}`).emit('notification-read', {
          notificationId,
          userId: socket.userId,
          timestamp: new Date()
        });
        
        // Send updated unread count
        this.sendUnreadCountToUser(socket.userId);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      socket.emit('error', { message: 'Failed to mark notification as read' });
    }
  }

  async handleDismissNotification(socket, data) {
    try {
      const { notificationId } = data;
      const notification = await Notification.findById(notificationId);
      
      if (notification) {
        await notification.dismiss(socket.userId);
        
        // Broadcast to all user's connected devices
        this.notificationNamespace.to(`user:${socket.userId}`).emit('notification-dismissed', {
          notificationId,
          userId: socket.userId,
          timestamp: new Date()
        });
        
        // Send updated unread count
        this.sendUnreadCountToUser(socket.userId);
      }
    } catch (error) {
      console.error('Error dismissing notification:', error);
      socket.emit('error', { message: 'Failed to dismiss notification' });
    }
  }

  async handleGetUnreadCount(socket) {
    this.sendUnreadCount(socket);
  }

  handleJoinRoom(socket, room) {
    socket.join(room);
    console.log(`User ${socket.userId} joined room: ${room}`);
  }

  handleLeaveRoom(socket, room) {
    socket.leave(room);
    console.log(`User ${socket.userId} left room: ${room}`);
  }

  async sendUnreadCount(socket) {
    try {
      const unreadCount = await Notification.countDocuments({
        'recipients.user': socket.userId,
        'recipients.readAt': { $exists: false },
        isActive: true,
        $or: [
          { expiresAt: { $exists: false } },
          { expiresAt: { $gt: new Date() } }
        ]
      });

      socket.emit('unread-count', { count: unreadCount });
    } catch (error) {
      console.error('Error getting unread count:', error);
    }
  }

  async sendUnreadCountToUser(userId) {
    try {
      const unreadCount = await Notification.countDocuments({
        'recipients.user': userId,
        'recipients.readAt': { $exists: false },
        isActive: true,
        $or: [
          { expiresAt: { $exists: false } },
          { expiresAt: { $gt: new Date() } }
        ]
      });

      this.notificationNamespace.to(`user:${userId}`).emit('unread-count', { count: unreadCount });
    } catch (error) {
      console.error('Error sending unread count:', error);
    }
  }

  // Public methods for other parts of the application to use

  async sendNotificationToUser(userId, notification) {
    try {
      // Send to specific user
      this.notificationNamespace.to(`user:${userId}`).emit('new-notification', {
        notification,
        timestamp: new Date()
      });

      // Update unread count
      this.sendUnreadCountToUser(userId);
      
      console.log(`Notification sent to user ${userId}: ${notification.title}`);
    } catch (error) {
      console.error('Error sending notification to user:', error);
    }
  }

  async sendNotificationToRole(role, notification) {
    try {
      // Send to all users with specific role
      this.notificationNamespace.to(`role:${role}`).emit('new-notification', {
        notification,
        timestamp: new Date()
      });
      
      console.log(`Notification sent to role ${role}: ${notification.title}`);
    } catch (error) {
      console.error('Error sending notification to role:', error);
    }
  }

  async sendNotificationToMuseum(museumId, notification) {
    try {
      // Send to museum admin and staff
      this.notificationNamespace.to(`museum:${museumId}`).emit('new-notification', {
        notification,
        timestamp: new Date()
      });
      
      console.log(`Notification sent to museum ${museumId}: ${notification.title}`);
    } catch (error) {
      console.error('Error sending notification to museum:', error);
    }
  }

  async broadcastSystemNotification(notification) {
    try {
      // Send to all connected users
      this.notificationNamespace.emit('system-notification', {
        notification,
        timestamp: new Date()
      });
      
      console.log(`System notification broadcasted: ${notification.title}`);
    } catch (error) {
      console.error('Error broadcasting system notification:', error);
    }
  }

  // Notification type handlers
  async sendApprovalNotification(userId, notification) {
    await this.sendNotificationToUser(userId, {
      ...notification,
      type: 'approval',
      priority: 'high',
      sound: true
    });
  }

  async sendUrgentNotification(userId, notification) {
    await this.sendNotificationToUser(userId, {
      ...notification,
      priority: 'urgent',
      sound: true,
      persistent: true
    });
  }

  async sendRentalNotification(museumId, notification) {
    await this.sendNotificationToMuseum(museumId, {
      ...notification,
      type: 'rental',
      sound: true
    });
  }

  // Helper methods
  isUserOnline(userId) {
    return this.userSockets.has(userId);
  }

  getOnlineUsersCount() {
    return this.userSockets.size;
  }

  getUserSocketCount(userId) {
    return this.userSockets.has(userId) ? this.userSockets.get(userId).size : 0;
  }

  // Admin methods
  getConnectionStats() {
    const stats = {
      totalConnections: 0,
      userConnections: {},
      roomInfo: {}
    };

    for (const [userId, sockets] of this.userSockets.entries()) {
      stats.totalConnections += sockets.size;
      stats.userConnections[userId] = sockets.size;
    }

    return stats;
  }
}

module.exports = NotificationSocketService;
