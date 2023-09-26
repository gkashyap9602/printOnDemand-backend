var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var ProductCategory = new Schema({
    productId: {
        type: mongoose.Types.ObjectId,
        ref:'product',
        index:true
    },
    subcategoryId: {
        type: mongoose.Types.ObjectId,
        ref:'subCategory',
        index:true


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



module.exports = mongoose.model("ProductCategory", ProductCategory, "productCategory");
