const Staff = require('../models/Staff');
const Museum = require('../models/Museum');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// ======================
// STAFF MANAGEMENT CONTROLLERS
// ======================

/**
 * @desc    Get all staff members for a museum
 * @route   GET /api/staff
 * @access  Museum Admin or Super Admin
 */
const getStaff = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      department,
      role,
      status = 'active',
      search,
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;

    // Build filter object
    const filter = {
      museum: req.user.museumId || req.query.museumId,
      isActive: true
    };

    if (department) filter.department = department;
    if (role) filter.role = role;
    if (status) filter.status = status;

    // Add search functionality
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { role: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query with pagination
    const staff = await Staff.find(filter)
      .populate('museum', 'name location')
      .populate('userId', 'name email profile')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Staff.countDocuments(filter);

    // Calculate pagination info
    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      success: true,
      data: {
        staff,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: total,
          limit: parseInt(limit),
          hasNext: parseInt(page) < totalPages,
          hasPrev: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Get staff error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch staff members',
      error: error.message
    });
  }
};

/**
 * @desc    Get single staff member by ID
 * @route   GET /api/staff/:id
 * @access  Museum Admin or Super Admin
 */
const getStaffById = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id)
      .populate('museum', 'name location contactInfo')
      .populate('userId', 'name email profile')
      .populate('emergencyContact.contact', 'name phone email');

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    // Check if user has access to this staff member
    if (req.user.role !== 'superAdmin' && staff.museum._id.toString() !== req.user.museumId?.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this staff member'
      });
    }

    res.json({
      success: true,
      data: staff
    });
  } catch (error) {
    console.error('Get staff by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch staff member',
      error: error.message
    });
  }
};

/**
 * @desc    Create new staff member
 * @route   POST /api/staff
 * @access  Museum Admin or Super Admin
 */
const createStaff = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      name,
      email,
      phone,
      role,
      department,
      hireDate,
      userId,
      permissions = [],
      schedule = {},
      emergencyContact = {},
      personalInfo = {},
      workInfo = {},
      profile = {}
    } = req.body;

    // Check if email already exists
    const existingStaff = await Staff.findOne({ email });
    if (existingStaff) {
      return res.status(400).json({
        success: false,
        message: 'Staff member with this email already exists'
      });
    }

    // If userId is provided, check if user exists and is not already staff
    if (userId) {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'User not found'
        });
      }

      const existingStaffWithUser = await Staff.findOne({ userId });
      if (existingStaffWithUser) {
        return res.status(400).json({
          success: false,
          message: 'User is already a staff member'
        });
      }
    }

    // Create staff member
    const staffData = {
      name,
      email,
      phone,
      role,
      department,
      hireDate: new Date(hireDate),
      museum: req.user.museumId || req.body.museumId,
      userId: userId || null,
      permissions,
      schedule,
      emergencyContact,
      personalInfo,
      workInfo,
      profile,
      createdBy: req.user._id
    };

    const staff = new Staff(staffData);
    await staff.save();

    // Populate the created staff member
    await staff.populate([
      { path: 'museum', select: 'name location' },
      { path: 'userId', select: 'name email profile' }
    ]);

    res.status(201).json({
      success: true,
      data: staff,
      message: 'Staff member created successfully'
    });
  } catch (error) {
    console.error('Create staff error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create staff member',
      error: error.message
    });
  }
};

/**
 * @desc    Update staff member
 * @route   PUT /api/staff/:id
 * @access  Museum Admin or Super Admin
 */
