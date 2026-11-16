// A borrowing request. It links one student (User) to one item (Equipment).

const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    equipmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Equipment', required: true },
    purpose: { type: String, required: true, trim: true },
    // Stored as text in the YYYY-MM-DD format, the same format the date input sends.
    expectedReturnDate: { type: String, required: true },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected', 'Returned'],
      default: 'Pending',
    },
  },
  { timestamps: true },
);

// When a request is sent as JSON, use "id" instead of "_id".
requestSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    delete ret._id;
    return ret;
  },
});

module.exports = mongoose.model('Request', requestSchema);
