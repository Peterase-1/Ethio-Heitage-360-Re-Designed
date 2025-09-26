import { io } from 'socket.io-client';

class TourWebSocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000; // Start with 1 second
    this.maxReconnectDelay = 30000; // Max 30 seconds
  }

  // Initialize WebSocket connection
  connect(token) {
    if (this.socket?.connected) {
      console.log('Tour WebSocket already connected');
      return;
    }

    try {
      const serverUrl = import.meta.env.VITE_WEBSOCKET_URL || import.meta.env.REACT_APP_WEBSOCKET_URL || 'http://localhost:5001';

      this.socket = io(`${serverUrl}/tours`, {
        auth: {
          token: token
        },
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true
      });

      this.setupEventHandlers();

      console.log('Tour WebSocket connecting...');
    } catch (error) {
      console.error('Error connecting to tour WebSocket:', error);
    }
  }

  // Setup event handlers
  setupEventHandlers() {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('Connected to tour WebSocket');
      this.connected = true;
      this.reconnectAttempts = 0;
      this.reconnectDelay = 1000;
      this.emit('connected');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from tour WebSocket:', reason);
      this.connected = false;
      this.emit('disconnected', reason);

      // Auto-reconnect unless it was a manual disconnect
      if (reason !== 'io client disconnect') {
        this.handleReconnect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('Tour WebSocket connection error:', error);
      this.connected = false;
      this.emit('error', error);
      this.handleReconnect();
    });

    // Tour events
    this.socket.on('tour-created', (data) => {
      console.log('New tour created:', data);
      this.emit('tourCreated', data);
    });

    this.socket.on('tour-updated', (data) => {
      console.log('Tour updated:', data);
      this.emit('tourUpdated', data);
    });

    this.socket.on('tour-deleted', (data) => {
      console.log('Tour deleted:', data);
      this.emit('tourDeleted', data);
    });

    this.socket.on('tour-status-changed', (data) => {
      console.log('Tour status changed:', data);
      this.emit('tourStatusChanged', data);
    });

    this.socket.on('tour-booking-update', (data) => {
      console.log('Tour booking update:', data);
      this.emit('tourBookingUpdate', data);
    });

    // Bulk tour updates
    this.socket.on('tours-refresh', (data) => {
      console.log('Tours refresh:', data);
      this.emit('toursRefresh', data);
    });

    // Error handling
    this.socket.on('error', (error) => {
      console.error('Tour WebSocket error:', error);
      this.emit('error', error);
    });
  }

  // Handle reconnection logic
  handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max tour WebSocket reconnection attempts reached');
      this.emit('maxReconnectAttemptsReached');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), this.maxReconnectDelay);

    console.log(`Attempting to reconnect tour WebSocket in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    setTimeout(() => {
      if (!this.connected && this.socket) {
        console.log('Attempting to reconnect tour WebSocket...');
        this.socket.connect();
      }
    }, delay);
  }

  // WebSocket methods for tour-specific actions
  joinTourRoom(tourId) {
    if (this.socket?.connected) {
      this.socket.emit('join-tour-room', { tourId });
      console.log(`Joined tour room: ${tourId}`);
    }
  }

  leaveTourRoom(tourId) {
    if (this.socket?.connected) {
      this.socket.emit('leave-tour-room', { tourId });
      console.log(`Left tour room: ${tourId}`);
    }
  }

  joinToursListRoom() {
    if (this.socket?.connected) {
      this.socket.emit('join-tours-list-room');
      console.log('Joined tours list room');
    }
  }

  leaveToursListRoom() {
    if (this.socket?.connected) {
      this.socket.emit('leave-tours-list-room');
      console.log('Left tours list room');
    }
  }

  // Subscribe to organizer tours
  subscribeToOrganizerTours(organizerId) {
    if (this.socket?.connected) {
      this.socket.emit('subscribe-organizer-tours', { organizerId });
      console.log(`Subscribed to organizer tours: ${organizerId}`);
    }
  }

  unsubscribeFromOrganizerTours(organizerId) {
    if (this.socket?.connected) {
      this.socket.emit('unsubscribe-organizer-tours', { organizerId });
      console.log(`Unsubscribed from organizer tours: ${organizerId}`);
    }
  }

  // Request real-time tour updates
  requestTourUpdate(tourId) {
    if (this.socket?.connected) {
      this.socket.emit('request-tour-update', { tourId });
    }
  }

  // Notify tour creation (from organizer side)
  notifyTourCreation(tour) {
    if (this.socket?.connected) {
      this.socket.emit('notify-tour-creation', { tour });
      console.log('Notified tour creation:', tour.title);
    }
  }

  // Notify tour update
  notifyTourUpdate(tour) {
    if (this.socket?.connected) {
      this.socket.emit('notify-tour-update', { tour });
      console.log('Notified tour update:', tour.title);
    }
  }

  // Event management
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in tour event listener for ${event}:`, error);
        }
      });
    }
  }

  // Disconnect
  disconnect() {
    if (this.socket) {
      console.log('Disconnecting from tour WebSocket');
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  // Connection status
  isConnected() {
    return this.connected && this.socket?.connected;
  }

  // Get connection info
  getConnectionInfo() {
    return {
      connected: this.connected,
      socketConnected: this.socket?.connected || false,
      reconnectAttempts: this.reconnectAttempts,
      id: this.socket?.id
    };
  }

  // Helper methods for specific tour operations
  subscribeTourUpdates(tourId, callback) {
    this.joinTourRoom(tourId);
    this.on('tourUpdated', (data) => {
      if (data.tour.id === tourId || data.tour._id === tourId) {
        callback(data);
      }
    });
  }

  subscribeNewTours(callback) {
    this.joinToursListRoom();
    this.on('tourCreated', callback);
  }

  subscribeAllTourUpdates(callbacks = {}) {
    this.joinToursListRoom();

    if (callbacks.onTourCreated) {
      this.on('tourCreated', callbacks.onTourCreated);
    }

    if (callbacks.onTourUpdated) {
      this.on('tourUpdated', callbacks.onTourUpdated);
    }

    if (callbacks.onTourDeleted) {
      this.on('tourDeleted', callbacks.onTourDeleted);
    }

    if (callbacks.onTourStatusChanged) {
      this.on('tourStatusChanged', callbacks.onTourStatusChanged);
    }

    if (callbacks.onToursRefresh) {
      this.on('toursRefresh', callbacks.onToursRefresh);
    }
  }

  unsubscribeAllTourUpdates() {
    this.leaveToursListRoom();
    this.listeners.clear();
  }
}

// Create singleton instance
const tourWebSocket = new TourWebSocketService();

export default tourWebSocket;
