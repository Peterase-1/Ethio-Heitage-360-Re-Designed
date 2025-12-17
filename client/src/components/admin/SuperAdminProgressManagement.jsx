import React, { useState, useEffect } from 'react';
import {
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
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Search,
  Refresh,
  Add,
  Edit,
  Delete,
  Visibility,
  Person,
  EmojiEvents,
  TrendingUp,
  Assessment,
  Download,
  Settings,
  CheckCircle,
  Schedule,
  Star
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { progressAdminAPI } from '../../api/progressTracker';

const SuperAdminProgressManagement = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [userProgress, setUserProgress] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetailModal, setUserDetailModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load real data from API
      const [progressRes, analyticsRes, achievementsRes] = await Promise.all([
        progressAdminAPI.getAllUsersProgress({ page: 1, limit: 50, search: searchTerm }),
        progressAdminAPI.getProgressAnalytics(),
        progressAdminAPI.getAllAchievements()
      ]);

      if (progressRes.success) {
        const rawData = progressRes.userProgress || progressRes.data || [];
        const formattedData = rawData.map(item => ({
          _id: item._id,
          userId: item.user?._id,
          name: item.user ? `${item.user.firstName} ${item.user.lastName}` : 'Unknown User',
          email: item.user?.email || '',
          role: 'user',
          totalProgress: Math.round(item.overallStats?.averageScore || 0),
          completedActivities: item.overallStats?.totalLessonsCompleted || 0,
          totalActivities: 0,
          achievementsUnlocked: item.achievements?.length || 0,
          lastActivity: new Date(item.user?.lastLogin || Date.now()),
          streakDays: item.gamification?.currentStreak || 0,
          totalPoints: item.userStats?.totalPoints || 0
        }));
        setUserProgress(formattedData);
      } else {
        toast.error('Failed to load user progress');
        setUserProgress([]);
      }

      if (analyticsRes.success) {
        setAnalytics(analyticsRes.analytics || analyticsRes.data || {});
      } else {
        setAnalytics({});
      }

      if (achievementsRes.success) {
        setAchievements(achievementsRes.achievements || achievementsRes.data || []);
      } else {
        setAchievements([]);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setUserProgress([]);
      setAchievements([]);
      setAnalytics({});
      setLoading(false);

      setSnackbar({
        open: true,
        message: error.message || 'Error loading data',
        severity: 'error'
      });
    }
  };


  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setUserDetailModal(true);
  };

  const handleResetProgress = async (userId) => {
    if (!window.confirm('Are you sure you want to reset this user\'s progress?')) {
      return;
    }

    try {
      const result = await progressAdminAPI.resetUserProgress(userId, 'all');
      if (result.success) {
        toast.success('User progress reset successfully');
        // Reload data to reflect changes
        loadData();
      } else {
        toast.error(result.message || 'Error resetting user progress');
      }
    } catch (error) {
      console.error('Reset progress error:', error);
      toast.error(error.message || 'Error resetting user progress');
    }
  };

  const handleToggleAchievement = async (achievementId, field) => {
    try {
      const updatedAchievements = achievements.map(achievement =>
        achievement._id === achievementId
          ? { ...achievement, [field]: !achievement[field] }
          : achievement
      );
      setAchievements(updatedAchievements);

      toast.success(`Achievement ${field} updated successfully`);
    } catch (error) {
      toast.error('Error updating achievement');
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'success';
    if (progress >= 50) return 'warning';
    return 'error';
  };

  const filteredUsers = userProgress.filter(user => {
    const name = user.name || '';
    const email = user.email || '';
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const paginatedUsers = filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Progress Management
      </Typography>

      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="User Progress" icon={<Person />} />
        <Tab label="Achievements" icon={<EmojiEvents />} />
        <Tab label="Analytics" icon={<Assessment />} />
      </Tabs>

      {/* User Progress Tab */}
      <TabPanel value={activeTab} index={0}>
        <Grid container spacing={3}>
          <Grid size={12}>
            <Paper sx={{ p: 2, mb: 3 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid size={{ xs: 12, md: 6 }}>
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
                <Grid size={{ xs: 12, md: 3 }}>
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
                <Grid size={{ xs: 12, md: 3 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Download />}
                  >
                    Export Data
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {loading ? (
            <Grid size={12}>
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            </Grid>
          ) : (
            <Grid size={12}>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>User</TableCell>
                      <TableCell>Progress</TableCell>
                      <TableCell>Activities</TableCell>
                      <TableCell>Achievements</TableCell>
                      <TableCell>Points</TableCell>
                      <TableCell>Last Activity</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedUsers.map((user) => (
                      <TableRow key={user._id}>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight="bold">
                              {user.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {user.email}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip
                              label={`${user.totalProgress}%`}
                              color={getProgressColor(user.totalProgress)}
                              size="small"
                            />
                          </Box>
                        </TableCell>
                        <TableCell>
                          {user.completedActivities}/{user.totalActivities}
                        </TableCell>
                        <TableCell>
                          {user.achievementsUnlocked}
                        </TableCell>
                        <TableCell>
                          {user.totalPoints}
                        </TableCell>
                        <TableCell>
                          {user.lastActivity.toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => handleViewUser(user)}
                          >
                            <Visibility />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleResetProgress(user.userId)}
                          >
                            <Delete />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={filteredUsers.length}
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
          )}
        </Grid>
      </TabPanel>

      {/* Achievements Tab */}
      <TabPanel value={activeTab} index={1}>
        <Grid container spacing={3}>
          <Grid size={12}>
            <Box sx={{ mb: 3 }}>
              <Button variant="contained" startIcon={<Add />}>
                Create New Achievement
              </Button>
            </Box>
          </Grid>

          {achievements.map((achievement) => (
            <Grid size={{ xs: 12, md: 6 }} key={achievement._id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <EmojiEvents sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" component="h3">
                      {achievement.title}
                    </Typography>
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {achievement.description}
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Chip
                      label={`${achievement.points} points`}
                      color="primary"
                      size="small"
                    />
                    <Chip
                      label={achievement.category}
                      variant="outlined"
                      size="small"
                    />
                    <Chip
                      label={achievement.isActive ? 'Active' : 'Inactive'}
                      color={achievement.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </Box>

                  <Typography variant="body2">
                    Unlocked by {achievement.unlockCount} users
                  </Typography>
                </CardContent>

                <CardActions>
                  <IconButton size="small">
                    <Edit />
                  </IconButton>
                  <IconButton size="small" color="error">
                    <Delete />
                  </IconButton>
                  <Box sx={{ ml: 'auto' }}>
                    <Switch
                      checked={achievement.isActive}
                      onChange={() => handleToggleAchievement(achievement._id, 'isActive')}
                      size="small"
                    />
                  </Box>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Analytics Tab */}
      <TabPanel value={activeTab} index={2}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="primary">
                  {analytics.totalUsers?.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Users
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="success.main">
                  {analytics.activeUsersThisWeek}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active This Week
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="warning.main">
                  {analytics.totalAchievementsUnlocked?.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Achievements Unlocked
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="info.main">
                  {analytics.averageProgressPerUser}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Average Progress
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Top Performers
                </Typography>
                <List>
                  {analytics.topPerformers?.map((performer, index) => (
                    <React.Fragment key={index}>
                      <ListItem>
                        <ListItemIcon>
                          <Star color="warning" />
                        </ListItemIcon>
                        <ListItemText
                          primary={performer.name}
                          secondary={`${performer.progress}% progress • ${performer.points} points`}
                        />
                      </ListItem>
                      {index < analytics.topPerformers.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* User Detail Modal */}
      <Dialog
        open={userDetailModal}
        onClose={() => setUserDetailModal(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          User Progress Details
          {selectedUser && (
            <Typography variant="subtitle1" color="text.secondary">
              {selectedUser.name}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="body2"><strong>Email:</strong> {selectedUser.email}</Typography>
                <Typography variant="body2"><strong>Role:</strong> {selectedUser.role}</Typography>
                <Typography variant="body2"><strong>Total Progress:</strong> {selectedUser.totalProgress}%</Typography>
                <Typography variant="body2"><strong>Streak Days:</strong> {selectedUser.streakDays}</Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="body2"><strong>Activities:</strong> {selectedUser.completedActivities}/{selectedUser.totalActivities}</Typography>
                <Typography variant="body2"><strong>Achievements:</strong> {selectedUser.achievementsUnlocked}</Typography>
                <Typography variant="body2"><strong>Total Points:</strong> {selectedUser.totalPoints}</Typography>
                <Typography variant="body2"><strong>Last Activity:</strong> {selectedUser.lastActivity.toLocaleDateString()}</Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUserDetailModal(false)}>
            Close
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
    </Box>
  );
};

export default SuperAdminProgressManagement;
