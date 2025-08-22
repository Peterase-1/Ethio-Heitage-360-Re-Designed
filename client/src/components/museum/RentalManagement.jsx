import React, { useState } from 'react';
import MuseumAdminSidebar from '../dashboard/MuseumAdminSidebar';
import { 
  Box, Typography, Container, Grid, Paper, Button, TextField,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import {
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  FileText,
  AlertTriangle
} from 'lucide-react';

const RentalManagement = () => {
  const [rentalRequests, setRentalRequests] = useState([
    {
      id: 1,
      artifact: 'Ancient Ethiopian Vase',
      requester: 'University of Addis Ababa',
      email: 'museum@aau.edu.et',
      requestDate: '2024-08-10',
      startDate: '2024-09-01',
      endDate: '2024-09-30',
      duration: 30,
      purpose: 'Educational Exhibition',
      status: 'pending',
      rentalFee: 5000,
      securityDeposit: 15000,
      insurance: 'Required - $50,000 coverage'
    },
    {
      id: 2,
      artifact: 'Traditional Coffee Set',
      requester: 'Ethiopian Cultural Center',
      email: 'info@ethculture.org',
      requestDate: '2024-08-12',
      startDate: '2024-08-20',
      endDate: '2024-08-25',
      duration: 5,
      purpose: 'Cultural Festival',
      status: 'approved',
      rentalFee: 1500,
      securityDeposit: 5000,
      insurance: 'Provided - Certificate attached'
    }
  ]);

  const [selectedRequest, setSelectedRequest] = useState(null);

  const statusColors = {
    'pending': 'warning',
    'approved': 'success',
    'rejected': 'error',
    'active': 'info',
    'completed': 'default'
  };

  const handleApprove = (id) => {
    setRentalRequests(requests => 
      requests.map(req => req.id === id ? {...req, status: 'approved'} : req)
    );
  };

  const handleReject = (id) => {
    setRentalRequests(requests => 
      requests.map(req => req.id === id ? {...req, status: 'rejected'} : req)
    );
  };


  return (
    <div className="flex min-h-screen bg-gray-50">
      <MuseumAdminSidebar />
      
      <div className="flex-1 overflow-auto">
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" component="h1" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
              <DollarSign className="mr-3" size={32} />
              Rental Management
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Manage artifact rental requests and track rental agreements
            </Typography>
          </Box>

          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 3, textAlign: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                <Typography variant="h4">{rentalRequests.length}</Typography>
                <Typography variant="body2">Total Requests</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 3, textAlign: 'center', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
                <Typography variant="h4">{rentalRequests.filter(r => r.status === 'pending').length}</Typography>
                <Typography variant="body2">Pending</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 3, textAlign: 'center', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
                <Typography variant="h4">{rentalRequests.filter(r => r.status === 'approved').length}</Typography>
                <Typography variant="body2">Approved</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 3, textAlign: 'center', background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white' }}>
                <Typography variant="h4">{rentalRequests.reduce((sum, r) => sum + r.rentalFee, 0).toLocaleString()}</Typography>
                <Typography variant="body2">Revenue (ETB)</Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Rental Requests Table */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Artifact</TableCell>
                  <TableCell>Requester</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Fee</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rentalRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2">{request.artifact}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {request.purpose}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">{request.requester}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {request.email}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">{request.duration} days</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {request.startDate} - {request.endDate}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">{request.rentalFee.toLocaleString()} ETB</Typography>
                        <Typography variant="caption" color="text.secondary">
                          +{request.securityDeposit.toLocaleString()} deposit
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={request.status} 
                        color={statusColors[request.status]} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => setSelectedRequest(request)}>
                        <Eye size={16} />
                      </IconButton>
                      {request.status === 'pending' && (
                        <>
                          <IconButton size="small" color="success" onClick={() => handleApprove(request.id)}>
                            <CheckCircle size={16} />
                          </IconButton>
                          <IconButton size="small" color="error" onClick={() => handleReject(request.id)}>
                            <XCircle size={16} />
                          </IconButton>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Request Detail Dialog */}
          <Dialog open={!!selectedRequest} onClose={() => setSelectedRequest(null)} maxWidth="md" fullWidth>
            {selectedRequest && (
              <>
                <DialogTitle>Rental Request Details</DialogTitle>
                <DialogContent>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" gutterBottom>Artifact Information</Typography>
                      <Typography><strong>Artifact:</strong> {selectedRequest.artifact}</Typography>
                      <Typography><strong>Purpose:</strong> {selectedRequest.purpose}</Typography>
                      <Typography><strong>Duration:</strong> {selectedRequest.duration} days</Typography>
                      <Typography><strong>Dates:</strong> {selectedRequest.startDate} - {selectedRequest.endDate}</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" gutterBottom>Financial Details</Typography>
                      <Typography><strong>Rental Fee:</strong> {selectedRequest.rentalFee.toLocaleString()} ETB</Typography>
                      <Typography><strong>Security Deposit:</strong> {selectedRequest.securityDeposit.toLocaleString()} ETB</Typography>
                      <Typography><strong>Total:</strong> {(selectedRequest.rentalFee + selectedRequest.securityDeposit).toLocaleString()} ETB</Typography>
                      <Typography><strong>Insurance:</strong> {selectedRequest.insurance}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="h6" gutterBottom>Requester Information</Typography>
                      <Typography><strong>Organization:</strong> {selectedRequest.requester}</Typography>
                      <Typography><strong>Email:</strong> {selectedRequest.email}</Typography>
                      <Typography><strong>Request Date:</strong> {selectedRequest.requestDate}</Typography>
                    </Grid>
                  </Grid>
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setSelectedRequest(null)}>Close</Button>
                  {selectedRequest.status === 'pending' && (
                    <>
                      <Button onClick={() => handleReject(selectedRequest.id)} color="error">
                        Reject
                      </Button>
                      <Button onClick={() => handleApprove(selectedRequest.id)} variant="contained">
                        Approve
                      </Button>
                    </>
                  )}
                </DialogActions>
              </>
            )}
          </Dialog>
        </Container>
      </div>
    </div>
  );
};

export default RentalManagement;
