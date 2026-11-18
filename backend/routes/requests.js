// Routes for borrowing requests: creating them, listing them and the
// Admin actions (approve, reject, mark returned).

const express = require('express');
const Request = require('../models/Request');
const Equipment = require('../models/Equipment');
const { requireLogin, requireRole } = require('../middleware/auth');

const router = express.Router();

const adminOnly = [requireLogin, requireRole('Admin')];
const studentOnly = [requireLogin, requireRole('Student')];

// Tells Mongoose to replace the two ids with the linked documents (only their names).
const withNames = [
  { path: 'studentId', select: 'name' },
  { path: 'equipmentId', select: 'name' },
];

// Builds the object sent to the frontend from a request that was loaded with names.
function toResponse(request) {
  return {
    id: request.id,
    studentId: request.studentId.id,
    studentName: request.studentId.name,
    equipmentId: request.equipmentId.id,
    equipmentName: request.equipmentId.name,
    purpose: request.purpose,
    expectedReturnDate: request.expectedReturnDate,
    status: request.status,
  };
}

// Returns the current date as YYYY-MM-DD in the server's local time.
function getToday() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

// Checks the format and that the date really exists (for example, rejects 2026-02-30).
function isRealDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

// POST /api/requests
// A student asks to borrow an item. The student comes from the session, not from the body,
// so nobody can create a request under another name.
router.post('/', studentOnly, async (req, res) => {
  const body = req.body || {};
  const purpose = (body.purpose || '').trim();
  const expectedReturnDate = body.expectedReturnDate || '';

  if (!body.equipmentId) return res.status(400).json({ message: 'Equipment is required.' });
  if (!purpose) return res.status(400).json({ message: 'Purpose is required.' });
  if (!expectedReturnDate) return res.status(400).json({ message: 'Return date is required.' });
  if (!isRealDate(expectedReturnDate)) return res.status(400).json({ message: 'Enter a valid date.' });
  // YYYY-MM-DD strings can be compared as text: later dates sort after earlier ones.
  if (expectedReturnDate <= getToday()) {
    return res.status(400).json({ message: 'Return date must be in the future.' });
  }

  const item = await Equipment.findById(body.equipmentId);
  if (!item || !item.isActive) return res.status(404).json({ message: 'Equipment not found.' });
  if (item.availability !== 'Available') {
    return res.status(409).json({ message: 'This item is not available right now.' });
  }

  const request = await Request.create({
    studentId: req.session.userId,
    equipmentId: item._id,
    purpose,
    expectedReturnDate,
    status: 'Pending',
  });

  await request.populate(withNames);
  res.status(201).json(toResponse(request));
});

// GET /api/requests/mine
// Only the requests of the logged-in student, newest first.
// MongoDB ids increase over time, so sorting by _id in reverse puts the newest on top.
router.get('/mine', studentOnly, async (req, res) => {
  const requests = await Request.find({ studentId: req.session.userId })
    .sort({ _id: -1 })
    .populate(withNames);
  res.json(requests.map(toResponse));
});

// GET /api/requests
// Every request, newest first, for the Admin dashboard.
router.get('/', adminOnly, async (req, res) => {
  const requests = await Request.find().sort({ _id: -1 }).populate(withNames);
  res.json(requests.map(toResponse));
});

// PATCH /api/requests/:id/approve
// Pending -> Approved, and the item becomes Borrowed.
router.patch('/:id/approve', adminOnly, async (req, res) => {
  const request = await Request.findById(req.params.id);
  if (!request) return res.status(404).json({ message: 'Request not found.' });
  if (request.status !== 'Pending') {
    return res.status(409).json({ message: 'Only pending requests can be approved.' });
  }

  // While the item is Borrowed, other pending requests for it cannot be approved.
  const item = await Equipment.findById(request.equipmentId);
  if (!item) return res.status(404).json({ message: 'Equipment not found.' });
  if (item.availability !== 'Available') {
    return res.status(409).json({ message: 'This item is currently borrowed. Wait until it is returned.' });
  }

  item.availability = 'Borrowed';
  await item.save();

  request.status = 'Approved';
  await request.save();

  await request.populate(withNames);
  res.json(toResponse(request));
});

// PATCH /api/requests/:id/reject
// Pending -> Rejected. The item is not changed.
router.patch('/:id/reject', adminOnly, async (req, res) => {
  const request = await Request.findById(req.params.id);
  if (!request) return res.status(404).json({ message: 'Request not found.' });
  if (request.status !== 'Pending') {
    return res.status(409).json({ message: 'Only pending requests can be rejected.' });
  }

  request.status = 'Rejected';
  await request.save();

  await request.populate(withNames);
  res.json(toResponse(request));
});

// PATCH /api/requests/:id/return
// Approved -> Returned, and the item becomes Available again.
router.patch('/:id/return', adminOnly, async (req, res) => {
  const request = await Request.findById(req.params.id);
  if (!request) return res.status(404).json({ message: 'Request not found.' });
  if (request.status !== 'Approved') {
    return res.status(409).json({ message: 'Only approved requests can be marked returned.' });
  }

  await Equipment.findByIdAndUpdate(request.equipmentId, { availability: 'Available' });

  request.status = 'Returned';
  await request.save();

  await request.populate(withNames);
  res.json(toResponse(request));
});

module.exports = router;
