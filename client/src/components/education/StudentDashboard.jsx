import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  School,
  BookOpen,
  Trophy,
  TrendingUp,
  Award,
  PlayCircle,
  CheckCircle,
  Clock,
  LayoutDashboard,
  FileText
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const StudentDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch dashboard stats
      const statsResponse = await fetch('/api/learning/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const statsData = await statsResponse.json();

      // Fetch enrolled courses and learning progress
      const [progressResponse, enrollmentsResponse] = await Promise.all([
        fetch('/api/learning/progress', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }),
        fetch('/api/learning/enrollments', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
      ]);

      const progressData = await progressResponse.json();
      const enrollmentsData = await enrollmentsResponse.json();

      setDashboardData({
        stats: statsData.stats || {
          totalCourses: 10,
          enrolledCourses: enrollmentsData.enrollments?.length || 0,
          completedCourses: enrollmentsData.stats?.completedCourses || 0,
          totalLessons: 45,
          completedLessons: enrollmentsData.stats?.totalLessonsCompleted || 0,
          certificates: enrollmentsData.stats?.certificatesEarned || 0,
          currentStreak: enrollmentsData.stats?.currentStreak || 0,
          totalTimeSpent: enrollmentsData.stats?.totalTimeSpent || 0,
          averageScore: enrollmentsData.stats?.averageScore || 0,
          achievements: enrollmentsData.stats?.achievementsUnlocked || 0
        },
        progress: progressData.progress || {
          courses: enrollmentsData.enrollments || [],
          overallStats: enrollmentsData.stats || {
            totalLessonsCompleted: 0,
            totalTimeSpent: 0,
            currentStreak: 0,
            longestStreak: 0,
            averageScore: 0
          },
          achievements: []
        },
        enrollments: enrollmentsData.enrollments || []
      });

      // Generate recent activity based on actual enrollments
      const recentActivities = [];

      if (enrollmentsData.enrollments && enrollmentsData.enrollments.length > 0) {
        enrollmentsData.enrollments.slice(0, 4).forEach((enrollment, index) => {
          const course = enrollment.course;
          const daysAgo = index + 1;

          recentActivities.push({
            id: index + 1,
            type: 'course_enroll',
            title: `Enrolled in: ${course.title}`,
            time: `${daysAgo} day${daysAgo > 1 ? 's' : ''} ago`,
            icon: <School className="w-5 h-5 text-blue-500" />
          });

          // Add lesson completion activities for enrolled courses
          if (enrollment.detailedProgress?.lessonsCompleted > 0) {
            recentActivities.push({
              id: index + 100,
              type: 'lesson_complete',
              title: `Completed lessons in: ${course.title}`,
              time: `${daysAgo} day${daysAgo > 1 ? 's' : ''} ago`,
              icon: <CheckCircle className="w-5 h-5 text-green-500" />
            });
          }
        });
      }

      // Add some default activities if no real data
      if (recentActivities.length === 0) {
        recentActivities.push(
          {
            id: 1,
            type: 'welcome',
            title: 'Welcome to Ethiopian Heritage Learning!',
            time: 'Today',
            icon: <School className="w-5 h-5 text-primary" />
          },
          {
            id: 2,
            type: 'info',
            title: 'Start by enrolling in your first course',
            time: 'Now',
            icon: <BookOpen className="w-5 h-5 text-blue-500" />
          }
        );
      }

      setRecentActivity(recentActivities.slice(0, 4));

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set fallback data
      setDashboardData({
        stats: {
          totalCourses: 10,
          enrolledCourses: 0,
          completedCourses: 0,
          totalLessons: 45,
          completedLessons: 0,
          certificates: 0,
          currentStreak: 0,
          totalTimeSpent: 0,
          averageScore: 0,
          achievements: 0
        },
        progress: {
          courses: [],
          overallStats: {
            totalLessonsCompleted: 0,
            totalTimeSpent: 0,
            currentStreak: 0,
            longestStreak: 0,
            averageScore: 0
          },
          achievements: []
        },
        enrollments: []
      });
    } finally {
      setLoading(false);
    }
  };

  // Mock data for charts
  const chartData = [
    { name: 'Week 1', completed: 2, total: 5 },
    { name: 'Week 2', completed: 4, total: 7 },
    { name: 'Week 3', completed: 6, total: 10 },
    { name: 'Week 4', completed: 8, total: 12 },
    { name: 'Week 5', completed: 12, total: 15 }
  ];

  const categoryData = [
    { name: 'History', value: 40, color: '#8884d8' },
    { name: 'Culture', value: 30, color: '#82ca9d' },
    { name: 'Art', value: 20, color: '#ffc658' },
    { name: 'Language', value: 10, color: '#ff7c7c' }
  ];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="bg-card border border-border rounded-lg p-6 space-y-4">
              <div className="h-6 bg-muted rounded w-1/2 animate-pulse"></div>
              <div className="h-8 bg-muted rounded w-3/4 animate-pulse"></div>
              <div className="h-12 bg-muted rounded w-full animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          My Learning Dashboard
        </h1>
        <p className="text-muted-foreground">
          Track your progress in Ethiopian heritage studies
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-4xl font-bold text-primary mb-1">
                {dashboardData?.stats.enrolledCourses || 0}
              </p>
              <p className="text-muted-foreground text-sm font-medium">
                Enrolled Courses
              </p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
              <School className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-4xl font-bold text-green-500 mb-1">
                {dashboardData?.stats.completedLessons || 0}
              </p>
              <p className="text-muted-foreground text-sm font-medium">
                Lessons Completed
              </p>
            </div>
            <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center text-green-500">
              <BookOpen className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-4xl font-bold text-yellow-500 mb-1">
                {dashboardData?.stats.currentStreak || 0}
              </p>
              <p className="text-muted-foreground text-sm font-medium">
                Day Streak
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-500/10 rounded-full flex items-center justify-center text-yellow-500">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-4xl font-bold text-blue-500 mb-1">
                {dashboardData?.stats.certificates || 0}
              </p>
              <p className="text-muted-foreground text-sm font-medium">
                Certificates
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-500">
              <Award className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          {/* Current Courses */}
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Continue Learning
            </h2>
            <div className="space-y-4">
              {dashboardData?.enrollments?.length > 0 ? (
                dashboardData.enrollments.slice(0, 3).map((enrollment, index) => {
                  const course = enrollment.course;
                  const progress = enrollment.progress || 0;
                  const detailedProgress = enrollment.detailedProgress;

                  return (
                    <div key={course._id || index} className="border border-border rounded-lg p-4 bg-background">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold text-foreground">{course.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${enrollment.status === 'completed'
                            ? 'bg-green-500/10 text-green-500'
                            : 'bg-primary/10 text-primary'
                          }`}>
                          {Math.round(progress)}%
                        </span>
                      </div>

                      <div className="w-full bg-secondary rounded-full h-2 mb-3">
                        <div
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>

                      <div className="flex justify-between items-center mb-3 text-sm text-muted-foreground">
                        <span>{detailedProgress?.lessonsCompleted || 0} of {course.totalLessons || 'N/A'} lessons completed</span>
                        <span>{course.difficulty} • {course.category}</span>
                      </div>

                      {detailedProgress?.totalTimeSpent > 0 && (
                        <div className="text-xs text-muted-foreground mb-3">
                          Time spent: {Math.round(detailedProgress.totalTimeSpent / 60)} hours
                          {detailedProgress.averageScore > 0 && ` • Average score: ${detailedProgress.averageScore}%`}
                        </div>
                      )}

                      <div className="flex gap-2">
                        <button
                          onClick={() => alert(`Continue learning: ${course.title}\n\nCourse functionality coming soon!`)}
                          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-primary border border-primary rounded-md hover:bg-primary/5 transition-colors"
                        >
                          <PlayCircle className="w-4 h-4" />
                          Continue Learning
                        </button>
                        <button
                          onClick={() => alert(`Course Details: ${course.title}\n\nDescription: ${course.description || 'N/A'}\n\nInstructor: ${course.instructor || 'N/A'}`)}
                          className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="bg-blue-500/10 border border-blue-500/20 text-blue-600 p-4 rounded-lg flex gap-2 items-start">
                  <div className="mt-0.5">ℹ️</div>
                  <div>
                    No enrolled courses yet. <Link to="/education-hub/courses" className="underline font-medium hover:text-blue-800">Browse courses</Link> to get started!
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Progress Chart */}
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Learning Progress
            </h2>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      borderColor: 'hsl(var(--border))',
                      color: 'hsl(var(--popover-foreground))',
                      borderRadius: '8px'
                    }}
                  />
                  <Line type="monotone" dataKey="completed" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Recent Activity */}
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Recent Activity
            </h2>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex gap-3">
                  <div className="mt-1 flex-shrink-0">
                    {activity.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Recent Achievements
            </h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {dashboardData?.progress.achievements?.length > 0 ? (
                dashboardData.progress.achievements.slice(0, 6).map((achievement, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20"
                  >
                    <Trophy className="w-3 h-3" />
                    {achievement.achievementId}
                  </span>
                ))
              ) : (
                <>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/20">
                    <Trophy className="w-3 h-3" />
                    First Steps
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                    <Trophy className="w-3 h-3" />
                    Dedicated Learner
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-500 border border-blue-500/20">
                    <Trophy className="w-3 h-3" />
                    History Explorer
                  </span>
                </>
              )}
            </div>
            <Link
              to="/learning/achievements"
              className="text-sm font-medium text-primary hover:underline"
            >
              View All Achievements
            </Link>
          </div>

          {/* Learning Stats */}
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Study Categories
            </h2>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                    labelLine={false}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      borderColor: 'hsl(var(--border))',
                      color: 'hsl(var(--popover-foreground))',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 flex flex-wrap justify-center gap-3">
                {categoryData.map((entry, index) => (
                  <div key={index} className="flex items-center gap-1.5 text-xs">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
                    <span className="text-muted-foreground">{entry.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-card border border-border rounded-lg p-6 shadow-sm mt-8">
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            to="/education-hub/courses"
            className="flex flex-col items-center justify-center p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors group"
          >
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary group-hover:scale-110 transition-transform mb-3">
              <School className="w-5 h-5" />
            </div>
            <span className="font-medium text-foreground">Browse Courses</span>
          </Link>

          <Link
            to="/learning/assignments"
            className="flex flex-col items-center justify-center p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors group"
          >
            <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center text-green-500 group-hover:scale-110 transition-transform mb-3">
              <FileText className="w-5 h-5" />
            </div>
            <span className="font-medium text-foreground">View Assignments</span>
          </Link>

          <Link
            to="/learning/certificates"
            className="flex flex-col items-center justify-center p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors group"
          >
            <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform mb-3">
              <Award className="w-5 h-5" />
            </div>
            <span className="font-medium text-foreground">My Certificates</span>
          </Link>

          <Link
            to="/learning/progress"
            className="flex flex-col items-center justify-center p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors group"
          >
            <div className="w-10 h-10 bg-yellow-500/10 rounded-full flex items-center justify-center text-yellow-500 group-hover:scale-110 transition-transform mb-3">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="font-medium text-foreground">Progress Report</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
