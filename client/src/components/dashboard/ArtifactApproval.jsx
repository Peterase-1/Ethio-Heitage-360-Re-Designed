import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import {
  Box, Button, Card, CardContent, CardMedia, Chip, Dialog, DialogActions,
  DialogContent, DialogTitle, Divider, Grid, IconButton, LinearProgress,
  MenuItem, Paper, Select, Table, TableBody, TableCell, TableContainer,
  TableHead, TablePagination, TableRow, TextField, Typography, useTheme,
  Avatar, FormControl, InputLabel, Snackbar, Alert, Tooltip, CardHeader, List, ListItem, ListItemAvatar, ListItemText, Collapse
} from '@mui/material';
import {
  Search as SearchIcon, FilterList as FilterListIcon, CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon, Delete as DeleteIcon, Edit as EditIcon, Visibility as VisibilityIcon,
  Refresh as RefreshIcon, Image as ImageIcon, Category as CategoryIcon,
  CalendarToday as CalendarIcon, Person as PersonIcon, Museum as MuseumIcon, Close as CloseIcon
} from '@mui/icons-material';

const ArtifactApproval = ({ artifacts, onApprove, onReject, loading = false, setArtifacts, enqueueSnackbar }) => {
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterStatus, setFilterStatus] = useState('pending');
  const [filterFlagged, setFilterFlagged] = useState('all');
  const [selectedArtifacts, setSelectedArtifacts] = useState([]);
  const [bulkAction, setBulkAction] = useState('approve');
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [forceRemoveDialogOpen, setForceRemoveDialogOpen] = useState(false);
  const [forceRemoveReason, setForceRemoveReason] = useState('');
  const [auditLogs, setAuditLogs] = useState([]);
  const [showAuditLogs, setShowAuditLogs] = useState(false);
  const [flagDialogOpen, setFlagDialogOpen] = useState(false);
  const [flagReason, setFlagReason] = useState('');
  const [flagCategory, setFlagCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArtifact, setSelectedArtifact] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [bulkRejectReason, setBulkRejectReason] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  // Handle pagination
  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle artifact actions
  const handleViewArtifact = (artifact) => {
    setSelectedArtifact(artifact);
    setViewDialogOpen(true);
  };

  const handleApprove = async (artifactId) => {
    try {
      await onApprove(artifactId);
      setSnackbar({ open: true, message: 'Artifact approved!', severity: 'success' });
      setViewDialogOpen(false);
    } catch (error) {
      setSnackbar({ open: true, message: 'Approval failed', severity: 'error' });
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      setSnackbar({ open: true, message: 'Please provide a reason', severity: 'warning' });
      return;
    }
    try {
      await onReject(selectedArtifact.id, rejectReason);
      setRejectDialogOpen(false);
      setRejectReason('');
      setViewDialogOpen(false);
      setSnackbar({ open: true, message: 'Artifact rejected', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Rejection failed', severity: 'error' });
    }
  };

  // Filter and paginate artifacts
  const filteredArtifacts = artifacts
    .filter(artifact => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        !searchQuery ||
        artifact.name?.toLowerCase().includes(searchLower) ||
        artifact.description?.toLowerCase().includes(searchLower) ||
        artifact.submittedBy?.toLowerCase().includes(searchLower) ||
        (artifact.tags || []).some(tag => 
          tag.toLowerCase().includes(searchLower)
        );
      
      const matchesStatus = 
        filterStatus === 'all' || 
        artifact.status === filterStatus ||
        (filterStatus === 'flagged' && artifact.flagged);
      
      const matchesFlagFilter = 
        filterFlagged === 'all' ||
        (filterFlagged === 'flagged' ? artifact.flagged : !artifact.flagged);
      
      return matchesSearch && matchesStatus && matchesFlagFilter;
    })
    .sort((a, b) => {
      // Sort flagged items to the top, then by creation date
      if (a.flagged !== b.flagged) {
        return a.flagged ? -1 : 1;
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  const paginatedArtifacts = filteredArtifacts.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Status and filter options
  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'flagged', label: 'Flagged for Review' },
  ];

  const flagFilterOptions = [
    { value: 'all', label: 'All' },
    { value: 'flagged', label: 'Flagged' },
    { value: 'not_flagged', label: 'Not Flagged' },
  ];

  const flagCategories = [
    { value: 'inappropriate', label: 'Inappropriate Content' },
    { value: 'copyright', label: 'Copyright Violation' },
    { value: 'inaccurate', label: 'Inaccurate Information' },
    { value: 'duplicate', label: 'Duplicate' },
    { value: 'other', label: 'Other' },
  ];

  // Get color for status badge
  const getStatusColor = (status) => {
    const statusColors = {
      approved: 'success',
      rejected: 'error',
      pending: 'warning',
      flagged: 'secondary',
    };
    return statusColors[status] || 'default';
  };

  // Handle flag artifact
  const handleFlagArtifact = async (artifactId, reason, category) => {
    try {
      // In a real app, you would call your API here
      console.log(`Flagging artifact ${artifactId} with reason: ${reason}, category: ${category}`);
      
      // Update local state
      setArtifacts(artifacts.map(art => 
        art.id === artifactId 
          ? { 
              ...art, 
              flagged: true,
              flagReason: reason,
              flagCategory: category,
              flagDate: new Date().toISOString()
            } 
          : art
      ));
      
      // Add to audit log
      const artifact = artifacts.find(a => a.id === artifactId);
      addToAuditLog({
        action: 'ARTIFACT_FLAGGED',
        targetId: artifactId,
        targetType: 'artifact',
        targetName: artifact?.name || `Artifact ${artifactId}`,
        details: { reason, category },
        timestamp: new Date().toISOString()
      });
      
      setFlagDialogOpen(false);
      setFlagReason('');
      setFlagCategory('');
      
      enqueueSnackbar('Artifact flagged for review', { variant: 'warning' });
    } catch (error) {
      console.error('Error flagging artifact:', error);
      enqueueSnackbar('Failed to flag artifact', { variant: 'error' });
    }
  };

  // Handle bulk actions
  const handleBulkAction = async () => {
    try {
      if (!bulkAction || selectedArtifacts.length === 0) return;
      
      // In a real app, you would call your API here
      console.log(`Performing ${bulkAction} on artifacts:`, selectedArtifacts);
      
      // Update local state based on bulk action
      const updatedArtifacts = artifacts.map(art => {
        if (selectedArtifacts.includes(art.id)) {
          switch (bulkAction) {
            case 'approve':
              return { ...art, status: 'approved', flagged: false };
            case 'reject':
              return { 
                ...art, 
                status: 'rejected',
                rejectedReason: bulkRejectReason || 'No reason provided'
              };
            case 'flag':
              return { 
                ...art, 
                flagged: true,
                flagReason: 'Bulk flagged by moderator',
                flagCategory: 'other',
                flagDate: new Date().toISOString()
              };
            default:
              return art;
          }
        }
        return art;
      });
      
      setArtifacts(updatedArtifacts);
      
      // Add to audit log
      selectedArtifacts.forEach(artifactId => {
        const artifact = artifacts.find(a => a.id === artifactId);
        if (artifact) {
          addToAuditLog({
            action: `ARTIFACT_${bulkAction.toUpperCase()}`,
            targetId: artifactId,
            targetType: 'artifact',
            targetName: artifact?.name || `Artifact ${artifactId}`,
            details: bulkAction === 'reject' ? { reason: bulkRejectReason } : {},
            timestamp: new Date().toISOString()
          });
        }
      });
      
      // Reset state
      setSelectedArtifacts([]);
      setBulkDialogOpen(false);
      setBulkAction('');
      setBulkRejectReason('');
      
      enqueueSnackbar(`Successfully ${bulkAction}ed ${selectedArtifacts.length} artifacts`, { 
        variant: 'success' 
      });
    } catch (error) {
      console.error(`Error performing bulk ${bulkAction}:`, error);
      enqueueSnackbar(`Failed to ${bulkAction} artifacts`, { variant: 'error' });
    }
  };
  
  // Add to audit log
  const addToAuditLog = (entry) => {
    setAuditLogs(prev => [entry, ...prev].slice(0, 100)); // Keep last 100 entries
  };

  // Render flag dialog
  const renderFlagDialog = () => (
    <Dialog 
      open={flagDialogOpen} 
      onClose={() => setFlagDialogOpen(false)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        {selectedArtifact?.flagged ? 'Flag Details' : 'Flag Artifact for Review'}
      </DialogTitle>
      <DialogContent>
        {selectedArtifact?.flagged ? (
          <Box>
            <Typography variant="body1" gutterBottom>
              This artifact has been flagged for the following reason:
            </Typography>
            <Box sx={{ 
              bgcolor: 'background.paper', 
              p: 2, 
              borderRadius: 1,
              mb: 2
            }}>
              <Typography variant="subtitle2" color="text.secondary">
                Category:
              </Typography>
              <Typography variant="body1" gutterBottom>
                {flagCategories.find(c => c.value === selectedArtifact.flagCategory)?.label || 'Other'}
              </Typography>
              
              <Typography variant="subtitle2" color="text.secondary">
                Reason:
              </Typography>
              <Typography variant="body1">
                {selectedArtifact.flagReason || 'No reason provided'}
              </Typography>
              
              <Typography variant="caption" color="text.secondary" display="block" mt={2}>
                Flagged on: {new Date(selectedArtifact.flagDate).toLocaleString()}
              </Typography>
            </Box>
          </Box>
        ) : (
          <Box>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={flagCategory}
                onChange={(e) => setFlagCategory(e.target.value)}
                label="Category"
              >
                {flagCategories.map((category) => (
                  <MenuItem key={category.value} value={category.value}>
                    {category.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Reason for flagging"
              value={flagReason}
              onChange={(e) => setFlagReason(e.target.value)}
              placeholder="Please provide details about why this artifact should be reviewed..."
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => {
          setFlagDialogOpen(false);
          setFlagReason('');
          setFlagCategory('');
        }}>
          {selectedArtifact?.flagged ? 'Close' : 'Cancel'}
        </Button>
        {!selectedArtifact?.flagged && (
          <Button 
            variant="contained" 
            color="warning"
            onClick={() => {
              if (selectedArtifact && flagCategory) {
                handleFlagArtifact(
                  selectedArtifact.id, 
                  flagReason || 'No reason provided',
                  flagCategory
                );
              }
            }}
            disabled={!flagCategory}
          >
            Flag for Review
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );

  // Render bulk action dialog
  const renderBulkActionDialog = () => (
    <Dialog 
      open={bulkDialogOpen} 
      onClose={() => {
        setBulkDialogOpen(false);
        setBulkRejectReason('');
      }}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        {bulkAction === 'approve' && 'Approve Selected Artifacts'}
        {bulkAction === 'reject' && 'Reject Selected Artifacts'}
        {bulkAction === 'flag' && 'Flag Selected Artifacts'}
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" gutterBottom>
          You are about to {bulkAction} <strong>{selectedArtifacts.length}</strong> artifact{selectedArtifacts.length !== 1 ? 's' : ''}.
        </Typography>
        
        {bulkAction === 'reject' && (
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Reason for rejection"
            value={bulkRejectReason}
            onChange={(e) => setBulkRejectReason(e.target.value)}
            placeholder="Please provide a reason for rejecting these artifacts..."
            sx={{ mt: 2 }}
          />
        )}
        
        {bulkAction === 'flag' && (
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={flagCategory}
              onChange={(e) => setFlagCategory(e.target.value)}
              label="Category"
            >
              {flagCategories.map((category) => (
                <MenuItem key={category.value} value={category.value}>
                  {category.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={() => {
            setBulkDialogOpen(false);
            setBulkRejectReason('');
          }}
        >
          Cancel
        </Button>
        <Button 
          variant="contained" 
          color={
            bulkAction === 'approve' ? 'success' : 
            bulkAction === 'reject' ? 'error' : 'warning'
          }
          onClick={handleBulkAction}
          disabled={
            (bulkAction === 'reject' && !bulkRejectReason.trim()) ||
            (bulkAction === 'flag' && !flagCategory)
          }
        >
          {bulkAction === 'approve' && 'Approve All'}
          {bulkAction === 'reject' && 'Reject All'}
          {bulkAction === 'flag' && 'Flag All'}
        </Button>
      </DialogActions>
    </Dialog>
  );

  // Render audit logs section
  const renderAuditLogs = () => (
    <Collapse in={showAuditLogs}>
      <Box sx={{ mt: 3 }}>
        <Card variant="outlined">
          <CardHeader 
            title="Audit Logs" 
            titleTypographyProps={{ variant: 'h6' }}
            action={
              <IconButton onClick={() => setShowAuditLogs(false)}>
                <CloseIcon />
              </IconButton>
            }
          />
          <Divider />
          <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
            {auditLogs.length > 0 ? (
              <List>
                {auditLogs.map((log, index) => (
                  <React.Fragment key={index}>
                    <ListItem 
                      alignItems="flex-start"
                      secondaryAction={
                        <Typography variant="caption" color="text.secondary">
                          {new Date(log.timestamp).toLocaleString()}
                        </Typography>
                      }
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                          {log.action.charAt(0)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle1" component="span">
                            {log.action}: {log.targetName}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="body2" color="text.secondary">
                            {log.details?.reason || 'No additional details'}
                          </Typography>
                        }
                      />
                    </ListItem>
                    {index < auditLogs.length - 1 && <Divider variant="inset" component="li" />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                No audit logs available.
              </Typography>
            )}
          </Box>
        </Card>
      </Box>
    </Collapse>
  );

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" component="h2" fontWeight="bold">
          Artifact Approval Queue
        </Typography>
        <Box>
          <Tooltip title="Refresh Data">
            <IconButton onClick={() => onRefresh && onRefresh()} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="View Audit Logs">
            <IconButton onClick={() => setShowAuditLogs(!showAuditLogs)}>
              <VisibilityIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {renderAuditLogs()}

      <Divider sx={{ my: 2 }} />

      <Box display="flex" gap={2} mb={2} flexWrap="wrap">
        <TextField
          label="Search Artifacts"
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1 }} />,
          }}
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={filterStatus}
            label="Status"
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            {statusOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Flagged</InputLabel>
          <Select
            value={filterFlagged}
            label="Flagged"
            onChange={(e) => setFilterFlagged(e.target.value)}
          >
            {flagFilterOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {loading ? (
        <LinearProgress sx={{ my: 2 }} />
      ) : filteredArtifacts.length === 0 ? (
        <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
          No artifacts found matching your criteria.
        </Typography>
      ) : (
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  {/* Checkbox for bulk selection */}
                </TableCell>
                <TableCell>Image</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Submitted By</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Flagged</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedArtifacts.map((artifact) => (
                <TableRow key={artifact.id}>
                  <TableCell padding="checkbox">
                    {/* Checkbox for individual selection */}
                  </TableCell>
                  <TableCell>
                    <CardMedia
                      component="img"
                      sx={{ width: 60, height: 60, borderRadius: 1, objectFit: 'cover' }}
                      image={artifact.imageUrl || 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=60&h=60&fit=crop&crop=center'}
                      alt={artifact.name}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2">{artifact.name}</Typography>
                    <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 200 }}>
                      {artifact.description}
                    </Typography>
                  </TableCell>
                  <TableCell>{artifact.submittedBy}</TableCell>
                  <TableCell>
                    <Chip
                      label={artifact.status}
                      color={getStatusColor(artifact.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {artifact.flagged ? (
                      <Tooltip title={`Reason: ${artifact.flagReason || 'N/A'}\nCategory: ${flagCategories.find(c => c.value === artifact.flagCategory)?.label || 'N/A'}`}>
                        <Chip label="Yes" color="warning" size="small" icon={<InfoOutlined fontSize="small" />} />
                      </Tooltip>
                    ) : (
                      <Chip label="No" color="success" size="small" />
                    )}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title="View Details">
                        <IconButton size="small" onClick={() => handleViewArtifact(artifact)}>
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {artifact.status === 'pending' && (
                        <>
                          <Tooltip title="Approve">
                            <IconButton size="small" color="success" onClick={() => handleApprove(artifact.id)}>
                              <CheckCircleIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reject">
                            <IconButton size="small" color="error" onClick={() => {
                              setSelectedArtifact(artifact);
                              setRejectDialogOpen(true);
                            }}>
                              <CancelIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                      {!artifact.flagged && (
                        <Tooltip title="Flag for Review">
                          <IconButton size="small" color="warning" onClick={() => {
                            setSelectedArtifact(artifact);
                            setFlagDialogOpen(true);
                          }}>
                            <FilterListIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {artifact.flagged && (
                        <Tooltip title="View Flag Details">
                          <IconButton size="small" onClick={() => {
                            setSelectedArtifact(artifact);
                            setFlagDialogOpen(true);
                          }}>
                            <InfoOutlined fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredArtifacts.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>
      )}

      {/* View Artifact Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{selectedArtifact?.name}</DialogTitle>
        <DialogContent dividers>
          {selectedArtifact && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <CardMedia
                  component="img"
                  image={selectedArtifact.imageUrl || 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=400&h=300&fit=crop&crop=center'}
                  alt={selectedArtifact.name}
                  sx={{ width: '100%', height: 'auto', borderRadius: 1 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Details</Typography>
                <Typography variant="body1"><strong>Description:</strong> {selectedArtifact.description}</Typography>
                <Typography variant="body1"><strong>Submitted By:</strong> {selectedArtifact.submittedBy}</Typography>
                <Typography variant="body1"><strong>Status:</strong> <Chip label={selectedArtifact.status} color={getStatusColor(selectedArtifact.status)} size="small" /></Typography>
                {selectedArtifact.flagged && (
                  <Typography variant="body1"><strong>Flagged:</strong> Yes (Reason: {selectedArtifact.flagReason || 'N/A'})</Typography>
                )}
                <Typography variant="body1"><strong>Date Submitted:</strong> {new Date(selectedArtifact.createdAt).toLocaleDateString()}</Typography>
                <Typography variant="body1"><strong>Tags:</strong> {selectedArtifact.tags?.join(', ') || 'N/A'}</Typography>
                {/* Add more details as needed */}
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          {selectedArtifact?.status === 'pending' && (
            <Button onClick={() => handleApprove(selectedArtifact.id)} color="success" variant="contained">
              Approve
            </Button>
          )}
          {selectedArtifact?.status === 'pending' && (
            <Button onClick={() => setRejectDialogOpen(true)} color="error" variant="contained">
              Reject
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Reject Artifact Dialog */}
      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reject Artifact: {selectedArtifact?.name}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Reason for Rejection"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            helperText="Please provide a clear reason for rejecting this artifact."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleReject} color="error" variant="contained">
            Reject
          </Button>
        </DialogActions>
      </Dialog>

      {renderFlagDialog()}
      {renderBulkActionDialog()}

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default ArtifactApproval;

