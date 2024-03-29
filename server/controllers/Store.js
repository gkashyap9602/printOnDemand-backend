var Store = require('../utils/Store');
const helpers = require('../services/helper');
const ResponseMessages = require('../constants/ResponseMessages');

const shopController = {

    saveShopInfo: async (req, res) => {
        let user_id = req.decoded.user_id;
        if (!user_id) {
            return helpers.showOutput(res, helpers.showResponse(false, ResponseMessages?.middleware?.invalid_access_token), 401);
        }
        let result = await Store.saveShopInfo(req.body, user_id);
        return helpers.showOutput(res, result, result.statusCode);
    },
    getAllStores: async (req, res) => {
        // let user_id = req.decoded.user_id;
        // if (!user_id) {
        //     return helpers.showOutput(res, helpers.showResponse(false, ResponseMessages?.middleware?.invalid_access_token), 401);
        // }
        let result = await Store.getAllStores(req.body);
        return helpers.showOutput(res, result, result.statusCode);
    },
    updateStoreStatus: async (req, res) => {
        let user_id = req.decoded.user_id;
        if (!user_id) {
            return helpers.showOutput(res, helpers.showResponse(false, ResponseMessages?.middleware?.invalid_access_token), 401);
        }
        let result = await Store.   updateStoreStatus(req.body, user_id);
        return helpers.showOutput(res, result, result.statusCode);
    },
    removeStore: async (req, res) => {
        let user_id = req.decoded.user_id;
        if (!user_id) {
            return helpers.showOutput(res, helpers.showResponse(false, ResponseMessages?.middleware?.invalid_access_token), 401);
        }
        let result = await Store.removeStore(req.body, user_id);
        return helpers.showOutput(res, result, result.statusCode);
    },
    getPushProductsToStore: async (req, res) => {
        let user_id = req.decoded._id;
        if (!user_id) {
            return helpers.showOutput(res, helpers.showResponse(false, ResponseMessages?.middleware?.invalid_access_token), 401);
        }
        let result = await Store.getPushProductsToStore(req.body, user_id);
        return helpers.showOutput(res, result, result.statusCode);
    },

    addProductToStore: async (req, res) => {
        let userId = req.decoded._id;
        if (!userId) {
            return helpers.showOutput(res, helpers.showResponse(false, ResponseMessages?.middleware?.invalid_access_token), 401);
        }
        let result = await Store.addProductToStore(req.body, userId);
        return helpers.showOutput(res, result, result.statusCode);
    },
    retryPushProductToStore: async (req, res) => {
        let userId = req.decoded._id;
        if (!userId) {
            return helpers.showOutput(res, helpers.showResponse(false, ResponseMessages?.middleware?.invalid_access_token), 401);
        }
        let result = await Store.retryPushProductToStore(req.body, userId);
        return helpers.showOutput(res, result, result.statusCode);
    },


}

module.exports = {
    ...shopController
}