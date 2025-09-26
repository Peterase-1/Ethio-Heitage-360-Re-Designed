import React, { useState, useEffect } from 'react';
import MuseumAdminSidebar from '../dashboard/MuseumAdminSidebar';
import {
  Box, Typography, Container, Grid, Paper, Button, TextField,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem, Card, CardContent,
  CardActions, Avatar, Badge, Tabs, Tab, Alert, Snackbar,
  CircularProgress, Pagination, Checkbox, FormControlLabel,
  InputAdornment, Tooltip, Menu, ListItemIcon, ListItemText
} from '@mui/material';
import {
  Users, Plus, Eye, Edit, Delete, Mail, Phone, Clock, Calendar,
  TrendingUp, Shield, UserCheck, UserX, Settings, Award, Activity,
  Search, ListFilter, MoreVertical, CheckCircle2, X,
  UserPlus, UserMinus, RefreshCw, Download, Upload
} from 'lucide-react';
import staffService from '../../services/staffService';
import {
  PermissionsDialog,
  ScheduleDialog,
  AttendanceDialog,
  LeaveRequestDialog
} from './StaffDialogs';

const StaffManagement = () => {
  // ======================
  // STATE MANAGEMENT
  // ======================
  const [tabValue, setTabValue] = useState(0);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Dialog states
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openPermissionsDialog, setOpenPermissionsDialog] = useState(false);
  const [openScheduleDialog, setOpenScheduleDialog] = useState(false);
  const [openAttendanceDialog, setOpenAttendanceDialog] = useState(false);
  const [openLeaveDialog, setOpenLeaveDialog] = useState(false);

  // Selected staff and form data
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [editingStaff, setEditingStaff] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    department: '',
    hireDate: '',
    permissions: []
  });
  const [newStaff, setNewStaff] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    department: 'Collections',
    hireDate: '',
    permissions: []
  });

  // Filtering and pagination
  const [filters, setFilters] = useState({
    search: '',
    department: '',
    role: '',
    status: 'active',
    page: 1,
    limit: 10,
    sortBy: 'name',
    sortOrder: 'asc'
  });

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 10
  });

  // Available options
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [stats, setStats] = useState({
    totalStaff: 0,
    activeStaff: 0,
    onLeaveStaff: 0,
    inactiveStaff: 0,
    avgRating: 0,
    avgOnTimeRate: 0
  });

  // ======================
  // EFFECTS
  // ======================

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadStaff();
  }, [filters]);

  // ======================
  // API CALLS
  // ======================

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [staffData, rolesData, statsData] = await Promise.all([
        staffService.getStaff(filters),
        staffService.getRolesAndPermissions(),
        staffService.getStaffStats()
      ]);

      setStaff(staffData.data.staff);
      setPagination(staffData.data.pagination);
      setRoles(rolesData.data.roles);
      setPermissions(rolesData.data.permissions);
      setDepartments(rolesData.data.departments);
      setStats(statsData.data.overview);
    } catch (err) {
      setError(err.message || 'Failed to load staff data');

      // Fallback data for roles and departments if API fails
      setRoles([
        'Senior Curator', 'Education Coordinator', 'Conservation Specialist',
        'Digital Archivist', 'Security Officer', 'Tour Guide', 'Registrar',
        'Collections Manager', 'Exhibitions Coordinator', 'Marketing Coordinator',
        'Administrative Assistant', 'Other'
      ]);
      setDepartments([
        'Collections', 'Education', 'Conservation', 'Digital', 'Security',
        'Administration', 'Marketing', 'Research', 'Operations'
      ]);
      setPermissions(['read_artifacts', 'write_artifacts', 'manage_staff', 'view_analytics']);
    } finally {
      setLoading(false);
    }
  };

  const loadStaff = async () => {
    try {
      setLoading(true);
      const response = await staffService.getStaff(filters);
      setStaff(response.data.staff);
      setPagination(response.data.pagination);
    } catch (err) {
      setError(err.message || 'Failed to load staff');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStaff = async () => {
    try {
      const validation = staffService.validateStaffData(newStaff);
      if (!validation.isValid) {
        const errorMessages = Object.values(validation.errors).join(', ');
        setError(`Validation errors: ${errorMessages}`);
        return;
      }

      const response = await staffService.createStaff(newStaff);
      setStaff([...staff, response.data]);
      setOpenAddDialog(false);
      setNewStaff({
        name: '',
        email: '',
        phone: '',
        role: '',
        department: 'Collections',
        hireDate: '',
        permissions: []
      });
      setSuccess('Staff member created successfully');
      loadStaff(); // Refresh the list
    } catch (err) {
      console.error('Create staff error:', err);
      if (err.response?.data?.errors) {
        const errorMessages = err.response.data.errors.map(e => e.msg).join(', ');
        setError(`Validation errors: ${errorMessages}`);
      } else {
        setError(err.message || 'Failed to create staff member');
      }
    }
  };

  const handleUpdateStaff = async (id, data) => {
    try {
      console.log('Updating staff:', { id, data });
      const response = await staffService.updateStaff(id, data);
      console.log('Update response:', response);
      setStaff(staff.map(member =>
        member._id === id ? response.data : member
      ));
      setOpenEditDialog(false);
      setSelectedStaff(null);
      setSuccess('Staff member updated successfully');
    } catch (err) {
      console.error('Update staff error:', err);
      setError(err.message || 'Failed to update staff member');
    }
  };

  const handleDeleteStaff = async (id) => {
    if (!window.confirm('Are you sure you want to delete this staff member?')) {
      return;
    }

    try {
      await staffService.deleteStaff(id);
      setStaff(staff.filter(member => member._id !== id));
      setSuccess('Staff member deleted successfully');
    } catch (err) {
      setError(err.message || 'Failed to delete staff member');
    }
  };

  const handleUpdatePermissions = async (id, newPermissions) => {
    try {
      const response = await staffService.updateStaffPermissions(id, newPermissions);
      setStaff(staff.map(member =>
        member._id === id ? response.data : member
      ));
      setOpenPermissionsDialog(false);
      setSuccess('Permissions updated successfully');
    } catch (err) {
      console.error('Update permissions error:', err);
      setError(err.message || 'Failed to update permissions');
    }
  };

  const handleUpdateSchedule = async (id, schedule) => {
    try {
      console.log('Updating schedule:', { id, schedule });
      const response = await staffService.updateStaffSchedule(id, schedule);
      console.log('Schedule update response:', response);
      setStaff(staff.map(member =>
        member._id === id ? response.data : member
      ));
      setOpenScheduleDialog(false);
      setSuccess('Schedule updated successfully');
    } catch (err) {
      console.error('Update schedule error:', err);
      setError(err.message || 'Failed to update schedule');
    }
  };

  const handleRecordAttendance = async (id, attendanceData) => {
    try {
      await staffService.recordAttendance(id, attendanceData);
      setOpenAttendanceDialog(false);
      setSuccess('Attendance recorded successfully');
      loadStaff(); // Refresh to get updated performance data
    } catch (err) {
      setError(err.message || 'Failed to record attendance');
    }
  };

  const handleSubmitLeaveRequest = async (id, leaveData) => {
    try {
      await staffService.submitLeaveRequest(id, leaveData);
      setOpenLeaveDialog(false);
      setSuccess('Leave request submitted successfully');
      loadStaff(); // Refresh to get updated status
    } catch (err) {
      setError(err.message || 'Failed to submit leave request');
    }
  };

  // ======================
  // FILTER HANDLERS
  // ======================

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filtering
    }));
  };

  const handlePageChange = (event, page) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      department: '',
      role: '',
      status: 'active',
      page: 1,
      limit: 10,
      sortBy: 'name',
      sortOrder: 'asc'
    });
  };

  // ======================
  // RENDER METHODS
  // ======================

  const renderStaffList = () => (
    <Box>
      {/* Search and Filters */}
      <Paper sx={{ p: 2, mb: 3, backgroundColor: '#FFFFFF', border: '1px solid #D7CCC8' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search staff..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#D7CCC8' },
                  '&:hover fieldset': { borderColor: '#8B4513' },
                  '&.Mui-focused fieldset': { borderColor: '#8B4513' }
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={20} style={{ color: '#8B4513' }} />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Department</InputLabel>
              <Select
                value={filters.department}
                label="Department"
                onChange={(e) => handleFilterChange('department', e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                {departments.map(dept => (
                  <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={filters.role}
                label="Role"
                onChange={(e) => handleFilterChange('role', e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                {roles.map(role => (
                  <MenuItem key={role} value={role}>{role}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                label="Status"
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="on_leave">On Leave</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="terminated">Terminated</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              variant="outlined"
              startIcon={<ListFilter size={16} />}
              onClick={clearFilters}
              fullWidth
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Staff Table */}
      <TableContainer component={Paper} sx={{ backgroundColor: '#FFFFFF', border: '1px solid #D7CCC8' }}>
        <Table>
          <TableHead sx={{ backgroundColor: '#F5F5F5' }}>
            <TableRow>
              <TableCell sx={{ color: '#2D2A26', fontWeight: 'bold' }}>Staff Member</TableCell>
              <TableCell sx={{ color: '#2D2A26', fontWeight: 'bold' }}>Role</TableCell>
              <TableCell sx={{ color: '#2D2A26', fontWeight: 'bold' }}>Department</TableCell>
              <TableCell sx={{ color: '#2D2A26', fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ color: '#2D2A26', fontWeight: 'bold' }}>Performance</TableCell>
              <TableCell sx={{ color: '#2D2A26', fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : staff.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body2" color="text.secondary">
                    No staff members found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              staff.map((member) => (
                <TableRow key={member._id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2">{member.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {member.email}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{member.role}</TableCell>
                  <TableCell>
                    <Chip
                      label={member.department}
                      color="primary"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={member.status.replace('_', ' ')}
                      color={member.status === 'active' ? 'success' :
                        member.status === 'on_leave' ? 'warning' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ mr: 1 }}>
                        {member.performance?.rating || 0}/5.0
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ({member.performance?.completedTasks || 0} tasks)
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="View Details">
                        <IconButton size="small" onClick={() => setSelectedStaff(member)}>
                          <Eye size={16} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => {
                          setSelectedStaff(member);
                          setEditingStaff({
                            name: member.name,
                            email: member.email,
                            phone: member.phone || '',
                            role: member.role,
                            department: member.department,
                            hireDate: member.hireDate,
                            permissions: member.permissions || []
                          });
                          setOpenEditDialog(true);
                        }}>
                          <Edit size={16} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteStaff(member._id)}
                        >
                          <Delete size={16} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={pagination.totalPages}
            page={pagination.currentPage}
            onChange={handlePageChange}
            sx={{
              '& .MuiPaginationItem-root': {
                color: '#8D6E63',
                '&.Mui-selected': {
                  backgroundColor: '#8B4513',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: '#654321'
                  }
                },
                '&:hover': {
                  backgroundColor: '#F5F5F5'
                }
              }
            }}
          />
        </Box>
      )}
    </Box>
  );

  const renderRolesPermissions = () => (
    <Grid container spacing={3}>
      {roles.map((role) => (
        <Grid item xs={12} md={6} key={role}>
          <Card sx={{ backgroundColor: '#FFFFFF', border: '1px solid #D7CCC8' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: '#2D2A26' }}>{role}</Typography>
              <Typography variant="body2" sx={{ color: '#8D6E63' }} gutterBottom>
                {staff.filter(s => s.role === role).length} staff members
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {permissions.slice(0, 5).map((permission) => (
                  <Chip
                    key={permission}
                    label={permission.replace('_', ' ')}
                    size="small"
                    variant="outlined"
                    sx={{
                      borderColor: '#8B4513',
                      color: '#8B4513',
                      '&:hover': { backgroundColor: '#F5F5F5' }
                    }}
                  />
                ))}
                {permissions.length > 5 && (
                  <Chip
                    label={`+${permissions.length - 5} more`}
                    size="small"
                    variant="outlined"
                    sx={{
                      borderColor: '#8B4513',
                      color: '#8B4513',
                      backgroundColor: '#F5F5F5'
                    }}
                  />
                )}
              </Box>
            </CardContent>
            <CardActions>
              <Button
                size="small"
                onClick={() => {
                  setSelectedStaff({ role: role, name: role });
                  setOpenPermissionsDialog(true);
                }}
                sx={{
                  color: '#8B4513',
                  '&:hover': { backgroundColor: '#F5F5F5' }
                }}
              >
                Edit Role
              </Button>
              <Button
                size="small"
                onClick={() => {
                  setSelectedStaff({ role: role, name: role });
                  setOpenPermissionsDialog(true);
                }}
                sx={{
                  color: '#8B4513',
                  '&:hover': { backgroundColor: '#F5F5F5' }
                }}
              >
                Manage Permissions
              </Button>
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const renderSchedules = () => (
    <Grid container spacing={3}>
      {staff.map((member) => (
        <Grid item xs={12} md={6} key={member._id}>
          <Card sx={{ backgroundColor: '#FFFFFF', border: '1px solid #D7CCC8' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ mr: 2, bgcolor: '#8B4513' }}>
                  {member.name.split(' ').map(n => n[0]).join('')}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" sx={{ color: '#2D2A26' }}>{member.name}</Typography>
                  <Typography variant="caption" sx={{ color: '#8D6E63' }}>
                    {member.role}
                  </Typography>
                </Box>
              </Box>
              <Box>
                {member.schedule && Object.keys(member.schedule).length > 0 ? (
                  Object.entries(member.schedule).map(([day, hours]) => (
                    <Box key={day} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" sx={{ textTransform: 'capitalize', color: '#2D2A26' }}>
                        {day}:
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#8D6E63' }}>
                        {typeof hours === 'string' ? hours :
                          typeof hours === 'object' && hours !== null ?
                            (hours.start && hours.end ? `${hours.start} - ${hours.end}` : 'Not set') :
                            hours || 'Not set'}
                      </Typography>
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" sx={{ color: '#8D6E63' }}>
                    No schedule set
                  </Typography>
                )}
              </Box>
            </CardContent>
            <CardActions>
              <Button
                size="small"
                startIcon={<Calendar size={16} />}
                onClick={() => {
                  setSelectedStaff(member);
                  setOpenScheduleDialog(true);
                }}
                sx={{
                  color: '#8B4513',
                  '&:hover': { backgroundColor: '#F5F5F5' }
                }}
              >
                Edit Schedule
              </Button>
              <Button
                size="small"
                startIcon={<UserCheck size={16} />}
                onClick={() => {
                  setSelectedStaff(member);
                  setOpenAttendanceDialog(true);
                }}
                sx={{
                  color: '#8B4513',
                  '&:hover': { backgroundColor: '#F5F5F5' }
                }}
              >
                Record Attendance
              </Button>
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const renderPerformance = () => (
    <Grid container spacing={3}>
      {staff.map((member) => (
        <Grid item xs={12} md={6} lg={4} key={member._id}>
          <Card sx={{ backgroundColor: '#FFFFFF', border: '1px solid #D7CCC8' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ mr: 2, bgcolor: '#8B4513' }}>
                  {member.name.split(' ').map(n => n[0]).join('')}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" sx={{ color: '#2D2A26' }}>{member.name}</Typography>
                  <Typography variant="caption" sx={{ color: '#8D6E63' }}>
                    {member.role}
                  </Typography>
                </Box>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ color: '#8B4513' }}>
                      {member.performance?.rating || 0}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#8D6E63' }}>Rating</Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ color: '#654321' }}>
                      {member.performance?.completedTasks || 0}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#8D6E63' }}>Tasks</Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ color: '#6D4C41' }}>
                      {member.performance?.onTimeRate || 0}%
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#8D6E63' }}>On Time</Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
            <CardActions>
              <Button
                size="small"
                startIcon={<Activity size={16} />}
                onClick={() => {
                  setSelectedStaff(member);
                  setOpenAttendanceDialog(true);
                }}
                sx={{
                  color: '#8B4513',
                  '&:hover': { backgroundColor: '#F5F5F5' }
                }}
              >
                Record Attendance
              </Button>
              <Button
                size="small"
                startIcon={<Clock size={16} />}
                onClick={() => {
                  setSelectedStaff(member);
                  setOpenLeaveDialog(true);
                }}
                sx={{
                  color: '#8B4513',
                  '&:hover': { backgroundColor: '#F5F5F5' }
                }}
              >
                Leave Request
              </Button>
              <Button
                size="small"
                startIcon={<Shield size={16} />}
                onClick={() => {
                  setSelectedStaff(member);
                  setOpenPermissionsDialog(true);
                }}
                sx={{
                  color: '#8B4513',
                  '&:hover': { backgroundColor: '#F5F5F5' }
                }}
              >
                Permissions
              </Button>
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  // ======================
  // DIALOG COMPONENTS
  // ======================

  const renderAddStaffDialog = () => (
    <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="md" fullWidth>
      <DialogTitle sx={{ color: '#2D2A26' }}>Add New Staff Member</DialogTitle>
      <DialogContent>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Full Name"
              value={newStaff.name}
              onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#D7CCC8' },
                  '&:hover fieldset': { borderColor: '#8B4513' },
                  '&.Mui-focused fieldset': { borderColor: '#8B4513' }
                },
                '& .MuiInputLabel-root': { color: '#8D6E63' },
                '& .MuiInputLabel-root.Mui-focused': { color: '#8B4513' }
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={newStaff.email}
              onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#D7CCC8' },
                  '&:hover fieldset': { borderColor: '#8B4513' },
                  '&.Mui-focused fieldset': { borderColor: '#8B4513' }
                },
                '& .MuiInputLabel-root': { color: '#8D6E63' },
                '& .MuiInputLabel-root.Mui-focused': { color: '#8B4513' }
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Phone"
              value={newStaff.phone}
              onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Hire Date"
              type="date"
              value={newStaff.hireDate}
              onChange={(e) => setNewStaff({ ...newStaff, hireDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth required>
              <InputLabel>Role</InputLabel>
              <Select
                value={newStaff.role}
                label="Role"
                onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
              >
                {roles.map((role) => (
                  <MenuItem key={role} value={role}>{role}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth required>
              <InputLabel>Department</InputLabel>
              <Select
                value={newStaff.department}
                label="Department"
                onChange={(e) => setNewStaff({ ...newStaff, department: e.target.value })}
              >
                {departments.map((dept) => (
                  <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => setOpenAddDialog(false)}
          startIcon={<X size={16} />}
          sx={{
            color: '#8D6E63',
            '&:hover': { backgroundColor: '#F5F5F5' }
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleCreateStaff}
          variant="contained"
          sx={{
            backgroundColor: '#8B4513',
            '&:hover': { backgroundColor: '#654321' }
          }}
        >
          Add Staff Member
        </Button>
      </DialogActions>
    </Dialog>
  );

  const renderStaffDetailDialog = () => (
    <Dialog open={!!selectedStaff} onClose={() => setSelectedStaff(null)} maxWidth="md" fullWidth>
      {selectedStaff && (
        <>
          <DialogTitle sx={{ color: '#2D2A26' }}>Staff Details - {selectedStaff.name}</DialogTitle>
          <DialogContent>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Avatar sx={{ width: 100, height: 100, mx: 'auto', mb: 2, bgcolor: '#8B4513' }}>
                    {selectedStaff.name.split(' ').map(n => n[0]).join('')}
                  </Avatar>
                  <Typography variant="h6" sx={{ color: '#2D2A26' }}>{selectedStaff.name}</Typography>
                  <Typography variant="subtitle2" sx={{ color: '#8D6E63' }}>
                    {selectedStaff.role}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={8}>
                <Typography variant="h6" gutterBottom sx={{ color: '#2D2A26' }}>Contact Information</Typography>
                <Typography sx={{ color: '#2D2A26' }}><strong>Email:</strong> {selectedStaff.email}</Typography>
                <Typography sx={{ color: '#2D2A26' }}><strong>Phone:</strong> {selectedStaff.phone || 'Not provided'}</Typography>
                <Typography sx={{ color: '#2D2A26' }}><strong>Department:</strong> {selectedStaff.department}</Typography>
                <Typography sx={{ color: '#2D2A26' }}><strong>Hire Date:</strong> {new Date(selectedStaff.hireDate).toLocaleDateString()}</Typography>
                <Typography sx={{ color: '#2D2A26' }}><strong>Status:</strong> {selectedStaff.status}</Typography>

                <Typography variant="h6" sx={{ mt: 3, mb: 2, color: '#2D2A26' }}>Permissions</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {selectedStaff.permissions?.map((permission) => (
                    <Chip
                      key={permission}
                      label={permission.replace('_', ' ')}
                      size="small"
                      sx={{
                        backgroundColor: '#8B4513',
                        color: 'white',
                        '&:hover': { backgroundColor: '#654321' }
                      }}
                    />
                  )) || <Typography variant="body2" sx={{ color: '#8D6E63' }}>No permissions assigned</Typography>}
                </Box>

                <Typography variant="h6" sx={{ mt: 3, mb: 2, color: '#2D2A26' }}>Performance</Typography>
                <Typography sx={{ color: '#2D2A26' }}>Rating: {selectedStaff.performance?.rating || 0}/5.0</Typography>
                <Typography sx={{ color: '#2D2A26' }}>Completed Tasks: {selectedStaff.performance?.completedTasks || 0}</Typography>
                <Typography sx={{ color: '#2D2A26' }}>On-Time Rate: {selectedStaff.performance?.onTimeRate || 0}%</Typography>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setSelectedStaff(null)}
              sx={{
                color: '#8D6E63',
                '&:hover': { backgroundColor: '#F5F5F5' }
              }}
            >
              Close
            </Button>
            <Button
              variant="outlined"
              startIcon={<Shield size={16} />}
              onClick={() => setOpenPermissionsDialog(true)}
              sx={{
                borderColor: '#8B4513',
                color: '#8B4513',
                '&:hover': { borderColor: '#654321', backgroundColor: '#F5F5F5' }
              }}
            >
              Permissions
            </Button>
            <Button
              variant="outlined"
              startIcon={<Calendar size={16} />}
              onClick={() => setTabValue(2)}
              sx={{
                borderColor: '#8B4513',
                color: '#8B4513',
                '&:hover': { borderColor: '#654321', backgroundColor: '#F5F5F5' }
              }}
            >
              Schedule
            </Button>
            <Button
              variant="outlined"
              startIcon={<UserCheck size={16} />}
              onClick={() => setOpenAttendanceDialog(true)}
              sx={{
                borderColor: '#8B4513',
                color: '#8B4513',
                '&:hover': { borderColor: '#654321', backgroundColor: '#F5F5F5' }
              }}
            >
              Attendance
            </Button>
            <Button
              variant="outlined"
              startIcon={<Clock size={16} />}
              onClick={() => setOpenLeaveDialog(true)}
              sx={{
                borderColor: '#8B4513',
                color: '#8B4513',
                '&:hover': { borderColor: '#654321', backgroundColor: '#F5F5F5' }
              }}
            >
              Leave Request
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                setEditingStaff({
                  name: selectedStaff.name,
                  email: selectedStaff.email,
                  phone: selectedStaff.phone || '',
                  role: selectedStaff.role,
                  department: selectedStaff.department,
                  hireDate: selectedStaff.hireDate,
                  permissions: selectedStaff.permissions || []
                });
                setOpenEditDialog(true);
              }}
              sx={{
                backgroundColor: '#8B4513',
                '&:hover': { backgroundColor: '#654321' }
              }}
            >
              Edit Details
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );

  const renderEditStaffDialog = () => (
    <Dialog open={openEditDialog} onClose={() => {
      setOpenEditDialog(false);
      setEditingStaff({
        name: '',
        email: '',
        phone: '',
        role: '',
        department: '',
        hireDate: '',
        permissions: []
      });
    }} maxWidth="md" fullWidth>
      <DialogTitle sx={{ color: '#2D2A26' }}>Edit Staff Member</DialogTitle>
      <DialogContent>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Full Name"
              value={editingStaff.name}
              onChange={(e) => setEditingStaff({ ...editingStaff, name: e.target.value })}
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={editingStaff.email}
              onChange={(e) => setEditingStaff({ ...editingStaff, email: e.target.value })}
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Phone"
              value={editingStaff.phone}
              onChange={(e) => setEditingStaff({ ...editingStaff, phone: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Hire Date"
              type="date"
              value={editingStaff.hireDate ? new Date(editingStaff.hireDate).toISOString().split('T')[0] : ''}
              onChange={(e) => setEditingStaff({ ...editingStaff, hireDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth required>
              <InputLabel>Role</InputLabel>
              <Select
                value={editingStaff.role}
                label="Role"
                onChange={(e) => setEditingStaff({ ...editingStaff, role: e.target.value })}
              >
                {roles.map((role) => (
                  <MenuItem key={role} value={role}>{role}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth required>
              <InputLabel>Department</InputLabel>
              <Select
                value={editingStaff.department}
                label="Department"
                onChange={(e) => setEditingStaff({ ...editingStaff, department: e.target.value })}
              >
                {departments.map((dept) => (
                  <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            setOpenEditDialog(false);
            setEditingStaff({
              name: '',
              email: '',
              phone: '',
              role: '',
              department: '',
              hireDate: '',
              permissions: []
            });
          }}
          startIcon={<X size={16} />}
          sx={{
            color: '#8D6E63',
            '&:hover': { backgroundColor: '#F5F5F5' }
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={() => selectedStaff && handleUpdateStaff(selectedStaff._id, editingStaff)}
          variant="contained"
          disabled={!selectedStaff}
          sx={{
            backgroundColor: '#8B4513',
            '&:hover': { backgroundColor: '#654321' },
            '&:disabled': { backgroundColor: '#D7CCC8', color: '#8D6E63' }
          }}
        >
          Update Staff Member
        </Button>
      </DialogActions>
    </Dialog>
  );

  // ======================
  // MAIN RENDER
  // ======================

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: 'white' }}>
      <MuseumAdminSidebar />

      <div
        className="flex-1 overflow-auto"
        onWheel={(e) => {
          // Only allow scrolling when mouse is over the main content
          e.stopPropagation();
        }}
      >
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" component="h1" sx={{ mb: 1, display: 'flex', alignItems: 'center', color: 'black' }}>
              <Users className="mr-3" size={32} style={{ color: '#8B5A3C' }} />
              Staff Management
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Manage your museum team, roles, schedules, and performance
            </Typography>
          </Box>

          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', backgroundColor: '#8B5A3C', color: 'white' }}>
                <Users sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography color="inherit" variant="body2">Total Staff</Typography>
                  <Typography variant="h4" color="inherit">{stats.totalStaff}</Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>Team Members</Typography>
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', backgroundColor: '#8B5A3C', color: 'white' }}>
                <UserCheck sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography color="inherit" variant="body2">Active Staff</Typography>
                  <Typography variant="h4" color="inherit">{stats.activeStaff}</Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>Currently Working</Typography>
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', backgroundColor: '#8B5A3C', color: 'white' }}>
                <Shield sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography color="inherit" variant="body2">Roles</Typography>
                  <Typography variant="h4" color="inherit">{roles.length}</Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>Different Positions</Typography>
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', backgroundColor: '#8B5A3C', color: 'white' }}>
                <Award sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography color="inherit" variant="body2">Avg Rating</Typography>
                  <Typography variant="h4" color="inherit">{stats.avgRating.toFixed(1)}</Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>Team Performance</Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>

          {/* Actions */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ color: 'black' }}>Team Management</Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<RefreshCw size={16} />}
                  onClick={loadStaff}
                  sx={{
                    borderColor: '#8B5A3C',
                    color: '#8B5A3C',
                    '&:hover': { borderColor: '#8B5A3C', backgroundColor: 'white' }
                  }}
                >
                  Refresh
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Settings size={16} />}
                  onClick={() => setTabValue(1)}
                  sx={{
                    borderColor: '#8B5A3C',
                    color: '#8B5A3C',
                    '&:hover': { borderColor: '#8B5A3C', backgroundColor: 'white' }
                  }}
                >
                  Manage Roles
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Plus size={16} />}
                  onClick={() => setOpenAddDialog(true)}
                  sx={{
                    backgroundColor: '#8B5A3C',
                    color: 'white',
                    '&:hover': { backgroundColor: '#8B5A3C' }
                  }}
                >
                  Add Staff Member
                </Button>
              </Box>
            </Box>
          </Paper>

          {/* Tabs */}
          <Paper sx={{ mb: 3 }}>
            <Tabs
              value={tabValue}
              onChange={(e, newValue) => setTabValue(newValue)}
              sx={{
                '& .MuiTab-root': {
                  color: 'black',
                  '&.Mui-selected': {
                    color: '#8B5A3C'
                  }
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: '#8B5A3C'
                }
              }}
            >
              <Tab label="All Staff" />
              <Tab label="Roles & Permissions" />
              <Tab label="Schedules" />
              <Tab label="Performance" />
            </Tabs>
          </Paper>

          {/* Tab Content */}
          {tabValue === 0 && renderStaffList()}
          {tabValue === 1 && renderRolesPermissions()}
          {tabValue === 2 && renderSchedules()}
          {tabValue === 3 && renderPerformance()}

          {/* Dialogs */}
          {renderAddStaffDialog()}
          {renderEditStaffDialog()}
          {renderStaffDetailDialog()}

          {/* Advanced Dialogs */}
          <PermissionsDialog
            open={openPermissionsDialog}
            onClose={() => setOpenPermissionsDialog(false)}
            staff={selectedStaff}
            onUpdate={handleUpdatePermissions}
          />

          <ScheduleDialog
            open={openScheduleDialog}
            onClose={() => setOpenScheduleDialog(false)}
            staff={selectedStaff}
            onUpdate={handleUpdateSchedule}
          />

          <AttendanceDialog
            open={openAttendanceDialog}
            onClose={() => setOpenAttendanceDialog(false)}
            staff={selectedStaff}
            onRecord={handleRecordAttendance}
          />

          <LeaveRequestDialog
            open={openLeaveDialog}
            onClose={() => setOpenLeaveDialog(false)}
            staff={selectedStaff}
            onSubmit={handleSubmitLeaveRequest}
          />

          {/* Snackbars */}
          <Snackbar
            open={!!error}
            autoHideDuration={6000}
            onClose={() => setError(null)}
          >
            <Alert onClose={() => setError(null)} severity="error">
              {error}
            </Alert>
          </Snackbar>

          <Snackbar
            open={!!success}
            autoHideDuration={6000}
            onClose={() => setSuccess(null)}
          >
            <Alert onClose={() => setSuccess(null)} severity="success">
              {success}
            </Alert>
          </Snackbar>
        </Container>
      </div>
    </div>
  );
};

export default StaffManagement;