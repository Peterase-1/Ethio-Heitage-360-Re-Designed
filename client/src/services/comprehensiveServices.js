import axios from 'axios';
import { toast } from 'sonner';

// Base API URL
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Axios instance with auth
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 1. EDUCATION HUB SERVICES
export const educationHubService = {
  // Courses
  async getCourses(params = {}) {
    try {
      const response = await apiClient.get('/education-hub/courses', { params });
      return response.data;
    } catch (error) {
      toast.error('Failed to load courses');
      throw error;
    }
  },

  async getCourse(id) {
    try {
      const response = await apiClient.get(`/education-hub/courses/${id}`);
      return response.data;
    } catch (error) {
      toast.error('Failed to load course details');
      throw error;
    }
  },

  async enrollInCourse(id) {
    try {
      const response = await apiClient.post(`/education-hub/courses/${id}/enroll`);
      toast.success('Successfully enrolled in course!');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to enroll in course');
      throw error;
    }
  },

  async getMyEnrollments(params = {}) {
    try {
      const response = await apiClient.get('/education-hub/my-enrollments', { params });
      return response.data;
    } catch (error) {
      toast.error('Failed to load enrollments');
      throw error;
    }
  },

  // Quizzes
  async getQuizzes(params = {}) {
    try {
      const response = await apiClient.get('/education-hub/quizzes', { params });
      return response.data;
    } catch (error) {
      toast.error('Failed to load quizzes');
      throw error;
    }
  },

  async getQuiz(id) {
    try {
      const response = await apiClient.get(`/education-hub/quizzes/${id}`);
      return response.data;
    } catch (error) {
      toast.error('Failed to load quiz');
      throw error;
    }
  },

  async startQuizAttempt(id) {
    try {
      const response = await apiClient.post(`/education-hub/quizzes/${id}/attempt`);
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to start quiz');
      throw error;
    }
  },

  async submitQuizAttempt(attemptId, answers) {
    try {
      const response = await apiClient.post(`/education-hub/quiz-attempts/${attemptId}/submit`, {
        answers
      });
      return response.data;
    } catch (error) {
      toast.error('Failed to submit quiz');
      throw error;
    }
  },

  // Flashcards
  async getFlashcards(params = {}) {
    try {
      const response = await apiClient.get('/education-hub/flashcards', { params });
      return response.data;
    } catch (error) {
      toast.error('Failed to load flashcards');
      throw error;
    }
  },

  // Live Sessions
  async getLiveSessions(params = {}) {
    try {
      const response = await apiClient.get('/education-hub/live-sessions', { params });
      return response.data;
    } catch (error) {
      toast.error('Failed to load live sessions');
      throw error;
    }
  },

  async registerForLiveSession(id) {
    try {
      const response = await apiClient.post(`/education-hub/live-sessions/${id}/register`);
      toast.success('Successfully registered for live session!');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to register for session');
      throw error;
    }
  },

  // Study Guides
  async getStudyGuides(params = {}) {
    try {
      const response = await apiClient.get('/education-hub/study-guides', { params });
      return response.data;
    } catch (error) {
      toast.error('Failed to load study guides');
      throw error;
    }
  },

  // Certificates
  async getMyCertificates() {
    try {
      const response = await apiClient.get('/education-hub/certificates');
      return response.data;
    } catch (error) {
      toast.error('Failed to load certificates');
      throw error;
    }
  }
};

