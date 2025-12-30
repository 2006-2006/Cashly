const mongoose = require('mongoose');

const dailyBriefSchema = mongoose.Schema({
    business: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business',
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    startingBalance: {
        type: Number,
        default: 0
    },
    expectedInflows: {
        type: Number,
        default: 0
    },
    expectedOutflows: {
        type: Number,
        default: 0
    },
    endingBalance: {
        type: Number,
        default: 0
    },
    actions: [{
        priority: { type: String }, // 'Critical', 'High', 'Medium', 'Low'
        action: { type: String },
        category: { type: String } // Removed strict enum for flexibility
    }],
    healthScore: {
        type: Number
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('DailyBrief', dailyBriefSchema);
