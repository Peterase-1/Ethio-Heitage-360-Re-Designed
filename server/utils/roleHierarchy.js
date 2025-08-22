/**
 * Role Hierarchy and Permission System
 * 
 * This utility defines the role hierarchy where higher level roles
 * can access functionalities of lower level roles.
 * 
 * Hierarchy (highest to lowest):
 * 1. super_admin (Level 100) - Full system access + platform management
 * 2. admin (Level 80) - General admin functions
 * 3. museum_admin (Level 60) - Museum-specific admin functions  
 * 4. tour_admin (Level 50) - Tour management functions
 * 5. museum (Level 40) - Museum staff functions
 * 6. organizer (Level 30) - Tour organizer functions
 * 7. educator (Level 20) - Educational content functions
 * 8. visitor (Level 10) - Basic user functions
 */

// Role hierarchy levels (higher number = higher privilege)
const ROLE_LEVELS = {
  'visitor': 10,
  'educator': 20,
  'organizer': 30,
  'museum': 40,
  'tour_admin': 50,
  'museum_admin': 60,
  'admin': 80,
  'super_admin': 100
};

// Role permissions - what each role can access
const ROLE_PERMISSIONS = {
  'visitor': [
    'view_content',
    'book_tours',
    'rate_artifacts',
    'basic_chat'
  ],
  'educator': [
    'create_educational_content',
    'manage_courses',
    'view_learning_analytics'
  ],
  'organizer': [
    'create_tours',
    'manage_tours',
    'view_tour_analytics',
    'handle_bookings'
  ],
  'museum': [
    'add_artifacts',
    'edit_museum_artifacts',
    'view_museum_analytics',
    'manage_museum_content'
  ],
  'tour_admin': [
    'approve_tours',
    'manage_all_tours',
    'tour_system_settings'
  ],
  'museum_admin': [
    'manage_museum_profile',
    'approve_museum_artifacts',
    'manage_museum_staff',
    'approve_museum_rentals',
    'museum_analytics',
    'museum_events',
    'museum_notifications'
  ],
  'admin': [
    'manage_users',
    'manage_general_content',
    'view_platform_analytics'
  ],
  'super_admin': [
    'full_platform_access',
    'manage_all_users',
    'manage_all_museums',
    'manage_system_settings',
    'approve_all_content',
    'manage_rentals',
    'platform_analytics',
    'heritage_sites'
  ]
};

/**
 * Check if a user role has sufficient privileges for a required role
 * @param {string} userRole - The user's current role
 * @param {string} requiredRole - The role required for access
 * @returns {boolean} - True if user has sufficient privileges
 */
function hasRoleAccess(userRole, requiredRole) {
  const userLevel = ROLE_LEVELS[userRole] || 0;
  const requiredLevel = ROLE_LEVELS[requiredRole] || 0;
  
  return userLevel >= requiredLevel;
}

/**
 * Check if a user role has sufficient privileges for multiple possible roles
 * @param {string} userRole - The user's current role
 * @param {string[]} allowedRoles - Array of roles that are allowed access
 * @returns {boolean} - True if user has sufficient privileges for any of the roles
 */
function hasAnyRoleAccess(userRole, allowedRoles) {
  return allowedRoles.some(role => hasRoleAccess(userRole, role));
}

/**
 * Get all roles that a user can access (equal or lower level)
 * @param {string} userRole - The user's current role
 * @returns {string[]} - Array of roles the user can access
 */
function getAccessibleRoles(userRole) {
  const userLevel = ROLE_LEVELS[userRole] || 0;
  
  return Object.keys(ROLE_LEVELS).filter(role => {
    return ROLE_LEVELS[role] <= userLevel;
  });
}

/**
 * Check if a user has a specific permission
 * @param {string} userRole - The user's current role
 * @param {string} permission - The permission to check
 * @returns {boolean} - True if user has the permission
 */
function hasPermission(userRole, permission) {
  // Super admin has all permissions
  if (userRole === 'super_admin') {
    return true;
  }
  
  // Check if user role has the specific permission
  const rolePermissions = ROLE_PERMISSIONS[userRole] || [];
  return rolePermissions.includes(permission);
}

/**
 * Get all permissions for a user role
 * @param {string} userRole - The user's current role
 * @returns {string[]} - Array of permissions for the role
 */
function getRolePermissions(userRole) {
  if (userRole === 'super_admin') {
    // Super admin gets all permissions
    return Object.values(ROLE_PERMISSIONS).flat();
  }
  
  const userLevel = ROLE_LEVELS[userRole] || 0;
  let permissions = [];
  
  // Get permissions for current role and all lower roles
  Object.keys(ROLE_LEVELS).forEach(role => {
    if (ROLE_LEVELS[role] <= userLevel) {
      permissions = [...permissions, ...(ROLE_PERMISSIONS[role] || [])];
    }
  });
  
  // Remove duplicates
  return [...new Set(permissions)];
}

/**
 * Check if a role is higher than another role
 * @param {string} role1 - First role
 * @param {string} role2 - Second role
 * @returns {boolean} - True if role1 is higher than role2
 */
function isHigherRole(role1, role2) {
  const level1 = ROLE_LEVELS[role1] || 0;
  const level2 = ROLE_LEVELS[role2] || 0;
  
  return level1 > level2;
}

/**
 * Get the role level number
 * @param {string} role - The role name
 * @returns {number} - The role level (higher = more privileges)
 */
function getRoleLevel(role) {
  return ROLE_LEVELS[role] || 0;
}

/**
 * Check if user can manage another user based on roles
 * @param {string} managerRole - Role of the user trying to manage
 * @param {string} targetRole - Role of the user being managed
 * @returns {boolean} - True if manager can manage target
 */
function canManageRole(managerRole, targetRole) {
  // Super admin can manage anyone
  if (managerRole === 'super_admin') {
    return true;
  }
  
  // Users can only manage roles lower than their own
  return isHigherRole(managerRole, targetRole);
}

module.exports = {
  ROLE_LEVELS,
  ROLE_PERMISSIONS,
  hasRoleAccess,
  hasAnyRoleAccess,
  getAccessibleRoles,
  hasPermission,
  getRolePermissions,
  isHigherRole,
  getRoleLevel,
  canManageRole
};
