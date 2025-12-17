import React, { useState } from 'react';
import {
  Box, Button, Card, CardContent, CardHeader, Divider, Grid, TextField, Typography,
  Paper, FormControl, InputLabel, Select, MenuItem, Snackbar, Alert, Tabs, Tab,
  Avatar, IconButton, List, ListItem, ListItemText, ListItemAvatar, Switch,
  Checkbox, Chip, CardMedia, CardActionArea, Tooltip, Breadcrumbs, Link
} from '@mui/material';
import {
  Save as SaveIcon, Edit as EditIcon, PhotoCamera as PhotoCameraIcon,
  Person as PersonIcon, Lock as LockIcon, Notifications as NotificationsIcon
} from '@mui/icons-material';

const MuseumSettings = () => {
  const [tabValue, setTabValue] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Ethiopian Heritage Museum data
  const [museum, setMuseum] = useState({
    name: 'Ethiopian Heritage Museum',
    description: 'Preserving and showcasing the rich cultural heritage of Ethiopia, from ancient Axum to modern times. Our collection includes precious artifacts, religious manuscripts, and royal regalia that tell the story of Ethiopia\'s 3,000-year history.',
    logo: 'https://i.ibb.co/5KJXyZf/ethiopian-museum-logo.png',
    type: 'National Heritage Museum',
    category: 'Ethiopian History & Culture',
    contact: {
      email: 'info@ethioheritagemuseum.et',
      phone: '+251 11 123 4567',
      address: 'Addis Ababa, Ethiopia',
      website: 'www.ethioheritagemuseum.et',
      socialMedia: {
        facebook: 'ethioheritagemuseum',
        twitter: 'ethioheritage',
        instagram: 'ethioheritagemuseum'
      }
    },
    hours: {
      weekdays: '9:00 AM - 5:00 PM',
      weekends: '10:00 AM - 6:00 PM',
      closed: 'Mondays and public holidays'
    },
    admission: {
      adults: '200 ETB',
      students: '100 ETB',
      children: '50 ETB',
      groups: '150 ETB per person (10+ people)'
    },
    staff: [
      {
        id: 1,
        name: 'Dr. Yohannes Haile-Selassie',
        role: 'Director of Antiquities',
        email: 'director@ethioheritage.et',
        image: 'https://i.ibb.co/0Q8XJYH/director.jpg'
      },
      {
        id: 2,
        name: 'Aster Tsegaye',
        role: 'Head Curator',
        email: 'curator@ethioheritage.et',
        image: 'https://i.ibb.co/0Q8XJYH/curator.jpg'
      },
      {
        id: 3,
        name: 'Mekonnen Assefa',
        role: 'Conservation Specialist',
        email: 'conservation@ethioheritage.et',
        image: 'https://i.ibb.co/0Q8XJYH/conservation.jpg'
      }
    ],
    collections: [
      'Aksumite Civilization',
      'Lalibela Rock-Hewn Churches',
      'Ethiopian Orthodox Church Artifacts',
      'Imperial Regalia',
      'Traditional Ethiopian Art',
      'Archaeological Discoveries'
    ],
    notifications: {
      email: true,
      sms: false,
      push: true,
      exhibitionAlerts: true,
      eventReminders: true,
      newsletter: true
    },
    bannerImage: 'https://i.ibb.co/0Q8XJYH/museum-banner.jpg'
  });

  // Form state with Ethiopian heritage defaults
  const [formData, setFormData] = useState({ ...museum });

  // Ethiopian museum types for dropdown
  const museumTypes = [
    'National Heritage Museum',
    'Archaeological Museum',
    'Religious Heritage Site',
    'Ethnographic Museum',
    'Art Museum',
    'University Museum'
  ];

  // Ethiopian historical periods for reference
  const historicalPeriods = [
    'Pre-Aksumite (before 400 BC)',
    'Aksumite Kingdom (400 BC - 10th century)',
    'Zagwe Dynasty (900-1270)',
    'Solomonic Dynasty (1270-1974)',
    'Gondarine Period (1632-1769)',
    'Modern Ethiopia (1855-present)'
  ];

  // Handle tab change
  const handleTabChange = (event, newValue) => setTabValue(newValue);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle nested form changes
  const handleNestedChange = (parent, field, value) => {
    if (parent.includes('.')) {
      const [firstLevel, secondLevel] = parent.split('.');
      setFormData(prev => ({
        ...prev,
        [firstLevel]: {
          ...prev[firstLevel],
          [secondLevel]: {
            ...prev[firstLevel][secondLevel],
            [field]: value
          }
        }
      }));
    } else if (value === undefined && typeof field !== 'object') {
      // Handle case where field is actually the value (direct property update)
      setFormData(prev => ({
        ...prev,
        [parent]: field
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [field]: value }
      }));
    }
  };

  // Load settings from API
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await api.getMuseumSettings();
        if (response.success && response.data) {
          // Merge API data with defaults to ensure all fields exist
          const mergedData = { ...museum, ...response.data };
          setMuseum(mergedData);
          setFormData(mergedData);
        }
      } catch (error) {
        console.error('Error loading settings:', error);
        showSnackbar('Failed to load settings', 'error');
      }
    };
    loadSettings();
  }, []);

  // Save settings
  const saveSettings = async () => {
    try {
      const response = await api.updateMuseumSettings(formData);
      if (response.success) {
        setMuseum(formData);
        setIsEditing(false);
        showSnackbar('Settings saved successfully', 'success');
      } else {
        throw new Error(response.message || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      showSnackbar(error.message || 'Failed to save settings', 'error');
    }
  };

  // Show snackbar
  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  // Format staff member role with Ethiopian honorifics
  const formatStaffRole = (role, name) => {
    if (role.toLowerCase().includes('director') || role.toLowerCase().includes('head')) {
      return `Ato ${name.split(' ')[0]}, ${role}`;
    }
    return role;
  };

  return (
    <Card sx={{ background: 'linear-gradient(145deg, #f5f5f5 0%, #f0e6e6 100%)' }}>
      <CardHeader
        title="Museum Settings"
        action={
          isEditing ? (
            <Box display="flex" gap={1}>
              <Button
                variant="outlined"
                onClick={() => {
                  setFormData({ ...museum });
                  setIsEditing(false);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={saveSettings}
                startIcon={<SaveIcon />}
              >
                Save Changes
              </Button>
            </Box>
          ) : (
            <Button
              variant="contained"
              color="primary"
              onClick={() => setIsEditing(true)}
              startIcon={<EditIcon />}
            >
              Edit Profile
            </Button>
          )
        }
      />

      <Divider />

      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
      >
        <Tab label="Profile" icon={<PersonIcon />} />
        <Tab label="Team" icon={<PersonIcon />} />
        <Tab label="Notifications" icon={<NotificationsIcon />} />
        <Tab label="Security" icon={<LockIcon />} />
      </Tabs>

      <CardContent>
        {tabValue === 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Box mb={3} textAlign="center">
                <Box
                  component="img"
                  src={formData.logo}
                  alt="Ethiopian Heritage Museum Logo"
                  sx={{
                    width: 150,
                    height: 150,
                    mx: 'auto',
                    mb: 2,
                    borderRadius: '8px',
                    border: '2px solid #e0e0e0',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                  }}
                />
                {isEditing && (
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<PhotoCameraIcon />}
                    fullWidth
                  >
                    Change Logo
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setFormData(prev => ({ ...prev, logo: reader.result }));
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </Button>
                )}
              </Box>

              <Box mb={3}>
                <Typography variant="subtitle2" gutterBottom>Museum Type</Typography>
                <FormControl fullWidth size="small" disabled={!isEditing}>
                  <Select
                    value={formData.type}
                    onChange={(e) => handleNestedChange('type', e.target.value)}
                    displayEmpty
                  >
                    {museumTypes.map((type) => (
                      <MenuItem key={type} value={type}>{type}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Box mb={3}>
                <Typography variant="subtitle2" gutterBottom>Historical Periods</Typography>
                <FormControl fullWidth size="small" disabled={!isEditing}>
                  <Select
                    multiple
                    value={formData.collections || []}
                    onChange={(e) => handleNestedChange('collections', e.target.value)}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={value} size="small" />
                        ))}
                      </Box>
                    )}
                  >
                    {historicalPeriods.map((period) => (
                      <MenuItem key={period} value={period}>
                        <Checkbox checked={formData.collections?.includes(period)} />
                        <ListItemText primary={period} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Grid>

            <Grid item xs={12} md={8}>
              <Box mb={3}>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
                    {formData.name}
                  </Typography>
                  {isEditing && (
                    <TextField
                      fullWidth
                      value={formData.name}
                      onChange={(e) => handleNestedChange('name', e.target.value)}
                      size="small"
                      sx={{ display: 'none' }} // Hidden but accessible for form submission
                    />
                  )}
                </Box>
                <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
                  <Link color="inherit" href="/">
                    Home
                  </Link>
                  <Link color="inherit" href="/museums">
                    Museums
                  </Link>
                  <Typography color="text.primary">{formData.name}</Typography>
                </Breadcrumbs>
              </Box>

              <Box mb={3}>
                <Typography variant="subtitle2" gutterBottom>Description</Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  value={formData.description}
                  onChange={(e) => handleNestedChange('description', e.target.value)}
                  disabled={!isEditing}
                />
              </Box>

              <Box>
                <Typography variant="h6" gutterBottom>Contact Information</Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>Address</Typography>
                    <TextField
                      fullWidth
                      value={formData.contact.address}
                      onChange={(e) => handleNestedChange('contact', 'address', e.target.value)}
                      disabled={!isEditing}
                      size="small"
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>Phone</Typography>
                    <TextField
                      fullWidth
                      value={formData.contact.phone}
                      onChange={(e) => handleNestedChange('contact', 'phone', e.target.value)}
                      disabled={!isEditing}
                      size="small"
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>Email</Typography>
                    <TextField
                      fullWidth
                      type="email"
                      value={formData.contact.email}
                      onChange={(e) => handleNestedChange('contact', 'email', e.target.value)}
                      disabled={!isEditing}
                      size="small"
                    />
                  </Grid>
                </Grid>
              </Box>
            </Grid>
          </Grid>
        )}

        {tabValue === 1 && (
          <Box>
            <Typography variant="h5" gutterBottom sx={{ mb: 3, color: '#2E7D32', borderBottom: '2px solid #2E7D32', pb: 1, display: 'inline-block' }}>
              Our Dedicated Team
            </Typography>

            <Grid container spacing={3}>
              {formData.staff.map((member) => (
                <Grid item xs={12} sm={6} md={4} key={member.id}>
                  <Card elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardActionArea>
                      <CardMedia
                        component="img"
                        height="200"
                        image={member.image}
                        alt={member.name}
                        sx={{ objectFit: 'cover' }}
                      />
                      <CardContent>
                        <Typography gutterBottom variant="h6" component="div">
                          {member.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontStyle: 'italic' }}>
                          {formatStaffRole(member.role, member.name)}
                        </Typography>
                        <Typography variant="body2" color="primary">
                          {member.email}
                        </Typography>
                        {isEditing && (
                          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                            <Tooltip title="Edit">
                              <IconButton size="small" sx={{ mr: 1 }}>
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Remove">
                              <IconButton size="small" color="error">
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        )}
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}

              {isEditing && (
                <Grid item xs={12} sm={6} md={4}>
                  <Card
                    sx={{
                      height: '100%',
                      minHeight: 300,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px dashed #9e9e9e',
                      '&:hover': {
                        borderColor: '#1976d2',
                        backgroundColor: 'rgba(25, 118, 210, 0.04)'
                      },
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <Button
                      startIcon={<AddIcon />}
                      sx={{ textTransform: 'none' }}
                    >
                      Add Team Member
                    </Button>
                  </Card>
                </Grid>
              )}
            </Grid>

            {isEditing && (
              <Box mt={2}>
                <Button variant="outlined" startIcon={<AddIcon />}>
                  Add Team Member
                </Button>
              </Box>
            )}
          </Box>
        )}

        {tabValue === 2 && (
          <Box>
            <Typography variant="h6" gutterBottom>Notification Preferences</Typography>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.notifications.email}
                    onChange={(e) => {
                      handleNestedChange('notifications', 'email', e.target.checked);
                    }}
                    disabled={!isEditing}
                  />
                }
                label="Email Notifications"
                sx={{ display: 'block', mb: 2 }}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={formData.notifications.sms}
                    onChange={(e) => {
                      handleNestedChange('notifications', 'sms', e.target.checked);
                    }}
                    disabled={!isEditing}
                  />
                }
                label="SMS Notifications"
                sx={{ display: 'block', mb: 2 }}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={formData.notifications.push}
                    onChange={(e) => {
                      handleNestedChange('notifications', 'push', e.target.checked);
                    }}
                    disabled={!isEditing}
                  />
                }
                label="Push Notifications"
              />
            </Paper>
          </Box>
        )}

        {tabValue === 3 && (
          <Box>
            <Typography variant="h6" gutterBottom>Security Settings</Typography>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>Two-Factor Authentication</Typography>
              <Button variant="outlined" disabled={!isEditing}>
                Enable 2FA
              </Button>

              <Box mt={3}>
                <Typography variant="subtitle1" gutterBottom>Active Sessions</Typography>
                <Typography variant="body2" color="textSecondary">
                  Current session: {new Date().toLocaleString()}
                </Typography>
                <Button
                  variant="text"
                  color="primary"
                  size="small"
                  disabled={!isEditing}
                  sx={{ mt: 1 }}
                >
                  Sign out all other sessions
                </Button>
              </Box>
            </Paper>
          </Box>
        )}
      </CardContent>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Card>
  );
};

export default MuseumSettings;
