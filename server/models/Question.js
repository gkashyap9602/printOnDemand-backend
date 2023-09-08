var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Questions = new Schema({
    question: {
        type: String,
        default: ""
    },
    answers: { type: Array, default: [] },
    correct_answer: { default: 0, type: Number },
    status: {
        type: Number,
        default: 1
    }
}, { timestamps: true });

module.exports = mongoose.model('Questions', Questions, 'questions');