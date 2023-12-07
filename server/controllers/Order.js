var Order = require("../utils/Order")
var helpers = require('../services/helper')
const ResponseMessages = require('../constants/ResponseMessages');


const orderController = {

    addToCart: async (req, res) => {
        let result = await Order.addToCart(req.body);
        return helpers.showOutput(res, result, result.statusCode);
    },
    updateCartItem: async (req, res) => {
        let result = await Order.updateCartItem(req.body);
        return helpers.showOutput(res, result, result.statusCode);
    },
    getCartItems: async (req, res) => {
        let result = await Order.getCartItems(req.query);
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