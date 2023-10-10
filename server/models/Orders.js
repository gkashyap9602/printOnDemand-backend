var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var Orders = new Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        ref: "users",
        index: true
    },
    customerName: {
        type: String,
        required: true
    },
    orderAmount: {
        type: String,
        required: true
    },
    statusSummary: {
        cancelled: {
            type: Number,
            default: 0
        },
        error: {
            type: Number,
            default: 0
        },
        inProduction: {
            type: Number,
            default: 0
        },
        new: {
            type: Number,
            default: 0
        },
        received: {
            type: Number,
            default: 0
        },
        shipped: {
            type: Number,
            default: 0
        },

    },
    orderStatus: {
        type: String,
        default: null,
    },
    orderDate: {
        type: String,
        default: null,
    },
    updatedOn: {
        type: String,
        default: null,
    },
});


module.exports = mongoose.model("Orders", Orders, "orders");
