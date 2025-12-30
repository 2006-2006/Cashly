const mongoose = require('mongoose');

const healthScoreSchema = mongoose.Schema({
    business: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business',
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    score: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    components: {
        volatility: { type: Number, default: 0 },
        cashRunway: { type: Number, default: 0 },
        customerConcentration: { type: Number, default: 0 },
        latePaymentFrequency: { type: Number, default: 0 }
    },
    status: {
        type: String,
        enum: ['Critical', 'Warning', 'Healthy'],
        default: 'Healthy'
    },
    insights: [{
        type: String
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('HealthScore', healthScoreSchema);
