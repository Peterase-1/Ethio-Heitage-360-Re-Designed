import React, { useState, useEffect, useCallback } from 'react';
import {
  IconButton, Badge, Menu, MenuItem, Typography, Box, Avatar, Divider,
  List, ListItem, ListItemAvatar, ListItemText, ListItemSecondaryAction,
  Button, Card, CardContent, Chip, Collapse, Alert, Snackbar, Fade,
  useTheme, alpha, Tooltip
} from '@mui/material';
import api from '../../utils/api';
import {
  Notifications, NotificationsActive, Close, ExpandMore, ExpandLess,
  CheckCircle, Warning, Error, Info, Security, Update, Person,
  Museum, ArtTrack, Event, Payment, Settings, Visibility,
  MarkEmailRead, DeleteSweep, FilterList
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';

// Mock notification data removed
const mockNotifications = [];

const getNotificationIcon = (category, type) => {
  const iconProps = { fontSize: 'small' };

  switch (category) {
    case 'artifact': return <ArtTrack {...iconProps} />;
    case 'user': return <Person {...iconProps} />;
    case 'museum': return <Museum {...iconProps} />;
    case 'event': return <Event {...iconProps} />;
    case 'payment': return <Payment {...iconProps} />;
    case 'security': return <Security {...iconProps} />;
    case 'system': return <Settings {...iconProps} />;
    default:
      switch (type) {
        case 'success': return <CheckCircle {...iconProps} />;
        case 'warning': return <Warning {...iconProps} />;
        case 'error': return <Error {...iconProps} />;
        default: return <Info {...iconProps} />;
      }
  }
};

const getTypeColor = (type) => {
  switch (type) {
    case 'success': return 'success';
    case 'warning': return 'warning';
    case 'error': return 'error';
    case 'info': return 'info';
    default: return 'default';
  }
};

const getPriorityColor = (priority) => {
  switch (priority) {
    case 'critical': return 'error';
    case 'high': return 'warning';
    case 'medium': return 'info';
    case 'low': return 'default';
    default: return 'default';
  }
};

const NotificationBell = ({ onNotificationClick }) => {
  const theme = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [filter, setFilter] = useState('all');

  const unreadCount = notifications.filter(n => !n.read).length;
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };



  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'read') return n.read;
    return true;
  });

  const groupedNotifications = filteredNotifications.reduce((acc, notification) => {
    const category = notification.category;
    if (!acc[category]) acc[category] = [];
    acc[category].push(notification);
    return acc;
  }, {});

  // Real-time notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await api.getNotifications();
        if (response.success && response.data) {
          setNotifications(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };

    fetchNotifications();

    // Listen for new notifications via socket
    // window.addEventListener('new_notification', (e) => {
    //  setNotifications(prev => [e.detail, ...prev]);
    // });

    // Cleanup is handled by the socket hook if we used it here, 
    // but for now we'll rely on the global socket listener or polling if needed. 
    // Ideally pass socket prop or use useSocket hook.
  }, []);

  // Poll for notifications as backup (every 60s)
  useEffect(() => {
    const interval = setInterval(async () => {
      const response = await api.getNotifications();
      if (response.success && response.data) {
        setNotifications(prev => {
          // Merge logic to avoid duplicates if needed, or just replace
          // If we want to keep local state (like read status) we need to be careful
          // For now, replacing is safest to sync with server
          return response.data;
        });
      }
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await api.markNotificationRead(notificationId);
      setNotifications(prev =>
        prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleDeleteNotification = (notificationId) => {
    // API logic for delete if available
    setNotifications(prev => prev.filter(n => n._id !== notificationId));
  };

  return (
    <>
      <Tooltip title="Notifications">
        <IconButton onClick={handleClick} color="inherit">
          <Badge badgeContent={unreadCount} color="error" max={99}>
            {unreadCount > 0 ? <NotificationsActive /> : <Notifications />}
          </Badge>
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 400,
            maxHeight: 600,
            overflow: 'hidden'
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {/* Header */}
        <Box p={2} bgcolor="grey.50" display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight="bold">
            Notifications ({unreadCount})
          </Typography>
          <Box display="flex" gap={1}>
            <Chip
              label="All"
              size="small"
              color={filter === 'all' ? 'primary' : 'default'}
              onClick={() => setFilter('all')}
              variant={filter === 'all' ? 'filled' : 'outlined'}
            />
            <Chip
              label="Unread"
              size="small"
              color={filter === 'unread' ? 'primary' : 'default'}
              onClick={() => setFilter('unread')}
              variant={filter === 'unread' ? 'filled' : 'outlined'}
            />
          </Box>
        </Box>

        <Divider />

        {/* Actions */}
        <Box p={1} display="flex" justifyContent="space-between" bgcolor="grey.25">
          <Button
            size="small"
            startIcon={<MarkEmailRead />}
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
          >
            Mark All Read
          </Button>
          <Button
            size="small"
            startIcon={<DeleteSweep />}
            onClick={handleClearAll}
            color="error"
          >
            Clear All
          </Button>
        </Box>

        <Divider />

        {/* Notifications List */}
        <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
          {Object.keys(groupedNotifications).length === 0 ? (
            <Box p={4} textAlign="center">
              <Typography color="text.secondary">
                No notifications found
              </Typography>
            </Box>
          ) : (
            Object.keys(groupedNotifications).map(category => (
              <Box key={category}>
                <ListItem
                  button
                  onClick={() => toggleCategory(category)}
                  sx={{ bgcolor: 'grey.50', py: 1 }}
                >
                  <ListItemText
                    primary={
                      <Typography variant="subtitle2" fontWeight="bold" textTransform="capitalize">
                        {category} ({groupedNotifications[category].length})
                      </Typography>
                    }
                  />
                  <ListItemSecondaryAction>
                    {expandedCategories[category] ? <ExpandLess /> : <ExpandMore />}
                  </ListItemSecondaryAction>
                </ListItem>

                <Collapse in={expandedCategories[category]} timeout="auto" unmountOnExit>
                  <List disablePadding>
                    {groupedNotifications[category].map((notification) => (
                      <ListItem
                        key={notification.id}
                        alignItems="flex-start"
                        sx={{
                          bgcolor: notification.read ? 'transparent' : alpha(theme.palette.primary.main, 0.05),
                          borderLeft: !notification.read ? `3px solid ${theme.palette.primary.main}` : 'none',
                          '&:hover': { bgcolor: 'grey.50' },
                          cursor: 'pointer'
                        }}
                        onClick={() => {
                          if (onNotificationClick) {
                            onNotificationClick(notification);
                          }
                          handleMarkAsRead(notification.id);
                          handleClose();
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              bgcolor: `${getTypeColor(notification.type)}.main`,
                              fontSize: '0.875rem'
                            }}
                          >
                            {getNotificationIcon(notification.category, notification.type)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box display="flex" alignItems="center" gap={1}>
                              <Typography variant="subtitle2" fontWeight="bold" noWrap>
                                {notification.title}
                              </Typography>
                              <Chip
                                label={notification.priority}
                                size="small"
                                color={getPriorityColor(notification.priority)}
                                sx={{ height: 16, fontSize: '0.625rem' }}
                              />
                            </Box>
                          }
                          secondary={
                            <>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                {notification.message}
                              </Typography>
                              <Typography variant="caption" color="text.disabled">
                                {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                              </Typography>
                            </>
                          }
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteNotification(notification.id);
                            }}
                          >
                            <Close fontSize="small" />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
              </Box>
            ))
          )}
        </Box>
      </Menu>
    </>
  );
};

const ToastNotification = ({ notification, onClose }) => {
  const [open, setOpen] = useState(true);

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
    setTimeout(() => onClose(notification.id), 300);
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      TransitionComponent={Fade}
    >
      <Alert
        onClose={handleClose}
        severity={getTypeColor(notification.type)}
        variant="filled"
        sx={{ width: '100%', minWidth: 300 }}
        icon={getNotificationIcon(notification.category, notification.type)}
      >
        <Typography variant="subtitle2" fontWeight="bold">
          {notification.title}
        </Typography>
        <Typography variant="body2">
          {notification.message}
        </Typography>
      </Alert>
    </Snackbar>
  );
};

const NotificationCenter = () => {
  const [toastNotifications, setToastNotifications] = useState([]);

  const showToastNotification = useCallback((notification) => {
    const toastId = `toast-${Date.now()}`;
    const toastNotification = {
      ...notification,
      id: toastId
    };

    setToastNotifications(prev => [...prev, toastNotification]);
  }, []);

  const removeToastNotification = useCallback((id) => {
    setToastNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Example of triggering toast notifications
  useEffect(() => {
    // Simulate high-priority notifications that should show as toasts
    const interval = setInterval(() => {
      if (Math.random() > 0.95) { // 5% chance
        showToastNotification({
          type: 'warning',
          category: 'system',
          title: 'Critical System Alert',
          message: 'High CPU usage detected on server',
          priority: 'critical'
        });
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [showToastNotification]);

  return (
    <>
      {toastNotifications.map((notification) => (
        <ToastNotification
          key={notification.id}
          notification={notification}
          onClose={removeToastNotification}
        />
      ))}
    </>
  );
};

const ActivityFeed = ({ notifications = [], maxItems = 10 }) => {
  const [expandedItems, setExpandedItems] = useState({});

  const toggleExpand = (id) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const recentNotifications = notifications
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, maxItems);

  return (
    <Card elevation={2}>
      <CardContent>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Recent Activity
        </Typography>
        <List>
          {recentNotifications.map((notification, index) => (
            <React.Fragment key={notification.id}>
              <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                <ListItemAvatar>
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: `${getTypeColor(notification.type)}.main`
                    }}
                  >
                    {getNotificationIcon(notification.category, notification.type)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body2" fontWeight="bold">
                        {notification.title}
                      </Typography>
                      <Chip
                        label={notification.category}
                        size="small"
                        variant="outlined"
                        sx={{ height: 16, fontSize: '0.625rem' }}
                      />
                    </Box>
                  }
                  secondary={
                    <>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: expandedItems[notification.id] ? 'none' : 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          mt: 0.5
                        }}
                      >
                        {notification.message}
                      </Typography>
                      <Typography variant="caption" color="text.disabled" display="block">
                        {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                      </Typography>
                    </>
                  }
                />
                {notification.message.length > 100 && (
                  <ListItemSecondaryAction>
                    <IconButton
                      size="small"
                      onClick={() => toggleExpand(notification.id)}
                    >
                      {expandedItems[notification.id] ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                  </ListItemSecondaryAction>
                )}
              </ListItem>
              {index < recentNotifications.length - 1 && <Divider variant="inset" />}
            </React.Fragment>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export { NotificationBell, NotificationCenter, ActivityFeed };
export default { NotificationBell, NotificationCenter, ActivityFeed };
