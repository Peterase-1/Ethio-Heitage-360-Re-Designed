import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Container, Grid, Paper, Button, TextField,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem, Snackbar, Alert,
  CircularProgress, Tooltip, FormHelperText, Card, CardContent,
  CardHeader, Divider, Tabs, Tab, Avatar, List, ListItem, ListItemText,
  ListItemAvatar, ListItemSecondaryAction
} from '@mui/material';
import {
  PersonAdd, Search, FilterList, CheckCircle, Cancel, Visibility,
  TrendingUp, People, AttachMoney, CalendarToday, Person
} from '@mui/icons-material';
import { format } from 'date-fns';
import api from '../../utils/api';

const VisitorRegistration = () => {
  // State management
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [analytics, setAnalytics] = useState({
    overview: {
      totalVisitors: 0,
      todayVisitors: 0,
      thisWeekVisitors: 0,
      thisMonthVisitors: 0
    },
    distribution: {
      byType: [],
      byStatus: []
    },
    trends: {
      dailyVisitors: []
    },
    revenue: {
      totalRevenue: 0,
      averageRevenue: 0,
      maxRevenue: 0,
      minRevenue: 0
    }
  });

  // Dialog states
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState(null);

  // Filter and search states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [tabValue, setTabValue] = useState(0);

  // Ethiopian default data
  const ethiopianNationalities = [
    'Ethiopian', 'Ethiopian (Oromo)', 'Ethiopian (Amhara)', 'Ethiopian (Tigray)',
    'Ethiopian (Gurage)', 'Ethiopian (Sidama)', 'Ethiopian (Wolayta)', 'Ethiopian (Afar)',
    'Ethiopian (Somali)', 'Ethiopian (Gamo)', 'Ethiopian (Hadiya)', 'Ethiopian (Kembata)'
  ];

  const ethiopianCities = [
    'Addis Ababa', 'Dire Dawa', 'Bahir Dar', 'Gondar', 'Mekelle',
    'Hawassa', 'Jimma', 'Harar', 'Adama', 'Arba Minch',
    'Dessie', 'Sodo', 'Shashamane', 'Jijiga', 'Nekemte'
  ];

  // Form data for new registration
  const [formData, setFormData] = useState({
    visitorInfo: {
      name: '',
      email: '',
      phone: '',
      age: '',
      gender: '',
      nationality: '',
      visitorType: ''
    },
    visitDetails: {
      visitDate: format(new Date(), 'yyyy-MM-dd'),
      visitTime: format(new Date(), 'HH:mm'),
      groupSize: 1,
      visitPurpose: '',
      expectedDuration: 2
    },
    payment: {
      amount: 50, // Default Ethiopian museum entry fee
      paymentMethod: 'cash'
    },
    specialRequirements: '',
    notes: ''
  });

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadRegistrations(),
        loadAnalytics()
      ]);
    } catch (error) {
      console.error('Load data error:', error);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadRegistrations = async () => {
    try {
      console.log('🔄 Loading visitor registrations...');
      const response = await api.getVisitorRegistrations({
        page: 1,
        limit: 1000
      });
      console.log('📋 Registrations response:', response);

      if (response && response.success && response.data) {
        setRegistrations(response.data.registrations || []);
        console.log('✅ Set registrations:', response.data.registrations?.length || 0, 'registrations');
      } else {
        console.log('⚠️ No registrations data found');
        setRegistrations([]);
      }
    } catch (error) {
      console.error('❌ Load registrations error:', error);
      setError('Failed to load visitor registrations');
    }
  };

  const loadAnalytics = async () => {
    try {
      console.log('🔄 Loading visitor analytics...');
      const response = await api.getVisitorAnalytics();
      console.log('📊 Analytics response:', response);

      if (response && response.success && response.data) {
        setAnalytics(response.data);
        console.log('✅ Set analytics data');
      } else {
        console.log('⚠️ No analytics data found');
      }
    } catch (error) {
      console.error('❌ Load analytics error:', error);
      setError('Failed to load analytics data');
    }
  };

  const handleCreateRegistration = async (e) => {
    e.preventDefault();
    try {
      console.log('🔄 Creating visitor registration...', formData);
      const response = await api.registerVisitor(formData);
      console.log('✅ Registration created successfully:', response);

      setSuccess('Visitor registered successfully!');
      setShowRegistrationModal(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Create registration error:', error);
      setError('Failed to register visitor');
    }
  };

  const handleUpdateStatus = async (registrationId, status) => {
    try {
      console.log('🔄 Updating visitor status...', { registrationId, status });
      await api.updateVisitorStatus(registrationId, { status });
      console.log('✅ Status updated successfully');

      setSuccess('Visitor status updated successfully!');
      loadData();
    } catch (error) {
      console.error('Update status error:', error);
      setError('Failed to update visitor status');
    }
  };

  const resetForm = () => {
    setFormData({
      visitorInfo: {
        name: '',
        email: '',
        phone: '',
        age: '',
        gender: '',
        nationality: '',
        visitorType: ''
      },
      visitDetails: {
        visitDate: format(new Date(), 'yyyy-MM-dd'),
        visitTime: format(new Date(), 'HH:mm'),
        groupSize: 1,
        visitPurpose: '',
        expectedDuration: 2
      },
      payment: {
        amount: 50, // Default Ethiopian museum entry fee
        paymentMethod: 'cash'
      },
      specialRequirements: '',
      notes: ''
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'registered': return 'default';
      case 'checked_in': return 'success';
      case 'checked_out': return 'info';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'registered': return <Person />;
      case 'checked_in': return <CheckCircle />;
      case 'checked_out': return <Cancel />;
      case 'cancelled': return <Cancel />;
      default: return <Person />;
    }
  };

  const filteredRegistrations = registrations.filter(registration => {
    const matchesSearch = !searchTerm ||
      registration.registrationId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registration.visitorInfo?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registration.visitorInfo?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || registration.status === filterStatus;
    const matchesType = filterType === 'all' || registration.visitorInfo?.visitorType === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const renderAnalyticsOverview = () => (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                  {analytics.overview.totalVisitors}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Visitors
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: '#1976d2' }}>
                <People />
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
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                  {analytics.overview.todayVisitors}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Today's Visitors
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: '#2e7d32' }}>
                <CalendarToday />
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
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#ed6c02' }}>
                  {analytics.overview.thisWeekVisitors}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  This Week
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: '#ed6c02' }}>
                <TrendingUp />
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
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#9c27b0' }}>
                  ETB {analytics.revenue.totalRevenue.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Revenue
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: '#9c27b0' }}>
                <AttachMoney />
              </Avatar>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderRegistrationForm = () => (
    <Dialog open={showRegistrationModal} onClose={() => setShowRegistrationModal(false)} maxWidth="md" fullWidth>
      <DialogTitle>Register New Visitor</DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleCreateRegistration} sx={{ pt: 2 }}>
          <Grid container spacing={2}>
            {/* Visitor Information */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2 }}>Visitor Information</Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Full Name"
                value={formData.visitorInfo.name}
                onChange={(e) => setFormData({
                  ...formData,
                  visitorInfo: { ...formData.visitorInfo, name: e.target.value }
                })}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.visitorInfo.email}
                onChange={(e) => setFormData({
                  ...formData,
                  visitorInfo: { ...formData.visitorInfo, email: e.target.value }
                })}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone Number"
                value={formData.visitorInfo.phone}
                onChange={(e) => setFormData({
                  ...formData,
                  visitorInfo: { ...formData.visitorInfo, phone: e.target.value }
                })}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Age"
                type="number"
                value={formData.visitorInfo.age}
                onChange={(e) => setFormData({
                  ...formData,
                  visitorInfo: { ...formData.visitorInfo, age: e.target.value }
                })}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Gender</InputLabel>
                <Select
                  value={formData.visitorInfo.gender}
                  onChange={(e) => setFormData({
                    ...formData,
                    visitorInfo: { ...formData.visitorInfo, gender: e.target.value }
                  })}
                  label="Gender"
                >
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                  <MenuItem value="prefer_not_to_say">Prefer not to say</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Nationality</InputLabel>
                <Select
                  value={formData.visitorInfo.nationality}
                  onChange={(e) => setFormData({
                    ...formData,
                    visitorInfo: { ...formData.visitorInfo, nationality: e.target.value }
                  })}
                  label="Nationality"
                >
                  {ethiopianNationalities.map((nationality) => (
                    <MenuItem key={nationality} value={nationality}>
                      {nationality}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Visitor Type</InputLabel>
                <Select
                  value={formData.visitorInfo.visitorType}
                  onChange={(e) => setFormData({
                    ...formData,
                    visitorInfo: { ...formData.visitorInfo, visitorType: e.target.value }
                  })}
                  label="Visitor Type"
                >
                  <MenuItem value="local">Local</MenuItem>
                  <MenuItem value="international">International</MenuItem>
                  <MenuItem value="student">Student</MenuItem>
                  <MenuItem value="researcher">Researcher</MenuItem>
                  <MenuItem value="tourist">Tourist</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Visit Details */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, mt: 2 }}>Visit Details</Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Visit Date"
                type="date"
                value={formData.visitDetails.visitDate}
                onChange={(e) => setFormData({
                  ...formData,
                  visitDetails: { ...formData.visitDetails, visitDate: e.target.value }
                })}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Visit Time"
                type="time"
                value={formData.visitDetails.visitTime}
                onChange={(e) => setFormData({
                  ...formData,
                  visitDetails: { ...formData.visitDetails, visitTime: e.target.value }
                })}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Group Size"
                type="number"
                value={formData.visitDetails.groupSize}
                onChange={(e) => setFormData({
                  ...formData,
                  visitDetails: { ...formData.visitDetails, groupSize: e.target.value }
                })}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Visit Purpose</InputLabel>
                <Select
                  value={formData.visitDetails.visitPurpose}
                  onChange={(e) => setFormData({
                    ...formData,
                    visitDetails: { ...formData.visitDetails, visitPurpose: e.target.value }
                  })}
                  label="Visit Purpose"
                >
                  <MenuItem value="education">Education</MenuItem>
                  <MenuItem value="research">Research</MenuItem>
                  <MenuItem value="tourism">Tourism</MenuItem>
                  <MenuItem value="cultural">Cultural</MenuItem>
                  <MenuItem value="family">Family</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Expected Duration (hours)"
                type="number"
                value={formData.visitDetails.expectedDuration}
                onChange={(e) => setFormData({
                  ...formData,
                  visitDetails: { ...formData.visitDetails, expectedDuration: e.target.value }
                })}
                required
              />
            </Grid>

            {/* Payment Information */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, mt: 2 }}>Payment Information</Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Amount (ETB)"
                type="number"
                value={formData.payment.amount}
                onChange={(e) => setFormData({
                  ...formData,
                  payment: { ...formData.payment, amount: e.target.value }
                })}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Payment Method</InputLabel>
                <Select
                  value={formData.payment.paymentMethod}
                  onChange={(e) => setFormData({
                    ...formData,
                    payment: { ...formData.payment, paymentMethod: e.target.value }
                  })}
                  label="Payment Method"
                >
                  <MenuItem value="cash">Cash</MenuItem>
                  <MenuItem value="card">Card</MenuItem>
                  <MenuItem value="mobile_money">Mobile Money</MenuItem>
                  <MenuItem value="free">Free</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Special Requirements"
                multiline
                rows={2}
                value={formData.specialRequirements}
                onChange={(e) => setFormData({
                  ...formData,
                  specialRequirements: e.target.value
                })}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({
                  ...formData,
                  notes: e.target.value
                })}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setShowRegistrationModal(false)}>Cancel</Button>
        <Button onClick={handleCreateRegistration} variant="contained">
          Register Visitor
        </Button>
      </DialogActions>
    </Dialog>
  );

  const renderRegistrationsTable = () => (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Visitor Registrations</Typography>
        <Button
          variant="contained"
          startIcon={<PersonAdd />}
          onClick={() => setShowRegistrationModal(true)}
          sx={{ bgcolor: '#1976d2' }}
        >
          Register Visitor
        </Button>
      </Box>

      {/* Filters */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
            }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              label="Status"
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="registered">Registered</MenuItem>
              <MenuItem value="checked_in">Checked In</MenuItem>
              <MenuItem value="checked_out">Checked Out</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel>Visitor Type</InputLabel>
            <Select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              label="Visitor Type"
            >
              <MenuItem value="all">All Types</MenuItem>
              <MenuItem value="local">Local</MenuItem>
              <MenuItem value="international">International</MenuItem>
              <MenuItem value="student">Student</MenuItem>
              <MenuItem value="researcher">Researcher</MenuItem>
              <MenuItem value="tourist">Tourist</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Loading registrations...</Typography>
        </Box>
      ) : filteredRegistrations.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            No visitor registrations found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Register your first visitor to get started
          </Typography>
        </Box>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Registration ID</TableCell>
                <TableCell>Visitor</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Visit Date</TableCell>
                <TableCell>Payment</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRegistrations.map((registration) => (
                <TableRow key={registration._id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                      #{registration.registrationId}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        {registration.visitorInfo?.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {registration.visitorInfo?.email}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={registration.visitorInfo?.visitorType}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={registration.status}
                      color={getStatusColor(registration.status)}
                      size="small"
                      icon={getStatusIcon(registration.status)}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {format(new Date(registration.visitDetails?.visitDate), 'MMM dd, yyyy')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {registration.visitDetails?.visitTime}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      ETB {registration.payment?.amount?.toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {registration.payment?.paymentMethod}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedRegistration(registration);
                            setShowDetailModal(true);
                          }}
                          sx={{ color: 'primary.main' }}
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      {registration.status === 'registered' && (
                        <Tooltip title="Check In">
                          <IconButton
                            size="small"
                            onClick={() => handleUpdateStatus(registration._id, 'checked_in')}
                            sx={{ color: 'success.main' }}
                          >
                            <CheckCircle />
                          </IconButton>
                        </Tooltip>
                      )}
                      {registration.status === 'checked_in' && (
                        <Tooltip title="Check Out">
                          <IconButton
                            size="small"
                            onClick={() => handleUpdateStatus(registration._id, 'checked_out')}
                            sx={{ color: 'info.main' }}
                          >
                            <Cancel />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>
          Visitor Registration & Analytics
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Register visitors and track museum analytics
        </Typography>
      </Box>

      {/* Analytics Overview */}
      {renderAnalyticsOverview()}

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Registrations" />
          <Tab label="Analytics" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {tabValue === 0 && renderRegistrationsTable()}
      {tabValue === 1 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 3 }}>Analytics Dashboard</Typography>
          <Typography variant="body2" color="text.secondary">
            Detailed analytics will be displayed here based on visitor registration data.
          </Typography>
        </Paper>
      )}

      {/* Registration Form Modal */}
      {renderRegistrationForm()}

      {/* Success/Error Messages */}
      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess('')}
      >
        <Alert onClose={() => setSuccess('')} severity="success">
          {success}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
      >
        <Alert onClose={() => setError('')} severity="error">
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default VisitorRegistration;
