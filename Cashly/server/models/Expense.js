const mongoose = require('mongoose');

const expenseSchema = mongoose.Schema({
    user: {
        type: String, // Supabase UUID
        required: true
    },
    business: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    category: {
        type: String,
        default: 'General'
    },
    description: {
        type: String
    },
    amount: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Expense', expenseSchema);
