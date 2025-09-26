import axios from 'axios';
import { toast } from 'sonner';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const toolsAPI = axios.create({
  baseURL: `${API_BASE_URL}/tools`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add optional auth token to requests
toolsAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
toolsAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Tools API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

class ToolsService {

  // ============ TOOLS AND RESOURCES ============

  /**
   * Get all tools and resources
   */
  async getToolsAndResources(filters = {}) {
    try {
      console.log('🔧 Fetching tools and resources with filters:', filters);

      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.available !== undefined) params.append('available', filters.available.toString());
      if (filters.search) params.append('search', filters.search);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);

      const response = await toolsAPI.get(`/?${params}`);
      console.log('✅ Tools and resources fetched:', response.data);

      return {
        success: true,
        tools: response.data.data || [],
        pagination: response.data.pagination || {},
        message: response.data.message
      };
    } catch (error) {
      console.error('❌ Error fetching tools and resources:', error);
      return {
        success: false,
        tools: [],
        pagination: {},
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * Get tools grouped by category
   */
  async getToolsByCategory() {
    try {
      console.log('📂 Fetching tools by category...');
      const response = await toolsAPI.get('/by-category');
      console.log('✅ Tools by category fetched:', response.data);

      return {
        success: true,
        categories: response.data.data || {},
        message: response.data.message
      };
    } catch (error) {
      console.error('❌ Error fetching tools by category:', error);
      // Return fallback data structure that matches your frontend
      return {
        success: true,
        categories: {
          'Educational Tools': [
            {
              name: 'Interactive Flashcards',
              description: 'Study Ethiopian heritage with spaced repetition flashcards',
              icon: 'FaBook',
              path: '/education?section=flashcards',
              color: 'bg-purple-500',
              available: true
            },
            {
              name: 'Practice Quizzes',
              description: 'Test your knowledge with interactive quizzes',
              icon: 'FaGamepad',
              path: '/education?section=quizzes',
              color: 'bg-green-500',
              available: true
            },
            {
              name: 'Educational Games',
              description: 'Learn through fun and engaging games',
              icon: 'FaGamepad',
              path: '/visitor/games',
              color: 'bg-red-500',
              available: true
            }
          ],
          'Navigation & Geography': [
            {
              name: 'Heritage Map',
              description: 'Interactive map of Ethiopian heritage sites and museums',
              icon: 'FaMapMarkerAlt',
              path: '/map',
              color: 'bg-blue-500',
              available: true
            }
          ],
          'Language & Culture': [
            {
              name: 'Language Guide',
              description: 'Learn basic Amharic phrases and cultural etiquette',
              icon: 'FaLanguage',
              path: '/visitor/language',
              color: 'bg-green-500',
              available: false
            },
            {
              name: 'Cultural Calendar',
              description: 'Ethiopian holidays, festivals, and important dates',
              icon: 'FaCalendarAlt',
              path: '/visitor/cultural-calendar',
              color: 'bg-purple-500',
              available: false
            }
          ],
          'Utilities & Converters': [
            {
              name: 'Ethiopian Calendar',
              description: 'Convert between Ethiopian and Gregorian calendars',
              icon: 'FaCalculator',
              path: '/visitor/converters',
              color: 'bg-orange-500',
              available: false
            }
          ],
          'Mobile & Apps': [
            {
              name: 'Mobile App',
              description: 'Download our mobile app for on-the-go learning',
              icon: 'FaMobile',
              path: '/visitor/mobile',
              color: 'bg-pink-500',
              available: false
            }
          ]
        },
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * Get featured tools
   */
  async getFeaturedTools(limit = 6) {
    try {
      console.log('⭐ Fetching featured tools...');
      const response = await toolsAPI.get(`/featured?limit=${limit}`);
      console.log('✅ Featured tools fetched:', response.data);

      return {
        success: true,
        tools: response.data.data || [],
        message: response.data.message
      };
    } catch (error) {
      console.error('❌ Error fetching featured tools:', error);
      return {
        success: false,
        tools: [],
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * Get specific tool by ID
   */
  async getTool(toolId) {
    try {
      console.log('🔍 Fetching tool:', toolId);
      const response = await toolsAPI.get(`/${toolId}`);
      console.log('✅ Tool fetched:', response.data);

      return {
        success: true,
        tool: response.data.data || {},
        message: response.data.message
      };
    } catch (error) {
      console.error('❌ Error fetching tool:', error);
      return {
        success: false,
        tool: null,
        error: error.response?.data?.message || error.message
      };
    }
  }

  // ============ USAGE TRACKING ============

  /**
   * Track tool usage
   */
  async trackToolUsage(toolId, options = {}) {
    try {
      console.log('📊 Tracking tool usage:', toolId, options);
      
      const response = await toolsAPI.post(`/${toolId}/track-usage`, {
        sessionId: options.sessionId || this.generateSessionId(),
        userAgent: options.userAgent || navigator.userAgent,
        referrer: document.referrer || '',
        ...options
      });
      
      console.log('✅ Tool usage tracked:', response.data);
      return {
        success: true,
        usageId: response.data.usageId,
        message: response.data.message
      };
    } catch (error) {
      console.error('❌ Error tracking tool usage:', error);
      // Don't show error to user for usage tracking
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * Generate a session ID for anonymous usage tracking
   */
  generateSessionId() {
    let sessionId = sessionStorage.getItem('toolsSessionId');
    if (!sessionId) {
      sessionId = 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
      sessionStorage.setItem('toolsSessionId', sessionId);
    }
    return sessionId;
  }

  // ============ REVIEWS ============

  /**
   * Submit a review for a tool
   */
  async submitToolReview(toolId, reviewData) {
    try {
      console.log('📝 Submitting tool review:', toolId, reviewData);
      
      const response = await toolsAPI.post(`/${toolId}/reviews`, {
        rating: reviewData.rating,
        comment: reviewData.comment || '',
        recommend: reviewData.recommend !== false
      });
      
      console.log('✅ Tool review submitted:', response.data);
      toast.success('Review submitted successfully!');
      
      return {
        success: true,
        reviewId: response.data.reviewId,
        message: response.data.message
      };
    } catch (error) {
      console.error('❌ Error submitting tool review:', error);
      const errorMsg = error.response?.data?.message || 'Failed to submit review';
      toast.error(errorMsg);
      
      return {
        success: false,
        error: errorMsg
      };
    }
  }

  /**
   * Get reviews for a tool
   */
  async getToolReviews(toolId, filters = {}) {
    try {
      console.log('💬 Fetching tool reviews:', toolId, filters);
      
      const params = new URLSearchParams();
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);
      if (filters.rating) params.append('rating', filters.rating);
      
      const response = await toolsAPI.get(`/${toolId}/reviews?${params}`);
      console.log('✅ Tool reviews fetched:', response.data);

      return {
        success: true,
        reviews: response.data.data || [],
        pagination: response.data.pagination || {},
        message: response.data.message
      };
    } catch (error) {
      console.error('❌ Error fetching tool reviews:', error);
      return {
        success: false,
        reviews: [],
        pagination: {},
        error: error.response?.data?.message || error.message
      };
    }
  }

  // ============ ANALYTICS ============

  /**
   * Get tool analytics
   */
  async getToolAnalytics(toolId, period = '30d') {
    try {
      console.log('📈 Fetching tool analytics:', toolId, period);
      
      const response = await toolsAPI.get(`/${toolId}/analytics?period=${period}`);
      console.log('✅ Tool analytics fetched:', response.data);

      return {
        success: true,
        analytics: response.data.data || {},
        message: response.data.message
      };
    } catch (error) {
      console.error('❌ Error fetching tool analytics:', error);
      return {
        success: false,
        analytics: {},
        error: error.response?.data?.message || error.message
      };
    }
  }

  // ============ UTILITY METHODS ============

  /**
   * Check if a tool is available
   */
  isToolAvailable(tool) {
    return tool && tool.available === true;
  }

  /**
   * Get tool icon component name
   */
  getToolIcon(tool) {
    return tool?.icon || 'FaTools';
  }

  /**
   * Get tool color class
   */
  getToolColor(tool) {
    return tool?.color || 'bg-gray-500';
  }

  /**
   * Handle tool navigation
   */
  navigateToTool(tool, navigate, trackUsage = true) {
    if (!tool) return;

    // Track usage if enabled
    if (trackUsage && tool.id) {
      this.trackToolUsage(tool.id, {
        action: 'navigate',
        source: 'tools_page'
      });
    }

    // Handle external URLs
    if (tool.externalUrl) {
      window.open(tool.externalUrl, '_blank');
      return;
    }

    // Handle internal paths
    if (tool.path && navigate) {
      navigate(tool.path);
      return;
    }

    // Fallback for unavailable tools
    if (!tool.available) {
      toast.info(`${tool.name} is coming soon! We're working hard to bring you this feature.`);
    }
  }

  /**
   * Format tool usage count
   */
  formatUsageCount(count) {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'M';
    }
    if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K';
    }
    return count.toString();
  }

  /**
   * Format tool rating
   */
  formatRating(rating) {
    return rating ? rating.toFixed(1) : '0.0';
  }
}

// Create and export singleton instance
const toolsService = new ToolsService();
export default toolsService;