// 2. COLLECTION SERVICES
export const collectionService = {
  // Bookmarks
  async getBookmarks(params = {}) {
    try {
      const response = await apiClient.get('/collection/bookmarks', { params });
      return response.data;
    } catch (error) {
      toast.error('Failed to load bookmarks');
      throw error;
    }
  },

  async createBookmark(bookmarkData) {
    try {
      const response = await apiClient.post('/collection/bookmarks', bookmarkData);
      toast.success('Bookmark added successfully!');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add bookmark');
      throw error;
    }
  },

  async updateBookmark(id, updates) {
    try {
      const response = await apiClient.put(`/collection/bookmarks/${id}`, updates);
      toast.success('Bookmark updated successfully!');
      return response.data;
    } catch (error) {
      toast.error('Failed to update bookmark');
      throw error;
    }
  },

  async deleteBookmark(id) {
    try {
      const response = await apiClient.delete(`/collection/bookmarks/${id}`);
      toast.success('Bookmark deleted successfully!');
      return response.data;
    } catch (error) {
      toast.error('Failed to delete bookmark');
      throw error;
    }
  },

  async accessBookmark(id) {
    try {
      const response = await apiClient.post(`/collection/bookmarks/${id}/access`);
      return response.data;
    } catch (error) {
      console.error('Failed to track bookmark access');
      throw error;
    }
  },

  // Notes
  async getNotes(params = {}) {
    try {
      const response = await apiClient.get('/collection/notes', { params });
      return response.data;
    } catch (error) {
      toast.error('Failed to load notes');
      throw error;
    }
  },

  async createNote(noteData) {
    try {
      const response = await apiClient.post('/collection/notes', noteData);
      toast.success('Note created successfully!');
      return response.data;
    } catch (error) {
      toast.error('Failed to create note');
      throw error;
    }
  },

  async getNote(id) {
    try {
      const response = await apiClient.get(`/collection/notes/${id}`);
      return response.data;
    } catch (error) {
      toast.error('Failed to load note');
      throw error;
    }
  },

  async updateNote(id, updates) {
    try {
      const response = await apiClient.put(`/collection/notes/${id}`, updates);
      toast.success('Note updated successfully!');
      return response.data;
    } catch (error) {
      toast.error('Failed to update note');
      throw error;
    }
  },

  async deleteNote(id) {
    try {
      const response = await apiClient.delete(`/collection/notes/${id}`);
      toast.success('Note deleted successfully!');
      return response.data;
    } catch (error) {
      toast.error('Failed to delete note');
      throw error;
    }
  },

  async togglePinNote(id) {
    try {
      const response = await apiClient.post(`/collection/notes/${id}/pin`);
      return response.data;
    } catch (error) {
      toast.error('Failed to pin/unpin note');
      throw error;
    }
  },

  // Favorites
  async getFavorites(params = {}) {
    try {
      const response = await apiClient.get('/collection/favorites', { params });
      return response.data;
    } catch (error) {
      toast.error('Failed to load favorites');
      throw error;
    }
  },

  async addToFavorites(type, itemId, notes = '') {
    try {
      const response = await apiClient.post('/collection/favorites', {
        type,
        itemId,
        notes
      });
      toast.success('Added to favorites!');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add to favorites');
      throw error;
    }
  },

  async removeFromFavorites(type, itemId) {
    try {
      const response = await apiClient.delete('/collection/favorites', {
        data: { type, itemId }
      });
      toast.success('Removed from favorites!');
      return response.data;
    } catch (error) {
      toast.error('Failed to remove from favorites');
      throw error;
    }
  },

  // Recently viewed
  async getRecentlyViewed(params = {}) {
    try {
      const response = await apiClient.get('/collection/recent', { params });
      return response.data;
    } catch (error) {
      toast.error('Failed to load recent items');
      throw error;
    }
  },

  // Collection stats
  async getCollectionStats() {
    try {
      const response = await apiClient.get('/collection/stats');
      return response.data;
    } catch (error) {
      console.error('Failed to load collection stats');
      throw error;
    }
  }
};

// 3. COMMUNITY SERVICES
export const communityService = {
  // Forums
  async getForumTopics(params = {}) {
    try {
      const response = await apiClient.get('/community/forums/topics', { params });
      return response.data;
    } catch (error) {
      toast.error('Failed to load forum topics');
      throw error;
    }
  },

  async createForumTopic(topicData) {
    try {
      const response = await apiClient.post('/community/forums/topics', topicData);
      toast.success('Forum topic created successfully!');
      return response.data;
    } catch (error) {
      toast.error('Failed to create forum topic');
      throw error;
    }
  },

  async getForumTopic(id) {
    try {
      const response = await apiClient.get(`/community/forums/topics/${id}`);
      return response.data;
    } catch (error) {
      toast.error('Failed to load forum topic');
      throw error;
    }
  },

  async addForumPost(topicId, content, attachments = []) {
    try {
      const response = await apiClient.post(`/community/forums/topics/${topicId}/posts`, {
        content,
        attachments
      });
      return response.data;
    } catch (error) {
      toast.error('Failed to add post');
      throw error;
    }
  },

  async likeForumPost(topicId, postId) {
    try {
      const response = await apiClient.post(`/community/forums/topics/${topicId}/posts/${postId}/like`);
      return response.data;
    } catch (error) {
      console.error('Failed to like post');
      throw error;
    }
  },

  async subscribeToTopic(topicId) {
    try {
      const response = await apiClient.post(`/community/forums/topics/${topicId}/subscribe`);
      toast.success('Subscribed to topic!');
      return response.data;
    } catch (error) {
      toast.error('Failed to subscribe to topic');
      throw error;
    }
  },

  // Study Groups
  async getStudyGroups(params = {}) {
    try {
      const response = await apiClient.get('/community/study-groups', { params });
      return response.data;
    } catch (error) {
      toast.error('Failed to load study groups');
      throw error;
    }
  },

  async createStudyGroup(groupData) {
    try {
      const response = await apiClient.post('/community/study-groups', groupData);
      toast.success('Study group created successfully!');
      return response.data;
    } catch (error) {
      toast.error('Failed to create study group');
      throw error;
    }
  },

  async getStudyGroup(id) {
    try {
      const response = await apiClient.get(`/community/study-groups/${id}`);
      return response.data;
    } catch (error) {
      toast.error('Failed to load study group');
      throw error;
    }
  },

  async joinStudyGroup(id, inviteCode = '') {
    try {
      const response = await apiClient.post(`/community/study-groups/${id}/join`, {
        inviteCode
      });
      toast.success('Successfully joined study group!');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to join study group');
      throw error;
    }
  },

  async leaveStudyGroup(id) {
    try {
      const response = await apiClient.post(`/community/study-groups/${id}/leave`);
      toast.success('Left study group successfully!');
      return response.data;
    } catch (error) {
      toast.error('Failed to leave study group');
      throw error;
    }
  },

  async getMyStudyGroups(params = {}) {
    try {
      const response = await apiClient.get('/community/my-study-groups', { params });
      return response.data;
    } catch (error) {
      toast.error('Failed to load your study groups');
      throw error;
    }
  },

  // Social Features
  async getLeaderboard(params = {}) {
    try {
      const response = await apiClient.get('/community/leaderboard', { params });
      return response.data;
    } catch (error) {
      toast.error('Failed to load leaderboard');
      throw error;
    }
  },

  async shareProgress(goalId, message, platforms = ['internal']) {
    try {
      const response = await apiClient.post('/community/share-progress', {
        goalId,
        message,
        platforms
      });
      toast.success('Progress shared successfully!');
      return response.data;
    } catch (error) {
      toast.error('Failed to share progress');
      throw error;
    }
  },

  async findUsers(params = {}) {
    try {
      const response = await apiClient.get('/community/find-friends', { params });
      return response.data;
    } catch (error) {
      toast.error('Failed to search users');
      throw error;
    }
  },

  async getCommunityStats() {
    try {
      const response = await apiClient.get('/community/stats');
      return response.data;
    } catch (error) {
      console.error('Failed to load community stats');
      throw error;
    }
  }
};

