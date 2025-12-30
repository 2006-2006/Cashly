const mongoose = require('mongoose');

const noteSchema = mongoose.Schema({
    business: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    targetType: {
        type: String,
        enum: ['Transaction', 'Date', 'Receivable', 'Expense', 'General'],
        required: true
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId
    },
    targetDate: {
        type: Date
    },
    content: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Note', noteSchema);
