
const joi = require("joi");

module.exports.addToCart = {
    body: joi.object({
        cartItems: joi.array().required(),
    })

};

module.exports.updateCart = {
    body: joi.object({
        cartId: joi.string().length(24).message("Invalid Id please check").required(),
        quantity: joi.number().max(9999).required()
    })

};
module.exports.updateOrderStatus = {
    body: joi.object({
        orderId: joi.string().length(24).message("Invalid Id please check").required(),
        orderStatus: joi.number().valid(1, 2, 3, 4, 5, 6).required()
    })

};
module.exports.updateOrder = {
    body: joi.object({
        orderId: joi.string().length(24).message("Invalid Id please check").required(),
        totalAmount: joi.number().required(),
        orderItems: joi.array().required(),
        orderType: joi.number().valid(1, 2).required(),//1 for live order 2 for testOrder
        ioss: joi.string().allow(null),
        preship: joi.string().allow(""),
        receipt: joi.string().allow(""),
        shippingAccountNumber: joi.string().allow(""),
        shippingMethodId: joi.string().required(),
        shippingAddress: {
            address1: joi.string(),
            address2: joi.string().allow(''),
            city: joi.string(),
            companyEmail: joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required().lowercase(),
            companyName: joi.string(),
            companyPhone: joi.string().required(),
            contactName: joi.string(),
            country: joi.string(),
            stateName: joi.string(),
            taxId: joi.string(),
            zipCode: joi.string().max(5).message("Zip Code Must be 5 Digit"),
        },
        billingAddress: {
            address1: joi.string(),
            address2: joi.string().allow(''),
            city: joi.string(),
            companyEmail: joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required().lowercase(),
            companyName: joi.string(),
            companyPhone: joi.string().required(),
            contactName: joi.string(),
            country: joi.string(),
            stateName: joi.string(),
            zipCode: joi.string().max(5).message("Zip Code Length Must be 5"),
        },
    })

};
module.exports.deleteCart = {
    body: joi.object({
        cartId: joi.string().length(24).message("Invalid Id please check").required(),
    })

};
module.exports.getAllOrders = {
    body: joi.object({
        pageIndex: joi.string(),
        pageSize: joi.number(),
        sortColumn: joi.string(),
        sortDirection: joi.string(),
        createdFrom: joi.string().allow(''),
        createdTill: joi.string().allow(''),
        status: joi.number(),
        orderType: joi.number().allow(''),
        searchKey: joi.string().allow('')
    })

};
module.exports.placeOrder = {
    body: joi.object({
        totalAmount: joi.number().required(),
        orderItems: joi.array().required(),
        // customerId: joi.string().length(24).message("invalid id").required(),
        orderType: joi.number().valid(1, 2).required(),//1 for live order 2 for testOrder
        cartItems: joi.array().allow(null),
        ioss: joi.string().allow(null),
        preship: joi.string().allow(""),
        receipt: joi.string().allow(""),
        shippingAccountNumber: joi.string().allow(""),
        shippingMethodId: joi.string().required(),
        submitImmediately: joi.boolean().required(),
        shippingAddress: {
            address1: joi.string(),
            address2: joi.string().allow(''),
            city: joi.string(),
            companyEmail: joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required().lowercase(),
            companyName: joi.string(),
            companyPhone: joi.string().required(),
            contactName: joi.string(),
            country: joi.string(),
            stateName: joi.string(),
            taxId: joi.string(),
            zipCode: joi.string().max(5).message("Zip Code Must be 5 Digit"),
        },
        billingAddress: {
            address1: joi.string(),
            address2: joi.string().allow(''),
            city: joi.string(),
            companyEmail: joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required().lowercase(),
            companyName: joi.string(),
            companyPhone: joi.string().required(),
            contactName: joi.string(),
            country: joi.string(),
            stateName: joi.string(),
            zipCode: joi.string().max(5).message("Zip Code Length Must be 5"),
        },

    })

};


