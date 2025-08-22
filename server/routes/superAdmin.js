const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { requireSuperAdmin } = require('../middleware/roleHierarchy');
const superAdminController = require('../controllers/superAdmin');

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
router.post('/users', superAdminController.createUser);

/**
 * @route   PUT /api/super-admin/users/:id
 * @desc    Update any user's information and role assignment
 * @access  Super Admin only
 * @params  id - User ID
 * @body    User fields to update
 */
router.put('/users/:id', superAdminController.updateUser);

/**
 * @route   DELETE /api/super-admin/users/:id
 * @desc    Delete a user account
 * @access  Super Admin only
 * @params  id - User ID
 */
router.delete('/users/:id', superAdminController.deleteUser);

/**
 * @route   POST /api/super-admin/users/import
 * @desc    Bulk import users from CSV/JSON
 * @access  Super Admin only
 * @body    users[], options
 */
router.post('/users/import', superAdminController.importUsers);

/**
 * @route   GET /api/super-admin/users/export
 * @desc    Export users data in CSV/JSON format
 * @access  Super Admin only
 * @params  format (csv|json), filters
 */
router.get('/users/export', superAdminController.exportUsers);

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
router.put('/users/:id/verify', superAdminController.verifyUser);

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
router.put('/museums/:id/status', superAdminController.updateMuseumStatus);

// ======================
// HERITAGE SITES
// ======================

/**
 * @route   GET /api/super-admin/heritage-sites
 * @desc    Get all heritage sites
 * @access  Super Admin only
 * @params  page, limit, status, search
 */
router.get('/heritage-sites', superAdminController.getHeritageSites);

/**
 * @route   POST /api/super-admin/heritage-sites
 * @desc    Create a new heritage site
 * @access  Super Admin only
 * @body    Site data
 */
router.post('/heritage-sites', superAdminController.createHeritageSite);

/**
 * @route   PUT /api/super-admin/heritage-sites/:id
 * @desc    Update heritage site information
 * @access  Super Admin only
 * @params  id - Site ID
 * @body    Site data to update
 */
router.put('/heritage-sites/:id', superAdminController.updateHeritageSite);

/**
 * @route   DELETE /api/super-admin/heritage-sites/:id
 * @desc    Delete heritage site
 * @access  Super Admin only
 * @params  id - Site ID
 */
router.delete('/heritage-sites/:id', superAdminController.deleteHeritageSite);

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
router.put('/system-settings/:key', superAdminController.updateSystemSetting);

/**
 * @route   POST /api/super-admin/system-settings
 * @desc    Create a new system setting
 * @access  Super Admin only
 * @body    Setting data (category, key, value, dataType, description, etc.)
 */
router.post('/system-settings', superAdminController.createSystemSetting);

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
router.put('/content/artifacts/:id/approve', superAdminController.approveArtifact);

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
router.put('/rentals/:id/approve', superAdminController.approveRental);

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

module.exports = router;
