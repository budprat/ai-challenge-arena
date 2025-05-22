const express = require('express');
const path = require('path');
const app = express();
const PORT = 3001; // Changed from 3000 to avoid port conflict

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve the simple HTML file as the root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'simple.html'));
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Open your browser to http://localhost:${PORT} to see the test page`);
});
