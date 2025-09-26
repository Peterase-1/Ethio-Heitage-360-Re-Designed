import React, { useState, useEffect } from 'react';
import MuseumAdminSidebar from '../dashboard/MuseumAdminSidebar';
import {
  Box, Typography, Container, Grid, Paper, Button,
  List, ListItem, ListItemText, ListItemIcon, Chip, IconButton,
  CircularProgress, Alert, FormControl, InputLabel, Select, MenuItem,
  Switch, FormControlLabel
} from '@mui/material';
import {
  Bell,
  CheckCircle,
  AlertCircle,
  Info,
  Trash2,
  Check,
  X
} from 'lucide-react';
import api from '../../utils/api.js';

const MuseumNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    type: 'all',
    priority: 'all',
    unreadOnly: false
  });
  const [unreadCount, setUnreadCount] = useState(0);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0
  });

  // Load notifications on component mount
  useEffect(() => {
    fetchNotifications();
  }, [filters, pagination.page]);

  // Fetch notifications from API
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      };

      const response = await api.get('/museum-admin/notifications', { params });

      if (response.data.success) {
        setNotifications(response.data.notifications);
        setUnreadCount(response.data.unreadCount);
        setPagination(prev => ({
          ...prev,
          total: response.data.pagination.total,
          pages: response.data.pagination.pages
        }));
      } else {
        setError('Failed to load notifications');
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError('Failed to load notifications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (id) => {
    try {
      const response = await api.put(`/museum-admin/notifications/${id}/read`);

      if (response.data.success) {
        setNotifications(notifications.map(notif => {
          const recipient = notif.recipients?.find(r => r.user === 'current_user');
          if (notif._id === id && recipient && !recipient.readAt) {
            return {
              ...notif,
              recipients: notif.recipients.map(r =>
                r.user === 'current_user' ? { ...r, readAt: new Date() } : r
              )
            };
          }
          return notif;
        }));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Dismiss notification
  const dismissNotification = async (id) => {
    try {
      const response = await api.put(`/museum-admin/notifications/${id}/dismiss`);

      if (response.data.success) {
        setNotifications(notifications.filter(notif => notif._id !== id));
        setUnreadCount(prev => {
          const notification = notifications.find(n => n._id === id);
          const isUnread = notification && !notification.recipients?.some(r => r.readAt);
          return isUnread ? Math.max(0, prev - 1) : prev;
        });
      }
    } catch (error) {
      console.error('Error dismissing notification:', error);
    }
  };

  // Handle filter changes
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  };

  const typeIcons = {
    approval: <CheckCircle size={20} color="#4ade80" />,
    rental: <AlertCircle size={20} color="#f59e0b" />,
    system: <Info size={20} color="#3b82f6" />,
    artifact_approval: <CheckCircle size={20} color="#4ade80" />,
    workflow: <AlertCircle size={20} color="#f59e0b" />,
    deadline: <AlertCircle size={20} color="#ef4444" />,
    milestone: <CheckCircle size={20} color="#10b981" />,
    warning: <AlertCircle size={20} color="#f59e0b" />,
    info: <Info size={20} color="#3b82f6" />,
    success: <CheckCircle size={20} color="#10b981" />
  };

  const priorityColors = {
    low: 'info',
    medium: 'warning',
    high: 'error',
    critical: 'error',
    urgent: 'error'
  };

  // Helper function to check if notification is read
  const isNotificationRead = (notification) => {
    return notification.recipients?.some(r => r.readAt);
  };

  // Helper function to format timestamp
  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <MuseumAdminSidebar />

      <div className="flex-1 overflow-auto">
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" component="h1" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
              <Bell className="mr-3" size={32} />
              Notifications
              {unreadCount > 0 && (
                <Chip
                  label={unreadCount}
                  color="error"
                  size="small"
                  sx={{ ml: 2 }}
                />
              )}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Stay updated with important alerts and system notifications
            </Typography>
          </Box>

          {/* Filters */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={filters.type}
                    label="Type"
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                  >
                    <MenuItem value="all">All Types</MenuItem>
                    <MenuItem value="approval">Approval</MenuItem>
                    <MenuItem value="rental">Rental</MenuItem>
                    <MenuItem value="system">System</MenuItem>
                    <MenuItem value="workflow">Workflow</MenuItem>
                    <MenuItem value="deadline">Deadline</MenuItem>
                    <MenuItem value="milestone">Milestone</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={filters.priority}
                    label="Priority"
                    onChange={(e) => handleFilterChange('priority', e.target.value)}
                  >
                    <MenuItem value="all">All Priorities</MenuItem>
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                    <MenuItem value="critical">Critical</MenuItem>
                    <MenuItem value="urgent">Urgent</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={3}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={filters.unreadOnly}
                      onChange={(e) => handleFilterChange('unreadOnly', e.target.checked)}
                    />
                  }
                  label="Unread only"
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <Button
                  variant="outlined"
                  onClick={fetchNotifications}
                  disabled={loading}
                >
                  Refresh
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Notifications List */}
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Recent Notifications</Typography>
              <Typography variant="body2" color="text.secondary">
                {pagination.total} total notifications
              </Typography>
            </Box>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : notifications.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Bell size={48} color="#ccc" />
                <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
                  No notifications found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {filters.unreadOnly ? 'No unread notifications' : 'You\'re all caught up!'}
                </Typography>
              </Box>
            ) : (
              <List>
                {notifications.map((notification) => {
                  const isRead = isNotificationRead(notification);
                  return (
                    <ListItem
                      key={notification._id}
                      sx={{
                        mb: 1,
                        bgcolor: isRead ? 'transparent' : 'primary.light',
                        borderRadius: 1,
                        opacity: isRead ? 0.7 : 1,
                        border: '1px solid',
                        borderColor: isRead ? 'grey.300' : 'primary.main'
                      }}
                    >
                      <ListItemIcon>
                        {typeIcons[notification.type] || typeIcons.info}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle1">{notification.title}</Typography>
                            <Chip
                              label={notification.priority}
                              color={priorityColors[notification.priority] || 'default'}
                              size="small"
                            />
                            {notification.category && (
                              <Chip
                                label={notification.category.replace('_', ' ')}
                                variant="outlined"
                                size="small"
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2">{notification.message}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatTimestamp(notification.createdAt)}
                            </Typography>
                          </Box>
                        }
                      />
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {!isRead && (
                          <IconButton
                            onClick={() => markAsRead(notification._id)}
                            title="Mark as read"
                            size="small"
                          >
                            <Check size={16} />
                          </IconButton>
                        )}
                        {notification.isDismissible && (
                          <IconButton
                            onClick={() => dismissNotification(notification._id)}
                            title="Dismiss"
                            size="small"
                            color="error"
                          >
                            <X size={16} />
                          </IconButton>
                        )}
                      </Box>
                    </ListItem>
                  );
                })}
              </List>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Button
                  disabled={pagination.page === 1}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                >
                  Previous
                </Button>
                <Typography sx={{ mx: 2, display: 'flex', alignItems: 'center' }}>
                  Page {pagination.page} of {pagination.pages}
                </Typography>
                <Button
                  disabled={pagination.page === pagination.pages}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                >
                  Next
                </Button>
              </Box>
            )}
          </Paper>
        </Container>
      </div>
    </div>
  );
};

export default MuseumNotifications;
