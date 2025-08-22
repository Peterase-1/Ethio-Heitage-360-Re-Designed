import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Grid,
  Avatar,
  Divider,
} from '@mui/material';
import {
  CloudDownload as CloudDownloadIcon,
  CloudOff as CloudOffIcon,
  Storage as StorageIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  WifiOff as WifiOffIcon,
  Wifi as WifiIcon,
  Download as DownloadIcon,
  Folder as FolderIcon,
  Image as ImageIcon,
  VideoLibrary as VideoLibraryIcon,
  AudioFile as AudioFileIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';

const OfflineMode = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineContent, setOfflineContent] = useState([]);
  const [downloadQueue, setDownloadQueue] = useState([]);
  const [storageUsage, setStorageUsage] = useState({ used: 0, total: 0 });
  const [autoDownload, setAutoDownload] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load offline content and storage info
    loadOfflineContent();
    checkStorageUsage();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadOfflineContent = async () => {
    try {
      // Simulate loading offline content from IndexedDB or localStorage
      const mockOfflineContent = [
        {
          id: 1,
          title: "Axum Obelisks Virtual Tour",
          type: "3d_tour",
          size: "45.2 MB",
          downloadDate: "2024-01-15",
          lastAccessed: "2024-01-20",
          status: "downloaded",
          thumbnail: "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=60&h=60&fit=crop&crop=center",
          description: "Complete 3D virtual tour of the ancient Axum obelisks",
        },
        {
          id: 2,
          title: "Ethiopian Coffee Culture",
          type: "video",
          size: "128.5 MB",
          downloadDate: "2024-01-18",
          lastAccessed: "2024-01-19",
          status: "downloaded",
          thumbnail: "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=60&h=60&fit=crop&crop=center",
          description: "Documentary about Ethiopian coffee traditions",
        },
        {
          id: 3,
          title: "Lalibela Churches Guide",
          type: "document",
          size: "12.8 MB",
          downloadDate: "2024-01-20",
          lastAccessed: "2024-01-21",
          status: "downloaded",
          thumbnail: "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=60&h=60&fit=crop&crop=center",
          description: "Comprehensive guide to the rock-hewn churches",
        },
        {
          id: 4,
          title: "Traditional Textiles Collection",
          type: "image_gallery",
          size: "67.3 MB",
          downloadDate: "2024-01-22",
          lastAccessed: "2024-01-22",
          status: "downloading",
          progress: 75,
          thumbnail: "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=60&h=60&fit=crop&crop=center",
          description: "High-resolution images of traditional Ethiopian textiles",
        },
        {
          id: 5,
          title: "Ancient Scripts Audio Guide",
          type: "audio",
          size: "89.1 MB",
          downloadDate: null,
          lastAccessed: null,
          status: "queued",
          thumbnail: "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=60&h=60&fit=crop&crop=center",
          description: "Audio guide explaining ancient Ethiopian scripts",
        },
      ];

      setOfflineContent(mockOfflineContent);
    } catch (error) {
      console.error('Error loading offline content:', error);
    }
  };

  const checkStorageUsage = async () => {
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        setStorageUsage({
          used: estimate.usage || 0,
          total: estimate.quota || 0,
        });
      } else {
        // Fallback for browsers that don't support Storage API
        setStorageUsage({
          used: 250 * 1024 * 1024, // 250 MB
          total: 2 * 1024 * 1024 * 1024, // 2 GB
        });
      }
    } catch (error) {
      console.error('Error checking storage usage:', error);
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getContentIcon = (type) => {
    switch (type) {
      case '3d_tour':
        return <FolderIcon />;
      case 'video':
        return <VideoLibraryIcon />;
      case 'audio':
        return <AudioFileIcon />;
      case 'document':
        return <DescriptionIcon />;
      case 'image_gallery':
        return <ImageIcon />;
      default:
        return <DescriptionIcon />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'downloaded':
        return 'success';
      case 'downloading':
        return 'warning';
      case 'queued':
        return 'info';
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleDownload = (contentId) => {
    setOfflineContent(prev => prev.map(item => 
      item.id === contentId 
        ? { ...item, status: 'downloading', progress: 0 }
        : item
    ));

    // Simulate download progress
    const interval = setInterval(() => {
      setOfflineContent(prev => prev.map(item => {
        if (item.id === contentId && item.status === 'downloading') {
          const newProgress = Math.min(item.progress + Math.random() * 20, 100);
          if (newProgress >= 100) {
            clearInterval(interval);
            return {
              ...item,
              status: 'downloaded',
              progress: 100,
              downloadDate: new Date().toISOString().split('T')[0],
            };
          }
          return { ...item, progress: newProgress };
        }
        return item;
      }));
    }, 500);

    setSnackbar({
      open: true,
      message: 'Download started',
      severity: 'info',
    });
  };

  const handleDelete = (content) => {
    setSelectedContent(content);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedContent) {
      setOfflineContent(prev => prev.filter(item => item.id !== selectedContent.id));
      setSnackbar({
        open: true,
        message: `${selectedContent.title} deleted from offline storage`,
        severity: 'success',
      });
    }
    setDeleteDialogOpen(false);
    setSelectedContent(null);
  };

  const handleAutoDownloadToggle = (event) => {
    setAutoDownload(event.target.checked);
    setSnackbar({
      open: true,
      message: `Auto-download ${event.target.checked ? 'enabled' : 'disabled'}`,
      severity: 'info',
    });
  };

  const clearAllOfflineContent = () => {
    setOfflineContent(prev => prev.filter(item => item.status !== 'downloaded'));
    setSnackbar({
      open: true,
      message: 'All offline content cleared',
      severity: 'success',
    });
  };

  const storagePercentage = storageUsage.total > 0 
    ? (storageUsage.used / storageUsage.total) * 100 
    : 0;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <StorageIcon color="primary" />
          Offline Mode & Downloads
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Chip
            icon={isOnline ? <WifiIcon /> : <WifiOffIcon />}
            label={isOnline ? 'Online' : 'Offline'}
            color={isOnline ? 'success' : 'error'}
            variant="outlined"
          />
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadOfflineContent}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {!isOnline && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          You're currently offline. You can still access your downloaded content below.
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Storage Usage */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader title="Storage Usage" />
            <CardContent>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  {formatBytes(storageUsage.used)} of {formatBytes(storageUsage.total)} used
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={storagePercentage}
                  sx={{ height: 8, borderRadius: 4 }}
                  color={storagePercentage > 80 ? 'error' : storagePercentage > 60 ? 'warning' : 'primary'}
                />
                <Typography variant="caption" color="textSecondary">
                  {storagePercentage.toFixed(1)}% used
                </Typography>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle2">Auto-download favorites</Typography>
                <Switch
                  checked={autoDownload}
                  onChange={handleAutoDownloadToggle}
                  size="small"
                />
              </Box>
              
              <Button
                variant="outlined"
                color="error"
                fullWidth
                onClick={clearAllOfflineContent}
                startIcon={<DeleteIcon />}
              >
                Clear All Downloads
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Offline Content List */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader 
              title="Downloaded Content" 
              subheader={`${offlineContent.filter(item => item.status === 'downloaded').length} items available offline`}
            />
            <CardContent sx={{ p: 0 }}>
              <List>
                {offlineContent.map((item, index) => (
                  <React.Fragment key={item.id}>
                    <ListItem>
                      <ListItemIcon>
                        <Avatar sx={{ bgcolor: 'primary.light' }}>
                          {getContentIcon(item.type)}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {item.title}
                            <Chip
                              label={item.status}
                              size="small"
                              color={getStatusColor(item.status)}
                              variant="outlined"
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="textSecondary">
                              {item.description}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              Size: {item.size}
                              {item.downloadDate && ` • Downloaded: ${item.downloadDate}`}
                              {item.lastAccessed && ` • Last accessed: ${item.lastAccessed}`}
                            </Typography>
                            {item.status === 'downloading' && (
                              <Box sx={{ mt: 1 }}>
                                <LinearProgress
                                  variant="determinate"
                                  value={item.progress}
                                  sx={{ height: 4, borderRadius: 2 }}
                                />
                                <Typography variant="caption" color="textSecondary">
                                  {Math.round(item.progress)}% complete
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {item.status === 'queued' && (
                            <IconButton
                              edge="end"
                              onClick={() => handleDownload(item.id)}
                              color="primary"
                              disabled={!isOnline}
                            >
                              <CloudDownloadIcon />
                            </IconButton>
                          )}
                          {item.status === 'downloaded' && (
                            <>
                              <IconButton
                                edge="end"
                                onClick={() => {/* Open content */}}
                                color="primary"
                              >
                                <CheckCircleIcon />
                              </IconButton>
                              <IconButton
                                edge="end"
                                onClick={() => handleDelete(item)}
                                color="error"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </>
                          )}
                          {item.status === 'error' && (
                            <IconButton
                              edge="end"
                              onClick={() => handleDownload(item.id)}
                              color="error"
                              disabled={!isOnline}
                            >
                              <ErrorIcon />
                            </IconButton>
                          )}
                        </Box>
                      </ListItemSecondaryAction>
                    </ListItem>
                    {index < offlineContent.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
              
              {offlineContent.length === 0 && (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <CloudOffIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="textSecondary" gutterBottom>
                    No offline content available
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Download content to access it offline
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Offline Content</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedContent?.title}" from offline storage?
            This will free up {selectedContent?.size} of space.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </Box>
  );
};

export default OfflineMode;

