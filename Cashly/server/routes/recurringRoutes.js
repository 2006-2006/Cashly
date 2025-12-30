const express = require('express');
const router = express.Router();
const { createRecurring, getRecurring, processRecurring } = require('../controllers/recurringController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createRecurring);
router.get('/', protect, getRecurring);
router.post('/process', protect, processRecurring);

module.exports = router;
