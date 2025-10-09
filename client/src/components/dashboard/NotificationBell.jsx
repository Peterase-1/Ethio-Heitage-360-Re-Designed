import React, { useState, useEffect } from 'react';
import {
  Badge,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Divider,
  Avatar,
  Tooltip,
  Fade,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useAuth } from '../../../hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';
import notificationService from '../../services/notificationService';

const notificationTypes = {
  success: {
    icon: <CheckCircleIcon color="success" />,
    bgcolor: 'success.light',
  },
  error: {
    icon: <ErrorIcon color="error" />,
    bgcolor: 'error.light',
  },
  info: {
    icon: <InfoIcon color="info" />,
    bgcolor: 'info.light',
  },
  warning: {
    icon: <WarningIcon color="warning" />,
    bgcolor: 'warning.light',
  },
};

// Notification types mapping for display
const getNotificationType = (type) => {
  const typeMap = {
    'system': 'info',
    'security': 'error',
    'approval': 'info',
    'workflow': 'info',
    'deadline': 'warning',
    'milestone': 'success',
    'error': 'error',
    'warning': 'warning',
    'info': 'info',
    'success': 'success',
    'reminder': 'info',
    'communication': 'info',
    'analytics': 'info',
    'content': 'info',
    'event': 'info',
    'rental': 'info',
    'user_activity': 'info',
    'backup': 'info',
    'maintenance': 'warning'
  };
  return typeMap[type] || 'info';
};

const NotificationBell = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const { user } = useAuth();

  const open = Boolean(anchorEl);

  // Load notifications on component mount
  useEffect(() => {
    loadNotifications();
    loadUnreadCount();
  }, []);

  // Load notifications from API
  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationService.getNotifications({
        limit: 20,
        unreadOnly: false
      });
      
      if (response.data && response.data.success) {
        const formattedNotifications = response.data.notifications.map(notification => ({
          id: notification._id,
          title: notification.title,
          message: notification.message,
          type: getNotificationType(notification.type),
          timestamp: new Date(notification.createdAt),
          read: notification.recipients.find(r => r.user.toString() === user._id)?.readAt ? true : false,
          link: notification.action?.url || '/notifications',
          priority: notification.priority,
          category: notification.category,
          action: notification.action
        }));
        
        setNotifications(formattedNotifications);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
      // Fallback to empty array on error
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  // Load unread count
  const loadUnreadCount = async () => {
    try {
      const response = await notificationService.getUnreadCount();
      if (response.data && response.data.success) {
        setUnreadCount(response.data.count);
      }
    } catch (error) {
      console.error('Failed to load unread count:', error);
      setUnreadCount(0);
    }
  };

  const handleClick = async (event) => {
    setAnchorEl(event.currentTarget);
    // Load fresh notifications when opening
    await loadNotifications();
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = async (notification) => {
    // Mark as read if not already read
    if (!notification.read) {
      try {
        await notificationService.markAsRead(notification.id);
        // Update local state
        setNotifications(notifications.map(n => 
          n.id === notification.id ? { ...n, read: true } : n
        ));
        // Update unread count
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    }
    
    // Handle navigation to notification link
    console.log('Navigate to:', notification.link);
    // Close the menu
    handleClose();
  };

  // Group notifications by date
  const groupedNotifications = notifications.reduce((acc, notification) => {
    const date = new Date(notification.timestamp).toDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(notification);
    return acc;
  }, {});

  return (
    <>
      <Tooltip title="Notifications">
        <IconButton
          color="inherit"
          onClick={handleClick}
          aria-label="show notifications"
          aria-controls="notification-menu"
          aria-haspopup="true"
        >
          <Badge badgeContent={unreadCount} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      <Menu
        id="notification-menu"
        anchorEl={anchorEl}
        keepMounted
        open={open}
        onClose={handleClose}
        PaperProps={{
          style: {
            width: 400,
            maxHeight: 500,
          },
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        TransitionComponent={Fade}
      >
        <Box p={2} display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" component="div">
            Notifications
          </Typography>
          <Typography variant="caption" color="textSecondary">
            {unreadCount} unread
          </Typography>
        </Box>
        <Divider />

        <Box sx={{ maxHeight: '60vh', overflowY: 'auto' }}>
          {loading ? (
            <Box p={2} textAlign="center">
              <Typography variant="body2" color="textSecondary">
                Loading notifications...
              </Typography>
            </Box>
          ) : Object.entries(groupedNotifications).map(([date, dayNotifications]) => (
            <Box key={date}>
              <Box px={2} py={1} bgcolor="action.hover">
                <Typography variant="subtitle2" color="textSecondary">
                  {date === new Date().toDateString() ? 'Today' : date}
                </Typography>
              </Box>
              {dayNotifications.map((notification) => (
                <MenuItem
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  sx={{
                    borderLeft: `4px solid ${theme.palette[notification.type]?.main || theme.palette.primary.main}`,
                    bgcolor: notification.read ? 'background.paper' : 'action.hover',
                    '&:hover': {
                      bgcolor: 'action.selected',
                    },
                  }}
                >
                  <ListItemIcon>
                    {notificationTypes[notification.type]?.icon || <InfoIcon color="primary" />}
                  </ListItemIcon>
                  <Box sx={{ width: '100%' }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle2" component="div">
                        {notification.title}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="textSecondary" noWrap>
                      {notification.message}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Box>
          ))}
          
          {!loading && notifications.length === 0 && (
            <Box p={2} textAlign="center">
              <Typography variant="body2" color="textSecondary">
                No new notifications
              </Typography>
            </Box>
          )}
        </Box>

        <Divider />
        <Box p={1} textAlign="center">
          <Typography 
            variant="button" 
            color="primary" 
            sx={{ cursor: 'pointer' }}
            onClick={() => {
              console.log('View all notifications');
              handleClose();
            }}
          >
            VIEW ALL
          </Typography>
        </Box>
      </Menu>
    </>
  );
};

export default NotificationBell;