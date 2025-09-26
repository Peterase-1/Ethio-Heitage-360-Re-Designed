import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

// Create axios instance with default config
const api = axios.create({
  baseURL: `${API_BASE_URL}/api/educational-tours`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create organizer-specific axios instance
const organizerApi = axios.create({
  baseURL: `${API_BASE_URL}/api/organizer`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

// Public API functions (no authentication required)
export const publicToursApi = {
  // Get all published tours with filtering
  getPublishedTours: async (params = {}) => {
    const response = await api.get('/', { params });
    return response.data;
  },

  // Get single tour details
  getTourById: async (id) => {
    const response = await api.get(`/${id}`);
    return response.data;
  },

  // Get tour categories with statistics
  getCategories: async () => {
    const response = await api.get('/categories');
    return response.data;
  },
};

// User API functions (authentication required)
export const userToursApi = {
  // Get user's enrolled tours
  getEnrolledTours: async () => {
    const response = await api.get('/user/enrolled');
    return response.data;
  },

  // Enroll in a tour
  enrollInTour: async (tourId) => {
    const response = await api.post(`/${tourId}/enroll`);
    return response.data;
  },

  // Update user progress in a tour
  updateProgress: async (tourId, progressData) => {
    const response = await api.put(`/${tourId}/progress`, progressData);
    return response.data;
  },

  // Submit feedback for a completed tour
  submitFeedback: async (tourId, feedback) => {
    const response = await api.post(`/${tourId}/feedback`, feedback);
    return response.data;
  },
};

// Organizer API functions (organizer role required)
export const organizerToursApi = {
  // Get organizer's tours
  getMyTours: async (params = {}) => {
    const response = await api.get('/organizer/my-tours', { params });
    return response.data;
  },

  // Get organizer statistics
  getStats: async () => {
    const response = await api.get('/organizer/stats');
    return response.data;
  },

  // Create new tour
  createTour: async (tourData) => {
    const response = await api.post('/', tourData);
    return response.data;
  },

  // Update existing tour
  updateTour: async (tourId, tourData) => {
    const response = await api.put(`/${tourId}`, tourData);
    return response.data;
  },

  // Delete/archive tour
  deleteTour: async (tourId) => {
    const response = await api.delete(`/${tourId}`);
    return response.data;
  },

  // Update enrollment status
  updateEnrollmentStatus: async (tourId, userId, statusData) => {
    const response = await api.put(`/${tourId}/enrollments/${userId}`, statusData);
    return response.data;
  },

  // Add announcement to tour
  addAnnouncement: async (tourId, announcement) => {
    const response = await api.post(`/${tourId}/announcements`, announcement);
    return response.data;
  },
};

// Combined API object for easy import
const educationalToursApi = {
  public: publicToursApi,
  user: userToursApi,
  organizer: organizerToursApi,
};

export default educationalToursApi;

// Utility functions
export const tourUtils = {
  // Calculate progress percentage
  calculateProgress: (tour) => {
    const totalLessons = tour.curriculum?.length || 0;
    const completedLessons = tour.userEnrollment?.progress?.lessonsCompleted || 0;
    return totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  },

  // Get status color class
  getStatusColor: (status) => {
    switch (status) {
      case 'confirmed': return 'bg-heritage-moss text-white';
      case 'pending': return 'bg-heritage-amber text-white';
      case 'completed': return 'bg-heritage-terra text-white';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  },

  // Get difficulty color class
  getDifficultyColor: (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-heritage-sand text-heritage-dark';
      case 'Intermediate': return 'bg-heritage-amber text-white';
      case 'Advanced': return 'bg-heritage-terra text-white';
      default: return 'bg-gray-100 text-gray-800';
    }
  },

  // Format date for display
  formatDate: (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  // Check if tour is upcoming
  isUpcoming: (tour) => {
    return new Date(tour.startDate) > new Date();
  },

  // Check if tour is ongoing
  isOngoing: (tour) => {
    const now = new Date();
    return new Date(tour.startDate) <= now && new Date(tour.endDate) >= now;
  },

  // Check if tour is completed
  isCompleted: (tour) => {
    return new Date(tour.endDate) < new Date();
  },

  // Get available spots
  getAvailableSpots: (tour) => {
    const confirmedEnrollments = tour.enrollments?.filter(e => e.status === 'confirmed').length || 0;
    return tour.maxParticipants - confirmedEnrollments;
  },

  // Check enrollment eligibility
  canEnroll: (tour, user) => {
    if (!user) return { canEnroll: false, reason: 'Authentication required' };

    const existingEnrollment = tour.enrollments?.find(e =>
      e.userId === user.id && ['pending', 'confirmed'].includes(e.status)
    );

    if (existingEnrollment) return { canEnroll: false, reason: 'Already enrolled' };
    if (tourUtils.getAvailableSpots(tour) <= 0) return { canEnroll: false, reason: 'Tour is full' };
    if (!tourUtils.isUpcoming(tour)) return { canEnroll: false, reason: 'Enrollment closed' };
    if (tour.status !== 'published') return { canEnroll: false, reason: 'Tour not available' };

    return { canEnroll: true };
  },

  // Filter tours by category
  filterByCategory: (tours, category) => {
    if (!category || category === 'all') return tours;
    return tours.filter(tour => tour.category === category);
  },

  // Filter tours by difficulty
  filterByDifficulty: (tours, difficulty) => {
    if (!difficulty || difficulty === 'all') return tours;
    return tours.filter(tour => tour.difficulty === difficulty);
  },

  // Sort tours
  sortTours: (tours, sortBy = 'startDate', order = 'asc') => {
    return [...tours].sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      // Handle nested properties
      if (sortBy.includes('.')) {
        const keys = sortBy.split('.');
        aValue = keys.reduce((obj, key) => obj?.[key], a);
        bValue = keys.reduce((obj, key) => obj?.[key], b);
      }

      // Handle date strings
      if (sortBy.includes('Date')) {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (order === 'desc') {
        return bValue > aValue ? 1 : bValue < aValue ? -1 : 0;
      } else {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      }
    });
  },

  // Search tours by title or description
  searchTours: (tours, query) => {
    if (!query) return tours;
    const lowerQuery = query.toLowerCase();
    return tours.filter(tour =>
      tour.title.toLowerCase().includes(lowerQuery) ||
      tour.description?.toLowerCase().includes(lowerQuery) ||
      tour.shortDescription?.toLowerCase().includes(lowerQuery) ||
      tour.category.toLowerCase().includes(lowerQuery)
    );
  },
};

// Error handling utility
export const handleApiError = (error) => {
  console.error('API Error:', error);

  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    switch (status) {
      case 401:
        return 'Authentication required. Please log in.';
      case 403:
        return 'Access denied. You do not have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 422:
        return data.message || 'Invalid input data provided.';
      case 429:
        return 'Too many requests. Please try again later.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return data.message || 'An unexpected error occurred.';
    }
  } else if (error.request) {
    // Network error
    return 'Network error. Please check your connection and try again.';
  } else {
    // Other error
    return 'An unexpected error occurred.';
  }
};

// Request interceptor for adding common headers
export const addApiHeaders = (headers = {}) => {
  api.defaults.headers = { ...api.defaults.headers, ...headers };
};

// Set base URL dynamically (useful for different environments)
export const setApiBaseUrl = (baseUrl) => {
  api.defaults.baseURL = `${baseUrl}/api/educational-tours`;
};
