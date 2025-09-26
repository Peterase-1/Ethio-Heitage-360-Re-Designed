import api from '../utils/api';

// ==================== ADMIN FLASHCARD APIS ====================

export const flashcardsAdminAPI = {
  // Get all flashcard sets (admin)
  getAllFlashcardSets: async (params = {}) => {
    try {
      const {
        page = 1,
        limit = 20,
        search = '',
        category = '',
        isActive = null
      } = params;

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      if (search) queryParams.append('search', search);
      if (category) queryParams.append('category', category);
      if (isActive !== null) queryParams.append('isActive', isActive.toString());

      const response = await api.get(`/flashcards?${queryParams.toString()}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch flashcard sets');
    }
  },

  // Create flashcard set
  createFlashcardSet: async (flashcardData) => {
    try {
      const response = await api.post('/flashcards', flashcardData);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to create flashcard set');
    }
  },

  // Update flashcard set
  updateFlashcardSet: async (setId, flashcardData) => {
    try {
      const response = await api.put(`/flashcards/${setId}`, flashcardData);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to update flashcard set');
    }
  },

  // Delete flashcard set
  deleteFlashcardSet: async (setId) => {
    try {
      const response = await api.delete(`/flashcards/${setId}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to delete flashcard set');
    }
  },

  // Get flashcard set details
  getFlashcardSetDetails: async (setId) => {
    try {
      const response = await api.get(`/flashcards/${setId}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch flashcard set details');
    }
  },

  // Publish/Unpublish flashcard set
  toggleFlashcardSetStatus: async (setId, isActive) => {
    try {
      const response = await api.patch(`/flashcards/${setId}/status`, { isActive });
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to update flashcard set status');
    }
  },

  // Get flashcard statistics
  getFlashcardStats: async () => {
    try {
      const response = await api.get('/flashcards/stats');
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch flashcard statistics');
    }
  },

  // Bulk operations
  bulkUpdateFlashcards: async (setIds, operation, data = {}) => {
    try {
      const response = await api.post('/flashcards/bulk', {
        setIds,
        operation,
        data
      });
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to perform bulk operation');
    }
  }
};

// ==================== VISITOR FLASHCARD APIS ====================

export const flashcardsVisitorAPI = {
  // Get available flashcard sets for study
  getAvailableFlashcardSets: async (params = {}) => {
    try {
      const {
        page = 1,
        limit = 20,
        category = '',
        difficulty = ''
      } = params;

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      if (category) queryParams.append('category', category);
      if (difficulty) queryParams.append('difficulty', difficulty);

      const response = await api.get(`/visitor/flashcards?${queryParams.toString()}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch available flashcard sets');
    }
  },

  // Get flashcard set for study
  getFlashcardSetForStudy: async (setId) => {
    try {
      const response = await api.get(`/visitor/flashcards/${setId}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch flashcard set');
    }
  },

  // Save study progress
  saveStudyProgress: async (setId, progressData) => {
    try {
      const response = await api.post(`/visitor/flashcards/${setId}/progress`, progressData);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to save study progress');
    }
  },

  // Get study progress
  getStudyProgress: async (setId) => {
    try {
      const response = await api.get(`/visitor/flashcards/${setId}/progress`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch study progress');
    }
  },

  // Get my flashcard statistics
  getMyFlashcardStats: async () => {
    try {
      const response = await api.get('/visitor/flashcards/my-stats');
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch flashcard statistics');
    }
  }
};

export default {
  admin: flashcardsAdminAPI,
  visitor: flashcardsVisitorAPI
};
