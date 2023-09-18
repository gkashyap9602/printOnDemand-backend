const joi = require('joi')

module.exports.userProfileSchema = {

    body: joi.object({
        paymentDetails: {
            billingAddressData: {
                city: joi.string(),
                countryCode: joi.string(),
                stateCode: joi.string().max(2).message("State Code Length Must be 2"),
                name: joi.string(),
                streetAddress: joi.string(),
                zip: joi.number().max(5).message("Zip Code Length Must be 5")
            },
            creditCardData: {
                ccNumber: joi.string(),
                expirationMonth: joi.string().valid(1,2,3,4,5,6,7,8,9,10,11,12),
                expirationYear: joi.string()
            },
            customerId: joi.string(),
            phone: joi.string().max(10)
        },
        userGuid:joi.string().required()

    })
}