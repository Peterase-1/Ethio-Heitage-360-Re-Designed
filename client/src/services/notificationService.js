import api from '../utils/api';

class NotificationService {
  /**
   * Get notifications for the current user
   */
  async getNotifications(params = {}) {
    console.log('=== GET NOTIFICATIONS API CALL ===');
    console.log('Params:', params);

    try {
      const response = await api.get('/notifications', { params });
      console.log('Notifications API response:', response);
      return response;
    } catch (error) {
      console.error('Could not get notifications:', error.message);
      throw error;
    }
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount() {
    console.log('=== GET UNREAD COUNT API CALL ===');

    try {
      const response = await api.get('/notifications/unread-count');
      console.log('Unread count API response:', response);
      return response;
    } catch (error) {
      console.error('Could not get unread count:', error.message);
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId) {
    console.log('=== MARK NOTIFICATION AS READ API CALL ===');
    console.log('Notification ID:', notificationId);

    try {
      const response = await api.put(`/notifications/${notificationId}/read`);
      console.log('Mark as read API response:', response);
      return response;
    } catch (error) {
      console.error('Could not mark notification as read:', error.message);
      throw error;
    }
  }

  /**
   * Dismiss notification
   */
  async dismiss(notificationId) {
    console.log('=== DISMISS NOTIFICATION API CALL ===');
    console.log('Notification ID:', notificationId);

    try {
      const response = await api.put(`/notifications/${notificationId}/dismiss`);
      console.log('Dismiss notification API response:', response);
      return response;
    } catch (error) {
      console.error('Could not dismiss notification:', error.message);
      throw error;
    }
  }

  /**
   * Mark notification as acted upon
   */
  async markAsActedUpon(notificationId, response = null) {
    console.log('=== MARK NOTIFICATION AS ACTED UPON API CALL ===');
    console.log('Notification ID:', notificationId);
    console.log('Response:', response);

    try {
      const responseData = await api.put(`/notifications/${notificationId}/act`, { response });
      console.log('Mark as acted upon API response:', responseData);
      return responseData;
    } catch (error) {
      console.error('Could not mark notification as acted upon:', error.message);
      throw error;
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead() {
    console.log('=== MARK ALL NOTIFICATIONS AS READ API CALL ===');

    try {
      const response = await api.put('/notifications/mark-all-read');
      console.log('Mark all as read API response:', response);
      return response;
    } catch (error) {
      console.error('Could not mark all notifications as read:', error.message);
      throw error;
    }
  }

  /**
   * Get notification analytics (for admin users)
   */
  async getAnalytics(params = {}) {
    console.log('=== GET NOTIFICATION ANALYTICS API CALL ===');
    console.log('Params:', params);

    try {
      const response = await api.get('/notifications/analytics', { params });
      console.log('Notification analytics API response:', response);
      return response;
    } catch (error) {
      console.error('Could not get notification analytics:', error.message);
      throw error;
    }
  }
}

export default new NotificationService();