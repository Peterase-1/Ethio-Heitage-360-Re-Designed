import React, { useState, useEffect, useCallback } from 'react';
import {
  Grid, Card, CardContent, CardHeader, Typography, Box, IconButton,
  Tooltip, Chip, LinearProgress, Avatar, List, ListItem, ListItemText,
  ListItemAvatar, Divider, Button, Menu, MenuItem, Dialog, DialogTitle,
  DialogContent, DialogActions, FormControl, InputLabel, Select, Switch,
  FormControlLabel, Slider, useTheme, alpha, Fade, Zoom, Grow, Collapse
} from '@mui/material';
import {
  DragIndicator, MoreVert, Visibility, VisibilityOff, Refresh, Settings,
  TrendingUp, TrendingDown, People, Museum, ArtTrack, Event, AttachMoney,
  AccessTime, Assessment, Speed, Security, Warning, CheckCircle, Error,
  Timeline, DonutLarge, BarChart, ShowChart, PieChart, TableChart,
  Fullscreen, FullscreenExit, Add, Remove, Edit, Delete, Save,
  FilterList, Sort, Search, BookmarkBorder, Bookmark
} from '@mui/icons-material';
import { format } from 'date-fns';

// Mock data for widgets
const generateMockMetrics = () => ({
  visitors: {
    current: 1247,
    previous: 1156,
    trend: 'up',
    percentage: 7.9
  },
  revenue: {
    current: 85400,
    previous: 79200,
    trend: 'up',
    percentage: 7.8
  },
  museums: {
    current: 45,
    previous: 42,
    trend: 'up',
    percentage: 7.1
  },
  artifacts: {
    current: 892,
    previous: 834,
    trend: 'up',
    percentage: 7.0
  },
  events: {
    current: 23,
    previous: 28,
    trend: 'down',
    percentage: 17.9
  },
  satisfaction: {
    current: 94.5,
    previous: 92.1,
    trend: 'up',
    percentage: 2.6
  }
});

const generateTimeSeriesData = () => {
  const data = [];
  const now = new Date();
  for (let i = 30; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    data.push({
      date: format(date, 'MMM dd'),
      visitors: Math.floor(Math.random() * 200) + 100,
      revenue: Math.floor(Math.random() * 5000) + 2000,
      artifacts: Math.floor(Math.random() * 20) + 10
    });
  }
  return data;
};

// Widget Components
const MetricWidget = ({ 
  title, 
  value, 
  previousValue, 
  icon: Icon, 
  color = 'primary', 
  format = 'number',
  loading = false,
  size = 'medium'
}) => {
  const theme = useTheme();
  const change = previousValue ? ((value - previousValue) / previousValue) * 100 : 0;
  const isPositive = change >= 0;

  const formatValue = (val) => {
    if (format === 'currency') return `ETB ${val.toLocaleString()}`;
    if (format === 'percentage') return `${val}%`;
    return val.toLocaleString();
  };

  const isSmall = size === 'small';

  return (
    <Box
      sx={{
        p: isSmall ? 2 : 3,
        borderRadius: 2,
        bgcolor: 'background.paper',
        border: `1px solid ${theme.palette.divider}`,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[4],
        },
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <Box display="flex" alignItems="flex-start" justifyContent="space-between">
        <Box flex={1}>
          <Typography 
            variant={isSmall ? "caption" : "body2"} 
            color="text.secondary" 
            fontWeight={600}
            gutterBottom
          >
            {title}
          </Typography>
          <Typography 
            variant={isSmall ? "h5" : "h3"} 
            fontWeight="bold" 
            color={`${color}.main`}
            sx={{ mb: 1 }}
          >
            {loading ? '...' : formatValue(value)}
          </Typography>
          {!loading && previousValue && (
            <Box display="flex" alignItems="center" gap={0.5}>
              {isPositive ? (
                <TrendingUp sx={{ fontSize: 16, color: 'success.main' }} />
              ) : (
                <TrendingDown sx={{ fontSize: 16, color: 'error.main' }} />
              )}
              <Typography 
                variant="caption" 
                color={isPositive ? 'success.main' : 'error.main'}
                fontWeight={600}
              >
                {Math.abs(change).toFixed(1)}%
              </Typography>
              <Typography variant="caption" color="text.secondary">
                vs last period
              </Typography>
            </Box>
          )}
        </Box>
        <Avatar
          sx={{
            width: isSmall ? 32 : 48,
            height: isSmall ? 32 : 48,
            bgcolor: alpha(theme.palette[color].main, 0.1),
            color: theme.palette[color].main,
          }}
        >
          <Icon sx={{ fontSize: isSmall ? 16 : 24 }} />
        </Avatar>
      </Box>
      
      {/* Decorative gradient overlay */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '30%',
          height: '100%',
          background: `linear-gradient(135deg, transparent 0%, ${alpha(theme.palette[color].main, 0.05)} 100%)`,
          pointerEvents: 'none'
        }}
      />
    </Box>
  );
};

