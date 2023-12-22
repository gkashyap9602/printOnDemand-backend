var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var Store = new Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        ref: 'Users',
        index: true
    },
    apiKey: {
        type: String,
        default: null,
        Comment: "code in orignal web"
    },
    secret: {
        type: String,
        default: null,
        Comment: "accesstoken in orignal website "
    },
    shop: {
        type: String,
        default: null,
    },
    storeVersion: {
        type: String,
        default: null,
    },
    storeType: {
        type: Number,
        default: 1,
        Comment: "1 for shopify"
    },
    storeId: {
        type: String,
        default: null,
    },
    storeUrl: {
        type: String,
        default: null,
    },
    storeName: {
        type: String,
        default: null,
    },
    customerId: {
        type: Number,
        default: null,
    },
    etsyAppKey: {
        type: String,
        default: null,
    },
    code: {
        type: String,
        default: null,
    },
    refreshToken: {
        type: String,
        default: null,
    },
    status: {
        type: Number,
        default: 1,
    },
    createdOn: {
        type: String,
        default: null,
    },
    updatedOn: {
        type: String,
        default: null,
    },
    lastSycTime: {
        type: String,
        default: null,
    },
});


module.exports = mongoose.model("Store", Store, "store");
