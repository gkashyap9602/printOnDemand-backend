var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var StoreProducts = new Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        ref: 'Users',
        index: true
    },
    storeId: {
        type: mongoose.Types.ObjectId,
        ref: 'Users',
        index: true
    },
    productLibraryId: {
        type: mongoose.Types.ObjectId,
        ref: 'ProductLibrary',
        index: true
    },
    storeProductId: {
        type: Number,
        index: true
    },
    storeDetails: {
        storeName: {
            type: String,
            ref: 'Store',
            default: null
        },
        shop: {
            type: String,
            ref: 'Store',
            default: null
        },
        storeType: {
            type: Number,
            ref: 'Store',
            default: null
        }
    },

    isEnabled: {
        type: Boolean,
        default: false,
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


module.exports = mongoose.model("StoreProducts", StoreProducts, "storeProducts");
