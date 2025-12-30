const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    generateDailyBrief,
    generateWeeklyReport,
    getSharedReport,
    getDailyHistory
} = require('../controllers/copilotController');

// Daily brief endpoints
router.post('/daily', protect, generateDailyBrief);
router.get('/daily/history', protect, getDailyHistory);

// Weekly report endpoints
router.post('/weekly', protect, generateWeeklyReport);

// Public shareable report (no auth required)
router.get('/report/:shareId', getSharedReport);

module.exports = router;
