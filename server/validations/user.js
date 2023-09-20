const joi = require("joi");

module.exports.profileSchema = {
    body: joi.object({
        firstName: joi.string(),
        lastName: joi.string(),
        paymentDetails: {
            billingAddressData: {
                city: joi.string(),
                countryCode: joi.string(),
                stateCode: joi.string().max(2).message("State Code Length Must be 2"),
                name: joi.string(),
                streetAddress: joi.string(),
                zip: joi.string().max(5).message("Zip Code Length Must be 5"),
            },
            creditCardData: {
                ccNumber: joi.string(),
                expirationMonth: joi.string(),
                expirationYear: joi.string(),
            },
            customerId: joi.string().allow(''),
            phone: joi.string().max(10).message("Phone length must be 10"),
        },
        billingAddress: {
            address1: joi.string(),
            address2: joi.string().allow(''),
            city: joi.string(),
            companyEmail: joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required().lowercase(),
            companyName: joi.string(),
            companyPhone: joi.string().max(10).message("Phone length must be 10"),
            contactName: joi.string(),
            country: joi.string(),
            stateName: joi.string(),
            taxId: joi.string(),
            zipCode: joi.string().max(5).message("Zip Code Length Must be 5"),
        },
        isExemptionEligible: joi.boolean(),
        ncResaleCertificate: joi.string().allow(''),

        shippingAddress: {
            address1: joi.string(),
            address2: joi.string().allow(''),
            city: joi.string(),
            companyEmail: joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required().lowercase(),
            companyName: joi.string(),
            companyPhone: joi.string().max(10).message("Phone length must be 10"),
            contactName: joi.string(),
            country: joi.string(),
            stateName: joi.string(),
            taxId: joi.string(),
            zipCode: joi.any(),
        },
        userGuid: joi.string().required(),
    }),
};


module.exports.registrationSchema = {
    body: joi.object({
        firstName: joi.string().required(),
        lastName: joi.string().required(),
        email: joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required().lowercase(),
        password: joi.string().min(6).required(),

    })
};

module.exports.loginSchema = {
    body: joi.object({
        isLoginFromShopify: joi.boolean().required(),
        userName: joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required().lowercase(),
        password: joi.string().required()
    })

};
module.exports.forgotSchema = {
    body: joi.object({
        email: joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required().lowercase(),
    })
};
module.exports.resetPasswordSchema = {
    body: joi.object({
        emailId: joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required().lowercase(),
        resetPasswordToken: joi.string().required(),
        newPassword: joi.string().required()
    })
};
module.exports.changePasswordSchema = {
    body: joi.object({
        oldPassword: joi.string().required(),
        newPassword: joi.string().required(),
        userId:joi.string()
    })
};