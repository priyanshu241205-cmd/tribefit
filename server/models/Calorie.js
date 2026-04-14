const mongoose = require('mongoose');

const calorieSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  foodName: { type: String, required: true },
  portionSize: { type: String, required: true },
  calories: { type: Number, required: true },
  mealType: { type: String, enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack'], default: 'Snack' },
  date: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Calorie', calorieSchema);
