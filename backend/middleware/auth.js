// Middleware that protects routes. A middleware runs before the route handler and
// either stops the request with an error or calls next() to let it continue.

// Blocks the request unless the user is logged in.
function requireLogin(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Please log in first.' });
  }
  next();
}

// Blocks the request unless the logged-in user has the given role.
// Use it after requireLogin, for example: requireLogin, requireRole('Admin')
function requireRole(role) {
  return (req, res, next) => {
    if (req.session.role !== role) {
      return res.status(403).json({ message: `Only ${role} accounts can do this.` });
    }
    next();
  };
}

module.exports = { requireLogin, requireRole };
