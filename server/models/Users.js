var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Users = new Schema({
    firstName: {
        type: String,
        default: ""
    },
    lastName: {
        type: String,
        default: ''
    },
    email: {
        type: String,
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
    // is_blocked: {
    //     type: Number,
    //     default: 0
    // },
    // id: {
    //     type: Number,
    //     default: 0
    // },
    customerId: {
        type: Number,
        default: null
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
        Comment: "1 for active 2 for delete  3 for pending 4 for deactivate",
        // enum: [1, 2, 3, 4],
        index: true
    },
    access: [{
        title: {
            type: String,
            default: ''
        },
        key: {
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
        type: Number,
        default: null
    },
    phoneNumber: {
        type: String,
        default: null,
    },
    traceId: {
        type: String,
        default: '0HMRHAOHIAHIS:0004003'
    },
    storeAccessToken: {
        type: String,
        default: ''
    },
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

