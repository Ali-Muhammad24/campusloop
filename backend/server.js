// Entry point of the CampusLoop backend.

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Allow the React app to call this server and send cookies with its requests.
app.use(cors({ origin: CLIENT_URL, credentials: true }));

// Read JSON request bodies into req.body.
app.use(express.json());

// Simple route to check that the server is running.
app.get('/api/health', (req, res) => {
  res.json({ message: 'CampusLoop API is running' });
});

// Connect to the database first, then start accepting requests.
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Could not connect to MongoDB:', error.message);
    process.exit(1);
  });
