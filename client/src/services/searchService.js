import api from '../utils/api.js';

class SearchService {
  constructor() {
    this.searchHistory = [];
    this.maxHistorySize = 50;
    this.loadSearchHistory();
  }

  /**
   * Perform global search across all content types
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Promise<Object>} Search results
   */
  async search(query, options = {}) {
    try {
      const searchParams = {
        q: query,
        ...options
      };

      const response = await api.request('/search', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      // Add to search history
      this.addToHistory(query, options);

      return response.results || response.data || response;
    } catch (error) {
      console.error('Global search error:', error);
      // Return mock search results for development
      return this.getMockSearchResults(query, options);
    }
  }

  /**
   * Search artifacts specifically
   * @param {string} query - Search query
   * @param {Object} filters - Artifact filters
   * @returns {Promise<Array>} Artifact search results
   */
  async searchArtifacts(query, filters = {}) {
    try {
      const searchParams = {
        q: query,
        type: 'artifacts',
        ...filters
      };

      const response = await api.request('/search/artifacts', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      return response.artifacts || response.data || response;
    } catch (error) {
      console.error('Artifact search error:', error);
      return [];
    }
  }

  /**
   * Search museums specifically
   * @param {string} query - Search query
   * @param {Object} filters - Museum filters
   * @returns {Promise<Array>} Museum search results
   */
  async searchMuseums(query, filters = {}) {
    try {
      const searchParams = {
        q: query,
        type: 'museums',
        ...filters
      };

      const response = await api.request('/search/museums', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      return response.museums || response.data || response;
    } catch (error) {
      console.error('Museum search error:', error);
      return [];
    }
  }

  /**
   * Search tours specifically
   * @param {string} query - Search query
   * @param {Object} filters - Tour filters
   * @returns {Promise<Array>} Tour search results
   */
  async searchTours(query, filters = {}) {
    try {
      const searchParams = {
        q: query,
        type: 'tours',
        ...filters
      };

      const response = await api.request('/search/tours', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      return response.tours || response.data || response;
    } catch (error) {
      console.error('Tour search error:', error);
      return [];
    }
  }

  /**
   * Search heritage sites specifically
   * @param {string} query - Search query
   * @param {Object} filters - Heritage site filters
   * @returns {Promise<Array>} Heritage site search results
   */
  async searchHeritageSites(query, filters = {}) {
    try {
      const searchParams = {
        q: query,
        type: 'heritage-sites',
        ...filters
      };

      const response = await api.request('/search/heritage-sites', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      return response.sites || response.data || response;
    } catch (error) {
      console.error('Heritage sites search error:', error);
      return [];
    }
  }

  /**
   * Get search suggestions/autocomplete
   * @param {string} query - Partial search query
   * @param {string} type - Content type to suggest (optional)
   * @returns {Promise<Array>} Search suggestions
   */
  async getSuggestions(query, type = null) {
    if (!query || query.length < 2) {
      return [];
    }

    try {
      const response = await api.request(`/search/suggestions?q=${encodeURIComponent(query)}${type ? `&type=${type}` : ''}`);
      return response.suggestions || response.data || response;
    } catch (error) {
      console.error('Search suggestions error:', error);
      // Return mock suggestions
      return this.getMockSuggestions(query, type);
    }
  }

  /**
   * Get popular search terms
   * @param {number} limit - Number of terms to return
   * @returns {Promise<Array>} Popular search terms
   */
  async getPopularSearchTerms(limit = 10) {
    try {
      const response = await api.request(`/search/popular-terms?limit=${limit}`);
      return response.terms || response.data || response;
    } catch (error) {
      console.error('Popular search terms error:', error);
      // Return mock popular terms
      return [
        'Lucy fossil',
        'Lalibela churches',
        'Ethiopian coffee',
        'Aksum obelisks',
        'Harar walls',
        'Traditional weaving',
        'Orthodox icons',
        'Ancient manuscripts',
        'Rock art',
        'Archaeological sites'
      ].slice(0, limit);
    }
  }

  /**
   * Advanced search with multiple criteria
   * @param {Object} criteria - Advanced search criteria
   * @returns {Promise<Object>} Advanced search results
   */
  async advancedSearch(criteria) {
    try {
      const response = await api.request('/search/advanced', {
        method: 'POST',
        body: criteria
      });

      // Add to search history
      this.addToHistory(criteria.query || '', criteria);

      return response.results || response.data || response;
    } catch (error) {
      console.error('Advanced search error:', error);
      return this.getMockSearchResults(criteria.query || '', criteria);
    }
  }

  /**
   * Search within user's content (favorites, wishlist, etc.)
   * @param {string} query - Search query
   * @param {string} contentType - Type of user content to search
   * @returns {Promise<Array>} User content search results
   */
  async searchUserContent(query, contentType = 'all') {
    try {
      const response = await api.request(`/search/user-content?q=${encodeURIComponent(query)}&type=${contentType}`);
      return response.results || response.data || response;
    } catch (error) {
      console.error('User content search error:', error);
      return [];
    }
  }

  /**
   * Search by image (reverse image search)
   * @param {File} imageFile - Image file to search
   * @returns {Promise<Array>} Similar artifacts/items
   */
  async searchByImage(imageFile) {
    try {
      const uploadResponse = await api.uploadFile(imageFile, 'search-image');

      if (uploadResponse.url) {
        const response = await api.request('/search/by-image', {
          method: 'POST',
          body: { imageUrl: uploadResponse.url }
        });

        return response.results || response.data || response;
      }

      throw new Error('Failed to upload search image');
    } catch (error) {
      console.error('Image search error:', error);
      throw error;
    }
  }

  /**
   * Get search filters for a specific content type
   * @param {string} contentType - Content type (artifacts, museums, tours, etc.)
   * @returns {Promise<Object>} Available filters
   */
  async getSearchFilters(contentType) {
    try {
      const response = await api.request(`/search/filters/${contentType}`);
      return response.filters || response.data || response;
    } catch (error) {
      console.error('Get search filters error:', error);
      // Return mock filters
      return this.getMockFilters(contentType);
    }
  }

  /**
   * Save search query for later
   * @param {string} query - Search query
   * @param {Object} filters - Search filters
   * @param {string} name - Save name (optional)
   * @returns {Promise<Object>} Save result
   */
  async saveSearch(query, filters = {}, name = '') {
    try {
      const searchData = {
        query,
        filters,
        name: name || query,
        savedAt: new Date().toISOString()
      };

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
   * Get search statistics
   * @returns {Promise<Object>} Search statistics
   */
  async getSearchStats() {
    try {
      const response = await api.request('/search/stats');
      return response.stats || response.data || response;
    } catch (error) {
      console.error('Search stats error:', error);
      return {
        totalSearches: 12543,
        uniqueQueries: 8932,
        popularCategories: ['artifacts', 'museums', 'heritage-sites', 'tours'],
        averageResultsPerSearch: 25.3,
        topLanguages: ['English', 'Amharic', 'Oromo']
      };
    }
  }

  // Local search history management

  /**
   * Add search to history
   * @param {string} query - Search query
   * @param {Object} options - Search options
   */
  addToHistory(query, options = {}) {
    if (!query.trim()) return;

    const historyItem = {
      query: query.trim(),
      options,
      timestamp: new Date().toISOString(),
      id: Date.now().toString()
    };

    // Remove duplicate if exists
    this.searchHistory = this.searchHistory.filter(item =>
      item.query !== query || JSON.stringify(item.options) !== JSON.stringify(options)
    );

    // Add to beginning of array
    this.searchHistory.unshift(historyItem);

    // Limit history size
    if (this.searchHistory.length > this.maxHistorySize) {
      this.searchHistory = this.searchHistory.slice(0, this.maxHistorySize);
    }

    this.saveSearchHistory();
  }

  /**
   * Get search history
   * @param {number} limit - Number of history items to return
   * @returns {Array} Search history
   */
  getSearchHistory(limit = 10) {
    return this.searchHistory.slice(0, limit);
  }

  /**
   * Clear search history
   */
  clearSearchHistory() {
    this.searchHistory = [];
    this.saveSearchHistory();
  }

  /**
   * Remove specific search from history
   * @param {string} searchId - Search ID to remove
   */
  removeFromHistory(searchId) {
    this.searchHistory = this.searchHistory.filter(item => item.id !== searchId);
    this.saveSearchHistory();
  }

  /**
   * Load search history from local storage
   */
  loadSearchHistory() {
    try {
      const stored = localStorage.getItem('ethio_heritage_search_history');
      if (stored) {
        this.searchHistory = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading search history:', error);
      this.searchHistory = [];
    }
  }

  /**
   * Save search history to local storage
   */
  saveSearchHistory() {
    try {
      localStorage.setItem('ethio_heritage_search_history', JSON.stringify(this.searchHistory));
    } catch (error) {
      console.error('Error saving search history:', error);
    }
  }

  // Mock data methods for development

  /**
   * Get mock search results
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Object} Mock search results
   */
  getMockSearchResults(query, options = {}) {
    return {
      query,
      totalResults: 42,
      results: {
        artifacts: [
          {
            id: 1,
            name: 'Ancient Ethiopian Cross',
            type: 'artifact',
            description: 'Beautiful silver cross from 14th century',
            image: 'https://picsum.photos/200/150?random=1',
            relevance: 0.95
          },
          {
            id: 2,
            name: 'Traditional Coffee Set',
            type: 'artifact',
            description: 'Complete Ethiopian coffee ceremony set',
            image: 'https://picsum.photos/200/150?random=2',
            relevance: 0.87
          }
        ],
        museums: [
          {
            id: 1,
            name: 'National Museum of Ethiopia',
            type: 'museum',
            description: 'Premier museum showcasing Ethiopian heritage',
            image: 'https://picsum.photos/200/150?random=3',
            relevance: 0.92
          }
        ],
        tours: [
          {
            id: 1,
            title: 'Historic Addis Ababa Tour',
            type: 'tour',
            description: 'Explore the rich history of Ethiopia\'s capital',
            image: 'https://picsum.photos/200/150?random=4',
            relevance: 0.78
          }
        ],
        heritageSites: [
          {
            id: 1,
            name: 'Lalibela Rock Churches',
            type: 'heritage-site',
            description: 'Medieval rock-hewn churches',
            image: 'https://picsum.photos/200/150?random=5',
            relevance: 0.98
          }
        ]
      },
      facets: {
        categories: {
          artifacts: 15,
          museums: 8,
          tours: 12,
          heritageSites: 7
        },
        periods: {
          'Ancient (Before 1270)': 10,
          'Medieval (1270-1855)': 18,
          'Modern (1855-Present)': 14
        }
      }
    };
  }

  /**
   * Get mock search suggestions
   * @param {string} query - Partial query
   * @param {string} type - Content type
   * @returns {Array} Mock suggestions
   */
  getMockSuggestions(query, type) {
    const allSuggestions = [
      'Lucy fossil replica',
      'Lalibela rock churches',
      'Ethiopian Orthodox cross',
      'Coffee ceremony set',
      'Aksum obelisk',
      'Harar city walls',
      'Traditional weaving loom',
      'Ancient manuscripts',
      'Queen of Sheba',
      'Ethiopian calendar'
    ];

    return allSuggestions
      .filter(suggestion => suggestion.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 5);
  }

  /**
   * Get mock search filters
   * @param {string} contentType - Content type
   * @returns {Object} Mock filters
   */
  getMockFilters(contentType) {
    const baseFilters = {
      artifacts: {
        categories: ['Religious', 'Cultural', 'Archaeological', 'Royal', 'Traditional'],
        periods: ['Ancient', 'Medieval', 'Modern'],
        materials: ['Stone', 'Metal', 'Wood', 'Textile', 'Clay'],
        museums: ['National Museum', 'Ethnological Museum', 'Regional Museums']
      },
      museums: {
        types: ['National', 'Regional', 'Specialized', 'Archaeological'],
        locations: ['Addis Ababa', 'Lalibela', 'Aksum', 'Harar', 'Bahir Dar'],
        features: ['Virtual Tours', '3D Exhibits', 'Interactive Displays']
      },
      tours: {
        types: ['Cultural', 'Historical', 'Archaeological', 'Natural'],
        durations: ['Half Day', 'Full Day', 'Multi-Day'],
        locations: ['Addis Ababa', 'Northern Circuit', 'Eastern Route', 'Southern Route'],
        languages: ['English', 'Amharic', 'French', 'German']
      }
    };

    return baseFilters[contentType] || {};
  }
}

export default new SearchService();
