import axios from 'axios';
import { toast } from 'sonner';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const educationAPI = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
educationAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
educationAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

class EducationService {

  // ============ COURSES ============

  /**
   * Get all available courses
   */
  async getCourses(filters = {}) {
    try {
      console.log('🎓 Fetching courses with filters:', filters);

      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.difficulty) params.append('difficulty', filters.difficulty);
      if (filters.search) params.append('search', filters.search);
      if (filters.limit) params.append('limit', filters.limit);

      const response = await educationAPI.get(`/courses?${params}`);
      console.log('✅ Courses fetched:', response.data);

      return {
        success: true,
        courses: response.data.courses || response.data.data || [],
        total: response.data.total || 0,
        message: response.data.message
      };
    } catch (error) {
      console.error('❌ Error fetching courses:', error);
      return {
        success: false,
        courses: [],
        total: 0,
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * Get featured courses
   */
  async getFeaturedCourses() {
    try {
      console.log('🌟 Fetching featured courses...');
      const response = await educationAPI.get('/courses/featured');
      console.log('✅ Featured courses fetched:', response.data);

      return {
        success: true,
        courses: response.data.courses || response.data.data || [],
        message: response.data.message
      };
    } catch (error) {
      console.error('❌ Error fetching featured courses:', error);
      return {
        success: false,
        courses: [],
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * Get single course by ID
   */
  async getCourse(courseId) {
    try {
      console.log('📖 Fetching course:', courseId);
      const response = await educationAPI.get(`/courses/${courseId}`);
      console.log('✅ Course fetched:', response.data);

      return {
        success: true,
        course: response.data.course || response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('❌ Error fetching course:', error);
      return {
        success: false,
        course: null,
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * Get course categories
   */
  async getCategories() {
    try {
      console.log('📚 Fetching course categories...');
      const response = await educationAPI.get('/courses/categories');
      console.log('✅ Categories fetched:', response.data);

      return {
        success: true,
        categories: response.data.categories || response.data.data || [],
        message: response.data.message
      };
    } catch (error) {
      console.error('❌ Error fetching categories:', error);
      return {
        success: false,
        categories: [],
        error: error.response?.data?.message || error.message
      };
    }
  }

  // ============ ENROLLMENT ============

  /**
   * Enroll in a course
   */
  async enrollInCourse(courseId) {
    try {
      console.log('📝 Enrolling in course:', courseId);
      const response = await educationAPI.post(`/courses/${courseId}/enroll`);
      console.log('✅ Enrollment successful:', response.data);

      toast.success('Successfully enrolled in course!');
      return {
        success: true,
        enrollment: response.data.enrollment || response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('❌ Error enrolling in course:', error);
      const errorMsg = error.response?.data?.message || 'Failed to enroll in course';
      toast.error(errorMsg);
      return {
        success: false,
        enrollment: null,
        error: errorMsg
      };
    }
  }

  /**
   * Get user's enrolled courses
   */
  async getEnrolledCourses() {
    try {
      console.log('👤 Fetching user enrolled courses...');
      const response = await educationAPI.get('/user/courses/enrolled');
      console.log('✅ Enrolled courses fetched:', response.data);

      return {
        success: true,
        courses: response.data.courses || response.data.data || [],
        message: response.data.message
      };
    } catch (error) {
      console.error('❌ Error fetching enrolled courses:', error);
      return {
        success: false,
        courses: [],
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * Get user's completed courses
   */
  async getCompletedCourses() {
    try {
      console.log('🎓 Fetching completed courses...');
      const response = await educationAPI.get('/user/courses/completed');
      console.log('✅ Completed courses fetched:', response.data);

      return {
        success: true,
        courses: response.data.courses || response.data.data || [],
        message: response.data.message
      };
    } catch (error) {
      console.error('❌ Error fetching completed courses:', error);
      return {
        success: false,
        courses: [],
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * Update course progress
   */
  async updateProgress(courseId, progress) {
    try {
      console.log('📊 Updating course progress:', { courseId, progress });
      const response = await educationAPI.put(`/courses/${courseId}/progress`, { progress });
      console.log('✅ Progress updated:', response.data);

      return {
        success: true,
        progress: response.data.progress || response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('❌ Error updating progress:', error);
      return {
        success: false,
        progress: null,
        error: error.response?.data?.message || error.message
      };
    }
  }

  // ============ CERTIFICATES ============

  /**
   * Get user's certificates
   */
  async getCertificates() {
    try {
      console.log('🏆 Fetching user certificates...');
      const response = await educationAPI.get('/user/certificates');
      console.log('✅ Certificates fetched:', response.data);

      return {
        success: true,
        certificates: response.data.certificates || response.data.data || [],
        message: response.data.message
      };
    } catch (error) {
      console.error('❌ Error fetching certificates:', error);
      return {
        success: false,
        certificates: [],
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * Download certificate
   */
  async downloadCertificate(certificateId) {
    try {
      console.log('💾 Downloading certificate:', certificateId);
      const response = await educationAPI.get(`/certificates/${certificateId}/download`, {
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `certificate-${certificateId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Certificate downloaded successfully!');
      return { success: true };
    } catch (error) {
      console.error('❌ Error downloading certificate:', error);
      toast.error('Failed to download certificate');
      return { success: false, error: error.message };
    }
  }

  // ============ USER LEARNING DATA ============

  /**
   * Get user learning statistics for visitor dashboard
   */
  async getLearningStats() {
    try {
      console.log('📈 Fetching learning statistics...');
      const response = await educationAPI.get('/learning-stats');
      console.log('✅ Learning stats fetched:', response.data);

      return {
        success: true,
        stats: response.data.stats || {},
        message: response.data.message
      };
    } catch (error) {
      console.error('❌ Error fetching learning stats:', error);
      // Fallback to default stats structure for visitor dashboard
      return {
        success: true,
        stats: {
          coursesEnrolled: 0,
          coursesCompleted: 0,
          certificatesEarned: 0,
          totalStudyHours: 0,
          currentStreak: 0,
          longestStreak: 0,
          totalQuizzesTaken: 0,
          averageQuizScore: 0,
          flashcardsStudied: 0,
          gamesPlayed: 0,
          achievementsEarned: 0,
          favoriteCategory: 'heritage',
          recentActivities: [],
          progressOverview: {
            weeklyProgress: [],
            categoryProgress: {}
          },
          learningGoals: {
            dailyGoal: 30,
            weeklyGoal: 210,
            currentWeekProgress: 0
          }
        },
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * Get platform-wide statistics from visitor dashboard
   */
  async getPlatformStats() {
    try {
      console.log('🌍 Fetching platform statistics...');
      const response = await educationAPI.get('/platform/stats');
      console.log('✅ Platform stats fetched:', response.data);

      return {
        success: true,
        stats: response.data.stats || {},
        featured: response.data.featured || {},
        categories: response.data.categories || [],
        testimonials: response.data.testimonials || [],
        quickActions: response.data.quickActions || [],
        upcoming: response.data.upcoming || {},
        message: response.data.message
      };
    } catch (error) {
      console.error('❌ Error fetching platform stats:', error);
      return {
        success: false,
        stats: {},
        featured: {},
        categories: [],
        testimonials: [],
        quickActions: [],
        upcoming: {},
        error: error.response?.data?.message || error.message
      };
    }
  }

  // ============ STUDY GUIDES ============

  /**
   * Get study guides
   */
  async getStudyGuides() {
    try {
      console.log('📚 Fetching study guides...');
      const response = await educationAPI.get('/study-guides');
      console.log('✅ Study guides fetched:', response.data);

      return {
        success: true,
        guides: response.data.guides || response.data.data || [],
        message: response.data.message
      };
    } catch (error) {
      console.error('❌ Error fetching study guides:', error);
      return {
        success: false,
        guides: [],
        error: error.response?.data?.message || error.message
      };
    }
  }

  // ============ EDUCATIONAL TOURS ============

  /**
   * Get educational tours
   */
  async getEducationalTours() {
    try {
      console.log('🗺️ Fetching educational tours...');
      const response = await educationAPI.get('/tours/educational');
      console.log('✅ Educational tours fetched:', response.data);

      return {
        success: true,
        tours: response.data.tours || response.data.data || [],
        message: response.data.message
      };
    } catch (error) {
      console.error('❌ Error fetching educational tours:', error);
      return {
        success: false,
        tours: [],
        error: error.response?.data?.message || error.message
      };
    }
  }
}

// Create and export singleton instance
const educationService = new EducationService();
export default educationService;
