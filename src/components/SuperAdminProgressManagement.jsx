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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  LinearProgress,
  Switch,
  FormControlLabel,
  Alert,
  Snackbar,
  Tooltip,
  Badge,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Search,
  FilterList,
  Refresh,
  Add,
  Edit,
  Delete,
  Visibility,
  TrendingUp,
  TrendingDown,
  Assignment,
  EmojiEvents,
  Timeline,
  Analytics,
  Person,
  School,
  BookmarkBorder,
  PlayArrow,
  CheckCircle,
  Cancel,
  ExpandMore,
  Stars,
  LocalFireDepartment
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const SuperAdminProgressManagement = () => {
  // State management
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('lastActivity');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Data states
  const [userProgresses, setUserProgresses] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [progressStats, setProgressStats] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);

  // Modal states
  const [progressDetailModal, setProgressDetailModal] = useState(false);
  const [achievementModal, setAchievementModal] = useState(false);
  const [newAchievement, setNewAchievement] = useState({
    name: '',
    description: '',
    type: 'lesson_complete',
    category: 'general',
    icon: 'trophy',
    points: 10,
    rarity: 'common',
    criteria: {
      type: 'lessons_completed',
      threshold: 1,
      category: ''
    }
  });

  // Mock data - replace with actual API calls
  const mockUserProgresses = [
    {
      _id: '1',
      user: {
        _id: 'u1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@email.com',
        avatar: '/avatars/john.jpg'
      },
      overallStats: {
        totalLessonsCompleted: 15,
        totalTimeSpent: 240,
        currentStreak: 5,
        longestStreak: 12,
        lastActivityDate: '2024-01-15',
        averageScore: 85
      },
      courses: [
        {
          courseId: 'c1',
          courseName: 'Ethiopian History',
          status: 'in_progress',
          progressPercentage: 65,
          enrolledAt: '2024-01-01',
          lessons: []
        }
      ],
      achievements: [
        {
          achievementId: 'first_lesson',
          earnedAt: '2024-01-02',
          type: 'lesson_complete'
        }
      ]
    }
  ];

  const mockAchievements = [
    {
      _id: 'a1',
      id: 'first_lesson',
      name: 'First Steps',
      description: 'Complete your first lesson',
      type: 'lesson_complete',
      category: 'general',
      icon: 'trophy',
      points: 10,
      rarity: 'common',
      criteria: {
        type: 'lessons_completed',
        threshold: 1
      },
      isActive: true,
      createdAt: '2024-01-01'
    }
  ];

  const mockProgressStats = {
    totalUsers: 1250,
    activeUsers: 780,
    completionRate: 68,
    averageProgress: 45,
    totalAchievements: 15,
    achievementsEarned: 3450,
    dailyActiveUsers: [
      { date: '2024-01-10', users: 120 },
      { date: '2024-01-11', users: 145 },
      { date: '2024-01-12', users: 130 },
      { date: '2024-01-13', users: 165 },
      { date: '2024-01-14', users: 178 },
      { date: '2024-01-15', users: 155 }
    ],
    courseEnrollments: [
      { course: 'Ethiopian History', enrollments: 450 },
      { course: 'Traditional Culture', enrollments: 320 },
      { course: 'Ancient Civilizations', enrollments: 280 },
      { course: 'Art & Artifacts', enrollments: 200 }
    ]
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Mock API calls - replace with actual API calls
      setUserProgresses(mockUserProgresses);
      setAchievements(mockAchievements);
      setProgressStats(mockProgressStats);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error loading progress data',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleCreateAchievement = async () => {
    try {
      // Mock API call
      const achievement = {
        ...newAchievement,
        _id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        isActive: true
      };
      
      setAchievements([...achievements, achievement]);
      setAchievementModal(false);
      setNewAchievement({
        name: '',
        description: '',
        type: 'lesson_complete',
        category: 'general',
        icon: 'trophy',
        points: 10,
        rarity: 'common',
        criteria: {
          type: 'lessons_completed',
          threshold: 1,
          category: ''
        }
      });
      
      setSnackbar({
        open: true,
        message: 'Achievement created successfully',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error creating achievement',
        severity: 'error'
      });
    }
  };

  const handleViewProgressDetail = (user) => {
    setSelectedUser(user);
    setProgressDetailModal(true);
  };

  const getRarityColor = (rarity) => {
    const colors = {
      common: 'default',
      uncommon: 'primary',
      rare: 'secondary',
      epic: 'warning',
      legendary: 'error'
    };
    return colors[rarity] || 'default';
  };

  const getStatusColor = (status) => {
    const colors = {
      not_started: 'default',
      in_progress: 'primary',
      completed: 'success',
      paused: 'warning'
    };
    return colors[status] || 'default';
  };

  const filteredProgresses = userProgresses.filter(progress => {
    const matchesSearch = 
      progress.user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      progress.user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      progress.user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterType === 'all') return matchesSearch;
    if (filterType === 'active') return matchesSearch && new Date(progress.overallStats.lastActivityDate) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    if (filterType === 'high_achievers') return matchesSearch && progress.achievements.length >= 5;
    if (filterType === 'struggling') return matchesSearch && progress.overallStats.averageScore < 60;
    
    return matchesSearch;
  });

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Progress Management
      </Typography>

      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="User Progress" icon={<Person />} />
        <Tab label="Achievements" icon={<EmojiEvents />} />
        <Tab label="Analytics" icon={<Analytics />} />
      </Tabs>

      {/* User Progress Tab */}
      <TabPanel value={activeTab} index={0}>
        <Grid container spacing={3}>
          {/* Overview Cards */}
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Users
                </Typography>
                <Typography variant="h4">
                  {progressStats.totalUsers?.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Active Users
                </Typography>
                <Typography variant="h4">
                  {progressStats.activeUsers?.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Completion Rate
                </Typography>
                <Typography variant="h4">
                  {progressStats.completionRate}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Avg Progress
                </Typography>
                <Typography variant="h4">
                  {progressStats.averageProgress}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Search and Filters */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: <Search />
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Filter</InputLabel>
                    <Select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                    >
                      <MenuItem value="all">All Users</MenuItem>
                      <MenuItem value="active">Active (Last 7 days)</MenuItem>
                      <MenuItem value="high_achievers">High Achievers</MenuItem>
                      <MenuItem value="struggling">Struggling</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Sort By</InputLabel>
                    <Select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <MenuItem value="lastActivity">Last Activity</MenuItem>
                      <MenuItem value="progress">Progress</MenuItem>
                      <MenuItem value="achievements">Achievements</MenuItem>
                      <MenuItem value="score">Average Score</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={2}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<Refresh />}
                    onClick={loadData}
                    disabled={loading}
                  >
                    Refresh
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* User Progress Table */}
          <Grid item xs={12}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>User</TableCell>
                    <TableCell>Lessons Completed</TableCell>
                    <TableCell>Current Streak</TableCell>
                    <TableCell>Average Score</TableCell>
                    <TableCell>Last Activity</TableCell>
                    <TableCell>Achievements</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredProgresses
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((progress) => (
                    <TableRow key={progress._id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar
                            src={progress.user.avatar}
                            sx={{ mr: 2 }}
                          >
                            {progress.user.firstName[0]}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="bold">
                              {progress.user.firstName} {progress.user.lastName}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {progress.user.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{progress.overallStats.totalLessonsCompleted}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <LocalFireDepartment 
                            sx={{ 
                              mr: 1, 
                              color: progress.overallStats.currentStreak > 0 ? 'orange' : 'grey' 
                            }} 
                          />
                          {progress.overallStats.currentStreak}
                        </Box>
                      </TableCell>
                      <TableCell>{progress.overallStats.averageScore}%</TableCell>
                      <TableCell>
                        {new Date(progress.overallStats.lastActivityDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge badgeContent={progress.achievements.length} color="primary">
                          <EmojiEvents />
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <IconButton
                          onClick={() => handleViewProgressDetail(progress)}
                          size="small"
                        >
                          <Visibility />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredProgresses.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(event, newPage) => setPage(newPage)}
                onRowsPerPageChange={(event) => {
                  setRowsPerPage(parseInt(event.target.value, 10));
                  setPage(0);
                }}
              />
            </TableContainer>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Achievements Tab */}
      <TabPanel value={activeTab} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h5">
                Achievement Management
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setAchievementModal(true)}
              >
                Create Achievement
              </Button>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Grid container spacing={2}>
              {achievements.map((achievement) => (
                <Grid item xs={12} md={6} lg={4} key={achievement._id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <EmojiEvents sx={{ mr: 1 }} />
                        <Typography variant="h6" component="div">
                          {achievement.name}
                        </Typography>
                        <Chip
                          label={achievement.rarity}
                          color={getRarityColor(achievement.rarity)}
                          size="small"
                          sx={{ ml: 'auto' }}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {achievement.description}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Chip
                          label={`${achievement.points} points`}
                          variant="outlined"
                          size="small"
                        />
                        <FormControlLabel
                          control={
                            <Switch
                              checked={achievement.isActive}
                              size="small"
                            />
                          }
                          label="Active"
                        />
                      </Box>
                    </CardContent>
                    <CardActions>
                      <Button size="small" startIcon={<Edit />}>
                        Edit
                      </Button>
                      <Button size="small" startIcon={<Analytics />}>
                        Stats
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Analytics Tab */}
      <TabPanel value={activeTab} index={2}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Daily Active Users
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={progressStats.dailyActiveUsers}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ChartTooltip />
                  <Legend />
                  <Line type="monotone" dataKey="users" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Course Enrollments
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={progressStats.courseEnrollments}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="course" />
                  <YAxis />
                  <ChartTooltip />
                  <Legend />
                  <Bar dataKey="enrollments" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Progress Detail Modal */}
      <Dialog
        open={progressDetailModal}
        onClose={() => setProgressDetailModal(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          User Progress Details
          {selectedUser && (
            <Typography variant="subtitle1" color="textSecondary">
              {selectedUser.user.firstName} {selectedUser.user.lastName}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Overall Statistics
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText
                      primary="Lessons Completed"
                      secondary={selectedUser.overallStats.totalLessonsCompleted}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Time Spent"
                      secondary={`${selectedUser.overallStats.totalTimeSpent} minutes`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Current Streak"
                      secondary={`${selectedUser.overallStats.currentStreak} days`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Average Score"
                      secondary={`${selectedUser.overallStats.averageScore}%`}
                    />
                  </ListItem>
                </List>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Course Progress
                </Typography>
                {selectedUser.courses.map((course, index) => (
                  <Accordion key={index}>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Box sx={{ width: '100%' }}>
                        <Typography>{course.courseName}</Typography>
                        <LinearProgress
                          variant="determinate"
                          value={course.progressPercentage}
                          sx={{ mt: 1 }}
                        />
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography variant="body2">
                        Status: <Chip
                          label={course.status}
                          color={getStatusColor(course.status)}
                          size="small"
                        />
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        Progress: {course.progressPercentage}%
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        Enrolled: {new Date(course.enrolledAt).toLocaleDateString()}
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Achievements Earned
                </Typography>
                <Grid container spacing={1}>
                  {selectedUser.achievements.map((achievement, index) => (
                    <Grid item key={index}>
                      <Chip
                        icon={<Stars />}
                        label={achievement.achievementId}
                        color="primary"
                        variant="outlined"
                      />
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProgressDetailModal(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Achievement Modal */}
      <Dialog
        open={achievementModal}
        onClose={() => setAchievementModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Achievement</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Achievement Name"
                value={newAchievement.name}
                onChange={(e) => setNewAchievement({
                  ...newAchievement,
                  name: e.target.value
                })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={newAchievement.description}
                onChange={(e) => setNewAchievement({
                  ...newAchievement,
                  description: e.target.value
                })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={newAchievement.type}
                  onChange={(e) => setNewAchievement({
                    ...newAchievement,
                    type: e.target.value
                  })}
                >
                  <MenuItem value="lesson_complete">Lesson Complete</MenuItem>
                  <MenuItem value="course_complete">Course Complete</MenuItem>
                  <MenuItem value="streak">Streak</MenuItem>
                  <MenuItem value="score">Score</MenuItem>
                  <MenuItem value="time_spent">Time Spent</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Rarity</InputLabel>
                <Select
                  value={newAchievement.rarity}
                  onChange={(e) => setNewAchievement({
                    ...newAchievement,
                    rarity: e.target.value
                  })}
                >
                  <MenuItem value="common">Common</MenuItem>
                  <MenuItem value="uncommon">Uncommon</MenuItem>
                  <MenuItem value="rare">Rare</MenuItem>
                  <MenuItem value="epic">Epic</MenuItem>
                  <MenuItem value="legendary">Legendary</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Points"
                value={newAchievement.points}
                onChange={(e) => setNewAchievement({
                  ...newAchievement,
                  points: parseInt(e.target.value)
                })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Threshold"
                value={newAchievement.criteria.threshold}
                onChange={(e) => setNewAchievement({
                  ...newAchievement,
                  criteria: {
                    ...newAchievement.criteria,
                    threshold: parseInt(e.target.value)
                  }
                })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAchievementModal(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateAchievement}
            disabled={!newAchievement.name || !newAchievement.description}
          >
            Create Achievement
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
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default SuperAdminProgressManagement;
