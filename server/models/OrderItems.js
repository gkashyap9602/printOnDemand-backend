var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var OrderItems = new Schema({
    orderId: {
        type: mongoose.Types.ObjectId,
        ref: "Orders",
        index: true
    },
    productLibraryVarientId: {
        type: mongoose.Types.ObjectId,
        ref: "ProductLibraryVarient",
        default: null,
        index: true,
        Comment: "ProductLibraryVarient null in case of excel file orders "
    },
    productVarientId: {
        type: mongoose.Types.ObjectId,
        ref: "ProductVarient",
        index: true,
        default: null,
        Comment: "ProductVarient null in case of order from userSide "
    },
    quantity: {
        type: Number,
    },
    orderedPrice: {
        type: Number,
    },
    productCode: {
        type: String,
    },
    hsCode: {
        type: String,
        default: null
    },
    declaredValue: {
        type: String,
        default: null
    },
    //----------------
    designUrl: {
        type: String,
        default: null,

    },
    attributes: {
        type: String,
        default: null,

    },
    backImagePlacement: {
        type: String,
        default: null,

    },
    backImageUrl: {
        type: String,
        default: null,

    },
    imagePlacement: {
        type: String,
        default: null,

    },
    jpegDesignUrl: {
        type: String,
        default: null,

    },
    JpegBackImageUrl: {
        type: String,
        default: null,

    },
    upc: {
        type: String,
        default: null,

    },
    asin: {
        type: String,
        default: null,

    },
    storeOrderLineItemId: {
        type: String,
        default: null,

    },
    fullfilmentLineItemId: {
        type: String,
        default: null,

    },
    // preship: {
    //     type: String,
    //     default: null,

    // },
    // receipt: {
    //     type: String,
    //     default: null,

    // },
    createdOn: {
        type: String,
        default: null,
    },
    updatedOn: {
        type: String,
        default: null,
    },

});


module.exports = mongoose.model("OrderItems", OrderItems, "orderItems");
