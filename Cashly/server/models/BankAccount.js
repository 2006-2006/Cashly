const mongoose = require('mongoose');

const bankAccountSchema = mongoose.Schema({
    business: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['Bank', 'Cash', 'UPI', 'Credit Card', 'Other'],
        default: 'Bank'
    },
    balance: {
        type: Number,
        default: 0
    },
    bankName: {
        type: String
    },
    accountNumber: {
        type: String
    },
    isDefault: {
        type: Boolean,
        default: false
    },
    transactions: [{
        date: Date,
        description: String,
        amount: Number,
        type: { type: String, enum: ['Debit', 'Credit'] },
        isVerified: { type: Boolean, default: false },
        matchedRecordId: mongoose.Schema.Types.ObjectId
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('BankAccount', bankAccountSchema);
