import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton
} from '@mui/material';
import {
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Backup as BackupIcon,
  Assessment as ReportIcon,
  Settings as SettingsIcon,
  Security as SecurityIcon,
  Email as EmailIcon,
  Language as LanguageIcon,
  Storage as StorageIcon,
  Palette as PaletteIcon,
  Analytics as AnalyticsIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import api from '../../utils/api';

const SystemSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [settings, setSettings] = useState(null);
  const [systemHealth, setSystemHealth] = useState(null);
  const [backupDialogOpen, setBackupDialogOpen] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportFormat, setReportFormat] = useState('html');
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [generatedReport, setGeneratedReport] = useState(null);

  useEffect(() => {
    loadSystemSettings();
  }, []);

  const loadSystemSettings = async () => {
    try {
      setLoading(true);
      const [settingsRes, healthRes] = await Promise.allSettled([
        api.request('/system-settings'),
        api.request('/system-settings/health')
      ]);

      if (settingsRes.status === 'fulfilled') {
        setSettings(settingsRes.value.data);
      }

      if (healthRes.status === 'fulfilled') {
        setSystemHealth(healthRes.value.data);
      }

    } catch (error) {
      console.error('Error loading system settings:', error);
      setError('Failed to load system settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      await api.request('/system-settings', {
        method: 'PUT',
        body: settings
      });
      setSuccess('System settings saved successfully!');
      await loadSystemSettings();
    } catch (error) {
      console.error('Error saving settings:', error);
      setError('Failed to save system settings');
    } finally {
      setSaving(false);
    }
  };

  const handleBackupDatabase = async () => {
    try {
      await api.request('/system-settings/backup', {
        method: 'POST'
      });
      setSuccess('Database backup initiated successfully!');
      setBackupDialogOpen(false);
    } catch (error) {
      console.error('Error backing up database:', error);
      setError('Failed to initiate database backup');
    }
  };

  const handleGenerateReport = async () => {
    try {
      const response = await api.request(`/system-settings/reports?reportType=system&format=${reportFormat}`);
      setReportDialogOpen(false);

      // Store report information for success dialog
      setGeneratedReport({
        filename: response.data.filename,
        format: response.data.format,
        generatedAt: response.data.generatedAt,
        downloadUrl: response.data.downloadUrl
      });

      // Download the generated report
      if (response.data.downloadUrl) {
        try {
          // Create a proper download link with full URL
          const fullUrl = `${window.location.origin}${response.data.downloadUrl}`;
          const link = document.createElement('a');
          link.href = fullUrl;
          link.download = response.data.filename;
          link.target = '_blank';
          link.style.display = 'none';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } catch (downloadError) {
          console.error('Download error:', downloadError);
          // Fallback: open in new tab
          window.open(`${window.location.origin}${response.data.downloadUrl}`, '_blank');
        }
      }

      // Show success dialog
      setSuccessDialogOpen(true);
    } catch (error) {
      console.error('Error generating report:', error);
      setError('Failed to generate system report');
    }
  };

  const updateSetting = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const updateNestedSetting = (section, subsection, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: {
          ...prev[section][subsection],
          [field]: value
        }
      }
    }));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Snackbar
          open={!!success}
          autoHideDuration={6000}
          onClose={() => setSuccess('')}
          message={success}
        />
      )}

      {/* System Health Status */}
      {systemHealth && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              System Health Status
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Box display="flex" alignItems="center">
                  <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                  <Typography variant="body2">
                    Database: {systemHealth.database?.status || 'Unknown'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box display="flex" alignItems="center">
                  {systemHealth.maintenance?.mode ? (
                    <WarningIcon color="warning" sx={{ mr: 1 }} />
                  ) : (
                    <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                  )}
                  <Typography variant="body2">
                    Maintenance: {systemHealth.maintenance?.mode ? 'Active' : 'Normal'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box display="flex" alignItems="center">
                  <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                  <Typography variant="body2">
                    Features: {Object.values(systemHealth.features || {}).filter(Boolean).length} Active
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box display="flex" alignItems="center">
                  <SecurityIcon color="info" sx={{ mr: 1 }} />
                  <Typography variant="body2">
                    Security: {systemHealth.security?.twoFactorRequired ? '2FA Required' : 'Standard'}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {settings && (
        <Grid container spacing={3}>
          {/* Platform Configuration */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <LanguageIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Platform Configuration</Typography>
                </Box>

                <TextField
                  fullWidth
                  label="Platform Name"
                  value={settings.platform?.name || ''}
                  onChange={(e) => updateSetting('platform', 'name', e.target.value)}
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={2}
                  value={settings.platform?.description || ''}
                  onChange={(e) => updateSetting('platform', 'description', e.target.value)}
                  sx={{ mb: 2 }}
                />

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Default Language</InputLabel>
                  <Select
                    value={settings.platform?.defaultLanguage || 'en'}
                    onChange={(e) => updateSetting('platform', 'defaultLanguage', e.target.value)}
                  >
                    <MenuItem value="en">English</MenuItem>
                    <MenuItem value="am">Amharic</MenuItem>
                    <MenuItem value="om">Oromo</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  label="Max Upload Size (MB)"
                  type="number"
                  value={settings.platform?.maxUploadSize || 50}
                  onChange={(e) => updateSetting('platform', 'maxUploadSize', parseInt(e.target.value))}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Rental System Settings */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <StorageIcon color="secondary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Rental System Settings</Typography>
                </Box>

                <TextField
                  fullWidth
                  label="Default Rental Period (days)"
                  type="number"
                  value={settings.rentalSystem?.defaultRentalPeriod || 30}
                  onChange={(e) => updateSetting('rentalSystem', 'defaultRentalPeriod', parseInt(e.target.value))}
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  label="Security Deposit (%)"
                  type="number"
                  value={settings.rentalSystem?.securityDepositPercentage || 20}
                  onChange={(e) => updateSetting('rentalSystem', 'securityDepositPercentage', parseInt(e.target.value))}
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  label="Late Fee (ETB/day)"
                  type="number"
                  value={settings.rentalSystem?.lateFeePerDay || 100}
                  onChange={(e) => updateSetting('rentalSystem', 'lateFeePerDay', parseInt(e.target.value))}
                  sx={{ mb: 2 }}
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.rentalSystem?.requireInsurance || false}
                      onChange={(e) => updateSetting('rentalSystem', 'requireInsurance', e.target.checked)}
                    />
                  }
                  label="Require Insurance"
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Email Notifications */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <EmailIcon color="info" sx={{ mr: 1 }} />
                  <Typography variant="h6">Email Notifications</Typography>
                </Box>

                <List>
                  <ListItem>
                    <ListItemText primary="New user registrations" />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={settings.emailNotifications?.newUserRegistrations || false}
                        onChange={(e) => updateSetting('emailNotifications', 'newUserRegistrations', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>

                  <ListItem>
                    <ListItemText primary="Artifact approvals" />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={settings.emailNotifications?.artifactApprovals || false}
                        onChange={(e) => updateSetting('emailNotifications', 'artifactApprovals', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>

                  <ListItem>
                    <ListItemText primary="Rental activities" />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={settings.emailNotifications?.rentalActivities || false}
                        onChange={(e) => updateSetting('emailNotifications', 'rentalActivities', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>

                  <ListItem>
                    <ListItemText primary="Weekly reports" />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={settings.emailNotifications?.weeklyReports || false}
                        onChange={(e) => updateSetting('emailNotifications', 'weeklyReports', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Security Settings */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <SecurityIcon color="warning" sx={{ mr: 1 }} />
                  <Typography variant="h6">Security Settings</Typography>
                </Box>

                <TextField
                  fullWidth
                  label="Session Timeout (minutes)"
                  type="number"
                  value={settings.security?.sessionTimeout || 30}
                  onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  label="Max Login Attempts"
                  type="number"
                  value={settings.security?.maxLoginAttempts || 5}
                  onChange={(e) => updateSetting('security', 'maxLoginAttempts', parseInt(e.target.value))}
                  sx={{ mb: 2 }}
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.security?.requireTwoFactor || false}
                      onChange={(e) => updateSetting('security', 'requireTwoFactor', e.target.checked)}
                    />
                  }
                  label="Require Two-Factor Authentication"
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Features */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <SettingsIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Feature Flags</Typography>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.features?.enableVirtualMuseum || false}
                          onChange={(e) => updateSetting('features', 'enableVirtualMuseum', e.target.checked)}
                        />
                      }
                      label="Virtual Museum"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.features?.enableRentalSystem || false}
                          onChange={(e) => updateSetting('features', 'enableRentalSystem', e.target.checked)}
                        />
                      }
                      label="Rental System"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.features?.enableEducationalContent || false}
                          onChange={(e) => updateSetting('features', 'enableEducationalContent', e.target.checked)}
                        />
                      }
                      label="Educational Content"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.features?.enableUserRegistration || false}
                          onChange={(e) => updateSetting('features', 'enableUserRegistration', e.target.checked)}
                        />
                      }
                      label="User Registration"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Action Buttons */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box display="flex" gap={2} flexWrap="wrap">
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSaveSettings}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save All Settings'}
                  </Button>

                  <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={loadSystemSettings}
                  >
                    Refresh
                  </Button>

                  <Button
                    variant="outlined"
                    color="warning"
                    startIcon={<BackupIcon />}
                    onClick={() => setBackupDialogOpen(true)}
                  >
                    Backup Database
                  </Button>

                  <Button
                    variant="outlined"
                    color="info"
                    startIcon={<ReportIcon />}
                    onClick={() => setReportDialogOpen(true)}
                  >
                    Generate Reports
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Backup Dialog */}
      <Dialog open={backupDialogOpen} onClose={() => setBackupDialogOpen(false)}>
        <DialogTitle>Backup Database</DialogTitle>
        <DialogContent>
          <Typography>
            This will initiate a manual backup of the database. The backup process may take several minutes.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBackupDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleBackupDatabase} variant="contained" color="warning">
            Start Backup
          </Button>
        </DialogActions>
      </Dialog>

      {/* Report Dialog */}
      <Dialog open={reportDialogOpen} onClose={() => setReportDialogOpen(false)}>
        <DialogTitle>Generate System Report</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Generate a comprehensive system report including statistics, health status, and configuration details.
          </Typography>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Report Format</InputLabel>
            <Select
              value={reportFormat}
              onChange={(e) => setReportFormat(e.target.value)}
            >
              <MenuItem value="html">HTML Report (Recommended)</MenuItem>
              <MenuItem value="text">Text Report</MenuItem>
            </Select>
          </FormControl>

          <Typography variant="body2" color="text.secondary">
            {reportFormat === 'html'
              ? 'HTML reports include styling and can be opened in any web browser.'
              : 'Text reports are plain text files that can be opened in any text editor.'
            }
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReportDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleGenerateReport} variant="contained" color="info">
            Generate Report
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={successDialogOpen} onClose={() => setSuccessDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <CheckCircleIcon color="success" sx={{ mr: 1 }} />
            Report Generated Successfully!
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Your system report has been generated and downloaded to your default downloads folder.
          </Typography>

          {generatedReport && (
            <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Typography variant="subtitle2" gutterBottom>
                Report Details:
              </Typography>
              <Box sx={{ mb: 1 }}>
                <Typography variant="body2">
                  <strong>Filename:</strong> {generatedReport.filename}
                </Typography>
              </Box>
              <Box sx={{ mb: 1 }}>
                <Typography variant="body2">
                  <strong>Format:</strong> {generatedReport.format.toUpperCase()}
                </Typography>
              </Box>
              <Box sx={{ mb: 1 }}>
                <Typography variant="body2">
                  <strong>Generated:</strong> {new Date(generatedReport.generatedAt).toLocaleString()}
                </Typography>
              </Box>
              <Box sx={{ mb: 1 }}>
                <Typography variant="body2">
                  <strong>Download Location:</strong> Your browser's default downloads folder
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  (Usually: Downloads folder in your user directory)
                </Typography>
              </Box>
            </Paper>
          )}

          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            The report contains comprehensive system information including health status,
            configuration settings, and real-time statistics from the database.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSuccessDialogOpen(false)}>
            Close
          </Button>
          <Button
            onClick={() => {
              if (generatedReport?.downloadUrl) {
                // Try to download again
                const fullUrl = `${window.location.origin}${generatedReport.downloadUrl}`;
                window.open(fullUrl, '_blank');
              }
            }}
            variant="outlined"
            color="primary"
          >
            Download Again
          </Button>
          <Button
            onClick={() => {
              // Show instructions for finding the downloads folder
              alert('To find your downloaded report:\n\n1. Open your file explorer\n2. Navigate to your Downloads folder\n3. Look for the file: ' + (generatedReport?.filename || 'system-report-*.html') + '\n\nIf the file didn\'t download, try the "Download Again" button.');
            }}
            variant="outlined"
            color="secondary"
          >
            Show File Location
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SystemSettings;
