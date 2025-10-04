import React, { useState } from 'react';
import { 
  Heart, 
  Eye, 
  Bookmark, 
  Download, 
  FileText, 
  ChevronUp,
  ChevronDown,
  Plus
} from 'lucide-react';

const UserCollectionSidebar = ({ 
  isOpen = true, 
  onToggle, 
  activeSection = 'favorites',
  onSectionChange,
  userStats = {}
}) => {
  const [isMyCollectionExpanded, setIsMyCollectionExpanded] = useState(true);

  const menuItems = [
    {
      id: 'favorites',
      label: 'Favorites',
      icon: Heart,
      count: userStats.favoritesCount || 0,
      description: 'Items you\'ve liked'
    },
    {
      id: 'recently-viewed',
      label: 'Recently Viewed',
      icon: Eye,
      count: userStats.recentlyViewedCount || 0,
      description: 'Items you\'ve recently seen'
    },
    {
      id: 'bookmarks',
      label: 'Bookmarks',
      icon: Bookmark,
      count: userStats.bookmarksCount || 0,
      description: 'Saved for later'
    },
    {
      id: 'downloads',
      label: 'Downloads',
      icon: Download,
      count: userStats.downloadsCount || 0,
      description: 'Downloaded content'
    },
    {
      id: 'notes',
      label: 'Notes',
      icon: FileText,
      count: userStats.notesCount || 0,
      description: 'Your personal notes'
    }
  ];

  const handleSectionClick = (sectionId) => {
    if (onSectionChange) {
      onSectionChange(sectionId);
    }
  };

  const toggleMyCollection = () => {
    setIsMyCollectionExpanded(!isMyCollectionExpanded);
  };

  if (!isOpen) {
    return (
      <div className="w-16 bg-white border-r border-gray-200 flex flex-col items-center py-4 space-y-4">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => handleSectionClick(item.id)}
              className={`p-3 rounded-lg transition-colors ${
                activeSection === item.id
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              title={item.label}
            >
              <IconComponent className="h-5 w-5" />
              {item.count > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {item.count > 99 ? '99+' : item.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* My Collection Header */}
      <div className="p-4 border-b border-gray-200">
        <button
          onClick={toggleMyCollection}
          className="flex items-center justify-between w-full text-left hover:bg-gray-50 p-2 rounded-lg transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Heart className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">My Collection</h2>
              <p className="text-sm text-gray-600">Your personal items</p>
            </div>
          </div>
          {isMyCollectionExpanded ? (
            <ChevronUp className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          )}
        </button>
      </div>

      {/* Collection Items */}
      {isMyCollectionExpanded && (
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-2">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSectionClick(item.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                    activeSection === item.id
                      ? 'bg-blue-50 border border-blue-200 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <IconComponent className={`h-5 w-5 ${
                      activeSection === item.id ? 'text-blue-600' : 'text-gray-500'
                    }`} />
                    <div className="text-left">
                      <div className="font-medium">{item.label}</div>
                      <div className="text-sm text-gray-500">{item.description}</div>
                    </div>
                  </div>
                  {item.count > 0 && (
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      activeSection === item.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {item.count > 999 ? '999+' : item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="p-4 border-t border-gray-200 mt-auto">
            <div className="space-y-2">
              <button className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Plus className="h-4 w-4 mr-2" />
                Create Collection
              </button>
              <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                <FileText className="h-4 w-4 mr-2" />
                Add Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Collapsed View Summary */}
      {!isMyCollectionExpanded && (
        <div className="p-4">
          <div className="text-sm text-gray-500 text-center">
            {Object.values(userStats).reduce((a, b) => (a || 0) + (b || 0), 0)} total items
          </div>
        </div>
      )}
    </div>
  );
};

export default UserCollectionSidebar;
