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
        default: ''
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
    // device_info: [{
    //     fcm_token: {
    //         type: String,
    //         default: ""
    //     },
    //     device_id: {
    //         type: String,
    //         default: ""
    //     },
    //     os: {
    //         type: String,
    //         default: ""
    //     },
    //     access_token: {
    //         type: String,
    //         default: ""
    //     },
    //     refresh_token: {
    //         type: String,
    //         default: ""
    //     }
    // }],

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