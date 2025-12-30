const mongoose = require('mongoose');

const forecastResultSchema = mongoose.Schema({
    forecastDate: {
        type: Date,
        default: Date.now
    },
    days: {
        type: Number, // 7, 14, 30
        required: true
    },
    data: [{
        day: Number, // day index 1-30 or date
        date: Date,
        predictedCashBalance: Number,
        inflows: Number,
        outflows: Number
    }],
    lowestBalance: Number,
    lowestBalanceDate: Date,
    riskLevel: {
        type: String,
        enum: ['Safe', 'Warning', 'Critical', 'High Risk']
    },
    runwayDays: Number
}, {
    timestamps: true
});

module.exports = mongoose.model('ForecastResult', forecastResultSchema);
