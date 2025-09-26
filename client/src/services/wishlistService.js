import api from '../utils/api.js';

class WishlistService {
  constructor() {
    this.localStorageKey = 'ethio_heritage_wishlist';
  }

  /**
   * Get user's complete wishlist
   * @returns {Promise<Object>} Wishlist with all item types
   */
  async getWishlist() {
    try {
      const response = await api.request('/user/wishlist');
      return response.wishlist || response.data || response;
    } catch (error) {
      console.log('API unavailable, using local storage');
      return this.getLocalWishlist();
    }
  }

  /**
   * Add artifact to wishlist
   * @param {Object} artifact - Artifact to add
   * @returns {Promise<Object>} Add result
   */
  async addArtifact(artifact) {
    try {
      const response = await api.request('/user/wishlist/artifacts', {
        method: 'POST',
        body: { artifactId: artifact.id }
      });
      return response;
    } catch (error) {
      // Fallback to local storage
      const wishlist = this.getLocalWishlist();
      if (!wishlist.artifacts.some(item => item.id === artifact.id)) {
        wishlist.artifacts.push({
          ...artifact,
          addedAt: new Date().toISOString()
        });
        this.setLocalWishlist(wishlist);
      }
      return { success: true, message: 'Added to local wishlist' };
    }
  }

  /**
   * Remove artifact from wishlist
   * @param {string|number} artifactId - Artifact ID
   * @returns {Promise<Object>} Remove result
   */
  async removeArtifact(artifactId) {
    try {
      const response = await api.request(`/user/wishlist/artifacts/${artifactId}`, {
        method: 'DELETE'
      });
      return response;
    } catch (error) {
      // Fallback to local storage
      const wishlist = this.getLocalWishlist();
      wishlist.artifacts = wishlist.artifacts.filter(item => item.id !== artifactId);
      this.setLocalWishlist(wishlist);
      return { success: true, message: 'Removed from local wishlist' };
    }
  }

  /**
   * Add museum to wishlist
   * @param {Object} museum - Museum to add
   * @returns {Promise<Object>} Add result
   */
  async addMuseum(museum) {
    try {
      const response = await api.request('/user/wishlist/museums', {
        method: 'POST',
        body: { museumId: museum.id }
      });
      return response;
    } catch (error) {
      const wishlist = this.getLocalWishlist();
      if (!wishlist.museums.some(item => item.id === museum.id)) {
        wishlist.museums.push({
          ...museum,
          addedAt: new Date().toISOString()
        });
        this.setLocalWishlist(wishlist);
      }
      return { success: true, message: 'Added to local wishlist' };
    }
  }

  /**
   * Remove museum from wishlist
   * @param {string|number} museumId - Museum ID
   * @returns {Promise<Object>} Remove result
   */
  async removeMuseum(museumId) {
    try {
      const response = await api.request(`/user/wishlist/museums/${museumId}`, {
        method: 'DELETE'
      });
      return response;
    } catch (error) {
      const wishlist = this.getLocalWishlist();
      wishlist.museums = wishlist.museums.filter(item => item.id !== museumId);
      this.setLocalWishlist(wishlist);
      return { success: true, message: 'Removed from local wishlist' };
    }
  }

  /**
   * Add tour to wishlist
   * @param {Object} tour - Tour to add
   * @returns {Promise<Object>} Add result
   */
  async addTour(tour) {
    try {
      const response = await api.request('/user/wishlist/tours', {
        method: 'POST',
        body: { tourId: tour.id }
      });
      return response;
    } catch (error) {
      const wishlist = this.getLocalWishlist();
      if (!wishlist.tours.some(item => item.id === tour.id)) {
        wishlist.tours.push({
          ...tour,
          addedAt: new Date().toISOString()
        });
        this.setLocalWishlist(wishlist);
      }
      return { success: true, message: 'Added to local wishlist' };
    }
  }

  /**
   * Remove tour from wishlist
   * @param {string|number} tourId - Tour ID
   * @returns {Promise<Object>} Remove result
   */
  async removeTour(tourId) {
    try {
      const response = await api.request(`/user/wishlist/tours/${tourId}`, {
        method: 'DELETE'
      });
      return response;
    } catch (error) {
      const wishlist = this.getLocalWishlist();
      wishlist.tours = wishlist.tours.filter(item => item.id !== tourId);
      this.setLocalWishlist(wishlist);
      return { success: true, message: 'Removed from local wishlist' };
    }
  }

