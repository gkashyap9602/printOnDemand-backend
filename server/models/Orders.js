var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var Orders = new Schema({
    customerId: {
        type: mongoose.Types.ObjectId,
        ref: "Users",
        index: true
    },
    shippingMethodId: {
        type: mongoose.Types.ObjectId,
        ref: "ShipMethod",
        index: true
    },
    displayId: {
        type: String,
        index: true,
        //order id for orders
    },
    mwwOrderId: {
        type: String,
        index: true,
        default: null
    },
    trackingNumbers: {
        type: String,
        default: null
    },
    source: {
        type: Number,
        default: null
    },
    receipt: {
        type: String,
        default: ""
    },
    ioss: {
        type: String,
        default: null
    },
    preship: {
        type: String,
        default: null
    },
    amount: {
        type: Number,
    },
    status: {
        type: String,
        default: 1,
        Comment: "1 for new 2 for inProduction 3 for shipped 4 for error  6 for recieved 5 for cancelled"
    },

    isSubmitImmediately: {
        type: Boolean,
        default: false
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
            type: String,
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
        // taxId: {
        //   type: String,
        //   default: "",
        // },

    },

    orderType: {
        type: Number,
        default: 1,
        Comment: "1 for LiveOrder 2 for TestOrder"
    },
    orderDate: {
        type: String,
        default: null,
    },
    updatedOn: {
        type: String,
        default: null,
    },
    // statusSummary: {
    //     cancelled: {
    //         type: Number,
    //         default: 0
    //     },
    //     error: {
    //         type: Number,
    //         default: 0
    //     },
    //     inProduction: {
    //         type: Number,
    //         default: 0
    //     },
    //     new: {
    //         type: Number,
    //         default: 0
    //     },
    //     received: {
    //         type: Number,
    //         default: 0
    //     },
    //     shipped: {
    //         type: Number,
    //         default: 0
    //     },

    // },
});


module.exports = mongoose.model("Orders", Orders, "orders");
