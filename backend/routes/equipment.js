// Routes for equipment. Anyone can view active items; only the Admin can change them.

const express = require('express');
const Equipment = require('../models/Equipment');
const Request = require('../models/Request');
const { requireLogin, requireRole } = require('../middleware/auth');

const router = express.Router();

// Both checks run, in this order, before every Admin-only route below.
const adminOnly = [requireLogin, requireRole('Admin')];

// Checks the fields sent by the equipment form.
// Returns { error } with a message, or { data } with the cleaned values.
function validateEquipment(body) {
  const name = (body.name || '').trim();
  const category = (body.category || '').trim();
  const description = (body.description || '').trim();
  const availability = body.availability || 'Available';
  const isActive = body.isActive === undefined ? true : body.isActive;

  if (!name) return { error: 'Name is required.' };
  if (!category) return { error: 'Category is required.' };
  if (!description) return { error: 'Description is required.' };
  if (availability !== 'Available' && availability !== 'Borrowed') {
    return { error: 'Availability must be Available or Borrowed.' };
  }
  if (typeof isActive !== 'boolean') return { error: 'Active status must be true or false.' };

  return { data: { name, category, description, availability, isActive } };
}

// GET /api/equipment
// Students and guests get active items only. The Admin also gets inactive ones.
router.get('/', async (req, res) => {
  const isAdmin = req.session.role === 'Admin';
  const filter = isAdmin ? {} : { isActive: true };
  const items = await Equipment.find(filter).sort({ name: 1 });
  res.json(items);
});

// GET /api/equipment/:id
router.get('/:id', async (req, res) => {
  const item = await Equipment.findById(req.params.id);
  const isAdmin = req.session.role === 'Admin';

  // An inactive item is treated as missing for everyone except the Admin.
  if (!item || (!item.isActive && !isAdmin)) {
    return res.status(404).json({ message: 'Equipment not found.' });
  }
  res.json(item);
});

// POST /api/equipment
router.post('/', adminOnly, async (req, res) => {
  const { error, data } = validateEquipment(req.body || {});
  if (error) return res.status(400).json({ message: error });

  const item = await Equipment.create(data);
  res.status(201).json(item);
});

// PUT /api/equipment/:id
// Used for editing an item and for marking it inactive or active again.
router.put('/:id', adminOnly, async (req, res) => {
  const { error, data } = validateEquipment(req.body || {});
  if (error) return res.status(400).json({ message: error });

  const item = await Equipment.findById(req.params.id);
  if (!item) return res.status(404).json({ message: 'Equipment not found.' });

  // An item that is out on loan can only become Available through Mark Returned.
  // Otherwise it could be lent to a second student while the first still has it.
  const onLoan = await Request.exists({ equipmentId: item._id, status: 'Approved' });
  if (onLoan && data.availability === 'Available') {
    return res.status(409).json({ message: 'This item is on loan. Use Mark Returned on the Admin Dashboard.' });
  }

  item.set(data);
  await item.save();
  res.json(item);
});

// DELETE /api/equipment/:id
// Items that have requests cannot be deleted, so the request history is kept.
router.delete('/:id', adminOnly, async (req, res) => {
  const item = await Equipment.findById(req.params.id);
  if (!item) return res.status(404).json({ message: 'Equipment not found.' });

  const hasRequests = await Request.exists({ equipmentId: item._id });
  if (hasRequests) {
    return res.status(409).json({ message: 'This item has requests, so it cannot be deleted. Mark it inactive instead.' });
  }

  await item.deleteOne();
  res.json({ message: 'Equipment deleted.' });
});

module.exports = router;
