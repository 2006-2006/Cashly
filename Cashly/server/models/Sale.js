const mongoose = require('mongoose');

const saleSchema = mongoose.Schema({
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
    amount: {
        type: Number,
        required: true
    },
    description: {
        type: String
    },
    paymentType: {
        type: String,
        enum: ['Cash', 'UPI', 'Card', 'Credit'],
        default: 'Cash'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Sale', saleSchema);
