var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var LibraryImages = new Schema({
    fileName: {
        type: String,
        default: null
    },
    imageType: {
        type: Number,
        default: 1,
    },
    imageUrl: {
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



module.exports = mongoose.model("LibraryImages", LibraryImages, "libraryImages");
