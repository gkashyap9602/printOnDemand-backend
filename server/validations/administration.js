const joi = require("joi");

module.exports.loginSchema = {
    body: joi.object({
        email: joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required().lowercase(),
        password: joi.string().required()
    })

};

module.exports.updateWaitingList = {
    body: joi.object({
        value: joi.boolean().required()
    })

};


module.exports.addMaterialSchema = {
    body: joi.object({
        name: joi.string().required(),
    })

};

module.exports.saveNotificationSchema = {
    body: joi.object({
        type: joi.string().valid('MWW_Global', 'users').required(),
        title: joi.string().required(),
        userIds: joi.array(),
        description: joi.string().required(),

    })

};
