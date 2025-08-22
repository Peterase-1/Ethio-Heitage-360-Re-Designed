const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { getStats, getUsers, updateUserRole, deleteUser } = require('../controllers/admin');

// Protect all admin routes; allow admin and super_admin
router.use(auth);
router.use((req, res, next) => {
  const allowed = ['admin', 'super_admin'];
  if (!req.user || !allowed.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }
  next();
});

// Stats
router.get('/stats', getStats);

// Users management
router.get('/users', getUsers);
router.post('/users', require('../controllers/admin').createUser);
router.put('/users/:id', require('../controllers/admin').updateUser);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

// Museums oversight
router.get('/museums', require('../controllers/admin').listMuseums);
router.put('/museums/:id/verify', require('../controllers/admin').setMuseumVerified);

module.exports = router;

