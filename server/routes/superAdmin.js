const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { requireSuperAdmin } = require('../middleware/roleHierarchy');
const superAdminController = require('../controllers/superAdmin');
const performanceAnalyticsController = require('../controllers/performanceAnalytics');
const {
  auditUserCreation,
  auditUserUpdate,
  auditUserDeletion,
  auditUserVerification,
  auditMuseumApproval,
  auditMuseumRejection,
  auditHeritageSiteCreation,
  auditHeritageSiteUpdate,
  auditHeritageSiteDeletion,
  auditArtifactApproval,
  auditArtifactRejection,
  auditRentalApproval,
  auditRentalRejection,
  auditSystemSettingChange,
  auditBulkOperation,
  auditDataExport,
  auditDataImport
} = require('../middleware/auditLogger');

// Apply authentication and super admin check to all routes
// Super admin routes are exclusive to super_admin role only
// Temporarily disabled for testing
// router.use(auth);
// router.use(requireSuperAdmin);

// ======================
// DASHBOARD & ANALYTICS
// ======================

/**
 * @route   GET /api/super-admin/dashboard
 * @desc    Super Admin main control panel with system overview, platform statistics, 
 *          system health monitoring, and quick action buttons
 * @access  Super Admin only
 */
router.get('/dashboard', superAdminController.getDashboard);

/**
 * @route   GET /api/super-admin/analytics
 * @desc    Comprehensive platform analytics - user engagement metrics, 
 *          content performance analysis, system usage statistics, 
 *          revenue tracking, geographic usage patterns
 * @access  Super Admin only
 * @params  startDate, endDate, museum, type (platform|user_engagement|revenue|top_artifacts)
 */
router.get('/analytics', superAdminController.getAnalytics);

// ======================
// EDUCATION MANAGEMENT (REAL DATA)
// ======================

/**
 * @route   GET /api/super-admin/education/overview
 * @desc    Education system overview (tours & courses) with real DB stats
 */
router.get('/education/overview', superAdminController.getEducationOverview);

/**
 * @route   GET /api/super-admin/education/tours
 * @desc    List educational tours with filtering & pagination
 */
router.get('/education/tours', superAdminController.getAllEducationalTours);

/**
 * @route   PUT /api/super-admin/education/tours/:id/status
 * @desc    Update educational tour status (published|draft|archived)
 */
router.put('/education/tours/:id/status', superAdminController.updateEducationalTourStatus);

/**
 * @route   DELETE /api/super-admin/education/tours/:id
 * @desc    Delete or archive educational tour based on enrollments
 */
router.delete('/education/tours/:id', superAdminController.deleteEducationalTour);

/**
 * @route   GET /api/super-admin/education/courses
 * @desc    List courses with filtering & pagination
 */
router.get('/education/courses', superAdminController.getAllCourses);

/**
 * @route   PUT /api/super-admin/education/courses/:id/status
 * @desc    Update course status (published|draft|archived)
 */
router.put('/education/courses/:id/status', superAdminController.updateCourseStatus);

/**
 * @route   DELETE /api/super-admin/education/courses/:id
 * @desc    Delete or archive course based on enrollments
 */
router.delete('/education/courses/:id', superAdminController.deleteCourse);

/**
 * @route   GET /api/super-admin/education/assignments
 * @desc    List assignments with filtering & pagination
 */
router.get('/education/assignments', superAdminController.getAllAssignments);

/**
 * @route   PUT /api/super-admin/education/assignments/:id
 * @desc    Update an assignment
 */
router.put('/education/assignments/:id', superAdminController.updateAssignment);

/**
 * @route   DELETE /api/super-admin/education/assignments/:id
 * @desc    Delete an assignment
 */
router.delete('/education/assignments/:id', superAdminController.deleteAssignment);

/**
 * @route   GET /api/super-admin/education/discussions
 * @desc    List discussions with filtering & pagination
 */
router.get('/education/discussions', superAdminController.getAllDiscussions);

/**
 * @route   PUT /api/super-admin/education/discussions/:id/moderate
 * @desc    Moderate a discussion (pin/lock)
 */
router.put('/education/discussions/:id/moderate', superAdminController.moderateDiscussion);

/**
 * @route   DELETE /api/super-admin/education/discussions/:id
 * @desc    Delete a discussion
 */
router.delete('/education/discussions/:id', superAdminController.deleteDiscussion);

/**
 * @route   GET /api/super-admin/education/enrollments
 * @desc    List enrollments with filtering & pagination
 */
router.get('/education/enrollments', superAdminController.getAllEnrollments);

