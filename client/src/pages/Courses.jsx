import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import VisitorLayout from '../components/layout/VisitorLayout';
import { 
  Search, 
  Filter, 
  Clock, 
  Users, 
  Star, 
  BookOpen, 
  Globe, 
  MapPin, 
  Award, 
  ArrowRight,
  Grid,
  List,
  ChevronDown,
  X,
  Play,
  ChevronLeft,
  ChevronRight,
  User
} from 'lucide-react';
import educationService from '../services/educationService';
import { toast } from 'sonner';

const Courses = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState({});
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);

  const categories = [
    { value: '', label: 'All Categories', icon: BookOpen, count: 0 },
    { value: 'history', label: 'Ancient History', icon: BookOpen, count: 0 },
    { value: 'culture', label: 'Art & Culture', icon: Star, count: 0 },
    { value: 'language', label: 'Language', icon: Globe, count: 0 },
    { value: 'archaeology', label: 'Architecture', icon: MapPin, count: 0 },
    { value: 'art', label: 'Art', icon: Award, count: 0 }
  ];

  const difficulties = [
    { value: '', label: 'All Levels' },
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'duration-short', label: 'Shortest Duration' },
    { value: 'duration-long', label: 'Longest Duration' },
    { value: 'name', label: 'Alphabetical' }
  ];

  // Fetch courses
  useEffect(() => {
    fetchCourses();
  }, [selectedCategory, selectedDifficulty, sortBy, searchQuery]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      console.log('🎓 Courses Page: Fetching courses from education service with filters:', {
        selectedCategory,
        selectedDifficulty,
        sortBy,
        searchQuery
      });
      
      // Build filter object
      const filters = {};
      if (selectedCategory) filters.category = selectedCategory;
      if (selectedDifficulty) filters.difficulty = selectedDifficulty;
      if (searchQuery) filters.search = searchQuery;
      
      // Use education service
      const data = await educationService.getCourses(filters);
      console.log('✅ Courses loaded from education service:', data);
      
      if (data.success && data.courses) {
        let sortedCourses = [...data.courses];
        
        // Sort courses based on selected option
        switch (sortBy) {
          case 'newest':
            sortedCourses.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
            break;
          case 'oldest':
            sortedCourses.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
            break;
          case 'duration-short':
            sortedCourses.sort((a, b) => (a.estimatedHours || 0) - (b.estimatedHours || 0));
            break;
          case 'duration-long':
            sortedCourses.sort((a, b) => (b.estimatedHours || 0) - (a.estimatedHours || 0));
            break;
          case 'name':
            sortedCourses.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
            break;
          default:
            // Keep original order
            break;
        }
        
        console.log(`✅ ${sortedCourses.length} courses loaded and sorted by ${sortBy}`);
        setCourses(sortedCourses);
        
        if (sortedCourses.length === 0 && (selectedCategory || selectedDifficulty || searchQuery)) {
          console.log('🔍 No courses match the current filters');
        }
      } else {
        console.warn('⚠️ No courses data in response:', data.error || 'Unknown error');
        setCourses([]);
      }
    } catch (error) {
      console.error('❌ Error fetching courses:', error);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  // Courses are already filtered by the API, so we just use them directly
  const filteredCourses = courses;

  const handleSearch = (e) => {
    e.preventDefault();
    // Update URL params
    const params = new URLSearchParams(searchParams);
    if (searchQuery) {
      params.set('search', searchQuery);
    } else {
      params.delete('search');
    }
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedDifficulty('');
    setSortBy('newest');
    setSearchParams({});
  };

  const handleEnroll = async (courseId) => {
    if (!user) {
      toast.error('Please login to enroll in courses');
      navigate('/auth');
      return;
    }

    try {
      setEnrolling(prev => ({ ...prev, [courseId]: true }));
      console.log('📝 Enrolling in course:', courseId);

      const response = await educationService.enrollInCourse(courseId);
      console.log('✅ Enrollment response:', response);

      if (response.success) {
        toast.success('Successfully enrolled in course!');
        // Update course data to reflect enrollment
        setCourses(prev => prev.map(course => 
          (course.id === courseId || course._id === courseId)
            ? { ...course, isEnrolled: true, enrolledStudents: (course.enrolledStudents || 0) + 1 }
            : course
        ));
      } else {
        toast.error(response.error || 'Failed to enroll in course');
      }
    } catch (error) {
      console.error('❌ Error enrolling in course:', error);
      toast.error('Failed to enroll in course');
    } finally {
      setEnrolling(prev => ({ ...prev, [courseId]: false }));
    }
  };

  const getDurationText = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${mins}m`;
  };

  const CourseCard = ({ course }) => (
    <div className="bg-card rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1 group">
      <div className="h-48 relative overflow-hidden">
        <img
          src={course.image || course.thumbnail || 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop'}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            course.difficulty === 'beginner' ? 'bg-green-500 text-white' :
            course.difficulty === 'intermediate' ? 'bg-yellow-500 text-white' :
            'bg-red-500 text-white'
          }`}>
            {course.difficulty.charAt(0).toUpperCase() + course.difficulty.slice(1)}
          </span>
        </div>
        <div className="absolute bottom-4 left-4 text-white">
          <div className="flex items-center text-sm">
            <Clock className="w-4 h-4 mr-1" />
            <span>{getDurationText(course.estimatedDuration)}</span>
          </div>
        </div>
      </div>
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground uppercase tracking-wide">
            {course.category.replace('_', ' ')}
          </span>
          <div className="flex items-center">
            <Star className="w-4 h-4 text-yellow-500 fill-current" />
            <span className="text-sm text-muted-foreground ml-1">4.8</span>
          </div>
        </div>
        <h3 className="text-xl font-bold text-card-foreground mb-2 group-hover:text-primary transition-colors">
          {course.title}
        </h3>
        <p className="text-muted-foreground text-sm mb-4 leading-relaxed line-clamp-3">
          {course.description}
        </p>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <Users className="w-4 h-4 mr-1" />
            <span>1,200+ enrolled</span>
          </div>
          <div className="text-sm font-semibold text-card-foreground">
            {course.instructor}
          </div>
        </div>
        <div className="flex flex-wrap gap-1 mb-4">
          {(course.tags || []).slice(0, 3).map((tag, index) => (
            <span
              key={`${course.id || course._id}-tag-${index}`}
              className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-md"
            >
              {tag}
            </span>
          ))}
          {(course.tags || []).length > 3 && (
            <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-md">
              +{(course.tags || []).length - 3} more
            </span>
          )}
        </div>
        <div className="space-y-3">
          <button 
            onClick={() => handleEnroll(course.id || course._id)}
            disabled={enrolling[course.id || course._id] || course.isEnrolled}
            className={`w-full py-3 rounded-xl font-semibold transition-colors flex items-center justify-center ${
              course.isEnrolled
                ? 'bg-green-100 text-green-800 cursor-not-allowed'
                : 'bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
          >
            {enrolling[course.id || course._id] ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Enrolling...</span>
              </div>
            ) : course.isEnrolled ? (
              <div className="flex items-center space-x-2">
                <Award className="h-4 w-4" />
                <span>Enrolled</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Play className="h-4 w-4" />
                <span>Enroll Now</span>
              </div>
            )}
          </button>
          
          <button
            onClick={() => navigate(`/courses/${course.id || course._id}`)}
            className="w-full py-2 border border-border text-muted-foreground rounded-lg hover:bg-muted transition-colors"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <VisitorLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading courses...</p>
          </div>
        </div>
      </VisitorLayout>
    );
  }

  return (
    <VisitorLayout>
      <div className="p-8">
      {/* Header */}
      <section className="py-16 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Ethiopian Heritage <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">Courses</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Discover Ethiopia's rich cultural heritage through our comprehensive educational programs. 
              Learn from experts and explore ancient civilizations.
            </p>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
            <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search courses, topics, or instructors..."
              className="w-full pl-14 pr-32 py-4 rounded-xl text-lg bg-card border border-border focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all duration-300 shadow-sm"
            />
            <button 
              type="submit"
              className="absolute right-3 top-3 bg-primary text-primary-foreground px-6 py-2 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Filters and Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg hover:bg-muted transition-colors"
              >
                <Filter className="w-4 h-4" />
                Filters
                <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
              
              {(selectedCategory || selectedDifficulty || searchQuery) && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-3 py-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                  Clear filters
                </button>
              )}
              
              <span className="text-sm text-muted-foreground">
                {filteredCourses.length} courses found
              </span>
            </div>

            <div className="flex items-center gap-4">
              {/* View Mode Toggle */}
              <div className="flex items-center bg-card border border-border rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-l-lg transition-colors ${
                    viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-r-lg transition-colors ${
                    viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 bg-card border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Expandable Filters */}
          {showFilters && (
            <div className="bg-card border border-border rounded-xl p-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-3">Category</label>
                  <div className="space-y-2">
                    {categories.map(category => (
                      <button
                        key={category.value}
                        onClick={() => setSelectedCategory(category.value)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                          selectedCategory === category.value
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <category.icon className="w-4 h-4" />
                        <span className="flex-1">{category.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Difficulty Filter */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-3">Difficulty</label>
                  <div className="space-y-2">
                    {difficulties.map(difficulty => (
                      <button
                        key={difficulty.value}
                        onClick={() => setSelectedDifficulty(difficulty.value)}
                        className={`w-full px-3 py-2 rounded-lg text-left transition-colors ${
                          selectedDifficulty === difficulty.value
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {difficulty.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Duration Filter */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-3">Duration</label>
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">
                      <p>Short: Under 3 hours</p>
                      <p>Medium: 3-6 hours</p>
                      <p>Long: 6+ hours</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Course Grid */}
          {filteredCourses.length > 0 ? (
            <div className={`grid gap-8 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                : 'grid-cols-1'
            }`}>
              {filteredCourses.map((course, index) => (
                <CourseCard key={course.id || course._id || `course-${index}`} course={course} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No courses found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your search criteria or filters
              </p>
              <button
                onClick={clearFilters}
                className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </section>
      </div>
    </VisitorLayout>
  );
};

export default Courses;
