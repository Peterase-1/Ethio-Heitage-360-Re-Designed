import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  LinearProgress,
  Avatar,
  Chip,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Badge,
  Alert,
  Skeleton
} from '@mui/material';
import {
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  EmojiEvents as TrophyIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  Book as BookIcon,
  Certificate as CertificateIcon,
  Notifications as NotificationIcon,
  PlayArrow as PlayIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';
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
            icon: <SchoolIcon color="info" />
          });
          
          // Add lesson completion activities for enrolled courses
          if (enrollment.detailedProgress?.lessonsCompleted > 0) {
            recentActivities.push({
              id: index + 100,
              type: 'lesson_complete',
              title: `Completed lessons in: ${course.title}`,
              time: `${daysAgo} day${daysAgo > 1 ? 's' : ''} ago`,
              icon: <CheckIcon color="success" />
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
            icon: <SchoolIcon color="primary" />
          },
          {
            id: 2,
            type: 'info',
            title: 'Start by enrolling in your first course',
            time: 'Now',
            icon: <BookIcon color="info" />
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
  const progressData = [
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
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Grid container spacing={3}>
          {[...Array(8)].map((_, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card>
                <CardContent>
                  <Skeleton variant="text" height={30} />
                  <Skeleton variant="text" height={40} />
                  <Skeleton variant="rectangular" height={60} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          My Learning Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Track your progress in Ethiopian heritage studies
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" color="primary">
                    {dashboardData?.stats.enrolledCourses || 0}
                  </Typography>
                  <Typography color="text.secondary">
                    Enrolled Courses
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <SchoolIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" color="success.main">
                    {dashboardData?.stats.completedLessons || 0}
                  </Typography>
                  <Typography color="text.secondary">
                    Lessons Completed
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <BookIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" color="warning.main">
                    {dashboardData?.stats.currentStreak || 0}
                  </Typography>
                  <Typography color="text.secondary">
                    Day Streak
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <TrendingUpIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" color="info.main">
                    {dashboardData?.stats.certificates || 0}
                  </Typography>
                  <Typography color="text.secondary">
                    Certificates
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'info.main' }}>
                  <CertificateIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Current Courses */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Continue Learning
              </Typography>
              <Box sx={{ mb: 3 }}>
                {dashboardData?.enrollments?.length > 0 ? (
                  dashboardData.enrollments.slice(0, 3).map((enrollment, index) => {
                    const course = enrollment.course;
                    const progress = enrollment.progress || 0;
                    const detailedProgress = enrollment.detailedProgress;
                    
                    return (
                      <Box key={course._id || index} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="subtitle1">
                            {course.title}
                          </Typography>
                          <Chip 
                            label={`${Math.round(progress)}%`}
                            color={enrollment.status === 'completed' ? 'success' : 'primary'}
                            size="small"
                          />
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={progress}
                          sx={{ mb: 1, height: 8, borderRadius: 4 }}
                        />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            {detailedProgress?.lessonsCompleted || 0} of {course.totalLessons || 'N/A'} lessons completed
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {course.difficulty} • {course.category}
                          </Typography>
                        </Box>
                        {detailedProgress?.totalTimeSpent > 0 && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                            Time spent: {Math.round(detailedProgress.totalTimeSpent / 60)} hours
                            {detailedProgress.averageScore > 0 && ` • Average score: ${detailedProgress.averageScore}%`}
                          </Typography>
                        )}
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button 
                            size="small" 
                            variant="outlined"
                            color="primary"
                            startIcon={<PlayIcon />}
                            onClick={() => alert(`Continue learning: ${course.title}\n\nCourse functionality coming soon!`)}
                          >
                            Continue Learning
                          </Button>
                          <Button 
                            size="small" 
                            variant="text"
                            onClick={() => alert(`Course Details: ${course.title}\n\nDescription: ${course.description || 'N/A'}\n\nInstructor: ${course.instructor || 'N/A'}`)}
                          >
                            View Details
                          </Button>
                        </Box>
                      </Box>
                    );
                  })
                ) : (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    No enrolled courses yet. <Link to="/courses" style={{ textDecoration: 'none' }}>Browse courses</Link> to get started!
                  </Alert>
                )}
              </Box>
            </CardContent>
          </Card>

          {/* Progress Chart */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Learning Progress
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={progressData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="completed" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Recent Activity */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              <List>
                {recentActivity.map((activity) => (
                  <ListItem key={activity.id} sx={{ px: 0 }}>
                    <ListItemAvatar>
                      {activity.icon}
                    </ListItemAvatar>
                    <ListItemText
                      primary={activity.title}
                      secondary={activity.time}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Achievements
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {dashboardData?.progress.achievements?.length > 0 ? (
                  dashboardData.progress.achievements.slice(0, 6).map((achievement, index) => (
                    <Chip
                      key={index}
                      label={achievement.achievementId}
                      color="primary"
                      variant="outlined"
                      size="small"
                      icon={<TrophyIcon />}
                    />
                  ))
                ) : (
                  <>
                    <Chip label="First Steps" color="success" size="small" icon={<TrophyIcon />} />
                    <Chip label="Dedicated Learner" color="warning" size="small" icon={<TrophyIcon />} />
                    <Chip label="History Explorer" color="info" size="small" icon={<TrophyIcon />} />
                  </>
                )}
              </Box>
              <Button
                component={Link}
                to="/learning/achievements"
                size="small"
                sx={{ mt: 2 }}
              >
                View All Achievements
              </Button>
            </CardContent>
          </Card>

          {/* Learning Stats */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Study Categories
              </Typography>
              <Box sx={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      outerRadius={60}
                      fill="#8884d8"
                      dataKey="value"
                      label={(entry) => entry.name}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Paper sx={{ p: 3, mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              component={Link}
              to="/learning/courses"
              variant="outlined"
              fullWidth
              startIcon={<SchoolIcon />}
            >
              Browse Courses
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              component={Link}
              to="/learning/assignments"
              variant="outlined"
              fullWidth
              startIcon={<AssignmentIcon />}
            >
              View Assignments
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              component={Link}
              to="/learning/certificates"
              variant="outlined"
              fullWidth
              startIcon={<CertificateIcon />}
            >
              My Certificates
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              component={Link}
              to="/learning/progress"
              variant="outlined"
              fullWidth
              startIcon={<TrendingUpIcon />}
            >
              Progress Report
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default StudentDashboard;
