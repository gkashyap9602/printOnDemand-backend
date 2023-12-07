
const joi = require("joi");

module.exports.addToCart = {
    body: joi.object({
        cartItems: joi.array().required(),
    })

};

module.exports.updateCart = {
    body: joi.object({
        cartId: joi.string().length(24).message("Invalid Id please check").required(),
        quantity:joi.number().max(9999).required()
    })

};
module.exports.deleteCart = {
    body: joi.object({
        cartId: joi.string().length(24).message("Invalid Id please check").required(),
    })

};


