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
  Calendar,
  Plus,
  Eye,
  Edit,
  Delete,
  Clock,
  MapPin,
  Users,
  Trophy,
  Settings,
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

const EventManagement = () => {
  const [tabValue, setTabValue] = useState(0);
  const [events, setEvents] = useState([
    {
      id: 1,
      title: 'Ancient Ethiopian Civilizations Exhibition',
      type: 'Exhibition',
      date: '2024-09-15',
      endDate: '2024-12-15',
      time: '09:00-17:00',
      location: 'Main Gallery',
      capacity: 200,
      registrations: 145,
      status: 'active',
      description: 'Explore the rich history of ancient Ethiopian civilizations through rare artifacts and interactive displays.',
      ticketPrice: 75,
      category: 'Permanent'
    },
    {
      id: 2,
      title: 'Cultural Heritage Workshop',
      type: 'Workshop',
      date: '2024-08-20',
      endDate: '2024-08-20',
      time: '14:00-16:00',
      location: 'Education Center',
      capacity: 30,
      registrations: 28,
      status: 'upcoming',
      description: 'Hands-on workshop teaching traditional Ethiopian crafts and cultural practices.',
      ticketPrice: 25,
      category: 'Educational'
    },
    {
      id: 3,
      title: 'Night at the Museum',
      type: 'Special Event',
      date: '2024-08-25',
      endDate: '2024-08-25',
      time: '18:00-22:00',
      location: 'Entire Museum',
      capacity: 100,
      registrations: 85,
      status: 'upcoming',
      description: 'Special evening event with guided tours, cultural performances, and traditional food.',
      ticketPrice: 150,
      category: 'Cultural'
    }
  ]);

  const [openCreateDialog, setOpenCreateDialog] = useState(false);
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

  const eventTypes = ['Exhibition', 'Workshop', 'Lecture', 'Special Event', 'Tour', 'Cultural Program'];
  const categories = ['Educational', 'Cultural', 'Permanent', 'Temporary', 'Community', 'Professional'];

  const statusColors = {
    'upcoming': 'info',
    'active': 'success',
    'completed': 'default',
    'cancelled': 'error'
  };

  const handleCreateEvent = () => {
    const id = events.length + 1;
    const newEntry = {
      ...newEvent,
      id,
      registrations: 0,
      status: 'upcoming'
    };
    setEvents([...events, newEntry]);
    setOpenCreateDialog(false);
    setNewEvent({
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
  };

  const renderEventsList = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
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
          {events.map((event) => (
            <TableRow key={event.id}>
              <TableCell>
                <Box>
                  <Typography variant="subtitle2">{event.title}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {event.category} • ${event.ticketPrice} ETB
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Chip label={event.type} color="primary" size="small" />
              </TableCell>
              <TableCell>
                <Box>
                  <Typography variant="body2">{event.date}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {event.time}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>{event.location}</TableCell>
              <TableCell>
                <Box>
                  <Typography variant="body2">
                    {event.registrations}/{event.capacity}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {Math.round((event.registrations / event.capacity) * 100)}% full
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Chip 
                  label={event.status} 
                  color={statusColors[event.status]} 
                  size="small" 
                />
              </TableCell>
              <TableCell>
                <IconButton size="small" onClick={() => setSelectedEvent(event)}>
                  <Eye size={16} />
                </IconButton>
                <IconButton size="small">
                  <Edit size={16} />
                </IconButton>
                <IconButton size="small" color="error">
                  <Delete size={16} />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <MuseumAdminSidebar />
      
      <div className="flex-1 overflow-auto">
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" component="h1" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
              <Calendar className="mr-3" size={32} />
              Event Management
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Create and manage museum events, exhibitions, and educational programs
            </Typography>
          </Box>

          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 3, textAlign: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                <Typography variant="h4">{events.length}</Typography>
                <Typography variant="body2">Total Events</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 3, textAlign: 'center', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
                <Typography variant="h4">{events.filter(e => e.status === 'active').length}</Typography>
                <Typography variant="body2">Active</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 3, textAlign: 'center', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
                <Typography variant="h4">{events.reduce((sum, e) => sum + e.registrations, 0)}</Typography>
                <Typography variant="body2">Registrations</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 3, textAlign: 'center', background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white' }}>
                <Typography variant="h4">{events.reduce((sum, e) => sum + (e.registrations * e.ticketPrice), 0).toLocaleString()}</Typography>
                <Typography variant="body2">Revenue (ETB)</Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Actions */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Events & Exhibitions</Typography>
              <Button
                variant="contained"
                startIcon={<Plus size={16} />}
                onClick={() => setOpenCreateDialog(true)}
              >
                Create New Event
              </Button>
            </Box>
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
                    onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Type</InputLabel>
                    <Select
                      value={newEvent.type}
                      label="Type"
                      onChange={(e) => setNewEvent({...newEvent, type: e.target.value})}
                    >
                      {eventTypes.map((type) => (
                        <MenuItem key={type} value={type}>{type}</MenuItem>
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
                      onChange={(e) => setNewEvent({...newEvent, category: e.target.value})}
                    >
                      {categories.map((category) => (
                        <MenuItem key={category} value={category}>{category}</MenuItem>
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
                    onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="End Date"
                    type="date"
                    value={newEvent.endDate}
                    onChange={(e) => setNewEvent({...newEvent, endDate: e.target.value})}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Time"
                    placeholder="e.g., 09:00-17:00"
                    value={newEvent.time}
                    onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Location"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Capacity"
                    type="number"
                    value={newEvent.capacity}
                    onChange={(e) => setNewEvent({...newEvent, capacity: e.target.value})}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Ticket Price (ETB)"
                    type="number"
                    value={newEvent.ticketPrice}
                    onChange={(e) => setNewEvent({...newEvent, ticketPrice: e.target.value})}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    multiline
                    rows={4}
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenCreateDialog(false)}>Cancel</Button>
              <Button onClick={handleCreateEvent} variant="contained">Create Event</Button>
            </DialogActions>
          </Dialog>

          {/* Event Detail Dialog */}
          <Dialog open={!!selectedEvent} onClose={() => setSelectedEvent(null)} maxWidth="md" fullWidth>
            {selectedEvent && (
              <>
                <DialogTitle>{selectedEvent.title}</DialogTitle>
                <DialogContent>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" gutterBottom>Event Details</Typography>
                      <Typography><strong>Type:</strong> {selectedEvent.type}</Typography>
                      <Typography><strong>Category:</strong> {selectedEvent.category}</Typography>
                      <Typography><strong>Date:</strong> {selectedEvent.date} - {selectedEvent.endDate}</Typography>
                      <Typography><strong>Time:</strong> {selectedEvent.time}</Typography>
                      <Typography><strong>Location:</strong> {selectedEvent.location}</Typography>
                      <Typography><strong>Price:</strong> {selectedEvent.ticketPrice} ETB</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" gutterBottom>Registration Stats</Typography>
                      <Typography><strong>Capacity:</strong> {selectedEvent.capacity}</Typography>
                      <Typography><strong>Registered:</strong> {selectedEvent.registrations}</Typography>
                      <Typography><strong>Available:</strong> {selectedEvent.capacity - selectedEvent.registrations}</Typography>
                      <Typography><strong>Occupancy:</strong> {Math.round((selectedEvent.registrations / selectedEvent.capacity) * 100)}%</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="h6" gutterBottom>Description</Typography>
                      <Typography>{selectedEvent.description}</Typography>
                    </Grid>
                  </Grid>
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setSelectedEvent(null)}>Close</Button>
                  <Button variant="contained">Edit Event</Button>
                </DialogActions>
              </>
            )}
          </Dialog>
        </Container>
      </div>
    </div>
  );
};

export default EventManagement;
