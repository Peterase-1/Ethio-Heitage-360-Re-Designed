const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'Virtual museum data' });
});

module.exports = router;

