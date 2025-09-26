import api from '../utils/api';

class SettingsService {
  /**
   * Get museum settings
   */
  async getSettings() {
    console.log('=== GET MUSEUM SETTINGS API CALL ===');

    try {
      const response = await api.get('/museums/settings');
      console.log('Settings API response:', response);
      return response;
    } catch (error) {
      console.error('Could not get settings:', error.message);
      throw error;
    }
  }

  /**
   * Update general settings
   */
  async updateGeneralSettings(updates) {
    console.log('=== UPDATE GENERAL SETTINGS API CALL ===');
    console.log('Updates:', updates);

    try {
      const response = await api.put('/museums/settings/general', updates);
      console.log('General settings update response:', response);
      return response;
    } catch (error) {
      console.error('Could not update general settings:', error.message);
      throw error;
    }
  }

  /**
   * Update notification settings
   */
  async updateNotificationSettings(updates) {
    console.log('=== UPDATE NOTIFICATION SETTINGS API CALL ===');
    console.log('Updates:', updates);

    try {
      const response = await api.put('/museums/settings/notifications', updates);
      console.log('Notification settings update response:', response);
      return response;
    } catch (error) {
      console.error('Could not update notification settings:', error.message);
      throw error;
    }
  }

  /**
   * Update security settings
   */
  async updateSecuritySettings(updates) {
    console.log('=== UPDATE SECURITY SETTINGS API CALL ===');
    console.log('Updates:', updates);

    try {
      const response = await api.put('/museums/settings/security', updates);
      console.log('Security settings update response:', response);
      return response;
    } catch (error) {
      console.error('Could not update security settings:', error.message);
      throw error;
    }
  }

  /**
   * Update museum-specific settings
   */
  async updateMuseumSettings(updates) {
    console.log('=== UPDATE MUSEUM SETTINGS API CALL ===');
    console.log('Updates:', updates);

    try {
      const response = await api.put('/museums/settings/museum', updates);
      console.log('Museum settings update response:', response);
      return response;
    } catch (error) {
      console.error('Could not update museum settings:', error.message);
      throw error;
    }
  }

  /**
   * Add IP to whitelist
   */
  async addToWhitelist(ip, description = '') {
    console.log('=== ADD IP TO WHITELIST API CALL ===');
    console.log('IP:', ip, 'Description:', description);

    try {
      const response = await api.post('/museums/settings/security/whitelist', {
        ip,
        description
      });
      console.log('Add IP to whitelist response:', response);
      return response;
    } catch (error) {
      console.error('Could not add IP to whitelist:', error.message);
      throw error;
    }
  }

  /**
   * Remove IP from whitelist
   */
  async removeFromWhitelist(ip) {
    console.log('=== REMOVE IP FROM WHITELIST API CALL ===');
    console.log('IP:', ip);

    try {
      const response = await api.delete(`/museums/settings/security/whitelist/${ip}`);
      console.log('Remove IP from whitelist response:', response);
      return response;
    } catch (error) {
      console.error('Could not remove IP from whitelist:', error.message);
      throw error;
    }
  }

  /**
   * Change password
   */
  async changePassword(currentPassword, newPassword) {
    console.log('=== CHANGE PASSWORD API CALL ===');

    try {
      const response = await api.put('/museums/settings/password', {
        currentPassword,
        newPassword
      });
      console.log('Change password response:', response);
      return response;
    } catch (error) {
      console.error('Could not change password:', error.message);
      throw error;
    }
  }

  /**
   * Reset settings to default
   */
  async resetToDefaults() {
    console.log('=== RESET SETTINGS TO DEFAULT API CALL ===');

    try {
      const response = await api.post('/museums/settings/reset');
      console.log('Reset settings response:', response);
      return response;
    } catch (error) {
      console.error('Could not reset settings:', error.message);
      throw error;
    }
  }

  /**
   * Update any settings category
   */
  async updateSettings(category, updates) {
    console.log('=== UPDATE SETTINGS API CALL ===');
    console.log('Category:', category, 'Updates:', updates);

    try {
      const response = await api.put('/museums/settings', {
        category,
        updates
      });
      console.log('Settings update response:', response);
      return response;
    } catch (error) {
      console.error('Could not update settings:', error.message);
      throw error;
    }
  }
}

export default new SettingsService();
