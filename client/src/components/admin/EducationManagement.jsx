import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Tabs,
  Tab,
  IconButton,
  Chip,
  useTheme,
  alpha,
  TextField,
  InputAdornment,
  Paper
} from '@mui/material';
import {
  School,
  Tour,
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Book,
  TrendingUp,
  People
} from '@mui/icons-material';
import CourseManagement from './CourseManagement';
import EducationalTours from './EducationalTours';
import SuperAdminProgressManagement from './SuperAdminProgressManagement';
import api from '../../utils/api';

const EducationManagement = ({ initialTab = 0 }) => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(initialTab);

  // Sync tab state when prop changes
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const [stats, setStats] = useState({
    totalCourses: 0,
    totalTours: 0,
    totalStudents: 0,
    activeEnrollments: 0
  });

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Fetch basic stats (mock or real)
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // In a real scenario, we'd have a specific endpoint for this. 
        // For now, we can fetch course count + tour count if available, or just mock.
        // Using placeholder for visual impact immediately.
        const response = await api.getEducationStats();
        if (response && response.success && response.stats) {
          setStats({
            totalCourses: response.stats.courses?.total || 0,
            totalTours: response.stats.tours?.total || 0,
            totalStudents: response.stats.users?.total || 0,
            activeEnrollments: response.stats.enrollments?.total || 0
          });
        }
      } catch (e) {
        console.error("Failed to fetch education stats", e);
      }
    };
    fetchStats();
  }, []);

  const StatCard = ({ title, value, icon, color }) => (
    <Card sx={{
      height: '100%',
      background: `linear-gradient(135deg, ${alpha(color, 0.1)} 0%, ${alpha(color, 0.05)} 100%)`,
      backdropFilter: 'blur(10px)',
      border: `1px solid ${alpha(color, 0.2)}`,
      boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
    }}>
      <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
        <Box sx={{
          p: 1.5,
          borderRadius: '12px',
          bgcolor: alpha(color, 0.1),
          color: color,
          mr: 2.5
        }}>
          {icon}
        </Box>
        <Box>
          <Typography variant="body2" color="textSecondary" fontWeight="500">
            {title}
          </Typography>
          <Typography variant="h4" fontWeight="700" sx={{ color: theme.palette.text.primary }}>
            {value}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: 0, width: '100%' }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 1, color: theme.palette.primary.main }}>
          Education Hub
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Manage courses, educational tours, and student progress from a central dashboard.
        </Typography>
      </Box>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Courses"
            value={stats.totalCourses}
            icon={<Book fontSize="large" />}
            color={theme.palette.primary.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Content"
            value={stats.totalTours}
            icon={<Tour fontSize="large" />}
            color={theme.palette.secondary.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Students"
            value={stats.totalStudents}
            icon={<People fontSize="large" />}
            color="#10B981"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Enrollments"
            value={stats.activeEnrollments}
            icon={<TrendingUp fontSize="large" />}
            color="#F59E0B"
          />
        </Grid>
      </Grid>

      {/* Main Content Area */}
      <Paper sx={{
        borderRadius: 3,
        overflow: 'hidden',
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
      }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2, bgcolor: theme.palette.background.paper }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '1rem',
                minHeight: 64,
              }
            }}
          >
            <Tab icon={<School sx={{ mr: 1 }} />} iconPosition="start" label="Courses" />
            <Tab icon={<Tour sx={{ mr: 1 }} />} iconPosition="start" label="Educational Tours" />
            <Tab icon={<People sx={{ mr: 1 }} />} iconPosition="start" label="Student Management" />
          </Tabs>
        </Box>

        <Box sx={{ p: 3 }}>
          {activeTab === 0 && (
            <CourseManagementWrapper />
          )}
          {activeTab === 1 && (
            <EducationalTours />
          )}
          {activeTab === 2 && (
            <SuperAdminProgressManagement />
          )}
        </Box>
      </Paper>
    </Box>
  );
};

// Wrapper for CourseManagement to inject any specific props or styles if needed without modifying the original too much yet.
const CourseManagementWrapper = () => {
  return (
    <React.Fragment>
      <CourseManagement />
    </React.Fragment>
  );
};

export default EducationManagement;
