import React, { useState, useEffect, useCallback } from 'react';
import TourCard from '../components/tours/TourCard';
import BookingModal from '../components/tours/BookingModal';
import tourService from '../services/tourService';
import bookingService from '../services/bookingService';
import tourWebSocket from '../services/tourWebSocket';
import { Search, Filter, MapPin, Calendar, Users, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../hooks/useAuth';

const Tours = () => {
  const { isAuthenticated } = useAuth();
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    location: '',
    duration: '',
    priceRange: ''
  });
  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Booking modal state
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedTour, setSelectedTour] = useState(null);

  // Initialize WebSocket connection
  useEffect(() => {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    if (token) {
      tourWebSocket.connect(token);
    }

    // Set up WebSocket event listeners
    const handleWebSocketConnected = () => {
      setIsWebSocketConnected(true);
      tourWebSocket.joinToursListRoom();
    };

    const handleWebSocketDisconnected = () => {
      setIsWebSocketConnected(false);
    };

    const handleNewTour = (data) => {
      console.log('New tour received:', data);
      const newTour = data.tour;
      if (newTour && newTour.status === 'published') {
        setTours(prevTours => {
          // Check if tour already exists to avoid duplicates
          const exists = prevTours.some(tour => 
            tour.id === newTour.id || tour._id === newTour._id
          );
          if (!exists) {
            toast.success(`New tour available: ${newTour.title}`);
            return [newTour, ...prevTours];
          }
          return prevTours;
        });
      }
    };

    const handleTourUpdated = (data) => {
      console.log('Tour updated:', data);
      const updatedTour = data.tour;
      setTours(prevTours => 
        prevTours.map(tour => 
          (tour.id === updatedTour.id || tour._id === updatedTour._id) 
            ? updatedTour 
            : tour
        )
      );
    };

    const handleTourDeleted = (data) => {
      console.log('Tour deleted:', data);
      const deletedTourId = data.tourId;
      setTours(prevTours => 
        prevTours.filter(tour => 
          tour.id !== deletedTourId && tour._id !== deletedTourId
        )
      );
      toast.info('A tour has been removed');
    };

    const handleToursRefresh = () => {
      console.log('Tours refresh requested');
      loadTours();
    };

    // Set up event listeners
    tourWebSocket.on('connected', handleWebSocketConnected);
    tourWebSocket.on('disconnected', handleWebSocketDisconnected);
    tourWebSocket.on('tourCreated', handleNewTour);
    tourWebSocket.on('tourUpdated', handleTourUpdated);
    tourWebSocket.on('tourDeleted', handleTourDeleted);
    tourWebSocket.on('toursRefresh', handleToursRefresh);

    // Cleanup on unmount
    return () => {
      tourWebSocket.off('connected', handleWebSocketConnected);
      tourWebSocket.off('disconnected', handleWebSocketDisconnected);
      tourWebSocket.off('tourCreated', handleNewTour);
      tourWebSocket.off('tourUpdated', handleTourUpdated);
      tourWebSocket.off('tourDeleted', handleTourDeleted);
      tourWebSocket.off('toursRefresh', handleToursRefresh);
      tourWebSocket.leaveToursListRoom();
    };
  }, []);

  // Load tours function
  const loadTours = useCallback(async () => {
    try {
      setError(null);
      const fetchFilters = {
        ...filters,
        search: searchQuery
      };
      
      // Remove empty filters
      Object.keys(fetchFilters).forEach(key => {
        if (!fetchFilters[key]) {
          delete fetchFilters[key];
        }
      });

      const toursData = await tourService.getTours(fetchFilters);
      // Only show published tours on the public tours page
      const publishedTours = toursData.filter(tour => tour.status === 'published');
      setTours(publishedTours);
    } catch (err) {
      console.error('Error loading tours:', err);
      setError('Failed to load tours. Please try again.');
      toast.error('Failed to load tours');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filters, searchQuery]);

  // Initial load
  useEffect(() => {
    loadTours();
  }, [loadTours]);

  // Handle search
  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
  }, []);

  // Handle filter changes
  const handleFilterChange = useCallback((filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  }, []);

  // Handle manual refresh
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadTours();
  }, [loadTours]);

  // Handle view tour details
  const handleViewDetails = useCallback((tour) => {
    console.log('View tour details:', tour);
    // Navigate to tour details page or open modal
    // You can implement this based on your routing setup
    toast.info(`Viewing details for: ${tour.title}`);
  }, []);

  // Handle book tour
  const handleBookTour = useCallback((tour) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to book a tour');
      return;
    }
    
    console.log('Opening booking modal for tour:', tour.title);
    setSelectedTour(tour);
    setShowBookingModal(true);
  }, [isAuthenticated]);
  
  // Handle booking success
  const handleBookingSuccess = useCallback((booking) => {
    console.log('Booking created successfully:', booking);
    setShowBookingModal(false);
    setSelectedTour(null);
    
    // Refresh booking counter
    bookingService.refreshBookingCounter();
    
    toast.success('Tour booked successfully! Check your dashboard for booking details.');
  }, []);
  
  // Handle booking modal close
  const handleBookingModalClose = useCallback(() => {
    setShowBookingModal(false);
    setSelectedTour(null);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading live tours...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <h1 className="text-4xl font-bold">Live Tours</h1>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                isWebSocketConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
              }`}></div>
              <span className="text-sm text-muted-foreground">
                {isWebSocketConnected ? 'Live' : 'Offline'}
              </span>
            </div>
          </div>
          <p className="text-xl text-muted-foreground">
            Experience Ethiopian heritage through guided virtual and physical tours
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <input
                type="text"
                placeholder="Search tours..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-md bg-card text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            
            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {/* Filter Options */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="px-3 py-2 border border-border rounded-md bg-card text-foreground focus:ring-2 focus:ring-primary"
            >
              <option value="">All Types</option>
              <option value="cultural">Cultural</option>
              <option value="historical">Historical</option>
              <option value="archaeological">Archaeological</option>
              <option value="religious">Religious</option>
              <option value="adventure">Adventure</option>
              <option value="educational">Educational</option>
            </select>

            <input
              type="text"
              placeholder="Filter by location"
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              className="px-3 py-2 border border-border rounded-md bg-card text-foreground focus:ring-2 focus:ring-primary"
            />

            <select
              value={filters.duration}
              onChange={(e) => handleFilterChange('duration', e.target.value)}
              className="px-3 py-2 border border-border rounded-md bg-card text-foreground focus:ring-2 focus:ring-primary"
            >
              <option value="">Any Duration</option>
              <option value="half-day">Half Day</option>
              <option value="full-day">Full Day</option>
              <option value="multi-day">Multi Day</option>
            </select>

            <select
              value={filters.priceRange}
              onChange={(e) => handleFilterChange('priceRange', e.target.value)}
              className="px-3 py-2 border border-border rounded-md bg-card text-foreground focus:ring-2 focus:ring-primary"
            >
              <option value="">Any Price</option>
              <option value="0-100">$0 - $100</option>
              <option value="100-300">$100 - $300</option>
              <option value="300-500">$300 - $500</option>
              <option value="500+">$500+</option>
            </select>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-4 max-w-md mx-auto">
              {error}
            </div>
            <button
              onClick={handleRefresh}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Tours Grid */}
        {!error && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tours.length > 0 ? (
              tours.map((tour) => (
                <TourCard
                  key={tour.id || tour._id}
                  tour={{
                    ...tour,
                    image: tour.media?.images?.[0]?.url || tour.imageUrl || 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=400&h=250&fit=crop&crop=center',
                    location: tour.location || 'Ethiopia',
                    date: tour.schedule?.[0]?.startDate ? new Date(tour.schedule[0].startDate).toLocaleDateString() : 'Various dates',
                    maxPeople: tour.groupSize?.max || 10,
                    price: tour.pricing?.adult || 0
                  }}
                  onViewDetails={handleViewDetails}
                  onBookTour={handleBookTour}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="text-muted-foreground mb-4">
                  {searchQuery || Object.values(filters).some(f => f) ? (
                    <div>
                      <p className="mb-2">No tours found matching your criteria.</p>
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setFilters({ type: '', location: '', duration: '', priceRange: '' });
                        }}
                        className="text-primary hover:underline"
                      >
                        Clear filters
                      </button>
                    </div>
                  ) : (
                    <div>
                      <p className="mb-4">No tours available at the moment.</p>
                      <p className="text-sm">New tours will appear here automatically when organizers create them!</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tour Count */}
        {tours.length > 0 && (
          <div className="text-center mt-8 text-muted-foreground">
            Showing {tours.length} tour{tours.length !== 1 ? 's' : ''}
            {isWebSocketConnected && (
              <span className="ml-2 text-primary">• Live updates enabled</span>
            )}
          </div>
        )}
      </div>
      
      {/* Booking Modal */}
      {showBookingModal && selectedTour && (
        <BookingModal
          tour={selectedTour}
          isOpen={showBookingModal}
          onClose={handleBookingModalClose}
          onSuccess={handleBookingSuccess}
        />
      )}
    </div>
  );
};

export default Tours;