  /**
   * Add heritage site to wishlist
   * @param {Object} site - Heritage site to add
   * @returns {Promise<Object>} Add result
   */
  async addHeritageSite(site) {
    try {
      const response = await api.request('/user/wishlist/heritage-sites', {
        method: 'POST',
        body: { siteId: site.id }
      });
      return response;
    } catch (error) {
      const wishlist = this.getLocalWishlist();
      if (!wishlist.heritageSites.some(item => item.id === site.id)) {
        wishlist.heritageSites.push({
          ...site,
          addedAt: new Date().toISOString()
        });
        this.setLocalWishlist(wishlist);
      }
      return { success: true, message: 'Added to local wishlist' };
    }
  }

  /**
   * Remove heritage site from wishlist
   * @param {string|number} siteId - Site ID
   * @returns {Promise<Object>} Remove result
   */
  async removeHeritageSite(siteId) {
    try {
      const response = await api.request(`/user/wishlist/heritage-sites/${siteId}`, {
        method: 'DELETE'
      });
      return response;
    } catch (error) {
      const wishlist = this.getLocalWishlist();
      wishlist.heritageSites = wishlist.heritageSites.filter(item => item.id !== siteId);
      this.setLocalWishlist(wishlist);
      return { success: true, message: 'Removed from local wishlist' };
    }
  }

  /**
   * Check if item is in wishlist
   * @param {string} type - Item type (artifact, museum, tour, heritage-site)
   * @param {string|number} id - Item ID
   * @returns {boolean} Is in wishlist
   */
  isInWishlist(type, id) {
    const wishlist = this.getLocalWishlist();

    switch (type) {
      case 'artifact':
        return wishlist.artifacts.some(item => item.id === id);
      case 'museum':
        return wishlist.museums.some(item => item.id === id);
      case 'tour':
        return wishlist.tours.some(item => item.id === id);
      case 'heritage-site':
        return wishlist.heritageSites.some(item => item.id === id);
      default:
        return false;
    }
  }

  /**
   * Get wishlist by type
   * @param {string} type - Item type
   * @returns {Array} Wishlist items of specified type
   */
  getWishlistByType(type) {
    const wishlist = this.getLocalWishlist();

    switch (type) {
      case 'artifacts':
        return wishlist.artifacts;
      case 'museums':
        return wishlist.museums;
      case 'tours':
        return wishlist.tours;
      case 'heritage-sites':
        return wishlist.heritageSites;
      default:
        return [];
    }
  }

  /**
   * Get wishlist statistics
   * @returns {Object} Wishlist stats
   */
  getWishlistStats() {
    const wishlist = this.getLocalWishlist();

    return {
      totalItems: wishlist.artifacts.length + wishlist.museums.length +
        wishlist.tours.length + wishlist.heritageSites.length,
      artifacts: wishlist.artifacts.length,
      museums: wishlist.museums.length,
      tours: wishlist.tours.length,
      heritageSites: wishlist.heritageSites.length,
      lastUpdated: wishlist.lastUpdated
    };
  }

  /**
   * Clear entire wishlist
   * @returns {Promise<Object>} Clear result
   */
  async clearWishlist() {
    try {
      const response = await api.request('/user/wishlist', {
        method: 'DELETE'
      });

      // Also clear local storage
      this.clearLocalWishlist();

      return response;
    } catch (error) {
      this.clearLocalWishlist();
      return { success: true, message: 'Local wishlist cleared' };
    }
  }

