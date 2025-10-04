const express = require('express');
const router = express.Router();

// Basic tours routes to prevent server startup errors
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Tours API endpoint',
    data: []
  });
});

router.get('/featured', (req, res) => {
  res.json({
    success: true,
    message: 'Featured tours',
    data: []
  });
});

module.exports = router;
