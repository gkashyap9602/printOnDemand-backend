
const joi = require("joi");


module.exports.addVariableTypeSchema = {
    body: joi.object({
        typeName: joi.string().required(),
    })

};
module.exports.addVariableOptionSchema = {
    body: joi.object({
        variableTypeId: joi.string().required(),
        value: joi.string().required(),
    })

};