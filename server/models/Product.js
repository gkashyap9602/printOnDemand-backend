var mongoose = require("mongoose");
var Schema = mongoose.Schema;

// imageType = 1 for product image
// imageType = 3 for sizeChart image
// imageType = 2 for product varient image

// templateType = 1 for .pdf file [ not compressed ]
// templateType = 2 for .psd file [ not compressed ]
// templateType = 3 for .asd file [ not compressed ]
var Product = new Schema({
    subCategoryId: [{
        type: mongoose.Types.ObjectId,
        ref: "subcategory",
        index: true
    }],
    variableTypesId: [{
        type: mongoose.Types.ObjectId,
        ref: "variableTypes",
        index: true,

    }],
    materialId: [{
        type: mongoose.Types.ObjectId,
        ref: "material",
        index: true
    }],
    careInstructions: {
        type: String,
        default: ""
    },
    title: {
        type: String,
        required: true,
        unique: true
    },
    longDescription: {
        type: String,
        required: true
    },
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
        imageType: {
            type: Number,
            default: 3,
        },
        imageUrl: {
            type: String,
            default: null,
        },
    },
    status: {
        type: Number,
        default: 1,
        Comment: "1 for active 2 for delete "

    },
    construction: {
        type: String,
        default: null
    },
    constructionCallout: {
        type: String,
        default: null
    },
    features: {
        type: String,
        default: null
    },
    process: {
        type: String,
        default: null
    },
    productImages: [{
        _id: {
            type: mongoose.Types.ObjectId,
            index: true
        },
        fileName: {
            type: String,
            default: null,

        },
        imageUrl: {
            type: String,
            default: null,
        },
        imageType: {
            type: Number,
            default: 1,
        },
        thumbnailPath: {
            type: String,
            default: null,
        },
        displayOrder: {
            type: String
        }
    }],
    variantCount: {
        type: Number,
        default: 0,
    },
    isCustomizable: {
        type: Boolean,
        default: false,
    },
    isPersonalizable: {
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


Product.pre('aggregate', function () {
    // Add a $match state to the beginning of each pipeline.
    this.pipeline().unshift({ $match: { status: { $ne: 2 } } });
})

module.exports = mongoose.model("Product", Product, "product")