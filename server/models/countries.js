var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var Countries = new Schema({

    id: {
        type: Number,
        index:true
    },
    name: {
        type: String,
        index:true
    },
    code: {
        type: String,
        index:true
    },
    

});


module.exports = mongoose.model("Countries", Countries, "countries");
