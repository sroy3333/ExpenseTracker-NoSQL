const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const orderSchema = new Schema({
    _id: {
        type: String,
        required: true,
        unique: true
    },
    paymentid: {
        type: String,
        required: false
    },
    orderid: {
        type: String,
        required: true,
        unique: true
    },
    status: {
        type: String,
        required: true,
        enum: ['PENDING', 'SUCCESSFUL', 'FAILED'] 
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true // Adds createdAt and updatedAt fields
});

module.exports = mongoose.model('Order', orderSchema);