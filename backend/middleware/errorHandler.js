// Middleware for requests that no route handled and for errors thrown inside routes.

// Runs when the URL does not match any route.
function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

// Express sends every error here because this function takes four arguments.
// It turns the error into a JSON response with a suitable status code.
function errorHandler(err, req, res, next) {
  // An id in the URL that is not a valid MongoDB id.
  if (err.name === 'CastError') {
    return res.status(404).json({ message: 'Record not found.' });
  }

  // A document that breaks the rules of its Mongoose schema.
  if (err.name === 'ValidationError') {
    const firstError = Object.values(err.errors)[0];
    return res.status(400).json({ message: firstError.message });
  }

  // A request body that is not valid JSON.
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'The request body is not valid JSON.' });
  }

  console.error(err);
  res.status(500).json({ message: 'Something went wrong on the server.' });
}

module.exports = { notFound, errorHandler };
