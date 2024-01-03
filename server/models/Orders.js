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
    bulkImportRequestId: {
        type: mongoose.Types.ObjectId,
        ref: "BulkImportRequest",
        Comment: "excel file id ",
        index: true
    },
    // customerOrderId: {
    //     type: String,
    //     index: true,
    //     Comment: "OrderId from Excel Bulk import"
    // },
    // shippedOn: {
    //     type: String,
    //     default: null
    // },
    // isProcessing: {
    //     type: Boolean,
    //     default: false
    // },
    shippingAccountNumber: {
        type: String,
        default: '',
        Comment: "Third Party Shipping Accounts number"
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
        default: 1,
        Comment: "default is 1 for order created by user library and 5 for order by excel upload"
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
        Comment: "total amount of a order"
    },
    status: {
        type: Number,
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

});


module.exports = mongoose.model("Orders", Orders, "orders");
