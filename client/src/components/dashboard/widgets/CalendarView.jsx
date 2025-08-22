import { ChevronLeft, ChevronRight, MapPin, Users, Clock, Calendar as CalendarIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { useDashboard } from "../../../context/DashboardContext";
import { toast } from "sonner";

export function CalendarView() {
  const { upcomingTours, tourPackages } = useDashboard();
  
  const handleViewFullCalendar = () => {
    toast.info("Full calendar view would open here");
  };
  
  const handleTourClick = (tourId) => {
    toast.info(`Tour details for booking ${tourId} would open here`);
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate();
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    
    return { month, day, dayName };
  };

  return (
    <Card className="bg-white border-gray-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-gray-800">Upcoming Tours</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="w-8 h-8">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium text-gray-700 min-w-[100px] text-center">
              January 2025
            </span>
            <Button variant="ghost" size="icon" className="w-8 h-8">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {upcomingTours.length === 0 ? (
          <div className="text-center py-8">
            <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No upcoming tours scheduled</p>
          </div>
        ) : (
          upcomingTours.map((tour) => {
            const { month, day, dayName } = formatDate(tour.tourDate);
            const tourPackage = tourPackages.find(t => t.id === tour.tourPackageId);
            
            return (
              <div 
                key={tour.id}
                className="flex gap-4 p-4 rounded-lg border border-gray-200 hover:border-yellow-700 hover:shadow-sm transition-all cursor-pointer"
                onClick={() => handleTourClick(tour.id)}
              >
                {/* Date Column */}
                <div className="text-center min-w-[60px]">
                  <div className="text-lg font-semibold text-gray-800">
                    {day}
                  </div>
                  <div className="text-xs text-gray-600 uppercase">
                    {month}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {dayName.slice(0, 3)}
                  </div>
                </div>
                
                {/* Tour Details */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-800">
                      {tour.tourTitle}
                    </h4>
                    <Badge 
                      variant={tour.status === 'confirmed' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {tour.status}
                    </Badge>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      {tourPackage?.duration || 'Duration TBD'}
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="w-4 h-4" />
                      {tour.guests} guests
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      {tour.location}
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="font-medium">Customer:</span>
                      {tour.customerName}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        
        <div className="pt-2">
          <button 
            onClick={handleViewFullCalendar}
            className="text-sm text-yellow-700 hover:text-yellow-800 font-medium"
          >
            View full calendar →
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
