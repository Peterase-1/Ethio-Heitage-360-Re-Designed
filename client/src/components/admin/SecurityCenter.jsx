import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Switch,
  FormControlLabel,
  Divider
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Warning as AlertTriangleIcon,
  Cancel as XCircleIcon,
  Shield as ShieldIcon,
  Visibility as EyeIcon,
  VpnKey as KeyIcon,
  Lock as LockIcon,
  Security as SecurityIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import api from '../../utils/api';

const SecurityCenter = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboardData, setDashboardData] = useState(null);
  const [securityEvents, setSecurityEvents] = useState([]);
  const [activeSessions, setActiveSessions] = useState([]);
  const [securitySettings, setSecuritySettings] = useState(null);
  const [eventsPage, setEventsPage] = useState(1);
  const [sessionsPage, setSessionsPage] = useState(1);
  const [eventsTotal, setEventsTotal] = useState(0);
  const [sessionsTotal, setSessionsTotal] = useState(0);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [sessionDialogOpen, setSessionDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);

  useEffect(() => {
    loadSecurityData();
  }, []);

  const loadSecurityData = async () => {
    try {
      setLoading(true);
      const [dashboardRes, eventsRes, sessionsRes, settingsRes] = await Promise.allSettled([
        api.request('/security/dashboard'),
        api.request('/security/events?page=1&limit=10'),
        api.request('/security/sessions?page=1&limit=10'),
        api.request('/security/settings')
      ]);

      if (dashboardRes.status === 'fulfilled') {
        setDashboardData(dashboardRes.value.data);
      }

      if (eventsRes.status === 'fulfilled') {
        setSecurityEvents(eventsRes.value.data.events);
        setEventsTotal(eventsRes.value.data.pagination.totalCount);
      }

      if (sessionsRes.status === 'fulfilled') {
        setActiveSessions(sessionsRes.value.data.sessions);
        setSessionsTotal(sessionsRes.value.data.pagination.totalCount);
      }

      if (settingsRes.status === 'fulfilled') {
        setSecuritySettings(settingsRes.value.data);
      }

    } catch (error) {
      console.error('Error loading security data:', error);
      setError('Failed to load security data');
    } finally {
      setLoading(false);
    }
  };

  const handleTerminateSession = async (sessionId) => {
    try {
      await api.request(`/security/sessions/${sessionId}`, {
        method: 'DELETE'
      });
      await loadSecurityData();
    } catch (error) {
      console.error('Error terminating session:', error);
      setError('Failed to terminate session');
    }
  };

  const handleUpdateSettings = async (settings) => {
    try {
      await api.request('/security/settings', {
        method: 'PUT',
        body: settings
      });
      setSettingsDialogOpen(false);
      await loadSecurityData();
    } catch (error) {
      console.error('Error updating settings:', error);
      setError('Failed to update settings');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'success';
      case 'failed': return 'error';
      case 'blocked': return 'warning';
      case 'warning': return 'warning';
      default: return 'default';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'error';
      case 'critical': return 'error';
      default: return 'default';
    }
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
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Security Statistics Cards */}
      {dashboardData && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <ShieldIcon color={dashboardData.systemStatus.secure ? 'success' : 'error'} />
                  <Typography variant="h6" sx={{ ml: 1 }}>
                    System Status
                  </Typography>
                </Box>
                <Typography variant="h4" color={dashboardData.systemStatus.secure ? 'success.main' : 'error.main'}>
                  {dashboardData.systemStatus.secure ? 'Secure' : 'At Risk'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  All systems operational
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <EyeIcon color="primary" />
                  <Typography variant="h6" sx={{ ml: 1 }}>
                    Active Sessions
                  </Typography>
                </Box>
                <Typography variant="h4" color="primary.main">
                  {dashboardData.systemStatus.activeSessions || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Current user sessions
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <AlertTriangleIcon color="warning" />
                  <Typography variant="h6" sx={{ ml: 1 }}>
                    Failed Logins
                  </Typography>
                </Box>
                <Typography variant="h4" color="warning.main">
                  {dashboardData.systemStatus.failedLogins || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Last 24 hours
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <SecurityIcon color="info" />
                  <Typography variant="h6" sx={{ ml: 1 }}>
                    API Calls
                  </Typography>
                </Box>
                <Typography variant="h4" color="info.main">
                  {dashboardData.systemStatus.apiCalls || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Today
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Grid container spacing={3}>
        {/* Access Control */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="h6">Access Control</Typography>
                <Button
                  startIcon={<SettingsIcon />}
                  onClick={() => setSettingsDialogOpen(true)}
                  size="small"
                >
                  Configure
                </Button>
              </Box>

              {securitySettings && (
                <Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="body2">Two-Factor Authentication</Typography>
                    <Chip
                      label={securitySettings.settings?.twoFactorAuth?.enabled ? 'Enabled' : 'Disabled'}
                      color={securitySettings.settings?.twoFactorAuth?.enabled ? 'success' : 'default'}
                      size="small"
                    />
                  </Box>

                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="body2">IP Whitelisting</Typography>
                    <Button size="small" variant="outlined">
                      Configure
                    </Button>
                  </Box>

                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="body2">Session Timeout</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {securitySettings.settings?.sessionManagement?.timeout || 30} minutes
                    </Typography>
                  </Box>

                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2">Password Policy</Typography>
                    <Button size="small" variant="outlined">
                      Update
                    </Button>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Security Monitoring */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Security Monitoring</Typography>

              {securitySettings && (
                <Box>
                  <Box display="flex" alignItems="center" mb={2}>
                    <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      SSL Certificate {securitySettings.status?.sslCertificate ? 'Valid' : 'Invalid'}
                    </Typography>
                  </Box>

                  <Box display="flex" alignItems="center" mb={2}>
                    <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      Database {securitySettings.status?.databaseEncryption ? 'Encrypted' : 'Not Encrypted'}
                    </Typography>
                  </Box>

                  <Box display="flex" alignItems="center" mb={2}>
                    <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      API Rate Limiting {securitySettings.status?.apiRateLimiting ? 'Active' : 'Inactive'}
                    </Typography>
                  </Box>

                  <Box display="flex" alignItems="center">
                    {securitySettings.status?.backupStatus ? (
                      <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                    ) : (
                      <AlertTriangleIcon color="warning" sx={{ mr: 1 }} />
                    )}
                    <Typography variant="body2">
                      Backup {securitySettings.status?.backupStatus ? 'Up to Date' : 'Pending'}
                    </Typography>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Security Events */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="h6">Recent Security Events</Typography>
                <Button
                  startIcon={<RefreshIcon />}
                  onClick={loadSecurityData}
                  size="small"
                >
                  Refresh
                </Button>
              </Box>

              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Timestamp</TableCell>
                      <TableCell>Event Type</TableCell>
                      <TableCell>User</TableCell>
                      <TableCell>IP Address</TableCell>
                      <TableCell>Severity</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {securityEvents.map((event, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          {new Date(event.createdAt).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {event.eventType.replace(/_/g, ' ').toUpperCase()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {event.userId?.name || event.userEmail || 'System'}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontFamily="monospace">
                            {event.ipAddress}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={event.severity}
                            color={getSeverityColor(event.severity)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={event.status}
                            color={getStatusColor(event.status)}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Active Sessions */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="h6">Active Sessions</Typography>
                <Button
                  startIcon={<RefreshIcon />}
                  onClick={loadSecurityData}
                  size="small"
                >
                  Refresh
                </Button>
              </Box>

              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>User</TableCell>
                      <TableCell>IP Address</TableCell>
                      <TableCell>Location</TableCell>
                      <TableCell>Device</TableCell>
                      <TableCell>Last Activity</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {activeSessions.map((session, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Typography variant="body2">
                            {session.userId?.name || 'Unknown'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {session.userId?.email || 'No email'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontFamily="monospace">
                            {session.ipAddress}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {session.location?.city}, {session.location?.country}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {session.deviceInfo?.type} - {session.deviceInfo?.browser}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(session.lastActivity).toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleTerminateSession(session.sessionId)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SecurityCenter;