const updateStaff = async (req, res) => {
  try {
    console.log('Update staff request:', {
      staffId: req.params.id,
      body: req.body,
      user: {
        id: req.user._id,
        role: req.user.role,
        museumId: req.user.museumId
      }
    });

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const staff = await Staff.findById(req.params.id);
    if (!staff) {
      console.log('Staff not found:', req.params.id);
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    console.log('Found staff:', {
      id: staff._id,
      museum: staff.museum,
      museumString: staff.museum.toString(),
      userMuseumId: req.user.museumId,
      userMuseumIdString: req.user.museumId?.toString()
    });

    // Check if user has access to this staff member
    if (req.user.role !== 'superAdmin' && staff.museum.toString() !== req.user.museumId?.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this staff member'
      });
    }

    // Check if email is being changed and if it already exists
    if (req.body.email && req.body.email !== staff.email) {
      const existingStaff = await Staff.findOne({ email: req.body.email });
      if (existingStaff) {
        return res.status(400).json({
          success: false,
          message: 'Staff member with this email already exists'
        });
      }
    }

    // Update staff member
    const updateData = { ...req.body };
    if (updateData.hireDate) {
      updateData.hireDate = new Date(updateData.hireDate);
    }
    updateData.updatedBy = req.user._id;

    const updatedStaff = await Staff.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate([
      { path: 'museum', select: 'name location' },
      { path: 'userId', select: 'name email profile' }
    ]);

    res.json({
      success: true,
      data: updatedStaff,
      message: 'Staff member updated successfully'
    });
  } catch (error) {
    console.error('Update staff error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update staff member',
      error: error.message
    });
  }
};

/**
 * @desc    Delete staff member (soft delete)
 * @route   DELETE /api/staff/:id
 * @access  Museum Admin or Super Admin
 */
const deleteStaff = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    // Check if user has access to this staff member
    if (req.user.role !== 'superAdmin' && staff.museum.toString() !== req.user.museumId?.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this staff member'
      });
    }

    // Soft delete
    staff.deletedAt = new Date();
    staff.isActive = false;
    staff.updatedBy = req.user._id;
    await staff.save();

    res.json({
      success: true,
      message: 'Staff member deleted successfully'
    });
  } catch (error) {
    console.error('Delete staff error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete staff member',
      error: error.message
    });
  }
};

/**
 * @desc    Update staff permissions
 * @route   PUT /api/staff/:id/permissions
 * @access  Museum Admin or Super Admin
 */
const updateStaffPermissions = async (req, res) => {
  try {
    const { permissions } = req.body;

    const staff = await Staff.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    // Check if user has access to this staff member
    if (req.user.role !== 'superAdmin' && staff.museum.toString() !== req.user.museumId?.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this staff member'
      });
    }

    staff.permissions = permissions;
    staff.updatedBy = req.user._id;
    await staff.save();

    res.json({
      success: true,
      data: staff,
      message: 'Staff permissions updated successfully'
    });
  } catch (error) {
    console.error('Update staff permissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update staff permissions',
      error: error.message
    });
  }
};

/**
 * @desc    Update staff schedule
 * @route   PUT /api/staff/:id/schedule
 * @access  Museum Admin or Super Admin
 */
const updateStaffSchedule = async (req, res) => {
  try {
    const { schedule } = req.body;

    console.log('Update schedule request:', {
      staffId: req.params.id,
      schedule: schedule,
      user: {
        id: req.user._id,
        role: req.user.role,
        museumId: req.user.museumId
      }
    });

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Schedule validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const staff = await Staff.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    console.log('Found staff:', {
      id: staff._id,
      museum: staff.museum,
      museumString: staff.museum.toString(),
      userMuseumId: req.user.museumId,
      userMuseumIdString: req.user.museumId?.toString()
    });

    // Check if user has access to this staff member
    if (req.user.role !== 'superAdmin') {
      if (!req.user.museumId) {
        return res.status(403).json({
          success: false,
          message: 'User not associated with any museum'
        });
      }
      if (staff.museum.toString() !== req.user.museumId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied to this staff member'
        });
      }
    }

    staff.schedule = { ...staff.schedule, ...schedule };
    staff.updatedBy = req.user._id;
    await staff.save();

    res.json({
      success: true,
      data: staff,
      message: 'Staff schedule updated successfully'
    });
  } catch (error) {
    console.error('Update staff schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update staff schedule',
      error: error.message
    });
  }
};

