var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var Product = new Schema({
    subCategoryId: [{
        type: mongoose.Types.ObjectId,
        ref: "subcategory",
        index: true
    }],
    materialId: {
        type: mongoose.Types.ObjectId,
        ref: "material"
    },
    careInstructions: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    longDescription: {
        type: String,
    },
    // priceStartsFrom: {
    //     type: String,
    // },
    productionDuration: {
        type: String,
        default: null,

    },
    shortDescription: {
        type: String,
        default: null,

    },
    sizeChart: {
        fileName: {
            type: String,
            default: null,
        },
        // id:{
        //     type: Number,
        //     default: null,
        // },
        // imageType: {
        //     type: Number,
        //     default: null,
        // },
        imageUrl: {
            type: String,
            default: null,
        },

    },
    status: {
        type: Number,
        default: 1,

    },
    construction: {
        type: String,
    },
    constructionCallout: {
        type: String,
    },
    features: {
        type: String,
    },
    process: {
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
        imageType: {
            type: String
        },
        thumbnailPath: {
            type: String
        },
        displayOrder: {
            type: String
        }
    }],
    variantCount: {
        type: Number,
        default: 0,

    },
    isDeleted: {
        type: String,
        default: null,
    },
    // parentCategoryName: {
    //     type: String,
    // },
    // parentCategoryId: {
    //     type: String,
    // },
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
