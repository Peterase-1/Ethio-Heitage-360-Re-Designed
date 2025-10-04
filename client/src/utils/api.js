import mockApi from './mockApi.js';
import { getValidToken, cleanupCorruptedTokens } from './tokenUtils.js';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'
const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true'

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL
    this.useMockAPI = USE_MOCK_API
    this.backendChecked = false
    // Check backend availability on initialization
    this.checkBackendAvailability()
  }

  async checkBackendAvailability() {
    // Skip check if we're forced to use mock API
    if (USE_MOCK_API) {
      this.useMockAPI = true
      this.backendChecked = true
      return false
    }

    if (this.backendChecked) return !this.useMockAPI

    // For production deployments, assume backend is available and let individual requests handle failures
    if (this.baseURL === '/api') {
      console.log('Using Netlify proxy - assuming backend available')
      this.useMockAPI = false
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
          this.useMockAPI = false
        } catch {
          // Even if we can't parse JSON, if we got a 200 response, backend is available
          console.log('Backend is available (non-JSON response)')
          this.useMockAPI = false
        }
      } else {
        console.log('Backend not available, falling back to mock API')
        this.useMockAPI = true
      }
    } catch (error) {
      console.log('Backend check failed:', error.message, '- using mock API')
      this.useMockAPI = true
    }

    this.backendChecked = true
    return !this.useMockAPI
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    
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

      if (this.useMockAPI) {
        return mockApi.login(credentials)
      }

      const result = await this.request('/auth/login', {
        method: 'POST',
        body: credentials,
      })

      return result

    } catch (error) {
      // Don't fall back to mock API for authentication errors (4xx)
      // Only fall back for network/server errors (5xx)
      if (error.message.includes('Invalid email or password') ||
        error.message.includes('User not found') ||
        error.message.includes('400') ||
        error.message.includes('401') ||
        error.message.includes('403')) {
        // These are authentication errors, don't fall back
        throw error
      }

      // Fall back to mock API only for network/server errors
      try {
        return mockApi.login(credentials)
      } catch (mockError) {
        throw new Error('Authentication service unavailable')
      }
    }
  }

  async register(userData) {
    await this.checkBackendAvailability()

    if (this.useMockAPI) {
      return mockApi.register(userData)
    }

    const result = await this.request('/auth/register', {
      method: 'POST',
      body: userData,
    })

    return result
  }

  async logout() {
    if (this.useMockAPI) {
      return mockApi.logout()
    }

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
    if (this.useMockAPI) {
      // Mock API doesn't need refresh tokens, return current session
      cleanupCorruptedTokens()
      const token = getValidToken()
      if (token) {
        return { token, success: true }
      }
      throw new Error('No valid session')
    }

    return this.request('/auth/refresh', {
      method: 'POST',
      body: { refreshToken }
    })
  }

  async getCurrentUser() {
    try {
      if (this.useMockAPI) {
        cleanupCorruptedTokens()
        const token = getValidToken()
        return mockApi.getCurrentUser(token)
      }

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

      // If we get here, the result is unexpected
      console.warn('Unexpected response structure from getCurrentUser:', result)
      return { user: null }

    } catch (error) {
      console.error('getCurrentUser failed:', error)

      // If token is invalid, clear it and throw error
      if (error.message.includes('Token is not valid') || error.message.includes('invalid token')) {
        console.warn('Invalid token detected, clearing localStorage')
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }

      // Try fallback to mock API if real API fails
      try {
        cleanupCorruptedTokens()
        const token = getValidToken()
        if (token) {
          return mockApi.getCurrentUser(token)
        }
      } catch (mockError) {
        console.error('Mock API fallback also failed:', mockError)
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
    if (this.useMockAPI) {
      return mockApi.getUsers()
    }
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
    if (this.useMockAPI) {
      return mockApi.getSystemStats()
    }
    return this.request('/admin/stats')
  }

  // New: Super Admin API endpoints for enhanced dashboard
  async getSuperAdminDashboard() {
    if (this.useMockAPI) {
      return mockApi.getSystemStats()
    }
    return this.request('/super-admin/dashboard')
  }

  async getSuperAdminAnalytics(params = {}) {
    if (this.useMockAPI) {
      return mockApi.getSystemStats()
    }
    const queryParams = new URLSearchParams(params).toString()
    return this.request(`/super-admin/analytics?${queryParams}`)
  }

  async getSuperAdminAuditLogs(params = {}) {
    if (this.useMockAPI) {
      return { success: true, logs: [], pagination: { total: 0, page: 1, limit: 50, pages: 0 } }
    }
    const queryParams = new URLSearchParams(params).toString()
    return this.request(`/super-admin/audit-logs?${queryParams}`)
  }

  async getSuperAdminAuditLogsSummary(params = {}) {
    if (this.useMockAPI) {
      return { success: true, summary: { totalActions: 0, successRate: 0 } }
    }
    const queryParams = new URLSearchParams(params).toString()
    return this.request(`/super-admin/audit-logs/summary?${queryParams}`)
  }

  // Legacy method for backward compatibility
  async getAdminStats() {
    return this.getSuperAdminDashboard()
  }

  // Performance Analytics API endpoints
  async getPerformanceOverview(params = {}) {
    if (this.useMockAPI) {
      return mockApi.getSystemStats()
    }
    const queryParams = new URLSearchParams(params).toString()
    return this.request(`/super-admin/performance-analytics/overview?${queryParams}`)
  }

  async getSystemHealth(params = {}) {
    if (this.useMockAPI) {
      return { success: true, data: { systemMetrics: {}, apiMetrics: {}, dbMetrics: {} } }
    }
    const queryParams = new URLSearchParams(params).toString()
    return this.request(`/super-admin/performance-analytics/system-health?${queryParams}`)
  }

  async getUserActivityMetrics(params = {}) {
    if (this.useMockAPI) {
      return { success: true, data: { activityTrends: [], userDemographics: [], peakHours: [] } }
    }
    const queryParams = new URLSearchParams(params).toString()
    return this.request(`/super-admin/performance-analytics/user-activity?${queryParams}`)
  }

  async getMuseumPerformanceMetrics(params = {}) {
    if (this.useMockAPI) {
      return { success: true, data: { topMuseums: [], performanceTrends: [], museumStats: [] } }
    }
    const queryParams = new URLSearchParams(params).toString()
    return this.request(`/super-admin/performance-analytics/museum-performance?${queryParams}`)
  }

  async getArtifactPerformanceMetrics(params = {}) {
    if (this.useMockAPI) {
      return { success: true, data: { performanceTrends: [], topArtifacts: [], categoryPerformance: [] } }
    }
    const queryParams = new URLSearchParams(params).toString()
    return this.request(`/super-admin/performance-analytics/artifact-performance?${queryParams}`)
  }

  async getRentalPerformanceMetrics(params = {}) {
    if (this.useMockAPI) {
      return { success: true, data: { rentalTrends: [], rentalStats: [], topRentedItems: [] } }
    }
    const queryParams = new URLSearchParams(params).toString()
    return this.request(`/super-admin/performance-analytics/rental-performance?${queryParams}`)
  }

  async getApiPerformanceMetrics(params = {}) {
    if (this.useMockAPI) {
      return { success: true, data: { apiTrends: [], endpointPerformance: [], errorAnalysis: [] } }
    }
    const queryParams = new URLSearchParams(params).toString()
    return this.request(`/super-admin/performance-analytics/api-performance?${queryParams}`)
  }

  // Enhanced User Management API endpoints
  async bulkUserActions(action, userIds, data = {}) {
    if (this.useMockAPI) {
      return { success: true, message: 'Bulk action completed', modifiedCount: userIds.length }
    }
    return this.request('/super-admin/users/bulk-actions', {
      method: 'POST',
      body: { action, userIds, data }
    })
  }

  async getUserStatistics(params = {}) {
    if (this.useMockAPI) {
      return { success: true, statistics: { totalUsers: 0, activeUsers: 0, newUsers: 0 } }
    }
    const queryParams = new URLSearchParams(params).toString()
    return this.request(`/super-admin/users/statistics?${queryParams}`)
  }

  async searchUsers(params = {}) {
    if (this.useMockAPI) {
      return { success: true, users: [], pagination: { total: 0, page: 1, limit: 20, pages: 0 } }
    }
    const queryParams = new URLSearchParams(params).toString()
    return this.request(`/super-admin/users/search?${queryParams}`)
  }

  // Enhanced Museum Oversight API endpoints
  async getMuseumStatistics(params = {}) {
    if (this.useMockAPI) {
      return { success: true, statistics: { totalMuseums: 0, activeMuseums: 0, pendingMuseums: 0 } }
    }
    const queryParams = new URLSearchParams(params).toString()
    return this.request(`/super-admin/museums/statistics?${queryParams}`)
  }

  async bulkMuseumActions(action, museumIds, data = {}) {
    if (this.useMockAPI) {
      return { success: true, message: 'Bulk action completed', modifiedCount: museumIds.length }
    }
    return this.request('/super-admin/museums/bulk-actions', {
      method: 'POST',
      body: { action, museumIds, data }
    })
  }

  async searchMuseums(params = {}) {
    if (this.useMockAPI) {
      return { success: true, museums: [], pagination: { total: 0, page: 1, limit: 20, pages: 0 } }
    }
    const queryParams = new URLSearchParams(params).toString()
    return this.request(`/super-admin/museums/search?${queryParams}`)
  }

  async getMuseumPerformance(params = {}) {
    if (this.useMockAPI) {
      return { success: true, performance: { museumStats: [], artifactStats: { total: 0, active: 0 } } }
    }
    const queryParams = new URLSearchParams(params).toString()
    return this.request(`/super-admin/museums/performance?${queryParams}`)
  }

  async getMuseumAuditLogs(params = {}) {
    if (this.useMockAPI) {
      return { success: true, logs: [], pagination: { total: 0, page: 1, limit: 20, pages: 0 } }
    }
    const queryParams = new URLSearchParams(params).toString()
    return this.request(`/super-admin/museums/audit-logs?${queryParams}`)
  }

  async listUsers({ page = 1, limit = 20, role } = {}) {
    if (this.useMockAPI) {
      return mockApi.listUsers({ page, limit, role })
    }
    const q = new URLSearchParams({ page: String(page), limit: String(limit) })
    if (role) q.set('role', role)
    return this.request(`/super-admin/users?${q.toString()}`)
  }

  async setUserRole(userId, role) {
    if (this.useMockAPI) {
      return mockApi.setUserRole(userId, role)
    }
    return this.updateUserRole(userId, role)
  }

  async createUser(data) {
    if (this.useMockAPI) {
      return mockApi.createUser(data)
    }
    return this.request('/super-admin/users', {
      method: 'POST',
      body: data,
    })
  }

  async updateUser(userId, data) {
    if (this.useMockAPI) {
      return mockApi.updateUser(userId, data)
    }
    return this.request(`/super-admin/users/${userId}`, {
      method: 'PUT',
      body: data,
    })
  }

  async deleteUser(userId) {
    if (this.useMockAPI) {
      return mockApi.deleteUser(userId)
    }
    return this.request(`/super-admin/users/${userId}`, {
      method: 'DELETE',
    })
  }

  // Museums oversight
  async listMuseums({ page = 1, limit = 20 } = {}) {
    if (this.useMockAPI) {
      return mockApi.listMuseums({ page, limit })
    }
    const q = new URLSearchParams({ page: String(page), limit: String(limit) })
    return this.request(`/admin/museums?${q.toString()}`)
  }

  async setMuseumVerified(userId, verified) {
    if (this.useMockAPI) {
      return mockApi.setMuseumVerified(userId, verified)
    }
    return this.request(`/admin/museums/${userId}/verify`, {
      method: 'PUT',
      body: { verified },
    })
  }

  // System management
  async getSystemSettings() {
    if (this.useMockAPI) {
      return mockApi.getSystemSettings()
    }
    return this.request('/admin/settings')
  }

  async updateSystemSettings(settings) {
    if (this.useMockAPI) {
      return mockApi.updateSystemSettings(settings)
    }
    return this.request('/admin/settings', {
      method: 'PUT',
      body: settings,
    })
  }

  // Content moderation (multi-type)
  async listContent({ page = 1, limit = 20, status, type, museum, q } = {}) {
    if (this.useMockAPI) {
      return mockApi.listContent({ page, limit, status, type, museum, q })
    }
    const qparams = new URLSearchParams({ page: String(page), limit: String(limit) })
    if (status) qparams.set('status', status)
    if (type) qparams.set('type', type)
    if (museum) qparams.set('museum', museum)
    if (q) qparams.set('q', q)
    return this.request(`/admin/content?${qparams.toString()}`)
  }

  async approveContent(contentId, contentType) {
    if (this.useMockAPI) {
      return mockApi.approveContent(contentId, contentType)
    }
    return this.request(`/admin/content/${contentType}/${contentId}/approve`, { method: 'PUT' })
  }

  async rejectContent(contentId, contentType, reason = '') {
    if (this.useMockAPI) {
      return mockApi.rejectContent(contentId, contentType, reason)
    }
    return this.request(`/admin/content/${contentType}/${contentId}/reject`, { method: 'PUT', body: { reason } })
  }

  // Museum Admin endpoints
  async getMuseumProfile() {
    await this.checkBackendAvailability();

    if (this.useMockAPI) {
      return mockApi.getMuseumProfile()
    }

    return this.request('/museums/profile', {
      method: 'GET',
    });
  }

  async updateMuseumProfile(profileData) {
    await this.checkBackendAvailability();

    if (this.useMockAPI) {
      return mockApi.updateMuseumProfile(profileData)
    }

    return this.request('/museums/profile', {
      method: 'PUT',
      body: profileData,
    })
  }

  async uploadMuseumLogo(logoFile) {
    if (this.useMockAPI) {
      return mockApi.uploadMuseumLogo(logoFile)
    }

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

    if (this.useMockAPI) {
      return {
        totalArtifacts: 45,
        artifactsInStorage: 12,
        activeRentals: 3,
        monthlyVisitors: 0
      }
    }

    return this.request('/museums/dashboard/stats', {
      method: 'GET',
    });
  }

  async getRecentArtifacts() {
    await this.checkBackendAvailability();

    if (this.useMockAPI) {
      return [
        { id: 1, name: 'Ancient Vase', status: 'on_display', lastUpdated: '2025-08-01' },
        { id: 2, name: 'Historical Painting', status: 'in_storage', lastUpdated: '2025-08-05' }
      ]
    }

    return this.request('/museums/dashboard/recent-artifacts', {
      method: 'GET',
    });
  }

  async getPendingTasks() {
    await this.checkBackendAvailability();

    if (this.useMockAPI) {
      return [
        { id: 1, type: 'rental_request', title: '3 Rental requests awaiting approval', priority: 'medium' },
        { id: 2, type: 'draft_event', title: '2 Virtual museum submissions in review', priority: 'low' },
        { id: 3, type: 'staff_approval', title: '1 New staff member to onboard', priority: 'high' }
      ]
    }

    return this.request('/museums/dashboard/pending-tasks', {
      method: 'GET',
    });
  }

  async getMuseumArtifacts({ page = 1, limit = 20, category, search } = {}) {
    if (this.useMockAPI) {
      return mockApi.getMuseumArtifacts({ page, limit, category, search })
    }
    const q = new URLSearchParams({ page: String(page), limit: String(limit) })
    if (category) q.set('category', category)
    if (search) q.set('search', search)
    return this.request(`/museum-admin/artifacts?${q.toString()}`)
  }

  async createMuseumArtifact(artifactData) {
    if (this.useMockAPI) {
      return mockApi.createMuseumArtifact(artifactData)
    }
    return this.request('/museum-admin/artifacts', {
      method: 'POST',
      body: artifactData,
    })
  }

  async updateMuseumArtifact(id, artifactData) {
    if (this.useMockAPI) {
      return mockApi.updateMuseumArtifact(id, artifactData)
    }
    return this.request(`/museum-admin/artifacts/${id}`, {
      method: 'PUT',
      body: artifactData,
    })
  }

  async deleteMuseumArtifact(id) {
    if (this.useMockAPI) {
      return mockApi.deleteMuseumArtifact(id)
    }
    return this.request(`/museum-admin/artifacts/${id}`, {
      method: 'DELETE',
    })
  }

  async getMuseumAnalytics() {
    if (this.useMockAPI) {
      return mockApi.getMuseumAnalytics()
    }
    return this.request('/museum-admin/analytics')
  }

  async getMuseumDashboard() {
    return this.request('/museum-admin/dashboard')
  }


  async submitVirtualMuseum(submissionData) {
    if (this.useMockAPI) {
      return mockApi.submitVirtualMuseum(submissionData)
    }
    return this.request('/museum-admin/virtual-submissions', {
      method: 'POST',
      body: submissionData,
    })
  }

  async getVirtualSubmissions({ page = 1, limit = 20, status } = {}) {
    if (this.useMockAPI) {
      return mockApi.getVirtualSubmissions({ page, limit, status })
    }
    const q = new URLSearchParams({ page: String(page), limit: String(limit) })
    if (status) q.set('status', status)
    return this.request(`/museum-admin/virtual-submissions?${q.toString()}`)
  }

  // Museum Admin Communications endpoints
  async getMuseumCommunications(params = {}) {
    const queryParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        queryParams.append(key, value)
      }
    })
    return this.request(`/museum-admin/communications?${queryParams}`)
  }

  async getMuseumCommunication(id) {
    return this.request(`/museum-admin/communications/${id}`)
  }

  async createMuseumCommunication(communicationData) {
    return this.request('/museum-admin/communications', {
      method: 'POST',
      body: communicationData,
    })
  }

  async replyToMuseumCommunication(id, replyData) {
    return this.request(`/museum-admin/communications/${id}/reply`, {
      method: 'POST',
      body: replyData,
    })
  }

  async markMuseumCommunicationAsRead(id) {
    return this.request(`/museum-admin/communications/${id}/read`, {
      method: 'PUT',
    })
  }

  async archiveMuseumCommunication(id) {
    return this.request(`/museum-admin/communications/${id}/archive`, {
      method: 'PUT',
    })
  }

  async getMuseumUnreadCount() {
    return this.request('/museum-admin/communications/unread-count')
  }

  async getMuseumCommunicationConversation(id) {
    return this.request(`/museum-admin/communications/${id}/conversation`)
  }

  // User/Visitor endpoints
  async getUserProfile() {
    if (this.useMockAPI) {
      return mockApi.getUserProfile()
    }
    return this.request('/user/profile')
  }

  async updateUserProfile(profileData) {
    if (this.useMockAPI) {
      return mockApi.updateUserProfile(profileData)
    }
    return this.request('/user/profile', {
      method: 'PUT',
      body: profileData,
    })
  }

  async getVirtualExhibits({ search, category, museum } = {}) {
    if (this.useMockAPI) {
      return mockApi.getVirtualExhibits({ search, category, museum })
    }
    const q = new URLSearchParams()
    if (search) q.set('search', search)
    if (category) q.set('category', category)
    if (museum) q.set('museum', museum)
    return this.request(`/user/virtual-exhibits?${q.toString()}`)
  }

  async getHeritageSites({ search, region } = {}) {
    if (this.useMockAPI) {
      return mockApi.getHeritageSites({ search, region })
    }
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
    if (this.useMockAPI) {
      return mockApi.createHeritageSite(data);
    }
    return this.request('/super-admin/heritage-sites', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateHeritageSite(siteId, data) {
    if (this.useMockAPI) {
      return mockApi.updateHeritageSite(siteId, data);
    }
    return this.request(`/super-admin/heritage-sites/${siteId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteHeritageSite(siteId) {
    if (this.useMockAPI) {
      return mockApi.deleteHeritageSite(siteId);
    }
    return this.request(`/super-admin/heritage-sites/${siteId}`, {
      method: 'DELETE'
    });
  }

  async getHeritageSite(siteId) {
    if (this.useMockAPI) {
      return mockApi.getHeritageSite(siteId);
    }
    return this.request(`/super-admin/heritage-sites/${siteId}`);
  }

  async getUserArtifacts({ page = 1, limit = 20, search, category, museum } = {}) {
    if (this.useMockAPI) {
      return mockApi.getUserArtifacts({ page, limit, search, category, museum })
    }
    const q = new URLSearchParams({ page: String(page), limit: String(limit) })
    if (search) q.set('search', search)
    if (category) q.set('category', category)
    if (museum) q.set('museum', museum)
    return this.request(`/user/artifacts?${q.toString()}`)
  }

  async getUpcomingEvents({ search, date, museum } = {}) {
    if (this.useMockAPI) {
      return mockApi.getUpcomingEvents({ search, date, museum })
    }
    const q = new URLSearchParams()
    if (search) q.set('search', search)
    if (date) q.set('date', date)
    if (museum) q.set('museum', museum)
    return this.request(`/user/events?${q.toString()}`)
  }

  async bookTicket(bookingData) {
    if (this.useMockAPI) {
      return mockApi.bookTicket(bookingData)
    }
    return this.request('/user/bookings/ticket', {
      method: 'POST',
      body: bookingData,
    })
  }

  async registerForEvent(eventId, registrationData) {
    if (this.useMockAPI) {
      return mockApi.registerForEvent(eventId, registrationData)
    }
    return this.request(`/user/events/${eventId}/register`, {
      method: 'POST',
      body: registrationData,
    })
  }

  async requestArtifactRental(artifactId, rentalData) {
    if (this.useMockAPI) {
      return mockApi.requestArtifactRental(artifactId, rentalData)
    }
    return this.request(`/user/rentals/${artifactId}`, {
      method: 'POST',
      body: rentalData,
    })
  }

  async getUserBookings({ page = 1, limit = 20, status } = {}) {
    if (this.useMockAPI) {
      return mockApi.getUserBookings({ page, limit, status })
    }
    const q = new URLSearchParams({ page: String(page), limit: String(limit) })
    if (status) q.set('status', status)
    return this.request(`/user/bookings?${q.toString()}`)
  }

  async addToFavorites(itemId, itemType) {
    if (this.useMockAPI) {
      return mockApi.addToFavorites(itemId, itemType)
    }
    return this.request('/user/favorites', {
      method: 'POST',
      body: { itemId, itemType },
    })
  }

  async removeFromFavorites(itemId) {
    if (this.useMockAPI) {
      return mockApi.removeFromFavorites(itemId)
    }
    return this.request(`/user/favorites/${itemId}`, {
      method: 'DELETE',
    })
  }

  async getUserFavorites() {
    if (this.useMockAPI) {
      return mockApi.getUserFavorites()
    }
    return this.request('/user/favorites')
  }

  async submitReview(itemId, itemType, reviewData) {
    if (this.useMockAPI) {
      return mockApi.submitReview(itemId, itemType, reviewData)
    }
    return this.request(`/user/reviews`, {
      method: 'POST',
      body: { itemId, itemType, ...reviewData },
    })
  }

  async getUserReviews() {
    if (this.useMockAPI) {
      return mockApi.getUserReviews()
    }
    return this.request('/user/reviews')
  }

  // Artifacts management
  async listArtifacts({ page = 1, limit = 20, status } = {}) {
    if (this.useMockAPI) {
      return mockApi.listArtifacts({ page, limit, status })
    }
    const q = new URLSearchParams({ page: String(page), limit: String(limit) })
    if (status) q.set('status', status)
    return this.request(`/admin/artifacts?${q.toString()}`)
  }

  async approveArtifact(artifactId) {
    if (this.useMockAPI) {
      return mockApi.approveArtifact(artifactId)
    }
    return this.request(`/admin/artifacts/${artifactId}/approve`, {
      method: 'PUT',
    })
  }

  async rejectArtifact(artifactId, reason = '') {
    if (this.useMockAPI) {
      return mockApi.rejectArtifact(artifactId, reason)
    }
    return this.request(`/admin/artifacts/${artifactId}/reject`, {
      method: 'PUT',
      body: { reason },
    })
  }


  async getActivityLogs({ page = 1, limit = 50 } = {}) {
    if (this.useMockAPI) {
      return mockApi.getActivityLogs({ page, limit })
    }
    const q = new URLSearchParams({ page: String(page), limit: String(limit) })
    return this.request(`/admin/activity-logs?${q.toString()}`)
  }

  // Analytics
  async getAnalytics(timeRange = 'month') {
    if (this.useMockAPI) {
      return mockApi.getAnalytics(timeRange)
    }
    return this.request(`/admin/analytics?timeRange=${timeRange}`)
  }

  // Backup and maintenance
  async createBackup() {
    if (this.useMockAPI) {
      return mockApi.createBackup()
    }
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
    try {
      await this.checkBackendAvailability();

      if (this.useMockAPI) {
        const params = new URLSearchParams(filters);
        const endpoint = `/education/public/courses?${params.toString()}`;
        return mockApi.getCourses(endpoint);
      }

      const params = new URLSearchParams(filters);
      return this.request(`/learning/courses?${params.toString()}`);
    } catch (error) {
      // Fallback to mock API on error
      const params = new URLSearchParams(filters);
      const endpoint = `/education/public/courses?${params.toString()}`;
      return mockApi.getCourses(endpoint);
    }
  }

  async getCourseById(courseId) {
    try {
      await this.checkBackendAvailability();

      if (this.useMockAPI) {
        return mockApi.getCourseById(courseId);
      }

      return this.request(`/learning/courses/${courseId}`);
    } catch (error) {
      return mockApi.getCourseById(courseId);
    }
  }

  async getCourseLessons(courseId) {
    try {
      await this.checkBackendAvailability();

      if (this.useMockAPI) {
        return mockApi.getCourseLessons(courseId);
      }

      return this.request(`/learning/courses/${courseId}/lessons`);
    } catch (error) {
      return mockApi.getCourseLessons(courseId);
    }
  }

  async enrollInCourse(courseId) {
    try {
      await this.checkBackendAvailability();

      if (this.useMockAPI) {
        return mockApi.enrollInCourse(courseId);
      }

      return this.request(`/learning/courses/${courseId}/enroll`, {
        method: 'POST'
      });
    } catch (error) {
      return mockApi.enrollInCourse(courseId);
    }
  }

  async getCourseProgress(courseId) {
    try {
      await this.checkBackendAvailability();

      if (this.useMockAPI) {
        return mockApi.getCourseProgress(courseId);
      }

      return this.request(`/learning/courses/${courseId}/progress`);
    } catch (error) {
      return mockApi.getCourseProgress(courseId);
    }
  }

  async updateLessonProgress(courseId, lessonId, completed = true) {
    try {
      await this.checkBackendAvailability();

      if (this.useMockAPI) {
        return mockApi.updateLessonProgress(courseId, lessonId, completed);
      }

      return this.request(`/learning/courses/${courseId}/lessons/${lessonId}/progress`, {
        method: 'PUT',
        body: { completed }
      });
    } catch (error) {
      return mockApi.updateLessonProgress(courseId, lessonId, completed);
    }
  }

  // Course management for educators
  async createCourse(courseData) {
    try {
      await this.checkBackendAvailability();

      if (this.useMockAPI) {
        return mockApi.createCourse(courseData);
      }

      return this.request('/learning/courses', {
        method: 'POST',
        body: courseData
      });
    } catch (error) {
      return mockApi.createCourse(courseData);
    }
  }

  async updateCourse(courseId, courseData) {
    try {
      await this.checkBackendAvailability();

      if (this.useMockAPI) {
        return mockApi.updateCourse(courseId, courseData);
      }

      return this.request(`/learning/courses/${courseId}`, {
        method: 'PUT',
        body: courseData
      });
    } catch (error) {
      return mockApi.updateCourse(courseId, courseData);
    }
  }

  async deleteCourse(courseId) {
    try {
      await this.checkBackendAvailability();

      if (this.useMockAPI) {
        return mockApi.deleteCourse(courseId);
      }

      return this.request(`/learning/courses/${courseId}`, {
        method: 'DELETE'
      });
    } catch (error) {
      return mockApi.deleteCourse(courseId);
    }
  }

  // ======================
  // RENTAL REQUESTS API
  // ======================

  async getRentalArtifacts(params = {}) {
    try {
      await this.checkBackendAvailability();

      if (this.useMockAPI) {
        return mockApi.getRentalArtifacts(params);
      }

      const queryParams = new URLSearchParams(params).toString()
      const endpoint = `/rentals/artifacts${queryParams ? `?${queryParams}` : ''}`
      return this.request(endpoint)
    } catch (error) {
      return mockApi.getRentalArtifacts(params);
    }
  }

  async getAllRentalRequests(params = {}) {
    try {
      await this.checkBackendAvailability();

      if (this.useMockAPI) {
        return mockApi.getAllRentalRequests(params);
      }

      const queryParams = new URLSearchParams(params).toString()
      const endpoint = `/rentals${queryParams ? `?${queryParams}` : ''}`
      return this.request(endpoint)
    } catch (error) {
      return mockApi.getAllRentalRequests(params);
    }
  }

  async getRentalRequestById(id) {
    try {
      await this.checkBackendAvailability();

      if (this.useMockAPI) {
        return mockApi.getRentalRequestById(id);
      }

      return this.request(`/rentals/${id}`)
    } catch (error) {
      return mockApi.getRentalRequestById(id);
    }
  }

  async createRentalRequest(data) {
    try {
      await this.checkBackendAvailability();

      if (this.useMockAPI) {
        return mockApi.createRentalRequest(data);
      }

      return this.request('/rentals', {
        method: 'POST',
        body: JSON.stringify(data)
      })
    } catch (error) {
      return mockApi.createRentalRequest(data);
    }
  }

  async updateRentalRequestStatus(id, data) {
    try {
      await this.checkBackendAvailability();

      if (this.useMockAPI) {
        return mockApi.updateRentalRequestStatus(id, data);
      }

      return this.request(`/rentals/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify(data)
      })
    } catch (error) {
      return mockApi.updateRentalRequestStatus(id, data);
    }
  }

  async addRentalRequestMessage(id, data) {
    try {
      await this.checkBackendAvailability();

      if (this.useMockAPI) {
        return mockApi.addRentalRequestMessage(id, data);
      }

      return this.request(`/rentals/${id}/messages`, {
        method: 'POST',
        body: JSON.stringify(data)
      })
    } catch (error) {
      return mockApi.addRentalRequestMessage(id, data);
    }
  }

  async updateRentalPaymentStatus(id, data) {
    try {
      await this.checkBackendAvailability();

      if (this.useMockAPI) {
        return mockApi.updateRentalPaymentStatus(id, data);
      }

      return this.request(`/rentals/${id}/payment-status`, {
        method: 'PATCH',
        body: JSON.stringify(data)
      })
    } catch (error) {
      return mockApi.updateRentalPaymentStatus(id, data);
    }
  }

  async updateRental3DIntegration(id, data) {
    try {
      await this.checkBackendAvailability();

      if (this.useMockAPI) {
        return mockApi.updateRental3DIntegration(id, data);
      }

      return this.request(`/rentals/${id}/3d-integration`, {
        method: 'PATCH',
        body: JSON.stringify(data)
      })
    } catch (error) {
      return mockApi.updateRental3DIntegration(id, data);
    }
  }

  async updateRentalVirtualMuseum(id, data) {
    try {
      await this.checkBackendAvailability();

      if (this.useMockAPI) {
        return mockApi.updateRentalVirtualMuseum(id, data);
      }

      return this.request(`/rentals/${id}/virtual-museum`, {
        method: 'PATCH',
        body: JSON.stringify(data)
      })
    } catch (error) {
      return mockApi.updateRentalVirtualMuseum(id, data);
    }
  }

  async getRentalStatistics() {
    try {
      await this.checkBackendAvailability();

      if (this.useMockAPI) {
        return mockApi.getRentalStatistics();
      }

      return this.request('/rentals/stats')
    } catch (error) {
      return mockApi.getRentalStatistics();
    }
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
    if (this.useMockAPI) {
      return mockApi.createQuiz(quizData)
    }
    return this.request('/super-admin/quizzes', {
      method: 'POST',
      body: quizData
    })
  }

  async getAdminQuizzes(params = {}) {
    if (this.useMockAPI) {
      return mockApi.getAdminQuizzes(params)
    }
    const queryParams = new URLSearchParams(params).toString()
    return this.request(`/super-admin/quizzes?${queryParams}`)
  }

  async updateQuiz(quizId, quizData) {
    if (this.useMockAPI) {
      return mockApi.updateQuiz(quizId, quizData)
    }
    return this.request(`/super-admin/quizzes/${quizId}`, {
      method: 'PUT',
      body: quizData
    })
  }

  async deleteQuiz(quizId) {
    if (this.useMockAPI) {
      return mockApi.deleteQuiz(quizId)
    }
    return this.request(`/super-admin/quizzes/${quizId}`, {
      method: 'DELETE'
    })
  }

  async publishQuiz(quizId) {
    if (this.useMockAPI) {
      return mockApi.publishQuiz(quizId)
    }
    return this.request(`/super-admin/quizzes/${quizId}/publish`, {
      method: 'POST'
    })
  }

  // Visitor Quiz Access
  async getAvailableQuizzes(params = {}) {
    if (this.useMockAPI) {
      return mockApi.getAvailableQuizzes(params)
    }
    const queryParams = new URLSearchParams(params).toString()
    return this.request(`/visitor/quizzes?${queryParams}`)
  }

  async getQuizById(quizId) {
    if (this.useMockAPI) {
      return mockApi.getQuizById(quizId)
    }
    return this.request(`/visitor/quizzes/${quizId}`)
  }

  async submitQuizAttempt(quizId, attemptData) {
    if (this.useMockAPI) {
      return mockApi.submitQuizAttempt(quizId, attemptData)
    }
    return this.request(`/visitor/quizzes/${quizId}/attempt`, {
      method: 'POST',
      body: attemptData
    })
  }

  async getQuizAttempts(params = {}) {
    if (this.useMockAPI) {
      return mockApi.getQuizAttempts(params)
    }
    const queryParams = new URLSearchParams(params).toString()
    return this.request(`/visitor/quiz-attempts?${queryParams}`)
  }

  // GAMES - Super Admin creates, Visitors play
  async createGame(gameData) {
    if (this.useMockAPI) {
      return mockApi.createGame(gameData)
    }
    return this.request('/super-admin/games', {
      method: 'POST',
      body: gameData
    })
  }

  async getAdminGames(params = {}) {
    if (this.useMockAPI) {
      return mockApi.getAdminGames(params)
    }
    const queryParams = new URLSearchParams(params).toString()
    return this.request(`/super-admin/games?${queryParams}`)
  }

  async updateGame(gameId, gameData) {
    if (this.useMockAPI) {
      return mockApi.updateGame(gameId, gameData)
    }
    return this.request(`/super-admin/games/${gameId}`, {
      method: 'PUT',
      body: gameData
    })
  }

  async deleteGame(gameId) {
    if (this.useMockAPI) {
      return mockApi.deleteGame(gameId)
    }
    return this.request(`/super-admin/games/${gameId}`, {
      method: 'DELETE'
    })
  }

  async publishGame(gameId) {
    if (this.useMockAPI) {
      return mockApi.publishGame(gameId)
    }
    return this.request(`/super-admin/games/${gameId}/publish`, {
      method: 'POST'
    })
  }

  // Visitor Game Access
  async getAvailableGames(params = {}) {
    if (this.useMockAPI) {
      return mockApi.getAvailableGames(params)
    }
    const queryParams = new URLSearchParams(params).toString()
    return this.request(`/visitor/games?${queryParams}`)
  }

  async getGameById(gameId) {
    if (this.useMockAPI) {
      return mockApi.getGameById(gameId)
    }
    return this.request(`/visitor/games/${gameId}`)
  }

  async submitGameScore(gameId, scoreData) {
    if (this.useMockAPI) {
      return mockApi.submitGameScore(gameId, scoreData)
    }
    return this.request(`/visitor/games/${gameId}/score`, {
      method: 'POST',
      body: scoreData
    })
  }

  async getGameScores(params = {}) {
    if (this.useMockAPI) {
      return mockApi.getGameScores(params)
    }
    const queryParams = new URLSearchParams(params).toString()
    return this.request(`/visitor/game-scores?${queryParams}`)
  }

  // LIVE SESSIONS - Super Admin creates, Visitors attend
  async createLiveSession(sessionData) {
    if (this.useMockAPI) {
      return mockApi.createLiveSession(sessionData)
    }
    return this.request('/super-admin/live-sessions', {
      method: 'POST',
      body: sessionData
    })
  }

  async getAdminLiveSessions(params = {}) {
    if (this.useMockAPI) {
      return mockApi.getAdminLiveSessions(params)
    }
    const queryParams = new URLSearchParams(params).toString()
    return this.request(`/super-admin/live-sessions?${queryParams}`)
  }

  async updateLiveSession(sessionId, sessionData) {
    if (this.useMockAPI) {
      return mockApi.updateLiveSession(sessionId, sessionData)
    }
    return this.request(`/super-admin/live-sessions/${sessionId}`, {
      method: 'PUT',
      body: sessionData
    })
  }

  async deleteLiveSession(sessionId) {
    if (this.useMockAPI) {
      return mockApi.deleteLiveSession(sessionId)
    }
    return this.request(`/super-admin/live-sessions/${sessionId}`, {
      method: 'DELETE'
    })
  }

  async startLiveSession(sessionId) {
    if (this.useMockAPI) {
      return mockApi.startLiveSession(sessionId)
    }
    return this.request(`/super-admin/live-sessions/${sessionId}/start`, {
      method: 'POST'
    })
  }

  async endLiveSession(sessionId) {
    if (this.useMockAPI) {
      return mockApi.endLiveSession(sessionId)
    }
    return this.request(`/super-admin/live-sessions/${sessionId}/end`, {
      method: 'POST'
    })
  }

  // Visitor Live Session Access
  async getUpcomingLiveSessions(params = {}) {
    if (this.useMockAPI) {
      return mockApi.getUpcomingLiveSessions(params)
    }
    const queryParams = new URLSearchParams(params).toString()
    return this.request(`/visitor/live-sessions?${queryParams}`)
  }

  async joinLiveSession(sessionId) {
    if (this.useMockAPI) {
      return mockApi.joinLiveSession(sessionId)
    }
    return this.request(`/visitor/live-sessions/${sessionId}/join`, {
      method: 'POST'
    })
  }

  async getLiveSessionDetails(sessionId) {
    if (this.useMockAPI) {
      return mockApi.getLiveSessionDetails(sessionId)
    }
    return this.request(`/visitor/live-sessions/${sessionId}`)
  }

  // FLASHCARDS - Super Admin creates, Visitors study
  async createFlashcardSet(flashcardData) {
    if (this.useMockAPI) {
      return mockApi.createFlashcardSet(flashcardData)
    }
    return this.request('/super-admin/flashcards', {
      method: 'POST',
      body: flashcardData
    })
  }

  async getAdminFlashcardSets(params = {}) {
    if (this.useMockAPI) {
      return mockApi.getAdminFlashcardSets(params)
    }
    const queryParams = new URLSearchParams(params).toString()
    return this.request(`/super-admin/flashcards?${queryParams}`)
  }

  async updateFlashcardSet(setId, flashcardData) {
    if (this.useMockAPI) {
      return mockApi.updateFlashcardSet(setId, flashcardData)
    }
    return this.request(`/super-admin/flashcards/${setId}`, {
      method: 'PUT',
      body: flashcardData
    })
  }

  async deleteFlashcardSet(setId) {
    if (this.useMockAPI) {
      return mockApi.deleteFlashcardSet(setId)
    }
    return this.request(`/super-admin/flashcards/${setId}`, {
      method: 'DELETE'
    })
  }

  async publishFlashcardSet(setId) {
    if (this.useMockAPI) {
      return mockApi.publishFlashcardSet(setId)
    }
    return this.request(`/super-admin/flashcards/${setId}/publish`, {
      method: 'POST'
    })
  }

  // Visitor Flashcard Access
  async getAvailableFlashcardSets(params = {}) {
    if (this.useMockAPI) {
      return mockApi.getAvailableFlashcardSets(params)
    }
    const queryParams = new URLSearchParams(params).toString()
    return this.request(`/visitor/flashcards?${queryParams}`)
  }

  async getFlashcardSetById(setId) {
    if (this.useMockAPI) {
      return mockApi.getFlashcardSetById(setId)
    }
    return this.request(`/visitor/flashcards/${setId}`)
  }

  async saveFlashcardProgress(setId, progressData) {
    if (this.useMockAPI) {
      return mockApi.saveFlashcardProgress(setId, progressData)
    }
    return this.request(`/visitor/flashcards/${setId}/progress`, {
      method: 'POST',
      body: progressData
    })
  }

  // PROGRESS TRACKING - Super Admin manages, Visitors view
  async createAssignment(assignmentData) {
    if (this.useMockAPI) {
      return mockApi.createAssignment(assignmentData)
    }
    return this.request('/super-admin/assignments', {
      method: 'POST',
      body: assignmentData
    })
  }

  async getAdminAssignments(params = {}) {
    if (this.useMockAPI) {
      return mockApi.getAdminAssignments(params)
    }
    const queryParams = new URLSearchParams(params).toString()
    return this.request(`/super-admin/assignments?${queryParams}`)
  }

  async updateAssignment(assignmentId, assignmentData) {
    if (this.useMockAPI) {
      return mockApi.updateAssignment(assignmentId, assignmentData)
    }
    return this.request(`/super-admin/assignments/${assignmentId}`, {
      method: 'PUT',
      body: assignmentData
    })
  }

  async gradeAssignment(assignmentId, submissionId, gradeData) {
    if (this.useMockAPI) {
      return mockApi.gradeAssignment(assignmentId, submissionId, gradeData)
    }
    return this.request(`/super-admin/assignments/${assignmentId}/submissions/${submissionId}/grade`, {
      method: 'POST',
      body: gradeData
    })
  }

  async addComment(targetType, targetId, commentData) {
    if (this.useMockAPI) {
      return mockApi.addComment(targetType, targetId, commentData)
    }
    return this.request(`/super-admin/comments`, {
      method: 'POST',
      body: { targetType, targetId, ...commentData }
    })
  }

  // Visitor Progress Access
  async getMyAssignments(params = {}) {
    if (this.useMockAPI) {
      return mockApi.getMyAssignments(params)
    }
    const queryParams = new URLSearchParams(params).toString()
    return this.request(`/visitor/assignments?${queryParams}`)
  }

  async submitAssignment(assignmentId, submissionData) {
    if (this.useMockAPI) {
      return mockApi.submitAssignment(assignmentId, submissionData)
    }
    return this.request(`/visitor/assignments/${assignmentId}/submit`, {
      method: 'POST',
      body: submissionData
    })
  }

  async getMyProgress(params = {}) {
    if (this.useMockAPI) {
      return mockApi.getMyProgress(params)
    }
    const queryParams = new URLSearchParams(params).toString()
    return this.request(`/visitor/progress?${queryParams}`)
  }

  async getMyComments(params = {}) {
    if (this.useMockAPI) {
      return mockApi.getMyComments(params)
    }
    const queryParams = new URLSearchParams(params).toString()
    return this.request(`/visitor/comments?${queryParams}`)
  }

  // MY COLLECTIONS - Visitor managed
  async getMyCollections(params = {}) {
    if (this.useMockAPI) {
      return mockApi.getMyCollections(params)
    }
    const queryParams = new URLSearchParams(params).toString()
    return this.request(`/visitor/collections?${queryParams}`)
  }

  async createCollection(collectionData) {
    if (this.useMockAPI) {
      return mockApi.createCollection(collectionData)
    }
    return this.request('/visitor/collections', {
      method: 'POST',
      body: collectionData
    })
  }

  async updateCollection(collectionId, collectionData) {
    if (this.useMockAPI) {
      return mockApi.updateCollection(collectionId, collectionData)
    }
    return this.request(`/visitor/collections/${collectionId}`, {
      method: 'PUT',
      body: collectionData
    })
  }

  async deleteCollection(collectionId) {
    if (this.useMockAPI) {
      return mockApi.deleteCollection(collectionId)
    }
    return this.request(`/visitor/collections/${collectionId}`, {
      method: 'DELETE'
    })
  }

  async addToCollection(collectionId, itemData) {
    if (this.useMockAPI) {
      return mockApi.addToCollection(collectionId, itemData)
    }
    return this.request(`/visitor/collections/${collectionId}/items`, {
      method: 'POST',
      body: itemData
    })
  }

  async removeFromCollection(collectionId, itemId) {
    if (this.useMockAPI) {
      return mockApi.removeFromCollection(collectionId, itemId)
    }
    return this.request(`/visitor/collections/${collectionId}/items/${itemId}`, {
      method: 'DELETE'
    })
  }

  async getCollectionItems(collectionId, params = {}) {
    if (this.useMockAPI) {
      return mockApi.getCollectionItems(collectionId, params)
    }
    const queryParams = new URLSearchParams(params).toString()
    return this.request(`/visitor/collections/${collectionId}/items?${queryParams}`)
  }

  // COMMUNITY LEADERBOARD - Visitor view, Admin analytics
  async getLeaderboard(params = {}) {
    if (this.useMockAPI) {
      return mockApi.getLeaderboard(params)
    }
    const queryParams = new URLSearchParams(params).toString()
    return this.request(`/visitor/leaderboard?${queryParams}`)
  }

  async getMyRanking(params = {}) {
    if (this.useMockAPI) {
      return mockApi.getMyRanking(params)
    }
    const queryParams = new URLSearchParams(params).toString()
    return this.request(`/visitor/leaderboard/ranking?${queryParams}`)
  }

  // Admin Leaderboard Analytics
  async getLeaderboardAnalytics(params = {}) {
    if (this.useMockAPI) {
      return mockApi.getLeaderboardAnalytics(params)
    }
    const queryParams = new URLSearchParams(params).toString()
    return this.request(`/super-admin/leaderboard/analytics?${queryParams}`)
  }

  async getLeaderboardStats(params = {}) {
    if (this.useMockAPI) {
      return mockApi.getLeaderboardStats(params)
    }
    const queryParams = new URLSearchParams(params).toString()
    return this.request(`/super-admin/leaderboard/stats?${queryParams}`)
  }

  // TOOLS & RESOURCES - Super Admin manages, Visitors access
  async createTool(toolData) {
    if (this.useMockAPI) {
      return mockApi.createTool(toolData)
    }
    return this.request('/super-admin/tools', {
      method: 'POST',
      body: toolData
    })
  }

  async getAdminTools(params = {}) {
    if (this.useMockAPI) {
      return mockApi.getAdminTools(params)
    }
    const queryParams = new URLSearchParams(params).toString()
    return this.request(`/super-admin/tools?${queryParams}`)
  }

  async updateTool(toolId, toolData) {
    if (this.useMockAPI) {
      return mockApi.updateTool(toolId, toolData)
    }
    return this.request(`/super-admin/tools/${toolId}`, {
      method: 'PUT',
      body: toolData
    })
  }

  async deleteTool(toolId) {
    if (this.useMockAPI) {
      return mockApi.deleteTool(toolId)
    }
    return this.request(`/super-admin/tools/${toolId}`, {
      method: 'DELETE'
    })
  }

  async publishTool(toolId) {
    if (this.useMockAPI) {
      return mockApi.publishTool(toolId)
    }
    return this.request(`/super-admin/tools/${toolId}/publish`, {
      method: 'POST'
    })
  }

  // Visitor Tools Access
  async getAvailableTools(params = {}) {
    if (this.useMockAPI) {
      return mockApi.getAvailableTools(params)
    }
    const queryParams = new URLSearchParams(params).toString()
    return this.request(`/visitor/tools?${queryParams}`)
  }

  async getToolById(toolId) {
    if (this.useMockAPI) {
      return mockApi.getToolById(toolId)
    }
    return this.request(`/visitor/tools/${toolId}`)
  }

  async logToolUsage(toolId, usageData) {
    if (this.useMockAPI) {
      return mockApi.logToolUsage(toolId, usageData)
    }
    return this.request(`/visitor/tools/${toolId}/usage`, {
      method: 'POST',
      body: usageData
    })
  }

  async getMyToolUsage(params = {}) {
    if (this.useMockAPI) {
      return mockApi.getMyToolUsage(params)
    }
    const queryParams = new URLSearchParams(params).toString()
    return this.request(`/visitor/tools/usage?${queryParams}`)
  }

  // RESOURCES
  async createResource(resourceData) {
    if (this.useMockAPI) {
      return mockApi.createResource(resourceData)
    }
    return this.request('/super-admin/resources', {
      method: 'POST',
      body: resourceData
    })
  }

  async getAdminResources(params = {}) {
    if (this.useMockAPI) {
      return mockApi.getAdminResources(params)
    }
    const queryParams = new URLSearchParams(params).toString()
    return this.request(`/super-admin/resources?${queryParams}`)
  }

  async updateResource(resourceId, resourceData) {
    if (this.useMockAPI) {
      return mockApi.updateResource(resourceId, resourceData)
    }
    return this.request(`/super-admin/resources/${resourceId}`, {
      method: 'PUT',
      body: resourceData
    })
  }

  async deleteResource(resourceId) {
    if (this.useMockAPI) {
      return mockApi.deleteResource(resourceId)
    }
    return this.request(`/super-admin/resources/${resourceId}`, {
      method: 'DELETE'
    })
  }

  async publishResource(resourceId) {
    if (this.useMockAPI) {
      return mockApi.publishResource(resourceId)
    }
    return this.request(`/super-admin/resources/${resourceId}/publish`, {
      method: 'POST'
    })
  }

  // Visitor Resources Access
  async getAvailableResources(params = {}) {
    if (this.useMockAPI) {
      return mockApi.getAvailableResources(params)
    }
    const queryParams = new URLSearchParams(params).toString()
    return this.request(`/visitor/resources?${queryParams}`)
  }

  async getResourceById(resourceId) {
    if (this.useMockAPI) {
      return mockApi.getResourceById(resourceId)
    }
    return this.request(`/visitor/resources/${resourceId}`)
  }

  async downloadResource(resourceId) {
    if (this.useMockAPI) {
      return mockApi.downloadResource(resourceId)
    }
    return this.request(`/visitor/resources/${resourceId}/download`, {
      method: 'POST'
    })
  }

  async logResourceAccess(resourceId, accessData) {
    if (this.useMockAPI) {
      return mockApi.logResourceAccess(resourceId, accessData)
    }
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
}

export const api = new ApiClient()
export default api
