
const joi = require("joi");

module.exports.saveShopInfo = {
    body: joi.object({
        apiKey: joi.string().required(),
        shop: joi.string().required(),
        secret: joi.string().required(),
        storeVersion: joi.string().allow(''),
    })

};
module.exports.getAllStores = {
    body: joi.object({
        userId: joi.string().required(),
        storeType: joi.number().allow(''),
    })

};


