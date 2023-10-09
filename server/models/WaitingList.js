var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var WaitingList = new Schema({
    isWaitingListEnable: {
        type: Boolean,
        default: false
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


module.exports = mongoose.model("WaitingList", WaitingList, "waitingList");
