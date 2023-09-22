var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var Material = new Schema({
    fileName: {
        type: String,
        required:true

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
