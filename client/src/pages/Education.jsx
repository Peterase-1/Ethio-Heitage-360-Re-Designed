import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Users, 
  Star, 
  Clock, 
  MapPin, 
  Award, 
  PlayCircle, 
  Calendar, 
  TrendingUp,
  ArrowRight,
  Sparkles,
  Bot,
  Shield,
  Globe
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import CourseCatalog from '../components/education/CourseCatalog';
import EnrolledTours from '../components/education/EnrolledTours';
import architecture from '../assets/architecture.jpg';
import culture from '../assets/culture.jpg';
import obeliskHero from '../assets/obelisk-hero.jpg';

const Education = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);

  // Simulate fetching featured courses
  useEffect(() => {
    const fetchCourses = async () => {
      setCoursesLoading(true);
      // Simulate API call
      setTimeout(() => {
        setFeaturedCourses([
          {
            id: 1,
            title: 'Ancient Ethiopian Civilizations',
            description: 'Explore the rich history of Ethiopia\'s ancient kingdoms and their contributions to world civilization.',
            category: 'History',
            difficulty: 'Beginner',
            duration: 6,
            enrolled: 1200,
            rating: 4.8,
            image: obeliskHero
          },
          {
            id: 2,
            title: 'Ethiopian Orthodox Church Heritage',
            description: 'Discover the unique traditions, art, and architecture of the Ethiopian Orthodox Church.',
            category: 'Religious Heritage',
            difficulty: 'Intermediate',
            duration: 8,
            enrolled: 850,
            rating: 4.9,
            image: architecture
          },
          {
            id: 3,
            title: 'Traditional Ethiopian Arts & Crafts',
            description: 'Learn about traditional Ethiopian crafts, textiles, and artistic expressions.',
            category: 'Cultural Arts',
            difficulty: 'Beginner',
            duration: 4,
            enrolled: 650,
            rating: 4.7,
            image: culture
          }
        ]);
        setCoursesLoading(false);
      }, 1000);
    };

    fetchCourses();
  }, []);

  const handleStartCourse = (course) => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    // Navigate to course detail or enrollment
    navigate(`/courses/${course.id}`);
  };

  const renderOverview = () => (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <div className="inline-flex items-center bg-primary/10 text-primary rounded-full px-4 py-2">
          <BookOpen className="w-4 h-4 mr-2" />
          <span className="text-sm font-semibold">Ethiopian Heritage Education</span>
        </div>
        
        <h1 className="text-4xl md:text-6xl font-bold text-foreground">
          Discover Ethiopia's
          <span className="block bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Rich Heritage
          </span>
        </h1>
        
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          Immerse yourself in comprehensive educational programs covering Ethiopia's ancient civilizations, 
          cultural traditions, architectural wonders, and living heritage.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={() => setActiveTab('courses')}
            className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center"
          >
            <PlayCircle className="w-5 h-5 mr-2" />
            Browse Courses
          </button>
          <button 
            onClick={() => setActiveTab('tours')}
            className="bg-secondary text-secondary-foreground px-8 py-3 rounded-xl font-semibold hover:bg-secondary/90 transition-colors flex items-center justify-center"
          >
            <MapPin className="w-5 h-5 mr-2" />
            Educational Tours
          </button>
        </div>
      </div>

      {/* Featured Courses */}
      <section>
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Featured Heritage Courses
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Start your journey with our most popular courses covering Ethiopia's diverse cultural heritage.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {coursesLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="bg-card rounded-2xl overflow-hidden border border-border shadow-lg animate-pulse">
                <div className="h-48 bg-muted"></div>
                <div className="p-6 space-y-4">
                  <div className="h-6 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-10 bg-muted rounded"></div>
                </div>
              </div>
            ))
          ) : (
            featuredCourses.map((course) => (
              <div key={course.id} className="bg-card rounded-2xl overflow-hidden border border-border shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group">
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      course.difficulty === 'Beginner' ? 'bg-primary text-primary-foreground' :
                      course.difficulty === 'Intermediate' ? 'bg-secondary text-secondary-foreground' :
                      'bg-accent text-accent-foreground'
                    }`}>
                      {course.difficulty}
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <div className="flex items-center text-sm">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>{course.duration} hours</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-primary font-medium">{course.category}</span>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-500 fill-current mr-1" />
                      <span className="text-sm text-muted-foreground">{course.rating}</span>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-card-foreground mb-3">{course.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                    {course.description}
                  </p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="w-4 h-4 mr-1" />
                      <span>{course.enrolled}+ enrolled</span>
                    </div>
                    <div className="flex items-center text-sm text-accent">
                      <Award className="w-4 h-4 mr-1" />
                      <span>Certificate</span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => handleStartCourse(course)}
                    className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center group"
                  >
                    Start Learning
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="text-center mt-8">
          <button 
            onClick={() => setActiveTab('courses')}
            className="text-primary font-semibold hover:underline"
          >
            View All Courses →
          </button>
        </div>
      </section>

      {/* Learning Features */}
      <section className="bg-muted/30 rounded-3xl p-8 md:p-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Why Choose Our Education Platform?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Experience world-class heritage education with cutting-edge technology and expert instruction.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <Award className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-3">Expert Instructors</h3>
            <p className="text-muted-foreground leading-relaxed">
              Learn from renowned archaeologists, historians, and cultural experts from Ethiopia's leading institutions.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-secondary to-accent rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-3">AI-Enhanced Learning</h3>
            <p className="text-muted-foreground leading-relaxed">
              Personalized learning paths with AI tutoring and interactive content tailored to your progress.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-accent to-primary rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-3">Verified Certificates</h3>
            <p className="text-muted-foreground leading-relaxed">
              Earn recognized certificates upon completion to showcase your heritage knowledge and expertise.
            </p>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="text-center">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="text-4xl font-bold text-primary mb-2">500+</div>
            <div className="text-muted-foreground">Heritage Topics</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-secondary mb-2">50+</div>
            <div className="text-muted-foreground">Expert Instructors</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-accent mb-2">10K+</div>
            <div className="text-muted-foreground">Students Enrolled</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-primary mb-2">95%</div>
            <div className="text-muted-foreground">Completion Rate</div>
          </div>
        </div>
      </section>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Tabs */}
      <div className="sticky top-16 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { key: 'overview', label: 'Overview', icon: BookOpen },
              { key: 'courses', label: 'Heritage Courses', icon: PlayCircle },
              { key: 'tours', label: 'Educational Tours', icon: MapPin },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === key
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'courses' && <CourseCatalog />}
        {activeTab === 'tours' && isAuthenticated && <EnrolledTours />}
        {activeTab === 'tours' && !isAuthenticated && (
          <div className="text-center py-12">
            <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-foreground mb-2">Educational Tours</h3>
            <p className="text-muted-foreground mb-6">
              Sign in to view and enroll in educational heritage tours.
            </p>
            <button 
              onClick={() => navigate('/auth')}
              className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              Sign In to Continue
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Education;
