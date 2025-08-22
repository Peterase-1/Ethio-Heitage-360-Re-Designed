import React, { useState } from 'react';
import MuseumAdminSidebar from '../dashboard/MuseumAdminSidebar';
import { 
  Box, Typography, Container, Grid, Paper, Button, Card, CardContent,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Tabs, Tab
} from '@mui/material';
import {
  BarChart3,
  Users,
  TrendingUp,
  DollarSign,
  Eye,
  Download,
  Calendar,
  Package
} from 'lucide-react';

const MuseumAnalytics = () => {
  const [tabValue, setTabValue] = useState(0);

  const analyticsData = {
    visitors: {
      total: 12450,
      monthly: 1245,
      growth: 15,
      demographics: {
        local: 60,
        international: 25,
        students: 15
      }
    },
    artifacts: {
      total: 156,
      onDisplay: 89,
      mostViewed: 'Ancient Ethiopian Vase',
      averageViews: 245
    },
    revenue: {
      total: 145000,
      monthly: 28500,
      growth: 22,
      sources: {
        admissions: 65,
        rentals: 25,
        events: 10
      }
    },
    engagement: {
      averageVisitDuration: 45,
      returnVisitors: 25,
      satisfaction: 4.7,
      socialShares: 156
    }
  };

  const renderVisitorAnalytics = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Visitor Overview</Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h4" color="primary.main">
                {analyticsData.visitors.total.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Visitors
              </Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" color="success.main">
                {analyticsData.visitors.monthly.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This Month (+{analyticsData.visitors.growth}%)
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Visitor Demographics</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography>Local Visitors</Typography>
                <Typography>{analyticsData.visitors.demographics.local}%</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography>International</Typography>
                <Typography>{analyticsData.visitors.demographics.international}%</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography>Students</Typography>
                <Typography>{analyticsData.visitors.demographics.students}%</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Monthly Visitor Trends</Typography>
          <Typography color="text.secondary">
            Interactive charts showing visitor patterns, peak hours, and seasonal trends would be displayed here.
          </Typography>
        </Paper>
      </Grid>
    </Grid>
  );

  const renderArtifactAnalytics = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Collection Stats</Typography>
            <Typography variant="h4" color="primary.main">
              {analyticsData.artifacts.total}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Artifacts
            </Typography>
            <Typography variant="h6" sx={{ mt: 2 }}>
              {analyticsData.artifacts.onDisplay}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              On Display
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={8}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Most Popular Artifacts</Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Artifact</TableCell>
                  <TableCell>Views</TableCell>
                  <TableCell>Engagement</TableCell>
                  <TableCell>Rating</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>Ancient Ethiopian Vase</TableCell>
                  <TableCell>2,450</TableCell>
                  <TableCell>85%</TableCell>
                  <TableCell>4.8</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Traditional Coffee Set</TableCell>
                  <TableCell>1,890</TableCell>
                  <TableCell>78%</TableCell>
                  <TableCell>4.6</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Historical Manuscript</TableCell>
                  <TableCell>1,450</TableCell>
                  <TableCell>72%</TableCell>
                  <TableCell>4.7</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Grid>
    </Grid>
  );

  const renderRevenueAnalytics = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Revenue Overview</Typography>
            <Typography variant="h4" color="success.main">
              {analyticsData.revenue.total.toLocaleString()} ETB
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Revenue
            </Typography>
            <Typography variant="h6" sx={{ mt: 2 }} color="primary.main">
              {analyticsData.revenue.monthly.toLocaleString()} ETB
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This Month (+{analyticsData.revenue.growth}%)
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Revenue Sources</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography>Admissions</Typography>
                <Typography>{analyticsData.revenue.sources.admissions}%</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography>Rentals</Typography>
                <Typography>{analyticsData.revenue.sources.rentals}%</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography>Events</Typography>
                <Typography>{analyticsData.revenue.sources.events}%</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <MuseumAdminSidebar />
      
      <div className="flex-1 overflow-auto">
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" component="h1" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
              <BarChart3 className="mr-3" size={32} />
              Analytics & Insights
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Comprehensive performance metrics and insights for your museum
            </Typography>
          </Box>

          {/* Key Metrics Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 3, textAlign: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                <Users size={32} className="mb-2" />
                <Typography variant="h4">{analyticsData.visitors.monthly.toLocaleString()}</Typography>
                <Typography variant="body2">Monthly Visitors</Typography>
                <Typography variant="caption">+{analyticsData.visitors.growth}% growth</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 3, textAlign: 'center', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
                <Package size={32} className="mb-2" />
                <Typography variant="h4">{analyticsData.artifacts.averageViews}</Typography>
                <Typography variant="body2">Avg. Artifact Views</Typography>
                <Typography variant="caption">Per artifact/month</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 3, textAlign: 'center', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
                <DollarSign size={32} className="mb-2" />
                <Typography variant="h4">{analyticsData.revenue.monthly.toLocaleString()}</Typography>
                <Typography variant="body2">Monthly Revenue</Typography>
                <Typography variant="caption">+{analyticsData.revenue.growth}% growth</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 3, textAlign: 'center', background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white' }}>
                <TrendingUp size={32} className="mb-2" />
                <Typography variant="h4">{analyticsData.engagement.satisfaction}</Typography>
                <Typography variant="body2">Satisfaction Rating</Typography>
                <Typography variant="caption">Out of 5.0</Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Export Options */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Analytics Dashboard</Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button variant="outlined" startIcon={<Calendar size={16} />}>
                  Date Range
                </Button>
                <Button variant="contained" startIcon={<Download size={16} />}>
                  Export Report
                </Button>
              </Box>
            </Box>
          </Paper>

          {/* Tabs */}
          <Paper sx={{ mb: 3 }}>
            <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
              <Tab label="Visitor Analytics" />
              <Tab label="Artifact Performance" />
              <Tab label="Revenue Tracking" />
            </Tabs>
          </Paper>

          {/* Tab Content */}
          {tabValue === 0 && renderVisitorAnalytics()}
          {tabValue === 1 && renderArtifactAnalytics()}
          {tabValue === 2 && renderRevenueAnalytics()}
        </Container>
      </div>
    </div>
  );
};

export default MuseumAnalytics;
