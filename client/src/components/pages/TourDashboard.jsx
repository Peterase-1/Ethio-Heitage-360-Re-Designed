import { Sidebar } from "../dashboard/layout/Sidebar";
import { TopBar } from "../dashboard/layout/TopBar";
import { MainContent } from "../dashboard/MainContent";
import { CreateTourModal } from "../dashboard/modals/CreateTourModal";
import { BookingRequestsModal } from "../dashboard/modals/BookingRequestsModal";
import { useDashboard } from "../../context/DashboardContext";

export function TourDashboard() {
  const { showCreateTourModal, showBookingRequestsModal } = useDashboard();

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <TopBar />
        
        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <MainContent />
        </div>
      </div>

      {/* Modals */}
      
      {showCreateTourModal && <CreateTourModal />}
      {showBookingRequestsModal && <BookingRequestsModal />}
    </div>
  );
}

