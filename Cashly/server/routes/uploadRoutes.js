const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadSales, uploadExpenses, uploadInventory, uploadReceivables, analyzeImage } = require('../controllers/uploadController');
const { protect } = require('../middleware/authMiddleware');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const handleUpload = (fieldName) => (req, res, next) => {
    upload.single(fieldName)(req, res, (err) => {
        if (err) {
            console.error('Multer Error:', err);
            return res.status(400).json({ message: 'File upload error', error: err.message });
        }
        next();
    });
};

router.post('/sales', protect, handleUpload('file'), uploadSales);
router.post('/expenses', protect, handleUpload('file'), uploadExpenses);
router.post('/inventory', protect, handleUpload('file'), uploadInventory);
router.post('/receivables', protect, handleUpload('file'), uploadReceivables);
router.post('/analyze', protect, handleUpload('file'), analyzeImage);

module.exports = router;
