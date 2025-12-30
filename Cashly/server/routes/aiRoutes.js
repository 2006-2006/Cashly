const express = require('express');
const router = express.Router();
const {
    explainRisk,
    handleGeneralQuery,
    getAlerts,
    markAlertRead,
    generateAIInsights,
    getInsights,
    askQuestion,
    generateAlerts,
    getIntelligenceGraph,
    getGSTProjection,
    getSituationData
} = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

// Original routes
router.post('/explain', protect, explainRisk);
router.post('/query', protect, handleGeneralQuery);

// Alerts
router.get('/alerts', protect, getAlerts);
router.put('/alerts/:id/read', protect, markAlertRead);
router.post('/alerts/generate', protect, generateAlerts);

// Insights
router.post('/insights', protect, generateAIInsights);
router.get('/insights', protect, getInsights);

// Q&A
router.post('/ask', protect, askQuestion);

// Advanced Intelligence
router.get('/intelligence/graph/:businessId', protect, getIntelligenceGraph);
router.get('/intelligence/gst/:businessId', protect, getGSTProjection);
router.get('/intelligence/situation/:businessId', protect, getSituationData);

module.exports = router;
