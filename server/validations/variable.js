
const joi = require("joi");


module.exports.addVariableType = {
    body: joi.object({
        typeName: joi.string().required(),
    })

};
module.exports.addVariableOption = {
    body: joi.object({
        variableTypeId: joi.string().length(24).message("Invalid Id please check").required(),
        value: joi.string().required(),
    })

};

module.exports.deleteVariable = {
    body: joi.object({
        variableTypeId: joi.string().length(24).message("Invalid Id please check"),
        variableOptionId: joi.string().length(24).message("Invalid Id please check"),

    })

};
module.exports.updateVariable = {
    body: joi.object({
        variableTypeId: joi.string().length(24).message("Invalid Id please check"),
        variableOptionId: joi.string().length(24).message("Invalid Id please check"),
        typeName: joi.string(),
        value: joi.string()
    })

};
