import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Badge,
  Paper,
  Divider
} from '@mui/material';
import {
  Send as SendIcon,
  Reply as ReplyIcon,
  Archive as ArchiveIcon,
  MarkEmailRead as ReadIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  Message as MessageIcon,
  Person as PersonIcon,
  Museum as MuseumIcon,
  PriorityHigh as PriorityIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import api from '../../utils/api';

const CommunicationsCenter = () => {
  // State management
  const [communications, setCommunications] = useState([]);
  const [museums, setMuseums] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Filters and search
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    priority: '',
    search: ''
  });

  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0
  });

  // UI state
  const [activeTab, setActiveTab] = useState(0);
  const [selectedCommunication, setSelectedCommunication] = useState(null);
  const [composeDialog, setComposeDialog] = useState(false);
  const [replyDialog, setReplyDialog] = useState(false);

  // New message form
  const [newMessage, setNewMessage] = useState({
    type: 'feedback',
    to: '',
    museum: '',
    subject: '',
    message: '',
    priority: 'medium',
    tags: []
  });

  // Reply form
  const [replyMessage, setReplyMessage] = useState({
    message: '',
    priority: 'medium'
  });

  // Load data on component mount
  useEffect(() => {
    loadCommunications();
    loadMuseums();
    loadUsers();
  }, [filters, pagination.page]);

  // Add fallback data for development with valid MongoDB ObjectIds
  useEffect(() => {
    if (museums.length === 0) {
      setMuseums([
        { _id: '507f1f77bcf86cd799439011', name: 'National Museum of Ethiopia' },
        { _id: '507f1f77bcf86cd799439012', name: 'Ethnological Museum' },
        { _id: '507f1f77bcf86cd799439013', name: 'Addis Ababa Museum' }
      ]);
    }
    if (users.length === 0) {
      // Only Museum Admin users for Super Admin communication
      setUsers([
        { _id: '507f1f77bcf86cd799439021', name: 'Museum Admin 1', email: 'admin1@museum.com', role: 'museumAdmin' },
        { _id: '507f1f77bcf86cd799439022', name: 'Museum Admin 2', email: 'admin2@museum.com', role: 'museumAdmin' },
        { _id: '507f1f77bcf86cd799439023', name: 'Museum Admin 3', email: 'admin3@museum.com', role: 'museumAdmin' }
      ]);
    }
  }, [museums.length, users.length]);

  const loadCommunications = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      };

      const response = await api.getCommunications(params);
      console.log('Communications response:', response);
      const communicationsData = response.data || response.communications || response;
      setCommunications(Array.isArray(communicationsData) ? communicationsData : []);
      setPagination(prev => ({
        ...prev,
        total: response.pagination?.total || 0
      }));
    } catch (error) {
      console.error('Error loading communications:', error);
      setError('Failed to load communications');
      // Set fallback data for development
      setCommunications([
        {
          _id: '1',
          subject: 'Artifact Submission Feedback',
          message: 'Please improve the image quality of the submitted artifacts.',
          type: 'feedback',
          priority: 'high',
          status: 'sent',
          from: { _id: '1', name: 'Super Admin', email: 'superadmin@ethioheritage360.com' },
          to: { _id: '2', name: 'Museum Admin 1', email: 'admin1@museum.com' },
          museum: { _id: '1', name: 'National Museum of Ethiopia' },
          createdAt: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadMuseums = async () => {
    try {
      const response = await api.request('/museums');
      console.log('Museums response:', response);
      const museumsData = response.data || response.museums || response;
      setMuseums(Array.isArray(museumsData) ? museumsData : []);
    } catch (error) {
      console.error('Error loading museums:', error);
      setMuseums([]);
    }
  };

  const loadUsers = async () => {
    try {
      // Get only Museum Admin users for Super Admin to communicate with
      const response = await api.getUsers({ role: 'museumAdmin' });
      console.log('Museum Admin users response:', response);
      const usersData = response.data || response.users || response;
      const museumAdmins = Array.isArray(usersData) ? usersData.filter(user => user.role === 'museumAdmin') : [];
      setUsers(museumAdmins);
      console.log('Filtered Museum Admin users:', museumAdmins);
    } catch (error) {
      console.error('Error loading museum admin users:', error);
      setUsers([]);
    }
  };

  const handleSendMessage = async () => {
    try {
      setLoading(true);

      // Validate required fields
      if (!newMessage.to) {
        setError('Please select a recipient');
        return;
      }
      if (!newMessage.subject || newMessage.subject.trim() === '') {
        setError('Please enter a subject');
        return;
      }
      if (!newMessage.message || newMessage.message.trim() === '') {
        setError('Please enter a message');
        return;
      }

      // Transform the data to match backend validation requirements
      const communicationData = {
        to: newMessage.to, // User ID of the recipient (backend expects 'to')
        subject: newMessage.subject.trim(),
        message: newMessage.message.trim(), // Backend expects 'message' not 'content'
        type: newMessage.type,
        priority: newMessage.priority,
        museum: newMessage.museum && newMessage.museum.trim() !== '' ? newMessage.museum : undefined, // Museum ID (optional)
        tags: newMessage.tags || [],
        internalNotes: newMessage.internalNotes || ''
      };

      console.log('Sending communication data:', communicationData);
      console.log('Recipient ID:', newMessage.to);
      console.log('Museum ID:', newMessage.museum);
      console.log('Recipient ID type:', typeof newMessage.to);
      console.log('Recipient ID length:', newMessage.to?.length);
      console.log('Museum ID type:', typeof newMessage.museum);
      console.log('Museum ID length:', newMessage.museum?.length);
      await api.createCommunication(communicationData);

      setComposeDialog(false);
      setNewMessage({
        type: 'feedback',
        to: '',
        museum: '',
        subject: '',
        message: '',
        priority: 'medium',
        tags: []
      });
      loadCommunications();
    } catch (error) {
      console.error('Error sending message:', error);
      console.error('Error details:', error.message);

      // Try to extract specific validation errors
      if (error.message.includes('Validation failed')) {
        setError('Validation failed: Please check all required fields are filled correctly');
      } else if (error.message.includes('Recipient not found')) {
        setError('Recipient not found: Please select a valid recipient');
      } else if (error.message.includes('Museum not found')) {
        setError('Museum not found: Please select a valid museum');
      } else {
        setError(`Failed to send message: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async () => {
    try {
      setLoading(true);

      // Transform reply data to match backend validation requirements
      const replyData = {
        message: replyMessage.message, // Backend expects 'message' not 'content'
        priority: replyMessage.priority
      };

      console.log('Sending reply data:', replyData);
      await api.replyToCommunication(selectedCommunication._id, replyData);

      setReplyDialog(false);
      setReplyMessage({ message: '', priority: 'medium' });
      loadCommunications();
    } catch (error) {
      console.error('Error sending reply:', error);
      setError('Failed to send reply');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (communicationId) => {
    try {
      await api.markCommunicationAsRead(communicationId);
      loadCommunications();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleArchive = async (communicationId) => {
    try {
      await api.archiveCommunication(communicationId);
      loadCommunications();
    } catch (error) {
      console.error('Error archiving:', error);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'sent': return 'info';
      case 'delivered': return 'primary';
      case 'read': return 'success';
      case 'replied': return 'secondary';
      case 'resolved': return 'success';
      case 'archived': return 'default';
      default: return 'default';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderCommunicationsList = () => (
    <List>
      {communications.map((comm) => (
        <ListItem key={comm._id} divider>
          <ListItemAvatar>
            <Avatar>
              <PersonIcon />
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="subtitle1">{comm.subject}</Typography>
                <Chip
                  label={comm.priority}
                  color={getPriorityColor(comm.priority)}
                  size="small"
                />
                <Chip
                  label={comm.status}
                  color={getStatusColor(comm.status)}
                  size="small"
                />
              </Box>
            }
            secondary={
              <Box>
                <Typography variant="body2" color="text.secondary">
                  To: {comm.to?.name} ({comm.to?.email})
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {comm.museum?.name && `Museum: ${comm.museum.name}`}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatDate(comm.createdAt)}
                </Typography>
              </Box>
            }
          />
          <ListItemSecondaryAction>
            <IconButton
              edge="end"
              onClick={() => setSelectedCommunication(comm)}
            >
              <MessageIcon />
            </IconButton>
            {comm.status !== 'read' && (
              <IconButton
                edge="end"
                onClick={() => handleMarkAsRead(comm._id)}
              >
                <ReadIcon />
              </IconButton>
            )}
            <IconButton
              edge="end"
              onClick={() => handleArchive(comm._id)}
            >
              <ArchiveIcon />
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>
      ))}
    </List>
  );

  const renderComposeDialog = () => (
    <Dialog open={composeDialog} onClose={() => setComposeDialog(false)} maxWidth="md" fullWidth>
      <DialogTitle>Compose New Message</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Message Type</InputLabel>
              <Select
                value={newMessage.type}
                onChange={(e) => setNewMessage({ ...newMessage, type: e.target.value })}
              >
                <MenuItem value="feedback">Feedback</MenuItem>
                <MenuItem value="inquiry">Inquiry</MenuItem>
                <MenuItem value="announcement">Announcement</MenuItem>
                <MenuItem value="request">Request</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={newMessage.priority}
                onChange={(e) => setNewMessage({ ...newMessage, priority: e.target.value })}
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="urgent">Urgent</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Recipient</InputLabel>
              <Select
                value={newMessage.to}
                onChange={(e) => setNewMessage({ ...newMessage, to: e.target.value })}
              >
                {users.map(user => (
                  <MenuItem key={user._id} value={user._id}>
                    {user.name} - {user.email}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Museum (Optional)</InputLabel>
              <Select
                value={newMessage.museum || ''}
                onChange={(e) => setNewMessage({ ...newMessage, museum: e.target.value || undefined })}
              >
                <MenuItem value="">None</MenuItem>
                {museums.map(museum => (
                  <MenuItem key={museum._id} value={museum._id}>
                    {museum.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Subject"
              value={newMessage.subject}
              onChange={(e) => setNewMessage({ ...newMessage, subject: e.target.value })}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Message"
              value={newMessage.message}
              onChange={(e) => setNewMessage({ ...newMessage, message: e.target.value })}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setComposeDialog(false)}>Cancel</Button>
        <Button onClick={handleSendMessage} variant="contained" startIcon={<SendIcon />}>
          Send Message
        </Button>
      </DialogActions>
    </Dialog>
  );

  const renderReplyDialog = () => (
    <Dialog open={replyDialog} onClose={() => setReplyDialog(false)} maxWidth="md" fullWidth>
      <DialogTitle>Reply to Message</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Original Message: {selectedCommunication?.subject}
            </Typography>
            <Paper sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
              <Typography variant="body2">
                {selectedCommunication?.message}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={replyMessage.priority}
                onChange={(e) => setReplyMessage({ ...replyMessage, priority: e.target.value })}
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="urgent">Urgent</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Reply Message"
              value={replyMessage.message}
              onChange={(e) => setReplyMessage({ ...replyMessage, message: e.target.value })}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setReplyDialog(false)}>Cancel</Button>
        <Button onClick={handleReply} variant="contained" startIcon={<ReplyIcon />}>
          Send Reply
        </Button>
      </DialogActions>
    </Dialog>
  );

  // Loading state
  if (loading && communications.length === 0) {
    return (
      <Box p={3} textAlign="center">
        <Typography variant="h6" gutterBottom>
          Loading Communications...
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Please wait while we load your messages.
        </Typography>
      </Box>
    );
  }

  // Error boundary fallback
  if (error && communications.length === 0) {
    return (
      <Box p={3}>
        <Typography variant="h6" color="error" gutterBottom>
          Error Loading Communications
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          {error}
        </Typography>
        <Button
          variant="contained"
          onClick={() => {
            setError('');
            loadCommunications();
          }}
        >
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Communications Center</Typography>
        <Button
          variant="contained"
          startIcon={<SendIcon />}
          onClick={() => setComposeDialog(true)}
        >
          New Message
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Messages
              </Typography>
              <Typography variant="h4">
                {communications.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Unread Messages
              </Typography>
              <Typography variant="h4" color="primary">
                {communications.filter(c => c.status === 'sent').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Awaiting Reply
              </Typography>
              <Typography variant="h4" color="warning.main">
                {communications.filter(c => c.status === 'delivered').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Resolved
              </Typography>
              <Typography variant="h4" color="success.main">
                {communications.filter(c => c.status === 'resolved').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Search"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                InputProps={{
                  startAdornment: <SearchIcon />
                }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={filters.type}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                >
                  <MenuItem value="">All Types</MenuItem>
                  <MenuItem value="feedback">Feedback</MenuItem>
                  <MenuItem value="inquiry">Inquiry</MenuItem>
                  <MenuItem value="announcement">Announcement</MenuItem>
                  <MenuItem value="request">Request</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                >
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="sent">Sent</MenuItem>
                  <MenuItem value="delivered">Delivered</MenuItem>
                  <MenuItem value="read">Read</MenuItem>
                  <MenuItem value="replied">Replied</MenuItem>
                  <MenuItem value="resolved">Resolved</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={filters.priority}
                  onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                >
                  <MenuItem value="">All Priorities</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="urgent">Urgent</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Communications List */}
      <Card>
        <CardContent>
          {loading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <Typography>Loading communications...</Typography>
            </Box>
          ) : communications.length === 0 ? (
            <Box display="flex" flexDirection="column" alignItems="center" p={3}>
              <MessageIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No communications found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Start by sending a message to a Museum Admin
              </Typography>
            </Box>
          ) : (
            renderCommunicationsList()
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      {renderComposeDialog()}
      {renderReplyDialog()}
    </Box>
  );
};

export default CommunicationsCenter;
