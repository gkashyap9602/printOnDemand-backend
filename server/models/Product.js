var mongoose = require("mongoose");
var Schema = mongoose.Schema;

// imageType = 1 for product image
// imageType = 3 for sizeChart image
// imageType = 2 for product varient image

// templateType = 1 for .pdf file
// templateType = 2 for .psd file
// templateType = 3 for .asd file
var Product = new Schema({
    subCategoryId: [{
        type: mongoose.Types.ObjectId,
        ref: "subcategory",
        index: true
    }],
    variableTypesId: [{
        type: mongoose.Types.ObjectId,
        ref: "variableTypes",
        index: true
    }],
    materialId: {
        type: mongoose.Types.ObjectId,
        ref: "material"
    },
    careInstructions: {
        type: String,
        default:""
    },
    title: {
        type: String,
        required: true,
        unique:true
    },
    longDescription: {
        type: String,
        required:true
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

    },
    construction: {
        type: String,
        default:null
    },
    constructionCallout: {
        type: String,
        default:null
    },
    features: {
        type: String,
        default:null
    },
    process: {
        type: String,
        default:null
    },
    productImages: [{
        _id: {
            type: mongoose.Types.ObjectId,
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
    isDeleted: {
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


module.exports = mongoose.model("Product", Product, "product");
