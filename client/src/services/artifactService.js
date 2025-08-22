import { api } from '../utils/api.js';

class ArtifactService {
  constructor() {
    this.cache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Get all artifacts with optional filters
   * @param {Object} filters - Search and filter options
   * @returns {Promise<Array>} List of artifacts
   */
  async getArtifacts(filters = {}) {
    const cacheKey = `artifacts_${JSON.stringify(filters)}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheExpiry) {
        return cached.data;
      }
    }

    try {
      const response = await api.getArtifacts(filters);
      const artifacts = response.artifacts || response.data || response;
      
      // Cache the result
      this.cache.set(cacheKey, {
        data: artifacts,
        timestamp: Date.now()
      });
      
      return artifacts;
    } catch (error) {
      console.error('Get artifacts error:', error);
      throw error;
    }
  }

  /**
   * Get artifact by ID
   * @param {string|number} id - Artifact ID
   * @returns {Promise<Object>} Artifact details
   */
  async getArtifactById(id) {
    const cacheKey = `artifact_${id}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheExpiry) {
        return cached.data;
      }
    }

    try {
      const response = await api.getArtifactById(id);
      const artifact = response.artifact || response.data || response;
      
      // Cache the result
      this.cache.set(cacheKey, {
        data: artifact,
        timestamp: Date.now()
      });
      
      return artifact;
    } catch (error) {
      console.error('Get artifact by ID error:', error);
      throw error;
    }
  }

  /**
   * Create new artifact
   * @param {Object} artifactData - Artifact data
   * @returns {Promise<Object>} Created artifact
   */
  async createArtifact(artifactData) {
    try {
      const response = await api.createArtifact(artifactData);
      
      // Clear cache to force refresh
      this.clearCache();
      
      return response.artifact || response.data || response;
    } catch (error) {
      console.error('Create artifact error:', error);
      throw error;
    }
  }

  /**
   * Update artifact
   * @param {string|number} id - Artifact ID
   * @param {Object} artifactData - Updated artifact data
   * @returns {Promise<Object>} Updated artifact
   */
  async updateArtifact(id, artifactData) {
    try {
      const response = await api.updateArtifact(id, artifactData);
      
      // Clear cache to force refresh
      this.clearCache();
      
      return response.artifact || response.data || response;
    } catch (error) {
      console.error('Update artifact error:', error);
      throw error;
    }
  }

  /**
   * Delete artifact
   * @param {string|number} id - Artifact ID
   * @returns {Promise<Object>} Deletion result
   */
  async deleteArtifact(id) {
    try {
      const response = await api.deleteArtifact(id);
      
      // Clear cache to force refresh
      this.clearCache();
      
      return response;
    } catch (error) {
      console.error('Delete artifact error:', error);
      throw error;
    }
  }

  /**
   * Search artifacts by query
   * @param {string} query - Search query
   * @param {Object} filters - Additional filters
   * @returns {Promise<Array>} Search results
   */
  async searchArtifacts(query, filters = {}) {
    const searchFilters = {
      ...filters,
      search: query
    };
    
    return this.getArtifacts(searchFilters);
  }

  /**
   * Get artifacts by category
   * @param {string} category - Category name
   * @param {Object} filters - Additional filters
   * @returns {Promise<Array>} Category artifacts
   */
  async getArtifactsByCategory(category, filters = {}) {
    const categoryFilters = {
      ...filters,
      category
    };
    
    return this.getArtifacts(categoryFilters);
  }

  /**
   * Get artifacts by museum
   * @param {string|number} museumId - Museum ID
   * @param {Object} filters - Additional filters
   * @returns {Promise<Array>} Museum artifacts
   */
  async getArtifactsByMuseum(museumId, filters = {}) {
    const museumFilters = {
      ...filters,
      museum: museumId
    };
    
    return this.getArtifacts(museumFilters);
  }

  /**
   * Get featured artifacts
   * @param {number} limit - Number of artifacts to fetch
   * @returns {Promise<Array>} Featured artifacts
   */
  async getFeaturedArtifacts(limit = 10) {
    const filters = {
      featured: true,
      limit
    };
    
    return this.getArtifacts(filters);
  }

  /**
   * Get recently added artifacts
   * @param {number} limit - Number of artifacts to fetch
   * @returns {Promise<Array>} Recent artifacts
   */
  async getRecentArtifacts(limit = 10) {
    const filters = {
      sortBy: 'createdAt',
      sortOrder: 'desc',
      limit
    };
    
    return this.getArtifacts(filters);
  }

  /**
   * Get artifacts by period/era
   * @param {string} period - Historical period
   * @param {Object} filters - Additional filters
   * @returns {Promise<Array>} Period artifacts
   */
  async getArtifactsByPeriod(period, filters = {}) {
    const periodFilters = {
      ...filters,
      period
    };
    
    return this.getArtifacts(periodFilters);
  }

  /**
   * Get artifact statistics
   * @returns {Promise<Object>} Artifact statistics
   */
  async getArtifactStats() {
    try {
      const response = await api.request('/virtual-museum/artifacts/stats');
      return response.stats || response.data || response;
    } catch (error) {
      console.error('Get artifact stats error:', error);
      throw error;
    }
  }

  /**
   * Add artifact to favorites
   * @param {string|number} artifactId - Artifact ID
   * @returns {Promise<Object>} Favorite result
   */
  async addToFavorites(artifactId) {
    try {
      const response = await api.request('/user/favorites/artifacts', {
        method: 'POST',
        body: { artifactId }
      });
      return response;
    } catch (error) {
      console.error('Add to favorites error:', error);
      throw error;
    }
  }

  /**
   * Remove artifact from favorites
   * @param {string|number} artifactId - Artifact ID
   * @returns {Promise<Object>} Remove result
   */
  async removeFromFavorites(artifactId) {
    try {
      const response = await api.request(`/user/favorites/artifacts/${artifactId}`, {
        method: 'DELETE'
      });
      return response;
    } catch (error) {
      console.error('Remove from favorites error:', error);
      throw error;
    }
  }

  /**
   * Get user's favorite artifacts
   * @returns {Promise<Array>} Favorite artifacts
   */
  async getFavoriteArtifacts() {
    try {
      const response = await api.request('/user/favorites/artifacts');
      return response.artifacts || response.data || response;
    } catch (error) {
      console.error('Get favorite artifacts error:', error);
      throw error;
    }
  }

  /**
   * Rate an artifact
   * @param {string|number} artifactId - Artifact ID
   * @param {number} rating - Rating (1-5)
   * @param {string} review - Optional review text
   * @returns {Promise<Object>} Rating result
   */
  async rateArtifact(artifactId, rating, review = '') {
    try {
      const response = await api.request(`/virtual-museum/artifacts/${artifactId}/rate`, {
        method: 'POST',
        body: { rating, review }
      });
      return response;
    } catch (error) {
      console.error('Rate artifact error:', error);
      throw error;
    }
  }

  /**
   * Report an artifact (for inappropriate content, etc.)
   * @param {string|number} artifactId - Artifact ID
   * @param {string} reason - Report reason
   * @param {string} description - Detailed description
   * @returns {Promise<Object>} Report result
   */
  async reportArtifact(artifactId, reason, description) {
    try {
      const response = await api.request(`/virtual-museum/artifacts/${artifactId}/report`, {
        method: 'POST',
        body: { reason, description }
      });
      return response;
    } catch (error) {
      console.error('Report artifact error:', error);
      throw error;
    }
  }

  /**
   * Get artifact categories
   * @returns {Promise<Array>} Available categories
   */
  async getCategories() {
    const cacheKey = 'artifact_categories';
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheExpiry) {
        return cached.data;
      }
    }

    try {
      const response = await api.request('/virtual-museum/artifacts/categories');
      const categories = response.categories || response.data || response;
      
      // Cache the result
      this.cache.set(cacheKey, {
        data: categories,
        timestamp: Date.now()
      });
      
      return categories;
    } catch (error) {
      console.error('Get categories error:', error);
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

export default new ArtifactService();
