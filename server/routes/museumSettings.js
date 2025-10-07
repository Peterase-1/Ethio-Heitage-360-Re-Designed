const express = require('express');
const bcrypt = require('bcryptjs');
const Settings = require('../models/MuseumSettings');
const User = require('../models/User');
const {
  auth: requireAuth,
  requirePermission
} = require('../middleware/auth');
const {
  validateRequest,
  handleValidationErrors,
  validateObjectId
} = require('../middleware/validation');

const router = express.Router();

// Simple role-based middleware
const requireMuseumAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'museumAdmin' || req.user.role === 'superAdmin')) {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: 'Access denied. Museum admin or super admin required.'
  });
};

const requireSuperAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'superAdmin') {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: 'Access denied. Super admin required.'
  });
};

// ============ SETTINGS ROUTES ============

/**
 * GET /api/museums/settings
 * Get current user's settings
 */
router.get('/settings', requireAuth, async (req, res) => {
  try {
    console.log('=== GET SETTINGS REQUEST ===');
    console.log('User ID:', req.user._id);
    console.log('User Role:', req.user.role);

    const settings = await Settings.getOrCreateSettings(req.user._id);

    console.log('Settings found/created:', !!settings);

    res.json({
      success: true,
      message: 'Settings retrieved successfully',
      data: settings
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving settings',
      error: error.message
    });
  }
});

/**
 * PUT /api/museums/settings/general
 * Update general settings
 */
router.put('/settings/general', requireAuth, async (req, res) => {
  try {
    console.log('=== UPDATE GENERAL SETTINGS ===');
    console.log('Updates:', req.body);

    const settings = await Settings.getOrCreateSettings(req.user._id);
    await settings.updateCategory('general', req.body);

    res.json({
      success: true,
      message: 'General settings updated successfully',
      data: settings.general
    });
  } catch (error) {
    console.error('Update general settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating general settings',
      error: error.message
    });
  }
});

/**
 * PUT /api/museums/settings/security
 * Update security settings
 */
router.put('/settings/security', requireMuseumAdmin, async (req, res) => {
  try {
    console.log('=== UPDATE SECURITY SETTINGS ===');
    console.log('Updates:', req.body);

    const settings = await Settings.getOrCreateSettings(req.user._id);

    // Don't allow updating ipWhitelist through this endpoint
    const { ipWhitelist, ...securityUpdates } = req.body;

    await settings.updateCategory('security', securityUpdates);

    res.json({
      success: true,
      message: 'Security settings updated successfully',
      data: settings.security
    });
  } catch (error) {
    console.error('Update security settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating security settings',
      error: error.message
    });
  }
});

/**
 * PUT /api/museums/settings/notifications
 * Update notification settings
 */
router.put('/settings/notifications', requireAuth, async (req, res) => {
  try {
    console.log('=== UPDATE NOTIFICATION SETTINGS ===');
    console.log('Updates:', req.body);

    const settings = await Settings.getOrCreateSettings(req.user._id);
    await settings.updateCategory('notifications', req.body);

    res.json({
      success: true,
      message: 'Notification settings updated successfully',
      data: settings.notifications
    });
  } catch (error) {
    console.error('Update notification settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating notification settings',
      error: error.message
    });
  }
});

/**
 * PUT /api/museums/settings/museum
 * Update museum-specific settings
 */
router.put('/settings/museum', requireMuseumAdmin, async (req, res) => {
  try {
    console.log('=== UPDATE MUSEUM SETTINGS ===');
    console.log('Updates:', req.body);

    const settings = await Settings.getOrCreateSettings(req.user._id);
    await settings.updateCategory('museum', req.body);

    res.json({
      success: true,
      message: 'Museum settings updated successfully',
      data: settings.museum
    });
  } catch (error) {
    console.error('Update museum settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating museum settings',
      error: error.message
    });
  }
});

/**
 * PUT /api/museums/settings
 * Update any settings category (generic endpoint)
 */
router.put('/settings', requireAuth, async (req, res) => {
  try {
    console.log('=== UPDATE SETTINGS (GENERIC) ===');
    console.log('Category:', req.body.category);
    console.log('Updates:', req.body.updates);

    const { category, updates } = req.body;

    // Check permissions for specific categories
    if (category === 'security' || category === 'museum') {
      if (!['museum', 'admin', 'super_admin', 'museum_curator'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions for this settings category'
        });
      }
    }

    const settings = await Settings.getOrCreateSettings(req.user._id);
    await settings.updateCategory(category, updates);

    res.json({
      success: true,
      message: `${category} settings updated successfully`,
      data: settings[category]
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating settings',
      error: error.message
    });
  }
});

// ============ IP WHITELIST MANAGEMENT ============

/**
 * POST /api/museums/settings/security/whitelist
 * Add IP to whitelist
 */
