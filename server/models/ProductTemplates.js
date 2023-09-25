var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var ProductTemplates = new Schema({
    guid: {
        type: String,
        index: true
    },
    fileName: {
        type: String,
        required: true
    },
    filePath: {
        type: String,
        required: true
    },
    productTemplateId: {
        type: String,
        required: true
    },
    templateType: {
        type: Number,
        required: true
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


module.exports = mongoose.model("ProductTemplates", ProductTemplates, "productTemplates");
