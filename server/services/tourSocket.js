const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Tour = require('../models/Tour');

class TourSocketService {
  constructor(io) {
    this.io = io;
    this.userSockets = new Map(); // Map userId to socket instances
    this.setupNamespace();
  }

  setupNamespace() {
    // Create a dedicated namespace for tours
    this.tourNamespace = this.io.of('/tours');
    
    this.tourNamespace.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
          console.log('Tour WebSocket: No token provided, allowing anonymous connection for public tours');
          // Allow anonymous connections for viewing tours
          socket.userId = 'anonymous';
          socket.userRole = 'visitor';
          next();
          return;
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        
        if (!user) {
          console.log('Tour WebSocket: User not found');
          socket.userId = 'anonymous';
          socket.userRole = 'visitor';
        } else {
          socket.userId = user._id.toString();
          socket.userRole = user.role;
          socket.userData = user;
        }
        
        next();
      } catch (error) {
        console.error('Tour socket authentication error:', error);
        // Allow connection but mark as anonymous
        socket.userId = 'anonymous';
        socket.userRole = 'visitor';
        next();
      }
    });

    this.tourNamespace.on('connection', (socket) => {
      this.handleConnection(socket);
    });
  }

  handleConnection(socket) {
    console.log(`User ${socket.userId} connected to tours (${socket.userRole})`);
    
    // Store socket reference
    if (!this.userSockets.has(socket.userId)) {
      this.userSockets.set(socket.userId, new Set());
    }
    this.userSockets.get(socket.userId).add(socket);

    // Join general tours room for public updates
    socket.join('tours:public');
    
    // Join role-specific room
    socket.join(`tours:role:${socket.userRole}`);
    
    // If user is a tour organizer, join organizer room
    if (socket.userRole === 'organizer' || socket.userRole === 'museum_admin') {
      socket.join('tours:organizers');
      socket.join(`tours:organizer:${socket.userId}`);
    }

    // Handle tour-specific events
    socket.on('join-tour-room', (data) => this.handleJoinTourRoom(socket, data));
    socket.on('leave-tour-room', (data) => this.handleLeaveTourRoom(socket, data));
    socket.on('join-tours-list-room', () => this.handleJoinToursListRoom(socket));
    socket.on('leave-tours-list-room', () => this.handleLeaveToursListRoom(socket));
    socket.on('subscribe-organizer-tours', (data) => this.handleSubscribeOrganizerTours(socket, data));
    socket.on('unsubscribe-organizer-tours', (data) => this.handleUnsubscribeOrganizerTours(socket, data));
    socket.on('notify-tour-creation', (data) => this.handleNotifyTourCreation(socket, data));
    socket.on('notify-tour-update', (data) => this.handleNotifyTourUpdate(socket, data));
    socket.on('request-tour-update', (data) => this.handleRequestTourUpdate(socket, data));
    
    socket.on('disconnect', () => {
      console.log(`User ${socket.userId} disconnected from tours`);
      
      // Remove socket reference
      if (this.userSockets.has(socket.userId)) {
        this.userSockets.get(socket.userId).delete(socket);
        if (this.userSockets.get(socket.userId).size === 0) {
          this.userSockets.delete(socket.userId);
        }
      }
    });

    // Send connection confirmation
    socket.emit('tour-socket-connected', {
      userId: socket.userId,
      role: socket.userRole,
      timestamp: new Date()
    });
  }

  handleJoinTourRoom(socket, data) {
    const { tourId } = data;
    if (tourId) {
      socket.join(`tour:${tourId}`);
      console.log(`User ${socket.userId} joined tour room: ${tourId}`);
      socket.emit('tour-room-joined', { tourId });
    }
  }

  handleLeaveTourRoom(socket, data) {
    const { tourId } = data;
    if (tourId) {
      socket.leave(`tour:${tourId}`);
      console.log(`User ${socket.userId} left tour room: ${tourId}`);
      socket.emit('tour-room-left', { tourId });
    }
  }

  handleJoinToursListRoom(socket) {
    socket.join('tours:list');
    console.log(`User ${socket.userId} joined tours list room`);
    socket.emit('tours-list-room-joined');
  }

  handleLeaveToursListRoom(socket) {
    socket.leave('tours:list');
    console.log(`User ${socket.userId} left tours list room`);
    socket.emit('tours-list-room-left');
  }

  handleSubscribeOrganizerTours(socket, data) {
    const { organizerId } = data;
    if (organizerId && (socket.userId === organizerId || socket.userRole === 'admin' || socket.userRole === 'super_admin')) {
      socket.join(`organizer:tours:${organizerId}`);
      console.log(`User ${socket.userId} subscribed to organizer tours: ${organizerId}`);
      socket.emit('organizer-tours-subscribed', { organizerId });
    }
  }

  handleUnsubscribeOrganizerTours(socket, data) {
    const { organizerId } = data;
    if (organizerId) {
      socket.leave(`organizer:tours:${organizerId}`);
      console.log(`User ${socket.userId} unsubscribed from organizer tours: ${organizerId}`);
      socket.emit('organizer-tours-unsubscribed', { organizerId });
    }
  }

  handleNotifyTourCreation(socket, data) {
    const { tour } = data;
    if (tour && (socket.userRole === 'organizer' || socket.userRole === 'museum_admin' || socket.userRole === 'admin')) {
      console.log(`Tour creation notification from ${socket.userId}: ${tour.title}`);
      
      // Broadcast to all users in tours list room (this will update the live tours page)
      this.broadcastTourCreation(tour, socket.userId);
    }
  }

  handleNotifyTourUpdate(socket, data) {
    const { tour } = data;
    if (tour && (socket.userRole === 'organizer' || socket.userRole === 'museum_admin' || socket.userRole === 'admin')) {
      console.log(`Tour update notification from ${socket.userId}: ${tour.title}`);
      
      // Broadcast to relevant rooms
      this.broadcastTourUpdate(tour, socket.userId);
    }
  }

  async handleRequestTourUpdate(socket, data) {
    const { tourId } = data;
    if (tourId) {
      try {
        const tour = await Tour.findById(tourId).populate('organizer', 'name email');
        if (tour) {
          socket.emit('tour-update-response', { tour });
        }
      } catch (error) {
        console.error('Error fetching tour update:', error);
        socket.emit('tour-update-error', { error: error.message });
      }
    }
  }

  // Public methods for broadcasting tour events

  /**
   * Broadcast tour creation to all relevant clients
   * @param {Object} tour - Tour data
   * @param {string} createdBy - User ID of the creator
   */
  broadcastTourCreation(tour, createdBy = null) {
    console.log(`Broadcasting tour creation: ${tour.title}`);

    const tourData = {
      tour,
      timestamp: new Date(),
      event: 'tour-created',
      createdBy
    };

    // Broadcast to all users viewing the tours list
    this.tourNamespace.to('tours:list').emit('tour-created', tourData);
    
    // Broadcast to all public tours room (for visitors)
    this.tourNamespace.to('tours:public').emit('tour-created', tourData);

    // If tour has organizer, notify organizer's subscribers
    if (tour.organizer) {
      this.tourNamespace.to(`organizer:tours:${tour.organizer}`).emit('tour-created', tourData);
    }

    console.log(`Tour creation broadcasted to all connected clients`);
  }

  /**
   * Broadcast tour update to all relevant clients
   * @param {Object} tour - Updated tour data
   * @param {string} updatedBy - User ID of the updater
   */
  broadcastTourUpdate(tour, updatedBy = null) {
    console.log(`Broadcasting tour update: ${tour.title}`);

    const tourData = {
      tour,
      timestamp: new Date(),
      event: 'tour-updated',
      updatedBy
    };

    // Broadcast to specific tour room
    this.tourNamespace.to(`tour:${tour._id || tour.id}`).emit('tour-updated', tourData);
    
    // Broadcast to tours list room
    this.tourNamespace.to('tours:list').emit('tour-updated', tourData);
    
    // Broadcast to public tours room
    this.tourNamespace.to('tours:public').emit('tour-updated', tourData);

    // If tour has organizer, notify organizer's subscribers
    if (tour.organizer) {
      this.tourNamespace.to(`organizer:tours:${tour.organizer}`).emit('tour-updated', tourData);
    }
  }

  /**
   * Broadcast tour deletion to all relevant clients
   * @param {string} tourId - Deleted tour ID
   * @param {string} organizerId - Tour organizer ID
   * @param {string} deletedBy - User ID of the deleter
   */
  broadcastTourDeletion(tourId, organizerId = null, deletedBy = null) {
    console.log(`Broadcasting tour deletion: ${tourId}`);

    const eventData = {
      tourId,
      timestamp: new Date(),
      event: 'tour-deleted',
      deletedBy
    };

    // Broadcast to specific tour room
    this.tourNamespace.to(`tour:${tourId}`).emit('tour-deleted', eventData);
    
    // Broadcast to tours list room
    this.tourNamespace.to('tours:list').emit('tour-deleted', eventData);
    
    // Broadcast to public tours room
    this.tourNamespace.to('tours:public').emit('tour-deleted', eventData);

    // If tour had organizer, notify organizer's subscribers
    if (organizerId) {
      this.tourNamespace.to(`organizer:tours:${organizerId}`).emit('tour-deleted', eventData);
    }
  }

  /**
   * Broadcast tour status change
   * @param {Object} tour - Tour data
   * @param {string} oldStatus - Previous status
   * @param {string} newStatus - New status
   */
  broadcastTourStatusChange(tour, oldStatus, newStatus) {
    console.log(`Broadcasting tour status change: ${tour.title} (${oldStatus} -> ${newStatus})`);

    const statusData = {
      tour,
      oldStatus,
      newStatus,
      timestamp: new Date(),
      event: 'tour-status-changed'
    };

    // Broadcast to specific tour room
    this.tourNamespace.to(`tour:${tour._id || tour.id}`).emit('tour-status-changed', statusData);
    
    // If changing to/from published, update the public listings
    if (oldStatus === 'published' || newStatus === 'published') {
      this.tourNamespace.to('tours:list').emit('tour-status-changed', statusData);
      this.tourNamespace.to('tours:public').emit('tour-status-changed', statusData);
    }
  }

  /**
   * Broadcast tour booking update
   * @param {Object} booking - Booking data
   * @param {Object} tour - Tour data
   */
  broadcastTourBookingUpdate(booking, tour) {
    console.log(`Broadcasting tour booking update for tour: ${tour.title}`);

    const bookingData = {
      booking,
      tour,
      timestamp: new Date(),
      event: 'tour-booking-update'
    };

    // Broadcast to specific tour room
    this.tourNamespace.to(`tour:${tour._id || tour.id}`).emit('tour-booking-update', bookingData);
    
    // Notify tour organizer
    if (tour.organizer) {
      this.tourNamespace.to(`organizer:tours:${tour.organizer}`).emit('tour-booking-update', bookingData);
    }
  }

  /**
   * Broadcast general tours refresh request
   */
  broadcastToursRefresh() {
    console.log('Broadcasting tours refresh');

    const refreshData = {
      timestamp: new Date(),
      event: 'tours-refresh'
    };

    // Broadcast to all tour-related rooms
    this.tourNamespace.to('tours:list').emit('tours-refresh', refreshData);
    this.tourNamespace.to('tours:public').emit('tours-refresh', refreshData);
    this.tourNamespace.to('tours:organizers').emit('tours-refresh', refreshData);
  }

  // Helper methods

  /**
   * Check if a user is online in tour namespace
   * @param {string} userId - User ID
   * @returns {boolean}
   */
  isUserOnline(userId) {
    return this.userSockets.has(userId) && this.userSockets.get(userId).size > 0;
  }

  /**
   * Get count of online users
   * @returns {number}
   */
  getOnlineUsersCount() {
    return this.userSockets.size;
  }

  /**
   * Get socket count for a specific user
   * @param {string} userId - User ID
   * @returns {number}
   */
  getUserSocketCount(userId) {
    return this.userSockets.has(userId) ? this.userSockets.get(userId).size : 0;
  }

  /**
   * Send message to specific user
   * @param {string} userId - User ID
   * @param {string} event - Event name
   * @param {Object} data - Data to send
   */
  sendToUser(userId, event, data) {
    if (this.userSockets.has(userId)) {
      this.userSockets.get(userId).forEach(socket => {
        socket.emit(event, data);
      });
    }
  }

  /**
   * Get connection statistics
   * @returns {Object}
   */
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

    // Get room information
    const adapter = this.tourNamespace.adapter;
    if (adapter && adapter.rooms) {
      for (const [roomName, room] of adapter.rooms) {
        stats.roomInfo[roomName] = room.size;
      }
    }

    return stats;
  }
}

module.exports = TourSocketService;
