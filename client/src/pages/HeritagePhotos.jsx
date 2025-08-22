import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Camera, Share2, Star, TrendingUp, Calendar,
  Award, Users, MapPin, Clock, Eye, Heart
} from 'lucide-react';
import HeritagePhotoGallery from '../components/HeritagePhotoGallery';
import imageService from '../services/imageService';
import { EthiopianColors, EthiopianIcons } from '../assets/EthiopianAssets';

const HeritagePhotos = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  
  // Get service data for featured sections
  const featuredImages = imageService.getFeaturedImages();
  const statistics = imageService.getImageStatistics();
  const categories = imageService.getCategories();

  // Tab configuration
  const tabs = [
    { id: 'all', name: 'All Photos', icon: Camera },
    { id: 'featured', name: 'Featured', icon: Star },
    { id: 'recent', name: 'Recent', icon: TrendingUp },
    { id: 'popular', name: 'Popular', icon: Heart },
  ];

  // Category showcase cards
  const CategoryShowcase = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
      {categories.map((category) => {
        const categoryCount = statistics.byCategory[category.id] || 0;
        return (
          <div
            key={category.id}
            onClick={() => navigate(`/heritage-photos/${category.id}`)}
            className="group cursor-pointer bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300 text-center border hover:border-primary/30"
          >
            <div 
              className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center text-white text-2xl group-hover:scale-110 transition-transform"
              style={{ backgroundColor: category.color }}
            >
              {category.icon}
            </div>
            <h3 className="font-semibold text-gray-900 text-sm group-hover:text-primary transition-colors mb-1">
              {category.name}
            </h3>
            <p className="text-xs text-gray-500">
              {categoryCount} photos
            </p>
          </div>
        );
      })}
    </div>
  );

  // Featured photos section
  const FeaturedSection = () => (
    <div className="space-y-8">
      {/* Hero Featured Image */}
      {featuredImages.length > 0 && (
        <div className="relative h-96 rounded-2xl overflow-hidden group cursor-pointer">
          <img
            src={featuredImages[0].url}
            alt={featuredImages[0].title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            onClick={() => navigate('/virtual-museum')}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-8 left-8 right-8 text-white">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-5 h-5 text-yellow-400 fill-current" />
              <span className="text-sm font-medium">Featured Heritage Photo</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-3">{featuredImages[0].title}</h2>
            <p className="text-lg text-gray-200 mb-4 max-w-2xl">{featuredImages[0].description}</p>
            <div className="flex items-center gap-6 text-sm">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {featuredImages[0].location}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {featuredImages[0].year}
              </span>
              <span className="flex items-center gap-1">
                <Camera className="w-4 h-4" />
                {featuredImages[0].photographer}
              </span>
            </div>
          </div>
          <button 
            onClick={() => navigate('/virtual-museum')}
            className="absolute top-8 right-8 bg-white/90 hover:bg-white text-gray-900 px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            View in Museum
          </button>
        </div>
      )}

      {/* Featured Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
        {featuredImages.slice(1, 4).map((image) => {
          const category = categories.find(c => c.id === image.category);
          return (
            <div
              key={image.id}
              className="group cursor-pointer bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={image.thumbnail}
                  alt={image.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
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
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
              </div>
              <div className="p-4">
                <h3 className="font-bold text-gray-900 group-hover:text-primary transition-colors mb-2 line-clamp-2">
                  {image.title}
                </h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {image.description}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {image.location.split(',')[0]}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {image.year}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Camera className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900">
                Ethiopian Heritage Photos
              </h1>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Explore the rich cultural heritage of Ethiopia through our comprehensive collection of historical and cultural photographs. From ancient archaeological sites to vibrant festivals and traditional crafts.
            </p>
            
            {/* Quick Stats */}
            <div className="flex flex-wrap justify-center gap-6 mt-8 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-lg">
                <Camera className="w-5 h-5 text-primary" />
                <span className="font-semibold text-gray-900">{statistics.total}</span>
                <span className="text-gray-600">Heritage Photos</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-lg">
                <Award className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-gray-900">{categories.length}</span>
                <span className="text-gray-600">Categories</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg">
                <MapPin className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-gray-900">{Object.keys(statistics.byRegion).length}</span>
                <span className="text-gray-600">Regions</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-lg">
                <Clock className="w-5 h-5 text-purple-600" />
                <span className="font-semibold text-gray-900">3000+</span>
                <span className="text-gray-600">Years of History</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Categories Showcase */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Explore by Category</h2>
            <button 
              onClick={() => setActiveTab('all')}
              className="text-primary hover:text-primary-dark font-medium"
            >
              View All →
            </button>
          </div>
          <CategoryShowcase />
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-200">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.name}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {activeTab === 'featured' ? (
            <FeaturedSection />
          ) : activeTab === 'recent' ? (
            <HeritagePhotoGallery
              title="Recently Added Heritage Photos"
              showFilters={true}
              showSearch={true}
              maxImages={20}
            />
          ) : activeTab === 'popular' ? (
            <HeritagePhotoGallery
              title="Most Popular Heritage Photos"
              showFilters={true}
              showSearch={true}
              maxImages={20}
            />
          ) : (
            <HeritagePhotoGallery
              title=""
              showFilters={true}
              showSearch={true}
            />
          )}
        </div>

        {/* Call to Action */}
        <div className="mt-16 bg-gradient-to-r from-primary to-primary-dark rounded-2xl p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Discover More Ethiopian Heritage</h2>
          <p className="text-xl opacity-90 mb-6 max-w-2xl mx-auto">
            Explore our interactive virtual museum with 3D artifacts, virtual tours, and immersive experiences of Ethiopian cultural heritage.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => navigate('/virtual-museum')}
              className="bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2"
            >
              <Eye className="w-5 h-5" />
              Visit Virtual Museum
            </button>
            <button
              onClick={() => navigate('/learning')}
              className="bg-white/10 text-white border border-white/20 px-8 py-3 rounded-lg font-semibold hover:bg-white/20 transition-colors flex items-center gap-2"
            >
              <Award className="w-5 h-5" />
              Start Learning Journey
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeritagePhotos;
