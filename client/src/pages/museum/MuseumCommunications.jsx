import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MuseumAdminSidebar from '../../components/dashboard/MuseumAdminSidebar';
import MuseumCommunicationsComponent from '../../components/museum/MuseumCommunications';

const MuseumCommunicationsPage = () => {
  return (
    <div className="flex min-h-screen bg-white">
      <MuseumAdminSidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <Routes>
            {/* Main communications page */}
            <Route index element={<MuseumCommunicationsComponent />} />
            {/* Sub-routes for different communication types */}
            <Route path="admin" element={<MuseumCommunicationsComponent filter={{ type: 'inquiry' }} />} />
            <Route path="feedback" element={<MuseumCommunicationsComponent filter={{ type: 'feedback' }} />} />
            <Route path="support" element={<MuseumCommunicationsComponent filter={{ type: 'request' }} />} />
            <Route path="community" element={<MuseumCommunicationsComponent filter={{ type: 'announcement' }} />} />
            {/* Catch all other routes */}
            <Route path="*" element={<MuseumCommunicationsComponent />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default MuseumCommunicationsPage;
