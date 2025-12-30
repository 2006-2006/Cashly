const mongoose = require('mongoose');

const insightSchema = mongoose.Schema({
    business: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business',
        required: true
    },
    type: {
        type: String,
        enum: ['Risk', 'Opportunity', 'Pattern', 'Recommendation', 'Anomaly'],
        required: true
    },
    severity: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Critical'],
        default: 'Medium'
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    actionItems: [{
        action: String,
        priority: { type: String, enum: ['Today', 'This Week', 'This Month'] }
    }],
    relatedData: {
        type: mongoose.Schema.Types.Mixed
    },
    isRead: {
        type: Boolean,
        default: false
    },
    isDismissed: {
        type: Boolean,
        default: false
    },
    confidenceLevel: {
        type: Number,
        default: 0.8
    },
    factorsConsidered: [String],
    dataSources: [String]
}, {
    timestamps: true
});

module.exports = mongoose.model('Insight', insightSchema);
