var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var Product = new Schema({
    subCategory_id: {
        type: mongoose.Types.ObjectId,
        ref: "subcategory",
        index: true
    },

    guid: {
        type: String,
        index: true
    },
    careInstructions: {
        type: String,
        required: true
    },
    longDescription: {
        type: String,
    },
    priceStartsFrom: {
        type: String,
    },
    materialId: {
        type: mongoose.Types.ObjectId,
        ref:"material"
    },
    construction: {
        type: String,
    },
    materialName: {
        type: String,
    },
    features: {
        type: String,
    },
    Process: {
        type: String,
    },
    parentCategoryName: {
        type: String,
    },
    parentCategoryId: {
        type: String,
    },

    productImages: [{
        _id: {
            type: mongoose.Types.ObjectId,
            default: mongoose.Types.ObjectId()
        },
        fileName: {
            type: String,

        },
        imageUrl: {
            type: String
        },
        thumbnailPath: {
            type: String
        }
    }],
    productionDuration: {
        type: String,
        default: null,

    },
    shortDescription: {
        type: String,
        default: null,

    },
    sizeChart: {
        type: String,
        default: null,

    },
    status: {
        type: Number,
        default: 1,

    },
    title: {
        type: String,
        required: true
    },
    variantCount: {
        type: Number,
        default: 0,

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


module.exports = mongoose.model("Product", Product, "product");
