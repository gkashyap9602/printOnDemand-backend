const { default: mongoose } = require("mongoose");

// Define the Family schema
const paymentSchema = new mongoose.Schema({
    order_id: {
        type: String,
        default: "",
    },
    payment_id: {
        type: String,
        default: "",
    },
    amount: {
        type: Number,
        default: 0,
    },
    method: {
        type: String,
        default: "",
    },
    source: {
        type: String,
        default: "",
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    },
    gifted_by: {
        type: mongoose.Schema.Types.Mixed,
        ref: 'Users'
    },
    gifted_to: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    },
    payment_status: {
        type: String,
        default: "",
    },
    status: {
        type: Number,
        default: 1,
    },
    type: {
        type: String,
        default: "credit",
    },
    ifsc: {
        type: String,
        default: "",
    },
    gift_type: {
        type: String,
        default: null,
    }
}, { timestamps: true });
module.exports = mongoose.model('PaymentSchema', paymentSchema, 'paymentSchema');
