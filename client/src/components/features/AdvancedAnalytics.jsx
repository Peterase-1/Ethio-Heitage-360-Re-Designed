import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  IconButton,
  Tooltip,
  Divider,
  LinearProgress,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Visibility as VisibilityIcon,
  People as PeopleIcon,
  Museum as MuseumIcon,
  Public as PublicIcon,
  Schedule as ScheduleIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Analytics as AnalyticsIcon,
  LocationOn as LocationIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const AdvancedAnalytics = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [loading, setLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState({});

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      // Simulate API call with mock data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockData = {
        overview: {
          totalUsers: 15847,
          activeUsers: 3421,
          totalViews: 89234,
          avgSessionDuration: '8m 34s',
          bounceRate: 23.4,
          conversionRate: 12.8,
        },
        userGrowth: [
          { date: '2024-01-01', users: 1200, newUsers: 150, returningUsers: 1050 },
          { date: '2024-01-02', users: 1350, newUsers: 180, returningUsers: 1170 },
          { date: '2024-01-03', users: 1180, newUsers: 120, returningUsers: 1060 },
          { date: '2024-01-04', users: 1420, newUsers: 200, returningUsers: 1220 },
          { date: '2024-01-05', users: 1680, newUsers: 250, returningUsers: 1430 },
          { date: '2024-01-06', users: 1890, newUsers: 280, returningUsers: 1610 },
          { date: '2024-01-07', users: 2100, newUsers: 320, returningUsers: 1780 },
        ],
        contentPerformance: [
          { name: 'Axum Obelisks', views: 4500, engagement: 85, rating: 4.8 },
          { name: 'Lalibela Churches', views: 3800, engagement: 92, rating: 4.9 },
          { name: 'Ethiopian Manuscripts', views: 2900, engagement: 78, rating: 4.6 },
          { name: 'Traditional Textiles', views: 2400, engagement: 71, rating: 4.5 },
          { name: 'Coffee Culture', views: 2100, engagement: 88, rating: 4.7 },
        ],
        geographicData: [
          { country: 'Ethiopia', users: 8500, percentage: 53.6 },
          { country: 'United States', users: 2100, percentage: 13.2 },
          { country: 'United Kingdom', users: 1200, percentage: 7.6 },
          { country: 'Canada', users: 980, percentage: 6.2 },
          { country: 'Germany', users: 750, percentage: 4.7 },
          { country: 'Others', users: 2317, percentage: 14.7 },
        ],
        deviceBreakdown: [
          { name: 'Mobile', value: 65, color: '#8884d8' },
          { name: 'Desktop', value: 28, color: '#82ca9d' },
          { name: 'Tablet', value: 7, color: '#ffc658' },
        ],
        topSearchQueries: [
          { query: 'Lalibela churches', count: 1250, trend: 'up' },
          { query: 'Ethiopian coffee history', count: 980, trend: 'up' },
          { query: 'Axum obelisks', count: 850, trend: 'down' },
          { query: 'Traditional Ethiopian art', count: 720, trend: 'up' },
          { query: 'Harar city walls', count: 650, trend: 'stable' },
        ],
        userBehavior: {
          avgPagesPerSession: 4.2,
          avgTimeOnPage: '3m 45s',
          exitRate: 18.5,
          popularPaths: [
            'Home → Virtual Museum → Axum Obelisks',
            'Home → Heritage Sites → Lalibela',
            'Search → Ethiopian Coffee → Cultural Experience',
            'Home → Tours → Traditional Crafts Tour',
          ],
        },
      };

      setAnalyticsData(mockData);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up':
        return <TrendingUpIcon color="success" fontSize="small" />;
      case 'down':
        return <TrendingDownIcon color="error" fontSize="small" />;
      default:
        return null;
    }
  };

  const timeRangeOptions = [
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 3 Months' },
    { value: '1y', label: 'Last Year' },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AnalyticsIcon color="primary" />
          Advanced Analytics Dashboard
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              label="Time Range"
              onChange={(e) => setTimeRange(e.target.value)}
            >
              {timeRangeOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Tooltip title="Refresh Data">
            <IconButton onClick={fetchAnalyticsData} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button variant="outlined" startIcon={<DownloadIcon />}>
            Export Report
          </Button>
        </Box>
      </Box>

      {loading && <LinearProgress sx={{ mb: 3 }} />}

      {/* Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Total Users
                  </Typography>
                  <Typography variant="h4">
                    {formatNumber(analyticsData.overview?.totalUsers || 0)}
                  </Typography>
                  <Typography variant="body2" color="success.main">
                    +12.5% from last period
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <PeopleIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Active Users
                  </Typography>
                  <Typography variant="h4">
                    {formatNumber(analyticsData.overview?.activeUsers || 0)}
                  </Typography>
                  <Typography variant="body2" color="success.main">
                    +8.3% from last period
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <VisibilityIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Total Views
                  </Typography>
                  <Typography variant="h4">
                    {formatNumber(analyticsData.overview?.totalViews || 0)}
                  </Typography>
                  <Typography variant="body2" color="success.main">
                    +15.7% from last period
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'info.main' }}>
                  <MuseumIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Avg. Session Duration
                  </Typography>
                  <Typography variant="h4">
                    {analyticsData.overview?.avgSessionDuration || '0m 0s'}
                  </Typography>
                  <Typography variant="body2" color="success.main">
                    +2.1% from last period
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <ScheduleIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* User Growth Chart */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardHeader title="User Growth Trends" />
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analyticsData.userGrowth || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="newUsers"
                    stackId="1"
                    stroke="#8884d8"
                    fill="#8884d8"
                    name="New Users"
                  />
                  <Area
                    type="monotone"
                    dataKey="returningUsers"
                    stackId="1"
                    stroke="#82ca9d"
                    fill="#82ca9d"
                    name="Returning Users"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Device Breakdown */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardHeader title="Device Breakdown" />
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analyticsData.deviceBreakdown || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {(analyticsData.deviceBreakdown || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Content Performance */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardHeader title="Top Performing Content" />
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsData.contentPerformance || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip />
                  <Bar dataKey="views" fill="#8884d8" name="Views" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Geographic Distribution */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardHeader title="Geographic Distribution" />
            <CardContent>
              <List>
                {(analyticsData.geographicData || []).map((country, index) => (
                  <ListItem key={index}>
                    <ListItemAvatar>
                      <Avatar>
                        <LocationIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={country.country}
                      secondary={`${formatNumber(country.users)} users`}
                    />
                    <ListItemSecondaryAction>
                      <Chip
                        label={`${country.percentage}%`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Search Queries */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardHeader title="Top Search Queries" />
            <CardContent>
              <List>
                {(analyticsData.topSearchQueries || []).map((query, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={query.query}
                      secondary={`${formatNumber(query.count)} searches`}
                    />
                    <ListItemSecondaryAction>
                      {getTrendIcon(query.trend)}
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* User Behavior Insights */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardHeader title="User Behavior Insights" />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="h4" color="primary">
                    {analyticsData.userBehavior?.avgPagesPerSession || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Avg. Pages per Session
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="h4" color="primary">
                    {analyticsData.userBehavior?.avgTimeOnPage || '0m 0s'}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Avg. Time on Page
                  </Typography>
                </Grid>
              </Grid>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" gutterBottom>
                Popular User Paths:
              </Typography>
              {(analyticsData.userBehavior?.popularPaths || []).map((path, index) => (
                <Typography key={index} variant="body2" sx={{ mb: 1 }}>
                  {index + 1}. {path}
                </Typography>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdvancedAnalytics;

