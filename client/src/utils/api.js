import mockApi from './mockApi.js';
import { getValidToken, cleanupCorruptedTokens } from './tokenUtils.js';

// FORCE PORT 5000 - AGGRESSIVE CACHE BUSTING
const API_BASE_URL = import.meta.env.VITE_API_URL || `http://localhost:5000/api?t=${Date.now()}&v=3&cb=${Math.random().toString(36).substring(7)}`
const USE_MOCK_API = false // Force to use real API in development
// EMERGENCY FIX: Force port 5000 - NO MORE 5001
const FORCE_PORT_5000 = true; // This will force the browser to reload the API client
const CACHE_BUST = Math.random().toString(36).substring(7); // Additional cache busting
const EMERGENCY_PORT_FIX = true; // Emergency fix for port 5001 issue

class ApiClient {
  constructor() {
    // EMERGENCY FIX: Force port 5000
    this.baseURL = API_BASE_URL.replace('5001', '5000')
    console.log('🚀 API Client initialized with base URL:', this.baseURL)
    console.log('🔧 Cache bust:', CACHE_BUST)
    console.log('🔧 Force port 5000:', FORCE_PORT_5000)
    console.log('🚨 EMERGENCY PORT FIX:', EMERGENCY_PORT_FIX)
    console.log('🔧 Original URL:', API_BASE_URL)
    console.log('🔧 Final URL:', this.baseURL)
    this.backendChecked = false
    // Check backend availability on initialization
    this.checkBackendAvailability()
  }

