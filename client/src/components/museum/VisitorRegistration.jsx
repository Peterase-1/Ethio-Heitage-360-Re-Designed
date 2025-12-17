import React, { useState, useEffect } from 'react';
import {
  UserPlus, Search, Filter, CheckCircle, XCircle, Eye,
  TrendingUp, Users, DollarSign, Calendar, RefreshCcw, Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import api from '../../utils/api';

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Textarea } from "../ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { toast } from 'sonner';

const VisitorRegistration = () => {
  // ==========================
  // STATE MANAGEMENT
  // ==========================
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
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

  // Modal states
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState(null);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');

  // Ethiopian Data
  const ethiopianNationalities = [
    'Ethiopian', 'Ethiopian (Oromo)', 'Ethiopian (Amhara)', 'Ethiopian (Tigray)',
    'Ethiopian (Gurage)', 'Ethiopian (Sidama)', 'Ethiopian (Wolayta)', 'Ethiopian (Afar)',
    'Ethiopian (Somali)', 'Ethiopian (Gamo)', 'Ethiopian (Hadiya)', 'Ethiopian (Kembata)'
  ];

  // Form Data
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
      amount: 50,
      paymentMethod: 'cash'
    },
    specialRequirements: '',
    notes: ''
  });

  // ==========================
  // DATA LOADING
  // ==========================
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
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadRegistrations = async () => {
    try {
      // Assuming api.getVisitorRegistrations returns { success: true, data: { registrations: [] } }
      const response = await api.getVisitorRegistrations({ page: 1, limit: 1000 });
      if (response && response.success && response.data) {
        setRegistrations(response.data.registrations || []);
      } else {
        setRegistrations([]);
      }
    } catch (error) {
      console.error('Load registrations error:', error);
      toast.error('Failed to load visitor registrations');
    }
  };

  const loadAnalytics = async () => {
    try {
      const response = await api.getVisitorAnalytics();
      if (response && response.success && response.data) {
        setAnalytics(response.data);
      }
    } catch (error) {
      console.error('Load analytics error:', error);
      toast.error('Failed to load analytics data');
    }
  };

  const handleRefresh = async () => {
    try {
      setLoading(true);
      const response = await api.refreshVisitorData();
      if (response.success) {
        setRegistrations(response.data.registrations || []);
        setAnalytics(response.data.analytics || analytics);
        toast.success('Data refreshed successfully!');
      } else {
        throw new Error(response.message || 'Failed to refresh data');
      }
    } catch (error) {
      console.error('Refresh error:', error);
      toast.error('Failed to refresh data. Retrying with standard load...');
      await Promise.all([loadData(), loadAnalytics()]);
    } finally {
      setLoading(false);
    }
  };

  // ==========================
  // HANDLERS
  // ==========================
  const handleCreateRegistration = async () => {
    try {
      // Validations
      if (!formData.visitorInfo.name) return toast.error('Name is required');
      if (!formData.visitorInfo.age) return toast.error('Age is required');
      if (!formData.visitorInfo.gender) return toast.error('Gender is required');
      if (!formData.visitorInfo.nationality) return toast.error('Nationality is required');
      if (!formData.visitorInfo.visitorType) return toast.error('Visitor type is required');
      if (!formData.visitDetails.visitPurpose) return toast.error('Visit purpose is required');
      if (!formData.visitDetails.expectedDuration) return toast.error('Expected duration is required');

      const response = await api.registerVisitor(formData);
      toast.success('Visitor registered successfully!');
      setShowRegistrationModal(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Create registration error:', error);
      toast.error('Failed to register visitor');
    }
  };

  const handleUpdateStatus = async (registrationId, status) => {
    try {
      await api.updateVisitorStatus(registrationId, { status });
      toast.success('Visitor status updated successfully!');
      loadData();
    } catch (error) {
      console.error('Update status error:', error);
      toast.error('Failed to update visitor status');
    }
  };

  const resetForm = () => {
    setFormData({
      visitorInfo: {
        name: '', email: '', phone: '', age: '', gender: '', nationality: '', visitorType: ''
      },
      visitDetails: {
        visitDate: format(new Date(), 'yyyy-MM-dd'),
        visitTime: format(new Date(), 'HH:mm'),
        groupSize: 1,
        visitPurpose: '',
        expectedDuration: 2
      },
      payment: {
        amount: 50,
        paymentMethod: 'cash'
      },
      specialRequirements: '',
      notes: ''
    });
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'registered': return 'secondary';
      case 'checked_in': return 'default'; // success-like
      case 'checked_out': return 'outline';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  // ==========================
  // FILTERS
  // ==========================
  const filteredRegistrations = registrations.filter(registration => {
    const matchesSearch = !searchTerm ||
      registration.registrationId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registration.visitorInfo?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registration.visitorInfo?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || registration.status === filterStatus;
    const matchesType = filterType === 'all' || registration.visitorInfo?.visitorType === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  // ==========================
  // RENDER HELPERS
  // ==========================
  const renderAnalyticsOverview = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-blue-600">{analytics.overview.totalVisitors}</div>
            <p className="text-xs text-muted-foreground">Total Visitors</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            <Users className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-green-600">{analytics.overview.todayVisitors}</div>
            <p className="text-xs text-muted-foreground">Today's Visitors</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
            <Calendar className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-orange-600">{analytics.overview.thisWeekVisitors}</div>
            <p className="text-xs text-muted-foreground">This Week</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
            <TrendingUp className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-purple-600">ETB {analytics.revenue.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total Revenue</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
            <DollarSign className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Visitor Registration & Analytics</h1>
          <p className="text-muted-foreground">Register visitors and track museum analytics</p>
        </div>
        <Button variant="outline" onClick={handleRefresh} disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCcw className="mr-2 h-4 w-4" />}
          {loading ? 'Refreshing...' : 'Refresh All Data'}
        </Button>
      </div>

      {renderAnalyticsOverview()}

      <Tabs defaultValue="registrations" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="registrations">Registrations</TabsTrigger>
          <TabsTrigger value="analytics">Analytics Details</TabsTrigger>
        </TabsList>

        <TabsContent value="registrations" className="space-y-4">
          <Card>
            <div className="p-4 md:p-6 space-y-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-lg font-semibold">Visitor Registrations</h2>
                <Button onClick={() => setShowRegistrationModal(true)}>
                  <UserPlus className="mr-2 h-4 w-4" /> Register Visitor
                </Button>
              </div>

              {/* Filter Bar */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by ID, Name, Email..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="w-full md:w-[200px]">
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger>
                      <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="registered">Registered</SelectItem>
                      <SelectItem value="checked_in">Checked In</SelectItem>
                      <SelectItem value="checked_out">Checked Out</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-full md:w-[200px]">
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger>
                      <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="local">Local</SelectItem>
                      <SelectItem value="international">International</SelectItem>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="researcher">Researcher</SelectItem>
                      <SelectItem value="tourist">Tourist</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Registration ID</TableHead>
                      <TableHead>Visitor</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Visit Date</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                        </TableCell>
                      </TableRow>
                    ) : filteredRegistrations.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                          No visitor registrations found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredRegistrations.map((bg) => (
                        <TableRow key={bg._id}>
                          <TableCell className="font-medium">#{bg.registrationId}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{bg.visitorInfo?.name}</div>
                              <div className="text-xs text-muted-foreground">{bg.visitorInfo?.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">{bg.visitorInfo?.visitorType}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(bg.status)} className="capitalize">
                              {bg.status.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{bg.visitDetails?.visitDate ? format(new Date(bg.visitDetails.visitDate), 'MMM dd, yyyy') : '-'}</div>
                              <div className="text-xs text-muted-foreground">{bg.visitDetails?.visitTime}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>ETB {bg.payment?.amount?.toLocaleString()}</div>
                              <div className="text-xs text-muted-foreground capitalize">{bg.payment?.paymentMethod?.replace('_', ' ')}</div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                                      setSelectedRegistration(bg);
                                      setShowDetailModal(true);
                                    }}>
                                      <Eye className="h-4 w-4 text-blue-500" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>View Details</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>

                              {bg.status === 'registered' && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleUpdateStatus(bg._id, 'checked_in')}>
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Check In</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}

                              {bg.status === 'checked_in' && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleUpdateStatus(bg._id, 'checked_out')}>
                                        <XCircle className="h-4 w-4 text-orange-500" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Check Out</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Analytics Dashboard</CardTitle>
              <CardDescription>Detailed visitor analytics and trends.</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground border-dashed border-2 rounded-md m-6">
              <p>Detailed analytics charts will be implemented here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Registration Modal */}
      <Dialog open={showRegistrationModal} onOpenChange={setShowRegistrationModal}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Register New Visitor</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            {/* Visitor Info */}
            <div className="md:col-span-2"><h3 className="font-semibold text-sm text-primary">Visitor Information</h3></div>

            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={formData.visitorInfo.name} onChange={(e) => setFormData({ ...formData, visitorInfo: { ...formData.visitorInfo, name: e.target.value } })} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={formData.visitorInfo.email} onChange={(e) => setFormData({ ...formData, visitorInfo: { ...formData.visitorInfo, email: e.target.value } })} />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={formData.visitorInfo.phone} onChange={(e) => setFormData({ ...formData, visitorInfo: { ...formData.visitorInfo, phone: e.target.value } })} />
            </div>
            <div className="space-y-2">
              <Label>Age</Label>
              <Input type="number" value={formData.visitorInfo.age} onChange={(e) => setFormData({ ...formData, visitorInfo: { ...formData.visitorInfo, age: e.target.value } })} />
            </div>
            <div className="space-y-2">
              <Label>Gender</Label>
              <Select value={formData.visitorInfo.gender} onValueChange={(val) => setFormData({ ...formData, visitorInfo: { ...formData.visitorInfo, gender: val } })}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Nationality</Label>
              <Select value={formData.visitorInfo.nationality} onValueChange={(val) => setFormData({ ...formData, visitorInfo: { ...formData.visitorInfo, nationality: val } })}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {ethiopianNationalities.map(nat => <SelectItem key={nat} value={nat}>{nat}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label>Visitor Type</Label>
              <Select value={formData.visitorInfo.visitorType} onValueChange={(val) => setFormData({ ...formData, visitorInfo: { ...formData.visitorInfo, visitorType: val } })}>
                <SelectTrigger><SelectValue placeholder="Select Type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="local">Local</SelectItem>
                  <SelectItem value="international">International</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="researcher">Researcher</SelectItem>
                  <SelectItem value="tourist">Tourist</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Visit Details */}
            <div className="md:col-span-2 mt-4"><h3 className="font-semibold text-sm text-primary">Visit Details</h3></div>

            <div className="space-y-2">
              <Label>Visit Date</Label>
              <Input type="date" value={formData.visitDetails.visitDate} onChange={(e) => setFormData({ ...formData, visitDetails: { ...formData.visitDetails, visitDate: e.target.value } })} />
            </div>
            <div className="space-y-2">
              <Label>Visit Time</Label>
              <Input type="time" value={formData.visitDetails.visitTime} onChange={(e) => setFormData({ ...formData, visitDetails: { ...formData.visitDetails, visitTime: e.target.value } })} />
            </div>
            <div className="space-y-2">
              <Label>Group Size</Label>
              <Input type="number" value={formData.visitDetails.groupSize} onChange={(e) => setFormData({ ...formData, visitDetails: { ...formData.visitDetails, groupSize: e.target.value } })} />
            </div>
            <div className="space-y-2">
              <Label>Purpose</Label>
              <Select value={formData.visitDetails.visitPurpose} onValueChange={(val) => setFormData({ ...formData, visitDetails: { ...formData.visitDetails, visitPurpose: val } })}>
                <SelectTrigger><SelectValue placeholder="Select Purpose" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="research">Research</SelectItem>
                  <SelectItem value="tourism">Tourism</SelectItem>
                  <SelectItem value="cultural">Cultural</SelectItem>
                  <SelectItem value="family">Family</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label>Expected Duration (hrs)</Label>
              <Input type="number" value={formData.visitDetails.expectedDuration} onChange={(e) => setFormData({ ...formData, visitDetails: { ...formData.visitDetails, expectedDuration: e.target.value } })} />
            </div>

            {/* Payment */}
            <div className="md:col-span-2 mt-4"><h3 className="font-semibold text-sm text-primary">Payment Information</h3></div>

            <div className="space-y-2">
              <Label>Amount (ETB)</Label>
              <Input type="number" value={formData.payment.amount} onChange={(e) => setFormData({ ...formData, payment: { ...formData.payment, amount: e.target.value } })} />
            </div>
            <div className="space-y-2">
              <Label>Method</Label>
              <Select value={formData.payment.paymentMethod} onValueChange={(val) => setFormData({ ...formData, payment: { ...formData.payment, paymentMethod: val } })}>
                <SelectTrigger><SelectValue placeholder="Select Method" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="mobile_money">Mobile Money</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div className="md:col-span-2 space-y-2 mt-2">
              <Label>Special Requirements</Label>
              <Textarea value={formData.specialRequirements} onChange={(e) => setFormData({ ...formData, specialRequirements: e.target.value })} />
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label>Notes</Label>
              <Textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRegistrationModal(false)}>Cancel</Button>
            <Button onClick={handleCreateRegistration}>Register Visitor</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Visitor Details</DialogTitle>
          </DialogHeader>
          {selectedRegistration && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Name</div>
                  <div className="font-medium">{selectedRegistration.visitorInfo?.name}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Email</div>
                  <div className="font-medium">{selectedRegistration.visitorInfo?.email}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Phone</div>
                  <div className="font-medium">{selectedRegistration.visitorInfo?.phone}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Visitor Type</div>
                  <Badge variant="outline">{selectedRegistration.visitorInfo?.visitorType}</Badge>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="text-sm font-medium mb-3">Visit Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Date</div>
                    <div>{selectedRegistration.visitDetails?.visitDate ? format(new Date(selectedRegistration.visitDetails.visitDate), 'PP') : '-'}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Time</div>
                    <div>{selectedRegistration.visitDetails?.visitTime}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Purpose</div>
                    <div className="capitalize">{selectedRegistration.visitDetails?.visitPurpose}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Group Size</div>
                    <div>{selectedRegistration.visitDetails?.groupSize}</div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4 bg-muted/20 p-4 rounded-md">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Payment Amount</div>
                    <div className="font-bold text-lg">ETB {selectedRegistration.payment?.amount}</div>
                  </div>
                  <Badge variant="secondary" className="capitalize">{selectedRegistration.payment?.paymentMethod?.replace('_', ' ')}</Badge>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowDetailModal(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VisitorRegistration;
