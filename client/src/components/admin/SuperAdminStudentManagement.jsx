import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Tabs,
  Tab,
  Button,
  IconButton,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  CircularProgress,
  Badge,
  Avatar
} from '@mui/material';
import {
  School,
  Quiz,
  LiveTv,
  Assignment,
  EmojiEvents,
  TrendingUp,
  Assessment,
  People,
  Add,
  Edit,
  Delete,
  Visibility,
  Search,
  Refresh,
  PlayArrow,
  Stop,
  Publish,
  UnpublishedOutlined,
  SportsEsports,
  StarOutline,
  MonetizationOn,
  BarChart
} from '@mui/icons-material';
import { toast } from 'react-toastify';

// Import our API clients
import { flashcardsAdminAPI } from '../../api/flashcards';
import { liveSessionsAdminAPI } from '../../api/liveSessions';
import { progressAdminAPI } from '../../api/progressTracker';
import api from '../../utils/api';

const SuperAdminStudentManagement = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // State for different sections
  const [flashcards, setFlashcards] = useState([]);
  const [liveSessions, setLiveSessions] = useState([]);
  const [progress, setProgress] = useState([]);
  const [games, setGames] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [pointsAnalytics, setPointsAnalytics] = useState({});
  const [stats, setStats] = useState({});

  // Pagination and filters
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Modal states
  const [createFlashcardModal, setCreateFlashcardModal] = useState(false);
  const [createSessionModal, setCreateSessionModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Form states
  const [flashcardFormData, setFlashcardFormData] = useState({
    title: '',
    description: '',
    category: 'heritage',
    difficulty: 'beginner',
    isActive: true
  });

  const [sessionFormData, setSessionFormData] = useState({
    title: '',
    description: '',
    category: 'heritage',
    scheduledAt: '',
    duration: 60,
    maxParticipants: 50,
    language: 'english'
  });

  // Categories and options
  const categories = [
    { value: 'heritage', label: 'Heritage Sites' },
    { value: 'artifacts', label: 'Artifacts' },
    { value: 'history', label: 'Ethiopian History' },
    { value: 'culture', label: 'Culture' },
    { value: 'geography', label: 'Geography' },
    { value: 'art', label: 'Art & Crafts' }
  ];

  const difficulties = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ];

  // Mock data for demonstration
  const mockStats = {
    totalStudents: 1847,
    activeStudents: 234,
    totalFlashcards: 45,
    activeSessions: 8,
    totalProgress: 68,
    completedAssignments: 156
  };

  const mockFlashcards = [
    {
      _id: '1',
      title: 'Ethiopian Heritage Sites',
      description: 'UNESCO World Heritage Sites in Ethiopia',
      category: 'heritage',
      difficulty: 'beginner',
      isActive: true,
      totalCards: 25,
      studyCount: 156,
      createdAt: new Date('2024-01-15')
    },
    {
      _id: '2',
      title: 'Ancient Artifacts',
      description: 'Artifacts from Ethiopian museums',
      category: 'artifacts',
      difficulty: 'intermediate',
      isActive: true,
      totalCards: 40,
      studyCount: 89,
      createdAt: new Date('2024-01-10')
    }
  ];

  const mockLiveSessions = [
    {
      _id: '1',
      title: 'Virtual Tour of Lalibela',
      description: 'Guided virtual tour of the rock churches',
      category: 'heritage',
      scheduledAt: new Date('2024-02-15T14:00:00'),
      duration: 90,
      status: 'scheduled',
      participants: 25,
      maxParticipants: 50,
      language: 'english'
    },
    {
      _id: '2',
      title: 'Ethiopian Coffee Culture',
      description: 'Learn about traditional coffee ceremonies',
      category: 'culture',
      scheduledAt: new Date('2024-02-20T16:00:00'),
      duration: 60,
      status: 'live',
      participants: 30,
      maxParticipants: 40,
      language: 'english'
    }
  ];

  useEffect(() => {
    loadData();
  }, [activeTab, page, rowsPerPage, searchTerm, filterStatus]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 0) {
        // Load flashcards
        const flashcardsRes = await flashcardsAdminAPI.getAllFlashcardSets({
          page: page + 1,
          limit: rowsPerPage,
          search: searchTerm
        });
        // Ensure flashcards is always an array
        const flashcardsData = flashcardsRes.success ? flashcardsRes.data : mockFlashcards;
        setFlashcards(Array.isArray(flashcardsData) ? flashcardsData : (flashcardsData?.flashcards || flashcardsData?.data || mockFlashcards));
      } else if (activeTab === 1) {
        // Load live sessions
        const sessionsRes = await liveSessionsAdminAPI.getAllSessions({
          page: page + 1,
          limit: rowsPerPage,
          search: searchTerm,
          status: filterStatus
        });
        // Ensure liveSessions is always an array
        const sessionsData = sessionsRes.success ? sessionsRes.data : mockLiveSessions;
        setLiveSessions(Array.isArray(sessionsData) ? sessionsData : (sessionsData?.sessions || sessionsData?.data || mockLiveSessions));
      } else if (activeTab === 2) {
        // Load progress data
        const progressRes = await progressAdminAPI.getAllUsersProgress({
          page: page + 1,
          limit: rowsPerPage,
          search: searchTerm
        });
        setProgress(progressRes.success ? progressRes.data : []);
      }

      // Load stats
      const statsData = mockStats; // Use mock for now
      setStats(statsData);

    } catch (error) {
      console.error('Error loading data:', error);
      // Use mock data on error
      setFlashcards(mockFlashcards);
      setLiveSessions(mockLiveSessions);
      setStats(mockStats);
      
      setSnackbar({
        open: true,
        message: 'Using demo data - API connection failed',
        severity: 'warning'
      });
    }
    setLoading(false);
  };

  const handleCreateFlashcard = async () => {
    try {
      await flashcardsAdminAPI.createFlashcardSet(flashcardFormData);
      setSnackbar({
        open: true,
        message: 'Flashcard set created successfully',
        severity: 'success'
      });
      setCreateFlashcardModal(false);
      resetFlashcardForm();
      loadData();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to create flashcard set',
        severity: 'error'
      });
    }
  };

  const handleCreateSession = async () => {
    try {
      await liveSessionsAdminAPI.createSession(sessionFormData);
      setSnackbar({
        open: true,
        message: 'Live session created successfully',
        severity: 'success'
      });
      setCreateSessionModal(false);
      resetSessionForm();
      loadData();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to create live session',
        severity: 'error'
      });
    }
  };

  const handleStartSession = async (sessionId) => {
    try {
      await liveSessionsAdminAPI.startSession(sessionId);
      setSnackbar({
        open: true,
        message: 'Session started successfully',
        severity: 'success'
      });
      loadData();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to start session',
        severity: 'error'
      });
    }
  };

  const handleEndSession = async (sessionId) => {
    try {
      await liveSessionsAdminAPI.endSession(sessionId);
      setSnackbar({
        open: true,
        message: 'Session ended successfully',
        severity: 'success'
      });
      loadData();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to end session',
        severity: 'error'
      });
    }
  };

  const resetFlashcardForm = () => {
    setFlashcardFormData({
      title: '',
      description: '',
      category: 'heritage',
      difficulty: 'beginner',
      isActive: true
    });
  };

  const resetSessionForm = () => {
    setSessionFormData({
      title: '',
      description: '',
      category: 'heritage',
      scheduledAt: '',
      duration: 60,
      maxParticipants: 50,
      language: 'english'
    });
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

  const renderFlashcardsTab = () => (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">Flashcard Management</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setCreateFlashcardModal(true)}
        >
          Create Flashcard Set
        </Button>
      </Box>

      <TableContainer component={Paper}>
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
            {flashcards.map((set) => (
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
                  <Chip label={set.category} size="small" color="primary" variant="outlined" />
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
                  <IconButton size="small">
                    <Edit />
                  </IconButton>
                  <IconButton size="small">
                    {set.isActive ? <UnpublishedOutlined /> : <Publish />}
                  </IconButton>
                  <IconButton size="small" color="error">
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const renderLiveSessionsTab = () => (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">Live Sessions Management</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setCreateSessionModal(true)}
        >
          Create Session
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Scheduled</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell>Participants</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {liveSessions.map((session) => (
              <TableRow key={session._id}>
                <TableCell>
                  <Box>
                    <Typography variant="body1" fontWeight="medium">
                      {session.title}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {session.description}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip label={session.category} size="small" color="primary" variant="outlined" />
                </TableCell>
                <TableCell>
                  {new Date(session.scheduledAt).toLocaleString()}
                </TableCell>
                <TableCell>{session.duration} min</TableCell>
                <TableCell>
                  {session.participants || 0}/{session.maxParticipants}
                </TableCell>
                <TableCell>
                  <Chip
                    label={session.status}
                    size="small"
                    color={
                      session.status === 'live' ? 'error' :
                      session.status === 'scheduled' ? 'primary' : 'success'
                    }
                  />
                </TableCell>
                <TableCell>
                  {session.status === 'scheduled' && (
                    <IconButton
                      size="small"
                      color="success"
                      onClick={() => handleStartSession(session._id)}
                    >
                      <PlayArrow />
                    </IconButton>
                  )}
                  {session.status === 'live' && (
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleEndSession(session._id)}
                    >
                      <Stop />
                    </IconButton>
                  )}
                  <IconButton size="small">
                    <Edit />
                  </IconButton>
                  <IconButton size="small" color="error">
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const renderProgressTab = () => (
    <Box>
      <Typography variant="h6" mb={3}>Student Progress Overview</Typography>
      <Alert severity="info" sx={{ mb: 3 }}>
        This section shows student progress across all learning activities including flashcards and live sessions.
      </Alert>
      <Paper sx={{ p: 2 }}>
        <Typography variant="body1">
          Detailed progress tracking will be displayed here, including individual student performance,
          completion rates, and engagement metrics across all learning resources.
        </Typography>
      </Paper>
    </Box>
  );

  const renderGamesTab = () => (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">Games Management</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => console.log('Create new game')}
        >
          Add New Game
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Game Categories */}
        <Grid xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Game Categories
            </Typography>
            <Box display="flex" flexDirection="column" gap={1}>
              {categories.map((cat) => (
                <Chip
                  key={cat.value}
                  label={cat.label}
                  variant="outlined"
                  onClick={() => console.log(`Filter by ${cat.value}`)}
                  clickable
                />
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Games List */}
        <Grid xs={12} md={9}>
          <Grid container spacing={2}>
            {[
              {
                id: '1',
                title: 'Heritage Sites Quiz',
                category: 'heritage',
                difficulty: 'intermediate',
                plays: 234,
                avgScore: 85,
                status: 'active'
              },
              {
                id: '2',
                title: 'Artifact Memory Match',
                category: 'artifacts',
                difficulty: 'beginner',
                plays: 156,
                avgScore: 92,
                status: 'active'
              }
            ].map((game) => (
              <Grid xs={12} sm={6} md={4} key={game.id}>
                <Card>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                      <SportsEsports color="primary" />
                      <Chip
                        label={game.status}
                        size="small"
                        color={game.status === 'active' ? 'success' : 'default'}
                      />
                    </Box>
                    <Typography variant="h6" gutterBottom>
                      {game.title}
                    </Typography>
                    <Box mb={2}>
                      <Chip label={game.category} size="small" variant="outlined" sx={{ mr: 1 }} />
                      <Chip label={game.difficulty} size="small" color="secondary" />
                    </Box>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      {game.plays} plays • Avg Score: {game.avgScore}%
                    </Typography>
                    <Box display="flex" gap={1}>
                      <IconButton size="small"><Edit /></IconButton>
                      <IconButton size="small"><Visibility /></IconButton>
                      <IconButton size="small" color="error"><Delete /></IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );

  const renderAchievementsTab = () => (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">Achievements Management</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => console.log('Create new achievement')}
        >
          Create Achievement
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Achievement</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Points</TableCell>
              <TableCell>Requirements</TableCell>
              <TableCell>Earned By</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {[
              {
                id: '1',
                name: 'Heritage Explorer',
                description: 'Complete 10 heritage site lessons',
                category: 'heritage',
                points: 100,
                requirement: 'Complete 10 lessons',
                earnedBy: 45,
                isActive: true
              },
              {
                id: '2',
                name: 'Culture Master',
                description: 'Score 95% on culture quiz',
                category: 'culture',
                points: 150,
                requirement: '95% quiz score',
                earnedBy: 23,
                isActive: true
              }
            ].map((achievement) => (
              <TableRow key={achievement.id}>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <StarOutline />
                    </Avatar>
                    <Box>
                      <Typography variant="body1" fontWeight="medium">
                        {achievement.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {achievement.description}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip label={achievement.category} size="small" color="primary" variant="outlined" />
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <MonetizationOn color="warning" fontSize="small" />
                    <Typography fontWeight="medium">{achievement.points}</Typography>
                  </Box>
                </TableCell>
                <TableCell>{achievement.requirement}</TableCell>
                <TableCell>
                  <Badge badgeContent={achievement.earnedBy} color="primary">
                    <EmojiEvents />
                  </Badge>
                </TableCell>
                <TableCell>
                  <Chip
                    label={achievement.isActive ? 'Active' : 'Inactive'}
                    color={achievement.isActive ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton size="small"><Edit /></IconButton>
                  <IconButton size="small">
                    {achievement.isActive ? <UnpublishedOutlined /> : <Publish />}
                  </IconButton>
                  <IconButton size="small" color="error"><Delete /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const renderPointsTab = () => (
    <Box>
      <Typography variant="h6" mb={3}>Points & Rewards System</Typography>
      
      <Grid container spacing={3}>
        {/* Points Overview */}
        <Grid xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Points Overview</Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              <Box display="flex" justifyContent="space-between">
                <Typography>Total Points Awarded:</Typography>
                <Typography fontWeight="bold">12,450</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography>Active Students:</Typography>
                <Typography fontWeight="bold">234</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography>Avg Points/Student:</Typography>
                <Typography fontWeight="bold">53</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Top Earners */}
        <Grid xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Top Point Earners</Typography>
            <Box display="flex" flexDirection="column" gap={1}>
              {[
                { name: 'Student A', points: 345, rank: 1 },
                { name: 'Student B', points: 289, rank: 2 },
                { name: 'Student C', points: 267, rank: 3 }
              ].map((student) => (
                <Box key={student.name} display="flex" justifyContent="space-between" alignItems="center">
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="h6" color="primary">#{student.rank}</Typography>
                    <Typography>{student.name}</Typography>
                  </Box>
                  <Chip label={`${student.points} pts`} size="small" color="warning" />
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Rewards Management */}
        <Grid xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Rewards Management</Typography>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Add />}
              sx={{ mb: 2 }}
              onClick={() => console.log('Create reward')}
            >
              Create New Reward
            </Button>
            <Typography variant="body2" color="textSecondary">
              Manage point thresholds and rewards for student engagement
            </Typography>
          </Paper>
        </Grid>

        {/* Points Activity */}
        <Grid xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Recent Points Activity</Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Student</TableCell>
                    <TableCell>Activity</TableCell>
                    <TableCell>Points Earned</TableCell>
                    <TableCell>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[
                    { student: 'John Doe', activity: 'Completed Heritage Quiz', points: 25, date: '2 hours ago' },
                    { student: 'Jane Smith', activity: 'Finished Artifact Study', points: 15, date: '4 hours ago' },
                    { student: 'Mike Johnson', activity: 'Attended Live Session', points: 30, date: '1 day ago' }
                  ].map((activity, index) => (
                    <TableRow key={index}>
                      <TableCell>{activity.student}</TableCell>
                      <TableCell>{activity.activity}</TableCell>
                      <TableCell>
                        <Chip label={`+${activity.points}`} size="small" color="success" />
                      </TableCell>
                      <TableCell>{activity.date}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );

  const renderAnalyticsTab = () => (
    <Box>
      <Typography variant="h6" mb={3}>Learning Analytics Dashboard</Typography>
      
      <Grid container spacing={3}>
        {/* Key Metrics */}
        <Grid xs={12}>
          <Grid container spacing={2}>
            <Grid xs={12} sm={6} md={3}>
              <StatCard
                title="Total Engagements"
                value="2,847"
                icon={<Assessment sx={{ fontSize: 40 }} />}
                color="primary"
              />
            </Grid>
            <Grid xs={12} sm={6} md={3}>
              <StatCard
                title="Games Played"
                value="1,234"
                icon={<SportsEsports sx={{ fontSize: 40 }} />}
                color="success"
              />
            </Grid>
            <Grid xs={12} sm={6} md={3}>
              <StatCard
                title="Achievements Earned"
                value="456"
                icon={<EmojiEvents sx={{ fontSize: 40 }} />}
                color="warning"
              />
            </Grid>
            <Grid xs={12} sm={6} md={3}>
              <StatCard
                title="Avg Session Time"
                value="25min"
                icon={<TrendingUp sx={{ fontSize: 40 }} />}
                color="info"
              />
            </Grid>
          </Grid>
        </Grid>

        {/* Analytics Charts Placeholder */}
        <Grid xs={12} md={6}>
          <Paper sx={{ p: 3, height: 300 }}>
            <Typography variant="h6" gutterBottom>Learning Progress Trends</Typography>
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              height="80%"
              bgcolor="grey.50"
              borderRadius={1}
            >
              <Typography color="textSecondary">Chart visualization would go here</Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid xs={12} md={6}>
          <Paper sx={{ p: 3, height: 300 }}>
            <Typography variant="h6" gutterBottom>Category Performance</Typography>
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              height="80%"
              bgcolor="grey.50"
              borderRadius={1}
            >
              <Typography color="textSecondary">Performance breakdown chart</Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Detailed Analytics */}
        <Grid xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Student Engagement Breakdown</Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Category</TableCell>
                    <TableCell>Total Students</TableCell>
                    <TableCell>Avg Completion Rate</TableCell>
                    <TableCell>Avg Score</TableCell>
                    <TableCell>Time Spent</TableCell>
                    <TableCell>Trend</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {categories.map((cat) => (
                    <TableRow key={cat.value}>
                      <TableCell>
                        <Chip label={cat.label} size="small" color="primary" variant="outlined" />
                      </TableCell>
                      <TableCell>{Math.floor(Math.random() * 200) + 50}</TableCell>
                      <TableCell>{Math.floor(Math.random() * 30) + 70}%</TableCell>
                      <TableCell>{Math.floor(Math.random() * 20) + 80}%</TableCell>
                      <TableCell>{Math.floor(Math.random() * 30) + 15} min</TableCell>
                      <TableCell>
                        <TrendingUp color={Math.random() > 0.5 ? 'success' : 'warning'} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );

  return (
    <Container maxWidth="xl">
      <Box mb={4}>
        <Typography variant="h4" gutterBottom>
          Student Management
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Manage learning resources, live sessions, and student progress
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid xs={12} sm={6} md={2}>
          <StatCard
            title="Total Students"
            value={stats.totalStudents || 0}
            icon={<People sx={{ fontSize: 40 }} />}
            color="primary"
          />
        </Grid>
        <Grid xs={12} sm={6} md={2}>
          <StatCard
            title="Active Students"
            value={stats.activeStudents || 0}
            icon={<School sx={{ fontSize: 40 }} />}
            color="success"
          />
        </Grid>
        <Grid xs={12} sm={6} md={2}>
          <StatCard
            title="Flashcard Sets"
            value={stats.totalFlashcards || 0}
            icon={<Quiz sx={{ fontSize: 40 }} />}
            color="info"
          />
        </Grid>
        <Grid xs={12} sm={6} md={2}>
          <StatCard
            title="Live Sessions"
            value={stats.activeSessions || 0}
            icon={<LiveTv sx={{ fontSize: 40 }} />}
            color="warning"
          />
        </Grid>
        <Grid xs={12} sm={6} md={2}>
          <StatCard
            title="Avg Progress"
            value={`${stats.totalProgress || 0}%`}
            icon={<TrendingUp sx={{ fontSize: 40 }} />}
            color="secondary"
          />
        </Grid>
        <Grid xs={12} sm={6} md={2}>
          <StatCard
            title="Assignments"
            value={stats.completedAssignments || 0}
            icon={<Assignment sx={{ fontSize: 40 }} />}
            color="error"
          />
        </Grid>
      </Grid>

      {/* Controls */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          <Grid xs={12} md={2}>
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
          <Grid xs={12} md={2}>
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
        </Grid>
      </Paper>

      {/* Tabs */}
      <Paper>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Flashcards" icon={<Quiz />} />
          <Tab label="Live Sessions" icon={<LiveTv />} />
          <Tab label="Progress Tracking" icon={<Assessment />} />
          <Tab label="Games" icon={<SportsEsports />} />
          <Tab label="Achievements" icon={<StarOutline />} />
          <Tab label="Points & Rewards" icon={<MonetizationOn />} />
          <Tab label="Analytics" icon={<BarChart />} />
        </Tabs>

        <Box p={3}>
          {loading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {activeTab === 0 && renderFlashcardsTab()}
              {activeTab === 1 && renderLiveSessionsTab()}
              {activeTab === 2 && renderProgressTab()}
              {activeTab === 3 && renderGamesTab()}
              {activeTab === 4 && renderAchievementsTab()}
              {activeTab === 5 && renderPointsTab()}
              {activeTab === 6 && renderAnalyticsTab()}
            </>
          )}
        </Box>
      </Paper>

      {/* Pagination */}
      <Box display="flex" justifyContent="center" mt={3}>
        <TablePagination
          component="div"
          count={100}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
        />
      </Box>

      {/* Create Flashcard Modal */}
      <Dialog open={createFlashcardModal} onClose={() => setCreateFlashcardModal(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Flashcard Set</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Title"
              value={flashcardFormData.title}
              onChange={(e) => setFlashcardFormData({ ...flashcardFormData, title: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Description"
              value={flashcardFormData.description}
              onChange={(e) => setFlashcardFormData({ ...flashcardFormData, description: e.target.value })}
              fullWidth
              multiline
              rows={3}
              required
            />
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={flashcardFormData.category}
                label="Category"
                onChange={(e) => setFlashcardFormData({ ...flashcardFormData, category: e.target.value })}
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
                value={flashcardFormData.difficulty}
                label="Difficulty"
                onChange={(e) => setFlashcardFormData({ ...flashcardFormData, difficulty: e.target.value })}
              >
                {difficulties.map((diff) => (
                  <MenuItem key={diff.value} value={diff.value}>
                    {diff.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateFlashcardModal(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateFlashcard}>Create</Button>
        </DialogActions>
      </Dialog>

      {/* Create Session Modal */}
      <Dialog open={createSessionModal} onClose={() => setCreateSessionModal(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Live Session</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Title"
              value={sessionFormData.title}
              onChange={(e) => setSessionFormData({ ...sessionFormData, title: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Description"
              value={sessionFormData.description}
              onChange={(e) => setSessionFormData({ ...sessionFormData, description: e.target.value })}
              fullWidth
              multiline
              rows={3}
              required
            />
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={sessionFormData.category}
                label="Category"
                onChange={(e) => setSessionFormData({ ...sessionFormData, category: e.target.value })}
              >
                {categories.map((cat) => (
                  <MenuItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Scheduled Date & Time"
              type="datetime-local"
              value={sessionFormData.scheduledAt}
              onChange={(e) => setSessionFormData({ ...sessionFormData, scheduledAt: e.target.value })}
              fullWidth
              InputLabelProps={{ shrink: true }}
              required
            />
            <TextField
              label="Duration (minutes)"
              type="number"
              value={sessionFormData.duration}
              onChange={(e) => setSessionFormData({ ...sessionFormData, duration: parseInt(e.target.value) })}
              fullWidth
              inputProps={{ min: 15, max: 300 }}
            />
            <TextField
              label="Max Participants"
              type="number"
              value={sessionFormData.maxParticipants}
              onChange={(e) => setSessionFormData({ ...sessionFormData, maxParticipants: parseInt(e.target.value) })}
              fullWidth
              inputProps={{ min: 1, max: 1000 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateSessionModal(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateSession}>Create</Button>
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

export default SuperAdminStudentManagement;