/**
 * @desc    Get staff performance metrics
 * @route   GET /api/staff/:id/performance
 * @access  Museum Admin or Super Admin
 */
const getStaffPerformance = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    // Check if user has access to this staff member
    if (req.user.role !== 'superAdmin' && staff.museum.toString() !== req.user.museumId?.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this staff member'
      });
    }

    // Calculate performance metrics
    const performance = {
      rating: staff.performance?.rating || 0,
      completedTasks: staff.performance?.completedTasks || 0,
      onTimeRate: staff.performance?.onTimeRate || 100,
      attendance: staff.performance?.attendance || {
        totalDays: 0,
        presentDays: 0,
        absentDays: 0,
        lateDays: 0
      },
      achievements: staff.performance?.achievements || [],
      lastReview: staff.performance?.lastReview || null,
      nextReview: staff.performance?.nextReview || null
    };

    res.json({
      success: true,
      data: performance
    });
  } catch (error) {
    console.error('Get staff performance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch staff performance',
      error: error.message
    });
  }
};

/**
 * @desc    Record staff attendance
 * @route   POST /api/staff/:id/attendance
 * @access  Museum Admin or Super Admin
 */
const recordAttendance = async (req, res) => {
  try {
    const { date, status, checkInTime, checkOutTime, notes } = req.body;

    const staff = await Staff.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    // Check if user has access to this staff member
    if (req.user.role !== 'superAdmin' && staff.museum.toString() !== req.user.museumId?.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this staff member'
      });
    }

    // Add attendance record
    const attendanceRecord = {
      date: new Date(date),
      status,
      checkInTime: checkInTime ? new Date(checkInTime) : null,
      checkOutTime: checkOutTime ? new Date(checkOutTime) : null,
      notes,
      recordedBy: req.user._id,
      recordedAt: new Date()
    };

    staff.attendance = staff.attendance || [];
    staff.attendance.push(attendanceRecord);

    // Update performance metrics
    if (!staff.performance) {
      staff.performance = {};
    }
    if (!staff.performance.attendance) {
      staff.performance.attendance = {
        totalDays: 0,
        presentDays: 0,
        absentDays: 0,
        lateDays: 0
      };
    }

    staff.performance.attendance.totalDays += 1;
    if (status === 'present') {
      staff.performance.attendance.presentDays += 1;
    } else if (status === 'absent') {
      staff.performance.attendance.absentDays += 1;
    } else if (status === 'late') {
      staff.performance.attendance.lateDays += 1;
    }

    staff.updatedBy = req.user._id;
    await staff.save();

    res.json({
      success: true,
      data: attendanceRecord,
      message: 'Attendance recorded successfully'
    });
  } catch (error) {
    console.error('Record attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record attendance',
      error: error.message
    });
  }
};

/**
 * @desc    Submit leave request
 * @route   POST /api/staff/:id/leave
 * @access  Museum Admin or Super Admin
 */
const submitLeaveRequest = async (req, res) => {
  try {
    const { startDate, endDate, type, reason, emergencyContact } = req.body;

    const staff = await Staff.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    // Check if user has access to this staff member
    if (req.user.role !== 'superAdmin' && staff.museum.toString() !== req.user.museumId?.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this staff member'
      });
    }

    // Create leave request
    const leaveRequest = {
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      type,
      reason,
      emergencyContact,
      status: 'pending',
      submittedBy: req.user._id,
      submittedAt: new Date()
    };

    staff.leaveRequests = staff.leaveRequests || [];
    staff.leaveRequests.push(leaveRequest);

    staff.updatedBy = req.user._id;
    await staff.save();

    res.json({
      success: true,
      data: leaveRequest,
      message: 'Leave request submitted successfully'
    });
  } catch (error) {
    console.error('Submit leave request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit leave request',
      error: error.message
    });
  }
};

/**
 * @desc    Approve/reject leave request
 * @route   PUT /api/staff/leave/:leaveId/approve
 * @access  Museum Admin or Super Admin
 */
