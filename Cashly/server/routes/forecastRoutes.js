const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    runForecast,
    compareScenarios,
    saveScenario,
    getSavedScenarios,
    getHealthHistory,
    getHealth
} = require('../controllers/forecastController');

router.post('/run', protect, runForecast);
router.post('/30days', protect, runForecast);
router.post('/scenarios', protect, compareScenarios);
router.post('/scenario/save', protect, saveScenario);
router.get('/scenarios/saved', protect, getSavedScenarios);
router.get('/health-history', protect, getHealthHistory);
router.get('/health', protect, getHealth);

module.exports = router;
