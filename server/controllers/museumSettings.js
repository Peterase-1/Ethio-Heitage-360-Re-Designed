const MuseumSettings = require('../models/MuseumSettings');
const { asyncHandler } = require('../middleware/asyncHandler');
const AppError = require('../utils/AppError');

/**
 * @desc    Get museum settings
 * @route   GET /api/museums/settings
 * @access  Private (museumAdmin, staff)
 */
const getMuseumSettings = asyncHandler(async (req, res) => {
  const museumId = req.user.museumId;

  if (!museumId) {
    throw new AppError('Museum ID not found in user profile', 400);
  }

  const settings = await MuseumSettings.getOrCreateSettings(museumId);

  res.status(200).json({
    success: true,
    data: settings
  });
});

/**
 * @desc    Update museum settings
 * @route   PUT /api/museums/settings
 * @access  Private (museumAdmin, staff)
 */
const updateMuseumSettings = asyncHandler(async (req, res) => {
  const museumId = req.user.museumId;
  const { category, updates } = req.body;

  if (!museumId) {
    throw new AppError('Museum ID not found in user profile', 400);
  }

  if (!category || !updates) {
    throw new AppError('Category and updates are required', 400);
  }

  // Validate category
  const validCategories = ['notifications', 'security', 'general', 'museum'];
  if (!validCategories.includes(category)) {
    throw new AppError(`Invalid category. Must be one of: ${validCategories.join(', ')}`, 400);
  }

  const settings = await MuseumSettings.getOrCreateSettings(museumId);

  // Update lastModifiedBy
  settings.lastModifiedBy = req.user._id;

  // Update the specific category
  await settings.updateCategory(category, updates);

  res.status(200).json({
    success: true,
    data: settings,
    message: `${category} settings updated successfully`
  });
});

/**
 * @desc    Update notification settings
 * @route   PUT /api/museums/settings/notifications
 * @access  Private (museumAdmin, staff)
 */
const updateNotificationSettings = asyncHandler(async (req, res) => {
  const museumId = req.user.museumId;
  const notificationUpdates = req.body;

  if (!museumId) {
    throw new AppError('Museum ID not found in user profile', 400);
  }

  const settings = await MuseumSettings.getOrCreateSettings(museumId);
  settings.lastModifiedBy = req.user._id;

  await settings.updateCategory('notifications', notificationUpdates);

  res.status(200).json({
    success: true,
    data: settings.notifications,
    message: 'Notification settings updated successfully'
  });
});

/**
 * @desc    Update security settings
 * @route   PUT /api/museums/settings/security
 * @access  Private (museumAdmin only)
 */
const updateSecuritySettings = asyncHandler(async (req, res) => {
  const museumId = req.user.museumId;
  const securityUpdates = req.body;

  if (!museumId) {
    throw new AppError('Museum ID not found in user profile', 400);
  }

  // Only museum admin can update security settings
  if (req.user.role !== 'museumAdmin') {
    throw new AppError('Access denied. Museum admin privileges required', 403);
  }

  const settings = await MuseumSettings.getOrCreateSettings(museumId);
  settings.lastModifiedBy = req.user._id;

  await settings.updateCategory('security', securityUpdates);

  res.status(200).json({
    success: true,
    data: settings.security,
    message: 'Security settings updated successfully'
  });
});

/**
 * @desc    Update general settings
 * @route   PUT /api/museums/settings/general
 * @access  Private (museumAdmin, staff)
 */
const updateGeneralSettings = asyncHandler(async (req, res) => {
  const museumId = req.user.museumId;
  const generalUpdates = req.body;

  if (!museumId) {
    throw new AppError('Museum ID not found in user profile', 400);
  }

  const settings = await MuseumSettings.getOrCreateSettings(museumId);
  settings.lastModifiedBy = req.user._id;

  await settings.updateCategory('general', generalUpdates);

  res.status(200).json({
    success: true,
    data: settings.general,
    message: 'General settings updated successfully'
  });
});

/**
 * @desc    Update museum-specific settings
 * @route   PUT /api/museums/settings/museum
 * @access  Private (museumAdmin only)
 */
