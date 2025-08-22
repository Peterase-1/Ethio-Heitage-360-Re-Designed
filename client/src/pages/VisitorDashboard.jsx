import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Eye, Calendar, MapPin, MessageSquare, Star, Play, Image, BookOpen, RefreshCw } from 'lucide-react';
import VisitorSidebar from '../components/dashboard/VisitorSidebar';
import { useAuth } from '../hooks/useAuth';
import bookingService from '../services/bookingService';
import { toast } from 'sonner';

// Import actual images
import museumImg from '../assets/museum.jpg';
import artifactsImg from '../assets/artifacts.jpg';
import cultureImg from '../assets/culture.jpg';
import architectureImg from '../assets/architecture.jpg';
import lucyBoneImg from '../assets/Lucy-Bone.jpg';
import virtualTourImg from '../assets/virtual-tour.jpg';

const VisitorDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [favoriteArtifacts, setFavoriteArtifacts] = useState([]);
  const [bookedTours, setBookedTours] = useState([]);
  const [recentViews, setRecentViews] = useState([]);
  const [featuredMuseums, setFeaturedMuseums] = useState([]);
  const [newArtifacts, setNewArtifacts] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showWishlist, setShowWishlist] = useState(false);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [achievements, setAchievements] = useState([]);
  
  // Booking related state
  const [bookingStats, setBookingStats] = useState({
    total: 0,
    confirmed: 0,
    pending: 0,
    upcoming: 0
  });
  const [bookingLoading, setBookingLoading] = useState(false);

  // Navigation handlers
  const handle3DTourClick = () => {
    navigate('/virtual-museum');
  };

  const handleGalleryClick = () => {
    navigate('/virtual-museum');
  };

  const handleEventsClick = () => {
    navigate('/tours');
  };

  const handleExploreArtifactsClick = () => {
    navigate('/virtual-museum');
  };

  const handleBrowseEventsClick = () => {
    navigate('/tours');
  };

  const handleLaunchMapClick = () => {
    navigate('/map');
  };

  // Load booking data function
  const loadBookingData = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    
    setBookingLoading(true);
    try {
      // Load user bookings
      const bookings = await bookingService.getUserBookings();
      console.log('Loaded user bookings:', bookings);
      
      // Format bookings for display
      const formattedBookings = bookings.map(booking => ({
        id: booking.id || booking._id,
        title: booking.tour?.title || 'Tour Booking',
        date: booking.selectedDate ? new Date(booking.selectedDate).toLocaleDateString() : 'Date TBD',
        time: booking.selectedDate ? new Date(booking.selectedDate).toLocaleTimeString() : '',
        status: booking.status === 'pending' ? 'Pending' : 'Confirmed',
        numberOfGuests: booking.numberOfGuests || 1,
        totalAmount: booking.totalAmount || 0,
        tour: booking.tour
      }));
      
      setBookedTours(formattedBookings);
      
      // Get booking statistics
      const stats = await bookingService.getBookingStats();
      setBookingStats(stats);
      
    } catch (error) {
      console.error('Error loading booking data:', error);
      toast.error('Failed to load booking data');
    } finally {
      setBookingLoading(false);
    }
  };
  
  // Refresh booking data
  const refreshBookingData = async () => {
    await loadBookingData();
    toast.success('Booking data refreshed');
  };

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      // Load static data (mocked for now)
      setFavoriteArtifacts([]);
      setRecentViews([]);
      setFeaturedMuseums([]);
      setNewArtifacts([]);
      setUpcomingEvents([]);
      
      // Load real booking data
      await loadBookingData();
      
      setLoading(false);
    };
    
    loadInitialData();
  }, [isAuthenticated]);
  
  // Set up real-time booking updates
  useEffect(() => {
    if (!isAuthenticated) return;
    
    // Listen for booking events
    const handleBookingCreated = (booking) => {
      console.log('New booking created:', booking);
      loadBookingData(); // Refresh booking data
    };
    
    const handleBookingUpdated = (booking) => {
      console.log('Booking updated:', booking);
      loadBookingData(); // Refresh booking data
    };
    
    const handleCounterUpdated = (count) => {
      console.log('Booking counter updated:', count);
      // Update the booking count in stats
      setBookingStats(prev => ({ ...prev, total: count }));
    };
    
    // Subscribe to booking service events
    bookingService.on('booking-created', handleBookingCreated);
    bookingService.on('booking-updated', handleBookingUpdated);
    bookingService.on('counter-updated', handleCounterUpdated);
    
    // Initial counter refresh
    bookingService.refreshBookingCounter();
    
    // Cleanup
    return () => {
      bookingService.off('booking-created', handleBookingCreated);
      bookingService.off('booking-updated', handleBookingUpdated);
      bookingService.off('counter-updated', handleCounterUpdated);
    };
  }, [isAuthenticated]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading visitor dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-6">{error}</p>
        </div>
      </div>
    );
  }

  const StatCard = ({ title, value, icon: Icon, description, color = 'amber' }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
        <div className={`p-3 rounded-lg bg-${color}-50`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <VisitorSidebar />
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name || 'Visitor'}!</h1>
            <p className="text-gray-600 mt-1">Discover Ethiopia's rich heritage and cultural treasures</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Favorites"
              value={favoriteArtifacts.length}
              icon={Heart}
              description="Items you've saved"
              color="red"
            />
            <StatCard
              title="Booked Tours"
              value={bookedTours.length}
              icon={Calendar}
              description="Upcoming experiences"
              color="blue"
            />
            <StatCard
              title="Recently Viewed"
              value={recentViews.length}
              icon={Eye}
              description="Your viewing history"
              color="green"
            />
            <StatCard
              title="Museums Visited"
              value={0}
              icon={MapPin}
              description="Virtual explorations"
              color="purple"
            />
          </div>

          {/* Featured Museums */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Featured Museums</h2>
              <button className="text-amber-600 hover:text-amber-700 font-medium">View All</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredMuseums.map(museum => (
                <div key={museum.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                  <img src={museum.image} alt={museum.name} className="w-full h-32 object-cover" />
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1">{museum.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{museum.type}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">{museum.artifacts} artifacts</span>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-gray-700">{museum.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* New Artifacts */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Recently Added Artifacts</h2>
              <button className="text-amber-600 hover:text-amber-700 font-medium">Browse All</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {newArtifacts.map(artifact => (
                <div key={artifact.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                  <img src={artifact.image} alt={artifact.name} className="w-full h-32 object-cover" />
                  <div className="p-3">
                    <h3 className="font-medium text-gray-900 mb-1">{artifact.name}</h3>
                    <p className="text-sm text-gray-600 mb-1">{artifact.museum}</p>
                    <p className="text-xs text-amber-600">Added {artifact.addedAt}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Upcoming Events</h2>
              <button className="text-amber-600 hover:text-amber-700 font-medium">View Calendar</button>
            </div>
            <div className="space-y-4">
              {upcomingEvents.map(event => (
                <div key={event.id} className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className="flex-shrink-0 w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mr-4">
                    <Calendar className="h-6 w-6 text-amber-600" />
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-medium text-gray-900">{event.title}</h3>
                    <p className="text-sm text-gray-600">{event.location}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{event.date}</p>
                    <span className="inline-block px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                      {event.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button onClick={handle3DTourClick} className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Play className="h-8 w-8 text-blue-600 mb-2" />
                <span className="text-sm font-medium text-gray-900">3D Tours</span>
              </button>
              <button onClick={handleGalleryClick} className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Image className="h-8 w-8 text-green-600 mb-2" />
                <span className="text-sm font-medium text-gray-900">Gallery</span>
              </button>
              <button onClick={handleEventsClick} className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Calendar className="h-8 w-8 text-purple-600 mb-2" />
                <span className="text-sm font-medium text-gray-900">Events</span>
              </button>
              <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <BookOpen className="h-8 w-8 text-amber-600 mb-2" />
                <span className="text-sm font-medium text-gray-900">Learn</span>
              </button>
            </div>
          </div>

          {/* Your Favorites */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Your Favorites</h2>
              <button className="text-amber-600 hover:text-amber-700 font-medium">View All</button>
            </div>
            {favoriteArtifacts.length === 0 ? (
              <div className="text-center py-8">
                <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">You haven't favorited any artifacts yet.</p>
                <button onClick={handleExploreArtifactsClick} className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors">
                  Explore Artifacts
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {favoriteArtifacts.slice(0, 6).map(artifact => (
                  <div key={artifact.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                    <img src={artifact.image} alt={artifact.name} className="w-full h-32 object-cover" />
                    <div className="p-3">
                      <h3 className="font-medium text-gray-900 mb-1">{artifact.name}</h3>
                      <p className="text-sm text-gray-600 mb-1">{artifact.museum}</p>
                      <span className="inline-block px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-800">
                        {artifact.category}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Your Bookings */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Your Bookings</h2>
              <div className="flex items-center gap-3">
                <button 
                  onClick={refreshBookingData}
                  disabled={bookingLoading}
                  className="flex items-center gap-2 px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <RefreshCw className={`h-4 w-4 ${bookingLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
                <button className="text-amber-600 hover:text-amber-700 font-medium">Manage Bookings</button>
              </div>
            </div>
            {bookedTours.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">You don't have any upcoming bookings.</p>
                <button onClick={handleBrowseEventsClick} className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors">
                  Browse Events
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {bookedTours.map(tour => (
                  <div key={tour.id} className="flex items-center p-4 border border-gray-200 rounded-lg">
                    <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                      <Calendar className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-medium text-gray-900">{tour.title}</h3>
                      <p className="text-sm text-gray-600">{tour.date} at {tour.time}</p>
                    </div>
                    <span className={`px-3 py-1 text-sm rounded-full ${
                      tour.status === 'Confirmed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {tour.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recently Viewed */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Recently Viewed</h2>
              <button className="text-amber-600 hover:text-amber-700 font-medium">View History</button>
            </div>
            {recentViews.length === 0 ? (
              <div className="text-center py-8">
                <Eye className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No recent activity to show.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {recentViews.map(item => (
                  <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                    <img src={item.image} alt={item.name} className="w-full h-32 object-cover" />
                    <div className="p-3">
                      <h3 className="font-medium text-gray-900 mb-1">{item.name}</h3>
                      <div className="flex items-center justify-between">
                        <span className="inline-block px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                          {item.type}
                        </span>
                        <span className="text-xs text-gray-500">{item.viewedAt}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Ethiopian Heritage Explorer - NEW SECTION */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Ethiopian Heritage Explorer</h2>
              <button className="text-amber-600 hover:text-amber-700 font-medium">Explore More</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg cursor-pointer hover:shadow-md transition-shadow">
                <img src="https://picsum.photos/300/200?random=10" alt="Rock Churches" className="w-full h-24 object-cover rounded-md mb-3" />
                <h3 className="font-semibold text-gray-900 mb-1">Rock-Hewn Churches</h3>
                <p className="text-xs text-gray-600">Lalibela's 11 medieval churches</p>
                <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full">UNESCO Site</span>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg cursor-pointer hover:shadow-md transition-shadow">
                <img src="https://picsum.photos/300/200?random=11" alt="Simien Mountains" className="w-full h-24 object-cover rounded-md mb-3" />
                <h3 className="font-semibold text-gray-900 mb-1">Simien Mountains</h3>
                <p className="text-xs text-gray-600">Endemic wildlife & landscapes</p>
                <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full">National Park</span>
              </div>
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg cursor-pointer hover:shadow-md transition-shadow">
                <img src="https://picsum.photos/300/200?random=12" alt="Harar Jugol" className="w-full h-24 object-cover rounded-md mb-3" />
                <h3 className="font-semibold text-gray-900 mb-1">Harar Jugol</h3>
                <p className="text-xs text-gray-600">4th holy city of Islam</p>
                <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full">Historic City</span>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg cursor-pointer hover:shadow-md transition-shadow">
                <img src="https://picsum.photos/300/200?random=13" alt="Aksum Kingdom" className="w-full h-24 object-cover rounded-md mb-3" />
                <h3 className="font-semibold text-gray-900 mb-1">Ancient Aksum</h3>
                <p className="text-xs text-gray-600">Obelisks & ancient kingdom</p>
                <span className="text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded-full">Archaeological</span>
              </div>
            </div>
          </div>


          {/* Interactive Map Section - NEW SECTION */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Heritage Map Explorer</h2>
              <button className="text-amber-600 hover:text-amber-700 font-medium">Full Map View</button>
            </div>
            <div className="relative bg-gradient-to-br from-green-100 to-blue-100 h-64 rounded-lg overflow-hidden">
              <img src="https://picsum.photos/800/300?random=20" alt="Ethiopia Map" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                <div className="text-center text-white">
                  <MapPin className="w-12 h-12 mx-auto mb-2" />
                  <h3 className="text-xl font-bold">Explore Ethiopia</h3>
                  <p className="text-sm">Discover heritage sites across the country</p>
                  <button className="mt-3 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors">
                    Launch Interactive Map
                  </button>
                </div>
              </div>
              {/* Map Markers */}
              <div className="absolute top-4 left-4 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <div className="absolute top-8 right-6 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              <div className="absolute bottom-6 left-1/3 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <div className="absolute bottom-4 right-1/4 w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
            </div>
          </div>


          {/* Recommended for You - NEW SECTION */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Recommended for You</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                <img src="https://picsum.photos/300/200?random=30" alt="Coffee Origins" className="w-full h-32 object-cover rounded-md mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Ethiopian Coffee Origins</h3>
                <p className="text-sm text-gray-600 mb-3">Discover the birthplace of coffee and its journey through Ethiopian culture.</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">Cultural</span>
                  <span className="text-xs text-gray-500">20 min read</span>
                </div>
              </div>
              <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                <img src="https://picsum.photos/300/200?random=31" alt="Ancient Scripts" className="w-full h-32 object-cover rounded-md mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Ge'ez Script Workshop</h3>
                <p className="text-sm text-gray-600 mb-3">Learn about Ethiopia's ancient writing system still used today.</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Educational</span>
                  <span className="text-xs text-gray-500">45 min workshop</span>
                </div>
              </div>
              <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                <img src="https://picsum.photos/300/200?random=32" alt="Traditional Music" className="w-full h-32 object-cover rounded-md mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Ethiopian Traditional Music</h3>
                <p className="text-sm text-gray-600 mb-3">Experience the rich musical heritage of Ethiopia's diverse cultures.</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Music</span>
                  <span className="text-xs text-gray-500">30 min experience</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default VisitorDashboard;