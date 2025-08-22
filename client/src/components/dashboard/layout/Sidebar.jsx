import { 
  Home, 
  Package, 
  Calendar, 
  Clock, 
  MessageSquare, 
  User, 
  Settings,
  Mountain,
  Users,
  BarChart3,
  LogOut
} from "lucide-react";
import { Button } from "../../ui/button";
import { useDashboard } from "../../../context/DashboardContext";
import { useAuth } from "../../../hooks/useAuth";

const navigationItems = [
  { icon: Home, label: "Dashboard", page: "dashboard" },
  { icon: Package, label: "Tour Packages", page: "tour-packages" },
  { icon: Calendar, label: "Tour Bookings", page: "tour-bookings" },
  { icon: Clock, label: "Schedules", page: "schedules" },
  { icon: Users, label: "Customers", page: "customers" },
  { icon: BarChart3, label: "Analytics", page: "analytics" },
  { icon: MessageSquare, label: "Customer Messages", page: "customersmessages" },
  { icon: User, label: "Profile & Settings", page: "profile-settings" },
];

export function Sidebar() {
  const { currentPage, setCurrentPage, messages } = useDashboard();
  const { user, logout } = useAuth();

  const unreadMessages = messages.filter((m) => m.status === "unread").length;

  const handleNavigation = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo and Brand */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-yellow-900 rounded-lg flex items-center justify-center">
            <Mountain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-800">EthioHeritage360</h1>
            <p className="text-xs text-gray-600">Tour Organizer</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => {
          const isActive = currentPage === item.page;

          return (
            <Button
              key={item.page}
              variant={isActive ? "default" : "ghost"}
              onClick={() => handleNavigation(item.page)}
              className={`w-full justify-start gap-3 h-11 relative ${
                isActive 
                  ? "bg-yellow-900 text-white hover:bg-yellow-800" 
                  : "text-gray-700 hover:bg-stone-100 hover:text-gray-900"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
              {item.page === "customersmessages" && unreadMessages > 0 && (
                <div className="absolute right-3 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadMessages}
                </div>
              )}
            </Button>
          );
        })}
      </nav>

      {/* User Info and Logout */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
            <User className="h-5 w-5 text-yellow-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">{user?.name || 'Organizer'}</p>
            <p className="text-xs text-gray-600">{user?.email}</p>
          </div>
        </div>
        
        <Button 
          onClick={logout}
          variant="outline"
          size="sm"
          className="w-full border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>

        <div className="bg-stone-50 border border-stone-200 rounded-lg p-4 mt-4">
          <h4 className="text-sm font-medium text-stone-800 mb-2">
            Need Help?
          </h4>
          <p className="text-xs text-stone-700 mb-3">
            Contact support for assistance with tour management.
          </p>
          <Button size="sm" variant="outline" className="w-full border-stone-300 text-stone-800 hover:bg-stone-100">
            <MessageSquare className="w-4 h-4 mr-2" />
            Get Support
          </Button>
        </div>
      </div>
    </div>
  );
}