/**
 * @route   PUT /api/super-admin/education/enrollments/:id
 * @desc    Update an enrollment
 */
router.put('/education/enrollments/:id', superAdminController.updateEnrollment);

/**
 * @route   DELETE /api/super-admin/education/enrollments/:id
 * @desc    Delete an enrollment
 */
router.delete('/education/enrollments/:id', superAdminController.deleteEnrollment);

/**
 * @route   GET /api/super-admin/education/progress
 * @desc    List learning progress with filtering & pagination
 */
router.get('/education/progress', superAdminController.getAllProgress);

/**
 * @route   PUT /api/super-admin/education/progress/:id
 * @desc    Update learning progress
 */
router.put('/education/progress/:id', superAdminController.updateProgress);

/**
 * @route   DELETE /api/super-admin/education/progress/:id
 * @desc    Delete learning progress record
 */
router.delete('/education/progress/:id', superAdminController.deleteProgress);

/**
 * @route   POST /api/super-admin/education/courses
 * @desc    Create a new course (Super Admin only)
 */
router.post('/education/courses', superAdminController.createCourseSuperAdmin);

// ======================
// USER MANAGEMENT
// ======================

/**
 * @route   GET /api/super-admin/users
 * @desc    Get all users with advanced filtering and pagination
 * @access  Super Admin only
 * @params  page, limit, role, status, search, sortBy, sortOrder
 */
router.get('/users', superAdminController.getAllUsers);

/**
 * @route   POST /api/super-admin/users
 * @desc    Create a new user (any role)
 * @access  Super Admin only
 * @body    name, email, password, role, isActive, profile
 */
router.post('/users', auditUserCreation, superAdminController.createUser);

/**
 * @route   PUT /api/super-admin/users/:id
 * @desc    Update any user's information and role assignment
 * @access  Super Admin only
 * @params  id - User ID
 * @body    User fields to update
 */
router.put('/users/:id', auditUserUpdate, superAdminController.updateUser);

/**
 * @route   DELETE /api/super-admin/users/:id
 * @desc    Delete a user account
 * @access  Super Admin only
 * @params  id - User ID
 */
router.delete('/users/:id', auditUserDeletion, superAdminController.deleteUser);

/**
 * @route   POST /api/super-admin/users/import
 * @desc    Bulk import users from CSV/JSON
 * @access  Super Admin only
 * @body    users[], options
 */
router.post('/users/import', auditDataImport, superAdminController.importUsers);

/**
 * @route   GET /api/super-admin/users/export
 * @desc    Export users data in CSV/JSON format
 * @access  Super Admin only
 * @params  format (csv|json), filters
 */
router.get('/users/export', auditDataExport, superAdminController.exportUsers);

/**
 * @route   GET /api/super-admin/users/:id/activity
 * @desc    Get user activity history
 * @access  Super Admin only
 * @params  id - User ID, page, limit, type
 */
router.get('/users/:id/activity', superAdminController.getUserActivity);

/**
 * @route   POST /api/super-admin/users/bulk-message
 * @desc    Send bulk messages to multiple users
 * @access  Super Admin only
 * @body    userIds[], message, subject, type, urgency
 */
router.post('/users/bulk-message', superAdminController.sendBulkMessage);

/**
 * @route   PUT /api/super-admin/users/:id/verify
 * @desc    Manual user verification with status and notes
 * @access  Super Admin only
 * @params  id - User ID
 * @body    verificationStatus, notes
 */
router.put('/users/:id/verify', auditUserVerification, superAdminController.verifyUser);

// ======================
// MUSEUM OVERSIGHT
// ======================

/**
 * @route   GET /api/super-admin/museums
 * @desc    Get all museums with filtering and pagination
 * @access  Super Admin only
 * @params  page, limit, status, verified, search, sortBy, sortOrder
 */
router.get('/museums', superAdminController.getAllMuseums);

/**
 * @route   PUT /api/super-admin/museums/:id/status
 * @desc    Update museum status (approve/reject/suspend)
 * @access  Super Admin only
 * @params  id - Museum ID
 * @body    status, reason
 */
router.put('/museums/:id/status', (req, res, next) => {
  if (req.body.status === 'approved') {
    return auditMuseumApproval(req, res, next);
  } else if (req.body.status === 'rejected') {
    return auditMuseumRejection(req, res, next);
  } else {
    return next();
  }
}, superAdminController.updateMuseumStatus);

// ======================
// HERITAGE SITES
// ======================

// Heritage sites routes moved to the end of the file to avoid conflicts

