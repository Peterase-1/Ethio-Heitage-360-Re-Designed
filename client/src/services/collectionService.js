import apiService from '../utils/api.js';
import { toast } from 'sonner';

class CollectionService {
  constructor() {
    this.baseURL = '/collections';
  }

  // ===============================
  // USER COLLECTIONS MANAGEMENT
  // ===============================

  /**
   * Get user's collections
   */
  async getUserCollections(params = {}) {
    try {
      const {
        type,
        category,
        search,
        sortBy = 'updatedAt',
        sortOrder = 'desc',
        page = 1,
        limit = 20
      } = params;

      const queryParams = new URLSearchParams({
        sortBy,
        sortOrder,
        page: page.toString(),
        limit: limit.toString()
      });

      if (type) queryParams.append('type', type);
      if (category) queryParams.append('category', category);
      if (search) queryParams.append('search', search);

      const response = await apiService.get(`${this.baseURL}?${queryParams}`);
      
      return {
        success: true,
        data: response.data,
        pagination: response.pagination,
        stats: response.stats
      };
    } catch (error) {
      console.error('Error fetching user collections:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch collections',
        data: [],
        pagination: { current: 1, pages: 1, total: 0 },
        stats: {}
      };
    }
  }

  /**
   * Get specific collection by ID
   */
  async getCollection(id, includeItems = true) {
    try {
      const response = await apiService.get(`${this.baseURL}/${id}?includeItems=${includeItems}`);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching collection:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch collection'
      };
    }
  }

  /**
   * Create new collection
   */
  async createCollection(collectionData) {
    try {
      const response = await apiService.post(this.baseURL, collectionData);
      
      toast.success('Collection created successfully');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error creating collection:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create collection';
      toast.error(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Update collection
   */
  async updateCollection(id, updates) {
    try {
      const response = await apiService.put(`${this.baseURL}/${id}`, updates);
      
      toast.success('Collection updated successfully');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error updating collection:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update collection';
      toast.error(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Delete collection
   */
  async deleteCollection(id) {
    try {
      await apiService.delete(`${this.baseURL}/${id}`);
      
      toast.success('Collection deleted successfully');
      return { success: true };
    } catch (error) {
      console.error('Error deleting collection:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete collection';
      toast.error(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  // ===============================
  // COLLECTION ITEMS MANAGEMENT
  // ===============================

  /**
   * Add item to collection
   */
  async addItem(collectionId, itemData) {
    try {
      await apiService.post(`${this.baseURL}/${collectionId}/items`, itemData);
      
      toast.success('Item added to collection');
      return { success: true };
    } catch (error) {
      console.error('Error adding item to collection:', error);
      const errorMessage = error.response?.data?.message || 'Failed to add item to collection';
      
      if (error.response?.status === 409) {
        toast.error('Item already exists in this collection');
      } else {
        toast.error(errorMessage);
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Remove item from collection
   */
  async removeItem(collectionId, itemId, itemType) {
    try {
      await apiService.delete(`${this.baseURL}/${collectionId}/items/${itemId}`, {
        data: { itemType }
      });
      
      toast.success('Item removed from collection');
      return { success: true };
    } catch (error) {
      console.error('Error removing item from collection:', error);
      const errorMessage = error.response?.data?.message || 'Failed to remove item from collection';
      toast.error(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Update item progress
   */
  async updateItemProgress(collectionId, itemId, itemType, progress) {
    try {
      const response = await apiService.patch(
        `${this.baseURL}/${collectionId}/items/${itemId}/progress`,
        { itemType, progress }
      );
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error updating item progress:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update item progress'
      };
    }
  }

  /**
   * Reorder collection items
   */
  async reorderItems(collectionId, itemOrder) {
    try {
      await apiService.patch(`${this.baseURL}/${collectionId}/reorder`, {
        itemOrder
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error reordering items:', error);
      toast.error('Failed to reorder items');
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to reorder items'
      };
    }
  }

  // ===============================
  // PUBLIC COLLECTIONS & DISCOVERY
  // ===============================

  /**
   * Get public collections for discovery
   */
  async getPublicCollections(params = {}) {
    try {
      const {
        type,
        category,
        search,
        sortBy = 'stats.lastActivityAt',
        page = 1,
        limit = 20
      } = params;

      const queryParams = new URLSearchParams({
        sortBy,
        page: page.toString(),
        limit: limit.toString()
      });

      if (type) queryParams.append('type', type);
      if (category) queryParams.append('category', category);
      if (search) queryParams.append('search', search);

      const response = await apiService.get(`${this.baseURL}/public?${queryParams}`);
      
      return {
        success: true,
        data: response.data,
        pagination: response.pagination
      };
    } catch (error) {
      console.error('Error fetching public collections:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch public collections',
        data: [],
        pagination: { current: 1, pages: 1, total: 0 }
      };
    }
  }

  // ===============================
  // SOCIAL FEATURES
  // ===============================

  /**
   * Toggle like on collection
   */
  async toggleLike(collectionId) {
    try {
      const response = await apiService.post(`${this.baseURL}/${collectionId}/like`);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to update like status');
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to toggle like'
      };
    }
  }

  /**
   * Add comment to collection
   */
  async addComment(collectionId, content) {
    try {
      await apiService.post(`${this.baseURL}/${collectionId}/comments`, { content });
      
      toast.success('Comment added');
      return { success: true };
    } catch (error) {
      console.error('Error adding comment:', error);
      const errorMessage = error.response?.data?.message || 'Failed to add comment';
      toast.error(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Fork collection
   */
  async forkCollection(collectionId, name) {
    try {
      const response = await apiService.post(`${this.baseURL}/${collectionId}/fork`, {
        name
      });
      
      toast.success('Collection forked successfully');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error forking collection:', error);
      const errorMessage = error.response?.data?.message || 'Failed to fork collection';
      toast.error(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  // ===============================
  // COLLABORATION FEATURES
  // ===============================

  /**
   * Add collaborator to collection
   */
  async addCollaborator(collectionId, userId, role = 'viewer') {
    try {
      await apiService.post(`${this.baseURL}/${collectionId}/collaborators`, {
        userId,
        role
      });
      
      toast.success('Collaborator added successfully');
      return { success: true };
    } catch (error) {
      console.error('Error adding collaborator:', error);
      const errorMessage = error.response?.data?.message || 'Failed to add collaborator';
      toast.error(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Remove collaborator from collection
   */
  async removeCollaborator(collectionId, userId) {
    try {
      await apiService.delete(`${this.baseURL}/${collectionId}/collaborators/${userId}`);
      
      toast.success('Collaborator removed successfully');
      return { success: true };
    } catch (error) {
      console.error('Error removing collaborator:', error);
      const errorMessage = error.response?.data?.message || 'Failed to remove collaborator';
      toast.error(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  // ===============================
  // UTILITY FUNCTIONS
  // ===============================

  /**
   * Get collection categories
   */
  getCategories() {
    return [
      { value: 'heritage', label: 'Heritage', icon: '🏛️', color: '#8B5A2B' },
      { value: 'history', label: 'History', icon: '📜', color: '#6B46C1' },
      { value: 'culture', label: 'Culture', icon: '🎭', color: '#DC2626' },
      { value: 'artifacts', label: 'Artifacts', icon: '🏺', color: '#059669' },
      { value: 'courses', label: 'Courses', icon: '📚', color: '#2563EB' },
      { value: 'games', label: 'Games', icon: '🎮', color: '#EA580C' },
      { value: 'mixed', label: 'Mixed', icon: '🌟', color: '#7C2D12' }
    ];
  }

  /**
   * Get collection types
   */
  getTypes() {
    return [
      { value: 'learning-path', label: 'Learning Path', icon: '🗺️', description: 'Structured learning journey' },
      { value: 'favorites', label: 'Favorites', icon: '❤️', description: 'Your favorite items' },
      { value: 'wishlist', label: 'Wishlist', icon: '⭐', description: 'Items to explore later' },
      { value: 'completed', label: 'Completed', icon: '✅', description: 'Finished activities' },
      { value: 'research', label: 'Research', icon: '🔬', description: 'Research collection' },
      { value: 'custom', label: 'Custom', icon: '📂', description: 'Custom collection' }
    ];
  }

  /**
   * Get item types
   */
  getItemTypes() {
    return [
      { value: 'artifact', label: 'Artifact', icon: '🏺' },
      { value: 'course', label: 'Course', icon: '📚' },
      { value: 'quiz', label: 'Quiz', icon: '❓' },
      { value: 'game', label: 'Game', icon: '🎮' },
      { value: 'flashcard', label: 'Flashcard', icon: '🃏' },
      { value: 'museum', label: 'Museum', icon: '🏛️' },
      { value: 'tour', label: 'Tour', icon: '🚶' },
      { value: 'lesson', label: 'Lesson', icon: '📖' },
      { value: 'livesession', label: 'Live Session', icon: '🎥' }
    ];
  }

  /**
   * Format collection for display
   */
  formatCollection(collection) {
    const categoryData = this.getCategories().find(c => c.value === collection.category);
    const typeData = this.getTypes().find(t => t.value === collection.type);

    return {
      ...collection,
      categoryData,
      typeData,
      formattedCreatedAt: new Date(collection.createdAt).toLocaleDateString(),
      formattedUpdatedAt: new Date(collection.updatedAt).toLocaleDateString()
    };
  }

  /**
   * Create default collections for new user
   */
  async createDefaultCollections() {
    const defaultCollections = [
      {
        name: 'My Favorites',
        description: 'My favorite artifacts and content',
        type: 'favorites',
        category: 'mixed',
        cover: { color: '#EF4444' },
        isPublic: false
      },
      {
        name: 'Learning Journey',
        description: 'My educational progress and courses',
        type: 'learning-path',
        category: 'courses',
        cover: { color: '#3B82F6' },
        isPublic: false
      },
      {
        name: 'Heritage Wishlist',
        description: 'Places and artifacts I want to explore',
        type: 'wishlist',
        category: 'heritage',
        cover: { color: '#8B5A2B' },
        isPublic: false
      }
    ];

    const results = [];
    for (const collection of defaultCollections) {
      const result = await this.createCollection(collection);
      results.push(result);
    }

    return results;
  }
}

export default new CollectionService();
