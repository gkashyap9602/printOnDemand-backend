var Order = require("../utils/Order")
var helpers = require('../services/helper')
const ResponseMessages = require('../constants/ResponseMessages');


const orderController = {

    addToCart: async (req, res) => {
        let result = await Order.addToCart(req.body);
        return helpers.showOutput(res, result, result.statusCode);
    },
    // deleteFromGallery: async (req, res) => {
    //     let result = await Gallery.deleteFromGallery(req.body);
    //     return helpers.showOutput(res, result, result.statusCode);
    // },
    // getGallery: async (req, res) => {
    //     let result = await Gallery.getGallery(req.query);
    //     console.log(req.session, "req sessin get galle side ");
    //     return helpers.showOutput(res, result, result.statusCode);
    // },

}

module.exports = {
    ...orderController
}