import React, { useState, useEffect } from 'react';
import MuseumAdminSidebar from '../dashboard/MuseumAdminSidebar';
import {
  Box, Typography, Container, Grid, Paper, TextField, Button,
  Avatar, FormControl, InputLabel, Select, MenuItem, Chip,
  Snackbar, Alert, CircularProgress, Card, CardContent, CardActions,
  Divider, IconButton, Tooltip
} from '@mui/material';
import {
  Building2,
  Camera,
  MapPin,
  Clock,
  Mail,
  Phone,
  Globe,
  Users,
  Calendar,
  DollarSign,
  Edit,
  Save,
  X,
  Upload,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import api from '../../utils/api';
import museumStatsService from '../../services/museumStatsService';

const MuseumProfile = () => {
  const [profileData, setProfileData] = useState({
    name: '',
    description: '',
    location: '',
    phone: '',
    email: '',
    website: '',
    openingHours: '',
    admissionFee: 0,
    logo: '',
    images: [],
    features: [],
    loading: false,
    error: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [stats, setStats] = useState({
    totalArtifacts: 0,
    totalStaff: 0,
    totalEvents: 0,
    activeRentals: 0,
    loading: true
  });

  // Load museum profile data and statistics
  useEffect(() => {
    const loadMuseumData = async () => {
      try {
        setLoading(true);

        // Load profile data and statistics in parallel
        const [profileResponse, statsResponse] = await Promise.all([
          api.getMuseumProfile(),
          museumStatsService.getMuseumStats()
        ]);

        // Set profile data
        if (profileResponse.data) {
          const museumData = profileResponse.data.museum || profileResponse.data;
          setProfileData({
            ...profileData,
            ...museumData,
            loading: false,
            error: ''
          });
        }

        // Set statistics
        if (statsResponse.data) {
          setStats({
            totalArtifacts: statsResponse.data.totalArtifacts || 0,
            totalStaff: statsResponse.data.totalStaff || 0,
            totalEvents: statsResponse.data.totalEvents || 0,
            activeRentals: statsResponse.data.activeRentals || 0,
            loading: false
          });
        } else {
          // Set default values if no data
          setStats({
            totalArtifacts: 0,
            totalStaff: 0,
            totalEvents: 0,
            activeRentals: 0,
            loading: false
          });
        }
      } catch (error) {
        console.error('Failed to load museum data:', error);
        setProfileData(prev => ({
          ...prev,
          loading: false,
          error: error.message || 'Failed to load museum profile'
        }));
        // Set default statistics values on error
        setStats({
          totalArtifacts: 0,
          totalStaff: 0,
          totalEvents: 0,
          activeRentals: 0,
          loading: false
        });
      } finally {
        setLoading(false);
      }
    };

    loadMuseumData();
  }, []);

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.updateMuseumProfile(profileData);
      setIsEditing(false);
      setSnackbar({
        open: true,
        message: 'Museum profile updated successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Failed to save museum profile:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Failed to save museum profile',
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reload original data
    window.location.reload();
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen" style={{ backgroundColor: 'white' }}>
        <MuseumAdminSidebar />
        <div
          className="flex-1 flex items-center justify-center"
          onWheel={(e) => {
            e.stopPropagation();
          }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress size={60} sx={{ color: '#8B5A3C', mb: 2 }} />
            <Typography variant="h6" sx={{ color: 'black' }}>
              Loading museum profile...
            </Typography>
          </Box>
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
          e.stopPropagation();
        }}
      >
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" component="h1" sx={{ mb: 1, display: 'flex', alignItems: 'center', color: 'black' }}>
              <Building2 className="mr-3" size={32} style={{ color: '#8B5A3C' }} />
              Museum Profile Management
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Manage your museum's comprehensive information and public profile
            </Typography>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ mb: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            {!isEditing ? (
              <Button
                variant="contained"
                startIcon={<Edit size={16} />}
                onClick={() => setIsEditing(true)}
                sx={{
                  backgroundColor: '#8B5A3C',
                  color: 'white',
                  '&:hover': { backgroundColor: '#8B5A3C' }
                }}
              >
                Edit Profile
              </Button>
            ) : (
              <>
                <Button
                  variant="outlined"
                  startIcon={<X size={16} />}
                  onClick={handleCancel}
                  sx={{
                    borderColor: '#8B5A3C',
                    color: '#8B5A3C',
                    '&:hover': { borderColor: '#8B5A3C', backgroundColor: 'white' }
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  startIcon={saving ? <CircularProgress size={16} /> : <Save size={16} />}
                  onClick={handleSave}
                  disabled={saving}
                  sx={{
                    backgroundColor: '#8B5A3C',
                    color: 'white',
                    '&:hover': { backgroundColor: '#8B5A3C' }
                  }}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </>
            )}
          </Box>

          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12} lg={8}>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Building2 size={20} style={{ color: '#8B5A3C', marginRight: '8px' }} />
                  <Typography variant="h6" sx={{ color: 'black' }}>
                    Basic Information
                  </Typography>
                </Box>

                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    {isEditing ? (
                      <TextField
                        fullWidth
                        label="Museum Name"
                        value={profileData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        variant="outlined"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&.Mui-focused fieldset': {
                              borderColor: '#8B5A3C',
                            },
                          },
                          '& .MuiInputLabel-root.Mui-focused': {
                            color: '#8B5A3C',
                          },
                        }}
                      />
                    ) : (
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Museum Name
                        </Typography>
                        <Typography variant="body1" sx={{ color: 'black' }}>
                          {profileData.name || 'Not specified'}
                        </Typography>
                      </Box>
                    )}
                  </Grid>

                  <Grid item xs={12}>
                    {isEditing ? (
                      <TextField
                        fullWidth
                        label="Museum Description"
                        value={profileData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        multiline
                        rows={4}
                        variant="outlined"
                        helperText="Provide a compelling description of your museum's mission and collections"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&.Mui-focused fieldset': {
                              borderColor: '#8B5A3C',
                            },
                          },
                          '& .MuiInputLabel-root.Mui-focused': {
                            color: '#8B5A3C',
                          },
                        }}
                      />
                    ) : (
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Description
                        </Typography>
                        <Typography variant="body1" sx={{ color: 'black' }}>
                          {profileData.description || 'No description provided'}
                        </Typography>
                      </Box>
                    )}
                  </Grid>
                </Grid>
              </Paper>

              {/* Contact Information */}
              <Paper sx={{ p: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Phone size={20} style={{ color: '#8B5A3C', marginRight: '8px' }} />
                  <Typography variant="h6" sx={{ color: 'black' }}>
                    Contact Information
                  </Typography>
                </Box>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    {isEditing ? (
                      <TextField
                        fullWidth
                        label="Phone Number"
                        value={profileData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        variant="outlined"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&.Mui-focused fieldset': {
                              borderColor: '#8B5A3C',
                            },
                          },
                          '& .MuiInputLabel-root.Mui-focused': {
                            color: '#8B5A3C',
                          },
                        }}
                      />
                    ) : (
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Phone Number
                        </Typography>
                        <Typography variant="body1" sx={{ color: 'black' }}>
                          {profileData.phone || 'Not specified'}
                        </Typography>
                      </Box>
                    )}
                  </Grid>

                  <Grid item xs={12} md={6}>
                    {isEditing ? (
                      <TextField
                        fullWidth
                        label="Email Address"
                        value={profileData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        type="email"
                        variant="outlined"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&.Mui-focused fieldset': {
                              borderColor: '#8B5A3C',
                            },
                          },
                          '& .MuiInputLabel-root.Mui-focused': {
                            color: '#8B5A3C',
                          },
                        }}
                      />
                    ) : (
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Email Address
                        </Typography>
                        <Typography variant="body1" sx={{ color: 'black' }}>
                          {profileData.email || 'Not specified'}
                        </Typography>
                      </Box>
                    )}
                  </Grid>

                  <Grid item xs={12}>
                    {isEditing ? (
                      <TextField
                        fullWidth
                        label="Website"
                        value={profileData.website}
                        onChange={(e) => handleInputChange('website', e.target.value)}
                        variant="outlined"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&.Mui-focused fieldset': {
                              borderColor: '#8B5A3C',
                            },
                          },
                          '& .MuiInputLabel-root.Mui-focused': {
                            color: '#8B5A3C',
                          },
                        }}
                      />
                    ) : (
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Website
                        </Typography>
                        <Typography variant="body1" sx={{ color: 'black' }}>
                          {profileData.website || 'Not specified'}
                        </Typography>
                      </Box>
                    )}
                  </Grid>
                </Grid>
              </Paper>

              {/* Location & Hours */}
              <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <MapPin size={20} style={{ color: '#8B5A3C', marginRight: '8px' }} />
                  <Typography variant="h6" sx={{ color: 'black' }}>
                    Location & Hours
                  </Typography>
                </Box>

                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    {isEditing ? (
                      <TextField
                        fullWidth
                        label="Address"
                        value={profileData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        multiline
                        rows={2}
                        variant="outlined"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&.Mui-focused fieldset': {
                              borderColor: '#8B5A3C',
                            },
                          },
                          '& .MuiInputLabel-root.Mui-focused': {
                            color: '#8B5A3C',
                          },
                        }}
                      />
                    ) : (
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Address
                        </Typography>
                        <Typography variant="body1" sx={{ color: 'black' }}>
                          {profileData.location || 'Not specified'}
                        </Typography>
                      </Box>
                    )}
                  </Grid>

                  <Grid item xs={12} md={6}>
                    {isEditing ? (
                      <TextField
                        fullWidth
                        label="Opening Hours"
                        value={profileData.openingHours}
                        onChange={(e) => handleInputChange('openingHours', e.target.value)}
                        variant="outlined"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&.Mui-focused fieldset': {
                              borderColor: '#8B5A3C',
                            },
                          },
                          '& .MuiInputLabel-root.Mui-focused': {
                            color: '#8B5A3C',
                          },
                        }}
                      />
                    ) : (
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Opening Hours
                        </Typography>
                        <Typography variant="body1" sx={{ color: 'black' }}>
                          {profileData.openingHours || 'Not specified'}
                        </Typography>
                      </Box>
                    )}
                  </Grid>

                  <Grid item xs={12} md={6}>
                    {isEditing ? (
                      <TextField
                        fullWidth
                        label="Admission Fee"
                        value={profileData.admissionFee}
                        onChange={(e) => handleInputChange('admissionFee', e.target.value)}
                        type="number"
                        variant="outlined"
                        InputProps={{
                          startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&.Mui-focused fieldset': {
                              borderColor: '#8B5A3C',
                            },
                          },
                          '& .MuiInputLabel-root.Mui-focused': {
                            color: '#8B5A3C',
                          },
                        }}
                      />
                    ) : (
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Admission Fee
                        </Typography>
                        <Typography variant="body1" sx={{ color: 'black' }}>
                          {profileData.admissionFee ? formatCurrency(profileData.admissionFee) : 'Free admission'}
                        </Typography>
                      </Box>
                    )}
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Museum Logo & Images */}
            <Grid item xs={12} lg={4}>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Camera size={20} style={{ color: '#8B5A3C', marginRight: '8px' }} />
                  <Typography variant="h6" sx={{ color: 'black' }}>
                    Museum Logo
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Avatar
                    src={profileData.logo}
                    sx={{
                      width: 120,
                      height: 120,
                      mb: 2,
                      border: '2px solid #8B5A3C'
                    }}
                  >
                    <Building2 size={40} style={{ color: '#8B5A3C' }} />
                  </Avatar>

                  {isEditing && (
                    <Button
                      variant="outlined"
                      startIcon={<Upload size={16} />}
                      sx={{
                        borderColor: '#8B5A3C',
                        color: '#8B5A3C',
                        '&:hover': { borderColor: '#8B5A3C', backgroundColor: 'white' }
                      }}
                    >
                      Upload Logo
                    </Button>
                  )}
                </Box>
              </Paper>

              {/* Museum Stats */}
              <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Users size={20} style={{ color: '#8B5A3C', marginRight: '8px' }} />
                  <Typography variant="h6" sx={{ color: 'black' }}>
                    Museum Statistics
                  </Typography>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#f8f9fa', borderRadius: 2 }}>
                      <Typography variant="h4" sx={{ color: '#8B5A3C', fontWeight: 'bold' }}>
                        {stats.loading ? (
                          <CircularProgress size={24} sx={{ color: '#8B5A3C' }} />
                        ) : (
                          stats.totalArtifacts
                        )}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Artifacts
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#f8f9fa', borderRadius: 2 }}>
                      <Typography variant="h4" sx={{ color: '#8B5A3C', fontWeight: 'bold' }}>
                        {stats.loading ? (
                          <CircularProgress size={24} sx={{ color: '#8B5A3C' }} />
                        ) : (
                          stats.totalStaff
                        )}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Staff
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#f8f9fa', borderRadius: 2 }}>
                      <Typography variant="h4" sx={{ color: '#8B5A3C', fontWeight: 'bold' }}>
                        {stats.loading ? (
                          <CircularProgress size={24} sx={{ color: '#8B5A3C' }} />
                        ) : (
                          stats.totalEvents
                        )}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Events
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#f8f9fa', borderRadius: 2 }}>
                      <Typography variant="h4" sx={{ color: '#8B5A3C', fontWeight: 'bold' }}>
                        {stats.loading ? (
                          <CircularProgress size={24} sx={{ color: '#8B5A3C' }} />
                        ) : (
                          stats.activeRentals
                        )}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Active Rentals
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>

          {/* Snackbar for notifications */}
          <Snackbar
            open={snackbar.open}
            autoHideDuration={6000}
            onClose={handleCloseSnackbar}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          >
            <Alert
              onClose={handleCloseSnackbar}
              severity={snackbar.severity}
              sx={{ width: '100%' }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Container>
      </div>
    </div>
  );
};

export default MuseumProfile;