router.post('/settings/security/whitelist', requireMuseumAdmin, async (req, res) => {
  try {
    console.log('=== ADD IP TO WHITELIST ===');
    console.log('IP:', req.body.ip);
    console.log('Description:', req.body.description);

    const { ip, description } = req.body;
    const settings = await Settings.getOrCreateSettings(req.user._id);

    await settings.addToWhitelist(ip, description);

    res.json({
      success: true,
      message: 'IP address added to whitelist successfully',
      data: {
        ip,
        description,
        whitelist: settings.security.ipWhitelist
      }
    });
  } catch (error) {
    console.error('Add IP to whitelist error:', error);

    if (error.message === 'IP address already in whitelist') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error adding IP to whitelist',
      error: error.message
    });
  }
});

/**
 * DELETE /api/museums/settings/security/whitelist/:ip
 * Remove IP from whitelist
 */
router.delete('/settings/security/whitelist/:ip', requireMuseumAdmin, async (req, res) => {
  try {
    console.log('=== REMOVE IP FROM WHITELIST ===');
    console.log('IP:', req.params.ip);

    const { ip } = req.params;
    const settings = await Settings.getOrCreateSettings(req.user._id);

    await settings.removeFromWhitelist(ip);

    res.json({
      success: true,
      message: 'IP address removed from whitelist successfully',
      data: {
        removedIp: ip,
        whitelist: settings.security.ipWhitelist
      }
    });
  } catch (error) {
    console.error('Remove IP from whitelist error:', error);

    if (error.message === 'IP address not found in whitelist') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error removing IP from whitelist',
      error: error.message
    });
  }
});

/**
 * GET /api/museums/settings/security/whitelist
 * Get IP whitelist
 */
router.get('/settings/security/whitelist', requireMuseumAdmin, async (req, res) => {
  try {
    console.log('=== GET IP WHITELIST ===');

    const settings = await Settings.getOrCreateSettings(req.user._id);

    res.json({
      success: true,
      message: 'IP whitelist retrieved successfully',
      data: settings.security.ipWhitelist
    });
  } catch (error) {
    console.error('Get IP whitelist error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving IP whitelist',
      error: error.message
    });
  }
});

// ============ PASSWORD MANAGEMENT ============

/**
 * PUT /api/museums/settings/password
 * Change user password
 */
router.put('/settings/password', requireAuth, async (req, res) => {
  try {
    console.log('=== CHANGE PASSWORD ===');
    console.log('User ID:', req.user._id);

    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Check if new password is different from current
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: 'New password must be different from current password'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    console.log('Password changed successfully for user:', user.email);

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error changing password',
      error: error.message
    });
  }
});

// ============ SETTINGS MANAGEMENT ============

/**
 * POST /api/museums/settings/reset
 * Reset settings to defaults
 */
router.post('/settings/reset', requireAuth, async (req, res) => {
  try {
    console.log('=== RESET SETTINGS TO DEFAULTS ===');
    console.log('User ID:', req.user._id);

    const settings = await Settings.getOrCreateSettings(req.user._id);
    await settings.resetToDefaults();

    res.json({
      success: true,
      message: 'Settings reset to defaults successfully',
      data: settings
    });
  } catch (error) {
    console.error('Reset settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error resetting settings',
      error: error.message
    });
  }
});

/**
 * GET /api/museums/settings/defaults
 * Get default settings (without saving)
 */
router.get('/settings/defaults', requireAuth, async (req, res) => {
  try {
    console.log('=== GET DEFAULT SETTINGS ===');

    const defaultSettings = new Settings({ userId: req.user._id });

    res.json({
      success: true,
      message: 'Default settings retrieved successfully',
      data: defaultSettings
    });
  } catch (error) {
    console.error('Get default settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving default settings',
      error: error.message
    });
  }
});

// ============ SYSTEM SETTINGS (Super Admin Only) ============

/**
 * PUT /api/museums/settings/system
 * Update system settings (super admin only)
 */
router.put('/settings/system', requireSuperAdmin, async (req, res) => {
  try {
    console.log('=== UPDATE SYSTEM SETTINGS ===');
    console.log('Updates:', req.body);

    const { siteName, siteUrl, adminEmail } = req.body;

    // Validate inputs
    if (adminEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid admin email format'
      });
    }

    const settings = await Settings.getOrCreateSettings(req.user._id);
    await settings.updateCategory('system', req.body);

    res.json({
      success: true,
      message: 'System settings updated successfully',
      data: settings.system
    });
  } catch (error) {
    console.error('Update system settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating system settings',
      error: error.message
    });
  }
});

/**
 * GET /api/museums/settings/system
 * Get system settings (super admin only)
 */
router.get('/settings/system', requireSuperAdmin, async (req, res) => {
  try {
    console.log('=== GET SYSTEM SETTINGS ===');

    const settings = await Settings.getOrCreateSettings(req.user._id);

    res.json({
      success: true,
      message: 'System settings retrieved successfully',
      data: settings.system
    });
  } catch (error) {
    console.error('Get system settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving system settings',
      error: error.message
    });
  }
});

module.exports = router;
