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
    updateStoreDetails: async (req, res) => {
        let user_id = req.decoded.user_id;
        if (!user_id) {
            return helpers.showOutput(res, helpers.showResponse(false, ResponseMessages?.middleware?.invalid_access_token), 401);
        }
        let result = await Store.updateStoreDetails(req.body, user_id);
        return helpers.showOutput(res, result, result.statusCode);
    },

    addProductToShopify: async (req, res) => {
        let userId = req.decoded._id;
        if (!userId) {
            return helpers.showOutput(res, helpers.showResponse(false, ResponseMessages?.middleware?.invalid_access_token), 401);
        }

        let result = await Store.addProductToShopify(req.body, userId);
        return helpers.showOutput(res, result, result.statusCode);
    },


}

module.exports = {
    ...shopController
}