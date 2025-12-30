const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getSales,
    getExpenses,
    getInventory,
    getReceivables,
    getMetrics,
    getTopDebtors,
    getDailyProfit,
    getDataStats,
    getSituationRoomData,
    getRecentTransactions
} = require('../controllers/dataController');

router.get('/sales', protect, getSales);
router.get('/expenses', protect, getExpenses);
router.get('/inventory', protect, getInventory);
router.get('/receivables', protect, getReceivables);
router.get('/metrics', protect, getMetrics);
router.get('/top-debtors', protect, getTopDebtors);
router.get('/recent-transactions', protect, getRecentTransactions);
router.get('/daily-profit', protect, getDailyProfit);
router.get('/stats', protect, getDataStats);
router.get('/situation', protect, getSituationRoomData);

module.exports = router;
