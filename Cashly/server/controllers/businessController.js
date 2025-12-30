const asyncHandler = require('express-async-handler');
const Business = require('../models/Business');

// @desc    Create a new business
// @route   POST /api/businesses
// @access  Private
const createBusiness = asyncHandler(async (req, res) => {
    const { name, type, currency } = req.body;

    if (!name) {
        res.status(400);
        throw new Error('Please add a business name');
    }

    const business = await Business.create({
        name,
        type,
        owner: req.user.id,
        users: [{ user: req.user.id, role: 'Owner' }],
        settings: { currency }
    });

    res.status(201).json(business);
});

// @desc    Get user businesses
// @route   GET /api/businesses
// @access  Private
const getMyBusinesses = asyncHandler(async (req, res) => {
    const businesses = await Business.find({
        $or: [
            { owner: req.user.id },
            { 'users.user': req.user.id }
        ]
    });

    res.status(200).json(businesses);
});

// @desc    Get business by ID
// @route   GET /api/businesses/:id
// @access  Private
const getBusinessById = asyncHandler(async (req, res) => {
    const business = await Business.findById(req.params.id);

    if (!business) {
        res.status(404);
        throw new Error('Business not found');
    }

    // Check access
    const isOwner = business.owner.toString() === req.user.id;
    const isMember = business.users.some(u => u.user.toString() === req.user.id);

    if (!isOwner && !isMember) {
        res.status(401);
        throw new Error('Not authorized to view this business');
    }

    res.status(200).json(business);
});

module.exports = {
    createBusiness,
    getMyBusinesses,
    getBusinessById
};
