
import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import {
  Box, Button, Card, CardContent, CardHeader, Divider, Grid, TextField, Typography,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination,
  Paper, IconButton, Chip, Tooltip, Snackbar, Alert, LinearProgress, Dialog,
  DialogTitle, DialogContent, DialogActions, DialogContentText, useTheme, Tabs, Tab,
  FormControlLabel, Checkbox
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon, Cancel as CancelIcon, Visibility as VisibilityIcon,
  Edit as EditIcon, Delete as DeleteIcon, Search as SearchIcon, FilterList as FilterListIcon,
  CalendarToday as CalendarIcon, Person as PersonIcon, Museum as MuseumIcon, Assignment as AssignmentIcon
} from '@mui/icons-material';
import { format } from 'date-fns';

const MuseumRentalManagement = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedRental, setSelectedRental] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [action, setAction] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Real data for rental requests
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load rental requests from API
  useEffect(() => {
    loadRentals();
  }, []);

  const loadRentals = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading rental requests...');
      const response = await api.getRentalRequests();
      console.log('📋 Rental requests response:', response);

      if (response && response.success && response.data) {
        // Handle both old structure and new structure
        const rentalData = response.data.requests || response.data;
        setRentals(rentalData);
        console.log('✅ Loaded', rentalData.length, 'rental requests');
      } else {
        console.log('⚠️ No rental requests found');
        setRentals([]);
      }
    } catch (error) {
      console.error('❌ Error loading rental requests:', error);
      setRentals([]);
    } finally {
      setLoading(false);
    }
  };

  // Mock data for fallback (remove this after API is working)
  const mockRentals = [
    {
      id: 'R001',
      requester: 'John Doe',
      email: 'john@example.com',
      institution: 'University of Example',
      artifacts: ['A001', 'A002'],
      startDate: '2023-06-15',
      endDate: '2023-07-15',
      status: 'pending',
      purpose: 'Research and academic study',
      insuranceInfo: 'Provided',
      submittedAt: '2023-05-10T14:30:00Z',
      notes: 'Requires special handling for fragile items'
    },
    {
      id: 'R002',
      requester: 'Jane Smith',
      email: 'jane@example.com',
      institution: 'City Museum',
      artifacts: ['A003'],
      startDate: '2023-07-01',
      endDate: '2023-09-30',
      status: 'approved',
      purpose: 'Special exhibition',
      insuranceInfo: 'To be provided',
      submittedAt: '2023-04-25T09:15:00Z',
      approvedAt: '2023-04-28T16:45:00Z',
      approvedBy: 'Admin User'
    },
    {
      id: 'R003',
      requester: 'Robert Johnson',
      email: 'robert@example.com',
      institution: 'Historical Society',
      artifacts: ['A004', 'A005', 'A006'],
      startDate: '2023-08-10',
      endDate: '2023-08-25',
      status: 'rejected',
      purpose: 'Temporary display',
      insuranceInfo: 'Not provided',
      submittedAt: '2023-05-05T11:20:00Z',
      rejectedAt: '2023-05-08T10:10:00Z',
      rejectionReason: 'Insufficient insurance coverage',
      rejectedBy: 'Admin User'
    },
    {
      id: 'R004',
      requester: 'Emily Chen',
      email: 'emily@example.com',
      institution: 'National Heritage Foundation',
      artifacts: ['A007'],
      startDate: '2023-09-01',
      endDate: '2023-12-31',
      status: 'pending',
      purpose: 'Conservation research',
      insuranceInfo: 'Full coverage',
      submittedAt: '2023-05-12T15:45:00Z',
      notes: 'Requires climate-controlled environment'
    },
    {
      id: 'R005',
      requester: 'Michael Brown',
      email: 'michael@example.com',
      institution: 'Art Institute',
      artifacts: ['A008', 'A009'],
      startDate: '2023-07-20',
      endDate: '2023-08-20',
      status: 'approved',
      purpose: 'Educational program',
      insuranceInfo: 'Included in institutional policy',
      submittedAt: '2023-04-30T13:20:00Z',
      approvedAt: '2023-05-02T10:30:00Z',
      approvedBy: 'Admin User',
      notes: 'Special handling required for one artifact'
    }
  ];

  // Use real data
  const displayRentals = rentals;

  // Mock data for artifacts
  const artifacts = {
    'A001': { id: 'A001', title: 'Ancient Vase', period: '3000 BC', image: '/placeholder.jpg' },
    'A002': { id: 'A002', title: 'Bronze Statue', period: '1500 BC', image: '/placeholder.jpg' },
    'A003': { id: 'A003', title: 'Stone Tablet', period: '2000 BC', image: '/placeholder.jpg' },
    'A004': { id: 'A004', title: 'Gold Necklace', period: '1000 BC', image: '/placeholder.jpg' },
    'A005': { id: 'A005', title: 'Ceramic Bowl', period: '500 BC', image: '/placeholder.jpg' },
    'A006': { id: 'A006', title: 'Iron Dagger', period: '800 BC', image: '/placeholder.jpg' },
    'A007': { id: 'A007', title: 'Wooden Sculpture', period: '1200 AD', image: '/placeholder.jpg' },
    'A008': { id: 'A008', title: 'Silver Coin', period: '200 BC', image: '/placeholder.jpg' },
    'A009': { id: 'A009', title: 'Clay Tablet', period: '2500 BC', image: '/placeholder.jpg' }
  };

  // Filter rentals based on tab and search term
  const filteredRentals = displayRentals.filter(rental => {
    const matchesTab = tabValue === 0 ||
      (tabValue === 1 && rental.status === 'pending') ||
      (tabValue === 2 && rental.status === 'approved') ||
      (tabValue === 3 && rental.status === 'rejected');

    const matchesSearch = searchTerm === '' ||
      rental.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rental.requester.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rental.institution.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesTab && matchesSearch;
  });

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setPage(0); // Reset to first page when changing tabs
  };

  // Handle change page
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle change rows per page
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle action dialog open
  const handleActionClick = (rental, actionType) => {
    setSelectedRental(rental);
    setAction(actionType);
    setDialogOpen(true);
  };

  // Handle rental action (approve/reject)
  const handleRentalAction = async () => {
    try {
      console.log(`🔄 ${action} rental request:`, selectedRental.id);

      // Call API to update rental status
      const updateData = { status: action };
      if (action === 'rejected') {
        updateData.rejectionReason = document.getElementById('rejection-reason')?.value || 'No reason provided';
      }

      const response = await api.updateRentalRequest(selectedRental.id, updateData);
      console.log('📋 Update response:', response);

      if (response && response.success) {
        // Refresh the rental list
        await loadRentals();

        setDialogOpen(false);
        showSnackbar(
          `Rental request ${action === 'approved' ? 'approved' : 'rejected'} successfully`,
          'success'
        );
      } else {
        throw new Error(response?.message || 'Failed to update rental request');
      }
    } catch (error) {
      console.error('❌ Error updating rental request:', error);
      showSnackbar(
        `Failed to ${action} rental request: ${error.message}`,
        'error'
      );
    }
  };

  // Show snackbar
  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  // Get status chip color
  const getStatusChip = (status) => {
    switch (status) {
      case 'approved':
        return <Chip label="Approved" color="success" size="small" />;
      case 'rejected':
        return <Chip label="Rejected" color="error" size="small" />;
      default:
        return <Chip label="Pending" color="warning" size="small" />;
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return dateString ? format(new Date(dateString), 'MMM d, yyyy') : 'N/A';
  };

  // Tabs
  const tabs = [
    { label: 'All Requests', value: 0 },
    { label: 'Pending', value: 1 },
    { label: 'Approved', value: 2 },
    { label: 'Rejected', value: 3 }
  ];

  return (
    <Box>
      <Card>
        <CardHeader
          title="Rental Management"
          subheader="Manage artifact loan requests and track their status"
          action={
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<SearchIcon />}
                onClick={loadRentals}
                disabled={loading}
              >
                Refresh
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AssignmentIcon />}
                onClick={() => {
                  // TODO: Implement export functionality
                  showSnackbar('Export functionality coming soon', 'info');
                }}
              >
                Export
              </Button>
            </Box>
          }
        />

        <Divider />

        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="scrollable"
            scrollButtons="auto"
          >
            {tabs.map(tab => (
              <Tab key={tab.value} label={tab.label} />
            ))}
          </Tabs>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="Search rentals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />
              }}
              sx={{ mr: 2, minWidth: 250 }}
            />
            <Tooltip title="Filters">
              <IconButton>
                <FilterListIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Divider />

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Request ID</TableCell>
                <TableCell>Requester</TableCell>
                <TableCell>Institution</TableCell>
                <TableCell>Artifacts</TableCell>
                <TableCell>Rental Period</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Submitted</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <LinearProgress />
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Loading rental requests...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : filteredRentals.length > 0 ? (
                filteredRentals
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((rental) => (
                    <TableRow key={rental.id} hover>
                      <TableCell>{rental.id}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PersonIcon fontSize="small" color="action" />
                          <Box>
                            <Typography variant="body2">{rental.requester}</Typography>
                            <Typography variant="caption" color="textSecondary">
                              {rental.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <MuseumIcon fontSize="small" color="action" />
                          {rental.institution}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {rental.artifacts.slice(0, 2).map(artifactId => (
                            <Chip
                              key={artifactId}
                              label={artifacts[artifactId]?.title || artifactId}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                          {rental.artifacts.length > 2 && (
                            <Chip
                              label={`+${rental.artifacts.length - 2} more`}
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CalendarIcon fontSize="small" color="action" />
                          <Box>
                            <Typography variant="body2">
                              {formatDate(rental.startDate)} - {formatDate(rental.endDate)}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {Math.ceil((new Date(rental.endDate) - new Date(rental.startDate)) / (1000 * 60 * 60 * 24))} days
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{getStatusChip(rental.status)}</TableCell>
                      <TableCell>{formatDate(rental.submittedAt)}</TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => handleActionClick(rental, 'view')}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          {rental.status === 'pending' && (
                            <>
                              <Tooltip title="Approve">
                                <IconButton
                                  size="small"
                                  color="success"
                                  onClick={() => handleActionClick(rental, 'approve')}
                                >
                                  <CheckCircleIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>

                              <Tooltip title="Reject">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleActionClick(rental, 'reject')}
                                >
                                  <CancelIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="textSecondary">
                      No rental requests found
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                      {searchTerm ? 'Try adjusting your search' : 'All caught up!'}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredRentals.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>

      {/* Rental Details/Approval/Rejection Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {action === 'view' ? 'Rental Request Details' :
            action === 'approve' ? 'Approve Rental Request' : 'Reject Rental Request'}
        </DialogTitle>

        <DialogContent dividers>
          {selectedRental && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>Request Information</Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="textSecondary">Request ID</Typography>
                  <Typography variant="body1">{selectedRental.id}</Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="textSecondary">Status</Typography>
                  {getStatusChip(selectedRental.status)}
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="textSecondary">Submitted On</Typography>
                  <Typography variant="body1">{formatDate(selectedRental.submittedAt)}</Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="textSecondary">Rental Period</Typography>
                  <Typography variant="body1">
                    {formatDate(selectedRental.startDate)} to {formatDate(selectedRental.endDate)}
                    {' '}({Math.ceil((new Date(selectedRental.endDate) - new Date(selectedRental.startDate)) / (1000 * 60 * 60 * 24))} days)
                  </Typography>
                </Box>

                {selectedRental.status === 'approved' && selectedRental.approvedAt && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="textSecondary">Approved On</Typography>
                    <Typography variant="body1">
                      {formatDate(selectedRental.approvedAt)} by {selectedRental.approvedBy}
                    </Typography>
                  </Box>
                )}

                {selectedRental.status === 'rejected' && selectedRental.rejectedAt && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="textSecondary">Rejected On</Typography>
                    <Typography variant="body1">
                      {formatDate(selectedRental.rejectedAt)} by {selectedRental.rejectedBy}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>Reason</Typography>
                    <Typography variant="body1">{selectedRental.rejectionReason}</Typography>
                  </Box>
                )}
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>Requester Information</Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="textSecondary">Name</Typography>
                  <Typography variant="body1">{selectedRental.requester}</Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="textSecondary">Email</Typography>
                  <Typography variant="body1">{selectedRental.email}</Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="textSecondary">Institution</Typography>
                  <Typography variant="body1">{selectedRental.institution}</Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="textSecondary">Purpose</Typography>
                  <Typography variant="body1">{selectedRental.purpose}</Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="textSecondary">Insurance Information</Typography>
                  <Typography variant="body1">{selectedRental.insuranceInfo || 'Not provided'}</Typography>
                </Box>

                {selectedRental.notes && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="textSecondary">Notes</Typography>
                    <Typography variant="body1">{selectedRental.notes}</Typography>
                  </Box>
                )}
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>Requested Artifacts</Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Artifact</TableCell>
                        <TableCell>Period</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedRental.artifacts.map(artifactId => {
                        const artifact = artifacts[artifactId] || { id: artifactId, title: 'Unknown Artifact' };
                        return (
                          <TableRow key={artifactId}>
                            <TableCell>{artifact.id}</TableCell>
                            <TableCell>{artifact.title}</TableCell>
                            <TableCell>{artifact.period || 'N/A'}</TableCell>
                            <TableCell>
                              <Chip
                                label={selectedRental.status === 'pending' ? 'Pending' :
                                  selectedRental.status === 'approved' ? 'Approved' : 'Rejected'}
                                size="small"
                                color={selectedRental.status === 'approved' ? 'success' :
                                  selectedRental.status === 'rejected' ? 'error' : 'default'}
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>

              {(action === 'approve' || action === 'reject') && (
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />

                  {action === 'approve' ? (
                    <Box>
                      <Typography variant="subtitle1" gutterBottom>Approval Details</Typography>
                      <Typography variant="body2" color="textSecondary" paragraph>
                        By approving this request, you confirm that all necessary documentation has been reviewed and the loan terms are acceptable.
                      </Typography>

                      <FormControlLabel
                        control={<Checkbox required />}
                        label="I confirm that I have reviewed all documentation and approve this request"
                      />
                    </Box>
                  ) : (
                    <Box>
                      <Typography variant="subtitle1" gutterBottom>Rejection Reason</Typography>
                      <Typography variant="body2" color="textSecondary" paragraph>
                        Please provide a reason for rejecting this request. This will be shared with the requester.
                      </Typography>

                      <TextField
                        fullWidth
                        id="rejection-reason"
                        label="Reason for rejection"
                        multiline
                        rows={4}
                        variant="outlined"
                        required
                        defaultValue={selectedRental.rejectionReason || ''}
                      />
                    </Box>
                  )}
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
            {action === 'view' ? 'Close' : 'Cancel'}
          </Button>

          {(action === 'approve' || action === 'reject') && (
            <Button
              onClick={handleRentalAction}
              variant="contained"
              color={action === 'approve' ? 'success' : 'error'}
              type="submit"
              form={action === 'approve' ? 'approve-form' : 'reject-form'}
            >
              {action === 'approve' ? 'Approve Request' : 'Reject Request'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MuseumRentalManagement;

