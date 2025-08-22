/**
 * Role Hierarchy Middleware
 * 
 * Provides specialized middleware functions for role-based access control
 * with hierarchical permissions where higher roles can access lower role functions
 */

const { hasRoleAccess, hasAnyRoleAccess, isHigherRole, canManageRole } = require('../utils/roleHierarchy');

/**
 * Super Admin Only Access - Exclusive to super_admin role
 * Use this for super admin exclusive functions
 */
const requireSuperAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Access denied, no user found'
    });
  }

  if (req.user.role !== 'superAdmin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Super Admin privileges required.'
    });
  }
  
  next();
};

/**
 * Museum Admin or Higher Access
 * Allows super_admin and museum_admin roles
 */
const requireMuseumAdminOrHigher = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Access denied, no user found'
    });
  }

  if (!hasRoleAccess(req.user.role, 'museum_admin')) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Museum Admin or higher privileges required.'
    });
  }
  
  next();
};

/**
 * Admin or Higher Access
 * Allows super_admin and admin roles
 */
const requireAdminOrHigher = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Access denied, no user found'
    });
  }

  if (!hasRoleAccess(req.user.role, 'admin')) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin or higher privileges required.'
    });
  }
  
  next();
};

/**
 * Tour Admin or Higher Access
 * Allows super_admin, admin, museum_admin, and tour_admin roles
 */
const requireTourAdminOrHigher = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Access denied, no user found'
    });
  }

  if (!hasRoleAccess(req.user.role, 'tour_admin')) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Tour Admin or higher privileges required.'
    });
  }
  
  next();
};

/**
 * Museum Staff or Higher Access
 * Allows all admin roles and museum staff
 */
const requireMuseumStaffOrHigher = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Access denied, no user found'
    });
  }

  if (!hasRoleAccess(req.user.role, 'museum')) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Museum staff or higher privileges required.'
    });
  }
  
  next();
};

/**
 * Check if user can manage a specific role
 * Used for user management operations
 */
const canManageUserRole = (targetRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied, no user found'
      });
    }

    if (!canManageRole(req.user.role, targetRole)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Cannot manage users with role: ${targetRole}`
      });
    }
    
    next();
  };
};

/**
 * Dynamic role requirement
 * Use when you need to specify minimum role dynamically
 */
const requireRole = (minRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied, no user found'
      });
    }

    if (!hasRoleAccess(req.user.role, minRole)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Minimum role required: ${minRole}`
      });
    }
    
    next();
  };
};

/**
 * Multiple roles allowed (OR condition)
 * User must have at least one of the specified roles or higher
 */
const requireAnyRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied, no user found'
      });
    }

    if (!hasAnyRoleAccess(req.user.role, allowedRoles)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. One of these roles required: ${allowedRoles.join(', ')}`
      });
    }
    
    next();
  };
};

/**
 * Strict role requirement (exact match only)
 * Use when you need exact role match without hierarchy
 */
const requireExactRole = (...exactRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied, no user found'
      });
    }

    if (!exactRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Exact role match required: ${exactRoles.join(' or ')}`
      });
    }
    
    next();
  };
};

module.exports = {
  requireSuperAdmin,
  requireMuseumAdminOrHigher,
  requireAdminOrHigher,
  requireTourAdminOrHigher,
  requireMuseumStaffOrHigher,
  canManageUserRole,
  requireRole,
  requireAnyRole,
  requireExactRole
};
