const joi = require("joi");

module.exports.profileSchema = {
    body: joi.object({
        firstName: joi.string(),
        lastName: joi.string(),
        phoneNumber: joi.string().length(10).message('Number must be 10 digits '),
        paymentDetails: {
            billingAddressData: {
                city: joi.string(),
                country: joi.string(),
                stateName: joi.string(),
                name: joi.string(),
                streetAddress: joi.string(),
                zipCode: joi.number().max(99999).message("Zip Code Must be 5 Digit"),
            },
            creditCardData: {
                ccNumber: joi.string(),
                expirationMonth: joi.string(),
                expirationYear: joi.string(),
            },
            customerId: joi.string().allow(''),
            phone: joi.string().required().length(10).message('Number must be 10 digits '),
        },
        billingAddress: {
            address1: joi.string(),
            address2: joi.string().allow(''),
            city: joi.string(),
            companyEmail: joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required().lowercase(),
            companyName: joi.string(),
            companyPhone: joi.string().required().length(10).message('Number must be 10 digits '),
            contactName: joi.string(),
            country: joi.string(),
            stateName: joi.string(),
            zipCode: joi.number().max(99999).message("Zip Code Must be 5 Digit"),
        },
        personalDetails: {
            height: joi.string().required(),
            weight: joi.string().required(),
            race: joi.string().required(),
            age: joi.number().required(),
            gender: joi.string().valid('male', 'female').required(),
            authenticity: joi.string().required(),
            waist: joi.string().required(),
        },
        isExemptionEligible: joi.boolean(),
        ncResaleCertificate: joi.string().allow(''),

        shippingAddress: {
            address1: joi.string(),
            address2: joi.string().allow(''),
            city: joi.string(),
            companyEmail: joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required().lowercase(),
            companyName: joi.string(),
            companyPhone: joi.string().required().length(10).message('Number must be 10 digits '),
            contactName: joi.string(),
            country: joi.string(),
            stateName: joi.string(),
            taxId: joi.string(),
            zipCode: joi.number().max(99999).message("Zip Code Must be 5 Digit"),
        },
        // userGuid: joi.string().required(),
    }),
};


module.exports.registrationSchema = {
    body: joi.object({
        firstName: joi.string().required(),
        lastName: joi.string().required(),
        email: joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required().lowercase(),
        password: joi.string().min(6).required(),
        phoneNumber: joi.string()

    })
};

module.exports.updateSubmissionDelay = {
    body: joi.object({
        orderSubmissionDelay: joi.string()

    })
};

module.exports.loginSchema = {
    body: joi.object({
        isLoginFromShopify: joi.boolean().required(),
        email: joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required().lowercase(),
        password: joi.string().required(),
        fcmToken: joi.string()
    })

};
module.exports.forgotSchema = {
    body: joi.object({
        email: joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required().lowercase(),
    })
};
module.exports.resetPasswordSchema = {
    body: joi.object({
        email: joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required().lowercase(),
        resetPasswordToken: joi.string().required(),
        newPassword: joi.string().required()
    })
};
module.exports.changePasswordSchema = {
    body: joi.object({
        oldPassword: joi.string().required(),
        newPassword: joi.string().required(),
        userId: joi.string().allow('')
    })
};