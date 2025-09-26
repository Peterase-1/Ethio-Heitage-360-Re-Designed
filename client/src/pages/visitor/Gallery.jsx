import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { FaImages, FaSearch, FaFilter, FaHeart, FaShare, FaEye, FaExpand } from 'react-icons/fa';
import { toast } from 'react-toastify';

const Gallery = () => {
  const { user } = useAuth();
  const [artifacts, setArtifacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedArtifact, setSelectedArtifact] = useState(null);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    fetchGallery();
    fetchFavorites();
  }, [selectedCategory, selectedPeriod]);

  const fetchGallery = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (selectedPeriod !== 'all') params.append('period', selectedPeriod);
      if (searchQuery) params.append('search', searchQuery);
      
      const response = await fetch(`/api/museum/artifacts?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch gallery');
      }

      const data = await response.json();
      setArtifacts(data.artifacts || []);
    } catch (error) {
      console.error('Error fetching gallery:', error);
      toast.error('Failed to load gallery');
      
      // Mock data fallback
      setArtifacts([
        {
          _id: '1',
          title: 'Ancient Ethiopian Crown',
          description: 'A ceremonial crown from the Axumite Kingdom, dating back to the 4th century CE.',
          imageUrl: '/images/artifacts/crown.jpg',
          category: 'royal-regalia',
          period: 'ancient',
          location: 'Axum Archaeological Museum',
          views: 1250,
          likes: 89,
          dateAdded: '2024-01-15',
          tags: ['crown', 'royal', 'axum', 'ceremony']
        },
        {
          _id: '2',
          title: 'Lalibela Stone Carving',
          description: 'Intricate stone carving from the famous rock churches of Lalibela.',
          imageUrl: '/images/artifacts/carving.jpg',
          category: 'religious',
          period: 'medieval',
          location: 'Lalibela Churches',
          views: 980,
          likes: 67,
          dateAdded: '2024-01-12',
          tags: ['carving', 'religious', 'lalibela', 'stone']
        },
        {
          _id: '3',
          title: 'Traditional Coffee Ceremony Set',
          description: 'Complete set for Ethiopian coffee ceremony including jebena, cups, and incense burner.',
          imageUrl: '/images/artifacts/coffee-set.jpg',
          category: 'cultural',
          period: 'traditional',
          location: 'National Museum',
          views: 756,
          likes: 92,
          dateAdded: '2024-01-10',
          tags: ['coffee', 'ceremony', 'traditional', 'culture']
        },
        {
          _id: '4',
          title: 'Gondar Castle Architecture',
          description: 'Detailed model and photographs of the royal enclosure at Gondar.',
          imageUrl: '/images/artifacts/gondar-castle.jpg',
          category: 'architecture',
          period: 'medieval',
          location: 'Fasil Ghebbi',
          views: 1100,
          likes: 78,
          dateAdded: '2024-01-08',
          tags: ['architecture', 'castle', 'gondar', 'royal']
        },
        {
          _id: '5',
          title: 'Harar Manuscript Collection',
          description: 'Ancient Islamic manuscripts from the historic city of Harar.',
          imageUrl: '/images/artifacts/manuscripts.jpg',
          category: 'manuscripts',
          period: 'medieval',
          location: 'Harar Cultural Center',
          views: 643,
          likes: 45,
          dateAdded: '2024-01-05',
          tags: ['manuscript', 'islamic', 'harar', 'text']
        },
        {
          _id: '6',
          title: 'Lucy (Australopithecus afarensis)',
          description: 'Cast replica of Lucy, one of the most important fossil discoveries in human evolution.',
          imageUrl: '/images/artifacts/lucy.jpg',
          category: 'archaeological',
          period: 'prehistoric',
          location: 'National Museum',
          views: 2150,
          likes: 156,
          dateAdded: '2024-01-01',
          tags: ['fossil', 'lucy', 'evolution', 'prehistoric']
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    try {
      const response = await fetch('/api/visitor/favorites/artifacts', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setFavorites(data.favorites?.map(f => f.artifactId) || []);
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
      setFavorites(['2', '3']); // Mock favorites
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchGallery();
  };

  const toggleFavorite = async (artifactId) => {
    try {
      const isFavorite = favorites.includes(artifactId);
      const method = isFavorite ? 'DELETE' : 'POST';
      
      const response = await fetch(`/api/visitor/favorites/artifacts/${artifactId}`, {
        method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        if (isFavorite) {
          setFavorites(prev => prev.filter(id => id !== artifactId));
          toast.success('Removed from favorites');
        } else {
          setFavorites(prev => [...prev, artifactId]);
          toast.success('Added to favorites');
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorites');
    }
  };

  const shareArtifact = (artifact) => {
    if (navigator.share) {
      navigator.share({
        title: artifact.title,
        text: artifact.description,
        url: `${window.location.origin}/gallery/${artifact._id}`
      });
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/gallery/${artifact._id}`);
      toast.success('Link copied to clipboard!');
    }
  };

  const filteredArtifacts = artifacts.filter(artifact => {
    const matchesSearch = !searchQuery || 
      artifact.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      artifact.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      artifact.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesSearch;
  });

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'royal-regalia', label: 'Royal Regalia' },
    { value: 'religious', label: 'Religious Artifacts' },
    { value: 'cultural', label: 'Cultural Items' },
    { value: 'architecture', label: 'Architecture' },
    { value: 'manuscripts', label: 'Manuscripts' },
    { value: 'archaeological', label: 'Archaeological Finds' }
  ];

  const periods = [
    { value: 'all', label: 'All Periods' },
    { value: 'prehistoric', label: 'Prehistoric' },
    { value: 'ancient', label: 'Ancient (Before 1270)' },
    { value: 'medieval', label: 'Medieval (1270-1855)' },
    { value: 'modern', label: 'Modern (1855-1974)' },
    { value: 'traditional', label: 'Traditional/Ongoing' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                <FaImages className="text-blue-600" />
                Virtual Gallery
              </h1>
              <p className="text-gray-600 mt-2">Explore Ethiopia's rich cultural heritage through digital artifacts</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${
                  viewMode === 'grid' 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <div className="grid grid-cols-2 gap-1 w-4 h-4">
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                </div>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${
                  viewMode === 'list' 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <div className="space-y-1 w-4 h-4">
                  <div className="bg-current h-1 rounded-sm"></div>
                  <div className="bg-current h-1 rounded-sm"></div>
                  <div className="bg-current h-1 rounded-sm"></div>
                </div>
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search artifacts, descriptions, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>

            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {periods.map(period => (
                <option key={period.value} value={period.value}>
                  {period.label}
                </option>
              ))}
            </select>

            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <FaFilter />
              Filter
            </button>
          </form>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Found {filteredArtifacts.length} artifact{filteredArtifacts.length !== 1 ? 's' : ''}
            {(selectedCategory !== 'all' || selectedPeriod !== 'all' || searchQuery) && ' matching your criteria'}
          </p>
        </div>

        {/* Gallery Grid/List */}
        <div className={`${
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
            : 'space-y-4'
        }`}>
          {filteredArtifacts.map((artifact) => (
            <div
              key={artifact._id}
              className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 ${
                viewMode === 'list' ? 'flex' : ''
              }`}
            >
              {/* Image */}
              <div className={`relative ${
                viewMode === 'list' ? 'w-48 h-32' : 'w-full h-48'
              } bg-gray-200 flex items-center justify-center cursor-pointer`}
                onClick={() => setSelectedArtifact(artifact)}
              >
                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <FaImages className="h-12 w-12 text-gray-400" />
                </div>
                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                  <FaExpand className="text-white opacity-0 hover:opacity-100 transition-opacity" />
                </div>
              </div>

              {/* Content */}
              <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-800 line-clamp-2">{artifact.title}</h3>
                  <button
                    onClick={() => toggleFavorite(artifact._id)}
                    className={`ml-2 p-1 rounded-full transition-colors ${
                      favorites.includes(artifact._id)
                        ? 'text-red-500 hover:text-red-600'
                        : 'text-gray-400 hover:text-red-500'
                    }`}
                  >
                    <FaHeart className={favorites.includes(artifact._id) ? 'fill-current' : ''} />
                  </button>
                </div>
                
                <p className="text-gray-600 text-sm mb-3 line-clamp-3">{artifact.description}</p>
                
                <div className="flex flex-wrap gap-1 mb-3">
                  {artifact.tags?.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{artifact.location}</span>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <FaEye />
                      {artifact.views}
                    </span>
                    <span className="flex items-center gap-1">
                      <FaHeart />
                      {artifact.likes}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-200">
                  <button
                    onClick={() => setSelectedArtifact(artifact)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => shareArtifact(artifact)}
                    className="text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <FaShare />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredArtifacts.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FaImages className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No artifacts found</h3>
            <p className="text-gray-500 mb-6">
              Try adjusting your search criteria or browse different categories.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedPeriod('all');
                fetchGallery();
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Artifact Detail Modal */}
      {selectedArtifact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-800">{selectedArtifact.title}</h2>
                <button
                  onClick={() => setSelectedArtifact(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="w-full h-64 md:h-80 bg-gray-200 rounded-lg flex items-center justify-center">
                  <FaImages className="h-20 w-20 text-gray-400" />
                </div>
                
                <div>
                  <p className="text-gray-700 mb-4">{selectedArtifact.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <p><span className="font-medium">Location:</span> {selectedArtifact.location}</p>
                    <p><span className="font-medium">Period:</span> {periods.find(p => p.value === selectedArtifact.period)?.label}</p>
                    <p><span className="font-medium">Category:</span> {categories.find(c => c.value === selectedArtifact.category)?.label}</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-4">
                    {selectedArtifact.tags?.map((tag) => (
                      <span
                        key={tag}
                        className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => toggleFavorite(selectedArtifact._id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                        favorites.includes(selectedArtifact._id)
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <FaHeart className={favorites.includes(selectedArtifact._id) ? 'fill-current' : ''} />
                      {favorites.includes(selectedArtifact._id) ? 'Remove from Favorites' : 'Add to Favorites'}
                    </button>
                    
                    <button
                      onClick={() => shareArtifact(selectedArtifact)}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      <FaShare />
                      Share
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;
