import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Filter, Grid3X3, List, Eye, Heart, Share2, MapPin, 
  Clock, Camera, Download, ZoomIn, X, ChevronLeft, ChevronRight,
  Tag, Info, Calendar, User, Image as ImageIcon, Star
} from 'lucide-react';
import imageService from '../services/imageService';
import { EthiopianColors } from '../assets/EthiopianAssets';

const HeritagePhotoGallery = ({ 
  title = "Ethiopian Heritage Photo Gallery", 
  showFilters = true,
  showSearch = true,
  initialCategory = null,
  maxImages = null,
  layout = "gallery" // gallery, grid, list
}) => {
  const [images, setImages] = useState([]);
  const [filteredImages, setFilteredImages] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || '');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFiltersPanel] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState(new Set());
  const [sortBy, setSortBy] = useState('title'); // title, year, category, region
  const [sortOrder, setSortOrder] = useState('asc'); // asc, desc

  // Get service data
  const categories = imageService.getCategories();
  const regions = imageService.getRegions();
  const periods = imageService.getPeriods();
  const statistics = useMemo(() => imageService.getImageStatistics(), []);

  useEffect(() => {
    const loadImages = async () => {
      setLoading(true);
      try {
        let allImages = imageService.getHeritageImages();
        
        if (initialCategory) {
          allImages = imageService.getImagesByCategory(initialCategory);
        }
        
        if (maxImages) {
          allImages = allImages.slice(0, maxImages);
        }
        
        setImages(allImages);
        setFilteredImages(allImages);
      } catch (error) {
        console.error('Error loading images:', error);
      } finally {
        setLoading(false);
      }
    };

    loadImages();
  }, [initialCategory, maxImages]);

  useEffect(() => {
    const filtered = imageService.searchImages(searchTerm, {
      category: selectedCategory,
      region: selectedRegion,
      period: selectedPeriod
    });
    
    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'year') {
        aValue = parseInt(aValue) || 0;
        bValue = parseInt(bValue) || 0;
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    setFilteredImages(sorted);
  }, [searchTerm, selectedCategory, selectedRegion, selectedPeriod, sortBy, sortOrder, images]);

  const handleImageClick = (image, index) => {
    setSelectedImage(image);
    setCurrentImageIndex(index);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
    setCurrentImageIndex(0);
  };

  const navigateImage = (direction) => {
    const newIndex = direction === 'next' 
      ? (currentImageIndex + 1) % filteredImages.length
      : (currentImageIndex - 1 + filteredImages.length) % filteredImages.length;
    
    setCurrentImageIndex(newIndex);
    setSelectedImage(filteredImages[newIndex]);
  };

  const toggleFavorite = (imageId) => {
    const newFavorites = new Set(favorites);
    if (favorites.has(imageId)) {
      newFavorites.delete(imageId);
    } else {
      newFavorites.add(imageId);
    }
    setFavorites(newFavorites);
  };

  const handleShare = async (image) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: image.title,
          text: image.description,
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback - copy to clipboard
      const text = `${image.title}\n${image.description}\n${window.location.href}`;
      navigator.clipboard.writeText(text);
      alert('Image details copied to clipboard!');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedRegion('');
    setSelectedPeriod('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
        <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <ImageIcon className="w-4 h-4" />
            {statistics.total} Images
          </div>
          <div className="flex items-center gap-1">
            <Tag className="w-4 h-4" />
            {Object.keys(statistics.byCategory).length} Categories
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            {Object.keys(statistics.byRegion).length} Regions
          </div>
        </div>
      </div>

      {/* Search and Controls */}
      {showSearch && (
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search photos by title, description, location, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Controls */}
          <div className="flex gap-2">
            {showFilters && (
              <button
                onClick={() => setShowFiltersPanel(!showFilters)}
                className={`px-4 py-2 rounded-lg border ${
                  showFilters ? 'bg-primary text-white' : 'bg-white text-gray-700 border-gray-300'
                } hover:shadow-md transition-all duration-200 flex items-center gap-2`}
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>
            )}

            {/* View Mode Toggle */}
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 ${
                  viewMode === 'grid' ? 'bg-primary text-white' : 'bg-white text-gray-700'
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 ${
                  viewMode === 'list' ? 'bg-primary text-white' : 'bg-white text-gray-700'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters Panel */}
      {showFilters && showFilters && (
        <div className="bg-gray-50 p-6 rounded-lg space-y-4">
          <div className="flex flex-wrap gap-4">
            {/* Category Filter */}
            <div className="flex-1 min-w-48">
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Region Filter */}
            <div className="flex-1 min-w-48">
              <label className="block text-sm font-medium text-gray-700 mb-2">Region</label>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">All Regions</option>
                {regions.map(region => (
                  <option key={region.id} value={region.id}>
                    {region.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Period Filter */}
            <div className="flex-1 min-w-48">
              <label className="block text-sm font-medium text-gray-700 mb-2">Historical Period</label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">All Periods</option>
                {periods.map(period => (
                  <option key={period.id} value={period.id}>
                    {period.name} ({period.range})
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Options */}
            <div className="flex-1 min-w-48">
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="title">Title</option>
                  <option value="year">Year</option>
                  <option value="category">Category</option>
                  <option value="region">Region</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>
          </div>

          {/* Active Filters & Clear */}
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {searchTerm && (
                <span className="px-2 py-1 bg-primary text-white text-xs rounded-full">
                  Search: "{searchTerm}"
                </span>
              )}
              {selectedCategory && (
                <span className="px-2 py-1 bg-primary text-white text-xs rounded-full">
                  {categories.find(c => c.id === selectedCategory)?.name}
                </span>
              )}
              {selectedRegion && (
                <span className="px-2 py-1 bg-primary text-white text-xs rounded-full">
                  {regions.find(r => r.id === selectedRegion)?.name}
                </span>
              )}
              {selectedPeriod && (
                <span className="px-2 py-1 bg-primary text-white text-xs rounded-full">
                  {periods.find(p => p.id === selectedPeriod)?.name}
                </span>
              )}
            </div>
            
            {(searchTerm || selectedCategory || selectedRegion || selectedPeriod) && (
              <button
                onClick={clearFilters}
                className="text-sm text-gray-600 hover:text-gray-800 underline"
              >
                Clear All Filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* Results Summary */}
      <div className="text-center text-gray-600">
        {filteredImages.length === images.length ? (
          <p>Showing all {images.length} heritage photos</p>
        ) : (
          <p>Showing {filteredImages.length} of {images.length} photos</p>
        )}
      </div>

      {/* Photo Gallery */}
      {filteredImages.length === 0 ? (
        <div className="text-center py-12">
          <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No photos found</h3>
          <p className="text-gray-600">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className={`grid gap-6 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
            : 'grid-cols-1'
        }`}>
          {filteredImages.map((image, index) => (
            <PhotoCard
              key={image.id}
              image={image}
              index={index}
              viewMode={viewMode}
              isFavorite={favorites.has(image.id)}
              onImageClick={() => handleImageClick(image, index)}
              onToggleFavorite={() => toggleFavorite(image.id)}
              onShare={() => handleShare(image)}
              categories={categories}
              regions={regions}
              periods={periods}
            />
          ))}
        </div>
      )}

      {/* Image Detail Modal */}
      {selectedImage && (
        <ImageModal
          image={selectedImage}
          currentIndex={currentImageIndex}
          totalImages={filteredImages.length}
          onClose={handleCloseModal}
          onNavigate={navigateImage}
          onToggleFavorite={() => toggleFavorite(selectedImage.id)}
          onShare={() => handleShare(selectedImage)}
          isFavorite={favorites.has(selectedImage.id)}
          categories={categories}
          regions={regions}
          periods={periods}
        />
      )}
    </div>
  );
};

// Photo Card Component
const PhotoCard = ({ 
  image, 
  index, 
  viewMode, 
  isFavorite, 
  onImageClick, 
  onToggleFavorite, 
  onShare,
  categories,
  regions,
  periods 
}) => {
  const category = categories.find(c => c.id === image.category);
  const region = regions.find(r => r.id === image.region);
  const period = periods.find(p => p.id === image.period);

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          <div className="lg:w-80 h-48 lg:h-auto">
            <img
              src={image.thumbnail}
              alt={image.title}
              className="w-full h-full object-cover cursor-pointer"
              onClick={onImageClick}
            />
          </div>
          
          <div className="flex-1 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 
                  className="text-xl font-bold text-gray-900 cursor-pointer hover:text-primary mb-2"
                  onClick={onImageClick}
                >
                  {image.title}
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-2">{image.description}</p>
              </div>
              
              <div className="flex gap-2 ml-4">
                <button
                  onClick={onToggleFavorite}
                  className={`p-2 rounded-full transition-colors ${
                    isFavorite ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:text-red-500'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                </button>
                <button
                  onClick={onShare}
                  className="p-2 rounded-full text-gray-400 hover:text-primary transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {category && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  <span className="mr-1">{category.icon}</span>
                  {category.name}
                </span>
              )}
              {region && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <MapPin className="w-3 h-3 mr-1" />
                  {region.name}
                </span>
              )}
              {period && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  <Clock className="w-3 h-3 mr-1" />
                  {period.range}
                </span>
              )}
            </div>

            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {image.location}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {image.year}
                </span>
              </div>
              
              <button
                onClick={onImageClick}
                className="flex items-center gap-1 text-primary hover:text-primary-dark transition-colors"
              >
                <ZoomIn className="w-3 h-3" />
                View Details
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={image.thumbnail}
          alt={image.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
          onClick={onImageClick}
        />
        
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={onImageClick}
              className="bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-shadow"
            >
              <ZoomIn className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        </div>

        {/* Category badge */}
        {category && (
          <div className="absolute top-3 left-3">
            <span 
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white"
              style={{ backgroundColor: category.color }}
            >
              <span className="mr-1">{category.icon}</span>
              {category.name}
            </span>
          </div>
        )}

        {/* Action buttons */}
        <div className="absolute top-3 right-3 flex gap-1">
          <button
            onClick={onToggleFavorite}
            className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
              isFavorite 
                ? 'text-red-500 bg-white/90' 
                : 'text-white bg-black/30 hover:bg-white/90 hover:text-red-500'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={onShare}
            className="p-2 rounded-full backdrop-blur-sm text-white bg-black/30 hover:bg-white/90 hover:text-gray-700 transition-colors"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-4">
        <h3 
          className="font-bold text-gray-900 cursor-pointer hover:text-primary transition-colors mb-2 line-clamp-2"
          onClick={onImageClick}
        >
          {image.title}
        </h3>
        
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {image.description}
        </p>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            <span>{region?.name}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{image.year}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Image Detail Modal Component
const ImageModal = ({ 
  image, 
  currentIndex, 
  totalImages, 
  onClose, 
  onNavigate, 
  onToggleFavorite, 
  onShare, 
  isFavorite,
  categories,
  regions,
  periods 
}) => {
  const category = categories.find(c => c.id === image.category);
  const region = regions.find(r => r.id === image.region);
  const period = periods.find(p => p.id === image.period);

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full max-h-full flex flex-col lg:flex-row bg-white rounded-xl overflow-hidden">
        {/* Image Section */}
        <div className="lg:w-2/3 relative">
          <img
            src={image.url}
            alt={image.title}
            className="w-full h-64 lg:h-full object-cover"
          />
          
          {/* Navigation */}
          {totalImages > 1 && (
            <>
              <button
                onClick={() => onNavigate('prev')}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-opacity"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={() => onNavigate('next')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-opacity"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Image counter */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
            {currentIndex + 1} of {totalImages}
          </div>
        </div>

        {/* Details Section */}
        <div className="lg:w-1/3 p-6 overflow-y-auto">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex-1">{image.title}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors ml-4"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={onToggleFavorite}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isFavorite 
                  ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
              {isFavorite ? 'Favorited' : 'Add to Favorites'}
            </button>
            <button
              onClick={onShare}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {category && (
              <span 
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white"
                style={{ backgroundColor: category.color }}
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </span>
            )}
            {region && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                <MapPin className="w-4 h-4 mr-1" />
                {region.name}
              </span>
            )}
            {period && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                <Clock className="w-4 h-4 mr-1" />
                {period.range}
              </span>
            )}
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-gray-700 leading-relaxed">{image.description}</p>
          </div>

          {/* Significance */}
          {image.significance && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Cultural Significance</h3>
              <p className="text-gray-700 leading-relaxed">{image.significance}</p>
            </div>
          )}

          {/* Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Details</h3>
            
            <div className="grid grid-cols-1 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span className="font-medium">Location:</span>
                <span className="text-gray-700">{image.location}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="font-medium">Year:</span>
                <span className="text-gray-700">{image.year}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                <span className="font-medium">Photographer:</span>
                <span className="text-gray-700">{image.photographer}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-gray-500" />
                <span className="font-medium">Dimensions:</span>
                <span className="text-gray-700">{image.dimensions.width} × {image.dimensions.height}px</span>
              </div>
              
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-gray-500" />
                <span className="font-medium">File Size:</span>
                <span className="text-gray-700">{image.fileSize}</span>
              </div>
            </div>

            {/* Tags */}
            {image.tags && image.tags.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Tags</h4>
                <div className="flex flex-wrap gap-1">
                  {image.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeritagePhotoGallery;
