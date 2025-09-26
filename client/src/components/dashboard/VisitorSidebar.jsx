import React, { useState, useEffect } from 'react';
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
  MapPin,
  BookOpen,
  GraduationCap,
  Video,
  Trophy,
  FileText,
  Users,
  PlayCircle,
  TrendingUp,
  Activity,
  Award,
  BarChart3,
  Bell,
  HelpCircle,
  Search,
  Bookmark,
  Clock,
  Camera,
  Zap,
  Target,
  MessageCircle,
  Star,
  Globe,
  Compass,
  Library,
  ShoppingCart,
  CreditCard,
  Download,
  Share2,
  Headphones,
  Monitor,
  Smartphone,
  Brain,
  Shield,
  Command,
  Layers
} from 'lucide-react';
import visitorDashboardService from '../../services/visitorDashboardService';
import visitorLogo from '../../assets/visitor-logo.jpg';
import { toast } from 'sonner';

const VisitorSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [expandedSections, setExpandedSections] = useState({
    museums: false,
    events: false,
    education: false,
    learning: false,
    personal: false,
    analytics: false,
    social: false,
    tools: false
  });
  const [userStats, setUserStats] = useState({
    totalPoints: 0,
    level: 1,
    favoritesCount: 0,
    bookingsCount: 0,
    coursesEnrolled: 0
  });
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Load user stats on component mount
  useEffect(() => {
    const loadUserStats = async () => {
      try {
        const statsResult = await visitorDashboardService.getQuickStats();
        if (statsResult.success) {
          setUserStats({
            totalPoints: statsResult.data.totalPoints || 0,
            level: statsResult.data.level || 1,
            favoritesCount: statsResult.data.favoritesCount || 0,
            bookingsCount: statsResult.data.bookingsCount || 0,
            coursesEnrolled: statsResult.data.activitiesThisMonth || 0
          });
        }
      } catch (error) {
        console.error('Error loading user stats:', error);
      }
    };

    if (user) {
      loadUserStats();
    }
  }, [user]);

  const visitorMenuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      path: '/visitor-dashboard',
      description: 'Your personal dashboard',
      badge: null
    },
    {
      id: 'education',
      label: 'Education Hub',
      icon: GraduationCap,
      path: '/education',
      description: 'Learn Ethiopian heritage',
      badge: userStats.coursesEnrolled > 0 ? userStats.coursesEnrolled : null,
      subItems: [
        { label: 'Browse Courses', path: '/education', icon: BookOpen, description: 'Discover new courses' },
        { label: 'My Learning', path: '/visitor/my-learning', icon: User, description: 'Your enrolled courses' },
        { label: 'Study Guides', path: '/study-guides', icon: FileText, description: 'Download study materials' },
        { label: 'Certificates', path: '/visitor/certificates', icon: Trophy, description: 'Your achievements' },
        { label: 'Educational Tours', path: '/educational-tours', icon: MapPin, description: 'Guided learning experiences' }
      ]
    },
    {
      id: 'virtual-museum',
      label: 'Virtual Museum',
      icon: Building2,
      path: '/visitor/virtual-museum',
      description: 'Explore 3D artifacts and collections',
      subItems: [
        { label: 'Browse Museums', path: '/virtual-museum', icon: Building2, description: 'Visit virtual museums' },
        { label: '3D Artifacts', path: '/virtual-museum/3d-artifacts', icon: Camera, description: 'Interactive 3D models' },
        { label: 'Image Gallery', path: '/virtual-museum/gallery', icon: Video, description: 'High-resolution photos' },
        { label: 'Video Tours', path: '/virtual-museum/videos', icon: PlayCircle, description: 'Guided video walkthroughs' },
        { label: 'Audio Guide', path: '/virtual-museum/audio', icon: Headphones, description: 'Narrated tours' }
      ]
    },
    {
      id: 'learning',
      label: 'Interactive Learning',
      icon: Brain,
      path: '/education',
      description: 'Engage with interactive content',
      subItems: [
        { label: 'Interactive Quizzes', path: '/education?section=quizzes', icon: Brain, description: 'Test your knowledge with dynamic quizzes' },
        { label: 'Flashcard Practice', path: '/education?section=flashcards', icon: Layers, description: 'Study with interactive flashcards' },
        { label: 'Virtual Tours', path: '/tours', icon: MapPin, description: 'Immersive experiences' },
        { label: 'Live Sessions', path: '/visitor/live-sessions', icon: Users, description: 'Join live educational events' },
        { label: 'Progress Tracker', path: '/visitor/progress', icon: TrendingUp, description: 'Monitor your learning journey' }
      ]
    },
    {
      id: 'events',
      label: 'Events & Exhibitions',
      icon: Calendar,
      path: '/visitor/events',
      description: 'Discover upcoming events',
      badge: userStats.bookingsCount > 0 ? userStats.bookingsCount : null,
      subItems: [
        { label: 'All Events', path: '/visitor/events', icon: Calendar, description: 'Browse all events' },
        { label: 'Exhibitions', path: '/visitor/events/exhibitions', icon: Building2, description: 'Museum exhibitions' },
        { label: 'Workshops', path: '/visitor/events/workshops', icon: Users, description: 'Hands-on learning' },
        { label: 'My Bookings', path: '/visitor/events/bookings', icon: CreditCard, description: 'Your reservations' },
        { label: 'Event Calendar', path: '/visitor/events/calendar', icon: Calendar, description: 'Schedule view' }
      ]
    },
    {
      id: 'personal',
      label: 'My Collection',
      icon: Heart,
      path: '/visitor/collection',
      description: 'Your personal items',
      badge: userStats.favoritesCount > 0 ? userStats.favoritesCount : null,
      subItems: [
        { label: 'Favorites', path: '/visitor/favorites', icon: Heart, description: 'Your saved items' },
        { label: 'Recently Viewed', path: '/visitor/recent', icon: Eye, description: 'Browsing history' },
        { label: 'Bookmarks', path: '/visitor/bookmarks', icon: Bookmark, description: 'Quick access items' },
        { label: 'Downloads', path: '/visitor/downloads', icon: Download, description: 'Downloaded content' },
        { label: 'Notes', path: '/visitor/notes', icon: FileText, description: 'Your personal notes' }
      ]
    },
    {
      id: 'analytics',
      label: 'My Progress',
      icon: BarChart3,
      path: '/visitor/analytics',
      description: 'Track your learning journey',
      subItems: [
        { label: 'Overview', path: '/visitor/analytics', icon: BarChart3, description: 'Progress summary' },
        { label: 'Achievements', path: '/visitor/achievements', icon: Award, description: 'Badges and rewards' },
        { label: 'Activity Log', path: '/visitor/activity', icon: Activity, description: 'Your activity history' },
        { label: 'Statistics', path: '/visitor/stats', icon: TrendingUp, description: 'Detailed analytics' },
        { label: 'Goals', path: '/visitor/goals', icon: Target, description: 'Set learning goals' }
      ]
    },
    {
      id: 'social',
      label: 'Community',
      icon: Users,
      path: '/visitor/community',
      description: 'Connect with other learners',
      subItems: [
        { label: 'Discussion Forums', path: '/visitor/forums', icon: MessageCircle, description: 'Join conversations' },
        { label: 'Study Groups', path: '/visitor/groups', icon: Users, description: 'Collaborate with peers' },
        { label: 'Leaderboard', path: '/visitor/leaderboard', icon: Trophy, description: 'See top learners' },
        { label: 'Share Progress', path: '/visitor/share', icon: Share2, description: 'Share achievements' },
        { label: 'Find Friends', path: '/visitor/friends', icon: Users, description: 'Connect with others' }
      ]
    },
    {
      id: 'tools',
      label: 'Tools & Resources',
      icon: Globe,
      path: '/visitor/tools',
      description: 'Helpful tools and utilities',
      subItems: [
        { label: 'Visitor Dashboard', path: '/visitor/dashboard-tool', icon: BarChart3, description: 'Your personal learning analytics dashboard' },
        { label: 'Heritage Map', path: '/map', icon: MapPin, description: 'Explore Ethiopia locations' },
        { label: 'Language Guide', path: '/visitor/language', icon: Globe, description: 'Learn Amharic phrases' },
        { label: 'Cultural Calendar', path: '/visitor/cultural-calendar', icon: Calendar, description: 'Ethiopian holidays' },
        { label: 'Converter Tools', path: '/visitor/converters', icon: Monitor, description: 'Ethiopian calendar converter' },
        { label: 'Mobile App', path: '/visitor/mobile', icon: Smartphone, description: 'Get our mobile app' }
      ]
    }
  ];

  const settingsItems = [
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      path: '/visitor/notifications',
      description: 'Manage notifications',
      badge: unreadCount > 0 ? unreadCount : null
    },
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
    },
    {
      id: 'help',
      label: 'Help & Support',
      icon: HelpCircle,
      path: '/support',
      description: 'Get help and support'
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
          <div className="flex items-center space-x-3 flex-1">
            <Icon className="h-5 w-5" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-medium">{item.label}</span>
                {item.badge && (
                  <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-amber-500 rounded-full min-w-[20px] h-5">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              {item.description && (
                <p className="text-xs text-gray-500">{item.description}</p>
              )}
            </div>
          </div>
          {hasSubItems && (
            <div className="ml-2">
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>
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
                  className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center space-x-2 ${
                    isActive(subItem.path)
                      ? 'bg-amber-50 text-amber-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {SubIcon && <SubIcon className="h-4 w-4" />}
                  <span>{subItem.label}</span>
                </button>
              );
            })}
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

        {/* Super Admin Section - Only for elevated users */}
        {(user?.role === 'superAdmin' || user?.role === 'admin') && (
          <div className="p-4 border-t border-gray-100">
            <h3 className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Shield className="h-3 w-3" />
              Admin Access
            </h3>
            <nav className="space-y-1">
              <button
                onClick={() => handleNavigation('/super-admin')}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors ${
                  isActive('/super-admin')
                    ? 'bg-red-50 text-red-700 border-r-2 border-red-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Command className="h-5 w-5" />
                <div className="flex-1">
                  <span className="font-medium">Super Admin Dashboard</span>
                  <p className="text-xs text-gray-500">System administration</p>
                </div>
              </button>
              <button
                onClick={() => handleNavigation('/super-admin/student-management')}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors ${
                  isActive('/super-admin/student-management')
                    ? 'bg-red-50 text-red-700 border-r-2 border-red-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Users className="h-5 w-5" />
                <div className="flex-1">
                  <span className="font-medium">Education Management</span>
                  <p className="text-xs text-gray-500">Manage courses & students</p>
                </div>
              </button>
            </nav>
          </div>
        )}

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

      {/* User Progress Section */}
      <div className="p-4 border-t border-gray-100">
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-medium text-gray-800">Level {userStats.level}</span>
            </div>
            <span className="text-xs font-bold text-amber-600">{userStats.totalPoints} pts</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-amber-400 to-orange-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min((userStats.totalPoints % 1000) / 10, 100)}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-600 mt-1">Heritage Explorer</p>
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
