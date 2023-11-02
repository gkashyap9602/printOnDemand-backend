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
        default: 1,
        Comment:"1 for active 2 for delete "
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