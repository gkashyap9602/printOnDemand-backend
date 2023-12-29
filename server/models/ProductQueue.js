var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var ProductQueue = new Schema({

    userId: {
        type: mongoose.Types.ObjectId,
        ref: "Users",
        index: true
    },
    storeId: {
        type: mongoose.Types.ObjectId,
        ref: "Store",
        index: true
    },
    storeName: {
        type: String,
        ref: "Store",
        index: true
    },
    productLibraryId: {
        type: mongoose.Types.ObjectId,
        ref: "ProductLibrary",
        index: true
    },

    // productLibraryVarientIds: [{
    //     type: mongoose.Types.ObjectId,
    //     ref: "ProductLibraryVarient",
    //     index: true
    // }],

    status: {
        type: Number,
        default: 2,
        Comment: "1 for complete 2 for processing 3 for failed"
    },
    retryCount: {
        type: Number,
        default: 0,
    },

    pushedDate: {
        type: String,
        default: null,
    },
    uploadDate: {
        type: String,
        default: null,
    },
    createdOn: {
        type: String,
        default: null,
    },
    // updatedOn: {
    //     type: String,
    //     default: null,
    // },
});


module.exports = mongoose.model("ProductQueue", ProductQueue, "productQueue");
