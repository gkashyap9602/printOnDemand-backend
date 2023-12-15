var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var Category = new Schema({
    name: {
        type: String,
        index: true
    },
    description: {
        type: String,
        default: "",
    },
    imageUrl: {
        type: String,
        default: null,
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



module.exports = mongoose.model("Category", Category, "category");