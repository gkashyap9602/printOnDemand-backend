
const joi = require("joi");

module.exports.saveShopInfo = {
    body: joi.object({
        apiKey: joi.string().required(),
        shop: joi.string().required(),
        secret: joi.string().required(),
        storeVersion: joi.string().allow(''),
    })

};
module.exports.addProductToStore = {
    body: joi.object({
        productLibraryItems: joi.array().required(),
        storeId: joi.string().required(),
    })

};
module.exports.getAllStores = {
    body: joi.object({
        userId: joi.string().required(),
        storeType: joi.number().allow(''),
        status: joi.number(),
    })

};
module.exports.getPushProduct = {
    body: joi.object({
        pageIndex: joi.number().required(),
        pageSize: joi.number().required(),
        sortDirection: joi.string(),
        sortColumn: joi.string(),
        storeIds: joi.array(),
        searchKey: joi.string().allow(''),
        status: joi.number().allow(''),
        createdFrom: joi.string().allow(''),
        createdTill: joi.string().allow(''),
        isFromShop: joi.boolean().allow('')
    })

};
module.exports.updateStoreStatus = {
    body: joi.object({
        storeId: joi.string().required(),
        status: joi.number().required(),

    })

};
module.exports.removeStore = {
    body: joi.object({
        storeId: joi.string().required(),
    })

};
module.exports.retryProductPush = {
    body: joi.object({
        pushProductQueueIds: joi.array().required(),
    })

};


