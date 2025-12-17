import React, { useState, useEffect } from 'react';
import MuseumAdminSidebar from '../dashboard/MuseumAdminSidebar';
import {
  Calendar, Plus, Eye, Edit, Delete, RefreshCw, Clock, MapPin,
  Users, Trophy, Settings, TrendingUp, CheckCircle, XCircle,
  AlertCircle, X, Copy, Download, BarChart3, Filter, Search,
  MoreVertical, Star, Calendar as CalendarIcon, UserCheck, Loader2
} from 'lucide-react';
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../ui/card";
import { Badge } from "../ui/badge";
import { Checkbox } from "../ui/checkbox";
import { Textarea } from "../ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { toast } from 'sonner';
import eventService from '../../services/eventService';

const EventManagement = () => {
  // ======================
  // STATE
  // ======================
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEvents: 0,
    activeEvents: 0,
    totalRegistrations: 0,
    totalRevenue: 0
  });
  const [eventTypes, setEventTypes] = useState([]);
  const [categories, setCategories] = useState([]);

  // Dialogs
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [openAnalyticsDialog, setOpenAnalyticsDialog] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);

  // Filters & Selection
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all_statuses');
  const [typeFilter, setTypeFilter] = useState('all_types');
  const [showFilters, setShowFilters] = useState(false);

  // New Event Form
  const [newEvent, setNewEvent] = useState({
    title: '',
    type: 'exhibition',
    date: '',
    endDate: '',
    time: '',
    location: '',
    capacity: '',
    description: '',
    ticketPrice: '',
    category: 'education'
  });

  // ======================
  // COLORS & MAPPINGS
  // ======================
  const statusColors = {
    'draft': 'default', // secondary in shadcn
    'published': 'default', // primary
    'upcoming': 'outline', // info-like
    'active': 'green', // custom success
    'ongoing': 'green',
    'completed': 'secondary',
    'cancelled': 'destructive',
    'archived': 'secondary'
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'published':
      case 'active':
      case 'ongoing':
        return 'default';
      case 'cancelled':
        return 'destructive';
      case 'upcoming':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  // ======================
  // EFFECTS
  // ======================
  useEffect(() => {
    loadEvents();
    loadStats();
    loadEventTypesAndCategories();
  }, []);

  // ======================
  // DATA LOADING
  // ======================
  const loadEvents = async () => {
    try {
      setLoading(true);
      const eventsData = await eventService.getAllEvents();
      setEvents(eventsData || []);
    } catch (err) {
      console.error('Load events error:', err);
      toast.error(err.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await eventService.getEventStats();
      setStats(statsData || {
        totalEvents: 0,
        activeEvents: 0,
        totalRegistrations: 0,
        totalRevenue: 0
      });
    } catch (err) {
      console.error('Load stats error:', err);
    }
  };

  const loadEventTypesAndCategories = async () => {
    try {
      const response = await eventService.getEventTypesAndCategories();
      setEventTypes(response.types || []);
      setCategories(response.categories || []);
    } catch (err) {
      console.error('Load types and categories error:', err);
      // Fallback data
      setEventTypes(['exhibition', 'workshop', 'lecture', 'tour', 'conference', 'cultural_event', 'educational_program', 'special_exhibition', 'community_event', 'virtual_event', 'other']);
      setCategories(['art', 'history', 'culture', 'archaeology', 'science', 'education', 'entertainment', 'community', 'research', 'preservation']);
    }
  };

  // ======================
  // HANDLERS
  // ======================
  const handleCreateEvent = async () => {
    try {
      const eventData = eventService.formatEventData({
        ...newEvent,
        startDate: newEvent.date,
        endDate: newEvent.endDate,
        startTime: newEvent.time?.split('-')[0]?.trim(),
        endTime: newEvent.time?.split('-')[1]?.trim(),
        locationType: 'physical',
        venue: newEvent.location,
        registrationRequired: true,
        capacity: newEvent.capacity,
        adultFee: newEvent.ticketPrice,
        currency: 'ETB'
      });

      const response = await eventService.createEvent(eventData);
      setEvents([response, ...events]);
      setOpenCreateDialog(false);
      toast.success('Event created successfully!');

      await loadEvents();
      setNewEvent({
        title: '',
        type: 'exhibition',
        date: '',
        endDate: '',
        time: '',
        location: '',
        capacity: '',
        description: '',
        ticketPrice: '',
        category: 'education'
      });
      loadStats();
    } catch (err) {
      console.error('Create event error:', err);
      toast.error(err.message || 'Failed to create event');
    }
  };

  const handleUpdateEvent = async (id, eventData) => {
    try {
      const response = await eventService.updateEvent(id, eventData);
      setEvents(events.map(event =>
        event._id === id ? response.data : event
      ));
      setOpenEditDialog(false);
      setEditingEvent(null);
      toast.success('Event updated successfully');
      loadStats();
    } catch (err) {
      console.error('Update event error:', err);
      toast.error(err.message || 'Failed to update event');
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) {
      return;
    }

    try {
      await eventService.deleteEvent(id);
      setEvents(events.filter(event => event._id !== id));
      toast.success('Event deleted successfully');
      loadStats();
    } catch (err) {
      console.error('Delete event error:', err);
      toast.error(err.message || 'Failed to delete event');
    }
  };

  const handleDuplicateEvent = async (id) => {
    try {
      const response = await eventService.duplicateEvent(id);
      setEvents([response.data, ...events]);
      toast.success('Event duplicated successfully');
      loadStats();
    } catch (err) {
      console.error('Duplicate event error:', err);
      toast.error(err.message || 'Failed to duplicate event');
    }
  };

  const handleBulkStatusUpdate = async (status) => {
    if (selectedEvents.length === 0) {
      toast.error('Please select events to update');
      return;
    }

    try {
      await eventService.bulkUpdateEventStatus(selectedEvents, status);
      setEvents(events.map(event =>
        selectedEvents.includes(event._id) ? { ...event, status } : event
      ));
      setSelectedEvents([]);
      toast.success(`Successfully updated ${selectedEvents.length} events to ${status}`);
      loadStats();
    } catch (err) {
      console.error('Bulk update error:', err);
      toast.error(err.message || 'Failed to update events');
    }
  };

  const handleViewAnalytics = async (eventId) => {
    try {
      const analytics = await eventService.getEventAnalytics(eventId);
      setAnalyticsData(analytics.data);
      setOpenAnalyticsDialog(true);
    } catch (err) {
      console.error('Get analytics error:', err);
      toast.error(err.message || 'Failed to load analytics');
    }
  };

  const handleExportAttendees = async (eventId) => {
    try {
      await eventService.exportEventAttendees(eventId);
      toast.success('Attendees exported successfully');
    } catch (err) {
      console.error('Export attendees error:', err);
      toast.error(err.message || 'Failed to export attendees');
    }
  };

  // Selection Handlers
  const handleSelectEvent = (eventId) => {
    setSelectedEvents(prev =>
      prev.includes(eventId)
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    );
  };

  const handleSelectAllEvents = () => {
    if (selectedEvents.length === events.length) {
      setSelectedEvents([]);
    } else {
      setSelectedEvents(events.map(event => event._id));
    }
  };

  // ======================
  // RENDER HELPERS
  // ======================
  const renderEventsList = () => {
    if (loading) {
      return (
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      );
    }

    if (events.length === 0) {
      return (
        <div className="flex flex-col items-center p-8 text-center text-muted-foreground">
          <Calendar className="h-12 w-12 mb-2 opacity-20" />
          <h3 className="text-lg font-medium">No events found</h3>
          <p className="text-sm">Create your first event to get started</p>
        </div>
      );
    }

    // Filter events
    const filteredEvents = events.filter(event => {
      const displayEvent = eventService.formatEventForDisplay(event);
      if (!displayEvent) return false;

      const matchesSearch = !searchTerm ||
        displayEvent.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        displayEvent.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all_statuses' || displayEvent.status === statusFilter;
      const matchesType = typeFilter === 'all_types' || displayEvent.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });

    return (
      <Card>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={selectedEvents.length === filteredEvents.length && filteredEvents.length > 0}
                    onCheckedChange={handleSelectAllEvents}
                  />
                </TableHead>
                <TableHead>Event</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEvents.map((event) => {
                const displayEvent = eventService.formatEventForDisplay(event);
                if (!displayEvent) return null;

                return (
                  <TableRow key={event._id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedEvents.includes(event._id)}
                        onCheckedChange={() => handleSelectEvent(event._id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{displayEvent.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {displayEvent.category} • {displayEvent.ticketPrice} ETB
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize">{displayEvent.type.replace('_', ' ')}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{displayEvent.date}</div>
                        <div className="text-xs text-muted-foreground">{displayEvent.time}</div>
                      </div>
                    </TableCell>
                    <TableCell>{displayEvent.location}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {displayEvent.registrations}/{displayEvent.capacity}
                        <div className="text-xs text-muted-foreground">
                          {displayEvent.capacity > 0 ? Math.round((displayEvent.registrations / displayEvent.capacity) * 100) : 0}% full
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(displayEvent.status)}>
                        {displayEvent.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedEvent(event)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>View Details</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                                setEditingEvent(event);
                                setOpenEditDialog(true);
                              }}>
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Edit Event</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDuplicateEvent(event._id)}>
                                <Copy className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Duplicate Event</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleViewAnalytics(event._id)}>
                                <BarChart3 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>View Analytics</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDeleteEvent(event._id)}>
                                <Delete className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Delete Event</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>
    );
  };

  return (
    <div className="flex min-h-screen bg-background">
      <MuseumAdminSidebar />

      <div className="flex-1 overflow-auto">
        <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center">
                <Calendar className="mr-3 h-8 w-8 text-primary" />
                Event Management
              </h1>
              <p className="text-muted-foreground mt-1">
                Create and manage museum events, exhibitions, and educational programs
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground border-none">
              <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                <h3 className="text-4xl font-bold mb-1">{stats.totalEvents || 0}</h3>
                <p className="text-sm font-medium opacity-90">Total Events</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-[#D2691E] to-[#D2691E]/80 text-white border-none">
              <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                <h3 className="text-4xl font-bold mb-1">{stats.activeEvents || 0}</h3>
                <p className="text-sm font-medium opacity-90">Active Events</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-[#CD853F] to-[#CD853F]/80 text-white border-none">
              <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                <h3 className="text-4xl font-bold mb-1">{stats.totalRegistrations || 0}</h3>
                <p className="text-sm font-medium opacity-90">Total Registrations</p>
              </CardContent>
            </Card>
          </div>

          {/* Actions & Filters */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-lg font-semibold">Events & Exhibitions</h2>
              <div className="flex gap-2">
                <Button variant="outline" onClick={loadEvents} disabled={loading}>
                  <RefreshCw className="mr-2 h-4 w-4" /> Refresh
                </Button>
                <Button onClick={() => setOpenCreateDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Create New Event
                </Button>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search events..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
                <Filter className="mr-2 h-4 w-4" /> Filters
              </Button>
            </div>

            {showFilters && (
              <div className="flex gap-4 p-4 border rounded-md bg-muted/20">
                <div className="w-full md:w-[200px]">
                  <Label className="mb-2 block">Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger><SelectValue placeholder="All Status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all_statuses">All Status</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-full md:w-[200px]">
                  <Label className="mb-2 block">Type</Label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger><SelectValue placeholder="All Types" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all_types">All Types</SelectItem>
                      {eventTypes.map(type => (
                        <SelectItem key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {selectedEvents.length > 0 && (
              <div className="flex items-center gap-4 p-4 bg-muted rounded-md text-sm">
                <span className="font-medium">{selectedEvents.length} selected</span>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleBulkStatusUpdate('published')}>Publish</Button>
                  <Button size="sm" variant="outline" onClick={() => handleBulkStatusUpdate('cancelled')}>Cancel</Button>
                  <Button size="sm" variant="outline" onClick={() => handleBulkStatusUpdate('archived')}>Archive</Button>
                  <Button size="sm" variant="ghost" onClick={() => setSelectedEvents([])}>Clear</Button>
                </div>
              </div>
            )}
          </div>

          {/* Events Table */}
          {renderEventsList()}

          {/* Create Event Dialog */}
          <Dialog open={openCreateDialog} onOpenChange={setOpenCreateDialog}>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Event</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="title">Event Title</Label>
                  <Input id="title" value={newEvent.title} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select value={newEvent.type} onValueChange={(val) => setNewEvent({ ...newEvent, type: val })}>
                    <SelectTrigger><SelectValue placeholder="Select Type" /></SelectTrigger>
                    <SelectContent>
                      {eventTypes.map(type => (
                        <SelectItem key={type} value={type}>{type.replace('_', ' ')}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={newEvent.category} onValueChange={(val) => setNewEvent({ ...newEvent, category: val })}>
                    <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Start Date</Label>
                  <Input id="date" type="date" value={newEvent.date} onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input id="endDate" type="date" value={newEvent.endDate} onChange={(e) => setNewEvent({ ...newEvent, endDate: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Time (e.g. 09:00-17:00)</Label>
                  <Input id="time" value={newEvent.time} onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" value={newEvent.location} onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input id="capacity" type="number" value={newEvent.capacity} onChange={(e) => setNewEvent({ ...newEvent, capacity: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Ticket Price (ETB)</Label>
                  <Input id="price" type="number" value={newEvent.ticketPrice} onChange={(e) => setNewEvent({ ...newEvent, ticketPrice: e.target.value })} />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" rows={4} value={newEvent.description} onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenCreateDialog(false)}>Cancel</Button>
                <Button onClick={handleCreateEvent}>Create Event</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit Event Dialog */}
          <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Event</DialogTitle>
              </DialogHeader>
              {editingEvent && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="edit-title">Event Title</Label>
                    <Input id="edit-title" value={editingEvent.title || ''} onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-type">Type</Label>
                    <Select value={editingEvent.type || ''} onValueChange={(val) => setEditingEvent({ ...editingEvent, type: val })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{eventTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-cat">Category</Label>
                    <Select value={editingEvent.category || ''} onValueChange={(val) => setEditingEvent({ ...editingEvent, category: val })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input type="date" value={editingEvent.schedule?.startDate ? new Date(editingEvent.schedule.startDate).toISOString().split('T')[0] : ''}
                      onChange={(e) => setEditingEvent({ ...editingEvent, schedule: { ...editingEvent.schedule, startDate: e.target.value } })} />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Input type="date" value={editingEvent.schedule?.endDate ? new Date(editingEvent.schedule.endDate).toISOString().split('T')[0] : ''}
                      onChange={(e) => setEditingEvent({ ...editingEvent, schedule: { ...editingEvent.schedule, endDate: e.target.value } })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Start Time</Label>
                    <Input value={editingEvent.schedule?.startTime || ''}
                      onChange={(e) => setEditingEvent({ ...editingEvent, schedule: { ...editingEvent.schedule, startTime: e.target.value } })} />
                  </div>
                  <div className="space-y-2">
                    <Label>End Time</Label>
                    <Input value={editingEvent.schedule?.endTime || ''}
                      onChange={(e) => setEditingEvent({ ...editingEvent, schedule: { ...editingEvent.schedule, endTime: e.target.value } })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input value={editingEvent.location?.venue || ''}
                      onChange={(e) => setEditingEvent({ ...editingEvent, location: { ...editingEvent.location, venue: e.target.value } })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Capacity</Label>
                    <Input type="number" value={editingEvent.registration?.capacity || ''}
                      onChange={(e) => setEditingEvent({ ...editingEvent, registration: { ...editingEvent.registration, capacity: e.target.value } })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Ticket Price</Label>
                    <Input type="number" value={editingEvent.registration?.fees?.adult || ''}
                      onChange={(e) => setEditingEvent({ ...editingEvent, registration: { ...editingEvent.registration, fees: { ...editingEvent.registration.fees, adult: e.target.value } } })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={editingEvent.status || 'draft'} onValueChange={(val) => setEditingEvent({ ...editingEvent, status: val })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label>Description</Label>
                    <Textarea rows={4} value={editingEvent.description || ''}
                      onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })} />
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenEditDialog(false)}>Cancel</Button>
                <Button onClick={() => editingEvent && handleUpdateEvent(editingEvent._id, editingEvent)}>Update Event</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Event Details Dialog */}
          <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
            <DialogContent className="sm:max-w-[700px]">
              {selectedEvent && (() => {
                const displayEvent = eventService.formatEventForDisplay(selectedEvent);
                return (
                  <>
                    <DialogHeader>
                      <DialogTitle>{displayEvent.title}</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                      <div className="space-y-4">
                        <h4 className="font-semibold border-b pb-2">Event Details</h4>
                        <div className="grid grid-cols-[100px_1fr] gap-2 text-sm">
                          <span className="text-muted-foreground">Type:</span>
                          <span className="capitalize">{displayEvent.type.replace('_', ' ')}</span>
                          <span className="text-muted-foreground">Category:</span>
                          <span className="capitalize">{displayEvent.category.replace('_', ' ')}</span>
                          <span className="text-muted-foreground">Date:</span>
                          <span>{displayEvent.date} {displayEvent.endDate ? `- ${displayEvent.endDate}` : ''}</span>
                          <span className="text-muted-foreground">Time:</span>
                          <span>{displayEvent.time}</span>
                          <span className="text-muted-foreground">Location:</span>
                          <span>{displayEvent.location}</span>
                          <span className="text-muted-foreground">Price:</span>
                          <span>{displayEvent.ticketPrice} ETB</span>
                          <span className="text-muted-foreground">Status:</span>
                          <span className="capitalize">{displayEvent.status}</span>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-semibold border-b pb-2">Registration</h4>
                        <div className="grid grid-cols-[100px_1fr] gap-2 text-sm">
                          <span className="text-muted-foreground">Capacity:</span>
                          <span>{displayEvent.capacity}</span>
                          <span className="text-muted-foreground">Registered:</span>
                          <span>{displayEvent.registrations}</span>
                          <span className="text-muted-foreground">Available:</span>
                          <span>{displayEvent.capacity - displayEvent.registrations}</span>
                          <span className="text-muted-foreground">Occupancy:</span>
                          <span>{displayEvent.capacity > 0 ? Math.round((displayEvent.registrations / displayEvent.capacity) * 100) : 0}%</span>
                        </div>
                      </div>

                      <div className="md:col-span-2 space-y-2">
                        <h4 className="font-semibold border-b pb-2">Description</h4>
                        <p className="text-sm text-muted-foreground">{selectedEvent.description}</p>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setSelectedEvent(null)}>Close</Button>
                      <Button onClick={() => {
                        setEditingEvent(selectedEvent);
                        setOpenEditDialog(true);
                        setSelectedEvent(null);
                      }}>Edit Event</Button>
                    </DialogFooter>
                  </>
                );
              })()}
            </DialogContent>
          </Dialog>

          {/* Analytics Dialog */}
          <Dialog open={openAnalyticsDialog} onOpenChange={setOpenAnalyticsDialog}>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Event Analytics</DialogTitle>
              </DialogHeader>
              {analyticsData && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-base">Basic Statistics</CardTitle></CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between"><span>Total Views:</span><span className="font-bold">{analyticsData.basic.totalViews}</span></div>
                      <div className="flex justify-between"><span>Total Registrations:</span><span className="font-bold">{analyticsData.basic.totalRegistrations}</span></div>
                      <div className="flex justify-between"><span>Total Attendees:</span><span className="font-bold">{analyticsData.basic.totalAttendees}</span></div>
                      <div className="flex justify-between"><span>Avg Rating:</span><span className="font-bold">{analyticsData.basic.averageRating.toFixed(1)} ⭐</span></div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-base">Capacity</CardTitle></CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between"><span>Capacity:</span><span className="font-bold">{analyticsData.registration.capacity}</span></div>
                      <div className="flex justify-between"><span>Occupancy:</span><span className="font-bold">{analyticsData.registration.occupancyRate.toFixed(1)}%</span></div>
                      <div className="flex justify-between"><span>Available:</span><span className="font-bold">{analyticsData.registration.availableSpots}</span></div>
                    </CardContent>
                  </Card>

                  <Card className="md:col-span-2">
                    <CardHeader className="pb-2"><CardTitle className="text-base">Attendee Breakdown</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-2">
                      <div className="text-center"><div className="text-2xl font-bold text-primary">{analyticsData.attendeeBreakdown.registered}</div><div className="text-xs text-muted-foreground">Registered</div></div>
                      <div className="text-center"><div className="text-2xl font-bold text-blue-500">{analyticsData.attendeeBreakdown.confirmed}</div><div className="text-xs text-muted-foreground">Confirmed</div></div>
                      <div className="text-center"><div className="text-2xl font-bold text-green-500">{analyticsData.attendeeBreakdown.attended}</div><div className="text-xs text-muted-foreground">Attended</div></div>
                      <div className="text-center"><div className="text-2xl font-bold text-yellow-500">{analyticsData.attendeeBreakdown.cancelled}</div><div className="text-xs text-muted-foreground">Cancelled</div></div>
                      <div className="text-center"><div className="text-2xl font-bold text-red-500">{analyticsData.attendeeBreakdown.noShow}</div><div className="text-xs text-muted-foreground">No Show</div></div>
                    </CardContent>
                  </Card>

                  <Card className="md:col-span-2">
                    <CardHeader className="pb-2"><CardTitle className="text-base">Revenue</CardTitle></CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-green-600">
                        {analyticsData.revenue.totalRevenue.toLocaleString()} {analyticsData.revenue.currency}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </DialogContent>
          </Dialog>

        </div>
      </div>
    </div>
  );
};

export default EventManagement;
