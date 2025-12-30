const mongoose = require('mongoose');

const scenarioSchema = mongoose.Schema({
    business: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['Best', 'Likely', 'Worst', 'Custom'],
        default: 'Custom'
    },
    assumptions: {
        salesGrowthPercent: { type: Number, default: 0 },
        collectionDelayDays: { type: Number, default: 0 },
        paymentDelayDays: { type: Number, default: 0 },
        expenseCutPercent: { type: Number, default: 0 }
    },
    forecastData: [{
        date: Date,
        projectedBalance: Number,
        inflows: Number,
        outflows: Number
    }],
    healthScore: {
        type: Number,
        default: 50
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Scenario', scenarioSchema);
