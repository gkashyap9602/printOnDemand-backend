
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
        productLibraryId: joi.string().length(24).message("Invalid Id please check").required(),
        description: joi.string(),
        title: joi.string(),
    })

};
module.exports.addToStore = {
    body: joi.object({
        productLibraryItems: joi.array().required(),
        storeId: joi.number().required(),
    })

};
module.exports.updateLibraryVarient = {
    body: joi.object({
        productLibraryVariantId: joi.string().length(24).message("Invalid Id please check").required(),
        price: joi.number().max(999999).required(),
        profit: joi.number().max(999999).required(),
    })

};
module.exports.deleteProductLibrary = {
    body: joi.object({
        productLibraryId: joi.string().required(),
        productLibraryVariantId: joi.string(),
    })

};
module.exports.ProductLibraryDetails = {
    query: joi.object({
        productLibraryId: joi.string().required(),
    })

};

