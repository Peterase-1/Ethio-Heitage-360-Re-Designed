const express = require('express');
const router = express.Router();
const {
  getHeritageSites,
  getHeritageSite,
  getNearbyHeritageSites,
  getSiteFilters,
  searchHeritageSites
} = require('../controllers/map');

// Heritage sites routes
router.get('/heritage-sites', getHeritageSites);
router.get('/heritage-sites/search', searchHeritageSites);
router.get('/heritage-sites/nearby', getNearbyHeritageSites);
router.get('/heritage-sites/filters', getSiteFilters);
router.get('/heritage-sites/:id', getHeritageSite);

// Legacy routes for backward compatibility
router.get('/museums', getHeritageSites); // Museums are included in heritage sites
router.get('/', (req, res) => {
  res.json({ 
    message: 'Ethiopian Heritage Map API',
    version: '1.0.0',
    endpoints: {
      'heritage-sites': '/api/map/heritage-sites',
      'search': '/api/map/heritage-sites/search?query=lalibela',
      'nearby': '/api/map/heritage-sites/nearby?lat=12&lng=39&radius=50',
      'filters': '/api/map/heritage-sites/filters',
      'single-site': '/api/map/heritage-sites/:id'
    }
  });
});

module.exports = router;

