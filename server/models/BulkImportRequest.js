var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var BulkImportRequest = new Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        ref: "Users",
        index: true
    },
    uploadedFilePath: {
        type: String,
        default: null
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


module.exports = mongoose.model("BulkImportRequest", BulkImportRequest, "bulkImportRequest");
