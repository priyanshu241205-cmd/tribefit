const mongoose = require('mongoose');

const periodSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  flow: { type: String, enum: ['Light', 'Medium', 'Heavy'], default: 'Medium' },
  symptoms: [{ type: String }],
  notes: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Period', periodSchema);