const approveLeaveRequest = async (req, res) => {
  try {
    const { status, comments } = req.body;

    // Find staff member with the leave request
    const staff = await Staff.findOne({
      'leaveRequests._id': req.params.leaveId
    });

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found'
      });
    }

    // Check if user has access to this staff member
    if (req.user.role !== 'superAdmin' && staff.museum.toString() !== req.user.museumId?.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this leave request'
      });
    }

    // Find and update the leave request
    const leaveRequest = staff.leaveRequests.id(req.params.leaveId);
    if (!leaveRequest) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found'
      });
    }

    leaveRequest.status = status;
    leaveRequest.comments = comments;
    leaveRequest.reviewedBy = req.user._id;
    leaveRequest.reviewedAt = new Date();

    staff.updatedBy = req.user._id;
    await staff.save();

    res.json({
      success: true,
      data: leaveRequest,
      message: `Leave request ${status} successfully`
    });
  } catch (error) {
    console.error('Approve leave request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process leave request',
      error: error.message
    });
  }
};

/**
 * @desc    Get staff statistics
 * @route   GET /api/staff/stats
 * @access  Museum Admin or Super Admin
 */
const getStaffStats = async (req, res) => {
  try {
    const museumId = req.user.museumId || req.query.museumId;

    const stats = await Staff.aggregate([
      { $match: { museum: museumId, isActive: true } },
      {
        $group: {
          _id: null,
          totalStaff: { $sum: 1 },
          activeStaff: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          onLeaveStaff: {
            $sum: { $cond: [{ $eq: ['$status', 'on_leave'] }, 1, 0] }
          },
          inactiveStaff: {
            $sum: { $cond: [{ $eq: ['$status', 'inactive'] }, 1, 0] }
          },
          avgRating: { $avg: '$performance.rating' },
          avgOnTimeRate: { $avg: '$performance.onTimeRate' }
        }
      }
    ]);

    // Get department breakdown
    const departmentStats = await Staff.aggregate([
      { $match: { museum: museumId, isActive: true } },
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get role breakdown
    const roleStats = await Staff.aggregate([
      { $match: { museum: museumId, isActive: true } },
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        overview: stats[0] || {
          totalStaff: 0,
          activeStaff: 0,
          onLeaveStaff: 0,
          inactiveStaff: 0,
          avgRating: 0,
          avgOnTimeRate: 0
        },
        departmentBreakdown: departmentStats,
        roleBreakdown: roleStats
      }
    });
  } catch (error) {
    console.error('Get staff stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch staff statistics',
      error: error.message
    });
  }
};

/**
 * @desc    Get available roles and permissions
 * @route   GET /api/staff/roles-permissions
 * @access  Museum Admin or Super Admin
 */
const getRolesAndPermissions = async (req, res) => {
  try {
    const roles = [
      'Senior Curator',
      'Education Coordinator',
      'Conservation Specialist',
      'Digital Archivist',
      'Security Officer',
      'Tour Guide',
      'Registrar',
      'Collections Manager',
      'Exhibitions Coordinator',
      'Marketing Coordinator',
      'Administrative Assistant',
      'Other'
    ];

    const permissions = [
      'view_artifacts',
      'edit_artifacts',
      'delete_artifacts',
      'upload_artifacts',
      'approve_artifacts',
      'view_events',
      'edit_events',
      'delete_events',
      'manage_events',
      'view_staff',
      'edit_staff',
      'delete_staff',
      'manage_permissions',
      'view_rentals',
      'approve_rentals',
      'reject_rentals',
      'view_analytics',
      'export_analytics',
      'edit_museum',
      'manage_system'
    ];

    const departments = [
      'Collections',
      'Education',
      'Conservation',
      'Digital',
      'Security',
      'Administration',
      'Marketing',
      'Research',
      'Operations'
    ];

    res.json({
      success: true,
      data: {
        roles,
        permissions,
        departments
      }
    });
  } catch (error) {
    console.error('Get roles and permissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch roles and permissions',
      error: error.message
    });
  }
};

module.exports = {
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
  getRolesAndPermissions
};
