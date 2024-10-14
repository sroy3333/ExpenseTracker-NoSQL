const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const forgotPasswordSchema = new Schema({
    _id: {
        type: String,
        required: true,
        unique: true
    },
    active: {
        type: Boolean,
        required: true,
        default: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('ForgotPassword', forgotPasswordSchema);