var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CommonContent = new Schema({
    about: {
        type: String,
        default: ''
    },
    privacyPolicy: {
        type: String,
        default: ''
    },
    termsConditions: {
        type: String,
        default: ''
    },
    disclaimer: {
        type: String,
        default: ''
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
module.exports = mongoose.model('CommonContent', CommonContent, 'commonContent');