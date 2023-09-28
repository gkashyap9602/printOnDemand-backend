const joi = require("joi");

module.exports.loginSchema = {
    body: joi.object({
        email: joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required().lowercase(),
        password: joi.string().required()
    })

};



module.exports.addMaterialSchema = {
    body: joi.object({
        name: joi.string().required(),
    })

};

