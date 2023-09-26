var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var ProductVarient = new Schema({
    product_id: {
        type: mongoose.Types.ObjectId,
        ref: "product",
        index: true
    },
    product_design_id: {
        type: mongoose.Types.ObjectId,
        ref: "productDesign",
        index: true
    },
    guid: {
        type: String,
        index: true
    },
    productCode: {
        type: String,
        required: true
    },
    dpi: {
        type: String,
        default:null
    },
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
        type: String,
    },
    msrp: {
        type: String,
        default:null
    },
    designPanels: {
        type: String,
    },
    designerAvailable: {
        type: Boolean,
        default:false
    },
    status: {
        type: Number,
        default: 0,
    },
    // exentaItemNumber: {
    //     type: Number,
    //     default: 0,
    // },
    productVarientImages: [{
        _id: {
            type: mongoose.Types.ObjectId,
            default: mongoose.Types.ObjectId()
        },
        image_url: {
            type: String,

        },
        FileName:{
            type: String,

        },
        imageType:{
            type: String,

        },
        thumbnailPath:{
            type: String,

        },
        displayOrder:{
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
