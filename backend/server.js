// Entry point of the CampusLoop backend.

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const session = require('express-session');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const equipmentRoutes = require('./routes/equipment');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Allow the React app to call this server and send cookies with its requests.
app.use(cors({ origin: CLIENT_URL, credentials: true }));

// Read JSON request bodies into req.body.
app.use(express.json());

// Sessions keep users logged in. The session data stays on the server and the browser
// only stores a cookie with the session id.
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'campusloop-dev-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true, // JavaScript in the browser cannot read the cookie
      maxAge: 1000 * 60 * 60 * 24, // one day
    },
  }),
);

// Simple route to check that the server is running.
app.get('/api/health', (req, res) => {
  res.json({ message: 'CampusLoop API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/equipment', equipmentRoutes);

// These two must come after all the routes.
app.use(notFound);
app.use(errorHandler);

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
