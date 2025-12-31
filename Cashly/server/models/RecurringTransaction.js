const mongoose = require('mongoose');

const recurringTransactionSchema = mongoose.Schema({
    business: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business',
        required: true
    },
    user: {
        type: String, // Supabase UUID
        required: true
    },
    type: {
        type: String,
        enum: ['Expense', 'Income'],
        required: true
    },
    category: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    frequency: {
        type: String,
        enum: ['Daily', 'Weekly', 'Monthly', 'Yearly'],
        default: 'Monthly'
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date
    },
    lastGeneratedDate: {
        type: Date
    },
    nextRunDate: {
        type: Date,
        required: true
    },
    active: {
        type: Boolean,
        default: true
    },
    description: {
        type: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('RecurringTransaction', recurringTransactionSchema);
