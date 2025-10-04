import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Filter, Grid, List, Heart, BookOpen, Star, 
  CheckCircle, Microscope, Folder, MoreVertical, Eye, Edit, 
  Trash2, Share2, Copy, Users, Calendar, Clock
} from 'lucide-react';
import collectionService from '../../services/collectionService';
import CreateCollectionModal from './CreateCollectionModal';
import CollectionDetailsModal from './CollectionDetailsModal';
import { toast } from 'sonner';

const CollectionsGrid = ({ showCreateButton = true, limit, category, type }) => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 });
  
  // UI State
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(category || '');
  const [selectedType, setSelectedType] = useState(type || '');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('updatedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [showDropdown, setShowDropdown] = useState(null);

  // Load collections
  const loadCollections = async () => {
    setLoading(true);
    try {
      const params = {
        search: searchQuery || undefined,
        category: selectedCategory || undefined,
        type: selectedType || undefined,
        sortBy,
        sortOrder,
        limit: limit || 20
      };

      const result = await collectionService.getUserCollections(params);
      
      if (result.success) {
        setCollections(result.data);
        setPagination(result.pagination);
        setStats(result.stats);
      } else {
        console.error('Failed to load collections:', result.error);
        toast.error(result.error);
      }
    } catch (error) {
      console.error('Error loading collections:', error);
      toast.error('Failed to load collections');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadCollections();
  }, [searchQuery, selectedCategory, selectedType, sortBy, sortOrder]);

  // Handle collection actions
  const handleCreateCollection = () => {
    setShowCreateModal(true);
  };

  const handleViewCollection = (collection) => {
    setSelectedCollection(collection);
    setShowDetailsModal(true);
  };

  const handleEditCollection = (collection) => {
    setSelectedCollection(collection);
    setShowCreateModal(true);
  };

  const handleDeleteCollection = async (collection) => {
    if (!confirm(`Are you sure you want to delete "${collection.name}"?`)) {
      return;
    }

    const result = await collectionService.deleteCollection(collection._id);
    if (result.success) {
      await loadCollections();
    }
  };

  const handleDuplicateCollection = async (collection) => {
    const duplicateData = {
      name: `${collection.name} (Copy)`,
      description: collection.description,
      type: collection.type,
      category: collection.category,
      cover: collection.cover,
      tags: collection.tags,
      isPublic: false
    };

    const result = await collectionService.createCollection(duplicateData);
    if (result.success) {
      await loadCollections();
    }
  };

  // Get category/type display info
  const getCategoryInfo = (categoryValue) => {
    return collectionService.getCategories().find(c => c.value === categoryValue) || {};
  };

  const getTypeInfo = (typeValue) => {
    return collectionService.getTypes().find(t => t.value === typeValue) || {};
  };

  // Collection card component
  const CollectionCard = ({ collection, viewMode }) => {
    const categoryInfo = getCategoryInfo(collection.category);
    const typeInfo = getTypeInfo(collection.type);
    const completionPercentage = collection.completionPercentage || 0;

    if (viewMode === 'list') {
      return (
        <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-1 min-w-0">
              {/* Collection Icon/Color */}
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl font-bold"
                style={{ backgroundColor: collection.cover?.color || categoryInfo.color || '#3B82F6' }}
              >
                {categoryInfo.icon || typeInfo.icon || '📁'}
              </div>
              
              {/* Collection Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">{collection.name}</h3>
                  {collection.isPublic && (
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                      Public
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 truncate mb-2">{collection.description}</p>
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span className="flex items-center">
                    <BookOpen className="h-3 w-3 mr-1" />
                    {collection.stats?.totalItems || 0} items
                  </span>
                  <span className="flex items-center">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {completionPercentage}% complete
                  </span>
                  <span className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {new Date(collection.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleViewCollection(collection)}
                className="px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors"
              >
                <Eye className="h-4 w-4" />
              </button>
              
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(showDropdown === collection._id ? null : collection._id)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
                
                {showDropdown === collection._id && (
                  <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                    <button
                      onClick={() => {
                        handleEditCollection(collection);
                        setShowDropdown(null);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        handleDuplicateCollection(collection);
                        setShowDropdown(null);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicate
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/collections/${collection._id}`);
                        toast.success('Collection link copied');
                        setShowDropdown(null);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </button>
                    <hr className="my-1" />
                    <button
                      onClick={() => {
                        handleDeleteCollection(collection);
                        setShowDropdown(null);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Grid view
    return (
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
        <div
          onClick={() => handleViewCollection(collection)}
          className="p-6"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl font-bold"
              style={{ backgroundColor: collection.cover?.color || categoryInfo.color || '#3B82F6' }}
            >
              {categoryInfo.icon || typeInfo.icon || '📁'}
            </div>
            
            <div className="flex items-center space-x-1">
              {collection.isPublic && (
                <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                  Public
                </span>
              )}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDropdown(showDropdown === collection._id ? null : collection._id);
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Content */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">{collection.name}</h3>
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">{collection.description || 'No description'}</p>
            
            {/* Tags */}
            {collection.tags && collection.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {collection.tags.slice(0, 3).map((tag, index) => (
                  <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                    {tag}
                  </span>
                ))}
                {collection.tags.length > 3 && (
                  <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                    +{collection.tags.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>
          
          {/* Progress Bar */}
          {collection.stats?.totalItems > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                <span>Progress</span>
                <span>{completionPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>
          )}
          
          {/* Stats */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-3">
              <span className="flex items-center">
                <BookOpen className="h-4 w-4 mr-1" />
                {collection.stats?.totalItems || 0}
              </span>
              {collection.collaboratorCount > 0 && (
                <span className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  {collection.collaboratorCount}
                </span>
              )}
            </div>
            <span className="text-xs">
              {new Date(collection.updatedAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        
        {/* Dropdown Menu */}
        {showDropdown === collection._id && (
          <div className="absolute right-2 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
            <button
              onClick={() => {
                handleEditCollection(collection);
                setShowDropdown(null);
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </button>
            <button
              onClick={() => {
                handleDuplicateCollection(collection);
                setShowDropdown(null);
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
            >
              <Copy className="h-4 w-4 mr-2" />
              Duplicate
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/collections/${collection._id}`);
                toast.success('Collection link copied');
                setShowDropdown(null);
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </button>
            <hr className="my-1" />
            <button
              onClick={() => {
                handleDeleteCollection(collection);
                setShowDropdown(null);
              }}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </button>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-lg p-6 animate-pulse">
              <div className="h-12 bg-gray-200 rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded mb-4"></div>
              <div className="h-2 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      {!limit && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">My Collections</h2>
            {stats.totalCollections > 0 && (
              <p className="text-sm text-gray-600 mt-1">
                {stats.totalCollections} collections • {stats.totalItems} total items
              </p>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
            
            {/* Create Button */}
            {showCreateButton && (
              <button
                onClick={handleCreateCollection}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Collection
              </button>
            )}
          </div>
        </div>
      )}
      
      {/* Search and Filters */}
      {!limit && (
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search collections..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </button>
        </div>
      )}
      
      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {collectionService.getCategories().map(category => (
                  <option key={category.value} value={category.value}>
                    {category.icon} {category.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Types</option>
                {collectionService.getTypes().map(type => (
                  <option key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field);
                  setSortOrder(order);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="updatedAt-desc">Recently Updated</option>
                <option value="createdAt-desc">Recently Created</option>
                <option value="name-asc">Name A-Z</option>
                <option value="name-desc">Name Z-A</option>
                <option value="stats.totalItems-desc">Most Items</option>
              </select>
            </div>
          </div>
        </div>
      )}
      
      {/* Collections Grid/List */}
      {collections.length === 0 ? (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No collections yet</h3>
            <p className="text-gray-600 mb-6">
              Start organizing your learning journey by creating your first collection.
            </p>
            {showCreateButton && (
              <button
                onClick={handleCreateCollection}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Collection
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
          : "space-y-3"
        }>
          {collections.map(collection => (
            <CollectionCard 
              key={collection._id} 
              collection={collection} 
              viewMode={viewMode}
            />
          ))}
        </div>
      )}
      
      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <button
            disabled={pagination.current === 1}
            className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="px-3 py-2 text-sm text-gray-700">
            Page {pagination.current} of {pagination.pages}
          </span>
          <button
            disabled={pagination.current === pagination.pages}
            className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
      
      {/* Modals */}
      {showCreateModal && (
        <CreateCollectionModal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setSelectedCollection(null);
          }}
          onSuccess={() => {
            loadCollections();
            setShowCreateModal(false);
            setSelectedCollection(null);
          }}
          editCollection={selectedCollection}
        />
      )}
      
      {showDetailsModal && selectedCollection && (
        <CollectionDetailsModal
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedCollection(null);
          }}
          collection={selectedCollection}
          onEdit={() => {
            setShowDetailsModal(false);
            setShowCreateModal(true);
          }}
          onUpdate={loadCollections}
        />
      )}
    </div>
  );
};

export default CollectionsGrid;
