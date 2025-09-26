import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../utils/api';
import MuseumAdminSidebar from '../components/dashboard/MuseumAdminSidebar';
import {
  Box, Typography, Container, Grid, Paper,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, IconButton, Chip, CircularProgress, Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArtTrack as ArtTrackIcon,
  EventAvailable as EventAvailableIcon,
  Storage as StorageIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';

const MuseumDashboard = () => {
  const [dashboardStats, setDashboardStats] = useState({
    totalArtifacts: 0,
    artifactsInStorage: 0,
    activeRentals: 0,
    monthlyVisitors: 0,
    pendingRentals: 0,
    totalEvents: 0,
    upcomingEvents: 0,
    totalStaff: 0,
    totalRevenue: 0
  });
  const [recentArtifacts, setRecentArtifacts] = useState([]);
  const [pendingTasks, setPendingTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        console.log('=== LOADING DASHBOARD DATA ===');

        // Load dashboard data with individual error handling
        const promises = [
          api.getMuseumDashboard().catch(error => {
            console.warn('Dashboard stats failed, using default values:', error);
            return {
              data: {
                totalArtifacts: 0,
                artifactsInStorage: 0,
                activeRentals: 0,
                monthlyVisitors: 0,
                pendingRentals: 0,
                totalEvents: 0,
                upcomingEvents: 0,
                totalStaff: 0,
                totalRevenue: 0
              }
            };
          }),
          api.getRecentArtifacts().catch(error => {
            console.warn('Recent artifacts failed, using empty array:', error);
            return { data: [] };
          }),
          api.getPendingTasks().catch(error => {
            console.warn('Pending tasks failed, using empty array:', error);
            return { data: [] };
          })
        ];

        const [statsResponse, artifactsResponse, tasksResponse] = await Promise.all(promises);

        console.log('Stats response:', statsResponse);
        console.log('Artifacts response:', artifactsResponse);
        console.log('Tasks response:', tasksResponse);

        // Update state with data (or default values if API failed)
        if (statsResponse.data) {
          // Handle the dashboard response structure
          const dashboardData = statsResponse.data.dashboard || statsResponse.data;
          if (dashboardData.quickStats) {
            setDashboardStats({
              totalArtifacts: dashboardData.quickStats.totalArtifacts || 0,
              artifactsInStorage: dashboardData.quickStats.publishedArtifacts || 0,
              activeRentals: dashboardData.quickStats.activeRentals || 0,
              monthlyVisitors: dashboardData.quickStats.thisMonthVisitors || 0,
              pendingRentals: dashboardData.quickStats.pendingRentals || 0,
              totalEvents: 0, // Not implemented yet
              upcomingEvents: 0, // Not implemented yet
              totalStaff: 0, // Not implemented yet
              totalRevenue: dashboardData.quickStats.totalRevenue || 0
            });
          }
        }

        if (artifactsResponse.data) {
          // Handle artifacts response structure
          const artifactsData = artifactsResponse.data.artifacts || artifactsResponse.data.data || artifactsResponse.data;
          setRecentArtifacts(Array.isArray(artifactsData) ? artifactsData : []);
        }

        if (tasksResponse.data) {
          // Handle tasks response structure
          const tasksData = tasksResponse.data.tasks || tasksResponse.data.data || tasksResponse.data;
          setPendingTasks(Array.isArray(tasksData) ? tasksData : []);
        }

        // Clear any previous errors since we're showing data (even if default)
        setError(null);

      } catch (error) {
        console.error('Critical error loading dashboard data:', error);
        // Only set error if it's a critical failure
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (user && user.role === 'museumAdmin') {
      loadDashboardData();
    }
  }, [user]);

  // Redirect if not authenticated or not a museum admin
  useEffect(() => {
    if (!user || user.role !== 'museumAdmin') {
      navigate('/auth');
    }
  }, [user, navigate]);

  if (!user) {
    return <div>Loading...</div>;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen" style={{ backgroundColor: 'white' }}>
        <MuseumAdminSidebar />
        <div
          className="flex-1 flex items-center justify-center"
          onWheel={(e) => {
            // Only allow scrolling when mouse is over the main content
            e.stopPropagation();
          }}
        >
          <CircularProgress size={60} sx={{ color: '#8B5A3C' }} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen" style={{ backgroundColor: 'white' }}>
        <MuseumAdminSidebar />
        <div
          className="flex-1 p-8"
          onWheel={(e) => {
            // Only allow scrolling when mouse is over the main content
            e.stopPropagation();
          }}
        >
          <Alert severity="error">{error}</Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: 'white' }}>
      <MuseumAdminSidebar />

      <div
        className="flex-1 overflow-auto"
        onWheel={(e) => {
          // Only allow scrolling when mouse is over the main content
          e.stopPropagation();
        }}
      >
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
          {/* Welcome Header */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" component="h1" sx={{ mb: 1 }}>
              Welcome back, {user?.name || 'Museum Admin'}!
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {user?.museumName || 'Your Museum'} Dashboard Overview
            </Typography>
          </Box>

          {/* Quick Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', backgroundColor: '#8B5A3C', color: 'white' }}>
                <ArtTrackIcon sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography color="inherit" variant="body2">Total Artifacts</Typography>
                  <Typography variant="h4" color="inherit">{dashboardStats.totalArtifacts}</Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>In Collection</Typography>
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', backgroundColor: '#8B5A3C', color: 'white' }}>
                <EventAvailableIcon sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography color="inherit" variant="body2">Active Rentals</Typography>
                  <Typography variant="h4" color="inherit">{dashboardStats.activeRentals}</Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>Current Bookings</Typography>
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', backgroundColor: '#8B5A3C', color: 'white' }}>
                <StorageIcon sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography color="inherit" variant="body2">In Storage</Typography>
                  <Typography variant="h4" color="inherit">{dashboardStats.artifactsInStorage}</Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>Available Items</Typography>
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', backgroundColor: '#8B5A3C', color: 'white' }}>
                <TrendingUpIcon sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography color="inherit" variant="body2">Monthly Visitors</Typography>
                  <Typography variant="h4" color="inherit">{dashboardStats.monthlyVisitors}</Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>Not implemented yet</Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>

          {/* Recent Activity and Quick Actions */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Recent Artifacts</Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Last Updated</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recentArtifacts.length > 0 ? (
                        recentArtifacts.slice(0, 5).map((artifact) => (
                          <TableRow key={artifact.id}>
                            <TableCell>{artifact.name}</TableCell>
                            <TableCell>
                              <Chip
                                label={artifact.status.replace('_', ' ')}
                                sx={{
                                  backgroundColor: artifact.status === 'on_display' ? '#8B5A3C' : '#8B5A3C',
                                  color: 'white',
                                  '&:hover': {
                                    backgroundColor: '#8B5A3C'
                                  }
                                }}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              {new Date(artifact.lastUpdated).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <IconButton
                                size="small"
                                sx={{ color: '#8B5A3C', '&:hover': { backgroundColor: 'white' } }}
                                onClick={() => navigate('/museum-dashboard/artifacts')}
                              >
                                <EditIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} sx={{ textAlign: 'center', py: 4 }}>
                            <Typography variant="body2" sx={{ color: '#8B5A3C' }}>
                              No artifacts found
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/museum-dashboard/artifacts')}
                    sx={{ borderColor: '#8B5A3C', color: '#8B5A3C', '&:hover': { borderColor: '#8B5A3C', backgroundColor: 'white' } }}
                  >
                    View All Artifacts
                  </Button>
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Quick Actions</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    fullWidth
                    onClick={() => navigate('/museum-dashboard/artifacts/new')}
                    sx={{ backgroundColor: '#8B5A3C', color: 'white', '&:hover': { backgroundColor: '#8B5A3C' } }}
                  >
                    Add New Artifact
                  </Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => navigate('/museum-dashboard/virtual-museum/create')}
                    sx={{ borderColor: '#8B5A3C', color: '#8B5A3C', '&:hover': { borderColor: '#8B5A3C', backgroundColor: 'white' } }}
                  >
                    Create Exhibition
                  </Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => navigate('/museum-dashboard/events/new')}
                    sx={{ borderColor: '#8B5A3C', color: '#8B5A3C', '&:hover': { borderColor: '#8B5A3C', backgroundColor: 'white' } }}
                  >
                    Schedule Event
                  </Button>
                </Box>
              </Paper>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Pending Tasks</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {pendingTasks.length > 0 ? (
                    pendingTasks.slice(0, 5).map((task, index) => (
                      <Typography
                        key={task.id}
                        variant="body2"
                        sx={{
                          color: '#8B5A3C',
                          cursor: 'pointer',
                          '&:hover': { textDecoration: 'underline' }
                        }}
                        onClick={() => task.actionUrl && navigate(task.actionUrl)}
                      >
                        • {task.title}
                      </Typography>
                    ))
                  ) : (
                    <Typography variant="body2" sx={{ color: '#8B5A3C' }}>
                      No pending tasks
                    </Typography>
                  )}
                </Box>
              </Paper>
            </Grid>
          </Grid>







        </Container>
      </div>
    </div>
  );
};

export default MuseumDashboard;