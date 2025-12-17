import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { Badge } from "../ui/badge";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Calendar,
  Clock,
  UserCheck,
  UserX,
  Save,
  X,
  Plus,
  Trash2,
  Loader2
} from 'lucide-react';
import staffService from '../../services/staffService';
import { toast } from 'sonner';

// ======================
// PERMISSIONS DIALOG
// ======================
export const PermissionsDialog = ({ open, onClose, staff, onUpdate }) => {
  const [permissions, setPermissions] = useState([]);
  const [availablePermissions, setAvailablePermissions] = useState([]);
  const [loading, setLoading] = useState(false);

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
      toast.error('Failed to load permissions');
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
      const staffId = staff?._id || staff?.id;
      if (!staffId) {
        toast.error('Staff ID is missing. Cannot update permissions.');
        return;
      }

      await onUpdate(staffId, permissions);
      onClose();
    } catch (err) {
      console.error('PermissionsDialog - Save error:', err);
      toast.error(err.message || 'Failed to update permissions');
    } finally {
      setLoading(false);
    }
  };

  if (!staff) return null;

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Manage Permissions - {staff.name}</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <div className="mb-4">
            <div className="text-sm font-medium mb-1">Current Role</div>
            <div className="text-sm text-muted-foreground">{staff.role}</div>
          </div>

          <div className="text-sm text-muted-foreground mb-4">
            Select the permissions for this staff member. Permissions control what actions they can perform in the system.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto p-1">
            {availablePermissions.map((permission) => (
              <div key={permission} className="flex items-center space-x-2">
                <Checkbox
                  id={`perm-${permission}`}
                  checked={permissions.includes(permission)}
                  onCheckedChange={() => handlePermissionToggle(permission)}
                />
                <Label
                  htmlFor={`perm-${permission}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {permission.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Label>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <div className="text-sm font-medium mb-2">
              Selected Permissions ({permissions.length})
            </div>
            <div className="flex flex-wrap gap-2">
              {permissions.map((permission) => (
                <Badge
                  key={permission}
                  variant="secondary"
                  className="flex items-center gap-1 pr-1"
                >
                  {permission.replace('_', ' ')}
                  <button
                    onClick={() => handlePermissionToggle(permission)}
                    className="ml-1 hover:text-destructive focus:outline-none"
                  >
                    <X size={12} />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {loading ? 'Saving...' : 'Save Permissions'}
          </Button>
        </DialogFooter>
      </DialogContent>
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

  useEffect(() => {
    if (open && staff) {
      // Transform backend schedule format to frontend format
      const backendSchedule = staff.schedule || {};
      const frontendSchedule = {
        monday: '',
        tuesday: '',
        wednesday: '',
        thursday: '',
        friday: '',
        saturday: '',
        sunday: ''
      };

      // Convert backend format to frontend format
      Object.keys(frontendSchedule).forEach(day => {
        const daySchedule = backendSchedule[day];
        if (daySchedule && daySchedule.working && daySchedule.startTime && daySchedule.endTime) {
          frontendSchedule[day] = `${daySchedule.startTime}-${daySchedule.endTime}`;
        }
      });

      setSchedule(frontendSchedule);
    }
  }, [open, staff]);

  const handleScheduleChange = (day, value) => {
    setSchedule(prev => ({ ...prev, [day]: value }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const staffId = staff?._id || staff?.id;
      if (!staffId) {
        toast.error('Staff ID is missing. Cannot update schedule.');
        return;
      }

      // Transform schedule data to match backend schema
      const transformedSchedule = {};
      Object.keys(schedule).forEach(day => {
        const timeString = schedule[day];
        if (timeString && timeString.trim() !== '') {
          const [startTime, endTime] = timeString.split('-');
          transformedSchedule[day] = {
            working: true,
            startTime: startTime?.trim() || '09:00',
            endTime: endTime?.trim() || '17:00',
            breakTime: 60
          };
        } else {
          transformedSchedule[day] = {
            working: false,
            startTime: '09:00',
            endTime: '17:00',
            breakTime: 0
          };
        }
      });

      await onUpdate(staffId, transformedSchedule);
      onClose();
    } catch (err) {
      console.error('ScheduleDialog - Save error:', err);
      toast.error(err.message || 'Failed to update schedule');
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
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Manage Schedule - {staff.name}</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <div className="text-sm text-muted-foreground mb-4">
            Set the working hours for each day of the week. Leave empty for days off. Format: HH:MM-HH:MM (e.g., 9:00-17:00)
          </div>

          <div className="mb-6">
            <div className="text-sm font-medium mb-2">Quick Presets</div>
            <div className="flex flex-wrap gap-2">
              {presetSchedules.map((preset) => (
                <Button
                  key={preset.name}
                  variant="outline"
                  size="sm"
                  onClick={() => applyPreset(preset)}
                >
                  {preset.name}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {Object.entries(schedule).map(([day, hours]) => (
              <div key={day} className="space-y-1">
                <Label htmlFor={`schedule-${day}`} className="capitalize">{day}</Label>
                <Input
                  id={`schedule-${day}`}
                  value={hours}
                  onChange={(e) => handleScheduleChange(day, e.target.value)}
                  placeholder="e.g., 9:00-17:00"
                />
                <div className="text-[10px] text-muted-foreground h-4">
                  {hours ? 'Working' : 'Day off'}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-muted p-4 rounded-md">
            <div className="text-sm font-medium mb-3">Schedule Preview</div>
            <div className="space-y-1">
              {Object.entries(schedule).map(([day, hours]) => (
                <div key={day} className="flex justify-between text-sm">
                  <div className="capitalize font-medium text-foreground/80 w-24">{day}:</div>
                  <div className="text-muted-foreground">{hours || 'Day off'}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {loading ? 'Saving...' : 'Save Schedule'}
          </Button>
        </DialogFooter>
      </DialogContent>
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
        toast.error(Object.values(validation.errors).join(', '));
        return;
      }

      const staffId = staff?._id || staff?.id;
      if (!staffId) {
        toast.error('Staff ID is missing. Cannot record attendance.');
        return;
      }
      await onRecord(staffId, attendanceData);
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to record attendance');
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
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Record Attendance - {staff.name}</DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={attendanceData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={attendanceData.status}
              onValueChange={(val) => handleInputChange('status', val)}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {attendanceData.status === 'present' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="checkIn">Check In</Label>
                <Input
                  id="checkIn"
                  type="time"
                  value={attendanceData.checkInTime}
                  onChange={(e) => handleInputChange('checkInTime', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="checkOut">Check Out</Label>
                <Input
                  id="checkOut"
                  type="time"
                  value={attendanceData.checkOutTime}
                  onChange={(e) => handleInputChange('checkOutTime', e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              rows={3}
              value={attendanceData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Additional notes about attendance..."
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserCheck className="mr-2 h-4 w-4" />}
            {loading ? 'Recording...' : 'Record Attendance'}
          </Button>
        </DialogFooter>
      </DialogContent>
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
        toast.error(Object.values(validation.errors).join(', '));
        return;
      }

      const staffId = staff?._id || staff?.id;
      if (!staffId) {
        toast.error('Staff ID is missing. Cannot submit leave request.');
        return;
      }
      await onSubmit(staffId, leaveData);
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to submit leave request');
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
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Submit Leave Request - {staff.name}</DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={leaveData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={leaveData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="leaveType">Leave Type</Label>
            <Select
              value={leaveData.type}
              onValueChange={(val) => handleInputChange('type', val)}
            >
              <SelectTrigger id="leaveType">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {leaveTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason</Label>
            <Textarea
              id="reason"
              rows={4}
              value={leaveData.reason}
              onChange={(e) => handleInputChange('reason', e.target.value)}
              placeholder="Please provide a detailed reason for your leave request..."
              required
            />
          </div>

          <div className="pt-2">
            <div className="text-base font-medium mb-3">Emergency Contact</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactName">Name</Label>
                <Input
                  id="contactName"
                  value={leaveData.emergencyContact.name}
                  onChange={(e) => handleEmergencyContactChange('name', e.target.value)}
                  placeholder="Full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPhone">Phone</Label>
                <Input
                  id="contactPhone"
                  value={leaveData.emergencyContact.phone}
                  onChange={(e) => handleEmergencyContactChange('phone', e.target.value)}
                  placeholder="Phone number"
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Calendar className="mr-2 h-4 w-4" />}
            {loading ? 'Submitting...' : 'Submit Request'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
