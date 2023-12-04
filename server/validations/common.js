
const joi = require("joi");

module.exports.addQuestionSchema = {
    body: joi.object({
        question: joi.string().required(),
        answer: joi.string().required(),
    })

};
module.exports.updateQuestionSchema = {
    body: joi.object({
        question: joi.string(),
        answer: joi.string(),
        quesId: joi.string().required(),
        status: joi.number().allow('')
    })

};
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
