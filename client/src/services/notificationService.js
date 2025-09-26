import api from '../utils/api.js';

class NotificationService {
  constructor() {
    this.localStorageKey = 'ethio_heritage_notifications';
    this.subscribers = [];
    this.notificationPermission = null;
  }

  /**
   * Initialize notification service
   */
  async initialize() {
    try {
      // Request browser notification permission
      if ('Notification' in window) {
        this.notificationPermission = await Notification.requestPermission();
      }

      // Load local notifications
      this.loadLocalNotifications();
    } catch (error) {
      console.error('Initialize notification service error:', error);
    }
  }

  /**
   * Get user notifications
   * @param {Object} filters - Filter options
   * @returns {Promise<Array>} User notifications
   */
  async getNotifications(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await api.request(`/user/notifications${queryParams ? `?${queryParams}` : ''}`);
      const serverNotifications = response.notifications || response.data || response;

      // Merge with local notifications
      const localNotifications = this.getLocalNotifications();
      return this.mergeNotifications(serverNotifications, localNotifications);
    } catch (error) {
      console.error('Get notifications error:', error);
      return this.getLocalNotifications();
    }
  }

  /**
   * Mark notification as read
   * @param {string|number} notificationId - Notification ID
   * @returns {Promise<Object>} Mark read result
   */
  async markAsRead(notificationId) {
    try {
      const response = await api.request(`/user/notifications/${notificationId}/read`, {
        method: 'PUT'
      });

      // Update local notification
      this.updateLocalNotification(notificationId, { isRead: true });

      return response;
    } catch (error) {
      console.error('Mark as read error:', error);
      this.updateLocalNotification(notificationId, { isRead: true });
      return { success: true, message: 'Marked as read locally' };
    }
  }

  /**
   * Mark all notifications as read
   * @returns {Promise<Object>} Mark all read result
   */
  async markAllAsRead() {
    try {
      const response = await api.request('/user/notifications/read-all', {
        method: 'PUT'
      });

      // Update all local notifications
      this.markAllLocalNotificationsAsRead();

      return response;
    } catch (error) {
      console.error('Mark all as read error:', error);
      this.markAllLocalNotificationsAsRead();
      return { success: true, message: 'Marked all as read locally' };
    }
  }

  /**
   * Delete notification
   * @param {string|number} notificationId - Notification ID
   * @returns {Promise<Object>} Delete result
   */
  async deleteNotification(notificationId) {
    try {
      const response = await api.request(`/user/notifications/${notificationId}`, {
        method: 'DELETE'
      });

      // Remove from local notifications
      this.removeLocalNotification(notificationId);

      return response;
    } catch (error) {
      console.error('Delete notification error:', error);
      this.removeLocalNotification(notificationId);
      return { success: true, message: 'Deleted locally' };
    }
  }

  /**
   * Create a new notification
   * @param {Object} notificationData - Notification data
   * @returns {Promise<Object>} Created notification
   */
  async createNotification(notificationData) {
    try {
      const response = await api.request('/notifications', {
        method: 'POST',
        body: notificationData
      });

      return response.notification || response.data || response;
    } catch (error) {
      console.error('Create notification error:', error);
      throw error;
    }
  }

  /**
   * Get notification preferences
   * @returns {Promise<Object>} Notification preferences
   */
  async getPreferences() {
    try {
      const response = await api.request('/user/notification-preferences');
      return response.preferences || response.data || response;
    } catch (error) {
      console.error('Get notification preferences error:', error);
      // Return default preferences
      return {
        email: {
          newArtifacts: true,
          tourReminders: true,
          achievements: true,
          newsletter: false,
          systemUpdates: true
        },
        push: {
          newArtifacts: true,
          tourReminders: true,
          achievements: true,
          socialActivity: false,
          systemUpdates: false
        },
        inApp: {
          newArtifacts: true,
          tourReminders: true,
          achievements: true,
          socialActivity: true,
          systemUpdates: true
        }
      };
    }
  }

  /**
   * Update notification preferences
   * @param {Object} preferences - Updated preferences
   * @returns {Promise<Object>} Update result
   */
  async updatePreferences(preferences) {
    try {
      const response = await api.request('/user/notification-preferences', {
        method: 'PUT',
        body: { preferences }
      });

      return response;
    } catch (error) {
      console.error('Update notification preferences error:', error);
      throw error;
    }
  }

  /**
   * Send push notification (if permission granted)
   * @param {Object} notificationData - Notification data
   */
  async sendPushNotification(notificationData) {
    if (this.notificationPermission !== 'granted') {
      console.warn('Push notifications not permitted');
      return;
    }

    try {
      const notification = new Notification(notificationData.title, {
        body: notificationData.body,
        icon: notificationData.icon || '/favicon.ico',
        image: notificationData.image,
        badge: notificationData.badge || '/favicon.ico',
        data: notificationData.data,
        requireInteraction: notificationData.requireInteraction || false
      });

      // Handle notification click
      notification.onclick = (event) => {
        event.preventDefault();
        window.focus();

        if (notificationData.url) {
          window.location.href = notificationData.url;
        }

        notification.close();
      };

      // Auto-close after 5 seconds if not requiring interaction
      if (!notificationData.requireInteraction) {
        setTimeout(() => notification.close(), 5000);
      }

    } catch (error) {
      console.error('Send push notification error:', error);
    }
  }

  /**
   * Show in-app notification
   * @param {Object} notificationData - Notification data
   */
  showInAppNotification(notificationData) {
    const notification = {
      id: Date.now().toString(),
      type: notificationData.type || 'info',
      title: notificationData.title,
      message: notificationData.message,
      action: notificationData.action,
      timestamp: new Date().toISOString(),
      isRead: false,
      ...notificationData
    };

    // Add to local storage
    this.addLocalNotification(notification);

    // Notify subscribers
    this.notifySubscribers('new_notification', notification);

    return notification;
  }

  /**
   * Subscribe to notification updates
   * @param {Function} callback - Callback function
   * @returns {Function} Unsubscribe function
   */
  subscribe(callback) {
    this.subscribers.push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  /**
   * Notify all subscribers
   * @param {string} event - Event type
   * @param {Object} data - Event data
   */
  notifySubscribers(event, data) {
    this.subscribers.forEach(callback => {
      try {
        callback(event, data);
      } catch (error) {
        console.error('Subscriber callback error:', error);
      }
    });
  }

  /**
   * Get unread notification count
   * @returns {Promise<number>} Unread count
   */
  async getUnreadCount() {
    try {
      const notifications = await this.getNotifications({ isRead: false });
      return notifications.length;
    } catch (error) {
      console.error('Get unread count error:', error);
      return 0;
    }
  }

  /**
   * Clear all notifications
   * @returns {Promise<Object>} Clear result
   */
  async clearAll() {
    try {
      const response = await api.request('/user/notifications', {
        method: 'DELETE'
      });

      // Clear local notifications
      this.clearLocalNotifications();

      return response;
    } catch (error) {
      console.error('Clear all notifications error:', error);
      this.clearLocalNotifications();
      return { success: true, message: 'Cleared all locally' };
    }
  }

  // Local notification management

  /**
   * Get local notifications
   * @returns {Array} Local notifications
   */
  getLocalNotifications() {
    try {
      const stored = localStorage.getItem(this.localStorageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Get local notifications error:', error);
      return [];
    }
  }

  /**
   * Add local notification
   * @param {Object} notification - Notification to add
   */
  addLocalNotification(notification) {
    try {
      const notifications = this.getLocalNotifications();
      notifications.unshift(notification); // Add to beginning

      // Keep only last 100 notifications
      if (notifications.length > 100) {
        notifications.splice(100);
      }

      localStorage.setItem(this.localStorageKey, JSON.stringify(notifications));
    } catch (error) {
      console.error('Add local notification error:', error);
    }
  }

  /**
   * Update local notification
   * @param {string|number} notificationId - Notification ID
   * @param {Object} updates - Updates to apply
   */
  updateLocalNotification(notificationId, updates) {
    try {
      const notifications = this.getLocalNotifications();
      const index = notifications.findIndex(n => n.id === notificationId);

      if (index !== -1) {
        notifications[index] = { ...notifications[index], ...updates };
        localStorage.setItem(this.localStorageKey, JSON.stringify(notifications));
      }
    } catch (error) {
      console.error('Update local notification error:', error);
    }
  }

  /**
   * Remove local notification
   * @param {string|number} notificationId - Notification ID
   */
  removeLocalNotification(notificationId) {
    try {
      const notifications = this.getLocalNotifications();
      const filtered = notifications.filter(n => n.id !== notificationId);
      localStorage.setItem(this.localStorageKey, JSON.stringify(filtered));
    } catch (error) {
      console.error('Remove local notification error:', error);
    }
  }

  /**
   * Mark all local notifications as read
   */
  markAllLocalNotificationsAsRead() {
    try {
      const notifications = this.getLocalNotifications();
      const updated = notifications.map(n => ({ ...n, isRead: true }));
      localStorage.setItem(this.localStorageKey, JSON.stringify(updated));
    } catch (error) {
      console.error('Mark all local notifications as read error:', error);
    }
  }

  /**
   * Clear all local notifications
   */
  clearLocalNotifications() {
    try {
      localStorage.removeItem(this.localStorageKey);
    } catch (error) {
      console.error('Clear local notifications error:', error);
    }
  }

  /**
   * Load local notifications on init
   */
  loadLocalNotifications() {
    try {
      const notifications = this.getLocalNotifications();
      // Add some default notifications if none exist
      if (notifications.length === 0) {
        this.addDefaultNotifications();
      }
    } catch (error) {
      console.error('Load local notifications error:', error);
    }
  }

  /**
   * Add default notifications for new users
   */
  addDefaultNotifications() {
    const defaultNotifications = [
      {
        id: 'welcome',
        type: 'welcome',
        title: 'Welcome to Ethiopian Heritage 360!',
        message: 'Start exploring Ethiopia\'s rich cultural heritage and historical treasures.',
        timestamp: new Date().toISOString(),
        isRead: false,
        action: { type: 'navigate', url: '/virtual-museum' }
      },
      {
        id: 'first_tour',
        type: 'suggestion',
        title: 'Take Your First Virtual Tour',
        message: 'Discover the magnificent rock-hewn churches of Lalibela.',
        timestamp: new Date(Date.now() - 60000).toISOString(),
        isRead: false,
        action: { type: 'navigate', url: '/tours' }
      },
      {
        id: 'learning_path',
        type: 'education',
        title: 'Start Your Learning Journey',
        message: 'Begin with "Ethiopian History Fundamentals" course.',
        timestamp: new Date(Date.now() - 120000).toISOString(),
        isRead: false,
        action: { type: 'navigate', url: '/learning' }
      }
    ];

    defaultNotifications.forEach(notification => {
      this.addLocalNotification(notification);
    });
  }

  /**
   * Merge server and local notifications
   * @param {Array} serverNotifications - Server notifications
   * @param {Array} localNotifications - Local notifications
   * @returns {Array} Merged notifications
   */
  mergeNotifications(serverNotifications, localNotifications) {
    const merged = [...(serverNotifications || [])];

    // Add local notifications that don't exist on server
    localNotifications.forEach(localNotif => {
      const existsOnServer = merged.some(serverNotif => serverNotif.id === localNotif.id);
      if (!existsOnServer) {
        merged.push(localNotif);
      }
    });

    // Sort by timestamp (newest first)
    return merged.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  // Notification types and templates

  /**
   * Create achievement notification
   * @param {Object} achievement - Achievement data
   * @returns {Object} Notification
   */
  createAchievementNotification(achievement) {
    return {
      type: 'achievement',
      title: 'Achievement Unlocked!',
      message: `You earned "${achievement.name}" - ${achievement.description}`,
      icon: '🏆',
      action: { type: 'navigate', url: '/profile/achievements' },
      data: { achievementId: achievement.id }
    };
  }

  /**
   * Create new artifact notification
   * @param {Object} artifact - Artifact data
   * @returns {Object} Notification
   */
  createNewArtifactNotification(artifact) {
    return {
      type: 'new_content',
      title: 'New Artifact Added!',
      message: `Discover "${artifact.name}" in the virtual museum.`,
      icon: '🏺',
      action: { type: 'navigate', url: `/artifacts/${artifact.id}` },
      data: { artifactId: artifact.id }
    };
  }

  /**
   * Create tour reminder notification
   * @param {Object} tour - Tour data
   * @returns {Object} Notification
   */
  createTourReminderNotification(tour) {
    return {
      type: 'reminder',
      title: 'Tour Reminder',
      message: `Your "${tour.title}" tour starts in 1 hour.`,
      icon: '🗓️',
      requireInteraction: true,
      action: { type: 'navigate', url: `/tours/${tour.id}` },
      data: { tourId: tour.id }
    };
  }

  /**
   * Create system update notification
   * @param {Object} update - Update data
   * @returns {Object} Notification
   */
  createSystemUpdateNotification(update) {
    return {
      type: 'system',
      title: 'System Update',
      message: update.message,
      icon: '⚙️',
      action: update.action,
      data: update.data
    };
  }
}

export default new NotificationService();
