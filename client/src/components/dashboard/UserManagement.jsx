import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { format } from 'date-fns';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
  useTheme,
  Avatar,
  MenuItem,
  CircularProgress,
  Grid,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Stack,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
  Select,
  FormControl,
  InputLabel,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon,
  PersonOff as PersonOffIcon,
  PersonAddDisabled as PersonAddDisabledIcon,
  Visibility as VisibilityIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';

const UserManagement = ({ 
  users = [], 
  onApprove, 
  onReject, 
  onRefresh, 
  onBulkAction,
  loading = false 
}) => {
  const { hasRole } = useAuth();
  const theme = useTheme();
  
  // State for pagination and selection
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selected, setSelected] = useState([]);
  
  // State for dialogs
  const [selectedUser, setSelectedUser] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [bulkActionDialogOpen, setBulkActionDialogOpen] = useState(false);
  
  // State for form values
  const [rejectionReason, setRejectionReason] = useState('');
  const [bulkAction, setBulkAction] = useState('approve');
  const [bulkRejectionReason, setBulkRejectionReason] = useState('');
  
  // State for filtering and sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  
  // State for feedback
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  
  // State for verification and audit trail
  const [verificationStatus, setVerificationStatus] = useState({});
  const [auditLogs, setAuditLogs] = useState([]);
  const [showAuditLogs, setShowAuditLogs] = useState(false);
  
  // Mock audit log data (replace with API call in production)
  useEffect(() => {
    // In a real app, fetch audit logs from your API
    const mockAuditLogs = [
      {
        id: 1,
        action: 'ACCOUNT_APPROVED',
        targetUser: 'admin@example.com',
        performedBy: 'system@example.com',
        timestamp: new Date().toISOString(),
        details: 'Account approved by system admin',
      },
      // Add more mock logs as needed
    ];
    setAuditLogs(mockAuditLogs);
  }, []);
  
  // Add audit log entry
  const addAuditLog = (action, targetUser, details = '') => {
    const newLog = {
      id: Date.now(),
      action,
      targetUser: targetUser?.email || 'Unknown',
      performedBy: 'current_user@example.com', // Replace with actual user from auth context
      timestamp: new Date().toISOString(),
      details,
    };
    setAuditLogs(prevLogs => [newLog, ...prevLogs]);
  };

  // Handle sort request
  const handleRequestSort = (property) => {
    const isAsc = sortConfig.key === property && sortConfig.direction === 'asc';
    setSortConfig({
      key: property,
      direction: isAsc ? 'desc' : 'asc',
    });
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

  // Handle view user details
  const handleViewUser = (user) => {
    setSelectedUser(user);
    setViewDialogOpen(true);
  };

  // Handle user approval with verification
  const handleApprove = async (user) => {
    try {
      await onApprove(user.id);
      addAuditLog('ACCOUNT_APPROVED', user, `Approved ${user.role} account for ${user.email}`);
      
      setSnackbar({
        open: true,
        message: `${user.name || 'User'} approved successfully`,
        severity: 'success',
      });
      
      // Update local state
      setSelected(selected.filter(id => id !== user.id));
      
      // Refresh the user list
      if (onRefresh) onRefresh();
      
    } catch (error) {
      console.error('Approval error:', error);
      setSnackbar({
        open: true,
        message: `Failed to approve user: ${error.message || 'Unknown error'}`,
        severity: 'error',
      });
    }
  };

  // Handle bulk approval/rejection
  const handleBulkAction = async () => {
    if (selected.length === 0) return;
    
    try {
      const action = bulkAction === 'approve' ? 'approved' : 'rejected';
      const reason = bulkAction === 'reject' ? bulkRejectionReason : '';
      
      // Call the bulk action handler with selected user IDs and action
      if (onBulkAction) {
        await onBulkAction(selected, bulkAction, reason);
      } else if (bulkAction === 'approve') {
        // Fallback to individual approvals if no bulk handler provided
        await Promise.all(selected.map(userId => {
          const user = users.find(u => u.id === userId);
          return onApprove?.(userId);
        }));
      } else if (bulkAction === 'reject') {
        // Fallback to individual rejections if no bulk handler provided
        await Promise.all(selected.map(userId => {
          return onReject?.(userId, reason);
        }));
      }
      
      // Add audit log for bulk action
      addAuditLog(
        `BULK_${bulkAction.toUpperCase()}`,
        { email: `${selected.length} users` },
        `Bulk ${action} ${selected.length} user accounts`
      );
      
      setSnackbar({
        open: true,
        message: `${selected.length} users ${action} successfully`,
        severity: 'success',
      });
      
      // Reset selection and close dialog
      setSelected([]);
      setBulkActionDialogOpen(false);
      setBulkRejectionReason('');
      
      // Refresh the user list
      if (onRefresh) onRefresh();
      
    } catch (error) {
      console.error('Bulk action error:', error);
      setSnackbar({
        open: true,
        message: `Failed to process bulk action: ${error.message || 'Unknown error'}`,
        severity: 'error',
      });
    }
  };
  
  // Handle reject user
  const handleReject = async () => {
    if (!selectedUser) return;
    
    if (!rejectionReason.trim()) {
      setSnackbar({
        open: true,
        message: 'Please provide a reason for rejection.',
        severity: 'warning',
      });
      return;
    }

    try {
      await onReject(selectedUser.id, rejectionReason);
      addAuditLog('ACCOUNT_REJECTED', selectedUser, `Rejected ${selectedUser.role} account for ${selectedUser.email} with reason: ${rejectionReason}`);
      
      setRejectDialogOpen(false);
      setRejectionReason('');
      setSnackbar({
        open: true,
        message: 'User rejected successfully.',
        severity: 'success',
      });
      
      // Update local state
      setSelected(selected.filter(id => id !== selectedUser.id));
      
      // Refresh the user list
      if (onRefresh) onRefresh();
      
    } catch (error) {
      console.error('Rejection error:', error);
      setSnackbar({
        open: true,
        message: `Failed to reject user: ${error.message || 'Unknown error'}`,
        severity: 'error',
      });
    }
  };

  // Filter and sort users
  const filteredUsers = useMemo(() => {
    let sortableUsers = [...users];

    // Filter by search term
    if (searchTerm) {
      sortableUsers = sortableUsers.filter(
        (user) =>
          user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.role?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      sortableUsers = sortableUsers.filter(
        (user) => user.status === statusFilter
      );
    }

    // Sort
    if (sortConfig.key) {
      sortableUsers.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableUsers;
  }, [users, searchTerm, statusFilter, sortConfig]);

  // Pagination
  const paginatedUsers = filteredUsers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Status options for filter
  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'pending', label: 'Pending Approval' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
  ];

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircleIcon fontSize="small" />;
      case 'rejected':
        return <CancelIcon fontSize="small" />;
      case 'pending':
        return <PersonAddDisabledIcon fontSize="small" />;
      default:
        return null;
    }
  };

  // Handle checkbox selection
  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = filteredUsers.map((user) => user.id);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }
    setSelected(newSelected);
  };

  const isSelected = (id) => selected.indexOf(id) !== -1;

  return (
    <>
      <Card elevation={0}>
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" component="div">
              User Management
            </Typography>
            <Box>
              <Button
                variant="contained"
                color="primary"
                startIcon={<PersonAddIcon />}
                sx={{ mr: 1 }}
              >
                Add User
              </Button>
              <Tooltip title="Refresh">
                <IconButton onClick={onRefresh} disabled={loading}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          
          {/* Filters and Search */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <TextField
              size="small"
              placeholder="Search users..."
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
              }}
              sx={{ minWidth: 250 }}
            />
            
            <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
              <InputLabel id="status-filter-label">Status</InputLabel>
              <Select
                labelId="status-filter-label"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status"
                startAdornment={
                  <FilterListIcon sx={{ color: 'text.secondary', mr: 1 }} />
                }
              >
                {statusOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {selected.length > 0 && (
              <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
                <InputLabel id="bulk-action-label">Bulk Actions</InputLabel>
                <Select
                  labelId="bulk-action-label"
                  value={bulkAction}
                  onChange={(e) => setBulkAction(e.target.value)}
                  label="Bulk Actions"
                >
                  <MenuItem value="approve">Approve Selected</MenuItem>
                  <MenuItem value="reject">Reject Selected</MenuItem>
                </Select>
              </FormControl>
            )}
            {selected.length > 0 && (
              <Button
                variant="contained"
                color={bulkAction === 'approve' ? 'success' : 'error'}
                onClick={() => setBulkActionDialogOpen(true)}
                disabled={selected.length === 0}
              >
                Apply Bulk Action
              </Button>
            )}
          </Box>

          {/* Users Table */}
          <Paper variant="outlined">
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox
                        indeterminate={selected.length > 0 && selected.length < filteredUsers.length}
                        checked={filteredUsers.length > 0 && selected.length === filteredUsers.length}
                        onChange={handleSelectAllClick}
                        inputProps={{ 'aria-label': 'select all desserts' }}
                      />
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={sortConfig.key === 'name'}
                        direction={sortConfig.direction}
                        onClick={() => handleRequestSort('name')}
                      >
                        User
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={sortConfig.key === 'email'}
                        direction={sortConfig.direction}
                        onClick={() => handleRequestSort('email')}
                      >
                        Email
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={sortConfig.key === 'role'}
                        direction={sortConfig.direction}
                        onClick={() => handleRequestSort('role')}
                      >
                        Role
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={sortConfig.key === 'status'}
                        direction={sortConfig.direction}
                        onClick={() => handleRequestSort('status')}
                      >
                        Status
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={sortConfig.key === 'createdAt'}
                        direction={sortConfig.direction}
                        onClick={() => handleRequestSort('createdAt')}
                      >
                        Registration Date
                      </TableSortLabel>
                    </TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                        <CircularProgress />
                      </TableCell>
                    </TableRow>
                  ) : paginatedUsers.length > 0 ? (
                    paginatedUsers.map((user) => {
                      const isItemSelected = isSelected(user.id);
                      return (
                        <TableRow
                          hover
                          onClick={(event) => handleClick(event, user.id)}
                          role="checkbox"
                          aria-checked={isItemSelected}
                          tabIndex={-1}
                          key={user.id}
                          selected={isItemSelected}
                        >
                          <TableCell padding="checkbox">
                            <Checkbox
                              checked={isItemSelected}
                              inputProps={{ 'aria-labelledby': `enhanced-table-checkbox-${user.id}` }}
                            />
                          </TableCell>
                          <TableCell component="th" scope="row" padding="none">
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar 
                                src={user.avatar} 
                                alt={user.name}
                                sx={{ width: 36, height: 36, mr: 2 }}
                              >
                                {user.name?.charAt(0) || <PersonIcon />}
                              </Avatar>
                              <Box>
                                <Typography variant="subtitle2">{user.name}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                  @{user.username || 'user' + user.id}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Chip 
                              label={user.role || 'User'} 
                              size="small" 
                              variant="outlined"
                              color={user.role === 'admin' ? 'primary' : 'default'}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={user.status || 'pending'} 
                              size="small"
                              color={getStatusColor(user.status)}
                              icon={getStatusIcon(user.status)}
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            {format(new Date(user.createdAt), 'PPP')}
                          </TableCell>
                          <TableCell align="right">
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                              <Tooltip title="View Details">
                                <IconButton 
                                  size="small" 
                                  onClick={(e) => { e.stopPropagation(); handleViewUser(user); }}
                                  color="info"
                                >
                                  <VisibilityIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              
                              {user.status === 'pending' && (
                                <>
                                  <Tooltip title="Approve">
                                    <IconButton 
                                      size="small" 
                                      color="success"
                                      onClick={(e) => { e.stopPropagation(); handleApprove(user); }}
                                    >
                                      <CheckCircleIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Reject">
                                    <IconButton 
                                      size="small" 
                                      color="error"
                                      onClick={(e) => { e.stopPropagation(); setSelectedUser(user); setRejectDialogOpen(true); }}
                                    >
                                      <CancelIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </>
                              )}
                              
                              <Tooltip title="Delete">
                                <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); /* Implement delete logic */ }}>
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                        <Typography variant="body1" color="text.secondary">
                          No users found matching your criteria.
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
              count={filteredUsers.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Paper>
        </Box>
      </Card>

      {/* View User Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>User Details</DialogTitle>
        <DialogContent dividers>
          {selectedUser && (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar 
                  src={selectedUser.avatar} 
                  alt={selectedUser.name}
                  sx={{ width: 80, height: 80, mr: 2 }}
                >
                  {selectedUser.name?.charAt(0) || <PersonIcon sx={{ fontSize: 40 }} />}
                </Avatar>
                <Box>
                  <Typography variant="h6">{selectedUser.name}</Typography>
                  <Typography variant="body2" color="text.secondary">@{selectedUser.username}</Typography>
                  <Chip 
                    label={selectedUser.role || 'User'} 
                    size="small" 
                    variant="outlined"
                    color={selectedUser.role === 'admin' ? 'primary' : 'default'}
                    sx={{ mt: 0.5 }}
                  />
                </Box>
              </Box>
              <Divider sx={{ my: 2 }} />
              <List dense>
                <ListItem>
                  <ListItemIcon><EmailIcon /></ListItemIcon>
                  <ListItemText primary="Email" secondary={selectedUser.email} />
                </ListItem>
                {selectedUser.phone && (
                  <ListItem>
                    <ListItemIcon><PhoneIcon /></ListItemIcon>
                    <ListItemText primary="Phone" secondary={selectedUser.phone} />
                  </ListItem>
                )}
                {selectedUser.location && (
                  <ListItem>
                    <ListItemIcon><LocationIcon /></ListItemIcon>
                    <ListItemText primary="Location" secondary={selectedUser.location} />
                  </ListItem>
                )}
                {selectedUser.organization && (
                  <ListItem>
                    <ListItemIcon><BusinessIcon /></ListItemIcon>
                    <ListItemText primary="Organization" secondary={selectedUser.organization} />
                  </ListItem>
                )}
                <ListItem>
                  <ListItemIcon><CheckCircleIcon /></ListItemIcon>
                  <ListItemText 
                    primary="Status" 
                    secondary={
                      <Chip 
                        label={selectedUser.status || 'pending'} 
                        size="small"
                        color={getStatusColor(selectedUser.status)}
                        icon={getStatusIcon(selectedUser.status)}
                        variant="outlined"
                      />
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CalendarIcon /></ListItemIcon>
                  <ListItemText primary="Registration Date" secondary={format(new Date(selectedUser.createdAt), 'PPP')} />
                </ListItem>
                {selectedUser.lastLogin && (
                  <ListItem>
                    <ListItemIcon><RefreshIcon /></ListItemIcon>
                    <ListItemText primary="Last Login" secondary={format(new Date(selectedUser.lastLogin), 'PPP p')} />
                  </ListItem>
                )}
              </List>
              {selectedUser.status === 'pending' && (
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                  <Button 
                    variant="contained" 
                    color="success" 
                    onClick={() => handleApprove(selectedUser)}
                  >
                    Approve
                  </Button>
                  <Button 
                    variant="contained" 
                    color="error" 
                    onClick={() => { setRejectDialogOpen(true); setViewDialogOpen(false); }}
                  >
                    Reject
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Reject User Dialog */}
      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reject User: {selectedUser?.name}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Reason for Rejection"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            helperText="Please provide a clear reason for rejecting this user."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleReject} color="error" variant="contained">
            Reject
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Action Confirmation Dialog */}
      <Dialog open={bulkActionDialogOpen} onClose={() => setBulkActionDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {bulkAction === 'approve' ? 'Approve Selected Users' : 'Reject Selected Users'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            You are about to {bulkAction} <strong>{selected.length}</strong> user account{selected.length !== 1 ? 's' : ''}.
          </DialogContentText>
          {bulkAction === 'reject' && (
            <TextField
              autoFocus
              margin="dense"
              label="Reason for Bulk Rejection (Optional)"
              type="text"
              fullWidth
              multiline
              rows={3}
              value={bulkRejectionReason}
              onChange={(e) => setBulkRejectionReason(e.target.value)}
              helperText="Provide a reason for rejecting these users. This will be logged."
              sx={{ mt: 2 }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkActionDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleBulkAction} 
            color={bulkAction === 'approve' ? 'success' : 'error'}
            variant="contained"
          >
            Confirm {bulkAction === 'approve' ? 'Approval' : 'Rejection'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default UserManagement;

