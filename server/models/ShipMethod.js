var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var ShipMethod = new Schema({
    name: {
        type: String,
        default: ''
    },
    shipMethod: {
        type: String,
        default: "",
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


module.exports = mongoose.model("ShipMethod", ShipMethod, "shipMethod");
