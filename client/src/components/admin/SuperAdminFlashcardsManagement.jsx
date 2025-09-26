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
  Tabs,
  Tab,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
  Alert,
  Snackbar,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Badge
} from '@mui/material';
import {
  Search,
  Refresh,
  Add,
  Edit,
  Delete,
  Visibility,
  School,
  Quiz,
  TrendingUp,
  Assessment,
  Publish,
  UnpublishedOutlined,
  Category,
  Language
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { flashcardsAdminAPI } from '../../api/flashcards';

const SuperAdminFlashcardsManagement = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const [flashcardSets, setFlashcardSets] = useState([]);
  const [stats, setStats] = useState({});
  const [selectedSet, setSelectedSet] = useState(null);
  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);

  // Form state for creating/editing flashcard sets
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'heritage',
    difficulty: 'beginner',
    isActive: true,
    cards: []
  });

  const categories = [
    { value: 'heritage', label: 'Heritage Sites' },
    { value: 'artifacts', label: 'Artifacts' },
    { value: 'history', label: 'Ethiopian History' },
    { value: 'culture', label: 'Culture' },
    { value: 'geography', label: 'Geography' },
    { value: 'art', label: 'Art & Crafts' },
    { value: 'language', label: 'Languages' }
  ];

  const difficulties = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ];

  // Mock data for demonstration
  const mockFlashcardSets = [
    {
      _id: '1',
      title: 'Ethiopian Heritage Sites',
      description: 'Learn about UNESCO World Heritage Sites in Ethiopia',
      category: 'heritage',
      difficulty: 'beginner',
      isActive: true,
      totalCards: 25,
      studyCount: 156,
      averageScore: 85,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-20')
    },
    {
      _id: '2',
      title: 'Ancient Artifacts Quiz',
      description: 'Discover ancient artifacts from Ethiopian museums',
      category: 'artifacts',
      difficulty: 'intermediate',
      isActive: true,
      totalCards: 40,
      studyCount: 89,
      averageScore: 78,
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-18')
    }
  ];

  const mockStats = {
    totalSets: 12,
    activeSets: 10,
    totalStudies: 1245,
    averageCompletion: 73
  };

  useEffect(() => {
    loadData();
  }, [page, rowsPerPage, searchTerm, filterCategory, filterStatus]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [setsRes, statsRes] = await Promise.allSettled([
        flashcardsAdminAPI.getAllFlashcardSets({
          page: page + 1,
          limit: rowsPerPage,
          search: searchTerm,
          category: filterCategory !== 'all' ? filterCategory : '',
          isActive: filterStatus !== 'all' ? filterStatus === 'active' : null
        }),
        flashcardsAdminAPI.getFlashcardStats()
      ]);

      if (setsRes.status === 'fulfilled' && setsRes.value.success) {
        setFlashcardSets(setsRes.value.data || setsRes.value.flashcardSets || []);
      } else {
        // Fallback to mock data
        setFlashcardSets(mockFlashcardSets);
      }

      if (statsRes.status === 'fulfilled' && statsRes.value.success) {
        setStats(statsRes.value.data || statsRes.value.stats || mockStats);
      } else {
        setStats(mockStats);
      }

    } catch (error) {
      console.error('Error loading flashcard data:', error);
      // Fallback to mock data
      setFlashcardSets(mockFlashcardSets);
      setStats(mockStats);
      
      setSnackbar({
        open: true,
        message: 'Using demo data - API connection failed',
        severity: 'warning'
      });
    }
    setLoading(false);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleCreateSet = async () => {
    try {
      const validation = validateFlashcardSet(formData);
      if (!validation.isValid) {
        setSnackbar({
          open: true,
          message: Object.values(validation.errors)[0],
          severity: 'error'
        });
        return;
      }

      await flashcardsAdminAPI.createFlashcardSet(formData);
      setSnackbar({
        open: true,
        message: 'Flashcard set created successfully',
        severity: 'success'
      });
      setCreateModal(false);
      resetForm();
      loadData();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to create flashcard set',
        severity: 'error'
      });
    }
  };

  const handleUpdateSet = async () => {
    try {
      const validation = validateFlashcardSet(formData);
      if (!validation.isValid) {
        setSnackbar({
          open: true,
          message: Object.values(validation.errors)[0],
          severity: 'error'
        });
        return;
      }

      await flashcardsAdminAPI.updateFlashcardSet(selectedSet._id, formData);
      setSnackbar({
        open: true,
        message: 'Flashcard set updated successfully',
        severity: 'success'
      });
      setEditModal(false);
      resetForm();
      loadData();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to update flashcard set',
        severity: 'error'
      });
    }
  };

  const handleDeleteSet = async () => {
    try {
      await flashcardsAdminAPI.deleteFlashcardSet(selectedSet._id);
      setSnackbar({
        open: true,
        message: 'Flashcard set deleted successfully',
        severity: 'success'
      });
      setDeleteModal(false);
      setSelectedSet(null);
      loadData();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to delete flashcard set',
        severity: 'error'
      });
    }
  };

  const handleToggleStatus = async (setId, currentStatus) => {
    try {
      await flashcardsAdminAPI.toggleFlashcardSetStatus(setId, !currentStatus);
      setSnackbar({
        open: true,
        message: `Flashcard set ${!currentStatus ? 'published' : 'unpublished'} successfully`,
        severity: 'success'
      });
      loadData();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to update flashcard set status',
        severity: 'error'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'heritage',
      difficulty: 'beginner',
      isActive: true,
      cards: []
    });
  };

  const validateFlashcardSet = (data) => {
    const errors = {};
    
    if (!data.title || data.title.trim().length < 3) {
      errors.title = 'Title must be at least 3 characters';
    }
    
    if (!data.description || data.description.trim().length < 10) {
      errors.description = 'Description must be at least 10 characters';
    }

    if (!data.category) {
      errors.category = 'Category is required';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };

  const StatCard = ({ title, value, icon, color = 'primary' }) => (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" color={color}>
              {value}
            </Typography>
          </Box>
          <Box color={`${color}.main`}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="xl">
      <Box mb={4}>
        <Typography variant="h4" gutterBottom>
          Flashcard Management
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Create and manage flashcard sets for heritage education
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Sets"
            value={stats.totalSets || 0}
            icon={<School sx={{ fontSize: 40 }} />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Sets"
            value={stats.activeSets || 0}
            icon={<Quiz sx={{ fontSize: 40 }} />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Studies"
            value={stats.totalStudies || 0}
            icon={<TrendingUp sx={{ fontSize: 40 }} />}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Avg. Completion"
            value={`${stats.averageCompletion || 0}%`}
            icon={<Assessment sx={{ fontSize: 40 }} />}
            color="warning"
          />
        </Grid>
      </Grid>

      {/* Controls */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search flashcard sets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={filterCategory}
                label="Category"
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <MenuItem value="all">All Categories</MenuItem>
                {categories.map((cat) => (
                  <MenuItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={filterStatus}
                label="Status"
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Refresh />}
              onClick={loadData}
              disabled={loading}
            >
              Refresh
            </Button>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<Add />}
              onClick={() => setCreateModal(true)}
            >
              Create Set
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Flashcard Sets Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Difficulty</TableCell>
                <TableCell>Cards</TableCell>
                <TableCell>Studies</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : (
                flashcardSets.map((set) => (
                  <TableRow key={set._id}>
                    <TableCell>
                      <Box>
                        <Typography variant="body1" fontWeight="medium">
                          {set.title}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {set.description}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={categories.find(c => c.value === set.category)?.label || set.category}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={set.difficulty}
                        size="small"
                        color={
                          set.difficulty === 'beginner' ? 'success' :
                          set.difficulty === 'intermediate' ? 'warning' : 'error'
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Badge badgeContent={set.totalCards} color="primary">
                        <Quiz />
                      </Badge>
                    </TableCell>
                    <TableCell>{set.studyCount || 0}</TableCell>
                    <TableCell>
                      <Chip
                        label={set.isActive ? 'Active' : 'Inactive'}
                        color={set.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedSet(set);
                            setFormData({
                              title: set.title,
                              description: set.description,
                              category: set.category,
                              difficulty: set.difficulty,
                              isActive: set.isActive,
                              cards: set.cards || []
                            });
                            setEditModal(true);
                          }}
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleToggleStatus(set._id, set.isActive)}
                        >
                          {set.isActive ? <UnpublishedOutlined /> : <Publish />}
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => {
                            setSelectedSet(set);
                            setDeleteModal(true);
                          }}
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={100} // This should come from API response
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
        />
      </Paper>

      {/* Create/Edit Dialog */}
      <Dialog open={createModal || editModal} onClose={() => {
        setCreateModal(false);
        setEditModal(false);
        resetForm();
      }} maxWidth="md" fullWidth>
        <DialogTitle>
          {createModal ? 'Create New Flashcard Set' : 'Edit Flashcard Set'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              fullWidth
              multiline
              rows={3}
              required
            />
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.category}
                label="Category"
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {categories.map((cat) => (
                  <MenuItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Difficulty</InputLabel>
              <Select
                value={formData.difficulty}
                label="Difficulty"
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
              >
                {difficulties.map((diff) => (
                  <MenuItem key={diff.value} value={diff.value}>
                    {diff.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
              }
              label="Active (visible to users)"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setCreateModal(false);
            setEditModal(false);
            resetForm();
          }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={createModal ? handleCreateSet : handleUpdateSet}
          >
            {createModal ? 'Create' : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteModal} onClose={() => setDeleteModal(false)}>
        <DialogTitle>Delete Flashcard Set</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedSet?.title}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteModal(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDeleteSet}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default SuperAdminFlashcardsManagement;
