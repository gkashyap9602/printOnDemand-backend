
const joi = require("joi");

module.exports.addProductSchema = {
    body: joi.object({
        subCategoryIds: joi.array().required(),
        variableTypesIds: joi.array().required(),
        materialId:joi.string().required(),
        title:joi.string().required(),
        longDescription:joi.string().required(),
        careInstructions:joi.string(),
        productionDuration:joi.string(),
        shortDescription:joi.string(),
        construction:joi.string(),
        features:joi.string(),
        process:joi.string(),
    })

};
module.exports.updateProductSchema = {
    body: joi.object({
        subCategoryIds: joi.array().required(),
        materialId:joi.string().required(),
        title:joi.string().required(),
        longDescription:joi.string().required(),
        careInstructions:joi.string(),
        productionDuration:joi.string(),
        shortDescription:joi.string(),
        construction:joi.string(),
        features:joi.string(),
        process:joi.string(),
        productId:joi.string().required()
    })

};
module.exports.addProductVarientSchema = {
    body: joi.object({
        productCode: joi.string().required(),
        price: joi.string().required(),
        productId:joi.string().required(),
        productVarientTemplates:joi.array().required(),
        varientOptions:joi.array().required(),
        dpi:joi.string(),
        msrp:joi.string(),
    })

};
module.exports.updateProductVarientSchema = {
    body: joi.object({
        productCode: joi.string().required(),
        price: joi.string().required(),
        productVarientId:joi.string().required(),
        productVarientTemplates:joi.array().required(),
        dpi:joi.string(),
        msrp:joi.string(),
    })

};
module.exports.addProductImageSchema = {
    body: joi.object({
        displayOrder: joi.number().required(),
        imageType: joi.number().required().valid(1,2,3),
        productId:joi.string().required(),
    })

};