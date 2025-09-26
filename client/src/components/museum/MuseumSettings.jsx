import React, { useState, useEffect } from 'react';
import MuseumAdminSidebar from '../dashboard/MuseumAdminSidebar';
import {
  Box, Typography, Container, Grid, Paper, Button, TextField,
  FormControl, InputLabel, Select, MenuItem, Switch, FormControlLabel,
  Card, CardContent, CardActions, Divider, Alert, Snackbar,
  CircularProgress, Tabs, Tab, Chip, Avatar, List, ListItem,
  ListItemText, ListItemIcon, ListItemSecondaryAction, Dialog,
  DialogTitle, DialogContent, DialogActions, IconButton, Tooltip
} from '@mui/material';
import {
  Settings,
  Bell,
  Shield,
  Database,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  Key,
  Lock,
  Globe,
  Clock,
  Palette,
  Mail,
  Smartphone,
  Monitor,
  CheckCircle,
  AlertCircle,
  X,
  User,
  Trash2,
  Plus,
  Edit
} from 'lucide-react';
import settingsService from '../../services/settingsService';

const MuseumSettings = () => {
  // State management
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Settings data
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      sms: false,
      push: true,
      eventReminders: true,
      staffUpdates: true,
      systemAlerts: true
    },
    security: {
      twoFactor: false,
      sessionTimeout: 30,
      passwordExpiry: 90,
      loginAttempts: 5,
      ipWhitelist: []
    },
    general: {
      language: 'en',
      timezone: 'Africa/Addis_Ababa',
      theme: 'light',
      dateFormat: 'MM/DD/YYYY',
      currency: 'USD'
    },
    museum: {
      autoBackup: true,
      backupFrequency: 'daily',
      dataRetention: 365,
      analyticsEnabled: true,
      publicProfile: true
    }
  });

  // Dialog states
  const [passwordDialog, setPasswordDialog] = useState(false);
  const [ipDialog, setIpDialog] = useState(false);
  const [newPassword, setNewPassword] = useState({ current: '', new: '', confirm: '' });
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
  const [newIp, setNewIp] = useState('');

  // Load settings on component mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await settingsService.getSettings();
      if (response.data) {
        setSettings(response.data);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load settings',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      await settingsService.updateSettings('general', settings.general);
      await settingsService.updateSettings('notifications', settings.notifications);
      await settingsService.updateSettings('security', settings.security);
      await settingsService.updateSettings('museum', settings.museum);

      setSnackbar({
        open: true,
        message: 'Settings saved successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Failed to save settings:', error);
      setSnackbar({
        open: true,
        message: 'Failed to save settings',
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSettingChange = (category, setting, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value
      }
    }));
  };

  const handlePasswordChange = async () => {
    try {
      if (newPassword.new !== newPassword.confirm) {
        setSnackbar({
          open: true,
          message: 'New passwords do not match',
          severity: 'error'
        });
        return;
      }

      await settingsService.changePassword(
        newPassword.current,
        newPassword.new
      );

      setPasswordDialog(false);
      setNewPassword({ current: '', new: '', confirm: '' });
      setSnackbar({
        open: true,
        message: 'Password changed successfully!',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to change password',
        severity: 'error'
      });
    }
  };

  const addIpAddress = async () => {
    try {
      if (newIp && !settings.security.ipWhitelist.find(item => item.ip === newIp)) {
        await settingsService.addToWhitelist(newIp, '');

        // Update local state
        const updatedWhitelist = [...settings.security.ipWhitelist, { ip: newIp, description: '', addedAt: new Date() }];
        handleSettingChange('security', 'ipWhitelist', updatedWhitelist);

        setNewIp('');
        setIpDialog(false);

        setSnackbar({
          open: true,
          message: 'IP address added successfully!',
          severity: 'success'
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to add IP address',
        severity: 'error'
      });
    }
  };

  const removeIpAddress = async (ip) => {
    try {
      await settingsService.removeFromWhitelist(ip);

      // Update local state
      handleSettingChange('security', 'ipWhitelist',
        settings.security.ipWhitelist.filter(item => item.ip !== ip)
      );

      setSnackbar({
        open: true,
        message: 'IP address removed successfully!',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to remove IP address',
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  if (loading) {
    return (
      <div className="flex min-h-screen" style={{ backgroundColor: 'white' }}>
        <MuseumAdminSidebar />
        <div
          className="flex-1 flex items-center justify-center"
          onWheel={(e) => { e.stopPropagation(); }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress size={60} sx={{ color: '#8B5A3C', mb: 2 }} />
            <Typography variant="h6" sx={{ color: 'black' }}>
              Loading settings...
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
        onWheel={(e) => { e.stopPropagation(); }}
      >
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" component="h1" sx={{ mb: 1, display: 'flex', alignItems: 'center', color: 'black' }}>
              <Settings className="mr-3" size={32} style={{ color: '#8B5A3C' }} />
              Museum Settings
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Configure your museum dashboard preferences, security, and system settings
            </Typography>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button
              variant="outlined"
              startIcon={<RefreshCw size={16} />}
              onClick={loadSettings}
              sx={{
                borderColor: '#8B5A3C',
                color: '#8B5A3C',
                '&:hover': { borderColor: '#8B5A3C', backgroundColor: 'white' }
              }}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={saving ? <CircularProgress size={16} /> : <Save size={16} />}
              onClick={saveSettings}
              disabled={saving}
              sx={{
                backgroundColor: '#8B5A3C',
                color: 'white',
                '&:hover': { backgroundColor: '#8B5A3C' }
              }}
            >
              {saving ? 'Saving...' : 'Save All Settings'}
            </Button>
          </Box>

          {/* Settings Tabs */}
          <Paper sx={{ mb: 3 }}>
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              sx={{
                '& .MuiTab-root': {
                  color: 'black',
                  '&.Mui-selected': {
                    color: '#8B5A3C'
                  }
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: '#8B5A3C'
                }
              }}
            >
              <Tab label="Notifications" icon={<Bell size={20} />} />
              <Tab label="Security" icon={<Shield size={20} />} />
              <Tab label="General" icon={<Globe size={20} />} />
              <Tab label="Museum" icon={<Database size={20} />} />
            </Tabs>
          </Paper>

          {/* Tab Content */}
          {activeTab === 0 && (
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Bell size={20} style={{ color: '#8B5A3C', marginRight: '8px' }} />
                <Typography variant="h6" sx={{ color: 'black' }}>
                  Notification Preferences
                </Typography>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 2 }}>
                    <CardContent>
                      <Typography variant="subtitle1" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                        <Mail size={16} style={{ color: '#8B5A3C', marginRight: '8px' }} />
                        Email Notifications
                      </Typography>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.notifications.email}
                            onChange={(e) => handleSettingChange('notifications', 'email', e.target.checked)}
                            sx={{
                              '& .MuiSwitch-switchBase.Mui-checked': {
                                color: '#8B5A3C',
                              },
                              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                backgroundColor: '#8B5A3C',
                              },
                            }}
                          />
                        }
                        label="Enable email notifications"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.notifications.eventReminders}
                            onChange={(e) => handleSettingChange('notifications', 'eventReminders', e.target.checked)}
                            sx={{
                              '& .MuiSwitch-switchBase.Mui-checked': {
                                color: '#8B5A3C',
                              },
                              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                backgroundColor: '#8B5A3C',
                              },
                            }}
                          />
                        }
                        label="Event reminders"
                        sx={{ display: 'block', mt: 1 }}
                      />
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 2 }}>
                    <CardContent>
                      <Typography variant="subtitle1" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                        <Smartphone size={16} style={{ color: '#8B5A3C', marginRight: '8px' }} />
                        Mobile Notifications
                      </Typography>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.notifications.sms}
                            onChange={(e) => handleSettingChange('notifications', 'sms', e.target.checked)}
                            sx={{
                              '& .MuiSwitch-switchBase.Mui-checked': {
                                color: '#8B5A3C',
                              },
                              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                backgroundColor: '#8B5A3C',
                              },
                            }}
                          />
                        }
                        label="SMS alerts"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.notifications.push}
                            onChange={(e) => handleSettingChange('notifications', 'push', e.target.checked)}
                            sx={{
                              '& .MuiSwitch-switchBase.Mui-checked': {
                                color: '#8B5A3C',
                              },
                              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                backgroundColor: '#8B5A3C',
                              },
                            }}
                          />
                        }
                        label="Push notifications"
                        sx={{ display: 'block', mt: 1 }}
                      />
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12}>
                  <Card sx={{ p: 2 }}>
                    <CardContent>
                      <Typography variant="subtitle1" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                        <Monitor size={16} style={{ color: '#8B5A3C', marginRight: '8px' }} />
                        System Notifications
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={settings.notifications.staffUpdates}
                                onChange={(e) => handleSettingChange('notifications', 'staffUpdates', e.target.checked)}
                                sx={{
                                  '& .MuiSwitch-switchBase.Mui-checked': {
                                    color: '#8B5A3C',
                                  },
                                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                    backgroundColor: '#8B5A3C',
                                  },
                                }}
                              />
                            }
                            label="Staff updates"
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={settings.notifications.systemAlerts}
                                onChange={(e) => handleSettingChange('notifications', 'systemAlerts', e.target.checked)}
                                sx={{
                                  '& .MuiSwitch-switchBase.Mui-checked': {
                                    color: '#8B5A3C',
                                  },
                                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                    backgroundColor: '#8B5A3C',
                                  },
                                }}
                              />
                            }
                            label="System alerts"
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Paper>
          )}

          {activeTab === 1 && (
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Shield size={20} style={{ color: '#8B5A3C', marginRight: '8px' }} />
                <Typography variant="h6" sx={{ color: 'black' }}>
                  Security Settings
                </Typography>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 2 }}>
                    <CardContent>
                      <Typography variant="subtitle1" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                        <Lock size={16} style={{ color: '#8B5A3C', marginRight: '8px' }} />
                        Authentication
                      </Typography>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.security.twoFactor}
                            onChange={(e) => handleSettingChange('security', 'twoFactor', e.target.checked)}
                            sx={{
                              '& .MuiSwitch-switchBase.Mui-checked': {
                                color: '#8B5A3C',
                              },
                              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                backgroundColor: '#8B5A3C',
                              },
                            }}
                          />
                        }
                        label="Two-factor authentication"
                        sx={{ mb: 2 }}
                      />
                      <Button
                        variant="outlined"
                        startIcon={<Key size={16} />}
                        onClick={() => setPasswordDialog(true)}
                        fullWidth
                        sx={{
                          borderColor: '#8B5A3C',
                          color: '#8B5A3C',
                          '&:hover': { borderColor: '#8B5A3C', backgroundColor: 'white' }
                        }}
                      >
                        Change Password
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 2 }}>
                    <CardContent>
                      <Typography variant="subtitle1" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                        <Clock size={16} style={{ color: '#8B5A3C', marginRight: '8px' }} />
                        Session Settings
                      </Typography>
                      <TextField
                        fullWidth
                        label="Session Timeout (minutes)"
                        type="number"
                        value={settings.security.sessionTimeout}
                        onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
                        sx={{ mb: 2 }}
                        inputProps={{
                          sx: {
                            '&.Mui-focused': {
                              borderColor: '#8B5A3C',
                            },
                          }
                        }}
                      />
                      <TextField
                        fullWidth
                        label="Password Expiry (days)"
                        type="number"
                        value={settings.security.passwordExpiry}
                        onChange={(e) => handleSettingChange('security', 'passwordExpiry', parseInt(e.target.value))}
                        sx={{ mb: 2 }}
                      />
                      <TextField
                        fullWidth
                        label="Max Login Attempts"
                        type="number"
                        value={settings.security.loginAttempts}
                        onChange={(e) => handleSettingChange('security', 'loginAttempts', parseInt(e.target.value))}
                      />
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12}>
                  <Card sx={{ p: 2 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center' }}>
                          <Monitor size={16} style={{ color: '#8B5A3C', marginRight: '8px' }} />
                          IP Whitelist
                        </Typography>
                        <Button
                          variant="outlined"
                          startIcon={<Plus size={16} />}
                          onClick={() => setIpDialog(true)}
                          size="small"
                          sx={{
                            borderColor: '#8B5A3C',
                            color: '#8B5A3C',
                            '&:hover': { borderColor: '#8B5A3C', backgroundColor: 'white' }
                          }}
                        >
                          Add IP
                        </Button>
                      </Box>

                      {settings.security.ipWhitelist.length > 0 ? (
                        <List>
                          {settings.security.ipWhitelist.map((ip, index) => (
                            <ListItem key={index}>
                              <ListItemIcon>
                                <Monitor size={16} style={{ color: '#8B5A3C' }} />
                              </ListItemIcon>
                              <ListItemText primary={ip} />
                              <ListItemSecondaryAction>
                                <IconButton
                                  edge="end"
                                  onClick={() => removeIpAddress(ip)}
                                  size="small"
                                >
                                  <Trash2 size={16} />
                                </IconButton>
                              </ListItemSecondaryAction>
                            </ListItem>
                          ))}
                        </List>
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                          No IP addresses whitelisted
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Paper>
          )}

          {activeTab === 2 && (
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Globe size={20} style={{ color: '#8B5A3C', marginRight: '8px' }} />
                <Typography variant="h6" sx={{ color: 'black' }}>
                  General Settings
                </Typography>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 2 }}>
                    <CardContent>
                      <Typography variant="subtitle1" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                        <Globe size={16} style={{ color: '#8B5A3C', marginRight: '8px' }} />
                        Localization
                      </Typography>
                      <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Language</InputLabel>
                        <Select
                          value={settings.general.language}
                          label="Language"
                          onChange={(e) => handleSettingChange('general', 'language', e.target.value)}
                        >
                          <MenuItem value="en">English</MenuItem>
                          <MenuItem value="am">Amharic</MenuItem>
                          <MenuItem value="or">Oromo</MenuItem>
                          <MenuItem value="ti">Tigrinya</MenuItem>
                        </Select>
                      </FormControl>
                      <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Timezone</InputLabel>
                        <Select
                          value={settings.general.timezone}
                          label="Timezone"
                          onChange={(e) => handleSettingChange('general', 'timezone', e.target.value)}
                        >
                          <MenuItem value="Africa/Addis_Ababa">Africa/Addis Ababa</MenuItem>
                          <MenuItem value="UTC">UTC</MenuItem>
                          <MenuItem value="Europe/London">Europe/London</MenuItem>
                          <MenuItem value="America/New_York">America/New York</MenuItem>
                        </Select>
                      </FormControl>
                      <FormControl fullWidth>
                        <InputLabel>Currency</InputLabel>
                        <Select
                          value={settings.general.currency}
                          label="Currency"
                          onChange={(e) => handleSettingChange('general', 'currency', e.target.value)}
                        >
                          <MenuItem value="USD">USD</MenuItem>
                          <MenuItem value="ETB">ETB</MenuItem>
                          <MenuItem value="EUR">EUR</MenuItem>
                          <MenuItem value="GBP">GBP</MenuItem>
                        </Select>
                      </FormControl>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 2 }}>
                    <CardContent>
                      <Typography variant="subtitle1" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                        <Palette size={16} style={{ color: '#8B5A3C', marginRight: '8px' }} />
                        Appearance
                      </Typography>
                      <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Theme</InputLabel>
                        <Select
                          value={settings.general.theme}
                          label="Theme"
                          onChange={(e) => handleSettingChange('general', 'theme', e.target.value)}
                        >
                          <MenuItem value="light">Light</MenuItem>
                          <MenuItem value="dark">Dark</MenuItem>
                          <MenuItem value="auto">Auto</MenuItem>
                        </Select>
                      </FormControl>
                      <FormControl fullWidth>
                        <InputLabel>Date Format</InputLabel>
                        <Select
                          value={settings.general.dateFormat}
                          label="Date Format"
                          onChange={(e) => handleSettingChange('general', 'dateFormat', e.target.value)}
                        >
                          <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                          <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                          <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                        </Select>
                      </FormControl>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Paper>
          )}

          {activeTab === 3 && (
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Database size={20} style={{ color: '#8B5A3C', marginRight: '8px' }} />
                <Typography variant="h6" sx={{ color: 'black' }}>
                  Museum System Settings
                </Typography>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 2 }}>
                    <CardContent>
                      <Typography variant="subtitle1" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                        <Database size={16} style={{ color: '#8B5A3C', marginRight: '8px' }} />
                        Data Management
                      </Typography>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.museum.autoBackup}
                            onChange={(e) => handleSettingChange('museum', 'autoBackup', e.target.checked)}
                            sx={{
                              '& .MuiSwitch-switchBase.Mui-checked': {
                                color: '#8B5A3C',
                              },
                              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                backgroundColor: '#8B5A3C',
                              },
                            }}
                          />
                        }
                        label="Automatic backup"
                        sx={{ mb: 2, display: 'block' }}
                      />
                      <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Backup Frequency</InputLabel>
                        <Select
                          value={settings.museum.backupFrequency}
                          label="Backup Frequency"
                          onChange={(e) => handleSettingChange('museum', 'backupFrequency', e.target.value)}
                        >
                          <MenuItem value="daily">Daily</MenuItem>
                          <MenuItem value="weekly">Weekly</MenuItem>
                          <MenuItem value="monthly">Monthly</MenuItem>
                        </Select>
                      </FormControl>
                      <TextField
                        fullWidth
                        label="Data Retention (days)"
                        type="number"
                        value={settings.museum.dataRetention}
                        onChange={(e) => handleSettingChange('museum', 'dataRetention', parseInt(e.target.value))}
                      />
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 2 }}>
                    <CardContent>
                      <Typography variant="subtitle1" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                        <Monitor size={16} style={{ color: '#8B5A3C', marginRight: '8px' }} />
                        Public Settings
                      </Typography>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.museum.analyticsEnabled}
                            onChange={(e) => handleSettingChange('museum', 'analyticsEnabled', e.target.checked)}
                            sx={{
                              '& .MuiSwitch-switchBase.Mui-checked': {
                                color: '#8B5A3C',
                              },
                              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                backgroundColor: '#8B5A3C',
                              },
                            }}
                          />
                        }
                        label="Enable analytics"
                        sx={{ mb: 2, display: 'block' }}
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.museum.publicProfile}
                            onChange={(e) => handleSettingChange('museum', 'publicProfile', e.target.checked)}
                            sx={{
                              '& .MuiSwitch-switchBase.Mui-checked': {
                                color: '#8B5A3C',
                              },
                              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                backgroundColor: '#8B5A3C',
                              },
                            }}
                          />
                        }
                        label="Public profile visible"
                        sx={{ display: 'block' }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Paper>
          )}

          {/* Password Change Dialog */}
          <Dialog open={passwordDialog} onClose={() => setPasswordDialog(false)} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ color: 'black' }}>Change Password</DialogTitle>
            <DialogContent>
              <TextField
                fullWidth
                label="Current Password"
                type={showPasswords.current ? "text" : "password"}
                value={newPassword.current}
                onChange={(e) => setNewPassword(prev => ({ ...prev, current: e.target.value }))}
                sx={{ mb: 2, mt: 1 }}
                InputProps={{
                  endAdornment: (
                    <IconButton onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}>
                      {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
                    </IconButton>
                  )
                }}
              />
              <TextField
                fullWidth
                label="New Password"
                type={showPasswords.new ? "text" : "password"}
                value={newPassword.new}
                onChange={(e) => setNewPassword(prev => ({ ...prev, new: e.target.value }))}
                sx={{ mb: 2 }}
                InputProps={{
                  endAdornment: (
                    <IconButton onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}>
                      {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
                    </IconButton>
                  )
                }}
              />
              <TextField
                fullWidth
                label="Confirm New Password"
                type={showPasswords.confirm ? "text" : "password"}
                value={newPassword.confirm}
                onChange={(e) => setNewPassword(prev => ({ ...prev, confirm: e.target.value }))}
                InputProps={{
                  endAdornment: (
                    <IconButton onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}>
                      {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </IconButton>
                  )
                }}
              />
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => setPasswordDialog(false)}
                sx={{ color: '#8B5A3C' }}
              >
                Cancel
              </Button>
              <Button
                onClick={handlePasswordChange}
                variant="contained"
                sx={{
                  backgroundColor: '#8B5A3C',
                  color: 'white',
                  '&:hover': { backgroundColor: '#8B5A3C' }
                }}
              >
                Change Password
              </Button>
            </DialogActions>
          </Dialog>

          {/* IP Address Dialog */}
          <Dialog open={ipDialog} onClose={() => setIpDialog(false)} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ color: 'black' }}>Add IP Address</DialogTitle>
            <DialogContent>
              <TextField
                fullWidth
                label="IP Address"
                value={newIp}
                onChange={(e) => setNewIp(e.target.value)}
                placeholder="192.168.1.1"
                sx={{ mt: 1 }}
                helperText="Enter the IP address to whitelist"
              />
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => setIpDialog(false)}
                sx={{ color: '#8B5A3C' }}
              >
                Cancel
              </Button>
              <Button
                onClick={addIpAddress}
                variant="contained"
                sx={{
                  backgroundColor: '#8B5A3C',
                  color: 'white',
                  '&:hover': { backgroundColor: '#8B5A3C' }
                }}
              >
                Add IP
              </Button>
            </DialogActions>
          </Dialog>

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

export default MuseumSettings;