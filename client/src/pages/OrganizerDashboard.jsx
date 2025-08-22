import React from 'react';
import { TourDashboard } from '../components/pages/TourDashboard';
import { DashboardProvider } from '../context/DashboardContext';

const OrganizerDashboard = () => {
  return (
    <DashboardProvider>
      <TourDashboard />
    </DashboardProvider>
  );
};

export default OrganizerDashboard;
