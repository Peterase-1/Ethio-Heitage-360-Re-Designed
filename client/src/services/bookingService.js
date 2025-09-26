import api from '../utils/api.js';

class BookingService {
  constructor() {
    this.cache = new Map();
    this.cacheExpiry = 2 * 60 * 1000; // 2 minutes for bookings (shorter than tours)
    this.eventListeners = new Map();
    this.bookingCounter = 0;
  }

  /**
   * Create a new tour booking
   * @param {string|number} tourId - Tour ID
   * @param {Object} bookingData - Booking details
   * @returns {Promise<Object>} Created booking
   */
  async createBooking(tourId, bookingData) {
    try {
      // Validate required fields
      if (!tourId) {
        throw new Error('Tour ID is required');
      }
      if (!bookingData.selectedDate || !bookingData.numberOfGuests) {
        throw new Error('Selected date and number of guests are required');
      }

      const bookingPayload = {
        tourId,
        selectedDate: bookingData.selectedDate,
        numberOfGuests: parseInt(bookingData.numberOfGuests),
        guestDetails: bookingData.guestDetails || [],
        specialRequests: bookingData.specialRequests || '',
        contactInfo: {
          email: bookingData.email,
          phone: bookingData.phone,
          name: bookingData.name
        },
        paymentMethod: bookingData.paymentMethod || 'pending',
        totalAmount: bookingData.totalAmount || 0,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      // Try to use the existing API method, fallback to direct request
      let response;
      try {
        response = await api.bookTour(tourId, bookingPayload);
      } catch (error) {
        // Fallback to direct API call
        response = await api.request('/bookings', {
          method: 'POST',
          body: bookingPayload
        });
      }

      const booking = response.booking || response.data || response;

      // Clear user bookings cache to force refresh
      this.clearUserBookingsCache();

      // Increment counter
      this.bookingCounter++;

      // Emit booking creation event
      this.emitEvent('booking-created', booking);

      return booking;
    } catch (error) {
      console.error('Create booking error:', error);
      throw error;
    }
  }

  /**
   * Get user's bookings
   * @param {Object} filters - Filter options
   * @returns {Promise<Array>} User bookings
   */
  async getUserBookings(filters = {}) {
    const cacheKey = `user_bookings_${JSON.stringify(filters)}`;

    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheExpiry) {
        return cached.data;
      }
    }

