const mongoose = require('mongoose');

const advisoryLogSchema = mongoose.Schema({
    date: {
        type: Date,
        default: Date.now
    },
    riskContext: {
        shortfallDays: Number,
        causes: [String],
        riskLevel: String
    },
    geminiPrompt: String,
    geminiResponse: String,
    actionsSuggested: [String]
}, {
    timestamps: true
});

module.exports = mongoose.model('AdvisoryLog', advisoryLogSchema);
