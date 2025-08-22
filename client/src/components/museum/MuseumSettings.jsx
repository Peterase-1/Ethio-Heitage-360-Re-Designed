import React, { useState } from 'react';
import MuseumAdminSidebar from '../dashboard/MuseumAdminSidebar';
import { 
  Box, Typography, Container, Grid, Paper, Button, TextField,
  FormControl, InputLabel, Select, MenuItem, Switch, FormControlLabel
} from '@mui/material';
import {
  Settings,
  Bell,
  Shield,
  Database
} from 'lucide-react';

const MuseumSettings = () => {
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      sms: false,
      push: true
    },
    security: {
      twoFactor: false,
      sessionTimeout: 30
    },
    general: {
      language: 'en',
      timezone: 'Africa/Addis_Ababa',
      theme: 'light'
    }
  });

  return (
    <div className="flex min-h-screen bg-gray-50">
      <MuseumAdminSidebar />
      
      <div className="flex-1 overflow-auto">
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" component="h1" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
              <Settings className="mr-3" size={32} />
              Settings
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Configure your museum dashboard preferences and security settings
            </Typography>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <Bell className="mr-2" size={20} />
                  Notification Preferences
                </Typography>
                <FormControlLabel
                  control={<Switch checked={settings.notifications.email} />}
                  label="Email Notifications"
                  sx={{ display: 'block', mb: 2 }}
                />
                <FormControlLabel
                  control={<Switch checked={settings.notifications.sms} />}
                  label="SMS Alerts"
                  sx={{ display: 'block', mb: 2 }}
                />
                <FormControlLabel
                  control={<Switch checked={settings.notifications.push} />}
                  label="Push Notifications"
                  sx={{ display: 'block', mb: 2 }}
                />
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <Shield className="mr-2" size={20} />
                  Security Settings
                </Typography>
                <FormControlLabel
                  control={<Switch checked={settings.security.twoFactor} />}
                  label="Two-Factor Authentication"
                  sx={{ display: 'block', mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Session Timeout (minutes)"
                  type="number"
                  value={settings.security.sessionTimeout}
                  sx={{ mb: 2 }}
                />
                <Button variant="outlined" fullWidth>
                  Change Password
                </Button>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <Database className="mr-2" size={20} />
                  General Settings
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                      <InputLabel>Language</InputLabel>
                      <Select value={settings.general.language} label="Language">
                        <MenuItem value="en">English</MenuItem>
                        <MenuItem value="am">Amharic</MenuItem>
                        <MenuItem value="or">Oromo</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                      <InputLabel>Timezone</InputLabel>
                      <Select value={settings.general.timezone} label="Timezone">
                        <MenuItem value="Africa/Addis_Ababa">Africa/Addis Ababa</MenuItem>
                        <MenuItem value="UTC">UTC</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                      <InputLabel>Theme</InputLabel>
                      <Select value={settings.general.theme} label="Theme">
                        <MenuItem value="light">Light</MenuItem>
                        <MenuItem value="dark">Dark</MenuItem>
                        <MenuItem value="auto">Auto</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Button variant="contained" size="large">
              Save All Settings
            </Button>
          </Box>
        </Container>
      </div>
    </div>
  );
};

export default MuseumSettings;
