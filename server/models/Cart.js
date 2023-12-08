var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var Cart = new Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        ref: "Users",
        index: true
    },
    productLibraryVariantId: {
        type: mongoose.Types.ObjectId,
        ref: "ProductLibraryVarient",
        index: true
    },
    quantity: {
        type: Number,
        default: 1
    },
    createdOn: {
        type: String,
        default: null,
    },
    updatedOn: {
        type: String,
        default: null,
    },
});


module.exports = mongoose.model("Cart", Cart, "cart");
