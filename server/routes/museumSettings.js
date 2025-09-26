const express = require('express');
const router = express.Router();
const {
  getMuseumSettings,
  updateMuseumSettings,
  updateNotificationSettings,
  updateSecuritySettings,
  updateGeneralSettings,
  updateMuseumSpecificSettings,
  addToWhitelist,
  removeFromWhitelist,
  changePassword,
  resetToDefaults
} = require('../controllers/museumSettings');

// Import middleware
const { auth, authorize } = require('../middleware/auth');

/**
 * @desc    Get museum settings
 * @route   GET /api/museums/settings
 * @access  Private (museumAdmin, staff)
 */
router.get('/',
  auth,
  authorize(['museumAdmin', 'staff']),
  getMuseumSettings
);

/**
 * @desc    Update museum settings (general update)
 * @route   PUT /api/museums/settings
 * @access  Private (museumAdmin, staff)
 */
router.put('/',
  auth,
  authorize(['museumAdmin', 'staff']),
  updateMuseumSettings
);

/**
 * @desc    Update notification settings
 * @route   PUT /api/museums/settings/notifications
 * @access  Private (museumAdmin, staff)
 */
router.put('/notifications',
  auth,
  authorize(['museumAdmin', 'staff']),
  updateNotificationSettings
);

/**
 * @desc    Update security settings
 * @route   PUT /api/museums/settings/security
 * @access  Private (museumAdmin only)
 */
router.put('/security',
  auth,
  authorize(['museumAdmin']),
  updateSecuritySettings
);

/**
 * @desc    Update general settings
 * @route   PUT /api/museums/settings/general
 * @access  Private (museumAdmin, staff)
 */
router.put('/general',
  auth,
  authorize(['museumAdmin', 'staff']),
  updateGeneralSettings
);

/**
 * @desc    Update museum-specific settings
 * @route   PUT /api/museums/settings/museum
 * @access  Private (museumAdmin only)
 */
router.put('/museum',
  auth,
  authorize(['museumAdmin']),
  updateMuseumSpecificSettings
);

/**
 * @desc    Add IP to whitelist
 * @route   POST /api/museums/settings/security/whitelist
 * @access  Private (museumAdmin only)
 */
router.post('/security/whitelist',
  auth,
  authorize(['museumAdmin']),
  addToWhitelist
);

/**
 * @desc    Remove IP from whitelist
 * @route   DELETE /api/museums/settings/security/whitelist/:ip
 * @access  Private (museumAdmin only)
 */
router.delete('/security/whitelist/:ip',
  auth,
  authorize(['museumAdmin']),
  removeFromWhitelist
);

/**
 * @desc    Change user password
 * @route   PUT /api/museums/settings/password
 * @access  Private (museumAdmin, staff)
 */
router.put('/password',
  auth,
  authorize(['museumAdmin', 'staff']),
  changePassword
);

/**
 * @desc    Reset settings to default
 * @route   POST /api/museums/settings/reset
 * @access  Private (museumAdmin only)
 */
router.post('/reset',
  auth,
  authorize(['museumAdmin']),
  resetToDefaults
);

module.exports = router;
