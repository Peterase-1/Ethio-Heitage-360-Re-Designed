// Role Hierarchy and Permissions Implementation
// Ethiopian Heritage 360 Platform

/**
 * ROLE HIERARCHY (Highest to Lowest Authority)
 * 
 * 1. super_admin     - Platform Owner/God Mode
 * 2. admin          - Platform Administrator 
 * 3. museum_admin   - Individual Museum Manager
 * 4. museum         - Museum Staff/Curator
 * 5. organizer      - Tour Organizer
 * 6. educator       - Educational Content Creator
 * 7. tour_admin     - Tour Administrator
 * 8. visitor        - Regular User
 */

const PERMISSIONS = {
  // SUPER ADMIN - Platform-wide control
  super_admin: {
    // User Management - God Mode
    users: {
      create: true,          // Create any user with any role
      read: 'all',           // View all users across platform
      update: 'all',         // Edit any user's information
      delete: 'all',         // Delete any user account
      changeRole: 'all',     // Promote/demote any user to any role
      activate: 'all',       // Activate/deactivate any account
      viewSensitive: true    // View sensitive user data
    },
    
    // Museum Management - Full oversight
    museums: {
      create: true,          // Create museums directly
      read: 'all',           // View all museums
      update: 'all',         // Edit any museum's information
      delete: 'all',         // Delete/suspend museums
      approve: true,         // Approve/reject museum registrations
      verify: true,          // Verify museum authenticity
      override: true         // Override museum admin decisions
    },
    
    // Content Management - Final authority
    content: {
      artifacts: {
        read: 'all',         // View all artifacts from all museums
        approve: 'final',    // Final approval authority
        reject: 'final',     // Final rejection authority
        publish: true,       // Make content public
        unpublish: true,     // Remove content from public
        delete: 'all'        // Delete any artifact
      },
      events: {
        read: 'all',         // View all events
        approve: 'final',    // Final event approval
        reject: 'final',     // Reject events
        modify: 'all',       // Modify any event
        cancel: 'all'        // Cancel any event
      }
    },
    
    // Rental System - Final approval
    rentals: {
      read: 'all',           // View all rentals platform-wide
      approve: 'final',      // Final rental approval
      reject: 'final',       // Final rental rejection
      terminate: 'all',      // Terminate any active rental
      pricing: 'modify',     // Override rental pricing
      policies: 'create'     // Create rental policies
    },
    
    // System Administration
    system: {
      settings: 'full',      // Full system configuration
      backups: true,         // Create/restore backups
      logs: 'all',           // View all system logs
      analytics: 'global',   // Platform-wide analytics
      notifications: 'broadcast', // Send platform-wide notifications
      maintenance: true      // System maintenance mode
    }
  },

  // MUSEUM ADMIN - Museum-specific control
  museum_admin: {
    // User Management - Limited to their museum
    users: {
      create: false,         // Cannot create users
      read: 'museum_staff',  // Only view their museum staff
      update: 'museum_staff', // Only edit their staff profiles
      delete: false,         // Cannot delete user accounts
      changeRole: false,     // Cannot change roles
      activate: 'museum_staff', // Only activate/deactivate their staff
      invite: 'museum_staff' // Can invite people as museum staff
    },
    
    // Museum Management - Their museum only
    museums: {
      create: false,         // Cannot create new museums
      read: 'own',           // Only their museum
      update: 'own',         // Only their museum profile
      delete: false,         // Cannot delete museums
      approve: false,        // Cannot approve other museums
      verify: false,         // Cannot verify museums
      staff: 'manage'        // Manage their museum staff
    },
    
    // Content Management - First level approval
    content: {
      artifacts: {
        read: 'own',         // Only their museum's artifacts
        create: true,        // Create artifacts for their museum
        update: 'own',       // Edit their artifacts
        approve: 'first_level', // Initial approval (sends to super_admin)
        reject: 'own_submissions', // Reject staff submissions
        submit: 'to_super_admin', // Submit to super admin
        delete: 'own_drafts' // Delete only draft artifacts
      },
      events: {
        read: 'own',         // Only their events
        create: true,        // Create events for their museum
        update: 'own',       // Edit their events
        submit: 'for_approval', // Submit for super admin approval
        cancel: 'own'        // Cancel their events
      }
    },
    
    // Rental System - Initial screening
    rentals: {
      read: 'own_artifacts',  // Rentals for their artifacts only
      approve: 'initial',     // Initial approval (forwards to super_admin)
      reject: 'initial',      // Initial rejection
      pricing: 'set',         // Set rental prices for their artifacts
      conditions: 'set',      // Set rental conditions
      communicate: true       // Communicate with renters
    },
    
    // Analytics - Museum specific
    analytics: {
      museum: 'own',         // Only their museum analytics
      visitors: 'own',       // Their visitor statistics
      revenue: 'own',        // Their rental revenue
      artifacts: 'own',      // Their artifact performance
      export: 'own_data'     // Export their data
    },
    
    // Staff Management
    staff: {
      manage: 'own_museum',  // Manage their museum staff
      assign_roles: 'museum_roles', // Assign curator, guide, etc.
      permissions: 'museum_scope', // Set museum-specific permissions
      schedule: true         // Manage staff schedules
    }
  },

  // VISITOR - Basic access
  visitor: {
    content: {
      artifacts: { read: 'public' },
      events: { read: 'public' },
      museums: { read: 'public' }
    },
    rentals: {
      request: 'public_artifacts',
      view: 'own_requests'
    },
    profile: { update: 'own' }
  }
};

