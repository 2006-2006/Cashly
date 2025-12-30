const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String, // Simple auth as requested, will store plain/hashed later
        required: true
    },
    disciplineScore: {
        type: Number,
        default: 100
    },
    reviewStreak: {
        type: Number,
        default: 0
    },
    lastReviewDate: {
        type: Date
    },
    plan: {
        type: String,
        enum: ['Free', 'Pro', 'Enterprise'],
        default: 'Enterprise'
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);
