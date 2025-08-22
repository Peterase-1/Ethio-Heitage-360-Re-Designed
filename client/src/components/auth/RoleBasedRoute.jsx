import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const RoleBasedRoute = ({ children, allowedRoles, fallbackRoute = '/' }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking permissions...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Check if user role is allowed (support both backend and frontend role names)
  const hasAccess = allowedRoles.some(allowedRole => {
    // Direct match
    if (allowedRole === user.role) return true;
    
    // Handle backend to frontend role mapping
    const roleMap = {
      'superAdmin': ['super_admin', 'superAdmin'],
      'museumAdmin': ['museum_admin', 'museumAdmin', 'museum'],
      'user': ['visitor', 'user'],
      // Reverse mapping for frontend to backend
      'super_admin': ['superAdmin', 'super_admin'],
      'museum_admin': ['museumAdmin', 'museum_admin', 'museum'],
      'museum': ['museumAdmin', 'museum_admin', 'museum'],
      'visitor': ['user', 'visitor']
    };
    
    const mappedRoles = roleMap[allowedRole] || [];
    return mappedRoles.includes(user.role);
  });
  
  if (!hasAccess) {
    // Redirect to appropriate dashboard based on user role
    const redirectRoutes = {
      // Backend role names
      superAdmin: '/super-admin',
      museumAdmin: '/museum-dashboard',
      user: '/visitor-dashboard',
      // Frontend role names (fallback)
      super_admin: '/super-admin',
      admin: '/admin',
      museum: '/museum-dashboard',
      museum_admin: '/museum-dashboard',
      organizer: '/organizer-dashboard',
      visitor: '/visitor-dashboard'
    };

    const redirectTo = redirectRoutes[user.role] || fallbackRoute;
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

export default RoleBasedRoute;
