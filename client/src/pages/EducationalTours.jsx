import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Star, Calendar, MapPin, Users, Clock, Award, Eye, ChevronRight, BookOpen, User } from 'lucide-react';
import educationalToursApi, { tourUtils, handleApiError } from '../services/educationalToursApi';

const EducationalTours = () => {
  const navigate = useNavigate();
  const [tours, setTours] = useState([]);
  const [filteredTours, setFilteredTours] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTour, setSelectedTour] = useState(null);
  const [enrolling, setEnrolling] = useState(null);
  const [user, setUser] = useState(null);

  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    difficulty: 'all',
    sortBy: 'startDate',
    sortOrder: 'asc',
    priceMin: '',
    priceMax: '',
    upcoming: false
  });

  useEffect(() => {
    // Get user from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    
    fetchTours();
    fetchCategories();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [tours, filters]);

  const fetchTours = async () => {
    try {
      setLoading(true);
      const params = {
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder
      };
      
      if (filters.priceMin) params.priceMin = filters.priceMin;
      if (filters.priceMax) params.priceMax = filters.priceMax;
      
      const response = await educationalToursApi.public.getPublishedTours(params);
      setTours(response.data || []);
    } catch (error) {
      console.error('Error fetching tours:', error);
      // Could add toast notification here
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await educationalToursApi.public.getCategories();
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...tours];

    // Apply search filter
    if (filters.search) {
      filtered = tourUtils.searchTours(filtered, filters.search);
    }

    // Apply category filter
    if (filters.category !== 'all') {
      filtered = tourUtils.filterByCategory(filtered, filters.category);
    }

    // Apply difficulty filter
    if (filters.difficulty !== 'all') {
      filtered = tourUtils.filterByDifficulty(filtered, filters.difficulty);
    }

    // Apply upcoming filter
    if (filters.upcoming) {
      filtered = filtered.filter(tour => tourUtils.isUpcoming(tour));
    }

    // Apply sorting
    filtered = tourUtils.sortTours(filtered, filters.sortBy, filters.sortOrder);

    setFilteredTours(filtered);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleEnroll = async (tourId) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    try {
      setEnrolling(tourId);
      await educationalToursApi.user.enrollInTour(tourId);
      // Could show success message
      navigate('/visitor-dashboard');
    } catch (error) {
      console.error('Enrollment error:', error);
      alert(handleApiError(error));
    } finally {
      setEnrolling(null);
    }
  };

  const getTourCardColor = (category) => {
    const colors = {
      'Islamic Heritage': 'bg-gradient-to-br from-heritage-moss/10 to-heritage-moss/5',
      'Islamic Architecture': 'bg-gradient-to-br from-heritage-amber/10 to-heritage-amber/5',
      'Ethiopian Scripts': 'bg-gradient-to-br from-heritage-terra/10 to-heritage-terra/5',
      'Traditional Arts': 'bg-gradient-to-br from-heritage-sand/20 to-heritage-sand/10',
      'Cultural Heritage': 'bg-gradient-to-br from-heritage-moss/5 to-heritage-amber/5'
    };
    return colors[category] || 'bg-gradient-to-br from-gray-50 to-white';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-heritage-light">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-heritage-moss"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-heritage-light">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-heritage-moss to-heritage-amber text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Educational Heritage Tours
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Discover Ethiopia's rich cultural heritage through immersive, expert-guided learning experiences
            </p>
            <div className="flex items-center justify-center gap-8 text-lg">
              <div className="flex items-center gap-2">
                <BookOpen className="w-6 h-6" />
                <span>{tours.length} Tours Available</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-6 h-6" />
                <span>Expert Local Guides</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-6 h-6" />
                <span>Certificate of Completion</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8 border border-heritage-sand/20">
          <div className="grid md:grid-cols-4 gap-4 mb-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-heritage-dark/60 w-5 h-5" />
              <input
                type="text"
                placeholder="Search tours..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-heritage-sand/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-heritage-moss"
              />
            </div>

            {/* Category Filter */}
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full px-4 py-3 border border-heritage-sand/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-heritage-moss"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat._id}>
                  {cat._id} ({cat.count})
                </option>
              ))}
            </select>

            {/* Difficulty Filter */}
            <select
              value={filters.difficulty}
              onChange={(e) => handleFilterChange('difficulty', e.target.value)}
              className="w-full px-4 py-3 border border-heritage-sand/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-heritage-moss"
            >
              <option value="all">All Difficulty Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>

            {/* Sort Options */}
            <select
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('-');
                handleFilterChange('sortBy', sortBy);
                handleFilterChange('sortOrder', sortOrder);
              }}
              className="w-full px-4 py-3 border border-heritage-sand/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-heritage-moss"
            >
              <option value="startDate-asc">Date: Earliest First</option>
              <option value="startDate-desc">Date: Latest First</option>
              <option value="stats.averageRating-desc">Highest Rated</option>
              <option value="pricing.price-asc">Price: Low to High</option>
              <option value="pricing.price-desc">Price: High to Low</option>
            </select>
          </div>

          <div className="flex flex-wrap gap-4 items-center">
            {/* Price Range */}
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min Price"
                value={filters.priceMin}
                onChange={(e) => handleFilterChange('priceMin', e.target.value)}
                className="w-24 px-3 py-2 border border-heritage-sand/30 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-heritage-moss"
              />
              <span className="text-heritage-dark/70">-</span>
              <input
                type="number"
                placeholder="Max Price"
                value={filters.priceMax}
                onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                className="w-24 px-3 py-2 border border-heritage-sand/30 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-heritage-moss"
              />
            </div>

            {/* Upcoming Filter */}
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={filters.upcoming}
                onChange={(e) => handleFilterChange('upcoming', e.target.checked)}
                className="w-4 h-4 text-heritage-moss border-heritage-sand/30 rounded focus:ring-heritage-moss"
              />
              <span className="text-heritage-dark">Upcoming Only</span>
            </label>

            {/* Results Count */}
            <div className="ml-auto text-heritage-dark/70">
              {filteredTours.length} tour{filteredTours.length !== 1 ? 's' : ''} found
            </div>
          </div>
        </div>

        {/* Tours Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTours.map((tour) => {
            const enrollmentCheck = tourUtils.canEnroll(tour, user);
            const isUpcoming = tourUtils.isUpcoming(tour);
            const isOngoing = tourUtils.isOngoing(tour);
            
            return (
              <div key={tour._id} className={`rounded-lg shadow-sm border border-heritage-sand/20 overflow-hidden hover:shadow-md transition-shadow ${getTourCardColor(tour.category)}`}>
                {/* Tour Image or Placeholder */}
                <div className="h-48 bg-gradient-to-r from-heritage-moss to-heritage-amber relative">
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <BookOpen className="w-12 h-12 text-white" />
                  </div>
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${tourUtils.getDifficultyColor(tour.difficulty)}`}>
                      {tour.difficulty}
                    </span>
                    {isUpcoming && (
                      <span className="bg-heritage-amber text-white px-2 py-1 text-xs font-medium rounded-full">
                        Upcoming
                      </span>
                    )}
                    {isOngoing && (
                      <span className="bg-heritage-moss text-white px-2 py-1 text-xs font-medium rounded-full">
                        Ongoing
                      </span>
                    )}
                  </div>
                  <div className="absolute top-4 right-4 bg-white/90 px-2 py-1 rounded-lg">
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-medium">{tour.stats.averageRating.toFixed(1)}</span>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {/* Tour Header */}
                  <div className="mb-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-semibold text-heritage-dark line-clamp-2">{tour.title}</h3>
                      <div className="text-right ml-4">
                        <div className="text-2xl font-bold text-heritage-moss">{tour.pricing.price}</div>
                        <div className="text-sm text-heritage-dark/70">{tour.pricing.currency}</div>
                      </div>
                    </div>
                    <p className="text-heritage-dark/70 text-sm mb-3 line-clamp-2">{tour.shortDescription}</p>
                    <div className="flex items-center gap-1 text-sm text-heritage-amber">
                      <Award className="w-4 h-4" />
                      <span>{tour.category}</span>
                    </div>
                  </div>

                  {/* Tour Details */}
                  <div className="space-y-2 text-sm text-heritage-dark/70 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(tour.startDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{tour.duration} hours</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{tour.location.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>{tourUtils.getAvailableSpots(tour)}/{tour.maxParticipants} spots available</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>Led by {tour.organizerName}</span>
                    </div>
                  </div>

                  {/* Tour Stats */}
                  <div className="flex items-center gap-4 text-xs text-heritage-dark/60 mb-4 pb-4 border-b border-heritage-sand/20">
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {tour.stats.views} views
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {tour.stats.enrollments} enrolled
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      {tour.curriculum?.length || 0} lessons
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <button
                      onClick={() => setSelectedTour(tour)}
                      className="w-full bg-heritage-sand/20 text-heritage-dark px-4 py-2 rounded-lg hover:bg-heritage-sand/30 transition-colors flex items-center justify-center gap-2"
                    >
                      View Details <ChevronRight className="w-4 h-4" />
                    </button>
                    
                    {enrollmentCheck.canEnroll ? (
                      <button
                        onClick={() => handleEnroll(tour._id)}
                        disabled={enrolling === tour._id}
                        className="w-full bg-heritage-moss text-white px-4 py-2 rounded-lg hover:bg-heritage-moss/90 transition-colors disabled:opacity-50"
                      >
                        {enrolling === tour._id ? 'Enrolling...' : 'Enroll Now'}
                      </button>
                    ) : (
                      <button
                        disabled
                        className="w-full bg-gray-200 text-gray-500 px-4 py-2 rounded-lg cursor-not-allowed"
                      >
                        {enrollmentCheck.reason}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredTours.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-heritage-sand mx-auto mb-4" />
            <h3 className="text-xl font-medium text-heritage-dark mb-2">No tours found</h3>
            <p className="text-heritage-dark/70 mb-4">Try adjusting your filters to find more tours</p>
            <button
              onClick={() => setFilters({
                search: '',
                category: 'all',
                difficulty: 'all',
                sortBy: 'startDate',
                sortOrder: 'asc',
                priceMin: '',
                priceMax: '',
                upcoming: false
              })}
              className="text-heritage-moss hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Tour Details Modal */}
      {selectedTour && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-heritage-sand/20">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-2xl font-semibold text-heritage-dark mb-2">{selectedTour.title}</h3>
                  <p className="text-heritage-dark/70">{selectedTour.shortDescription}</p>
                  <div className="flex items-center gap-4 mt-4">
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${tourUtils.getDifficultyColor(selectedTour.difficulty)}`}>
                      {selectedTour.difficulty}
                    </span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span>{selectedTour.stats.averageRating.toFixed(1)}</span>
                      <span className="text-sm text-heritage-dark/70">({selectedTour.stats.totalRatings} reviews)</span>
                    </div>
                    <div className="text-2xl font-bold text-heritage-moss">
                      {selectedTour.pricing.price} {selectedTour.pricing.currency}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTour(null)}
                  className="text-heritage-dark/70 hover:text-heritage-dark text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Description */}
              <div className="mb-6">
                <h4 className="font-semibold text-heritage-dark mb-3">About This Tour</h4>
                <p className="text-heritage-dark/70">{selectedTour.description}</p>
              </div>

              {/* Tour Information */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-semibold text-heritage-dark mb-3">Tour Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-heritage-dark/70" />
                      <span>{tourUtils.formatDate(selectedTour.startDate)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-heritage-dark/70" />
                      <span>{selectedTour.duration} hours</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-heritage-dark/70" />
                      <div>
                        <div>{selectedTour.location.name}</div>
                        <div className="text-heritage-dark/60">{selectedTour.location.address}</div>
                        <div className="text-heritage-dark/60">Meeting: {selectedTour.location.meetingPoint}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-heritage-dark/70" />
                      <span>Max {selectedTour.maxParticipants} participants</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-heritage-dark mb-3">Learning Objectives</h4>
                  <ul className="space-y-1 text-sm text-heritage-dark/70">
                    {selectedTour.learningObjectives?.map((objective, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Award className="w-4 h-4 text-heritage-moss mt-0.5 flex-shrink-0" />
                        <span>{objective}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Curriculum */}
              {selectedTour.curriculum && selectedTour.curriculum.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-heritage-dark mb-3">Course Curriculum</h4>
                  <div className="space-y-3">
                    {selectedTour.curriculum.map((lesson, index) => (
                      <div key={index} className="border border-heritage-sand/20 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-heritage-sand/20 text-heritage-dark/70 flex items-center justify-center text-xs font-medium">
                              {lesson.order}
                            </div>
                            <h5 className="font-medium text-heritage-dark">{lesson.title}</h5>
                          </div>
                          <span className="text-sm text-heritage-dark/70">{lesson.duration} min</span>
                        </div>
                        <p className="text-heritage-dark/70 text-sm mb-2 ml-9">{lesson.description}</p>
                        {lesson.activities && lesson.activities.length > 0 && (
                          <div className="flex items-center gap-2 text-xs text-heritage-dark/60 ml-9">
                            {lesson.activities.map((activity, actIndex) => (
                              <span key={actIndex} className="bg-heritage-sand/20 px-2 py-1 rounded">
                                {activity}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pricing Details */}
              <div className="mb-6">
                <h4 className="font-semibold text-heritage-dark mb-3">What's Included</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  {selectedTour.pricing.includes && selectedTour.pricing.includes.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium text-heritage-moss mb-2">Included:</h5>
                      <ul className="space-y-1 text-sm text-heritage-dark/70">
                        {selectedTour.pricing.includes.map((item, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-heritage-moss rounded-full"></div>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {selectedTour.pricing.excludes && selectedTour.pricing.excludes.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium text-red-600 mb-2">Not Included:</h5>
                      <ul className="space-y-1 text-sm text-heritage-dark/70">
                        {selectedTour.pricing.excludes.map((item, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-6 border-t border-heritage-sand/20">
                <button
                  onClick={() => setSelectedTour(null)}
                  className="bg-heritage-sand/20 text-heritage-dark px-6 py-2 rounded-lg hover:bg-heritage-sand/30 transition-colors"
                >
                  Close
                </button>
                {tourUtils.canEnroll(selectedTour, user).canEnroll ? (
                  <button
                    onClick={() => handleEnroll(selectedTour._id)}
                    disabled={enrolling === selectedTour._id}
                    className="bg-heritage-moss text-white px-6 py-2 rounded-lg hover:bg-heritage-moss/90 transition-colors disabled:opacity-50"
                  >
                    {enrolling === selectedTour._id ? 'Enrolling...' : 'Enroll Now'}
                  </button>
                ) : (
                  <button
                    disabled
                    className="bg-gray-200 text-gray-500 px-6 py-2 rounded-lg cursor-not-allowed"
                  >
                    {tourUtils.canEnroll(selectedTour, user).reason}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EducationalTours;
