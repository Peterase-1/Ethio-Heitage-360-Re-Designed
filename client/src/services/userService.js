import { api } from '../utils/api.js';

class UserService {
  constructor() {
    this.currentUser = null;
  }

  /**
   * Get user profile by ID
   * @param {string|number} userId - User ID
   * @returns {Promise<Object>} User profile
   */
  async getUserById(userId) {
    try {
      const response = await api.request(`/users/${userId}`);
      return response.user || response.data || response;
    } catch (error) {
      console.error('Get user by ID error:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   * @param {string|number} userId - User ID
   * @param {Object} userData - User data to update
   * @returns {Promise<Object>} Updated user
   */
  async updateUser(userId, userData) {
    try {
      const response = await api.updateUser(userId, userData);
      
      // Update current user if it's the same user
      if (this.currentUser && this.currentUser.id === userId) {
        this.currentUser = { ...this.currentUser, ...response.user };
        localStorage.setItem('user', JSON.stringify(this.currentUser));
      }
      
      return response;
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  }

  /**
   * Update user preferences
   * @param {Object} preferences - User preferences
   * @returns {Promise<Object>} Update result
   */
  async updatePreferences(preferences) {
    try {
      const response = await api.request('/user/preferences', {
        method: 'PUT',
        body: { preferences }
      });
      return response;
    } catch (error) {
      console.error('Update preferences error:', error);
      throw error;
    }
  }

  /**
   * Get user preferences
   * @returns {Promise<Object>} User preferences
   */
  async getPreferences() {
    try {
      const response = await api.request('/user/preferences');
      return response.preferences || response.data || response;
    } catch (error) {
      console.error('Get preferences error:', error);
      // Return default preferences
      return {
        language: 'en',
        theme: 'light',
        notifications: {
          email: true,
          push: true,
          newsletter: false
        },
        privacy: {
          showProfile: true,
          showActivity: false
        },
        accessibility: {
          highContrast: false,
          largeText: false,
          reducedMotion: false
        }
      };
    }
  }

  /**
   * Update user avatar
   * @param {File} avatarFile - Avatar image file
   * @returns {Promise<Object>} Upload result
   */
  async updateAvatar(avatarFile) {
    try {
      const uploadResponse = await api.uploadFile(avatarFile, 'avatar');
      
      if (uploadResponse.url) {
        const updateResponse = await api.request('/user/avatar', {
          method: 'PUT',
          body: { avatarUrl: uploadResponse.url }
        });
        
        // Update current user avatar
        if (this.currentUser) {
          this.currentUser.avatar = uploadResponse.url;
          localStorage.setItem('user', JSON.stringify(this.currentUser));
        }
        
        return updateResponse;
      }
      
      throw new Error('Failed to upload avatar');
    } catch (error) {
      console.error('Update avatar error:', error);
      throw error;
    }
  }

  /**
   * Get user activity history
   * @param {Object} filters - Filter options
   * @returns {Promise<Array>} Activity history
   */
  async getActivityHistory(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await api.request(`/user/activity${queryParams ? `?${queryParams}` : ''}`);
      return response.activities || response.data || response;
    } catch (error) {
      console.error('Get activity history error:', error);
      throw error;
    }
  }

  /**
   * Get user statistics
   * @returns {Promise<Object>} User statistics
   */
  async getUserStats() {
    try {
      const response = await api.request('/user/stats');
      return response.stats || response.data || response;
    } catch (error) {
      console.error('Get user stats error:', error);
      // Return mock stats
      return {
        artifactsViewed: 45,
        museumsVisited: 8,
        toursBooked: 3,
        favoritesCount: 12,
        achievementsEarned: 6,
        timeSpent: '24h 15m',
        joinDate: '2024-01-15',
        lastVisit: new Date().toISOString()
      };
    }
  }

  /**
   * Get user achievements
   * @returns {Promise<Array>} User achievements
   */
  async getAchievements() {
    try {
      const response = await api.request('/user/achievements');
      return response.achievements || response.data || response;
    } catch (error) {
      console.error('Get achievements error:', error);
      // Return mock achievements
      return [
        {
          id: 1,
          name: 'First Visit',
          description: 'Completed your first museum visit',
          icon: 'star',
          earnedAt: '2024-01-15T10:00:00Z',
          category: 'exploration'
        },
        {
          id: 2,
          name: 'History Buff',
          description: 'Read 5 historical articles',
          icon: 'book',
          earnedAt: '2024-01-20T14:30:00Z',
          category: 'learning'
        },
        {
          id: 3,
          name: 'Artifact Hunter',
          description: 'Viewed 10 different artifacts',
          icon: 'eye',
          earnedAt: '2024-01-25T16:45:00Z',
          category: 'exploration'
        }
      ];
    }
  }

  /**
   * Get user badges
   * @returns {Promise<Array>} User badges
   */
  async getBadges() {
    try {
      const response = await api.request('/user/badges');
      return response.badges || response.data || response;
    } catch (error) {
      console.error('Get badges error:', error);
      return [];
    }
  }

  /**
   * Get user's learning progress
   * @returns {Promise<Object>} Learning progress
   */
  async getLearningProgress() {
    try {
      const response = await api.request('/user/learning-progress');
      return response.progress || response.data || response;
    } catch (error) {
      console.error('Get learning progress error:', error);
      // Return mock progress
      return {
        totalLessons: 15,
        completedLessons: 8,
        currentStreak: 5,
        totalTimeSpent: '12h 30m',
        subjects: {
          'Ethiopian History': { completed: 6, total: 8, progress: 75 },
          'Cultural Traditions': { completed: 2, total: 4, progress: 50 },
          'Archaeological Sites': { completed: 0, total: 3, progress: 0 }
        }
      };
    }
  }

  /**
   * Get user's saved searches
   * @returns {Promise<Array>} Saved searches
   */
  async getSavedSearches() {
    try {
      const response = await api.request('/user/saved-searches');
      return response.searches || response.data || response;
    } catch (error) {
      console.error('Get saved searches error:', error);
      return [];
    }
  }

  /**
   * Save a search query
   * @param {Object} searchData - Search data to save
   * @returns {Promise<Object>} Save result
   */
  async saveSearch(searchData) {
    try {
      const response = await api.request('/user/saved-searches', {
        method: 'POST',
        body: searchData
      });
      return response;
    } catch (error) {
      console.error('Save search error:', error);
      throw error;
    }
  }

  /**
   * Delete saved search
   * @param {string|number} searchId - Search ID
   * @returns {Promise<Object>} Delete result
   */
  async deleteSavedSearch(searchId) {
    try {
      const response = await api.request(`/user/saved-searches/${searchId}`, {
        method: 'DELETE'
      });
      return response;
    } catch (error) {
      console.error('Delete saved search error:', error);
      throw error;
    }
  }

  /**
   * Get user's recent activity
   * @param {number} limit - Number of activities to return
   * @returns {Promise<Array>} Recent activities
   */
  async getRecentActivity(limit = 10) {
    try {
      const response = await api.request(`/user/recent-activity?limit=${limit}`);
      return response.activities || response.data || response;
    } catch (error) {
      console.error('Get recent activity error:', error);
      // Return mock recent activity
      return [
        {
          id: 1,
          type: 'artifact_view',
          title: 'Viewed Ancient Ethiopian Cross',
          timestamp: '2024-01-27T10:30:00Z',
          data: { artifactId: 1, artifactName: 'Ancient Ethiopian Cross' }
        },
        {
          id: 2,
          type: 'museum_visit',
          title: 'Visited National Museum of Ethiopia',
          timestamp: '2024-01-26T14:15:00Z',
          data: { museumId: 1, museumName: 'National Museum of Ethiopia' }
        },
        {
          id: 3,
          type: 'tour_booking',
          title: 'Booked Historic Addis Ababa Tour',
          timestamp: '2024-01-25T09:45:00Z',
          data: { tourId: 1, tourName: 'Historic Addis Ababa Tour' }
        }
      ];
    }
  }

  /**
   * Get user's notifications
   * @param {Object} filters - Filter options
   * @returns {Promise<Array>} User notifications
   */
  async getNotifications(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await api.request(`/user/notifications${queryParams ? `?${queryParams}` : ''}`);
      return response.notifications || response.data || response;
    } catch (error) {
      console.error('Get notifications error:', error);
      return [];
    }
  }

  /**
   * Mark notification as read
   * @param {string|number} notificationId - Notification ID
   * @returns {Promise<Object>} Mark read result
   */
  async markNotificationRead(notificationId) {
    try {
      const response = await api.request(`/user/notifications/${notificationId}/read`, {
        method: 'PUT'
      });
      return response;
    } catch (error) {
      console.error('Mark notification read error:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read
   * @returns {Promise<Object>} Mark all read result
   */
  async markAllNotificationsRead() {
    try {
      const response = await api.request('/user/notifications/read-all', {
        method: 'PUT'
      });
      return response;
    } catch (error) {
      console.error('Mark all notifications read error:', error);
      throw error;
    }
  }

  /**
   * Delete user account
   * @param {string} reason - Deletion reason
   * @returns {Promise<Object>} Deletion result
   */
  async deleteAccount(reason) {
    try {
      const response = await api.request('/user/delete-account', {
        method: 'DELETE',
        body: { reason }
      });
      
      // Clear local storage
      localStorage.clear();
      this.currentUser = null;
      
      return response;
    } catch (error) {
      console.error('Delete account error:', error);
      throw error;
    }
  }

  /**
   * Export user data
   * @param {string} format - Export format (json, csv)
   * @returns {Promise<Object>} Export data
   */
  async exportUserData(format = 'json') {
    try {
      const response = await api.request(`/user/export-data?format=${format}`);
      return response;
    } catch (error) {
      console.error('Export user data error:', error);
      throw error;
    }
  }

  /**
   * Report user content or behavior
   * @param {string|number} targetUserId - User being reported
   * @param {string} reason - Report reason
   * @param {string} description - Detailed description
   * @returns {Promise<Object>} Report result
   */
  async reportUser(targetUserId, reason, description) {
    try {
      const response = await api.request('/user/report', {
        method: 'POST',
        body: { targetUserId, reason, description }
      });
      return response;
    } catch (error) {
      console.error('Report user error:', error);
      throw error;
    }
  }

  /**
   * Get user's privacy settings
   * @returns {Promise<Object>} Privacy settings
   */
  async getPrivacySettings() {
    try {
      const response = await api.request('/user/privacy-settings');
      return response.settings || response.data || response;
    } catch (error) {
      console.error('Get privacy settings error:', error);
      return {
        profileVisibility: 'public',
        activityVisibility: 'friends',
        searchVisibility: true,
        dataSharing: false,
        marketingEmails: false,
        analyticsTracking: true
      };
    }
  }

  /**
   * Update privacy settings
   * @param {Object} settings - Privacy settings
   * @returns {Promise<Object>} Update result
   */
  async updatePrivacySettings(settings) {
    try {
      const response = await api.request('/user/privacy-settings', {
        method: 'PUT',
        body: { settings }
      });
      return response;
    } catch (error) {
      console.error('Update privacy settings error:', error);
      throw error;
    }
  }

  /**
   * Get current user from storage
   * @returns {Object|null} Current user
   */
  getCurrentUser() {
    if (this.currentUser) {
      return this.currentUser;
    }
    
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        this.currentUser = JSON.parse(storedUser);
        return this.currentUser;
      }
    } catch (error) {
      console.error('Error getting current user from storage:', error);
    }
    
    return null;
  }

  /**
   * Set current user
   * @param {Object} user - User object
   */
  setCurrentUser(user) {
    this.currentUser = user;
    try {
      localStorage.setItem('user', JSON.stringify(user));
    } catch (error) {
      console.error('Error saving user to storage:', error);
    }
  }

  /**
   * Clear current user
   */
  clearCurrentUser() {
    this.currentUser = null;
    try {
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Error clearing user from storage:', error);
    }
  }
}

export default new UserService();
