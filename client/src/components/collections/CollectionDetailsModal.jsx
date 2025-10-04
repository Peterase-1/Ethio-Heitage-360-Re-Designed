import React, { useState, useEffect } from 'react';
import { X, Edit, Share2, Users, BookOpen, Calendar, Plus } from 'lucide-react';
import collectionService from '../../services/collectionService';

const CollectionDetailsModal = ({ isOpen, onClose, collection, onEdit, onUpdate }) => {
  const [collectionData, setCollectionData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && collection?._id) {
      loadCollectionDetails();
    }
  }, [isOpen, collection]);

  const loadCollectionDetails = async () => {
    setLoading(true);
    try {
      const result = await collectionService.getCollection(collection._id, true);
      if (result.success) {
        setCollectionData(result.data);
      }
    } catch (error) {
      console.error('Error loading collection details:', error);
    }
    setLoading(false);
  };

  if (!isOpen || !collection) return null;

  const displayData = collectionData || collection;
  const categoryInfo = collectionService.getCategories().find(c => c.value === displayData.category) || {};
  const typeInfo = collectionService.getTypes().find(t => t.value === displayData.type) || {};
  const completionPercentage = displayData.completionPercentage || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl font-bold"
              style={{ backgroundColor: displayData.cover?.color || categoryInfo.color || '#3B82F6' }}
            >
              {categoryInfo.icon || typeInfo.icon || '📁'}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{displayData.name}</h2>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>{typeInfo.label || 'Collection'}</span>
                <span>•</span>
                <span>{categoryInfo.label || 'Mixed'}</span>
                {displayData.isPublic && (
                  <>
                    <span>•</span>
                    <span className="text-green-600">Public</span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/collections/${displayData._id}`);
              }}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Share collection"
            >
              <Share2 className="h-5 w-5" />
            </button>
            <button
              onClick={onEdit}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Edit collection"
            >
              <Edit className="h-5 w-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Description */}
              {displayData.description && (
                <div>
                  <p className="text-gray-700">{displayData.description}</p>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{displayData.stats?.totalItems || 0}</div>
                  <div className="text-sm text-gray-600">Total Items</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{displayData.stats?.completedItems || 0}</div>
                  <div className="text-sm text-gray-600">Completed</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{completionPercentage}%</div>
                  <div className="text-sm text-gray-600">Progress</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-amber-600">{displayData.likeCount || 0}</div>
                  <div className="text-sm text-gray-600">Likes</div>
                </div>
              </div>

              {/* Progress Bar */}
              {displayData.stats?.totalItems > 0 && (
                <div>
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                    <span>Overall Progress</span>
                    <span>{completionPercentage}% Complete</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${completionPercentage}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Tags */}
              {displayData.tags && displayData.tags.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {displayData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Collection Items */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Collection Items</h3>
                  <button className="flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Item
                  </button>
                </div>

                {!displayData.items || displayData.items.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-2">This collection is empty</p>
                    <p className="text-sm text-gray-400">Start adding items to build your collection</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {displayData.items.slice(0, 10).map((item, index) => (
                      <div key={index} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                          {collectionService.getItemTypes().find(t => t.value === item.itemType)?.icon || '📄'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900">{item.itemTitle}</h4>
                          <p className="text-sm text-gray-600 truncate">{item.itemDescription}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                              {collectionService.getItemTypes().find(t => t.value === item.itemType)?.label}
                            </span>
                            {item.progress?.completed && (
                              <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                                Completed
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(item.addedAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                    {displayData.items.length > 10 && (
                      <div className="text-center py-2">
                        <span className="text-sm text-gray-500">
                          and {displayData.items.length - 10} more items...
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Collaborators */}
              {displayData.collaborators && displayData.collaborators.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Collaborators</h3>
                  <div className="flex items-center space-x-2">
                    {displayData.collaborators.slice(0, 5).map((collaborator, index) => (
                      <div
                        key={index}
                        className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-sm font-medium text-gray-600"
                        title={collaborator.user?.name || 'Collaborator'}
                      >
                        {collaborator.user?.name?.charAt(0) || 'C'}
                      </div>
                    ))}
                    {displayData.collaborators.length > 5 && (
                      <span className="text-sm text-gray-500">
                        +{displayData.collaborators.length - 5}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="text-sm text-gray-500 border-t border-gray-200 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium">Created:</span>{' '}
                    {new Date(displayData.createdAt).toLocaleDateString()}
                  </div>
                  <div>
                    <span className="font-medium">Last updated:</span>{' '}
                    {new Date(displayData.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CollectionDetailsModal;
