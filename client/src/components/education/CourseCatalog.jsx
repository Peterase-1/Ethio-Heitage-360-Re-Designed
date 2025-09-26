import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Chip,
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Rating,
  Skeleton,
  Container,
  Paper,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Search as SearchIcon,
  BookmarkBorder as BookmarkIcon,
  Bookmark as BookmarkedIcon,
  People as PeopleIcon,
  AccessTime as TimeIcon,
  School as SchoolIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';

const CourseCatalog = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    difficulty: '',
    sortBy: 'createdAt'
  });
  const [bookmarkedCourses, setBookmarkedCourses] = useState(new Set());

  useEffect(() => {
    fetchCourses();
  }, [filters]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        category: filters.category,
        difficulty: filters.difficulty,
        limit: 20
      });

      const response = await fetch(`/api/learning/courses?${queryParams}`);
      const data = await response.json();

      if (data.success) {
        setCourses(data.courses || []);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleBookmark = async (courseId) => {
    try {
      const isBookmarked = bookmarkedCourses.has(courseId);
      const method = isBookmarked ? 'DELETE' : 'POST';
      
      const response = await fetch(`/api/learning/courses/${courseId}/bookmark`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const newBookmarked = new Set(bookmarkedCourses);
        if (isBookmarked) {
          newBookmarked.delete(courseId);
          toast.success('Removed from bookmarks');
        } else {
          newBookmarked.add(courseId);
          toast.success('Added to bookmarks');
        }
        setBookmarkedCourses(newBookmarked);
      }
    } catch (error) {
      console.error('Error bookmarking course:', error);
      toast.error('Failed to update bookmark');
    }
  };

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(filters.search.toLowerCase()) ||
    course.description.toLowerCase().includes(filters.search.toLowerCase())
  );

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'success';
      case 'intermediate': return 'warning';
      case 'advanced': return 'error';
      default: return 'default';
    }
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Grid container spacing={3}>
          {[...Array(6)].map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card>
                <Skeleton variant="rectangular" height={200} />
                <CardContent>
                  <Skeleton variant="text" height={30} />
                  <Skeleton variant="text" height={20} />
                  <Skeleton variant="text" height={20} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Paper elevation={2} sx={{ p: 3, mb: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <Typography variant="h3" color="white" gutterBottom align="center">
          Ethiopian Heritage Learning Center
        </Typography>
        <Typography variant="h6" color="rgba(255,255,255,0.9)" align="center">
          Discover the rich history and culture of Ethiopia through our comprehensive courses
        </Typography>
      </Paper>

      {/* Filters */}
      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search courses..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                label="Category"
              >
                <MenuItem value="">All Categories</MenuItem>
                <MenuItem value="history">History</MenuItem>
                <MenuItem value="culture">Culture</MenuItem>
                <MenuItem value="archaeology">Archaeology</MenuItem>
                <MenuItem value="language">Language</MenuItem>
                <MenuItem value="art">Art</MenuItem>
                <MenuItem value="traditions">Traditions</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Difficulty</InputLabel>
              <Select
                value={filters.difficulty}
                onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
                label="Difficulty"
              >
                <MenuItem value="">All Levels</MenuItem>
                <MenuItem value="beginner">Beginner</MenuItem>
                <MenuItem value="intermediate">Intermediate</MenuItem>
                <MenuItem value="advanced">Advanced</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={filters.sortBy}
                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                label="Sort By"
              >
                <MenuItem value="createdAt">Newest</MenuItem>
                <MenuItem value="title">Title</MenuItem>
                <MenuItem value="difficulty">Difficulty</MenuItem>
                <MenuItem value="estimatedDuration">Duration</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => setFilters({ search: '', category: '', difficulty: '', sortBy: 'createdAt' })}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Course Grid */}
      {filteredCourses.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <SchoolIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" color="text.secondary" gutterBottom>
            No courses found
          </Typography>
          <Typography color="text.secondary">
            Try adjusting your search criteria or check back later for new courses.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredCourses.map((course) => (
            <Grid item xs={12} sm={6} md={4} key={course._id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4
                  }
                }}
              >
                <Box sx={{ position: 'relative' }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={course.image || `https://picsum.photos/400/200?random=${course._id}`}
                    alt={course.title}
                  />
                  <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                    <Tooltip title={bookmarkedCourses.has(course._id) ? 'Remove bookmark' : 'Add bookmark'}>
                      <IconButton
                        onClick={(e) => {
                          e.preventDefault();
                          handleBookmark(course._id);
                        }}
                        sx={{
                          backgroundColor: 'rgba(255,255,255,0.9)',
                          '&:hover': { backgroundColor: 'rgba(255,255,255,1)' }
                        }}
                      >
                        {bookmarkedCourses.has(course._id) ? (
                          <BookmarkedIcon color="primary" />
                        ) : (
                          <BookmarkIcon />
                        )}
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Box sx={{ position: 'absolute', top: 8, left: 8 }}>
                    <Chip
                      label={course.difficulty}
                      size="small"
                      color={getDifficultyColor(course.difficulty)}
                      sx={{ textTransform: 'capitalize' }}
                    />
                  </Box>
                </Box>

                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="h6" component="h2" gutterBottom noWrap>
                    {course.title}
                  </Typography>
                  
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      flexGrow: 1,
                      mb: 2,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical'
                    }}
                  >
                    {course.description}
                  </Typography>

                  <Box sx={{ mb: 2 }}>
                    <Chip
                      label={course.category}
                      size="small"
                      variant="outlined"
                      sx={{ textTransform: 'capitalize', mr: 1 }}
                    />
                    {course.instructor && (
                      <Typography variant="caption" color="text.secondary">
                        by {course.instructor}
                      </Typography>
                    )}
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <TimeIcon fontSize="small" color="action" />
                      <Typography variant="caption">
                        {formatDuration(course.estimatedDuration)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <SchoolIcon fontSize="small" color="action" />
                      <Typography variant="caption">
                        {course.lessons?.length || 0} lessons
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Rating value={4.5} precision={0.5} size="small" readOnly />
                    <Typography variant="caption" color="text.secondary">
                      (4.5)
                    </Typography>
                  </Box>

                  <Button
                    onClick={() => alert(`Course: ${course.title}\n\nDescription: ${course.description}\n\nInstructor: ${course.instructor}\n\nDifficulty: ${course.difficulty}\n\nCourse functionality coming soon!`)}
                    variant="contained"
                    fullWidth
                    sx={{ mt: 2 }}
                  >
                    View Course Info
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Load More Button */}
      {filteredCourses.length > 0 && filteredCourses.length % 20 === 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Button variant="outlined" size="large" onClick={fetchCourses}>
            Load More Courses
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default CourseCatalog;
