var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var VerificationRequest = new Schema({
    approved: {
        type: Number,
        default: 0,
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users"
    },
    image: {
        type: String,
        default: ""
    },
    status: {
        type: Number,
        default: 1
    }
}, { timestamps: true });
module.exports = mongoose.model('VerificationRequest', VerificationRequest, 'verificationRequest');