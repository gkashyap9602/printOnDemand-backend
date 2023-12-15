var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var VariableTypes = new Schema({
    typeName: {
        type: String,
        default: '',
        index: true
    },
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


module.exports = mongoose.model("VariableTypes", VariableTypes, "variableTypes");
