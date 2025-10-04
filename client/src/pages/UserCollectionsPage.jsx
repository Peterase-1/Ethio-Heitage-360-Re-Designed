import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import UserCollectionSidebar from '../components/user/UserCollectionSidebar';
import UserCollectionContent from '../components/user/UserCollectionContent';
import userFavoritesService from '../services/userFavoritesService';

const UserCollectionsPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeSection, setActiveSection] = useState('favorites');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userStats, setUserStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial section from URL params
    const section = searchParams.get('section') || 'favorites';
    setActiveSection(section);
    
    // Load user stats
    loadUserStats();
  }, [searchParams]);

  const loadUserStats = async () => {
    setLoading(true);
    try {
      const result = await userFavoritesService.getUserStats();
      if (result.success) {
        setUserStats(result.data);
      }
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
    setLoading(false);
  };

  const handleSectionChange = (sectionId) => {
    setActiveSection(sectionId);
    setSearchParams({ section: sectionId });
  };

  const handleItemClick = (item) => {
    // Navigate to item detail page based on item type
    if (item.itemType === 'artifact' && item.itemId) {
      navigate(`/artifacts/${item.itemId}`);
    } else if (item.itemType === 'museum' && item.itemId) {
      navigate(`/museums/${item.itemId}`);
    } else if (item.itemType === 'course' && item.itemId) {
      navigate(`/courses/${item.itemId}`);
    }
    
    // Track as recently viewed
    if (item.itemId && item.itemType) {
      userFavoritesService.addToRecentlyViewed(item.itemId, item.itemType, {
        title: item.itemData?.title || item.title,
        description: item.itemData?.description || item.content
      });
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your collections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <UserCollectionSidebar
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        userStats={userStats}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={toggleSidebar}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-lg font-semibold text-gray-900">My Collections</h1>
            <div className="w-10" /> {/* Spacer */}
          </div>
        </div>

        {/* Content Area */}
        <UserCollectionContent
          activeSection={activeSection}
          onItemClick={handleItemClick}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleSidebar}
        />
      )}
    </div>
  );
};

export default UserCollectionsPage;
