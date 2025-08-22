import { api } from '../utils/api.js';

class MuseumService {
  constructor() {
    this.cache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Get all museums with optional filters
   * @param {Object} filters - Search and filter options
   * @returns {Promise<Array>} List of museums
   */
  async getMuseums(filters = {}) {
    const cacheKey = `museums_${JSON.stringify(filters)}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheExpiry) {
        return cached.data;
      }
    }

    try {
      const response = await api.getMuseums(filters);
      const museums = response.museums || response.data || response;
      
      // Cache the result
      this.cache.set(cacheKey, {
        data: museums,
        timestamp: Date.now()
      });
      
      return museums;
    } catch (error) {
      console.error('Get museums error:', error);
      throw error;
    }
  }

  /**
   * Get museum by ID
   * @param {string|number} id - Museum ID
   * @returns {Promise<Object>} Museum details
   */
  async getMuseumById(id) {
    const cacheKey = `museum_${id}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheExpiry) {
        return cached.data;
      }
    }

    try {
      const response = await api.getMuseumById(id);
      const museum = response.museum || response.data || response;
      
      // Cache the result
      this.cache.set(cacheKey, {
        data: museum,
        timestamp: Date.now()
      });
      
      return museum;
    } catch (error) {
      console.error('Get museum by ID error:', error);
      throw error;
    }
  }

  /**
   * Create new museum
   * @param {Object} museumData - Museum data
   * @returns {Promise<Object>} Created museum
   */
  async createMuseum(museumData) {
    try {
      const response = await api.createMuseum(museumData);
      
      // Clear cache to force refresh
      this.clearCache();
      
      return response.museum || response.data || response;
    } catch (error) {
      console.error('Create museum error:', error);
      throw error;
    }
  }

  /**
   * Update museum
   * @param {string|number} id - Museum ID
   * @param {Object} museumData - Updated museum data
   * @returns {Promise<Object>} Updated museum
   */
  async updateMuseum(id, museumData) {
    try {
      const response = await api.updateMuseum(id, museumData);
      
      // Clear cache to force refresh
      this.clearCache();
      
      return response.museum || response.data || response;
    } catch (error) {
      console.error('Update museum error:', error);
      throw error;
    }
  }

  /**
   * Delete museum
   * @param {string|number} id - Museum ID
   * @returns {Promise<Object>} Deletion result
   */
  async deleteMuseum(id) {
    try {
      const response = await api.deleteMuseum(id);
      
      // Clear cache to force refresh
      this.clearCache();
      
      return response;
    } catch (error) {
      console.error('Delete museum error:', error);
      throw error;
    }
  }

  /**
   * Search museums by query
   * @param {string} query - Search query
   * @param {Object} filters - Additional filters
   * @returns {Promise<Array>} Search results
   */
  async searchMuseums(query, filters = {}) {
    const searchFilters = {
      ...filters,
      search: query
    };
    
    return this.getMuseums(searchFilters);
  }

  /**
   * Get featured museums
   * @param {number} limit - Number of museums to fetch
   * @returns {Promise<Array>} Featured museums
   */
  async getFeaturedMuseums(limit = 10) {
    const filters = {
      featured: true,
      limit
    };
    
    return this.getMuseums(filters);
  }

  /**
   * Get museums by location/city
   * @param {string} location - City or region
   * @param {Object} filters - Additional filters
   * @returns {Promise<Array>} Museums in location
   */
  async getMuseumsByLocation(location, filters = {}) {
    const locationFilters = {
      ...filters,
      location
    };
    
    return this.getMuseums(locationFilters);
  }

  /**
   * Get museums by type
   * @param {string} type - Museum type (national, cultural, archaeological, etc.)
   * @param {Object} filters - Additional filters
   * @returns {Promise<Array>} Museums by type
   */
  async getMuseumsByType(type, filters = {}) {
    const typeFilters = {
      ...filters,
      type
    };
    
    return this.getMuseums(typeFilters);
  }

  /**
   * Get museum statistics
   * @param {string|number} museumId - Museum ID
   * @returns {Promise<Object>} Museum statistics
   */
  async getMuseumStats(museumId) {
    try {
      const response = await api.request(`/museum/${museumId}/stats`);
      return response.stats || response.data || response;
    } catch (error) {
      console.error('Get museum stats error:', error);
      throw error;
    }
  }

  /**
   * Get museum's artifacts
   * @param {string|number} museumId - Museum ID
   * @param {Object} filters - Additional filters
   * @returns {Promise<Array>} Museum artifacts
   */
  async getMuseumArtifacts(museumId, filters = {}) {
    try {
      const response = await api.request(`/museum/${museumId}/artifacts`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.artifacts || response.data || response;
    } catch (error) {
      console.error('Get museum artifacts error:', error);
      throw error;
    }
  }

  /**
   * Get museum's tours
   * @param {string|number} museumId - Museum ID
   * @param {Object} filters - Additional filters
   * @returns {Promise<Array>} Museum tours
   */
  async getMuseumTours(museumId, filters = {}) {
    try {
      const response = await api.request(`/museum/${museumId}/tours`);
      return response.tours || response.data || response;
    } catch (error) {
      console.error('Get museum tours error:', error);
      throw error;
    }
  }

  /**
   * Get museum's events
   * @param {string|number} museumId - Museum ID
   * @param {Object} filters - Additional filters
   * @returns {Promise<Array>} Museum events
   */
  async getMuseumEvents(museumId, filters = {}) {
    try {
      const response = await api.request(`/museum/${museumId}/events`);
      return response.events || response.data || response;
    } catch (error) {
      console.error('Get museum events error:', error);
      throw error;
    }
  }

  /**
   * Get museum reviews
   * @param {string|number} museumId - Museum ID
   * @param {Object} pagination - Pagination options
   * @returns {Promise<Object>} Reviews data
   */
  async getMuseumReviews(museumId, pagination = {}) {
    try {
      const queryParams = new URLSearchParams(pagination).toString();
      const response = await api.request(`/museum/${museumId}/reviews${queryParams ? `?${queryParams}` : ''}`);
      return response;
    } catch (error) {
      console.error('Get museum reviews error:', error);
      throw error;
    }
  }

  /**
   * Add museum review
   * @param {string|number} museumId - Museum ID
   * @param {Object} reviewData - Review data (rating, comment)
   * @returns {Promise<Object>} Review result
   */
  async addMuseumReview(museumId, reviewData) {
    try {
      const response = await api.request(`/museum/${museumId}/reviews`, {
        method: 'POST',
        body: reviewData
      });
      return response;
    } catch (error) {
      console.error('Add museum review error:', error);
      throw error;
    }
  }

  /**
   * Add museum to favorites
   * @param {string|number} museumId - Museum ID
   * @returns {Promise<Object>} Favorite result
   */
  async addToFavorites(museumId) {
    try {
      const response = await api.request('/user/favorites/museums', {
        method: 'POST',
        body: { museumId }
      });
      return response;
    } catch (error) {
      console.error('Add museum to favorites error:', error);
      throw error;
    }
  }

  /**
   * Remove museum from favorites
   * @param {string|number} museumId - Museum ID
   * @returns {Promise<Object>} Remove result
   */
  async removeFromFavorites(museumId) {
    try {
      const response = await api.request(`/user/favorites/museums/${museumId}`, {
        method: 'DELETE'
      });
      return response;
    } catch (error) {
      console.error('Remove museum from favorites error:', error);
      throw error;
    }
  }

  /**
   * Get user's favorite museums
   * @returns {Promise<Array>} Favorite museums
   */
  async getFavoriteMuseums() {
    try {
      const response = await api.request('/user/favorites/museums');
      return response.museums || response.data || response;
    } catch (error) {
      console.error('Get favorite museums error:', error);
      throw error;
    }
  }

  /**
   * Get museum opening hours
   * @param {string|number} museumId - Museum ID
   * @returns {Promise<Object>} Opening hours
   */
  async getMuseumHours(museumId) {
    try {
      const response = await api.request(`/museum/${museumId}/hours`);
      return response.hours || response.data || response;
    } catch (error) {
      console.error('Get museum hours error:', error);
      throw error;
    }
  }

  /**
   * Get museum contact information
   * @param {string|number} museumId - Museum ID
   * @returns {Promise<Object>} Contact information
   */
  async getMuseumContact(museumId) {
    try {
      const response = await api.request(`/museum/${museumId}/contact`);
      return response.contact || response.data || response;
    } catch (error) {
      console.error('Get museum contact error:', error);
      throw error;
    }
  }

  /**
   * Get museum facilities (parking, accessibility, etc.)
   * @param {string|number} museumId - Museum ID
   * @returns {Promise<Object>} Facilities information
   */
  async getMuseumFacilities(museumId) {
    try {
      const response = await api.request(`/museum/${museumId}/facilities`);
      return response.facilities || response.data || response;
    } catch (error) {
      console.error('Get museum facilities error:', error);
      throw error;
    }
  }

  /**
   * Get museum virtual tour availability
   * @param {string|number} museumId - Museum ID
   * @returns {Promise<Object>} Virtual tour data
   */
  async getMuseumVirtualTour(museumId) {
    try {
      const response = await api.request(`/museum/${museumId}/virtual-tour`);
      return response.virtualTour || response.data || response;
    } catch (error) {
      console.error('Get museum virtual tour error:', error);
      throw error;
    }
  }

  /**
   * Report museum information issue
   * @param {string|number} museumId - Museum ID
   * @param {string} issue - Issue type
   * @param {string} description - Issue description
   * @returns {Promise<Object>} Report result
   */
  async reportMuseumIssue(museumId, issue, description) {
    try {
      const response = await api.request(`/museum/${museumId}/report`, {
        method: 'POST',
        body: { issue, description }
      });
      return response;
    } catch (error) {
      console.error('Report museum issue error:', error);
      throw error;
    }
  }

  /**
   * Get museums near coordinates
   * @param {number} latitude - Latitude
   * @param {number} longitude - Longitude
   * @param {number} radius - Search radius in km
   * @returns {Promise<Array>} Nearby museums
   */
  async getNearbyMuseums(latitude, longitude, radius = 50) {
    try {
      const response = await api.request(`/museum/nearby?lat=${latitude}&lng=${longitude}&radius=${radius}`);
      return response.museums || response.data || response;
    } catch (error) {
      console.error('Get nearby museums error:', error);
      throw error;
    }
  }

  /**
   * Get museum categories/types
   * @returns {Promise<Array>} Available museum types
   */
  async getMuseumTypes() {
    const cacheKey = 'museum_types';
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheExpiry) {
        return cached.data;
      }
    }

    try {
      const response = await api.request('/museum/types');
      const types = response.types || response.data || response;
      
      // Cache the result
      this.cache.set(cacheKey, {
        data: types,
        timestamp: Date.now()
      });
      
      return types;
    } catch (error) {
      console.error('Get museum types error:', error);
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
}

export default new MuseumService();
