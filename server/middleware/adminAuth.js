const User = require('../models/User');

// Enhanced admin authentication middleware
const requireAdmin = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Allow superAdmin, museumAdmin, and legacy 'admin' roles
    const allowedAdminRoles = ['superAdmin', 'museumAdmin', 'admin'];
    if (!allowedAdminRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.',
        userRole: req.user.role,
        allowedRoles: allowedAdminRoles
      });
    }

    // Log admin actions for audit trail
    console.log(`[ADMIN ACTION] ${req.user.email} (${req.user.role}) - ${req.method} ${req.path}`, {
      timestamp: new Date().toISOString(),
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    next();
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error in admin authentication'
    });
  }
};

// Super admin only middleware (highest level access)
const requireSuperAdmin = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (req.user.role !== 'superAdmin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Super admin role required.',
        userRole: req.user.role
      });
    }

    // Log super admin actions
    console.log(`[SUPER ADMIN ACTION] ${req.user.email} - ${req.method} ${req.path}`, {
      timestamp: new Date().toISOString(),
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    next();
  } catch (error) {
    console.error('Super admin auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error in super admin authentication'
    });
  }
};

// Content manager middleware (for educational content management)
const requireContentManager = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const allowedRoles = ['admin', 'superAdmin', 'museumAdmin', 'contentManager'];
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Content management role required.',
        userRole: req.user.role,
        requiredRoles: allowedRoles
      });
    }

    next();
  } catch (error) {
    console.error('Content manager auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error in content manager authentication'
    });
  }
};

// Rate limiting middleware for admin operations
const adminRateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const requests = new Map();

  return (req, res, next) => {
    const key = req.user?.id || req.ip;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean old entries
    requests.forEach((timestamp, userId) => {
      if (timestamp < windowStart) {
        requests.delete(userId);
      }
    });

    // Count current requests
    const userRequests = Array.from(requests.values()).filter(
      timestamp => timestamp > windowStart
    ).length;

    if (userRequests >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: `Too many admin requests. Maximum ${maxRequests} requests per ${windowMs / 1000 / 60} minutes.`,
        retryAfter: Math.ceil((windowStart + windowMs - now) / 1000)
      });
    }

    requests.set(key, now);
    next();
  };
};

// Middleware to validate admin permissions for specific resources
const requireResourcePermission = (resourceType) => {
  return async (req, res, next) => {
    try {
      const { user } = req;
      
      // Super admins have access to everything
      if (user.role === 'superAdmin') {
        return next();
      }

      // Define role-based permissions
      const permissions = {
        admin: {
          courses: ['read', 'create', 'update', 'delete'],
          lessons: ['read', 'create', 'update', 'delete'],
          enrollments: ['read', 'update'],
          achievements: ['read', 'create', 'update'],
          certificates: ['read', 'revoke'],
          categories: ['read']
        },
        museumAdmin: {
          courses: ['read', 'create', 'update', 'delete'],
          lessons: ['read', 'create', 'update', 'delete'],
          enrollments: ['read', 'update'],
          achievements: ['read', 'create', 'update'],
          certificates: ['read', 'revoke'],
          categories: ['read', 'create', 'update'],
          artifacts: ['read', 'create', 'update', 'delete'],
          events: ['read', 'create', 'update', 'delete'],
          rentals: ['read', 'update']
        },
        contentManager: {
          courses: ['read', 'create', 'update'],
          lessons: ['read', 'create', 'update'],
          enrollments: ['read'],
          achievements: ['read', 'create', 'update'],
          certificates: ['read'],
          categories: ['read']
        }
      };

      const userPermissions = permissions[user.role];
      if (!userPermissions || !userPermissions[resourceType]) {
        return res.status(403).json({
          success: false,
          message: `Access denied. No permissions for ${resourceType}`,
          userRole: user.role
        });
      }

      // Determine required permission based on HTTP method
      const methodPermissions = {
        GET: 'read',
        POST: 'create',
        PUT: 'update',
        PATCH: 'update',
        DELETE: 'delete'
      };

      const requiredPermission = methodPermissions[req.method];
      if (!userPermissions[resourceType].includes(requiredPermission)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. No ${requiredPermission} permission for ${resourceType}`,
          userRole: user.role,
          hasPermissions: userPermissions[resourceType]
        });
      }

      next();
    } catch (error) {
      console.error('Resource permission middleware error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error in permission validation'
      });
    }
  };
};

// Audit logging middleware for admin actions
const auditLog = (action) => {
  return (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function(data) {
      // Log the admin action with result
      const logData = {
        timestamp: new Date().toISOString(),
        user: {
          id: req.user?.id,
          email: req.user?.email,
          role: req.user?.role
        },
        action,
        method: req.method,
        path: req.path,
        query: req.query,
        params: req.params,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        statusCode: res.statusCode,
        success: res.statusCode < 400
      };

      // In production, you might want to save this to a dedicated audit log collection
      console.log('[ADMIN AUDIT]', JSON.stringify(logData, null, 2));

      originalSend.call(this, data);
    };

    next();
  };
};

module.exports = {
  requireAdmin,
  requireSuperAdmin,
  requireContentManager,
  adminRateLimit,
  requireResourcePermission,
  auditLog
};