  /**
   * Export wishlist data
   * @param {string} format - Export format (json, csv)
   * @returns {Object} Export data
   */
  exportWishlist(format = 'json') {
    const wishlist = this.getLocalWishlist();
    const exportData = {
      exportedAt: new Date().toISOString(),
      stats: this.getWishlistStats(),
      data: wishlist
    };

    if (format === 'json') {
      return {
        data: JSON.stringify(exportData, null, 2),
        filename: `ethio-heritage-wishlist-${new Date().toISOString().split('T')[0]}.json`,
        mimeType: 'application/json'
      };
    } else if (format === 'csv') {
      // Convert to CSV format
      let csvContent = 'Type,Name,ID,Added Date\n';

      wishlist.artifacts.forEach(item => {
        csvContent += `Artifact,"${item.name}",${item.id},${item.addedAt}\n`;
      });

      wishlist.museums.forEach(item => {
        csvContent += `Museum,"${item.name}",${item.id},${item.addedAt}\n`;
      });

      wishlist.tours.forEach(item => {
        csvContent += `Tour,"${item.title || item.name}",${item.id},${item.addedAt}\n`;
      });

      wishlist.heritageSites.forEach(item => {
        csvContent += `Heritage Site,"${item.name}",${item.id},${item.addedAt}\n`;
      });

      return {
        data: csvContent,
        filename: `ethio-heritage-wishlist-${new Date().toISOString().split('T')[0]}.csv`,
        mimeType: 'text/csv'
      };
    }
  }

  /**
   * Search wishlist items
   * @param {string} query - Search query
   * @param {string} type - Item type filter (optional)
   * @returns {Array} Search results
   */
  searchWishlist(query, type = null) {
    const wishlist = this.getLocalWishlist();
    let allItems = [];

    // Collect all items with type information
    wishlist.artifacts.forEach(item => allItems.push({ ...item, type: 'artifact' }));
    wishlist.museums.forEach(item => allItems.push({ ...item, type: 'museum' }));
    wishlist.tours.forEach(item => allItems.push({ ...item, type: 'tour' }));
    wishlist.heritageSites.forEach(item => allItems.push({ ...item, type: 'heritage-site' }));

    // Filter by type if specified
    if (type) {
      allItems = allItems.filter(item => item.type === type);
    }

    // Search by query
    const searchQuery = query.toLowerCase();
    return allItems.filter(item => {
      const name = (item.name || item.title || '').toLowerCase();
      const description = (item.description || '').toLowerCase();
      return name.includes(searchQuery) || description.includes(searchQuery);
    });
  }

  /**
   * Get recent wishlist additions
   * @param {number} limit - Number of recent items to return
   * @returns {Array} Recent wishlist items
   */
  getRecentAdditions(limit = 10) {
    const wishlist = this.getLocalWishlist();
    let allItems = [];

    // Collect all items with type information and sort by addedAt
    wishlist.artifacts.forEach(item => allItems.push({ ...item, type: 'artifact' }));
    wishlist.museums.forEach(item => allItems.push({ ...item, type: 'museum' }));
    wishlist.tours.forEach(item => allItems.push({ ...item, type: 'tour' }));
    wishlist.heritageSites.forEach(item => allItems.push({ ...item, type: 'heritage-site' }));

    // Sort by addedAt date (most recent first)
    allItems.sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));

    return allItems.slice(0, limit);
  }

  // Local storage methods for offline functionality

  /**
   * Get wishlist from local storage
   * @returns {Object} Local wishlist
   */
  getLocalWishlist() {
    try {
      const stored = localStorage.getItem(this.localStorageKey);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error reading local wishlist:', error);
    }

    // Return default structure
    return {
      artifacts: [],
      museums: [],
      tours: [],
      heritageSites: [],
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Save wishlist to local storage
   * @param {Object} wishlist - Wishlist data
   */
  setLocalWishlist(wishlist) {
    try {
      wishlist.lastUpdated = new Date().toISOString();
      localStorage.setItem(this.localStorageKey, JSON.stringify(wishlist));
    } catch (error) {
      console.error('Error saving local wishlist:', error);
    }
  }

  /**
   * Clear local wishlist
   */
  clearLocalWishlist() {
    try {
      localStorage.removeItem(this.localStorageKey);
    } catch (error) {
      console.error('Error clearing local wishlist:', error);
    }
  }

  /**
   * Sync local wishlist with server
   * @returns {Promise<Object>} Sync result
   */
  async syncWishlist() {
    try {
      const localWishlist = this.getLocalWishlist();
      const response = await api.request('/user/wishlist/sync', {
        method: 'POST',
        body: { localWishlist }
      });

      if (response.syncedWishlist) {
        this.setLocalWishlist(response.syncedWishlist);
      }

      return response;
    } catch (error) {
      console.error('Wishlist sync error:', error);
      throw error;
    }
  }
}

export default new WishlistService();
