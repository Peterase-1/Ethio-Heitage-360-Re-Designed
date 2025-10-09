const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleHierarchy');
const {
  getSystemSettings,
  getPublicSettings,
  updateSystemSettings,
  resetSettings,
  getSettingsHistory,
  backupDatabase,
  generateReports,
  getSystemHealth,
  downloadReport
} = require('../controllers/systemSettingsController');

// Public routes (no authentication required)
router.get('/public', getPublicSettings);

// Report Downloads (public - no auth required)
router.get('/reports/download/:filename', downloadReport);

// Protected routes (require authentication and super admin role)
router.use(auth);
router.use(requireRole(['superAdmin']));

// System Settings CRUD
router.get('/', getSystemSettings);
router.put('/', updateSystemSettings);
router.post('/reset', resetSettings);

// Settings History
router.get('/history', getSettingsHistory);

// System Operations
router.post('/backup', backupDatabase);
router.get('/reports', generateReports);
router.get('/health', getSystemHealth);

module.exports = router;