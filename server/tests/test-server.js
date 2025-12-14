const express = require('express');
const app = express();

app.get('/test', (req, res) => {
  res.json({ message: 'Test server is working' });
});

app.listen(5001, () => {
  console.log('Test server running on port 5001');
});
