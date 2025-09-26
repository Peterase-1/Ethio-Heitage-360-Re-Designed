import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Eye, Bot, Video, MapPin, BookOpen, Star, Users, Globe, Calendar, ArrowRight, Play, Sparkles, Shield, Award, Clock, CheckCircle, PlayCircle, UserPlus } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import heroBg from '../assets/hero-bg.jpg';
import obeliskHero from '../assets/obelisk-hero.jpg';
import artifacts from '../assets/artifacts.jpg';
import architecture from '../assets/architecture.jpg';
import culture from '../assets/culture.jpg';
import lucybone from '../assets/Lucy-Bone.jpg';
import Aitour from '../assets/Ai-tour.jpg';
import museum from '../assets/museum.jpg';
import virtualTour from '../assets/virtual-tour.jpg';
import VirtualMuseumButton from '../components/virtual-museum/VirtualMuseumButton';
import learningService from '../services/learningService';
import api from '../utils/api';
import io from 'socket.io-client';

const Home = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    artifacts: 500,
    museums: 50,
    sites: 25,
    visitors: 10000
  });
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [tourPackages, setTourPackages] = useState([]);
  const [toursLoading, setToursLoading] = useState(true);
  const [realTimeStats, setRealTimeStats] = useState({
    activeCourses: 0,
    activeTours: 0,
    totalStudents: 0,
    totalBookings: 0
  });
  const [socket, setSocket] = useState(null);

  // Enrollment and Progress States
  const [enrolledCourses, setEnrolledCourses] = useState(new Set());
  const [courseProgress, setCourseProgress] = useState({});
  const [enrollmentLoading, setEnrollmentLoading] = useState({});

  // Animate stats on component mount
  useEffect(() => {
    const animateStats = () => {
      let progress = 0;
      const targetStats = { artifacts: 500, museums: 50, sites: 25, visitors: 10000 };
      const interval = setInterval(() => {
        progress += 0.02;
        if (progress >= 1) {
          setStats(targetStats);
          clearInterval(interval);
        } else {
          setStats({
            artifacts: Math.floor(targetStats.artifacts * progress),
            museums: Math.floor(targetStats.museums * progress),
            sites: Math.floor(targetStats.sites * progress),
            visitors: Math.floor(targetStats.visitors * progress)
          });
        }
      }, 50);
    };

    animateStats();
  }, []);

  // Real-time WebSocket connection
  useEffect(() => {
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    const newSocket = io(socketUrl);
    setSocket(newSocket);

    // Listen for real-time updates
    newSocket.on('stats_update', (data) => {
      setRealTimeStats(data);
    });

    newSocket.on('new_course_created', (course) => {
      setFeaturedCourses(prev => [course, ...prev].slice(0, 3));
    });

    newSocket.on('new_tour_created', (tour) => {
      setTourPackages(prev => [tour, ...prev].slice(0, 3));
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Fetch featured courses and tour packages
  useEffect(() => {
    const fetchData = async () => {
      try {
        setCoursesLoading(true);
        setToursLoading(true);

        // Fetch courses
        const coursesPromise = learningService.getCourses().then(courses => {
          setFeaturedCourses(Array.isArray(courses) ? courses.slice(0, 3) : []);
        }).catch(error => {
          console.error('Failed to fetch featured courses:', error);
          setFeaturedCourses([]);
        });

        // Fetch public tour packages (all active tours available for booking)
        const toursPromise = api.getTours().then(response => {
          // Get active tours from the response
          const tours = response.tours || response.data || response || [];
          const activeTours = tours.filter(tour => tour.status === 'active').slice(0, 3);
          setTourPackages(Array.isArray(activeTours) ? activeTours : []);
        }).catch(error => {
          console.error('Failed to fetch public tours:', error);
          setTourPackages([]);
        });

        await Promise.all([coursesPromise, toursPromise]);

      } finally {
        setCoursesLoading(false);
        setToursLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, user?.id]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/virtual-museum?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleStartExploring = () => {
    navigate('/virtual-museum');
  };

  const handleExploreVirtualMuseum = () => {
    navigate('/virtual-museum');
  };

  const handleExploreTours = () => {
    navigate('/tours');
  };

  const handleExploreMap = () => {
    navigate('/map');
  };

  const handleReadArticle = (articleType) => {
    // For now, navigate to virtual museum with a filter
    // In a real app, these would go to specific article pages
    navigate('/virtual-museum?category=' + articleType);
  };

  return (
    <div className="min-h-screen">
      {/* Modern Hero Section */}
      <section className="bg-background relative overflow-hidden py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">

            {/* Left Side - Content */}
            <div className="space-y-6 lg:space-y-8 order-2 lg:order-1">
              {/* Badge */}
              <div className="inline-flex items-center bg-primary/10 text-primary rounded-full px-4 py-2">
                <Sparkles className="w-4 h-4 mr-2" />
                <span className="text-sm font-semibold">Discover Ethiopia's Digital Heritage</span>
              </div>

              {/* Main Heading */}
              <div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 lg:mb-6 leading-tight">
                  <span className="block text-foreground mb-1 lg:mb-2">
                    Explore
                  </span>
                  <span className="block bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                    Ethiopia's
                  </span>
                  <span className="block text-foreground">
                    Rich Heritage
                  </span>
                </h1>

                {/* Subtitle */}
                <p className="text-lg sm:text-xl lg:text-2xl text-muted-foreground leading-relaxed mb-6 lg:mb-8">
                  Immerse yourself in cutting-edge 360° virtual experiences of ancient artifacts,
                  sacred sites, and cultural treasures. Join live tours with AI guidance.
                </p>
              </div>

              {/* CTA Buttons - Virtual Museum Prominently Featured */}
              <div className="space-y-6">

                {/* Heritage Map - Secondary Feature */}

                {/* Additional Action Button */}
                <div className="flex justify-center">
                  <button
                    onClick={handleStartExploring}
                    className="bg-muted text-muted-foreground px-6 py-3 rounded-xl font-medium hover:bg-muted/80 transition-colors flex items-center justify-center border border-border"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Explore All Features
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right Side - Modern Informal Image Grid - Hidden on small devices */}
            <div className="relative order-1 lg:order-2 hidden md:block">
              <div className="grid grid-cols-12 grid-rows-12 gap-3 h-[500px]">
                {/* Main obelisk image - offset and rotated */}
                <div className="col-span-7 row-span-8 relative transform rotate-2 hover:rotate-0 transition-transform duration-300">
                  <img
                    src={obeliskHero}
                    alt="Ancient Ethiopian Obelisk in Aksum"
                    className="w-full h-full object-cover rounded-3xl shadow-2xl"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent rounded-3xl"></div>
                  <div className="absolute bottom-6 left-6 text-white">
                    <h3 className="text-lg font-bold mb-1">Ancient Obelisks</h3>
                    <p className="text-white/80 text-sm">Aksum's towering monuments</p>
                  </div>
                </div>

                {/* Architecture image - smaller, positioned uniquely */}
                <div className="col-span-5 row-span-6 col-start-8 row-start-2 relative transform -rotate-1 hover:rotate-0 transition-transform duration-300">
                  <img
                    src={architecture}
                    alt="Rock-hewn Churches of Lalibela"
                    className="w-full h-full object-cover rounded-2xl shadow-lg"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-2xl"></div>
                  <div className="absolute bottom-3 left-3 text-white">
                    <h4 className="font-semibold text-sm">Rock Churches</h4>
                  </div>
                </div>

                {/* Culture image - bottom positioned */}
                <div className="col-span-6 row-span-4 col-start-1 row-start-9 relative transform rotate-1 hover:rotate-0 transition-transform duration-300">
                  <img
                    src={culture}
                    alt="Ethiopian Cultural Heritage and Traditions"
                    className="w-full h-full object-cover rounded-2xl shadow-lg"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-2xl"></div>
                  <div className="absolute bottom-3 left-3 text-white">
                    <h4 className="font-semibold text-sm">Living Culture</h4>
                  </div>
                </div>

                {/* Small artifacts accent image */}
                <div className="col-span-4 row-span-3 col-start-8 row-start-10 relative transform rotate-3 hover:rotate-0 transition-transform duration-300">
                  <img
                    src={artifacts}
                    alt="Ethiopian Artifacts"
                    className="w-full h-full object-cover rounded-xl shadow-md"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl"></div>
                </div>
              </div>

              {/* Floating Stats Cards */}
              <div className="absolute -top-4 -left-4 bg-card border border-border rounded-xl p-3 shadow-lg">
                <div className="text-center">
                  <div className="text-xl font-bold text-primary">500+</div>
                  <div className="text-xs text-muted-foreground">Artifacts</div>
                </div>
              </div>

              <div className="absolute -bottom-4 -right-4 bg-card border border-border rounded-xl p-3 shadow-lg">
                <div className="text-center">
                  <div className="text-xl font-bold text-secondary">3000</div>
                  <div className="text-xs text-muted-foreground">Years History</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-16 bg-gradient-to-b from-background to-muted/30">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-8">
            What would you like to explore today?
          </h2>
          <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
            <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-muted-foreground h-6 w-6" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search artifacts, sites, museums, or cultural events..."
              className="w-full pl-16 pr-32 py-6 rounded-2xl text-lg bg-card border border-border focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all duration-300 shadow-lg"
            />
            <button
              type="submit"
              className="absolute right-3 top-3 bg-primary text-primary-foreground px-8 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
            >
              Explore
            </button>
          </form>
        </div>
      </section>



      {/* Revolutionary Heritage Experience */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-primary/10 text-primary rounded-full px-4 py-2 mb-4">
              <Sparkles className="w-4 h-4 mr-2" />
              <span className="text-sm font-semibold">Revolutionary Technology</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Heritage Experience Reimagined
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Cutting-edge technology meets ancient wisdom. Discover how we're transforming
              cultural preservation and education through innovation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Immersive 3D & AR/VR */}
            <div className="group bg-card rounded-3xl overflow-hidden border border-border hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 hover:-translate-y-2">
              <div className="relative h-64 overflow-hidden">
                <img
                  src={architecture}
                  alt="Virtual 3D Museum - Lalibela Churches"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                <div className="absolute bottom-4 left-4">
                  <div className="w-12 h-12 bg-primary/90 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <Eye className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold text-card-foreground mb-4">Virtual 3D Museum</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Experience artifacts and heritage sites in stunning 3D detail with virtual and augmented
                  reality support. Walk through ancient temples and examine artifacts up close.
                </p>
                <button
                  onClick={handleExploreVirtualMuseum}
                  className="text-primary font-semibold hover:text-primary/80 transition-colors flex items-center group-hover:translate-x-2 transition-transform duration-300"
                >
                  Explore Feature
                  <ArrowRight className="ml-2 w-4 h-4" />
                </button>
              </div>
            </div>

            {/* AI Heritage Assistant */}
            <div className="group bg-card rounded-3xl overflow-hidden border border-border hover:shadow-2xl hover:shadow-secondary/10 transition-all duration-500 hover:-translate-y-2">
              <div className="relative h-64 overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-secondary/20 via-primary/10 to-accent/20 flex items-center justify-center relative">
                  <div className="absolute inset-0" style={{
                    backgroundImage: `url(${Aitour})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    opacity: 0.3
                  }}></div>
                  <div className="relative z-10 flex items-center space-x-4">
                    <div className="w-16 h-16 bg-secondary/90 rounded-2xl flex items-center justify-center">
                      <Bot className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-secondary font-bold text-xl">AI + Heritage</div>
                  </div>
                </div>
                <div className="absolute bottom-4 left-4">
                  <div className="w-12 h-12 bg-secondary/90 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold text-card-foreground mb-4">AI Heritage Assistant</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Get personalized guidance and detailed information about Ethiopian culture and history
                  in multiple languages. Your intelligent companion for heritage exploration.
                </p>
                <button
                  onClick={handleExploreVirtualMuseum}
                  className="text-primary font-semibold hover:text-primary/80 transition-colors flex items-center group-hover:translate-x-2 transition-transform duration-300"
                >
                  Explore Feature
                  <ArrowRight className="ml-2 w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Live Virtual Tours */}
            <div className="group bg-card rounded-3xl overflow-hidden border border-border hover:shadow-2xl hover:shadow-accent/10 transition-all duration-500 hover:-translate-y-2">
              <div className="relative h-64 overflow-hidden">
                <img
                  src={virtualTour}
                  alt="Live Virtual Cultural Tours"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                <div className="absolute bottom-4 left-4">
                  <div className="w-12 h-12 bg-accent/90 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <Video className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold text-card-foreground mb-4">Live Virtual Tours</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Join expert-guided live tours of museums, archaeological sites, and cultural celebrations
                  from anywhere in the world. Interactive and engaging experiences.
                </p>
                <button className="text-primary font-semibold hover:text-primary/80 transition-colors flex items-center group-hover:translate-x-2 transition-transform duration-300">
                  Explore Feature
                  <ArrowRight className="ml-2 w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Features */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Interactive Heritage Map */}
            <div className="group bg-card rounded-3xl overflow-hidden border border-border hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
              <div className="h-48 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center relative overflow-hidden">
                <MapPin className="w-16 h-16 text-primary group-hover:scale-110 transition-transform duration-300" />
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-primary/10 group-hover:from-primary/5 transition-all duration-300"></div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-card-foreground mb-3">Interactive Heritage Map</h3>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  Explore Ethiopia's heritage sites on an interactive map with detailed information and virtual visits.
                </p>
                <button className="text-primary font-semibold hover:text-primary/80 transition-colors flex items-center group-hover:translate-x-2 transition-transform duration-300">
                  Explore Feature
                  <ArrowRight className="ml-2 w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Multilingual Access */}
            <div className="group bg-card rounded-3xl overflow-hidden border border-border hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
              <div className="h-48 bg-gradient-to-br from-secondary/20 to-accent/20 flex items-center justify-center relative overflow-hidden">
                <Globe className="w-16 h-16 text-secondary group-hover:scale-110 transition-transform duration-300" />
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-secondary/10 group-hover:from-secondary/5 transition-all duration-300"></div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-card-foreground mb-3">Multilingual Access</h3>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  Access content in English, Amharic, and Afaan Oromoo to preserve linguistic diversity.
                </p>
                <button className="text-primary font-semibold hover:text-primary/80 transition-colors flex items-center group-hover:translate-x-2 transition-transform duration-300">
                  Explore Feature
                  <ArrowRight className="ml-2 w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Educational Resources */}
            <div className="group bg-card rounded-3xl overflow-hidden border border-border hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
              <div className="h-48 bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center relative overflow-hidden">
                <BookOpen className="w-16 h-16 text-accent group-hover:scale-110 transition-transform duration-300" />
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-accent/10 group-hover:from-accent/5 transition-all duration-300"></div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-card-foreground mb-3">Educational Resources</h3>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  Comprehensive learning materials for students, educators, and researchers studying Ethiopian heritage.
                </p>
                <button
                  onClick={() => {
                    // If user is an organizer, redirect to organizer dashboard
                    if (isAuthenticated && user?.role === 'organizer') {
                      navigate('/organizer-dashboard');
                    } else {
                      // Otherwise, go to Education page for learning resources
                      navigate('/education');
                    }
                  }}
                  className="text-primary font-semibold hover:text-primary/80 transition-colors flex items-center group-hover:translate-x-2 transition-transform duration-300"
                >
                  {isAuthenticated && user?.role === 'organizer' ? 'Manage Education' : 'Start Learning'}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 bg-primary text-primary-foreground relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 border border-current rounded-full"></div>
          <div className="absolute bottom-20 right-20 w-24 h-24 border border-current rounded-full"></div>
          <div className="absolute top-1/2 left-1/4 w-16 h-16 border border-current rounded-full"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-primary-foreground/10 text-primary-foreground rounded-full px-4 py-2 mb-4">
              <Award className="w-4 h-4 mr-2" />
              <span className="text-sm font-semibold">Impact & Reach</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Preserving Heritage at Scale
            </h2>
            <p className="text-xl text-primary-foreground/80 max-w-3xl mx-auto">
              Our platform continues to grow, bringing Ethiopian heritage to global audiences and fostering a deeper appreciation for its rich history.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div className="p-6 bg-primary-foreground/10 rounded-2xl backdrop-blur-sm border border-primary-foreground/20">
              <div className="text-5xl font-bold mb-2">500+</div>
              <div className="text-lg text-primary-foreground/80">Heritage Artifacts</div>
              <p className="text-sm text-primary-foreground/60 mt-1">Digitally preserved with 3D scanning</p>
            </div>
            <div className="p-6 bg-primary-foreground/10 rounded-2xl backdrop-blur-sm border border-primary-foreground/20">
              <div className="text-5xl font-bold mb-2">50+</div>
              <div className="text-lg text-primary-foreground/80">Partner Museums</div>
              <p className="text-sm text-primary-foreground/60 mt-1">Across Ethiopia collaborating</p>
            </div>
            <div className="p-6 bg-primary-foreground/10 rounded-2xl backdrop-blur-sm border border-primary-foreground/20">
              <div className="text-5xl font-bold mb-2">25+</div>
              <div className="text-lg text-primary-foreground/80">Heritage Sites</div>
              <p className="text-sm text-primary-foreground/60 mt-1">UNESCO and national sites mapped</p>
            </div>
            <div className="p-6 bg-primary-foreground/10 rounded-2xl backdrop-blur-sm border border-primary-foreground/20">
              <div className="text-5xl font-bold mb-2">10K+</div>
              <div className="text-lg text-primary-foreground/80">Monthly Visitors</div>
              <p className="text-sm text-primary-foreground/60 mt-1">Learning about Ethiopian culture</p>
            </div>
          </div>
        </div>
      </section>

      {/* Latest from Ethiopian Heritage */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-secondary/10 text-secondary rounded-full px-4 py-2 mb-4">
              <Calendar className="w-4 h-4 mr-2" />
              <span className="text-sm font-semibold">Latest Updates</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Latest from Ethiopian Heritage
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Discover new artifacts, virtual exhibitions, and cultural insights.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Article 1 */}
            <div className="group bg-card rounded-3xl overflow-hidden border border-border hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
              <img src={artifacts} alt="Ancient Ge'ez Manuscripts" className="w-full h-64 object-cover" />
              <div className="p-6">
                <h3 className="text-xl font-bold text-card-foreground mb-3">Ancient Ge'ez Manuscripts Digitized</h3>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  Over 200 ancient manuscripts from Lalibela monasteries now available in high-resolution 3D format.
                </p>
                <button className="text-primary font-semibold hover:text-primary/80 transition-colors flex items-center group-hover:translate-x-2 transition-transform duration-300">
                  Read More
                  <ArrowRight className="ml-2 w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Article 2 */}
            <div className="group bg-card rounded-3xl overflow-hidden border border-border hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
              <img src={museum} alt="Virtual National Museum Tours" className="w-full h-64 object-cover" />
              <div className="p-6">
                <h3 className="text-xl font-bold text-card-foreground mb-3">Virtual National Museum Tours</h3>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  Explore Ethiopia's National Museum collections through immersive virtual tours showcasing artifacts and exhibitions.
                </p>
                <button className="text-primary font-semibold hover:text-primary/80 transition-colors flex items-center group-hover:translate-x-2 transition-transform duration-300">
                  Take Tour
                  <ArrowRight className="ml-2 w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Article 3 */}
            <div className="group bg-card rounded-3xl overflow-hidden border border-border hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
              <img src={lucybone} alt="Aksum Archaeological Discoveries" className="w-full h-64 object-cover" />
              <div className="p-6">
                <h3 className="text-xl font-bold text-card-foreground mb-3">Aksum Archaeological Discoveries</h3>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  New archaeological findings from Aksum reveal insights into ancient Ethiopian civilization and trade routes.
                </p>
                <button className="text-primary font-semibold hover:text-primary/80 transition-colors flex items-center group-hover:translate-x-2 transition-transform duration-300">
                  Discover More
                  <ArrowRight className="ml-2 w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section data-section="about" className="py-20 bg-gradient-to-br from-background via-muted/20 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center bg-primary/10 text-primary rounded-full px-4 py-2 mb-6">
                <Shield className="w-4 h-4 mr-2" />
                <span className="text-sm font-semibold">About EthioHeritage360</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                Preserving Ethiopia's Legacy for Future Generations
              </h2>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                EthioHeritage360 is Ethiopia's premier digital heritage platform, dedicated to preserving,
                promoting, and sharing the rich cultural heritage of Ethiopia through cutting-edge technology
                and immersive experiences.
              </p>

              <div className="space-y-6 mb-8">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                    <Globe className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Global Accessibility</h3>
                    <p className="text-muted-foreground">
                      Making Ethiopian heritage accessible to people worldwide through virtual experiences
                      and multilingual content.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                    <Award className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Cultural Preservation</h3>
                    <p className="text-muted-foreground">
                      Using advanced 3D scanning and digital archiving to preserve artifacts and sites
                      for future generations.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                    <Users className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Community Engagement</h3>
                    <p className="text-muted-foreground">
                      Connecting museums, educators, researchers, and heritage enthusiasts in a
                      collaborative digital ecosystem.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src={architecture}
                  alt="Ethiopian Heritage Architecture"
                  className="w-full h-96 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <h3 className="text-2xl font-bold mb-2">Ancient Rock-Hewn Churches</h3>
                  <p className="text-white/90">Lalibela's architectural marvels preserved in stunning detail</p>
                </div>
              </div>

              {/* Floating Stats */}
              <div className="absolute -top-8 -right-8 bg-card border border-border rounded-2xl p-6 shadow-xl">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-1">1000+</div>
                  <div className="text-sm text-muted-foreground">Years of History</div>
                </div>
              </div>

              <div className="absolute -bottom-8 -left-8 bg-card border border-border rounded-2xl p-6 shadow-xl">
                <div className="text-center">
                  <div className="text-3xl font-bold text-secondary mb-1">9</div>
                  <div className="text-sm text-muted-foreground">UNESCO Sites</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* Our Mission & Vision */}
      <section className="py-20 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-40 h-40 border border-current rounded-full animate-pulse"></div>
          <div className="absolute bottom-32 right-32 w-32 h-32 border border-current rounded-full animate-bounce"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 border border-current rounded-full animate-ping"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Our Mission & Vision</h2>
            <p className="text-xl text-primary-foreground/80 max-w-3xl mx-auto">
              Bridging the past and future through innovative digital heritage solutions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-3xl p-8 border border-primary-foreground/20">
              <div className="w-16 h-16 bg-primary-foreground/20 rounded-2xl flex items-center justify-center mb-6">
                <Star className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="text-3xl font-bold mb-4">Our Mission</h3>
              <p className="text-primary-foreground/80 text-lg leading-relaxed">
                To preserve, promote, and share Ethiopia's rich cultural heritage through innovative
                digital technologies, making it accessible to global audiences while fostering
                cultural understanding and appreciation.
              </p>
            </div>

            <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-3xl p-8 border border-primary-foreground/20">
              <div className="w-16 h-16 bg-primary-foreground/20 rounded-2xl flex items-center justify-center mb-6">
                <Globe className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="text-3xl font-bold mb-4">Our Vision</h3>
              <p className="text-primary-foreground/80 text-lg leading-relaxed">
                To become the world's leading platform for Ethiopian heritage preservation and
                education, creating a bridge between ancient wisdom and modern technology for
                future generations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Team & Partners */}
      <section data-section="partners" className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-accent/10 text-accent rounded-full px-4 py-2 mb-4">
              <Users className="w-4 h-4 mr-2" />
              <span className="text-sm font-semibold">Our Network</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Powered by Passionate Experts
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our diverse team of archaeologists, technologists, educators, and cultural experts
              work together to bring Ethiopia's heritage to life.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
            <div className="text-center group">
              <div className="w-24 h-24 bg-gradient-to-br from-primary to-secondary rounded-full mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Users className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Heritage Experts</h3>
              <p className="text-muted-foreground">Archaeologists and cultural historians</p>
            </div>

            <div className="text-center group">
              <div className="w-24 h-24 bg-gradient-to-br from-secondary to-accent rounded-full mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Bot className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Tech Innovators</h3>
              <p className="text-muted-foreground">3D scanning and VR specialists</p>
            </div>

            <div className="text-center group">
              <div className="w-24 h-24 bg-gradient-to-br from-accent to-primary rounded-full mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <BookOpen className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Educators</h3>
              <p className="text-muted-foreground">Learning experience designers</p>
            </div>

            <div className="text-center group">
              <div className="w-24 h-24 bg-gradient-to-br from-primary to-accent rounded-full mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Globe className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Community Leaders</h3>
              <p className="text-muted-foreground">Cultural ambassadors and guides</p>
            </div>
          </div>

          <div className="bg-muted/30 rounded-3xl p-12 text-center">
            <h3 className="text-3xl font-bold text-foreground mb-6">Trusted Partners</h3>
            <p className="text-lg text-muted-foreground mb-8 max-w-3xl mx-auto">
              We collaborate with leading museums, universities, cultural institutions, and
              technology partners to deliver world-class heritage experiences.
            </p>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
              <div className="text-2xl font-bold text-muted-foreground">INSA</div>
              <div className="text-2xl font-bold text-muted-foreground">AASTU</div>
              <div className="text-2xl font-bold text-muted-foreground">National Museum</div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact & Get Involved */}
      <section className="py-20 bg-gradient-to-br from-muted/20 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-primary/10 text-primary rounded-full px-4 py-2 mb-4">
              <Sparkles className="w-4 h-4 mr-2" />
              <span className="text-sm font-semibold">Get Involved</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Join the Heritage Revolution
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Whether you're a heritage enthusiast, educator, researcher, or institution,
              there are many ways to contribute to preserving Ethiopia's cultural legacy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card rounded-3xl p-8 border border-border text-center hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-card-foreground mb-4">Volunteer</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Join our community of volunteers helping to digitize artifacts, translate content,
                and guide virtual tours.
              </p>
              <Link to="/contact" className="inline-block">
                <button className="bg-primary text-primary-foreground px-6 py-3 rounded-full font-semibold hover:bg-primary/90 transition-colors">
                  Get Started
                </button>
              </Link>
            </div>

            <div className="bg-card rounded-3xl p-8 border border-border text-center hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
              <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="text-2xl font-bold text-card-foreground mb-4">Partner</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Museums, schools, and cultural institutions can partner with us to expand
                their digital presence and reach.
              </p>
              <Link to="/contact" className="inline-block">
                <button className="bg-secondary text-secondary-foreground px-6 py-3 rounded-full font-semibold hover:bg-secondary/90 transition-colors">
                  Learn More
                </button>
              </Link>
            </div>

            <div className="bg-card rounded-3xl p-8 border border-border text-center hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
              <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Award className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-2xl font-bold text-card-foreground mb-4">Support</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Support our mission through donations, sponsorships, or by spreading awareness
                about Ethiopian heritage.
              </p>
              <Link to="/contact" className="inline-block">
                <button className="bg-accent text-accent-foreground px-6 py-3 rounded-full font-semibold hover:bg-accent/90 transition-colors">
                  Contribute
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

