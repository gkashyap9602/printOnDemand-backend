var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Users = new Schema({
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
        unique: true,
        required: true
    },
    userName: {
        type: String,
        default: ''
    },
    password: {
        type: String,
        default: null
    },
    profileImagePath: {
        type: String,
        default: null
    },
    fcmToken: {
        type: String,
        default: null
    },
    createdUser: {
        type: String,
        default: 'Admin'
    },
    // is_email_verified: {
    //     type: Number,
    //     default: 1
    // },
    // is_blocked: {
    //     type: Number,
    //     default: 0
    // },
    id: {
        type: Number,
        default: 0
    },
    customerId: {
        type: Number,
        default: 0
    },
    orderSubmissionDelay: {
        type: String,
        default: '00:01:00'
    },
    isLoginFromShopify: {
        type: Boolean,
        default: false
    },
    storeId: {
        type: Number,
        default: null
    },
    userType: {
        type: Number,
        default: 3,
        enum: [1, 2, 3],
        Comment: '1 for admin 3 for user 2 for subAdmin'

    },
    status: {
        type: Number,
        default: 3,
        Comment: "1 for active 2 for delete  3 for pending 4 for deactivate ",
        enum: [1, 2, 3],
        index: true
    },
    access: [{
        title: {
            type: String,
            default: ''
        },
        accessUrl: [{
            type: String
        }],
        value: {
            read: {
                type: Boolean,
                default: false,

            },
            write: {
                type: Boolean,
                default: false,
            }
        }
    }],
    payTraceId: {
        type: String,
        default: null
    },
    phoneNumber: {
        type: String,
        default: null,
    },
    traceId: {
        type: String,
        default: '0HMRHAOHIAHIS:0004003'
    }
    ,
    createdOn: {
        type: String,
        default: null
    },
    updatedOn: {
        type: String,
        default: null
    },
});

module.exports = mongoose.model('User', Users, 'users');