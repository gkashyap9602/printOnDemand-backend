var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var ProductVarient = new Schema({

    productId: {
        type: mongoose.Types.ObjectId,
        ref: "Product",
        index: true
    },
    // productDesignId: {
    //     type: mongoose.Types.ObjectId,
    //     ref: "productDesign",
    //     index: true
    // },
    productCode: {
        type: String,
        required: true,
    },
    dpi: {
        type: String,
        default: null
    },
    varientOptions: [{
        variableTypeId: {
            type: mongoose.Types.ObjectId,
            index: true,
            ref: "VariableTypes"
        },
        variableOptionId: {
            type: mongoose.Types.ObjectId,
            index: true,
            ref: "VariableOptions"
        },


    }],
    productVarientTemplates: [{
        _id: {
            type: mongoose.Types.ObjectId,
        },
        fileName: {
            type: String,
            default: null
        },
        filePath: {
            type: String,
            default: null
        },
        templateType: {
            type: Number,
            default: 1
        },
    }],
    // itemName: {
    //     type: String,
    //     required: true
    // },
    // size: {
    //     type: String,
    //     required: true
    // },
    // sizeInCm: {
    //     type: String,
    //     required: true
    // },
    price: {
        type: Number,
        default:0
    },
    msrp: {
        type: String,
        default: null
    },
    designPanels: {
        type: String,
        default: null
    },
    designerAvailable: {
        type: Boolean,
        default: false
    },
    status: {
        type: Number,
        default: 1,
        Comment: "1 for active 2 for delete"
    },
    // exentaItemNumber: {
    //     type: Number,
    //     default: 0,
    // },
    productVarientImages: [{
        _id: {
            type: mongoose.Types.ObjectId,
            // default: mongoose.Types.ObjectId()
        },
        image_url: {
            type: String,

        },
        FileName: {
            type: String,

        },
        imageType: {
            type: String,

        },
        thumbnailPath: {
            type: String,

        },
        displayOrder: {
            type: String,

        }

    }],
    isDefaultTemplate: {
        type: Boolean,
        default: false,
    },
    isProductVariantDeleted: {
        type: Boolean,
        default: false,
    },
    isActiveFrom: {
        type: String,
        default: null,
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


module.exports = mongoose.model("ProductVarient", ProductVarient, "productVarient");
