const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleHierarchy');
const {
  getSecurityDashboard,
  getSecurityEvents,
  getActiveSessions,
  terminateSession,
  getSecuritySettings,
  updateSecuritySettings,
  resolveSecurityEvent,
  getSecurityStatistics,
  cleanupExpiredSessions
} = require('../controllers/securityController');

// All routes require authentication and super admin role
router.use(auth);
router.use(requireRole(['superAdmin']));

// Security Dashboard
router.get('/dashboard', getSecurityDashboard);

// Security Events
router.get('/events', getSecurityEvents);
router.put('/events/:eventId/resolve', resolveSecurityEvent);

// Active Sessions
router.get('/sessions', getActiveSessions);
router.delete('/sessions/:sessionId', terminateSession);

// Security Settings
router.get('/settings', getSecuritySettings);
router.put('/settings', updateSecuritySettings);

// Security Statistics
router.get('/statistics', getSecurityStatistics);

// System Maintenance
router.post('/cleanup-sessions', cleanupExpiredSessions);

module.exports = router;




