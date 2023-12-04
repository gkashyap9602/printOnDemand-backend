var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var ProductLibrary = new Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        ref: "users",
        index: true
    },
    productId: {
        type: mongoose.Types.ObjectId,
        ref: "product",
        index: true
    },
    title: {
        type: String,
        index: true
    },
    description: {
        type: String,
        default: null
    },
    status: {
        type: Number,
        default: 1,
        Comment: "1 for active 2 for delete "

    },
    addToStore: {
        type: Number,
        default: 0,
        Comment: "1 for add 0 for not add "

    },

    designDetails: {
        type: String,
        default: null
    },
    productLibraryImages: [{
        _id: {
            type: mongoose.Types.ObjectId,
            index: true
        },
        imageUrl: {
            type: String,
            default: null

        },
        displayOrder: {
            type: Number,
            default: 0

        },
    }],
    productLibraryVarients: [{
        _id: {
            type: mongoose.Types.ObjectId,
            index: true
        },
        productVarientId: {
            type: mongoose.Types.ObjectId,
            ref: "ProductVarient"
        },
        price: {
            type: Number,
            default: null

        },
        profit: {
            type: Number,
            default: null

        },
        retailPrice: {
            type: Number,
            default: null

        },

    }],
    // isDeleted: {
    //     type: Boolean,
    //     default: false,
    // },
    // isProductDeleted: {
    //     type: Boolean,
    //     default: false,
    // },
    // deletedOn: {
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


module.exports = mongoose.model("ProductLibrary", ProductLibrary, "productLibrary");
