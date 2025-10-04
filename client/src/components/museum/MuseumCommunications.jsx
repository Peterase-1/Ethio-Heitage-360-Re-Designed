import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Alert,
  CircularProgress,
  Badge
} from '@mui/material';
import {
  Send as SendIcon,
  Reply as ReplyIcon,
  MarkEmailRead as MarkReadIcon,
  Archive as ArchiveIcon,
  Refresh as RefreshIcon,
  Message as MessageIcon,
  Person as PersonIcon,
  Business as BusinessIcon
} from '@mui/icons-material';
import { api } from '../../utils/api';
import ErrorBoundary from '../common/ErrorBoundary';

const MuseumCommunications = ({ filter = {} }) => {
  const [communications, setCommunications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [composeDialog, setComposeDialog] = useState(false);
  const [replyDialog, setReplyDialog] = useState(false);
  const [selectedCommunication, setSelectedCommunication] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // New message form
  const [newMessage, setNewMessage] = useState({
    type: 'inquiry',
    subject: '',
    message: '',
    priority: 'medium'
  });

  // Reply form
  const [replyMessage, setReplyMessage] = useState({
    message: ''
  });

  // Filters - merge with prop filter
  const [filters, setFilters] = useState({
    type: filter.type || '',
    status: filter.status || '',
    priority: filter.priority || ''
  });

  useEffect(() => {
    loadCommunications();
    loadUnreadCount();
  }, []);

  const loadCommunications = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading museum communications...');

      const response = await api.getMuseumCommunications({
        page: 1,
        limit: 50,
        ...filters
      });

      console.log('📨 Communications response:', response);

      if (response.success) {
        setCommunications(response.data || []);
        console.log('✅ Loaded', response.data?.length || 0, 'communications');
      } else {
        console.log('⚠️ No communications data found');
        setCommunications([]);
      }
    } catch (error) {
      console.error('❌ Error loading communications:', error);
      setError('Failed to load communications');
      setCommunications([]);
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const response = await api.getMuseumUnreadCount();
      if (response.success) {
        setUnreadCount(response.count || 0);
      }
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const loadConversation = async (communicationId) => {
    try {
      console.log('💬 Loading conversation for:', communicationId);
      const response = await api.getMuseumCommunicationConversation(communicationId);
      console.log('📋 Conversation response:', response);

      if (response.success) {
        return response.conversation || [];
      }
      return [];
    } catch (error) {
      console.log('❌ Error loading conversation:', error);
      return [];
    }
  };

  const handleSendMessage = async () => {
    try {
      if (!newMessage.subject.trim()) {
        setError('Please enter a subject');
        return;
      }
      if (!newMessage.message.trim()) {
        setError('Please enter a message');
        return;
      }

      // Museum Admin sends to Super Admin
      const communicationData = {
        to: 'super-admin', // This will be handled by backend to find Super Admin
        subject: newMessage.subject.trim(),
        message: newMessage.message.trim(),
        type: newMessage.type,
        priority: newMessage.priority
      };

      console.log('Sending communication data:', communicationData);
      await api.createMuseumCommunication(communicationData);

      setComposeDialog(false);
      setNewMessage({
        type: 'inquiry',
        subject: '',
        message: '',
        priority: 'medium'
      });
      loadCommunications();
      loadUnreadCount();
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
    }
  };

  const handleReply = async () => {
    try {
      if (!replyMessage.message.trim()) {
        setError('Please enter a reply message');
        return;
      }

      await api.replyToMuseumCommunication(selectedCommunication._id, {
        message: replyMessage.message.trim()
      });

      setReplyDialog(false);
      setReplyMessage({ message: '' });
      setSelectedCommunication(null);
      loadCommunications();
      loadUnreadCount();
    } catch (error) {
      console.error('Error sending reply:', error);
      setError('Failed to send reply');
    }
  };

  const handleMarkAsRead = async (communicationId) => {
    try {
      await api.markMuseumCommunicationAsRead(communicationId);
      loadCommunications();
      loadUnreadCount();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleArchive = async (communicationId) => {
    try {
      await api.archiveMuseumCommunication(communicationId);
      loadCommunications();
    } catch (error) {
      console.error('Error archiving communication:', error);
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
      case 'read': return 'success';
      case 'replied': return 'primary';
      case 'resolved': return 'success';
      case 'archived': return 'default';
      default: return 'default';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'feedback': return <MessageIcon />;
      case 'inquiry': return <PersonIcon />;
      case 'announcement': return <BusinessIcon />;
      default: return <MessageIcon />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Communications Center</h1>
          <p className="text-gray-600 mt-1">Communicate with Super Admin and manage messages</p>
        </div>
        <div className="flex justify-center items-center h-64">
          <CircularProgress sx={{ color: '#8B5A3C' }} />
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              Communications Center
              {unreadCount > 0 && (
                <Badge badgeContent={unreadCount} color="error" sx={{ ml: 2 }}>
                  <MessageIcon />
                </Badge>
              )}
            </h1>
            <p className="text-gray-600 mt-1">Communicate with Super Admin and manage messages</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="contained"
              startIcon={<SendIcon />}
              onClick={() => setComposeDialog(true)}
              sx={{
                backgroundColor: '#8B5A3C',
                '&:hover': { backgroundColor: '#6d4429' }
              }}
            >
              New Message
            </Button>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={loadCommunications}
              sx={{
                borderColor: '#8B5A3C',
                color: '#8B5A3C',
                '&:hover': {
                  borderColor: '#6d4429',
                  backgroundColor: 'rgba(139, 90, 60, 0.04)'
                }
              }}
            >
              Refresh
            </Button>
          </div>
        </div>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
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
                  <MenuItem value="response">Response</MenuItem>
                </Select>
              </FormControl>
            </div>
            <div>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                >
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="sent">Sent</MenuItem>
                  <MenuItem value="read">Read</MenuItem>
                  <MenuItem value="replied">Replied</MenuItem>
                  <MenuItem value="resolved">Resolved</MenuItem>
                  <MenuItem value="archived">Archived</MenuItem>
                </Select>
              </FormControl>
            </div>
            <div>
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
            </div>
            <div>
              <Button
                variant="outlined"
                onClick={() => setFilters({ type: '', status: '', priority: '' })}
                fullWidth
                sx={{
                  borderColor: '#8B5A3C',
                  color: '#8B5A3C',
                  '&:hover': {
                    borderColor: '#6d4429',
                    backgroundColor: 'rgba(139, 90, 60, 0.04)'
                  }
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Communications List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 max-h-96 overflow-y-auto">
          <div className="divide-y divide-gray-200">
            {communications.length === 0 ? (
              <div className="p-6 text-center">
                <div className="text-gray-500">
                  <MessageIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No communications found</h3>
                  <p className="text-gray-500">You haven't received any messages yet.</p>
                </div>
              </div>
            ) : (
              communications.map((communication) => (
                <div key={communication._id} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getTypeIcon(communication.type)}
                        <h3 className="text-lg font-medium text-gray-900">
                          {communication.subject}
                        </h3>
                        <Chip
                          label={communication.priority}
                          color={getPriorityColor(communication.priority)}
                          size="small"
                        />
                        <Chip
                          label={communication.status}
                          color={getStatusColor(communication.status)}
                          size="small"
                        />
                      </div>
                      <div className="text-sm text-gray-500 mb-2">
                        <span>From: {communication.from?.name || 'Super Admin'}</span>
                        <span className="mx-2">•</span>
                        <span>{new Date(communication.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {communication.message}
                      </p>
                    </div>
                    <div className="flex gap-1 ml-4">
                      <IconButton
                        onClick={() => {
                          setSelectedCommunication(communication);
                          setReplyDialog(true);
                        }}
                        title="Reply"
                        size="small"
                        sx={{ color: '#8B5A3C' }}
                      >
                        <ReplyIcon />
                      </IconButton>
                      {communication.status !== 'read' && (
                        <IconButton
                          onClick={() => handleMarkAsRead(communication._id)}
                          title="Mark as Read"
                          size="small"
                          sx={{ color: '#8B5A3C' }}
                        >
                          <MarkReadIcon />
                        </IconButton>
                      )}
                      <IconButton
                        onClick={() => handleArchive(communication._id)}
                        title="Archive"
                        size="small"
                        sx={{ color: '#8B5A3C' }}
                      >
                        <ArchiveIcon />
                      </IconButton>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Compose Dialog */}
        <Dialog open={composeDialog} onClose={() => setComposeDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Send Message to Super Admin</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={newMessage.type}
                    onChange={(e) => setNewMessage({ ...newMessage, type: e.target.value })}
                  >
                    <MenuItem value="inquiry">Inquiry</MenuItem>
                    <MenuItem value="feedback">Feedback</MenuItem>
                    <MenuItem value="request">Request</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
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
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Subject"
                  value={newMessage.subject}
                  onChange={(e) => setNewMessage({ ...newMessage, subject: e.target.value })}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Message"
                  multiline
                  rows={4}
                  value={newMessage.message}
                  onChange={(e) => setNewMessage({ ...newMessage, message: e.target.value })}
                  required
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setComposeDialog(false)}>Cancel</Button>
            <Button onClick={handleSendMessage} variant="contained">
              Send Message
            </Button>
          </DialogActions>
        </Dialog>

        {/* Reply Dialog */}
        <Dialog open={replyDialog} onClose={() => setReplyDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Reply to Message</DialogTitle>
          <DialogContent>
            {selectedCommunication && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  {selectedCommunication.subject}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  From: {selectedCommunication.from?.name || 'Super Admin'}
                </Typography>
                <Typography variant="body2" paragraph>
                  {selectedCommunication.message}
                </Typography>
                <Divider sx={{ my: 2 }} />
                <TextField
                  fullWidth
                  label="Your Reply"
                  multiline
                  rows={4}
                  value={replyMessage.message}
                  onChange={(e) => setReplyMessage({ ...replyMessage, message: e.target.value })}
                  required
                />
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setReplyDialog(false)}>Cancel</Button>
            <Button onClick={handleReply} variant="contained">
              Send Reply
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </ErrorBoundary>
  );
};

export default MuseumCommunications;