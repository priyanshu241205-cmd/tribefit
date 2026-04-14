const mongoose = require('mongoose');

const sleepSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sleepTime: { type: Date, required: true },
  wakeTime: { type: Date, required: true },
  quality: { type: String, enum: ['Poor', 'Fair', 'Good', 'Excellent'], default: 'Good' },
  wakeups: { type: Number, default: 0 },
  notes: { type: String, default: '' },
  date: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Sleep', sleepSchema);
