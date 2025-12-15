import React, { useState, useEffect } from 'react';
import {
  BookOpen, Plus, Eye, Heart, Star, CheckCircle,
  Clock, MoreVertical, ArrowRight, Grid
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import collectionService from '../../services/collectionService';

const CollectionsWidget = ({ limit = 6, showCreateButton = true }) => {
  const [collections, setCollections] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    try {
      const result = await collectionService.getUserCollections({
        limit,
        sortBy: 'updatedAt',
        sortOrder: 'desc'
      });

      if (result.success) {
        setCollections(result.data);
        setStats(result.stats);
      }
    } catch (error) {
      console.error('Error loading collections:', error);
    }
    setLoading(false);
  };

  const handleCreateCollection = async () => {
    // Quick create with defaults
    const newCollection = {
      name: 'My Collection',
      description: 'A new collection to organize my discoveries',
      type: 'custom',
      category: 'mixed',
      cover: { color: '#3B82F6' },
      isPublic: false
    };

    const result = await collectionService.createCollection(newCollection);
    if (result.success) {
      loadCollections();
      navigate(`/collections/${result.data._id}`);
    }
  };

  const getCategoryInfo = (categoryValue) => {
    return collectionService.getCategories().find(c => c.value === categoryValue) || {};
  };

  const getTypeInfo = (typeValue) => {
    return collectionService.getTypes().find(t => t.value === typeValue) || {};
  };

  if (loading) {
    return (
      <div className="bg-card rounded-lg shadow-sm border border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="h-6 bg-muted rounded w-32 animate-pulse"></div>
          <div className="h-8 bg-muted rounded w-20 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border border-border rounded-lg p-4 animate-pulse">
              <div className="h-10 bg-muted rounded-lg mb-3"></div>
              <div className="h-4 bg-muted rounded mb-2"></div>
              <div className="h-3 bg-muted rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg shadow-sm border border-border p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground flex items-center">
            <BookOpen className="h-5 w-5 mr-2 text-primary" />
            My Collections
          </h2>
          {stats.totalCollections > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              {stats.totalCollections} collections • {stats.totalItems} items
            </p>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {showCreateButton && (
            <button
              onClick={handleCreateCollection}
              className="flex items-center px-3 py-1.5 bg-primary text-primary-foreground text-sm rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-4 w-4 mr-1" />
              New
            </button>
          )}
          <button
            onClick={() => navigate('/collections')}
            className="flex items-center px-3 py-1.5 text-primary text-sm font-medium hover:text-primary/90 transition-colors"
          >
            View All
            <ArrowRight className="h-4 w-4 ml-1" />
          </button>
        </div>
      </div>

      {/* Collections Grid */}
      {collections.length === 0 ? (
        <div className="text-center py-8">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No collections yet</h3>
          <p className="text-muted-foreground mb-4">
            Create collections to organize your favorite artifacts and learning materials.
          </p>
          {showCreateButton && (
            <button
              onClick={handleCreateCollection}
              className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Collection
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {collections.map(collection => {
            const categoryInfo = getCategoryInfo(collection.category);
            const typeInfo = getTypeInfo(collection.type);
            const completionPercentage = collection.completionPercentage || 0;

            return (
              <div
                key={collection._id}
                onClick={() => navigate(`/collections/${collection._id}`)}
                className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer group hover:border-primary/50"
              >
                {/* Collection Header */}
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg font-bold"
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
                  </div>
                </div>

                {/* Collection Info */}
                <div className="mb-3">
                  <h3 className="font-semibold text-foreground mb-1 line-clamp-1 group-hover:text-primary transition-colors">
                    {collection.name}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {collection.description || 'No description'}
                  </p>
                </div>

                {/* Progress Bar */}
                {collection.stats?.totalItems > 0 && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                      <span>Progress</span>
                      <span>{completionPercentage}%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-1.5">
                      <div
                        className="bg-primary h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${completionPercentage}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-3 text-muted-foreground">
                    <span className="flex items-center">
                      <BookOpen className="h-3 w-3 mr-1" />
                      {collection.stats?.totalItems || 0}
                    </span>
                    {collection.stats?.completedItems > 0 && (
                      <span className="flex items-center">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {collection.stats.completedItems}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(collection.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Stats */}
      {stats.totalCollections > 0 && (
        <div className="mt-6 pt-4 border-t border-border">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">{stats.totalCollections || 0}</div>
              <div className="text-xs text-muted-foreground">Collections</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{stats.totalItems || 0}</div>
              <div className="text-xs text-muted-foreground">Total Items</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">{stats.totalCompletedItems || 0}</div>
              <div className="text-xs text-muted-foreground">Completed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-600">{stats.publicCollections || 0}</div>
              <div className="text-xs text-muted-foreground">Public</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollectionsWidget;
