import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, FormControl, InputLabel, Select, MenuItem,
  Grid, Box, Typography, Chip, FormControlLabel, Checkbox,
  Alert, CircularProgress, Autocomplete, Paper, Divider
} from '@mui/material';
import {
  Calendar, Clock, UserCheck, UserX, Save, X, Plus, Trash2
} from 'lucide-react';
import staffService from '../../services/staffService';

// ======================
// PERMISSIONS DIALOG
// ======================
export const PermissionsDialog = ({ open, onClose, staff, onUpdate }) => {
  const [permissions, setPermissions] = useState([]);
  const [availablePermissions, setAvailablePermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open && staff) {
      setPermissions(staff.permissions || []);
      loadAvailablePermissions();
    }
  }, [open, staff]);

  const loadAvailablePermissions = async () => {
    try {
      const response = await staffService.getRolesAndPermissions();
      setAvailablePermissions(response.data.permissions);
    } catch (err) {
      setError('Failed to load permissions');
    }
  };

  const handlePermissionToggle = (permission) => {
    setPermissions(prev =>
      prev.includes(permission)
        ? prev.filter(p => p !== permission)
        : [...prev, permission]
    );
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await onUpdate(staff._id, permissions);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update permissions');
    } finally {
      setLoading(false);
    }
  };

  if (!staff) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Manage Permissions - {staff.name}
      </DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Typography variant="h6" gutterBottom>
          Current Role: {staff.role}
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Select the permissions for this staff member. Permissions control what actions they can perform in the system.
        </Typography>

        <Grid container spacing={2}>
          {availablePermissions.map((permission) => (
            <Grid item xs={12} sm={6} md={4} key={permission}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={permissions.includes(permission)}
                    onChange={() => handlePermissionToggle(permission)}
                  />
                }
                label={
                  <Typography variant="body2">
                    {permission.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Typography>
                }
              />
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Selected Permissions ({permissions.length})
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {permissions.map((permission) => (
              <Chip
                key={permission}
                label={permission.replace('_', ' ')}
                onDelete={() => handlePermissionToggle(permission)}
                size="small"
                sx={{
                  backgroundColor: '#8B5A3C',
                  color: 'white',
                  '&:hover': { backgroundColor: '#8B5A3C' }
                }}
              />
            ))}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
          startIcon={<X size={16} />}
          sx={{ color: '#8B5A3C' }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          startIcon={<Save size={16} />}
          disabled={loading}
          sx={{
            backgroundColor: '#8B5A3C',
            color: 'white',
            '&:hover': { backgroundColor: '#8B5A3C' }
          }}
        >
          {loading ? <CircularProgress size={20} /> : 'Save Permissions'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ======================
// SCHEDULE DIALOG
// ======================
export const ScheduleDialog = ({ open, onClose, staff, onUpdate }) => {
  const [schedule, setSchedule] = useState({
    monday: '',
    tuesday: '',
    wednesday: '',
    thursday: '',
    friday: '',
    saturday: '',
    sunday: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open && staff) {
      setSchedule(staff.schedule || {
        monday: '',
        tuesday: '',
        wednesday: '',
        thursday: '',
        friday: '',
        saturday: '',
        sunday: ''
      });
    }
  }, [open, staff]);

  const handleScheduleChange = (day, value) => {
    setSchedule(prev => ({ ...prev, [day]: value }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      console.log('ScheduleDialog - Saving schedule:', { staffId: staff._id, schedule });
      await onUpdate(staff._id, schedule);
      onClose();
    } catch (err) {
      console.error('ScheduleDialog - Save error:', err);
      setError(err.message || 'Failed to update schedule');
    } finally {
      setLoading(false);
    }
  };

  const presetSchedules = [
    { name: 'Standard (9-5)', value: { monday: '9:00-17:00', tuesday: '9:00-17:00', wednesday: '9:00-17:00', thursday: '9:00-17:00', friday: '9:00-17:00', saturday: '', sunday: '' } },
    { name: 'Extended (8-6)', value: { monday: '8:00-18:00', tuesday: '8:00-18:00', wednesday: '8:00-18:00', thursday: '8:00-18:00', friday: '8:00-18:00', saturday: '', sunday: '' } },
    { name: 'Part-time (10-2)', value: { monday: '10:00-14:00', tuesday: '10:00-14:00', wednesday: '10:00-14:00', thursday: '10:00-14:00', friday: '10:00-14:00', saturday: '', sunday: '' } },
    { name: 'Weekend (Sat-Sun)', value: { monday: '', tuesday: '', wednesday: '', thursday: '', friday: '', saturday: '9:00-17:00', sunday: '9:00-17:00' } }
  ];

  const applyPreset = (preset) => {
    setSchedule(preset.value);
  };

  if (!staff) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Manage Schedule - {staff.name}
      </DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Typography variant="h6" gutterBottom>
          Work Schedule
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Set the working hours for each day of the week. Leave empty for days off.
        </Typography>

        {/* Preset Schedules */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Quick Presets
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {presetSchedules.map((preset) => (
              <Button
                key={preset.name}
                variant="outlined"
                size="small"
                onClick={() => applyPreset(preset)}
              >
                {preset.name}
              </Button>
            ))}
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Schedule Inputs */}
        <Grid container spacing={2}>
          {Object.entries(schedule).map(([day, hours]) => (
            <Grid item xs={12} sm={6} md={4} key={day}>
              <TextField
                fullWidth
                label={day.charAt(0).toUpperCase() + day.slice(1)}
                value={hours}
                onChange={(e) => handleScheduleChange(day, e.target.value)}
                placeholder="e.g., 9:00-17:00"
                helperText={hours ? `${day} schedule` : 'Day off'}
              />
            </Grid>
          ))}
        </Grid>

        {/* Schedule Preview */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Schedule Preview
          </Typography>
          <Paper sx={{ p: 2 }}>
            {Object.entries(schedule).map(([day, hours]) => (
              <Box key={day} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ textTransform: 'capitalize', fontWeight: 'medium' }}>
                  {day}:
                </Typography>
                <Typography variant="body2" color={hours ? 'text.primary' : 'text.secondary'}>
                  {typeof hours === 'string' ? hours :
                    typeof hours === 'object' && hours !== null ?
                      (hours.start && hours.end ? `${hours.start} - ${hours.end}` :
                        hours.working ? 'Working' : 'Day off') :
                      hours || 'Day off'}
                </Typography>
              </Box>
            ))}
          </Paper>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} startIcon={<X size={16} />}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          startIcon={<Save size={16} />}
          disabled={loading}
        >
          {loading ? <CircularProgress size={20} /> : 'Save Schedule'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ======================
// ATTENDANCE DIALOG
// ======================
export const AttendanceDialog = ({ open, onClose, staff, onRecord }) => {
  const [attendanceData, setAttendanceData] = useState({
    date: new Date().toISOString().split('T')[0],
    status: 'present',
    checkInTime: '',
    checkOutTime: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      setAttendanceData({
        date: new Date().toISOString().split('T')[0],
        status: 'present',
        checkInTime: '',
        checkOutTime: '',
        notes: ''
      });
    }
  }, [open]);

  const handleInputChange = (field, value) => {
    setAttendanceData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const validation = staffService.validateAttendanceData(attendanceData);
      if (!validation.isValid) {
        setError(Object.values(validation.errors).join(', '));
        return;
      }

      await onRecord(staff._id, attendanceData);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to record attendance');
    } finally {
      setLoading(false);
    }
  };

  const statusOptions = [
    { value: 'present', label: 'Present' },
    { value: 'absent', label: 'Absent' },
    { value: 'late', label: 'Late' },
    { value: 'half_day', label: 'Half Day' },
    { value: 'sick_leave', label: 'Sick Leave' },
    { value: 'vacation', label: 'Vacation' }
  ];

  if (!staff) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Record Attendance - {staff.name}
      </DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Date"
              type="date"
              value={attendanceData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              InputLabelProps={{ shrink: true }}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth required>
              <InputLabel>Status</InputLabel>
              <Select
                value={attendanceData.status}
                label="Status"
                onChange={(e) => handleInputChange('status', e.target.value)}
              >
                {statusOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {attendanceData.status === 'present' && (
            <>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Check In Time"
                  type="time"
                  value={attendanceData.checkInTime}
                  onChange={(e) => handleInputChange('checkInTime', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Check Out Time"
                  type="time"
                  value={attendanceData.checkOutTime}
                  onChange={(e) => handleInputChange('checkOutTime', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </>
          )}

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Notes"
              multiline
              rows={3}
              value={attendanceData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Additional notes about attendance..."
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} startIcon={<X size={16} />}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          startIcon={<UserCheck size={16} />}
          disabled={loading}
        >
          {loading ? <CircularProgress size={20} /> : 'Record Attendance'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ======================
// LEAVE REQUEST DIALOG
// ======================
export const LeaveRequestDialog = ({ open, onClose, staff, onSubmit }) => {
  const [leaveData, setLeaveData] = useState({
    startDate: '',
    endDate: '',
    type: 'vacation',
    reason: '',
    emergencyContact: {
      name: '',
      phone: ''
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      setLeaveData({
        startDate: '',
        endDate: '',
        type: 'vacation',
        reason: '',
        emergencyContact: {
          name: '',
          phone: ''
        }
      });
    }
  }, [open]);

  const handleInputChange = (field, value) => {
    setLeaveData(prev => ({ ...prev, [field]: value }));
  };

  const handleEmergencyContactChange = (field, value) => {
    setLeaveData(prev => ({
      ...prev,
      emergencyContact: { ...prev.emergencyContact, [field]: value }
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const validation = staffService.validateLeaveData(leaveData);
      if (!validation.isValid) {
        setError(Object.values(validation.errors).join(', '));
        return;
      }

      await onSubmit(staff._id, leaveData);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit leave request');
    } finally {
      setLoading(false);
    }
  };

  const leaveTypes = [
    { value: 'vacation', label: 'Vacation' },
    { value: 'sick_leave', label: 'Sick Leave' },
    { value: 'personal', label: 'Personal' },
    { value: 'emergency', label: 'Emergency' },
    { value: 'maternity', label: 'Maternity Leave' },
    { value: 'paternity', label: 'Paternity Leave' },
    { value: 'other', label: 'Other' }
  ];

  if (!staff) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Submit Leave Request - {staff.name}
      </DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Start Date"
              type="date"
              value={leaveData.startDate}
              onChange={(e) => handleInputChange('startDate', e.target.value)}
              InputLabelProps={{ shrink: true }}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="End Date"
              type="date"
              value={leaveData.endDate}
              onChange={(e) => handleInputChange('endDate', e.target.value)}
              InputLabelProps={{ shrink: true }}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth required>
              <InputLabel>Leave Type</InputLabel>
              <Select
                value={leaveData.type}
                label="Leave Type"
                onChange={(e) => handleInputChange('type', e.target.value)}
              >
                {leaveTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Reason"
              multiline
              rows={4}
              value={leaveData.reason}
              onChange={(e) => handleInputChange('reason', e.target.value)}
              placeholder="Please provide a detailed reason for your leave request..."
              required
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Emergency Contact
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Contact Name"
              value={leaveData.emergencyContact.name}
              onChange={(e) => handleEmergencyContactChange('name', e.target.value)}
              placeholder="Full name of emergency contact"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Contact Phone"
              value={leaveData.emergencyContact.phone}
              onChange={(e) => handleEmergencyContactChange('phone', e.target.value)}
              placeholder="Phone number of emergency contact"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} startIcon={<X size={16} />}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          startIcon={<Calendar size={16} />}
          disabled={loading}
        >
          {loading ? <CircularProgress size={20} /> : 'Submit Request'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
