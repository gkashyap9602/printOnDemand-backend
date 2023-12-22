var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var UserProfile = new Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    ref: "users",
    index: true
  },
  personalDetails: {
    height: {
      type: String,
      default: null
    },
    weight: {
      type: String,
      default: null
    },
    race: {
      type: String,
      default: null
    },
    age: {
      type: Number,
      default: null
    },
    gender: {
      type: String,
      default: null,
      // enum: ['male','female']
    },
    authenticity: {
      type: String,
      default: null
    },
    waist: {
      type: String,
      default: null
    },
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
    taxId: {
      type: String,
      default: null,
    },
    city: {
      type: String,
      default: "",
    },
    zipCode: {
      type: Number,
      default: null,
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
    city: {
      type: String,
      default: "",
    },
    zipCode: {
      type: Number,
      default: null,
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

  isExemptionEligible: {
    type: Boolean,
    default: false,
  },
  ncResaleCertificate: {
    type: String,
    default: "",
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
      country: {
        type: String,
        default: "",
      },
      stateName: {
        type: String,
        default: "",
      },
      city: {
        type: String,
        default: "",
      },
      zipCode: {
        type: Number,
        default: null,
      },

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
      // validate:''
    },
    customerId: {
      type: Number,
      default: null,
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
  createdOn: {
    type: String,
    default: null,
  },
  updatedOn: {
    type: String,
    default: null,
  },
});

module.exports = mongoose.model("UserProfile", UserProfile, "userProfile");