const ProgressWidget = ({ title, items, color = 'primary' }) => {
  const theme = useTheme();

  return (
    <Card elevation={2} sx={{ height: '100%' }}>
      <CardHeader
        title={title}
        titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
        sx={{ pb: 1 }}
      />
      <CardContent sx={{ pt: 0 }}>
        <List dense>
          {items.map((item, index) => (
            <React.Fragment key={index}>
              <ListItem sx={{ px: 0, py: 1 }}>
                <Box sx={{ width: '100%' }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="body2" fontWeight={500}>
                      {item.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.current}/{item.target}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(item.current / item.target) * 100}
                    color={color}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      bgcolor: alpha(theme.palette[color].main, 0.1)
                    }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    {((item.current / item.target) * 100).toFixed(0)}% complete
                  </Typography>
                </Box>
              </ListItem>
              {index < items.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

const ActivityWidget = ({ title, activities, maxItems = 5 }) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'user': return <People fontSize="small" />;
      case 'artifact': return <ArtTrack fontSize="small" />;
      case 'museum': return <Museum fontSize="small" />;
      case 'event': return <Event fontSize="small" />;
      case 'payment': return <AttachMoney fontSize="small" />;
      default: return <CheckCircle fontSize="small" />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'user': return 'primary';
      case 'artifact': return 'secondary';
      case 'museum': return 'info';
      case 'event': return 'warning';
      case 'payment': return 'success';
      default: return 'default';
    }
  };

  return (
    <Card elevation={2} sx={{ height: '100%' }}>
      <CardHeader
        title={title}
        titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
        action={
          <IconButton size="small">
            <MoreVert />
          </IconButton>
        }
      />
      <CardContent sx={{ pt: 0, pb: '16px !important' }}>
        <List dense sx={{ py: 0 }}>
          {activities.slice(0, maxItems).map((activity, index) => (
            <React.Fragment key={index}>
              <ListItem sx={{ px: 0, py: 1 }}>
                <ListItemAvatar>
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: `${getActivityColor(activity.type)}.main`,
                    }}
                  >
                    {getActivityIcon(activity.type)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography variant="body2" fontWeight={500} noWrap>
                      {activity.title}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="caption" color="text.secondary">
                      {activity.time} • {activity.location}
                    </Typography>
                  }
                />
                <Chip
                  label={activity.status}
                  size="small"
                  color={activity.status === 'completed' ? 'success' : 
                         activity.status === 'pending' ? 'warning' : 'default'}
                  sx={{ fontSize: '0.6rem', height: 18 }}
                />
              </ListItem>
              {index < Math.min(activities.length, maxItems) - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
        {activities.length > maxItems && (
          <Button size="small" fullWidth sx={{ mt: 1 }}>
            View All Activities
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

const StatusWidget = ({ title, systems }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'operational': return 'success';
      case 'degraded': return 'warning';
      case 'down': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'operational': return <CheckCircle />;
      case 'degraded': return <Warning />;
      case 'down': return <Error />;
      default: return <AccessTime />;
    }
  };

  return (
    <Card elevation={2} sx={{ height: '100%' }}>
      <CardHeader
        title={title}
        titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
      />
      <CardContent sx={{ pt: 0 }}>
        <Box display="flex" flexDirection="column" gap={2}>
          {systems.map((system, index) => (
            <Box key={index} display="flex" alignItems="center" justifyContent="space-between">
              <Box display="flex" alignItems="center" gap={2}>
                <Box color={`${getStatusColor(system.status)}.main`}>
                  {getStatusIcon(system.status)}
                </Box>
                <Box>
                  <Typography variant="body2" fontWeight={500}>
                    {system.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {system.description}
                  </Typography>
                </Box>
              </Box>
              <Chip
                label={system.status.toUpperCase()}
                color={getStatusColor(system.status)}
                size="small"
                variant="outlined"
              />
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

const QuickStatsWidget = ({ stats }) => {
  return (
    <Card elevation={2} sx={{ height: '100%' }}>
      <CardHeader
        title="Quick Stats"
        titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
      />
      <CardContent sx={{ pt: 0 }}>
        <Grid container spacing={2}>
          {stats.map((stat, index) => (
            <Grid item xs={6} key={index}>
              <Box textAlign="center" p={1}>
                <Typography variant="h4" fontWeight="bold" color={`${stat.color}.main`}>
                  {stat.value}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {stat.label}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

// Main Dashboard Component
const InteractiveWidgetDashboard = () => {
  const theme = useTheme();
  const [widgets, setWidgets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const [widgetSettings, setWidgetSettings] = useState({
    autoRefresh: true,
    refreshInterval: 30,
    showTrends: true,
    compactMode: false,
    animations: true
  });

  // Initialize widgets
  useEffect(() => {
    const mockMetrics = generateMockMetrics();
    const timeSeriesData = generateTimeSeriesData();
    
    const mockActivities = [
      {
        title: 'New artifact submitted',
        time: '2 minutes ago',
        location: 'National Museum',
        status: 'pending',
        type: 'artifact'
      },
      {
        title: 'User registration completed',
        time: '5 minutes ago',
        location: 'Online',
        status: 'completed',
        type: 'user'
      },
      {
        title: 'Payment received',
        time: '10 minutes ago',
        location: 'Heritage Museum',
        status: 'completed',
        type: 'payment'
      },
      {
        title: 'Event published',
        time: '15 minutes ago',
        location: 'Cultural Center',
        status: 'completed',
        type: 'event'
      },
      {
        title: 'Museum profile updated',
        time: '30 minutes ago',
        location: 'Regional Museum',
        status: 'completed',
        type: 'museum'
      }
    ];

    const mockProgressItems = [
      { name: 'Artifact Digitization', current: 245, target: 300 },
      { name: 'Museum Onboarding', current: 12, target: 15 },
      { name: 'Event Planning', current: 8, target: 10 },
      { name: 'User Verification', current: 156, target: 200 }
    ];

    const mockSystems = [
      { name: 'Database', status: 'operational', description: 'All systems running' },
      { name: 'Authentication', status: 'operational', description: 'Login services active' },
      { name: 'File Storage', status: 'degraded', description: 'Slower than usual' },
      { name: 'Email Service', status: 'operational', description: 'Notifications working' }
    ];

    const mockQuickStats = [
      { label: 'Today\'s Visitors', value: '1.2K', color: 'primary' },
      { label: 'New Signups', value: '47', color: 'success' },
      { label: 'Active Museums', value: '45', color: 'info' },
      { label: 'Pending Reviews', value: '12', color: 'warning' }
    ];

    setWidgets([
      {
        id: 'visitors',
        type: 'metric',
        title: 'Total Visitors',
        component: <MetricWidget 
          title="Total Visitors" 
          value={mockMetrics.visitors.current}
          previousValue={mockMetrics.visitors.previous}
          icon={People}
          color="primary"
        />,
        size: { xs: 12, sm: 6, md: 3 },
        visible: true
      },
      {
        id: 'revenue',
        type: 'metric',
        title: 'Revenue',
        component: <MetricWidget 
          title="Revenue" 
          value={mockMetrics.revenue.current}
          previousValue={mockMetrics.revenue.previous}
          icon={AttachMoney}
          color="success"
          format="currency"
        />,
        size: { xs: 12, sm: 6, md: 3 },
        visible: true
      },
      {
        id: 'museums',
        type: 'metric',
        title: 'Active Museums',
        component: <MetricWidget 
          title="Active Museums" 
          value={mockMetrics.museums.current}
          previousValue={mockMetrics.museums.previous}
          icon={Museum}
          color="info"
        />,
        size: { xs: 12, sm: 6, md: 3 },
        visible: true
      },
      {
        id: 'satisfaction',
        type: 'metric',
        title: 'Satisfaction Rate',
        component: <MetricWidget 
          title="Satisfaction Rate" 
          value={mockMetrics.satisfaction.current}
          previousValue={mockMetrics.satisfaction.previous}
          icon={Assessment}
          color="warning"
          format="percentage"
        />,
        size: { xs: 12, sm: 6, md: 3 },
        visible: true
      },
      {
        id: 'progress',
        type: 'progress',
        title: 'Project Progress',
        component: <ProgressWidget title="Project Progress" items={mockProgressItems} />,
        size: { xs: 12, md: 6, lg: 4 },
        visible: true
      },
      {
        id: 'activity',
        type: 'activity',
        title: 'Recent Activity',
        component: <ActivityWidget title="Recent Activity" activities={mockActivities} />,
        size: { xs: 12, md: 6, lg: 4 },
        visible: true
      },
      {
        id: 'status',
        type: 'status',
        title: 'System Status',
        component: <StatusWidget title="System Status" systems={mockSystems} />,
        size: { xs: 12, md: 6, lg: 4 },
        visible: true
      },
      {
        id: 'quickstats',
        type: 'quickstats',
        title: 'Quick Stats',
        component: <QuickStatsWidget stats={mockQuickStats} />,
        size: { xs: 12, md: 6 },
        visible: true
      }
    ]);
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setRefreshing(false);
  }, []);

  const handleWidgetVisibilityToggle = (widgetId) => {
    setWidgets(prev => prev.map(widget => 
      widget.id === widgetId 
        ? { ...widget, visible: !widget.visible }
        : widget
    ));
  };

  const visibleWidgets = widgets.filter(widget => widget.visible);

  // Auto-refresh functionality
  useEffect(() => {
    if (!widgetSettings.autoRefresh) return;

    const interval = setInterval(() => {
      handleRefresh();
    }, widgetSettings.refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [widgetSettings.autoRefresh, widgetSettings.refreshInterval, handleRefresh]);

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Interactive Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Customizable widgets and real-time insights for your heritage platform
          </Typography>
        </Box>
        <Box display="flex" gap={1}>
          <Tooltip title="Refresh Dashboard">
            <IconButton onClick={handleRefresh} disabled={refreshing}>
              <Refresh className={refreshing ? 'animate-spin' : ''} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Dashboard Settings">
            <IconButton onClick={() => setSettingsOpen(true)}>
              <Settings />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Widgets Grid */}
      <Grid container spacing={3}>
        {visibleWidgets.map((widget, index) => (
          <Grid item {...widget.size} key={widget.id}>
            <Grow in timeout={300 + index * 100}>
              <Box
                sx={{
                  height: '100%',
                  opacity: refreshing ? 0.7 : 1,
                  transition: 'opacity 0.3s ease'
                }}
              >
                {widget.component}
              </Box>
            </Grow>
          </Grid>
        ))}
      </Grid>

      {/* Settings Dialog */}
      <Dialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Dashboard Settings</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={3} pt={1}>
            <FormControlLabel
              control={
                <Switch
                  checked={widgetSettings.autoRefresh}
                  onChange={(e) => setWidgetSettings(prev => ({
                    ...prev,
                    autoRefresh: e.target.checked
                  }))}
                />
              }
              label="Auto Refresh"
            />
            
            {widgetSettings.autoRefresh && (
              <Box>
                <Typography gutterBottom>Refresh Interval (seconds)</Typography>
                <Slider
                  value={widgetSettings.refreshInterval}
                  onChange={(e, value) => setWidgetSettings(prev => ({
                    ...prev,
                    refreshInterval: value
                  }))}
                  min={10}
                  max={300}
                  step={10}
                  marks={[
                    { value: 10, label: '10s' },
                    { value: 60, label: '1m' },
                    { value: 300, label: '5m' }
                  ]}
                  valueLabelDisplay="auto"
                />
              </Box>
            )}

            <FormControlLabel
              control={
                <Switch
                  checked={widgetSettings.showTrends}
                  onChange={(e) => setWidgetSettings(prev => ({
                    ...prev,
                    showTrends: e.target.checked
                  }))}
                />
              }
              label="Show Trend Indicators"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={widgetSettings.compactMode}
                  onChange={(e) => setWidgetSettings(prev => ({
                    ...prev,
                    compactMode: e.target.checked
                  }))}
                />
              }
              label="Compact Mode"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={widgetSettings.animations}
                  onChange={(e) => setWidgetSettings(prev => ({
                    ...prev,
                    animations: e.target.checked
                  }))}
                />
              }
              label="Enable Animations"
            />

            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Widget Visibility
            </Typography>
            <Box display="flex" flexDirection="column" gap={1}>
              {widgets.map(widget => (
                <FormControlLabel
                  key={widget.id}
                  control={
                    <Switch
                      checked={widget.visible}
                      onChange={() => handleWidgetVisibilityToggle(widget.id)}
                    />
                  }
                  label={widget.title}
                />
              ))}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InteractiveWidgetDashboard;
