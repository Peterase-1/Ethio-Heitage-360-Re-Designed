

import { useState } from 'react';
import {
  Box, Button, Card, CardContent, Chip, Dialog, DialogActions,
  DialogContent, DialogTitle, Divider, IconButton, LinearProgress,
  MenuItem, Paper, Select, Table, TableBody, TableCell, TableContainer,
  TableHead, TablePagination, TableRow, TextField, Typography, useTheme,
  Avatar, FormControl, InputLabel, Snackbar, Alert, Tooltip, Tabs, Tab, Badge
} from '@mui/material';
import {
  Search as SearchIcon, Refresh as RefreshIcon, CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon, LocalShipping as LocalShippingIcon, EventAvailable as EventAvailableIcon,
  EventBusy as EventBusyIcon, AccessTime as AccessTimeIcon, Event as EventIcon,
  Person as PersonIcon, Museum as MuseumIcon, Info as InfoIcon
} from '@mui/icons-material';

const RentalOversight = ({ onRefresh, loading = false }) => {
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedRental, setSelectedRental] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState('');
  const [actionNotes, setActionNotes] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Mock data - replace with real data from props/API
  const mockRentals = Array.from({ length: 15 }, (_, i) => ({
    id: `rental-${i + 1}`,
    artifact: { name: `Artifact ${i + 1}`, value: 500 + (i * 100) },
    renter: { name: `User ${i + 1}`, email: `user${i + 1}@example.com` },
    status: ['pending', 'approved', 'in-progress', 'completed', 'cancelled'][i % 5],
    startDate: new Date(Date.now() - (i * 2 * 24 * 60 * 60 * 1000)),
    endDate: new Date(Date.now() + ((i + 5) * 24 * 60 * 60 * 1000)),
    requestDate: new Date(Date.now() - ((i + 2) * 24 * 60 * 60 * 1000)),
    totalAmount: 500 + (i * 100),
  }));

  const handleTabChange = (_, newValue) => {
    setActiveTab(newValue);
    setPage(0);
  };

  const handleChangePage = (_, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const handleViewRental = (rental) => {
    setSelectedRental(rental);
    setViewDialogOpen(true);
  };

  const handleRentalAction = (rental, action) => {
    setSelectedRental(rental);
    setActionType(action);
    setActionNotes('');
    setActionDialogOpen(true);
  };

  const confirmRentalAction = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSnackbar({
        open: true,
        message: `Rental ${actionType} successfully!`,
        severity: 'success',
      });
      setActionDialogOpen(false);
      setViewDialogOpen(false);
      if (onRefresh) onRefresh();
    } catch (error) {
      setSnackbar({
        open: true,
        message: `Failed to ${actionType} rental. Please try again.`,
        severity: 'error',
      });
    }
  };

  const filteredRentals = mockRentals
    .filter(rental => {
      const matchesTab = activeTab === 'all' || rental.status === activeTab;
      const matchesSearch = 
        rental.artifact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rental.renter.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'all' || rental.status === filterStatus;
      return matchesTab && matchesSearch && matchesStatus;
    })
    .sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate));

  const paginatedRentals = filteredRentals.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const tabOptions = [
    { value: 'all', label: 'All Rentals', count: mockRentals.length },
    { value: 'pending', label: 'Pending', count: mockRentals.filter(r => r.status === 'pending').length },
    { value: 'approved', label: 'Upcoming', count: mockRentals.filter(r => r.status === 'approved').length },
    { value: 'in-progress', label: 'Active', count: mockRentals.filter(r => r.status === 'in-progress').length },
  ];

  const getStatusColor = (status) => ({
    approved: 'success',
    'in-progress': 'info',
    completed: 'primary',
    cancelled: 'error',
    rejected: 'error',
    pending: 'warning'
  }[status] || 'default');

  const getStatusIcon = (status) => ({
    approved: <CheckCircleIcon fontSize="small" />,
    'in-progress': <LocalShippingIcon fontSize="small" />,
    completed: <EventAvailableIcon fontSize="small" />,
    cancelled: <EventBusyIcon fontSize="small" />,
    pending: <AccessTimeIcon fontSize="small" />,
  }[status] || <EventIcon fontSize="small" />);

  const getAvailableActions = (status) => {
    switch (status) {
      case 'pending': return [
        { type: 'approve', label: 'Approve', color: 'success' },
        { type: 'reject', label: 'Reject', color: 'error' },
      ];
      case 'approved': return [
        { type: 'check-out', label: 'Check Out', color: 'info' },
        { type: 'cancel', label: 'Cancel', color: 'warning' },
      ];
      case 'in-progress': return [
        { type: 'check-in', label: 'Check In', color: 'primary' },
      ];
      default: return [];
    }
  };

  const formatDate = (date) => new Date(date).toLocaleDateString('en-US');
  const formatCurrency = (amount) => `ETB ${amount.toLocaleString()}`;

  return (
    <Card elevation={0}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">
            Rental Management
            <Typography variant="body2" color="text.secondary" component="span" sx={{ ml: 1 }}>
              ({filteredRentals.length} rentals)
            </Typography>
          </Typography>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={onRefresh} disabled={loading}>
            Refresh
          </Button>
        </Box>
        
        <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
          {tabOptions.map(tab => (
            <Tab key={tab.value} value={tab.value} label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {tab.label}
                <Badge badgeContent={tab.count} color="primary" sx={{ ml: 1 }} max={999} />
              </Box>
            } />
          ))}
        </Tabs>
        
        <Box sx={{ display: 'flex', gap: 2, my: 2, flexWrap: 'wrap' }}>
          <TextField
            size="small"
            placeholder="Search rentals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
            }}
            sx={{ minWidth: 250 }}
          />
          
          <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Status</InputLabel>
            <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} label="Status">
              {statusOptions.map(option => (
                <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {loading ? (
          <LinearProgress />
        ) : (
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Rental</TableCell>
                  <TableCell>Artifact</TableCell>
                  <TableCell>Renter</TableCell>
                  <TableCell>Dates</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedRentals.map((rental) => {
                  const actions = getAvailableActions(rental.status);
                  return (
                    <TableRow key={rental.id} hover>
                      <TableCell>#{rental.id.split('-')[1]}</TableCell>
                      <TableCell>{rental.artifact.name}</TableCell>
                      <TableCell>{rental.renter.name}</TableCell>
                      <TableCell>
                        {formatDate(rental.startDate)} - {formatDate(rental.endDate)}
                      </TableCell>
                      <TableCell>{formatCurrency(rental.totalAmount)}</TableCell>
                      <TableCell>
                        <Chip 
                          label={rental.status}
                          color={getStatusColor(rental.status)}
                          size="small"
                          icon={getStatusIcon(rental.status)}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                          <Tooltip title="View Details">
                            <IconButton size="small" onClick={() => handleViewRental(rental)}>
                              <InfoIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          {actions.map(action => (
                            <Button
                              key={action.type}
                              variant="outlined"
                              size="small"
                              color={action.color}
                              onClick={() => handleRentalAction(rental, action.type)}
                            >
                              {action.label}
                            </Button>
                          ))}
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {paginatedRentals.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">No rentals found</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredRentals.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </TableContainer>
        )}
      </CardContent>

      {/* Rental Details Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="sm" fullWidth>
        {selectedRental && (
          <>
            <DialogTitle>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                Rental #{selectedRental.id.split('-')[1]}
                <Chip 
                  label={selectedRental.status}
                  color={getStatusColor(selectedRental.status)}
                  icon={getStatusIcon(selectedRental.status)}
                />
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Artifact</Typography>
                  <Typography>{selectedRental.artifact.name}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Renter</Typography>
                  <Typography>{selectedRental.renter.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedRental.renter.email}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Rental Period</Typography>
                  <Typography>
                    {formatDate(selectedRental.startDate)} - {formatDate(selectedRental.endDate)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Total Amount</Typography>
                  <Typography variant="h6">{formatCurrency(selectedRental.totalAmount)}</Typography>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
              {getAvailableActions(selectedRental.status).map(action => (
                <Button 
                  key={action.type}
                  color={action.color}
                  variant="contained"
                  onClick={() => handleRentalAction(selectedRental, action.type)}
                >
                  {action.label}
                </Button>
              ))}
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Action Confirmation Dialog */}
      <Dialog open={actionDialogOpen} onClose={() => setActionDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Confirm Action</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Are you sure you want to {actionType} this rental?
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            margin="normal"
            label="Notes (optional)"
            value={actionNotes}
            onChange={(e) => setActionNotes(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={confirmRentalAction} 
            variant="contained"
            color={
              actionType === 'approve' ? 'success' :
              actionType === 'reject' ? 'error' :
              actionType === 'check-out' ? 'info' :
              actionType === 'check-in' ? 'primary' : 'default'
            }
          >
            Confirm {actionType}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Card>
  );
};

export default RentalOversight;
