const mongoose = require('mongoose');

const riskHistorySchema = mongoose.Schema({
    date: {
        type: Date,
        default: Date.now
    },
    riskLevel: {
        type: String,
        enum: ['Safe', 'Warning', 'Critical', 'High Risk'],
        required: true
    },
    shortfallDate: Date,
    cashBuffer: Number,
    causes: [String] // List of reasons e.g. "Inventory payment due", "Delayed receivables"
}, {
    timestamps: true
});

module.exports = mongoose.model('RiskHistory', riskHistorySchema);
