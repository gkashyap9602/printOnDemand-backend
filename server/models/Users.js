var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Users = new Schema({
    firstName: {
        type: String,
        default: ''
    },
    lastName: {
        type: String,
        default: ''
    },
    email: {
        type: String,
        unique:true,
        default: '',
        // required:true
    },
    userName: {
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
    // token:{
    //     type: String,
    //     default: ''
    // },
    // is_email_verified: {
    //     type: Number,
    //     default: 1
    // },
    // country_code: {
    //     type: String,
    //     default: ''
    // },
    // otp: {
    //     type: String,
    //     default: ''
    // },
    // is_blocked: {
    //     type: Number,
    //     default: 0
    // },
    id:{
        type: Number,
        default: 0
    },
    guid:{
        type: String,
        default: null
    },
    customerId:{
        type: Number,
        default: 0
    },
    customerGuid:{
        type: String,
        default: null
    },
    orderSubmissionDelay:{
        type: String,
        default: '00:01:00'
    },
    isLoginFromShopify:{
        type: Boolean,
        default: false
    },
    storeId:{
        type: Number,
        default: null
    },
    userType:{
        type: Number,
        default: 3,
        enum:[1,2,3]
        
    },
    status: {
        type: Number,
        default: 1,
        enum:[1,2,3]
    },
    payTraceId:{
        type: String,
        default: null
    },
    phoneNumber:{
        type: String,
        default: null,
    },
    traceId:{
        type: String,
        default: '0HMRHAOHIAHIS:0004003'
    }
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