const mongoose = require('mongoose');

const receivableSchema = mongoose.Schema({
    user: {
        type: String, // Supabase UUID
        required: true
    },
    business: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business',
        required: true
    },
    customerName: {
        type: String,
        required: true
    },
    customerEmail: {
        type: String
    },
    customerPhone: {
        type: String
    },
    customerPhoto: {
        type: String
    },
    invoiceDate: {
        type: Date
    },
    amountDue: {
        type: Number,
        required: true
    },
    expectedPaymentDate: {
        type: Date
    },
    status: {
        type: String,
        enum: ['Pending', 'Paid', 'Overdue'],
        default: 'Pending'
    },
    paidDate: {
        type: Date
    },
    predictedPaymentDate: {
        type: Date
    },
    latePaymentProbability: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Receivable', receivableSchema);
