import { api } from '../utils/api.js';

class TourService {
  constructor() {
    this.cache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
    this.eventListeners = new Map();
  }

  /**
   * Get all tours with optional filters
   * @param {Object} filters - Search and filter options
   * @returns {Promise<Array>} List of tours
   */
  async getTours(filters = {}) {
    const cacheKey = `tours_${JSON.stringify(filters)}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheExpiry) {
        return cached.data;
      }
    }

    try {
      const response = await api.getTours();
      const tours = response.tours || response.data || response;
      
      // Apply filters if any
      let filteredTours = tours;
      if (filters.type) {
        filteredTours = filteredTours.filter(tour => tour.type === filters.type);
      }
      if (filters.location) {
        filteredTours = filteredTours.filter(tour => 
          tour.location?.toLowerCase().includes(filters.location.toLowerCase())
        );
      }
      if (filters.duration) {
        filteredTours = filteredTours.filter(tour => tour.duration === filters.duration);
      }
      
      // Cache the result
      this.cache.set(cacheKey, {
        data: filteredTours,
        timestamp: Date.now()
      });
      
      return filteredTours;
    } catch (error) {
      console.error('Get tours error:', error);
      throw error;
    }
  }

  /**
   * Get tour by ID
   * @param {string|number} id - Tour ID
   * @returns {Promise<Object>} Tour details
   */
  async getTourById(id) {
    const cacheKey = `tour_${id}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheExpiry) {
        return cached.data;
      }
    }

    try {
      const response = await api.getTourById(id);
      const tour = response.tour || response.data || response;
      
      // Cache the result
      this.cache.set(cacheKey, {
        data: tour,
        timestamp: Date.now()
      });
      
      return tour;
    } catch (error) {
      console.error('Get tour by ID error:', error);
      throw error;
    }
  }

  /**
   * Create new tour
   * @param {Object} tourData - Tour data
   * @returns {Promise<Object>} Created tour
   */
  async createTour(tourData) {
    try {
      const response = await api.createTour(tourData);
      
      // Clear cache to force refresh
      this.clearCache();
      
      // Emit cache invalidation event for real-time updates
      this.emitCacheInvalidation('tour-created', response.tour || response.data || response);
      
      return response.tour || response.data || response;
    } catch (error) {
      console.error('Create tour error:', error);
      throw error;
    }
  }

  /**
   * Update tour
   * @param {string|number} id - Tour ID
   * @param {Object} tourData - Updated tour data
   * @returns {Promise<Object>} Updated tour
   */
  async updateTour(id, tourData) {
    try {
      const response = await api.request(`/tours/${id}`, {
        method: 'PUT',
        body: tourData
      });
      
      // Clear cache to force refresh
      this.clearCache();
      
      return response.tour || response.data || response;
    } catch (error) {
      console.error('Update tour error:', error);
      throw error;
    }
  }

  /**
   * Delete tour
   * @param {string|number} id - Tour ID
   * @returns {Promise<Object>} Deletion result
   */
  async deleteTour(id) {
    try {
      const response = await api.request(`/tours/${id}`, {
        method: 'DELETE'
      });
      
      // Clear cache to force refresh
      this.clearCache();
      
      return response;
    } catch (error) {
      console.error('Delete tour error:', error);
      throw error;
    }
  }

  /**
   * Book a tour
   * @param {string|number} tourId - Tour ID
   * @param {Object} bookingData - Booking details
   * @returns {Promise<Object>} Booking result
   */
  async bookTour(tourId, bookingData) {
    try {
      const response = await api.bookTour(tourId, bookingData);
      return response.booking || response.data || response;
    } catch (error) {
      console.error('Book tour error:', error);
      throw error;
    }
  }

  /**
   * Cancel tour booking
   * @param {string|number} bookingId - Booking ID
   * @param {string} reason - Cancellation reason
   * @returns {Promise<Object>} Cancellation result
   */
  async cancelBooking(bookingId, reason = '') {
    try {
      const response = await api.request(`/tours/bookings/${bookingId}/cancel`, {
        method: 'POST',
        body: { reason }
      });
      return response;
    } catch (error) {
      console.error('Cancel booking error:', error);
      throw error;
    }
  }

  /**
   * Get user's tour bookings
   * @param {Object} filters - Filter options (status, date range, etc.)
   * @returns {Promise<Array>} User bookings
   */
  async getUserBookings(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await api.request(`/user/bookings${queryParams ? `?${queryParams}` : ''}`);
      return response.bookings || response.data || response;
    } catch (error) {
      console.error('Get user bookings error:', error);
      throw error;
    }
  }

  /**
   * Get tour availability
   * @param {string|number} tourId - Tour ID
   * @param {string} date - Date to check (YYYY-MM-DD)
   * @returns {Promise<Object>} Availability data
   */
  async getTourAvailability(tourId, date) {
    try {
      const response = await api.request(`/tours/${tourId}/availability?date=${date}`);
      return response.availability || response.data || response;
    } catch (error) {
      console.error('Get tour availability error:', error);
      throw error;
    }
  }

  /**
   * Search tours
   * @param {string} query - Search query
   * @param {Object} filters - Additional filters
   * @returns {Promise<Array>} Search results
   */
  async searchTours(query, filters = {}) {
    const searchFilters = {
      ...filters,
      search: query
    };
    
    return this.getTours(searchFilters);
  }

  /**
   * Get featured tours
   * @param {number} limit - Number of tours to fetch
   * @returns {Promise<Array>} Featured tours
   */
  async getFeaturedTours(limit = 10) {
    const filters = {
      featured: true,
      limit
    };
    
    return this.getTours(filters);
  }

  /**
   * Get tours by type
   * @param {string} type - Tour type (cultural, historical, archaeological, etc.)
   * @param {Object} filters - Additional filters
   * @returns {Promise<Array>} Tours by type
   */
  async getToursByType(type, filters = {}) {
    const typeFilters = {
      ...filters,
      type
    };
    
    return this.getTours(typeFilters);
  }

  /**
   * Get tours by location
   * @param {string} location - Location or region
   * @param {Object} filters - Additional filters
   * @returns {Promise<Array>} Tours in location
   */
  async getToursByLocation(location, filters = {}) {
    const locationFilters = {
      ...filters,
      location
    };
    
    return this.getTours(locationFilters);
  }

  /**
   * Get tours by duration
   * @param {string} duration - Duration filter (half-day, full-day, multi-day)
   * @param {Object} filters - Additional filters
   * @returns {Promise<Array>} Tours by duration
   */
  async getToursByDuration(duration, filters = {}) {
    const durationFilters = {
      ...filters,
      duration
    };
    
    return this.getTours(durationFilters);
  }

  /**
   * Get tour reviews
   * @param {string|number} tourId - Tour ID
   * @param {Object} pagination - Pagination options
   * @returns {Promise<Object>} Reviews data
   */
  async getTourReviews(tourId, pagination = {}) {
    try {
      const queryParams = new URLSearchParams(pagination).toString();
      const response = await api.request(`/tours/${tourId}/reviews${queryParams ? `?${queryParams}` : ''}`);
      return response;
    } catch (error) {
      console.error('Get tour reviews error:', error);
      throw error;
    }
  }

  /**
   * Add tour review
   * @param {string|number} tourId - Tour ID
   * @param {Object} reviewData - Review data (rating, comment)
   * @returns {Promise<Object>} Review result
   */
  async addTourReview(tourId, reviewData) {
    try {
      const response = await api.request(`/tours/${tourId}/reviews`, {
        method: 'POST',
        body: reviewData
      });
      return response;
    } catch (error) {
      console.error('Add tour review error:', error);
      throw error;
    }
  }

  /**
   * Add tour to wishlist
   * @param {string|number} tourId - Tour ID
   * @returns {Promise<Object>} Wishlist result
   */
  async addToWishlist(tourId) {
    try {
      const response = await api.request('/user/wishlist/tours', {
        method: 'POST',
        body: { tourId }
      });
      return response;
    } catch (error) {
      console.error('Add tour to wishlist error:', error);
      throw error;
    }
  }

  /**
   * Remove tour from wishlist
   * @param {string|number} tourId - Tour ID
   * @returns {Promise<Object>} Remove result
   */
  async removeFromWishlist(tourId) {
    try {
      const response = await api.request(`/user/wishlist/tours/${tourId}`, {
        method: 'DELETE'
      });
      return response;
    } catch (error) {
      console.error('Remove tour from wishlist error:', error);
      throw error;
    }
  }

  /**
   * Get user's tour wishlist
   * @returns {Promise<Array>} Wishlist tours
   */
  async getWishlistTours() {
    try {
      const response = await api.request('/user/wishlist/tours');
      return response.tours || response.data || response;
    } catch (error) {
      console.error('Get wishlist tours error:', error);
      throw error;
    }
  }

  /**
   * Get tour statistics
   * @param {string|number} tourId - Tour ID
   * @returns {Promise<Object>} Tour statistics
   */
  async getTourStats(tourId) {
    try {
      const response = await api.request(`/tours/${tourId}/stats`);
      return response.stats || response.data || response;
    } catch (error) {
      console.error('Get tour stats error:', error);
      throw error;
    }
  }

  /**
   * Get tour types/categories
   * @returns {Promise<Array>} Available tour types
   */
  async getTourTypes() {
    const cacheKey = 'tour_types';
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheExpiry) {
        return cached.data;
      }
    }

    try {
      const response = await api.request('/tours/types');
      const types = response.types || response.data || response;
      
      // Cache the result
      this.cache.set(cacheKey, {
        data: types,
        timestamp: Date.now()
      });
      
      return types;
    } catch (error) {
      console.error('Get tour types error:', error);
      throw error;
    }
  }

  /**
   * Get tour guide information
   * @param {string|number} guideId - Guide ID
   * @returns {Promise<Object>} Guide information
   */
  async getTourGuide(guideId) {
    try {
      const response = await api.request(`/tours/guides/${guideId}`);
      return response.guide || response.data || response;
    } catch (error) {
      console.error('Get tour guide error:', error);
      throw error;
    }
  }

  /**
   * Get upcoming tours
   * @param {number} limit - Number of tours to fetch
   * @returns {Promise<Array>} Upcoming tours
   */
  async getUpcomingTours(limit = 10) {
    try {
      const response = await api.request(`/tours/upcoming?limit=${limit}`);
      return response.tours || response.data || response;
    } catch (error) {
      console.error('Get upcoming tours error:', error);
      throw error;
    }
  }

  /**
   * Get popular tours
   * @param {number} limit - Number of tours to fetch
   * @returns {Promise<Array>} Popular tours
   */
  async getPopularTours(limit = 10) {
    try {
      const response = await api.request(`/tours/popular?limit=${limit}`);
      return response.tours || response.data || response;
    } catch (error) {
      console.error('Get popular tours error:', error);
      throw error;
    }
  }

  /**
   * Report tour issue
   * @param {string|number} tourId - Tour ID
   * @param {string} issue - Issue type
   * @param {string} description - Issue description
   * @returns {Promise<Object>} Report result
   */
  async reportTourIssue(tourId, issue, description) {
    try {
      const response = await api.request(`/tours/${tourId}/report`, {
        method: 'POST',
        body: { issue, description }
      });
      return response;
    } catch (error) {
      console.error('Report tour issue error:', error);
      throw error;
    }
  }

  /**
   * Get tour booking confirmation
   * @param {string|number} bookingId - Booking ID
   * @returns {Promise<Object>} Booking confirmation
   */
  async getBookingConfirmation(bookingId) {
    try {
      const response = await api.request(`/tours/bookings/${bookingId}/confirmation`);
      return response.confirmation || response.data || response;
    } catch (error) {
      console.error('Get booking confirmation error:', error);
      throw error;
    }
  }

  /**
   * Clear service cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Get cache info for debugging
   * @returns {Object} Cache information
   */
  getCacheInfo() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      expiry: this.cacheExpiry
    };
  }

  /**
   * Real-time cache management methods
   */

  /**
   * Emit cache invalidation event
   * @param {string} event - Event type
   * @param {Object} data - Event data
   */
  emitCacheInvalidation(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in tour service event listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Subscribe to cache invalidation events
   * @param {string} event - Event type
   * @param {Function} callback - Callback function
   */
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event).add(callback);
  }

  /**
   * Unsubscribe from cache invalidation events
   * @param {string} event - Event type
   * @param {Function} callback - Callback function
   */
  off(event, callback) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).delete(callback);
    }
  }

  /**
   * Handle real-time tour creation
   * @param {Object} tour - New tour data
   */
  handleNewTour(tour) {
    console.log('TourService: Handling new tour', tour.title);
    
    // Clear all tours cache to ensure fresh data
    const keysToDelete = [];
    for (const key of this.cache.keys()) {
      if (key.startsWith('tours_')) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => this.cache.delete(key));
    
    // Emit event for any subscribers
    this.emitCacheInvalidation('new-tour', tour);
  }

  /**
   * Handle real-time tour update
   * @param {Object} tour - Updated tour data
   */
  handleTourUpdate(tour) {
    console.log('TourService: Handling tour update', tour.title);
    
    // Remove specific tour from cache
    this.cache.delete(`tour_${tour.id}`);
    this.cache.delete(`tour_${tour._id}`);
    
    // Clear tours list cache
    const keysToDelete = [];
    for (const key of this.cache.keys()) {
      if (key.startsWith('tours_')) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => this.cache.delete(key));
    
    // Emit event for any subscribers
    this.emitCacheInvalidation('tour-updated', tour);
  }

  /**
   * Handle real-time tour deletion
   * @param {string} tourId - Deleted tour ID
   */
  handleTourDeletion(tourId) {
    console.log('TourService: Handling tour deletion', tourId);
    
    // Remove specific tour from cache
    this.cache.delete(`tour_${tourId}`);
    
    // Clear tours list cache
    const keysToDelete = [];
    for (const key of this.cache.keys()) {
      if (key.startsWith('tours_')) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => this.cache.delete(key));
    
    // Emit event for any subscribers
    this.emitCacheInvalidation('tour-deleted', { tourId });
  }

  /**
   * Force refresh all tours cache
   */
  forceRefreshCache() {
    console.log('TourService: Force refreshing cache');
    this.clearCache();
    this.emitCacheInvalidation('cache-refreshed', {});
  }

  /**
   * Initialize real-time updates integration
   * @param {Object} webSocketService - WebSocket service instance
   */
  initializeRealTimeUpdates(webSocketService) {
    console.log('TourService: Initializing real-time updates');
    
    // Subscribe to WebSocket events
    webSocketService.on('tourCreated', (data) => {
      this.handleNewTour(data.tour);
    });
    
    webSocketService.on('tourUpdated', (data) => {
      this.handleTourUpdate(data.tour);
    });
    
    webSocketService.on('tourDeleted', (data) => {
      this.handleTourDeletion(data.tourId);
    });
    
    webSocketService.on('toursRefresh', () => {
      this.forceRefreshCache();
    });
  }
}

export default new TourService();
