import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  Home,
  Building2,
  Package,
  Users,
  Calendar,
  Monitor,
  FileCheck,
  DollarSign,
  BarChart3,
  Settings,
  Bell,
  MessageSquare,
  User,
  LogOut,
  ChevronDown,
  ChevronUp,
  Plus,
  FileText,
  Camera,
  MapPin,
  Clock,
  Trophy,
  Palette,
  Shield,
  UserCheck,
  Archive,
  Eye,
  Star,
  TrendingUp,
  Database,
  Mail,
  Phone
} from 'lucide-react';

const MuseumAdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [expandedSections, setExpandedSections] = useState({
    artifacts: false,
    virtualMuseum: false,
    staff: false,
    events: false,
    rentals: false,
    analytics: false,
    communications: false,
    settings: false
  });

  const mainMenuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      path: '/museum-dashboard',
      description: 'Museum overview and statistics'
    },
    {
      id: 'profile',
      label: 'Museum Profile',
      icon: Building2,
      path: '/museum-dashboard/profile',
      description: 'Manage museum information',
      subItems: [
        { label: 'Basic Information', path: '/museum-dashboard/profile/basic', icon: FileText },
        { label: 'Gallery & Media', path: '/museum-dashboard/profile/gallery', icon: Camera },
        { label: 'Location & Hours', path: '/museum-dashboard/profile/location', icon: MapPin },
        { label: 'Accessibility Features', path: '/museum-dashboard/profile/accessibility', icon: UserCheck }
      ]
    },
    {
      id: 'artifacts',
      label: 'Artifact Management',
      icon: Package,
      path: '/museum-dashboard/artifacts',
      description: 'Manage your collection',
      subItems: [
        { label: 'All Artifacts', path: '/museum-dashboard/artifacts', icon: Archive },
        { label: 'Add New Artifact', path: '/museum-dashboard/artifacts/new', icon: Plus },
        { label: 'Categories & Themes', path: '/museum-dashboard/artifacts/categories', icon: Palette },
        { label: 'Conservation Status', path: '/museum-dashboard/artifacts/conservation', icon: Shield },
        { label: 'Featured Artifacts', path: '/museum-dashboard/artifacts/featured', icon: Star }
      ]
    },
    {
      id: 'virtualMuseum',
      label: 'Virtual Museum',
      icon: Monitor,
      path: '/museum-dashboard/virtual-museum',
      description: 'Digital exhibition management',
      subItems: [
        { label: 'Submission Dashboard', path: '/museum-dashboard/virtual-museum/submissions', icon: FileCheck },
        { label: 'Create Exhibition', path: '/museum-dashboard/virtual-museum/create', icon: Plus },
        { label: 'Gallery Layouts', path: '/museum-dashboard/virtual-museum/layouts', icon: Palette },
        { label: 'Interactive Features', path: '/museum-dashboard/virtual-museum/interactive', icon: Eye },
        { label: 'Submission Status', path: '/museum-dashboard/virtual-museum/status', icon: Clock }
      ]
    },
    {
      id: 'staff',
      label: 'Staff Management',
      icon: Users,
      path: '/museum-dashboard/staff',
      description: 'Manage museum team',
      subItems: [
        { label: 'All Staff', path: '/museum-dashboard/staff', icon: Users },
        { label: 'Add Staff Member', path: '/museum-dashboard/staff/new', icon: Plus },
        { label: 'Roles & Permissions', path: '/museum-dashboard/staff/roles', icon: Shield },
        { label: 'Schedules & Shifts', path: '/museum-dashboard/staff/schedules', icon: Clock },
        { label: 'Performance Tracking', path: '/museum-dashboard/staff/performance', icon: TrendingUp }
      ]
    },
    {
      id: 'events',
      label: 'Event Management',
      icon: Calendar,
      path: '/museum-dashboard/events',
      description: 'Exhibitions and programs',
      subItems: [
        { label: 'All Events', path: '/museum-dashboard/events', icon: Calendar },
        { label: 'Create Event', path: '/museum-dashboard/events/new', icon: Plus },
        { label: 'Special Exhibitions', path: '/museum-dashboard/events/exhibitions', icon: Trophy },
        { label: 'Educational Programs', path: '/museum-dashboard/events/education', icon: Users },
        { label: 'Event Analytics', path: '/museum-dashboard/events/analytics', icon: BarChart3 }
      ]
    },
    {
      id: 'rentals',
      label: 'Rental System',
      icon: DollarSign,
      path: '/museum-dashboard/rentals',
      description: 'Artifact rental management',
      subItems: [
        { label: 'Rental Dashboard', path: '/museum-dashboard/rentals', icon: DollarSign },
        { label: 'Pending Requests', path: '/museum-dashboard/rentals/pending', icon: Clock },
        { label: 'Active Rentals', path: '/museum-dashboard/rentals/active', icon: FileCheck },
        { label: 'Pricing & Terms', path: '/museum-dashboard/rentals/pricing', icon: Settings },
        { label: 'Damage Assessment', path: '/museum-dashboard/rentals/assessment', icon: Shield }
      ]
    }
  ];

  const analyticsItems = [
    {
      id: 'analytics',
      label: 'Analytics & Insights',
      icon: BarChart3,
      path: '/museum-dashboard/analytics',
      description: 'Performance metrics',
      subItems: [
        { label: 'Visitor Analytics', path: '/museum-dashboard/analytics/visitors', icon: Users },
        { label: 'Artifact Performance', path: '/museum-dashboard/analytics/artifacts', icon: Package },
        { label: 'Revenue Tracking', path: '/museum-dashboard/analytics/revenue', icon: DollarSign },
        { label: 'Engagement Metrics', path: '/museum-dashboard/analytics/engagement', icon: TrendingUp },
        { label: 'Reports & Export', path: '/museum-dashboard/analytics/reports', icon: FileText }
      ]
    }
  ];

  const communicationItems = [
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      path: '/museum-dashboard/notifications',
      description: 'Alerts and updates'
    },
    {
      id: 'communications',
      label: 'Communications',
      icon: MessageSquare,
      path: '/museum-dashboard/communications',
      description: 'Messages and feedback',
      subItems: [
        { label: 'Super Admin Messages', path: '/museum-dashboard/communications/admin', icon: MessageSquare },
        { label: 'Visitor Feedback', path: '/museum-dashboard/communications/feedback', icon: Mail },
        { label: 'Support Requests', path: '/museum-dashboard/communications/support', icon: Phone },
        { label: 'Community Engagement', path: '/museum-dashboard/communications/community', icon: Users }
      ]
    }
  ];

  const settingsItems = [
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      path: '/museum-dashboard/settings',
      description: 'System configuration',
      subItems: [
        { label: 'General Settings', path: '/museum-dashboard/settings/general', icon: Settings },
        { label: 'Notification Preferences', path: '/museum-dashboard/settings/notifications', icon: Bell },
        { label: 'Data Management', path: '/museum-dashboard/settings/data', icon: Database },
        { label: 'Security Settings', path: '/museum-dashboard/settings/security', icon: Shield }
      ]
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
          className={`w-full flex items-center justify-between px-4 py-3 text-left rounded-lg transition-all duration-200 ${isItemActive
            ? 'text-white shadow-sm'
            : 'text-black hover:bg-gray-50 hover:shadow-sm'
            }`}
          style={{
            backgroundColor: isItemActive ? '#8B5A3C' : 'transparent'
          }}
        >
          <div className="flex items-center space-x-3">
            <Icon className="h-5 w-5" />
            <div>
              <span className="font-semibold text-sm tracking-wide">{item.label}</span>
              {item.description && (
                <p className="text-xs font-medium mt-0.5" style={{ opacity: isItemActive ? 0.8 : 0.6 }}>{item.description}</p>
              )}
            </div>
          </div>
          {hasSubItems && (
            isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
          )}
        </button>

        {hasSubItems && isExpanded && (
          <div className="ml-8 mt-1 space-y-1">
            {item.subItems.map(subItem => {
              const SubIcon = subItem.icon;
              return (
                <button
                  key={subItem.path}
                  onClick={() => handleNavigation(subItem.path)}
                  className={`w-full text-left px-3 py-2 text-sm rounded-md transition-all duration-200 flex items-center space-x-2 ${isActive(subItem.path)
                    ? 'text-white shadow-sm'
                    : 'text-black hover:bg-gray-50 hover:shadow-sm'
                    }`}
                  style={{
                    backgroundColor: isActive(subItem.path) ? '#8B5A3C' : 'transparent'
                  }}
                >
                  <SubIcon className="h-4 w-4" />
                  <span className="font-medium">{subItem.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };


  return (
    <div className="w-80 bg-white shadow-lg border-r border-gray-200 flex flex-col min-h-screen flex-shrink-0">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#8B5A3C' }}>
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-black tracking-tight">Museum Admin</h2>
            <p className="text-sm text-black font-medium" style={{ opacity: 0.7 }}>{user?.museumName || 'Museum Dashboard'}</p>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div
        className="flex-1 overflow-y-auto scroll-smooth"
        onWheel={(e) => {
          // Only allow scrolling when mouse is over the sidebar
          e.stopPropagation();
        }}
        style={{ scrollBehavior: 'smooth' }}
      >
        {/* Core Features */}
        <div className="p-4">
          <h3 className="text-sm font-semibold tracking-wide mb-3" style={{ color: '#8B5A3C' }}>
            Core Management
          </h3>
          <nav className="space-y-1">
            {mainMenuItems.map(renderMenuItem)}
          </nav>
        </div>

        {/* Analytics Section */}
        <div className="p-4 border-t border-gray-100">
          <h3 className="text-sm font-semibold tracking-wide mb-3" style={{ color: '#8B5A3C' }}>
            Analytics & Insights
          </h3>
          <nav className="space-y-1">
            {analyticsItems.map(renderMenuItem)}
          </nav>
        </div>

        {/* Communication Section */}
        <div className="p-4 border-t border-gray-100">
          <h3 className="text-sm font-semibold tracking-wide mb-3" style={{ color: '#8B5A3C' }}>
            Communications
          </h3>
          <nav className="space-y-1">
            {communicationItems.map(renderMenuItem)}
          </nav>
        </div>

        {/* Settings Section */}
        <div className="p-4 border-t border-gray-100">
          <h3 className="text-sm font-semibold tracking-wide mb-3" style={{ color: '#8B5A3C' }}>
            Configuration
          </h3>
          <nav className="space-y-1">
            {settingsItems.map(renderMenuItem)}
          </nav>
        </div>
      </div>

      {/* User Profile & Logout */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#8B5A3C' }}>
            <User className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-black tracking-wide">{user?.name || 'Museum Admin'}</p>
            <p className="text-xs font-medium text-black" style={{ opacity: 0.7 }}>{user?.email}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-gray-50 rounded-lg transition-all duration-200"
          style={{ color: '#8B5A3C' }}
        >
          <LogOut className="h-4 w-4" />
          <span className="text-sm font-semibold tracking-wide">Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default MuseumAdminSidebar;
