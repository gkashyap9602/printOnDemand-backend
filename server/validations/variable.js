
const joi = require("joi");


module.exports.addVariableType = {
    body: joi.object({
        typeName: joi.string().required(),
    })

};
module.exports.addVariableOption = {
    body: joi.object({
        variableTypeId: joi.string().required(),
        value: joi.string().required(),
    })

};