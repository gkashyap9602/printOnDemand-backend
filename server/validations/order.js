
const joi = require("joi");

module.exports.addToCart = {
    body: joi.object({
        cartItems: joi.array().required(),
    })

};


