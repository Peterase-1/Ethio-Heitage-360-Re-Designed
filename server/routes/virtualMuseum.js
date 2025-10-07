const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  getVirtualMuseumArtifacts,
  getFeaturedArtifacts,
  getPopularArtifacts,
  getArtifactsByMuseum,
  getArtifactDetails,
  likeArtifact,
  rateArtifact,
  getVirtualMuseumStats
} = require('../controllers/virtualMuseum');

// Public routes - Virtual Museum Artifacts
router.get('/artifacts', getVirtualMuseumArtifacts);
router.get('/artifacts/featured', getFeaturedArtifacts);
router.get('/artifacts/popular', getPopularArtifacts);
router.get('/artifacts/museum/:museumId', getArtifactsByMuseum);
router.get('/artifacts/:id', getArtifactDetails);
router.get('/stats', getVirtualMuseumStats);

// Protected routes (require authentication)
router.post('/artifacts/:id/like', auth, likeArtifact);
router.post('/artifacts/:id/rate', auth, rateArtifact);

module.exports = router;