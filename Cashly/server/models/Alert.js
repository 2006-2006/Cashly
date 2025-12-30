const mongoose = require('mongoose');

const alertSchema = mongoose.Schema({
    business: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business',
        required: true
    },
    type: {
        type: String,
        enum: ['LowBalance', 'LargeOutflow', 'LatePayment', 'Anomaly', 'HealthDrop'],
        required: true
    },
    severity: {
        type: String,
        enum: ['Info', 'Warning', 'Critical'],
        default: 'Warning'
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    triggerDate: {
        type: Date
    },
    triggerAmount: {
        type: Number
    },
    isRead: {
        type: Boolean,
        default: false
    },
    isResolved: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Alert', alertSchema);