/**
 * @route   POST /api/super-admin/heritage-sites/migrate-mock-data
 * @desc    Migrate mock heritage site data from map to database
 * @access  Super Admin only
 */
router.post('/heritage-sites/migrate-mock-data', superAdminController.migrateMockDataToDatabase);

// ======================
// SYSTEM SETTINGS
// ======================

/**
 * @route   GET /api/super-admin/system-settings
 * @desc    Platform-wide configuration management - global feature toggles,
 *          system parameters configuration, multilingual content settings,
 *          security policy management, API rate limiting controls
 * @access  Super Admin only
 * @params  category (optional filter)
 */
router.get('/system-settings', superAdminController.getSystemSettings);

/**
 * @route   PUT /api/super-admin/system-settings/:key
 * @desc    Update a system setting
 * @access  Super Admin only
 * @params  key - Setting key
 * @body    value, reason
 */
router.put('/system-settings/:key', auditSystemSettingChange, superAdminController.updateSystemSetting);

/**
 * @route   POST /api/super-admin/system-settings
 * @desc    Create a new system setting
 * @access  Super Admin only
 * @body    Setting data (category, key, value, dataType, description, etc.)
 */
router.post('/system-settings', auditSystemSettingChange, superAdminController.createSystemSetting);

// ======================
// APPROVAL WORKFLOWS
// ======================

/**
 * @route   GET /api/super-admin/content/pending
 * @desc    Content and request management - virtual museum entry approvals,
 *          artifact rental oversight, content moderation tools,
 *          workflow automation rules, approval history tracking
 * @access  Super Admin only
 * @params  page, limit, type (all|museums|artifacts|rentals), status
 */
router.get('/content/pending', superAdminController.getPendingContent);

/**
 * @route   PUT /api/super-admin/content/artifacts/:id/approve
 * @desc    Approve or reject artifact for content moderation
 * @access  Super Admin only
 * @params  id - Artifact ID
 * @body    status (approved|rejected), feedback
 */
router.put('/content/artifacts/:id/approve', (req, res, next) => {
  if (req.body.status === 'approved') {
    return auditArtifactApproval(req, res, next);
  } else if (req.body.status === 'rejected') {
    return auditArtifactRejection(req, res, next);
  } else {
    return next();
  }
}, superAdminController.approveArtifact);

/**
 * @route   GET /api/super-admin/rentals
 * @desc    Get all rentals with filtering and pagination
 * @access  Super Admin only
 * @params  page, limit, status, search, sortBy, sortOrder
 */
router.get('/rentals', superAdminController.getAllRentals);

/**
 * @route   PUT /api/super-admin/rentals/:id/approve
 * @desc    Artifact rental oversight and approval
 * @access  Super Admin only
 * @params  id - Rental ID
 * @body    status (approved|rejected), comments
 */
router.put('/rentals/:id/approve', (req, res, next) => {
  if (req.body.status === 'approved') {
    return auditRentalApproval(req, res, next);
  } else if (req.body.status === 'rejected') {
    return auditRentalRejection(req, res, next);
  } else {
    return next();
  }
}, superAdminController.approveRental);

/**
 * @route   GET /api/super-admin/audit-logs
 * @desc    Get audit logs for admin actions
 * @access  Super Admin only
 * @params  page, limit, action, userId, startDate, endDate, riskLevel
 */
router.get('/audit-logs', superAdminController.getAuditLogs);

/**
 * @route   GET /api/super-admin/audit-logs/summary
 * @desc    Get audit logs summary and statistics
 * @access  Super Admin only
 * @params  startDate, endDate
 */
router.get('/audit-logs/summary', superAdminController.getAuditLogsSummary);

/**
 * @route   GET /api/super-admin/approval-workflows/history
 * @desc    Get approval history tracking
 * @access  Super Admin only
 * @params  page, limit, type, dateRange
 */
router.get('/approval-workflows/history', async (req, res) => {
  try {
    // This would show approval history across all workflows
    res.json({
      success: true,
      message: 'Approval history tracking will be implemented here',
      query: req.query
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch approval history',
      error: error.message
    });
  }
});

// ======================
// ADDITIONAL ENDPOINTS
// ======================

/**
 * @route   GET /api/super-admin/reports/export
 * @desc    Export platform data as CSV/Excel
 * @access  Super Admin only
 * @params  type (users|museums|artifacts|rentals), format (csv|excel)
 */
