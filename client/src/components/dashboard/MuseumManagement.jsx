import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Button, Card, CardContent, CardMedia, Chip, Dialog, DialogActions,
  DialogContent, DialogTitle, Divider, Grid, IconButton, LinearProgress,
  MenuItem, Paper, Select, Table, TableBody, TableCell, TableContainer,
  TableHead, TablePagination, TableRow, TextField, Typography, useTheme,
  Avatar, FormControl, InputLabel, Snackbar, Alert, Tooltip, CardHeader, List, ListItem, ListItemAvatar, ListItemText, Collapse
} from '@mui/material';
import {
  Search as SearchIcon, FilterList as FilterListIcon, CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon, Delete as DeleteIcon, Edit as EditIcon, Visibility as VisibilityIcon,
  Refresh as RefreshIcon, Add as AddIcon, Museum as MuseumIcon, Close as CloseIcon
} from '@mui/icons-material';

const MuseumManagement = ({ museums, onAdd, onUpdate, onDelete, loading = false, setMuseums, enqueueSnackbar }) => {
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMuseum, setSelectedMuseum] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    description: '',
    imageUrl: '',
    contactEmail: '',
    contactPhone: '',
    website: '',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleFormChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleAddClick = () => {
    setSelectedMuseum(null);
    setFormData({
      name: '',
      location: '',
      description: '',
      imageUrl: '',
      contactEmail: '',
      contactPhone: '',
      website: '',
    });
    setEditDialogOpen(true);
  };

  const handleEditClick = (museum) => {
    setSelectedMuseum(museum);
    setFormData({
      name: museum.name,
      location: museum.location,
      description: museum.description,
      imageUrl: museum.imageUrl,
      contactEmail: museum.contactEmail,
      contactPhone: museum.contactPhone,
      website: museum.website,
    });
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (museum) => {
    setSelectedMuseum(museum);
    setDeleteDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (selectedMuseum) {
        await onUpdate(selectedMuseum.id, formData);
        enqueueSnackbar('Museum updated successfully!', { variant: 'success' });
      } else {
        await onAdd(formData);
        enqueueSnackbar('Museum added successfully!', { variant: 'success' });
      }
      setEditDialogOpen(false);
      setSnackbar({ open: true, message: 'Operation successful!', severity: 'success' });
    } catch (error) {
      console.error('Error saving museum:', error);
      setSnackbar({ open: true, message: 'Operation failed!', severity: 'error' });
    }
  };

  const handleDelete = async () => {
    try {
      await onDelete(selectedMuseum.id);
      setDeleteDialogOpen(false);
      setSnackbar({ open: true, message: 'Museum deleted successfully!', severity: 'success' });
    } catch (error) {
      console.error('Error deleting museum:', error);
      setSnackbar({ open: true, message: 'Deletion failed!', severity: 'error' });
    }
  };

  const filteredMuseums = museums.filter(museum =>
    museum.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    museum.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    museum.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginatedMuseums = filteredMuseums.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" component="h2" fontWeight="bold">
          Museum Management
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddClick}>
          Add New Museum
        </Button>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box display="flex" gap={2} mb={2} flexWrap="wrap">
        <TextField
          label="Search Museums"
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1 }} />,
          }}
        />
      </Box>

      {loading ? (
        <LinearProgress sx={{ my: 2 }} />
      ) : filteredMuseums.length === 0 ? (
        <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
          No museums found matching your criteria.
        </Typography>
      ) : (
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Image</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedMuseums.map((museum) => (
                <TableRow key={museum.id}>
                  <TableCell>
                    <CardMedia
                      component="img"
                      sx={{ width: 60, height: 60, borderRadius: 1, objectFit: 'cover' }}
                      image={museum.imageUrl || 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=60&h=60&fit=crop&crop=center'}
                      alt={museum.name}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2">{museum.name}</Typography>
                    <Typography variant="body2" color="text.secondary">{museum.description.substring(0, 50)}...</Typography>
                  </TableCell>
                  <TableCell>{museum.location}</TableCell>
                  <TableCell>
                    <Typography variant="body2">{museum.contactEmail}</Typography>
                    <Typography variant="body2">{museum.contactPhone}</Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title="Edit Museum">
                        <IconButton size="small" color="primary" onClick={() => handleEditClick(museum)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Museum">
                        <IconButton size="small" color="error" onClick={() => handleDeleteClick(museum)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredMuseums.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>
      )}

      {/* Add/Edit Museum Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{selectedMuseum ? 'Edit Museum' : 'Add New Museum'}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                autoFocus
                margin="dense"
                name="name"
                label="Museum Name"
                type="text"
                fullWidth
                value={formData.name}
                onChange={handleFormChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                name="location"
                label="Location"
                type="text"
                fullWidth
                value={formData.location}
                onChange={handleFormChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                name="description"
                label="Description"
                type="text"
                fullWidth
                multiline
                rows={3}
                value={formData.description}
                onChange={handleFormChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                name="imageUrl"
                label="Image URL"
                type="text"
                fullWidth
                value={formData.imageUrl}
                onChange={handleFormChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                name="contactEmail"
                label="Contact Email"
                type="email"
                fullWidth
                value={formData.contactEmail}
                onChange={handleFormChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                name="contactPhone"
                label="Contact Phone"
                type="text"
                fullWidth
                value={formData.contactPhone}
                onChange={handleFormChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                name="website"
                label="Website URL"
                type="text"
                fullWidth
                value={formData.website}
                onChange={handleFormChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            {selectedMuseum ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Museum Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Delete Museum: {selectedMuseum?.name}</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this museum? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default MuseumManagement;

