const joi = require("joi");

module.exports.loginSchema = {
    body: joi.object({
        email: joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required().lowercase(),
        password: joi.string().required()
    })

};


module.exports.addCategorySchema = {
    body: joi.object({
        name: joi.string().required(),
        description: joi.string().allow(''),
    })

};
module.exports.addSubCategorySchema = {
    body: joi.object({
        name: joi.string().required(),
        description: joi.string().allow(''),
        category_id:joi.string().required()
    })

};
