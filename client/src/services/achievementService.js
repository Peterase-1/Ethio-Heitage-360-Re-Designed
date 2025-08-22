import { api } from '../utils/api.js';

class AchievementService {
  constructor() {
    this.localStorageKey = 'ethio_heritage_achievements';
    this.listeners = [];
  }

  /**
   * Get user's achievements
   * @returns {Promise<Array>} User achievements
   */
  async getAchievements() {
    try {
      const response = await api.request('/user/achievements');
      const serverAchievements = response.achievements || response.data || response;
      
      // Merge with local achievements
      const localAchievements = this.getLocalAchievements();
      return this.mergeAchievements(serverAchievements, localAchievements);
    } catch (error) {
      console.error('Get achievements error:', error);
      return this.getLocalAchievements();
    }
  }

  /**
   * Get available achievements (all achievements that can be earned)
   * @returns {Promise<Array>} Available achievements
   */
  async getAvailableAchievements() {
    try {
      const response = await api.request('/achievements');
      return response.achievements || response.data || response;
    } catch (error) {
      console.error('Get available achievements error:', error);
      return this.getMockAvailableAchievements();
    }
  }

  /**
   * Check and unlock achievements based on user activity
   * @param {string} activityType - Type of activity performed
   * @param {Object} activityData - Activity data
   * @returns {Promise<Array>} Newly unlocked achievements
   */
  async checkAchievements(activityType, activityData = {}) {
    try {
      const response = await api.request('/user/achievements/check', {
        method: 'POST',
        body: { activityType, activityData }
      });
      
      const newAchievements = response.newAchievements || response.data || [];
      
      // Store locally and notify listeners
      if (newAchievements.length > 0) {
        this.addLocalAchievements(newAchievements);
        this.notifyListeners('achievements_unlocked', newAchievements);
      }
      
      return newAchievements;
    } catch (error) {
      console.error('Check achievements error:', error);
      // Perform local achievement checking
      return this.checkLocalAchievements(activityType, activityData);
    }
  }

  /**
   * Get achievement progress
   * @returns {Promise<Object>} Achievement progress
   */
  async getAchievementProgress() {
    try {
      const response = await api.request('/user/achievements/progress');
      return response.progress || response.data || response;
    } catch (error) {
      console.error('Get achievement progress error:', error);
      return this.getMockAchievementProgress();
    }
  }

  /**
   * Get achievement statistics
   * @returns {Promise<Object>} Achievement statistics
   */
  async getAchievementStats() {
    try {
      const response = await api.request('/user/achievements/stats');
      return response.stats || response.data || response;
    } catch (error) {
      console.error('Get achievement stats error:', error);
      const achievements = this.getLocalAchievements();
      return {
        totalEarned: achievements.length,
        totalAvailable: 25,
        completionRate: (achievements.length / 25) * 100,
        totalPoints: achievements.reduce((sum, a) => sum + (a.points || 0), 0),
        categories: {
          exploration: achievements.filter(a => a.category === 'exploration').length,
          learning: achievements.filter(a => a.category === 'learning').length,
          social: achievements.filter(a => a.category === 'social').length,
          collection: achievements.filter(a => a.category === 'collection').length
        }
      };
    }
  }

  /**
   * Get achievements by category
   * @param {string} category - Achievement category
   * @returns {Promise<Array>} Category achievements
   */
  async getAchievementsByCategory(category) {
    try {
      const response = await api.request(`/user/achievements?category=${category}`);
      return response.achievements || response.data || response;
    } catch (error) {
      console.error('Get achievements by category error:', error);
      const allAchievements = this.getLocalAchievements();
      return allAchievements.filter(a => a.category === category);
    }
  }

  /**
   * Get recent achievements
   * @param {number} limit - Number of recent achievements to return
   * @returns {Promise<Array>} Recent achievements
   */
  async getRecentAchievements(limit = 5) {
    try {
      const response = await api.request(`/user/achievements/recent?limit=${limit}`);
      return response.achievements || response.data || response;
    } catch (error) {
      console.error('Get recent achievements error:', error);
      const achievements = this.getLocalAchievements();
      return achievements
        .sort((a, b) => new Date(b.earnedAt) - new Date(a.earnedAt))
        .slice(0, limit);
    }
  }

  /**
   * Share achievement
   * @param {string|number} achievementId - Achievement ID
   * @param {string} platform - Platform to share on
   * @returns {Promise<Object>} Share result
   */
  async shareAchievement(achievementId, platform) {
    try {
      const response = await api.request('/user/achievements/share', {
        method: 'POST',
        body: { achievementId, platform }
      });
      return response;
    } catch (error) {
      console.error('Share achievement error:', error);
      // Generate local share content
      const achievement = this.getLocalAchievements().find(a => a.id === achievementId);
      if (achievement) {
        return this.generateShareContent(achievement, platform);
      }
      throw error;
    }
  }

