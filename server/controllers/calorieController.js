const Calorie = require('../models/Calorie');

const getAll = async (req, res) => {
  try {
    const records = await Calorie.find({ user: req.user.id }).sort({ date: -1 });
    res.json(records);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const create = async (req, res) => {
  try {
    const record = await Calorie.create({ ...req.body, user: req.user.id });
    res.status(201).json(record);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const remove = async (req, res) => {
  try {
    await Calorie.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Calorie lookup using Open Food Facts API (free, no key needed)
const lookupCalories = async (req, res) => {
  try {
    const { foodName } = req.query;
    const response = await fetch(
      `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(foodName)}&search_simple=1&action=process&json=1&page_size=5&lc=en`
    );
    const data = await response.json();
   const results = (data.products || [])
  .filter(p => p.product_name_en) // only English
  .slice(0, 5)
  .map(p => ({
    name: p.product_name_en,
    calories: p.nutriments?.['energy-kcal_100g'] 
      || p.nutriments?.['energy-kcal'] 
      || "Not Available",
    per: '100g',
  }));

res.json(results);
  } catch (err) {
    res.status(500).json({ message: 'Calorie lookup failed', error: err.message });
  }
};

module.exports = { getAll, create, remove, lookupCalories };
