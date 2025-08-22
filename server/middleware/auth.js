
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { promisify } = require('util');

// Generate JWT Token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// Create and send token response
const createSendToken = (user, statusCode, res, message = 'Success') => {
  const token = signToken(user._id);
  
  const cookieOptions = {
    expires: new Date(
      Date.now() + (process.env.JWT_COOKIE_EXPIRES_IN || 7) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  };

  res.cookie('jwt', token, cookieOptions);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    success: true,
    message,
    token,
    data: {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        name: user.name || user.fullName,
        email: user.email,
        role: user.role,
        roleDisplayName: user.roleDisplayName,
        permissions: user.permissions,
        isActive: user.isActive,
        isVerified: user.isVerified,
        avatar: user.avatar,
        museumId: user.museumId,
        preferences: user.preferences,
        lastLogin: user.lastLogin,
        stats: user.stats
      }
    }
  });
};

// Authentication middleware - verify JWT token
const auth = async (req, res, next) => {
  try {
    // 1) Get token from header or cookie
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // 2) Verify token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3) Check if user still exists - handle both payload structures
    const userId = decoded.user ? decoded.user.id : decoded.id;
    const currentUser = await User.findById(userId).select('+password');
    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.'
      });
    }

    // 4) Check if user is active
    if (!currentUser.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.'
      });
    }

    // 5) Check if account is locked
    if (currentUser.isLocked) {
      return res.status(423).json({
        success: false,
        message: 'Your account is temporarily locked due to failed login attempts. Please try again later.'
      });
    }

    // 6) Grant access to protected route
    req.user = currentUser;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please log in again.'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Authentication error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Optional authentication - don't fail if no token
const optionalAuth = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      return next();
    }

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    const userId = decoded.user ? decoded.user.id : decoded.id;
    const currentUser = await User.findById(userId);
    
    if (currentUser && currentUser.isActive && !currentUser.isLocked) {
      req.user = currentUser;
    }
    
    next();
  } catch (error) {
    // If token verification fails, just continue without user
    next();
  }
};

// Role-based authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }

    next();
  };
};

// Permission-based authorization middleware
const requirePermission = (...permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Super admin has all permissions
    if (req.user.role === 'superAdmin') {
      return next();
    }

    // Check if user has at least one of the required permissions
    const hasPermission = permissions.some(permission => 
      req.user.hasPermission(permission)
    );

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have the required permissions.',
        required: permissions,
        userPermissions: req.user.permissions
      });
    }

    next();
  };
};

// Museum access authorization
const requireMuseumAccess = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  const museumId = req.params.museumId || req.body.museumId || req.query.museumId;
  
  if (!museumId) {
    return res.status(400).json({
      success: false,
      message: 'Museum ID is required'
    });
  }

  // Super admin can access all museums
  if (req.user.role === 'superAdmin') {
    return next();
  }

  // Museum admin can only access their own museum
  if (req.user.role === 'museumAdmin') {
    if (!req.user.canAccessMuseum(museumId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only access your assigned museum.'
      });
    }
    return next();
  }

  // Regular users typically can't perform admin actions on museums
  return res.status(403).json({
    success: false,
    message: 'Access denied. Museum administration access required.'
  });
};

// Account verification middleware
const requireVerification = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (!req.user.isVerified) {
    return res.status(403).json({
      success: false,
      message: 'Account verification required. Please verify your email address.',
      code: 'EMAIL_VERIFICATION_REQUIRED'
    });
  }

  next();
};

// Admin or self access middleware
const requireAdminOrSelf = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  const targetUserId = req.params.userId || req.params.id;
  
  // Admin can access anything
  if (['superAdmin', 'museumAdmin'].includes(req.user.role)) {
    return next();
  }

  // User can access their own data
  if (targetUserId && targetUserId === req.user._id.toString()) {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Access denied. You can only access your own data or admin access required.'
  });
};

// Export all middleware and utilities
module.exports = {
  // Core authentication
  auth,
  optionalAuth,
  
  // Authorization
  authorize,
  requirePermission,
  requireMuseumAccess,
  requireVerification,
  requireAdminOrSelf,
  
  // Utility functions
  signToken,
  createSendToken,
  
  // Role constants
  ROLES: {
    SUPER_ADMIN: 'superAdmin',
    MUSEUM_ADMIN: 'museumAdmin',
    USER: 'user'
  },
  
  // Permission constants
  PERMISSIONS: {
    // Super Admin Permissions
    MANAGE_ALL_USERS: 'manage_all_users',
    MANAGE_ALL_MUSEUMS: 'manage_all_museums',
    APPROVE_MUSEUM_REGISTRATIONS: 'approve_museum_registrations',
    MANAGE_HERITAGE_SITES: 'manage_heritage_sites',
    VIEW_PLATFORM_ANALYTICS: 'view_platform_analytics',
    MANAGE_SYSTEM_SETTINGS: 'manage_system_settings',
    APPROVE_HIGH_VALUE_RENTALS: 'approve_high_value_rentals',
    MANAGE_API_KEYS: 'manage_api_keys',
    VIEW_AUDIT_LOGS: 'view_audit_logs',
    
    // Museum Admin Permissions
    MANAGE_MUSEUM_PROFILE: 'manage_museum_profile',
    MANAGE_MUSEUM_STAFF: 'manage_museum_staff',
    MANAGE_ARTIFACTS: 'manage_artifacts',
    CREATE_EVENTS: 'create_events',
    APPROVE_LOCAL_RENTALS: 'approve_local_rentals',
    VIEW_MUSEUM_ANALYTICS: 'view_museum_analytics',
    SUGGEST_HERITAGE_SITES: 'suggest_heritage_sites',
    MANAGE_VIRTUAL_MUSEUM: 'manage_virtual_museum',
    
    // User/Visitor Permissions
    BOOK_EVENTS: 'book_events',
    REQUEST_RENTALS: 'request_rentals',
    VIEW_VIRTUAL_MUSEUM: 'view_virtual_museum',
    LEAVE_REVIEWS: 'leave_reviews',
    MANAGE_PROFILE: 'manage_profile'
  }
};

