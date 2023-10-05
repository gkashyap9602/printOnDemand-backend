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
    // is_blocked: {
    //     type: Number,
    //     default: 0
    // },
    id:{
        type: Number,
        default: 0
    },
    // guid:{
    //     type: String,
    //     default: null
    // },
    customerId:{
        type: Number,
        default: 0
    },
    // customerGuid:{
    //     type: String,
    //     default: null
    // },
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
        default: 2,
        Comment:"1 for active 2 for pending Activation 3 for deactivate user",
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