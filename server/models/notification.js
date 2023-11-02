var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var Notification = new Schema({
    type: {
        type: String,
        required: true,
        Comment: "MWW_Global,users"

    },
    title: {
        type: String,
        required: true
    },
    userIds: [
        {
            type: mongoose.Types.ObjectId,
            ref: 'users',
            index: true
        },
    ],
    description: {
        type: String,
        required: true
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


module.exports = mongoose.model("Notification", Notification, "notification");
