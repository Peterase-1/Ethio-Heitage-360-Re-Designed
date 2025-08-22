import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Clock, 
  BookOpen, 
  Star, 
  Play, 
  CheckCircle, 
  LockKeyhole, 
  Trophy, 
  Share2,
  Bookmark,
  MessageCircle,
  Users,
  BarChart,
  Download
} from 'lucide-react';
import learningService from '../services/learningService';
import { useAuth } from '../hooks/useAuth';
import Footer from '../components/common/Footer';
import Navbar from '../components/common/Navbar';

const CourseDetail = ({ darkMode, toggleDarkMode }) => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user, isEnrolled, enrollInCourse } = useAuth();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState('overview');
  const [enrolled, setEnrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        // Try to get course from service
        const courseData = await learningService.getCourseById(courseId);
        setCourse(courseData);

        // Try to get lessons
        const lessonsData = await learningService.getLessons(courseId);
        setLessons(lessonsData);

        // Check enrollment status if user is logged in
        if (user) {
          const isUserEnrolled = isEnrolled ? isEnrolled(courseId) : false;
          setEnrolled(isUserEnrolled);
          
          // Get progress if enrolled
          if (isUserEnrolled && course) {
            const progressData = await learningService.getLearningProgress();
            const courseProgress = progressData?.courses?.find(c => c.courseId === courseId);
            setProgress(courseProgress?.progressPercentage || 0);
          }
        }
      } catch (error) {
        console.error('Error fetching course details:', error);
        // Fallback to mock data
        const mockCourse = getMockCourse(courseId);
        setCourse(mockCourse);
        setLessons(mockCourse.lessons || []);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [courseId, user, isEnrolled]);

  const handleEnroll = async () => {
    if (!user) {
      setShowSignupPrompt(true);
      return;
    }

    try {
      if (enrollInCourse) {
        await enrollInCourse(courseId);
        setEnrolled(true);
        setShowEnrollmentModal(true);
      } else {
        // Fallback if no enrollment function is available
        setEnrolled(true);
        setShowEnrollmentModal(true);
      }
    } catch (error) {
      console.error('Error enrolling in course:', error);
    }
  };

  const startCourse = () => {
    if (lessons && lessons.length > 0) {
      navigate(`/learning/lesson/${lessons[0].id}`);
    } else {
      // If no lessons, redirect to course page
      navigate(`/learning/course/${courseId}/overview`);
    }
  };

  const continueCourse = () => {
    if (lessons && lessons.length > 0) {
      // Find first incomplete lesson
      const incompleteLesson = lessons.find(lesson => 
        !lesson.completed && lesson.id);
      
      if (incompleteLesson) {
        navigate(`/learning/lesson/${incompleteLesson.id}`);
      } else {
        navigate(`/learning/lesson/${lessons[0].id}`);
      }
    }
  };

  const getMockCourse = (id) => {
    return {
      id,
      title: 'Ethiopian Heritage Fundamentals',
      description: 'This comprehensive course introduces you to the rich heritage of Ethiopia, including its history, culture, traditions, and archaeological wonders. Learn about the ancient kingdoms, religious sites, and cultural practices that make Ethiopia unique.',
      image: '/assets/Ethiopian History Fundamentals.jpg',
      duration: '8 weeks',
      difficulty: 'Beginner',
      rating: 4.8,
      enrolled: 1250,
      instructor: 'Dr. Abebe Kebede',
      category: 'History',
      topics: ['Ancient Kingdoms', 'Religious Sites', 'Cultural Practices', 'Traditional Arts'],
      objectives: [
        'Understand the major historical periods of Ethiopian history',
        'Identify the unique aspects of Ethiopian cultural heritage',
        'Recognize the influence of different religions on Ethiopian society',
        'Appreciate the diversity of Ethiopian traditional arts and crafts'
      ],
      lessons: [
        { id: 'l1', title: 'Introduction to Ethiopian History', duration: '45 mins', order: 1 },
        { id: 'l2', title: 'The Kingdom of Aksum', duration: '60 mins', order: 2 },
        { id: 'l3', title: 'Religious Traditions of Ethiopia', duration: '75 mins', order: 3 },
        { id: 'l4', title: 'Ethiopian Art and Architecture', duration: '60 mins', order: 4 },
        { id: 'l5', title: 'Traditional Customs and Ceremonies', duration: '90 mins', order: 5 },
        { id: 'l6', title: 'Modern Ethiopian Society', duration: '60 mins', order: 6 }
      ],
      price: 0, // Free course
      requirements: [
        'No prior knowledge required',
        'Interest in cultural heritage and history',
        'Basic English proficiency'
      ]
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Course Not Found</h2>
          <p className="text-gray-600 mb-6">The course you're looking for doesn't exist or has been removed.</p>
          <button 
            onClick={() => navigate('/learning')}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <div 
          className="bg-cover bg-center py-16 md:py-24 relative"
          style={{ 
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${course.image})`,
            backgroundPosition: 'center',
            backgroundSize: 'cover'
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <button 
              onClick={() => navigate('/learning')}
              className="flex items-center text-white mb-6 hover:underline"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Courses
            </button>
            
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getDifficultyColor(course.difficulty)}`}>
                {course.difficulty}
              </span>
              <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-semibold">
                {course.category}
              </span>
              <div className="flex items-center text-white">
                <Star className="w-4 h-4 mr-1 fill-yellow-400 text-yellow-400" />
                <span className="mr-1">{course.rating}</span>
                <span className="text-gray-300">({course.enrolled} students)</span>
              </div>
            </div>
            
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">{course.title}</h1>
            
            <p className="text-lg text-gray-200 mb-8 max-w-3xl">{course.description}</p>
            
            <div className="flex flex-wrap items-center gap-6 mb-6 text-white">
              <div className="flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                <span>{course.duration}</span>
              </div>
              <div className="flex items-center">
                <BookOpen className="w-5 h-5 mr-2" />
                <span>{(lessons && lessons.length) || course.lessons?.length || 0} lessons</span>
              </div>
              <div className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                <span>{course.enrolled} enrolled</span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              {!enrolled ? (
                <button 
                  onClick={handleEnroll}
                  className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 flex items-center justify-center"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Enroll Now - {course.price ? `$${course.price}` : 'Free'}
                </button>
              ) : (
                <>
                  <button 
                    onClick={continueCourse}
                    className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 flex items-center justify-center"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Continue Learning
                  </button>
                  <div className="flex-1 bg-gray-200 rounded-full h-3 mt-3 sm:mt-5 max-w-xs overflow-hidden">
                    <div 
                      className="bg-green-500 h-full rounded-full" 
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <span className="text-white font-medium">{progress}% complete</span>
                </>
              )}
              <button className="px-6 py-3 bg-white text-primary rounded-lg font-semibold hover:bg-gray-100 flex items-center justify-center">
                <Share2 className="w-5 h-5 mr-2" />
                Share
              </button>
              <button className="px-6 py-3 bg-transparent border border-white text-white rounded-lg font-semibold hover:bg-white/10 flex items-center justify-center">
                <Bookmark className="w-5 h-5 mr-2" />
                Save
              </button>
            </div>
          </div>
        </div>
        
        {/* Course Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Content */}
            <div className="lg:w-2/3">
              {/* Tabs */}
              <div className="border-b border-gray-200 mb-8">
                <nav className="flex space-x-8">
                  <button 
                    onClick={() => setCurrentTab('overview')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      currentTab === 'overview'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Overview
                  </button>
                  <button 
                    onClick={() => setCurrentTab('curriculum')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      currentTab === 'curriculum'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Curriculum
                  </button>
                  <button 
                    onClick={() => setCurrentTab('reviews')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      currentTab === 'reviews'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Reviews
                  </button>
                  <button 
                    onClick={() => setCurrentTab('faq')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      currentTab === 'faq'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    FAQ
                  </button>
                </nav>
              </div>
              
              {/* Tab Content */}
              <div className="mb-12">
                {currentTab === 'overview' && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6">Course Overview</h2>
                    <p className="text-gray-700 mb-8">
                      {course.description}
                    </p>
                    
                    <div className="mb-8">
                      <h3 className="text-xl font-bold mb-4">What You'll Learn</h3>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {course.objectives?.map((objective, index) => (
                          <li key={index} className="flex items-start">
                            <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                            <span>{objective}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="mb-8">
                      <h3 className="text-xl font-bold mb-4">Course Topics</h3>
                      <div className="flex flex-wrap gap-2">
                        {course.topics?.map((topic, index) => (
                          <span key={index} className="px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-sm">
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mb-8">
                      <h3 className="text-xl font-bold mb-4">Requirements</h3>
                      <ul className="list-disc list-inside space-y-2 text-gray-700">
                        {course.requirements?.map((req, index) => (
                          <li key={index}>{req}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-bold mb-4">About Instructor</h3>
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mr-4">
                          <div className="w-16 h-16 rounded-full bg-gray-300"></div>
                        </div>
                        <div>
                          <h4 className="font-bold">{course.instructor}</h4>
                          <p className="text-gray-600 text-sm mb-2">Expert in Ethiopian Heritage</p>
                          <p className="text-gray-700">
                            Passionate educator with extensive knowledge of Ethiopian history and culture.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {currentTab === 'curriculum' && (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-bold">Course Curriculum</h2>
                      <div className="text-sm text-gray-600">
                        {(lessons && lessons.length) || course.lessons?.length || 0} lessons • {course.duration}
                      </div>
                    </div>
                    
                    <div className="border rounded-lg overflow-hidden divide-y">
                      {(lessons || course.lessons || []).map((lesson, index) => (
                        <div key={lesson.id || index} className="p-4 bg-white hover:bg-gray-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-3 text-sm font-medium">
                                {lesson.order || index + 1}
                              </div>
                              <div>
                                <h3 className="font-medium">{lesson.title}</h3>
                                <div className="flex items-center text-sm text-gray-500 mt-1">
                                  <Clock className="w-4 h-4 mr-1" />
                                  {lesson.duration}
                                </div>
                              </div>
                            </div>
                            
                            {enrolled ? (
                              <button 
                                onClick={() => navigate(`/learning/lesson/${lesson.id}`)}
                                className="px-3 py-1 rounded-lg bg-blue-100 text-blue-800 hover:bg-blue-200 text-sm font-medium"
                              >
                                {lesson.completed ? 'Review' : 'Start'}
                              </button>
                            ) : (
                              <div className="text-gray-500">
                                <LockKeyhole className="w-5 h-5" />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {currentTab === 'reviews' && (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-bold">Student Reviews</h2>
                      <div className="flex items-center">
                        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400 mr-1" />
                        <span className="font-bold mr-1">{course.rating}</span>
                        <span className="text-gray-600">({course.enrolled} students)</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <div className="p-6 border rounded-lg">
                        <div className="flex items-center mb-4">
                          <div className="w-10 h-10 rounded-full bg-gray-300 mr-3"></div>
                          <div>
                            <h4 className="font-bold">Sarah M.</h4>
                            <div className="flex text-yellow-400">
                              <Star className="w-4 h-4 fill-current" />
                              <Star className="w-4 h-4 fill-current" />
                              <Star className="w-4 h-4 fill-current" />
                              <Star className="w-4 h-4 fill-current" />
                              <Star className="w-4 h-4 fill-current" />
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-700">
                          Excellent course! I learned so much about Ethiopian history that I never knew before. The instructor was extremely knowledgeable.
                        </p>
                      </div>
                      
                      <div className="p-6 border rounded-lg">
                        <div className="flex items-center mb-4">
                          <div className="w-10 h-10 rounded-full bg-gray-300 mr-3"></div>
                          <div>
                            <h4 className="font-bold">Michael T.</h4>
                            <div className="flex text-yellow-400">
                              <Star className="w-4 h-4 fill-current" />
                              <Star className="w-4 h-4 fill-current" />
                              <Star className="w-4 h-4 fill-current" />
                              <Star className="w-4 h-4 fill-current" />
                              <Star className="w-4 h-4 text-gray-300" />
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-700">
                          Great content and well structured. I would have liked more interactive elements, but overall an excellent introduction to Ethiopian heritage.
                        </p>
                      </div>
                      
                      <div className="p-6 border rounded-lg">
                        <div className="flex items-center mb-4">
                          <div className="w-10 h-10 rounded-full bg-gray-300 mr-3"></div>
                          <div>
                            <h4 className="font-bold">David K.</h4>
                            <div className="flex text-yellow-400">
                              <Star className="w-4 h-4 fill-current" />
                              <Star className="w-4 h-4 fill-current" />
                              <Star className="w-4 h-4 fill-current" />
                              <Star className="w-4 h-4 fill-current" />
                              <Star className="w-4 h-4 fill-current" />
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-700">
                          I've been interested in Ethiopian culture for years and this course exceeded my expectations. The materials were comprehensive and engaging.
                        </p>
                      </div>
                      
                      <div className="p-6 border rounded-lg">
                        <div className="flex items-center mb-4">
                          <div className="w-10 h-10 rounded-full bg-gray-300 mr-3"></div>
                          <div>
                            <h4 className="font-bold">Jessica L.</h4>
                            <div className="flex text-yellow-400">
                              <Star className="w-4 h-4 fill-current" />
                              <Star className="w-4 h-4 fill-current" />
                              <Star className="w-4 h-4 fill-current" />
                              <Star className="w-4 h-4 fill-current" />
                              <Star className="w-4 h-4 fill-current" />
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-700">
                          The virtual tours of historical sites were amazing! It felt like I was actually there. Highly recommend this course to anyone interested in Ethiopian heritage.
                        </p>
                      </div>
                    </div>
                    
                    <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium">
                      Load More Reviews
                    </button>
                  </div>
                )}
                
                {currentTab === 'faq' && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
                    
                    <div className="space-y-6">
                      <div className="border rounded-lg p-6">
                        <h3 className="font-bold text-lg mb-2">How long do I have access to this course?</h3>
                        <p className="text-gray-700">
                          Once you enroll, you have lifetime access to the course content. You can review the material at any time.
                        </p>
                      </div>
                      
                      <div className="border rounded-lg p-6">
                        <h3 className="font-bold text-lg mb-2">Are there any certificates provided upon completion?</h3>
                        <p className="text-gray-700">
                          Yes, you will receive a certificate of completion once you finish all course modules and assessments.
                        </p>
                      </div>
                      
                      <div className="border rounded-lg p-6">
                        <h3 className="font-bold text-lg mb-2">Can I download the course materials for offline viewing?</h3>
                        <p className="text-gray-700">
                          Yes, most course materials including reading resources and worksheets can be downloaded. Video content is available for streaming only.
                        </p>
                      </div>
                      
                      <div className="border rounded-lg p-6">
                        <h3 className="font-bold text-lg mb-2">Is there instructor support available?</h3>
                        <p className="text-gray-700">
                          Yes, you can ask questions in the discussion forum and the instructor typically responds within 48 hours.
                        </p>
                      </div>
                      
                      <div className="border rounded-lg p-6">
                        <h3 className="font-bold text-lg mb-2">What if I'm not satisfied with the course?</h3>
                        <p className="text-gray-700">
                          We offer a 30-day satisfaction guarantee. If you're not completely satisfied, you can request a refund within 30 days of enrollment.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Sidebar */}
            <div className="lg:w-1/3 space-y-6">
              {/* Course Stats Card */}
              <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
                <div className="p-6">
                  <h3 className="text-lg font-bold mb-4">Course Stats</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Clock className="w-5 h-5 text-gray-500 mr-3" />
                        <span>Duration</span>
                      </div>
                      <span className="font-medium">{course.duration}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <BookOpen className="w-5 h-5 text-gray-500 mr-3" />
                        <span>Lessons</span>
                      </div>
                      <span className="font-medium">{(lessons && lessons.length) || course.lessons?.length || 0}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <BarChart className="w-5 h-5 text-gray-500 mr-3" />
                        <span>Difficulty</span>
                      </div>
                      <span className="font-medium">{course.difficulty}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Users className="w-5 h-5 text-gray-500 mr-3" />
                        <span>Enrolled</span>
                      </div>
                      <span className="font-medium">{course.enrolled} students</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Star className="w-5 h-5 text-gray-500 mr-3" />
                        <span>Rating</span>
                      </div>
                      <span className="font-medium">{course.rating}/5</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Download className="w-5 h-5 text-gray-500 mr-3" />
                        <span>Resources</span>
                      </div>
                      <span className="font-medium">15 files</span>
                    </div>
                  </div>
                </div>
                
                <div className="border-t p-6">
                  {!enrolled ? (
                    <button 
                      onClick={handleEnroll}
                      className="w-full px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 flex items-center justify-center"
                    >
                      <Play className="w-5 h-5 mr-2" />
                      Enroll Now - {course.price ? `$${course.price}` : 'Free'}
                    </button>
                  ) : (
                    <button 
                      onClick={continueCourse}
                      className="w-full px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 flex items-center justify-center"
                    >
                      <Play className="w-5 h-5 mr-2" />
                      Continue Learning
                    </button>
                  )}
                </div>
              </div>
              
              {/* Related Courses */}
              <div className="border rounded-lg overflow-hidden bg-white shadow-sm p-6">
                <h3 className="text-lg font-bold mb-4">Related Courses</h3>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="w-20 h-14 bg-gray-200 rounded overflow-hidden flex-shrink-0 mr-3">
                      <img src="/assets/The Fourth Holy City of Islam.jpg" alt="Course" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm mb-1">Ethiopian Religious Heritage</h4>
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="w-3 h-3 mr-1" />
                        <span>6 weeks</span>
                        <span className="mx-2">•</span>
                        <BookOpen className="w-3 h-3 mr-1" />
                        <span>24 lessons</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-20 h-14 bg-gray-200 rounded overflow-hidden flex-shrink-0 mr-3">
                      <img src="/assets/Archaeological Wonders.jpg" alt="Course" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm mb-1">Archaeological Wonders of Ethiopia</h4>
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="w-3 h-3 mr-1" />
                        <span>8 weeks</span>
                        <span className="mx-2">•</span>
                        <BookOpen className="w-3 h-3 mr-1" />
                        <span>32 lessons</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-20 h-14 bg-gray-200 rounded overflow-hidden flex-shrink-0 mr-3">
                      <img src="/assets/cultural-festivals.jpg" alt="Course" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm mb-1">Ethiopian Festivals & Celebrations</h4>
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="w-3 h-3 mr-1" />
                        <span>4 weeks</span>
                        <span className="mx-2">•</span>
                        <BookOpen className="w-3 h-3 mr-1" />
                        <span>16 lessons</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <button className="w-full mt-4 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium text-sm">
                  View All Related Courses
                </button>
              </div>
              
              {/* Learning Features */}
              <div className="border rounded-lg overflow-hidden bg-white shadow-sm p-6">
                <h3 className="text-lg font-bold mb-4">Learning Features</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                      <Trophy className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Completion Certificate</h4>
                      <p className="text-sm text-gray-500">Earn a certificate upon completion</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                      <MessageCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Community Discussion</h4>
                      <p className="text-sm text-gray-500">Learn with fellow students</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                      <Download className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Downloadable Resources</h4>
                      <p className="text-sm text-gray-500">Access material offline</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center mr-3">
                      <Target className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Interactive Quizzes</h4>
                      <p className="text-sm text-gray-500">Test your knowledge</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Enrollment Success Modal */}
      {showEnrollmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Successfully Enrolled!</h3>
              <p className="text-gray-600">
                You are now enrolled in <span className="font-medium">{course.title}</span>. Ready to start learning?
              </p>
            </div>
            
            <div className="space-y-3">
              <button 
                onClick={() => {
                  setShowEnrollmentModal(false);
                  startCourse();
                }}
                className="w-full px-4 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90"
              >
                Start Learning Now
              </button>
              <button 
                onClick={() => setShowEnrollmentModal(false)}
                className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
              >
                Browse More Courses
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Signup Prompt Modal */}
      {showSignupPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <LockKeyhole className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Sign Up to Enroll</h3>
              <p className="text-gray-600">
                Create an account or log in to enroll in this course and track your progress.
              </p>
            </div>
            
            <div className="space-y-3">
              <button 
                onClick={() => {
                  setShowSignupPrompt(false);
                  navigate('/auth');
                }}
                className="w-full px-4 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90"
              >
                Sign Up / Log In
              </button>
              <button 
                onClick={() => setShowSignupPrompt(false)}
                className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      <Footer />
    </>
  );
};

export default CourseDetail;
