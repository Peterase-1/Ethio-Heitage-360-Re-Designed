import api from '../utils/api';

/**
 * Rental Service - Handles all rental-related API calls
 * Supports bidirectional rental system for virtual museum
 */

/**
 * Get all rentals with filtering
 */
export const getAllRentals = async (params = {}) => {
  try {
    // Add cache-busting parameter to prevent 304 responses
    const cacheBuster = { t: Date.now() };
    const allParams = { ...params, ...cacheBuster };
    const response = await api.get('/rentals', { params: allParams });

    // Handle both success and error responses
    if (response.data) {
      // If response.data has success property, it's wrapped
      if (response.data.success && response.data.data) {
        return response.data.data || [];
      }
      // If response.data is directly an array, return it
      else if (Array.isArray(response.data)) {
        return response.data;
      }
      // If response.data is an object with rentals, extract them
      else if (response.data.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
    }
    return []; // Return empty array if no data
  } catch (error) {
    console.error('Get all rentals error:', error);
    throw error;
  }
};

/**
 * Get rental by ID
 */
export const getRentalById = async (rentalId) => {
  try {
    const response = await api.get(`/rentals/${rentalId}`);
    return response.data;
  } catch (error) {
    console.error('Get rental by ID error:', error);
    throw error;
  }
};

/**
 * Create rental request from Museum to Super Admin
 */
export const createMuseumToSuperAdminRequest = async (rentalData) => {
  try {
    const response = await api.post('/rentals/museum-to-superadmin', rentalData);
    return response.data;
  } catch (error) {
    console.error('Create museum to super admin request error:', error);
    throw error;
  }
};

/**
 * Create rental request from Super Admin to Museum
 */
export const createSuperAdminToMuseumRequest = async (rentalData) => {
  try {
    const response = await api.post('/rentals/superadmin-to-museum', rentalData);
    return response.data;
  } catch (error) {
    console.error('Create super admin to museum request error:', error);
    throw error;
  }
};

/**
 * Update rental request
 */
export const updateRental = async (rentalId, rentalData) => {
  try {
    const response = await api.put(`/rentals/${rentalId}`, rentalData);
    return response.data;
  } catch (error) {
    console.error('Update rental error:', error);
    throw error;
  }
};

/**
 * Delete rental request
 */
export const deleteRental = async (rentalId) => {
  try {
    const response = await api.delete(`/rentals/${rentalId}`);
    return response.data;
  } catch (error) {
    console.error('Delete rental error:', error);
    throw error;
  }
};

/**
 * Approve rental request
 */
export const approveRental = async (rentalId, approvalData = {}) => {
  try {
    const response = await api.put(`/rentals/${rentalId}/approve`, approvalData);
    return response.data;
  } catch (error) {
    console.error('Approve rental error:', error);
    throw error;
  }
};

/**
 * Reject rental request
 */
export const rejectRental = async (rentalId, rejectionData = {}) => {
  try {
    const response = await api.put(`/rentals/${rentalId}/reject`, rejectionData);
    return response.data;
  } catch (error) {
    console.error('Reject rental error:', error);
    throw error;
  }
};

/**
 * Upload 3D model (Super Admin only)
 */
export const uploadModel = async (rentalId, modelData) => {
  try {
    const response = await api.post(`/rentals/${rentalId}/upload-model`, modelData);
    return response.data;
  } catch (error) {
    console.error('Upload model error:', error);
    throw error;
  }
};

/**
 * Approve 3D model (Museum Admin)
 */
export const approveModel = async (rentalId, approvalData = {}) => {
  try {
    const response = await api.put(`/rentals/${rentalId}/approve-model`, approvalData);
    return response.data;
  } catch (error) {
    console.error('Approve model error:', error);
    throw error;
  }
};

/**
 * Get virtual museum ready artifacts
 */
export const getVirtualMuseumReady = async (params = {}) => {
  try {
    const response = await api.get('/rentals/virtual-museum-ready', { params });
    return response.data;
  } catch (error) {
    console.error('Get virtual museum ready error:', error);
    throw error;
  }
};

/**
 * Get artifacts for museum (for dropdown)
 */
export const getMuseumArtifacts = async (museumId = null) => {
  try {
    const url = museumId ? `/rentals/artifacts/${museumId}` : '/rentals/artifacts';
    // Add cache-busting parameter
    const cacheBuster = `?t=${Date.now()}`;
    const response = await api.get(url + cacheBuster);

    // Return the artifacts data
    return response.data || [];
  } catch (error) {
    console.error('Get museum artifacts error:', error);
    throw error;
  }
};

/**
 * Get rental statistics
 */
export const getRentalStats = async (params = {}) => {
  try {
    const response = await api.get('/rentals/stats', { params });
    // Handle both success and error responses
    if (response.data && response.data.success) {
      return response.data.data || {}; // Return the actual stats object
    } else {
      return { totalRequests: 0, pendingRequests: 0, approvedRequests: 0, totalRevenue: 0 }; // Return default stats
    }
  } catch (error) {
    console.error('Get rental stats error:', error);
    // Return default stats on error instead of throwing
    return { totalRequests: 0, pendingRequests: 0, approvedRequests: 0, totalRevenue: 0 };
  }
};

/**
 * Get museum-specific rental statistics
 */
export const getMuseumRentalStats = async () => {
  try {
    console.log('=== FRONTEND MUSEUM STATS DEBUG ===');
    console.log('Calling /rentals/museum-stats...');

    const response = await api.get('/rentals/museum-stats');

    console.log('Raw response:', response);
    console.log('Response data:', response.data);

    // Handle both success and error responses
    if (response.data && response.data.success) {
      console.log('Success response, returning data:', response.data.data);
      return response.data.data || {}; // Return the actual stats object
    } else {
      console.log('No success flag, returning default stats');
      return { totalRequests: 0, pendingRequests: 0, approvedRequests: 0, totalRevenue: 0 }; // Return default stats
    }
  } catch (error) {
    console.error('Get museum rental stats error:', error);
    console.error('Error details:', error.response?.data);
    // Return default stats on error instead of throwing
    return { totalRequests: 0, pendingRequests: 0, approvedRequests: 0, totalRevenue: 0 };
  }
};

/**
 * Get overdue rentals
 */
export const getOverdueRentals = async (params = {}) => {
  try {
    const response = await api.get('/rentals/overdue', { params });
    return response.data;
  } catch (error) {
    console.error('Get overdue rentals error:', error);
    throw error;
  }
};

/**
 * Format rental data for display
 */
export const formatRentalForDisplay = (rental) => {
  if (!rental || !rental._id) return null;

  return {
    id: rental._id,
    requestId: rental.requestId,
    artifact: rental.artifact?.name || 'Unknown Artifact',
    museum: rental.museum?.name || 'Unknown Museum',
    renter: rental.renterInfo?.name || 'Unknown Renter',
    organization: rental.renterInfo?.organization || 'Unknown Organization',
    rentalDirection: rental.rentalDirection,
    isForVirtualMuseum: rental.isForVirtualMuseum,
    purpose: rental.purpose,
    status: rental.status,
    requestDate: new Date(rental.requestDate).toLocaleDateString(),
    startDate: new Date(rental.requestedDuration?.startDate).toLocaleDateString(),
    endDate: new Date(rental.requestedDuration?.endDate).toLocaleDateString(),
    duration: rental.requestedDuration?.duration || 0,
    rentalFee: rental.pricing?.totalAmount || 0,
    securityDeposit: rental.pricing?.securityDeposit || 0,
    currency: rental.pricing?.currency || 'ETB',
    virtualMuseumDetails: rental.virtualMuseumDetails,
    modelInfo: rental.modelInfo,
    approvals: rental.approvals
  };
};

/**
 * Format virtual museum artifact for display
 */
export const formatVirtualMuseumArtifact = (rental) => {
  if (!rental || !rental._id) return null;

  return {
    id: rental._id,
    artifactId: rental.artifact?._id,
    name: rental.artifact?.name,
    description: rental.artifact?.description,
    images: rental.artifact?.images || [],
    category: rental.artifact?.category,
    museum: rental.museum?.name,
    museumLocation: rental.museum?.location,
    modelUrl: rental.modelInfo?.modelUrl,
    thumbnailUrl: rental.modelInfo?.thumbnailUrl,
    uploadDate: rental.modelInfo?.uploadDate,
    approvedDate: rental.modelInfo?.approvedDate,
    uploadBy: rental.modelInfo?.uploadBy?.name,
    approvedBy: rental.modelInfo?.approvedBy?.name,
    virtualMuseumDetails: rental.virtualMuseumDetails
  };
};

/**
 * Get status color for rental
 */
export const getStatusColor = (status) => {
  const statusColors = {
    'pending_review': 'warning',
    'approved': 'success',
    'rejected': 'error',
    'payment_pending': 'info',
    'confirmed': 'info',
    'in_transit': 'info',
    'active': 'success',
    'completed': 'default',
    'overdue': 'error',
    'cancelled': 'error',
    'dispute': 'error',
    'digitization_in_progress': 'info',
    'model_uploaded': 'info',
    'virtual_museum_ready': 'success'
  };
  return statusColors[status] || 'default';
};

/**
 * Get rental direction label
 */
export const getRentalDirectionLabel = (direction) => {
  const labels = {
    'museum_to_superadmin': 'Museum → Super Admin',
    'superadmin_to_museum': 'Super Admin → Museum'
  };
  return labels[direction] || direction;
};

/**
 * Get virtual museum purpose label
 */
export const getVirtualMuseumPurposeLabel = (purpose) => {
  const labels = {
    '3d_modeling': '3D Modeling',
    'virtual_exhibition': 'Virtual Exhibition',
    'educational_content': 'Educational Content',
    'research': 'Research',
    'other': 'Other'
  };
  return labels[purpose] || purpose;
};

export default {
  getAllRentals,
  getRentalById,
  createMuseumToSuperAdminRequest,
  createSuperAdminToMuseumRequest,
  updateRental,
  deleteRental,
  approveRental,
  rejectRental,
  uploadModel,
  getMuseumArtifacts,
  approveModel,
  getVirtualMuseumReady,
  getRentalStats,
  getMuseumRentalStats,
  getOverdueRentals,
  formatRentalForDisplay,
  formatVirtualMuseumArtifact,
  getStatusColor,
  getRentalDirectionLabel,
  getVirtualMuseumPurposeLabel
};
