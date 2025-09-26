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
  TablePagination
} from '@mui/material';
import {
  Search,
  Refresh,
  Add,
  Edit,
  Delete,
  Visibility,
  Games,
  PlayArrow,
  Pause,
  Settings,
  TrendingUp,
  Assessment
} from '@mui/icons-material';
import { toast } from 'react-toastify';

const SuperAdminGamesManagement = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const [games, setGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [gameDetailModal, setGameDetailModal] = useState(false);
  const [createGameModal, setCreateGameModal] = useState(false);

  // Mock data
  const mockGames = [
    {
      _id: '1',
      title: 'Ethiopian Heritage Quiz',
      description: 'Interactive quiz about Ethiopian cultural heritage',
      category: 'Quiz',
      difficulty: 'intermediate',
      isActive: true,
      isPublished: true,
      totalPlayers: 1250,
      averageScore: 85,
      completionRate: 78,
      createdAt: new Date('2024-01-01'),
      estimatedDuration: 15,
      pointsReward: 100
    },
    {
      _id: '2',
      title: 'Virtual Museum Tour',
      description: 'Explore the Ethiopian National Museum virtually',
      category: 'Exploration',
      difficulty: 'beginner',
      isActive: true,
      isPublished: false,
      totalPlayers: 450,
      averageScore: 92,
      completionRate: 95,
      createdAt: new Date('2024-01-10'),
      estimatedDuration: 25,
      pointsReward: 150
    },
    {
      _id: '3',
      title: 'Ancient Artifact Puzzle',
      description: 'Solve puzzles related to Ethiopian artifacts',
      category: 'Puzzle',
      difficulty: 'advanced',
      isActive: false,
      isPublished: true,
      totalPlayers: 89,
      averageScore: 65,
      completionRate: 42,
      createdAt: new Date('2024-01-05'),
      estimatedDuration: 30,
      pointsReward: 200
    }
  ];

  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    setLoading(true);
    try {
      // Mock API call - replace with actual API call later
      setTimeout(() => {
        setGames(mockGames);
        setLoading(false);
      }, 1000);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error loading games',
        severity: 'error'
      });
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleToggleStatus = async (gameId, field) => {
    try {
      const updatedGames = games.map(game => 
        game._id === gameId 
          ? { ...game, [field]: !game[field] }
          : game
      );
      setGames(updatedGames);
      
      toast.success(`Game ${field} updated successfully`);
    } catch (error) {
      toast.error('Error updating game status');
    }
  };

  const handleViewDetails = (game) => {
    setSelectedGame(game);
    setGameDetailModal(true);
  };

  const handleDeleteGame = async (gameId) => {
    if (!window.confirm('Are you sure you want to delete this game?')) {
      return;
    }
    
    try {
      const updatedGames = games.filter(game => game._id !== gameId);
      setGames(updatedGames);
      toast.success('Game deleted successfully');
    } catch (error) {
      toast.error('Error deleting game');
    }
  };

  const getStatusColor = (isActive) => {
    return isActive ? 'success' : 'default';
  };

  const getPublishColor = (isPublished) => {
    return isPublished ? 'primary' : 'default';
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      beginner: 'success',
      intermediate: 'warning',
      advanced: 'error'
    };
    return colors[difficulty] || 'default';
  };

  const filteredGames = games.filter(game => {
    const matchesSearch = game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         game.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || game.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && game.isActive) ||
                         (filterStatus === 'inactive' && !game.isActive);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const paginatedGames = filteredGames.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Games Management
      </Typography>

      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="All Games" icon={<Games />} />
        <Tab label="Analytics" icon={<Assessment />} />
        <Tab label="Settings" icon={<Settings />} />
      </Tabs>

      {/* Games Management Tab */}
      <TabPanel value={activeTab} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 2, mb: 3 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    placeholder="Search games..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: <Search />
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <FormControl fullWidth>
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                    >
                      <MenuItem value="all">All Categories</MenuItem>
                      <MenuItem value="Quiz">Quiz</MenuItem>
                      <MenuItem value="Exploration">Exploration</MenuItem>
                      <MenuItem value="Puzzle">Puzzle</MenuItem>
                      <MenuItem value="Adventure">Adventure</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={2}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
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
                    onClick={loadGames}
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
                    onClick={() => setCreateGameModal(true)}
                  >
                    New Game
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {loading ? (
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            </Grid>
          ) : (
            <Grid item xs={12}>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Game</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Difficulty</TableCell>
                      <TableCell>Players</TableCell>
                      <TableCell>Avg Score</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedGames.map((game) => (
                      <TableRow key={game._id}>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight="bold">
                              {game.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {game.description.substring(0, 50)}...
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip label={game.category} variant="outlined" size="small" />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={game.difficulty}
                            color={getDifficultyColor(game.difficulty)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {game.totalPlayers.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {game.averageScore}%
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Chip 
                              label={game.isActive ? 'Active' : 'Inactive'}
                              color={getStatusColor(game.isActive)}
                              size="small"
                            />
                            <Chip 
                              label={game.isPublished ? 'Published' : 'Draft'}
                              color={getPublishColor(game.isPublished)}
                              size="small"
                            />
                          </Box>
                        </TableCell>
                        <TableCell>
                          <IconButton 
                            size="small" 
                            onClick={() => handleViewDetails(game)}
                          >
                            <Visibility />
                          </IconButton>
                          <IconButton size="small">
                            <Edit />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => handleDeleteGame(game._id)}
                          >
                            <Delete />
                          </IconButton>
                          <IconButton 
                            size="small"
                            color={game.isActive ? 'warning' : 'success'}
                            onClick={() => handleToggleStatus(game._id, 'isActive')}
                          >
                            {game.isActive ? <Pause /> : <PlayArrow />}
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={filteredGames.length}
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

      {/* Analytics Tab */}
      <TabPanel value={activeTab} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="primary">
                  {games.reduce((sum, game) => sum + game.totalPlayers, 0).toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Players
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="success.main">
                  {games.filter(game => game.isActive).length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active Games
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="warning.main">
                  {Math.round(games.reduce((sum, game) => sum + game.averageScore, 0) / games.length) || 0}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Average Score
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="info.main">
                  {Math.round(games.reduce((sum, game) => sum + game.completionRate, 0) / games.length) || 0}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Completion Rate
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Game Performance
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Detailed analytics dashboard coming soon! This will show game-specific metrics,
                  player engagement data, and performance trends.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Settings Tab */}
      <TabPanel value={activeTab} index={2}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Game Settings
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Game configuration and settings panel coming soon! This will include
                  global game settings, scoring parameters, and difficulty configurations.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Game Detail Modal */}
      <Dialog
        open={gameDetailModal}
        onClose={() => setGameDetailModal(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Game Details
          {selectedGame && (
            <Typography variant="subtitle1" color="text.secondary">
              {selectedGame.title}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          {selectedGame && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="body2"><strong>Category:</strong> {selectedGame.category}</Typography>
                <Typography variant="body2"><strong>Difficulty:</strong> {selectedGame.difficulty}</Typography>
                <Typography variant="body2"><strong>Duration:</strong> {selectedGame.estimatedDuration} minutes</Typography>
                <Typography variant="body2"><strong>Points Reward:</strong> {selectedGame.pointsReward}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2"><strong>Total Players:</strong> {selectedGame.totalPlayers.toLocaleString()}</Typography>
                <Typography variant="body2"><strong>Average Score:</strong> {selectedGame.averageScore}%</Typography>
                <Typography variant="body2"><strong>Completion Rate:</strong> {selectedGame.completionRate}%</Typography>
                <Typography variant="body2"><strong>Created:</strong> {selectedGame.createdAt.toLocaleDateString()}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2"><strong>Description:</strong></Typography>
                <Typography variant="body2">{selectedGame.description}</Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGameDetailModal(false)}>
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
    </Container>
  );
};

export default SuperAdminGamesManagement;
