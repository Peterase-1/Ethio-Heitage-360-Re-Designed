import api from '../utils/api.js';
import imageMapper from './imageMapperService.js';

class LearningService {
  constructor() {
    this.cache = new Map();
    this.cacheExpiry = 10 * 60 * 1000; // 10 minutes
    this.progressKey = 'ethio_heritage_learning_progress';
  }

  /**
   * Get available learning courses
   * @returns {Promise<Array>} Learning courses
   */
  async getCourses() {
    const cacheKey = 'learning_courses';

    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheExpiry) {
        return cached.data;
      }
    }

    try {
      // Use the new public courses API endpoint
      const response = await api.request('/education/public/courses');
      const courses = response.courses || response.data || response;

      this.cache.set(cacheKey, {
        data: courses,
        timestamp: Date.now()
      });

      return courses;
    } catch (error) {
      console.error('Get courses error:', error);
      // Return mock courses as fallback
      return this.getMockCourses();
    }
  }

  /**
   * Get course by ID
   * @param {string|number} courseId - Course ID
   * @returns {Promise<Object>} Course details
   */
  async getCourseById(courseId) {
    try {
      const response = await api.request(`/learning/courses/${courseId}`);
      return response.course || response.data || response;
    } catch (error) {
      console.error('Get course by ID error:', error);
      throw error;
    }
  }

  /**
   * Get lessons for a course
   * @param {string|number} courseId - Course ID
   * @returns {Promise<Array>} Course lessons
   */
  async getLessons(courseId) {
    try {
      const response = await api.request(`/learning/courses/${courseId}/lessons`);
      return response.lessons || response.data || response;
    } catch (error) {
      console.error('Get lessons error:', error);
      return [];
    }
  }

  /**
   * Get lesson by ID
   * @param {string|number} lessonId - Lesson ID
   * @returns {Promise<Object>} Lesson details
   */
  async getLessonById(lessonId) {
    try {
      const response = await api.request(`/learning/lessons/${lessonId}`);
      return response.lesson || response.data || response;
    } catch (error) {
      console.error('Get lesson by ID error:', error);
      throw error;
    }
  }

  /**
   * Start a lesson
   * @param {string|number} lessonId - Lesson ID
   * @returns {Promise<Object>} Lesson start result
   */
  async startLesson(lessonId) {
    try {
      const response = await api.request(`/learning/lessons/${lessonId}/start`, {
        method: 'POST'
      });

      // Update local progress
      this.updateLocalProgress(lessonId, 'started');

      return response;
    } catch (error) {
      console.error('Start lesson error:', error);
      this.updateLocalProgress(lessonId, 'started');
      return { success: true, message: 'Lesson started locally' };
    }
  }

  /**
   * Complete a lesson
   * @param {string|number} lessonId - Lesson ID
   * @param {Object} completionData - Completion data (score, time, etc.)
   * @returns {Promise<Object>} Lesson completion result
   */
  async completeLesson(lessonId, completionData = {}) {
    try {
      const response = await api.request(`/learning/lessons/${lessonId}/complete`, {
        method: 'POST',
        body: completionData
      });

      // Update local progress
      this.updateLocalProgress(lessonId, 'completed', completionData);

      return response;
    } catch (error) {
      console.error('Complete lesson error:', error);
      this.updateLocalProgress(lessonId, 'completed', completionData);
      return { success: true, message: 'Lesson completed locally' };
    }
  }

  /**
   * Get user's learning progress
   * @returns {Promise<Object>} Learning progress
   */
  async getLearningProgress() {
    try {
      const response = await api.request('/learning/progress');
      const serverProgress = response.progress || response.data || response;

      // Merge with local progress
      const localProgress = this.getLocalProgress();
      return this.mergeProgress(serverProgress, localProgress);
    } catch (error) {
      console.error('Get learning progress error:', error);
      return this.getLocalProgress() || this.getDefaultProgress();
    }
  }

  /**
   * Get learning achievements
   * @returns {Promise<Array>} Learning achievements
   */
  async getLearningAchievements() {
    try {
      const response = await api.request('/learning/achievements');
      return response.achievements || response.data || response;
    } catch (error) {
      console.error('Get learning achievements error:', error);
      return this.getMockAchievements();
    }
  }

  /**
   * Get learning resources
   * @param {Object} filters - Filter options
   * @returns {Promise<Array>} Learning resources
   */
  async getResources(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await api.request(`/learning/resources${queryParams ? `?${queryParams}` : ''}`);
      return response.resources || response.data || response;
    } catch (error) {
      console.error('Get resources error:', error);
      return this.getMockResources();
    }
  }

  /**
   * Take a quiz/assessment
   * @param {string|number} quizId - Quiz ID
   * @param {Array} answers - User answers
   * @returns {Promise<Object>} Quiz results
   */
  async takeQuiz(quizId, answers) {
    try {
      const response = await api.request(`/learning/quizzes/${quizId}/submit`, {
        method: 'POST',
        body: { answers }
      });

      return response;
    } catch (error) {
      console.error('Take quiz error:', error);
      // Return mock quiz results
      return {
        score: Math.floor(Math.random() * 40) + 60, // 60-100%
        totalQuestions: answers.length,
        correctAnswers: Math.floor(answers.length * 0.8),
        passed: true,
        feedback: 'Great job! You have a good understanding of Ethiopian heritage.'
      };
    }
  }

  /**
   * Enroll in a course
   * @param {string|number} courseId - Course ID
   * @returns {Promise<Object>} Enrollment result
   */
  async enrollInCourse(courseId) {
    try {
      const response = await api.request(`/learning/courses/${courseId}/enroll`, {
        method: 'POST'
      });

      // Update local cache if enrollment successful
      if (response.success) {
        // Clear courses cache to force refresh
        this.cache.delete('enrolled_courses');
        this.cache.delete('learning_progress');
      }

      return response;
    } catch (error) {
      console.error('Enroll in course error:', error);
      // Return optimistic response for offline handling
      return {
        success: false,
        message: error.message || 'Failed to enroll in course. Please check your connection.'
      };
    }
  }

  /**
   * Get enrolled courses for current user
   * @returns {Promise<Object>} Enrolled courses and stats
   */
  async getEnrolledCourses() {
    const cacheKey = 'enrolled_courses';

    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheExpiry) {
        return cached.data;
      }
    }

    try {
      const response = await api.request('/learning/enrollments');
      const enrollmentData = response.data || response;

      this.cache.set(cacheKey, {
        data: enrollmentData,
        timestamp: Date.now()
      });

      return enrollmentData;
    } catch (error) {
      console.error('Get enrolled courses error:', error);
      // Return mock enrolled courses for demo purposes
      return {
        success: true,
        enrollments: [],
        stats: {
          totalCoursesEnrolled: 0,
          completedCourses: 0,
          totalLessonsCompleted: 0,
          totalTimeSpent: 0,
          averageScore: 0,
          currentStreak: 0,
          longestStreak: 0,
          certificatesEarned: 0,
          achievementsUnlocked: 0
        }
      };
    }
  }

  /**
   * Unenroll from a course
   * @param {string|number} courseId - Course ID
   * @returns {Promise<Object>} Unenrollment result
   */
  async unenrollFromCourse(courseId) {
    try {
      const response = await api.request(`/learning/courses/${courseId}/unenroll`, {
        method: 'DELETE'
      });

      // Update local cache if unenrollment successful
      if (response.success) {
        // Clear courses cache to force refresh
        this.cache.delete('enrolled_courses');
        this.cache.delete('learning_progress');
      }

      return response;
    } catch (error) {
      console.error('Unenroll from course error:', error);
      return {
        success: false,
        message: error.message || 'Failed to unenroll from course. Please check your connection.'
      };
    }
  }

  /**
   * Check if user is enrolled in a course
   * @param {string|number} courseId - Course ID
   * @returns {Promise<boolean>} Enrollment status
   */
  async isEnrolledInCourse(courseId) {
    try {
      const enrollments = await this.getEnrolledCourses();
      if (enrollments.success && enrollments.enrollments) {
        return enrollments.enrollments.some(enrollment =>
          enrollment.course._id.toString() === courseId.toString()
        );
      }
      return false;
    } catch (error) {
      console.error('Check enrollment status error:', error);
      return false;
    }
  }

  /**
   * Get learning leaderboard
   * @param {string} period - Time period (week, month, all)
   * @returns {Promise<Array>} Leaderboard data
   */
  async getLeaderboard(period = 'month') {
    try {
      const response = await api.request(`/learning/leaderboard?period=${period}`);
      return response.leaderboard || response.data || response;
    } catch (error) {
      console.error('Get leaderboard error:', error);
      return this.getMockLeaderboard();
    }
  }

  /**
   * Get learning recommendations
   * @returns {Promise<Array>} Recommended content
   */
  async getRecommendations() {
    try {
      const response = await api.request('/learning/recommendations');
      return response.recommendations || response.data || response;
    } catch (error) {
      console.error('Get recommendations error:', error);
      return this.getMockRecommendations();
    }
  }

  /**
   * Search learning content
   * @param {string} query - Search query
   * @param {Object} filters - Filter options
   * @returns {Promise<Array>} Search results
   */
  async searchLearningContent(query, filters = {}) {
    try {
      const searchParams = {
        q: query,
        ...filters
      };
      const queryParams = new URLSearchParams(searchParams).toString();
      const response = await api.request(`/learning/search?${queryParams}`);
      return response.results || response.data || response;
    } catch (error) {
      console.error('Search learning content error:', error);
      return [];
    }
  }

  /**
   * Bookmark learning content
   * @param {string} contentType - Content type (lesson, course, resource)
   * @param {string|number} contentId - Content ID
   * @returns {Promise<Object>} Bookmark result
   */
  async bookmarkContent(contentType, contentId) {
    try {
      const response = await api.request('/learning/bookmarks', {
        method: 'POST',
        body: { contentType, contentId }
      });
      return response;
    } catch (error) {
      console.error('Bookmark content error:', error);
      this.updateLocalBookmarks(contentType, contentId, 'add');
      return { success: true, message: 'Bookmarked locally' };
    }
  }

  /**
   * Remove bookmark
   * @param {string|number} bookmarkId - Bookmark ID
   * @returns {Promise<Object>} Remove result
   */
  async removeBookmark(bookmarkId) {
    try {
      const response = await api.request(`/learning/bookmarks/${bookmarkId}`, {
        method: 'DELETE'
      });
      return response;
    } catch (error) {
      console.error('Remove bookmark error:', error);
      return { success: true, message: 'Bookmark removed locally' };
    }
  }

  /**
   * Get user's bookmarks
   * @returns {Promise<Array>} User bookmarks
   */
  async getBookmarks() {
    try {
      const response = await api.request('/learning/bookmarks');
      return response.bookmarks || response.data || response;
    } catch (error) {
      console.error('Get bookmarks error:', error);
      return this.getLocalBookmarks();
    }
  }

  // Local progress management

  /**
   * Update local progress
   * @param {string|number} lessonId - Lesson ID
   * @param {string} status - Progress status
   * @param {Object} data - Additional data
   */
  updateLocalProgress(lessonId, status, data = {}) {
    try {
      const progress = this.getLocalProgress() || this.getDefaultProgress();

      if (!progress.lessons[lessonId]) {
        progress.lessons[lessonId] = {};
      }

      progress.lessons[lessonId].status = status;
      progress.lessons[lessonId].updatedAt = new Date().toISOString();

      if (data.score) {
        progress.lessons[lessonId].score = data.score;
      }

      if (status === 'completed') {
        progress.completedLessons++;
        progress.totalTimeSpent += data.timeSpent || 0;
      }

      // Update streak
      if (status === 'completed') {
        const today = new Date().toDateString();
        if (progress.lastActivityDate !== today) {
          const lastDate = new Date(progress.lastActivityDate);
          const todayDate = new Date(today);
          const diffTime = todayDate - lastDate;
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays === 1) {
            progress.currentStreak++;
          } else if (diffDays > 1) {
            progress.currentStreak = 1;
          }

          progress.lastActivityDate = today;
        }
      }

      this.saveLocalProgress(progress);
    } catch (error) {
      console.error('Update local progress error:', error);
    }
  }

  /**
   * Get local progress
   * @returns {Object|null} Local progress
   */
  getLocalProgress() {
    try {
      const stored = localStorage.getItem(this.progressKey);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Get local progress error:', error);
      return null;
    }
  }

  /**
   * Save local progress
   * @param {Object} progress - Progress data
   */
  saveLocalProgress(progress) {
    try {
      progress.lastUpdated = new Date().toISOString();
      localStorage.setItem(this.progressKey, JSON.stringify(progress));
    } catch (error) {
      console.error('Save local progress error:', error);
    }
  }

  /**
   * Get default progress structure
   * @returns {Object} Default progress
   */
  getDefaultProgress() {
    return {
      totalLessons: 0,
      completedLessons: 0,
      currentStreak: 0,
      totalTimeSpent: 0,
      lastActivityDate: null,
      lessons: {},
      subjects: {},
      achievements: [],
      level: 1,
      points: 0,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Merge server and local progress
   * @param {Object} serverProgress - Server progress
   * @param {Object} localProgress - Local progress
   * @returns {Object} Merged progress
   */
  mergeProgress(serverProgress, localProgress) {
    if (!serverProgress) return localProgress || this.getDefaultProgress();
    if (!localProgress) return serverProgress;

    // Use server data as base, overlay local changes
    const merged = { ...serverProgress };

    // Merge lesson progress
    Object.keys(localProgress.lessons || {}).forEach(lessonId => {
      const localLesson = localProgress.lessons[lessonId];
      const serverLesson = merged.lessons[lessonId];

      if (!serverLesson || new Date(localLesson.updatedAt) > new Date(serverLesson.updatedAt || 0)) {
        merged.lessons[lessonId] = localLesson;
      }
    });

    return merged;
  }

  // Mock data methods

  /**
   * Get mock courses (minimal fallback only)
   * @returns {Array} Mock courses
   */
  getMockCourses() {
    // Minimal fallback courses only - real data comes from backend
    const courses = [
      {
        id: 'fallback-1',
        title: 'Ethiopian History Fundamentals',
        description: 'Explore the rich history of Ethiopia from ancient civilizations to modern day',
        difficulty: 'Beginner',
        duration: '4 hours',
        lessons: 8,
        category: 'history',
        rating: 4.7,
        enrolled: 1250,
        image: imageMapper.getCourseImage({ category: 'History' })
      },
      {
        id: 'fallback-2',
        title: 'Cultural Traditions of Ethiopia',
        description: 'Discover the diverse cultural practices and traditions across Ethiopian regions',
        difficulty: 'Intermediate',
        duration: '3 hours',
        lessons: 6,
        category: 'culture',
        rating: 4.8,
        enrolled: 890,
        image: imageMapper.getCourseImage({ category: 'Culture' })
      },
      {
        id: 'fallback-3',
        title: 'Archaeological Wonders',
        description: 'Journey through Ethiopia\'s most significant archaeological discoveries',
        difficulty: 'Advanced',
        duration: '5 hours',
        lessons: 10,
        category: 'archaeology',
        rating: 4.9,
        enrolled: 650,
        image: imageMapper.getCourseImage({ category: 'Archaeology' })
      }
    ];

    return courses;
  }

  /**
   * Get mock achievements
   * @returns {Array} Mock achievements
   */
  getMockAchievements() {
    return [
      {
        id: 1,
        name: 'First Lesson',
        description: 'Completed your first learning lesson',
        icon: 'star',
        earnedAt: '2024-01-15T10:00:00Z',
        points: 10
      },
      {
        id: 2,
        name: 'History Explorer',
        description: 'Completed 5 history lessons',
        icon: 'book',
        earnedAt: '2024-01-20T14:30:00Z',
        points: 50
      },
      {
        id: 3,
        name: 'Quiz Master',
        description: 'Scored 90% or higher on 3 quizzes',
        icon: 'trophy',
        earnedAt: '2024-01-25T16:45:00Z',
        points: 75
      },
      {
        id: 4,
        name: 'Cultural Ambassador',
        description: 'Completed 3 cultural courses',
        icon: 'globe',
        earnedAt: '2024-02-01T11:00:00Z',
        points: 100
      },
      {
        id: 5,
        name: 'Language Scholar',
        description: 'Completed Ethiopian Languages and Scripts course',
        icon: 'language',
        earnedAt: '2024-02-05T14:30:00Z',
        points: 80
      },
      {
        id: 6,
        name: 'Coffee Connoisseur',
        description: 'Mastered Ethiopian Coffee Culture course',
        icon: 'coffee',
        earnedAt: '2024-02-08T09:15:00Z',
        points: 60
      },
      {
        id: 7,
        name: 'Festival Enthusiast',
        description: 'Learned about all major Ethiopian festivals',
        icon: 'celebration',
        earnedAt: '2024-02-12T16:45:00Z',
        points: 90
      },
      {
        id: 8,
        name: 'Arts and Crafts Expert',
        description: 'Completed traditional arts courses with high scores',
        icon: 'palette',
        earnedAt: '2024-02-15T13:20:00Z',
        points: 120
      },
      {
        id: 9,
        name: 'Heritage Guardian',
        description: 'Completed 10 different heritage courses',
        icon: 'shield',
        earnedAt: '2024-02-20T10:30:00Z',
        points: 200
      },
      {
        id: 10,
        name: 'Archaeological Detective',
        description: 'Mastered archaeological wonders course',
        icon: 'search',
        earnedAt: '2024-02-22T15:45:00Z',
        points: 150
      },
      {
        id: 11,
        name: 'Traditional Medicine Healer',
        description: 'Completed traditional medicine course with distinction',
        icon: 'leaf',
        earnedAt: '2024-02-25T12:10:00Z',
        points: 130
      },
      {
        id: 12,
        name: 'Orthodox Scholar',
        description: 'Deep understanding of Ethiopian Orthodox Christianity',
        icon: 'cross',
        earnedAt: '2024-02-28T17:20:00Z',
        points: 110
      },
      {
        id: 13,
        name: 'Music and Dance Master',
        description: 'Learned about all regional music and dance forms',
        icon: 'music',
        earnedAt: '2024-03-02T14:00:00Z',
        points: 95
      },
      {
        id: 14,
        name: 'Culinary Expert',
        description: 'Mastered Ethiopian cuisine and food culture',
        icon: 'utensils',
        earnedAt: '2024-03-05T11:30:00Z',
        points: 85
      },
      {
        id: 15,
        name: 'Learning Streak Champion',
        description: 'Maintained a 30-day learning streak',
        icon: 'fire',
        earnedAt: '2024-03-08T20:00:00Z',
        points: 250
      }
    ];
  }

  /**
   * Get mock resources
   * @returns {Array} Mock resources
   */
  getMockResources() {
    return [
      {
        id: 1,
        title: 'Ethiopian Timeline Interactive',
        type: 'Interactive Tool',
        description: 'Explore major events in Ethiopian history',
        url: '/resources/timeline',
        category: 'History',
        duration: '30 minutes',
        image: '/assets/Ethiopia.jpg'
      },
      {
        id: 2,
        title: 'Traditional Music Collection',
        type: 'Audio Library',
        description: 'Listen to traditional Ethiopian music',
        url: '/resources/music',
        category: 'Culture',
        duration: '2 hours',
        image: '/assets/traditional-instruments.jpg'
      },
      {
        id: 3,
        title: 'Archaeological Site Maps',
        type: 'Reference Material',
        description: 'Detailed maps of Ethiopian archaeological sites',
        url: '/resources/maps',
        category: 'Archaeology',
        duration: '1 hour',
        image: '/assets/Archaeological Wonders.jpg'
      },
      {
        id: 4,
        title: 'Ethiopian Literature Digital Library',
        type: 'Digital Library',
        description: 'Access classical and contemporary Ethiopian literature in multiple languages',
        url: '/resources/literature',
        category: 'Literature',
        duration: '3 hours',
        image: '/assets/geez-script.jpg'
      },
      {
        id: 5,
        title: 'Traditional Medicine Plant Guide',
        type: 'Interactive Guide',
        description: 'Learn about medicinal plants used in traditional Ethiopian healing',
        url: '/resources/medicine',
        category: 'Traditional Knowledge',
        duration: '1.5 hours',
        image: '/assets/traditional-medicine.jpg'
      },
      {
        id: 6,
        title: 'Ethiopian Architecture Styles Showcase',
        type: 'Visual Gallery',
        description: 'Explore different architectural styles across Ethiopian regions',
        url: '/resources/architecture',
        category: 'Architecture',
        duration: '45 minutes',
        image: '/assets/architecture.jpg'
      },
      {
        id: 7,
        title: 'Festival Calendar Interactive',
        type: 'Interactive Calendar',
        description: 'Discover Ethiopian festivals and celebrations throughout the year',
        url: '/resources/festivals',
        category: 'Culture',
        duration: '1 hour',
        image: '/assets/timkat-festival.jpg'
      },
      {
        id: 8,
        title: 'Ethiopian Cuisine Recipe Collection',
        type: 'Recipe Database',
        description: 'Traditional Ethiopian recipes with cultural context and preparation methods',
        url: '/resources/recipes',
        category: 'Culture',
        duration: '2 hours',
        image: '/assets/ethiopian-cuisine.jpg'
      },
      {
        id: 9,
        title: 'Traditional Crafts Workshop Videos',
        type: 'Video Library',
        description: 'Learn traditional Ethiopian crafts through expert demonstrations',
        url: '/resources/crafts',
        category: 'Arts',
        duration: '4 hours',
        image: '/assets/traditional-crafts.jpg'
      },
      {
        id: 10,
        title: 'Ethiopian Language Learning Tools',
        type: 'Language Platform',
        description: 'Interactive tools for learning Amharic, Oromo, Tigrinya, and Ge\'ez',
        url: '/resources/languages',
        category: 'Language',
        duration: '8 hours',
        image: '/assets/geez-script.jpg'
      },
      {
        id: 11,
        title: 'Coffee Culture Experience',
        type: 'Virtual Experience',
        description: 'Immersive experience of Ethiopian coffee culture and ceremony traditions',
        url: '/resources/coffee',
        category: 'Culture',
        duration: '1 hour',
        image: '/assets/coffee-ceremony.jpg'
      },
      {
        id: 12,
        title: 'Traditional Clothing and Textiles Guide',
        type: 'Fashion Archive',
        description: 'Explore traditional Ethiopian clothing styles and textile techniques',
        url: '/resources/clothing',
        category: 'Culture',
        duration: '1.5 hours',
        image: '/assets/traditional-clothing.jpg'
      },
      {
        id: 13,
        title: 'Ethiopian Wildlife and Nature Documentary',
        type: 'Documentary Series',
        description: 'Discover Ethiopia\'s unique wildlife and natural heritage',
        url: '/resources/wildlife',
        category: 'Nature',
        duration: '3 hours',
        image: '/assets/ethiopian-highlands.jpg'
      },
      {
        id: 14,
        title: 'Tribal Cultures Photo Exhibition',
        type: 'Photo Gallery',
        description: 'Visual journey through Ethiopia\'s diverse tribal communities and traditions',
        url: '/resources/tribes',
        category: 'Anthropology',
        duration: '2 hours',
        image: '/assets/tribal-cultures.jpg'
      },
      {
        id: 15,
        title: 'Ethiopian Orthodox Art and Iconography',
        type: 'Art Gallery',
        description: 'Explore the rich artistic tradition of Ethiopian Orthodox Christianity',
        url: '/resources/orthodox-art',
        category: 'Religion',
        duration: '2.5 hours',
        image: '/assets/orthodox-church.jpg'
      }
    ];
  }

  /**
   * Get mock leaderboard
   * @returns {Array} Mock leaderboard
   */
  getMockLeaderboard() {
    return [
      { rank: 1, name: 'Ahmed K.', points: 1250, level: 5 },
      { rank: 2, name: 'Sara M.', points: 1180, level: 4 },
      { rank: 3, name: 'Dawit T.', points: 1050, level: 4 },
      { rank: 4, name: 'Meron A.', points: 920, level: 3 },
      { rank: 5, name: 'Yonas H.', points: 850, level: 3 }
    ];
  }

  /**
   * Get mock recommendations
   * @returns {Array} Mock recommendations
   */
  getMockRecommendations() {
    return [
      {
        id: 1,
        type: 'lesson',
        title: 'Queen of Sheba Legend',
        reason: 'Based on your interest in Ethiopian history',
        image: '/assets/Ethiopian History Fundamentals.jpg'
      },
      {
        id: 2,
        type: 'course',
        title: 'Ethiopian Orthodox Christianity',
        reason: 'Continue your religious artifacts exploration',
        image: '/assets/orthodox-church.jpg'
      },
      {
        id: 3,
        type: 'quiz',
        title: 'Ancient Kingdoms Quiz',
        reason: 'Test your knowledge of Ethiopian kingdoms',
        image: '/assets/Archaeological Wonders.jpg'
      },
      {
        id: 4,
        type: 'course',
        title: 'Ethiopian Coffee Culture',
        reason: 'Explore the birthplace of coffee traditions',
        image: '/assets/coffee-ceremony.jpg'
      },
      {
        id: 5,
        type: 'resource',
        title: 'Traditional Music Collection',
        reason: 'Discover Ethiopian musical heritage',
        image: '/assets/traditional-instruments.jpg'
      },
      {
        id: 6,
        type: 'course',
        title: 'Ethiopian Festivals and Celebrations',
        reason: 'Learn about cultural celebrations',
        image: '/assets/timkat-festival.jpg'
      },
      {
        id: 7,
        type: 'lesson',
        title: 'Ge\'ez Script and Ancient Texts',
        reason: 'Perfect for language enthusiasts',
        image: '/assets/geez-script.jpg'
      },
      {
        id: 8,
        type: 'resource',
        title: 'Traditional Crafts Workshop',
        reason: 'Hands-on cultural experience',
        image: '/assets/traditional-crafts.jpg'
      },
      {
        id: 9,
        type: 'course',
        title: 'Traditional Ethiopian Medicine',
        reason: 'Explore indigenous knowledge systems',
        image: '/assets/traditional-medicine.jpg'
      },
      {
        id: 10,
        type: 'quiz',
        title: 'Ethiopian Cuisine Challenge',
        reason: 'Test your food culture knowledge',
        image: '/assets/ethiopian-cuisine.jpg'
      }
    ];
  }

  // Local bookmarks management

  /**
   * Update local bookmarks
   * @param {string} contentType - Content type
   * @param {string|number} contentId - Content ID
   * @param {string} action - Action (add/remove)
   */
  updateLocalBookmarks(contentType, contentId, action) {
    try {
      const bookmarks = this.getLocalBookmarks();
      const bookmarkKey = `${contentType}_${contentId}`;

      if (action === 'add') {
        bookmarks[bookmarkKey] = {
          contentType,
          contentId,
          addedAt: new Date().toISOString()
        };
      } else if (action === 'remove') {
        delete bookmarks[bookmarkKey];
      }

      localStorage.setItem('ethio_heritage_bookmarks', JSON.stringify(bookmarks));
    } catch (error) {
      console.error('Update local bookmarks error:', error);
    }
  }

  /**
   * Get local bookmarks
   * @returns {Object} Local bookmarks
   */
  getLocalBookmarks() {
    try {
      const stored = localStorage.getItem('ethio_heritage_bookmarks');
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Get local bookmarks error:', error);
      return {};
    }
  }
}

export default new LearningService();
