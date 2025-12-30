const mongoose = require('mongoose');

const businessMemorySchema = mongoose.Schema({
    business: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business',
        required: true
    },
    event: {
        type: String, // e.g., 'Diwali Sale', 'Equipment Failure'
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    impact: {
        type: String, // 'Positive', 'Negative'
        required: true
    },
    description: String,
    autoApply: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('BusinessMemory', businessMemorySchema);
