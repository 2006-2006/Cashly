const mongoose = require('mongoose');

const automationRuleSchema = mongoose.Schema({
    business: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business',
        required: true
    },
    type: {
        type: String,
        enum: ['PaymentReminder', 'PayableReschedule', 'ExpenseLimit', 'BufferEnforcement'],
        required: true
    },
    trigger: {
        event: { type: String, required: true }, // e.g., 'PaymentOverdue', 'LowCash'
        threshold: { type: Number }
    },
    action: {
        method: { type: String, enum: ['WhatsApp', 'Email', 'Alert', 'Block'], required: true },
        template: { type: String }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    autoApprove: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('AutomationRule', automationRuleSchema);
