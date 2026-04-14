const Sleep = require('../models/Sleep');

const getAll = async (req, res) => {
  try {
    const records = await Sleep.find({ user: req.user.id }).sort({ date: -1 });
    res.json(records);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const create = async (req, res) => {
  try {
    const record = await Sleep.create({ ...req.body, user: req.user.id });
    res.status(201).json(record);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const update = async (req, res) => {
  try {
    const record = await Sleep.findOneAndUpdate({ _id: req.params.id, user: req.user.id }, req.body, { new: true });
    if (!record) return res.status(404).json({ message: 'Not found' });
    res.json(record);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const remove = async (req, res) => {
  try {
    await Sleep.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = { getAll, create, update, remove };
