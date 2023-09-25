var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var VariableOptions = new Schema({
    variableTypeId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: 'variableTypes',
        index: true
    },
    value: {
        type: String,
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


module.exports = mongoose.model("VariableOptions", VariableOptions, "variableOptions");
