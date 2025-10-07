import React from 'react';
import MuseumAdminSidebar from '../dashboard/MuseumAdminSidebar';
import VisitorRegistration from './VisitorRegistration';

const MuseumAnalytics = () => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <MuseumAdminSidebar />
      <div style={{ flex: 1, marginLeft: '280px' }}>
        <VisitorRegistration />
      </div>
    </div>
  );
};

export default MuseumAnalytics;