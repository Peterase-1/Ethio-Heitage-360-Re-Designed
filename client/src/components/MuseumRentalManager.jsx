import React, { useState, useEffect, useContext } from 'react';
import {
  Plus,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Calendar,
  MessageSquare,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  X,
  Clock3,
  Building2,
  Package,
  CreditCard,
  Box,
  Globe,
  ThumbsUp,
  ThumbsDown,
  FileText,
  Users,
  ArrowRight,
  ArrowLeft,
  Send,
  Building,
  Artifact as ArtifactIcon
} from 'lucide-react';
import { AuthContext } from '../contexts/AuthContext';
import api from '../utils/api';

const MuseumRentalManager = () => {
  const { user } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    totalRevenue: 0
  });

  // Form data for creating new requests
  const [formData, setFormData] = useState({
    requestType: 'museum_to_super', // Museum admin can only send requests to super admin
    artifactId: '',
    museumId: '',
    duration: '',
    startDate: '',
    endDate: '',
    rentalFee: '',
    currency: 'ETB',
    description: '',
    specialRequirements: ''
  });

  // Available artifacts (would be fetched from API based on museum)
  const [artifacts, setArtifacts] = useState([]);

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'completed', label: 'Completed' }
  ];

  useEffect(() => {
    fetchRequests();
    fetchMuseumArtifacts();
    fetchStats();
  }, []);

  // Refetch requests when filters change
  useEffect(() => {
    fetchRequests();
  }, [filterStatus, searchTerm]);

  const fetchRequests = async (forceRefresh = false) => {
    try {
      setLoading(true);
      console.log('🔄 Fetching museum rental requests...', forceRefresh ? '(force refresh)' : '');

      if (forceRefresh) {
        setRequests([]);
      }

      // Build query parameters for museum admin - only show their museum's requests
      const queryParams = {
        page: 1,
        limit: 1000,
        requestType: 'museum_to_super' // Museum admin only sees requests they send to super admin
      };

      if (filterStatus && filterStatus !== 'all') {
        queryParams.status = filterStatus;
      }

      if (searchTerm && searchTerm.trim()) {
        queryParams.search = searchTerm.trim();
      }

      console.log('📋 Museum query params:', queryParams);

      const response = await api.getAllRentalRequests(queryParams);

      console.log('📋 Museum API Response:', response);

      // Handle the actual API response format
      if (response && response.success && response.data) {
        const requests = response.data.requests || response.data;
        console.log('📋 Museum rental requests fetched:', requests?.length || 0, 'requests');
        setRequests(requests || []);
      } else if (response && response.requests) {
        setRequests(response.requests);
      } else if (response && Array.isArray(response)) {
        setRequests(response);
      } else {
        console.warn('⚠️ Unexpected response format:', response);
        setRequests([]);
      }
    } catch (error) {
      console.error('❌ Failed to fetch museum rental requests:', error);
      setErrorMessage('Failed to load rental requests');
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchMuseumArtifacts = async () => {
    try {
      // Fetch artifacts for this museum
      const response = await api.getRentalArtifacts();
      console.log('📋 Museum artifacts response:', response);

      let artifacts = [];
      if (response && response.success && response.data) {
        artifacts = response.data;
      } else if (response && Array.isArray(response)) {
        artifacts = response;
      }

      console.log('📋 Museum artifacts:', artifacts);
      setArtifacts(artifacts);
    } catch (error) {
      console.error('Failed to fetch museum artifacts:', error);
      setArtifacts([]);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.getRentalStatistics();
      console.log('📋 Museum rental stats response:', response);

      if (response && response.success && response.data) {
        setStats(response.data);
      } else if (response && response.overview) {
        setStats(response.overview);
      }
    } catch (error) {
      console.error('Failed to fetch rental stats:', error);
    }
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    try {
      console.log('🔄 Creating museum rental request...', formData);
      
      // Set the museum ID from the current user's museum
      const requestData = {
        ...formData,
        museumId: user?.museumId || formData.museumId
      };

      const response = await api.createRentalRequest(requestData);
      console.log('✅ Museum rental request created successfully:', response);

      setShowCreateModal(false);
      setSuccessMessage('Rental request submitted successfully! It will be reviewed by the Super Admin.');
      setShowSuccessModal(true);

      // Refresh the requests list
      console.log('🔄 Refreshing requests list...');
      await fetchRequests(true);
      await fetchStats();
      resetForm();
    } catch (error) {
      console.error('Failed to create rental request:', error);
      setErrorMessage('Failed to submit rental request');
      setShowErrorModal(true);
    }
  };

  const resetForm = () => {
    setFormData({
      requestType: 'museum_to_super',
      artifactId: '',
      museumId: user?.museumId || '',
      duration: '',
      startDate: '',
      endDate: '',
      rentalFee: '',
      currency: 'ETB',
      description: '',
      specialRequirements: ''
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock3 className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredRequests = requests;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Museum Rental Requests</h2>
          <p className="text-gray-600">Submit and manage artifact rental requests to Super Admin</p>
          <p className="text-sm text-gray-500 mt-1">
            Showing {requests.length} request{requests.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Send className="h-4 w-4" />
          <span>Request Rental</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalRequests}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pendingRequests}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-green-600">{stats.approvedRequests}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-purple-600">{stats.totalRevenue} ETB</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => fetchRequests(true)}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center justify-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading requests...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Artifact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="text-gray-500">
                        <Send className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No rental requests yet</h3>
                        <p className="text-gray-500 mb-4">Submit your first rental request to get started.</p>
                        <button
                          onClick={() => setShowCreateModal(true)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          Request Rental
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((request) => (
                    <tr key={request._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{request.requestId}</div>
                          <div className="text-sm text-gray-500">
                            {new Date(request.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <ArtifactIcon className="h-8 w-8 text-gray-400 mr-3" />
                          <div>
                            <div className="text-sm text-gray-900">{request.artifact?.name || 'N/A'}</div>
                            <div className="text-sm text-gray-500">{request.artifact?.category || 'N/A'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                          {getStatusIcon(request.status)}
                          <span className="ml-1">{request.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {request.rentalDetails?.rentalFee} {request.rentalDetails?.currency}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {request.rentalDetails?.duration} days
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(request.rentalDetails?.startDate).toLocaleDateString()} - {new Date(request.rentalDetails?.endDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedRequest(request);
                              setShowDetailModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900 flex items-center"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Request Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Request Artifact Rental</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleCreateRequest} className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <div className="flex items-center">
                    <Building className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-blue-800">Requesting rental from Super Admin</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Artifact *</label>
                    <select
                      value={formData.artifactId}
                      onChange={(e) => setFormData({ ...formData, artifactId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select Artifact</option>
                      {artifacts && Array.isArray(artifacts) && artifacts.map(artifact => (
                        <option key={artifact._id} value={artifact._id}>{artifact.name}</option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Available artifacts from our collection</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration (days) *</label>
                    <input
                      type="number"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                      min="1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                      min={formData.startDate || new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rental Fee *</label>
                    <input
                      type="number"
                      value={formData.rentalFee}
                      onChange={(e) => setFormData({ ...formData, rentalFee: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                    <select
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="ETB">ETB</option>
                      <option value="USD">USD</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Describe the purpose of this rental request..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Special Requirements</label>
                  <textarea
                    value={formData.specialRequirements}
                    onChange={(e) => setFormData({ ...formData, specialRequirements: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Any special requirements or conditions..."
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                  >
                    <Send className="h-4 w-4" />
                    <span>Submit Request</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Request Details</h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Request Information</h4>
                  <div className="space-y-2">
                    <div><span className="font-medium">Request ID:</span> {selectedRequest.requestId}</div>
                    <div><span className="font-medium">Type:</span> <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">Museum → Super Admin</span></div>
                    <div><span className="font-medium">Status:</span>
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getStatusColor(selectedRequest.status)}`}>
                        {selectedRequest.status}
                      </span>
                    </div>
                    <div><span className="font-medium">Created:</span> {new Date(selectedRequest.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Rental Details</h4>
                  <div className="space-y-2">
                    <div><span className="font-medium">Duration:</span> {selectedRequest.rentalDetails?.duration} days</div>
                    <div><span className="font-medium">Start Date:</span> {new Date(selectedRequest.rentalDetails?.startDate).toLocaleDateString()}</div>
                    <div><span className="font-medium">End Date:</span> {new Date(selectedRequest.rentalDetails?.endDate).toLocaleDateString()}</div>
                    <div><span className="font-medium">Fee:</span> {selectedRequest.rentalDetails?.rentalFee} {selectedRequest.rentalDetails?.currency}</div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Artifact</h4>
                  <div className="space-y-2">
                    <div><span className="font-medium">Name:</span> {selectedRequest.artifact?.name}</div>
                    <div><span className="font-medium">Description:</span> {selectedRequest.artifact?.description}</div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Museum</h4>
                  <div className="space-y-2">
                    <div><span className="font-medium">Name:</span> {selectedRequest.museum?.name}</div>
                    <div><span className="font-medium">Location:</span> {selectedRequest.museum?.location?.city || selectedRequest.museum?.location?.address || 'N/A'}</div>
                  </div>
                </div>
              </div>

              {selectedRequest.description && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Description</h4>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedRequest.description}</p>
                </div>
              )}

              {selectedRequest.specialRequirements && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Special Requirements</h4>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedRequest.specialRequirements}</p>
                </div>
              )}

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Success!</h3>
              <p className="text-gray-600 mb-4">{successMessage}</p>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 text-center">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error</h3>
              <p className="text-gray-600 mb-4">{errorMessage}</p>
              <button
                onClick={() => setShowErrorModal(false)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MuseumRentalManager;
