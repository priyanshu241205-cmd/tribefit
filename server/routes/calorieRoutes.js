const express = require('express');
const router = express.Router();
const { getAll, create, remove, lookupCalories } = require('../controllers/calorieController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/', getAll);
router.get('/lookup', lookupCalories);
router.post('/', create);
router.delete('/:id', remove);

module.exports = router;
