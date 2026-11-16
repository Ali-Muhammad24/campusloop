// One record is one physical item that can be borrowed.

const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  availability: { type: String, enum: ['Available', 'Borrowed'], default: 'Available' },
  // Inactive items are hidden from the catalogue but kept so request history is not lost.
  isActive: { type: Boolean, default: true },
});

// When an item is sent as JSON, use "id" instead of "_id".
equipmentSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    delete ret._id;
    return ret;
  },
});

module.exports = mongoose.model('Equipment', equipmentSchema);