  /**
   * Subscribe to achievement updates
   * @param {Function} callback - Callback function
   * @returns {Function} Unsubscribe function
   */
  subscribe(callback) {
    this.listeners.push(callback);
    
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Notify listeners of achievement events
   * @param {string} event - Event type
   * @param {Object} data - Event data
   */
  notifyListeners(event, data) {
    this.listeners.forEach(callback => {
      try {
        callback(event, data);
      } catch (error) {
        console.error('Achievement listener error:', error);
      }
    });
  }

  // Local achievement management

  /**
   * Get local achievements
   * @returns {Array} Local achievements
   */
  getLocalAchievements() {
    try {
      const stored = localStorage.getItem(this.localStorageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Get local achievements error:', error);
      return [];
    }
  }

  /**
   * Add local achievements
   * @param {Array} achievements - Achievements to add
   */
  addLocalAchievements(achievements) {
    try {
      const existing = this.getLocalAchievements();
      const merged = [...existing];
      
      achievements.forEach(newAchievement => {
        if (!merged.some(a => a.id === newAchievement.id)) {
          merged.push({
            ...newAchievement,
            earnedAt: newAchievement.earnedAt || new Date().toISOString()
          });
        }
      });
      
      localStorage.setItem(this.localStorageKey, JSON.stringify(merged));
    } catch (error) {
      console.error('Add local achievements error:', error);
    }
  }

  /**
   * Merge server and local achievements
   * @param {Array} serverAchievements - Server achievements
   * @param {Array} localAchievements - Local achievements
   * @returns {Array} Merged achievements
   */
  mergeAchievements(serverAchievements, localAchievements) {
    const merged = [...(serverAchievements || [])];
    
    // Add local achievements that don't exist on server
    localAchievements.forEach(localAchievement => {
      if (!merged.some(serverAchievement => serverAchievement.id === localAchievement.id)) {
        merged.push(localAchievement);
      }
    });
    
    // Sort by earned date (most recent first)
    return merged.sort((a, b) => new Date(b.earnedAt) - new Date(a.earnedAt));
  }

  /**
   * Check local achievements based on activity
   * @param {string} activityType - Activity type
   * @param {Object} activityData - Activity data
   * @returns {Array} Newly unlocked achievements
   */
  checkLocalAchievements(activityType, activityData) {
    const newAchievements = [];
    const currentAchievements = this.getLocalAchievements();
    const availableAchievements = this.getMockAvailableAchievements();
    
    // Check each available achievement
    availableAchievements.forEach(achievement => {
      // Skip if already earned
      if (currentAchievements.some(a => a.id === achievement.id)) {
        return;
      }
      
      // Check achievement conditions
      if (this.checkAchievementConditions(achievement, activityType, activityData)) {
        const unlockedAchievement = {
          ...achievement,
          earnedAt: new Date().toISOString(),
          unlockedLocally: true
        };
        newAchievements.push(unlockedAchievement);
      }
    });
    
    if (newAchievements.length > 0) {
      this.addLocalAchievements(newAchievements);
    }
    
    return newAchievements;
  }

  /**
   * Check if achievement conditions are met
   * @param {Object} achievement - Achievement to check
   * @param {string} activityType - Activity type
   * @param {Object} activityData - Activity data
   * @returns {boolean} Conditions met
   */
  checkAchievementConditions(achievement, activityType, activityData) {
    // Simple condition checking logic
    switch (achievement.id) {
      case 'first_visit':
        return activityType === 'page_visit';
      
      case 'first_artifact_view':
        return activityType === 'artifact_view';
      
      case 'first_tour_booking':
        return activityType === 'tour_booking';
      
      case 'first_lesson_complete':
        return activityType === 'lesson_complete';
      
      case 'history_buff':
        return activityType === 'lesson_complete' && 
               this.getCompletedLessonsCount('history') >= 5;
      
      case 'artifact_hunter':
        return activityType === 'artifact_view' && 
               this.getViewedArtifactsCount() >= 10;
      
      case 'social_butterfly':
        return activityType === 'comment_post' || 
               activityType === 'review_submit';
      
      default:
        return false;
    }
  }

  /**
   * Generate share content for achievement
   * @param {Object} achievement - Achievement to share
   * @param {string} platform - Platform to share on
   * @returns {Object} Share content
   */
  generateShareContent(achievement, platform) {
    const baseText = `I just unlocked "${achievement.name}" on Ethiopian Heritage 360! ${achievement.description}`;
    const url = 'https://ethiopianheritage360.com';
    
    const shareContent = {
      twitter: {
        text: baseText + ' #EthiopianHeritage #Achievement',
        url: url,
        hashtags: ['EthiopianHeritage', 'Achievement', 'Culture']
      },
      facebook: {
        quote: baseText,
        url: url
      },
      linkedin: {
        title: 'Achievement Unlocked!',
        summary: baseText,
        url: url
      },
      whatsapp: {
        text: baseText + ' ' + url
      }
    };
    
    return shareContent[platform] || { text: baseText, url: url };
  }

  // Helper methods for local achievement checking

  /**
   * Get count of completed lessons by category
   * @param {string} category - Lesson category
   * @returns {number} Completed lessons count
   */
  getCompletedLessonsCount(category) {
    try {
      const progress = JSON.parse(localStorage.getItem('ethio_heritage_learning_progress') || '{}');
      const lessons = progress.lessons || {};
      return Object.values(lessons).filter(lesson => 
        lesson.status === 'completed' && lesson.category === category
      ).length;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Get count of viewed artifacts
   * @returns {number} Viewed artifacts count
   */
  getViewedArtifactsCount() {
    try {
      const viewHistory = JSON.parse(localStorage.getItem('artifact_view_history') || '[]');
      return viewHistory.length;
    } catch (error) {
      return 0;
    }
  }

  // Mock data methods

  /**
   * Get mock available achievements
   * @returns {Array} Mock available achievements
   */
  getMockAvailableAchievements() {
    return [
      {
        id: 'first_visit',
        name: 'First Steps',
        description: 'Made your first visit to Ethiopian Heritage 360',
        icon: '👣',
        points: 10,
        category: 'exploration',
        rarity: 'common'
      },
      {
        id: 'first_artifact_view',
        name: 'Curious Explorer',
        description: 'Viewed your first artifact',
        icon: '🔍',
        points: 15,
        category: 'exploration',
        rarity: 'common'
      },
      {
        id: 'artifact_hunter',
        name: 'Artifact Hunter',
        description: 'Viewed 10 different artifacts',
        icon: '🏺',
        points: 50,
        category: 'exploration',
        rarity: 'uncommon'
      },
      {
        id: 'history_buff',
        name: 'History Buff',
        description: 'Completed 5 history lessons',
        icon: '📚',
        points: 75,
        category: 'learning',
        rarity: 'uncommon'
      },
      {
        id: 'first_tour_booking',
        name: 'Adventure Seeker',
        description: 'Booked your first virtual tour',
        icon: '🗺️',
        points: 25,
        category: 'exploration',
        rarity: 'common'
      },
      {
        id: 'first_lesson_complete',
        name: 'Knowledge Seeker',
        description: 'Completed your first learning lesson',
        icon: '🎓',
        points: 20,
        category: 'learning',
        rarity: 'common'
      },
      {
        id: 'social_butterfly',
        name: 'Community Member',
        description: 'Joined community discussions',
        icon: '💬',
        points: 30,
        category: 'social',
        rarity: 'uncommon'
      },
      {
        id: 'collector',
        name: 'Heritage Collector',
        description: 'Added 20 items to favorites',
        icon: '❤️',
        points: 100,
        category: 'collection',
        rarity: 'rare'
      },
      {
        id: 'scholar',
        name: 'Ethiopian Scholar',
        description: 'Completed all available courses',
        icon: '🏆',
        points: 200,
        category: 'learning',
        rarity: 'legendary'
      },
      {
        id: 'ambassador',
        name: 'Heritage Ambassador',
        description: 'Shared 10 items with friends',
        icon: '🌟',
        points: 150,
        category: 'social',
        rarity: 'epic'
      }
    ];
  }

  /**
   * Get mock achievement progress
   * @returns {Object} Mock achievement progress
   */
  getMockAchievementProgress() {
    return {
      totalAvailable: 25,
      totalEarned: 6,
      completionRate: 24,
      categories: {
        exploration: { earned: 3, available: 8 },
        learning: { earned: 2, available: 7 },
        social: { earned: 1, available: 5 },
        collection: { earned: 0, available: 5 }
      },
      nearCompletion: [
        {
          id: 'artifact_hunter',
          name: 'Artifact Hunter',
          description: 'View 10 different artifacts',
          progress: 7,
          target: 10,
          progressPercent: 70
        },
        {
          id: 'history_buff',
          name: 'History Buff',
          description: 'Complete 5 history lessons',
          progress: 3,
          target: 5,
          progressPercent: 60
        }
      ]
    };
  }
}

export default new AchievementService();
