var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Users = new Schema({
    username: {
        type: String,
        default: ''
    },
    profile_pic: {
        type: String,
        default: ''
    },
    email: {
        type: String,
        default: ''
    },
    password: {
        type: String,
        default: ''
    },
    country_code: {
        type: String,
        default: ''
    },
    phone: {
        type: String,
        default: ''
    },
    otp: {
        type: String,
        default: ''
    },
    google_id: {
        type: String,
        default: ''
    },
    fb_uid: {
        type: String,
        default: ''
    },
    auth_token: {
        type: String,
        default: ''
    },
    status: {
        type: Number,
        default: 1
    },
    instaLink: {
        type: String,
        default: ""
    },
    bio: {
        type: String,
        default: ""
    },
    delete_reason: {
        type: String,
        default: ""
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
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users"
    }],
    plans: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Plans"
    }],
    created_on: {
        type: Number,
        default: 0
    },

    following: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users"
    }],
    updated_on: {
        type: Number,
        default: 0
    },
    rico_points: {
        default: 0,
        type: Number
    },
    bank_account: {
        name: { default: "", type: String },
        ifsc: { default: "", type: String },
        account_number: { default: 0, type: Number },
        type: Object
    },
    vpa: {
        default: "", type: String
    },
    default_payment_mode: {
        default: "bank", type: String
    },
    donated_amount: {
        default: 0,
        type: Number
    },
    recieved_amount: {
        default: 0,
        type: Number
    },
    badge: {
        default: 0,
        type: Number
    },
    user_verified_face: {
        default: 0,
        type: Number
    },
    user_verified_answers: {
        default: 0,
        type: Number
    },
    monthly_views: {
        default: 0,
        type: Number
    },
    total_views: {
        default: 0,
        type: Number
    },
    frames: {
        type: Object,
        default: {
            new_angel: { is_unlocked: 0, is_active: 0 },
            master_angel: { is_unlocked: 0, is_active: 0 },
            old_angel: { is_unlocked: 0, is_active: 0 },
            super_angel: { is_unlocked: 0, is_active: 0 },
            gift_guru: { is_unlocked: 0, is_active: 0 },
            gift_hero: { is_unlocked: 0, is_active: 0 },
            super_gifter: { is_unlocked: 0, is_active: 0 },
            creative_gifter: { is_unlocked: 0, is_active: 0 },
            helpful_mentor: { is_unlocked: 0, is_active: 0 },
            gift_champion: { is_unlocked: 0, is_active: 0 },
            joy_spreader: { is_unlocked: 0, is_active: 0 },
            gifting_pro: { is_unlocked: 0, is_active: 0 },
            popular_star: { is_unlocked: 0, is_active: 0 },
            talented_start: { is_unlocked: 0, is_active: 0 },
            rising_star: { is_unlocked: 0, is_active: 0 }
        }
    },
    icon: {
        default: "", type: String
    },
    level: {
        default: 0,
        type: Number
    },
    total_amount_added: {
        default: 0,
        type: Number
    },
    monthly_amount_added: {
        default: 0,
        type: Number
    },
    rank: {
        default: 0,
        type: Number
    },
    vvip:{
        default: 0,
        type: Number
    }

});
// badge 0 is not verified
module.exports = mongoose.model('Users', Users, 'users');