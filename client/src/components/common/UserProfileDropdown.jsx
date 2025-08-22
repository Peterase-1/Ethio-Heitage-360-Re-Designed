import React, { useState, useRef, useEffect } from 'react';
import { 
  User, 
  Settings, 
  Shield, 
  ChevronDown, 
  Building2,
  Calendar,
  Eye,
  Crown
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import LogoutButton from './LogoutButton';

const UserProfileDropdown = ({ className = "" }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!user) {
    return null;
  }

  const getRoleIcon = (role) => {
    switch (role) {
      case 'superAdmin':
        return <Crown className="h-4 w-4 text-yellow-600" />;
      case 'museumAdmin':
        return <Building2 className="h-4 w-4 text-blue-600" />;
      case 'organizer':
        return <Calendar className="h-4 w-4 text-green-600" />;
      default:
        return <Eye className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRoleDisplayName = (role) => {
    const roleNames = {
      superAdmin: 'Super Administrator',
      museumAdmin: 'Museum Administrator', 
      organizer: 'Tour Organizer',
      user: 'Visitor'
    };
    return roleNames[role] || 'User';
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const lastLogin = localStorage.getItem('lastLogin');
  const formattedLastLogin = lastLogin 
    ? new Date(lastLogin).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'Unknown';

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {/* Avatar */}
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium text-sm">
          {user.avatar ? (
            <img 
              src={user.avatar} 
              alt={user.name} 
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            getInitials(user.name || user.email)
          )}
        </div>
        
        {/* Name and Role */}
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium text-gray-900 truncate max-w-32">
            {user.name || user.email}
          </p>
          <p className="text-xs text-gray-500 flex items-center gap-1">
            {getRoleIcon(user.role)}
            {getRoleDisplayName(user.role)}
          </p>
        </div>
        
        {/* Dropdown Arrow */}
        <ChevronDown 
          className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
                {user.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.name} 
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  getInitials(user.name || user.email)
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user.name || 'Unnamed User'}
                </p>
                <p className="text-sm text-gray-600 truncate">
                  {user.email}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  {getRoleIcon(user.role)}
                  <span className="text-xs text-gray-500">
                    {getRoleDisplayName(user.role)}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Last Login */}
            <div className="mt-2 text-xs text-gray-500">
              Last login: {formattedLastLogin}
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <button className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors">
              <User className="h-4 w-4" />
              <span className="text-sm">Profile Settings</span>
            </button>
            
            <button className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors">
              <Settings className="h-4 w-4" />
              <span className="text-sm">Preferences</span>
            </button>
            
            {(user.role === 'superAdmin' || user.role === 'museumAdmin') && (
              <button className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors">
                <Shield className="h-4 w-4" />
                <span className="text-sm">Security</span>
              </button>
            )}
          </div>

          {/* Logout Section */}
          <div className="border-t border-gray-200 py-2">
            <LogoutButton 
              variant="dropdown"
              showConfirmModal={true}
              onLogoutStart={() => setIsOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfileDropdown;
