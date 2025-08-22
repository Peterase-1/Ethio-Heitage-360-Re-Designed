import { Clock, User, MessageSquare, Package, DollarSign, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Separator } from "../../ui/separator";
import { useDashboard } from "../../../context/DashboardContext";
import { toast } from "sonner";

const getActivityIcon = (type) => {
  switch (type) {
    case "booking":
      return User;
    case "message":
      return MessageSquare;
    case "tour_update":
      return Package;
    case "payment":
      return DollarSign;
    case "review":
      return Star;
    default:
      return Clock;
  }
};

export function RecentActivities() {
  const { activities } = useDashboard();

  const handleViewAllActivities = () => {
    toast.info("Full activity log would open here");
  };

  const handleActivityClick = (activity) => {
    toast.info(`Viewing details for: ${activity.title}`);
  };

  return (
    <Card className="bg-white border-gray-200">
      <CardHeader>
        <CardTitle className="text-lg text-gray-800">Recent Activities</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.slice(0, 5).map((activity, index) => {
          const ActivityIcon = getActivityIcon(activity.type);

          return (
            <div key={activity.id}>
              <div
                className="flex items-start gap-4 cursor-pointer hover:bg-stone-50 p-2 rounded-lg -m-2"
                onClick={() => handleActivityClick(activity)}
              >
                <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center flex-shrink-0">
                  <ActivityIcon className="w-5 h-5 text-gray-600" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-medium text-gray-800">
                      {activity.title}
                    </h4>
                    <Badge
                      variant={
                        activity.status === "pending"
                          ? "destructive"
                          : activity.status === "unread"
                          ? "default"
                          : activity.status === "confirmed"
                          ? "default"
                          : "secondary"
                      }
                      className="text-xs"
                    >
                      {activity.status}
                    </Badge>
                  </div>

                  <p className="text-sm text-gray-600 mb-1">
                    {activity.description}
                  </p>

                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    {activity.time}
                    {activity.user !== "System" && (
                      <>
                        <span>•</span>
                        <span>{activity.user}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {index < Math.min(activities.length - 1, 4) && (
                <Separator className="mt-4" />
              )}
            </div>
          );
        })}

        <div className="pt-2">
          <button
            onClick={handleViewAllActivities}
            className="text-sm text-yellow-700 hover:text-yellow-800 font-medium"
          >
            View all activities →
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
