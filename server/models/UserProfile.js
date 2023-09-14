var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var UserProfile = new Schema({
  user_id: {
    type: mongoose.Types.ObjectId,
    ref: "users"
  },

  shippingAddress: {
    companyName: {
      type: String,
      default: "",
    },
    contactName: {
      type: String,
      default: "",
    },
    address1: {
      type: String,
      default: "",
    },
    address2: {
      type: String,
      default: "",
    },
    country: {
      type: String,
      default: "",
    },
    stateName: {
      type: String,
      default: "",
    },
    taxId:{
      type: Number,
      default: null,
    },
    city: {
      type: String,
      default: "",
    },
    zipCode: {
      type: Number,
      default: 1,
    },
    companyEmail: {
      type: String,
      default: "",
    },
  
    companyPhone: {
      type: String,
      default: "",
    },
    
  },
  billingAddress: {
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
  },
  paymentDetails: {
    billingAddressData: {
      name: {
        type: String,
        default: "",
      },
      streetAddress: {
        type: String,
        default: "",
      },
      countryCode: {
        type: String,
        default: "",
      },
      stateCode: {
        type: String,
        default: "",
      },
      city: {
        type: String,
        default: "",
      },
      zip: {
        type: Number,
        default: null,
      },
      creditCardData: {
        ccNumber: {
          type: String,
          default: "",
        },
        expirationMonth: {
          type: String,
          default: "",
        },
        expirationYear: {
          type: String,
          default: "",
        },

      },
      phone: {
        type: String,
        default: "",
      },
      customerId: {
        type: String,
        default: "",
      },
    },
    completionStaus: {
      basicInfo: {
        type: Boolean,
        default: false,
      },
      billingInfo: {
        type: Boolean,
        default: false,
      },
      paymentInfo: {
        type: Boolean,
        default: false,
      },
      shippingInfo: {
        type: Boolean,
        default: false,
      },

    },

    ncResaleInfo: {
      isExemptionEligible: {
        type: Boolean,
        default: false,
      },
      ncResaleCertificate: {
        type: String,
        default: null,
      }
    },
    created_on: {
      type: Number,
      default: 0,
    },
    updated_on: {
      type: Number,
      default: 0,
    },
  }
});

module.exports = mongoose.model("UserProfile", UserProfile, "usersProfile");
