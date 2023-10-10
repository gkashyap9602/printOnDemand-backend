var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var AdministratorSchema = new Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique:true,
        required:true
    },
    password: {
        type: String,
        default: ''
    },
    profileImagePath: {
        type: String,
        default: null
    },
    status: {
        type: Number,
        default: 1
    },
    userType: {
        type: Number,
        default: 1,

    },
    createdOn: {
        type: String,
        default: null
    },
    updatedOn: {
        type: String,
        default: null
    }
});
module.exports = mongoose.model('Administrator', AdministratorSchema, 'administrator');