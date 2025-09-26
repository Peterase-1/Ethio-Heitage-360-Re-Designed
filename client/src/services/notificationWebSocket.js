import { io } from 'socket.io-client';

class NotificationWebSocketService {
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
      console.log('WebSocket already connected');
      return;
    }

    try {
      const serverUrl = import.meta.env.VITE_WEBSOCKET_URL || import.meta.env.REACT_APP_WEBSOCKET_URL || 'http://localhost:5001';

      this.socket = io(`${serverUrl}/notifications`, {
        auth: {
          token: token
        },
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true
      });

      this.setupEventHandlers();

      console.log('Notification WebSocket connecting...');
    } catch (error) {
      console.error('Error connecting to notification WebSocket:', error);
    }
  }

  // Setup event handlers
  setupEventHandlers() {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('Connected to notification WebSocket');
      this.connected = true;
      this.reconnectAttempts = 0;
      this.reconnectDelay = 1000;
      this.emit('connected');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from notification WebSocket:', reason);
      this.connected = false;
      this.emit('disconnected', reason);

      // Auto-reconnect unless it was a manual disconnect
      if (reason !== 'io client disconnect') {
        this.handleReconnect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('Notification WebSocket connection error:', error);
      this.connected = false;
      this.emit('error', error);
      this.handleReconnect();
    });

    // Notification events
    this.socket.on('new-notification', (data) => {
      console.log('New notification received:', data);
      this.emit('newNotification', data);
      this.playNotificationSound(data.notification);
    });

    this.socket.on('notification-read', (data) => {
      console.log('Notification marked as read:', data);
      this.emit('notificationRead', data);
    });

    this.socket.on('notification-dismissed', (data) => {
      console.log('Notification dismissed:', data);
      this.emit('notificationDismissed', data);
    });

    this.socket.on('unread-count', (data) => {
      console.log('Unread count updated:', data);
      this.emit('unreadCountChanged', data);
    });

    this.socket.on('system-notification', (data) => {
      console.log('System notification received:', data);
      this.emit('systemNotification', data);
      this.playNotificationSound(data.notification, true);
    });

    // Error handling
    this.socket.on('error', (error) => {
      console.error('Notification WebSocket error:', error);
      this.emit('error', error);
    });
  }

  // Handle reconnection logic
  handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.emit('maxReconnectAttemptsReached');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), this.maxReconnectDelay);

    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    setTimeout(() => {
      if (!this.connected && this.socket) {
        console.log('Attempting to reconnect...');
        this.socket.connect();
      }
    }, delay);
  }

  // Play notification sound
  playNotificationSound(notification, isSystem = false) {
    try {
      // Only play sound if notification has sound enabled and user hasn't disabled sounds
      const soundEnabled = this.getSoundPreference();

      if (!soundEnabled || !notification.sound) {
        return;
      }

      // Create audio element
      const audio = new Audio();

      // Use different sounds for different types
      if (isSystem || notification.priority === 'urgent' || notification.priority === 'critical') {
        audio.src = '/sounds/urgent-notification.mp3';
      } else if (notification.type === 'approval') {
        audio.src = '/sounds/approval-notification.mp3';
      } else {
        audio.src = '/sounds/default-notification.mp3';
      }

      // Set volume based on priority
      switch (notification.priority) {
        case 'critical':
        case 'urgent':
          audio.volume = 0.8;
          break;
        case 'high':
          audio.volume = 0.6;
          break;
        case 'medium':
          audio.volume = 0.4;
          break;
        default:
          audio.volume = 0.3;
      }

      // Play sound
      audio.play().catch(error => {
        console.warn('Could not play notification sound:', error);
      });
    } catch (error) {
      console.warn('Error playing notification sound:', error);
    }
  }

  // Get sound preference from localStorage
  getSoundPreference() {
    try {
      const preference = localStorage.getItem('notificationSoundEnabled');
      return preference !== 'false'; // Default to true
    } catch (error) {
      return true; // Default to true if localStorage is not available
    }
  }

  // Set sound preference
  setSoundPreference(enabled) {
    try {
      localStorage.setItem('notificationSoundEnabled', enabled.toString());
    } catch (error) {
      console.warn('Could not save sound preference:', error);
    }
  }

  // WebSocket methods
  markNotificationAsRead(notificationId) {
    if (this.socket?.connected) {
      this.socket.emit('mark-notification-read', { notificationId });
    }
  }

  dismissNotification(notificationId) {
    if (this.socket?.connected) {
      this.socket.emit('dismiss-notification', { notificationId });
    }
  }

  getUnreadCount() {
    if (this.socket?.connected) {
      this.socket.emit('get-unread-count');
    }
  }

  joinRoom(room) {
    if (this.socket?.connected) {
      this.socket.emit('join-notification-room', room);
    }
  }

  leaveRoom(room) {
    if (this.socket?.connected) {
      this.socket.emit('leave-notification-room', room);
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
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  // Disconnect
  disconnect() {
    if (this.socket) {
      console.log('Disconnecting from notification WebSocket');
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

  // Show browser notification
  showBrowserNotification(notification) {
    // Check if browser notifications are supported and permitted
    if (!('Notification' in window)) {
      console.warn('Browser notifications not supported');
      return;
    }

    if (Notification.permission === 'denied') {
      console.warn('Browser notifications are denied');
      return;
    }

    if (Notification.permission === 'default') {
      // Request permission
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          this.createBrowserNotification(notification);
        }
      });
    } else if (Notification.permission === 'granted') {
      this.createBrowserNotification(notification);
    }
  }

  createBrowserNotification(notification) {
    try {
      const browserNotification = new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: notification._id || Date.now().toString(),
        requireInteraction: notification.priority === 'urgent' || notification.priority === 'critical',
        silent: !notification.sound
      });

      // Handle notification click
      browserNotification.onclick = () => {
        window.focus();
        browserNotification.close();

        // If notification has an action URL, navigate to it
        if (notification.action?.url) {
          window.location.href = notification.action.url;
        }
      };

      // Auto-close after 5 seconds unless it requires interaction
      if (!browserNotification.requireInteraction) {
        setTimeout(() => {
          browserNotification.close();
        }, 5000);
      }
    } catch (error) {
      console.error('Error creating browser notification:', error);
    }
  }

  // Visual notification flash
  flashNotificationIndicator() {
    try {
      // Flash the browser tab title
      const originalTitle = document.title;
      let flashCount = 0;
      const maxFlashes = 6;

      const flashInterval = setInterval(() => {
        document.title = flashCount % 2 === 0 ? '🔔 New Notification!' : originalTitle;
        flashCount++;

        if (flashCount >= maxFlashes) {
          clearInterval(flashInterval);
          document.title = originalTitle;
        }
      }, 500);

      // Flash favicon
      this.flashFavicon();
    } catch (error) {
      console.error('Error flashing notification indicator:', error);
    }
  }

  flashFavicon() {
    try {
      const link = document.querySelector('link[rel~="icon"]') || document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'shortcut icon';

      const originalHref = link.href || '/favicon.ico';

      // Create notification favicon (you would need to create this)
      const notificationFavicon = '/notification-favicon.ico';

      let flashCount = 0;
      const maxFlashes = 3;

      const faviconInterval = setInterval(() => {
        link.href = flashCount % 2 === 0 ? notificationFavicon : originalHref;
        document.head.appendChild(link);
        flashCount++;

        if (flashCount >= maxFlashes) {
          clearInterval(faviconInterval);
          link.href = originalHref;
        }
      }, 500);
    } catch (error) {
      console.error('Error flashing favicon:', error);
    }
  }
}

// Create singleton instance
const notificationWebSocket = new NotificationWebSocketService();

export default notificationWebSocket;
