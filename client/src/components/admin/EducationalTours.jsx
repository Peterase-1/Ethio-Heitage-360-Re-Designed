import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Avatar
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  People as PeopleIcon
} from '@mui/icons-material';
import api from '../../utils/api';

const EducationalTours = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tours, setTours] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTour, setEditingTour] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    duration: '',
    maxParticipants: 0,
    price: 0,
    status: 'draft'
  });

  const statuses = ['draft', 'published', 'cancelled', 'completed'];

  useEffect(() => {
    loadTours();
  }, []);

  const loadTours = async () => {
    try {
      setLoading(true);
      const response = await api.request('/educational-tours');

      if (response.success) {
        setTours(response.data || response.tours || []);
      } else {
        throw new Error(response.message || 'Failed to load tours');
      }
    } catch (error) {
      console.error('Error loading tours:', error);
      setError('Failed to load tours');

      // Set fallback data for development
      setTours([
        {
          id: '1',
          title: 'Lalibela Rock-Hewn Churches Tour',
          description: 'Explore the magnificent rock-hewn churches of Lalibela',
          location: 'Lalibela, Amhara',
          duration: '3 days',
          maxParticipants: 15,
          price: 2500,
          status: 'published',
          participants: 12,
          rating: 4.8
        },
        {
          id: '2',
          title: 'Aksum Archaeological Sites',
          description: 'Discover the ancient kingdom of Aksum and its archaeological treasures',
          location: 'Aksum, Tigray',
          duration: '2 days',
          maxParticipants: 20,
          price: 1800,
          status: 'published',
          participants: 18,
          rating: 4.6
        },
        {
          id: '3',
          title: 'Harar Cultural Heritage',
          description: 'Experience the unique culture and architecture of Harar',
          location: 'Harar, Harari',
          duration: '1 day',
          maxParticipants: 25,
          price: 1200,
          status: 'draft',
          participants: 0,
          rating: 0
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTour = () => {
    setEditingTour(null);
    setFormData({
      title: '',
      description: '',
      location: '',
      duration: '',
      maxParticipants: 0,
      price: 0,
      status: 'draft'
    });
    setDialogOpen(true);
  };

  const handleEditTour = (tour) => {
    setEditingTour(tour);
    setFormData({
      title: tour.title,
      description: tour.description,
      location: tour.location,
      duration: tour.duration,
      maxParticipants: tour.maxParticipants,
      price: tour.price,
      status: tour.status
    });
    setDialogOpen(true);
  };

  const handleSaveTour = async () => {
    try {
      if (editingTour) {
        // Update existing tour
        await api.request(`/educational-tours/${editingTour.id}`, {
          method: 'PUT',
          body: formData
        });
      } else {
        // Create new tour
        await api.request('/educational-tours', {
          method: 'POST',
          body: formData
        });
      }

      setDialogOpen(false);
      loadTours();
    } catch (error) {
      console.error('Error saving tour:', error);
      setError('Failed to save tour');
    }
  };

  const handleDeleteTour = async (tourId) => {
    if (window.confirm('Are you sure you want to delete this tour?')) {
      try {
        await api.request(`/educational-tours/${tourId}`, {
          method: 'DELETE'
        });
        loadTours();
      } catch (error) {
        console.error('Error deleting tour:', error);
        setError('Failed to delete tour');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'success';
      case 'draft': return 'warning';
      case 'cancelled': return 'error';
      case 'completed': return 'info';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Educational Tours
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateTour}
        >
          Add Tour
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Tour</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Participants</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Rating</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tours.map((tour) => (
                  <TableRow key={tour.id}>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {tour.title}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {tour.description.substring(0, 50)}...
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <LocationIcon sx={{ mr: 1, fontSize: 16 }} />
                        {tour.location}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <CalendarIcon sx={{ mr: 1, fontSize: 16 }} />
                        {tour.duration}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <PeopleIcon sx={{ mr: 1, fontSize: 16 }} />
                        {tour.participants}/{tour.maxParticipants}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {tour.price.toLocaleString()} ETB
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Typography variant="body2">
                          {tour.rating > 0 ? tour.rating.toFixed(1) : 'N/A'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={tour.status}
                        color={getStatusColor(tour.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => handleEditTour(tour)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDeleteTour(tour.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Tour Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingTour ? 'Edit Educational Tour' : 'Create New Educational Tour'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tour Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Duration"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="e.g., 3 days, 2 hours"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Max Participants"
                type="number"
                value={formData.maxParticipants}
                onChange={(e) => setFormData({ ...formData, maxParticipants: parseInt(e.target.value) })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Price (ETB)"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  {statuses.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSaveTour} variant="contained">
            {editingTour ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EducationalTours;
