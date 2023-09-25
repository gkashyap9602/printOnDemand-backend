var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var ProductDesign = new Schema({
    guid: {
        type: String,
        index: true
    },
    designName: {
        type: String,
        required: true
    },
    product_design_files: [{
        fileName:{
            type: String,
            default: null,
        },
        fileType:{
            type: String,
            default: null,
        },
        filePath:{
            type: String,
            default: null,
        }
    }],
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


module.exports = mongoose.model("ProductDesign", ProductDesign, "productDesign");
