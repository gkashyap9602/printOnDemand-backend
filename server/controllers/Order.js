var Order = require("../utils/Order")
var helpers = require('../services/helper')
const ResponseMessages = require('../constants/ResponseMessages');


const orderController = {

    addToCart: async (req, res) => {
        let user_id = req.decoded.user_id;
        if (!user_id) {
            return helpers.showOutput(res, helpers.showResponse(false, ResponseMessages?.middleware?.invalid_access_token), 401);
        }
        let result = await Order.addToCart(req.body, user_id);
        return helpers.showOutput(res, result, result.statusCode);
    },
    placeOrder: async (req, res) => {
        let user_id = req.decoded.user_id;
        if (!user_id) {
            return helpers.showOutput(res, helpers.showResponse(false, ResponseMessages?.middleware?.invalid_access_token), 401);
        }
        let result = await Order.placeOrder(req.body, user_id);
        return helpers.showOutput(res, result, result.statusCode);
    },
    getAllOrders: async (req, res) => {
        let user_id = req.decoded.user_id;
        if (!user_id) {
            return helpers.showOutput(res, helpers.showResponse(false, ResponseMessages?.middleware?.invalid_access_token), 401);
        }
        let result = await Order.getAllOrders(req.query, user_id);
        return helpers.showOutput(res, result, result.statusCode);
    },
    removeItemsFromCart: async (req, res) => {
        let result = await Order.removeItemsFromCart(req.body);
        return helpers.showOutput(res, result, result.statusCode);
    },
    updateCartItem: async (req, res) => {
        let result = await Order.updateCartItem(req.body);
        return helpers.showOutput(res, result, result.statusCode);
    },
    getCartItems: async (req, res) => {
        let user_id = req.decoded.user_id;
        if (!user_id) {
            return helpers.showOutput(res, helpers.showResponse(false, ResponseMessages?.middleware?.invalid_access_token), 401);
        }
        let result = await Order.getCartItems(req.query, user_id);
        return helpers.showOutput(res, result, result.statusCode);
    },
    deleteCart: async (req, res) => {
        let result = await Order.deleteCart(req.body);
        return helpers.showOutput(res, result, result.statusCode);
    },

}

module.exports = {
    ...orderController
}