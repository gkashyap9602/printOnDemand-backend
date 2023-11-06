var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var Material = new Schema({
    name: {
        type: String,
        required: true
    },
    // isDeleted: {
    //     type: Boolean,
    //     default: false,
    // },
    status: {
        type: Number,
        default: 1,
        Comment: "1 for active 2 for delete "
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


module.exports = mongoose.model("Material", Material, "material");
