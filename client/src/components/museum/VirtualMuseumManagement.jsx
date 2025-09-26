import React, { useState, useEffect } from 'react';
import MuseumAdminSidebar from '../dashboard/MuseumAdminSidebar';
import virtualMuseumService from '../../services/virtualMuseumService';
import {
  Box, Typography, Container, Grid, Paper, Button, TextField,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem, Card, CardContent,
  CardActions, Stepper, Step, StepLabel, Avatar, LinearProgress
} from '@mui/material';
import {
  Monitor,
  Plus,
  Eye,
  Edit,
  Delete,
  Upload,
  Play,
  Pause,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileCheck,
  Palette,
  Camera,
  Users,
  Star,
  Send
} from 'lucide-react';

const VirtualMuseumManagement = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSubmissions: 0,
    approvedSubmissions: 0,
    pendingSubmissions: 0,
    totalViews: 0
  });

  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [createStep, setCreateStep] = useState(0);
  const [newSubmission, setNewSubmission] = useState({
    title: '',
    type: 'Exhibition',
    description: '',
    artifacts: [],
    layout: 'grid',
    accessibility: {
      audioDescriptions: false,
      subtitles: false,
      highContrast: false
    }
  });

  const statusColors = {
    'pending': 'warning',
    'under_review': 'info',
    'approved': 'success',
    'rejected': 'error',
    'resubmitted': 'secondary'
  };

  const statusIcons = {
    'pending': <Clock size={16} />,
    'under_review': <AlertCircle size={16} />,
    'approved': <CheckCircle size={16} />,
    'rejected': <XCircle size={16} />,
    'resubmitted': <FileCheck size={16} />
  };

  const createSteps = ['Basic Information', 'Select Artifacts', 'Design Layout', 'Accessibility', 'Review & Submit'];

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [submissionsResponse, statsResponse] = await Promise.all([
        virtualMuseumService.getSubmissions(),
        virtualMuseumService.getStats()
      ]);

      setSubmissions(submissionsResponse.data || []);
      setStats(statsResponse.data || {
        totalSubmissions: 0,
        approvedSubmissions: 0,
        pendingSubmissions: 0,
        totalViews: 0
      });
    } catch (error) {
      console.error('Failed to load virtual museum data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubmission = async () => {
    try {
      await virtualMuseumService.createSubmission(newSubmission);
      setOpenCreateDialog(false);
      setCreateStep(0);
      setNewSubmission({
        title: '',
        type: 'Exhibition',
        description: '',
        artifacts: [],
        layout: 'grid',
        accessibility: {
          audioDescriptions: false,
          subtitles: false,
          highContrast: false
        }
      });
      // Reload data to get updated submissions
      await loadData();
    } catch (error) {
      console.error('Failed to create submission:', error);
    }
  };

  const handleResubmit = (id) => {
    setSubmissions(submissions.map(sub =>
      sub.id === id ? { ...sub, status: 'resubmitted', submissionDate: new Date().toISOString().split('T')[0] } : sub
    ));
  };

  const handleDeleteSubmission = (id) => {
    setSubmissions(submissions.filter(sub => sub.id !== id));
  };

  const renderCreateStepContent = () => {
    switch (createStep) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Exhibition Title"
                value={newSubmission.title}
                onChange={(e) => setNewSubmission({ ...newSubmission, title: e.target.value })}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Type</InputLabel>
                <Select
                  value={newSubmission.type}
                  label="Type"
                  onChange={(e) => setNewSubmission({ ...newSubmission, type: e.target.value })}
                >
                  <MenuItem value="Exhibition">Exhibition</MenuItem>
                  <MenuItem value="3D Experience">3D Experience</MenuItem>
                  <MenuItem value="Gallery">Gallery</MenuItem>
                  <MenuItem value="Digital Archive">Digital Archive</MenuItem>
                  <MenuItem value="Interactive Tour">Interactive Tour</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={4}
                value={newSubmission.description}
                onChange={(e) => setNewSubmission({ ...newSubmission, description: e.target.value })}
                margin="normal"
              />
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Select Artifacts</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Choose artifacts from your collection to include in this virtual exhibition
            </Typography>
            <Button variant="outlined" startIcon={<Plus size={16} />}>
              Add Artifacts
            </Button>
            <Typography variant="body2" sx={{ mt: 2 }}>
              {newSubmission.artifacts.length} artifacts selected
            </Typography>
          </Box>
        );
      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Design Layout</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Layout Style</InputLabel>
                  <Select
                    value={newSubmission.layout}
                    label="Layout Style"
                    onChange={(e) => setNewSubmission({ ...newSubmission, layout: e.target.value })}
                  >
                    <MenuItem value="grid">Grid Layout</MenuItem>
                    <MenuItem value="timeline">Timeline</MenuItem>
                    <MenuItem value="story">Story Mode</MenuItem>
                    <MenuItem value="3d_gallery">3D Gallery</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Button variant="outlined" startIcon={<Palette size={16} />}>
                  Customize Theme
                </Button>
              </Grid>
            </Grid>
          </Box>
        );
      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Accessibility Features</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <input
                    type="checkbox"
                    id="audio"
                    checked={newSubmission.accessibility.audioDescriptions}
                    onChange={(e) => setNewSubmission({
                      ...newSubmission,
                      accessibility: { ...newSubmission.accessibility, audioDescriptions: e.target.checked }
                    })}
                  />
                  <Typography sx={{ ml: 1 }}>Audio Descriptions</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <input
                    type="checkbox"
                    id="subtitles"
                    checked={newSubmission.accessibility.subtitles}
                    onChange={(e) => setNewSubmission({
                      ...newSubmission,
                      accessibility: { ...newSubmission.accessibility, subtitles: e.target.checked }
                    })}
                  />
                  <Typography sx={{ ml: 1 }}>Subtitles for Videos</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <input
                    type="checkbox"
                    id="contrast"
                    checked={newSubmission.accessibility.highContrast}
                    onChange={(e) => setNewSubmission({
                      ...newSubmission,
                      accessibility: { ...newSubmission.accessibility, highContrast: e.target.checked }
                    })}
                  />
                  <Typography sx={{ ml: 1 }}>High Contrast Mode</Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        );
      case 4:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Review & Submit</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography><strong>Title:</strong> {newSubmission.title}</Typography>
                <Typography><strong>Type:</strong> {newSubmission.type}</Typography>
                <Typography><strong>Layout:</strong> {newSubmission.layout}</Typography>
                <Typography><strong>Artifacts:</strong> {newSubmission.artifacts.length}</Typography>
              </Grid>
            </Grid>
          </Box>
        );
      default:
        return null;
    }
  };

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
              <Monitor className="mr-3" size={32} style={{ color: '#8B5A3C' }} />
              Virtual Museum Management
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Create and manage digital exhibitions for public display
            </Typography>
          </Box>

          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', backgroundColor: '#8B5A3C', color: 'white' }}>
                <Monitor sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography color="inherit" variant="body2">Total Submissions</Typography>
                  <Typography variant="h4" color="inherit">{stats.totalSubmissions}</Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>Digital Exhibitions</Typography>
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', backgroundColor: '#8B5A3C', color: 'white' }}>
                <CheckCircle sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography color="inherit" variant="body2">Approved</Typography>
                  <Typography variant="h4" color="inherit">{stats.approvedSubmissions}</Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>Live Exhibitions</Typography>
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', backgroundColor: '#8B5A3C', color: 'white' }}>
                <Clock sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography color="inherit" variant="body2">Pending Review</Typography>
                  <Typography variant="h4" color="inherit">{stats.pendingSubmissions}</Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>Awaiting Approval</Typography>
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', backgroundColor: '#8B5A3C', color: 'white' }}>
                <Eye sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography color="inherit" variant="body2">Total Views</Typography>
                  <Typography variant="h4" color="inherit">{stats.totalViews}</Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>Visitor Engagement</Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>

          {/* Actions */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Virtual Museum Submissions</Typography>
              <Button
                variant="contained"
                startIcon={<Plus size={16} />}
                onClick={() => setOpenCreateDialog(true)}
                sx={{
                  backgroundColor: '#8B5A3C',
                  color: 'white',
                  '&:hover': { backgroundColor: '#8B5A3C' }
                }}
              >
                Create New Exhibition
              </Button>
            </Box>
          </Paper>

          {/* Submissions Table */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Submission Date</TableCell>
                  <TableCell>Artifacts</TableCell>
                  <TableCell>Views</TableCell>
                  <TableCell>Rating</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="body2" sx={{ color: '#8B5A3C' }}>
                        Loading submissions...
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : submissions.length > 0 ? (
                  submissions.map((submission) => (
                    <TableRow key={submission._id}>
                      <TableCell>
                        <Box>
                          <Typography variant="subtitle2">{submission.title}</Typography>
                          {submission.review?.feedback && (
                            <Typography variant="caption" color="text.secondary">
                              {submission.review.feedback}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>{submission.type}</TableCell>
                      <TableCell>
                        <Chip
                          icon={statusIcons[submission.status]}
                          label={submission.status.replace('_', ' ')}
                          color={statusColors[submission.status]}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{new Date(submission.submissionDate).toLocaleDateString()}</TableCell>
                      <TableCell>{submission.artifacts?.length || 0}</TableCell>
                      <TableCell>{submission.metrics?.views || 0}</TableCell>
                      <TableCell>
                        {submission.metrics?.averageRating ? (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Star size={16} color="#ffd700" fill="#ffd700" />
                            <Typography variant="body2" sx={{ ml: 0.5 }}>
                              {submission.metrics.averageRating}
                            </Typography>
                          </Box>
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        <IconButton size="small" sx={{ color: '#8B5A3C' }}>
                          <Eye size={16} />
                        </IconButton>
                        <IconButton size="small" sx={{ color: '#8B5A3C' }}>
                          <Edit size={16} />
                        </IconButton>
                        {submission.status === 'rejected' && (
                          <IconButton size="small" sx={{ color: '#8B5A3C' }} onClick={() => handleResubmit(submission._id)}>
                            <Send size={16} />
                          </IconButton>
                        )}
                        <IconButton size="small" color="error" onClick={() => handleDeleteSubmission(submission._id)}>
                          <Delete size={16} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="body2" sx={{ color: '#8B5A3C' }}>
                        No submissions found
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Performance Analytics */}
          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>Performance Overview</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>Most Viewed Exhibition</Typography>
                <Typography variant="body1" color="primary">
                  Ethiopian Heritage Collection (2,450 views)
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>Average Rating</Typography>
                <Typography variant="body1" color="success.main">4.8 / 5.0</Typography>
              </Grid>
            </Grid>
          </Paper>

          {/* Create Exhibition Dialog */}
          <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} maxWidth="md" fullWidth>
            <DialogTitle>
              Create New Virtual Exhibition
              <LinearProgress
                variant="determinate"
                value={(createStep / (createSteps.length - 1)) * 100}
                sx={{ mt: 1 }}
              />
            </DialogTitle>
            <DialogContent>
              <Stepper activeStep={createStep} sx={{ mb: 3 }}>
                {createSteps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
              {renderCreateStepContent()}
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => setOpenCreateDialog(false)}
                sx={{ color: '#8B5A3C' }}
              >
                Cancel
              </Button>
              {createStep > 0 && (
                <Button
                  onClick={() => setCreateStep(createStep - 1)}
                  sx={{ color: '#8B5A3C' }}
                >
                  Back
                </Button>
              )}
              {createStep < createSteps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={() => setCreateStep(createStep + 1)}
                  disabled={createStep === 0 && !newSubmission.title}
                  sx={{
                    backgroundColor: '#8B5A3C',
                    color: 'white',
                    '&:hover': { backgroundColor: '#8B5A3C' }
                  }}
                >
                  Next
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleCreateSubmission}
                  sx={{
                    backgroundColor: '#8B5A3C',
                    color: 'white',
                    '&:hover': { backgroundColor: '#8B5A3C' }
                  }}
                >
                  Submit Exhibition
                </Button>
              )}
            </DialogActions>
          </Dialog>
        </Container>
      </div>
    </div>
  );
};

export default VirtualMuseumManagement;
