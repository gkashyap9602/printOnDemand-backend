var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var ProductVarientOptions = new Schema({
    productVarientId: {
        type: String,
        index: true,
        ref:"productVarient"
    },
    variableOptionId: {
        type: String,
        index: true,
        ref:"variableOptions"

    },
    guid: {
        type: String,
        index: true
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


module.exports = mongoose.model("ProductVarientOptions", ProductVarientOptions, "productVarientOptions");
