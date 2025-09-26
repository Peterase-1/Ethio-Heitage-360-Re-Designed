import React, { useState, useEffect } from 'react';
import MuseumAdminSidebar from '../dashboard/MuseumAdminSidebar';
import {
  Box, Typography, Container, Grid, Paper, Button, TextField,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem, Card, CardContent,
  CardActions, Avatar, Badge, Tabs, Tab, Alert, Snackbar, CircularProgress,
  Checkbox, Tooltip, Menu, MenuItem as MenuItemComponent
} from '@mui/material';
import {
  Calendar,
  Plus,
  Eye,
  Edit,
  Delete,
  RefreshCw,
  Clock,
  MapPin,
  Users,
  Trophy,
  Settings,
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertCircle,
  X,
  Copy,
  Download,
  BarChart3,
  Filter,
  Search,
  MoreVertical,
  Star,
  Calendar as CalendarIcon,
  UserCheck
} from 'lucide-react';
import eventService from '../../services/eventService';

const EventManagement = () => {
  const [tabValue, setTabValue] = useState(0);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [stats, setStats] = useState({
    totalEvents: 0,
    activeEvents: 0,
    totalRegistrations: 0,
    totalRevenue: 0
  });
  const [eventTypes, setEventTypes] = useState([]);
  const [categories, setCategories] = useState([]);

  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [openAnalyticsDialog, setOpenAnalyticsDialog] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Load initial data
  useEffect(() => {
    loadEvents();
    loadStats();
    loadEventTypesAndCategories();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const events = await eventService.getAllEvents();
      setEvents(events || []);
    } catch (err) {
      console.error('Load events error:', err);
      setError(err.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const stats = await eventService.getEventStats();
      setStats(stats || {
        totalEvents: 0,
        activeEvents: 0,
        totalRegistrations: 0
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
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [newEvent, setNewEvent] = useState({
    title: '',
    type: 'Exhibition',
    date: '',
    endDate: '',
    time: '',
    location: '',
    capacity: '',
    description: '',
    ticketPrice: '',
    category: 'Educational'
  });

  const statusColors = {
    'draft': 'default',
    'published': 'success',
    'upcoming': 'info',
    'active': 'success',
    'ongoing': 'success',
    'completed': 'default',
    'cancelled': 'error',
    'archived': 'default'
  };

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
      console.log('Created event response:', response);
      setEvents([response, ...events]);
      setOpenCreateDialog(false);
      setSuccess('Event created successfully!');

      // Refresh the events list to ensure we have the latest data
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
      setSuccess('Event created successfully');
      loadStats(); // Refresh stats
    } catch (err) {
      console.error('Create event error:', err);
      setError(err.message || 'Failed to create event');
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
      setSuccess('Event updated successfully');
      loadStats(); // Refresh stats
    } catch (err) {
      console.error('Update event error:', err);
      setError(err.message || 'Failed to update event');
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) {
      return;
    }

    try {
      await eventService.deleteEvent(id);
      setEvents(events.filter(event => event._id !== id));
      setSuccess('Event deleted successfully');
      loadStats(); // Refresh stats
    } catch (err) {
      console.error('Delete event error:', err);
      setError(err.message || 'Failed to delete event');
    }
  };

  const handleDuplicateEvent = async (id) => {
    try {
      const response = await eventService.duplicateEvent(id);
      setEvents([response.data, ...events]);
      setSuccess('Event duplicated successfully');
      loadStats(); // Refresh stats
    } catch (err) {
      console.error('Duplicate event error:', err);
      setError(err.message || 'Failed to duplicate event');
    }
  };

  const handleBulkStatusUpdate = async (status) => {
    if (selectedEvents.length === 0) {
      setError('Please select events to update');
      return;
    }

    try {
      await eventService.bulkUpdateEventStatus(selectedEvents, status);
      setEvents(events.map(event =>
        selectedEvents.includes(event._id) ? { ...event, status } : event
      ));
      setSelectedEvents([]);
      setSuccess(`Successfully updated ${selectedEvents.length} events to ${status}`);
      loadStats(); // Refresh stats
    } catch (err) {
      console.error('Bulk update error:', err);
      setError(err.message || 'Failed to update events');
    }
  };

  const handleViewAnalytics = async (eventId) => {
    try {
      const analytics = await eventService.getEventAnalytics(eventId);
      setAnalyticsData(analytics.data);
      setOpenAnalyticsDialog(true);
    } catch (err) {
      console.error('Get analytics error:', err);
      setError(err.message || 'Failed to load analytics');
    }
  };

  const handleExportAttendees = async (eventId) => {
    try {
      await eventService.exportEventAttendees(eventId);
      setSuccess('Attendees exported successfully');
    } catch (err) {
      console.error('Export attendees error:', err);
      setError(err.message || 'Failed to export attendees');
    }
  };

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

  const renderEventsList = () => {
    if (loading) {
      return (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      );
    }

    if (events.length === 0) {
      return (
        <Box display="flex" flexDirection="column" alignItems="center" p={4}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No events found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create your first event to get started
          </Typography>
        </Box>
      );
    }

    // Filter events based on search and filters
    const filteredEvents = events.filter(event => {
      const displayEvent = eventService.formatEventForDisplay(event);
      if (!displayEvent) return false;

      const matchesSearch = !searchTerm ||
        displayEvent.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        displayEvent.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = !statusFilter || displayEvent.status === statusFilter;
      const matchesType = !typeFilter || displayEvent.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });

    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selectedEvents.length === filteredEvents.length && filteredEvents.length > 0}
                  indeterminate={selectedEvents.length > 0 && selectedEvents.length < filteredEvents.length}
                  onChange={handleSelectAllEvents}
                />
              </TableCell>
              <TableCell>Event</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Capacity</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredEvents.map((event) => {
              const displayEvent = eventService.formatEventForDisplay(event);
              if (!displayEvent) {
                return null; // Skip invalid events
              }
              return (
                <TableRow key={event._id} hover>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedEvents.includes(event._id)}
                      onChange={() => handleSelectEvent(event._id)}
                    />
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="subtitle2">{displayEvent.title}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {displayEvent.category} • {displayEvent.ticketPrice} ETB
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip label={displayEvent.type} color="primary" size="small" />
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">{displayEvent.date}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {displayEvent.time}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{displayEvent.location}</TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">
                        {displayEvent.registrations}/{displayEvent.capacity}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {displayEvent.capacity > 0 ? Math.round((displayEvent.registrations / displayEvent.capacity) * 100) : 0}% full
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={displayEvent.status}
                      color={statusColors[displayEvent.status] || 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={0.5}>
                      <Tooltip title="View Details">
                        <IconButton size="small" onClick={() => setSelectedEvent(event)}>
                          <Eye size={16} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Event">
                        <IconButton size="small" onClick={() => {
                          setEditingEvent(event);
                          setOpenEditDialog(true);
                        }}>
                          <Edit size={16} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Duplicate Event">
                        <IconButton size="small" onClick={() => handleDuplicateEvent(event._id)}>
                          <Copy size={16} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="View Analytics">
                        <IconButton size="small" onClick={() => handleViewAnalytics(event._id)}>
                          <BarChart3 size={16} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Export Attendees">
                        <IconButton size="small" onClick={() => handleExportAttendees(event._id)}>
                          <Download size={16} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Event">
                        <IconButton size="small" color="error" onClick={() => handleDeleteEvent(event._id)}>
                          <Delete size={16} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

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
              <Calendar className="mr-3" size={32} style={{ color: '#8B5A3C' }} />
              Event Management
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Create and manage museum events, exhibitions, and educational programs
            </Typography>
          </Box>

          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, textAlign: 'center', background: 'linear-gradient(135deg, #8B4513 0%, #A0522D 100%)', color: 'white' }}>
                <Typography variant="h4">{stats.totalEvents || 0}</Typography>
                <Typography variant="body2">Total Events</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, textAlign: 'center', background: 'linear-gradient(135deg, #8B4513 0%, #D2691E 100%)', color: 'white' }}>
                <Typography variant="h4">{stats.activeEvents || 0}</Typography>
                <Typography variant="body2">Active Events</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, textAlign: 'center', background: 'linear-gradient(135deg, #8B4513 0%, #CD853F 100%)', color: 'white' }}>
                <Typography variant="h4">{stats.totalRegistrations || 0}</Typography>
                <Typography variant="body2">Total Registrations</Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Actions */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Events & Exhibitions</Typography>
              <Box display="flex" gap={1}>
                <Button
                  variant="outlined"
                  startIcon={<RefreshCw size={16} />}
                  onClick={loadEvents}
                  disabled={loading}
                >
                  Refresh
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Plus size={16} />}
                  onClick={() => setOpenCreateDialog(true)}
                  sx={{
                    backgroundColor: '#8B5A3C',
                    color: 'white',
                    '&:hover': { backgroundColor: '#8B5A3C' }
                  }}
                >
                  Create New Event
                </Button>
              </Box>
            </Box>

            {/* Search and Filters */}
            <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
              <TextField
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="small"
                sx={{ flexGrow: 1, maxWidth: 300 }}
                InputProps={{
                  startAdornment: <Search size={16} style={{ marginRight: 8, color: '#666' }} />
                }}
              />
              <Button
                variant="outlined"
                startIcon={<Filter size={16} />}
                onClick={() => setShowFilters(!showFilters)}
              >
                Filters
              </Button>
            </Box>

            {/* Filter Options */}
            {showFilters && (
              <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    label="Status"
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <MenuItem value="">All Status</MenuItem>
                    <MenuItem value="draft">Draft</MenuItem>
                    <MenuItem value="published">Published</MenuItem>
                    <MenuItem value="cancelled">Cancelled</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="archived">Archived</MenuItem>
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={typeFilter}
                    label="Type"
                    onChange={(e) => setTypeFilter(e.target.value)}
                  >
                    <MenuItem value="">All Types</MenuItem>
                    {eventTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            )}

            {/* Bulk Actions */}
            {selectedEvents.length > 0 && (
              <Paper sx={{ p: 2, mb: 2, backgroundColor: '#f5f5f5' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="body2">
                    {selectedEvents.length} event(s) selected
                  </Typography>
                  <Box display="flex" gap={1}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleBulkStatusUpdate('published')}
                    >
                      Publish
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleBulkStatusUpdate('cancelled')}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleBulkStatusUpdate('archived')}
                    >
                      Archive
                    </Button>
                    <Button
                      size="small"
                      variant="text"
                      onClick={() => setSelectedEvents([])}
                    >
                      Clear Selection
                    </Button>
                  </Box>
                </Box>
              </Paper>
            )}
          </Paper>

          {/* Events List */}
          {renderEventsList()}

          {/* Create Event Dialog */}
          <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} maxWidth="md" fullWidth>
            <DialogTitle>Create New Event</DialogTitle>
            <DialogContent>
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Event Title"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Type</InputLabel>
                    <Select
                      value={newEvent.type}
                      label="Type"
                      onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
                    >
                      {eventTypes.map((type) => (
                        <MenuItem key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={newEvent.category}
                      label="Category"
                      onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
                    >
                      {categories.map((category) => (
                        <MenuItem key={category} value={category}>{category.charAt(0).toUpperCase() + category.slice(1)}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Start Date"
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="End Date"
                    type="date"
                    value={newEvent.endDate}
                    onChange={(e) => setNewEvent({ ...newEvent, endDate: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Time"
                    placeholder="e.g., 09:00-17:00"
                    value={newEvent.time}
                    onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Location"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Capacity"
                    type="number"
                    value={newEvent.capacity}
                    onChange={(e) => setNewEvent({ ...newEvent, capacity: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Ticket Price (ETB)"
                    type="number"
                    value={newEvent.ticketPrice}
                    onChange={(e) => setNewEvent({ ...newEvent, ticketPrice: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    multiline
                    rows={4}
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenCreateDialog(false)} startIcon={<X size={16} />}>Cancel</Button>
              <Button
                onClick={handleCreateEvent}
                variant="contained"
                sx={{
                  backgroundColor: '#8B5A3C',
                  color: 'white',
                  '&:hover': { backgroundColor: '#8B5A3C' }
                }}
              >
                Create Event
              </Button>
            </DialogActions>
          </Dialog>

          {/* Event Detail Dialog */}
          <Dialog open={!!selectedEvent} onClose={() => setSelectedEvent(null)} maxWidth="md" fullWidth>
            {selectedEvent && (() => {
              const displayEvent = eventService.formatEventForDisplay(selectedEvent);
              return (
                <>
                  <DialogTitle>{displayEvent.title}</DialogTitle>
                  <DialogContent>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="h6" gutterBottom>Event Details</Typography>
                        <Typography><strong>Type:</strong> {displayEvent.type}</Typography>
                        <Typography><strong>Category:</strong> {displayEvent.category}</Typography>
                        <Typography><strong>Date:</strong> {displayEvent.date} - {displayEvent.endDate}</Typography>
                        <Typography><strong>Time:</strong> {displayEvent.time}</Typography>
                        <Typography><strong>Location:</strong> {displayEvent.location}</Typography>
                        <Typography><strong>Price:</strong> {displayEvent.ticketPrice} ETB</Typography>
                        <Typography><strong>Status:</strong> {displayEvent.status}</Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="h6" gutterBottom>Registration Stats</Typography>
                        <Typography><strong>Capacity:</strong> {displayEvent.capacity}</Typography>
                        <Typography><strong>Registered:</strong> {displayEvent.registrations}</Typography>
                        <Typography><strong>Available:</strong> {displayEvent.capacity - displayEvent.registrations}</Typography>
                        <Typography><strong>Occupancy:</strong> {displayEvent.capacity > 0 ? Math.round((displayEvent.registrations / displayEvent.capacity) * 100) : 0}%</Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom>Description</Typography>
                        <Typography>{selectedEvent.description}</Typography>
                      </Grid>
                    </Grid>
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={() => setSelectedEvent(null)}>Close</Button>
                    <Button variant="contained" onClick={() => {
                      setEditingEvent(selectedEvent);
                      setOpenEditDialog(true);
                      setSelectedEvent(null);
                    }}>Edit Event</Button>
                  </DialogActions>
                </>
              );
            })()}
          </Dialog>

          {/* Edit Event Dialog */}
          <Dialog open={openEditDialog} onClose={() => {
            setOpenEditDialog(false);
            setEditingEvent(null);
          }} maxWidth="md" fullWidth>
            <DialogTitle>Edit Event</DialogTitle>
            <DialogContent>
              {editingEvent && (
                <Grid container spacing={3} sx={{ mt: 1 }}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Event Title"
                      value={editingEvent.title || ''}
                      onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Type</InputLabel>
                      <Select
                        value={editingEvent.type || ''}
                        label="Type"
                        onChange={(e) => setEditingEvent({ ...editingEvent, type: e.target.value })}
                      >
                        {eventTypes.map((type) => (
                          <MenuItem key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Category</InputLabel>
                      <Select
                        value={editingEvent.category || ''}
                        label="Category"
                        onChange={(e) => setEditingEvent({ ...editingEvent, category: e.target.value })}
                      >
                        {categories.map((category) => (
                          <MenuItem key={category} value={category}>{category.charAt(0).toUpperCase() + category.slice(1)}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Start Date"
                      type="date"
                      value={editingEvent.schedule?.startDate ? new Date(editingEvent.schedule.startDate).toISOString().split('T')[0] : ''}
                      onChange={(e) => setEditingEvent({
                        ...editingEvent,
                        schedule: {
                          ...editingEvent.schedule,
                          startDate: e.target.value
                        }
                      })}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="End Date"
                      type="date"
                      value={editingEvent.schedule?.endDate ? new Date(editingEvent.schedule.endDate).toISOString().split('T')[0] : ''}
                      onChange={(e) => setEditingEvent({
                        ...editingEvent,
                        schedule: {
                          ...editingEvent.schedule,
                          endDate: e.target.value
                        }
                      })}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Start Time"
                      placeholder="e.g., 09:00"
                      value={editingEvent.schedule?.startTime || ''}
                      onChange={(e) => setEditingEvent({
                        ...editingEvent,
                        schedule: {
                          ...editingEvent.schedule,
                          startTime: e.target.value
                        }
                      })}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="End Time"
                      placeholder="e.g., 17:00"
                      value={editingEvent.schedule?.endTime || ''}
                      onChange={(e) => setEditingEvent({
                        ...editingEvent,
                        schedule: {
                          ...editingEvent.schedule,
                          endTime: e.target.value
                        }
                      })}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Location"
                      value={editingEvent.location?.venue || ''}
                      onChange={(e) => setEditingEvent({
                        ...editingEvent,
                        location: {
                          ...editingEvent.location,
                          venue: e.target.value
                        }
                      })}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Capacity"
                      type="number"
                      value={editingEvent.registration?.capacity || ''}
                      onChange={(e) => setEditingEvent({
                        ...editingEvent,
                        registration: {
                          ...editingEvent.registration,
                          capacity: e.target.value
                        }
                      })}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Ticket Price (ETB)"
                      type="number"
                      value={editingEvent.registration?.fees?.adult || ''}
                      onChange={(e) => setEditingEvent({
                        ...editingEvent,
                        registration: {
                          ...editingEvent.registration,
                          fees: {
                            ...editingEvent.registration?.fees,
                            adult: e.target.value
                          }
                        }
                      })}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={editingEvent.status || 'draft'}
                        label="Status"
                        onChange={(e) => setEditingEvent({ ...editingEvent, status: e.target.value })}
                      >
                        <MenuItem value="draft">Draft</MenuItem>
                        <MenuItem value="published">Published</MenuItem>
                        <MenuItem value="cancelled">Cancelled</MenuItem>
                        <MenuItem value="completed">Completed</MenuItem>
                        <MenuItem value="archived">Archived</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Description"
                      multiline
                      rows={4}
                      value={editingEvent.description || ''}
                      onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
                    />
                  </Grid>
                </Grid>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => {
                setOpenEditDialog(false);
                setEditingEvent(null);
              }} startIcon={<X size={16} />}>Cancel</Button>
              <Button onClick={() => editingEvent && handleUpdateEvent(editingEvent._id, editingEvent)} variant="contained" disabled={!editingEvent}>Update Event</Button>
            </DialogActions>
          </Dialog>

          {/* Analytics Dialog */}
          <Dialog open={openAnalyticsDialog} onClose={() => setOpenAnalyticsDialog(false)} maxWidth="md" fullWidth>
            <DialogTitle>Event Analytics</DialogTitle>
            <DialogContent>
              {analyticsData && (
                <Grid container spacing={3}>
                  {/* Basic Stats */}
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>Basic Statistics</Typography>
                        <Box display="flex" flexDirection="column" gap={1}>
                          <Box display="flex" justifyContent="space-between">
                            <Typography>Total Views:</Typography>
                            <Typography fontWeight="bold">{analyticsData.basic.totalViews}</Typography>
                          </Box>
                          <Box display="flex" justifyContent="space-between">
                            <Typography>Total Registrations:</Typography>
                            <Typography fontWeight="bold">{analyticsData.basic.totalRegistrations}</Typography>
                          </Box>
                          <Box display="flex" justifyContent="space-between">
                            <Typography>Total Attendees:</Typography>
                            <Typography fontWeight="bold">{analyticsData.basic.totalAttendees}</Typography>
                          </Box>
                          <Box display="flex" justifyContent="space-between">
                            <Typography>Average Rating:</Typography>
                            <Typography fontWeight="bold">{analyticsData.basic.averageRating.toFixed(1)} ⭐</Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Registration Stats */}
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>Registration Statistics</Typography>
                        <Box display="flex" flexDirection="column" gap={1}>
                          <Box display="flex" justifyContent="space-between">
                            <Typography>Capacity:</Typography>
                            <Typography fontWeight="bold">{analyticsData.registration.capacity}</Typography>
                          </Box>
                          <Box display="flex" justifyContent="space-between">
                            <Typography>Occupancy Rate:</Typography>
                            <Typography fontWeight="bold">{analyticsData.registration.occupancyRate.toFixed(1)}%</Typography>
                          </Box>
                          <Box display="flex" justifyContent="space-between">
                            <Typography>Available Spots:</Typography>
                            <Typography fontWeight="bold">{analyticsData.registration.availableSpots}</Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Attendee Breakdown */}
                  <Grid item xs={12}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>Attendee Breakdown</Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={6} md={2}>
                            <Box textAlign="center">
                              <Typography variant="h4" color="primary">{analyticsData.attendeeBreakdown.registered}</Typography>
                              <Typography variant="body2">Registered</Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6} md={2}>
                            <Box textAlign="center">
                              <Typography variant="h4" color="info.main">{analyticsData.attendeeBreakdown.confirmed}</Typography>
                              <Typography variant="body2">Confirmed</Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6} md={2}>
                            <Box textAlign="center">
                              <Typography variant="h4" color="success.main">{analyticsData.attendeeBreakdown.attended}</Typography>
                              <Typography variant="body2">Attended</Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6} md={2}>
                            <Box textAlign="center">
                              <Typography variant="h4" color="warning.main">{analyticsData.attendeeBreakdown.cancelled}</Typography>
                              <Typography variant="body2">Cancelled</Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6} md={2}>
                            <Box textAlign="center">
                              <Typography variant="h4" color="error.main">{analyticsData.attendeeBreakdown.noShow}</Typography>
                              <Typography variant="body2">No Show</Typography>
                            </Box>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Revenue */}
                  <Grid item xs={12}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>Revenue</Typography>
                        <Typography variant="h4" color="success.main">
                          {analyticsData.revenue.totalRevenue.toLocaleString()} {analyticsData.revenue.currency}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Rating Distribution */}
                  <Grid item xs={12}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>Rating Distribution</Typography>
                        <Grid container spacing={1}>
                          {analyticsData.reviews.ratingDistribution.map((rating) => (
                            <Grid item xs={2} key={rating.rating}>
                              <Box textAlign="center">
                                <Typography variant="h6">{rating.rating} ⭐</Typography>
                                <Typography variant="body2">{rating.count}</Typography>
                              </Box>
                            </Grid>
                          ))}
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenAnalyticsDialog(false)}>Close</Button>
            </DialogActions>
          </Dialog>

          {/* Error/Success Snackbars */}
          <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
            <Alert onClose={() => setError(null)} severity="error">
              {error}
            </Alert>
          </Snackbar>
          <Snackbar open={!!success} autoHideDuration={6000} onClose={() => setSuccess(null)}>
            <Alert onClose={() => setSuccess(null)} severity="success">
              {success}
            </Alert>
          </Snackbar>
        </Container>
      </div>
    </div>
  );
};

export default EventManagement;
