// Routes for signup, login, logout and checking who is logged in.

const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { requireLogin } = require('../middleware/auth');

const router = express.Router();

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Remembers the user in the session. The browser only receives a cookie with the session id.
function startSession(req, user) {
  req.session.userId = user.id;
  req.session.role = user.role;
}

// POST /api/auth/signup
// Creates a new account. The role is always Student, whatever the request body says.
router.post('/signup', async (req, res) => {
  // req.body is undefined when the request has no JSON body, so fall back to an empty object.
  const body = req.body || {};
  const name = (body.name || '').trim();
  const email = (body.email || '').trim().toLowerCase();
  const password = body.password || '';

  if (!name) return res.status(400).json({ message: 'Name is required.' });
  if (!email) return res.status(400).json({ message: 'Email is required.' });
  if (!EMAIL_PATTERN.test(email)) return res.status(400).json({ message: 'Enter a valid email address.' });
  if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters.' });

  const existing = await User.findOne({ email });
  if (existing) return res.status(409).json({ message: 'An account with this email already exists.' });

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashedPassword, role: 'Student' });

  // Log the new student in straight away.
  startSession(req, user);
  res.status(201).json(user);
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const body = req.body || {};
  const email = (body.email || '').trim().toLowerCase();
  const password = body.password || '';

  if (!email || !password) return res.status(400).json({ message: 'Email and password are required.' });

  // The same message is used for a wrong email and a wrong password,
  // so nobody can find out which emails have accounts.
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: 'Incorrect email or password.' });

  const passwordMatches = await bcrypt.compare(password, user.password);
  if (!passwordMatches) return res.status(401).json({ message: 'Incorrect email or password.' });

  startSession(req, user);
  res.json(user);
});

// POST /api/auth/logout
router.post('/logout', requireLogin, (req, res, next) => {
  req.session.destroy((error) => {
    if (error) return next(error);
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out.' });
  });
});

// GET /api/auth/me
// Returns the logged-in user. The frontend calls this on page load to restore the login.
router.get('/me', requireLogin, async (req, res) => {
  const user = await User.findById(req.session.userId);
  if (!user) return res.status(401).json({ message: 'Please log in first.' });

  res.json(user);
});

module.exports = router;
