import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Heart, Eye, Calendar, MapPin, MessageSquare, Star, Play, Image, BookOpen, RefreshCw,
  Trophy, Target, Users, TrendingUp, Award, Zap, Activity, Bell, Settings, UserPlus,
  Share2, Compass, Camera, Gift, Clock, ThumbsUp, MessageCircle, Bookmark, GraduationCap
} from 'lucide-react';
import VisitorSidebar from '../components/dashboard/VisitorSidebar';
import { useAuth } from '../hooks/useAuth';
import bookingService from '../services/bookingService';
import { toast } from 'sonner';
import { io } from 'socket.io-client';
import educationService from '../services/educationService';
import visitorDashboardService from '../services/visitorDashboardService';
import useSocket from '../hooks/useSocket';
import CollectionsWidget from '../components/collections/CollectionsWidget';

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
  const [localNotifications, setLocalNotifications] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [platformStats, setPlatformStats] = useState({});
  const [testimonials, setTestimonials] = useState([]);
  const [quickActions, setQuickActions] = useState([]);

  // Enhanced user features state
  const [userStats, setUserStats] = useState({
    totalPoints: 0,
    level: 1,
    streakDays: 0,
    artifactsViewed: 0,
    toursCompleted: 0,
    averageRating: 0
  });
  const [weeklyProgress, setWeeklyProgress] = useState({
    artifactsViewed: 0,
    toursBooked: 0,
    eventsAttended: 0,
    artifactsToView: 5,
    toursToBook: 1,
    eventsToAttend: 1
  });
  const [badges, setBadges] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [activityFeed, setActivityFeed] = useState([]);
  const [recommendations, setRecommendations] = useState({ users: [], artifacts: [], events: [] });
  const [socket, setSocket] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  
  // Booking related state
  const [bookingStats, setBookingStats] = useState({
    total: 0,
    confirmed: 0,
    pending: 0,
    upcoming: 0
  });
  const [bookingLoading, setBookingLoading] = useState(false);

  // Socket integration
  const { isConnected, onlineUsers, notifications: socketNotifications } = useSocket();

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

  // Load visitor dashboard data from real backend API
  const loadVisitorDashboardData = async () => {
    try {
      console.log('🔄 Loading visitor dashboard data from backend...');
      
      // Get comprehensive dashboard data from visitor dashboard service
      const dashboardResult = await visitorDashboardService.getDashboardData();
      
      if (dashboardResult.success) {
        console.log('✅ Real dashboard data loaded:', dashboardResult.data);
        
        const data = dashboardResult.data;
        
        // Set profile data
        if (data.profile) {
          setUserStats({
            totalPoints: data.profile.totalPoints || 0,
            level: data.profile.level || 1,
            streakDays: data.profile.streakDays || 0,
            artifactsViewed: data.profile.stats?.artifactsViewed || 0,
            toursCompleted: data.profile.stats?.toursCompleted || 0,
            averageRating: data.profile.stats?.averageScore || 0
          });
          
          setAchievements(data.profile.achievements || []);
        }
        
        // Set activity feed from recent activities
        if (data.activity?.recent) {
          setActivityFeed(data.activity.recent.map(activity => ({
            description: `${activity.type.replace('_', ' ')} - ${activity.entityName}`,
            timestamp: activity.timestamp,
            action: activity.type
          })));
        }
        
        // Set favorites data
        if (data.favorites) {
          setFavoriteArtifacts(data.favorites.byType?.filter(type => type._id === 'artifact') || []);
        }
        
        // Set recommendations
        if (data.recommendations) {
          setRecommendations(data.recommendations);
          setFeaturedMuseums(data.recommendations.museums || []);
          setNewArtifacts(data.recommendations.artifacts || []);
          setFeaturedCourses(data.recommendations.courses || []);
          setUpcomingEvents(data.recommendations.events || []);
        }
        
        // Set booking data
        if (data.bookings) {
          setBookedTours(data.bookings.recent || []);
          setBookingStats(data.bookings.stats || { total: 0, confirmed: 0, pending: 0 });
        }
        
        toast.success('Dashboard loaded with real data!');
        
      } else {
        console.error('❌ Failed to load real dashboard data:', dashboardResult.error);
        toast.error(dashboardResult.error || 'Failed to load dashboard data');
        
        // Fallback to education service for basic data
        const fallbackData = await educationService.getPlatformStats();
        if (fallbackData.success) {
          setPlatformStats(fallbackData.stats || {});
          setFeaturedCourses(fallbackData.featured?.courses || []);
          setCategories(fallbackData.categories || []);
        }
      }
      
    } catch (error) {
      console.error('❌ Error loading visitor dashboard data:', error);
      toast.error('Failed to load dashboard content');
      
      // Try fallback to education service
      try {
        const fallbackData = await educationService.getPlatformStats();
        if (fallbackData.success) {
          setPlatformStats(fallbackData.stats || {});
          setFeaturedCourses(fallbackData.featured?.courses || []);
          setCategories(fallbackData.categories || []);
        }
      } catch (fallbackError) {
        console.error('❌ Fallback data loading also failed:', fallbackError);
      }
    }
  };

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      // Load educational content from API
      await loadVisitorDashboardData();
      
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

          {/* Educational Platform Stats */}
          {platformStats && Object.keys(platformStats).length > 0 && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">📚 Educational Platform Statistics</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-3xl font-bold text-amber-600">{platformStats.totalCourses || 0}</div>
                  <div className="text-sm text-gray-600">Available Courses</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-3xl font-bold text-blue-600">{(platformStats.totalLearners || 0).toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Total Learners</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-3xl font-bold text-green-600">{(platformStats.coursesCompleted || 0).toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Courses Completed</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-3xl font-bold text-purple-600">{platformStats.successRate || 0}%</div>
                  <div className="text-sm text-gray-600">Success Rate</div>
                </div>
              </div>
            </div>
          )}

          {/* Interactive Learning Widgets */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Daily Learning Challenge */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Target className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Daily Learning Challenge</h3>
                    <p className="text-sm text-gray-600">🔥 {userStats.streakDays || 0} day streak</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Complete a quiz</span>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">+10 XP</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Study flashcards (5 min)</span>
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">+15 XP</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">View virtual artifact</span>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">+5 XP</span>
                </div>
              </div>
              <div className="mt-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Daily Progress</span>
                  <span>15/30 XP</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-blue-400 to-indigo-500 h-2 rounded-full" style={{ width: '50%' }}></div>
                </div>
              </div>
              <button 
                onClick={() => navigate('/education?section=quizzes')}
                className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Start Quiz Challenge
              </button>
            </div>

            {/* Quick Learning Actions */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Zap className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Quick Learning</h3>
                  <p className="text-sm text-gray-600">Jump into interactive content</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => navigate('/education?section=quizzes')}
                  className="flex flex-col items-center p-4 bg-white rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-sm transition-all"
                >
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mb-2">
                    <Trophy className="h-4 w-4 text-purple-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">Quiz Time</span>
                  <span className="text-xs text-gray-500">2-5 min</span>
                </button>
                <button 
                  onClick={() => navigate('/education?section=flashcards')}
                  className="flex flex-col items-center p-4 bg-white rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-sm transition-all"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                    <BookOpen className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">Flashcards</span>
                  <span className="text-xs text-gray-500">5-10 min</span>
                </button>
                <button 
                  onClick={() => navigate('/virtual-museum')}
                  className="flex flex-col items-center p-4 bg-white rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-sm transition-all"
                >
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mb-2">
                    <Eye className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">Explore 3D</span>
                  <span className="text-xs text-gray-500">10-15 min</span>
                </button>
                <button 
                  onClick={() => navigate('/education')}
                  className="flex flex-col items-center p-4 bg-white rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-sm transition-all"
                >
                  <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center mb-2">
                    <GraduationCap className="h-4 w-4 text-amber-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">Full Course</span>
                  <span className="text-xs text-gray-500">30+ min</span>
                </button>
              </div>
            </div>
          </div>

          {/* Personal Stats Cards */}
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
              value={featuredMuseums.length}
              icon={MapPin}
              description="Virtual explorations"
              color="purple"
            />
          </div>

          {/* Featured Educational Courses - NEW SECTION */}
          {featuredCourses.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
                  🎓 Featured Educational Courses
                </h2>
                <button 
                  onClick={() => navigate('/courses')} 
                  className="text-amber-600 hover:text-amber-700 font-medium"
                >
                  View All Courses
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {featuredCourses.map((course, index) => (
                  <div key={course._id || index} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                    <div className="w-full h-32 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                      <BookOpen className="h-12 w-12 text-blue-600" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">{course.title}</h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{course.description}</p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">{course.category}</span>
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">{course.difficulty}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-gray-700">{course.averageRating || 0}/5</span>
                        </div>
                        <span className="text-gray-500">👥 {course.enrollmentCount || 0} enrolled</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Learning Categories - NEW SECTION */}
          {categories.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
                  📖 Explore Learning Categories
                </h2>
                <button 
                  onClick={() => navigate('/courses')} 
                  className="text-amber-600 hover:text-amber-700 font-medium"
                >
                  Browse All
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {categories.map((category, index) => {
                  const getIcon = (name) => {
                    const icons = {
                      'History': '🏛️',
                      'Art & Culture': '🎨',
                      'Archaeology': '🏺',
                      'Architecture': '🏢'
                    };
                    return icons[name] || '📚';
                  };
                  
                  return (
                    <div key={index} className="text-center p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer hover:border-amber-300">
                      <div className="text-4xl mb-3">{getIcon(category.name)}</div>
                      <h3 className="font-semibold text-gray-900 mb-2">{category.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{category.description}</p>
                      <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                        {category.coursesCount} course{category.coursesCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Featured Museums */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Featured Museums</h2>
              <button className="text-amber-600 hover:text-amber-700 font-medium">View All</button>
            </div>
            {featuredMuseums.length === 0 ? (
              <div className="text-center py-8">
                <MapPin className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No featured museums available yet.</p>
                <button className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors">
                  Explore Virtual Museums
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {featuredMuseums.map(museum => (
                  <div key={museum.id || museum._id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                    <img src={museum.image || `https://picsum.photos/300/200?random=${museum._id || Math.random()}`} alt={museum.name} className="w-full h-32 object-cover" />
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-1">{museum.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{museum.description || 'Museum description'}</p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">{museum.location || 'Ethiopia'}</span>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-gray-700">{museum.rating || '4.5'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
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

          {/* My Collections Widget */}
          <CollectionsWidget limit={6} showCreateButton={true} />

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

          {/* Gamification & Progress Section - NEW */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* User Level & Points */}
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Trophy className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Level {userStats.level}</h3>
                    <p className="text-sm text-gray-600">Heritage Explorer</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-purple-600">{userStats.totalPoints}</p>
                  <p className="text-xs text-gray-500">Total Points</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress to Level {userStats.level + 1}</span>
                  <span>{userStats.totalPoints % 1000}/1000</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((userStats.totalPoints % 1000) / 1000) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Weekly Goals */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Target className="h-5 w-5 mr-2 text-green-600" />
                  Weekly Goals
                </h3>
                <button className="text-green-600 hover:text-green-700 text-sm font-medium">
                  Update Goals
                </button>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Artifacts Viewed', current: weeklyProgress.artifactsViewed, goal: weeklyProgress.artifactsToView, icon: Camera },
                  { label: 'Tours Booked', current: weeklyProgress.toursBooked, goal: weeklyProgress.toursToBook, icon: Calendar },
                  { label: 'Events Attended', current: weeklyProgress.eventsAttended, goal: weeklyProgress.eventsToAttend, icon: MapPin }
                ].map(({ label, current, goal, icon: Icon }) => (
                  <div key={label} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <Icon className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">{label}</span>
                      </div>
                      <span className="text-sm font-medium">{current}/{goal}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className="bg-gradient-to-r from-green-400 to-blue-500 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min((current / goal) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Streak & Activity */}
            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="text-center mb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-3">
                  <Zap className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{userStats.streakDays}</h3>
                <p className="text-sm text-gray-600">Day Streak</p>
              </div>
              <div className="space-y-2 text-center">
                <div className="flex items-center justify-center space-x-2">
                  {[...Array(7)].map((_, i) => (
                    <div 
                      key={i} 
                      className={`w-2 h-2 rounded-full ${
                        i < (userStats.streakDays % 7) ? 'bg-orange-500' : 'bg-gray-200'
                      }`}
                    ></div>
                  ))}
                </div>
                <p className="text-xs text-gray-500">Keep exploring to maintain your streak!</p>
              </div>
            </div>
          </div>

          {/* Badges & Achievements - NEW */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
                <Award className="h-6 w-6 mr-2 text-yellow-600" />
                Recent Badges
              </h2>
              <button className="text-amber-600 hover:text-amber-700 font-medium">View All Badges</button>
            </div>
            {badges.length === 0 ? (
              <div className="text-center py-8">
                <Award className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">No badges earned yet</p>
                <p className="text-sm text-gray-400">Complete activities to earn your first badge!</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {badges.slice(0, 6).map((badge, index) => (
                  <div key={badge.id || index} className="text-center p-3 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                    <div className="text-3xl mb-2">{badge.icon || '🏆'}</div>
                    <h4 className="text-sm font-medium text-gray-800 mb-1">{badge.name}</h4>
                    <p className="text-xs text-gray-500">{badge.description}</p>
                    <span className="inline-block mt-2 px-2 py-1 text-xs bg-yellow-200 text-yellow-800 rounded-full">
                      {badge.category || 'achievement'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Social Features - NEW */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Activity Feed */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-blue-600" />
                  Recent Activity
                </h3>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">View All</button>
              </div>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {activityFeed.length === 0 ? (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No recent activity</p>
                  </div>
                ) : (
                  activityFeed.slice(0, 5).map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800">{activity.description || activity.action}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(activity.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Social Connections */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Users className="h-5 w-5 mr-2 text-green-600" />
                  Connect with Others
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{followers.length}</p>
                  <p className="text-sm text-gray-600">Followers</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{following.length}</p>
                  <p className="text-sm text-gray-600">Following</p>
                </div>
              </div>
              {recommendations.users && recommendations.users.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">People to Follow</h4>
                  <div className="space-y-2">
                    {recommendations.users.slice(0, 3).map((recommendedUser) => (
                      <div key={recommendedUser._id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <img
                            src={recommendedUser.avatar || '/default-avatar.png'}
                            alt={recommendedUser.firstName}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <div>
                            <p className="text-sm font-medium text-gray-800">
                              {recommendedUser.firstName} {recommendedUser.lastName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {recommendedUser.interests?.slice(0, 2).join(', ')}
                            </p>
                          </div>
                        </div>
                        <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                          <UserPlus className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
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


          {/* Community Hub Widget - NEW SECTION */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">Community Hub</h2>
                  <div className="flex items-center space-x-4">
                    <span className={`flex items-center space-x-1 text-sm ${
                      isConnected ? 'text-green-600' : 'text-red-500'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${
                        isConnected ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                      <span>{isConnected ? 'Connected' : 'Offline'}</span>
                    </span>
                    <span className="text-sm text-gray-600">
                      {onlineUsers?.length || 0} online now
                    </span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => navigate('/community')}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Join Community</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Live Activity Feed */}
              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <Activity className="h-4 w-4 mr-2 text-blue-600" />
                    Live Activity
                  </h3>
                  {isConnected && (
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  )}
                </div>
                <div className="space-y-3 max-h-32 overflow-y-auto">
                  {activityFeed.length === 0 ? (
                    <div className="text-center py-4">
                      <Activity className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-xs text-gray-500">No recent activity</p>
                    </div>
                  ) : (
                    activityFeed.slice(0, 3).map((activity, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-700 truncate">{activity.description}</p>
                          <p className="text-xs text-gray-400">
                            {new Date(activity.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Notifications */}
              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <Bell className="h-4 w-4 mr-2 text-yellow-600" />
                    Notifications
                  </h3>
                  {socketNotifications && socketNotifications.length > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                      {socketNotifications.length}
                    </span>
                  )}
                </div>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {(!socketNotifications || socketNotifications.length === 0) ? (
                    <div className="text-center py-4">
                      <Bell className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-xs text-gray-500">All caught up!</p>
                    </div>
                  ) : (
                    socketNotifications.slice(0, 3).map((notification, index) => (
                      <div key={index} className="p-2 bg-yellow-50 rounded border-l-2 border-yellow-400">
                        <p className="text-xs text-gray-700">{notification.message}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(notification.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Community Stats */}
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2 text-green-600" />
                  Community Stats
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Active Members</span>
                    <span className="text-sm font-semibold text-green-600">
                      {onlineUsers?.length || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Today's Posts</span>
                    <span className="text-sm font-semibold text-blue-600">12</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Study Groups</span>
                    <span className="text-sm font-semibold text-purple-600">8</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Your Contributions</span>
                    <span className="text-sm font-semibold text-amber-600">5</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Community Actions */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button 
                  onClick={() => navigate('/community?tab=posts')}
                  className="flex items-center space-x-2 p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  <MessageSquare className="h-4 w-4 text-blue-600" />
                  <span className="text-gray-700">New Post</span>
                </button>
                <button 
                  onClick={() => navigate('/community?tab=groups')}
                  className="flex items-center space-x-2 p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  <Users className="h-4 w-4 text-purple-600" />
                  <span className="text-gray-700">Study Groups</span>
                </button>
                <button 
                  onClick={() => navigate('/community?tab=activity')}
                  className="flex items-center space-x-2 p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  <Activity className="h-4 w-4 text-green-600" />
                  <span className="text-gray-700">Activity</span>
                </button>
                <button 
                  onClick={() => navigate('/community')}
                  className="flex items-center space-x-2 p-2 bg-purple-100 border border-purple-200 rounded-lg hover:bg-purple-200 transition-colors text-sm"
                >
                  <Compass className="h-4 w-4 text-purple-600" />
                  <span className="text-purple-700">Explore</span>
                </button>
              </div>
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