// Permission checking functions
class PermissionChecker {
  constructor() {
    this.permissions = PERMISSIONS;
  }

  /**
   * Check if user can perform action on resource
   * @param {Object} user - User object with role
   * @param {String} action - Action to perform
   * @param {String} resource - Resource type
   * @param {Object} target - Target object (optional)
   * @returns {Boolean} - Permission granted
   */
  can(user, action, resource, target = null) {
    const userPermissions = this.permissions[user.role];
    
    if (!userPermissions) {
      return false; // Unknown role
    }

    // Navigate through permission structure
    const resourcePerms = this.getNestedPermission(userPermissions, resource);
    if (!resourcePerms) {
      return false; // No permissions for this resource
    }

    const actionPerm = resourcePerms[action];
    if (!actionPerm) {
      return false; // No permission for this action
    }

    // Handle different permission types
    return this.evaluatePermission(actionPerm, user, target);
  }

  getNestedPermission(permissions, path) {
    const keys = path.split('.');
    let current = permissions;
    
    for (const key of keys) {
      current = current[key];
      if (!current) return null;
    }
    
    return current;
  }

  evaluatePermission(permission, user, target) {
    if (permission === true || permission === 'all') {
      return true;
    }
    
    if (permission === false) {
      return false;
    }
    
    // Handle scoped permissions
    switch (permission) {
      case 'own':
        return target && (target.admin === user._id || target.owner === user._id);
      
      case 'museum_staff':
        // Check if target user is staff of current user's museum
        return target && this.isMuseumStaff(user, target);
      
      case 'own_artifacts':
        // Check if artifacts belong to user's museum
        return target && target.museum === user.museumId;
      
      case 'first_level':
      case 'initial':
        // Museum admins can do first-level approvals
        return user.role === 'museum_admin';
      
      case 'final':
        // Only super admins can do final approvals
        return user.role === 'super_admin';
        
      default:
        return false;
    }
  }

  isMuseumStaff(museumAdmin, targetUser) {
    // Logic to check if targetUser is staff of museumAdmin's museum
    // This would query the Museum model to check staff array
    return true; // Placeholder
  }
}

// Usage Examples
const permissionChecker = new PermissionChecker();

// Example 1: Super Admin can approve any artifact
const superAdmin = { _id: '1', role: 'super_admin' };
const artifact = { _id: 'art1', museum: 'museum1', status: 'pending-review' };

console.log('Super Admin can approve artifact:', 
  permissionChecker.can(superAdmin, 'approve', 'content.artifacts', artifact)
); // true

// Example 2: Museum Admin can only approve their own artifacts initially
const museumAdmin = { _id: '2', role: 'museum_admin', museumId: 'museum1' };
const ownArtifact = { _id: 'art2', museum: 'museum1', status: 'draft' };
const otherArtifact = { _id: 'art3', museum: 'museum2', status: 'draft' };

console.log('Museum Admin can approve own artifact:', 
  permissionChecker.can(museumAdmin, 'approve', 'content.artifacts', ownArtifact)
); // true

console.log('Museum Admin can approve other museum artifact:', 
  permissionChecker.can(museumAdmin, 'approve', 'content.artifacts', otherArtifact)
); // false

// Example 3: Visitor cannot approve anything
const visitor = { _id: '3', role: 'visitor' };

console.log('Visitor can approve artifact:', 
  permissionChecker.can(visitor, 'approve', 'content.artifacts', artifact)
); // false

module.exports = {
  PERMISSIONS,
  PermissionChecker
};
