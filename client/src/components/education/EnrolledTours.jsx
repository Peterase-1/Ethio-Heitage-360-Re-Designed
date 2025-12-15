import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Star, BookOpen, Award, Clock, User, ChevronRight, Play, CheckCircle, AlertCircle } from 'lucide-react';
import educationalToursApi, { handleApiError } from '../../services/educationalToursApi';

const EnrolledTours = () => {
  const [enrolledTours, setEnrolledTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTour, setSelectedTour] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchEnrolledTours();
  }, []);

  const fetchEnrolledTours = async () => {
    try {
      setLoading(true);
      const response = await educationalToursApi.user.getEnrolledTours();
      if (response.success) {
        setEnrolledTours(response.data);
      }
    } catch (error) {
      console.error('Error fetching enrolled tours:', error);
      // Use mock data for demo when API fails
      setEnrolledTours([
        {
          _id: '1',
          title: 'Islamic Architecture of Harar',
          shortDescription: 'Explore the ancient Islamic architecture and cultural sites of the walled city',
          category: 'Islamic Architecture',
          difficulty: 'Intermediate',
          startDate: '2024-02-15T09:00:00Z',
          endDate: '2024-02-15T17:00:00Z',
          duration: 8,
          location: {
            name: 'Harar Jugol',
            address: 'Old City, Harar, Ethiopia',
            meetingPoint: 'Harar Gate Main Entrance'
          },
          organizerId: {
            firstName: 'Ahmed',
            lastName: 'Hassan',
            profileImage: '/images/organizers/ahmed.jpg'
          },
          curriculum: [
            {
              order: 1,
              title: 'Introduction to Harar\'s Islamic Heritage',
              description: 'Overview of the city\'s history and Islamic significance',
              duration: 60,
              activities: ['Guided Tour', 'Discussion']
            },
            {
              order: 2,
              title: 'Architectural Styles and Techniques',
              description: 'Understanding traditional Islamic architectural elements',
              duration: 90,
              activities: ['Guided Tour', 'Photography', 'Sketching']
            },
            {
              order: 3,
              title: 'Cultural Integration and Modern Preservation',
              description: 'How Islamic architecture integrates with local culture',
              duration: 60,
              activities: ['Discussion', 'Hands-on Activity']
            }
          ],
          userEnrollment: {
            enrolledAt: '2024-01-20T10:00:00Z',
            status: 'confirmed',
            paymentStatus: 'paid',
            progress: {
              lessonsCompleted: 1,
              totalScore: 85,
              certificateEarned: false
            }
          },
          pricing: { price: 850, currency: 'ETB' },
          stats: { averageRating: 4.5 },
          announcements: [
            {
              title: 'Tour Starting Soon',
              message: 'Please arrive 15 minutes early at the meeting point.',
              isImportant: true,
              createdAt: '2024-02-10T08:00:00Z'
            }
          ]
        },
        {
          _id: '2',
          title: 'Ethiopian Scripts and Ancient Writing',
          shortDescription: 'Learn about the evolution of Ethiopian writing systems and their cultural significance',
          category: 'Ethiopian Scripts',
          difficulty: 'Beginner',
          startDate: '2024-03-01T14:00:00Z',
          endDate: '2024-03-01T18:00:00Z',
          duration: 4,
          location: {
            name: 'National Library of Ethiopia',
            address: 'Churchill Ave, Addis Ababa, Ethiopia',
            meetingPoint: 'Library Main Entrance'
          },
          organizerId: {
            firstName: 'Meron',
            lastName: 'Tesfaye',
            profileImage: '/images/organizers/meron.jpg'
          },
          curriculum: [
            {
              order: 1,
              title: 'History of Ethiopian Writing Systems',
              description: 'From ancient Ge\'ez to modern Amharic scripts',
              duration: 90,
              activities: ['Guided Tour', 'Discussion']
            },
            {
              order: 2,
              title: 'Hands-on Script Writing',
              description: 'Practice writing with traditional tools and methods',
              duration: 90,
              activities: ['Hands-on Activity', 'Demonstration']
            }
          ],
          userEnrollment: {
            enrolledAt: '2024-02-01T15:30:00Z',
            status: 'pending',
            paymentStatus: 'pending',
            progress: {
              lessonsCompleted: 0,
              totalScore: 0,
              certificateEarned: false
            }
          },
          pricing: { price: 450, currency: 'ETB' },
          stats: { averageRating: 4.8 },
          announcements: []
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredTours = enrolledTours.filter(tour => {
    if (activeTab === 'all') return true;
    if (activeTab === 'upcoming') return new Date(tour.startDate) > new Date();
    if (activeTab === 'ongoing') return new Date(tour.startDate) <= new Date() && new Date(tour.endDate) >= new Date();
    if (activeTab === 'completed') return tour.userEnrollment.status === 'completed';
    return true;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500/10 text-green-500';
      case 'pending': return 'bg-yellow-500/10 text-yellow-500';
      case 'completed': return 'bg-blue-500/10 text-blue-500';
      case 'cancelled': return 'bg-destructive/10 text-destructive';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-500/10 text-green-500';
      case 'Intermediate': return 'bg-yellow-500/10 text-yellow-500';
      case 'Advanced': return 'bg-red-500/10 text-red-500';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const calculateProgress = (tour) => {
    const totalLessons = tour.curriculum.length;
    const completedLessons = tour.userEnrollment.progress.lessonsCompleted;
    return totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  };

  const getProgressColor = (progress) => {
    if (progress >= 100) return 'bg-primary';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-muted';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-card rounded-lg shadow-sm p-6 border border-border">
        <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <BookOpen className="w-7 h-7 text-primary" />
          My Educational Tours
        </h2>

        {/* Filter Tabs */}
        <div className="flex space-x-1 bg-muted p-1 rounded-lg">
          {[
            { key: 'all', label: 'All Tours', count: enrolledTours.length },
            { key: 'upcoming', label: 'Upcoming', count: enrolledTours.filter(t => new Date(t.startDate) > new Date()).length },
            { key: 'ongoing', label: 'Ongoing', count: enrolledTours.filter(t => new Date(t.startDate) <= new Date() && new Date(t.endDate) >= new Date()).length },
            { key: 'completed', label: 'Completed', count: enrolledTours.filter(t => t.userEnrollment.status === 'completed').length }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === tab.key
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Tours Grid */}
      <div className="grid gap-6">
        {filteredTours.map((tour) => {
          const progress = calculateProgress(tour);
          const isUpcoming = new Date(tour.startDate) > new Date();
          const isOngoing = new Date(tour.startDate) <= new Date() && new Date(tour.endDate) >= new Date();

          return (
            <div key={tour._id} className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
              <div className="p-6">
                {/* Tour Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-foreground">{tour.title}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(tour.userEnrollment.status)}`}>
                        {tour.userEnrollment.status}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(tour.difficulty)}`}>
                        {tour.difficulty}
                      </span>
                    </div>
                    <p className="text-muted-foreground mb-3">{tour.shortDescription}</p>

                    {/* Tour Info Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm mb-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        {formatDate(tour.startDate).split(' at ')[0]}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {new Date(tour.startDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        {tour.location.name}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <User className="w-4 h-4" />
                        {tour.organizerId.firstName} {tour.organizerId.lastName}
                      </div>
                    </div>
                  </div>

                  <div className="ml-4 text-right">
                    <div className="text-2xl font-bold text-primary">{tour.pricing.price} {tour.pricing.currency}</div>
                    <div className="text-sm text-muted-foreground">
                      Payment: <span className={tour.userEnrollment.paymentStatus === 'paid' ? 'text-primary' : 'text-yellow-500'}>{tour.userEnrollment.paymentStatus}</span>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Course Progress</span>
                    <span className="font-medium text-foreground">{progress}% Complete</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(progress)}`}
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                    <span>{tour.userEnrollment.progress.lessonsCompleted} of {tour.curriculum.length} lessons</span>
                    {tour.userEnrollment.progress.totalScore > 0 && (
                      <span>Score: {tour.userEnrollment.progress.totalScore}%</span>
                    )}
                  </div>
                </div>

                {/* Status Indicators */}
                <div className="flex items-center gap-4 text-sm mb-4">
                  {isUpcoming && (
                    <div className="flex items-center gap-1 text-yellow-500">
                      <AlertCircle className="w-4 h-4" />
                      Starts {new Date(tour.startDate).toLocaleDateString()}
                    </div>
                  )}
                  {isOngoing && (
                    <div className="flex items-center gap-1 text-primary">
                      <Play className="w-4 h-4" />
                      In Progress
                    </div>
                  )}
                  {tour.userEnrollment.progress.certificateEarned && (
                    <div className="flex items-center gap-1 text-purple-500">
                      <Award className="w-4 h-4" />
                      Certificate Earned
                    </div>
                  )}
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    {tour.stats.averageRating.toFixed(1)} rating
                  </div>
                </div>

                {/* Announcements */}
                {tour.announcements && tour.announcements.length > 0 && (
                  <div className="bg-muted/50 rounded-lg p-4 mb-4">
                    <h4 className="font-medium text-foreground mb-2">Latest Announcement</h4>
                    {tour.announcements[0].isImportant && (
                      <div className="flex items-center gap-2 text-destructive mb-2">
                        <AlertCircle className="w-4 h-4" />
                        <span className="font-medium">Important</span>
                      </div>
                    )}
                    <h5 className="font-medium text-foreground">{tour.announcements[0].title}</h5>
                    <p className="text-muted-foreground text-sm">{tour.announcements[0].message}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <button
                    onClick={() => setSelectedTour(tour)}
                    className="text-primary hover:underline font-medium flex items-center gap-1"
                  >
                    View Details <ChevronRight className="w-4 h-4" />
                  </button>

                  <div className="flex gap-2">
                    {isOngoing && (
                      <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
                        Continue Learning
                      </button>
                    )}
                    {isUpcoming && (
                      <button className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg hover:bg-secondary/80 transition-colors">
                        Prepare for Tour
                      </button>
                    )}
                    {tour.userEnrollment.status === 'completed' && !tour.userEnrollment.feedback && (
                      <button className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors">
                        Leave Feedback
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filteredTours.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              {activeTab === 'all' ? 'No enrolled tours yet.' : `No ${activeTab} tours found.`}
            </p>
            <Link to="/educational-tours" className="text-primary hover:underline">
              Browse Available Tours
            </Link>
          </div>
        )}
      </div>

      {/* Tour Details Modal */}
      {selectedTour && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-border shadow-xl">
            <div className="p-6 border-b border-border">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-2xl font-semibold text-foreground mb-2">{selectedTour.title}</h3>
                  <p className="text-muted-foreground">{selectedTour.shortDescription}</p>
                </div>
                <button
                  onClick={() => setSelectedTour(null)}
                  className="text-muted-foreground hover:text-foreground text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Tour Information */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-semibold text-foreground mb-3">Tour Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{formatDate(selectedTour.startDate)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{selectedTour.duration} hours</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <div className="text-foreground">{selectedTour.location.name}</div>
                        <div className="text-muted-foreground">{selectedTour.location.address}</div>
                        <div className="text-muted-foreground">Meeting: {selectedTour.location.meetingPoint}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Led by {selectedTour.organizerId.firstName} {selectedTour.organizerId.lastName}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-foreground mb-3">Your Progress</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Enrollment Status</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(selectedTour.userEnrollment.status)}`}>
                        {selectedTour.userEnrollment.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Payment</span>
                      <span className={`text-sm ${selectedTour.userEnrollment.paymentStatus === 'paid' ? 'text-primary' : 'text-yellow-500'}`}>
                        {selectedTour.userEnrollment.paymentStatus}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Lessons Completed</span>
                      <span className="text-sm text-foreground">{selectedTour.userEnrollment.progress.lessonsCompleted}/{selectedTour.curriculum.length}</span>
                    </div>
                    {selectedTour.userEnrollment.progress.totalScore > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Current Score</span>
                        <span className="text-sm text-primary font-medium">{selectedTour.userEnrollment.progress.totalScore}%</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Curriculum */}
              <div className="mb-6">
                <h4 className="font-semibold text-foreground mb-3">Course Curriculum</h4>
                <div className="space-y-3">
                  {selectedTour.curriculum.map((lesson, index) => (
                    <div key={index} className="border border-border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${index < selectedTour.userEnrollment.progress.lessonsCompleted
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-muted-foreground'
                            }`}>
                            {index < selectedTour.userEnrollment.progress.lessonsCompleted ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : (
                              lesson.order
                            )}
                          </div>
                          <h5 className="font-medium text-foreground">{lesson.title}</h5>
                        </div>
                        <span className="text-sm text-muted-foreground">{lesson.duration} min</span>
                      </div>
                      <p className="text-muted-foreground text-sm mb-2 ml-9">{lesson.description}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground ml-9">
                        {lesson.activities.map((activity, actIndex) => (
                          <span key={actIndex} className="bg-muted px-2 py-1 rounded">
                            {activity}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-6 border-t border-border">
                <button
                  onClick={() => setSelectedTour(null)}
                  className="bg-secondary text-secondary-foreground px-6 py-2 rounded-lg hover:bg-secondary/80 transition-colors"
                >
                  Close
                </button>
                {new Date(selectedTour.startDate) <= new Date() && new Date(selectedTour.endDate) >= new Date() && (
                  <button className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors">
                    Continue Learning
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

export default EnrolledTours;
