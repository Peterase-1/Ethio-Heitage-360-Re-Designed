import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Card,
  CardContent,
  CardActions,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Tooltip
} from '@mui/material';
import {
  Search,
  Refresh,
  Add,
  Edit,
  Delete,
  Visibility,
  Museum,
  ViewInAr,
  Star,
  FeaturedPlayList,
  Public,
  PublicOff
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from '../../utils/api';

const SuperAdminVirtualMuseum = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [virtualArtifacts, setVirtualArtifacts] = useState([]);
  const [allArtifacts, setAllArtifacts] = useState([]);
  const [museums, setMuseums] = useState([]);

  const [selectedArtifact, setSelectedArtifact] = useState(null);
  const [detailModal, setDetailModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [createModal, setCreateModal] = useState(false);

  const [formData, setFormData] = useState({
    artifact: '',
    title: '',
    description: '',
    category: '',
    period: '',
    origin: '',
    museum: '',
    has3DModel: false,
    modelUrl: '',
    featured: false,
    status: 'active',
    displayOrder: 0
  });

  useEffect(() => {
    loadData();
    loadReferenceData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await api.getAdminVirtualArtifacts();
      if (response.success) {
        setVirtualArtifacts(response.artifacts);
      }
    } catch (error) {
      toast.error('Error loading virtual artifacts');
    } finally {
      setLoading(false);
    }
  };

  const loadReferenceData = async () => {
    try {
      // Fetch regular artifacts to select from
      const artifactRes = await api.getArtifacts({ limit: 100 });
      if (artifactRes.success) {
        setAllArtifacts(artifactRes.artifacts);
      }

      // Fetch museums
      const museumRes = await api.getMuseums();
      if (museumRes.success) {
        setMuseums(museumRes.museums);
      }
    } catch (error) {
      console.error('Error loading reference data:', error);
    }
  };

  const handleOpenCreate = () => {
    setFormData({
      artifact: '',
      title: '',
      description: '',
      category: '',
      period: '',
      origin: '',
      museum: '',
      has3DModel: false,
      modelUrl: '',
      featured: false,
      status: 'active',
      displayOrder: 0
    });
    setCreateModal(true);
  };

  const handleOpenEdit = (artifact) => {
    setSelectedArtifact(artifact);
    setFormData({
      artifact: artifact.artifact?._id || '',
      title: artifact.title,
      description: artifact.description,
      category: artifact.category,
      period: artifact.period,
      origin: artifact.origin,
      museum: artifact.museum?._id || '',
      has3DModel: artifact.has3DModel,
      modelUrl: artifact.modelUrl,
      featured: artifact.featured,
      status: artifact.status,
      displayOrder: artifact.displayOrder
    });
    setEditModal(true);
  };

  const handleCreateSubmit = async () => {
    try {
      const response = await api.createVirtualArtifact(formData);
      if (response.success) {
        toast.success('Virtual artifact created successfully');
        setCreateModal(false);
        loadData();
      }
    } catch (error) {
      toast.error('Error creating virtual artifact');
    }
  };

  const handleEditSubmit = async () => {
    try {
      const response = await api.updateVirtualArtifact(selectedArtifact._id, formData);
      if (response.success) {
        toast.success('Virtual artifact updated successfully');
        setEditModal(false);
        loadData();
      }
    } catch (error) {
      toast.error('Error updating virtual artifact');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this artifact from the virtual museum?')) return;
    try {
      const response = await api.deleteVirtualArtifact(id);
      if (response.success) {
        toast.success('Removed successfully');
        loadData();
      }
    } catch (error) {
      toast.error('Error deleting virtual artifact');
    }
  };

  const handleToggleActive = async (artifact) => {
    try {
      const newStatus = artifact.status === 'active' ? 'inactive' : 'active';
      const response = await api.updateVirtualArtifact(artifact._id, { status: newStatus });
      if (response.success) {
        toast.success(`Artifact set to ${newStatus}`);
        loadData();
      }
    } catch (error) {
      toast.error('Error updating status');
    }
  };

  const filteredItems = virtualArtifacts.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const paginatedItems = filteredItems.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" fontWeight="bold">
          Virtual Museum Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleOpenCreate}
          sx={{ borderRadius: '12px', px: 3 }}
        >
          Add Virtual Artifact
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3, borderRadius: '16px' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                label="Status"
                sx={{ borderRadius: '12px' }}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Refresh />}
              onClick={loadData}
              disabled={loading}
              sx={{ borderRadius: '12px', height: '56px' }}
            >
              Refresh
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: '16px', overflow: 'hidden' }}>
          <Table>
            <TableHead sx={{ bgcolor: 'action.hover' }}>
              <TableRow>
                <TableCell>Artifact</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Origin</TableCell>
                <TableCell>Museum</TableCell>
                <TableCell>Features</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedItems.map((item) => (
                <TableRow key={item._id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      {item.artifact?.image && (
                        <img
                          src={item.artifact.image}
                          alt=""
                          style={{ width: 40, height: 40, borderRadius: 8, objectCover: 'cover' }}
                        />
                      )}
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold">{item.title}</Typography>
                        <Typography variant="caption" color="text.secondary">{item.period}</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip label={item.category} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>{item.origin}</TableCell>
                  <TableCell>{item.museum?.name || 'N/A'}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      {item.has3DModel && (
                        <Tooltip title="3D Model Available">
                          <ViewInAr fontSize="small" color="primary" />
                        </Tooltip>
                      )}
                      {item.featured && (
                        <Tooltip title="Featured">
                          <Star fontSize="small" sx={{ color: 'amber.500' }} />
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={item.status}
                      color={item.status === 'active' ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit">
                      <IconButton onClick={() => handleOpenEdit(item)} size="small">
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={item.status === 'active' ? 'Deactivate' : 'Activate'}>
                      <IconButton onClick={() => handleToggleActive(item)} size="small">
                        {item.status === 'active' ? <PublicOff fontSize="small" /> : <Public fontSize="small" />}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton onClick={() => handleDelete(item._id)} size="small" color="error">
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {paginatedItems.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">No virtual artifacts found</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredItems.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(e, p) => setPage(p)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        </TableContainer>
      )}

      {/* Create/Edit Modal */}
      <Dialog
        open={createModal || editModal}
        onClose={() => { setCreateModal(false); setEditModal(false); }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {createModal ? 'Add Virtual Artifact' : 'Edit Virtual Artifact'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3} sx={{ mt: 0.5 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Base Artifact</InputLabel>
                <Select
                  value={formData.artifact}
                  onChange={(e) => {
                    const art = allArtifacts.find(a => a._id === e.target.value);
                    setFormData({
                      ...formData,
                      artifact: e.target.value,
                      title: art ? art.name : formData.title,
                      description: art ? art.description : formData.description,
                      category: art ? art.category : formData.category
                    });
                  }}
                  label="Base Artifact"
                >
                  {allArtifacts.map(art => (
                    <MenuItem key={art._id} value={art._id}>{art.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Museum</InputLabel>
                <Select
                  value={formData.museum}
                  onChange={(e) => setFormData({ ...formData, museum: e.target.value })}
                  label="Museum"
                >
                  {museums.map(m => (
                    <MenuItem key={m._id} value={m._id}>{m.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Display Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Detailed Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Period"
                value={formData.period}
                onChange={(e) => setFormData({ ...formData, period: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Origin"
                value={formData.origin}
                onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="3D Model URL / Image URL"
                value={formData.modelUrl}
                onChange={(e) => setFormData({ ...formData, modelUrl: e.target.value })}
                placeholder="https://..."
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.has3DModel}
                    onChange={(e) => setFormData({ ...formData, has3DModel: e.target.checked })}
                    color="primary"
                  />
                }
                label="Has 3D Model"
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    color="primary"
                  />
                }
                label="Featured"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                type="number"
                label="Display Order"
                value={formData.displayOrder}
                onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => { setCreateModal(false); setEditModal(false); }}>Cancel</Button>
          <Button
            variant="contained"
            onClick={createModal ? handleCreateSubmit : handleEditSubmit}
            disabled={!formData.title || !formData.museum}
          >
            {createModal ? 'Create' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SuperAdminVirtualMuseum;
