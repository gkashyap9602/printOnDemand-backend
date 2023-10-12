var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var SubCategory = new Schema({

    categoryId: {
        type: mongoose.Types.ObjectId,
        ref: "Category",
        index: true
    },
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        default: "",
    },

    imageUrl: {
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
});


module.exports = mongoose.model("SubCategory", SubCategory, "subCategory");
