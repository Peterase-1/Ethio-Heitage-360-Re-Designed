import api from '../utils/api';

// ==================== ADMIN LIVE SESSIONS API ====================

export const liveSessionsAdminAPI = {
  // Get all sessions for admin management
  getAllSessions: async (params = {}) => {
    try {
      const {
        page = 1,
        limit = 20,
        status = 'all',
        category = '',
        search = ''
      } = params;

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        status
      });

      if (category) queryParams.append('category', category);
      if (search) queryParams.append('search', search);

      const response = await api.get(`/live-sessions/admin/all?${queryParams.toString()}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch live sessions');
    }
  },

  // Create new live session
  createSession: async (sessionData) => {
    try {
      const response = await api.post('/live-sessions/admin/create', sessionData);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to create live session');
    }
  },

  // Update session
  updateSession: async (sessionId, sessionData) => {
    try {
      const response = await api.put(`/live-sessions/admin/${sessionId}`, sessionData);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to update live session');
    }
  },

  // Delete session
  deleteSession: async (sessionId) => {
    try {
      const response = await api.delete(`/live-sessions/admin/${sessionId}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to delete live session');
    }
  },

  // Start session
  startSession: async (sessionId) => {
    try {
      const response = await api.post(`/live-sessions/admin/${sessionId}/start`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to start live session');
    }
  },

  // End session
  endSession: async (sessionId) => {
    try {
      const response = await api.post(`/live-sessions/admin/${sessionId}/end`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to end live session');
    }
  },

  // Get session analytics
  getSessionAnalytics: async (sessionId) => {
    try {
      const response = await api.get(`/live-sessions/admin/${sessionId}/analytics`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch session analytics');
    }
  },

  // Get dashboard summary
  getDashboardSummary: async () => {
    try {
      const response = await api.get('/live-sessions/admin/dashboard/summary');
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch dashboard summary');
    }
  }
};

// ==================== VISITOR LIVE SESSIONS API ====================

export const liveSessionsVisitorAPI = {
  // Get public sessions (upcoming and live)
  getPublicSessions: async (params = {}) => {
    try {
      const {
        category = 'all',
        language = 'all',
        status = 'all',
        page = 1,
        limit = 20
      } = params;

      const queryParams = new URLSearchParams({
        category,
        language,
        status,
        page: page.toString(),
        limit: limit.toString()
      });

      const response = await api.get(`/live-sessions/public?${queryParams.toString()}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch live sessions');
    }
  },

  // Get session details
  getSessionDetails: async (sessionId) => {
    try {
      const response = await api.get(`/live-sessions/public/${sessionId}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch session details');
    }
  },

  // Register for session (requires authentication)
  registerForSession: async (sessionId) => {
    try {
      const response = await api.post(`/live-sessions/${sessionId}/register`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to register for session');
    }
  },

  // Unregister from session (requires authentication)
  unregisterFromSession: async (sessionId) => {
    try {
      const response = await api.delete(`/live-sessions/${sessionId}/register`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to unregister from session');
    }
  },

  // Get user's registered sessions (requires authentication)
  getUserSessions: async () => {
    try {
      const response = await api.get('/live-sessions/user/sessions');
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch user sessions');
    }
  },

  // Submit feedback for completed session
  submitFeedback: async (sessionId, feedbackData) => {
    try {
      const response = await api.post(`/live-sessions/${sessionId}/feedback`, feedbackData);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to submit feedback');
    }
  }
};

// ==================== UTILITY FUNCTIONS ====================

export const liveSessionsUtils = {
  // Get session status color
  getStatusColor: (status) => {
    switch (status) {
      case 'live': return 'error';
      case 'scheduled': return 'primary';
      case 'completed': return 'success';
      case 'cancelled': return 'secondary';
      default: return 'default';
    }
  },

  // Get session status label
  getStatusLabel: (status) => {
    switch (status) {
      case 'live': return 'Live Now';
      case 'scheduled': return 'Scheduled';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return 'Unknown';
    }
  },

  // Check if session can be started
  canStartSession: (session) => {
    if (!session) return false;
    return session.status === 'scheduled' && new Date() >= new Date(session.scheduledAt);
  },

  // Check if session can be joined
  canJoinSession: (session) => {
    if (!session) return false;
    return session.status === 'live';
  },

  // Format session duration
  formatDuration: (minutes) => {
    if (minutes < 60) {
      return `${minutes} minutes`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours} hour${hours > 1 ? 's' : ''}`;
  },

  // Get time until session starts
  getTimeUntilStart: (scheduledAt) => {
    const now = new Date();
    const start = new Date(scheduledAt);
    const diff = start - now;

    if (diff <= 0) return 'Started';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  },

  // Validate session data
  validateSessionData: (sessionData) => {
    const errors = {};

    if (!sessionData.title || sessionData.title.trim().length < 3) {
      errors.title = 'Title must be at least 3 characters';
    }

    if (!sessionData.description || sessionData.description.trim().length < 10) {
      errors.description = 'Description must be at least 10 characters';
    }

    if (!sessionData.category) {
      errors.category = 'Category is required';
    }

    if (!sessionData.scheduledAt) {
      errors.scheduledAt = 'Scheduled date and time is required';
    } else if (new Date(sessionData.scheduledAt) <= new Date()) {
      errors.scheduledAt = 'Scheduled time must be in the future';
    }

    if (!sessionData.duration || sessionData.duration < 15 || sessionData.duration > 300) {
      errors.duration = 'Duration must be between 15 and 300 minutes';
    }

    if (sessionData.maxParticipants && (sessionData.maxParticipants < 1 || sessionData.maxParticipants > 1000)) {
      errors.maxParticipants = 'Max participants must be between 1 and 1000';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
};

export default {
  admin: liveSessionsAdminAPI,
  visitor: liveSessionsVisitorAPI,
  utils: liveSessionsUtils
};
