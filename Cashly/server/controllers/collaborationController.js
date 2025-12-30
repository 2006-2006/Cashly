const Note = require('../models/Note');
const AuditLog = require('../models/AuditLog');
const Business = require('../models/Business');
const { checkBusinessAccess } = require('../utils/accessControl');

// @desc    Add note to transaction/date
// @route   POST /api/collaboration/notes
// @access  Private
const addNote = async (req, res) => {
    try {
        const { businessId, targetType, targetId, targetDate, content } = req.body;

        await checkBusinessAccess(req.user, businessId);

        const note = await Note.create({
            business: businessId,
            user: req.user.id,
            targetType,
            targetId,
            targetDate,
            content
        });

        // Log action
        await AuditLog.create({
            business: businessId,
            user: req.user.id,
            action: 'Create',
            entityType: 'Note',
            entityId: note._id,
            newValue: { content }
        });

        res.status(201).json(note);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get notes for a business
// @route   GET /api/collaboration/notes
// @access  Private
const getNotes = async (req, res) => {
    try {
        const { businessId, targetType, targetId, targetDate } = req.query;

        await checkBusinessAccess(req.user, businessId);

        const filter = { business: businessId };
        if (targetType) filter.targetType = targetType;
        if (targetId) filter.targetId = targetId;
        if (targetDate) {
            const date = new Date(targetDate);
            const nextDay = new Date(date);
            nextDay.setDate(nextDay.getDate() + 1);
            filter.targetDate = { $gte: date, $lt: nextDay };
        }

        const notes = await Note.find(filter)
            .populate('user', 'name')
            .sort({ createdAt: -1 });

        res.status(200).json(notes);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Add user to business (invite)
// @route   POST /api/collaboration/invite
// @access  Private (Owner only)
const inviteUser = async (req, res) => {
    try {
        const { businessId, userEmail, role } = req.body;

        const business = await Business.findById(businessId).populate('owner');

        if (!business) {
            return res.status(404).json({ message: 'Business not found' });
        }

        // Check if requester is owner
        if (business.owner._id.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Only business owner can invite users' });
        }

        // Find user by email (simplified - in production, send invite email)
        const User = require('../models/User');
        const invitedUser = await User.findOne({ email: userEmail });

        if (!invitedUser) {
            return res.status(404).json({ message: 'User not found. They need to register first.' });
        }

        // Check if already a member
        const existingMember = business.users?.find(u => u.user.toString() === invitedUser._id.toString());
        if (existingMember) {
            return res.status(400).json({ message: 'User is already a member of this business' });
        }

        // Add user to business
        business.users = business.users || [];
        business.users.push({
            user: invitedUser._id,
            role: role || 'Viewer'
        });

        await business.save();

        // Log action
        await AuditLog.create({
            business: businessId,
            user: req.user.id,
            action: 'Update',
            entityType: 'Business',
            entityId: businessId,
            newValue: { addedUser: userEmail, role }
        });

        res.status(200).json({ message: `${userEmail} added as ${role}` });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update user role
// @route   PUT /api/collaboration/role
// @access  Private (Owner only)
const updateUserRole = async (req, res) => {
    try {
        const { businessId, userId, newRole } = req.body;

        const business = await Business.findById(businessId);

        if (!business) {
            return res.status(404).json({ message: 'Business not found' });
        }

        if (business.owner.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Only owner can change roles' });
        }

        const userEntry = business.users?.find(u => u.user.toString() === userId);
        if (!userEntry) {
            return res.status(404).json({ message: 'User not found in business' });
        }

        userEntry.role = newRole;
        await business.save();

        res.status(200).json({ message: 'Role updated' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get business members
// @route   GET /api/collaboration/members
// @access  Private
const getMembers = async (req, res) => {
    try {
        const { businessId } = req.query;

        await checkBusinessAccess(req.user, businessId);

        const business = await Business.findById(businessId)
            .populate('owner', 'name email')
            .populate('users.user', 'name email');

        res.status(200).json({
            owner: business.owner,
            members: business.users || []
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get audit logs
// @route   GET /api/collaboration/audit
// @access  Private (Owner/Accountant)
const getAuditLogs = async (req, res) => {
    try {
        const { businessId } = req.query;

        await checkBusinessAccess(req.user, businessId);

        const logs = await AuditLog.find({ business: businessId })
            .populate('user', 'name')
            .sort({ createdAt: -1 })
            .limit(100);

        res.status(200).json(logs);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    addNote,
    getNotes,
    inviteUser,
    updateUserRole,
    getMembers,
    getAuditLogs
};
