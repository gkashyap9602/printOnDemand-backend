
const joi = require("joi");

module.exports.addProductSchema = {
    body: joi.object({
        subCategoryIds: joi.array().required(),
        variableTypesIds: joi.array().required(),
        materialId: joi.string().required(),
        title: joi.string().required(),
        longDescription: joi.string().required(),
        careInstructions: joi.string(),
        productionDuration: joi.string(),
        shortDescription: joi.string(),
        construction: joi.string(),
        features: joi.string(),
        process: joi.string(),
    })

};
module.exports.updateProductSchema = {
    body: joi.object({
        subCategoryIds: joi.array().required(),
        materialId: joi.string().required(),
        title: joi.string().required(),
        longDescription: joi.string().required(),
        careInstructions: joi.string(),
        productionDuration: joi.string(),
        shortDescription: joi.string(),
        construction: joi.string(),
        features: joi.string(),
        process: joi.string(),
        productId: joi.string().required()
    })

};
module.exports.addProductVarientSchema = {
    body: joi.object({
        productCode: joi.string().required(),
        price: joi.string().required(),
        productId: joi.string().required(),
        productVarientTemplates: joi.any().allow(''),
        varientOptions: joi.any().required(),
        dpi: joi.string(),
        msrp: joi.string(),
    })

};
module.exports.updateProductVarientSchema = {
    body: joi.object({
        productCode: joi.string().required(),
        price: joi.string().required(),
        productVarientId: joi.string().required(),
        //  :joi.any().allow(''),
        // dpi:joi.string(),
        // msrp:joi.string(),
    })

};
module.exports.addProductImageSchema = {
    body: joi.object({
        displayOrder: joi.number().required(),
        imageType: joi.number().required().valid(1, 2, 3),//1 for productimage 2 for varientImage 3 for Size chart
        productId: joi.string().required(),
    })

};

module.exports.updateVarientTemplateSchema = {
    body: joi.object({
        templateType: joi.number().required().valid(1, 2, 3), //1 for pdf 2 for psd 3 for ai file type
        productVarientId: joi.string().required(),
        productVarientTemplates: joi.string()
    })
};
module.exports.deleteVarientTemplateSchema = {
    body: joi.object({
        templateId: joi.string().required(),
        productVarientId: joi.string().required()
    })
};