import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import MuseumAdminSidebar from '../components/dashboard/MuseumAdminSidebar';
import {
  Box, Typography, Container, Grid, Paper,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, IconButton, Chip
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

// Mock data - Replace with API calls
const mockArtifacts = [
  { id: 1, name: 'Ancient Vase', status: 'on_display', lastUpdated: '2025-08-01' },
  { id: 2, name: 'Historical Painting', status: 'in_storage', lastUpdated: '2025-08-05' },
  { id: 3, name: 'Sculpture', status: 'on_display', lastUpdated: '2025-08-07' },
];

const mockRentalRequests = [
  { id: 1, artifact: 'Ancient Vase', requester: 'Exhibition Co.', status: 'pending', date: '2025-08-10' },
  { id: 2, artifact: 'Historical Painting', requester: 'University', status: 'approved', date: '2025-08-15' },
];

const MuseumDashboard = () => {
  const [artifacts, setArtifacts] = useState(mockArtifacts);
  const [rentalRequests, setRentalRequests] = useState(mockRentalRequests);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect if not authenticated or not a museum admin
  useEffect(() => {
    if (!user || user.role !== 'museumAdmin') {
      navigate('/auth');
    }
  }, [user, navigate]);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <MuseumAdminSidebar />
      
      <div className="flex-1 overflow-auto">
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
              <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', background: 'linear-gradient(135deg, #8B5A3C 0%, #A67C5A 100%)', color: 'white' }}>
                <ArtTrackIcon sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography color="inherit" variant="body2">Total Artifacts</Typography>
                  <Typography variant="h4" color="inherit">{artifacts.length}</Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>In Collection</Typography>
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', background: 'linear-gradient(135deg, #A67C5A 0%, #8B5A3C 100%)', color: 'white' }}>
                <EventAvailableIcon sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography color="inherit" variant="body2">Active Rentals</Typography>
                  <Typography variant="h4" color="inherit">
                    {rentalRequests.filter(r => r.status === 'approved').length}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>Current Bookings</Typography>
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', background: 'linear-gradient(135deg, #92775A 0%, #8B5A3C 100%)', color: 'white' }}>
                <StorageIcon sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography color="inherit" variant="body2">In Storage</Typography>
                  <Typography variant="h4" color="inherit">
                    {artifacts.filter(a => a.status === 'in_storage').length}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>Available Items</Typography>
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', background: 'linear-gradient(135deg, #A67C5A 0%, #D2B48C 100%)', color: 'white' }}>
                <TrendingUpIcon sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography color="inherit" variant="body2">Monthly Visitors</Typography>
                  <Typography variant="h4" color="inherit">1,245</Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>+15% Growth</Typography>
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
                      {artifacts.slice(0, 5).map((artifact) => (
                        <TableRow key={artifact.id}>
                          <TableCell>{artifact.name}</TableCell>
                          <TableCell>
                            <Chip
                              label={artifact.status.replace('_', ' ')}
                              sx={{
                                backgroundColor: artifact.status === 'on_display' ? '#8B5A3C' : '#A67C5A',
                                color: 'white',
                                '&:hover': {
                                  backgroundColor: artifact.status === 'on_display' ? '#A67C5A' : '#8B5A3C'
                                }
                              }}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{artifact.lastUpdated}</TableCell>
                          <TableCell>
                          <IconButton size="small" sx={{ color: '#8B5A3C', '&:hover': { backgroundColor: '#F5F5DC' } }}>
                              <EditIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <Button 
                    variant="outlined" 
                    onClick={() => navigate('/museum-dashboard/artifacts')}
                    sx={{ borderColor: '#8B5A3C', color: '#8B5A3C', '&:hover': { borderColor: '#A67C5A', backgroundColor: '#F5F5DC' } }}
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
                    sx={{ backgroundColor: '#8B5A3C', '&:hover': { backgroundColor: '#A67C5A' } }}
                  >
                    Add New Artifact
                  </Button>
                  <Button 
                    variant="outlined" 
                    fullWidth
                    onClick={() => navigate('/museum-dashboard/virtual-museum/create')}
                    sx={{ borderColor: '#8B5A3C', color: '#8B5A3C', '&:hover': { borderColor: '#A67C5A', backgroundColor: '#F5F5DC' } }}
                  >
                    Create Exhibition
                  </Button>
                  <Button 
                    variant="outlined" 
                    fullWidth
                    onClick={() => navigate('/museum-dashboard/events/new')}
                    sx={{ borderColor: '#8B5A3C', color: '#8B5A3C', '&:hover': { borderColor: '#A67C5A', backgroundColor: '#F5F5DC' } }}
                  >
                    Schedule Event
                  </Button>
                </Box>
              </Paper>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Pending Tasks</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography variant="body2" sx={{ color: '#A67C5A' }}>• 3 Rental requests awaiting approval</Typography>
                  <Typography variant="body2" sx={{ color: '#8B5A3C' }}>• 2 Virtual museum submissions in review</Typography>
                  <Typography variant="body2" sx={{ color: '#92775A' }}>• 1 New staff member to onboard</Typography>
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