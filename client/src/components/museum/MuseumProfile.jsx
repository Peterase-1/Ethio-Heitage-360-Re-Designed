import React, { useState } from 'react';
import { 
  Box, Typography, Container, Grid, Paper, TextField, Button,
  Avatar, FormControl, InputLabel, Select, MenuItem, Chip
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
  DollarSign
} from 'lucide-react';

const MuseumProfile = () => {
  const [profileData, setProfileData] = useState({
    name: 'National Museum of Ethiopia',
    description: 'The National Museum of Ethiopia is a national museum in Addis Ababa, Ethiopia. It is most famous for hosting Lucy, a hominid found in the Awash Valley.',
    location: 'King George VI Street, Addis Ababa, Ethiopia',
    phone: '+251-11-155-7102',
    email: 'info@nationalmuseumethiopia.org',
    website: 'www.nationalmuseumethiopia.org',
    openingHours: '9:00 AM - 6:00 PM',
    admissionFee: 50,
    capacity: 500,
    founded: '1958',
    languages: ['English', 'Amharic', 'Oromo'],
    facilities: ['Gift Shop', 'Parking', 'Guided Tours', 'Wheelchair Access', 'Audio Guides']
  });

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log('Saving profile data:', profileData);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
          <Building2 className="mr-3" size={32} />
          Museum Profile Management
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Manage your museum's comprehensive information and public profile
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Basic Information */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 4, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
              <Building2 className="mr-2" size={20} />
              Basic Information
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Museum Name"
                  value={profileData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Museum Description"
                  value={profileData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  multiline
                  rows={4}
                  margin="normal"
                  helperText="Provide a compelling description of your museum's mission and collections"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Founded Year"
                  value={profileData.founded}
                  onChange={(e) => handleInputChange('founded', e.target.value)}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Visitor Capacity"
                  type="number"
                  value={profileData.capacity}
                  onChange={(e) => handleInputChange('capacity', e.target.value)}
                  margin="normal"
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Contact Information */}
          <Paper sx={{ p: 4, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
              <Phone className="mr-2" size={20} />
              Contact Information
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Location Address"
                  value={profileData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  margin="normal"
                  InputProps={{
                    startAdornment: <MapPin className="mr-2 text-gray-400" size={16} />
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={profileData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  margin="normal"
                  InputProps={{
                    startAdornment: <Phone className="mr-2 text-gray-400" size={16} />
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email Address"
                  value={profileData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  margin="normal"
                  InputProps={{
                    startAdornment: <Mail className="mr-2 text-gray-400" size={16} />
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Website"
                  value={profileData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  margin="normal"
                  InputProps={{
                    startAdornment: <Globe className="mr-2 text-gray-400" size={16} />
                  }}
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Operating Information */}
          <Paper sx={{ p: 4 }}>
            <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
              <Clock className="mr-2" size={20} />
              Operating Information
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Opening Hours"
                  value={profileData.openingHours}
                  onChange={(e) => handleInputChange('openingHours', e.target.value)}
                  margin="normal"
                  helperText="e.g., 9:00 AM - 6:00 PM"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Admission Fee (ETB)"
                  type="number"
                  value={profileData.admissionFee}
                  onChange={(e) => handleInputChange('admissionFee', e.target.value)}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ mb: 2 }}>Supported Languages</Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {profileData.languages.map((language, index) => (
                    <Chip key={index} label={language} variant="outlined" />
                  ))}
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ mb: 2 }}>Available Facilities</Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {profileData.facilities.map((facility, index) => (
                    <Chip key={index} label={facility} color="primary" variant="outlined" />
                  ))}
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Museum Logo and Images */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 4, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
              <Camera className="mr-2" size={20} />
              Museum Logo
            </Typography>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Avatar
                sx={{
                  width: 150,
                  height: 150,
                  mx: 'auto',
                  mb: 2,
                  bgcolor: 'primary.main'
                }}
              >
                <Building2 size={60} />
              </Avatar>
              <Button variant="outlined" component="label" fullWidth>
                Upload Logo
                <input type="file" hidden accept="image/*" />
              </Button>
            </Box>
          </Paper>

          <Paper sx={{ p: 4, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>Quick Stats</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">Total Visitors</Typography>
                <Typography variant="h6">12,450</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">Monthly Growth</Typography>
                <Typography variant="h6" color="success.main">+15%</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">Rating</Typography>
                <Typography variant="h6">4.7/5.0</Typography>
              </Box>
            </Box>
          </Paper>

          <Paper sx={{ p: 4 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>Profile Completion</Typography>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Completion</Typography>
                <Typography variant="body2">85%</Typography>
              </Box>
              <Box sx={{ width: '100%', bgcolor: 'grey.200', borderRadius: 1 }}>
                <Box
                  sx={{
                    width: '85%',
                    height: 8,
                    bgcolor: 'primary.main',
                    borderRadius: 1
                  }}
                />
              </Box>
            </Box>
            <Typography variant="caption" color="text.secondary">
              Complete your profile to improve visibility and user experience
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Save Button */}
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Button
          variant="contained"
          size="large"
          onClick={handleSave}
          sx={{ minWidth: 200 }}
        >
          Save Changes
        </Button>
      </Box>
    </Container>
  );
};

export default MuseumProfile;
