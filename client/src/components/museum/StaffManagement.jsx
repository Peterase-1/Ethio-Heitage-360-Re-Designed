import React, { useState } from 'react';
import MuseumAdminSidebar from '../dashboard/MuseumAdminSidebar';
import { 
  Box, Typography, Container, Grid, Paper, Button, TextField,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem, Card, CardContent,
  CardActions, Avatar, Badge, Tabs, Tab
} from '@mui/material';
import {
  Users,
  Plus,
  Eye,
  Edit,
  Delete,
  Mail,
  Phone,
  Clock,
  Calendar,
  TrendingUp,
  Shield,
  UserCheck,
  UserX,
  Settings,
  Award,
  Activity
} from 'lucide-react';

const StaffManagement = () => {
  const [tabValue, setTabValue] = useState(0);
  const [staff, setStaff] = useState([
    {
      id: 1,
      name: 'Dr. Sarah Johnson',
      email: 'sarah.johnson@museum.org',
      phone: '+251-11-555-0101',
      role: 'Senior Curator',
      department: 'Collections',
      status: 'active',
      hireDate: '2020-03-15',
      permissions: ['view_artifacts', 'edit_artifacts', 'approve_submissions'],
      schedule: {
        monday: '9:00-17:00',
        tuesday: '9:00-17:00',
        wednesday: '9:00-17:00',
        thursday: '9:00-17:00',
        friday: '9:00-17:00'
      },
      performance: {
        rating: 4.8,
        completedTasks: 145,
        onTimeRate: 96
      }
    },
    {
      id: 2,
      name: 'Michael Chen',
      email: 'michael.chen@museum.org',
      phone: '+251-11-555-0102',
      role: 'Education Coordinator',
      department: 'Education',
      status: 'active',
      hireDate: '2021-07-20',
      permissions: ['view_events', 'edit_events', 'manage_workshops'],
      schedule: {
        monday: '10:00-18:00',
        tuesday: '10:00-18:00',
        wednesday: '10:00-18:00',
        thursday: '10:00-18:00',
        friday: '10:00-18:00'
      },
      performance: {
        rating: 4.6,
        completedTasks: 89,
        onTimeRate: 94
      }
    },
    {
      id: 3,
      name: 'Aisha Ibrahim',
      email: 'aisha.ibrahim@museum.org',
      phone: '+251-11-555-0103',
      role: 'Conservation Specialist',
      department: 'Conservation',
      status: 'on_leave',
      hireDate: '2019-11-10',
      permissions: ['view_artifacts', 'conservation_reports', 'condition_assessment'],
      schedule: {
        monday: '8:00-16:00',
        tuesday: '8:00-16:00',
        wednesday: '8:00-16:00',
        thursday: '8:00-16:00',
        friday: '8:00-16:00'
      },
      performance: {
        rating: 4.9,
        completedTasks: 203,
        onTimeRate: 98
      }
    }
  ]);

  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [newStaff, setNewStaff] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    department: 'Collections',
    permissions: []
  });

  const rolePermissions = {
    'Senior Curator': ['view_artifacts', 'edit_artifacts', 'approve_submissions', 'manage_staff'],
    'Education Coordinator': ['view_events', 'edit_events', 'manage_workshops', 'create_content'],
    'Conservation Specialist': ['view_artifacts', 'conservation_reports', 'condition_assessment'],
    'Digital Archivist': ['view_artifacts', 'edit_metadata', 'manage_digital_assets'],
    'Security Officer': ['view_logs', 'incident_reports', 'facility_management'],
    'Tour Guide': ['view_events', 'visitor_management', 'basic_information']
  };

  const statusColors = {
    'active': 'success',
    'on_leave': 'warning',
    'inactive': 'error'
  };

  const departmentColors = {
    'Collections': 'primary',
    'Education': 'secondary',
    'Conservation': 'success',
    'Digital': 'info',
    'Security': 'warning',
    'Administration': 'default'
  };

  const handleAddStaff = () => {
    const id = staff.length + 1;
    const newEntry = {
      ...newStaff,
      id,
      status: 'active',
      hireDate: new Date().toISOString().split('T')[0],
      permissions: rolePermissions[newStaff.role] || [],
      schedule: {
        monday: '9:00-17:00',
        tuesday: '9:00-17:00',
        wednesday: '9:00-17:00',
        thursday: '9:00-17:00',
        friday: '9:00-17:00'
      },
      performance: {
        rating: 0,
        completedTasks: 0,
        onTimeRate: 100
      }
    };
    setStaff([...staff, newEntry]);
    setOpenAddDialog(false);
    setNewStaff({
      name: '',
      email: '',
      phone: '',
      role: '',
      department: 'Collections',
      permissions: []
    });
  };

  const handleUpdateStatus = (id, newStatus) => {
    setStaff(staff.map(member => 
      member.id === id ? { ...member, status: newStatus } : member
    ));
  };

  const handleDeleteStaff = (id) => {
    setStaff(staff.filter(member => member.id !== id));
  };

  const renderStaffList = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Staff Member</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Department</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Performance</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {staff.map((member) => (
            <TableRow key={member.id}>
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
                  color={departmentColors[member.department]} 
                  size="small" 
                />
              </TableCell>
              <TableCell>
                <Chip 
                  label={member.status.replace('_', ' ')} 
                  color={statusColors[member.status]} 
                  size="small" 
                />
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ mr: 1 }}>
                    {member.performance.rating}/5.0
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ({member.performance.completedTasks} tasks)
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>
                <IconButton size="small" onClick={() => setSelectedStaff(member)}>
                  <Eye size={16} />
                </IconButton>
                <IconButton size="small">
                  <Edit size={16} />
                </IconButton>
                <IconButton size="small" color="error" onClick={() => handleDeleteStaff(member.id)}>
                  <Delete size={16} />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderRolesPermissions = () => (
    <Grid container spacing={3}>
      {Object.entries(rolePermissions).map(([role, permissions]) => (
        <Grid item xs={12} md={6} key={role}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>{role}</Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {permissions.length} permissions assigned
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {permissions.map((permission) => (
                  <Chip 
                    key={permission} 
                    label={permission.replace('_', ' ')} 
                    size="small" 
                    variant="outlined"
                  />
                ))}
              </Box>
            </CardContent>
            <CardActions>
              <Button size="small">Edit Role</Button>
              <Button size="small">Manage Permissions</Button>
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const renderSchedules = () => (
    <Grid container spacing={3}>
      {staff.map((member) => (
        <Grid item xs={12} md={6} key={member.id}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                  {member.name.split(' ').map(n => n[0]).join('')}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1">{member.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {member.role}
                  </Typography>
                </Box>
              </Box>
              <Box>
                {Object.entries(member.schedule).map(([day, hours]) => (
                  <Box key={day} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                      {day}:
                    </Typography>
                    <Typography variant="body2">{hours}</Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
            <CardActions>
              <Button size="small" startIcon={<Calendar size={16} />}>
                Edit Schedule
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
        <Grid item xs={12} md={6} lg={4} key={member.id}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                  {member.name.split(' ').map(n => n[0]).join('')}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1">{member.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {member.role}
                  </Typography>
                </Box>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" color="primary.main">
                      {member.performance.rating}
                    </Typography>
                    <Typography variant="caption">Rating</Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" color="success.main">
                      {member.performance.completedTasks}
                    </Typography>
                    <Typography variant="caption">Tasks</Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" color="warning.main">
                      {member.performance.onTimeRate}%
                    </Typography>
                    <Typography variant="caption">On Time</Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <MuseumAdminSidebar />
      
      <div className="flex-1 overflow-auto">
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" component="h1" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
              <Users className="mr-3" size={32} />
              Staff Management
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Manage your museum team, roles, schedules, and performance
            </Typography>
          </Box>

          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 3, textAlign: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                <Typography variant="h4">{staff.length}</Typography>
                <Typography variant="body2">Total Staff</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 3, textAlign: 'center', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
                <Typography variant="h4">{staff.filter(s => s.status === 'active').length}</Typography>
                <Typography variant="body2">Active</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 3, textAlign: 'center', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
                <Typography variant="h4">{Object.keys(rolePermissions).length}</Typography>
                <Typography variant="body2">Roles</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 3, textAlign: 'center', background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white' }}>
                <Typography variant="h4">4.7</Typography>
                <Typography variant="body2">Avg Rating</Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Actions */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Team Management</Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button variant="outlined" startIcon={<Settings size={16} />}>
                  Manage Roles
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Plus size={16} />}
                  onClick={() => setOpenAddDialog(true)}
                >
                  Add Staff Member
                </Button>
              </Box>
            </Box>
          </Paper>

          {/* Tabs */}
          <Paper sx={{ mb: 3 }}>
            <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
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

          {/* Add Staff Dialog */}
          <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="md" fullWidth>
            <DialogTitle>Add New Staff Member</DialogTitle>
            <DialogContent>
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    value={newStaff.name}
                    onChange={(e) => setNewStaff({...newStaff, name: e.target.value})}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={newStaff.email}
                    onChange={(e) => setNewStaff({...newStaff, email: e.target.value})}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    value={newStaff.phone}
                    onChange={(e) => setNewStaff({...newStaff, phone: e.target.value})}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Role</InputLabel>
                    <Select
                      value={newStaff.role}
                      label="Role"
                      onChange={(e) => setNewStaff({...newStaff, role: e.target.value})}
                    >
                      {Object.keys(rolePermissions).map((role) => (
                        <MenuItem key={role} value={role}>{role}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Department</InputLabel>
                    <Select
                      value={newStaff.department}
                      label="Department"
                      onChange={(e) => setNewStaff({...newStaff, department: e.target.value})}
                    >
                      <MenuItem value="Collections">Collections</MenuItem>
                      <MenuItem value="Education">Education</MenuItem>
                      <MenuItem value="Conservation">Conservation</MenuItem>
                      <MenuItem value="Digital">Digital</MenuItem>
                      <MenuItem value="Security">Security</MenuItem>
                      <MenuItem value="Administration">Administration</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenAddDialog(false)}>Cancel</Button>
              <Button onClick={handleAddStaff} variant="contained">Add Staff Member</Button>
            </DialogActions>
          </Dialog>

          {/* Staff Detail Dialog */}
          <Dialog open={!!selectedStaff} onClose={() => setSelectedStaff(null)} maxWidth="md" fullWidth>
            {selectedStaff && (
              <>
                <DialogTitle>Staff Details - {selectedStaff.name}</DialogTitle>
                <DialogContent>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Avatar sx={{ width: 100, height: 100, mx: 'auto', mb: 2, bgcolor: 'primary.main' }}>
                          {selectedStaff.name.split(' ').map(n => n[0]).join('')}
                        </Avatar>
                        <Typography variant="h6">{selectedStaff.name}</Typography>
                        <Typography variant="subtitle2" color="text.secondary">
                          {selectedStaff.role}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={8}>
                      <Typography variant="h6" gutterBottom>Contact Information</Typography>
                      <Typography><strong>Email:</strong> {selectedStaff.email}</Typography>
                      <Typography><strong>Phone:</strong> {selectedStaff.phone}</Typography>
                      <Typography><strong>Department:</strong> {selectedStaff.department}</Typography>
                      <Typography><strong>Hire Date:</strong> {selectedStaff.hireDate}</Typography>
                      
                      <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>Permissions</Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {selectedStaff.permissions.map((permission) => (
                          <Chip 
                            key={permission} 
                            label={permission.replace('_', ' ')} 
                            size="small" 
                            color="primary"
                          />
                        ))}
                      </Box>

                      <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>Performance</Typography>
                      <Typography>Rating: {selectedStaff.performance.rating}/5.0</Typography>
                      <Typography>Completed Tasks: {selectedStaff.performance.completedTasks}</Typography>
                      <Typography>On-Time Rate: {selectedStaff.performance.onTimeRate}%</Typography>
                    </Grid>
                  </Grid>
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setSelectedStaff(null)}>Close</Button>
                  <Button variant="contained">Edit Details</Button>
                </DialogActions>
              </>
            )}
          </Dialog>
        </Container>
      </div>
    </div>
  );
};

export default StaffManagement;
