class UserFavoritesService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    this.endpoints = {
      favorites: '/user/favorites',
      recentlyViewed: '/user/recently-viewed',
      bookmarks: '/user/bookmarks',
      downloads: '/user/downloads',
      notes: '/user/notes'
    };
  }

  // Generic API request method
  async makeRequest(endpoint, method = 'GET', data = null, options = {}) {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        ...options.headers
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const config = {
        method,
        headers,
        ...options
      };

      if (data && method !== 'GET') {
        config.body = JSON.stringify(data);
      }

      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
      }

      return {
        success: true,
        data: responseData.data || responseData,
        message: responseData.message
      };
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // ==================== FAVORITES ====================
  
  async getFavorites(options = {}) {
    const queryParams = new URLSearchParams({
      page: options.page || 1,
      limit: options.limit || 20,
      type: options.type || 'all',
      sortBy: options.sortBy || 'addedAt',
      sortOrder: options.sortOrder || 'desc'
    });

    return this.makeRequest(`${this.endpoints.favorites}?${queryParams}`);
  }

  async addToFavorites(itemId, itemType = 'artifact') {
    return this.makeRequest(this.endpoints.favorites, 'POST', {
      itemId,
      itemType,
      addedAt: new Date().toISOString()
    });
  }

  async removeFromFavorites(itemId) {
    return this.makeRequest(`${this.endpoints.favorites}/${itemId}`, 'DELETE');
  }

  async checkIsFavorite(itemId) {
    return this.makeRequest(`${this.endpoints.favorites}/${itemId}/check`);
  }

  async getFavoriteStats() {
    return this.makeRequest(`${this.endpoints.favorites}/stats`);
  }

  // ==================== RECENTLY VIEWED ====================
  
  async getRecentlyViewed(options = {}) {
    const queryParams = new URLSearchParams({
      page: options.page || 1,
      limit: options.limit || 20,
      type: options.type || 'all'
    });

    return this.makeRequest(`${this.endpoints.recentlyViewed}?${queryParams}`);
  }

  async addToRecentlyViewed(itemId, itemType = 'artifact', metadata = {}) {
    return this.makeRequest(this.endpoints.recentlyViewed, 'POST', {
      itemId,
      itemType,
      viewedAt: new Date().toISOString(),
      metadata
    });
  }

  async clearRecentlyViewed() {
    return this.makeRequest(this.endpoints.recentlyViewed, 'DELETE');
  }

  // ==================== BOOKMARKS ====================
  
  async getBookmarks(options = {}) {
    const queryParams = new URLSearchParams({
      page: options.page || 1,
      limit: options.limit || 20,
      category: options.category || 'all',
      sortBy: options.sortBy || 'addedAt',
      sortOrder: options.sortOrder || 'desc'
    });

    return this.makeRequest(`${this.endpoints.bookmarks}?${queryParams}`);
  }

  async addBookmark(itemId, itemType = 'artifact', category = 'general', notes = '') {
    return this.makeRequest(this.endpoints.bookmarks, 'POST', {
      itemId,
      itemType,
      category,
      notes,
      addedAt: new Date().toISOString()
    });
  }

  async removeBookmark(bookmarkId) {
    return this.makeRequest(`${this.endpoints.bookmarks}/${bookmarkId}`, 'DELETE');
  }

  async updateBookmark(bookmarkId, updates) {
    return this.makeRequest(`${this.endpoints.bookmarks}/${bookmarkId}`, 'PUT', updates);
  }

  async getBookmarkCategories() {
    return this.makeRequest(`${this.endpoints.bookmarks}/categories`);
  }

  // ==================== DOWNLOADS ====================
  
  async getDownloads(options = {}) {
    const queryParams = new URLSearchParams({
      page: options.page || 1,
      limit: options.limit || 20,
      type: options.type || 'all',
      sortBy: options.sortBy || 'downloadedAt',
      sortOrder: options.sortOrder || 'desc'
    });

    return this.makeRequest(`${this.endpoints.downloads}?${queryParams}`);
  }

  async recordDownload(itemId, itemType = 'artifact', downloadUrl, fileName, fileSize = 0) {
    return this.makeRequest(this.endpoints.downloads, 'POST', {
      itemId,
      itemType,
      downloadUrl,
      fileName,
      fileSize,
      downloadedAt: new Date().toISOString()
    });
  }

  async getDownloadStats() {
    return this.makeRequest(`${this.endpoints.downloads}/stats`);
  }

  // ==================== NOTES ====================
  
  async getNotes(options = {}) {
    const queryParams = new URLSearchParams({
      page: options.page || 1,
      limit: options.limit || 20,
      search: options.search || '',
      sortBy: options.sortBy || 'updatedAt',
      sortOrder: options.sortOrder || 'desc'
    });

    return this.makeRequest(`${this.endpoints.notes}?${queryParams}`);
  }

  async createNote(title, content, itemId = null, itemType = null, tags = []) {
    return this.makeRequest(this.endpoints.notes, 'POST', {
      title,
      content,
      itemId,
      itemType,
      tags,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  async updateNote(noteId, updates) {
    return this.makeRequest(`${this.endpoints.notes}/${noteId}`, 'PUT', {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  }

  async deleteNote(noteId) {
    return this.makeRequest(`${this.endpoints.notes}/${noteId}`, 'DELETE');
  }

  async getNoteById(noteId) {
    return this.makeRequest(`${this.endpoints.notes}/${noteId}`);
  }

  async searchNotes(query, options = {}) {
    const queryParams = new URLSearchParams({
      q: query,
      page: options.page || 1,
      limit: options.limit || 20
    });

    return this.makeRequest(`${this.endpoints.notes}/search?${queryParams}`);
  }

  // ==================== UNIFIED STATS ====================
  
  async getUserStats() {
    try {
      const [favorites, recentlyViewed, bookmarks, downloads, notes] = await Promise.all([
        this.makeRequest(`${this.endpoints.favorites}/count`),
        this.makeRequest(`${this.endpoints.recentlyViewed}/count`),
        this.makeRequest(`${this.endpoints.bookmarks}/count`),
        this.makeRequest(`${this.endpoints.downloads}/count`),
        this.makeRequest(`${this.endpoints.notes}/count`)
      ]);

      return {
        success: true,
        data: {
          favoritesCount: favorites.success ? favorites.data.count : 0,
          recentlyViewedCount: recentlyViewed.success ? recentlyViewed.data.count : 0,
          bookmarksCount: bookmarks.success ? bookmarks.data.count : 0,
          downloadsCount: downloads.success ? downloads.data.count : 0,
          notesCount: notes.success ? notes.data.count : 0
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        data: {
          favoritesCount: 0,
          recentlyViewedCount: 0,
          bookmarksCount: 0,
          downloadsCount: 0,
          notesCount: 0
        }
      };
    }
  }

  // ==================== LOCAL STORAGE FALLBACK ====================
  
  // Fallback methods for when backend is not available
  getLocalStorageKey(type) {
    return `ethioheritage360_user_${type}`;
  }

  getLocalData(type) {
    try {
      const data = localStorage.getItem(this.getLocalStorageKey(type));
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  setLocalData(type, data) {
    try {
      localStorage.setItem(this.getLocalStorageKey(type), JSON.stringify(data));
      return true;
    } catch {
      return false;
    }
  }

  // Local favorites management
  addToLocalFavorites(itemId, itemData) {
    const favorites = this.getLocalData('favorites');
    const existingIndex = favorites.findIndex(fav => fav.itemId === itemId);
    
    if (existingIndex === -1) {
      favorites.unshift({
        itemId,
        itemData,
        addedAt: new Date().toISOString()
      });
      return this.setLocalData('favorites', favorites);
    }
    return true;
  }

  removeFromLocalFavorites(itemId) {
    const favorites = this.getLocalData('favorites');
    const filtered = favorites.filter(fav => fav.itemId !== itemId);
    return this.setLocalData('favorites', filtered);
  }

  checkLocalFavorite(itemId) {
    const favorites = this.getLocalData('favorites');
    return favorites.some(fav => fav.itemId === itemId);
  }
}

export default new UserFavoritesService();
