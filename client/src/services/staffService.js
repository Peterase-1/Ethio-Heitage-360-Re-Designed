import apiClient from '../utils/api.js';

class StaffService {
  constructor() {
    this.baseURL = '/staff';
  }

  // ======================
  // STAFF CRUD OPERATIONS
  // ======================

  /**
   * Get all staff members with filtering and pagination
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   * @param {string} params.department - Filter by department
   * @param {string} params.role - Filter by role
   * @param {string} params.status - Filter by status
   * @param {string} params.search - Search query
   * @param {string} params.sortBy - Sort field
   * @param {string} params.sortOrder - Sort order (asc/desc)
   */
  async getStaff(params = {}) {
    const queryParams = new URLSearchParams();

    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });

    const endpoint = queryParams.toString()
      ? `${this.baseURL}?${queryParams.toString()}`
      : this.baseURL;

    return await apiClient.request(endpoint, {
      method: 'GET'
    });
  }

  /**
   * Get staff member by ID
   * @param {string} id - Staff member ID
   */
  async getStaffById(id) {
    return await apiClient.request(`${this.baseURL}/${id}`, {
      method: 'GET'
    });
  }

  /**
   * Create new staff member
   * @param {Object} staffData - Staff member data
   */
  async createStaff(staffData) {
    return await apiClient.request(this.baseURL, {
      method: 'POST',
      body: staffData
    });
  }

  /**
   * Update staff member
   * @param {string} id - Staff member ID
   * @param {Object} staffData - Updated staff data
   */
  async updateStaff(id, staffData) {
    return await apiClient.request(`${this.baseURL}/${id}`, {
      method: 'PUT',
      body: staffData
    });
  }

  /**
   * Delete staff member (soft delete)
   * @param {string} id - Staff member ID
   */
  async deleteStaff(id) {
    return await apiClient.request(`${this.baseURL}/${id}`, {
      method: 'DELETE'
    });
  }

  // ======================
  // STAFF PERMISSIONS
  // ======================

  /**
   * Update staff permissions
   * @param {string} id - Staff member ID
   * @param {Array} permissions - Array of permissions
   */
  async updateStaffPermissions(id, permissions) {
    return await apiClient.request(`${this.baseURL}/${id}/permissions`, {
      method: 'PUT',
      body: { permissions }
    });
  }

  // ======================
  // STAFF SCHEDULE
  // ======================

  /**
   * Update staff schedule
   * @param {string} id - Staff member ID
   * @param {Object} schedule - Schedule data
   */
  async updateStaffSchedule(id, schedule) {
    return await apiClient.request(`${this.baseURL}/${id}/schedule`, {
      method: 'PUT',
      body: { schedule }
    });
  }

  // ======================
  // STAFF PERFORMANCE
  // ======================

  /**
   * Get staff performance metrics
   * @param {string} id - Staff member ID
   */
  async getStaffPerformance(id) {
    return await apiClient.request(`${this.baseURL}/${id}/performance`, {
      method: 'GET'
    });
  }

  // ======================
  // STAFF ATTENDANCE
  // ======================

  /**
   * Record staff attendance
   * @param {string} id - Staff member ID
   * @param {Object} attendanceData - Attendance data
   */
  async recordAttendance(id, attendanceData) {
    return await apiClient.request(`${this.baseURL}/${id}/attendance`, {
      method: 'POST',
      body: attendanceData
    });
  }

  // ======================
  // STAFF LEAVE MANAGEMENT
  // ======================

  /**
   * Submit leave request
   * @param {string} id - Staff member ID
   * @param {Object} leaveData - Leave request data
   */
  async submitLeaveRequest(id, leaveData) {
    return await apiClient.request(`${this.baseURL}/${id}/leave`, {
      method: 'POST',
      body: leaveData
    });
  }

  /**
   * Approve/reject leave request
   * @param {string} leaveId - Leave request ID
   * @param {Object} approvalData - Approval data
   */
  async approveLeaveRequest(leaveId, approvalData) {
    return await apiClient.request(`${this.baseURL}/leave/${leaveId}/approve`, {
      method: 'PUT',
      body: approvalData
    });
  }

  // ======================
  // STAFF STATISTICS
  // ======================

  /**
   * Get staff statistics and analytics
   */
  async getStaffStats() {
    return await apiClient.request(`${this.baseURL}/stats`, {
      method: 'GET'
    });
  }

  /**
   * Get available roles and permissions
   */
  async getRolesAndPermissions() {
    return await apiClient.request(`${this.baseURL}/roles-permissions`, {
      method: 'GET'
    });
  }

  // ======================
  // UTILITY METHODS
  // ======================

  /**
   * Search staff members
   * @param {string} query - Search query
   * @param {Object} filters - Additional filters
   */
  async searchStaff(query, filters = {}) {
    return await this.getStaff({
      search: query,
      ...filters
    });
  }

  /**
   * Get staff by department
   * @param {string} department - Department name
   */
  async getStaffByDepartment(department) {
    return await this.getStaff({ department });
  }

  /**
   * Get staff by role
   * @param {string} role - Role name
   */
  async getStaffByRole(role) {
    return await this.getStaff({ role });
  }

  /**
   * Get active staff members
   */
  async getActiveStaff() {
    return await this.getStaff({ status: 'active' });
  }

  /**
   * Get staff on leave
   */
  async getStaffOnLeave() {
    return await this.getStaff({ status: 'on_leave' });
  }

  // ======================
  // BULK OPERATIONS
  // ======================

  /**
   * Update multiple staff members
   * @param {Array} updates - Array of {id, data} objects
   */
  async bulkUpdateStaff(updates) {
    const promises = updates.map(({ id, data }) =>
      this.updateStaff(id, data)
    );
    return await Promise.all(promises);
  }

  /**
   * Delete multiple staff members
   * @param {Array} ids - Array of staff member IDs
   */
  async bulkDeleteStaff(ids) {
    const promises = ids.map(id => this.deleteStaff(id));
    return await Promise.all(promises);
  }

  // ======================
  // EXPORT/IMPORT
  // ======================

  /**
   * Export staff data
   * @param {Object} filters - Export filters
   * @param {string} format - Export format (csv, xlsx, pdf)
   */
  async exportStaffData(filters = {}, format = 'csv') {
    const queryParams = new URLSearchParams({
      ...filters,
      format
    });

    return await apiClient.request(`${this.baseURL}/export?${queryParams.toString()}`, {
      method: 'GET'
    });
  }

  // ======================
  // VALIDATION HELPERS
  // ======================

  /**
   * Validate staff data before submission
   * @param {Object} staffData - Staff data to validate
   */
  validateStaffData(staffData) {
    const errors = {};

    if (!staffData.name || staffData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters long';
    }

    if (!staffData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(staffData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!staffData.role) {
      errors.role = 'Role is required';
    }

    if (!staffData.department) {
      errors.department = 'Department is required';
    }

    if (!staffData.hireDate) {
      errors.hireDate = 'Hire date is required';
    }

    if (staffData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(staffData.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Validate attendance data
   * @param {Object} attendanceData - Attendance data to validate
   */
  validateAttendanceData(attendanceData) {
    const errors = {};

    if (!attendanceData.date) {
      errors.date = 'Date is required';
    }

    if (!attendanceData.status) {
      errors.status = 'Status is required';
    }

    const validStatuses = ['present', 'absent', 'late', 'half_day', 'sick_leave', 'vacation'];
    if (attendanceData.status && !validStatuses.includes(attendanceData.status)) {
      errors.status = 'Invalid status';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Validate leave request data
   * @param {Object} leaveData - Leave data to validate
   */
  validateLeaveData(leaveData) {
    const errors = {};

    if (!leaveData.startDate) {
      errors.startDate = 'Start date is required';
    }

    if (!leaveData.endDate) {
      errors.endDate = 'End date is required';
    }

    if (leaveData.startDate && leaveData.endDate) {
      const start = new Date(leaveData.startDate);
      const end = new Date(leaveData.endDate);

      if (start >= end) {
        errors.endDate = 'End date must be after start date';
      }
    }

    if (!leaveData.type) {
      errors.type = 'Leave type is required';
    }

    if (!leaveData.reason || leaveData.reason.trim().length < 10) {
      errors.reason = 'Reason must be at least 10 characters long';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
}

// Create and export a singleton instance
const staffService = new StaffService();
export default staffService;

// Export individual methods for convenience
export const {
  getStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff,
  updateStaffPermissions,
  updateStaffSchedule,
  getStaffPerformance,
  recordAttendance,
  submitLeaveRequest,
  approveLeaveRequest,
  getStaffStats,
  getRolesAndPermissions,
  searchStaff,
  getStaffByDepartment,
  getStaffByRole,
  getActiveStaff,
  getStaffOnLeave,
  bulkUpdateStaff,
  bulkDeleteStaff,
  exportStaffData,
  validateStaffData,
  validateAttendanceData,
  validateLeaveData
} = staffService;
