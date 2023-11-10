
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

module.exports.deleteVariable = {
    body: joi.object({
        variableTypeId: joi.string(),
        variableOptionId: joi.string()

    })

};
module.exports.updateVariable = {
    body: joi.object({
        variableTypeId: joi.string(),
        variableOptionId: joi.string(),
        typeName: joi.string(),
        value: joi.string()
    })

};
