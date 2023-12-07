
const joi = require("joi");

module.exports.raiseTicket = {
    body: joi.object({
        description: joi.string().required(),
        subject: joi.string().required(),
    })

};
module.exports.updateCommonContentSchema = {
    body: joi.object({
        about: joi.string(),
        privacyPolicy: joi.string(),
        termsConditions: joi.string(),
        howItWorks: joi.string()
    })

};