  async checkBackendAvailability() {
    // Skip check if we're forced to use mock API
    // For production deployments, assume backend is available and let individual requests handle failures
    if (this.baseURL === '/api') {
      console.log('Using Netlify proxy - assuming backend available')
      this.backendChecked = true
      return true
    }

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // Increased timeout to 10s for Render wake-up

      // Try health check first
      let response
      try {
        response = await fetch(`${this.baseURL}/health`, {
          method: 'GET',
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json'
          }
        })
      } catch (healthError) {
        console.log('Health endpoint failed, trying root endpoint')
        // Fallback to root endpoint if health check fails
        response = await fetch(`${this.baseURL.replace('/api', '')}`, {
          method: 'GET',
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json'
          }
        })
      }

      clearTimeout(timeoutId)

      if (response && response.ok) {
        try {
          const data = await response.json()
          console.log('Backend is available:', data.message || 'OK')
        } catch {
          // Even if we can't parse JSON, if we got a 200 response, backend is available
          console.log('Backend is available (non-JSON response)')
        }
      } else {
        console.log('Backend not available')
      }
    } catch (error) {
      console.log('Backend check failed:', error.message)
    }

    this.backendChecked = true
    return true
  }

  async request(endpoint, options = {}) {
    let url = `${this.baseURL}${endpoint}`

    // EMERGENCY FIX: Force port 5000 in URL
    if (url.includes('5001')) {
      url = url.replace('5001', '5000')
      console.log('🚨 EMERGENCY: Fixed port 5001 to 5000 in URL:', url)
    }

    // Clean up any corrupted tokens before making request
    const wasCorrupted = cleanupCorruptedTokens()
    if (wasCorrupted) {
      console.log('🧹 Cleaned up corrupted authentication data')
    }

    // Get valid token
    const token = getValidToken()

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    }

    if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
      config.body = JSON.stringify(config.body)
    }

    try {
      console.log('🌐 Making request to:', url)
      const response = await fetch(url, config)
      let data

      // Check if response has content before trying to parse
      const contentType = response.headers.get('content-type')
      const hasContent = response.status !== 204 && response.headers.get('content-length') !== '0'

      if (hasContent && contentType && contentType.includes('application/json')) {
        try {
          // Clone response to avoid body consumption issues
          const responseClone = response.clone()
          data = await responseClone.json()
        } catch (parseError) {
          console.warn('JSON parse failed, trying text:', parseError)
          try {
            const textData = await response.text()
            data = textData ? { message: textData } : {}
          } catch (textError) {
            console.error('Failed to read response as text:', textError)
            data = { message: 'Unable to parse response' }
          }
        }
      } else if (hasContent) {
        try {
          const textData = await response.text()
          data = textData ? { message: textData } : {}
        } catch (textError) {
          console.error('Failed to read response as text:', textError)
          data = { message: 'Unable to parse response' }
        }
      } else {
        data = {}
      }

      if (!response.ok) {
        // Extract more specific error message
        const errorMessage = data?.error?.message || data?.message || `HTTP ${response.status}: ${response.statusText}`
        console.error('API Error:', { url, status: response.status, error: data })
        throw new Error(errorMessage)
      }

      return data
    } catch (error) {
      console.error('API request failed:', { url, error: error.message })
      throw error
    }
  }

  // Auth endpoints
  async login(credentials) {
    try {
      await this.checkBackendAvailability()

      const result = await this.request('/auth/login', {
        method: 'POST',
        body: credentials,
      })

      return result

    } catch (error) {
      throw error
    }
  }

  async register(userData) {
    await this.checkBackendAvailability()

    const result = await this.request('/auth/register', {
      method: 'POST',
      body: userData,
    })

    return result
  }

  async logout() {

    try {
      return await this.request('/auth/logout', {
        method: 'POST',
      })
    } catch (error) {
      // If logout fails due to invalid token, still clear local storage
      if (error.message.includes('Invalid token') || error.message.includes('Token is not valid')) {
        console.warn('Logout failed due to invalid token, clearing local storage anyway')
        // Clean up local storage regardless of server response
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        // Return success since we've cleared the local session
        return { success: true, message: 'Local session cleared' }
      }
      // Re-throw other errors
      throw error
    }
  }

  async refreshToken(refreshToken) {

    return this.request('/auth/refresh', {
      method: 'POST',
      body: { refreshToken }
    })
  }

  async getCurrentUser() {
    try {
      const result = await this.request('/auth/me')

      // Ensure we return the expected structure
      if (result && typeof result === 'object') {
        // If the result already has a 'user' property, return as-is
        if (result.user) {
          return result
        }
        // If the result IS the user object, wrap it
        if (result.id || result.email) {
          return { user: result }
        }
      }

      return result
    } catch (error) {
      if (error.message.includes('Token is not valid') || error.message.includes('invalid token')) {
        console.warn('Invalid token detected, clearing localStorage')
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }

      throw error
    }
  }


  // Museum endpoints (align with backend /api/museums)
  async getMuseums() {
    return this.request('/museums')
  }

  async getMuseumById(id) {
    return this.request(`/museums/${id}`)
  }

  async createMuseum(museumData) {
    return this.request('/museums', {
      method: 'POST',
      body: museumData,
    })
  }

  async updateMuseum(id, museumData) {
    return this.request(`/museums/${id}`, {
      method: 'PUT',
      body: museumData,
    })
  }

  async deleteMuseum(id) {
    return this.request(`/museums/${id}`, {
      method: 'DELETE',
    })
  }

  // Artifact endpoints (align with backend /api/artifacts)
  async getArtifacts(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString()
    return this.request(`/artifacts${queryParams ? `?${queryParams}` : ''}`)
  }

  async getArtifactById(id) {
    return this.request(`/artifacts/${id}`)
  }

  async createArtifact(artifactData) {
    return this.request('/artifacts', {
      method: 'POST',
      body: artifactData,
    })
  }

  async updateArtifact(id, artifactData) {
    return this.request(`/artifacts/${id}`, {
      method: 'PUT',
      body: artifactData,
    })
  }

  async deleteArtifact(id) {
    return this.request(`/artifacts/${id}`, {
      method: 'DELETE',
    })
  }

  async uploadArtifactImages(id, images) {
    const formData = new FormData()
    images.forEach((file) => formData.append('images', file))

    // Clean up corrupted tokens and get valid token
    cleanupCorruptedTokens()
    const token = getValidToken()
    const response = await fetch(`${this.baseURL}/artifacts/${id}/images`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    })

    if (!response.ok) {
      let message = 'Image upload failed'
      try {
        const errJson = await response.json()
        message = errJson?.error?.message || errJson?.message || message
      } catch { }
      throw new Error(message)
    }
    return response.json()
  }

  async updateArtifactImages(id, images) {
    const formData = new FormData()
    images.forEach((file) => formData.append('images', file))

    // Clean up corrupted tokens and get valid token
    cleanupCorruptedTokens()
    const token = getValidToken()
    const response = await fetch(`${this.baseURL}/artifacts/${id}/images`, {
      method: 'PUT',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    })

    if (!response.ok) {
      let message = 'Image update failed'
      try {
        const errJson = await response.json()
        message = errJson?.error?.message || errJson?.message || message
      } catch { }
      throw new Error(message)
    }
    return response.json()
  }

  async uploadArtifactModel(id, modelFile) {
    const formData = new FormData()
    formData.append('model', modelFile)

    // Clean up corrupted tokens and get valid token
    cleanupCorruptedTokens()
    const token = getValidToken()
    const response = await fetch(`${this.baseURL}/artifacts/${id}/model`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    })

    if (!response.ok) {
      const err = await response.text().catch(() => '')
      throw new Error(err || '3D model upload failed')
    }
    return response.json()
  }

  async updateArtifactStatus(id, status) {
    return this.request(`/artifacts/${id}/status`, {
      method: 'PUT',
      body: { status },
    })
  }

  async toggleArtifactFeatured(id, featured) {
    return this.request(`/artifacts/${id}/featured`, {
      method: 'PUT',
      body: { featured },
    })
  }

  // Tours endpoints
  async getTours() {
    return this.request('/tours')
  }

  async getTourById(id) {
    return this.request(`/tours/${id}`)
  }

  async createTour(tourData) {
    return this.request('/tours', {
      method: 'POST',
      body: tourData,
    })
  }

  async bookTour(tourId, bookingData) {
    return this.request(`/tours/${tourId}/book`, {
      method: 'POST',
      body: bookingData,
    })
  }

  // Public booking endpoints (for customers)
  async createPublicBooking(bookingData) {
    return this.request('/bookings', {
      method: 'POST',
      body: bookingData,
    })
  }

  // Public message endpoints (for customer inquiries)
  async createCustomerMessage(messageData) {
    return this.request('/messages', {
      method: 'POST',
      body: messageData,
    })
  }

  // Map endpoints
  async getSites() {
    return this.request('/map/sites')
  }

  async getSiteById(id) {
    return this.request(`/map/sites/${id}`)
  }

  // Chat endpoints
  async getChatHistory(userId) {
    return this.request(`/chat/history/${userId}`)
  }

  async sendMessage(messageData) {
    return this.request('/chat/message', {
      method: 'POST',
      body: messageData,
    })
  }

  // Admin endpoints
  async getUsers({ page = 1, limit = 10, role } = {}) {

    const params = new URLSearchParams({ page: String(page), limit: String(limit) })
    if (role) params.append('role', role)
    return this.request(`/super-admin/users?${params}`)
  }

  async updateUserRole(userId, role) {
    return this.request(`/super-admin/users/${userId}`, {
      method: 'PUT',
      body: { role },
    })
  }


  async getSystemStats() {

    return this.request('/admin/stats')
  }

  // New: Super Admin API endpoints for enhanced dashboard
  async getSuperAdminDashboard() {

    return this.request('/super-admin/dashboard')
  }

  async getSuperAdminDashboardStats() {

    return this.request('/super-admin/analytics')
  }

  async getSuperAdminAnalytics(params = {}) {

    const queryParams = new URLSearchParams(params).toString()
    return this.request(`/super-admin/analytics?${queryParams}`)
  }

  async getSuperAdminAuditLogs(params = {}) {

    const queryParams = new URLSearchParams(params).toString()
    return this.request(`/super-admin/audit-logs?${queryParams}`)
  }

  async getSuperAdminAuditLogsSummary(params = {}) {

    const queryParams = new URLSearchParams(params).toString()
    return this.request(`/super-admin/audit-logs/summary?${queryParams}`)
  }

  // Legacy method for backward compatibility
  async getAdminStats() {
    return this.getSuperAdminDashboard()
  }

  // Performance Analytics API endpoints
  async getPerformanceOverview(params = {}) {
    const queryParams = new URLSearchParams(params).toString()
    return this.request(`/super-admin/performance-analytics/overview?${queryParams}`)
  }

  async getSystemHealth(params = {}) {

    const queryParams = new URLSearchParams(params).toString()
    return this.request(`/super-admin/performance-analytics/system-health?${queryParams}`)
  }

  async getPerformanceMetrics(params = {}) {

    const queryParams = new URLSearchParams(params).toString()
    return this.request(`/super-admin/performance-analytics/overview?${queryParams}`)
  }

  async getUserActivityMetrics(params = {}) {

    const queryParams = new URLSearchParams(params).toString()
    return this.request(`/super-admin/performance-analytics/user-activity?${queryParams}`)
  }

  async getMuseumPerformanceMetrics(params = {}) {

    const queryParams = new URLSearchParams(params).toString()
    return this.request(`/super-admin/performance-analytics/museum-performance?${queryParams}`)
  }

  async getArtifactPerformanceMetrics(params = {}) {

    const queryParams = new URLSearchParams(params).toString()
    return this.request(`/super-admin/performance-analytics/artifact-performance?${queryParams}`)
  }

  async getRentalPerformanceMetrics(params = {}) {

    const queryParams = new URLSearchParams(params).toString()
    return this.request(`/super-admin/performance-analytics/rental-performance?${queryParams}`)
  }

  async getApiPerformanceMetrics(params = {}) {

    const queryParams = new URLSearchParams(params).toString()
    return this.request(`/super-admin/performance-analytics/api-performance?${queryParams}`)
  }

  // Enhanced User Management API endpoints
  async bulkUserActions(action, userIds, data = {}) {

    return this.request('/super-admin/users/bulk-actions', {
      method: 'POST',
      body: { action, userIds, data }
    })
  }

  async getUserStatistics(params = {}) {

    const queryParams = new URLSearchParams(params).toString()
    return this.request(`/super-admin/users/statistics?${queryParams}`)
  }

  async searchUsers(params = {}) {

    const queryParams = new URLSearchParams(params).toString()
    return this.request(`/super-admin/users/search?${queryParams}`)
  }

  // Enhanced Museum Oversight API endpoints
  async getMuseumStatistics(params = {}) {

    const queryParams = new URLSearchParams(params).toString()
    return this.request(`/super-admin/museums/statistics?${queryParams}`)
  }

  async bulkMuseumActions(action, museumIds, data = {}) {

    return this.request('/super-admin/museums/bulk-actions', {
      method: 'POST',
      body: { action, museumIds, data }
    })
  }

  async searchMuseums(params = {}) {

    const queryParams = new URLSearchParams(params).toString()
    return this.request(`/super-admin/museums/search?${queryParams}`)
  }

  async getMuseumPerformance(params = {}) {

    const queryParams = new URLSearchParams(params).toString()
    return this.request(`/super-admin/museums/performance?${queryParams}`)
  }

  async getMuseumAuditLogs(params = {}) {

    const queryParams = new URLSearchParams(params).toString()
    return this.request(`/super-admin/museums/audit-logs?${queryParams}`)
  }

  async listUsers({ page = 1, limit = 20, role } = {}) {

    const q = new URLSearchParams({ page: String(page), limit: String(limit) })
    if (role) q.set('role', role)
    return this.request(`/super-admin/users?${q.toString()}`)
  }

  async setUserRole(userId, role) {

    return this.updateUserRole(userId, role)
  }

  async createUser(data) {

    return this.request('/super-admin/users', {
      method: 'POST',
      body: data,
    })
  }

  async updateUser(userId, data) {

    return this.request(`/super-admin/users/${userId}`, {
      method: 'PUT',
      body: data,
    })
  }

  async deleteUser(userId) {

    return this.request(`/super-admin/users/${userId}`, {
      method: 'DELETE',
    })
  }

  // Museums oversight
  async listMuseums({ page = 1, limit = 20 } = {}) {
    const q = new URLSearchParams({ page: String(page), limit: String(limit) })
    return this.request(`/admin/museums?${q.toString()}`)
  }

  async setMuseumVerified(userId, verified) {
    return this.request(`/admin/museums/${userId}/verify`, {
      method: 'PUT',
      body: { verified },
    })
  }

  // System management
  async getSystemSettings() {
    return this.request('/system-settings')
  }

  // Museum Settings
  async getMuseumSettings() {
    return this.request('/museums/settings/settings')
  }

  async updateMuseumSettings(data) {
    return this.request('/museums/settings/settings', {
      method: 'PUT',
      body: data
    })
  }



  // Notifications
  async getNotifications() {
    return this.request('/notifications')
  }

  async markNotificationRead(id) {
    return this.request(`/notifications/${id}/read`, { method: 'PUT' })
  }

  async markAllNotificationsRead() {
    return this.request('/notifications/read-all', { method: 'PUT' })
  }

  async updateSystemSettings(settings) {
    return this.request('/system-settings', {
      method: 'PUT',
      body: settings,
    })
  }

  async getPublicSettings() {
    return this.request('/system-settings/public');
  }

  async backupDatabase() {
    return this.request('/system-settings/backup', {
      method: 'POST'
    });
  }

  async generateSystemReport() {
    return this.request('/system-settings/reports?reportType=system');
  }



  // Content moderation (multi-type)
  async listContent({ page = 1, limit = 20, status, type, museum, q } = {}) {
    const qparams = new URLSearchParams({ page: String(page), limit: String(limit) })
    if (status) qparams.set('status', status)
    if (type) qparams.set('type', type)
    if (museum) qparams.set('museum', museum)
    if (q) qparams.set('q', q)
    return this.request(`/admin/content?${qparams.toString()}`)
  }

  async approveContent(contentId, contentType) {
    return this.request(`/admin/content/${contentType}/${contentId}/approve`, { method: 'PUT' })
  }

  async rejectContent(contentId, contentType, reason = '') {
    return this.request(`/admin/content/${contentType}/${contentId}/reject`, { method: 'PUT', body: { reason } })
  }

  // Museum Admin endpoints
  async getMuseumProfile() {
    await this.checkBackendAvailability();

    return this.request('/museums/profile', {
      method: 'GET',
    });
  }

  async updateMuseumProfile(profileData) {
    await this.checkBackendAvailability();
    return this.request('/museums/profile', {
      method: 'PUT',
      body: profileData,
    })
  }

  async uploadMuseumLogo(logoFile) {
    const formData = new FormData()
    formData.append('logo', logoFile)

    // Clean up corrupted tokens and get valid token
    cleanupCorruptedTokens()
    const token = getValidToken()
    const response = await fetch(`${this.baseURL}/museums/profile/logo`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    })

    if (!response.ok) {
      let message = 'Logo upload failed'
      try {
        const errJson = await response.json()
        message = errJson?.error?.message || errJson?.message || message
      } catch { }
      throw new Error(message)
    }
    return response.json()
  }

  // Museum Dashboard endpoints
  async getMuseumDashboardStats() {
    await this.checkBackendAvailability();
    return this.request('/museums/dashboard/stats');
  }

  async getRecentArtifacts() {
    await this.checkBackendAvailability();
    return this.request('/museums/dashboard/recent-artifacts');
  }

  async getPendingTasks() {
    await this.checkBackendAvailability();
    return this.request('/museums/dashboard/pending-tasks');
  }

  async getMuseumArtifacts({ page = 1, limit = 20, category, search } = {}) {
    const q = new URLSearchParams({ page: String(page), limit: String(limit) })
    if (category) q.set('category', category)
    if (search) q.set('search', search)
    return this.request(`/museum-admin/artifacts?${q.toString()}`)
  }

  async createMuseumArtifact(artifactData) {
    return this.request('/museum-admin/artifacts', {
      method: 'POST',
      body: artifactData,
    })
  }

  async updateMuseumArtifact(id, artifactData) {
    return this.request(`/museum-admin/artifacts/${id}`, {
      method: 'PUT',
      body: artifactData,
    })
  }

  async deleteMuseumArtifact(id) {
    return this.request(`/museum-admin/artifacts/${id}`, {
      method: 'DELETE',
    })
  }

  async getMuseumAnalytics() {
    return this.request('/museum-admin/analytics')
  }

  async getMuseumDashboard() {
    await this.checkBackendAvailability();

    // Get dashboard stats
    const statsResponse = await this.request('/museums/dashboard/stats');
    const recentArtifactsResponse = await this.request('/museums/dashboard/recent-artifacts');
    const pendingTasksResponse = await this.request('/museums/dashboard/pending-tasks');

    return {
      success: true,
      dashboard: {
        quickStats: statsResponse.data || statsResponse,
        analytics: {
          topArtifacts: recentArtifactsResponse.data || recentArtifactsResponse
        },
        tasks: {
          pendingApprovals: 0,
          pendingRentals: statsResponse.data?.pendingRentals || 0,
          recentRentals: [],
          pendingArtifacts: pendingTasksResponse.data || pendingTasksResponse
        }
      }
    };
  }


  async submitVirtualMuseum(submissionData) {
    return this.request('/museum-admin/virtual-submissions', {
      method: 'POST',
      body: submissionData,
    })
  }

  async getVirtualSubmissions({ page = 1, limit = 20, status } = {}) {
    const q = new URLSearchParams({ page: String(page), limit: String(limit) })
    if (status) q.set('status', status)
    return this.request(`/museum-admin/virtual-submissions?${q.toString()}`)
  }

  // Museum Admin Communications endpoints (using same endpoints as Super Admin)
  async getMuseumCommunications(params = {}) {
    const queryParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        queryParams.append(key, value)
      }
    })
    return this.request(`/communications?${queryParams}`)
  }

  async getMuseumCommunication(id) {
    return this.request(`/communications/${id}`)
  }

  async createMuseumCommunication(communicationData) {
    return this.request('/communications', {
      method: 'POST',
      body: communicationData,
    })
  }

  async replyToMuseumCommunication(id, replyData) {
    return this.request(`/communications/${id}/reply`, {
      method: 'POST',
      body: replyData,
    })
  }

  async markMuseumCommunicationAsRead(id) {
    return this.request(`/communications/${id}/read`, {
      method: 'PUT',
    })
  }

  async archiveMuseumCommunication(id) {
    return this.request(`/communications/${id}/archive`, {
      method: 'PUT',
    })
  }

  async getMuseumUnreadCount() {
    return this.request('/communications/unread-count')
  }

  async getMuseumCommunicationConversation(id) {
    return this.request(`/communications/${id}/conversation`)
  }

  // User/Visitor endpoints
  async getUserProfile() {
    return this.request('/user/profile')
  }

  async updateUserProfile(profileData) {
    return this.request('/user/profile', {
      method: 'PUT',
      body: profileData,
    })
  }

  async getVirtualExhibits({ search, category, museum } = {}) {
    const q = new URLSearchParams()
    if (search) q.set('search', search)
    if (category) q.set('category', category)
    if (museum) q.set('museum', museum)
    return this.request(`/user/virtual-exhibits?${q.toString()}`)
  }

  async getHeritageSites({ search, region } = {}) {
    const q = new URLSearchParams()
    if (search) q.set('search', search)
    if (region) q.set('region', region)
    return this.request(`/user/heritage-sites?${q.toString()}`)
  }

  // Super Admin Heritage Sites API methods
  async getSuperAdminHeritageSites(params = {}) {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });
    return this.request(`/super-admin/heritage-sites?${queryParams.toString()}`);
  }

  async getHeritageSiteStatistics(params = {}) {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });
    return this.request(`/super-admin/heritage-sites/statistics?${queryParams.toString()}`);
  }

  async searchHeritageSites(params = {}) {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });
    return this.request(`/super-admin/heritage-sites/search?${queryParams.toString()}`);
  }

  async bulkHeritageSiteActions(action, siteIds, data = {}) {
    return this.request('/super-admin/heritage-sites/bulk-actions', {
      method: 'POST',
      body: JSON.stringify({ action, siteIds, data })
    });
  }

  async getHeritageSitePerformance(params = {}) {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });
    return this.request(`/super-admin/heritage-sites/performance?${queryParams.toString()}`);
  }

  async getHeritageSiteAuditLogs(params = {}) {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });
    return this.request(`/super-admin/heritage-sites/audit-logs?${queryParams.toString()}`);
  }

  // Heritage Site CRUD Operations
  async createHeritageSite(data) {
    return this.request('/super-admin/heritage-sites', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateHeritageSite(siteId, data) {
    return this.request(`/super-admin/heritage-sites/${siteId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteHeritageSite(siteId) {
    return this.request(`/super-admin/heritage-sites/${siteId}`, {
      method: 'DELETE'
    });
  }

  async getHeritageSite(siteId) {
    return this.request(`/super-admin/heritage-sites/${siteId}`);
  }

  async getUserArtifacts({ page = 1, limit = 20, search, category, museum } = {}) {
    const q = new URLSearchParams({ page: String(page), limit: String(limit) })
    if (search) q.set('search', search)
    if (category) q.set('category', category)
    if (museum) q.set('museum', museum)
    return this.request(`/user/artifacts?${q.toString()}`)
  }

  async getUpcomingEvents({ search, date, museum } = {}) {
    const q = new URLSearchParams()
    if (search) q.set('search', search)
    if (date) q.set('date', date)
    if (museum) q.set('museum', museum)
    return this.request(`/user/events?${q.toString()}`)
  }

  async bookTicket(bookingData) {
    return this.request('/user/bookings/ticket', {
      method: 'POST',
      body: bookingData,
    })
  }

  async registerForEvent(eventId, registrationData) {
    return this.request(`/user/events/${eventId}/register`, {
      method: 'POST',
      body: registrationData,
    })
  }

  async requestArtifactRental(artifactId, rentalData) {
    return this.request(`/user/rentals/${artifactId}`, {
      method: 'POST',
      body: rentalData,
    })
  }

  async getUserBookings({ page = 1, limit = 20, status } = {}) {
    const q = new URLSearchParams({ page: String(page), limit: String(limit) })
    if (status) q.set('status', status)
    return this.request(`/user/bookings?${q.toString()}`)
  }

  async addToFavorites(itemId, itemType) {
    return this.request('/user/favorites', {
      method: 'POST',
      body: { itemId, itemType },
    })
  }

  async removeFromFavorites(itemId) {
    return this.request(`/user/favorites/${itemId}`, {
      method: 'DELETE',
    })
  }

  async getUserFavorites() {
    return this.request('/user/favorites')
  }

  async submitReview(itemId, itemType, reviewData) {
    return this.request(`/user/reviews`, {
      method: 'POST',
      body: { itemId, itemType, ...reviewData },
    })
  }

  async getUserReviews() {
    return this.request('/user/reviews')
  }

  // Artifacts management
  async listArtifacts({ page = 1, limit = 20, status } = {}) {
    const q = new URLSearchParams({ page: String(page), limit: String(limit) })
    if (status) q.set('status', status)
    return this.request(`/admin/artifacts?${q.toString()}`)
  }

  async approveArtifact(artifactId) {
    return this.request(`/admin/artifacts/${artifactId}/approve`, {
      method: 'PUT',
    })
  }

  async rejectArtifact(artifactId, reason = '') {
    return this.request(`/admin/artifacts/${artifactId}/reject`, {
      method: 'PUT',
      body: { reason },
    })
  }


  async getActivityLogs({ page = 1, limit = 50 } = {}) {
    const q = new URLSearchParams({ page: String(page), limit: String(limit) })
    return this.request(`/admin/activity-logs?${q.toString()}`)
  }

  // Analytics
  async getAnalytics(timeRange = 'month') {
    return this.request(`/admin/analytics?timeRange=${timeRange}`)
  }

  // Backup and maintenance
  async createBackup() {
    return this.request('/admin/backup', {
      method: 'POST',
    })
  }

  // Standard HTTP methods for general API usage
  async get(url, params = {}) {
    const queryString = Object.keys(params).length > 0 ? '?' + new URLSearchParams(params).toString() : '';
    return this.request(`${url}${queryString}`, {
      method: 'GET'
    });
  }

  async post(url, data = {}) {
    return this.request(url, {
      method: 'POST',
      body: data
    });
  }

  async put(url, data = {}) {
    return this.request(url, {
      method: 'PUT',
      body: data
    });
  }

  async delete(url) {
    return this.request(url, {
      method: 'DELETE'
    });
  }

  async patch(url, data = {}) {
    return this.request(url, {
      method: 'PATCH',
      body: data
    });
  }

  // Course/Education endpoints
  async getCourses(filters = {}) {
    await this.checkBackendAvailability();
    const params = new URLSearchParams(filters);
    return this.request(`/learning/courses?${params.toString()}`);
  }

  async getCourseById(courseId) {
    await this.checkBackendAvailability();
    return this.request(`/learning/courses/${courseId}`);
  }

  async getCourseLessons(courseId) {
    await this.checkBackendAvailability();
    return this.request(`/learning/courses/${courseId}/lessons`);
  }

  async enrollInCourse(courseId) {
    return this.request(`/learning/courses/${courseId}/enroll`, {
      method: 'POST'
    });
  }

  async getCourseProgress(courseId) {
    return this.request(`/learning/courses/${courseId}/progress`);
  }

  async updateLessonProgress(courseId, lessonId, completed = true) {
    return this.request(`/learning/courses/${courseId}/lessons/${lessonId}/progress`, {
      method: 'PUT',
      body: { completed }
    });
  }

  // Course management for educators
  async getEducationStats() {
    return this.request('/learning/admin/stats');
  }

  async getAdminCourses(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/learning/admin/courses?${params.toString()}`);
  }

  async createCourse(courseData) {
    try {
      await this.checkBackendAvailability();

      return this.request('/learning/admin/courses', {
        method: 'POST',
        body: courseData
      });
    } catch (error) {
      throw error;
    }
  }

  async updateCourse(courseId, courseData) {
    return this.request(`/learning/admin/courses/${courseId}`, {
      method: 'PUT',
      body: courseData
    });
  }

  async deleteCourse(courseId) {
    return this.request(`/learning/admin/courses/${courseId}`, {
      method: 'DELETE'
    });
  }

  // ======================
  // EDUCATIONAL TOURS API
  // ======================

  async getEducationalTours(params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    const endpoint = `/educational-tours${queryParams ? `?${queryParams}` : ''}`;
    return this.request(endpoint);
  }

  async getEducationalTour(id) {
    return this.request(`/educational-tours/${id}`);
  }

  async createEducationalTour(data) {
    return this.request('/educational-tours', {
      method: 'POST',
      body: data
    });
  }

  async updateEducationalTour(id, data) {
    return this.request(`/educational-tours/${id}`, {
      method: 'PUT',
      body: data
    });
  }

  async deleteEducationalTour(id) {
    return this.request(`/educational-tours/${id}`, {
      method: 'DELETE'
    });
  }

  // ======================
  // RENTAL REQUESTS API
  // ======================

  async getRentalArtifacts(params = {}) {
    const queryParams = new URLSearchParams(params).toString()
    const endpoint = `/rental/artifacts${queryParams ? `?${queryParams}` : ''}`
    return this.request(endpoint)
  }

  async getAllRentalArtifacts(params = {}) {
    const queryParams = new URLSearchParams(params).toString()
    const endpoint = `/rental/all-artifacts${queryParams ? `?${queryParams}` : ''}`
    return this.request(endpoint)
  }

  async getRentalRequests(params = {}) {
    const queryParams = new URLSearchParams(params).toString()
    const endpoint = `/rental${queryParams ? `?${queryParams}` : ''}`
    return this.request(endpoint)
  }

  async getAllRentalRequests(params = {}) {
    const queryParams = new URLSearchParams(params).toString()
    const endpoint = `/rental${queryParams ? `?${queryParams}` : ''}`
    return this.request(endpoint)
  }

  async getRentalRequestById(id) {
    return this.request(`/rental/${id}`)
  }

  async createRentalRequest(data) {
    return this.request('/rental', {
      method: 'POST',
      body: data
    })
  }

  async updateRentalRequest(id, data) {
    return this.request(`/rental/${id}/status`, {
      method: 'PATCH',
      body: data
    })
  }

  async updateRentalRequestStatus(id, data) {
    return this.updateRentalRequest(id, data);
  }

  async addRentalRequestMessage(id, data) {
    return this.request(`/rental/${id}/messages`, {
      method: 'POST',
      body: data
    })
  }

  async updateRentalPaymentStatus(id, data) {
    return this.request(`/rental/${id}/payment-status`, {
      method: 'PATCH',
      body: data
    })
  }

  async updateRental3DIntegration(id, data) {
    return this.request(`/rental/${id}/3d-integration`, {
      method: 'PATCH',
      body: data
    })
  }

  async updateRentalVirtualMuseum(id, data) {
    return this.request(`/rental/${id}/virtual-museum`, {
      method: 'PATCH',
      body: data
    })
  }

  async getRentalStatistics(params = {}) {
    const queryParams = new URLSearchParams(params).toString()
    return this.request(`/rental/statistics${queryParams ? `?${queryParams}` : ''}`)
  }

  async getMuseumRentalStats(params = {}) {
    const queryParams = new URLSearchParams(params).toString()
    return this.request(`/rental/museum-stats${queryParams ? `?${queryParams}` : ''}`)
  }

  // ======================
  // VIRTUAL MUSEUM API
  // ======================

  // Public access
  async getActiveVirtualArtifacts(params = {}) {
    const queryParams = new URLSearchParams(params).toString()
    return this.request(`/virtual-museum/active?${queryParams}`)
  }

  // Super Admin Management
  async getAdminVirtualArtifacts(params = {}) {
    const queryParams = new URLSearchParams(params).toString()
    return this.request(`/super-admin/virtual-museum?${queryParams}`)
  }

  async createVirtualArtifact(data) {
    return this.request('/super-admin/virtual-museum', {
      method: 'POST',
      body: data
    })
  }

  async updateVirtualArtifact(id, data) {
    return this.request(`/super-admin/virtual-museum/${id}`, {
      method: 'PUT',
      body: data
    })
  }

  async deleteVirtualArtifact(id) {
    return this.request(`/super-admin/virtual-museum/${id}`, {
      method: 'DELETE'
    })
  }

  // File upload
  async uploadFile(file, type = 'image') {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)

    // Clean up corrupted tokens and get valid token
    cleanupCorruptedTokens()
    const token = getValidToken()

    const response = await fetch(`${this.baseURL}/upload`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    })

    if (!response.ok) {
      throw new Error('File upload failed')
    }

    return response.json()
  }

  // ======================
  // EDUCATIONAL PLATFORM API
  // ======================

  // QUIZZES - Super Admin creates, Visitors consume
  async createQuiz(quizData) {
    return this.request('/super-admin/quizzes', {
      method: 'POST',
      body: quizData
    })
  }

  async getAdminQuizzes(params = {}) {
    const queryParams = new URLSearchParams(params).toString()
    return this.request(`/super-admin/quizzes?${queryParams}`)
  }

  async updateQuiz(quizId, quizData) {
    return this.request(`/super-admin/quizzes/${quizId}`, {
      method: 'PUT',
      body: quizData
    })
  }

  async deleteQuiz(quizId) {
    return this.request(`/super-admin/quizzes/${quizId}`, {
      method: 'DELETE'
    })
  }

  async publishQuiz(quizId) {
    return this.request(`/super-admin/quizzes/${quizId}/publish`, {
      method: 'POST'
    })
  }

  // Visitor Quiz Access
  async getAvailableQuizzes(params = {}) {
    const queryParams = new URLSearchParams(params).toString()
    return this.request(`/visitor/quizzes?${queryParams}`)
  }

  async getQuizById(quizId) {
    return this.request(`/visitor/quizzes/${quizId}`)
  }

  async submitQuizAttempt(quizId, attemptData) {
    return this.request(`/visitor/quizzes/${quizId}/attempt`, {
      method: 'POST',
      body: attemptData
    })
  }

  async getQuizAttempts(params = {}) {
    const queryParams = new URLSearchParams(params).toString()
    return this.request(`/visitor/quiz-attempts?${queryParams}`)
  }

  // GAMES - Super Admin creates, Visitors play
  async createGame(gameData) {
    return this.request('/super-admin/games', {
      method: 'POST',
      body: gameData
    })
  }

  async getAdminGames(params = {}) {
    const queryParams = new URLSearchParams(params).toString()
    return this.request(`/super-admin/games?${queryParams}`)
  }

  async updateGame(gameId, gameData) {
    return this.request(`/super-admin/games/${gameId}`, {
      method: 'PUT',
      body: gameData
    })
  }

  async deleteGame(gameId) {
    return this.request(`/super-admin/games/${gameId}`, {
      method: 'DELETE'
    })
  }

  async publishGame(gameId) {
    return this.request(`/super-admin/games/${gameId}/publish`, {
      method: 'POST'
    })
  }

  // Visitor Game Access
  async getAvailableGames(params = {}) {
    const queryParams = new URLSearchParams(params).toString()
    return this.request(`/visitor/games?${queryParams}`)
  }

  async getGameById(gameId) {
    return this.request(`/visitor/games/${gameId}`)
  }

  async submitGameScore(gameId, scoreData) {
    return this.request(`/visitor/games/${gameId}/score`, {
      method: 'POST',
      body: scoreData
    })
  }

  async getGameScores(params = {}) {
    const queryParams = new URLSearchParams(params).toString()
    return this.request(`/visitor/game-scores?${queryParams}`)
  }

  // LIVE SESSIONS - Super Admin creates, Visitors attend
  async createLiveSession(sessionData) {
    return this.request('/super-admin/live-sessions', {
      method: 'POST',
      body: sessionData
    })
  }

  async getAdminLiveSessions(params = {}) {
    const queryParams = new URLSearchParams(params).toString()
    return this.request(`/super-admin/live-sessions?${queryParams}`)
  }

  async updateLiveSession(sessionId, sessionData) {
    return this.request(`/super-admin/live-sessions/${sessionId}`, {
      method: 'PUT',
      body: sessionData
    })
  }

  async deleteLiveSession(sessionId) {
    return this.request(`/super-admin/live-sessions/${sessionId}`, {
      method: 'DELETE'
    })
  }

  async startLiveSession(sessionId) {
    return this.request(`/super-admin/live-sessions/${sessionId}/start`, {
      method: 'POST'
    })
  }

  async endLiveSession(sessionId) {
    return this.request(`/super-admin/live-sessions/${sessionId}/end`, {
      method: 'POST'
    })
  }

  // Visitor Live Session Access
  async getUpcomingLiveSessions(params = {}) {
    const queryParams = new URLSearchParams(params).toString()
    return this.request(`/visitor/live-sessions?${queryParams}`)
  }

  async joinLiveSession(sessionId) {
    return this.request(`/visitor/live-sessions/${sessionId}/join`, {
      method: 'POST'
    })
  }

  async getLiveSessionDetails(sessionId) {
    return this.request(`/visitor/live-sessions/${sessionId}`)
  }

  // FLASHCARDS - Super Admin creates, Visitors study
  async createFlashcardSet(flashcardData) {
    return this.request('/super-admin/flashcards', {
      method: 'POST',
      body: flashcardData
    })
  }

  async getAdminFlashcardSets(params = {}) {
    const queryParams = new URLSearchParams(params).toString()
    return this.request(`/super-admin/flashcards?${queryParams}`)
  }

  async updateFlashcardSet(setId, flashcardData) {
    return this.request(`/super-admin/flashcards/${setId}`, {
      method: 'PUT',
      body: flashcardData
    })
  }

  async deleteFlashcardSet(setId) {
    return this.request(`/super-admin/flashcards/${setId}`, {
      method: 'DELETE'
    })
  }

  async publishFlashcardSet(setId) {
    return this.request(`/super-admin/flashcards/${setId}/publish`, {
      method: 'POST'
    })
  }

  // Visitor Flashcard Access
  async getAvailableFlashcardSets(params = {}) {
    const queryParams = new URLSearchParams(params).toString()
    return this.request(`/visitor/flashcards?${queryParams}`)
  }

  async getFlashcardSetById(setId) {
    return this.request(`/visitor/flashcards/${setId}`)
  }

  async saveFlashcardProgress(setId, progressData) {
    return this.request(`/visitor/flashcards/${setId}/progress`, {
      method: 'POST',
      body: progressData
    })
  }

  // PROGRESS TRACKING - Super Admin manages, Visitors view
  async createAssignment(assignmentData) {
    return this.request('/super-admin/assignments', {
      method: 'POST',
      body: assignmentData
    })
  }

  async getAdminAssignments(params = {}) {
    const queryParams = new URLSearchParams(params).toString()
    return this.request(`/super-admin/assignments?${queryParams}`)
  }

  async updateAssignment(assignmentId, assignmentData) {
    return this.request(`/super-admin/assignments/${assignmentId}`, {
      method: 'PUT',
      body: assignmentData
    })
  }

  async gradeAssignment(assignmentId, submissionId, gradeData) {
    return this.request(`/super-admin/assignments/${assignmentId}/submissions/${submissionId}/grade`, {
      method: 'POST',
      body: gradeData
    })
  }

  async addComment(targetType, targetId, commentData) {
    return this.request(`/super-admin/comments`, {
      method: 'POST',
      body: { targetType, targetId, ...commentData }
    })
  }

  // Visitor Progress Access
  async getMyAssignments(params = {}) {
    const queryParams = new URLSearchParams(params).toString()
    return this.request(`/visitor/assignments?${queryParams}`)
  }

  async submitAssignment(assignmentId, submissionData) {
    return this.request(`/visitor/assignments/${assignmentId}/submit`, {
      method: 'POST',
      body: submissionData
    })
  }

  async getMyProgress(params = {}) {
    const queryParams = new URLSearchParams(params).toString()
    return this.request(`/visitor/progress?${queryParams}`)
  }

  async getMyComments(params = {}) {
    const queryParams = new URLSearchParams(params).toString()
    return this.request(`/visitor/comments?${queryParams}`)
  }

  // MY COLLECTIONS - Visitor managed
  async getMyCollections(params = {}) {
    const queryParams = new URLSearchParams(params).toString()
    return this.request(`/visitor/collections?${queryParams}`)
  }

  async createCollection(collectionData) {
    return this.request('/visitor/collections', {
      method: 'POST',
      body: collectionData
    })
  }

  async updateCollection(collectionId, collectionData) {
    return this.request(`/visitor/collections/${collectionId}`, {
      method: 'PUT',
      body: collectionData
    })
  }

  async deleteCollection(collectionId) {
    return this.request(`/visitor/collections/${collectionId}`, {
      method: 'DELETE'
    })
  }

  async addToCollection(collectionId, itemData) {
    return this.request(`/visitor/collections/${collectionId}/items`, {
      method: 'POST',
      body: itemData
    })
  }

  async removeFromCollection(collectionId, itemId) {
    return this.request(`/visitor/collections/${collectionId}/items/${itemId}`, {
      method: 'DELETE'
    })
  }

  async getCollectionItems(collectionId, params = {}) {
    const queryParams = new URLSearchParams(params).toString()
    return this.request(`/visitor/collections/${collectionId}/items?${queryParams}`)
  }

  // COMMUNITY LEADERBOARD - Visitor view, Admin analytics
  async getLeaderboard(params = {}) {
    const queryParams = new URLSearchParams(params).toString()
    return this.request(`/visitor/leaderboard?${queryParams}`)
  }

  async getMyRanking(params = {}) {
    const queryParams = new URLSearchParams(params).toString()
    return this.request(`/visitor/leaderboard/ranking?${queryParams}`)
  }

  // Admin Leaderboard Analytics
  async getLeaderboardAnalytics(params = {}) {
    const queryParams = new URLSearchParams(params).toString()
    return this.request(`/super-admin/leaderboard/analytics?${queryParams}`)
  }

  async getLeaderboardStats(params = {}) {
    const queryParams = new URLSearchParams(params).toString()
    return this.request(`/super-admin/leaderboard/stats?${queryParams}`)
  }

  // TOOLS & RESOURCES - Super Admin manages, Visitors access
  async createTool(toolData) {
    return this.request('/super-admin/tools', {
      method: 'POST',
      body: toolData
    })
  }

  async getAdminTools(params = {}) {
    const queryParams = new URLSearchParams(params).toString()
    return this.request(`/super-admin/tools?${queryParams}`)
  }

  async updateTool(toolId, toolData) {
    return this.request(`/super-admin/tools/${toolId}`, {
      method: 'PUT',
      body: toolData
    })
  }

  async deleteTool(toolId) {
    return this.request(`/super-admin/tools/${toolId}`, {
      method: 'DELETE'
    })
  }

  async publishTool(toolId) {
    return this.request(`/super-admin/tools/${toolId}/publish`, {
      method: 'POST'
    })
  }

  // Visitor Tools Access
  async getAvailableTools(params = {}) {
    const queryParams = new URLSearchParams(params).toString()
    return this.request(`/visitor/tools?${queryParams}`)
  }

  async getToolById(toolId) {
    return this.request(`/visitor/tools/${toolId}`)
  }

  async logToolUsage(toolId, usageData) {
    return this.request(`/visitor/tools/${toolId}/usage`, {
      method: 'POST',
      body: usageData
    })
  }

  async getMyToolUsage(params = {}) {
    const queryParams = new URLSearchParams(params).toString()
    return this.request(`/visitor/tools/usage?${queryParams}`)
  }

  // RESOURCES
  async createResource(resourceData) {
    return this.request('/super-admin/resources', {
      method: 'POST',
      body: resourceData
    })
  }

  async getAdminResources(params = {}) {
    const queryParams = new URLSearchParams(params).toString()
    return this.request(`/super-admin/resources?${queryParams}`)
  }

  async updateResource(resourceId, resourceData) {
    return this.request(`/super-admin/resources/${resourceId}`, {
      method: 'PUT',
      body: resourceData
    })
  }

  async deleteResource(resourceId) {
    return this.request(`/super-admin/resources/${resourceId}`, {
      method: 'DELETE'
    })
  }

  async publishResource(resourceId) {
    return this.request(`/super-admin/resources/${resourceId}/publish`, {
      method: 'POST'
    })
  }

  // Visitor Resources Access
  async getAvailableResources(params = {}) {
    const queryParams = new URLSearchParams(params).toString()
    return this.request(`/visitor/resources?${queryParams}`)
  }

  async getResourceById(resourceId) {
    return this.request(`/visitor/resources/${resourceId}`)
  }

  async downloadResource(resourceId) {
    return this.request(`/visitor/resources/${resourceId}/download`, {
      method: 'POST'
    })
  }

  async logResourceAccess(resourceId, accessData) {
    return this.request(`/visitor/resources/${resourceId}/access`, {
      method: 'POST',
      body: accessData
    })
  }


  async uploadArtifactImage(artifactId, imageFile) {
    const formData = new FormData()
    formData.append('image', imageFile)
    return this.request(`/artifacts/${artifactId}/images`, {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
    })
  }

  async deleteArtifactImage(artifactId, imageId) {
    return this.request(`/artifacts/${artifactId}/images/${imageId}`, {
      method: 'DELETE',
    })
  }

  // Communications endpoints
  async getCommunications(params = {}) {
    const queryParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        queryParams.append(key, value)
      }
    })
    return this.request(`/communications?${queryParams}`)
  }

  async getCommunication(id) {
    return this.request(`/communications/${id}`)
  }

  async createCommunication(communicationData) {
    return this.request('/communications', {
      method: 'POST',
      body: communicationData,
    })
  }

  async replyToCommunication(id, replyData) {
    return this.request(`/communications/${id}/reply`, {
      method: 'POST',
      body: replyData,
    })
  }

  async markCommunicationAsRead(id) {
    return this.request(`/communications/${id}/read`, {
      method: 'PUT',
    })
  }

  async archiveCommunication(id) {
    return this.request(`/communications/${id}/archive`, {
      method: 'PUT',
    })
  }

  async getUnreadCount() {
    return this.request('/communications/unread-count')
  }

  async getCommunicationConversation(id) {
    return this.request(`/communications/${id}/conversation`)
  }





  // Visitor Registration endpoints
  async registerVisitor(visitorData) {
    return this.request('/visitor-registration', {
      method: 'POST',
      body: JSON.stringify(visitorData),
    })
  }

  async getVisitorRegistrations(params = {}) {
    const queryParams = new URLSearchParams(params).toString()
    return this.request(`/visitor-registration?${queryParams}`)
  }

  async getVisitorRegistrationById(id) {
    return this.request(`/visitor-registration/${id}`)
  }

  async updateVisitorStatus(id, statusData) {
    return this.request(`/visitor-registration/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(statusData),
    })
  }

  async getVisitorAnalytics(params = {}) {
    const queryParams = new URLSearchParams(params).toString()
    return this.request(`/visitor-registration/analytics?${queryParams}`)
  }

  async refreshVisitorData() {
    return this.request('/visitor-registration/refresh', {
      method: 'POST'
    })
  }
}

export const api = new ApiClient()
export default api
