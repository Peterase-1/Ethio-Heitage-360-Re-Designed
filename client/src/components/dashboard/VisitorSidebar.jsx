import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { 
  Home, 
  Building2, 
  Calendar, 
  Heart, 
  User, 
  Settings, 
  LogOut,
  ChevronDown,
  ChevronUp,
  Eye,
  MapPin
} from 'lucide-react';
import visitorLogo from '../../assets/visitor-logo.jpg';

const VisitorSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [expandedSections, setExpandedSections] = useState({
    museums: false,
    events: false
  });

  const visitorMenuItems = [
    {
      id: 'dashboard',
      label: 'Home',
      icon: Home,
      path: '/visitor-dashboard',
      description: 'Your personal dashboard'
    },
    {
      id: 'virtual-museum',
      label: 'Virtual Museum',
      icon: Building2,
      path: '/visitor/virtual-museum',
      description: 'Explore 3D artifacts and collections',
      subItems: [
        { label: 'Browse All', path: '/virtual-museum' },
        { label: '3D Artifacts', path: '/virtual-museum/3d-artifacts' },
        { label: 'Image Gallery', path: '/virtual-museum/gallery' },
        { label: 'Video Tours', path: '/virtual-museum/videos' }
      ]
    },
    {
      id: 'events',
      label: 'Events & Exhibitions',
      icon: Calendar,
      path: '/visitor/events',
      description: 'Discover upcoming events',
      subItems: [
        { label: 'All Events', path: '/visitor/events' },
        { label: 'Exhibitions', path: '/visitor/events/exhibitions' },
        { label: 'Workshops', path: '/visitor/events/workshops' },
        { label: 'My Bookings', path: '/visitor/events/bookings' }
      ]
    },
    {
      id: 'favorites',
      label: 'My Favorites',
      icon: Heart,
      path: '/visitor/favorites',
      description: 'Your saved items'
    },
    {
      id: 'recently-viewed',
      label: 'Recently Viewed',
      icon: Eye,
      path: '/visitor/recent',
      description: 'Your viewing history'
    },
    {
      id: 'heritage-sites',
      label: 'Heritage Sites',
      icon: MapPin,
      path: '/map',
      description: 'Explore Ethiopian heritage locations'
    }
  ];

  const settingsItems = [
    {
      id: 'profile',
      label: 'Profile Settings',
      icon: User,
      path: '/visitor/profile',
      description: 'Manage your account'
    },
    {
      id: 'preferences',
      label: 'Preferences',
      icon: Settings,
      path: '/visitor/preferences',
      description: 'App settings and language'
    }
  ];

  const toggleExpanded = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleLogout = async () => {
    await logout();
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const renderMenuItem = (item) => {
    const Icon = item.icon;
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const isExpanded = expandedSections[item.id];
    const isItemActive = isActive(item.path);

    return (
      <div key={item.id} className="mb-1">
        <button
          onClick={() => {
            if (hasSubItems) {
              toggleExpanded(item.id);
            } else {
              handleNavigation(item.path);
            }
          }}
          className={`w-full flex items-center justify-between px-4 py-3 text-left rounded-lg transition-colors ${
            isItemActive
              ? 'bg-amber-50 text-amber-700 border-r-2 border-amber-600'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center space-x-3">
            <Icon className="h-5 w-5" />
            <div>
              <span className="font-medium">{item.label}</span>
              {item.description && (
                <p className="text-xs text-gray-500">{item.description}</p>
              )}
            </div>
          </div>
          {hasSubItems && (
            isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
          )}
        </button>

        {hasSubItems && isExpanded && (
          <div className="ml-8 mt-1 space-y-1">
            {item.subItems.map(subItem => (
              <button
                key={subItem.path}
                onClick={() => handleNavigation(subItem.path)}
                className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                  isActive(subItem.path)
                    ? 'bg-amber-50 text-amber-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {subItem.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-72 bg-white shadow-sm border-r border-gray-200 flex flex-col min-h-screen">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3 mb-4">
          <img 
            src={visitorLogo} 
            alt="Heritage 360" 
            className="w-12 h-12 rounded-lg object-cover"
            onError={(e) => {
              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiByeD0iOCIgZmlsbD0iI0Y1OUUwQiIvPgo8cGF0aCBkPSJNMjQgMTJMMzIgMjBIMTZMMjQgMTJaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMTIgMjhIMzZWMzZIMTJWMjhaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K';
            }}
          />
          <div>
            <h2 className="text-xl font-bold text-gray-900">Heritage 360</h2>
            <p className="text-sm text-gray-600">Welcome, {user?.name || 'Visitor'}</p>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Explore
          </h3>
          <nav className="space-y-1">
            {visitorMenuItems.map(renderMenuItem)}
          </nav>
        </div>

        {/* Settings Section */}
        <div className="p-4 border-t border-gray-100">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Account
          </h3>
          <nav className="space-y-1">
            {settingsItems.map(renderMenuItem)}
          </nav>
        </div>
      </div>

      {/* User Profile & Logout */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
            <User className="h-5 w-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">{user?.name || 'Visitor'}</p>
            <p className="text-xs text-gray-600">{user?.email}</p>
          </div>
        </div>
        
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-3 py-2 text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span className="text-sm font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default VisitorSidebar;
