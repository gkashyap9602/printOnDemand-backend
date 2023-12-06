var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var ProductLibrary = new Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        ref: "Users",
        index: true
    },
    productId: {
        type: mongoose.Types.ObjectId,
        ref: "Product",
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
