// Educational Tours API Service
// Frontend service to interact with educational tours backend endpoints

const API_BASE_URL = 'http://localhost:5001/api';

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

// Public Educational Tours API (for homepage and general browsing)
export const publicEducationalToursApi = {
  // Get all published educational tours
  getAllTours: async (filters = {}) => {
    const queryParams = new URLSearchParams({
      status: 'published',
      ...filters
    });

    const response = await fetch(`${API_BASE_URL}/educational-tours?${queryParams}`);
    return handleResponse(response);
  },

  // Get featured tours for homepage
  getFeaturedTours: async (limit = 3) => {
    const response = await fetch(`${API_BASE_URL}/educational-tours/featured?limit=${limit}`);
    return handleResponse(response);
  },

  // Get tour by ID
  getTour: async (tourId) => {
    const response = await fetch(`${API_BASE_URL}/educational-tours/${tourId}`);
    return handleResponse(response);
  },

  // Search tours
  searchTours: async (query, filters = {}) => {
    const queryParams = new URLSearchParams({
      search: query,
      status: 'published',
      ...filters
    });

    const response = await fetch(`${API_BASE_URL}/educational-tours/search?${queryParams}`);
    return handleResponse(response);
  },

  // Enroll in tour (requires authentication)
  enrollInTour: async (tourId, enrollmentData) => {
    const response = await fetch(`${API_BASE_URL}/educational-tours/${tourId}/enroll`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(enrollmentData)
    });
    return handleResponse(response);
  },

  // Get tour categories
  getCategories: async () => {
    const response = await fetch(`${API_BASE_URL}/educational-tours/categories`);
    return handleResponse(response);
  }
};

// Organizer Educational Tours API (for organizer dashboard CRUD operations)
export const organizerEducationalToursApi = {
  // Get organizer's dashboard data
  getDashboardData: async () => {
    const response = await fetch(`${API_BASE_URL}/organizer/education/dashboard`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Get all tours for organizer
  getTours: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters);
    const response = await fetch(`${API_BASE_URL}/organizer/education/tours?${queryParams}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Get single tour for organizer
  getTour: async (tourId) => {
    const response = await fetch(`${API_BASE_URL}/organizer/education/tours/${tourId}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Create new tour
  createTour: async (tourData) => {
    const response = await fetch(`${API_BASE_URL}/organizer/education/tours`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(tourData)
    });
    return handleResponse(response);
  },

  // Update tour
  updateTour: async (tourId, tourData) => {
    const response = await fetch(`${API_BASE_URL}/organizer/education/tours/${tourId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(tourData)
    });
    return handleResponse(response);
  },

  // Delete tour
  deleteTour: async (tourId) => {
    const response = await fetch(`${API_BASE_URL}/organizer/education/tours/${tourId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Submit tour for approval
  submitForApproval: async (tourId) => {
    const response = await fetch(`${API_BASE_URL}/organizer/education/tours/${tourId}/submit-approval`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Get tour enrollments
  getTourEnrollments: async (tourId) => {
    const response = await fetch(`${API_BASE_URL}/organizer/education/tours/${tourId}/enrollments`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Update enrollment status
  updateEnrollmentStatus: async (tourId, userId, statusData) => {
    const response = await fetch(`${API_BASE_URL}/organizer/education/tours/${tourId}/enrollments/${userId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(statusData)
    });
    return handleResponse(response);
  }
};

// Course Management API (part of education system)
export const organizerCoursesApi = {
  // Get all courses for organizer
  getCourses: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters);
    const response = await fetch(`${API_BASE_URL}/organizer/education/courses?${queryParams}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Get single course for organizer
  getCourse: async (courseId) => {
    const response = await fetch(`${API_BASE_URL}/organizer/education/courses/${courseId}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Create new course
  createCourse: async (courseData) => {
    const response = await fetch(`${API_BASE_URL}/organizer/education/courses`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(courseData)
    });
    return handleResponse(response);
  },

  // Update course
  updateCourse: async (courseId, courseData) => {
    const response = await fetch(`${API_BASE_URL}/organizer/education/courses/${courseId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(courseData)
    });
    return handleResponse(response);
  },

  // Delete course
  deleteCourse: async (courseId) => {
    const response = await fetch(`${API_BASE_URL}/organizer/education/courses/${courseId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Submit course for approval
  submitForApproval: async (courseId) => {
    const response = await fetch(`${API_BASE_URL}/organizer/education/courses/${courseId}/submit-approval`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};

export default {
  public: publicEducationalToursApi,
  organizer: {
    tours: organizerEducationalToursApi,
    courses: organizerCoursesApi
  }
};
