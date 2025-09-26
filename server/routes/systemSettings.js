const express = require('express');
const router = express.Router();
const SystemSettings = require('../models/SystemSettings');
const { auth, authorize } = require('../middleware/auth');

// All routes require super-admin authentication
router.use(auth, authorize('super-admin'));

/**
 * @desc    Get all system settings
 * @route   GET /api/system-settings
 * @access  Super Admin
 */
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    let query = {};
    
    if (category) {
      query.category = category;
    }

    const settings = await SystemSettings.find(query)
      .populate('lastModifiedBy', 'name email')
      .sort({ category: 1, key: 1 });

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve system settings',
      error: error.message
    });
  }
});

/**
 * @desc    Get system settings by category
 * @route   GET /api/system-settings/category/:category
 * @access  Super Admin
 */
router.get('/category/:category', async (req, res) => {
  try {
    const settings = await SystemSettings.getSettingsByCategory(req.params.category);
    
    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve settings',
      error: error.message
    });
  }
});

/**
 * @desc    Get public settings (for frontend configuration)
 * @route   GET /api/system-settings/public
 * @access  Public
 */
router.get('/public', async (req, res) => {
  try {
    const settings = await SystemSettings.getPublicSettings();
    
    // Convert to key-value pairs for easier frontend consumption
    const settingsMap = {};
    settings.forEach(setting => {
      settingsMap[setting.key] = setting.value;
    });

    res.json({
      success: true,
      data: settingsMap
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve public settings',
      error: error.message
    });
  }
});

/**
 * @desc    Get single setting by key
 * @route   GET /api/system-settings/key/:key
 * @access  Super Admin
 */
router.get('/key/:key', async (req, res) => {
  try {
    const setting = await SystemSettings.getSetting(req.params.key)
      .populate('lastModifiedBy', 'name email');
    
    if (!setting) {
      return res.status(404).json({
        success: false,
        message: 'Setting not found'
      });
    }

    res.json({
      success: true,
      data: setting
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve setting',
      error: error.message
    });
  }
});

/**
 * @desc    Create new system setting
 * @route   POST /api/system-settings
 * @access  Super Admin
 */
router.post('/', async (req, res) => {
  try {
    const {
      category,
      key,
      value,
      dataType,
      description,
      isPublic = false,
      isEditable = true,
      validation = {}
    } = req.body;

    // Check if setting already exists
    const existingSetting = await SystemSettings.findOne({ key });
    if (existingSetting) {
      return res.status(400).json({
        success: false,
        message: 'Setting with this key already exists'
      });
    }

    const setting = await SystemSettings.create({
      category,
      key,
      value,
      dataType,
      description,
      isPublic,
      isEditable,
      validation,
      lastModifiedBy: req.user.id
    });

    res.status(201).json({
      success: true,
      data: setting,
      message: 'System setting created successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to create system setting',
      error: error.message
    });
  }
});

/**
 * @desc    Update system setting
 * @route   PUT /api/system-settings/:id
 * @access  Super Admin
 */
router.put('/:id', async (req, res) => {
  try {
    const setting = await SystemSettings.findById(req.params.id);
    
    if (!setting) {
      return res.status(404).json({
        success: false,
        message: 'Setting not found'
      });
    }

    const { value, reason = '' } = req.body;
    
    await setting.updateValue(value, req.user.id, reason);

    res.json({
      success: true,
      data: setting,
      message: 'Setting updated successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to update setting',
      error: error.message
    });
  }
});

/**
 * @desc    Update setting by key
 * @route   PUT /api/system-settings/key/:key
 * @access  Super Admin
 */
router.put('/key/:key', async (req, res) => {
  try {
    const { value, reason = '' } = req.body;
    
    const setting = await SystemSettings.setSetting(req.params.key, value, req.user.id, reason);

    res.json({
      success: true,
      data: setting,
      message: 'Setting updated successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to update setting',
      error: error.message
    });
  }
});

/**
 * @desc    Delete system setting
 * @route   DELETE /api/system-settings/:id
 * @access  Super Admin
 */
router.delete('/:id', async (req, res) => {
  try {
    const setting = await SystemSettings.findById(req.params.id);
    
    if (!setting) {
      return res.status(404).json({
        success: false,
        message: 'Setting not found'
      });
    }

    await setting.deleteOne();

    res.json({
      success: true,
      message: 'Setting deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete setting',
      error: error.message
    });
  }
});

/**
 * @desc    Initialize default visitor dashboard settings
 * @route   POST /api/system-settings/init-visitor-dashboard
 * @access  Super Admin
 */
router.post('/init-visitor-dashboard', async (req, res) => {
  try {
    const defaultSettings = [
      {
        category: 'features',
        key: 'visitor_sidebar_notes',
        value: true,
        dataType: 'boolean',
        description: 'Enable/disable notes feature in visitor sidebar',
        isPublic: true,
        isEditable: true
      },
      {
        category: 'features',
        key: 'visitor_sidebar_goals',
        value: true,
        dataType: 'boolean',
        description: 'Enable/disable goals feature in visitor sidebar',
        isPublic: true,
        isEditable: true
      },
      {
        category: 'features',
        key: 'visitor_sidebar_flashcards',
        value: true,
        dataType: 'boolean',
        description: 'Enable/disable flashcards feature in visitor sidebar',
        isPublic: true,
        isEditable: true
      },
      {
        category: 'features',
        key: 'visitor_sidebar_analytics',
        value: true,
        dataType: 'boolean',
        description: 'Enable/disable analytics feature in visitor sidebar',
        isPublic: true,
        isEditable: true
      },
      {
        category: 'features',
        key: 'visitor_sidebar_achievements',
        value: true,
        dataType: 'boolean',
        description: 'Enable/disable achievements feature in visitor sidebar',
        isPublic: true,
        isEditable: true
      },
      {
        category: 'features',
        key: 'visitor_sidebar_social',
        value: true,
        dataType: 'boolean',
        description: 'Enable/disable social/community features in visitor sidebar',
        isPublic: true,
        isEditable: true
      },
      {
        category: 'features',
        key: 'visitor_sidebar_bookmarks',
        value: true,
        dataType: 'boolean',
        description: 'Enable/disable bookmarks feature in visitor sidebar',
        isPublic: true,
        isEditable: true
      }
    ];

    const createdSettings = [];
    
    for (const settingData of defaultSettings) {
      // Check if setting already exists
      const existing = await SystemSettings.findOne({ key: settingData.key });
      if (!existing) {
        const setting = await SystemSettings.create({
          ...settingData,
          lastModifiedBy: req.user.id
        });
        createdSettings.push(setting);
      }
    }

    res.json({
      success: true,
      data: createdSettings,
      message: `Initialized ${createdSettings.length} visitor dashboard settings`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to initialize visitor dashboard settings',
      error: error.message
    });
  }
});

module.exports = router;
