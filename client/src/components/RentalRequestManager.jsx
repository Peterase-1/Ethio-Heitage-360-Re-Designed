import React, { useState, useEffect } from 'react';
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
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import api from '../utils/api';

const RentalRequestManager = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'cards'

  // Form data for creating new requests
  const [formData, setFormData] = useState({
    requestType: 'super_to_museum',
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

  // Approval form data
  const [approvalData, setApprovalData] = useState({
    status: 'approved',
    comments: ''
  });

  // Available artifacts and museums (would be fetched from API)
  const [artifacts, setArtifacts] = useState([]);
  const [museums, setMuseums] = useState([]);

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'completed', label: 'Completed' }
  ];

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'outgoing', label: 'Sent (Super → Museum)' },
    { value: 'incoming', label: 'Received (Museum → Super)' }
  ];

  useEffect(() => {
    fetchRequests();
    fetchArtifacts();
    fetchMuseums();
  }, []);

  // Debug museums loading
  useEffect(() => {
    console.log('🏛️ Museums state updated:', {
      museumsCount: museums.length,
      museums: museums.map(m => ({ id: m._id, name: m.name }))
    });
  }, [museums]);

  // Refetch requests when filters change
  useEffect(() => {
    fetchRequests();
  }, [filterStatus, filterType, searchTerm]);

  const fetchRequests = async (forceRefresh = false) => {
    try {
      setLoading(true);
      console.log('🔄 Fetching rental requests...', forceRefresh ? '(force refresh)' : '');

      // Clear existing requests if force refresh
      if (forceRefresh) {
        setRequests([]);
      }

      // Build query parameters, only including non-empty values
      const queryParams = {
        page: 1,
        limit: 1000 // Increased limit to show all requests
      };

      if (filterStatus && filterStatus !== 'all') {
        queryParams.status = filterStatus;
      }

      if (filterType && filterType !== 'all') {
        if (filterType === 'outgoing') {
          queryParams.requestType = 'super_to_museum';
        } else if (filterType === 'incoming') {
          queryParams.requestType = 'museum_to_super';
        }
      }

      if (searchTerm && searchTerm.trim()) {
        queryParams.search = searchTerm.trim();
      }

      console.log('📋 Query params:', queryParams);

      const response = await api.getAllRentalRequests(queryParams);

      console.log('📋 API Response:', response);

      // Handle the actual API response format: {success: true, data: {requests: [...]}}
      if (response && response.success && response.data) {
        console.log('📋 Data object:', response.data);
        const requests = response.data.requests || response.data;
        console.log('📋 Rental requests fetched:', requests?.length || 0, 'requests');
        console.log('📋 First request sample:', requests[0]);
        setRequests(requests || []);
      } else if (response && response.requests) {
        console.log('📋 Rental requests fetched (direct):', response.requests?.length || 0, 'requests');
        setRequests(response.requests);
      } else if (response && Array.isArray(response)) {
        console.log('📋 Rental requests fetched (array):', response.length, 'requests');
        setRequests(response);
      } else {
        console.warn('⚠️ Unexpected response format:', response);
        setRequests([]);
      }
    } catch (error) {
      console.error('❌ Failed to fetch rental requests:', error);
      setErrorMessage('Failed to load rental requests');
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchArtifacts = async () => {
    try {
      const response = await api.getArtifacts({ page: 1, limit: 100 });
      console.log('📋 Artifacts response:', response);

      // Handle the actual API response format: {success: true, data: {artifacts: [...]}}
      let artifacts = [];
      if (response && response.success && response.data && response.data.artifacts) {
        artifacts = response.data.artifacts;
        console.log('📋 Artifacts fetched (success format):', artifacts.length);
      } else if (response && response.artifacts) {
        artifacts = response.artifacts;
        console.log('📋 Artifacts fetched (direct):', artifacts.length);
      } else if (response && Array.isArray(response)) {
        artifacts = response;
        console.log('📋 Artifacts fetched (array):', artifacts.length);
      } else if (response && response.data && Array.isArray(response.data)) {
        artifacts = response.data;
        console.log('📋 Artifacts fetched (data array):', artifacts.length);
      } else {
        console.log('📋 Unexpected artifacts response format:', response);
        artifacts = [];
      }

      console.log('📋 Final artifacts array:', artifacts);
      setArtifacts(artifacts);
    } catch (error) {
      console.error('Failed to fetch artifacts:', error);
      setArtifacts([]); // Set empty array on error
    }
  };

  const fetchMuseums = async () => {
    try {
      const response = await api.getMuseums();
      console.log('📋 Museums response:', response);

      // Handle the actual API response format: {success: true, data: {museums: [...]}}
      let museums = [];
      if (response && response.success && response.data && response.data.museums) {
        museums = response.data.museums;
        console.log('📋 Museums fetched (success format):', museums.length);
      } else if (response && response.museums) {
        museums = response.museums;
        console.log('📋 Museums fetched (direct):', museums.length);
      } else if (response && Array.isArray(response)) {
        museums = response;
        console.log('📋 Museums fetched (array):', museums.length);
      } else if (response && response.data && Array.isArray(response.data)) {
        museums = response.data;
        console.log('📋 Museums fetched (data array):', museums.length);
      } else {
        console.log('📋 Unexpected museums response format:', response);
        museums = [];
      }

      console.log('📋 Final museums array:', museums);
      setMuseums(museums);
    } catch (error) {
      console.error('Failed to fetch museums:', error);
      setMuseums([]); // Set empty array on error
    }
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    try {
      console.log('🔄 Creating rental request...', formData);
      const submissionData = {
        ...formData,
        requestType: 'super_to_museum' // Super admin always sends super_to_museum from here
      };

      const response = await api.createRentalRequest(submissionData);
      console.log('✅ Rental request created successfully:', response);

      setShowCreateModal(false);
      setSuccessMessage('Rental request created successfully!');
      setShowSuccessModal(true);

      // Refresh the requests list
      console.log('🔄 Refreshing requests list...');
      await fetchRequests(true);
      resetForm();
    } catch (error) {
      console.error('Failed to create rental request:', error);
      setErrorMessage('Failed to create rental request');
      setShowErrorModal(true);
    }
  };

  const handleApproveRequest = async (e) => {
    e.preventDefault();
    try {
      console.log('🔄 Approving request:', selectedRequest._id, approvalData);
      const response = await api.updateRentalRequestStatus(selectedRequest._id, approvalData);
      console.log('✅ Approval response:', response);

      setShowApprovalModal(false);
      setSuccessMessage(`Request ${approvalData.status} successfully!`);
      setShowSuccessModal(true);

      // Force refresh the requests list
      console.log('🔄 Refreshing requests after approval...');
      await fetchRequests(true);

      setSelectedRequest(null);
      setApprovalData({ status: 'approved', comments: '' });
    } catch (error) {
      console.error('Failed to update request status:', error);
      setErrorMessage('Failed to update request status');
      setShowErrorModal(true);
    }
  };

  const resetForm = () => {
    setFormData({
      requestType: 'super_to_museum',
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
  };

  // Helper function to determine if current user can approve a request
  const canApproveRequest = (request) => {
    // Super admin can approve museum_to_super requests
    if (user?.role === 'superAdmin' && request.requestType === 'museum_to_super' && request.status === 'pending') {
      return true;
    }
    // Museum admin can approve super_to_museum requests (if needed)
    if (user?.role === 'museumAdmin' && request.requestType === 'super_to_museum' && request.status === 'pending') {
      return true;
    }
    return false;
  };

  // Helper function to get request direction label
  const getRequestDirectionLabel = (requestType) => {
    switch (requestType) {
      case 'museum_to_super':
        return { label: 'Museum → Super Admin', icon: <ArrowRight className="h-4 w-4" />, color: 'bg-blue-100 text-blue-800' };
      case 'super_to_museum':
        return { label: 'Super Admin → Museum', icon: <ArrowLeft className="h-4 w-4" />, color: 'bg-purple-100 text-purple-800' };
      default:
        return { label: 'Unknown', icon: null, color: 'bg-gray-100 text-gray-800' };
    }
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

  // Use requests directly since filtering is done on the backend
  const filteredRequests = requests;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Rental Requests</h2>
          <p className="text-gray-600">Manage artifact rental requests between museums and virtual museum</p>
          <p className="text-sm text-gray-500 mt-1">
            Showing {requests.length} request{requests.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>New Request</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {typeOptions.map(option => (
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Museum</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <div className="text-gray-500">
                        <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No rental requests found</h3>
                        <p className="text-gray-500">Create your first rental request to get started.</p>
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
                        <div className="text-sm text-gray-900">{request.artifact?.name}</div>
                        <div className="text-sm text-gray-500">{request.artifact?.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{request.museum?.name}</div>
                        <div className="text-sm text-gray-500">
                          {request.museum?.location?.city || request.museum?.location?.address || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${request.requestType === 'museum_to_super'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800'
                          }`}>
                          {request.requestType === 'museum_to_super' ? 'Museum → Super' : 'Super → Museum'}
                        </span>
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
                        <div className="text-sm text-gray-500">
                          {request.rentalDetails?.duration} days
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {/* See More Button - Always visible */}
                          <button
                            onClick={() => {
                              setSelectedRequest(request);
                              setShowDetailModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900 flex items-center"
                            title="See More Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          {/* Approval Button - Only visible when user can approve */}
                          {canApproveRequest(request) && (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setApprovalData({ ...approvalData, status: 'approved' });
                                  setShowApprovalModal(true);
                                }}
                                className="text-green-600 hover:text-green-900 flex items-center"
                                title="Approve Request"
                              >
                                <ThumbsUp className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setApprovalData({ ...approvalData, status: 'rejected' });
                                  setShowApprovalModal(true);
                                }}
                                className="text-red-600 hover:text-red-900 flex items-center"
                                title="Reject Request"
                              >
                                <ThumbsDown className="h-4 w-4" />
                              </button>
                            </>
                          )}
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
                <h3 className="text-lg font-medium text-gray-900">Create Rental Request</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleCreateRequest} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Direction</label>
                    <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600 font-medium">
                      Outgoing (Super Admin → Museum)
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Artifact *</label>
                    <select
                      value={formData.artifactId}
                      onChange={(e) => {
                        const artifactId = e.target.value;
                        const artifact = artifacts.find(a => a._id === artifactId);
                        setFormData({
                          ...formData,
                          artifactId: artifactId,
                          museumId: artifact?.museum?._id || artifact?.museum || ''
                        });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Choose an artifact...</option>
                      {artifacts && Array.isArray(artifacts) && artifacts.map(artifact => (
                        <option key={artifact._id} value={artifact._id}>
                          {artifact.name} ({artifact.museum?.name || 'Local Collection'})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Museum *</label>
                    <select
                      value={formData.museumId}
                      onChange={(e) => setFormData({ ...formData, museumId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select Museum</option>
                      {museums && Array.isArray(museums) && museums.map(museum => (
                        <option key={museum._id} value={museum._id}>{museum.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration (days) *</label>
                    <input
                      type="number"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
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
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Create Request
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
                    <div><span className="font-medium">Type:</span> {selectedRequest.requestType}</div>
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
                  <p className="text-gray-700">{selectedRequest.description}</p>
                </div>
              )}

              {selectedRequest.specialRequirements && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Special Requirements</h4>
                  <p className="text-gray-700">{selectedRequest.specialRequirements}</p>
                </div>
              )}

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Close
                </button>
                {canApproveRequest(selectedRequest) && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setApprovalData({ ...approvalData, status: 'approved' });
                        setShowDetailModal(false);
                        setShowApprovalModal(true);
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
                    >
                      <ThumbsUp className="h-4 w-4" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => {
                        setApprovalData({ ...approvalData, status: 'rejected' });
                        setShowDetailModal(false);
                        setShowApprovalModal(true);
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2"
                    >
                      <ThumbsDown className="h-4 w-4" />
                      <span>Reject</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approval Modal */}
      {showApprovalModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Review Request</h3>
                <button
                  onClick={() => setShowApprovalModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleApproveRequest} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Decision *</label>
                  <select
                    value={approvalData.status}
                    onChange={(e) => setApprovalData({ ...approvalData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="approved">Approve</option>
                    <option value="rejected">Reject</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Comments</label>
                  <textarea
                    value={approvalData.comments}
                    onChange={(e) => setApprovalData({ ...approvalData, comments: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Add any comments or conditions..."
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowApprovalModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`px-4 py-2 rounded-lg ${approvalData.status === 'approved'
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                      }`}
                  >
                    {approvalData.status === 'approved' ? 'Approve' : 'Reject'} Request
                  </button>
                </div>
              </form>
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

export default RentalRequestManager;
