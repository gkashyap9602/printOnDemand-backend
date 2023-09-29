
const joi = require("joi");

module.exports.addProductSchema = {
    body: joi.object({
        subCategoryId: joi.string().required(),
        variableTypesId: joi.string().allow(''),
        materialId:"",
        careInstructions:"",
        title:"",
        longDescription:"",
        productionDuration:"",
        shortDescription:"",
        sizeChart:"",
        construction:"",
        constructionCallout:"",
        features:"",
        process:"",
    })

};
module.exports.addSubCategorySchema = {
    body: joi.object({
        name: joi.string().required(),
        description: joi.string().allow(''),
        categoryId:joi.string().required()
    })

};