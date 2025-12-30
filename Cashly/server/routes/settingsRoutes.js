const express = require('express');
const router = express.Router();
const { clearAllUserData } = require('../controllers/settingsController');
const { protect } = require('../middleware/authMiddleware');

router.delete('/clear-data', protect, clearAllUserData);

module.exports = router;
