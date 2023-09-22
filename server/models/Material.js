var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var Material = new Schema({
    name: {
        type: String,
        required:true
    },
    guid:{
     type:String,
     index:true
    },
    isDeleted: {
        type: Boolean,
        default: false,
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
