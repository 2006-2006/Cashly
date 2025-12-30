const express = require('express');
const router = express.Router();
const { createBusiness, getMyBusinesses, getBusinessById } = require('../controllers/businessController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createBusiness);
router.get('/', protect, getMyBusinesses);
router.get('/:id', protect, getBusinessById);

module.exports = router;
