var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var CommonContent = new Schema({
    about: {
        type: String,
        default: ''
    },
    privacy_policy: {
        type: String,
        default: ''
    },
    terms_conditions: {
        type: String,
        default: ''
    },
    updated_on: {
        type: Number,
        default: 0
    },

});
module.exports = mongoose.model('CommonContent', CommonContent, 'common_content');