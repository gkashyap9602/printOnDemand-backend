
const joi = require("joi");

module.exports.createProductLibrary = {
    body: joi.object({
        subCategoryIds: joi.array().required(),
        variableTypesIds: joi.array().required(),
        materialIds: joi.array().required(),
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
module.exports.updateProductLibrary = {
    body: joi.object({
        productLibraryId: joi.string().required(),
        description: joi.array(),
        title: joi.string(),
    })

};
module.exports.updateLibraryVarient = {
    body: joi.object({
        productLibraryVariantId: joi.string().required(),
        price: joi.number().required(),
        profit: joi.number().required(),
    })

};
module.exports.deleteProductLibrary= {
    body: joi.object({
        productLibraryId: joi.string().required(),
        productLibraryVariantId: joi.string(),
    })

};
module.exports.ProductLibraryDetails = {
    body: joi.object({
        productLibraryId: joi.string().required(),
    })

};

