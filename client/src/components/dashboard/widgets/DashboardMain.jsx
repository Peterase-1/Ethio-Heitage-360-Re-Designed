import { useDashboard } from "../../../context/DashboardContext";
import { SummaryCards } from "./SummaryCards";
import { QuickActions } from "./QuickActions";
import { RecentActivities } from "./RecentActivities";
import { CalendarView } from "./CalendarView";

export function DashboardMain() {
  const { currentUser, dashboardStats, isLoading, error } = useDashboard();

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">
          <h2 className="text-xl font-semibold mb-2">Error Loading Dashboard</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const userName = currentUser?.name || 'User';
  const pendingBookings = dashboardStats?.pendingBookings || 0;
  const upcomingCount = dashboardStats?.confirmedBookings || 0;

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Message */}
      <div className="bg-yellow-900 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-semibold mb-2">Welcome back, {userName}!</h2>
        <p className="text-yellow-100">
          You have {pendingBookings} new booking requests and {upcomingCount} confirmed bookings.
        </p>
      </div>

      {/* Summary Cards */}
      <SummaryCards />

      {/* Quick Actions */}
      <QuickActions />

      {/* Recent Activities and Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivities />
        <CalendarView />
      </div>
    </div>
  );
}
