import api from '../utils/api.js';

class AuthService {
  constructor() {
    this.currentUser = null;
    this.token = localStorage.getItem('token');
    this.refreshToken = localStorage.getItem('refreshToken');
    this.sessionCheckInterval = null;
    this.tokenExpiryWarned = false;

    // Initialize session check
    this.initializeSessionCheck();
  }

  /**
   * Initialize session checking to maintain user login state
   */
  initializeSessionCheck() {
    // Check session every 5 minutes
    this.sessionCheckInterval = setInterval(() => {
      this.validateSession();
    }, 5 * 60 * 1000);

    // Initial session validation if token exists
    if (this.token) {
      this.validateSession();
    }
  }

  /**
   * Validate current session and refresh token if needed
   */
  async validateSession() {
    if (!this.token) return false;

    try {
      // Check if token is about to expire (decode JWT)
      const tokenPayload = this.decodeToken(this.token);
      const now = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = tokenPayload.exp - now;

      // If token expires in less than 10 minutes, try to refresh it
      if (timeUntilExpiry < 600) {
        await this.refreshTokenIfNeeded();
      }

      return true;
    } catch (error) {
      console.error('Session validation failed:', error);
      // If session validation fails, logout user
      this.logout();
      return false;
    }
  }

  /**
   * Decode JWT token to get payload
   * @param {string} token - JWT token
   * @returns {Object} Token payload
   */
  decodeToken(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (error) {
      throw new Error('Invalid token format');
    }
  }

  /**
   * Refresh authentication token
   */
  async refreshTokenIfNeeded() {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await api.refreshToken(this.refreshToken);

      if (response.token) {
        this.token = response.token;
        localStorage.setItem('token', response.token);

        if (response.refreshToken) {
          this.refreshToken = response.refreshToken;
          localStorage.setItem('refreshToken', response.refreshToken);
        }

        console.log('Token refreshed successfully');
      }

      return response;
    } catch (error) {
      console.error('Token refresh failed:', error);
      throw error;
    }
  }

  /**
   * Login user with credentials
   * @param {Object} credentials - Email and password
   * @returns {Promise<Object>} User and token data
   */
  async login(credentials) {
    try {
      const response = await api.login(credentials);

      if (response.token) {
        this.token = response.token;
        this.currentUser = response.user;
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));

        // Store refresh token if provided
        if (response.refreshToken) {
          this.refreshToken = response.refreshToken;
          localStorage.setItem('refreshToken', response.refreshToken);
        }

        // Set last login timestamp
        localStorage.setItem('lastLogin', new Date().toISOString());

        // Reset token expiry warning flag
        this.tokenExpiryWarned = false;
      }

      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Register new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Registered user data
   */
  async register(userData) {
    try {
      const response = await api.register(userData);

      if (response.token) {
        this.token = response.token;
        this.currentUser = response.user;
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
      }

      return response;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Logout current user
   */
  async logout() {
    try {
      // Clear session check interval
      if (this.sessionCheckInterval) {
        clearInterval(this.sessionCheckInterval);
        this.sessionCheckInterval = null;
      }

      await api.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.currentUser = null;
      this.token = null;
      this.refreshToken = null;
      this.tokenExpiryWarned = false;

      // Clear all stored authentication data
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('lastLogin');

      // Redirect to login page
      window.location.href = '/auth';
    }
  }

  /**
   * Get current user data
   * @returns {Promise<Object|null>} Current user data
   */
  async getCurrentUser() {
    if (!this.token) {
      return null;
    }

    try {
      // Try to get from cache first
      if (!this.currentUser) {
        const cachedUser = localStorage.getItem('user');
        if (cachedUser) {
          try {
            this.currentUser = JSON.parse(cachedUser);
          } catch (e) {
            // Invalid cached data, fetch fresh
            localStorage.removeItem('user');
          }
        }
      }

      // If still no user, fetch from server
      if (!this.currentUser) {
        const response = await api.getCurrentUser();
        this.currentUser = response.user || response;
        localStorage.setItem('user', JSON.stringify(this.currentUser));
      }

      return this.currentUser;
    } catch (error) {
      console.error('Get current user error:', error);

      // If it's a token error, try to refresh token first
      if (error.message.includes('expired') || error.message.includes('invalid')) {
        try {
          await this.refreshTokenIfNeeded();
          // Retry getting current user with new token
          const response = await api.getCurrentUser();
          this.currentUser = response.user || response;
          localStorage.setItem('user', JSON.stringify(this.currentUser));
          return this.currentUser;
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
        }
      }

      // If all fails, logout user
      this.logout();
      return null;
    }
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} Authentication status
   */
  isAuthenticated() {
    if (!this.token) return false;

    try {
      // Check if token is still valid
      const tokenPayload = this.decodeToken(this.token);
      const now = Math.floor(Date.now() / 1000);
      return tokenPayload.exp > now;
    } catch (error) {
      // Invalid token
      return false;
    }
  }

  /**
   * Check if user has specific role
   * @param {string} role - Role to check
   * @returns {boolean} Role check result
   */
  hasRole(role) {
    if (!this.currentUser) {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          this.currentUser = JSON.parse(storedUser);
        } catch (e) {
          localStorage.removeItem('user');
          return false;
        }
      }
    }
    return this.currentUser?.role === role;
  }

  /**
   * Check if user has any of the specified roles
   * @param {Array<string>} roles - Array of roles to check
   * @returns {boolean} Role check result
   */
  hasAnyRole(roles) {
    if (!this.currentUser) {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          this.currentUser = JSON.parse(storedUser);
        } catch (e) {
          localStorage.removeItem('user');
          return false;
        }
      }
    }
    return roles.includes(this.currentUser?.role);
  }

  /**
   * Update user profile
   * @param {Object} userData - Updated user data
   * @returns {Promise<Object>} Updated user data
   */
  async updateProfile(userData) {
    try {
      const response = await api.updateUser(this.currentUser.id, userData);
      this.currentUser = { ...this.currentUser, ...response.user };
      localStorage.setItem('user', JSON.stringify(this.currentUser));
      return response;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  /**
   * Change user password
   * @param {Object} passwordData - Old and new password
   * @returns {Promise<Object>} Password change result
   */
  async changePassword(passwordData) {
    try {
      const response = await api.request('/auth/change-password', {
        method: 'POST',
        body: passwordData
      });
      return response;
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  }

  /**
   * Request password reset
   * @param {string} email - User email
   * @returns {Promise<Object>} Reset request result
   */
  async requestPasswordReset(email) {
    try {
      const response = await api.request('/auth/forgot-password', {
        method: 'POST',
        body: { email }
      });
      return response;
    } catch (error) {
      console.error('Password reset request error:', error);
      throw error;
    }
  }

  /**
   * Reset password with token
   * @param {string} token - Reset token
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} Reset result
   */
  async resetPassword(token, newPassword) {
    try {
      const response = await api.request('/auth/reset-password', {
        method: 'POST',
        body: { token, newPassword }
      });
      return response;
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  }

  /**
   * Verify email with token
   * @param {string} token - Verification token
   * @returns {Promise<Object>} Verification result
   */
  async verifyEmail(token) {
    try {
      const response = await api.request('/auth/verify-email', {
        method: 'POST',
        body: { token }
      });
      return response;
    } catch (error) {
      console.error('Email verification error:', error);
      throw error;
    }
  }
}

export default new AuthService();
