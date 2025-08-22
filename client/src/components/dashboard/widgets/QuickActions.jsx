import { Plus, Eye, Users, BarChart3 } from "lucide-react";
import { Button } from "../../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { useDashboard } from "../../../context/DashboardContext";
import { toast } from "sonner";

export function QuickActions() {
  const { 
    setShowCreateTourModal, 
    setShowBookingRequestsModal,
    setCurrentPage,
    bookings 
  } = useDashboard();
  
  const pendingBookings = bookings.filter(b => b.status === 'pending').length;
  
  const handleCreateTour = () => {
    setShowCreateTourModal(true);
  };
  
  const handleViewBookingRequests = () => {
    setShowBookingRequestsModal(true);
  };
  
  const handleManageCustomers = () => {
    setCurrentPage('customers');
  };
  
  const handleViewAnalytics = () => {
    setCurrentPage('analytics');
  };

  return (
    <Card className="bg-white border-gray-200">
      <CardHeader>
        <CardTitle className="text-lg text-gray-800">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button
            onClick={handleCreateTour}
            className="h-12 bg-yellow-900 hover:bg-yellow-800 text-white shadow-md"
            size="lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create New Tour
          </Button>

          <Button
            onClick={handleViewBookingRequests}
            variant="outline"
            className="h-12 border-stone-300 text-stone-700 hover:bg-stone-50 relative"
            size="lg"
          >
            <Eye className="w-5 h-5 mr-2" />
            View Booking Requests
            {pendingBookings > 0 && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {pendingBookings}
              </div>
            )}
          </Button>

          <Button
            onClick={handleManageCustomers}
            variant="outline"
            className="h-12 border-stone-300 text-stone-700 hover:bg-stone-50"
            size="lg"
          >
            <Users className="w-5 h-5 mr-2" />
            Manage Customers
          </Button>

          <Button
            onClick={handleViewAnalytics}
            variant="outline"
            className="h-12 border-stone-300 text-stone-700 hover:bg-stone-50"
            size="lg"
          >
            <BarChart3 className="w-5 h-5 mr-2" />
            View Analytics
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
