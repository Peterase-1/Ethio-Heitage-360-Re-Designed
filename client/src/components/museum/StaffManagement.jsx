import React, { useState, useEffect } from 'react';
import MuseumAdminSidebar from '../dashboard/MuseumAdminSidebar';
import {
  Users, Plus, Eye, Edit, Delete, Mail, Phone, Clock, Calendar,
  TrendingUp, Shield, UserCheck, UserX, Settings, Award, Activity,
  Search, ListFilter, MoreVertical, CheckCircle2, X,
  UserPlus, UserMinus, RefreshCw, Download, Upload, Loader2
} from 'lucide-react';
import staffService from '../../services/staffService';
import {
  PermissionsDialog,
  ScheduleDialog,
  AttendanceDialog,
  LeaveRequestDialog
} from './StaffDialogs';
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { toast } from 'sonner';

const StaffManagement = () => {
  // ======================
  // STATE MANAGEMENT
  // ======================
  const [activeTab, setActiveTab] = useState("all-staff");
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

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
    status: '', // Show all statuses by default
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
      toast.error(err.message || 'Failed to load staff data');

      // Fallback data
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
      toast.error(err.message || 'Failed to load staff');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStaff = async () => {
    try {
      const validation = staffService.validateStaffData(newStaff);
      if (!validation.isValid) {
        const errorMessages = Object.values(validation.errors).join(', ');
        toast.error(`Validation errors: ${errorMessages}`);
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
      toast.success('Staff member created successfully');
      loadStaff();
    } catch (err) {
      console.error('Create staff error:', err);
      if (err.response?.data?.errors) {
        const errorMessages = err.response.data.errors.map(e => e.msg).join(', ');
        toast.error(`Validation errors: ${errorMessages}`);
      } else {
        toast.error(err.message || 'Failed to create staff member');
      }
    }
  };

  const handleUpdateStaff = async (id, data) => {
    try {
      const response = await staffService.updateStaff(id, data);
      setStaff(staff.map(member =>
        member._id === id ? response.data : member
      ));
      setOpenEditDialog(false);
      setSelectedStaff(null);
      toast.success('Staff member updated successfully');
    } catch (err) {
      console.error('Update staff error:', err);
      toast.error(err.message || 'Failed to update staff member');
    }
  };

  const handleDeleteStaff = async (id) => {
    if (!window.confirm('Are you sure you want to delete this staff member?')) {
      return;
    }

    try {
      await staffService.deleteStaff(id);
      setStaff(staff.filter(member => member._id !== id));
      toast.success('Staff member deleted successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to delete staff member');
    }
  };

  const handleUpdatePermissions = async (id, newPermissions) => {
    try {
      const response = await staffService.updateStaffPermissions(id, newPermissions);
      setStaff(staff.map(member =>
        member._id === id ? response.data : member
      ));
      setOpenPermissionsDialog(false);
      toast.success('Permissions updated successfully');
    } catch (err) {
      console.error('Update permissions error:', err);
      if (err.status === 404) {
        toast.error('Staff member not found. Please refresh the staff list.');
        loadStaff();
      } else {
        toast.error(err.message || 'Failed to update permissions');
      }
    }
  };

  const handleUpdateSchedule = async (id, schedule) => {
    try {
      const response = await staffService.updateStaffSchedule(id, schedule);
      setStaff(prevStaff =>
        prevStaff.map(member => {
          if (member._id === id) {
            return {
              ...member,
              schedule: response.data.schedule,
              updatedAt: response.data.updatedAt
            };
          }
          return member;
        })
      );
      setOpenScheduleDialog(false);
      toast.success('Schedule updated successfully');
    } catch (err) {
      console.error('Update schedule error:', err);
      toast.error(err.message || 'Failed to update schedule');
    }
  };

  const handleRecordAttendance = async (id, attendanceData) => {
    try {
      await staffService.recordAttendance(id, attendanceData);
      setStaff(prevStaff =>
        prevStaff.map(member => {
          if (member._id === id) {
            return {
              ...member,
              performance: {
                ...member.performance,
                attendance: {
                  ...member.performance?.attendance,
                  totalDays: (member.performance?.attendance?.totalDays || 0) + 1,
                  presentDays: (member.performance?.attendance?.presentDays || 0) + 1
                }
              }
            };
          }
          return member;
        })
      );
      setOpenAttendanceDialog(false);
      toast.success('Attendance recorded successfully');
      loadStaff();
    } catch (err) {
      toast.error(err.message || 'Failed to record attendance');
    }
  };

  const handleSubmitLeaveRequest = async (id, leaveData) => {
    try {
      await staffService.submitLeaveRequest(id, leaveData);
      setStaff(prevStaff =>
        prevStaff.map(member => {
          if (member._id === id) {
            return {
              ...member,
              status: 'on_leave',
              leaveRequests: [
                ...(member.leaveRequests || []),
                {
                  startDate: leaveData.startDate,
                  endDate: leaveData.endDate,
                  type: leaveData.type,
                  reason: leaveData.reason,
                  status: 'pending',
                  submittedAt: new Date().toISOString()
                }
              ]
            };
          }
          return member;
        })
      );
      setOpenLeaveDialog(false);
      toast.success('Leave request submitted successfully');
      loadStaff();
    } catch (err) {
      toast.error(err.message || 'Failed to submit leave request');
    }
  };

  // ======================
  // FILTER HANDLERS
  // ======================

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      department: '',
      role: '',
      status: '',
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
    <div className="space-y-4">
      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search staff..."
                  className="pl-8"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <Select
                value={filters.department}
                onValueChange={(val) => handleFilterChange('department', val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_departments">All</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Select
                value={filters.role}
                onValueChange={(val) => handleFilterChange('role', val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_roles">All</SelectItem>
                  {roles.map(role => (
                    <SelectItem key={role} value={role}>{role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Select
                value={filters.status}
                onValueChange={(val) => handleFilterChange('status', val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_statuses">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="on_leave">On Leave</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="terminated">Terminated</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Button variant="outline" onClick={clearFilters} className="w-full">
                <ListFilter className="mr-2 h-4 w-4" /> Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Staff Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Staff Member</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Performance</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="flex justify-center"><Loader2 className="animate-spin h-8 w-8 text-muted-foreground" /></div>
                </TableCell>
              </TableRow>
            ) : staff.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No staff members found
                </TableCell>
              </TableRow>
            ) : (
              staff.map((member) => (
                <TableRow key={member._id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback className="bg-primary/20 text-primary">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{member.name}</div>
                        <div className="text-xs text-muted-foreground">{member.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{member.role}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-primary/20 text-primary bg-primary/5">
                      {member.department}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={member.status === 'active' ? 'default' : member.status === 'on_leave' ? 'secondary' : 'destructive'}>
                      {member.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-sm">{member.performance?.rating || 0}/5.0</span>
                      <span className="text-xs text-muted-foreground">({member.performance?.completedTasks || 0} tasks)</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => setSelectedStaff(member)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => {
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
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDeleteStaff(member._id)}>
                        <Delete className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {pagination.totalPages > 1 && (
          <div className="flex justify-center p-4 border-t">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage <= 1}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage >= pagination.totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );

  const renderRolesPermissions = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {roles.map((role) => (
        <Card key={role}>
          <CardHeader>
            <CardTitle className="text-lg">{role}</CardTitle>
            <CardDescription>{staff.filter(s => s.role === role).length} staff members</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {permissions.slice(0, 5).map((permission) => (
                <Badge key={permission} variant="secondary">
                  {permission.replace('_', ' ')}
                </Badge>
              ))}
              {permissions.length > 5 && (
                <Badge variant="outline">+{permissions.length - 5} more</Badge>
              )}
            </div>
          </CardContent>
          <CardFooter className="p-4 pt-0 flex gap-2">
            <Button size="sm" variant="outline" className="w-full" onClick={() => {
              const staffWithRole = staff.find(s => s.role === role);
              if (staffWithRole) {
                setSelectedStaff(staffWithRole);
                setOpenPermissionsDialog(true);
              } else {
                toast.error(`No staff members found with role: ${role}`);
              }
            }}>
              Manage Permissions
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );

  const renderSchedules = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {staff.map((member) => (
        <Card key={member._id}>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3 mb-4">
              <Avatar>
                <AvatarFallback className="bg-primary text-primary-foreground">{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-semibold">{member.name}</div>
                <div className="text-sm text-muted-foreground">{member.role}</div>
              </div>
            </div>

            <div className="space-y-1 mt-2">
              {member.schedule && Object.keys(member.schedule).length > 0 ? (
                Object.entries(member.schedule).map(([day, hours]) => (
                  <div key={day} className="flex justify-between text-sm">
                    <span className="capitalize text-muted-foreground w-1/4">{day}:</span>
                    <span className="font-medium">
                      {typeof hours === 'string' ? hours :
                        typeof hours === 'object' && hours !== null ?
                          (hours.working && hours.startTime && hours.endTime ? `${hours.startTime} - ${hours.endTime}` : 'Off') :
                          hours || 'Off'}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-sm text-muted-foreground italic">No schedule set</div>
              )}
            </div>

            <div className="flex gap-2 mt-4 pt-4 border-t">
              <Button size="sm" variant="outline" className="flex-1" onClick={() => {
                setSelectedStaff(member);
                setOpenScheduleDialog(true);
              }}>
                <Calendar className="mr-2 h-3 w-3" /> Edit Schedule
              </Button>
              <Button size="sm" variant="outline" className="flex-1" onClick={() => {
                setSelectedStaff(member);
                setOpenAttendanceDialog(true);
              }}>
                <UserCheck className="mr-2 h-3 w-3" /> Attendance
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderPerformance = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {staff.map((member) => (
        <Card key={member._id}>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3 mb-4">
              <Avatar>
                <AvatarFallback className="bg-primary text-primary-foreground">{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-semibold">{member.name}</div>
                <div className="text-sm text-muted-foreground">{member.role}</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center mb-4">
              <div className="p-2 bg-muted rounded-md">
                <div className="text-lg font-bold text-primary">{member.performance?.attendance?.totalDays || 0}</div>
                <div className="text-[10px] text-muted-foreground uppercase">Attendance</div>
              </div>
              <div className="p-2 bg-muted rounded-md">
                <div className="text-lg font-bold text-primary">0</div>
                <div className="text-[10px] text-muted-foreground uppercase">Tasks</div>
              </div>
              <div className="p-2 bg-muted rounded-md">
                <div className="text-lg font-bold text-primary">0%</div>
                <div className="text-[10px] text-muted-foreground uppercase">On Time</div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Button size="sm" variant="outline" className="w-full justify-start" onClick={() => {
                setSelectedStaff(member);
                setOpenAttendanceDialog(true);
              }}>
                <Activity className="mr-2 h-4 w-4 text-muted-foreground" /> Record Attendance
              </Button>
              <Button size="sm" variant="outline" className="w-full justify-start" onClick={() => {
                setSelectedStaff(member);
                setOpenLeaveDialog(true);
              }}>
                <Clock className="mr-2 h-4 w-4 text-muted-foreground" /> Leave Request
              </Button>
              <Button size="sm" variant="outline" className="w-full justify-start" onClick={() => {
                setSelectedStaff(member);
                setOpenPermissionsDialog(true);
              }}>
                <Shield className="mr-2 h-4 w-4 text-muted-foreground" /> Permissions
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background">
      <MuseumAdminSidebar />

      <div className="flex-1 overflow-auto">
        <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center">
                <Users className="mr-3 h-8 w-8 text-primary" />
                Staff Management
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage your museum team, roles, schedules, and performance
              </p>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={loadStaff}>
                <RefreshCw className="mr-2 h-4 w-4" /> Refresh
              </Button>
              <Button onClick={() => setOpenAddDialog(true)}>
                <Plus className="mr-2 h-4 w-4" /> Add Staff
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-primary text-primary-foreground border-none">
              <CardContent className="p-6 flex items-center">
                <Users className="h-10 w-10 mr-4 opacity-80" />
                <div>
                  <p className="text-sm font-medium opacity-80">Total Staff</p>
                  <h3 className="text-2xl font-bold">{stats.totalStaff}</h3>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-primary text-primary-foreground border-none">
              <CardContent className="p-6 flex items-center">
                <UserCheck className="h-10 w-10 mr-4 opacity-80" />
                <div>
                  <p className="text-sm font-medium opacity-80">Active Staff</p>
                  <h3 className="text-2xl font-bold">{stats.activeStaff}</h3>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-primary text-primary-foreground border-none">
              <CardContent className="p-6 flex items-center">
                <Shield className="h-10 w-10 mr-4 opacity-80" />
                <div>
                  <p className="text-sm font-medium opacity-80">Roles</p>
                  <h3 className="text-2xl font-bold">{roles.length}</h3>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-primary text-primary-foreground border-none">
              <CardContent className="p-6 flex items-center">
                <Award className="h-10 w-10 mr-4 opacity-80" />
                <div>
                  <p className="text-sm font-medium opacity-80">Avg Rating</p>
                  <h3 className="text-2xl font-bold">{stats.avgRating.toFixed(1)}</h3>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all-staff">All Staff</TabsTrigger>
              <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
              <TabsTrigger value="schedules">Schedules</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
            </TabsList>

            <TabsContent value="all-staff" className="mt-6">
              {renderStaffList()}
            </TabsContent>

            <TabsContent value="roles" className="mt-6">
              {renderRolesPermissions()}
            </TabsContent>

            <TabsContent value="schedules" className="mt-6">
              {renderSchedules()}
            </TabsContent>

            <TabsContent value="performance" className="mt-6">
              {renderPerformance()}
            </TabsContent>
          </Tabs>

          {/* Dialogs */}
          <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
            <DialogContent className="sm:max-w-[700px]">
              <DialogHeader>
                <DialogTitle>Add New Staff Member</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="newName">Full Name</Label>
                  <Input id="newName" value={newStaff.name} onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newEmail">Email</Label>
                  <Input id="newEmail" type="email" value={newStaff.email} onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPhone">Phone</Label>
                  <Input id="newPhone" value={newStaff.phone} onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newHireDate">Hire Date</Label>
                  <Input id="newHireDate" type="date" value={newStaff.hireDate} onChange={(e) => setNewStaff({ ...newStaff, hireDate: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newRole">Role</Label>
                  <Select value={newStaff.role} onValueChange={(val) => setNewStaff({ ...newStaff, role: val })}>
                    <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                    <SelectContent>{roles.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newDept">Department</Label>
                  <Select value={newStaff.department} onValueChange={(val) => setNewStaff({ ...newStaff, department: val })}>
                    <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                    <SelectContent>{departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenAddDialog(false)}>Cancel</Button>
                <Button onClick={handleCreateStaff}>Create Staff</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
            <DialogContent className="sm:max-w-[700px]">
              <DialogHeader>
                <DialogTitle>Edit Staff Member</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="editName">Full Name</Label>
                  <Input id="editName" value={editingStaff.name} onChange={(e) => setEditingStaff({ ...editingStaff, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editEmail">Email</Label>
                  <Input id="editEmail" type="email" value={editingStaff.email} onChange={(e) => setEditingStaff({ ...editingStaff, email: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editPhone">Phone</Label>
                  <Input id="editPhone" value={editingStaff.phone} onChange={(e) => setEditingStaff({ ...editingStaff, phone: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editHireDate">Hire Date</Label>
                  <Input id="editHireDate" type="date" value={editingStaff.hireDate ? new Date(editingStaff.hireDate).toISOString().split('T')[0] : ''} onChange={(e) => setEditingStaff({ ...editingStaff, hireDate: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editRole">Role</Label>
                  <Select value={editingStaff.role} onValueChange={(val) => setEditingStaff({ ...editingStaff, role: val })}>
                    <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                    <SelectContent>{roles.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editDept">Department</Label>
                  <Select value={editingStaff.department} onValueChange={(val) => setEditingStaff({ ...editingStaff, department: val })}>
                    <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                    <SelectContent>{departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenEditDialog(false)}>Cancel</Button>
                <Button onClick={() => selectedStaff && handleUpdateStaff(selectedStaff._id, editingStaff)}>Update Staff</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {selectedStaff && (
            <Dialog open={!openEditDialog && !openPermissionsDialog && !openScheduleDialog && !openAttendanceDialog && !openLeaveDialog && !!selectedStaff} onOpenChange={(open) => !open && setSelectedStaff(null)}>
              <DialogContent className="sm:max-w-[700px]">
                <DialogHeader>
                  <DialogTitle>Staff Details - {selectedStaff.name}</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
                  <div className="flex flex-col items-center text-center space-y-2">
                    <Avatar className="h-24 w-24">
                      <AvatarFallback className="text-2xl bg-primary text-primary-foreground">{selectedStaff.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-lg">{selectedStaff.name}</h3>
                      <p className="text-muted-foreground">{selectedStaff.role}</p>
                    </div>
                  </div>
                  <div className="md:col-span-2 space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Contact Information</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="text-muted-foreground">Email:</div>
                        <div>{selectedStaff.email}</div>
                        <div className="text-muted-foreground">Phone:</div>
                        <div>{selectedStaff.phone || 'N/A'}</div>
                        <div className="text-muted-foreground">Department:</div>
                        <div>{selectedStaff.department}</div>
                        <div className="text-muted-foreground">Hire Date:</div>
                        <div>{new Date(selectedStaff.hireDate).toLocaleDateString()}</div>
                        <div className="text-muted-foreground">Status:</div>
                        <div className="capitalize">{selectedStaff.status.replace('_', ' ')}</div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Actions</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" size="sm" onClick={() => setOpenPermissionsDialog(true)}>
                          <Shield className="mr-2 h-3 w-3" /> Permissions
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setOpenScheduleDialog(true)}>
                          <Calendar className="mr-2 h-3 w-3" /> Schedule
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setOpenAttendanceDialog(true)}>
                          <UserCheck className="mr-2 h-3 w-3" /> Attendance
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setOpenLeaveDialog(true)}>
                          <Clock className="mr-2 h-3 w-3" /> Leave Request
                        </Button>
                        <Button size="sm" className="col-span-2" onClick={() => {
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
                        }}>
                          Edit Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}

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
        </div>
      </div>
    </div>
  );
};

export default StaffManagement;