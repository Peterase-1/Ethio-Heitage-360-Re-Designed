import React, { useState, useEffect } from 'react';
import MuseumAdminSidebar from '../dashboard/MuseumAdminSidebar';
import {
  Box, Typography, Container, Grid, Paper, Button, TextField,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem, Avatar, Card, CardContent,
  CardMedia, CardActions, InputAdornment, Snackbar, Alert
} from '@mui/material';
import {
  Package,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Delete,
  Star,
  Archive,
  Camera,
  Upload,
  Calendar,
  MapPin,
  Tag,
  RefreshCw,
  Sparkles,
  Award,
  Shield,
  Grid3X3,
  List,
  X
} from 'lucide-react';
import api from '../../utils/api.js';

const ArtifactManagement = () => {
  const [artifacts, setArtifacts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedArtifact, setSelectedArtifact] = useState(null);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [currentMuseumId, setCurrentMuseumId] = useState('');
  const [uploadingImages, setUploadingImages] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedArtifactForUpload, setSelectedArtifactForUpload] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [artifactToDelete, setArtifactToDelete] = useState(null);

  const [newArtifact, setNewArtifact] = useState({
    name: '',
    category: 'sculptures', // Default to valid enum value
    period: 'ancient', // Default to valid enum value
    material: '',
    origin: '',
    status: 'in_storage',
    condition: 'good',
    description: 'This artifact represents...', // Default description to meet validation
    location: ''
  });

  // Image upload states for create/update forms
  const [formImages, setFormImages] = useState([]);
  const [uploadingFormImages, setUploadingFormImages] = useState(false);

  const statusColors = {
    'on_display': 'success',
    'in_storage': 'default',
    'under_conservation': 'warning',
    'on_loan': 'info'
  };

  const conditionColors = {
    'excellent': 'success',
    'good': 'primary',
    'fair': 'warning',
    'fragile': 'error'
  };

  const filteredArtifacts = artifacts.filter(artifact => {
    const matchesSearch = artifact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      artifact.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || artifact.status === filterStatus;

    return matchesSearch && matchesStatus;
  });


  const fetchArtifacts = async () => {
    setLoading(true);
    try {
      // Debug authentication
      const token = localStorage.getItem('token');
      console.log('Token exists:', !!token);
      console.log('Token preview:', token ? token.substring(0, 20) + '...' : 'No token');

      // Force fresh data by adding timestamp to prevent caching
      const response = await api.getArtifacts({ _t: Date.now() });

      // Handle the correct response structure: { success: true, data: { artifacts: [...] } }
      const list = response?.data?.artifacts || response?.artifacts || [];
      setArtifacts(list);
      console.log('Fetched artifacts:', list.length, 'artifacts');
      console.log('Artifact statuses:', list.map(a => ({ name: a.name, status: a.status })));
      console.log('All unique statuses in database:', [...new Set(list.map(a => a.status))]);
      console.log('Artifacts with images:', list.filter(a => a.media?.images?.length > 0).map(a => ({
        name: a.name,
        id: a._id || a.id,
        images: a.media.images.map(img => img.url),
        mediaStructure: a.media
      })));

      // Debug: Check if any artifacts have the expected image structure
      const artifactsWithImages = list.filter(a => a.media?.images?.length > 0);
      console.log(`Found ${artifactsWithImages.length} artifacts with images out of ${list.length} total artifacts`);
    } catch (e) {
      console.error('Failed to load artifacts', e);
      setSnackbar({ open: true, message: 'Failed to load artifacts: ' + e.message, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArtifacts();
    (async () => {
      try {
        // First try to get current user to extract museumId
        const userData = await api.getCurrentUser();
        if (userData?.user?.museumId) {
          setCurrentMuseumId(userData.user.museumId);
          console.log('Found museum ID from user profile:', userData.user.museumId);
        } else {
          // Fallback: try to get museum profile
          const profile = await api.getMuseumProfile();
          const museum = profile?.data?.museum || profile?.data || profile?.museum || profile;
          const id = museum?._id || museum?.id;
          if (id) {
            setCurrentMuseumId(id);
            console.log('Found museum ID from museum profile:', id);
          }
        }
      } catch (e) {
        console.warn('Could not fetch museum information:', e.message);
        console.warn('Will rely on backend to infer museum from user context');
      }
    })();
  }, []);

  const resetForm = () => {
    setNewArtifact({
      name: '',
      category: 'sculptures', // Default to valid enum value
      period: 'ancient', // Default to valid enum value
      material: '',
      origin: '',
      status: 'in_storage',
      condition: 'good',
      description: 'This artifact represents...', // Default description to meet validation
      location: ''
    });
    setFormImages([]);
    setIsEditing(false);
    setEditingId(null);
    // currentMuseumId remains set from profile
  };

  const handleSaveArtifact = async () => {
    if (!newArtifact.name || !newArtifact.category || !newArtifact.description || newArtifact.description.length < 10) {
      setSnackbar({ open: true, message: 'Please fill required fields: name, category, and description (min 10 characters)', severity: 'error' });
      return;
    }
    setSaving(true);
    setUploadingFormImages(true);
    try {
      const payload = {
        name: newArtifact.name,
        category: newArtifact.category,
        period: newArtifact.period,
        material: newArtifact.material,
        origin: newArtifact.origin,
        status: newArtifact.status,
        condition: newArtifact.condition,
        description: newArtifact.description,
        location: newArtifact.location,
        ...(currentMuseumId ? { museum: currentMuseumId } : {}),
      };

      console.log('Creating/updating artifact with payload:', payload);
      console.log('Current museum ID:', currentMuseumId);
      console.log('Form images to upload:', formImages.length);

      let artifactId;
      if (isEditing && editingId) {
        await api.updateArtifact(editingId, payload);
        artifactId = editingId;
      } else {
        const response = await api.createArtifact(payload);
        console.log('Create artifact response:', response);
        artifactId = response.data._id || response.data.id;
      }

      // Upload images if any were selected
      if (formImages.length > 0 && artifactId) {
        console.log('Uploading form images to artifact:', artifactId);
        await api.uploadArtifactImages(artifactId, formImages);
        console.log('Form images uploaded successfully');
      }

      await fetchArtifacts();
      resetForm();
      setOpenDialog(false);
      setSnackbar({ open: true, message: isEditing ? 'Artifact updated' : 'Artifact created', severity: 'success' });
    } catch (e) {
      console.error('Save artifact failed', e);
      setSnackbar({ open: true, message: e.message || 'Save failed', severity: 'error' });
    } finally {
      setSaving(false);
      setUploadingFormImages(false);
    }
  };

  const handleToggleFeatured = async (artifact) => {
    try {
      const id = artifact._id || artifact.id;
      await api.toggleArtifactFeatured(id, !artifact.featured);
      setArtifacts(prev => prev.map(a => ((a._id || a.id) === id ? { ...a, featured: !artifact.featured } : a)));
      setSnackbar({ open: true, message: `Artifact ${!artifact.featured ? 'featured' : 'unfeatured'} successfully`, severity: 'success' });
    } catch (e) {
      console.error('Toggle featured failed', e);
      setSnackbar({ open: true, message: 'Failed to update featured status: ' + e.message, severity: 'error' });
    }
  };

  const handleDeleteArtifact = (artifact) => {
    // Check if artifact is under conservation
    if (artifact.status === 'conservation') {
      setSnackbar({
        open: true,
        message: 'Cannot delete artifact under conservation. Please wait for conservation to complete.',
        severity: 'warning'
      });
      return;
    }

    setArtifactToDelete(artifact);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteArtifact = async () => {
    if (!artifactToDelete) return;

    try {
      const id = artifactToDelete._id || artifactToDelete.id;
      console.log('Deleting artifact with ID:', id);
      console.log('Artifact to delete:', artifactToDelete);

      await api.deleteArtifact(id);
      setArtifacts(prev => prev.filter(a => (a._id || a.id) !== id));
      setSnackbar({ open: true, message: 'Artifact deleted successfully', severity: 'success' });
      setDeleteDialogOpen(false);
      setArtifactToDelete(null);
    } catch (e) {
      console.error('Delete artifact failed', e);
      console.error('Error details:', e);
      setSnackbar({ open: true, message: 'Failed to delete artifact: ' + e.message, severity: 'error' });
    }
  };

  const handleImageUpload = async (artifact) => {
    if (selectedImages.length === 0) {
      setSnackbar({ open: true, message: 'Please select images to upload', severity: 'warning' });
      return;
    }

    setUploadingImages(true);
    try {
      const id = artifact._id || artifact.id;
      console.log('Uploading images for artifact ID:', id);
      console.log('Selected images:', selectedImages);
      console.log('Number of images:', selectedImages.length);

      const uploadResponse = await api.uploadArtifactImages(id, selectedImages);
      console.log('Upload response:', uploadResponse);
      setSnackbar({ open: true, message: 'Images uploaded successfully', severity: 'success' });
      setSelectedImages([]);
      // Refresh artifacts to show updated images
      console.log('Refreshing artifacts after upload...');
      await fetchArtifacts();
    } catch (e) {
      console.error('Image upload failed', e);
      console.error('Error details:', e);
      setSnackbar({ open: true, message: 'Failed to upload images: ' + e.message, severity: 'error' });
    } finally {
      setUploadingImages(false);
    }
  };

  const handleImageSelect = (event) => {
    console.log('File input changed, files:', event.target.files);
    const files = Array.from(event.target.files);
    console.log('Selected files:', files);
    setSelectedImages(files);
  };

  // Image upload handlers for create/update forms
  const handleFormImageSelect = (event) => {
    console.log('Form file input changed, files:', event.target.files);
    const files = Array.from(event.target.files);
    console.log('Selected files for form:', files);
    setFormImages(files);
  };

  const startEditArtifact = (artifact) => {
    setIsEditing(true);
    setEditingId(artifact._id || artifact.id);
    setNewArtifact({
      name: artifact.name || '',
      category: artifact.category || '',
      period: artifact.period || '',
      material: artifact.material || '',
      origin: artifact.origin || '',
      status: artifact.status || 'in_storage',
      condition: artifact.condition || 'good',
      description: artifact.description || '',
      location: artifact.location || '',
    });
    setOpenDialog(true);
  };

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredArtifacts.map((artifact) => (
        <div key={artifact._id || artifact.id} className="group bg-white rounded-3xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2">
          {/* Image Section */}
          <div className="relative h-64 overflow-hidden">
            {artifact.media?.images && artifact.media.images.length > 0 ? (
              (() => {
                const imageUrl = artifact.media.images[0].url.startsWith('http')
                  ? artifact.media.images[0].url
                  : `http://localhost:5001${artifact.media.images[0].url}`;
                return (
                  <img
                    src={imageUrl}
                    alt={artifact.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onLoad={() => console.log('✅ Image loaded successfully:', imageUrl)}
                    onError={(e) => console.error('❌ Image failed to load:', imageUrl, e)}
                  />
                );
              })()
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <Camera size={48} className="text-gray-600" />
              </div>
            )}

            {/* Featured Badge */}
            {artifact.featured && (
              <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                <Star size={12} fill="currentColor" />
                Featured
              </div>
            )}

            {/* Status Badge */}
            <div className="absolute top-4 left-4">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${artifact.status === 'on_display' ? 'bg-green-100 text-green-800' :
                artifact.status === 'in_storage' ? 'bg-gray-100 text-gray-800' :
                  artifact.status === 'under_conservation' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                }`}>
                {artifact.status.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-6">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-amber-800 transition-colors">
                {artifact.name}
              </h3>
            </div>

            <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
              <Tag className="w-4 h-4" />
              <span className="capitalize">{artifact.category}</span>
              <span>•</span>
              <span>{artifact.period?.era || artifact.period || 'Unknown'}</span>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <span className={`px-2 py-1 rounded-lg text-xs font-medium ${artifact.condition === 'excellent' ? 'bg-green-100 text-green-800' :
                artifact.condition === 'good' ? 'bg-blue-100 text-blue-800' :
                  artifact.condition === 'fair' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                }`}>
                {artifact.condition}
              </span>
            </div>

            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {artifact.description}
            </p>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedArtifact(artifact)}
                  className="p-2 text-gray-600 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-colors"
                  title="View Details"
                >
                  <Eye size={16} />
                </button>
                <button
                  onClick={() => startEditArtifact(artifact)}
                  className="p-2 text-gray-600 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-colors"
                  title="Edit"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => {
                    console.log('Upload button clicked for artifact:', artifact.name);
                    setSelectedArtifactForUpload(artifact);
                    setUploadDialogOpen(true);
                    console.log('Upload dialog should be open now');
                  }}
                  className="p-2 text-gray-600 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-colors"
                  title="Upload Images"
                >
                  <Upload size={16} />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleFeatured(artifact)}
                  className={`p-2 rounded-xl transition-colors ${artifact.featured
                    ? 'text-yellow-500 hover:bg-yellow-50'
                    : 'text-gray-600 hover:text-yellow-500 hover:bg-yellow-50'
                    }`}
                  title="Toggle Featured"
                >
                  <Star size={16} fill={artifact.featured ? 'currentColor' : 'none'} />
                </button>
                <button
                  onClick={() => handleDeleteArtifact(artifact)}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  title="Delete"
                >
                  <Delete size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderTableView = () => (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-800 uppercase tracking-wider">Name</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-800 uppercase tracking-wider">Category</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-800 uppercase tracking-wider">Period</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-800 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-800 uppercase tracking-wider">Condition</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-800 uppercase tracking-wider">Location</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-800 uppercase tracking-wider">Featured</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-800 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredArtifacts.map((artifact) => (
              <tr key={artifact._id || artifact.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">{artifact.name}</span>
                    {artifact.featured && (
                      <Star size={16} className="text-yellow-500" fill="currentColor" />
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-600 capitalize">{artifact.category}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-600">{artifact.period?.era || artifact.period || 'Unknown'}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${artifact.status === 'on_display' ? 'bg-green-100 text-green-800' :
                    artifact.status === 'in_storage' ? 'bg-gray-100 text-gray-800' :
                      artifact.status === 'under_conservation' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                    }`}>
                    {artifact.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium ${artifact.condition === 'excellent' ? 'bg-green-100 text-green-800' :
                    artifact.condition === 'good' ? 'bg-blue-100 text-blue-800' :
                      artifact.condition === 'fair' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                    }`}>
                    {artifact.condition}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-600">{artifact.origin?.region || artifact.location || 'Unknown'}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleToggleFeatured(artifact)}
                    className={`p-2 rounded-xl transition-colors ${artifact.featured
                      ? 'text-yellow-500 hover:bg-yellow-50'
                      : 'text-gray-600 hover:text-yellow-500 hover:bg-yellow-50'
                      }`}
                    title="Toggle Featured"
                  >
                    <Star size={16} fill={artifact.featured ? 'currentColor' : 'none'} />
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedArtifact(artifact)}
                      className="p-2 text-gray-600 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-colors"
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => startEditArtifact(artifact)}
                      className="p-2 text-gray-600 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-colors"
                      title="Edit"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => {
                        console.log('Upload button clicked for artifact:', artifact.name);
                        setSelectedArtifactForUpload(artifact);
                        setUploadDialogOpen(true);
                        console.log('Upload dialog should be open now');
                      }}
                      className="p-2 text-gray-600 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-colors"
                      title="Upload Images"
                    >
                      <Upload size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteArtifact(artifact)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                      title="Delete"
                    >
                      <Delete size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

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
              <Package className="mr-3" size={32} style={{ color: '#8B5A3C' }} />
              Artifact Management
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Preserve and showcase your museum's precious artifacts with our comprehensive management system
            </Typography>
          </Box>

          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', backgroundColor: '#8B5A3C', color: 'white' }}>
                <Package sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography color="inherit" variant="body2">Total Artifacts</Typography>
                  <Typography variant="h4" color="inherit">{artifacts.length}</Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>In Collection</Typography>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', backgroundColor: '#8B5A3C', color: 'white' }}>
                <Eye sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography color="inherit" variant="body2">On Display</Typography>
                  <Typography variant="h4" color="inherit">
                    {artifacts.filter(a => a.status === 'on_display').length}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>Currently Exhibited</Typography>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', backgroundColor: '#8B5A3C', color: 'white' }}>
                <Shield sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography color="inherit" variant="body2">Under Conservation</Typography>
                  <Typography variant="h4" color="inherit">
                    {artifacts.filter(a => a.status === 'under_conservation').length}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>Being Restored</Typography>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', backgroundColor: '#8B5A3C', color: 'white' }}>
                <Star sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography color="inherit" variant="body2">Featured</Typography>
                  <Typography variant="h4" color="inherit">
                    {artifacts.filter(a => a.featured).length}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>Highlighted Items</Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>

          {/* Controls */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Grid container spacing={3} alignItems="center">
              {/* Search */}
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  placeholder="Search artifacts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <Search className="mr-2" size={20} style={{ color: '#8B5A3C' }} />
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&.Mui-focused fieldset': {
                        borderColor: '#8B5A3C',
                      },
                    },
                  }}
                />
              </Grid>

              {/* Filter */}
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filterStatus}
                    label="Status"
                    onChange={(e) => setFilterStatus(e.target.value)}
                    sx={{
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#8B5A3C',
                      },
                    }}
                  >
                    <MenuItem value="all">All Statuses</MenuItem>
                    <MenuItem value="on_display">On Display</MenuItem>
                    <MenuItem value="in_storage">In Storage</MenuItem>
                    <MenuItem value="under_conservation">Under Conservation</MenuItem>
                    <MenuItem value="on_loan">On Loan</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* View Mode Toggle */}
              <Grid item xs={12} md={3}>
                <Paper sx={{ p: 1, display: 'flex', backgroundColor: '#f5f5f5' }}>
                  <Button
                    onClick={() => setViewMode('grid')}
                    variant={viewMode === 'grid' ? 'contained' : 'text'}
                    size="small"
                    startIcon={<Grid3X3 size={16} />}
                    sx={{
                      flex: 1,
                      backgroundColor: viewMode === 'grid' ? '#8B5A3C' : 'transparent',
                      color: viewMode === 'grid' ? 'white' : '#8B5A3C',
                      '&:hover': {
                        backgroundColor: viewMode === 'grid' ? '#8B5A3C' : 'rgba(139, 90, 60, 0.1)',
                      },
                    }}
                  >
                    Grid
                  </Button>
                  <Button
                    onClick={() => setViewMode('table')}
                    variant={viewMode === 'table' ? 'contained' : 'text'}
                    size="small"
                    startIcon={<List size={16} />}
                    sx={{
                      flex: 1,
                      backgroundColor: viewMode === 'table' ? '#8B5A3C' : 'transparent',
                      color: viewMode === 'table' ? 'white' : '#8B5A3C',
                      '&:hover': {
                        backgroundColor: viewMode === 'table' ? '#8B5A3C' : 'rgba(139, 90, 60, 0.1)',
                      },
                    }}
                  >
                    Table
                  </Button>
                </Paper>
              </Grid>

              {/* Actions */}
              <Grid item xs={12} md={2}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    startIcon={<RefreshCw size={16} />}
                    onClick={() => fetchArtifacts()}
                    disabled={loading}
                    sx={{ borderColor: '#8B5A3C', color: '#8B5A3C', '&:hover': { borderColor: '#8B5A3C', backgroundColor: 'white' } }}
                  >
                    Refresh
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<Plus size={16} />}
                    onClick={() => setOpenDialog(true)}
                    sx={{
                      backgroundColor: '#8B5A3C',
                      color: 'white',
                      '&:hover': { backgroundColor: '#8B5A3C' }
                    }}
                  >
                    Add
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Artifacts Display */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
              <Typography>Loading artifacts...</Typography>
            </Box>
          ) : filteredArtifacts.length === 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 200, textAlign: 'center' }}>
              <Package size={64} color="#ccc" />
              <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
                {artifacts.length === 0 ? 'No artifacts found' : 'No artifacts match your filters'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {artifacts.length === 0 ? 'Start by adding your first artifact' : 'Try adjusting your search or filter criteria'}
              </Typography>
            </Box>
          ) : (
            viewMode === 'grid' ? renderGridView() : renderTableView()
          )}

          {/* Add Artifact Dialog */}
          <Dialog open={openDialog} onClose={() => { setOpenDialog(false); resetForm(); }} maxWidth="md" fullWidth>
            <DialogTitle>{isEditing ? 'Edit Artifact' : 'Add New Artifact'}</DialogTitle>
            <DialogContent>
              <Grid container spacing={3} sx={{ mt: 1 }}>
                {/* Museum is inferred from current user's museum profile; no manual selection */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Artifact Name"
                    value={newArtifact.name}
                    onChange={(e) => setNewArtifact({ ...newArtifact, name: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={newArtifact.category}
                      label="Category"
                      onChange={(e) => setNewArtifact({ ...newArtifact, category: e.target.value })}
                    >
                      <MenuItem value="sculptures">Sculptures</MenuItem>
                      <MenuItem value="pottery">Pottery</MenuItem>
                      <MenuItem value="jewelry">Jewelry</MenuItem>
                      <MenuItem value="tools">Tools</MenuItem>
                      <MenuItem value="weapons">Weapons</MenuItem>
                      <MenuItem value="textiles">Textiles</MenuItem>
                      <MenuItem value="religious-items">Religious Items</MenuItem>
                      <MenuItem value="manuscripts">Manuscripts</MenuItem>
                      <MenuItem value="coins">Coins</MenuItem>
                      <MenuItem value="paintings">Paintings</MenuItem>
                      <MenuItem value="household-items">Household Items</MenuItem>
                      <MenuItem value="musical-instruments">Musical Instruments</MenuItem>
                      <MenuItem value="other">Other</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Historical Period</InputLabel>
                    <Select
                      value={newArtifact.period}
                      label="Historical Period"
                      onChange={(e) => setNewArtifact({ ...newArtifact, period: e.target.value })}
                    >
                      <MenuItem value="prehistoric">Prehistoric</MenuItem>
                      <MenuItem value="ancient">Ancient</MenuItem>
                      <MenuItem value="medieval">Medieval</MenuItem>
                      <MenuItem value="modern">Modern</MenuItem>
                      <MenuItem value="contemporary">Contemporary</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Material"
                    value={newArtifact.material}
                    onChange={(e) => setNewArtifact({ ...newArtifact, material: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Origin"
                    value={newArtifact.origin}
                    onChange={(e) => setNewArtifact({ ...newArtifact, origin: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Location"
                    value={newArtifact.location}
                    onChange={(e) => setNewArtifact({ ...newArtifact, location: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={newArtifact.status}
                      label="Status"
                      onChange={(e) => setNewArtifact({ ...newArtifact, status: e.target.value })}
                    >
                      <MenuItem value="in_storage">In Storage</MenuItem>
                      <MenuItem value="on_display">On Display</MenuItem>
                      <MenuItem value="under_conservation">Under Conservation</MenuItem>
                      <MenuItem value="on_loan">On Loan</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Condition</InputLabel>
                    <Select
                      value={newArtifact.condition}
                      label="Condition"
                      onChange={(e) => setNewArtifact({ ...newArtifact, condition: e.target.value })}
                    >
                      <MenuItem value="excellent">Excellent</MenuItem>
                      <MenuItem value="good">Good</MenuItem>
                      <MenuItem value="fair">Fair</MenuItem>
                      <MenuItem value="fragile">Fragile</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description (required, min 10 characters)"
                    multiline
                    rows={4}
                    value={newArtifact.description}
                    onChange={(e) => setNewArtifact({ ...newArtifact, description: e.target.value })}
                    error={newArtifact.description.length > 0 && newArtifact.description.length < 10}
                    helperText={newArtifact.description.length > 0 && newArtifact.description.length < 10 ? 'Description must be at least 10 characters' : `${newArtifact.description.length}/2000 characters`}
                  />
                </Grid>
                <Grid item xs={12}>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFormImageSelect}
                    style={{ display: 'none' }}
                    id="form-image-upload-input"
                  />
                  <label htmlFor="form-image-upload-input">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<Upload size={16} />}
                      fullWidth
                      sx={{ height: 100, borderStyle: 'dashed' }}
                    >
                      {formImages.length > 0 ? `Selected ${formImages.length} image(s)` : 'Upload Images'}
                    </Button>
                  </label>
                  {formImages.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Selected images:
                      </Typography>
                      {formImages.map((file, index) => (
                        <Typography key={index} variant="body2" sx={{ mt: 0.5 }}>
                          • {file.name}
                        </Typography>
                      ))}
                    </Box>
                  )}
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => { setOpenDialog(false); resetForm(); }}>Cancel</Button>
              <Button onClick={handleSaveArtifact} variant="contained" disabled={saving || uploadingFormImages}>
                {saving ? (uploadingFormImages ? 'Uploading Images...' : 'Saving...') : (isEditing ? 'Save Changes' : 'Add Artifact')}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Artifact Detail Dialog */}
          <Dialog open={!!selectedArtifact} onClose={() => setSelectedArtifact(null)} maxWidth="md" fullWidth>
            {selectedArtifact && (
              <>
                <DialogTitle>{selectedArtifact.name}</DialogTitle>
                <DialogContent>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      {selectedArtifact.media?.images && selectedArtifact.media.images.length > 0 ? (
                        <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 1, overflow: 'hidden' }}>
                          <img
                            src={selectedArtifact.media.images[0].url.startsWith('http')
                              ? selectedArtifact.media.images[0].url
                              : `http://localhost:5001${selectedArtifact.media.images[0].url}`}
                            alt={selectedArtifact.name}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              borderRadius: '4px'
                            }}
                            onLoad={() => console.log('Detail image loaded successfully:', selectedArtifact.media.images[0].url)}
                            onError={(e) => console.error('Detail image failed to load:', selectedArtifact.media.images[0].url, e)}
                          />
                        </Box>
                      ) : (
                        <Box sx={{ bgcolor: 'grey.200', height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 1 }}>
                          <Camera size={60} color="#666" />
                        </Box>
                      )}
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" gutterBottom>Details</Typography>
                      <Typography><strong>Category:</strong> {selectedArtifact.category}</Typography>
                      <Typography><strong>Period:</strong> {selectedArtifact.period?.era || selectedArtifact.period || 'Unknown'}</Typography>
                      <Typography><strong>Origin:</strong> {selectedArtifact.origin?.region || selectedArtifact.origin || 'Unknown'}</Typography>
                      <Typography><strong>Date Added:</strong> {new Date(selectedArtifact.createdAt).toLocaleDateString()}</Typography>
                      <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                        <Chip label={selectedArtifact.status.replace('_', ' ')} color={statusColors[selectedArtifact.status]} />
                        <Chip label={selectedArtifact.condition} color={conditionColors[selectedArtifact.condition]} variant="outlined" />
                        {selectedArtifact.featured && <Chip label="Featured" color="warning" />}
                      </Box>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="h6" gutterBottom>Description</Typography>
                      <Typography>{selectedArtifact.description}</Typography>
                    </Grid>
                  </Grid>
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setSelectedArtifact(null)}>Close</Button>
                  <Button variant="contained">Edit</Button>
                </DialogActions>
              </>
            )}
          </Dialog>

          {/* Image Upload Dialog */}
          <Dialog open={uploadDialogOpen} onClose={() => {
            console.log('Upload dialog closing');
            setUploadDialogOpen(false);
            setSelectedImages([]);
            setSelectedArtifactForUpload(null);
          }} maxWidth="sm" fullWidth>
            <DialogTitle>Upload Images for {selectedArtifactForUpload?.name}</DialogTitle>
            {console.log('Upload dialog is open:', uploadDialogOpen, 'Selected artifact:', selectedArtifactForUpload?.name)}
            <DialogContent>
              <Box sx={{ mt: 2 }}>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageSelect}
                  style={{ display: 'none' }}
                  id="image-upload-input"
                />
                <label htmlFor="image-upload-input">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<Upload size={16} />}
                    fullWidth
                    sx={{ height: 100, borderStyle: 'dashed' }}
                  >
                    Select Images
                  </Button>
                </label>
                {selectedImages.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Selected {selectedImages.length} image(s):
                    </Typography>
                    {selectedImages.map((file, index) => (
                      <Typography key={index} variant="body2" sx={{ mt: 1 }}>
                        • {file.name}
                      </Typography>
                    ))}
                  </Box>
                )}
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => { setUploadDialogOpen(false); setSelectedImages([]); setSelectedArtifactForUpload(null); }}>
                Cancel
              </Button>
              <Button
                onClick={() => handleImageUpload(selectedArtifactForUpload)}
                variant="contained"
                disabled={selectedImages.length === 0 || uploadingImages}
              >
                {uploadingImages ? 'Uploading...' : 'Upload Images'}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogContent>
              <Typography>
                Are you sure you want to delete the artifact "{artifactToDelete?.name}"?
                This action cannot be undone.
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
              <Button onClick={confirmDeleteArtifact} color="error" variant="contained">
                Delete
              </Button>
            </DialogActions>
          </Dialog>

          {snackbar.open && (
            <Box sx={{ position: 'fixed', bottom: 16, left: 16, bgcolor: snackbar.severity === 'error' ? 'error.main' : 'success.main', color: 'white', px: 2, py: 1, borderRadius: 1 }}
              onAnimationEnd={() => setSnackbar(prev => ({ ...prev, open: false }))}>
              {snackbar.message}
            </Box>
          )}
        </Container>
      </div>
    </div>
  );
};

export default ArtifactManagement;
