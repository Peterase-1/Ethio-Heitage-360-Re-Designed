import { useAuth } from '../../hooks/useAuth';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Landmark,
  Archive,
  Settings,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Calendar,
  Shield,
  LogOut,
  X
} from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../ui/utils';
import { Separator } from '../ui/separator';

const Sidebar = ({ open, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [openSubMenus, setOpenSubMenus] = useState({});

  const menuItems = [
    {
      text: 'Dashboard',
      icon: LayoutDashboard,
      path: '/admin-dashboard',
      subItems: []
    },
    {
      text: 'Users',
      icon: Users,
      path: '/admin-dashboard/users',
      subItems: [
        { text: 'All Users', path: '/admin-dashboard/users' },
        { text: 'Admins', path: '/admin-dashboard/users/admins' },
        { text: 'Museum Staff', path: '/admin-dashboard/users/staff' },
      ]
    },
    {
      text: 'Museums',
      icon: Landmark,
      path: '/admin-dashboard/museums',
      subItems: [
        { text: 'All Museums', path: '/admin-dashboard/museums' },
        { text: 'Add New', path: '/admin-dashboard/museums/new' },
      ]
    },
    {
      text: 'Artifacts',
      icon: Archive,
      path: '/admin-dashboard/artifacts',
      subItems: [
        { text: 'All Artifacts', path: '/admin-dashboard/artifacts' },
        { text: 'Pending Approval', path: '/admin-dashboard/artifacts/pending' },
        { text: 'Add New', path: '/admin-dashboard/artifacts/new' },
      ]
    },
    {
      text: 'Events',
      icon: Calendar,
      path: '/admin-dashboard/events',
      subItems: []
    },
    {
      text: 'Analytics',
      icon: BarChart3,
      path: '/admin-dashboard/analytics',
      subItems: []
    },
    {
      text: 'Settings',
      icon: Settings,
      path: '/admin-dashboard/settings',
      subItems: [
        { text: 'General', path: '/admin-dashboard/settings/general' },
        { text: 'Security', path: '/admin-dashboard/settings/security' },
        { text: 'Appearance', path: '/admin-dashboard/settings/appearance' },
      ]
    },
  ];

  // Initialize submenu states
  useEffect(() => {
    const initialOpenState = {};
    menuItems.forEach((item) => {
      if (item.subItems && item.subItems.length > 0) {
        const isActive = item.subItems.some(subItem =>
          location.pathname.startsWith(subItem.path)
        );
        initialOpenState[item.path] = isActive;
      }
    });
    setOpenSubMenus(initialOpenState);
  }, [location.pathname]);

  const handleSubMenuToggle = (path) => {
    setOpenSubMenus(prevState => ({
      ...prevState,
      [path]: !prevState[path]
    }));
  };

  const handleNavigation = (path) => {
    navigate(path);
    // On mobile, we might want to close sidebar, but logic simpler if we let parent handle or just rely on CSS
    if (window.innerWidth < 768 && onClose) {
      onClose();
    }
  };

  const renderMenuItem = (item) => {
    const Icon = item.icon;
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const isExpanded = openSubMenus[item.path];
    const isItemActive = location.pathname === item.path;

    return (
      <div key={item.path} className="mb-1">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-between items-center px-3 py-2 h-auto text-sm font-medium",
            isItemActive ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"
          )}
          onClick={() => {
            if (hasSubItems) {
              handleSubMenuToggle(item.path);
            } else {
              handleNavigation(item.path);
            }
          }}
        >
          <div className="flex items-center">
            <Icon className="mr-3 h-5 w-5" />
            {item.text}
          </div>
          {hasSubItems && (
            isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
          )}
        </Button>

        {hasSubItems && isExpanded && (
          <div className="ml-9 mt-1 space-y-1">
            {item.subItems.map((subItem) => (
              <Button
                key={subItem.path}
                variant="ghost"
                size="sm"
                className={cn(
                  "w-full justify-start text-xs font-normal h-8",
                  location.pathname === subItem.path ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => handleNavigation(subItem.path)}
              >
                {subItem.text}
              </Button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-card border-r border-border">
      <div className="p-4 border-b border-border flex items-center justify-between h-16">
        <div className="flex items-center font-semibold text-lg">
          <Shield className="mr-2 h-6 w-6 text-primary" />
          Admin Panel
        </div>
        {/* Mobile close button could go here if needed, or controlled by parent */}
        <Button variant="ghost" size="icon" className="md:hidden" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <nav className="space-y-1">
          {menuItems.map(renderMenuItem)}
        </nav>
      </div>

      <div className="p-4 border-t border-border">
        <Button
          variant="ghost"
          className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={logout}
        >
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:h-screen",
        open ? "translate-x-0" : "-translate-x-full"
      )}>
        <SidebarContent />
      </div>
    </>
  );
};

export default Sidebar;