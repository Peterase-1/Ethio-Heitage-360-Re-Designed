const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  getArtifacts,
  getArtifact,
  getVirtualTours,
  bookVirtualTour,
  getUserBookings,
  toggleFavorite,
  getArtifactCategories
} = require('../controllers/virtualMuseum');

// Public routes
router.get('/artifacts', getArtifacts);
router.get('/artifacts/categories', getArtifactCategories);
router.get('/artifacts/:id', getArtifact);
router.get('/tours', getVirtualTours);

// Protected routes (require authentication)
router.post('/tours/book', auth, bookVirtualTour);
router.get('/bookings', auth, getUserBookings);
router.post('/artifacts/:id/favorite', auth, toggleFavorite);

module.exports = router;
