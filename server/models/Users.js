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
    userName: {
        type: String,
        default: ''
    },
    password: {
        type: String,
        default: ''
    },
    status: {
        type: Number,
        default: 1
    },
    userType: {
        type: Number,
        default: 3
    },
    profileImagePath:{
        type: String,
        default: null
    },
    created_on: {
        type: Number,
        default: 0
    },
    updated_on: {
        type: Number,
        default: 0
    },
});

module.exports = mongoose.model('Users', Users, 'users');