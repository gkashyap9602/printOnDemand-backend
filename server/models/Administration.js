var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var AdministratorSchema = new Schema({
    full_name: {
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
    profile_pic: {
        type: String,
        default: ''
    },
    status: {
        type: Number,
        default: 1
    },
    device_info: [{
        fcm_token: {
            type: String,
            default: ""
        },
        device_id: {
            type: String,
            default: ""
        },
        os: {
            type: String,
            default: ""
        },
        access_token: {
            type: String,
            default: ""
        },
        refresh_token: {
            type: String,
            default: ""
        }
    }],
    otp: {
        type: String,
        default: ""
    },
    created_on: {
        type: Number,
        default: 0
    },
    updated_on: {
        type: Number,
        default: 0
    }
});
module.exports = mongoose.model('Administrator', AdministratorSchema, 'administrator');