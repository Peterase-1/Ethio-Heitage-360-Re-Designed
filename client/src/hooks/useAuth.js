import { useState, useEffect, createContext, useContext, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sessionExpired, setSessionExpired] = useState(false)
  const navigate = useNavigate()

  // Session validation function
  const validateSession = useCallback(async () => {
    const token = localStorage.getItem('token')
    const refreshToken = localStorage.getItem('refreshToken')
    
    if (!token) {
      setUser(null)
      return false
    }

    try {
      // Check token expiration with better error handling
      if (!token || typeof token !== 'string' || token.split('.').length !== 3) {
        console.warn('Invalid token format');
        return false;
      }
      
      const tokenParts = token.split('.');
      let tokenPayload;
      
      try {
        // Add padding if necessary for base64 decoding
        let base64Payload = tokenParts[1];
        while (base64Payload.length % 4) {
          base64Payload += '=';
        }
        tokenPayload = JSON.parse(atob(base64Payload));
      } catch (parseError) {
        console.error('Failed to parse JWT token:', parseError);
        // Clear invalid token
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        return false;
      }
      
      const now = Math.floor(Date.now() / 1000)
      const timeUntilExpiry = tokenPayload.exp - now

      // If token expires in less than 10 minutes, try to refresh
      if (timeUntilExpiry < 600 && refreshToken) {
        try {
          const response = await api.refreshToken(refreshToken)
          localStorage.setItem('token', response.token)
          if (response.refreshToken) {
            localStorage.setItem('refreshToken', response.refreshToken)
          }
          if (response.user) {
            setUser(response.user)
            localStorage.setItem('user', JSON.stringify(response.user))
          }
          return true
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError)
          // Clear invalid tokens
          localStorage.removeItem('token')
          localStorage.removeItem('refreshToken')
          localStorage.removeItem('user')
          setUser(null)
          setSessionExpired(true)
          return false
        }
      }

      return true
    } catch (error) {
      console.error('Session validation error:', error)
      return false
    }
  }, [])

  useEffect(() => {
    // Clean up any corrupted localStorage data
    const cleanupCorruptedData = () => {
      try {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        
        // Check if user data is valid JSON
        if (user) {
          try {
            JSON.parse(user);
          } catch (e) {
            console.warn('Corrupted user data detected, clearing...');
            localStorage.removeItem('user');
          }
        }
        
        // Check if token is valid format
        if (token && (typeof token !== 'string' || token.split('.').length !== 3)) {
          console.warn('Corrupted token detected, clearing...');
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
        }
      } catch (error) {
        console.error('Error during localStorage cleanup:', error);
      }
    };
    
    const initializeAuth = async () => {
      // Clean up corrupted data first
      cleanupCorruptedData();
      
      const token = localStorage.getItem('token')
      if (token) {
        try {
          // Validate session first
          const isValidSession = await validateSession()
          
          if (isValidSession) {
            // Try to get user from localStorage first
            const cachedUser = localStorage.getItem('user')
            if (cachedUser) {
              try {
                const parsedUser = JSON.parse(cachedUser)
                setUser(parsedUser)
              } catch (e) {
                console.warn('Invalid cached user data')
                localStorage.removeItem('user')
              }
            }

            // Fetch fresh user data if not cached or refresh user data periodically
            if (!cachedUser) {
              const userData = await api.getCurrentUser()
              if (userData && userData.user) {
                setUser(userData.user)
                localStorage.setItem('user', JSON.stringify(userData.user))
              } else {
                console.warn('No user data received from API')
                clearAuthData()
              }
            }
          } else {
            clearAuthData()
          }
        } catch (error) {
          console.error('Failed to initialize auth:', error)
          clearAuthData()
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    }

    const clearAuthData = () => {
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      localStorage.removeItem('lastLogin')
      setUser(null)
    }

    initializeAuth()

    // Set up periodic session validation (every 5 minutes)
    const sessionCheckInterval = setInterval(validateSession, 5 * 60 * 1000)

    return () => {
      clearInterval(sessionCheckInterval)
    }
  }, [validateSession])

  const login = async (credentials) => {
    try {
      console.log('🔄 LOGIN: Starting login process')
      console.log('📧 LOGIN: Credentials:', { email: credentials.email, password: '[HIDDEN]' })
      
      const response = await api.login(credentials)
      console.log('✅ LOGIN: Backend response received:', {
        success: response?.success,
        hasToken: !!response?.token,
        hasUser: !!response?.user,
        userRole: response?.user?.role,
        userName: response?.user?.name || response?.user?.firstName
      })
      
      const { token, refreshToken, user } = response
      
      // Store tokens and user data
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      localStorage.setItem('lastLogin', new Date().toISOString())
      
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken)
        console.log('🔑 LOGIN: Refresh token saved')
      }
      
      setUser(user)
      setSessionExpired(false)
      console.log('👤 LOGIN: User state updated, role:', user.role)
      
      // Check if there's a redirect URL stored
      const redirectUrl = sessionStorage.getItem('redirectAfterLogin')
      if (redirectUrl) {
        console.log('🔗 LOGIN: Found redirect URL:', redirectUrl)
        sessionStorage.removeItem('redirectAfterLogin')
        navigate(redirectUrl)
        return { success: true }
      }
      
      // Default redirect based on role (matching frontend routing expectations)
      console.log('🔀 LOGIN: Determining redirect for role:', user.role, 'type:', typeof user.role)
      switch (user.role) {
        case 'superAdmin':  // Backend returns 'superAdmin'
        case 'super_admin': // Support both variations
          console.log('🚀 LOGIN: Redirecting to super-admin dashboard')
          navigate('/super-admin')
          break
        case 'admin':
          console.log('🚀 LOGIN: Redirecting to admin dashboard')
          navigate('/admin')
          break
        case 'museumAdmin':  // Backend returns 'museumAdmin'
        case 'museum_admin': // Support both variations
        case 'museum':       // Support museum role
          console.log('🚀 LOGIN: Redirecting to museum dashboard')
          navigate('/museum-dashboard')
          break
        case 'organizer':
          console.log('🚀 LOGIN: Redirecting to organizer dashboard')
          navigate('/organizer-dashboard')
          break
        case 'user':    // Backend returns 'user' for visitors
        case 'visitor': // Support visitor alias
        default:
          console.log('🚀 LOGIN: Redirecting to visitor dashboard (default case)')
          navigate('/visitor-dashboard')
      }
      
      console.log('✅ LOGIN: Process completed successfully')
      return { success: true }
    } catch (error) {
      console.error('❌ LOGIN: Login failed:', error)
      return { success: false, message: error.message }
    }
  }

  const register = async (userData) => {
    try {
      console.log('🔄 REGISTRATION: Starting registration process')
      console.log('📝 Registration data being sent:', {
        ...userData,
        password: '[HIDDEN]'
      })
      
      // Use the role selected by the user during registration
      const response = await api.register(userData)
      console.log('✅ REGISTRATION: Backend response received:', {
        success: response?.success,
        hasToken: !!response?.token,
        hasUser: !!response?.user,
        userRole: response?.user?.role,
        userName: response?.user?.name || response?.user?.firstName
      })
      
      const { token, refreshToken, user } = response
      
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      localStorage.setItem('lastLogin', new Date().toISOString())
      
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken)
        console.log('🔑 REGISTRATION: Refresh token saved')
      }
      
      setUser(user)
      console.log('👤 REGISTRATION: User state updated, role:', user.role)
      
      // Redirect to appropriate dashboard (matching frontend routing expectations)
      console.log('🔀 REGISTRATION: Determining redirect for role:', user.role)
      switch (user.role) {
        case 'superAdmin':  // Backend returns 'superAdmin'
        case 'super_admin': // Support both variations
          console.log('🚀 REGISTRATION: Redirecting to super-admin dashboard')
          navigate('/super-admin')
          break
        case 'admin':
          console.log('🚀 REGISTRATION: Redirecting to admin dashboard')
          navigate('/admin')
          break
        case 'museumAdmin':  // Backend returns 'museumAdmin'
        case 'museum_admin': // Support both variations
        case 'museum':       // Support museum role
          console.log('🚀 REGISTRATION: Redirecting to museum dashboard')
          navigate('/museum-dashboard')
          break
        case 'organizer':
          console.log('🚀 REGISTRATION: Redirecting to organizer dashboard')
          navigate('/organizer-dashboard')
          break
        case 'user':    // Backend returns 'user' for visitors
        case 'visitor': // Support visitor alias
        default:
          console.log('🚀 REGISTRATION: Redirecting to visitor dashboard')
          navigate('/visitor-dashboard')
      }
      
      console.log('✅ REGISTRATION: Process completed successfully')
      return { success: true }
    } catch (error) {
      console.error('❌ REGISTRATION: Registration failed:', error)
      return { success: false, message: error.message }
    }
  }

  const logout = async () => {
    try {
      await api.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear all authentication data
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      localStorage.removeItem('lastLogin')
      setUser(null)
      setSessionExpired(false)
      navigate('/auth')
    }
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    validateSession,
    sessionExpired,
    isAuthenticated: !!user && !sessionExpired,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}