import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import VisitorSidebar from '../dashboard/VisitorSidebar';
import {
  BookOpen,
  Trophy,
  Target,
  TrendingUp,
  Clock,
  Star,
  PlayCircle,
  Users,
  Gamepad2,
  Brain,
  Award,
  Calendar,
  Activity,
  BarChart3,
  CheckCircle,
  Zap,
  ArrowRight,
  Plus,
  Eye,
  Download,
  Share2,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import educationService from '../../services/educationService';
import visitorDashboardService from '../../services/visitorDashboardService';

const VisitorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [educationalStats, setEducationalStats] = useState({
    coursesEnrolled: 0,
    coursesCompleted: 0,
    certificatesEarned: 0,
    totalStudyHours: 0,
    currentStreak: 0,
    totalPoints: 0,
    level: 1
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    loadDashboardData();
  }, [user, navigate]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      console.log('📊 Loading visitor dashboard data...');

      // Load multiple data sources concurrently
      const [
        dashboardResult,
        learningStats,
        featuredCoursesResult,
        platformStats
      ] = await Promise.all([
        visitorDashboardService.getDashboardData(),
        educationService.getLearningStats(),
        educationService.getFeaturedCourses(),
        educationService.getPlatformStats()
      ]);

      console.log('Dashboard results:', {
        dashboardResult,
        learningStats,
        featuredCoursesResult,
        platformStats
      });

      // Set dashboard data
      if (dashboardResult.success) {
        setDashboardData(dashboardResult.data);
        setRecentActivities(dashboardResult.data.activity?.recent || []);
        
        // Extract educational stats
        setEducationalStats({
          coursesEnrolled: dashboardResult.data.bookings?.stats?.total || 0,
          coursesCompleted: dashboardResult.data.bookings?.stats?.confirmed || 0,
          certificatesEarned: dashboardResult.data.favorites?.total || 0,
          totalStudyHours: Math.floor(Math.random() * 50) + 20, // Mock for now
          currentStreak: dashboardResult.data.profile?.streakDays || 0,
          totalPoints: dashboardResult.data.profile?.totalPoints || 0,
          level: dashboardResult.data.profile?.level || 1
        });
      }

      // Set learning stats if available
      if (learningStats.success && learningStats.stats) {
        setEducationalStats(prev => ({
          ...prev,
          coursesEnrolled: learningStats.stats.totalCoursesEnrolled || prev.coursesEnrolled,
          coursesCompleted: learningStats.stats.completedCourses || prev.coursesCompleted,
          certificatesEarned: learningStats.stats.certificatesEarned || prev.certificatesEarned,
          totalStudyHours: learningStats.stats.totalHoursLearned || prev.totalStudyHours
        }));
      }

      // Set featured courses
      if (featuredCoursesResult.success) {
        setFeaturedCourses(featuredCoursesResult.courses.slice(0, 3));
      }

      // Set platform stats
      if (platformStats.success) {
        setUpcomingEvents(platformStats.upcoming?.events || []);
      }

      // Mock achievements for now
      setAchievements([
        { id: 1, name: 'First Course Completed', icon: Trophy, color: 'text-yellow-600', earned: true },
        { id: 2, name: 'Quiz Master', icon: Brain, color: 'text-blue-600', earned: true },
        { id: 3, name: '7-Day Streak', icon: Zap, color: 'text-orange-600', earned: false },
        { id: 4, name: 'Heritage Explorer', icon: Star, color: 'text-purple-600', earned: false }
      ]);

      toast.success('Dashboard loaded successfully!');
    } catch (error) {
      console.error('❌ Error loading dashboard:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, description, onClick }) => (
    <div 
      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow ${
        onClick ? 'cursor-pointer' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className={`text-3xl font-bold ${color} mb-1`}>{value}</p>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
        <div className={`p-3 rounded-lg bg-gray-50`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
      </div>
    </div>
  );

  const QuickActionCard = ({ title, description, icon: Icon, color, onClick }) => (
    <div 
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex items-center space-x-4">
        <div className={`p-3 rounded-lg ${color} bg-opacity-10`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{title}</h3>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>
        <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <VisitorSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="h-12 w-12 text-amber-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading your educational dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <VisitorSidebar />
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name || 'Learner'}! 🎓</h1>
            <p className="text-gray-600 mt-1">Continue your Ethiopian heritage learning journey</p>
          </div>

          {/* Educational Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Courses Enrolled"
              value={educationalStats.coursesEnrolled}
              icon={BookOpen}
              color="text-blue-600"
              description="Active learning paths"
              onClick={() => navigate('/visitor/my-learning')}
            />
            <StatCard
              title="Certificates Earned"
              value={educationalStats.certificatesEarned}
              icon={Trophy}
              color="text-yellow-600"
              description="Achievements unlocked"
              onClick={() => navigate('/visitor/certificates')}
            />
            <StatCard
              title="Study Hours"
              value={educationalStats.totalStudyHours}
              icon={Clock}
              color="text-green-600"
              description="Time invested in learning"
              onClick={() => navigate('/visitor/analytics')}
            />
            <StatCard
              title="Learning Streak"
              value={`${educationalStats.currentStreak} days`}
              icon={Zap}
              color="text-orange-600"
              description="Consecutive learning days"
              onClick={() => navigate('/visitor/progress')}
            />
          </div>

          {/* Level Progress */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Learning Progress</h3>
                <p className="text-sm text-gray-600">Level {educationalStats.level} • {educationalStats.totalPoints} points</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-amber-600">{1000 - (educationalStats.totalPoints % 1000)} points to next level</p>
                <p className="text-xs text-gray-500">Heritage Explorer</p>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-amber-400 to-orange-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((educationalStats.totalPoints % 1000) / 10, 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Quick Actions */}
            <div className="lg:col-span-2">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <QuickActionCard
                  title="Browse Courses"
                  description="Discover new Ethiopian heritage courses"
                  icon={BookOpen}
                  color="text-blue-600"
                  onClick={() => navigate('/education')}
                />
                <QuickActionCard
                  title="Practice Flashcards"
                  description="Review heritage facts and concepts"
                  icon={Brain}
                  color="text-purple-600"
                  onClick={() => navigate('/education?section=flashcards')}
                />
                <QuickActionCard
                  title="Take Quiz"
                  description="Test your knowledge with interactive quizzes"
                  icon={Target}
                  color="text-green-600"
                  onClick={() => navigate('/education?section=quizzes')}
                />
                <QuickActionCard
                  title="Play Games"
                  description="Learn through fun educational games"
                  icon={Gamepad2}
                  color="text-red-600"
                  onClick={() => navigate('/visitor/games')}
                />
              </div>
            </div>

            {/* Recent Achievements */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Achievements</h2>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="space-y-4">
                  {achievements.map((achievement) => {
                    const Icon = achievement.icon;
                    return (
                      <div key={achievement.id} className={`flex items-center space-x-3 p-3 rounded-lg ${
                        achievement.earned ? 'bg-yellow-50' : 'bg-gray-50'
                      }`}>
                        <div className={`p-2 rounded-lg ${
                          achievement.earned ? 'bg-yellow-100' : 'bg-gray-100'
                        }`}>
                          <Icon className={`h-4 w-4 ${
                            achievement.earned ? achievement.color : 'text-gray-400'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${
                            achievement.earned ? 'text-gray-900' : 'text-gray-600'
                          }`}>
                            {achievement.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {achievement.earned ? 'Earned!' : 'In progress'}
                          </p>
                        </div>
                        {achievement.earned && (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                    );
                  })}
                </div>
                <button 
                  onClick={() => navigate('/visitor/achievements')}
                  className="w-full mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  View all achievements →
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Featured Courses */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Featured Courses</h2>
              <div className="space-y-4">
                {featuredCourses.length > 0 ? (
                  featuredCourses.map((course) => (
                    <div key={course.id || course._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-2">{course.title}</h3>
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{course.description}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span className="flex items-center space-x-1">
                              <Users className="h-3 w-3" />
                              <span>{course.enrolledStudents || 0} enrolled</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>{course.duration || '4 weeks'}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Star className="h-3 w-3" />
                              <span>{course.rating || 4.8}</span>
                            </span>
                          </div>
                        </div>
                        <button 
                          onClick={() => navigate(`/education?course=${course.id || course._id}`)}
                          className="ml-4 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                        >
                          View Course
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                    <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">No featured courses available at the moment.</p>
                    <button 
                      onClick={() => navigate('/education')}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      Browse All Courses
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="space-y-4">
                  {recentActivities.length > 0 ? (
                    recentActivities.slice(0, 5).map((activity, index) => {
                      const getActivityIcon = (type) => {
                        switch (type) {
                          case 'course_completed': return Trophy;
                          case 'quiz_completed': return Target;
                          case 'flashcard_session': return Brain;
                          case 'game_played': return Gamepad2;
                          default: return Activity;
                        }
                      };
                      
                      const Icon = getActivityIcon(activity.type);
                      
                      return (
                        <div key={index} className="flex items-center space-x-3">
                          <div className="p-2 rounded-lg bg-blue-50">
                            <Icon className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {activity.entityName || 'Recent Activity'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {activity.pointsEarned && `+${activity.pointsEarned} points • `}
                              {new Date(activity.timestamp).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8">
                      <Activity className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">No recent activity yet.</p>
                      <p className="text-sm text-gray-500">Start learning to see your progress here!</p>
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => navigate('/visitor/activity')}
                  className="w-full mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  View all activity →
                </button>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-amber-900">Ready to continue learning?</h3>
                <p className="text-amber-700 mt-1">Explore Ethiopian heritage through our comprehensive educational platform.</p>
              </div>
              <button 
                onClick={() => navigate('/education')}
                className="bg-amber-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-amber-700 transition-colors flex items-center space-x-2"
              >
                <BookOpen className="h-5 w-5" />
                <span>Start Learning</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisitorDashboard;
