import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Button,
  IconButton,
  Chip,
  Dialog,
  TextField,
  InputAdornment,
  MenuItem,
  CircularProgress,
  Alert,
  useTheme,
  alpha
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  AccessTime as TimeIcon,
  AttachMoney as MoneyIcon,
  School as CourseIcon,
  Person as InstructorIcon,
  Image as ImageIcon
} from '@mui/icons-material';
import api from '../../utils/api';

const CourseManagement = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');

  // Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    difficulty: 'Beginner',
    instructor: '',
    price: '', // Initialize empty to avoid NaN
    duration: '', // Initialize empty to avoid NaN
    image: '',
    status: 'draft'
  });

  const categories = [
    'history', 'culture', 'archaeology', 'art', 'heritage', 'tourism', 'language', 'other'
  ];

  const difficulties = ['Beginner', 'Intermediate', 'Advanced'];

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    let result = courses;
    if (searchTerm) {
      result = result.filter(c =>
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (filterCategory !== 'All') {
      result = result.filter(c => c.category === filterCategory);
    }
    setFilteredCourses(result);
  }, [courses, searchTerm, filterCategory]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      setError('');
      // Use the new admin endpoint
      const response = await api.getAdminCourses();

      // Handle different response structures gracefully
      let data = [];
      if (Array.isArray(response)) {
        data = response;
      } else if (response && Array.isArray(response.courses)) {
        data = response.courses;
      } else if (response && response.data && Array.isArray(response.data)) {
        data = response.data;
      }

      setCourses(data);
      setFilteredCourses(data);
    } catch (err) {
      console.error('Failed to load courses:', err);
      // Fallback to mock data only if completely failed and empty
      // But we prefer showing the error to debug connection.
      setError('Failed to load courses. Please check connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = () => {
    setEditingCourse(null);
    setFormData({
      title: '',
      description: '',
      category: '',
      difficulty: 'Beginner',
      instructor: '',
      price: '',
      duration: '',
      image: '',
      status: 'draft'
    });
    setDialogOpen(true);
  };

  const handleEditCourse = (course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title || '',
      description: course.description || '',
      category: course.category || '',
      difficulty: course.difficulty || 'Beginner',
      instructor: typeof course.instructor === 'object' ? course.instructor?.name || '' : (course.instructor || ''),
      price: course.price !== undefined ? course.price : '',
      duration: course.estimatedDuration !== undefined ? course.estimatedDuration : '', // Map estimatedDuration
      image: course.image || '',
      status: course.isActive ? 'published' : 'draft'
    });
    setDialogOpen(true);
  };

  const handleSaveCourse = async () => {
    try {
      setError('');
      // Validation
      if (!formData.title || !formData.description || !formData.category || !formData.duration) {
        setError('Please fill in all required fields (Title, Description, Category, Duration).');
        return;
      }

      // Payload Construction
      const payload = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        difficulty: formData.difficulty,
        instructor: formData.instructor,
        price: parseFloat(formData.price) || 0,
        estimatedDuration: parseInt(formData.duration) || 0, // IMPORTANT: Backend expects 'estimatedDuration'
        image: formData.image,
        isActive: formData.status === 'published'
      };

      if (editingCourse) {
        await api.updateCourse(editingCourse._id || editingCourse.id, payload);
      } else {
        await api.createCourse(payload);
      }

      setDialogOpen(false);
      loadCourses();
    } catch (err) {
      console.error('Error saving course:', err);
      setError('Failed to save course. ' + (err.message || ''));
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await api.deleteCourse(courseId);
        loadCourses();
      } catch (err) {
        console.error('Error deleting course:', err);
        setError('Failed to delete course');
      }
    }
  };

  const getStatusColor = (status) => {
    // Logic for chip color
    if (status === 'published' || status === true) return 'success';
    return 'default';
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" gap={2} alignItems="center">
          <TextField
            placeholder="Search courses..."
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>
            }}
          />
          <TextField
            select
            size="small"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="All">All Categories</MenuItem>
            {categories.map(cat => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}
          </TextField>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateCourse}
          sx={{ borderRadius: 2, textTransform: 'none' }}
        >
          Create Course
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" p={5}><CircularProgress /></Box>
      ) : (
        <Grid container spacing={3}>
          {filteredCourses.map((course) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={course._id || course.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 3, boxShadow: 2 }}>
                <CardMedia
                  component="img"
                  height="140"
                  image={course.image || 'https://dummyimage.com/300x140/000/fff&text=Course'}
                  alt={course.title}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Chip label={course.category} size="small" color="primary" variant="outlined" />
                    <Chip
                      label={course.isActive ? 'Published' : 'Draft'}
                      size="small"
                      color={course.isActive ? 'success' : 'default'}
                    />
                  </Box>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {course.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {course.description}
                  </Typography>

                  <Box display="flex" alignItems="center" gap={1} color="text.secondary" mb={0.5}>
                    <TimeIcon fontSize="small" />
                    <Typography variant="caption">{course.estimatedDuration || course.duration} mins</Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1} color="text.secondary">
                    <InstructorIcon fontSize="small" />
                    <Typography variant="caption">
                      {typeof course.instructor === 'object' ? course.instructor?.name : (course.instructor || 'Unassigned')}
                    </Typography>
                  </Box>
                </CardContent>
                <Box p={2} pt={0} display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle1" fontWeight="bold" color="primary">
                    {course.price > 0 ? `$${course.price}` : 'Free'}
                  </Typography>
                  <Box>
                    <IconButton size="small" color="primary" onClick={() => handleEditCourse(course)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDeleteCourse(course._id || course.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
              </Card>
            </Grid>
          ))}
          {!loading && filteredCourses.length === 0 && (
            <Box width="100%" textAlign="center" p={5}>
              <Typography color="textSecondary">No courses found matching your criteria.</Typography>
            </Box>
          )}
        </Grid>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <Box p={3}>
          <Typography variant="h5" mb={3} fontWeight="bold">
            {editingCourse ? 'Edit Course' : 'Create New Course'}
          </Typography>
          <Grid container spacing={2}>
            <Grid size={12}>
              <TextField
                fullWidth label="Course Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth multiline rows={3} label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select fullWidth label="Category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              >
                {categories.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select fullWidth label="Difficulty"
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
              >
                {difficulties.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth label="Duration (mins)" type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                required
                InputProps={{
                  startAdornment: <InputAdornment position="start"><TimeIcon /></InputAdornment>
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth label="Price" type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><MoneyIcon /></InputAdornment>
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                select fullWidth label="Status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="published">Published</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth label="Instructor Name"
                value={formData.instructor}
                onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth label="Image URL"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="https://..."
              />
            </Grid>
          </Grid>
          <Box mt={4} display="flex" justifySelf="flex-end" gap={2} justifyContent="flex-end">
            <Button onClick={() => setDialogOpen(false)} color="inherit">Cancel</Button>
            <Button onClick={handleSaveCourse} variant="contained" color="primary">
              {editingCourse ? 'Update Course' : 'Create Course'}
            </Button>
          </Box>
        </Box>
      </Dialog>
    </Box>
  );
};

export default CourseManagement;
