import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Grid, List, Eye, Heart, Share2, Box, Calendar, Clock, Users, Star, Play, ArrowRight, Lock } from 'lucide-react';
import ArtifactCard from '../components/virtual-museum/ArtifactCard';
import FilterPanel from '../components/virtual-museum/FilterPanel';
import ARVRViewer from '../components/virtual-museum/SimpleARVRViewer';
import ArtifactDetailModal from '../components/virtual-museum/ArtifactDetailModal';
import { useAuth } from '../hooks/useAuth';
import api from '../utils/api';

const VirtualMuseum = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [artifacts, setArtifacts] = useState([]);
  const [filteredArtifacts, setFilteredArtifacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedArtifact, setSelectedArtifact] = useState(null);
  const [showARVR, setShowARVR] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    period: '',
    origin: '',
    museum: '',
    has3D: false
  });


  useEffect(() => {
    const fetchArtifacts = async () => {
      try {
        setLoading(true);
        const response = await api.getActiveVirtualArtifacts();
        if (response.success) {
          const formattedArtifacts = response.artifacts.map(item => ({
            ...item,
            id: item._id,
            name: item.title,
            description: item.description,
            image: item.modelUrl || (item.artifact && item.artifact.image) || 'https://via.placeholder.com/400x300',
            category: item.category,
            period: item.period,
            origin: item.origin,
            museum: item.museum ? item.museum.name : 'Unknown',
            has3DModel: item.has3DModel,
            views: item.views,
            likes: item.likes,
            rating: item.rating
          }));
          setArtifacts(formattedArtifacts);
          setFilteredArtifacts(formattedArtifacts);
        }
      } catch (error) {
        console.error('Failed to fetch virtual artifacts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArtifacts();
  }, []);

  useEffect(() => {
    let filtered = artifacts.filter(artifact => {
      const matchesSearch = artifact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        artifact.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = !filters.category || artifact.category === filters.category;
      const matchesPeriod = !filters.period || artifact.period === filters.period;
      const matchesOrigin = !filters.origin || artifact.origin === filters.origin;
      const matchesMuseum = !filters.museum || artifact.museum === filters.museum;
      const matches3D = !filters.has3D || artifact.has3DModel;

      return matchesSearch && matchesCategory && matchesPeriod && matchesOrigin && matchesMuseum && matches3D;
    });

    setFilteredArtifacts(filtered);
  }, [searchTerm, filters, artifacts]);

  const handleArtifactView = (artifact) => {
    setSelectedArtifact(artifact);
    if (artifact.has3DModel) {
      setShowARVR(true);
    } else {
      setShowDetailModal(true);
    }
  };

  const handleFavorite = (artifactId, isFavorited) => {
    setArtifacts(prev => prev.map(artifact =>
      artifact.id === artifactId ? { ...artifact, isFavorited } : artifact
    ));
  };

  const handleShare = (artifact) => {
    if (navigator.share) {
      navigator.share({
        title: artifact.name,
        text: artifact.description,
        url: window.location.href + '/' + artifact.id
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href + '/' + artifact.id);
      alert('Link copied to clipboard!');
    }
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      period: '',
      origin: '',
      museum: '',
      has3D: false
    });
    setSearchTerm('');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading virtual museum...</p>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-background">
      {/* Featured 3D Artifacts Hero Section */}
      <div className="bg-gradient-to-br from-primary via-secondary to-accent text-primary-foreground py-20 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 border border-current rounded-full"></div>
          <div className="absolute bottom-20 right-20 w-24 h-24 border border-current rounded-full"></div>
          <div className="absolute top-1/2 left-1/4 w-16 h-16 border border-current rounded-full"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            {/* Badge */}
            <div className="inline-flex items-center bg-primary-foreground/10 text-primary-foreground rounded-full px-4 py-2 mb-6">
              <Eye className="w-4 h-4 mr-2" />
              <span className="text-sm font-semibold">Immersive Heritage Experience</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 leading-tight">
              <span className="block mb-2">Virtual Museum</span>
              <span className="block bg-gradient-to-r from-primary-foreground to-primary-foreground/80 bg-clip-text text-transparent">Experience</span>
            </h1>
            <p className="text-xl md:text-2xl text-primary-foreground/90 mb-10 max-w-4xl mx-auto leading-relaxed">
              Explore Ethiopia's heritage in stunning 3D detail with virtual and augmented reality support.
              Walk through ancient temples and examine artifacts up close.
            </p>

            <div className="flex flex-wrap justify-center gap-6 text-sm mb-8">
              <div className="flex items-center bg-primary-foreground/20 backdrop-blur-sm px-6 py-3 rounded-full border border-primary-foreground/30">
                <Box className="w-5 h-5 mr-2" />
                {artifacts.length} Dynamic 3D Artifacts
              </div>
              <div className="flex items-center bg-primary-foreground/20 backdrop-blur-sm px-6 py-3 rounded-full border border-primary-foreground/30">
                <Star className="w-5 h-5 mr-2" />
                Premium Virtual Experience
              </div>
            </div>
          </div>

          {/* Featured 3D Artifacts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {artifacts.filter(artifact => artifact.has3DModel).slice(0, 3).map(artifact => (
              <div key={artifact.id} className="bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden hover:bg-white/20 transition-all duration-300 group">
                <div className="relative">
                  <img
                    src={artifact.image}
                    alt={artifact.name}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-amber-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
                      <Box className="w-4 h-4 mr-1" />
                      3D View
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                    <button
                      onClick={() => handleArtifactView(artifact)}
                      className="opacity-0 group-hover:opacity-100 bg-white text-gray-900 px-6 py-3 rounded-full font-semibold transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 flex items-center"
                    >
                      <Play className="w-5 h-5 mr-2" />
                      Explore in 3D
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2">{artifact.name}</h3>
                  <p className="text-white/80 mb-4 line-clamp-2">{artifact.description}</p>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/70">{artifact.origin}</span>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 mr-1" />
                      <span className="text-sm text-white/80">{artifact.rating}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>


      {/* Search Section */}
      <section className="py-16 bg-gradient-to-b from-background to-muted/30">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-8">
            Discover Ethiopian Heritage
          </h2>
          <div className="relative max-w-2xl mx-auto mb-8">
            <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-muted-foreground h-6 w-6" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search artifacts, museums, or cultural events..."
              className="w-full pl-16 pr-32 py-6 rounded-2xl text-lg bg-card border border-border focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all duration-300 shadow-lg"
            />
            <button className="absolute right-3 top-3 bg-primary text-primary-foreground px-8 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors">
              Search
            </button>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-full font-medium transition-all ${showFilters
                ? 'bg-primary text-primary-foreground shadow-lg'
                : 'bg-card border border-border hover:bg-muted text-muted-foreground'
                }`}
            >
              <Filter className="h-5 w-5" />
              <span>Filters</span>
            </button>

            <div className="flex border border-border rounded-full overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 transition-all ${viewMode === 'grid'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted'
                  }`}
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 transition-all ${viewMode === 'list'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted'
                  }`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="lg:w-64">
              <FilterPanel
                filters={filters}
                onFiltersChange={setFilters}
                onClearFilters={clearFilters}
                artifacts={artifacts}
              />
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-muted-foreground">
                Showing {filteredArtifacts.length} of {artifacts.length} artifacts
              </p>

              {(searchTerm || Object.values(filters).some(f => f)) && (
                <button
                  onClick={clearFilters}
                  className="text-primary hover:text-primary/80 font-medium"
                >
                  Clear all filters
                </button>
              )}
            </div>

            {/* Artifacts Grid/List */}
            {filteredArtifacts.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-muted-foreground mb-4">
                  <Search className="h-16 w-16 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">No artifacts found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'space-y-6'
              }>
                {filteredArtifacts.map(artifact => (
                  <ArtifactCard
                    key={artifact.id}
                    artifact={artifact}
                    onView={handleArtifactView}
                    onFavorite={handleFavorite}
                    onShare={handleShare}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AR/VR Viewer Modal */}
      {showARVR && selectedArtifact && (
        <ARVRViewer
          artifact={selectedArtifact}
          onClose={() => {
            setShowARVR(false);
            setSelectedArtifact(null);
          }}
        />
      )}

      {/* Artifact Detail Modal */}
      {showDetailModal && selectedArtifact && (
        <ArtifactDetailModal
          artifact={selectedArtifact}
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedArtifact(null);
          }}
          onFavorite={handleFavorite}
          onShare={handleShare}
        />
      )}

    </div>
  );
};

export default VirtualMuseum;
