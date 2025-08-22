import React, { useState } from 'react';
import { 
  Box, Typography, Container, Grid, Paper, Button, TextField,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem, Avatar, Card, CardContent,
  CardMedia, CardActions, InputAdornment
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
  Tag
} from 'lucide-react';

const ArtifactManagement = () => {
  const [artifacts, setArtifacts] = useState([
    {
      id: 1,
      name: 'Ancient Ethiopian Vase',
      category: 'Pottery',
      period: '3rd Century BCE',
      status: 'on_display',
      condition: 'excellent',
      location: 'Hall A - Section 1',
      dateAdded: '2024-01-15',
      featured: true,
      images: ['vase1.jpg'],
      description: 'A beautiful ceramic vase from ancient Ethiopia, showcasing traditional pottery techniques.'
    },
    {
      id: 2,
      name: 'Traditional Ethiopian Cross',
      category: 'Religious Artifacts',
      period: '12th Century',
      status: 'in_storage',
      condition: 'good',
      location: 'Storage Room B',
      dateAdded: '2024-02-10',
      featured: false,
      images: ['cross1.jpg'],
      description: 'Ornate religious cross made of silver, representing Ethiopian Orthodox Christianity.'
    },
    {
      id: 3,
      name: 'Ancient Manuscript',
      category: 'Documents',
      period: '15th Century',
      status: 'under_conservation',
      condition: 'fragile',
      location: 'Conservation Lab',
      dateAdded: '2024-03-05',
      featured: true,
      images: ['manuscript1.jpg'],
      description: 'Historical manuscript written in Ge\'ez script, containing religious texts.'
    }
  ]);

  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedArtifact, setSelectedArtifact] = useState(null);

  const [newArtifact, setNewArtifact] = useState({
    name: '',
    category: '',
    period: '',
    status: 'in_storage',
    condition: 'good',
    description: '',
    location: ''
  });

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

  const handleAddArtifact = () => {
    const id = artifacts.length + 1;
    setArtifacts([...artifacts, { ...newArtifact, id, dateAdded: new Date().toISOString().split('T')[0], featured: false, images: [] }]);
    setNewArtifact({
      name: '',
      category: '',
      period: '',
      status: 'in_storage',
      condition: 'good',
      description: '',
      location: ''
    });
    setOpenDialog(false);
  };

  const handleToggleFeatured = (id) => {
    setArtifacts(artifacts.map(artifact => 
      artifact.id === id ? { ...artifact, featured: !artifact.featured } : artifact
    ));
  };

  const handleDeleteArtifact = (id) => {
    setArtifacts(artifacts.filter(artifact => artifact.id !== id));
  };

  const renderGridView = () => (
    <Grid container spacing={3}>
      {filteredArtifacts.map((artifact) => (
        <Grid item xs={12} sm={6} md={4} key={artifact.id}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardMedia
              sx={{ height: 200, bgcolor: 'grey.200', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Camera size={40} color="#666" />
            </CardMedia>
            <CardContent sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Typography variant="h6" component="h3" sx={{ fontSize: '1rem' }}>
                  {artifact.name}
                </Typography>
                {artifact.featured && <Star size={16} color="#ffd700" fill="#ffd700" />}
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {artifact.category} • {artifact.period}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Chip 
                  label={artifact.status.replace('_', ' ')} 
                  color={statusColors[artifact.status]} 
                  size="small" 
                />
                <Chip 
                  label={artifact.condition} 
                  color={conditionColors[artifact.condition]} 
                  size="small" 
                  variant="outlined"
                />
              </Box>
              <Typography variant="body2" sx={{ 
                display: '-webkit-box',
                '-webkit-line-clamp': 2,
                '-webkit-box-orient': 'vertical',
                overflow: 'hidden'
              }}>
                {artifact.description}
              </Typography>
            </CardContent>
            <CardActions>
              <IconButton size="small" onClick={() => setSelectedArtifact(artifact)}>
                <Eye size={16} />
              </IconButton>
              <IconButton size="small">
                <Edit size={16} />
              </IconButton>
              <IconButton size="small" onClick={() => handleToggleFeatured(artifact.id)}>
                <Star size={16} color={artifact.featured ? "#ffd700" : "#ccc"} />
              </IconButton>
              <IconButton size="small" color="error" onClick={() => handleDeleteArtifact(artifact.id)}>
                <Delete size={16} />
              </IconButton>
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const renderTableView = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Category</TableCell>
            <TableCell>Period</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Condition</TableCell>
            <TableCell>Location</TableCell>
            <TableCell>Featured</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredArtifacts.map((artifact) => (
            <TableRow key={artifact.id}>
              <TableCell>{artifact.name}</TableCell>
              <TableCell>{artifact.category}</TableCell>
              <TableCell>{artifact.period}</TableCell>
              <TableCell>
                <Chip 
                  label={artifact.status.replace('_', ' ')} 
                  color={statusColors[artifact.status]} 
                  size="small" 
                />
              </TableCell>
              <TableCell>
                <Chip 
                  label={artifact.condition} 
                  color={conditionColors[artifact.condition]} 
                  size="small" 
                  variant="outlined"
                />
              </TableCell>
              <TableCell>{artifact.location}</TableCell>
              <TableCell>
                <IconButton size="small" onClick={() => handleToggleFeatured(artifact.id)}>
                  <Star size={16} color={artifact.featured ? "#ffd700" : "#ccc"} />
                </IconButton>
              </TableCell>
              <TableCell>
                <IconButton size="small" onClick={() => setSelectedArtifact(artifact)}>
                  <Eye size={16} />
                </IconButton>
                <IconButton size="small">
                  <Edit size={16} />
                </IconButton>
                <IconButton size="small" color="error" onClick={() => handleDeleteArtifact(artifact.id)}>
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
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
          <Package className="mr-3" size={32} />
          Artifact Management
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Manage your museum's artifact collection with comprehensive tools
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <Typography variant="h4">{artifacts.length}</Typography>
            <Typography variant="body2">Total Artifacts</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
            <Typography variant="h4">{artifacts.filter(a => a.status === 'on_display').length}</Typography>
            <Typography variant="body2">On Display</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
            <Typography variant="h4">{artifacts.filter(a => a.featured).length}</Typography>
            <Typography variant="body2">Featured Items</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center', background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white' }}>
            <Typography variant="h4">{artifacts.filter(a => a.condition === 'fragile').length}</Typography>
            <Typography variant="body2">Need Attention</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Controls */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search artifacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={20} />
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Filter by Status</InputLabel>
              <Select
                value={filterStatus}
                label="Filter by Status"
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="on_display">On Display</MenuItem>
                <MenuItem value="in_storage">In Storage</MenuItem>
                <MenuItem value="under_conservation">Under Conservation</MenuItem>
                <MenuItem value="on_loan">On Loan</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant={viewMode === 'grid' ? 'contained' : 'outlined'}
                onClick={() => setViewMode('grid')}
                size="small"
              >
                Grid
              </Button>
              <Button
                variant={viewMode === 'table' ? 'contained' : 'outlined'}
                onClick={() => setViewMode('table')}
                size="small"
              >
                Table
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              variant="contained"
              startIcon={<Plus size={16} />}
              onClick={() => setOpenDialog(true)}
              fullWidth
            >
              Add Artifact
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Artifacts Display */}
      {viewMode === 'grid' ? renderGridView() : renderTableView()}

      {/* Add Artifact Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add New Artifact</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Artifact Name"
                value={newArtifact.name}
                onChange={(e) => setNewArtifact({...newArtifact, name: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Category"
                value={newArtifact.category}
                onChange={(e) => setNewArtifact({...newArtifact, category: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Historical Period"
                value={newArtifact.period}
                onChange={(e) => setNewArtifact({...newArtifact, period: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Location"
                value={newArtifact.location}
                onChange={(e) => setNewArtifact({...newArtifact, location: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={newArtifact.status}
                  label="Status"
                  onChange={(e) => setNewArtifact({...newArtifact, status: e.target.value})}
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
                  onChange={(e) => setNewArtifact({...newArtifact, condition: e.target.value})}
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
                label="Description"
                multiline
                rows={4}
                value={newArtifact.description}
                onChange={(e) => setNewArtifact({...newArtifact, description: e.target.value})}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="outlined"
                startIcon={<Upload size={16} />}
                fullWidth
                sx={{ height: 100, borderStyle: 'dashed' }}
              >
                Upload Images
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleAddArtifact} variant="contained">Add Artifact</Button>
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
                  <Box sx={{ bgcolor: 'grey.200', height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 1 }}>
                    <Camera size={60} color="#666" />
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Details</Typography>
                  <Typography><strong>Category:</strong> {selectedArtifact.category}</Typography>
                  <Typography><strong>Period:</strong> {selectedArtifact.period}</Typography>
                  <Typography><strong>Location:</strong> {selectedArtifact.location}</Typography>
                  <Typography><strong>Date Added:</strong> {selectedArtifact.dateAdded}</Typography>
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
    </Container>
  );
};

export default ArtifactManagement;
