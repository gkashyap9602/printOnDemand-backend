var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var VariableTypes = new Schema({
    typeName: {
        type: String,
        required: true,
        index: true
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


module.exports = mongoose.model("VariableTypes", VariableTypes, "variableTypes");
