var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var ProductVariableTypes = new Schema({
    productId: {
        type: String,
        index: true,
        ref:"product"
    },
    variableTypeId: {
        type: String,
        index: true,
        ref:"variableTypes"

    },
    guid: {
        type: String,
        index: true
    },
    isDesignerVariable: {
        type: Boolean,
        required: false
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


module.exports = mongoose.model("ProductVariableTypes", ProductVariableTypes, "productVariableTypes");
