import api from '../utils/api';

// ==================== VISITOR APIS ====================

export const progressTrackerAPI = {
  // Get user's progress dashboard
  getMyProgress: async () => {
    try {
      const response = await api.get('/progress-tracker/my-progress');
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch progress data');
    }
  },

  // Get user's assignments
  getMyAssignments: async (status = 'all') => {
    try {
      const response = await api.get(`/progress-tracker/my-assignments?status=${status}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch assignments');
    }
  },

  // Get user's homework
  getMyHomework: async (status = 'all', subject = '') => {
    try {
      const params = new URLSearchParams({ status });
      if (subject) params.append('subject', subject);
      
      const response = await api.get(`/progress-tracker/my-homework?${params.toString()}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch homework');
    }
  },

  // Submit assignment
  submitAssignment: async (assignmentId, submissionData) => {
    try {
      const response = await api.post(`/progress-tracker/assignments/${assignmentId}/submit`, {
        submission: submissionData
      });
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to submit assignment');
    }
  },

  // Submit homework
  submitHomework: async (homeworkId, submissionData) => {
    try {
      const response = await api.post(`/progress-tracker/homework/${homeworkId}/submit`, {
        submission: submissionData
      });
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to submit homework');
    }
  },

  // Record activity (quiz, game, flashcard study, etc.)
  recordActivity: async (type, activityId, data) => {
    try {
      const response = await api.post('/progress-tracker/activities/record', {
        type,
        activityId,
        data
      });
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to record activity');
    }
  },

  // Get user's notifications
  getMyNotifications: async (limit = 20, unreadOnly = false) => {
    try {
      const params = new URLSearchParams({ 
        limit: limit.toString(),
        unreadOnly: unreadOnly.toString()
      });
      
      const response = await api.get(`/progress-tracker/notifications?${params.toString()}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch notifications');
    }
  },

  // Mark notifications as read
  markNotificationsRead: async (notificationIds = []) => {
    try {
      const response = await api.put('/progress-tracker/notifications/read', {
        notificationIds
      });
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to mark notifications as read');
    }
  },

  // Get user's analytics
  getMyAnalytics: async () => {
    try {
      const response = await api.get('/progress-tracker/analytics');
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch analytics');
    }
  },

  // Get leaderboard data
  getLeaderboard: async () => {
    try {
      const response = await api.get('/progress-tracker/leaderboard');
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch leaderboard');
    }
  },

  // Export user's progress data
  exportProgress: async () => {
    try {
      const response = await api.get('/progress-tracker/export');
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to export progress data');
    }
  }
};

// ==================== ADMIN APIS ====================

export const progressAdminAPI = {
  // Get all users' progress
  getAllUsersProgress: async (params = {}) => {
    try {
      const {
        page = 1,
        limit = 20,
        search = '',
        filterType = 'all',
        sortBy = 'lastActivity',
        sortOrder = 'desc',
        timeframe = 'all'
      } = params;

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder,
        filterType,
        timeframe
      });

      if (search) queryParams.append('search', search);

      const response = await api.get(`/admin-progress/users?${queryParams.toString()}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch users progress');
    }
  },

  // Get specific user's progress
  getUserProgress: async (userId) => {
    try {
      const response = await api.get(`/admin-progress/users/${userId}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch user progress');
    }
  },

  // Assign homework to user
  assignHomework: async (userId, homeworkData) => {
    try {
      const response = await api.post(`/progress-tracker/admin/users/${userId}/homework`, homeworkData);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to assign homework');
    }
  },

  // Assign assignment to user
  assignAssignment: async (userId, assignmentData, dueDate) => {
    try {
      const response = await api.post(`/progress-tracker/admin/users/${userId}/assignments`, {
        assignmentData,
        dueDate
      });
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to assign assignment');
    }
  },

  // Add comment to user's progress
  addComment: async (userId, commentData, targetType = 'general', targetId = null) => {
    try {
      const response = await api.post(`/progress-tracker/admin/users/${userId}/comments`, {
        commentData,
        targetType,
        targetId
      });
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to add comment');
    }
  },

  // Grade submission
  gradeSubmission: async (userId, submissionId, gradeData, feedback = '') => {
    try {
      const response = await api.put(`/progress-tracker/admin/users/${userId}/submissions/${submissionId}/grade`, {
        grade: gradeData,
        feedback
      });
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to grade submission');
    }
  },

  // Get progress analytics for admin
  getProgressAnalytics: async (timeframe = 'month') => {
    try {
      const response = await api.get(`/admin-progress/analytics?timeframe=${timeframe}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch progress analytics');
    }
  },

  // Reset user's progress
  resetUserProgress: async (userId, resetType = 'partial') => {
    try {
      const response = await api.post(`/admin-progress/users/${userId}/reset`, {
        resetType
      });
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to reset user progress');
    }
  },

  // Send notification to user
  sendUserNotification: async (userId, title, message, type = 'general', priority = 'normal') => {
    try {
      const response = await api.post(`/progress-tracker/admin/users/${userId}/notifications`, {
        title,
        message,
        type,
        priority
      });
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to send notification');
    }
  },

  // Bulk operations
  bulkUpdateProgress: async (userIds, operation, data = {}) => {
    try {
      const response = await api.post('/progress-tracker/admin/bulk-operations', {
        userIds,
        operation,
        data
      });
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to perform bulk operation');
    }
  },

  // Generate progress report
  generateProgressReport: async (userId) => {
    try {
      const response = await api.get(`/admin-progress/reports/${userId}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to generate progress report');
    }
  },

  // ==================== ACHIEVEMENT MANAGEMENT ====================
  
  // Get all achievements
  getAllAchievements: async (params = {}) => {
    try {
      const {
        page = 1,
        limit = 20,
        category = '',
        type = '',
        rarity = '',
        isActive = null
      } = params;

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      if (category) queryParams.append('category', category);
      if (type) queryParams.append('type', type);
      if (rarity) queryParams.append('rarity', rarity);
      if (isActive !== null) queryParams.append('isActive', isActive.toString());

      const response = await api.get(`/admin-progress/achievements?${queryParams.toString()}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch achievements');
    }
  },

  // Create achievement
  createAchievement: async (achievementData) => {
    try {
      const response = await api.post('/admin-progress/achievements', achievementData);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to create achievement');
    }
  },

  // Update achievement
  updateAchievement: async (achievementId, achievementData) => {
    try {
      const response = await api.put(`/admin-progress/achievements/${achievementId}`, achievementData);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to update achievement');
    }
  },

  // Delete achievement
  deleteAchievement: async (achievementId) => {
    try {
      const response = await api.delete(`/admin-progress/achievements/${achievementId}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to delete achievement');
    }
  },

  // Award achievement to user
  awardAchievementToUser: async (achievementId, userId) => {
    try {
      const response = await api.post(`/admin-progress/achievements/${achievementId}/award/${userId}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to award achievement');
    }
  },

  // ==================== BULK OPERATIONS ====================
  
  // Bulk reset progress
  bulkResetProgress: async (userIds, resetType = 'partial') => {
    try {
      const response = await api.post('/admin-progress/bulk/reset-progress', {
        userIds,
        resetType
      });
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to bulk reset progress');
    }
  },

  // Bulk award achievement
  bulkAwardAchievement: async (userIds, achievementId) => {
    try {
      const response = await api.post('/admin-progress/bulk/award-achievement', {
        userIds,
        achievementId
      });
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to bulk award achievement');
    }
  },

  // ==================== ANALYTICS AND REPORTS ====================
  
  // Export progress data
  exportProgressData: async (params = {}) => {
    try {
      const {
        format = 'json',
        userIds = ''
      } = params;

      const queryParams = new URLSearchParams({ format });
      if (userIds) queryParams.append('userIds', userIds);

      const response = await api.get(`/admin-progress/export?${queryParams.toString()}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to export progress data');
    }
  },

  // Get overview statistics
  getOverviewStats: async () => {
    try {
      const response = await api.get('/admin-progress/overview');
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch overview statistics');
    }
  },

  // Get trends data
  getTrendsData: async (timeframe = 'month', metric = 'users') => {
    try {
      const response = await api.get(`/admin-progress/trends?timeframe=${timeframe}&metric=${metric}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch trends data');
    }
  }
};

// ==================== UTILITY FUNCTIONS ====================

export const progressUtils = {
  // Calculate overall progress percentage
  calculateOverallProgress: (progress) => {
    if (!progress) return 0;

    const assignmentProgress = progress.assignments?.length > 0 
      ? (progress.assignments.filter(a => a.status === 'completed').length / progress.assignments.length) * 100
      : 0;

    const homeworkProgress = progress.homework?.length > 0
      ? (progress.homework.filter(h => h.status === 'completed').length / progress.homework.length) * 100
      : 0;

    const activityProgress = progress.activities?.length > 0
      ? (progress.activities.filter(a => a.status === 'completed').length / progress.activities.length) * 100
      : 0;

    return Math.round((assignmentProgress + homeworkProgress + activityProgress) / 3);
  },

  // Calculate total points earned
  calculateTotalPoints: (progress) => {
    if (!progress) return 0;

    let totalPoints = 0;

    // Points from achievements
    if (progress.achievements) {
      totalPoints += progress.achievements.reduce((sum, achievement) => 
        sum + (achievement.points || 0), 0);
    }

    // Points from completed activities
    if (progress.activities) {
      totalPoints += progress.activities.reduce((sum, activity) => 
        sum + (activity.pointsEarned || 0), 0);
    }

    return totalPoints;
  },

  // Get current streak
  getCurrentStreak: (progress) => {
    if (!progress?.analytics?.streakDays) return 0;
    return progress.analytics.streakDays;
  },

  // Format time spent
  formatTimeSpent: (minutes) => {
    if (!minutes || minutes < 1) return '0 minutes';
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${remainingMinutes} minutes`;
  },

  // Get progress color based on percentage
  getProgressColor: (percentage) => {
    if (percentage >= 80) return 'success';
    if (percentage >= 60) return 'warning';
    if (percentage >= 40) return 'info';
    return 'error';
  },

  // Get grade color
  getGradeColor: (grade) => {
    if (grade >= 90) return 'success';
    if (grade >= 80) return 'primary';
    if (grade >= 70) return 'warning';
    if (grade >= 60) return 'info';
    return 'error';
  },

  // Format grade display
  formatGrade: (grade, maxGrade = 100) => {
    const percentage = (grade / maxGrade) * 100;
    return `${grade}/${maxGrade} (${percentage.toFixed(1)}%)`;
  },

  // Check if assignment/homework is overdue
  isOverdue: (dueDate) => {
    if (!dueDate) return false;
    return new Date() > new Date(dueDate);
  },

  // Get days until due
  getDaysUntilDue: (dueDate) => {
    if (!dueDate) return null;
    
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  },

  // Group notifications by type
  groupNotificationsByType: (notifications) => {
    return notifications.reduce((groups, notification) => {
      const type = notification.type || 'general';
      if (!groups[type]) groups[type] = [];
      groups[type].push(notification);
      return groups;
    }, {});
  },

  // Filter activities by type
  filterActivitiesByType: (activities, type) => {
    if (!activities || !type || type === 'all') return activities;
    return activities.filter(activity => activity.type === type);
  },

  // Sort activities by date
  sortActivitiesByDate: (activities, ascending = false) => {
    if (!activities) return [];
    
    return activities.sort((a, b) => {
      const dateA = new Date(a.completedAt || a.createdAt);
      const dateB = new Date(b.completedAt || b.createdAt);
      
      return ascending ? dateA - dateB : dateB - dateA;
    });
  },

  // Get achievement categories summary
  getAchievementCategorySummary: (achievements) => {
    if (!achievements) return {};
    
    return achievements.reduce((summary, achievement) => {
      const category = achievement.category || 'general';
      if (!summary[category]) {
        summary[category] = {
          count: 0,
          totalPoints: 0,
          achievements: []
        };
      }
      
      summary[category].count += 1;
      summary[category].totalPoints += (achievement.points || 0);
      summary[category].achievements.push(achievement);
      
      return summary;
    }, {});
  }
};
