const mongoose = require('mongoose');

const weeklyReportSchema = mongoose.Schema({
    business: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business',
        required: true
    },
    weekStart: {
        type: Date,
        required: true
    },
    weekEnd: {
        type: Date,
        required: true
    },
    metrics: {
        totalInflows: { type: Number, default: 0 },
        totalOutflows: { type: Number, default: 0 },
        netCashFlow: { type: Number, default: 0 },
        startBalance: { type: Number, default: 0 },
        endBalance: { type: Number, default: 0 },
        avgDailyBalance: { type: Number, default: 0 }
    },
    healthScore: {
        score: { type: Number },
        trend: { type: String, enum: ['Up', 'Down', 'Stable'] }
    },
    trends: [{
        title: { type: String },
        description: { type: String }
    }],
    focusItems: [{
        priority: { type: Number },
        item: { type: String }
    }],
    shareableLink: {
        type: String
    },
    isPublic: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('WeeklyReport', weeklyReportSchema);
