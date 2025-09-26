import React from 'react';
import VisitorSidebar from '../dashboard/VisitorSidebar';

const VisitorLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <VisitorSidebar />
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
};

export default VisitorLayout;
