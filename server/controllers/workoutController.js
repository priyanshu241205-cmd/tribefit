const Workout = require('../models/Workout');

const getAll = async (req, res) => {
  try {
    const records = await Workout.find({ user: req.user.id }).sort({ date: -1 });
    res.json(records);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const create = async (req, res) => {
  try {
    const record = await Workout.create({ ...req.body, user: req.user.id });
    res.status(201).json(record);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const update = async (req, res) => {
  try {
    const record = await Workout.findOneAndUpdate({ _id: req.params.id, user: req.user.id }, req.body, { new: true });
    if (!record) return res.status(404).json({ message: 'Not found' });
    res.json(record);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const remove = async (req, res) => {
  try {
    await Workout.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = { getAll, create, update, remove };
