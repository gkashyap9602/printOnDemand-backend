var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var ProductLibrary = new Schema({
    user_id: {
        type: mongoose.Types.ObjectId,
        ref: "users",
        index: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
    },
    designType: {
        type: String,
    },
    product_library_images: [{
        _id: {
            type: mongoose.Types.ObjectId,
            default: mongoose.Types.ObjectId()
        },
        image_url: {
            type: String,

        },
        display_order: {
            type: String,

        },

    }],
    isDeleted: {
        type: Boolean,
        default: false,
    },
    isProductDeleted: {
        type: Boolean,
        default: false,
    },
    deletedOn: {
        type: String,
        default: null,
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


module.exports = mongoose.model("ProductLibrary", ProductLibrary, "productLibrary");
