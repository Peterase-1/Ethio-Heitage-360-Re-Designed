import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Create axios instance with authentication
const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/visitor-dashboard`,
  timeout: 10000,
});

// Add auth interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

class VisitorDashboardService {
  /**
   * Get comprehensive dashboard data
   * @returns {Promise<Object>} Dashboard data including profile, activity, favorites, bookings, recommendations
   */
  async getDashboardData() {
    try {
      const response = await apiClient.get('/dashboard');
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to load dashboard data',
        data: null
      };
    }
  }

  /**
   * Get visitor profile
   * @returns {Promise<Object>} User profile data
   */
  async getProfile() {
    try {
      const response = await apiClient.get('/profile');
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Error fetching profile:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to load profile',
        data: null
      };
    }
  }

  /**
   * Update visitor profile
   * @param {Object} profileData - Profile data to update
   * @returns {Promise<Object>} Updated profile data
   */
  async updateProfile(profileData) {
    try {
      const response = await apiClient.put('/profile', profileData);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Error updating profile:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update profile',
        data: null
      };
    }
  }

  /**
   * Get user favorites with pagination and filtering
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Favorites data with pagination
   */
  async getFavorites(options = {}) {
    try {
      const params = new URLSearchParams();

      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value);
        }
      });

      const response = await apiClient.get(`/favorites?${params.toString()}`);
      return {
        success: true,
        data: response.data.data,
        pagination: response.data.pagination
      };
    } catch (error) {
      console.error('Error fetching favorites:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to load favorites',
        data: [],
        pagination: null
      };
    }
  }

  /**
   * Add item to favorites
   * @param {Object} favoriteData - Favorite item data
   * @returns {Promise<Object>} Result of the operation
   */
  async addFavorite(favoriteData) {
    try {
      const response = await apiClient.post('/favorites', favoriteData);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Error adding favorite:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to add to favorites',
        data: null
      };
    }
  }

  /**
   * Remove item from favorites
   * @param {string} entityId - ID of the entity
   * @param {string} entityType - Type of the entity
   * @returns {Promise<Object>} Result of the operation
   */
  async removeFavorite(entityId, entityType) {
    try {
      const response = await apiClient.delete(`/favorites/${entityId}/${entityType}`);
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      console.error('Error removing favorite:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to remove from favorites'
      };
    }
  }

  /**
   * Get user activity history
   * @param {Object} options - Query options (type, days, page, limit)
   * @returns {Promise<Object>} Activity data with pagination
   */
  async getActivity(options = {}) {
    try {
      const params = new URLSearchParams();

      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value);
        }
      });

      const response = await apiClient.get(`/activity?${params.toString()}`);
      return {
        success: true,
        data: response.data.data,
        pagination: response.data.pagination
      };
    } catch (error) {
      console.error('Error fetching activity:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to load activity',
        data: [],
        pagination: null
      };
    }
  }

  /**
   * Get user stats and analytics
   * @param {string} period - Time period ('week', 'month', 'year')
   * @returns {Promise<Object>} Stats data
   */
  async getStats(period = 'month') {
    try {
      const response = await apiClient.get(`/stats?period=${period}`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Error fetching stats:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to load stats',
        data: null
      };
    }
  }

  /**
   * Get personalized recommendations
   * @param {string} type - Type of recommendations (optional)
   * @param {number} limit - Number of recommendations (optional)
   * @returns {Promise<Object>} Recommendations data
   */
  async getRecommendations(type = null, limit = 10) {
    try {
      const params = new URLSearchParams();
      if (type) params.append('type', type);
      if (limit) params.append('limit', limit.toString());

      const response = await apiClient.get(`/recommendations?${params.toString()}`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to load recommendations',
        data: {}
      };
    }
  }

  /**
   * Log user activity (for tracking engagement)
   * @param {Object} activityData - Activity data to log
   * @returns {Promise<Object>} Result of the operation
   */
  async logActivity(activityData) {
    try {
      // This would typically be handled automatically by the backend
      // but can be used for explicit activity logging
      const response = await axios.post(`${API_BASE_URL}/visitor/activity`, activityData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Error logging activity:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to log activity'
      };
    }
  }

  /**
   * Get popular favorites (public ones)
   * @param {string} entityType - Type of entity
   * @param {number} limit - Number of items
   * @returns {Promise<Object>} Popular favorites
   */
  async getPopularFavorites(entityType = 'artifact', limit = 10) {
    try {
      const response = await axios.get(`${API_BASE_URL}/favorites/popular`, {
        params: { entityType, limit },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Error fetching popular favorites:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to load popular favorites',
        data: []
      };
    }
  }

  /**
   * Check if item is favorited
   * @param {string} entityId - ID of the entity
   * @param {string} entityType - Type of the entity
   * @returns {Promise<boolean>} Whether the item is favorited
   */
  async isFavorited(entityId, entityType) {
    try {
      const favorites = await this.getFavorites({ entityType, limit: 1000 }); // Get all favorites of this type
      if (favorites.success) {
        return favorites.data.some(fav => fav.entityId === entityId);
      }
      return false;
    } catch (error) {
      console.error('Error checking favorite status:', error);
      return false;
    }
  }

  /**
   * Get dashboard quick stats
   * @returns {Promise<Object>} Quick stats for dashboard cards
   */
  async getQuickStats() {
    try {
      const [dashboardData, stats] = await Promise.all([
        this.getDashboardData(),
        this.getStats('month')
      ]);

      if (!dashboardData.success) {
        throw new Error(dashboardData.error);
      }

      return {
        success: true,
        data: {
          totalPoints: dashboardData.data.profile.totalPoints,
          level: dashboardData.data.profile.level,
          streakDays: dashboardData.data.profile.streakDays,
          favoritesCount: dashboardData.data.favorites.total,
          bookingsCount: dashboardData.data.bookings.stats.total,
          activitiesThisMonth: stats.success ? stats.data.activity.totalActivities : 0
        }
      };
    } catch (error) {
      console.error('Error fetching quick stats:', error);
      return {
        success: false,
        error: error.message || 'Failed to load quick stats',
        data: null
      };
    }
  }
}

// Create singleton instance
const visitorDashboardService = new VisitorDashboardService();

export default visitorDashboardService;
