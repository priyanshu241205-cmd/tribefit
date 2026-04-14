const Club = require('../models/Club');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

const getAll = async (req, res) => {
  try {
    const clubs = await Club.find().populate('host', 'name avatar').populate('members', 'name avatar');
    res.json(clubs);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getOne = async (req, res) => {
  try {
    const club = await Club.findById(req.params.id)
      .populate('host', 'name avatar email')
      .populate('members', 'name avatar email')
      .populate('discussions.user', 'name avatar');
    if (!club) return res.status(404).json({ message: 'Club not found' });
    res.json(club);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const create = async (req, res) => {
  try {
    const { name, description, overview } = req.body;
    if (!name || !description) return res.status(400).json({ message: 'Name and description required' });
    const club = await Club.create({
      name, description, overview,
      host: req.user.id,
      members: [req.user.id],
      coverImage: req.file ? `/uploads/${req.file.filename}` : '',
    });
    res.status(201).json(club);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const joinClub = async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) return res.status(404).json({ message: 'Club not found' });
    if (club.members.includes(req.user.id)) return res.status(400).json({ message: 'Already a member' });
    club.members.push(req.user.id);
    await club.save();
    res.json({ message: 'Joined successfully' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const leaveClub = async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) return res.status(404).json({ message: 'Club not found' });
    if (club.host.toString() === req.user.id) return res.status(400).json({ message: 'Host cannot leave the club' });
    club.members = club.members.filter(m => m.toString() !== req.user.id);
    await club.save();
    res.json({ message: 'Left club' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const addDiscussion = async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) return res.status(404).json({ message: 'Club not found' });
    if (!club.members.map(m => m.toString()).includes(req.user.id))
      return res.status(403).json({ message: 'Must be a member to post' });
    club.discussions.push({
      user: req.user.id,
      text: req.body.text || '',
      image: req.file ? `/uploads/${req.file.filename}` : '',
    });
    await club.save();
    const updated = await Club.findById(req.params.id).populate('discussions.user', 'name avatar');
    res.json(updated.discussions[updated.discussions.length - 1]);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const addEvent = async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) return res.status(404).json({ message: 'Club not found' });
    if (club.host.toString() !== req.user.id) return res.status(403).json({ message: 'Only host can add events' });
    const { title, description, dateTime } = req.body;
    if (!title || !description || !dateTime) return res.status(400).json({ message: 'Title, description and dateTime are required' });
    club.events.push({ title, description, dateTime, createdBy: req.user.id });
    await club.save();
    res.json(club.events[club.events.length - 1]);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const markEventComplete = async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) return res.status(404).json({ message: 'Club not found' });
    const event = club.events.id(req.params.eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    event.completed = true;
    await club.save();
    res.json({ message: 'Event marked complete' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = { getAll, getOne, create, joinClub, leaveClub, addDiscussion, addEvent, markEventComplete, upload };
