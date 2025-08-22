# Role Hierarchy System

This document explains the role hierarchy implementation in the Ethiopian Cultural Heritage Virtual Museum project.

## Overview

The system implements a hierarchical role-based access control (RBAC) where higher-level roles have access to all functionalities of lower-level roles. This ensures that super admins can manage the entire platform while maintaining proper access controls.

## Role Hierarchy

The roles are organized in the following hierarchy (highest to lowest):

```
super_admin (Level 100)    ← Highest privileges
    ↓
admin (Level 80)
    ↓
museum_admin (Level 60)
    ↓
tour_admin (Level 50)
    ↓
museum (Level 40)
    ↓
organizer (Level 30)
    ↓
educator (Level 20)
    ↓
visitor (Level 10)         ← Lowest privileges
```

## Role Descriptions

### Super Admin (Level 100)
- **Full platform access**: Can access all system functionalities
- **User management**: Create, update, delete users of any role
- **Museum oversight**: Manage all museums, approve/reject applications
- **High-level content oversight**: Review escalated content and set platform standards
- **Heritage site approval**: Review and approve heritage site suggestions from Museum Admins
- **System settings**: Modify platform-wide configurations
- **Platform analytics**: View comprehensive platform-wide analytics and reports
- **Final approval authority**: High-value rentals and sensitive cultural content
- **Can access**: All endpoints including museum admin functions

### Admin (Level 80)
- **General administration**: Manage users and basic content
- **Platform analytics**: View general platform statistics
- **User management**: Manage users with roles below admin level
- **Can access**: Admin endpoints and lower-level functions

### Museum Admin (Level 60)
- **Museum management**: Full control over assigned museum
- **Staff management**: Add/remove museum staff members
- **Content moderation**: Review and approve museum content including artifacts, events, and virtual museums
- **Cultural sensitivity review**: Ensure content meets cultural authenticity standards at museum level
- **Heritage site management**: Suggest new heritage sites related to their museum for Super Admin approval
- **Rental management**: First-level approval for rental requests (Super Admin approval required for high-value rentals)
- **Event management**: Create and manage museum events with content review capabilities
- **Feedback system**: Provide structured feedback to content creators with improvement suggestions
- **Analytics**: View comprehensive museum-specific analytics
- **Can access**: Museum admin endpoints, content moderation tools, and heritage site suggestion features

### Tour Admin (Level 50)
- **Tour oversight**: Approve and manage tour operations
- **Tour analytics**: View tour-related statistics
- **System settings**: Tour-related configuration management

### Museum Staff (Level 40)
- **Artifact management**: Add and edit museum artifacts
- **Content creation**: Create museum-specific content
- **Basic analytics**: View artifact and museum statistics

### Organizer (Level 30)
- **Tour creation**: Create and manage tour packages
- **Booking management**: Handle tour bookings
- **Tour analytics**: View tour performance data

### Educator (Level 20)
- **Educational content**: Create learning materials
- **Course management**: Manage educational courses
- **Learning analytics**: View educational statistics

### Visitor (Level 10)
- **Content viewing**: Browse artifacts and museums
- **Tour booking**: Book tours and experiences
- **Basic interaction**: Rate and comment on content

## Access Control Rules

### Hierarchical Access
- Users with higher-level roles can access all functionalities of lower-level roles
- Example: `super_admin` can access all `museum_admin` endpoints
- Example: `museum_admin` can access all `museum` staff endpoints

### Strict Access
- Some endpoints require exact role matches (marked as "Super Admin only")
- These are reserved for platform-critical operations
- Example: System settings, user role modifications, platform backups

### Permission System
Each role has specific permissions that define what actions they can perform:

```javascript
// Super Admin permissions (has all permissions)
'full_platform_access', 'manage_all_users', 'manage_all_museums', 
'manage_system_settings', 'approve_all_content', 'manage_rentals',
'platform_analytics', 'heritage_sites'

// Museum Admin permissions
'manage_museum_profile', 'moderate_museum_content', 'review_artifacts', 'provide_content_feedback',
'suggest_heritage_sites', 'manage_heritage_suggestions', 'approve_museum_artifacts', 'manage_museum_staff',
'approve_museum_rentals', 'museum_analytics', 'museum_events', 'museum_notifications', 'cultural_sensitivity_review'
```

## Implementation Details

### Middleware Usage

#### Hierarchical Access
```javascript
// Allows museum_admin AND super_admin
router.use(requireMuseumAdminOrHigher);

// Allows admin, museum_admin, AND super_admin  
router.use(requireAdminOrHigher);
```

#### Strict Access
```javascript
// ONLY allows super_admin
router.use(requireSuperAdmin);
```

### Route Protection Examples

```javascript
// Super Admin exclusive endpoints
GET /api/super-admin/dashboard          → super_admin ONLY
GET /api/super-admin/users             → super_admin ONLY
POST /api/super-admin/system/backup    → super_admin ONLY

// Museum Admin hierarchical endpoints  
GET /api/museum-admin/dashboard        → museum_admin OR super_admin
GET /api/museum-admin/artifacts        → museum_admin OR super_admin
PUT /api/museum-admin/profile          → museum_admin OR super_admin
```

### Utility Functions

The system provides several utility functions for role checking:

```javascript
// Check if user can access a specific role's functions
hasRoleAccess('super_admin', 'museum_admin')  → true
hasRoleAccess('museum_admin', 'super_admin')  → false

// Check role hierarchy
isHigherRole('super_admin', 'museum_admin')   → true

// Check management permissions
canManageRole('super_admin', 'museum_admin')  → true
canManageRole('museum_admin', 'super_admin')  → false

// Get accessible roles
getAccessibleRoles('super_admin')  → ['visitor', 'educator', ..., 'super_admin']
```

## Benefits

1. **Simplified Administration**: Super admins can manage everything without role switching
2. **Security**: Proper access controls prevent unauthorized actions
3. **Flexibility**: Easy to add new roles and adjust hierarchy
4. **Maintainability**: Centralized role logic in utility functions
5. **Scalability**: System can grow with more roles and permissions

## Testing

The role hierarchy system includes comprehensive tests:

```bash
# Run role hierarchy tests
node scripts/testRoleHierarchy.js
```

Test coverage includes:
- Role level verification
- Access permission testing
- Hierarchical access validation
- User management scenarios
- Middleware behavior simulation

## Migration Notes

When upgrading from the previous system:

1. **Existing Users**: Current users retain their roles
2. **New Permissions**: Super admins automatically gain access to museum admin functions
3. **API Compatibility**: All existing endpoints continue to work
4. **Enhanced Security**: More granular permission control

## Security Considerations

1. **Principle of Least Privilege**: Users get minimum required permissions
2. **Role Escalation Prevention**: Users cannot elevate their own roles
3. **Audit Trail**: All role-based actions are logged
4. **Session Management**: Role changes require re-authentication

## Future Enhancements

1. **Dynamic Permissions**: Runtime permission modifications
2. **Role Templates**: Predefined role configurations
3. **Temporary Roles**: Time-limited access grants
4. **Multi-Museum Access**: Cross-museum administrative roles
