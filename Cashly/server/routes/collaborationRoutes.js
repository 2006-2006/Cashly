const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    addNote,
    getNotes,
    inviteUser,
    updateUserRole,
    getMembers,
    getAuditLogs
} = require('../controllers/collaborationController');

// Notes
router.post('/notes', protect, addNote);
router.get('/notes', protect, getNotes);

// Team management
router.post('/invite', protect, inviteUser);
router.put('/role', protect, updateUserRole);
router.get('/members', protect, getMembers);

// Audit
router.get('/audit', protect, getAuditLogs);

module.exports = router;
