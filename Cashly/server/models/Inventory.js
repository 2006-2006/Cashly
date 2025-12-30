const mongoose = require('mongoose');

const inventorySchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    business: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business',
        required: true
    },
    itemName: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        default: 1
    },
    unitCost: {
        type: Number
    },
    totalCost: {
        type: Number
    },
    reorderCost: {
        type: Number
    },
    purchaseDate: {
        type: Date
    },
    expectedPaymentDate: {
        type: Date
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Inventory', inventorySchema);