const updateMuseumSpecificSettings = asyncHandler(async (req, res) => {
  const museumId = req.user.museumId;
  const museumUpdates = req.body;

  if (!museumId) {
    throw new AppError('Museum ID not found in user profile', 400);
  }

  // Only museum admin can update museum-specific settings
  if (req.user.role !== 'museumAdmin') {
    throw new AppError('Access denied. Museum admin privileges required', 403);
  }

  const settings = await MuseumSettings.getOrCreateSettings(museumId);
  settings.lastModifiedBy = req.user._id;

  await settings.updateCategory('museum', museumUpdates);

  res.status(200).json({
    success: true,
    data: settings.museum,
    message: 'Museum settings updated successfully'
  });
});

/**
 * @desc    Add IP to whitelist
 * @route   POST /api/museums/settings/security/whitelist
 * @access  Private (museumAdmin only)
 */
const addToWhitelist = asyncHandler(async (req, res) => {
  const museumId = req.user.museumId;
  const { ip, description } = req.body;

  if (!museumId) {
    throw new AppError('Museum ID not found in user profile', 400);
  }

  // Only museum admin can manage IP whitelist
  if (req.user.role !== 'museumAdmin') {
    throw new AppError('Access denied. Museum admin privileges required', 403);
  }

  if (!ip) {
    throw new AppError('IP address is required', 400);
  }

  const settings = await MuseumSettings.getOrCreateSettings(museumId);
  settings.lastModifiedBy = req.user._id;

  await settings.addToWhitelist(ip, description);

  res.status(200).json({
    success: true,
    data: settings.security.ipWhitelist,
    message: 'IP address added to whitelist successfully'
  });
});

/**
 * @desc    Remove IP from whitelist
 * @route   DELETE /api/museums/settings/security/whitelist/:ip
 * @access  Private (museumAdmin only)
 */
const removeFromWhitelist = asyncHandler(async (req, res) => {
  const museumId = req.user.museumId;
  const { ip } = req.params;

  if (!museumId) {
    throw new AppError('Museum ID not found in user profile', 400);
  }

  // Only museum admin can manage IP whitelist
  if (req.user.role !== 'museumAdmin') {
    throw new AppError('Access denied. Museum admin privileges required', 403);
  }

  if (!ip) {
    throw new AppError('IP address is required', 400);
  }

  const settings = await MuseumSettings.getOrCreateSettings(museumId);
  settings.lastModifiedBy = req.user._id;

  await settings.removeFromWhitelist(ip);

  res.status(200).json({
    success: true,
    data: settings.security.ipWhitelist,
    message: 'IP address removed from whitelist successfully'
  });
});

/**
 * @desc    Change user password
 * @route   PUT /api/museums/settings/password
 * @access  Private (museumAdmin, staff)
 */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user._id;

  if (!currentPassword || !newPassword) {
    throw new AppError('Current password and new password are required', 400);
  }

  // Find user and verify current password
  const User = require('../models/User');
  const user = await User.findById(userId).select('+password');

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Check if current password is correct
  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    throw new AppError('Current password is incorrect', 401);
  }

  // Validate new password strength
  if (newPassword.length < 8) {
    throw new AppError('New password must be at least 8 characters long', 400);
  }

  // Update password
  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password changed successfully'
  });
});

/**
 * @desc    Reset settings to default
 * @route   POST /api/museums/settings/reset
 * @access  Private (museumAdmin only)
 */
const resetToDefaults = asyncHandler(async (req, res) => {
  const museumId = req.user.museumId;

  if (!museumId) {
    throw new AppError('Museum ID not found in user profile', 400);
  }

  // Only museum admin can reset settings
  if (req.user.role !== 'museumAdmin') {
    throw new AppError('Access denied. Museum admin privileges required', 403);
  }

  const settings = await MuseumSettings.getOrCreateSettings(museumId);
  settings.lastModifiedBy = req.user._id;

  // Reset to default values
  settings.notifications = {
    email: true,
    sms: false,
    push: true,
    eventReminders: true,
    staffUpdates: true,
    systemAlerts: true
  };

  settings.security = {
    twoFactor: false,
    sessionTimeout: 30,
    passwordExpiry: 90,
    loginAttempts: 5,
    ipWhitelist: []
  };

  settings.general = {
    language: 'en',
    timezone: 'Africa/Addis_Ababa',
    theme: 'light',
    dateFormat: 'MM/DD/YYYY',
    currency: 'USD'
  };

  settings.museum = {
    autoBackup: true,
    backupFrequency: 'daily',
    dataRetention: 365,
    analyticsEnabled: true,
    publicProfile: true
  };

  await settings.save();

  res.status(200).json({
    success: true,
    data: settings,
    message: 'Settings reset to default values successfully'
  });
});

module.exports = {
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
};
