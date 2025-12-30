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
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    users: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
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
