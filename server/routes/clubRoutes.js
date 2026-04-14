const express = require('express');
const router = express.Router();
const {
  getAll, getOne, create, joinClub, leaveClub,
  addDiscussion, addEvent, markEventComplete, upload
} = require('../controllers/clubController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/', getAll);
router.get('/:id', getOne);
router.post('/', upload.single('coverImage'), create);
router.post('/:id/join', joinClub);
router.post('/:id/leave', leaveClub);
router.post('/:id/discussions', upload.single('image'), addDiscussion);
router.post('/:id/events', addEvent);
router.patch('/:id/events/:eventId/complete', markEventComplete);

module.exports = router;
