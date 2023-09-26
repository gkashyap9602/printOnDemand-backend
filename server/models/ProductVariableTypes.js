var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var ProductVariableTypes = new Schema({
    productId: {
        type: mongoose.Types.ObjectId,
        index: true,
        ref:"product"
    },
    variableTypeId: {
        type: mongoose.Types.ObjectId,
        index: true,
        ref:"variableTypes"

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
