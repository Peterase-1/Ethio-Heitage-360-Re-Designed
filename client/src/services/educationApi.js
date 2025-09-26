import api from '../utils/api';

export const educationApi = {
  // ===== COURSES =====
  
  /**
   * Get courses with filtering and pagination
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Response with courses and pagination
   */
  async getCourses(params = {}) {
    try {
      const query = new URLSearchParams(params).toString();
      const response = await api.request(`/education-hub/courses${query ? `?${query}` : ''}`);
      return response;
    } catch (error) {
      console.error('Get courses error:', error);
      throw error;
    }
  },

  /**
   * Get single course by ID
   * @param {string} courseId - Course ID
   * @returns {Promise<Object>} Course data
   */
  async getCourse(courseId) {
    try {
      const response = await api.request(`/education-hub/courses/${courseId}`);
      return response;
    } catch (error) {
      console.error('Get course error:', error);
      throw error;
    }
  },

  /**
   * Enroll in a course
   * @param {string} courseId - Course ID
   * @returns {Promise<Object>} Enrollment result
   */
  async enrollInCourse(courseId) {
    try {
      const response = await api.request(`/education-hub/courses/${courseId}/enroll`, {
        method: 'POST'
      });
      return response;
    } catch (error) {
      console.error('Enroll in course error:', error);
      throw error;
    }
  },

  /**
   * Get user's enrolled courses
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} User's enrollments
   */
  async getMyEnrollments(params = {}) {
    try {
      const query = new URLSearchParams(params).toString();
      const response = await api.request(`/education-hub/my-enrollments${query ? `?${query}` : ''}`);
      return response;
    } catch (error) {
      console.error('Get my enrollments error:', error);
      throw error;
    }
  },

  // ===== QUIZZES =====

  /**
   * Get available quizzes
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Quizzes list
   */
  async getQuizzes(params = {}) {
    try {
      const query = new URLSearchParams(params).toString();
      const response = await api.request(`/education-hub/quizzes${query ? `?${query}` : ''}`);
      return response;
    } catch (error) {
      console.error('Get quizzes error:', error);
      throw error;
    }
  },

  /**
   * Get single quiz
   * @param {string} quizId - Quiz ID
   * @returns {Promise<Object>} Quiz data
   */
  async getQuiz(quizId) {
    try {
      const response = await api.request(`/education-hub/quizzes/${quizId}`);
      return response;
    } catch (error) {
      console.error('Get quiz error:', error);
      throw error;
    }
  },

  /**
   * Start a quiz attempt
   * @param {string} quizId - Quiz ID
   * @returns {Promise<Object>} Quiz attempt data
   */
  async startQuizAttempt(quizId) {
    try {
      const response = await api.request(`/education-hub/quizzes/${quizId}/attempt`, {
        method: 'POST'
      });
      return response;
    } catch (error) {
      console.error('Start quiz attempt error:', error);
      throw error;
    }
  },

  /**
   * Submit quiz answers
   * @param {string} attemptId - Quiz attempt ID
   * @param {Array} answers - User's answers
   * @returns {Promise<Object>} Quiz results
   */
  async submitQuizAttempt(attemptId, answers) {
    try {
      const response = await api.request(`/education-hub/quiz-attempts/${attemptId}/submit`, {
        method: 'POST',
        body: { answers }
      });
      return response;
    } catch (error) {
      console.error('Submit quiz attempt error:', error);
      throw error;
    }
  },

  // ===== FLASHCARDS =====

  /**
   * Get flashcards
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Flashcards list
   */
  async getFlashcards(params = {}) {
    try {
      const query = new URLSearchParams(params).toString();
      const response = await api.request(`/education-hub/flashcards${query ? `?${query}` : ''}`);
      return response;
    } catch (error) {
      console.error('Get flashcards error:', error);
      throw error;
    }
  },

  // ===== LIVE SESSIONS =====

  /**
   * Get live sessions
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Live sessions list
   */
  async getLiveSessions(params = {}) {
    try {
      const query = new URLSearchParams(params).toString();
      const response = await api.request(`/education-hub/live-sessions${query ? `?${query}` : ''}`);
      return response;
    } catch (error) {
      console.error('Get live sessions error:', error);
      throw error;
    }
  },

  /**
   * Register for live session
   * @param {string} sessionId - Session ID
   * @returns {Promise<Object>} Registration result
   */
  async registerForLiveSession(sessionId) {
    try {
      const response = await api.request(`/education-hub/live-sessions/${sessionId}/register`, {
        method: 'POST'
      });
      return response;
    } catch (error) {
      console.error('Register for live session error:', error);
      throw error;
    }
  },

  // ===== STUDY GUIDES =====

  /**
   * Get study guides
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Study guides list
   */
  async getStudyGuides(params = {}) {
    try {
      const query = new URLSearchParams(params).toString();
      const response = await api.request(`/education-hub/study-guides${query ? `?${query}` : ''}`);
      return response;
    } catch (error) {
      console.error('Get study guides error:', error);
      throw error;
    }
  },

  /**
   * Download study guide
   * @param {string} guideId - Study guide ID
   * @returns {Promise<Blob>} File blob
   */
  async downloadStudyGuide(guideId) {
    try {
      // This would typically return a blob for file download
      const response = await api.request(`/education-hub/study-guides/${guideId}/download`, {
        method: 'GET',
        responseType: 'blob'
      });
      return response;
    } catch (error) {
      console.error('Download study guide error:', error);
      throw error;
    }
  },

  // ===== CERTIFICATES =====

  /**
   * Get user's certificates
   * @returns {Promise<Object>} Certificates list
   */
  async getMyCertificates() {
    try {
      const response = await api.request('/education-hub/certificates');
      return response;
    } catch (error) {
      console.error('Get my certificates error:', error);
      throw error;
    }
  },

  /**
   * Download certificate
   * @param {string} certificateId - Certificate ID
   * @returns {Promise<Blob>} Certificate file blob
   */
  async downloadCertificate(certificateId) {
    try {
      const response = await api.request(`/education-hub/certificates/${certificateId}/download`, {
        method: 'GET',
        responseType: 'blob'
      });
      return response;
    } catch (error) {
      console.error('Download certificate error:', error);
      throw error;
    }
  },

  /**
   * Verify certificate
   * @param {string} verificationCode - Certificate verification code
   * @returns {Promise<Object>} Certificate verification result
   */
  async verifyCertificate(verificationCode) {
    try {
      const response = await api.request(`/education-hub/certificates/verify/${verificationCode}`);
      return response;
    } catch (error) {
      console.error('Verify certificate error:', error);
      throw error;
    }
  },

  // ===== PROGRESS & ANALYTICS =====

  /**
   * Get learning progress
   * @returns {Promise<Object>} Learning progress data
   */
  async getLearningProgress() {
    try {
      const response = await api.request('/education-hub/progress');
      return response;
    } catch (error) {
      console.error('Get learning progress error:', error);
      throw error;
    }
  },

  /**
   * Update lesson progress
   * @param {string} courseId - Course ID
   * @param {string} lessonId - Lesson ID
   * @param {Object} progressData - Progress data
   * @returns {Promise<Object>} Update result
   */
  async updateLessonProgress(courseId, lessonId, progressData) {
    try {
      const response = await api.request(`/education-hub/courses/${courseId}/lessons/${lessonId}/progress`, {
        method: 'PUT',
        body: progressData
      });
      return response;
    } catch (error) {
      console.error('Update lesson progress error:', error);
      throw error;
    }
  },

  /**
   * Get course analytics
   * @param {string} courseId - Course ID
   * @returns {Promise<Object>} Course analytics
   */
  async getCourseAnalytics(courseId) {
    try {
      const response = await api.request(`/education-hub/courses/${courseId}/analytics`);
      return response;
    } catch (error) {
      console.error('Get course analytics error:', error);
      throw error;
    }
  },

  // ===== EDUCATIONAL TOURS =====

  /**
   * Get educational tours
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Educational tours list
   */
  async getEducationalTours(params = {}) {
    try {
      const query = new URLSearchParams(params).toString();
      const response = await api.request(`/educational-tours${query ? `?${query}` : ''}`);
      return response;
    } catch (error) {
      console.error('Get educational tours error:', error);
      throw error;
    }
  },

  /**
   * Get single educational tour
   * @param {string} tourId - Tour ID
   * @returns {Promise<Object>} Tour data
   */
  async getEducationalTour(tourId) {
    try {
      const response = await api.request(`/educational-tours/${tourId}`);
      return response;
    } catch (error) {
      console.error('Get educational tour error:', error);
      throw error;
    }
  },

  /**
   * Enroll in educational tour
   * @param {string} tourId - Tour ID
   * @returns {Promise<Object>} Enrollment result
   */
  async enrollInEducationalTour(tourId) {
    try {
      const response = await api.request(`/educational-tours/${tourId}/enroll`, {
        method: 'POST'
      });
      return response;
    } catch (error) {
      console.error('Enroll in educational tour error:', error);
      throw error;
    }
  }
};

export default educationApi;