    try {
      // Try existing tour service method first
      let response;
      try {
        const tourService = await import('./tourService.js');
        response = await tourService.default.getUserBookings(filters);
      } catch (error) {
        // Fallback to direct API call
        const queryParams = new URLSearchParams(filters).toString();
        response = await api.request(`/user/bookings${queryParams ? `?${queryParams}` : ''}`);
      }

      const bookings = response.bookings || response.data || response || [];

      // Update booking counter
      this.bookingCounter = bookings.length;

      // Cache the result
      this.cache.set(cacheKey, {
        data: bookings,
        timestamp: Date.now()
      });

      return bookings;
    } catch (error) {
      console.error('Get user bookings error:', error);
      // Return empty array on error to prevent UI crashes
      return [];
    }
  }

  /**
   * Get booking by ID
   * @param {string|number} bookingId - Booking ID
   * @returns {Promise<Object>} Booking details
   */
  async getBookingById(bookingId) {
    const cacheKey = `booking_${bookingId}`;

    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheExpiry) {
        return cached.data;
      }
    }

    try {
      const response = await api.request(`/bookings/${bookingId}`);
      const booking = response.booking || response.data || response;

      // Cache the result
      this.cache.set(cacheKey, {
        data: booking,
        timestamp: Date.now()
      });

      return booking;
    } catch (error) {
      console.error('Get booking by ID error:', error);
      throw error;
    }
  }

  /**
   * Update booking
   * @param {string|number} bookingId - Booking ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>} Updated booking
   */
  async updateBooking(bookingId, updateData) {
    try {
      const response = await api.request(`/bookings/${bookingId}`, {
        method: 'PUT',
        body: updateData
      });

      const booking = response.booking || response.data || response;

      // Clear cache to force refresh
      this.clearUserBookingsCache();
      this.cache.delete(`booking_${bookingId}`);

      // Emit update event
      this.emitEvent('booking-updated', booking);

      return booking;
    } catch (error) {
      console.error('Update booking error:', error);
      throw error;
    }
  }

  /**
   * Cancel booking
   * @param {string|number} bookingId - Booking ID
   * @param {string} reason - Cancellation reason
   * @returns {Promise<Object>} Cancellation result
   */
  async cancelBooking(bookingId, reason = '') {
    try {
      // Try existing tour service method first
      let response;
      try {
        const tourService = await import('./tourService.js');
        response = await tourService.default.cancelBooking(bookingId, reason);
      } catch (error) {
        // Fallback to direct API call
        response = await api.request(`/bookings/${bookingId}/cancel`, {
          method: 'POST',
          body: { reason }
        });
      }

      // Clear cache to force refresh
      this.clearUserBookingsCache();
      this.cache.delete(`booking_${bookingId}`);

      // Decrement counter
      this.bookingCounter = Math.max(0, this.bookingCounter - 1);

      // Emit cancellation event
      this.emitEvent('booking-cancelled', { bookingId, reason });

      return response;
    } catch (error) {
      console.error('Cancel booking error:', error);
      throw error;
    }
  }

  /**
   * Get booking confirmation
   * @param {string|number} bookingId - Booking ID
   * @returns {Promise<Object>} Booking confirmation
   */
  async getBookingConfirmation(bookingId) {
    try {
      // Try existing tour service method first
      let response;
      try {
        const tourService = await import('./tourService.js');
        response = await tourService.default.getBookingConfirmation(bookingId);
      } catch (error) {
        // Fallback to direct API call
        response = await api.request(`/bookings/${bookingId}/confirmation`);
      }

      return response.confirmation || response.data || response;
    } catch (error) {
      console.error('Get booking confirmation error:', error);
      throw error;
    }
  }

  /**
   * Get upcoming bookings
   * @param {number} limit - Number of bookings to fetch
   * @returns {Promise<Array>} Upcoming bookings
   */
  async getUpcomingBookings(limit = 10) {
    try {
      const filters = {
        status: 'confirmed',
        upcoming: true,
        limit
      };

      const bookings = await this.getUserBookings(filters);

      // Filter for upcoming dates
      const now = new Date();
      return bookings
        .filter(booking => {
          if (booking.selectedDate) {
            const bookingDate = new Date(booking.selectedDate);
            return bookingDate > now;
          }
          return false;
        })
        .sort((a, b) => new Date(a.selectedDate) - new Date(b.selectedDate))
        .slice(0, limit);
    } catch (error) {
      console.error('Get upcoming bookings error:', error);
      return [];
    }
  }

  /**
   * Get booking statistics
   * @returns {Promise<Object>} Booking statistics
   */
  async getBookingStats() {
    try {
      const bookings = await this.getUserBookings();

      const stats = {
        total: bookings.length,
        confirmed: bookings.filter(b => b.status === 'confirmed').length,
        pending: bookings.filter(b => b.status === 'pending').length,
        cancelled: bookings.filter(b => b.status === 'cancelled').length,
        upcoming: 0,
        past: 0
      };

      const now = new Date();
      bookings.forEach(booking => {
        if (booking.selectedDate) {
          const bookingDate = new Date(booking.selectedDate);
          if (bookingDate > now) {
            stats.upcoming++;
          } else {
            stats.past++;
          }
        }
      });

      return stats;
    } catch (error) {
      console.error('Get booking stats error:', error);
      return {
        total: 0,
        confirmed: 0,
        pending: 0,
        cancelled: 0,
        upcoming: 0,
        past: 0
      };
    }
  }

  /**
   * Search bookings
   * @param {string} query - Search query
   * @param {Object} filters - Additional filters
   * @returns {Promise<Array>} Search results
   */
  async searchBookings(query, filters = {}) {
    try {
      const bookings = await this.getUserBookings(filters);

      if (!query) return bookings;

      const lowerQuery = query.toLowerCase();
      return bookings.filter(booking =>
        booking.tour?.title?.toLowerCase().includes(lowerQuery) ||
        booking.tour?.location?.toLowerCase().includes(lowerQuery) ||
        booking.contactInfo?.name?.toLowerCase().includes(lowerQuery) ||
        booking.status?.toLowerCase().includes(lowerQuery)
      );
    } catch (error) {
      console.error('Search bookings error:', error);
      return [];
    }
  }

  /**
   * Get booking counter
   * @returns {number} Current booking count
   */
  getBookingCounter() {
    return this.bookingCounter;
  }

  /**
   * Refresh booking counter
   * @returns {Promise<number>} Updated booking count
   */
  async refreshBookingCounter() {
    try {
      const bookings = await this.getUserBookings();
      this.bookingCounter = bookings.length;
      this.emitEvent('counter-updated', this.bookingCounter);
      return this.bookingCounter;
    } catch (error) {
      console.error('Refresh booking counter error:', error);
      return this.bookingCounter;
    }
  }

  /**
   * Clear user bookings cache
   */
  clearUserBookingsCache() {
    const keysToDelete = [];
    for (const key of this.cache.keys()) {
      if (key.startsWith('user_bookings_')) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  /**
   * Clear all cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Event management methods
   */

  /**
   * Emit event
   * @param {string} event - Event type
   * @param {Object} data - Event data
   */
  emitEvent(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in booking service event listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Subscribe to events
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
   * Unsubscribe from events
   * @param {string} event - Event type
   * @param {Function} callback - Callback function
   */
  off(event, callback) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).delete(callback);
    }
  }

  /**
   * Initialize real-time booking updates
   * @param {Object} webSocketService - WebSocket service instance
   */
  initializeRealTimeUpdates(webSocketService) {
    console.log('BookingService: Initializing real-time updates');

    // Subscribe to WebSocket events
    webSocketService.on('bookingCreated', (data) => {
      console.log('BookingService: Booking created via WebSocket', data);
      this.bookingCounter++;
      this.clearUserBookingsCache();
      this.emitEvent('booking-created', data.booking);
    });

    webSocketService.on('bookingUpdated', (data) => {
      console.log('BookingService: Booking updated via WebSocket', data);
      this.clearUserBookingsCache();
      this.cache.delete(`booking_${data.booking.id}`);
      this.emitEvent('booking-updated', data.booking);
    });

    webSocketService.on('bookingCancelled', (data) => {
      console.log('BookingService: Booking cancelled via WebSocket', data);
      this.bookingCounter = Math.max(0, this.bookingCounter - 1);
      this.clearUserBookingsCache();
      this.cache.delete(`booking_${data.bookingId}`);
      this.emitEvent('booking-cancelled', data);
    });

    webSocketService.on('bookingsRefresh', () => {
      console.log('BookingService: Refreshing bookings cache');
      this.clearCache();
      this.refreshBookingCounter();
    });
  }

  /**
   * Handle new booking from WebSocket
   * @param {Object} booking - New booking data
   */
  handleNewBooking(booking) {
    console.log('BookingService: Handling new booking', booking);
    this.bookingCounter++;
    this.clearUserBookingsCache();
    this.emitEvent('booking-created', booking);
  }

  /**
   * Handle booking update from WebSocket
   * @param {Object} booking - Updated booking data
   */
  handleBookingUpdate(booking) {
    console.log('BookingService: Handling booking update', booking);
    this.clearUserBookingsCache();
    this.cache.delete(`booking_${booking.id}`);
    this.cache.delete(`booking_${booking._id}`);
    this.emitEvent('booking-updated', booking);
  }

  /**
   * Handle booking cancellation from WebSocket
   * @param {string} bookingId - Cancelled booking ID
   */
  handleBookingCancellation(bookingId) {
    console.log('BookingService: Handling booking cancellation', bookingId);
    this.bookingCounter = Math.max(0, this.bookingCounter - 1);
    this.clearUserBookingsCache();
    this.cache.delete(`booking_${bookingId}`);
    this.emitEvent('booking-cancelled', { bookingId });
  }

  /**
   * Force refresh all bookings cache
   */
  forceRefreshCache() {
    console.log('BookingService: Force refreshing cache');
    this.clearCache();
    this.refreshBookingCounter();
    this.emitEvent('cache-refreshed', {});
  }

  /**
   * Get cache info for debugging
   * @returns {Object} Cache information
   */
  getCacheInfo() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      expiry: this.cacheExpiry,
      bookingCounter: this.bookingCounter
    };
  }
}

export default new BookingService();