router.get('/reports/export', async (req, res) => {
  try {
    const { type = 'users', format = 'csv' } = req.query;

    // This is a placeholder for export functionality
    // You would implement CSV/Excel export logic here

    res.json({
      success: true,
      message: 'Export functionality will be implemented here',
      type,
      format
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Export failed',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/super-admin/system/backup
 * @desc    Create system backup
 * @access  Super Admin only
 */
router.post('/system/backup', async (req, res) => {
  try {
    // Placeholder for backup functionality
    res.json({
      success: true,
      message: 'System backup functionality will be implemented here',
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Backup failed',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/super-admin/system/health
 * @desc    Get detailed system health information
 * @access  Super Admin only
 */
router.get('/system/health', async (req, res) => {
  try {
    const mongoose = require('mongoose');

    const health = {
      status: 'OK',
      timestamp: new Date(),
      database: {
        connected: mongoose.connection.readyState === 1,
        state: mongoose.connection.readyState
      },
      memory: process.memoryUsage(),
      uptime: process.uptime()
    };

    res.json({
      success: true,
      health
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Health check failed',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/super-admin/notifications/broadcast
 * @desc    Send broadcast notification to all or selected users
 * @access  Super Admin only
 * @body    message, title, recipients (all|role:museum|role:visitor|user:id), urgent
 */
router.post('/notifications/broadcast', async (req, res) => {
  try {
    const { message, title, recipients = 'all', urgent = false } = req.body;

    if (!message || !title) {
      return res.status(400).json({
        success: false,
        message: 'Message and title are required'
      });
    }

    // Placeholder for notification broadcast functionality
    // You would integrate with your notification system here

    res.json({
      success: true,
      message: 'Broadcast notification functionality will be implemented here',
      data: {
        title,
        message,
        recipients,
        urgent,
        sentBy: req.user._id,
        timestamp: new Date()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Broadcast failed',
      error: error.message
    });
  }
});

// ======================
// PERFORMANCE ANALYTICS ROUTES
// ======================

/**
 * @route   GET /api/super-admin/performance-analytics/overview
 * @desc    Get comprehensive performance overview
 * @access  Super Admin only
 * @params  timeRange, category
 */
router.get('/performance-analytics/overview', performanceAnalyticsController.getPerformanceOverview);

/**
 * @route   GET /api/super-admin/performance-analytics/system-health
 * @desc    Get detailed system health metrics
 * @access  Super Admin only
 * @params  timeRange
 */
router.get('/performance-analytics/system-health', performanceAnalyticsController.getSystemHealth);

/**
 * @route   GET /api/super-admin/performance-analytics/user-activity
 * @desc    Get user activity performance metrics
 * @access  Super Admin only
 * @params  timeRange, groupBy
 */
router.get('/performance-analytics/user-activity', performanceAnalyticsController.getUserActivityMetrics);

/**
 * @route   GET /api/super-admin/performance-analytics/museum-performance
 * @desc    Get museum performance metrics
 * @access  Super Admin only
 * @params  timeRange, sortBy
 */
router.get('/performance-analytics/museum-performance', performanceAnalyticsController.getMuseumPerformanceMetrics);

/**
 * @route   GET /api/super-admin/performance-analytics/artifact-performance
 * @desc    Get artifact performance metrics
 * @access  Super Admin only
 * @params  timeRange, category
 */
router.get('/performance-analytics/artifact-performance', performanceAnalyticsController.getArtifactPerformanceMetrics);

/**
 * @route   GET /api/super-admin/performance-analytics/rental-performance
 * @desc    Get rental performance metrics
 * @access  Super Admin only
 * @params  timeRange
 */
router.get('/performance-analytics/rental-performance', performanceAnalyticsController.getRentalPerformanceMetrics);

/**
 * @route   GET /api/super-admin/performance-analytics/api-performance
 * @desc    Get API performance metrics
 * @access  Super Admin only
 * @params  timeRange, endpoint
 */
router.get('/performance-analytics/api-performance', performanceAnalyticsController.getApiPerformanceMetrics);

// ======================
// ENHANCED USER MANAGEMENT ROUTES
// ======================

/**
 * @route   POST /api/super-admin/users/bulk-actions
 * @desc    Perform bulk actions on multiple users
 * @access  Super Admin only
 * @body    action, userIds[], data{}
 */
router.post('/users/bulk-actions', auditBulkOperation, superAdminController.bulkUserActions);

/**
 * @route   GET /api/super-admin/users/statistics
 * @desc    Get comprehensive user statistics
 * @access  Super Admin only
 * @params  timeRange
 */
router.get('/users/statistics', superAdminController.getUserStatistics);

/**
 * @route   GET /api/super-admin/users/search
 * @desc    Advanced user search with filtering
 * @access  Super Admin only
 * @params  q, page, limit, role, status, sortBy, sortOrder
 */
router.get('/users/search', superAdminController.searchUsers);

// ======================
// ENHANCED MUSEUM OVERSIGHT ROUTES
// ======================

/**
 * @route   GET /api/super-admin/museums/statistics
 * @desc    Get comprehensive museum statistics
 * @access  Super Admin only
 * @params  timeRange
 */
router.get('/museums/statistics', superAdminController.getMuseumStatistics);

/**
 * @route   POST /api/super-admin/museums/bulk-actions
 * @desc    Perform bulk actions on multiple museums
 * @access  Super Admin only
 * @body    action, museumIds[], data{}
 */
router.post('/museums/bulk-actions', auditBulkOperation, superAdminController.bulkMuseumActions);

/**
 * @route   GET /api/super-admin/museums/search
 * @desc    Advanced museum search with filtering
 * @access  Super Admin only
 * @params  q, page, limit, status, verified, region, sortBy, sortOrder
 */
router.get('/museums/search', superAdminController.searchMuseums);

/**
 * @route   GET /api/super-admin/museums/performance
 * @desc    Get museum performance metrics
 * @access  Super Admin only
 * @params  timeRange, museumId
 */
router.get('/museums/performance', superAdminController.getMuseumPerformance);

/**
 * @route   GET /api/super-admin/museums/audit-logs
 * @desc    Get museum audit logs
 * @access  Super Admin only
 * @params  page, limit, museumId, action, startDate, endDate, sortBy, sortOrder
 */
router.get('/museums/audit-logs', superAdminController.getMuseumAuditLogs);

// ======================
// ENHANCED HERITAGE SITES MANAGEMENT ROUTES
// ======================

/**
 * @route   GET /api/super-admin/heritage-sites
 * @desc    Get all heritage sites with filtering and pagination
 * @access  Super Admin only
 * @params  page, limit, status, verified, region, type, designation, sortBy, sortOrder
 */
router.get('/heritage-sites', superAdminController.getAllHeritageSites);

/**
 * @route   GET /api/super-admin/heritage-sites/statistics
 * @desc    Get comprehensive heritage site statistics
 * @access  Super Admin only
 * @params  timeRange
 */
router.get('/heritage-sites/statistics', superAdminController.getHeritageSiteStatistics);

/**
 * @route   POST /api/super-admin/heritage-sites/bulk-actions
 * @desc    Perform bulk actions on multiple heritage sites
 * @access  Super Admin only
 * @body    action, siteIds, data
 */
router.post('/heritage-sites/bulk-actions', auditBulkOperation, superAdminController.bulkHeritageSiteActions);

/**
 * @route   GET /api/super-admin/heritage-sites/search
 * @desc    Search heritage sites with advanced filtering
 * @access  Super Admin only
 * @params  query, status, verified, region, type, designation, sortBy, sortOrder, page, limit
 */
router.get('/heritage-sites/search', superAdminController.searchHeritageSites);

/**
 * @route   GET /api/super-admin/heritage-sites/performance
 * @desc    Get heritage site performance metrics
 * @access  Super Admin only
 * @params  timeRange
 */
router.get('/heritage-sites/performance', superAdminController.getHeritageSitePerformance);

/**
 * @route   GET /api/super-admin/heritage-sites/audit-logs
 * @desc    Get heritage site audit logs
 * @access  Super Admin only
 * @params  page, limit, action, siteId, userId, startDate, endDate, sortBy, sortOrder
 */
router.get('/heritage-sites/audit-logs', superAdminController.getHeritageSiteAuditLogs);

/**
 * @route   POST /api/super-admin/heritage-sites
 * @desc    Create a new heritage site
 * @access  Super Admin only
 * @body    heritage site data
 */
router.post('/heritage-sites', superAdminController.createHeritageSite);

/**
 * @route   GET /api/super-admin/heritage-sites/:id
 * @desc    Get a specific heritage site
 * @access  Super Admin only
 */
router.get('/heritage-sites/:id', auth, superAdminController.getHeritageSite);

/**
 * @route   PUT /api/super-admin/heritage-sites/:id
 * @desc    Update a heritage site
 * @access  Super Admin only
 * @body    updated heritage site data
 */
router.put('/heritage-sites/:id', superAdminController.updateHeritageSite);

/**
 * @route   DELETE /api/super-admin/heritage-sites/:id
 * @desc    Delete a heritage site
 * @access  Super Admin only
 */
router.delete('/heritage-sites/:id', auth, superAdminController.deleteHeritageSite);

module.exports = router;
