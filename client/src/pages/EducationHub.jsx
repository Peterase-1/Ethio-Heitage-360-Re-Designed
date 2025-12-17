import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Users,
  Award,
  MapPin,
  Search,
  Filter,
  Grid,
  List,
  ChevronRight,
  GraduationCap,
  FileText,
  Video,
  Brain,
  Calendar,
  Clock,
  User,
  Star
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import EducationNavigation from '../components/education/EducationNavigation';
import CourseCard from '../components/education/CourseCard';
import StudyGuideCard from '../components/education/StudyGuideCard';
import QuizCard from '../components/education/QuizCard';
import LiveSessionCard from '../components/education/LiveSessionCard';
import CertificateCard from '../components/education/CertificateCard';
import { educationApi } from '../services/educationApi';
import toast from 'react-hot-toast';

const EducationHub = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('browse-courses');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    difficulty: '',
    sort: 'createdAt'
  });
  const [viewMode, setViewMode] = useState('grid');
  const [loading, setLoading] = useState(false);

  // Data states
  const [courses, setCourses] = useState([]);
  const [studyGuides, setStudyGuides] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [tours, setTours] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [myEnrollments, setMyEnrollments] = useState([]);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  });

  // Fetch data based on active section
  useEffect(() => {
    fetchData();
  }, [activeSection, searchQuery, filters, pagination.page]);

  const fetchData = async () => {
    setLoading(true);
    try {
      switch (activeSection) {
        case 'browse-courses':
          await fetchCourses();
          break;
        case 'my-learning':
          await fetchMyEnrollments();
          break;
        case 'study-guides':
          await fetchStudyGuides();
          break;
        case 'certificates':
          await fetchCertificates();
          break;
        case 'educational-tours':
          await fetchTours();
          break;
        default:
          await fetchCourses();
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    const params = {
      page: pagination.page,
      limit: pagination.limit,
      ...filters
    };
    if (searchQuery) params.search = searchQuery;

    const response = await educationApi.getCourses(params);
    setCourses(response.data);
    setPagination(prev => ({ ...prev, ...response.pagination }));
  };

  const fetchTours = async () => {
    const params = {
      page: pagination.page,
      limit: pagination.limit,
      ...filters
    };
    if (searchQuery) params.search = searchQuery;

    const response = await educationApi.getEducationalTours(params);
    setTours(response.data);
    setPagination(prev => ({ ...prev, ...response.pagination }));
  };

  const fetchMyEnrollments = async () => {
    if (!user) return;
    const response = await educationApi.getMyEnrollments();
    setMyEnrollments(response.data);
  };

  const fetchStudyGuides = async () => {
    const params = {
      page: pagination.page,
      limit: pagination.limit,
      category: filters.category
    };
    const response = await educationApi.getStudyGuides(params);
    setStudyGuides(response.data);
    setPagination(prev => ({ ...prev, ...response.pagination }));
  };

  const fetchCertificates = async () => {
    if (!user) return;
    const response = await educationApi.getMyCertificates();
    setCertificates(response.data);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchData();
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const renderMainContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      );
    }

    switch (activeSection) {
      case 'browse-courses':
        return renderCourses();
      case 'my-learning':
        return renderMyLearning();
      case 'study-guides':
        return renderStudyGuides();
      case 'certificates':
        return renderCertificates();
      case 'educational-tours':
        return renderTours();
      default:
        return renderCourses();
    }
  };

  const renderCourses = () => (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">Browse Courses</h2>
        <p className="text-muted-foreground">
          Explore our comprehensive collection of Ethiopian heritage courses
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-card rounded-lg border p-6 mb-8">
        <form onSubmit={handleSearch} className="flex gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap gap-4 items-center">
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Categories</option>
            <option value="history">History</option>
            <option value="culture">Culture</option>
            <option value="archaeology">Archaeology</option>
            <option value="language">Language</option>
            <option value="art">Art</option>
            <option value="traditions">Traditions</option>
          </select>

          <select
            value={filters.difficulty}
            onChange={(e) => handleFilterChange('difficulty', e.target.value)}
            className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>

          <select
            value={filters.sort}
            onChange={(e) => handleFilterChange('sort', e.target.value)}
            className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="createdAt">Newest</option>
            <option value="enrollmentCount">Most Popular</option>
            <option value="rating">Highest Rated</option>
            <option value="title">Alphabetical</option>
          </select>

          <div className="flex border rounded-md">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : ''}`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : ''}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Courses Grid/List */}
      <div className={
        viewMode === 'grid'
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
          : 'space-y-4'
      }>
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} viewMode={viewMode} />
        ))}
      </div>

      {courses.length === 0 && !loading && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No courses found</h3>
          <p className="text-muted-foreground">Try adjusting your search criteria</p>
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center mt-8">
          <div className="flex gap-2">
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setPagination(prev => ({ ...prev, page }))}
                className={`px-3 py-2 rounded-md ${page === pagination.page
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
                  }`}
              >
                {page}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderMyLearning = () => (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">My Learning</h2>
        <p className="text-muted-foreground">
          Track your progress and continue your learning journey
        </p>
      </div>

      {user ? (
        <div className="space-y-6">
          {myEnrollments.length > 0 ? (
            myEnrollments.map((enrollment) => (
              <CourseCard
                key={enrollment.id}
                course={enrollment}
                viewMode="list"
                showProgress={true}
              />
            ))
          ) : (
            <div className="text-center py-12">
              <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No enrolled courses</h3>
              <p className="text-muted-foreground mb-4">Start learning by enrolling in a course</p>
              <button
                onClick={() => setActiveSection('browse-courses')}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Browse Courses
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Sign in to view your learning</h3>
          <p className="text-muted-foreground">Please sign in to access your enrolled courses</p>
        </div>
      )}
    </div>
  );

  const renderStudyGuides = () => (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">Study Guides</h2>
        <p className="text-muted-foreground">
          Comprehensive study materials to enhance your learning
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {studyGuides.map((guide) => (
          <StudyGuideCard key={guide.id} guide={guide} />
        ))}
      </div>

      {studyGuides.length === 0 && !loading && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No study guides found</h3>
          <p className="text-muted-foreground">Study guides will be available soon</p>
        </div>
      )}
    </div>
  );

  const renderCertificates = () => (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">Certificates</h2>
        <p className="text-muted-foreground">
          Your earned certificates and achievements
        </p>
      </div>

      {user ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((certificate) => (
            <CertificateCard key={certificate.id} certificate={certificate} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Sign in to view certificates</h3>
          <p className="text-muted-foreground">Please sign in to access your certificates</p>
        </div>
      )}

      {user && certificates.length === 0 && !loading && (
        <div className="text-center py-12">
          <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No certificates yet</h3>
          <p className="text-muted-foreground mb-4">Complete courses to earn certificates</p>
          <button
            onClick={() => setActiveSection('browse-courses')}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Start Learning
          </button>
        </div>
      )}
    </div>
  );

  const renderTours = () => (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">Educational Tours</h2>
        <p className="text-muted-foreground">
          Join our immersive live tours led by heritage experts
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tours.map((tour) => (
          <div key={tour.id || tour._id} className="bg-card rounded-lg shadow-sm border border-border overflow-hidden hover:shadow-md transition-shadow group">
            {/* Image Placeholder */}
            <div className="h-48 bg-muted relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <MapPin className="h-12 w-12 text-muted-foreground/50" />
              </div>
              <div className="absolute top-4 right-4 bg-background/90 backdrop-blur px-2 py-1 rounded text-xs font-medium">
                {tour.category}
              </div>
            </div>

            <div className="p-5">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg line-clamp-1 group-hover:text-primary transition-colors">
                  {tour.title}
                </h3>
                <div className="flex items-center gap-1 text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded">
                  <Star className="h-3 w-3 fill-current" />
                  {tour.stats?.averageRating || 'N/A'}
                </div>
              </div>

              <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                {tour.description}
              </p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-xs text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-2 text-primary" />
                  {new Date(tour.startDate).toLocaleDateString()}
                </div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Clock className="h-4 w-4 mr-2 text-primary" />
                  {tour.duration} hours
                </div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <User className="h-4 w-4 mr-2 text-primary" />
                  {tour.organizerName}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <span className="font-bold text-lg text-primary">
                  {tour.pricing?.price} {tour.pricing?.currency}
                </span>
                <button
                  onClick={() => window.location.href = '/educational-tours'}
                  className="text-sm font-medium text-primary hover:underline flex items-center"
                >
                  View Details <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {tours.length === 0 && !loading && (
        <div className="text-center py-12">
          <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No tours found</h3>
          <p className="text-muted-foreground">Check back soon for new educational tours</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-80 flex-shrink-0">
            <EducationNavigation
              activeSection={activeSection}
              onSectionChange={setActiveSection}
              user={user}
            />
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {renderMainContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EducationHub;
