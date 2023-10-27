var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var FAQ = new Schema({
    question: {
        type: String,
        default: ''
    },
    answerVideo: {
        type: String,
        default: ''
    },
    answerVideoThumb: {
        type: String,
        default: ''
    },
    answer: {
        type: String,
        default: ''
    },
    status: {
        type: Number,
        default: 1
    },
    createdOn: {
        type: String,
        default: null,
    },
    updatedOn: {
        type: String,
        default: null,
    }
});
module.exports = mongoose.model('FAQ', FAQ, 'faq');