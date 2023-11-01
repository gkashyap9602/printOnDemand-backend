var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var Gallery = new Schema({
    // fileName: {
    //     type: String,
    //     default: null
    // },
    type: {
        type: Number,
        default: 1,
        Comment:"1 for image 2 for video"
    },
    url: {
        type: String,
        default: null,
    },
    mediaType: {
        type: String,
        default: null,
    },
    title: {
        type: String,
        default: '',
    },
    status: {
        type: Number,
        default: 1,
        Comment:"1 for active 2 for delete "
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



module.exports = mongoose.model("Gallery", Gallery, "gallery");
