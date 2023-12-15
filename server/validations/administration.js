const joi = require("joi");
module.exports.updateWaitingList = {
    body: joi.object({
        value: joi.boolean().required()
    })

};


module.exports.addMaterial = {
    body: joi.object({
        name: joi.string().required(),
    })

};
module.exports.updateMaterial = {
    body: joi.object({
        materialId: joi.string().length(24).message("Invalid Id please check").required(),
        name: joi.string(),
        status: joi.number()
    })

};

module.exports.saveNotification = {
    body: joi.object({
        type: joi.string().valid('MWW_Global', 'users').required(),
        title: joi.string().required(),
        userIds: joi.array(),
        description: joi.string().required(),

    })

};
module.exports.addSubAdmin = {
    body: joi.object({
        email: joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required().lowercase(),
        firstName: joi.string().required(),
        lastName: joi.string(),
        password: joi.string().required(),
        access: joi.array().required()

    })

};
module.exports.createCustomer = {
    body: joi.object({
        email: joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required().lowercase(),
        firstName: joi.string().required(),
        lastName: joi.string(),
        // password: joi.string().required(),
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
            phone: joi.string().max(13).message("Phone length must be 10").min(10).message("Phone length must be 10"),
        },
        billingAddress: {
            address1: joi.string(),
            address2: joi.string().allow(''),
            city: joi.string(),
            companyEmail: joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required().lowercase(),
            companyName: joi.string(),
            companyPhone: joi.string().max(13).message("Phone length must be 10").min(10).message("Phone length must be 10"),
            contactName: joi.string(),
            country: joi.string(),
            stateName: joi.string(),
            zipCode: joi.number().max(99999).message("Zip Code Must be 5 Digit"),
        },
        // personalDetails: {
        //     height: joi.string().required(),
        //     weight: joi.string().required(),
        //     race: joi.string().required(),
        //     age: joi.number().required(),
        //     gender: joi.string().valid('male', 'female').required(),
        //     authenticity: joi.string().required(),
        //     waist: joi.string().required(),
        // },
        isExemptionEligible: joi.boolean(),
        ncResaleCertificate: joi.string().allow(''),

        shippingAddress: {
            address1: joi.string(),
            address2: joi.string().allow(''),
            city: joi.string(),
            companyEmail: joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required().lowercase(),
            companyName: joi.string(),
            companyPhone: joi.string().max(13).message("Phone length must be 10").min(10).message("Phone length must be 10"),
            contactName: joi.string(),
            country: joi.string(),
            stateName: joi.string(),
            taxId: joi.string(),
            zipCode: joi.number().max(99999).message("Zip Code Must be 5 Digit"),
        },
        payTraceId: joi.string().allow("")


    })

};
module.exports.updateCustomer = {
    body: joi.object({
        userId: joi.string().length(24).message("Invalid Id please check").required(),
        firstName: joi.string().required(),
        lastName: joi.string(),
        // password: joi.string().required(),
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
            phone: joi.string().max(13).message("Phone length must be 10").min(10).message("Phone length must be 10"),
        },
        billingAddress: {
            address1: joi.string(),
            address2: joi.string().allow(''),
            city: joi.string(),
            companyEmail: joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required().lowercase(),
            companyName: joi.string(),
            companyPhone: joi.string().max(13).message("Phone length must be 10").min(10).message("Phone length must be 10"),
            contactName: joi.string(),
            country: joi.string(),
            stateName: joi.string(),
            zipCode: joi.number().max(99999).message("Zip Code Must be 5 Digit"),
        },
        // personalDetails: {
        //     height: joi.string().required(),
        //     weight: joi.string().required(),
        //     race: joi.string().required(),
        //     age: joi.number().required(),
        //     gender: joi.string().valid('male', 'female').required(),
        //     authenticity: joi.string().required(),
        //     waist: joi.string().required(),
        // },
        isExemptionEligible: joi.boolean(),
        ncResaleCertificate: joi.string().allow(''),

        shippingAddress: {
            address1: joi.string(),
            address2: joi.string().allow(''),
            city: joi.string(),
            companyEmail: joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required().lowercase(),
            companyName: joi.string(),
            companyPhone: joi.string().max(13).message("Phone length must be 10").min(10).message("Phone length must be 10"),
            contactName: joi.string(),
            country: joi.string(),
            stateName: joi.string(),
            taxId: joi.string(),
            zipCode: joi.number().max(99999).message("Zip Code Must be 5 Digit"),
        },


    })

};
module.exports.activeInactiveuser = {
    body: joi.object({
        status: joi.any().required(),
        userId: joi.string().length(24).message("Invalid Id please check").required(),

    })

};
module.exports.updateSubAdmin = {
    body: joi.object({
        subAdminId: joi.string().length(24).message("Invalid Id please check").required(),
        firstName: joi.string(),
        lastName: joi.string(),
        access: joi.array(),
        status: joi.any()
    })

};
module.exports.deleteNotification = {
    body: joi.object({
        notificationId: joi.string().length(24).message("Invalid Id please check").required(),
        type: joi.string().valid('MWW_Global', 'users').required(),

    })

};
module.exports.addToGallery = {
    body: joi.object({
        type: joi.number().valid(1, 2).required(), //1 for images 2 for videos
        title: joi.string(), //1 for images 2 for videos

    })

};
module.exports.deleteFromGallery = {
    body: joi.object({
        galleryId: joi.string().length(24).message("Invalid Id please check").required(),
        type: joi.number().valid(1, 2).required(), //1 for images 2 for videos

    })

};
