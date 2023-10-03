
const joi = require("joi");

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
        categoryId:joi.string().required()
    })

};

module.exports.updateCategorySchema = {
    body: joi.object({
        name: joi.string().required(),
        description: joi.string().allow(''),
        id:joi.string().required()
    })

};