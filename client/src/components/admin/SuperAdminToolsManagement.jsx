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
  CircularProgress
} from '@mui/material';
import {
  Search,
  Refresh,
  Add,
  Edit,
  Delete,
  Visibility,
  Build,
  CheckCircle,
  Cancel,
  Settings,
  BugReport
} from '@mui/icons-material';
import { toast } from 'react-toastify';

const SuperAdminToolsManagement = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const [tools, setTools] = useState([]);
  const [selectedTool, setSelectedTool] = useState(null);
  const [toolDetailModal, setToolDetailModal] = useState(false);
  const [createToolModal, setCreateToolModal] = useState(false);

  // Mock data for tools
  const mockTools = [
    {
      _id: '1',
      name: 'Heritage Site Mapper',
      description: 'Interactive tool for mapping Ethiopian heritage sites',
      category: 'Educational',
      type: 'Web App',
      version: '2.1.0',
      isActive: true,
      isPublished: true,
      isFree: true,
      downloadUrl: 'https://example.com/download',
      usage: {
        totalUsers: 1250,
        totalSessions: 3800,
        averageRating: 4.5
      },
      knownIssues: [
        {
          title: 'Map loading issue',
          severity: 'medium',
          status: 'in-progress',
          description: 'Some maps take longer to load on slower connections'
        }
      ]
    },
    {
      _id: '2',
      name: 'Artifact Catalog Creator',
      description: 'Tool for creating digital catalogs of museum artifacts',
      category: 'Productivity',
      type: 'Software',
      version: '1.3.2',
      isActive: true,
      isPublished: false,
      isFree: false,
      price: 29.99,
      usage: {
        totalUsers: 89,
        totalSessions: 340,
        averageRating: 4.8
      },
      knownIssues: []
    }
  ];

  useEffect(() => {
    loadTools();
  }, []);

  const loadTools = async () => {
    setLoading(true);
    try {
      // Mock API call - replace with actual API call later
      setTimeout(() => {
        setTools(mockTools);
        setLoading(false);
      }, 1000);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error loading tools',
        severity: 'error'
      });
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleToggleStatus = async (toolId, field) => {
    try {
      const updatedTools = tools.map(tool => 
        tool._id === toolId 
          ? { ...tool, [field]: !tool[field] }
          : tool
      );
      setTools(updatedTools);
      
      toast.success(`Tool ${field} updated successfully`);
    } catch (error) {
      toast.error('Error updating tool status');
    }
  };

  const handleViewDetails = (tool) => {
    setSelectedTool(tool);
    setToolDetailModal(true);
  };

  const handleDeleteTool = async (toolId) => {
    if (!window.confirm('Are you sure you want to delete this tool?')) {
      return;
    }
    
    try {
      const updatedTools = tools.filter(tool => tool._id !== toolId);
      setTools(updatedTools);
      toast.success('Tool deleted successfully');
    } catch (error) {
      toast.error('Error deleting tool');
    }
  };

  const getStatusColor = (isActive) => {
    return isActive ? 'success' : 'default';
  };

  const getPublishColor = (isPublished) => {
    return isPublished ? 'primary' : 'default';
  };

  const getSeverityColor = (severity) => {
    const colors = {
      low: 'success',
      medium: 'warning',
      high: 'error',
      critical: 'error'
    };
    return colors[severity] || 'default';
  };

  const filteredTools = tools.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || tool.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Tools & Resources Management
      </Typography>

      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="All Tools" icon={<Build />} />
        <Tab label="Analytics" icon={<Settings />} />
        <Tab label="Issues" icon={<BugReport />} />
      </Tabs>

      {/* Tools Management Tab */}
      <TabPanel value={activeTab} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    placeholder="Search tools..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: <Search />
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                    >
                      <MenuItem value="all">All Categories</MenuItem>
                      <MenuItem value="Educational">Educational</MenuItem>
                      <MenuItem value="Productivity">Productivity</MenuItem>
                      <MenuItem value="Research">Research</MenuItem>
                      <MenuItem value="Media">Media</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Refresh />}
                    onClick={loadTools}
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
                    onClick={() => setCreateToolModal(true)}
                  >
                    New Tool
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
              <Grid container spacing={3}>
                {filteredTools.map((tool) => (
                  <Grid item xs={12} md={6} lg={4} key={tool._id}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Build sx={{ mr: 1, color: 'primary.main' }} />
                          <Typography variant="h6" component="h3" noWrap>
                            {tool.name}
                          </Typography>
                        </Box>

                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {tool.description}
                        </Typography>

                        <Box sx={{ mb: 2 }}>
                          <Chip 
                            label={tool.category} 
                            color="primary" 
                            size="small"
                            sx={{ mr: 1 }}
                          />
                          <Chip 
                            label={tool.type} 
                            variant="outlined" 
                            size="small"
                          />
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                          <Typography variant="body2">
                            Version: {tool.version}
                          </Typography>
                          <Typography variant="body2">
                            {tool.isFree ? 'Free' : `$${tool.price}`}
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                          <Chip 
                            label={tool.isActive ? 'Active' : 'Inactive'}
                            color={getStatusColor(tool.isActive)}
                            size="small"
                          />
                          <Chip 
                            label={tool.isPublished ? 'Published' : 'Draft'}
                            color={getPublishColor(tool.isPublished)}
                            size="small"
                          />
                          {tool.knownIssues && tool.knownIssues.length > 0 && (
                            <Chip 
                              label={`${tool.knownIssues.length} Issues`}
                              color="warning"
                              size="small"
                            />
                          )}
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="caption" color="text.secondary">
                            {tool.usage?.totalUsers || 0} users
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ★ {tool.usage?.averageRating || 0}
                          </Typography>
                        </Box>
                      </CardContent>

                      <CardActions>
                        <IconButton 
                          size="small" 
                          onClick={() => handleViewDetails(tool)}
                        >
                          <Visibility />
                        </IconButton>
                        <IconButton size="small">
                          <Edit />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleDeleteTool(tool._id)}
                        >
                          <Delete />
                        </IconButton>
                        <Box sx={{ ml: 'auto' }}>
                          <Switch
                            checked={tool.isActive}
                            onChange={() => handleToggleStatus(tool._id, 'isActive')}
                            size="small"
                          />
                        </Box>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          )}
        </Grid>
      </TabPanel>

      {/* Analytics Tab */}
      <TabPanel value={activeTab} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Tools Analytics
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Analytics dashboard coming soon! This will show detailed tool usage metrics,
                  user engagement statistics, and performance data.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Issues Tab */}
      <TabPanel value={activeTab} index={2}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Known Issues Management
                </Typography>
                <Grid container spacing={2}>
                  {tools.map(tool => 
                    tool.knownIssues && tool.knownIssues.map((issue, index) => (
                      <Grid item xs={12} key={`${tool._id}-${index}`}>
                        <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="subtitle1" fontWeight="bold">
                              {issue.title}
                            </Typography>
                            <Box>
                              <Chip 
                                label={issue.severity} 
                                color={getSeverityColor(issue.severity)}
                                size="small" 
                                sx={{ mr: 1 }}
                              />
                              <Chip 
                                label={issue.status} 
                                variant="outlined"
                                size="small"
                              />
                            </Box>
                          </Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            Tool: {tool.name}
                          </Typography>
                          <Typography variant="body2">
                            {issue.description}
                          </Typography>
                        </Paper>
                      </Grid>
                    ))
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Tool Detail Modal */}
      <Dialog
        open={toolDetailModal}
        onClose={() => setToolDetailModal(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Tool Details
          {selectedTool && (
            <Typography variant="subtitle1" color="text.secondary">
              {selectedTool.name}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          {selectedTool && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="body2"><strong>Category:</strong> {selectedTool.category}</Typography>
                <Typography variant="body2"><strong>Type:</strong> {selectedTool.type}</Typography>
                <Typography variant="body2"><strong>Version:</strong> {selectedTool.version}</Typography>
                <Typography variant="body2"><strong>Price:</strong> {selectedTool.isFree ? 'Free' : `$${selectedTool.price}`}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2"><strong>Total Users:</strong> {selectedTool.usage?.totalUsers || 0}</Typography>
                <Typography variant="body2"><strong>Sessions:</strong> {selectedTool.usage?.totalSessions || 0}</Typography>
                <Typography variant="body2"><strong>Rating:</strong> {selectedTool.usage?.averageRating || 0}/5</Typography>
                <Typography variant="body2"><strong>Issues:</strong> {selectedTool.knownIssues?.length || 0}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2"><strong>Description:</strong></Typography>
                <Typography variant="body2">{selectedTool.description}</Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setToolDetailModal(false)}>
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

export default SuperAdminToolsManagement;
