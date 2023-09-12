var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var Users = new Schema({
  user_id: {
    type: mongoose.Types.ObjectId,
    ref: "Users"
  },
  sh_company_name: {
    type: String,
    default: "",
  },
  sh_contact_name: {
    type: String,
    default: "",
  },
  sh_address_1: {
    type: String,
    default: "",
  },
  sh_address_2: {
    type: String,
    default: "",
  },
  sh_country: {
    type: String,
    default: "",
  },
  sh_state: {
    type: String,
    default: "",
  },
  sh_city: {
    type: String,
    default: "",
  },
  sh_zip: {
    type: Number,
    default: 1,
  },
  sh_email: {
    type: String,
    default: "",
  },
  sh_country_code: {
    type: String,
    default: "",
  },
  sh_phone: {
    type: Number,
    default: null,
  },
  sh_tax_id: {
    type: Number,
    default: null,
  },
  b_company_name: {
    type: String,
    default: "",
  },
  b_contact_name: {
    type: String,
    default: "",
  },
  b_address_1: {
    type: String,
    default: "",
  },
  b_address_2: {
    type: String,
    default: "",
  },
  b_country: {
    type: String,
    default: "",
  },
  b_state: {
    type: String,
    default: "",
  },
  b_city: {
    type: String,
    default: "",
  },
  b_zip: {
    type: Number,
    default: null,
  },
  b_nc_tax_reg: {
    type: Number,
    default: null,
  },
  b_email: {
    type: String,
    default: "",
  },
  b_country_code: {
    type: String,
    default: "",
  },
  b_phone: {
    type: Number,
    default: null,
  },
  pay_trace_id: {
    type: String,
    default: "",
  },
  is_account_activated: {
    type: Number,
    default: 0,
  },
  status: {
    type: Number,
    default: 0,
  },
  created_on: {
    type: Number,
    default: 0,
  },
  updated_on: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("UserProfile", Users, "usersProfile");
