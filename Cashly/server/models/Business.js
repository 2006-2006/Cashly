const mongoose = require('mongoose');

const businessSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['Retail', 'Service', 'Manufacturing', 'Trading', 'Other'],
        default: 'Retail'
    },
    owner: {
        type: String, // Supabase UUID
        required: true
    },
    users: [{
        user: { type: String }, // Supabase UUID
        role: { type: String, enum: ['Owner', 'Accountant', 'Staff', 'Viewer'], default: 'Viewer' }
    }],
    settings: {
        currency: { type: String, default: 'INR' },
        fiscalYearStart: { type: String, default: '04-01' }, // April 1st
        minCashBuffer: { type: Number, default: 10000 }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Business', businessSchema);
