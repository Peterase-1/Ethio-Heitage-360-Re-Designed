import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Eye, 
  Bookmark, 
  Download, 
  FileText, 
  Search,
  Filter,
  MoreHorizontal,
  Trash2,
  Edit,
  Share2,
  Calendar,
  Clock,
  Tag
} from 'lucide-react';
import userFavoritesService from '../../services/userFavoritesService';

const UserCollectionContent = ({ activeSection, onItemClick }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadSectionData();
  }, [activeSection, currentPage]);

  const loadSectionData = async () => {
    setLoading(true);
    try {
      let result;
      const options = { page: currentPage, limit: 20 };

      switch (activeSection) {
        case 'favorites':
          result = await userFavoritesService.getFavorites(options);
          break;
        case 'recently-viewed':
          result = await userFavoritesService.getRecentlyViewed(options);
          break;
        case 'bookmarks':
          result = await userFavoritesService.getBookmarks(options);
          break;
        case 'downloads':
          result = await userFavoritesService.getDownloads(options);
          break;
        case 'notes':
          result = await userFavoritesService.getNotes(options);
          break;
        default:
          result = { success: true, data: { items: [], totalPages: 1 } };
      }

      if (result.success) {
        setItems(result.data.items || []);
        setTotalPages(result.data.totalPages || 1);
      }
    } catch (error) {
      console.error('Error loading section data:', error);
      setItems([]);
    }
    setLoading(false);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    // Implement search functionality
  };

  const getSectionIcon = () => {
    switch (activeSection) {
      case 'favorites': return Heart;
      case 'recently-viewed': return Eye;
      case 'bookmarks': return Bookmark;
      case 'downloads': return Download;
      case 'notes': return FileText;
      default: return Heart;
    }
  };

  const getSectionTitle = () => {
    switch (activeSection) {
      case 'favorites': return 'Favorites';
      case 'recently-viewed': return 'Recently Viewed';
      case 'bookmarks': return 'Bookmarks';
      case 'downloads': return 'Downloads';
      case 'notes': return 'Notes';
      default: return 'Collection';
    }
  };

  const handleItemAction = async (action, itemId) => {
    try {
      switch (action) {
        case 'remove-favorite':
          await userFavoritesService.removeFromFavorites(itemId);
          break;
        case 'remove-bookmark':
          await userFavoritesService.removeBookmark(itemId);
          break;
        case 'delete-note':
          await userFavoritesService.deleteNote(itemId);
          break;
        default:
          break;
      }
      loadSectionData(); // Refresh the list
    } catch (error) {
      console.error('Error performing action:', error);
    }
  };

  const renderItem = (item, index) => {
    return (
      <div key={item._id || index} className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
        <div className="p-4">
          {/* Item Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start space-x-3 flex-1">
              {/* Item Icon/Image */}
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                {item.itemData?.image ? (
                  <img 
                    src={item.itemData.image} 
                    alt={item.itemData?.title || 'Item'} 
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="text-gray-400 text-lg">
                    {item.itemType === 'artifact' ? '🏺' : '📄'}
                  </div>
                )}
              </div>

              {/* Item Info */}
              <div className="flex-1 min-w-0">
                <h3 
                  className="font-semibold text-gray-900 truncate cursor-pointer hover:text-blue-600 transition-colors"
                  onClick={() => onItemClick && onItemClick(item)}
                >
                  {item.itemData?.title || item.title || 'Untitled Item'}
                </h3>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {item.itemData?.description || item.content || item.notes || 'No description available'}
                </p>
                
                {/* Item Metadata */}
                <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {activeSection === 'recently-viewed' && item.viewedAt
                        ? new Date(item.viewedAt).toLocaleDateString()
                        : activeSection === 'downloads' && item.downloadedAt
                        ? new Date(item.downloadedAt).toLocaleDateString()
                        : item.addedAt || item.createdAt
                        ? new Date(item.addedAt || item.createdAt).toLocaleDateString()
                        : 'Unknown date'
                      }
                    </span>
                  </div>
                  
                  {item.itemType && (
                    <div className="flex items-center space-x-1">
                      <Tag className="h-3 w-3" />
                      <span className="capitalize">{item.itemType}</span>
                    </div>
                  )}

                  {activeSection === 'downloads' && item.fileSize && (
                    <div className="flex items-center space-x-1">
                      <Download className="h-3 w-3" />
                      <span>{formatFileSize(item.fileSize)}</span>
                    </div>
                  )}
                </div>

                {/* Tags for bookmarks and notes */}
                {(item.tags && item.tags.length > 0) && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {item.tags.slice(0, 3).map((tag, tagIndex) => (
                      <span 
                        key={tagIndex}
                        className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                    {item.tags.length > 3 && (
                      <span className="text-xs text-gray-500">+{item.tags.length - 3} more</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Action Menu */}
            <div className="relative">
              <button 
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
                onClick={(e) => {
                  e.preventDefault();
                  // Toggle dropdown menu
                }}
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
              {/* Dropdown menu would go here */}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center space-x-2">
              <button 
                className="flex items-center px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded transition-colors"
                onClick={() => onItemClick && onItemClick(item)}
              >
                <Eye className="h-3 w-3 mr-1" />
                View
              </button>
              
              {activeSection !== 'favorites' && (
                <button 
                  className="flex items-center px-2 py-1 text-xs text-gray-600 hover:bg-gray-50 rounded transition-colors"
                  onClick={() => userFavoritesService.addToFavorites(item.itemId || item._id, item.itemType)}
                >
                  <Heart className="h-3 w-3 mr-1" />
                  Like
                </button>
              )}
              
              <button className="flex items-center px-2 py-1 text-xs text-gray-600 hover:bg-gray-50 rounded transition-colors">
                <Share2 className="h-3 w-3 mr-1" />
                Share
              </button>
            </div>

            <div className="flex items-center space-x-1">
              {activeSection === 'notes' && (
                <button 
                  className="p-1 text-gray-400 hover:text-blue-600 rounded"
                  title="Edit note"
                >
                  <Edit className="h-3 w-3" />
                </button>
              )}
              
              <button 
                className="p-1 text-gray-400 hover:text-red-600 rounded"
                title="Remove from collection"
                onClick={() => {
                  const action = activeSection === 'favorites' ? 'remove-favorite' :
                               activeSection === 'bookmarks' ? 'remove-bookmark' :
                               activeSection === 'notes' ? 'delete-note' : 'remove';
                  handleItemAction(action, item.itemId || item._id);
                }}
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const SectionIcon = getSectionIcon();

  return (
    <div className="flex-1 bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <SectionIcon className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{getSectionTitle()}</h1>
              <p className="text-sm text-gray-600">
                {items.length} {items.length === 1 ? 'item' : 'items'}
              </p>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder={`Search ${getSectionTitle().toLowerCase()}...`}
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button className="p-2 text-gray-400 hover:text-gray-600 border border-gray-300 rounded-lg">
              <Filter className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <SectionIcon className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No {getSectionTitle().toLowerCase()} yet
            </h3>
            <p className="text-gray-600 mb-4">
              Start exploring to add items to your {getSectionTitle().toLowerCase()}.
            </p>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Explore Heritage
            </button>
          </div>
        ) : (
          <>
            {/* Items Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {items.map(renderItem)}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center mt-8 space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UserCollectionContent;
