// API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Get auth token from localStorage
  getAuthToken() {
    return localStorage.getItem('authToken');
  }

  // Set default headers
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    const token = this.getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    return headers;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Dashboard API methods
  async getDashboardData(organizerId) {
    return this.request(`/organizer/dashboard/${organizerId}`);
  }

  async getActivities(organizerId, page = 1, limit = 20) {
    return this.request(`/organizer/activities/${organizerId}?page=${page}&limit=${limit}`);
  }

  async getNotifications(organizerId, unreadOnly = false, limit = 10) {
    return this.request(`/organizer/notifications/${organizerId}?unreadOnly=${unreadOnly}&limit=${limit}`);
  }

  async markNotificationAsRead(notificationId) {
    return this.request(`/organizer/notifications/${notificationId}/read`, {
      method: 'PATCH',
    });
  }

  // Tour Package API methods
  async getTourPackages(organizerId, params = {}) {
    const queryString = new URLSearchParams({
      page: params.page || 1,
      limit: params.limit || 10,
      status: params.status || '',
      search: params.search || '',
      ...params
    }).toString();
    
    return this.request(`/tour-packages/organizer/${organizerId}?${queryString}`);
  }

  async getTourPackage(id) {
    return this.request(`/tour-packages/${id}`);
  }

  async createTourPackage(tourData) {
    return this.request('/tour-packages', {
      method: 'POST',
      body: JSON.stringify(tourData),
    });
  }

  async updateTourPackage(id, tourData) {
    return this.request(`/tour-packages/${id}`, {
      method: 'PUT',
      body: JSON.stringify(tourData),
    });
  }

  async deleteTourPackage(id) {
    return this.request(`/tour-packages/${id}`, {
      method: 'DELETE',
    });
  }

  async getTourPackageStats(organizerId) {
    return this.request(`/tour-packages/stats/${organizerId}`);
  }

  // Booking API methods
  async getBookings(organizerId, params = {}) {
    const queryString = new URLSearchParams({
      page: params.page || 1,
      limit: params.limit || 10,
      status: params.status || '',
      sortBy: params.sortBy || 'createdAt',
      sortOrder: params.sortOrder || 'desc',
      ...params
    }).toString();
    
    return this.request(`/bookings/organizer/${organizerId}?${queryString}`);
  }

  async getBooking(id) {
    return this.request(`/bookings/${id}`);
  }

  async updateBookingStatus(id, status, reason = '') {
    return this.request(`/bookings/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, reason }),
    });
  }

  async processPayment(id, paymentData) {
    return this.request(`/bookings/${id}/payment`, {
      method: 'PATCH',
      body: JSON.stringify(paymentData),
    });
  }

  async getPendingBookings(organizerId) {
    return this.request(`/bookings/pending/${organizerId}`);
  }

  async getUpcomingTours(organizerId, days = 30) {
    return this.request(`/bookings/upcoming/${organizerId}?days=${days}`);
  }

  async getBookingStats(organizerId, dateRange = {}) {
    const queryString = new URLSearchParams(dateRange).toString();
    return this.request(`/bookings/stats/${organizerId}?${queryString}`);
  }

  // Message API methods
  async getMessages(organizerId, params = {}) {
    const queryString = new URLSearchParams({
      page: params.page || 1,
      limit: params.limit || 10,
      status: params.status || '',
      sortBy: params.sortBy || 'createdAt',
      sortOrder: params.sortOrder || 'desc',
      ...params
    }).toString();
    
    return this.request(`/messages/organizer/${organizerId}?${queryString}`);
  }

  async getMessage(id) {
    return this.request(`/messages/${id}`);
  }

  async replyToMessage(id, responseMessage) {
    return this.request(`/messages/${id}/reply`, {
      method: 'PATCH',
      body: JSON.stringify({ responseMessage }),
    });
  }

  async markMessageAsRead(id) {
    return this.request(`/messages/${id}/read`, {
      method: 'PATCH',
    });
  }

  async archiveMessage(id) {
    return this.request(`/messages/${id}/archive`, {
      method: 'PATCH',
    });
  }

  async getUnreadMessages(organizerId) {
    return this.request(`/messages/unread/${organizerId}`);
  }

  async searchMessages(query, organizerId) {
    return this.request(`/messages/search/${encodeURIComponent(query)}?organizerId=${organizerId}`);
  }

  // Authentication methods
  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  // Utility methods
  setAuthToken(token) {
    localStorage.setItem('authToken', token);
  }

  removeAuthToken() {
    localStorage.removeItem('authToken');
  }

  isAuthenticated() {
    return !!this.getAuthToken();
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;

// Export individual methods for convenience
export const {
  getDashboardData,
  getActivities,
  getNotifications,
  markNotificationAsRead,
  getTourPackages,
  getTourPackage,
  createTourPackage,
  updateTourPackage,
  deleteTourPackage,
  getTourPackageStats,
  getBookings,
  getBooking,
  updateBookingStatus,
  processPayment,
  getPendingBookings,
  getUpcomingTours,
  getBookingStats,
  getMessages,
  getMessage,
  replyToMessage,
  markMessageAsRead,
  archiveMessage,
  getUnreadMessages,
  searchMessages,
  login,
  register,
  getCurrentUser,
  logout,
  setAuthToken,
  removeAuthToken,
  isAuthenticated,
} = apiService;