// 4. PROGRESS SERVICES
export const progressService = {
  // Goals
  async getGoals(params = {}) {
    try {
      const response = await apiClient.get('/progress/goals', { params });
      return response.data;
    } catch (error) {
      toast.error('Failed to load goals');
      throw error;
    }
  },

  async createGoal(goalData) {
    try {
      const response = await apiClient.post('/progress/goals', goalData);
      toast.success('Goal created successfully!');
      return response.data;
    } catch (error) {
      toast.error('Failed to create goal');
      throw error;
    }
  },

  async getGoal(id) {
    try {
      const response = await apiClient.get(`/progress/goals/${id}`);
      return response.data;
    } catch (error) {
      toast.error('Failed to load goal');
      throw error;
    }
  },

  async updateGoal(id, updates) {
    try {
      const response = await apiClient.put(`/progress/goals/${id}`, updates);
      toast.success('Goal updated successfully!');
      return response.data;
    } catch (error) {
      toast.error('Failed to update goal');
      throw error;
    }
  },

  async updateGoalProgress(id, increment = 1, notes = '') {
    try {
      const response = await apiClient.post(`/progress/goals/${id}/progress`, {
        increment,
        notes
      });
      return response.data;
    } catch (error) {
      toast.error('Failed to update goal progress');
      throw error;
    }
  },

  async deleteGoal(id) {
    try {
      const response = await apiClient.delete(`/progress/goals/${id}`);
      toast.success('Goal deleted successfully!');
      return response.data;
    } catch (error) {
      toast.error('Failed to delete goal');
      throw error;
    }
  },

  // Achievements
  async getAchievements(params = {}) {
    try {
      const response = await apiClient.get('/progress/achievements', { params });
      return response.data;
    } catch (error) {
      toast.error('Failed to load achievements');
      throw error;
    }
  },

  // Activity Log
  async getActivityLog(params = {}) {
    try {
      const response = await apiClient.get('/progress/activity', { params });
      return response.data;
    } catch (error) {
      toast.error('Failed to load activity log');
      throw error;
    }
  },

  // Analytics
  async getProgressOverview(params = {}) {
    try {
      const response = await apiClient.get('/progress/overview', { params });
      return response.data;
    } catch (error) {
      toast.error('Failed to load progress overview');
      throw error;
    }
  },

  async getDetailedStats() {
    try {
      const response = await apiClient.get('/progress/detailed-stats');
      return response.data;
    } catch (error) {
      toast.error('Failed to load detailed statistics');
      throw error;
    }
  },

  // Goal Templates
  async getGoalTemplates() {
    try {
      const response = await apiClient.get('/progress/goal-templates');
      return response.data;
    } catch (error) {
      console.error('Failed to load goal templates');
      throw error;
    }
  }
};

// 5. GENERAL UTILITY FUNCTIONS
export const utilityService = {
  // Format dates for display
  formatDate(date, options = {}) {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...options
    }).format(new Date(date));
  },

  // Format relative time (e.g., "2 days ago")
  formatRelativeTime(date) {
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now - past) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
    return `${Math.floor(diffInSeconds / 31536000)}y ago`;
  },

  // Calculate progress percentage
  calculateProgress(current, target) {
    if (!target || target === 0) return 0;
    return Math.round((current / target) * 100);
  },

  // Format numbers for display
  formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  }
};

// Export all services as default
export default {
  educationHubService,
  collectionService,
  communityService,
  progressService,
  utilityService
};
