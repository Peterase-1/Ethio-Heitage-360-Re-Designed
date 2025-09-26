import api from '../utils/api';

class MuseumStatsService {
  /**
   * Get museum statistics
   */
  async getMuseumStats(museumId = null) {
    console.log('=== GET MUSEUM STATS API CALL ===');
    console.log('Museum ID:', museumId);

    try {
      // Use the dashboard stats endpoint which works for the current user's museum
      const endpoint = museumId ? `/museums/${museumId}/stats` : '/museums/dashboard/stats';
      const response = await api.get(endpoint);
      console.log('Museum stats API response:', response);
      return response;
    } catch (error) {
      console.error('Could not get museum stats:', error.message);

      // Return default stats if authentication fails or user not logged in
      if (error.message.includes('Authentication') || error.message.includes('401')) {
        console.log('Authentication error - returning default stats');
        return {
          data: {
            totalArtifacts: 0,
            totalStaff: 0,
            totalEvents: 0,
            activeRentals: 0,
            monthlyVisitors: 0,
            totalRevenue: 0
          }
        };
      }

      throw error;
    }
  }

  /**
   * Get quick statistics for header/sidebar display
   */
  async getQuickStats() {
    console.log('=== GET QUICK STATS API CALL ===');

    try {
      const response = await api.get('/museum-admin/quick-stats');
      console.log('Quick stats API response:', response);
      return response;
    } catch (error) {
      console.error('Could not get quick stats:', error.message);
      throw error;
    }
  }

  /**
   * Get museum dashboard statistics
   */
  async getDashboardStats() {
    console.log('=== GET DASHBOARD STATS API CALL ===');

    try {
      const response = await api.get('/museum-admin/dashboard');
      console.log('Dashboard stats API response:', response);
      return response;
    } catch (error) {
      console.error('Could not get dashboard stats:', error.message);
      throw error;
    }
  }
}

export default new MuseumStatsService();
