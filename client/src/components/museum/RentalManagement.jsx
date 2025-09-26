import React, { useState, useEffect } from 'react';
import MuseumAdminSidebar from '../dashboard/MuseumAdminSidebar';
import {
  Box, Typography, Container, Grid, Paper, Button, TextField,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem, Snackbar, Alert,
  CircularProgress, Tooltip, FormHelperText
} from '@mui/material';
import {
  DollarSign, Clock, CheckCircle, XCircle, Eye, FileText,
  AlertTriangle, Plus, RefreshCw, Search, Building2, Package
} from 'lucide-react';
import api from '../../utils/api';

const RentalManagement = () => {
  // State management
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [artifacts, setArtifacts] = useState([]);
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    totalRevenue: 0
  });

  // Dialog states
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);

  // Filter and search states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');

  // Form data
  const [formData, setFormData] = useState({
    requestType: 'museum_to_super', // Museum can only create museum_to_super requests
    artifactId: '',
    duration: '',
    startDate: '',
    endDate: '',
    rentalFee: '',
    description: '',
    specialRequirements: '',
    contactPerson: '',
    contactPhone: '',
    contactEmail: ''
  });

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  // Recalculate stats when requests change
  useEffect(() => {
    loadStats();
  }, [requests]);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading rental data...');
      await Promise.all([
        loadRequests(),
        loadArtifacts()
      ]);
      console.log('✅ Rental data loaded successfully');
    } catch (error) {
      console.error('❌ Error loading rental data:', error);
      setError('Failed to load rental data');
    } finally {
      setLoading(false);
    }
  };

  const loadRequests = async () => {
    try {
      console.log('🔄 Loading rental requests...');
      const response = await api.getAllRentalRequests({
        page: 1,
        limit: 1000
      });
      console.log('📋 Query params:', { page: 1, limit: 1000 });
      console.log('📋 Requests response:', response);

      let requestsData = [];
      if (response && response.success && response.data && response.data.requests) {
        requestsData = response.data.requests;
        console.log('✅ Set requests from response.data.requests:', requestsData.length, 'requests');
      } else if (response && response.data && Array.isArray(response.data)) {
        requestsData = response.data;
        console.log('✅ Set requests from response.data:', requestsData.length, 'requests');
      } else if (response && Array.isArray(response)) {
        requestsData = response;
        console.log('✅ Set requests from response array:', requestsData.length, 'requests');
      } else {
        console.log('⚠️ No valid requests data found, setting empty array');
        console.log('🔍 Full response structure:', JSON.stringify(response, null, 2));
        requestsData = [];
      }

      setRequests(requestsData);
      console.log('✅ Final requests set:', requestsData.length, 'requests');
    } catch (error) {
      console.error('❌ Load requests error:', error);
      setError('Failed to load rental requests');
      setRequests([]);
    }
  };

  const loadArtifacts = async () => {
    try {
      console.log('🔄 Loading museum artifacts...');
      const response = await api.getRentalArtifacts();
      console.log('🏛️ Load artifacts response:', response);

      // Handle different response structures
      let artifacts = [];
      if (response && response.success && response.data && Array.isArray(response.data)) {
        artifacts = response.data;
        console.log('✅ Setting artifacts from response.data:', artifacts?.length || 0, 'artifacts');
      } else if (response && response.data && Array.isArray(response.data)) {
        artifacts = response.data;
        console.log('✅ Setting artifacts from response.data fallback:', artifacts?.length || 0, 'artifacts');
      } else if (response && Array.isArray(response)) {
        artifacts = response;
        console.log('✅ Setting artifacts from response:', artifacts?.length || 0, 'artifacts');
      } else {
        console.log('⚠️ No valid artifacts data found, setting empty array');
        console.log('🔍 Full artifacts response structure:', JSON.stringify(response, null, 2));
        artifacts = [];
      }

      setArtifacts(artifacts);
    } catch (error) {
      console.error('❌ Load artifacts error:', error);
      setArtifacts([]);
    }
  };

  const loadStats = async () => {
    try {
      console.log('🔄 Loading museum stats...');
      // Calculate stats from requests data
      const allRequests = requests && Array.isArray(requests) ? requests : [];
      console.log('📊 Calculating stats from', allRequests.length, 'requests');

      const totalRequests = allRequests.length;
      const pendingRequests = allRequests.filter(req => req.status === 'pending').length;
      const approvedRequests = allRequests.filter(req => req.status === 'approved').length;
      const totalRevenue = allRequests
        .filter(req => req.status === 'approved')
        .reduce((sum, req) => sum + (parseFloat(req.rentalFee) || 0), 0);

      const stats = {
        totalRequests,
        pendingRequests,
        approvedRequests,
        totalRevenue
      };

      console.log('✅ Calculated stats:', stats);
      setStats(stats);
    } catch (error) {
      console.error('❌ Load stats error:', error);
      // Set default stats on error
      setStats({
        totalRequests: 0,
        pendingRequests: 0,
        approvedRequests: 0,
        totalRevenue: 0
      });
    }
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    try {
      const response = await api.createRentalRequest(formData);
      setShowCreateModal(false);
      setSuccess('Rental request created successfully!');
      setFormData({
        requestType: 'museum_to_super',
        artifactId: '',
        duration: '',
        startDate: '',
        endDate: '',
        rentalFee: '',
        description: '',
        specialRequirements: '',
        contactPerson: '',
        contactPhone: '',
        contactEmail: ''
      });
      loadData();
    } catch (error) {
      console.error('Create request error:', error);
      setError('Failed to create rental request');
    }
  };

  const handleApproveRequest = async (requestId) => {
    try {
      await api.updateRentalRequestStatus(requestId, {
        status: 'approved',
        role: 'museum_admin'
      });
      setSuccess('Request approved successfully!');
      setShowApprovalModal(false);
      loadData();
    } catch (error) {
      console.error('Approve request error:', error);
      setError('Failed to approve request');
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await api.updateRentalRequestStatus(requestId, {
        status: 'rejected',
        role: 'museum_admin'
      });
      setSuccess('Request rejected successfully!');
      setShowApprovalModal(false);
      loadData();
    } catch (error) {
      console.error('Reject request error:', error);
      setError('Failed to reject request');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'completed': return 'info';
      default: return 'default';
    }
  };

  const getDirectionColor = (requestType) => {
    return requestType === 'museum_to_super' ? 'primary' : 'secondary';
  };

  const canMuseumApprove = (request) => {
    return request.requestType === 'super_to_museum' && request.status === 'pending';
  };

  const filteredRequests = (requests && Array.isArray(requests) ? requests : []).filter(request => {
    const matchesSearch = !searchTerm ||
      request.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.requestId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
    const matchesType = filterType === 'all' || request.requestType === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <MuseumAdminSidebar />

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: '#1f2937' }}>
                Rental System
              </Typography>
              <Typography variant="body1" sx={{ color: '#6b7280', mt: 1 }}>
                Manage artifact rental requests and transactions
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<Plus />}
              onClick={() => setShowCreateModal(true)}
              sx={{
                backgroundColor: '#3b82f6',
                '&:hover': { backgroundColor: '#2563eb' },
                px: 3,
                py: 1.5,
                borderRadius: 2
              }}
            >
              Create Request
            </Button>
          </Box>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Total Requests
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1f2937' }}>
                    {loading ? <CircularProgress size={24} /> : stats.totalRequests}
                  </Typography>
                </Box>
                <Box sx={{ backgroundColor: '#dbeafe', p: 2, borderRadius: 2 }}>
                  <FileText sx={{ color: '#3b82f6', fontSize: 24 }} />
                </Box>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Pending
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#d97706' }}>
                    {loading ? <CircularProgress size={24} /> : stats.pendingRequests}
                  </Typography>
                </Box>
                <Box sx={{ backgroundColor: '#fef3c7', p: 2, borderRadius: 2 }}>
                  <Clock sx={{ color: '#d97706', fontSize: 24 }} />
                </Box>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Approved
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#059669' }}>
                    {loading ? <CircularProgress size={24} /> : stats.approvedRequests}
                  </Typography>
                </Box>
                <Box sx={{ backgroundColor: '#d1fae5', p: 2, borderRadius: 2 }}>
                  <CheckCircle sx={{ color: '#059669', fontSize: 24 }} />
                </Box>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Total Revenue
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1f2937' }}>
                    {loading ? <CircularProgress size={24} /> : `ETB ${stats.totalRevenue.toLocaleString()}`}
                  </Typography>
                </Box>
                <Box sx={{ backgroundColor: '#d1fae5', p: 2, borderRadius: 2 }}>
                  <DollarSign sx={{ color: '#059669', fontSize: 24 }} />
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Filters and Search */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 2, boxShadow: 1 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  label="Status"
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  label="Type"
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="museum_to_super">Museum → Super</MenuItem>
                  <MenuItem value="super_to_museum">Super → Museum</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                variant="outlined"
                startIcon={<RefreshCw />}
                onClick={loadData}
                fullWidth
                sx={{ borderRadius: 2, py: 1.5 }}
              >
                Refresh
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Requests Table */}
        <Paper sx={{ borderRadius: 2, boxShadow: 1, overflow: 'hidden' }}>
          <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="h6" sx={{ fontWeight: 'semibold', color: '#1f2937' }}>
              Rental Requests ({filteredRequests.length})
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage and track all rental requests
            </Typography>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
              <CircularProgress />
              <Typography sx={{ ml: 2 }}>Loading requests...</Typography>
            </Box>
          ) : filteredRequests.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Package sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" sx={{ mb: 1 }}>
                No requests found
              </Typography>
              <Typography color="text.secondary">
                No rental requests match your current filters.
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Request ID</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Artifact</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Duration</TableCell>
                    <TableCell>Fee</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredRequests.map((request) => (
                    <TableRow key={request._id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                          #{request.requestId}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={request.requestType === 'museum_to_super' ? 'Museum → Super' : 'Super → Museum'}
                          color={getDirectionColor(request.requestType)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                            {request.artifact?.name || 'Unknown Artifact'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {request.artifact?.category || ''}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={request.status}
                          color={getStatusColor(request.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {request.duration} days
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          ETB {parseFloat(request.rentalFee || 0).toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(request.createdAt).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedRequest(request);
                                setShowDetailModal(true);
                              }}
                              sx={{ color: 'primary.main' }}
                            >
                              <Eye />
                            </IconButton>
                          </Tooltip>
                          {canMuseumApprove(request) && (
                            <Tooltip title="Review Request">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setShowApprovalModal(true);
                                }}
                                sx={{ color: 'success.main' }}
                              >
                                <CheckCircle />
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

        {/* Create Request Modal */}
        <Dialog open={showCreateModal} onClose={() => setShowCreateModal(false)} maxWidth="md" fullWidth>
          <DialogTitle>Create Rental Request</DialogTitle>
          <DialogContent>
            <Box component="form" onSubmit={handleCreateRequest} sx={{ pt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Artifact</InputLabel>
                    <Select
                      value={formData.artifactId}
                      onChange={(e) => setFormData({ ...formData, artifactId: e.target.value })}
                      label="Artifact"
                    >
                      {artifacts.map((artifact) => (
                        <MenuItem key={artifact._id} value={artifact._id}>
                          {artifact.name} - {artifact.category}
                        </MenuItem>
                      ))}
                    </Select>
                    {artifacts.length === 0 && (
                      <FormHelperText>No artifacts available. Please add artifacts to your museum first.</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Duration (days)"
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Start Date"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="End Date"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Rental Fee (ETB)"
                    type="number"
                    value={formData.rentalFee}
                    onChange={(e) => setFormData({ ...formData, rentalFee: e.target.value })}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    multiline
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Special Requirements"
                    multiline
                    rows={2}
                    value={formData.specialRequirements}
                    onChange={(e) => setFormData({ ...formData, specialRequirements: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Contact Person"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Contact Phone"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Contact Email"
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    required
                  />
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button onClick={handleCreateRequest} variant="contained">
              Create Request
            </Button>
          </DialogActions>
        </Dialog>

        {/* Detail Modal */}
        <Dialog open={showDetailModal} onClose={() => setShowDetailModal(false)} maxWidth="md" fullWidth>
          <DialogTitle>Request Details - #{selectedRequest?.requestId}</DialogTitle>
          <DialogContent>
            {selectedRequest && (
              <Grid container spacing={2} sx={{ pt: 2 }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                  <Chip
                    label={selectedRequest.status}
                    color={getStatusColor(selectedRequest.status)}
                    size="small"
                    sx={{ mt: 1 }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Type</Typography>
                  <Chip
                    label={selectedRequest.requestType === 'museum_to_super' ? 'Museum → Super' : 'Super → Museum'}
                    color={getDirectionColor(selectedRequest.requestType)}
                    size="small"
                    sx={{ mt: 1 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Description</Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {selectedRequest.description}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Duration</Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {selectedRequest.duration} days
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Rental Fee</Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    ETB {parseFloat(selectedRequest.rentalFee || 0).toLocaleString()}
                  </Typography>
                </Grid>
                {selectedRequest.specialRequirements && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">Special Requirements</Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {selectedRequest.specialRequirements}
                    </Typography>
                  </Grid>
                )}
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" color="text.secondary">Contact Person</Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {selectedRequest.contactPerson}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" color="text.secondary">Contact Phone</Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {selectedRequest.contactPhone}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" color="text.secondary">Contact Email</Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {selectedRequest.contactEmail}
                  </Typography>
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowDetailModal(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Approval Modal */}
        <Dialog open={showApprovalModal} onClose={() => setShowApprovalModal(false)}>
          <DialogTitle>Review Request - #{selectedRequest?.requestId}</DialogTitle>
          <DialogContent>
            <Typography>
              Do you want to approve or reject this rental request?
            </Typography>
            {selectedRequest && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Artifact:</strong> {selectedRequest.artifact?.name || 'Unknown'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Duration:</strong> {selectedRequest.duration} days
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Fee:</strong> ETB {parseFloat(selectedRequest.rentalFee || 0).toLocaleString()}
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowApprovalModal(false)}>Cancel</Button>
            <Button onClick={() => handleRejectRequest(selectedRequest?._id)} color="error">
              Reject
            </Button>
            <Button onClick={() => handleApproveRequest(selectedRequest?._id)} color="success" variant="contained">
              Approve
            </Button>
          </DialogActions>
        </Dialog>

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
      </Box>
    </div>
  );
};

export default RentalManagement;