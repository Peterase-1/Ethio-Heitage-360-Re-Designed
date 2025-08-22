import { Package, Calendar, CheckCircle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { useDashboard } from "../../../context/DashboardContext";

export function SummaryCards() {
  const { dashboardStats } = useDashboard();

  const summaryData = [
    {
      title: "Total Tours Offered",
      value: dashboardStats.totalTours?.toString() || "0",
      change: `${dashboardStats.activeTours || 0} active`,
      icon: Package,
      color: "text-yellow-900",
      bgColor: "bg-yellow-100",
    },
    {
      title: "Confirmed Bookings",
      value: dashboardStats.confirmedBookings?.toString() || "0",
      change: `$${(dashboardStats.totalRevenue || 0).toLocaleString()} total`,
      icon: Calendar,
      color: "text-yellow-800",
      bgColor: "bg-yellow-50",
    },
    {
      title: "Completed Tours",
      value: dashboardStats.completedBookings?.toString() || "0",
      change: `${dashboardStats.totalBookings || 0} total bookings`,
      icon: CheckCircle,
      color: "text-stone-700",
      bgColor: "bg-stone-100",
    },
    {
      title: "Pending Requests",
      value: dashboardStats.pendingBookings?.toString() || "0",
      change: `${dashboardStats.unreadMessages || 0} unread messages`,
      icon: Clock,
      color: "text-amber-700",
      bgColor: "bg-amber-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {summaryData.map((item, index) => (
        <Card
          key={index}
          className="bg-white border border-gray-200 hover:shadow-md transition-shadow"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {item.title}
            </CardTitle>
            <div
              className={`w-10 h-10 rounded-full ${item.bgColor} flex items-center justify-center`}
            >
              <item.icon className={`w-5 h-5 ${item.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800 mb-1">
              {item.value}
            </div>
            <p className="text-xs text-gray-600">{item.change}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
